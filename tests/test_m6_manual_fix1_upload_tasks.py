"""M6 Manual Fix 1 tests for async upload tasks and session table state."""

import io
import os
import sys
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.data_service import APP_DEFAULT_TABLE
from backend.services.upload_tasks import TIMEOUT_MESSAGE, create_upload_task, update_upload_task


@pytest.fixture
def client():
    from database.db_manager import DatabaseManager
    from backend.services import data_service

    DatabaseManager.reset_instance()
    data_service._db = None
    data_service._executor = None
    data_service._readonly_executor = None
    data_service.get_db().connect().execute("SELECT 1").fetchone()

    from backend.main import app

    with TestClient(app) as c:
        yield c


def _post_csv(client, filename="fix1_upload.csv", content=b"id,name\n1,Alice\n2,Bob"):
    return client.post("/api/upload", files={"file": (filename, io.BytesIO(content), "text/csv")})


def _task_status(client, task_id: str):
    res = client.get(f"/api/tasks/{task_id}/status")
    assert res.status_code == 200
    return res.json()


def test_upload_returns_task_id_without_sync_table_payload(client):
    res = _post_csv(client)
    assert res.status_code == 200
    data = res.json()
    assert data["task_id"]
    assert data["status"] in {"pending", "running"}
    assert "tableName" not in data


def test_task_status_reaches_success_with_table_name_and_updates_session(client):
    res = _post_csv(client, "fix1_success.csv")
    task = _task_status(client, res.json()["task_id"])

    assert task["status"] == "success"
    assert task["stage"] == "done"
    assert task["progress"] == 100
    assert task["table_name"] == "fix1_success"

    session = client.get("/api/session/current").json()
    assert session["current_table"] == "fix1_success"
    assert session["user_active_table"] == "fix1_success"


def test_failed_task_returns_sanitized_error_message(client):
    res = client.post(
        "/api/upload",
        files={"file": ("bad.xyz", io.BytesIO(b"not a supported file"), "application/octet-stream")},
    )
    assert res.status_code == 200
    task = _task_status(client, res.json()["task_id"])

    assert task["status"] == "failed"
    assert task["error_message"]
    assert "Traceback" not in task["error_message"]
    assert "site-packages" not in task["error_message"]
    assert "D:\\" not in task["error_message"]
    assert "/" not in task["error_message"].replace("Failed to load file. Please check the format and try again.", "")


def test_running_task_older_than_300_seconds_auto_fails(client):
    task = create_upload_task("slow.csv")
    old_started = (datetime.now(timezone.utc) - timedelta(seconds=301)).isoformat()
    update_upload_task(
        task["task_id"],
        status="running",
        progress=40,
        stage="loading",
        started_at=old_started,
    )

    status = _task_status(client, task["task_id"])
    assert status["status"] == "failed"
    assert status["stage"] == "failed"
    assert status["error_message"] == TIMEOUT_MESSAGE


def test_clear_session_returns_default_table_and_clears_current_table(client):
    uploaded = _post_csv(client, "fix1_current.csv")
    task = _task_status(client, uploaded.json()["task_id"])
    assert task["status"] == "success"
    assert client.get("/api/session/current").json()["current_table"] == "fix1_current"

    cleared = client.post("/api/session/clear")
    assert cleared.status_code == 200
    data = cleared.json()
    assert data["ok"] is True
    assert data["current_table"] == APP_DEFAULT_TABLE

    restored = client.get("/api/session/current").json()
    assert restored["current_table"] == APP_DEFAULT_TABLE


def test_app_default_table_is_m6_business_demo(client):
    session = client.get("/api/session/current").json()
    assert session["app_default_table"] == APP_DEFAULT_TABLE
    assert session["current_table"] == APP_DEFAULT_TABLE

    tables = client.get("/api/tables").json()
    names = {table["name"] for table in tables}
    assert APP_DEFAULT_TABLE in names
    assert all(not name.startswith("__eai_") for name in names)
