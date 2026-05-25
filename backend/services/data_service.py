"""Data service wrapping existing database modules for the API layer."""

import io
import time
import math
import numpy as np
import pandas as pd

from database.db_manager import DatabaseManager
from database.file_loader import load_file, FileLoadError
from database.schema_detector import detect_schema
from database.data_quality import analyze_dataframe
from database.query_executor import QueryExecutor


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


_db = DatabaseManager()
_executor = QueryExecutor(_db)
_start_time = time.time()
_UPLOAD_TIMESTAMPS: dict[str, str] = {}  # table_name → ISO 8601 upload timestamp


def get_uptime() -> str:
    elapsed = int(time.time() - _start_time)
    h, rem = divmod(elapsed, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}"


def check_db_connection() -> bool:
    try:
        _db.connect()
        return True
    except Exception:
        return False


def list_tables() -> list[dict]:
    tables = _db.list_tables()
    for tbl in tables:
        tbl["uploadTime"] = _UPLOAD_TIMESTAMPS.get(tbl["name"])
    return tables


def upload_file(filename: str, content: bytes) -> dict:
    adapter = UploadFileAdapter(filename, content)
    df = load_file(adapter)
    table_name = _db.import_dataframe(df, filename=filename)
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
    """Replace NaN/Inf/NaT with None for JSON compliance."""
    cleaned = []
    for row in data:
        clean_row = {}
        for k, v in row.items():
            if isinstance(v, (float, np.floating)):
                if math.isnan(float(v)) or math.isinf(float(v)):
                    clean_row[k] = None
                    continue
            if isinstance(v, (np.integer,)):
                clean_row[k] = int(v)
                continue
            if isinstance(v, (np.bool_,)):
                clean_row[k] = bool(v)
                continue
            try:
                if pd.isna(v):
                    clean_row[k] = None
                    continue
            except (TypeError, ValueError):
                pass
            clean_row[k] = v
        cleaned.append(clean_row)
    return cleaned


def get_table_preview(table_name: str, limit: int = 100) -> dict:
    result = _executor.preview_table(table_name, limit)
    return {
        "columns": result["columns"],
        "data": _sanitize_for_json(result["data"]),
        "rowCount": result["row_count"],
    }


def get_table_schema(table_name: str) -> list[dict]:
    info = _db.get_table_info(table_name)
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
        df = _db.get_sample_data(table_name, limit=100000)
        for col_info in columns:
            if col_info["name"] in df.columns:
                col_info["uniqueCount"] = int(df[col_info["name"]].nunique())
    except Exception:
        pass
    return columns


def get_quality_report(table_name: str) -> dict:
    df = _db.get_sample_data(table_name, limit=100000)
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
    return _db.drop_table(table_name)
