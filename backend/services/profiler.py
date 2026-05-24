"""Data profiler — statistical profiling of DataFrames."""

import math
import pandas as pd


def build_profile(df: pd.DataFrame, table_name: str) -> dict:
    """Build a statistical profile of a DataFrame."""
    columns = []
    for col in df.columns:
        series = df[col]
        col_profile = {
            "name": str(col),
            "dtype": str(series.dtype),
            "count": int(len(series)),
            "null_count": int(series.isna().sum()),
            "null_pct": round(series.isna().sum() / len(series) * 100, 2) if len(series) > 0 else 0,
            "unique_count": int(series.nunique()),
        }

        if pd.api.types.is_numeric_dtype(series) and not pd.api.types.is_bool_dtype(series):
            col_profile["stats"] = {
                "mean": _safe_float(series.mean()),
                "median": _safe_float(series.median()),
                "std": _safe_float(series.std()),
                "min": _safe_float(series.min()),
                "max": _safe_float(series.max()),
                "q25": _safe_float(series.quantile(0.25)),
                "q75": _safe_float(series.quantile(0.75)),
            }
        else:
            value_counts = series.value_counts().head(5)
            col_profile["top_values"] = [
                {"value": str(v), "count": int(c)}
                for v, c in value_counts.items()
            ]

        columns.append(col_profile)

    total_cells = df.shape[0] * df.shape[1]
    null_cells = int(df.isna().sum().sum())

    return {
        "table": table_name,
        "row_count": len(df),
        "column_count": len(df.columns),
        "total_cells": total_cells,
        "null_cells": null_cells,
        "null_pct": round(null_cells / total_cells * 100, 2) if total_cells > 0 else 0,
        "duplicate_rows": int(df.duplicated().sum()),
        "columns": columns,
    }


def _safe_float(val) -> float:
    """Convert to float, handling NaN/Inf."""
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return 0.0
        return round(f, 4)
    except (TypeError, ValueError):
        return 0.0
