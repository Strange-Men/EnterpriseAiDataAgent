"""FastAPI application entry point.

Run with:  uvicorn backend.main:app --reload --port 8000
"""

import os
import sys
import logging
from contextlib import asynccontextmanager

# Ensure project root is on sys.path so `database/` package is importable.
# This is the single canonical place for this path fix.
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import API_VERSION
from backend.routes import upload, tables, quality, query, ai, analyze
from backend.services.data_service import check_db_connection, get_uptime, get_db, get_system_health
from backend.middleware.observability import ObservabilityMiddleware

logger = logging.getLogger("enterprise_ai.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Centralized startup/shutdown lifecycle.

    Startup: warm up DB connection so first request isn't slow.
    Shutdown: close DuckDB connection cleanly.
    """
    # ── Startup ────────────────────────────────────────────────
    logger.info("Application starting — warming up DB connection")
    try:
        get_db().connect()
        logger.info("DB connection warm-up OK")
    except Exception as e:
        logger.warning(f"DB warm-up failed (will retry on first request): {e}")

    # Start scheduler background worker
    try:
        from backend.runtime.scheduler_worker import start_worker
        start_worker()
        logger.info("Scheduler worker started")
    except Exception as e:
        logger.warning(f"Scheduler worker start failed (non-fatal): {e}")

    yield

    # ── Shutdown ───────────────────────────────────────────────
    # Stop scheduler worker
    try:
        from backend.runtime.scheduler_worker import stop_worker
        stop_worker()
        logger.info("Scheduler worker stopped")
    except Exception as e:
        logger.warning(f"Scheduler worker stop error (non-fatal): {e}")

    logger.info("Application shutting down — closing DB connection")
    try:
        get_db().close()
        logger.info("DB connection closed")
    except Exception as e:
        logger.warning(f"DB close error (non-fatal): {e}")


app = FastAPI(title="Enterprise AI Data Agent API", version=API_VERSION, lifespan=lifespan)

# Observability middleware (must be added before CORS for proper timing)
app.add_middleware(ObservabilityMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all route modules under /api
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(tables.router, prefix="/api", tags=["tables"])
app.include_router(quality.router, prefix="/api", tags=["quality"])
app.include_router(query.router, prefix="/api", tags=["query"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])


@app.get("/api/health")
async def health():
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "db_connected": db_ok,
    }


@app.get("/api/status")
async def status():
    db_ok = check_db_connection()
    return {
        "api": "ok",
        "db": "ok" if db_ok else "error",
        "version": API_VERSION,
        "uptime": get_uptime(),
    }


@app.get("/api/health/system")
async def health_system():
    """Comprehensive system health diagnostics."""
    data = get_system_health()
    data["version"] = API_VERSION
    return data
