"""Data service wrapping existing database modules for the API layer."""

import io
import time
import threading
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from database.db_manager import DatabaseManager
from database.file_loader import load_file
from database.schema_detector import detect_schema
from database.data_quality import analyze_dataframe
from database.query_executor import QueryExecutor
from backend.utils.json_safe import normalize_for_response


def _sanitize_for_json(obj):
    """Backward-compatible alias for older tests and callers."""
    return normalize_for_response(obj)


class UploadFileAdapter:
    """Adapts a (filename, bytes) pair to the interface file_loader expects."""

    def __init__(self, filename: str, content: bytes):
        self.name = filename
        self._stream = io.BytesIO(content)

    def read(self, size=-1):
        return self._stream.read(size)

    def seek(self, pos):
        self._stream.seek(pos)

    @property
    def size(self):
        return len(self._stream.getvalue())


# Lazy singletons — no import-time DuckDB connection.
_db: DatabaseManager | None = None
_executor: QueryExecutor | None = None
_readonly_executor: QueryExecutor | None = None
_init_lock = threading.Lock()
_start_time = time.time()
_UPLOAD_TIMESTAMPS: dict[str, str] = {}  # table_name → ISO 8601 upload timestamp
APP_DEFAULT_TABLE = "demo_sales_business_50k"


def get_db() -> DatabaseManager:
    """Lazy-init DatabaseManager singleton (thread-safe)."""
    global _db
    if _db is None:
        with _init_lock:
            if _db is None:
                _db = DatabaseManager()
    return _db


def get_executor() -> QueryExecutor:
    """Lazy-init QueryExecutor singleton (thread-safe).

    Re-creates if the underlying DatabaseManager reference is stale
    (e.g. after DatabaseManager.reset_instance() in tests).
    """
    global _executor
    current_db = get_db()
    if _executor is None or _executor.db is not current_db:
        with _init_lock:
            if _executor is None or _executor.db is not current_db:
                _executor = QueryExecutor(current_db)
    return _executor


def get_readonly_executor() -> QueryExecutor:
    """Lazy-init read-only QueryExecutor singleton (thread-safe).

    Used for user-facing query endpoints to prevent data modification.
    Re-creates if the underlying DatabaseManager reference is stale
    (e.g. after DatabaseManager.reset_instance() in tests).
    """
    global _readonly_executor
    current_db = get_db()
    if _readonly_executor is None or _readonly_executor.db is not current_db:
        with _init_lock:
            if _readonly_executor is None or _readonly_executor.db is not current_db:
                _readonly_executor = QueryExecutor(current_db, readonly=True)
    return _readonly_executor


def get_uptime() -> str:
    elapsed = int(time.time() - _start_time)
    h, rem = divmod(elapsed, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}"


def check_db_connection() -> bool:
    try:
        get_db().connect()
        return True
    except Exception:
        return False


def get_system_health() -> dict:
    """Aggregate system health for diagnostics endpoint."""
    import os

    # DB
    db_ok = check_db_connection()

    # AI
    ai_configured = False
    ai_model = ""
    try:
        from backend.config import LLM_DEFAULT_PROVIDER
        from backend.services.llm_runtime import get_provider_config
        provider_config = get_provider_config(LLM_DEFAULT_PROVIDER)
        ai_configured = LLM_DEFAULT_PROVIDER == "mock" or bool(
            provider_config.api_key and provider_config.base_url and provider_config.model
        )
        ai_model = provider_config.model
    except Exception:
        pass

    # Scheduler
    sched_tasks = 0
    sched_enabled = 0
    sched_due = 0
    sched_worker_alive = False
    try:
        from backend.services.scheduler import get_manager
        from backend.runtime.scheduler_worker import _worker_thread
        mgr = get_manager()
        tasks = mgr.list_tasks()
        sched_tasks = len(tasks)
        sched_enabled = sum(1 for t in tasks if t.enabled)
        sched_due = len(mgr.check_due_tasks())
        sched_worker_alive = _worker_thread is not None and _worker_thread.is_alive()
    except Exception:
        pass

    # Query history
    qh_total = 0
    qh_errors = 0
    try:
        from backend.services.query_history import query_history
        recent = query_history.get_all(limit=100)
        qh_total = len(recent)
        qh_errors = sum(1 for e in recent if e.get("status") == "error")
    except Exception:
        pass

    # Temp files
    temp_count = 0
    temp_bytes = 0
    temp_dir = "temp"
    if os.path.isdir(temp_dir):
        for entry in os.scandir(temp_dir):
            if entry.is_file():
                temp_count += 1
                temp_bytes += entry.stat().st_size

    # Overall status
    status = "ok" if db_ok else "degraded"

    return {
        "status": status,
        "db": {"connected": db_ok},
        "ai": {"configured": ai_configured, "model": ai_model},
        "scheduler": {
            "tasks": sched_tasks,
            "enabled": sched_enabled,
            "due": sched_due,
            "worker_alive": sched_worker_alive,
        },
        "query_history": {"total": qh_total, "errors": qh_errors},
        "temp_files": {"count": temp_count, "total_bytes": temp_bytes},
        "uptime": get_uptime(),
    }


