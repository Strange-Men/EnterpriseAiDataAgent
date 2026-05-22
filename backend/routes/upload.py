"""Upload endpoint — POST /api/upload."""

from fastapi import APIRouter, UploadFile, HTTPException
from backend.services.data_service import upload_file
from database.file_loader import FileLoadError

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
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
