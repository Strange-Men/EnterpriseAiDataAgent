"""Upload endpoint — POST /api/upload."""

import logging
from fastapi import APIRouter, UploadFile, HTTPException
from backend.config import MAX_UPLOAD_BYTES
from backend.services.data_service import upload_file
from database.file_loader import FileLoadError

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
async def upload(file: UploadFile):
    content = await _read_upload_with_limit(file)
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = upload_file(file.filename, content)
        return result
    except FileLoadError as e:
        logger.warning(f"File load error for '{file.filename}': {e}")
        raise HTTPException(status_code=422, detail="Failed to load file. Please check the format and try again.")
    except Exception as e:
        logger.error(f"Upload failed for '{file.filename}': {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Upload failed")
