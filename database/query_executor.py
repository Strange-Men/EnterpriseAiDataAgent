"""SQL Query Executor Module.

Provides a safe, validated interface for executing SQL queries
against the DuckDB database. Designed for later AI Agent integration.
"""

import pandas as pd
from database.db_manager import DatabaseManager


class QueryError(Exception):
    """Raised when a SQL query fails."""
    pass


class QueryExecutor:
    """Executes SQL queries with validation and result formatting."""

    def __init__(self, db_manager: DatabaseManager = None):
        self.db = db_manager or DatabaseManager()

    def execute(self, sql: str) -> dict:
        """Execute a SQL query and return structured results.

        Args:
            sql: The SQL query string.

        Returns:
            {
                "sql": str,
                "columns": list[str],
                "data": list[dict],
                "row_count": int,
                "status": "success" | "error",
                "error": str | None,
            }
        """
        sql = sql.strip()
        if not sql:
            return self._error_result(sql, "Empty SQL query.")

        try:
            df = self.db.execute_query(sql)
            return {
                "sql": sql,
                "columns": list(df.columns),
                "data": df.to_dict(orient="records"),
                "row_count": len(df),
                "status": "success",
                "error": None,
            }
        except Exception as e:
            return self._error_result(sql, str(e))

    def preview_table(self, table_name: str, limit: int = 50) -> dict:
        """Fetch the first N rows of a table."""
        sql = f'SELECT * FROM "{table_name}" LIMIT {limit};'
        return self.execute(sql)

    def describe_table(self, table_name: str) -> dict:
        """Get column metadata for a table."""
        try:
            info = self.db.get_table_info(table_name)
            return {
                "table_name": table_name,
                "columns": info["columns"],
                "row_count": info["row_count"],
                "status": "success",
                "error": None,
            }
        except Exception as e:
            return {
                "table_name": table_name,
                "status": "error",
                "error": str(e),
            }

    def explain(self, sql: str) -> dict:
        """Execute EXPLAIN on a SQL query and return the plan.

        Returns:
            {
                "sql": str,
                "plan": list[dict],
                "status": "success" | "error",
                "error": str | None,
            }
        """
        sql = sql.strip()
        if not sql:
            return {"sql": sql, "plan": [], "status": "error", "error": "Empty SQL query."}

        # Strip trailing semicolons for EXPLAIN wrapping
        sql_clean = sql.rstrip(";").strip()

        try:
            explain_sql = f"EXPLAIN {sql_clean}"
            df = self.db.execute_query(explain_sql)
            plan_rows = []
            for _, row in df.iterrows():
                plan_rows.append({
                    "operator": str(row.iloc[0]) if len(row) > 0 else "",
                    "detail": str(row.iloc[1]) if len(row) > 1 else "",
                })
            return {
                "sql": sql,
                "plan": plan_rows,
                "status": "success",
                "error": None,
            }
        except Exception as e:
            return {"sql": sql, "plan": [], "status": "error", "error": str(e)}

    @staticmethod
    def _error_result(sql: str, message: str) -> dict:
        return {
            "sql": sql,
            "columns": [],
            "data": [],
            "row_count": 0,
            "status": "error",
            "error": message,
        }
