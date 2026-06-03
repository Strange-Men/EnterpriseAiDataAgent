"""Tests for in-process rate limiting middleware."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.middleware.rate_limit import RateLimitMiddleware


def _make_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        RateLimitMiddleware,
        enabled=True,
        max_requests=2,
        window_seconds=60,
    )

    @app.get("/api/test")
    def test_endpoint():
        return {"status": "ok"}

    return app


def test_rate_limit_allows_requests_under_limit():
    client = TestClient(_make_app())
    assert client.get("/api/test").status_code == 200
    assert client.get("/api/test").status_code == 200


def test_rate_limit_rejects_requests_over_limit():
    client = TestClient(_make_app())
    client.get("/api/test")
    client.get("/api/test")
    res = client.get("/api/test")
    assert res.status_code == 429
    assert res.json()["detail"] == "Rate limit exceeded"