def list_tables() -> list[dict]:
    tables = [tbl for tbl in get_db().list_tables() if not str(tbl.get("name", "")).startswith("__eai_")]
    for tbl in tables:
        tbl["uploadTime"] = _UPLOAD_TIMESTAMPS.get(tbl["name"])
    return tables


def set_upload_timestamp(table_name: str) -> str:
    timestamp = datetime.now(timezone.utc).isoformat()
    _UPLOAD_TIMESTAMPS[table_name] = timestamp
    return timestamp


def upload_file(filename: str, content: bytes) -> dict:
    adapter = UploadFileAdapter(filename, content)
    df = load_file(adapter)
    table_name = get_db().import_dataframe(df, filename=filename)
    schema = detect_schema(df)
    name = table_name["table_name"]
    set_upload_timestamp(name)
    return {
        "tableName": name,
        "rowCount": schema["row_count"],
        "columnCount": schema["col_count"],
        "status": "success",
    }


def table_exists(table_name: str) -> bool:
    try:
        get_db().get_table_info(table_name)
        return True
    except Exception:
        return False


def ensure_default_business_table() -> str:
    """Ensure the M6 business demo table exists for first-run manual testing."""
    if table_exists(APP_DEFAULT_TABLE):
        return APP_DEFAULT_TABLE

    root = Path(__file__).resolve().parents[2]
    csv_path = root / "testExcel" / f"{APP_DEFAULT_TABLE}.csv"
    if not csv_path.exists():
        return APP_DEFAULT_TABLE

    df = pd.read_csv(csv_path)
    get_db().import_dataframe(df, table_name=APP_DEFAULT_TABLE)
    set_upload_timestamp(APP_DEFAULT_TABLE)
    return APP_DEFAULT_TABLE


def get_table_preview(table_name: str, limit: int = 100) -> dict:
    result = get_executor().preview_table(table_name, limit)
    return {
        "columns": result["columns"],
        "data": normalize_for_response(result["data"]),
        "rowCount": result["row_count"],
    }


def get_table_schema(table_name: str) -> list[dict]:
    info = get_db().get_table_info(table_name)
    columns = []
    for col in info["columns"]:
        columns.append({
            "name": col["name"],
            "dtype": col["type"],
            "nullable": col["nullable"] == "YES",
            "uniqueCount": 0,
        })
    # Enrich with unique counts using DuckDB COUNT(DISTINCT) — much faster than pandas
    try:
        conn = get_db().connect()
        for col_info in columns:
            try:
                result = conn.execute(
                    f'SELECT COUNT(DISTINCT "{col_info["name"]}") FROM "{table_name}"'
                ).fetchone()
                col_info["uniqueCount"] = int(result[0]) if result else 0
            except Exception:
                pass
    except Exception:
        pass
    return columns


def get_quality_report(table_name: str) -> dict:
    df = get_db().get_sample_data(table_name, limit=10000)
    report = analyze_dataframe(df)

    field_health = []
    for fh in report.field_health:
        field_health.append({
            "name": fh.name,
            "dtype": fh.dtype,
            "nullCount": fh.null_count,
            "nullPct": fh.null_pct,
            "uniqueCount": fh.unique_count,
            "outlierCount": fh.outlier_count,
            "outlierPct": fh.outlier_pct,
            "score": fh.score,
            "warnings": fh.warnings,
        })

    return {
        "overallScore": report.overall_score,
        "completenessScore": report.completeness_score,
        "consistencyScore": report.consistency_score,
        "validityScore": report.validity_score,
        "uniquenessScore": report.uniqueness_score,
        "totalRows": report.total_rows,
        "totalColumns": report.total_columns,
        "nullCells": report.null_cells,
        "nullPct": report.null_pct,
        "duplicateRows": report.duplicate_rows,
        "totalOutliers": report.total_outliers,
        "warnings": report.warnings,
        "fieldHealth": field_health,
    }


def delete_table(table_name: str) -> bool:
    return get_db().drop_table(table_name)
