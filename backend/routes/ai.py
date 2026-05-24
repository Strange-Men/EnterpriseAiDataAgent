"""AI Analysis Routes — thin shell delegating to services.

Endpoints:
- GET  /api/ai/status — AI service health check
- POST /api/ai/query — Generate SQL from natural language, execute, explain
- POST /api/ai/explain — Explain existing query results
- POST /api/ai/insights — Generate insights from results
- POST /api/ai/chart-suggest — Suggest chart types
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.config import ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL
from backend.services.ai_analyst import (
    explain_results,
    generate_insights,
    suggest_charts,
    MODEL,
    TEMPERATURE,
)
from backend.services.ai_pipeline import run_ai_query

router = APIRouter()


@router.get("/ai/status")
async def ai_status():
    """Check AI service configuration and health."""
    has_key = bool(ANTHROPIC_API_KEY)

    connection_ok = False
    try:
        from backend.services.ai_analyst import _get_client
        _get_client()
        if has_key:
            connection_ok = True
    except Exception:
        pass

    return {
        "configured": has_key,
        "connection": "ok" if connection_ok else ("not_configured" if not has_key else "error"),
        "model": MODEL,
        "temperature": TEMPERATURE,
        "base_url": ANTHROPIC_BASE_URL or "default",
    }


class AIQueryRequest(BaseModel):
    question: str
    execute: bool = True
    explain: bool = True
    max_rows: int = 1000


class ExplainRequest(BaseModel):
    question: str
    sql: str
    results: list[dict]


class InsightsRequest(BaseModel):
    question: str
    results: list[dict]


class ChartSuggestRequest(BaseModel):
    results: list[dict]
    question: str = ""


@router.post("/ai/query")
async def ai_query(req: AIQueryRequest):
    """Natural language → SQL → Execute → Explain pipeline."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    return run_ai_query(req.question, req.execute, req.explain, req.max_rows)


@router.post("/ai/explain")
async def ai_explain(req: ExplainRequest):
    """Explain existing query results."""
    result = explain_results(req.question, req.sql, req.results)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Explanation failed"))
    return result


@router.post("/ai/insights")
async def ai_insights(req: InsightsRequest):
    """Generate structured insights from results."""
    result = generate_insights(req.question, req.results)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Insights generation failed"))
    return result


@router.post("/ai/chart-suggest")
async def ai_chart_suggest(req: ChartSuggestRequest):
    """Suggest chart types for data."""
    return suggest_charts(req.results, req.question)
