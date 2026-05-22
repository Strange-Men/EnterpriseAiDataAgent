"""DuckDB Database Manager.

Manages DuckDB connection lifecycle, table operations,
and data import from pandas DataFrames.
"""

import os
import duckdb
import pandas as pd

from database.schema_detector import (
    detect_schema,
    generate_create_table_ddl,
    sanitize_table_name,
)


class DatabaseManager:
    """Singleton-style DuckDB connection manager."""

    _instance = None

    def __new__(cls, db_path: str = None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._conn = None
            cls._instance._db_path = db_path or os.getenv("DUCKDB_PATH", "data/enterprise.duckdb")
        return cls._instance

    @classmethod
    def reset_instance(cls):
        """Close existing connection and allow re-initialisation."""
        if cls._instance and cls._instance._conn:
            cls._instance._conn.close()
        cls._instance = None

    def connect(self):
        """Open (or return existing) DuckDB connection."""
        if self._conn is None:
            try:
                os.makedirs(os.path.dirname(self._db_path) or ".", exist_ok=True)
                self._conn = duckdb.connect(self._db_path)
            except Exception as e:
                raise ConnectionError(f"Failed to connect to DuckDB at '{self._db_path}': {e}")
        return self._conn

    def close(self):
        """Close the DuckDB connection."""
        if self._conn:
            self._conn.close()
            self._conn = None

    @property
    def is_connected(self) -> bool:
        return self._conn is not None

    @property
    def db_path(self) -> str:
        return self._db_path

    # ── Table operations ─────────────────────────────────────────

    def list_tables(self) -> list[dict]:
        """List all tables in the database with row/column counts."""
        conn = self.connect()
        tables = conn.execute(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'main' ORDER BY table_name;"
        ).fetchall()

        result = []
        for (table_name,) in tables:
            info = self.get_table_info(table_name)
            result.append(info)
        return result

    def get_table_info(self, table_name: str) -> dict:
        """Get detailed info about a specific table."""
        conn = self.connect()
        # row count
        row_count = conn.execute(
            f'SELECT COUNT(*) FROM "{table_name}";'
        ).fetchone()[0]

        # column info
        columns = conn.execute(f'DESCRIBE "{table_name}";').fetchall()
        col_list = []
        for col in columns:
            col_list.append({
                "name": col[0],
                "type": col[1],
                "nullable": col[2],
                "default": col[3],
            })

        return {
            "name": table_name,
            "row_count": row_count,
            "column_count": len(col_list),
            "columns": col_list,
        }

    def import_dataframe(self, df: pd.DataFrame, table_name: str = None,
                         filename: str = None) -> dict:
        """Import a pandas DataFrame into a DuckDB table.

        Args:
            df: The DataFrame to import.
            table_name: Optional explicit table name. Auto-detected from filename if not given.
            filename: Original filename (used for auto table naming).

        Returns:
            dict with {table_name, row_count, column_count, status}
        """
        if table_name is None and filename:
            table_name = sanitize_table_name(filename)
        elif table_name is None:
            table_name = "imported_data"

        conn = self.connect()

        # Drop existing table to allow re-upload
        conn.execute(f'DROP TABLE IF EXISTS "{table_name}";')

        # Create table from DataFrame schema
        ddl = generate_create_table_ddl(table_name, df)
        conn.execute(ddl)

        # Insert data
        conn.register("_tmp_df", df)
        col_names = ", ".join(f'"{c}"' for c in df.columns)
        conn.execute(
            f'INSERT INTO "{table_name}" ({col_names}) '
            f'SELECT {col_names} FROM _tmp_df;'
        )
        conn.unregister("_tmp_df")

        schema = detect_schema(df)
        return {
            "table_name": table_name,
            "row_count": schema["row_count"],
            "column_count": schema["col_count"],
            "status": "success",
        }

    def rename_table(self, old_name: str, new_name: str) -> bool:
        """Rename a table. Returns True on success."""
        conn = self.connect()
        conn.execute(f'ALTER TABLE "{old_name}" RENAME TO "{new_name}";')
        return True

    def drop_table(self, table_name: str) -> bool:
        """Drop a table. Returns True if it existed."""
        conn = self.connect()
        conn.execute(f'DROP TABLE IF EXISTS "{table_name}";')
        return True

    def get_sample_data(self, table_name: str, limit: int = 100) -> pd.DataFrame:
        """Fetch sample rows from a table."""
        conn = self.connect()
        return conn.execute(
            f'SELECT * FROM "{table_name}" LIMIT {limit};'
        ).fetchdf()

    def execute_query(self, sql: str) -> pd.DataFrame:
        """Execute a raw SQL query and return results as DataFrame."""
        conn = self.connect()
        return conn.execute(sql).fetchdf()
