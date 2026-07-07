"""M4-7.2 State Boundary Cleanup — Backend table validation tests.

Covers:
1. AI query with non-existent table returns error (not 500)
2. Autonomous analysis with non-existent table returns error
3. Dangerous SQL still returns 400
4. Normal SELECT still works
5. AI SQL fallback does not use wrong table name
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def _uploaded_table_name(upload_resp):
    data = upload_resp.json()
    assert "task_id" in data
    status_resp = client.get(f"/api/tasks/{data['task_id']}/status")
    assert status_resp.status_code == 200
    task = status_resp.json()
    assert task["status"] == "success"
    return task["table_name"]


class TestTableBoundaryValidation:
    """Test that backend properly validates table existence."""

    def test_ai_query_with_nonexistent_table_returns_error(self):
        """When table doesn't exist, AI query should return error, not fallback to all tables."""
        resp = client.post("/api/ai/query", json={
            "question": "show all data",
            "table": "nonexistent_table_xyz",
            "language": "en",
        })
        # Should return 200 with error in body (not 500)
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "error"
        assert "not found" in data.get("error", "").lower() or "nonexistent" in data.get("error", "").lower()

    def test_ai_query_with_valid_table_works(self):
        """AI query with a valid table should work normally."""
        # First upload a test table
        import io
        csv_content = b"name,age\nAlice,30\nBob,25"
        files = {"file": ("test_boundary.csv", io.BytesIO(csv_content), "text/csv")}
        upload_resp = client.post("/api/upload", files=files)
        assert upload_resp.status_code == 200
        table_name = _uploaded_table_name(upload_resp)

        # Now query with the valid table
        resp = client.post("/api/ai/query", json={
            "question": "show all data",
            "table": table_name,
            "execute": True,
            "language": "en",
        })
        assert resp.status_code == 200
        data = resp.json()
        # Should succeed or at least not fail with "table not found"
        assert "not found" not in data.get("error", "").lower()

        # Cleanup
        client.delete(f"/api/tables/{table_name}")

    def test_analyze_multi_with_nonexistent_table_returns_error(self):
        """Autonomous analysis with non-existent table should return error."""
        resp = client.post("/api/ai/analyze-multi", json={
            "question": "analyze all data",
            "table": "nonexistent_table_xyz",
            "columns": [],
            "sample_rows": [],
            "language": "en",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "error"
        assert "not found" in data.get("error", "").lower()

    def test_dangerous_sql_returns_400(self):
        """Dangerous SQL should still return 400."""
        resp = client.post("/api/query", json={
            "sql": "DROP TABLE test;",
        })
        assert resp.status_code == 400

    def test_normal_select_works(self):
        """Normal SELECT query should work."""
        # First upload a test table
        import io
        csv_content = b"name,value\nTest,100"
        files = {"file": ("test_select.csv", io.BytesIO(csv_content), "text/csv")}
        upload_resp = client.post("/api/upload", files=files)
        assert upload_resp.status_code == 200
        table_name = _uploaded_table_name(upload_resp)

        # Execute SELECT
        resp = client.post("/api/query", json={
            "sql": f'SELECT * FROM "{table_name}" LIMIT 10;',
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"

        # Cleanup
        client.delete(f"/api/tables/{table_name}")

    def test_delete_table_then_query_returns_error(self):
        """After deleting a table, querying it should return an error."""
        import io
        csv_content = b"name,value\nDelete,100"
        files = {"file": ("test_delete.csv", io.BytesIO(csv_content), "text/csv")}
        upload_resp = client.post("/api/upload", files=files)
        assert upload_resp.status_code == 200
        table_name = _uploaded_table_name(upload_resp)

        # Delete the table
        del_resp = client.delete(f"/api/tables/{table_name}")
        assert del_resp.status_code == 200

        # Try to query deleted table via AI
        resp = client.post("/api/ai/query", json={
            "question": "show all data",
            "table": table_name,
            "language": "en",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "error"
