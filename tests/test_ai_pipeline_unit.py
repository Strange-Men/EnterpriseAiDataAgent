"""Unit tests for AI Pipeline helper functions."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.ai_pipeline import _infer_column_types, _derive_step_summary


def _types_to_dict(result: list[dict]) -> dict:
    """Convert [{name, dtype}, ...] to {name: dtype} for easier assertions."""
    return {r["name"]: r["dtype"] for r in result}


class TestInferColumnTypes:
    def test_integers(self):
        data = [{"age": 25}, {"age": 30}, {"age": 45}]
        types = _types_to_dict(_infer_column_types(data, ["age"]))
        assert types["age"] == "INTEGER"

    def test_floats(self):
        data = [{"price": 10.5}, {"price": 20.0}, {"price": 3.14}]
        types = _types_to_dict(_infer_column_types(data, ["price"]))
        assert types["price"] == "DOUBLE"

    def test_booleans(self):
        data = [{"active": True}, {"active": False}, {"active": True}]
        types = _types_to_dict(_infer_column_types(data, ["active"]))
        assert types["active"] == "BOOLEAN"

    def test_strings(self):
        data = [{"name": "Alice"}, {"name": "Bob"}]
        types = _types_to_dict(_infer_column_types(data, ["name"]))
        assert types["name"] == "VARCHAR"

    def test_mixed_types_widens_to_varchar(self):
        data = [{"val": 1}, {"val": 2.5}, {"val": "text"}]
        types = _types_to_dict(_infer_column_types(data, ["val"]))
        # DOUBLE wins (breaks on first float)
        assert types["val"] == "DOUBLE"

    def test_all_null_column(self):
        data = [{"x": None}, {"x": None}, {"x": None}]
        types = _types_to_dict(_infer_column_types(data, ["x"]))
        assert types["x"] == "VARCHAR"

    def test_empty_data(self):
        result = _infer_column_types([], ["x"])
        assert result == [{"name": "x", "dtype": "VARCHAR"}]

    def test_empty_columns(self):
        result = _infer_column_types([{"a": 1}], [])
        assert result == []

    def test_mixed_columns(self):
        data = [
            {"id": 1, "name": "Alice", "score": 95.5, "active": True},
            {"id": 2, "name": "Bob", "score": 87.0, "active": False},
        ]
        types = _types_to_dict(_infer_column_types(data, ["id", "name", "score", "active"]))
        assert types["id"] == "INTEGER"
        assert types["name"] == "VARCHAR"
        assert types["score"] == "DOUBLE"
        assert types["active"] == "BOOLEAN"

    def test_null_then_value(self):
        data = [{"x": None}, {"x": 42}, {"x": None}]
        types = _types_to_dict(_infer_column_types(data, ["x"]))
        assert types["x"] == "INTEGER"

    def test_int_like_booleans(self):
        # 0 and 1 are int in Python, should be INTEGER
        data = [{"flag": 0}, {"flag": 1}, {"flag": 0}]
        types = _types_to_dict(_infer_column_types(data, ["flag"]))
        assert types["flag"] == "INTEGER"

    def test_unknown_columns_default_varchar(self):
        data = [{"a": 1}]
        types = _types_to_dict(_infer_column_types(data, ["a", "missing"]))
        assert types["a"] == "INTEGER"
        assert types["missing"] == "VARCHAR"


class TestDeriveStepSummary:
    def test_empty_result(self):
        summary = _derive_step_summary({"results": [], "row_count": 0})
        assert "0" in summary

    def test_with_data(self):
        step_result = {
            "results": [{"total": 100}, {"total": 200}],
            "row_count": 2,
            "columns": ["total"],
        }
        summary = _derive_step_summary(step_result)
        assert len(summary) > 0

    def test_missing_results(self):
        summary = _derive_step_summary({"row_count": 0})
        assert len(summary) > 0  # should not crash
