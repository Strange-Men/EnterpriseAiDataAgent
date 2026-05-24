"""Automated Analysis Routes — thin shell delegating to services.

Endpoints:
- POST /api/analyze/{table_name} — Run full automated analysis
- GET  /api/analyze/{table_name}/profile — Get data profile only
"""

import time
from fastapi import APIRouter, HTTPException
from backend.services import data_service
from backend.services.profiler import build_profile
from backend.services.ai_analyst import explain_results, suggest_charts

router = APIRouter()


@router.post("/analyze/{table_name}")
async def analyze_table(table_name: str):
    """Run full automated analysis on a table."""
    start = time.time()

    try:
        df = data_service._db.get_sample_data(table_name, limit=10000)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' is empty")

        profile = build_profile(df, table_name)
        quality = data_service.get_quality_report(table_name)

        sample_data = data_service._sanitize_for_json(df.head(20).to_dict(orient="records"))

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
        df = data_service._db.get_sample_data(table_name, limit=10000)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' is empty")
        profile = build_profile(df, table_name)
        return {"table": table_name, "profile": profile, "status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
