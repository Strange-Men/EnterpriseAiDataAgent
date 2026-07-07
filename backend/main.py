"""FastAPI application entry point.

Run with:  uvicorn backend.main:app --reload --port 8000
"""

# ruff: noqa: E402

import os
import sys
import logging
from contextlib import asynccontextmanager

# Ensure project root is on sys.path so `database/` package is importable.
# This is the single canonical place for this path fix.
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

import traceback

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.config import (
    API_KEY,
    API_VERSION,
    RATE_LIMIT_ENABLED,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_SECONDS,
)
from backend.routes import upload, tables, quality, query, ai, analyze, agent, session
from backend.services.data_service import check_db_connection, get_uptime, get_db, get_system_health
from backend.middleware.auth import APIKeyAuthMiddleware
from backend.middleware.observability import ObservabilityMiddleware
from backend.middleware.rate_limit import RateLimitMiddleware

# Configure root logger for full traceback visibility
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

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

    # Optional: seed demo data on first startup
    if os.getenv("SEED_DEMO_DATA", "").lower() in ("true", "1", "yes"):
        try:
            import importlib.util
            seed_path = os.path.join(_PROJECT_ROOT, "scripts", "seed-demo-data.py")
            if os.path.exists(seed_path):
                spec = importlib.util.spec_from_file_location("seed_demo_data", seed_path)
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                mod.seed_demo_data()
            else:
                logger.info("Seed script not found — skipping demo data")
        except Exception as e:
            logger.warning(f"Demo seed skipped (non-fatal): {e}")

    # M4-7.1: Scheduler worker disabled — feature flag showSchedule=false,
    # no user-facing scheduler UI. Worker code preserved in
    # backend/runtime/scheduler_worker.py for future Agent use.
    # To re-enable, uncomment the block below.
    #
    # try:
    #     from backend.runtime.scheduler_worker import start_worker
    #     start_worker()
    #     logger.info("Scheduler worker started")
    # except Exception as e:
    #     logger.warning(f"Scheduler worker start failed (non-fatal): {e}")

    yield

    # ── Shutdown ───────────────────────────────────────────────
    # try:
    #     from backend.runtime.scheduler_worker import stop_worker
    #     stop_worker()
    #     logger.info("Scheduler worker stopped")
    # except Exception as e:
    #     logger.warning(f"Scheduler worker stop error (non-fatal): {e}")

    logger.info("Application shutting down — closing DB connection")
    try:
        get_db().close()
        logger.info("DB connection closed")
    except Exception as e:
        logger.warning(f"DB close error (non-fatal): {e}")


app = FastAPI(title="Enterprise AI Data Agent API", version=API_VERSION, lifespan=lifespan)


# ── Global exception handlers ─────────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions — preserve status code, log 5xx errors."""
    if exc.status_code >= 500:
        logger.error(
            f"HTTP {exc.status_code} in {request.method} {request.url.path}: {exc.detail}"
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "detail": exc.detail,
            "path": str(request.url.path),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors — return 422."""
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "detail": "Invalid request parameters",
            "errors": exc.errors(),
            "path": str(request.url.path),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — logs full traceback, returns sanitized JSON."""
    tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    logger.error(
        f"Unhandled exception in {request.method} {request.url.path}:\n{tb}"
    )
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "detail": "Internal server error",
            "path": str(request.url.path),
        },
    )


# Observability middleware (must be added before CORS for proper timing)
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(APIKeyAuthMiddleware, api_key=API_KEY)
app.add_middleware(
    RateLimitMiddleware,
    enabled=RATE_LIMIT_ENABLED,
    max_requests=RATE_LIMIT_REQUESTS,
    window_seconds=RATE_LIMIT_WINDOW_SECONDS,
)

# CORS: read allowed origins from env var (comma-separated).
# Use explicit localhost origins by default because credentials and "*" are not a valid production-grade pair.
_cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_cors_origins = [o.strip() for o in _cors_origins_str.split(",") if o.strip()]
_allow_credentials = "*" not in _cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_allow_credentials,
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
app.include_router(agent.router)
app.include_router(session.router, prefix="/api", tags=["session"])


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
