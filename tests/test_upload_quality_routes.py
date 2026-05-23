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
    # Reconnect the shared database singleton (previous tests may have reset it)
    from database.db_manager import DatabaseManager
    from backend.services import data_service
    # If singleton was reset, recreate the module-level references
    if DatabaseManager._instance is None:
        data_service._db = DatabaseManager()
        data_service._executor = QueryExecutor(data_service._db)
    else:
        data_service._db.connect()
    from backend.main import app
    return TestClient(app)


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
