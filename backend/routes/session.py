"""Session state endpoints for current table and Agent memory reset."""

from fastapi import APIRouter

from backend.routes.agent import get_agent_run_store
from backend.services.session_state import clear_current_table, session_payload

router = APIRouter()


@router.get("/session/current")
async def get_session_current():
    return session_payload()


@router.post("/session/clear")
async def clear_session():
    store = get_agent_run_store()
    try:
        store.clear()
    except Exception:
        pass
    current_table = clear_current_table()
    return {
        "ok": True,
        "current_table": current_table,
        "app_default_table": current_table,
        "user_active_table": current_table,
    }
