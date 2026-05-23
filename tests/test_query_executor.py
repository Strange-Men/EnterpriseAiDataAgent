"""Tests for QueryExecutor module."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.query_executor import QueryExecutor
from database.db_manager import DatabaseManager


@pytest.fixture(autouse=True)
def reset_db():
    """Reset DB singleton between tests."""
    DatabaseManager.reset_instance()
    yield
    DatabaseManager.reset_instance()


@pytest.fixture
def executor():
    db = DatabaseManager(":memory:")
    return QueryExecutor(db)


class TestQueryExecutor:
    def test_execute_simple_select(self, executor):
        result = executor.execute("SELECT 1 as val")
        assert result["status"] == "success"
        assert result["columns"] == ["val"]
        assert result["data"] == [{"val": 1}]
        assert result["row_count"] == 1

    def test_execute_empty_sql(self, executor):
        result = executor.execute("")
        assert result["status"] == "error"
        assert "Empty" in result["error"]

    def test_execute_invalid_sql(self, executor):
        result = executor.execute("SELECT * FROM nonexistent_table")
        assert result["status"] == "error"
        assert result["error"] is not None

    def test_execute_with_alias(self, executor):
        result = executor.execute("SELECT 42 AS answer, 'hello' AS greeting")
        assert result["status"] == "success"
        assert result["data"][0]["answer"] == 42
        assert result["data"][0]["greeting"] == "hello"

    def test_explain_select(self, executor):
        result = executor.explain("SELECT 1")
        assert result["status"] == "success"
        assert len(result["plan"]) > 0

    def test_explain_empty_sql(self, executor):
        result = executor.explain("")
        assert result["status"] == "error"

    def test_explain_invalid_sql(self, executor):
        result = executor.explain("SELECT * FROM not_exists")
        assert result["status"] == "error"

    def test_error_result_static(self):
        result = QueryExecutor._error_result("SELECT bad", "test error")
        assert result["status"] == "error"
        assert result["error"] == "test error"
        assert result["columns"] == []


class TestQueryExecutorWithTable:
    def test_create_and_query_table(self, executor):
        # Create a table
        executor.db.execute_query("CREATE TABLE test (id INTEGER, name VARCHAR)")
        executor.db.execute_query("INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob')")

        result = executor.execute("SELECT * FROM test ORDER BY id")
        assert result["status"] == "success"
        assert result["row_count"] == 2
        assert result["data"][0]["name"] == "Alice"

    def test_aggregation(self, executor):
        executor.db.execute_query("CREATE TABLE sales (amount DOUBLE)")
        executor.db.execute_query("INSERT INTO sales VALUES (100), (200), (300)")

        result = executor.execute("SELECT SUM(amount) as total FROM sales")
        assert result["status"] == "success"
        assert result["data"][0]["total"] == 600.0
