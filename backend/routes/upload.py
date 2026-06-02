"""Upload endpoint — POST /api/upload."""

import logging
from fastapi import APIRouter, UploadFile, HTTPException
from backend.services.data_service import upload_file
from database.file_loader import FileLoadError

logger = logging.getLogger("enterprise_ai.upload")

router = APIRouter()


@router.post("/upload")
async def upload(file: UploadFile):
    content = await file.read()
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
