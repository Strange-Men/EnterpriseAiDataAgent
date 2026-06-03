"""Tests for API key authentication middleware."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.middleware.auth import APIKeyAuthMiddleware


def _make_app(api_key: str = "test-key") -> FastAPI:
    app = FastAPI()
    app.add_middleware(APIKeyAuthMiddleware, api_key=api_key)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.post("/api/query")
    def query():
        return {"status": "success"}

    return app


def test_public_health_endpoint_does_not_require_api_key():
    client = TestClient(_make_app())
    res = client.get("/api/health")
    assert res.status_code == 200


def test_protected_endpoint_rejects_missing_api_key():
    client = TestClient(_make_app())
    res = client.post("/api/query")
    assert res.status_code == 401
    assert res.json()["status"] == "error"


def test_protected_endpoint_accepts_valid_bearer_token():
    client = TestClient(_make_app())
    res = client.post("/api/query", headers={"Authorization": "Bearer test-key"})
    assert res.status_code == 200


def test_empty_api_key_disables_auth_for_local_development():
    client = TestClient(_make_app(api_key=""))
    res = client.post("/api/query")
    assert res.status_code == 200
