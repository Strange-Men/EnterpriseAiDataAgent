"""Tests for error sanitization across analyze, quality, and upload routes.

Verifies that error responses do not leak internal details (tracebacks,
file paths, module names) to the client.
"""

import pytest
import sys
import os
import io
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from database.db_manager import DatabaseManager
    from backend.services import data_service

    DatabaseManager.reset_instance()
    data_service._db = None
    data_service._executor = None
    conn = data_service.get_db().connect()
    conn.execute("SELECT 1").fetchone()

    from backend.main import app
    with TestClient(app) as c:
        yield c


def _unique_name(prefix: str) -> str:
    return f"{prefix}_{int(time.time()*1000)}"


def _upload_csv(client, prefix="san", rows=b"id,val\n1,a\n2,b"):
    fname = _unique_name(prefix) + ".csv"
    files = {"file": (fname, io.BytesIO(rows), "text/csv")}
    res = client.post("/api/upload", files=files)
    assert res.status_code == 200
    task = _wait_upload_task(client, res)
    assert task["status"] == "success"
    return task["table_name"]


def _wait_upload_task(client, upload_res):
    data = upload_res.json()
    assert "task_id" in data
    status_res = client.get(f"/api/tasks/{data['task_id']}/status")
    assert status_res.status_code == 200
    return status_res.json()


def _assert_no_internal_leak(response_json: dict):
    """Assert error detail does not contain internal Python info."""
    detail = response_json.get("detail", "")
    # Must not contain Python traceback markers
    assert "Traceback" not in detail, f"Traceback leaked: {detail}"
    assert "File \"" not in detail, f"File path leaked: {detail}"
    assert "site-packages" not in detail, f"Module path leaked: {detail}"
    assert "backend/" not in detail, f"Backend path leaked: {detail}"
    assert "database/" not in detail, f"Database path leaked: {detail}"
    # Must not be empty
    assert len(detail) > 0, "Error detail is empty"


class TestAnalyzeErrorSanitization:
    """Verify /api/analyze/* errors are sanitized."""

    def test_analyze_nonexistent_table_sanitized(self, client):
        res = client.post("/api/analyze/nonexistent_xyz_99999")
        assert res.status_code in (404, 500)
        _assert_no_internal_leak(res.json())

    def test_analyze_profile_nonexistent_sanitized(self, client):
        res = client.get("/api/analyze/nonexistent_xyz_99999/profile")
        assert res.status_code in (404, 500)
        _assert_no_internal_leak(res.json())

    def test_analyze_normal_path(self, client):
        table = _upload_csv(client, "anlz", b"id,score\n1,95\n2,87\n3,92")
        res = client.post(f"/api/analyze/{table}")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["table"] == table
        assert "profile" in data
        assert "elapsed_ms" in data

    def test_analyze_profile_normal_path(self, client):
        table = _upload_csv(client, "aprof", b"id,name\n1,Alice\n2,Bob")
        res = client.get(f"/api/analyze/{table}/profile")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["profile"]["row_count"] == 2

    def test_analyze_profile_column_stats(self, client):
        table = _upload_csv(client, "astat", b"score,grade\n95,A\n87,B\n92,A")
        res = client.get(f"/api/analyze/{table}/profile")
        profile = res.json()["profile"]
        score_col = next(c for c in profile["columns"] if c["name"] == "score")
        assert "stats" in score_col
        assert "mean" in score_col["stats"]
        grade_col = next(c for c in profile["columns"] if c["name"] == "grade")
        assert "top_values" in grade_col


class TestQualityErrorSanitization:
    """Verify /api/quality/* errors are sanitized."""

    def test_quality_nonexistent_table_sanitized(self, client):
        res = client.get("/api/quality/nonexistent_xyz_99999")
        assert res.status_code in (404, 500)
        _assert_no_internal_leak(res.json())

    def test_quality_normal_path(self, client):
        table = _upload_csv(client, "qnorm", b"id,name\n1,Alice\n2,Bob\n3,Charlie")
        res = client.get(f"/api/quality/{table}")
        assert res.status_code == 200
        data = res.json()
        assert "overallScore" in data
        assert "fieldHealth" in data

    def test_quality_single_row(self, client):
        table = _upload_csv(client, "qone", b"id\n1")
        res = client.get(f"/api/quality/{table}")
        assert res.status_code == 200
        data = res.json()
        assert "overallScore" in data


