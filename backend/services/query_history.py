"""In-memory query history store with DuckDB persistence.

Stores recent SQL query executions with metadata for the UI.
Persists across server restarts via DuckDB backend.

Lazy-initialised: DuckDB table is only created on first use,
not at import time — safe under uvicorn --reload.
"""

import uuid
from collections import deque
from datetime import datetime, timezone


class QueryHistory:
    """Thread-safe ring buffer of recent query executions with DuckDB persistence.

    Lazy initialisation: the DuckDB connection and table are created
    on the first call to add() or get_all(), not in __init__.

    Args:
        max_size: Maximum number of entries in the ring buffer.
        use_memory: If True, skip DuckDB persistence entirely (for testing).
    """

    def __init__(self, max_size: int = 200, use_memory: bool = False):
        self._history: deque[dict] = deque(maxlen=max_size)
        self._db = None
        self._table_name = "query_history"
        self._initialised = False
        self._use_memory = use_memory

    def _ensure_init(self):
        """Lazily create the DuckDB table and load existing history."""
        if self._initialised:
            return
        self._initialised = True
        if self._use_memory:
            return
        try:
            from database.db_manager import DatabaseManager
            self._db = DatabaseManager()
            self._init_table()
            self._load_from_db()
        except Exception:
            # DB not available yet — in-memory-only mode
            pass

    def _init_table(self):
        """Create query_history table if not exists."""
        if not self._db:
            return
        conn = self._db.connect()
        conn.execute(f"""
            CREATE TABLE IF NOT EXISTS "{self._table_name}" (
                id VARCHAR PRIMARY KEY,
                sql TEXT NOT NULL,
                status VARCHAR(10) NOT NULL,
                runtime_ms INTEGER NOT NULL,
                row_count INTEGER DEFAULT 0,
                error TEXT,
                timestamp VARCHAR(25) NOT NULL
            );
        """)
        self._migrate_id_to_varchar(conn)

    def _migrate_id_to_varchar(self, conn):
        """Migrate legacy BIGINT history IDs to UUID-compatible VARCHAR IDs."""
        try:
            info = conn.execute(f'PRAGMA table_info("{self._table_name}")').fetchall()
            id_type = next((str(row[2]).upper() for row in info if row[1] == "id"), "")
            if "VARCHAR" in id_type or "TEXT" in id_type:
                return

            tmp_table = f"{self._table_name}_{uuid.uuid4().hex[:8]}_new"
            conn.execute(f"""
                CREATE TABLE "{tmp_table}" (
                    id VARCHAR PRIMARY KEY,
                    sql TEXT NOT NULL,
                    status VARCHAR(10) NOT NULL,
                    runtime_ms INTEGER NOT NULL,
                    row_count INTEGER DEFAULT 0,
                    error TEXT,
                    timestamp VARCHAR(25) NOT NULL
                );
            """)
            conn.execute(f"""
                INSERT INTO "{tmp_table}" (id, sql, status, runtime_ms, row_count, error, timestamp)
                SELECT CAST(id AS VARCHAR), sql, status, runtime_ms, row_count, error, timestamp
                FROM "{self._table_name}";
            """)
            conn.execute(f'DROP TABLE "{self._table_name}";')
            conn.execute(f'ALTER TABLE "{tmp_table}" RENAME TO "{self._table_name}";')
        except Exception:
            pass

    def _load_from_db(self):
        """Load existing history from DuckDB into memory."""
        if not self._db:
            return
        try:
            conn = self._db.connect()
            rows = conn.execute(
                f'SELECT id, sql, status, runtime_ms, row_count, error, timestamp '
                f'FROM "{self._table_name}" ORDER BY id DESC LIMIT 200;'
            ).fetchall()
            for row in rows:
                entry = {
                    "id": row[0],
                    "sql": row[1],
                    "status": row[2],
                    "runtimeMs": row[3],
                    "rowCount": row[4],
                    "error": row[5],
                    "timestamp": row[6],
                }
                self._history.append(entry)
        except Exception:
            # Table might be empty or not exist yet
            pass

    def add(self, sql: str, status: str, runtime_ms: int, row_count: int = 0, error: str = None):
        """Add a query execution entry to history."""
        self._ensure_init()

        entry = {
            "id": str(uuid.uuid4()),
            "sql": sql.strip(),
            "status": status,
            "runtimeMs": runtime_ms,
            "rowCount": row_count,
            "error": error,
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }

        # Add to memory
        self._history.appendleft(entry)

        # Persist to DuckDB
        if self._db:
            try:
                conn = self._db.connect()
                conn.execute(
                    f'INSERT INTO "{self._table_name}" (id, sql, status, runtime_ms, row_count, error, timestamp) '
                    f'VALUES (?, ?, ?, ?, ?, ?, ?);',
                    [entry["id"], entry["sql"], entry["status"], entry["runtimeMs"],
                     entry["rowCount"], entry["error"], entry["timestamp"]]
                )
            except Exception:
                # Silently fail persistence - in-memory still works
                pass

            # Cleanup old entries from DB (keep 200)
            try:
                conn = self._db.connect()
                conn.execute(f"""
                    DELETE FROM "{self._table_name}"
                    WHERE id NOT IN (
                        SELECT id FROM "{self._table_name}" ORDER BY id DESC LIMIT 200
                    );
                """)
            except Exception:
                pass

        return entry

    def get_all(self, limit: int = 50) -> list[dict]:
        """Return up to limit entries from history."""
        self._ensure_init()
        return list(self._history)[:limit]


# Lazy singleton — created at import time but does NOT touch DuckDB.
query_history = QueryHistory()
