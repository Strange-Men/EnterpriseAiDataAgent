"""Tests for Observability Middleware."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.middleware.observability import (
    classify_error,
    classify_speed,
    QueryTimer,
    SLOW_QUERY_MS,
    SLOW_REQUEST_MS,
    VERY_SLOW_REQUEST_MS,
)


class TestClassifyError:
    def test_server_error(self):
        result = classify_error(500, "Internal Server Error")
        assert result["category"] == "server_error"
        assert result["severity"] == "error"

    def test_validation_error(self):
        result = classify_error(422, "Validation Error")
        assert result["category"] == "validation_error"
        assert result["severity"] == "warning"

    def test_not_found(self):
        result = classify_error(404, "Not Found")
        assert result["category"] == "not_found"
        assert result["severity"] == "warning"

    def test_client_error(self):
        result = classify_error(400, "Bad Request")
        assert result["category"] == "client_error"
        assert result["severity"] == "warning"

    def test_database_error(self):
        result = classify_error(500, "DuckDB connection failed")
        assert result["category"] == "database_error"
        assert result["severity"] == "error"

    def test_timeout_error(self):
        result = classify_error(500, "Query timeout exceeded")
        assert result["category"] == "timeout_error"

    def test_sql_syntax_error(self):
        result = classify_error(400, "SQL parse error near FROM")
        assert result["category"] == "sql_syntax_error"
        assert result["severity"] == "warning"


class TestClassifySpeed:
    def test_normal(self):
        assert classify_speed(100) == "normal"

    def test_moderate(self):
        assert classify_speed(SLOW_QUERY_MS) == "moderate"

    def test_slow(self):
        assert classify_speed(SLOW_REQUEST_MS) == "slow"

    def test_very_slow(self):
        assert classify_speed(VERY_SLOW_REQUEST_MS) == "very_slow"

    def test_just_below_threshold(self):
        assert classify_speed(SLOW_QUERY_MS - 1) == "normal"


class TestQueryTimer:
    def test_timer_measures_elapsed(self):
        import time
        with QueryTimer("SELECT 1") as timer:
            time.sleep(0.01)
        assert timer.elapsed_ms >= 10
        assert timer.elapsed_ms < 1000

    def test_timer_stores_sql(self):
        sql = "SELECT * FROM users WHERE id = 1"
        with QueryTimer(sql) as timer:
            pass
        assert timer.sql == sql

    def test_timer_zero_for_fast_query(self):
        with QueryTimer("SELECT 1") as timer:
            pass
        assert timer.elapsed_ms < 100


class TestObservabilityResponseHeaders:
    def test_request_has_timing_headers(self):
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        res = client.get("/api/health")
        assert res.status_code == 200
        assert "X-Request-ID" in res.headers
        assert "X-Response-Time" in res.headers
        # Response time should be in ms format
        assert "ms" in res.headers["X-Response-Time"]

    def test_request_id_is_unique(self):
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        res1 = client.get("/api/health")
        res2 = client.get("/api/health")
        assert res1.headers["X-Request-ID"] != res2.headers["X-Request-ID"]

    def test_query_endpoint_has_observability(self):
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        res = client.post("/api/query", json={"sql": "SELECT 1"})
        assert "X-Request-ID" in res.headers
        assert "X-Response-Time" in res.headers
