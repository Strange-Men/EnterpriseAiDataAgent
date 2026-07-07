"""Regression tests for M6 manual hotfix default table and upload status QA."""

import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.data_service import APP_DEFAULT_TABLE
from backend.services.upload_tasks import create_upload_task, get_upload_task_status, update_upload_task


def _client(tmp_path, monkeypatch):
    from database.db_manager import DatabaseManager
    from backend.services import data_service

    monkeypatch.setenv("DUCKDB_PATH", str(tmp_path / "m6_manual_hotfix.duckdb"))
    DatabaseManager.reset_instance()
    data_service._db = None
    data_service._executor = None
    data_service._readonly_executor = None

    from backend.main import app

    return TestClient(app)


def test_tables_endpoint_prepares_default_demo_without_session_first(tmp_path, monkeypatch):
    with _client(tmp_path, monkeypatch) as client:
        res = client.get("/api/tables")

    assert res.status_code == 200
    demo = next((table for table in res.json() if table["name"] == APP_DEFAULT_TABLE), None)
    assert demo is not None
    assert demo["rowCount"] == 50000
    assert demo["columnCount"] == 28


def test_session_current_returns_default_demo_metadata(tmp_path, monkeypatch):
    with _client(tmp_path, monkeypatch) as client:
        res = client.get("/api/session/current")

    assert res.status_code == 200
    payload = res.json()
    assert payload["app_default_table"] == APP_DEFAULT_TABLE
    assert payload["current_table"] == APP_DEFAULT_TABLE
    assert payload["current_table_exists"] is True
    assert payload["current_table_row_count"] == 50000
    assert payload["current_table_column_count"] == 28
    assert payload["app_default_table_exists"] is True


def test_running_done_upload_status_is_normalized_to_success(tmp_path, monkeypatch):
    with _client(tmp_path, monkeypatch):
        task = create_upload_task("already_done.csv")
        update_upload_task(
            task["task_id"],
            status="running",
            progress=100,
            stage="done",
            table_name="already_done",
        )

        status = get_upload_task_status(task["task_id"])

    assert status is not None
    assert status["status"] == "success"
    assert status["stage"] == "done"
    assert status["progress"] == 100
    assert status["table_name"] == "already_done"


def test_failed_stage_upload_status_is_normalized_to_failed(tmp_path, monkeypatch):
    with _client(tmp_path, monkeypatch):
        task = create_upload_task("already_failed.csv")
        update_upload_task(
            task["task_id"],
            status="running",
            progress=100,
            stage="failed",
            error_message="File processing failed clearly.",
        )

        status = get_upload_task_status(task["task_id"])

    assert status is not None
    assert status["status"] == "failed"
    assert status["stage"] == "failed"
    assert status["progress"] == 100
    assert status["error_message"] == "File processing failed clearly."


def test_default_demo_agent_api_real_chinese_question_returns_business_report(tmp_path, monkeypatch):
    question = (
        "\u8bf7\u57fa\u4e8e\u5f53\u524d demo_sales_business_50k \u6570\u636e\uff0c"
        "\u5224\u65ad\u516c\u53f8\u6574\u4f53\u7ecf\u8425\u5065\u5eb7\u5ea6\u3002"
    )
    with _client(tmp_path, monkeypatch) as client:
        session = client.get("/api/session/current").json()
        res = client.post(
            "/api/agent/runs",
            json={
                "user_input": question,
                "table_name": session["current_table"],
                "provider_requested": "mock",
                "mode": "skeleton",
            },
        )

    assert res.status_code == 200
    run = res.json()["run"]
    report = run["business_report"]
    assert run["provider_status"] == "mock"
    assert report["executive_summary"]
    assert report["recommendations"]
    assert report["evidence_summary"]
    assert report["next_questions"]


def test_default_demo_agent_api_membership_level_remains_anti_hallucination(tmp_path, monkeypatch):
    question = "\u8bf7\u5206\u6790\u4e0d\u540c\u4f1a\u5458\u7b49\u7ea7\u7684\u9000\u6b3e\u7387\u548c\u590d\u8d2d\u8868\u73b0\u3002"
    with _client(tmp_path, monkeypatch) as client:
        session = client.get("/api/session/current").json()
        res = client.post(
            "/api/agent/runs",
            json={
                "user_input": question,
                "table_name": session["current_table"],
                "provider_requested": "mock",
                "mode": "skeleton",
            },
        )

    assert res.status_code == 200
    run = res.json()["run"]
    report = run["business_report"]
    serialized = str(report)
    assert "membership_level" in serialized
    assert "\u9ec4\u91d1\u4f1a\u5458" not in serialized
    assert "\u94bb\u77f3\u4f1a\u5458" not in serialized
    assert report["recommendations"]
