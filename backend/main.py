"""FastAPI application entry point.

Run with:  uvicorn backend.main:app --reload --port 8000
"""

import sys
import os

# Ensure project root is on sys.path for database/ imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload, tables, quality
from backend.services.data_service import check_db_connection, get_uptime

app = FastAPI(title="Enterprise AI Data Agent API", version="0.3.3.1")

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
        "rag": "unknown",
        "version": "0.3.3.1",
        "uptime": get_uptime(),
    }
