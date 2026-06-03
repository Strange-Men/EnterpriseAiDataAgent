"""API key authentication middleware."""

import hmac
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


PUBLIC_PATHS = {
    "/api/health",
    "/api/status",
    "/api/health/system",
    "/docs",
    "/openapi.json",
    "/redoc",
}


class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    """Require `Authorization: Bearer <API_KEY>` when API_KEY is configured."""

    def __init__(self, app, api_key: str = ""):
        super().__init__(app)
        self.api_key = api_key.strip()

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if self._is_public_request(request):
            return await call_next(request)

        authorization = request.headers.get("Authorization", "")
        expected = f"Bearer {self.api_key}"
        if not authorization or not hmac.compare_digest(authorization, expected):
            return JSONResponse(
                status_code=401,
                content={
                    "status": "error",
                    "detail": "Invalid or missing API key",
                    "path": request.url.path,
                },
            )

        return await call_next(request)

    def _is_public_request(self, request: Request) -> bool:
        if not self.api_key:
            return True
        if request.method == "OPTIONS":
            return True
        path = request.url.path.rstrip("/") or "/"
        return path in PUBLIC_PATHS
