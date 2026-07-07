"""Session state endpoints for current table and Agent memory reset."""

from fastapi import APIRouter, HTTPException

from backend.routes.agent import get_agent_run_store
from backend.services.data_service import DefaultTableUnavailableError
from backend.services.session_state import clear_current_table, session_payload

router = APIRouter()


@router.get("/session/current")
async def get_session_current():
    try:
        return session_payload()
    except DefaultTableUnavailableError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/session/clear")
async def clear_session():
    store = get_agent_run_store()
    try:
        store.clear()
    except Exception:
        pass
    try:
        current_table = clear_current_table()
        payload = session_payload()
    except DefaultTableUnavailableError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {
        "ok": True,
        **payload,
        "current_table": current_table,
        "app_default_table": payload["app_default_table"],
        "user_active_table": current_table,
    }
