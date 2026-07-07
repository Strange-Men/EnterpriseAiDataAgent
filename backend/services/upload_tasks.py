"""Upload task state and execution helpers for async upload polling."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from backend.services.data_service import UploadFileAdapter, get_db, set_upload_timestamp
from backend.services.session_state import set_current_table
from database.file_loader import FileLoadError, load_file
from database.schema_detector import detect_schema

logger = logging.getLogger("enterprise_ai.upload_tasks")

UPLOAD_TASKS_TABLE = "__eai_upload_tasks"
UPLOAD_TASK_TIMEOUT_SECONDS = 300
TIMEOUT_MESSAGE = "文件处理超时，请重试或改用 CSV 格式上传。"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _ensure_tasks_table() -> None:
    conn = get_db().connect()
    conn.execute(
        f"""
        CREATE TABLE IF NOT EXISTS "{UPLOAD_TASKS_TABLE}" (
            task_id VARCHAR PRIMARY KEY,
            filename VARCHAR,
            status VARCHAR,
            progress INTEGER,
            stage VARCHAR,
            table_name VARCHAR,
            error_message VARCHAR,
            created_at VARCHAR,
            started_at VARCHAR,
            finished_at VARCHAR,
            updated_at VARCHAR
        );
        """
    )


def create_upload_task(filename: str) -> dict[str, Any]:
    _ensure_tasks_table()
    task_id = str(uuid.uuid4())
    now = _now_iso()
    conn = get_db().connect()
    conn.execute(
        f"""
        INSERT INTO "{UPLOAD_TASKS_TABLE}"
        (task_id, filename, status, progress, stage, table_name, error_message, created_at, started_at, finished_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        [task_id, filename, "pending", 0, "uploading", None, None, now, None, None, now],
    )
    return _task_payload(task_id)


def update_upload_task(
    task_id: str,
    *,
    status: str | None = None,
    progress: int | None = None,
    stage: str | None = None,
    table_name: str | None = None,
    error_message: str | None = None,
    started_at: str | None = None,
    finished_at: str | None = None,
) -> dict[str, Any]:
    _ensure_tasks_table()
    existing = get_upload_task_status(task_id, apply_timeout=False)
    if existing is None:
        raise KeyError(task_id)

    conn = get_db().connect()
    conn.execute(
        f"""
        UPDATE "{UPLOAD_TASKS_TABLE}"
        SET status = ?,
            progress = ?,
            stage = ?,
            table_name = ?,
            error_message = ?,
            started_at = ?,
            finished_at = ?,
            updated_at = ?
        WHERE task_id = ?;
        """,
        [
            status if status is not None else existing["status"],
            progress if progress is not None else existing["progress"],
            stage if stage is not None else existing["stage"],
            table_name if table_name is not None else existing.get("table_name"),
            error_message if error_message is not None else existing.get("error_message"),
            started_at if started_at is not None else existing.get("started_at"),
            finished_at if finished_at is not None else existing.get("finished_at"),
            _now_iso(),
            task_id,
        ],
    )
    return _task_payload(task_id)


def get_upload_task_status(task_id: str, *, apply_timeout: bool = True) -> dict[str, Any] | None:
    _ensure_tasks_table()
    payload = _task_payload(task_id)
    if payload is None:
        return None
    if apply_timeout and payload["status"] == "running":
        started = _parse_iso(payload.get("started_at"))
        if started is not None:
            elapsed = (datetime.now(timezone.utc) - started).total_seconds()
            if elapsed > UPLOAD_TASK_TIMEOUT_SECONDS:
                return update_upload_task(
                    task_id,
                    status="failed",
                    progress=100,
                    stage="failed",
                    error_message=TIMEOUT_MESSAGE,
                    finished_at=_now_iso(),
                )
    return payload


def run_upload_task(task_id: str, filename: str, content: bytes) -> None:
    started_at = _now_iso()
    try:
        update_upload_task(task_id, status="running", progress=10, stage="parsing", started_at=started_at)
        adapter = UploadFileAdapter(filename, content)
        df = load_file(adapter)

        update_upload_task(task_id, status="running", progress=55, stage="loading")
        import_result = get_db().import_dataframe(df, filename=filename)
        table_name = import_result["table_name"]
        set_upload_timestamp(table_name)

        update_upload_task(task_id, status="running", progress=85, stage="profiling", table_name=table_name)
        schema = detect_schema(df)
        set_current_table(table_name)

        update_upload_task(
            task_id,
            status="success",
            progress=100,
            stage="done",
            table_name=table_name,
            finished_at=_now_iso(),
        )
        logger.info(
            "Upload task %s completed for table %s (%s rows, %s columns)",
            task_id,
            table_name,
            schema["row_count"],
            schema["col_count"],
        )
    except FileLoadError as exc:
        logger.warning("Upload task %s failed to load file %s: %s", task_id, filename, exc)
        update_upload_task(
            task_id,
            status="failed",
            progress=100,
            stage="failed",
            error_message="Failed to load file. Please check the format and try again.",
            finished_at=_now_iso(),
        )
    except Exception as exc:
        logger.error("Upload task %s failed for %s: %s", task_id, filename, type(exc).__name__, exc_info=True)
        update_upload_task(
            task_id,
            status="failed",
            progress=100,
            stage="failed",
            error_message="Upload failed",
            finished_at=_now_iso(),
        )


def _task_payload(task_id: str) -> dict[str, Any] | None:
    conn = get_db().connect()
    row = conn.execute(
        f"""
        SELECT task_id, filename, status, progress, stage, table_name, error_message,
               created_at, started_at, finished_at, updated_at
        FROM "{UPLOAD_TASKS_TABLE}"
        WHERE task_id = ?;
        """,
        [task_id],
    ).fetchone()
    if row is None:
        return None
    keys = [
        "task_id",
        "filename",
        "status",
        "progress",
        "stage",
        "table_name",
        "error_message",
        "created_at",
        "started_at",
        "finished_at",
        "updated_at",
    ]
    return dict(zip(keys, row))
