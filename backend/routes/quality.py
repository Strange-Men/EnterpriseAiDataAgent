"""Quality endpoint — GET /api/quality/{table_name}."""

from fastapi import APIRouter, HTTPException
from backend.services.data_service import get_quality_report

router = APIRouter()


@router.get("/quality/{table_name}")
async def quality(table_name: str):
    try:
        return get_quality_report(table_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
