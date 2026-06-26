"""Tests for AI API endpoints with mocked LLM calls."""

import pytest
import sys
import os
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app


client = TestClient(app)


class TestAIStatusEndpoint:
    def test_status_returns_200(self):
        resp = client.get("/api/ai/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "configured" in data
        assert "connection" in data


class TestAIQueryEndpoint:
    @patch("backend.routes.ai.run_ai_query")
    def test_query_success(self, mock_run):
        mock_run.return_value = {
            "sql": "SELECT COUNT(*) as cnt FROM test",
            "results": [{"cnt": 42}],
            "columns": ["cnt"],
            "row_count": 1,
            "explanation": "There are 42 rows.",
            "status": "success",
        }
        resp = client.post("/api/ai/query", json={"question": "How many rows?"})
        assert resp.status_code == 200
        data = resp.json()
        assert "sql" in data
        assert data["status"] == "success"
        assert data["llm"]["provider_requested"] == "mock"

    @patch("backend.routes.ai.run_ai_query")
    def test_query_passes_provider_and_returns_metadata(self, mock_run):
        mock_run.return_value = {
            "sql": "SELECT * FROM test LIMIT 100",
            "status": "success",
        }
        resp = client.post("/api/ai/query", json={"question": "Show rows", "llm_provider": "deepseek"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["llm"]["provider_requested"] == "deepseek"
        assert data["llm"]["provider_used"] == "deepseek"

    def test_query_invalid_provider_returns_422(self):
        resp = client.post("/api/ai/query", json={"question": "How many rows?", "llm_provider": "invalid"})
        assert resp.status_code == 422

    def test_query_missing_question(self):
        resp = client.post("/api/ai/query", json={})
        assert resp.status_code == 422

    def test_query_empty_question(self):
        resp = client.post("/api/ai/query", json={"question": "   "})
        assert resp.status_code == 400


class TestAIExplainEndpoint:
    @patch("backend.routes.ai.explain_results")
    def test_explain_success(self, mock_explain):
        mock_explain.return_value = {
            "explanation": "This shows the total count.",
            "status": "success",
        }
        resp = client.post("/api/ai/explain", json={
            "question": "What is this?",
            "sql": "SELECT COUNT(*) FROM t",
            "results": [{"count": 10}],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "explanation" in data

    def test_explain_missing_fields(self):
        resp = client.post("/api/ai/explain", json={"question": "test"})
        assert resp.status_code == 422


class TestAIInsightsEndpoint:
    @patch("backend.routes.ai.generate_insights")
    def test_insights_success(self, mock_insights):
        mock_insights.return_value = {
            "insights": ["High sales in Q4"],
            "trends": ["Upward trend"],
            "status": "success",
        }
        resp = client.post("/api/ai/insights", json={
            "question": "Any insights?",
            "results": [{"month": "Jan", "sales": 100}],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "insights" in data


class TestAIChartSuggestEndpoint:
    @patch("backend.routes.ai.suggest_charts")
    def test_chart_suggest_success(self, mock_charts):
        mock_charts.return_value = {
            "recommended_charts": [{"type": "bar", "x": "month", "y": "sales"}],
            "status": "success",
        }
        resp = client.post("/api/ai/chart-suggest", json={
            "results": [{"month": "Jan", "sales": 100}],
            "question": "Show sales chart",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "recommended_charts" in data


class TestAIStreamingEndpoints:
    @patch("backend.routes.ai.explain_results_stream")
    def test_explain_stream_content_type(self, mock_stream):
        mock_stream.return_value = iter(["chunk1", "chunk2"])
        resp = client.post("/api/ai/explain/stream", json={
            "question": "Explain",
            "sql": "SELECT 1",
            "results": [{"col": 1}],
        })
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]

    @patch("backend.routes.ai.generate_insights_stream")
    def test_insights_stream_content_type(self, mock_stream):
        mock_stream.return_value = iter(["chunk1"])
        resp = client.post("/api/ai/insights/stream", json={
            "question": "Insights",
            "results": [{"col": 1}],
        })
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]


class TestAISemanticsEndpoint:
    @patch("backend.routes.ai.generate_semantics")
    def test_semantics_success(self, mock_sem):
        mock_sem.return_value = {
            "summary": "Sales dataset",
            "columns": [],
            "status": "success",
        }
        resp = client.post("/api/ai/semantics", json={
            "table": "sales",
            "columns": [{"name": "id", "dtype": "INTEGER"}],
            "sample_rows": [{"id": 1}],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "summary" in data
