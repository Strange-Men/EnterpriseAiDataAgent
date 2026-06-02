"""Quality endpoint — GET /api/quality/{table_name}."""

import logging
from fastapi import APIRouter, HTTPException
from backend.services.data_service import get_quality_report

logger = logging.getLogger("enterprise_ai.quality")

router = APIRouter()


@router.get("/quality/{table_name}")
async def quality(table_name: str):
    try:
        return get_quality_report(table_name)
    except Exception as e:
        logger.error(f"quality report failed for '{table_name}': {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get quality report")
