"""Tests for FastAPI endpoints."""

import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def client():
    from backend.main import app
    return TestClient(app)


class TestHealthAndStatus:
    def test_health(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert "status" in data

    def test_status(self, client):
        res = client.get("/api/status")
        assert res.status_code == 200
        data = res.json()
        assert data["version"] == "0.3.7"


class TestQueryEndpoints:
    def test_query_select(self, client):
        res = client.post("/api/query", json={"sql": "SELECT 1 as val"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["columns"] == ["val"]
        assert "queryId" in data

    def test_query_empty(self, client):
        res = client.post("/api/query", json={"sql": ""})
        assert res.status_code == 400

    def test_explain(self, client):
        res = client.post("/api/query/explain", json={"sql": "SELECT 1"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["plan"]) > 0

    def test_explain_empty(self, client):
        res = client.post("/api/query/explain", json={"sql": ""})
        assert res.status_code == 400

    def test_cancel(self, client):
        res = client.post("/api/query/cancel", json={"query_id": 999})
        assert res.status_code == 200
        assert res.json()["cancelled"] is True

    def test_export_csv(self, client):
        res = client.post("/api/query/export", json={"sql": "SELECT 1 as x", "format": "csv"})
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]

    def test_export_json(self, client):
        res = client.post("/api/query/export", json={"sql": "SELECT 1 as x", "format": "json"})
        assert res.status_code == 200
        assert "application/json" in res.headers["content-type"]

    def test_schema(self, client):
        res = client.get("/api/query/schema")
        assert res.status_code == 200
        assert isinstance(res.json(), dict)

    def test_history(self, client):
        res = client.get("/api/query/history")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_history_after_query(self, client):
        client.post("/api/query", json={"sql": "SELECT 1"})
        res = client.get("/api/query/history?limit=1")
        data = res.json()
        assert len(data) >= 1


class TestTablesEndpoint:
    def test_tables(self, client):
        res = client.get("/api/tables")
        assert res.status_code == 200
        assert isinstance(res.json(), list)
