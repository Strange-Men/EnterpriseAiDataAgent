"""Regression tests for JSON serialization stability.

Covers the numpy.bool_ serialization bug (API 500) and all edge cases
that could cause jsonable_encoder to fail.
"""

import json
import math
from datetime import datetime, date, time as dt_time, timedelta
from decimal import Decimal
from uuid import UUID

import numpy as np
import pandas as pd
import pytest

from backend.utils.json_safe import normalize_for_response, json_safe_encoder


class TestNormalizeForResponse:
    """Test normalize_for_response handles all non-standard types."""

    # ── numpy booleans (root cause of API 500) ─────────────────

    def test_numpy_bool_true(self):
        result = normalize_for_response(np.bool_(True))
        assert result is True
        assert isinstance(result, bool)

    def test_numpy_bool_false(self):
        result = normalize_for_response(np.bool_(False))
        assert result is False
        assert isinstance(result, bool)

    def test_numpy_bool_in_dict(self):
        data = {"hasMore": np.bool_(False), "active": np.bool_(True)}
        result = normalize_for_response(data)
        assert result == {"hasMore": False, "active": True}
        assert isinstance(result["hasMore"], bool)

    def test_numpy_bool_in_list(self):
        data = [np.bool_(True), np.bool_(False)]
        result = normalize_for_response(data)
        assert result == [True, False]

    # ── numpy integers ──────────────────────────────────────────

    def test_numpy_int64(self):
        result = normalize_for_response(np.int64(42))
        assert result == 42
        assert isinstance(result, int)

    def test_numpy_int32(self):
        result = normalize_for_response(np.int32(42))
        assert result == 42
        assert isinstance(result, int)

    # ── numpy floats ────────────────────────────────────────────

    def test_numpy_float64(self):
        result = normalize_for_response(np.float64(3.14))
        assert result == 3.14
        assert isinstance(result, float)

    def test_numpy_float_nan(self):
        result = normalize_for_response(np.float64(np.nan))
        assert result is None

    def test_numpy_float_inf(self):
        result = normalize_for_response(np.float64(np.inf))
        assert result is None

    def test_numpy_float_neg_inf(self):
        result = normalize_for_response(np.float64(-np.inf))
        assert result is None

    # ── Python float NaN/Inf ────────────────────────────────────

    def test_python_float_nan(self):
        result = normalize_for_response(float("nan"))
        assert result is None

    def test_python_float_inf(self):
        result = normalize_for_response(float("inf"))
        assert result is None

    # ── numpy arrays ────────────────────────────────────────────

    def test_numpy_array(self):
        result = normalize_for_response(np.array([1, 2, 3]))
        assert result == [1, 2, 3]

    def test_numpy_array_bool(self):
        result = normalize_for_response(np.array([True, False]))
        assert result == [True, False]

    # ── numpy strings ───────────────────────────────────────────

    def test_numpy_str(self):
        result = normalize_for_response(np.str_("hello"))
        assert result == "hello"
        assert isinstance(result, str)

    # ── numpy datetime64 ────────────────────────────────────────

    def test_numpy_datetime64(self):
        dt = np.datetime64("2026-05-25T12:00:00")
        result = normalize_for_response(dt)
        assert "2026-05-25" in result
        assert isinstance(result, str)

    # ── numpy timedelta64 ───────────────────────────────────────

    def test_numpy_timedelta64(self):
        td = np.timedelta64(3600, "s")
        result = normalize_for_response(td)
        assert isinstance(result, str)

    # ── pandas Timestamp ────────────────────────────────────────

    def test_pandas_timestamp(self):
        ts = pd.Timestamp("2026-05-25T12:00:00")
        result = normalize_for_response(ts)
        assert "2026-05-25" in result
        assert isinstance(result, str)

    def test_pandas_nat(self):
        result = normalize_for_response(pd.NaT)
        assert result is None

    # ── Python datetime types ───────────────────────────────────

    def test_datetime(self):
        dt = datetime(2026, 5, 25, 12, 0, 0)
        result = normalize_for_response(dt)
        assert "2026-05-25" in result
        assert isinstance(result, str)

    def test_date(self):
        d = date(2026, 5, 25)
        result = normalize_for_response(d)
        assert result == "2026-05-25"

    def test_timedelta(self):
        td = timedelta(hours=1)
        result = normalize_for_response(td)
        assert isinstance(result, str)

    # ── Decimal ─────────────────────────────────────────────────

    def test_decimal(self):
        result = normalize_for_response(Decimal("123.456"))
        assert result == 123.456
        assert isinstance(result, float)

    def test_decimal_integer(self):
        result = normalize_for_response(Decimal("42"))
        assert result == 42
        assert isinstance(result, int)

    def test_decimal_nan(self):
        result = normalize_for_response(Decimal("NaN"))
        assert result is None

    def test_decimal_inf(self):
        result = normalize_for_response(Decimal("Infinity"))
        assert result is None

    # ── UUID ────────────────────────────────────────────────────

    def test_uuid(self):
        u = UUID("12345678-1234-5678-1234-567812345678")
        result = normalize_for_response(u)
        assert result == "12345678-1234-5678-1234-567812345678"
        assert isinstance(result, str)

    # ── Nested structures ───────────────────────────────────────

    def test_nested_dict_with_numpy_types(self):
        data = {
            "hasMore": np.bool_(False),
            "count": np.int64(42),
            "ratio": np.float64(3.14),
            "data": [
                {"id": np.int64(1), "active": np.bool_(True), "score": np.float64(np.nan)},
                {"id": np.int64(2), "active": np.bool_(False), "score": np.float64(0.95)},
            ],
        }
        result = normalize_for_response(data)
        assert result["hasMore"] is False
        assert result["count"] == 42
        assert result["ratio"] == 3.14
        assert result["data"][0]["score"] is None
        assert result["data"][1]["score"] == 0.95
        # Verify JSON serializable
        json.dumps(result)

    def test_deeply_nested(self):
        data = {"a": {"b": [{"c": np.bool_(True), "d": np.int64(99)}]}}
        result = normalize_for_response(data)
        assert result == {"a": {"b": [{"c": True, "d": 99}]}}
        json.dumps(result)

    # ── Primitive passthrough ───────────────────────────────────

    def test_none(self):
        assert normalize_for_response(None) is None

    def test_plain_bool(self):
        assert normalize_for_response(True) is True

    def test_plain_int(self):
        assert normalize_for_response(42) == 42

    def test_plain_str(self):
        assert normalize_for_response("hello") == "hello"

    def test_plain_list(self):
        assert normalize_for_response([1, 2, 3]) == [1, 2, 3]


