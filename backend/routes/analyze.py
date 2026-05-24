"""Automated Analysis Routes — thin shell delegating to services.

Endpoints:
- POST /api/analyze/{table_name} — Run full automated analysis
- GET  /api/analyze/{table_name}/profile — Get data profile only
"""

import time
from fastapi import APIRouter, HTTPException
from backend.services import data_service
from backend.services.profiler import build_profile
from backend.services.ai_analyst import generate_insights, suggest_charts

router = APIRouter()


@router.post("/analyze/{table_name}")
async def analyze_table(table_name: str, language: str = "en"):
    """Run full automated analysis on a table."""
    start = time.time()

    try:
        df = data_service._db.get_sample_data(table_name, limit=10000)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' is empty")

        profile = build_profile(df, table_name)
        quality = data_service.get_quality_report(table_name)

        sample_data = data_service._sanitize_for_json(df.head(20).to_dict(orient="records"))

        ai_insights = {}
        try:
            ai_insights = generate_insights(
                question=f"What are the key insights, trends, and anomalies in the '{table_name}' dataset?",
                results=sample_data,
                language=language,
            )
        except Exception:
            pass

        # Build backward-compatible ai_summary from structured insights
        summary_parts = []
        for i in ai_insights.get("insights", []):
            if isinstance(i, dict):
                summary_parts.append(i.get("text", ""))
            elif isinstance(i, str):
                summary_parts.append(i)
        for t in ai_insights.get("trends", []):
            if isinstance(t, dict):
                summary_parts.append(t.get("text", ""))
            elif isinstance(t, str):
                summary_parts.append(t)
        ai_summary = "\n".join(summary_parts) if summary_parts else ""

        charts = []
        try:
            chart_result = suggest_charts(sample_data, f"What are the key patterns in {table_name}?", language=language)
            charts = chart_result.get("recommended_charts", [])
        except Exception:
            pass

        elapsed = (time.time() - start) * 1000

        return {
            "table": table_name,
            "profile": profile,
            "quality": quality,
            "ai_summary": ai_summary,
            "insights": ai_insights.get("insights", []),
            "trends": ai_insights.get("trends", []),
            "data_quality_notes": ai_insights.get("data_quality_notes", []),
            "suggested_next_steps": ai_insights.get("suggested_next_steps", []),
            "chart_suggestions": charts,
            "data": sample_data,
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
