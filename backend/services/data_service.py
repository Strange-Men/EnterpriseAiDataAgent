"""Data service wrapping existing database modules for the API layer."""

import io
import time

from database.db_manager import DatabaseManager
from database.file_loader import load_file, FileLoadError
from database.schema_detector import detect_schema
from database.data_quality import analyze_dataframe
from database.query_executor import QueryExecutor
from backend.utils.json_safe import normalize_for_response


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
_start_time = time.time()
_UPLOAD_TIMESTAMPS: dict[str, str] = {}  # table_name → ISO 8601 upload timestamp


def get_db() -> DatabaseManager:
    """Lazy-init DatabaseManager singleton."""
    global _db
    if _db is None:
        _db = DatabaseManager()
    return _db


def get_executor() -> QueryExecutor:
    """Lazy-init QueryExecutor singleton."""
    global _executor
    if _executor is None:
        _executor = QueryExecutor(get_db())
    return _executor


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
        from backend.config import ANTHROPIC_API_KEY, DEFAULT_LLM_MODEL
        ai_configured = bool(ANTHROPIC_API_KEY)
        ai_model = DEFAULT_LLM_MODEL
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
    tables = get_db().list_tables()
    for tbl in tables:
        tbl["uploadTime"] = _UPLOAD_TIMESTAMPS.get(tbl["name"])
    return tables


def upload_file(filename: str, content: bytes) -> dict:
    adapter = UploadFileAdapter(filename, content)
    df = load_file(adapter)
    table_name = get_db().import_dataframe(df, filename=filename)
    schema = detect_schema(df)
    name = table_name["table_name"]
    from datetime import datetime, timezone
    _UPLOAD_TIMESTAMPS[name] = datetime.now(timezone.utc).isoformat()
    return {
        "tableName": name,
        "rowCount": schema["row_count"],
        "columnCount": schema["col_count"],
        "status": "success",
    }


def _sanitize_for_json(data: list[dict]) -> list[dict]:
    """Normalize a list of row dicts to JSON-safe native Python types.

    Delegates to normalize_for_response for comprehensive type handling.
    Kept for backward compatibility with existing imports.
    """
    return normalize_for_response(data)


def get_table_preview(table_name: str, limit: int = 100) -> dict:
    result = get_executor().preview_table(table_name, limit)
    return {
        "columns": result["columns"],
        "data": _sanitize_for_json(result["data"]),
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
    # Enrich with unique counts from pandas
    try:
        df = get_db().get_sample_data(table_name, limit=100000)
        for col_info in columns:
            if col_info["name"] in df.columns:
                col_info["uniqueCount"] = int(df[col_info["name"]].nunique())
    except Exception:
        pass
    return columns


def get_quality_report(table_name: str) -> dict:
    df = get_db().get_sample_data(table_name, limit=100000)
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