class TestUploadErrorSanitization:
    """Verify /api/upload errors are sanitized."""

    def test_upload_empty_file_sanitized(self, client):
        files = {"file": ("empty.csv", io.BytesIO(b""), "text/csv")}
        res = client.post("/api/upload", files=files)
        assert res.status_code in (400, 422)
        _assert_no_internal_leak(res.json())

    def test_upload_no_file_sanitized(self, client):
        res = client.post("/api/upload")
        assert res.status_code == 422

    def test_upload_invalid_format_sanitized(self, client):
        files = {"file": ("bad.xyz", io.BytesIO(b"not a real file"), "application/octet-stream")}
        res = client.post("/api/upload", files=files)
        assert res.status_code == 200
        task = _wait_upload_task(client, res)
        assert task["status"] == "failed"
        _assert_no_internal_leak({"detail": task["error_message"]})

    def test_upload_csv_normal_path(self, client):
        table = _upload_csv(client, "unorm", b"id,name\n1,Alice\n2,Bob")
        assert table is not None
        assert len(table) > 0

    def test_upload_excel_normal_path(self, client):
        """Upload a minimal XLSX file."""
        try:
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.append(["id", "val"])
            ws.append([1, "a"])
            buf = io.BytesIO()
            wb.save(buf)
            buf.seek(0)
            fname = _unique_name("xlsx") + ".xlsx"
            files = {"file": (fname, buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
            res = client.post("/api/upload", files=files)
            assert res.status_code == 200
            task = _wait_upload_task(client, res)
            assert task["status"] == "success"
        except ImportError:
            pytest.skip("openpyxl not installed")


class TestTableErrorSanitization:
    """Verify /api/tables/* errors are sanitized."""

    def test_get_nonexistent_table_sanitized(self, client):
        res = client.get("/api/tables/nonexistent_xyz_99999")
        # May return 200 with empty data or error — either way, no internal leak
        if res.status_code >= 400:
            _assert_no_internal_leak(res.json())

    def test_delete_nonexistent_table_sanitized(self, client):
        res = client.delete("/api/tables/nonexistent_xyz_99999")
        # May return 200 (idempotent) or error — either way, no internal leak
        if res.status_code >= 400:
            _assert_no_internal_leak(res.json())

    def test_schema_nonexistent_table_sanitized(self, client):
        res = client.get("/api/tables/nonexistent_xyz_99999/schema")
        # May return 200 with empty or error — either way, no internal leak
        if res.status_code >= 400:
            _assert_no_internal_leak(res.json())

    def test_rename_invalid_name_sanitized(self, client):
        table = _upload_csv(client, "ren", b"id\n1")
        res = client.put(f"/api/tables/{table}/rename", json={"new_name": ""})
        assert res.status_code == 400
        _assert_no_internal_leak(res.json())

    def test_rename_sql_injection_name_sanitized(self, client):
        table = _upload_csv(client, "rinj", b"id\n1")
        res = client.put(f"/api/tables/{table}/rename", json={"new_name": "'; DROP TABLE --"})
        assert res.status_code == 400
        _assert_no_internal_leak(res.json())

    def test_pagination_normal_path(self, client):
        table = _upload_csv(client, "page", b"id\n1\n2\n3\n4\n5")
        res = client.get(f"/api/tables/{table}/data?page=0&page_size=2")
        assert res.status_code == 200
        data = res.json()
        assert len(data["data"]) <= 2
        assert data["totalRows"] == 5

    def test_export_normal_path(self, client):
        table = _upload_csv(client, "exp", b"id,val\n1,a\n2,b")
        res = client.get(f"/api/tables/{table}/export")
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
