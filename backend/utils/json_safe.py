"""Centralized JSON-safe serialization for all API responses.

Converts numpy/pandas/Decimal/datetime types to native Python types
so that FastAPI's jsonable_encoder never encounters them.

Usage:
    from backend.utils.json_safe import normalize_for_response, json_safe_encoder

    # Normalize a response dict/list before returning from a route:
    return normalize_for_response(result)

    # Or use as a custom JSON encoder for json.dumps():
    json.dumps(data, default=json_safe_encoder)
"""

import math
from datetime import datetime, date, time as dt_time, timedelta
from decimal import Decimal
from uuid import UUID
from enum import Enum

import numpy as np
import pandas as pd


def json_safe_encoder(obj):
    """json.dumps default handler for numpy/pandas/Decimal types.

    Note: json.dumps may convert some numpy types to Python types BEFORE
    calling this handler. We handle both numpy and Python types as a safety net.
    """
    # numpy booleans (also catches if json.dumps doesn't convert)
    if isinstance(obj, np.bool_):
        return bool(obj)
    # numpy datetime64 / timedelta64 — MUST be before np.integer check
    if isinstance(obj, np.datetime64):
        return pd.Timestamp(obj).isoformat()
    if isinstance(obj, np.timedelta64):
        return str(obj)
    # numpy integers
    if isinstance(obj, np.integer):
        return int(obj)
    # numpy floats
    if isinstance(obj, np.floating):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    # numpy arrays
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    # numpy strings
    if isinstance(obj, np.str_):
        return str(obj)
    # pandas Timestamp / NaT
    if isinstance(obj, pd.Timestamp):
        if pd.isna(obj):
            return None
        return obj.isoformat()
    if obj is pd.NaT:
        return None
    # Python datetime/date/time/timedelta
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, dt_time):
        return obj.isoformat()
    if isinstance(obj, timedelta):
        return str(obj)
    # Python float NaN/Inf (json.dumps may convert np.float to Python float first)
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
    # Decimal
    if isinstance(obj, Decimal):
        if obj.is_nan():
            return None
        if obj.is_infinite():
            return None
        # Convert to int if no fractional part, else float
        if obj == obj.to_integral_value():
            return int(obj)
        return float(obj)
    # UUID
    if isinstance(obj, UUID):
        return str(obj)
    # Enum
    if isinstance(obj, Enum):
        return obj.value
    # bytes
    if isinstance(obj, (bytes, bytearray)):
        return obj.decode("utf-8", errors="replace")
    # sets
    if isinstance(obj, set):
        return list(obj)
    # Fallback
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def normalize_for_response(obj):
    """Recursively convert an object tree to JSON-safe native Python types.

    Use this on any dict/list that will be returned from a FastAPI route
    to ensure no numpy/pandas/Decimal types leak into jsonable_encoder.
    """
    # None / primitives
    if obj is None or isinstance(obj, (bool, int, str)):
        return obj

    # numpy boolean
    if isinstance(obj, np.bool_):
        return bool(obj)

    # numpy datetime64 / timedelta64 — MUST be before np.integer check
    # because np.timedelta64 is a subclass of np.integer
    if isinstance(obj, np.datetime64):
        ts = pd.Timestamp(obj)
        return ts.isoformat() if not pd.isna(ts) else None
    if isinstance(obj, np.timedelta64):
        return str(obj)

    # numpy integer
    if isinstance(obj, np.integer):
        return int(obj)

    # numpy float — handle NaN/Inf
    if isinstance(obj, np.floating):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val

    # numpy string
    if isinstance(obj, np.str_):
        return str(obj)

    # Python float — handle NaN/Inf
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj

    # numpy array
    if isinstance(obj, np.ndarray):
        return [normalize_for_response(v) for v in obj.tolist()]

    # pandas Timestamp / NaT
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat() if not pd.isna(obj) else None
    if obj is pd.NaT:
        return None

    # Python datetime / date / time / timedelta
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, dt_time):
        return obj.isoformat()
    if isinstance(obj, timedelta):
        return str(obj)

    # Decimal
    if isinstance(obj, Decimal):
        if obj.is_nan() or obj.is_infinite():
            return None
        if obj == obj.to_integral_value():
            return int(obj)
        return float(obj)

    # UUID
    if isinstance(obj, UUID):
        return str(obj)

    # Enum
    if isinstance(obj, Enum):
        return obj.value

    # bytes
    if isinstance(obj, (bytes, bytearray)):
        return obj.decode("utf-8", errors="replace")

    # set
    if isinstance(obj, set):
        return [normalize_for_response(v) for v in obj]

    # dict
    if isinstance(obj, dict):
        return {str(k): normalize_for_response(v) for k, v in obj.items()}

    # list / tuple
    if isinstance(obj, (list, tuple)):
        return [normalize_for_response(v) for v in obj]

    # Fallback — return as-is and let jsonable_encoder handle it
    return obj
