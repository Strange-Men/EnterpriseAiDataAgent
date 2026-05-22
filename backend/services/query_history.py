"""In-memory query history store.

Stores recent SQL query executions with metadata for the UI.
Persists across page refreshes within the server lifetime.
"""

import time
from collections import deque


class QueryHistory:
    """Thread-safe ring buffer of recent query executions."""

    def __init__(self, max_size: int = 200):
        self._history: deque[dict] = deque(maxlen=max_size)

    def add(self, sql: str, status: str, runtime_ms: int, row_count: int = 0, error: str = None):
        entry = {
            "id": int(time.time() * 1000),
            "sql": sql.strip(),
            "status": status,
            "runtimeMs": runtime_ms,
            "rowCount": row_count,
            "error": error,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        self._history.appendleft(entry)
        return entry

    def get_all(self, limit: int = 50) -> list[dict]:
        return list(self._history)[:limit]


# Singleton instance
query_history = QueryHistory()
