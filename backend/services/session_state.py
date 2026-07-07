"""Process-local session state persisted in the existing DuckDB database."""

from __future__ import annotations

from datetime import datetime, timezone

from backend.services.data_service import APP_DEFAULT_TABLE, ensure_default_business_table, table_exists
from backend.services.data_service import get_db


SESSION_TABLE = "__eai_session_state"
CURRENT_TABLE_KEY = "current_table"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_session_table() -> None:
    conn = get_db().connect()
    conn.execute(
        f"""
        CREATE TABLE IF NOT EXISTS "{SESSION_TABLE}" (
            key VARCHAR PRIMARY KEY,
            value VARCHAR,
            updated_at VARCHAR
        );
        """
    )


def get_app_default_table() -> str:
    ensure_default_business_table()
    return APP_DEFAULT_TABLE


def get_current_table() -> str:
    _ensure_session_table()
    default_table = get_app_default_table()
    conn = get_db().connect()
    row = conn.execute(
        f'SELECT value FROM "{SESSION_TABLE}" WHERE key = ?;',
        [CURRENT_TABLE_KEY],
    ).fetchone()
    if row and row[0] and table_exists(str(row[0])):
        return str(row[0])
    return default_table


def set_current_table(table_name: str) -> str:
    _ensure_session_table()
    conn = get_db().connect()
    conn.execute(
        f"""
        INSERT OR REPLACE INTO "{SESSION_TABLE}" (key, value, updated_at)
        VALUES (?, ?, ?);
        """,
        [CURRENT_TABLE_KEY, table_name, _now_iso()],
    )
    return table_name


def clear_current_table() -> str:
    _ensure_session_table()
    conn = get_db().connect()
    conn.execute(f'DELETE FROM "{SESSION_TABLE}" WHERE key = ?;', [CURRENT_TABLE_KEY])
    return get_app_default_table()


def session_payload() -> dict:
    current_table = get_current_table()
    return {
        "app_default_table": APP_DEFAULT_TABLE,
        "current_table": current_table,
        "user_active_table": current_table,
    }
