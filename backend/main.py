"""FastAPI application entry point.

Run with:  uvicorn backend.main:app --reload --port 8000
"""

import os
import sys

# Ensure project root is on sys.path so `database/` package is importable.
# This is the single canonical place for this path fix.
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import API_VERSION
from backend.routes import upload, tables, quality, query, ai, analyze
from backend.services.data_service import check_db_connection, get_uptime
from backend.middleware.observability import ObservabilityMiddleware

app = FastAPI(title="Enterprise AI Data Agent API", version=API_VERSION)

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