class TestJsonSafeEncoder:
    """Test json_safe_encoder as json.dumps default handler."""

    def test_numpy_bool_in_json(self):
        data = {"flag": np.bool_(True)}
        result = json.dumps(data, default=json_safe_encoder)
        assert json.loads(result) == {"flag": True}

    def test_numpy_int_in_json(self):
        data = {"count": np.int64(42)}
        result = json.dumps(data, default=json_safe_encoder)
        assert json.loads(result) == {"count": 42}

    def test_numpy_float_nan_in_json(self):
        """json.dumps converts np.float64 to Python float before calling default handler.
        Use normalize_for_response to handle NaN before serialization."""
        data = {"value": np.float64(np.nan)}
        normalized = normalize_for_response(data)
        result = json.dumps(normalized)
        assert json.loads(result) == {"value": None}

    def test_decimal_in_json(self):
        data = {"price": Decimal("123.45")}
        result = json.dumps(data, default=json_safe_encoder)
        assert json.loads(result) == {"price": 123.45}

    def test_datetime_in_json(self):
        data = {"ts": datetime(2026, 5, 25, 12, 0, 0)}
        result = json.dumps(data, default=json_safe_encoder)
        assert "2026-05-25" in json.loads(result)["ts"]

    def test_uuid_in_json(self):
        u = UUID("12345678-1234-5678-1234-567812345678")
        data = {"id": u}
        result = json.dumps(data, default=json_safe_encoder)
        assert json.loads(result) == {"id": "12345678-1234-5678-1234-567812345678"}


class TestSanitizeForJsonBackwardCompat:
    """Verify _sanitize_for_json still works (backward compatibility)."""

    def test_sanitize_delegates_to_normalize(self):
        from backend.services.data_service import _sanitize_for_json
        data = [{"id": np.int64(1), "active": np.bool_(True), "score": np.float64(np.nan)}]
        result = _sanitize_for_json(data)
        assert result[0]["id"] == 1
        assert result[0]["active"] is True
        assert result[0]["score"] is None
        json.dumps(result)
