"""Upload endpoint — POST /api/upload."""

import logging
from fastapi import APIRouter, BackgroundTasks, UploadFile, HTTPException
from backend.config import MAX_UPLOAD_BYTES
from backend.services.upload_tasks import create_upload_task, get_upload_task_status, run_upload_task

logger = logging.getLogger("enterprise_ai.upload")

router = APIRouter()
UPLOAD_CHUNK_BYTES = 1024 * 1024


async def _read_upload_with_limit(file: UploadFile) -> bytes:
    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large. Maximum upload size is {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
        )

    content = bytearray()
    while True:
        chunk = await file.read(UPLOAD_CHUNK_BYTES)
        if not chunk:
            break
        content.extend(chunk)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File is too large. Maximum upload size is {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
            )
    return bytes(content)


@router.post("/upload")
async def upload(file: UploadFile, background_tasks: BackgroundTasks):
    content = await _read_upload_with_limit(file)
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    filename = file.filename or "uploaded_data.csv"
    try:
        task = create_upload_task(filename)
        background_tasks.add_task(run_upload_task, task["task_id"], filename, content)
        return {
            "task_id": task["task_id"],
            "status": task["status"],
            "progress": task["progress"],
            "stage": task["stage"],
        }
    except Exception as e:
        logger.error(f"Upload task creation failed for '{filename}': {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Upload failed")


@router.get("/tasks/{task_id}/status")
async def upload_task_status(task_id: str):
    task = get_upload_task_status(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Upload task not found")
    return task
