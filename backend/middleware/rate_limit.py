"""Lightweight in-process rate limiting middleware."""

import time
from collections import defaultdict, deque
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Limit requests per client IP within a sliding time window."""

    def __init__(
        self,
        app,
        enabled: bool = True,
        max_requests: int = 120,
        window_seconds: int = 60,
    ):
        super().__init__(app)
        self.enabled = enabled
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enabled or request.method == "OPTIONS":
            return await call_next(request)

        client_key = self._client_key(request)
        now = time.monotonic()
        window_start = now - self.window_seconds
        hits = self._requests[client_key]

        while hits and hits[0] < window_start:
            hits.popleft()

        if len(hits) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "status": "error",
                    "detail": "Rate limit exceeded",
                    "path": request.url.path,
                },
                headers={"Retry-After": str(self.window_seconds)},
            )

        hits.append(now)
        return await call_next(request)

    @staticmethod
    def _client_key(request: Request) -> str:
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"
