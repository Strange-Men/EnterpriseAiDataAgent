"""Automated Analysis Pipeline — Auto-profiling on upload.

Endpoints:
- POST /api/analyze/{table_name} — Run full automated analysis
- GET /api/analyze/{table_name}/profile — Get data profile only
"""

import time
from fastapi import APIRouter, HTTPException
from backend.services.data_service import (
    _executor,
    _db,
    _sanitize_for_json,
    get_quality_report,
)
from backend.services.ai_analyst import explain_results, suggest_charts
from backend.services.data_service import list_tables

router = APIRouter()


@router.post("/analyze/{table_name}")
async def analyze_table(table_name: str):
    """Run full automated analysis on a table.

    Steps:
    1. Profile (statistics, distributions, types)
    2. Quality check (nulls, duplicates, outliers)
    3. Anomaly detection
    4. AI summary & chart suggestions
    """
    start = time.time()

    try:
        # 1. Get sample data
        df = _db.get_sample_data(table_name, limit=10000)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' is empty")

        # 2. Profile
        profile = _build_profile(df, table_name)

        # 3. Quality report
        quality = get_quality_report(table_name)

        # 4. AI-generated summary (if data available)
        sample_data = _sanitize_for_json(df.head(20).to_dict(orient="records"))
        columns = list(df.columns)

        ai_summary = ""
        try:
            summary_result = explain_results(
                question=f"Summarize the key characteristics of the '{table_name}' dataset",
                sql=f"SELECT * FROM {table_name} LIMIT 20",
                results=sample_data,
            )
            ai_summary = summary_result.get("explanation", "")
        except Exception:
            pass

        # 5. Chart suggestions
        charts = []
        try:
            chart_result = suggest_charts(sample_data, f"What are the key patterns in {table_name}?")
            charts = chart_result.get("recommended_charts", [])
        except Exception:
            pass

        elapsed = (time.time() - start) * 1000

        return {
            "table": table_name,
            "profile": profile,
            "quality": quality,
            "ai_summary": ai_summary,
            "chart_suggestions": charts,
            "elapsed_ms": round(elapsed, 2),
            "status": "success",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/{table_name}/profile")
async def get_profile(table_name: str):
    """Get data profile for a table (no AI, fast)."""
    try:
        df = _db.get_sample_data(table_name, limit=10000)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' is empty")
        profile = _build_profile(df, table_name)
        return {"table": table_name, "profile": profile, "status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _build_profile(df, table_name: str) -> dict:
    """Build a statistical profile of a DataFrame."""
    import pandas as pd
    import numpy as np

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

        # Numeric stats (skip boolean type)
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
            # Categorical stats
            value_counts = series.value_counts().head(5)
            col_profile["top_values"] = [
                {"value": str(v), "count": int(c)}
                for v, c in value_counts.items()
            ]

        columns.append(col_profile)

    # Row-level stats
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
    import math
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return 0.0
        return round(f, 4)
    except (TypeError, ValueError):
        return 0.0
