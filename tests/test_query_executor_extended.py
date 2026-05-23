"""Extended tests for QueryExecutor module."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.query_executor import QueryExecutor
from database.db_manager import DatabaseManager


@pytest.fixture(autouse=True)
def reset_db():
    DatabaseManager.reset_instance()
    yield
    DatabaseManager.reset_instance()


@pytest.fixture
def executor():
    db = DatabaseManager(":memory:")
    return QueryExecutor(db)


class TestQueryExecutorEdgeCases:
    def test_whitespace_only_sql(self, executor):
        result = executor.execute("   \n\t  ")
        assert result["status"] == "error"

    def test_sql_with_leading_trailing_spaces(self, executor):
        result = executor.execute("  SELECT 1 as x  ")
        assert result["status"] == "success"

    def test_select_with_null(self, executor):
        executor.db.execute_query("CREATE TABLE t (val INTEGER)")
        executor.db.execute_query("INSERT INTO t VALUES (NULL)")
        result = executor.execute("SELECT * FROM t")
        assert result["status"] == "success"
        assert result["data"][0]["val"] is None

    def test_multiple_statements(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER)")
        executor.db.execute_query("INSERT INTO t VALUES (1)")
        result = executor.execute("SELECT * FROM t")
        assert result["status"] == "success"
        assert result["row_count"] == 1

    def test_case_insensitive(self, executor):
        result = executor.execute("select 1 as val")
        assert result["status"] == "success"


class TestQueryExecutorPreviewTable:
    def test_preview_basic(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER, name VARCHAR)")
        executor.db.execute_query("INSERT INTO t VALUES (1, 'a'), (2, 'b'), (3, 'c')")
        result = executor.preview_table("t", limit=2)
        assert result["status"] == "success"
        assert result["row_count"] == 2

    def test_preview_empty_table(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER)")
        result = executor.preview_table("t")
        assert result["status"] == "success"
        assert result["row_count"] == 0


class TestQueryExecutorDescribeTable:
    def test_describe_existing_table(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER, name VARCHAR)")
        result = executor.describe_table("t")
        assert result["status"] == "success"
        assert "columns" in result
        assert result["row_count"] == 0

    def test_describe_nonexistent_table(self, executor):
        result = executor.describe_table("nonexistent")
        assert result["status"] == "error"


class TestQueryExecutorExplain:
    def test_explain_with_semicolon(self, executor):
        result = executor.explain("SELECT 1;")
        assert result["status"] == "success"

    def test_explain_complex_query(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER, val DOUBLE)")
        executor.db.execute_query("INSERT INTO t VALUES (1, 1.0), (2, 2.0)")
        result = executor.explain("SELECT id, SUM(val) FROM t GROUP BY id")
        assert result["status"] == "success"
        assert len(result["plan"]) > 0


class TestQueryExecutorWithTable:
    def test_create_insert_select(self, executor):
        executor.db.execute_query("CREATE TABLE users (id INTEGER, name VARCHAR)")
        executor.db.execute_query("INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')")
        result = executor.execute("SELECT * FROM users ORDER BY id")
        assert result["status"] == "success"
        assert result["row_count"] == 3
        assert result["data"][0]["name"] == "Alice"
        assert result["data"][2]["name"] == "Charlie"

    def test_join_query(self, executor):
        executor.db.execute_query("CREATE TABLE a (id INTEGER, val_a VARCHAR)")
        executor.db.execute_query("CREATE TABLE b (id INTEGER, val_b VARCHAR)")
        executor.db.execute_query("INSERT INTO a VALUES (1, 'a'), (2, 'b')")
        executor.db.execute_query("INSERT INTO b VALUES (1, 'x'), (2, 'y')")
        result = executor.execute(
            "SELECT a.val_a, b.val_b FROM a JOIN b ON a.id = b.id ORDER BY a.id"
        )
        assert result["status"] == "success"
        assert result["row_count"] == 2
        assert result["data"][0]["val_a"] == "a"
        assert result["data"][0]["val_b"] == "x"

    def test_subquery(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER, val INTEGER)")
        executor.db.execute_query("INSERT INTO t VALUES (1, 10), (2, 20), (3, 30)")
        result = executor.execute("SELECT * FROM (SELECT id, val * 2 as doubled FROM t) WHERE doubled > 30")
        assert result["status"] == "success"
        assert result["row_count"] == 2

    def test_window_function(self, executor):
        executor.db.execute_query("CREATE TABLE t (id INTEGER, val INTEGER)")
        executor.db.execute_query("INSERT INTO t VALUES (1, 10), (2, 20), (3, 30)")
        result = executor.execute("SELECT id, val, ROW_NUMBER() OVER (ORDER BY val DESC) as rn FROM t")
        assert result["status"] == "success"
        assert result["data"][0]["rn"] == 1
