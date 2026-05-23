"""Observability Middleware — Enterprise Runtime Diagnostics.

Provides:
- Structured request logging with request IDs
- Slow query detection (>2s threshold)
- Error classification (client/server/db/network)
- Request timing
- Response metadata injection

Usage: Added to FastAPI app in main.py
"""

import time
import uuid
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# ── Logger Setup ─────────────────────────────────────────────────

logger = logging.getLogger("enterprise_ai.observability")
logger.setLevel(logging.INFO)

# Create handler if not already configured
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'
    ))
    logger.addHandler(handler)

# ── Configuration ────────────────────────────────────────────────

SLOW_QUERY_MS = 2000        # Queries slower than this are flagged
SLOW_REQUEST_MS = 5000      # Requests slower than this are flagged
VERY_SLOW_REQUEST_MS = 10000


# ── Error Classification ────────────────────────────────────────

def classify_error(status_code: int, error_detail: str = "") -> dict:
    """Classify an error into a structured category."""
    category = "unknown"
    severity = "info"

    if status_code >= 500:
        category = "server_error"
        severity = "error"
    elif status_code == 422:
        category = "validation_error"
        severity = "warning"
    elif status_code == 404:
        category = "not_found"
        severity = "warning"
    elif status_code >= 400:
        category = "client_error"
        severity = "warning"

    # Detect specific error types from detail
    detail_lower = str(error_detail).lower()
    if "duckdb" in detail_lower or "database" in detail_lower or "connection" in detail_lower:
        category = "database_error"
        severity = "error"
    elif "timeout" in detail_lower:
        category = "timeout_error"
        severity = "error"
    elif "parse" in detail_lower or "syntax" in detail_lower:
        category = "sql_syntax_error"
        severity = "warning"

    return {"category": category, "severity": severity}


# ── Slow Query Detection ────────────────────────────────────────

def classify_speed(elapsed_ms: float) -> str:
    """Classify request/query speed."""
    if elapsed_ms >= VERY_SLOW_REQUEST_MS:
        return "very_slow"
    if elapsed_ms >= SLOW_REQUEST_MS:
        return "slow"
    if elapsed_ms >= SLOW_QUERY_MS:
        return "moderate"
    return "normal"


# ── Structured Log Entry ────────────────────────────────────────

def log_request(
    request_id: str,
    method: str,
    path: str,
    status_code: int,
    elapsed_ms: float,
    error_detail: str = "",
):
    """Create a structured log entry for a request."""
    speed = classify_speed(elapsed_ms)
    error_info = classify_error(status_code, error_detail) if status_code >= 400 else None

    entry = {
        "request_id": request_id,
        "method": method,
        "path": path,
        "status": status_code,
        "elapsed_ms": round(elapsed_ms, 2),
        "speed": speed,
    }

    if error_info:
        entry["error_category"] = error_info["category"]
        entry["severity"] = error_info["severity"]

    # Log level based on status and speed
    if status_code >= 500:
        logger.error(f"Request {method} {path} → {status_code} ({elapsed_ms:.0f}ms) [{speed}]")
    elif speed in ("slow", "very_slow"):
        logger.warning(f"Slow request {method} {path} → {status_code} ({elapsed_ms:.0f}ms) [{speed}]")
    elif status_code >= 400:
        logger.warning(f"Client error {method} {path} → {status_code} ({elapsed_ms:.0f}ms)")
    else:
        logger.info(f"{method} {path} → {status_code} ({elapsed_ms:.0f}ms)")

    return entry


# ── Middleware ───────────────────────────────────────────────────

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for request observability."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # Inject request ID into request state
        request.state.request_id = request_id

        # Process request
        response = None
        error_detail = ""
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            error_detail = str(e)
            raise
        finally:
            elapsed_ms = (time.time() - start_time) * 1000
            status_code = response.status_code if response else 500

            log_entry = log_request(
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                status_code=status_code,
                elapsed_ms=elapsed_ms,
                error_detail=error_detail,
            )

            # Inject timing headers
            if response:
                response.headers["X-Request-ID"] = request_id
                response.headers["X-Response-Time"] = f"{elapsed_ms:.0f}ms"


# ── Query Timing Utilities ──────────────────────────────────────

class QueryTimer:
    """Context manager for timing SQL queries."""

    def __init__(self, sql: str):
        self.sql = sql
        self.start = None
        self.elapsed_ms = 0

    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.elapsed_ms = (time.time() - self.start) * 1000
        speed = classify_speed(self.elapsed_ms)
        if speed in ("slow", "very_slow"):
            logger.warning(
                f"Slow query ({self.elapsed_ms:.0f}ms) [{speed}]: {self.sql[:200]}"
            )
        else:
            logger.info(f"Query completed ({self.elapsed_ms:.0f}ms): {self.sql[:100]}")
