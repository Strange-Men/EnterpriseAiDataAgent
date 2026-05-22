"""Schema Detection Module.

Detects pandas DataFrame schema, maps dtypes to DuckDB types,
generates CREATE TABLE DDL and validates data quality.
"""

import pandas as pd
import numpy as np


# ── Pandas -> DuckDB type mapping ───────────────────────────────

_TYPE_MAP = {
    "int8": "TINYINT",
    "int16": "SMALLINT",
    "int32": "INTEGER",
    "int64": "BIGINT",
    "uint8": "UTINYINT",
    "uint16": "USMALLINT",
    "uint32": "UINTEGER",
    "uint64": "UBIGINT",
    "float16": "REAL",
    "float32": "REAL",
    "float64": "DOUBLE",
    "bool": "BOOLEAN",
    "datetime64[ns]": "TIMESTAMP",
    "timedelta64[ns]": "INTERVAL",
    "object": "VARCHAR",
    "category": "VARCHAR",
}


def _map_dtype(dtype) -> str:
    """Map a single pandas dtype to a DuckDB SQL type."""
    name = str(dtype)
    if name.startswith("datetime64"):
        return "TIMESTAMP"
    if name in _TYPE_MAP:
        return _TYPE_MAP[name]
    # fallback for extension types
    return "VARCHAR"


def detect_schema(df: pd.DataFrame) -> dict:
    """Analyse a DataFrame and return a structured schema description.

    Returns:
        {
            "table_name": str,
            "columns": [
                {
                    "name": str,
                    "pandas_dtype": str,
                    "duckdb_type": str,
                    "nullable": bool,
                    "unique_count": int,
                    "sample_values": list,
                },
                ...
            ],
            "row_count": int,
            "col_count": int,
        }
    """
    columns = []
    for col in df.columns:
        series = df[col]
        col_info = {
            "name": str(col),
            "pandas_dtype": str(series.dtype),
            "duckdb_type": _map_dtype(series.dtype),
            "nullable": bool(series.isna().any()),
            "null_count": int(series.isna().sum()),
            "unique_count": int(series.nunique()),
            "sample_values": _sample_values(series),
        }
        columns.append(col_info)

    return {
        "columns": columns,
        "row_count": len(df),
        "col_count": len(df.columns),
    }


def _sample_values(series: pd.Series, n: int = 3) -> list:
    """Return up to n non-null sample values as plain Python objects."""
    samples = series.dropna().head(n).tolist()
    return [_to_plain(v) for v in samples]


def _to_plain(val):
    """Convert numpy/pandas scalar to a plain Python value for JSON safety."""
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    if isinstance(val, np.bool_):
        return bool(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return str(val)
    return val


def generate_create_table_ddl(table_name: str, df: pd.DataFrame) -> str:
    """Generate a CREATE TABLE IF NOT EXISTS statement from DataFrame schema."""
    schema = detect_schema(df)
    col_defs = []
    for col in schema["columns"]:
        nullable = "" if col["nullable"] else " NOT NULL"
        col_defs.append(f'  "{col["name"]}" {col["duckdb_type"]}{nullable}')
    body = ",\n".join(col_defs)
    return f'CREATE TABLE IF NOT EXISTS "{table_name}" (\n{body}\n);'


def sanitize_table_name(filename: str) -> str:
    """Convert a filename to a safe SQL table name."""
    name = filename.rsplit(".", 1)[0]  # strip extension
    name = name.lower().strip()
    # replace non-alphanumeric with underscore
    cleaned = []
    for ch in name:
        if ch.isalnum() or ch == "_":
            cleaned.append(ch)
        else:
            cleaned.append("_")
    result = "".join(cleaned)
    # ensure it starts with a letter
    if result and result[0].isdigit():
        result = "t_" + result
    return result or "unnamed_table"


def get_data_quality_report(df: pd.DataFrame) -> dict:
    """Generate a data quality summary for display."""
    total_cells = df.shape[0] * df.shape[1]
    null_cells = int(df.isna().sum().sum())

    report = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "total_cells": total_cells,
        "null_cells": null_cells,
        "null_percentage": round(null_cells / total_cells * 100, 2) if total_cells else 0,
        "duplicate_rows": int(df.duplicated().sum()),
        "columns": {},
    }

    for col in df.columns:
        series = df[col]
        report["columns"][str(col)] = {
            "dtype": str(series.dtype),
            "null_count": int(series.isna().sum()),
            "null_pct": round(series.isna().sum() / len(df) * 100, 2) if len(df) else 0,
            "unique_count": int(series.nunique()),
        }

    return report
