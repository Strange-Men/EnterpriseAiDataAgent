"""Tests for Upload and Quality API routes."""

import pytest
import sys
import os
import io
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from database.query_executor import QueryExecutor


@pytest.fixture
def client():
    # Ensure the shared database singleton is fresh and connected.
    # Previous test files (e.g. test_query_executor.py) may have reset it.
    from database.db_manager import DatabaseManager
    from backend.services import data_service

    # Force a fresh singleton and reconnect
    DatabaseManager.reset_instance()
    data_service._db = None
    data_service._executor = None
    conn = data_service.get_db().connect()
    # Verify connection is alive
    conn.execute("SELECT 1").fetchone()

    from backend.main import app
    with TestClient(app) as c:
        yield c


def _unique_name(prefix: str) -> str:
    return f"{prefix}_{int(time.time()*1000)}"


class TestUploadRoute:
    def test_upload_csv(self, client):
        csv_content = b"id,name,value\n1,Alice,100\n2,Bob,200"
        fname = _unique_name("upload") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        res = client.post("/api/upload", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "tableName" in data
        assert data["rowCount"] == 2

    def test_upload_no_file(self, client):
        res = client.post("/api/upload")
        assert res.status_code == 422


class TestQualityRoute:
    def test_quality_nonexistent_table(self, client):
        res = client.get("/api/quality/nonexistent_table_xyz_99999")
        assert res.status_code in [404, 500]

    def test_quality_after_upload(self, client):
        csv_content = b"id,name\n1,Alice\n2,Bob\n3,Charlie"
        fname = _unique_name("qual") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        assert upload_res.status_code == 200
        table_name = upload_res.json()["tableName"]
        res = client.get(f"/api/quality/{table_name}")
        assert res.status_code == 200
        data = res.json()
        assert "overallScore" in data
        assert "fieldHealth" in data


class TestTableRoutes:
    def test_tables_after_upload(self, client):
        csv_content = b"id,val\n1,a\n2,b"
        fname = _unique_name("route") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        assert upload_res.status_code == 200
        table_name = upload_res.json()["tableName"]
        res = client.get(f"/api/tables/{table_name}")
        assert res.status_code == 200
        data = res.json()
        assert "columns" in data
        assert "data" in data

    def test_table_schema(self, client):
        csv_content = b"id,name\n1,test"
        fname = _unique_name("schema") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        assert upload_res.status_code == 200
        table_name = upload_res.json()["tableName"]
        res = client.get(f"/api/tables/{table_name}/schema")
        assert res.status_code == 200
        schema = res.json()
        assert len(schema) == 2

    def test_delete_table(self, client):
        csv_content = b"id\n1\n2"
        fname = _unique_name("del") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        assert upload_res.status_code == 200
        table_name = upload_res.json()["tableName"]
        res = client.delete(f"/api/tables/{table_name}")
        assert res.status_code == 200

    def test_table_pagination(self, client):
        csv_content = b"id\n1\n2\n3\n4\n5"
        fname = _unique_name("page") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        assert upload_res.status_code == 200
        table_name = upload_res.json()["tableName"]
        res = client.get(f"/api/tables/{table_name}/data?page=0&page_size=2")
        assert res.status_code == 200
        data = res.json()
        assert len(data["data"]) <= 2
        assert data["totalRows"] == 5


class TestAIStatusRoute:
    def test_ai_status_endpoint(self, client):
        res = client.get("/api/ai/status")
        assert res.status_code == 200
        data = res.json()
        assert "configured" in data
        assert "connection" in data
        assert "model" in data
        assert "temperature" in data
        assert data["connection"] in ["ok", "error", "not_configured"]

    def test_ai_status_model_is_string(self, client):
        res = client.get("/api/ai/status")
        data = res.json()
        assert isinstance(data["model"], str)
        assert len(data["model"]) > 0


class TestAnalyzeRoute:
    def test_analyze_profile(self, client):
        csv_content = b"id,name,val\n1,Alice,100\n2,Bob,200\n3,Charlie,300"
        fname = _unique_name("analyze") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        assert upload_res.status_code == 200
        table_name = upload_res.json()["tableName"]

        res = client.get(f"/api/analyze/{table_name}/profile")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["table"] == table_name
        profile = data["profile"]
        assert profile["row_count"] == 3
        assert profile["column_count"] == 3
        assert len(profile["columns"]) == 3

    def test_analyze_profile_nonexistent(self, client):
        res = client.get("/api/analyze/nonexistent_xyz_99999/profile")
        assert res.status_code in [404, 500]

    def test_analyze_profile_columns_have_stats(self, client):
        csv_content = b"score,grade\n95,A\n87,B\n92,A"
        fname = _unique_name("prof") + ".csv"
        files = {"file": (fname, io.BytesIO(csv_content), "text/csv")}
        upload_res = client.post("/api/upload", files=files)
        table_name = upload_res.json()["tableName"]

        res = client.get(f"/api/analyze/{table_name}/profile")
        profile = res.json()["profile"]
        # score column should have numeric stats
        score_col = next(c for c in profile["columns"] if c["name"] == "score")
        assert "stats" in score_col
        assert "mean" in score_col["stats"]
        # grade column should have top_values
        grade_col = next(c for c in profile["columns"] if c["name"] == "grade")
        assert "top_values" in grade_col
