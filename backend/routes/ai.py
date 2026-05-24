"""AI Analysis Routes — thin shell delegating to services.

Endpoints:
- GET  /api/ai/status — AI service health check
- POST /api/ai/query — Generate SQL from natural language, execute, explain
- POST /api/ai/explain — Explain existing query results
- POST /api/ai/insights — Generate insights from results
- POST /api/ai/chart-suggest — Suggest chart types
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from backend.config import ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL
from backend.services.ai_analyst import (
    explain_results,
    explain_results_stream,
    generate_insights,
    generate_insights_stream,
    suggest_charts,
    generate_semantics,
    suggest_questions,
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


class FollowUpContext(BaseModel):
    previous_sql: str | None = None
    previous_result_schema: list[dict] | None = None
    previous_sample_rows: list[dict] | None = None
    previous_insight_summary: str | None = None


class AIQueryRequest(BaseModel):
    question: str
    execute: bool = True
    explain: bool = True
    max_rows: int = 1000
    follow_up_context: FollowUpContext | None = None
    language: str = "en"


class ExplainRequest(BaseModel):
    question: str
    sql: str
    results: list[dict]
    conversation_history: list[dict] | None = None
    language: str = "en"


class InsightsRequest(BaseModel):
    question: str
    results: list[dict]
    language: str = "en"


class ChartSuggestRequest(BaseModel):
    results: list[dict]
    question: str = ""
    language: str = "en"


@router.post("/ai/query")
async def ai_query(req: AIQueryRequest):
    """Natural language → SQL → Execute → Explain pipeline."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    ctx = req.follow_up_context.model_dump() if req.follow_up_context else None
    return run_ai_query(req.question, req.execute, req.explain, req.max_rows, ctx, req.language)


@router.post("/ai/explain")
async def ai_explain(req: ExplainRequest):
    """Explain existing query results."""
    result = explain_results(req.question, req.sql, req.results, req.conversation_history, req.language)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Explanation failed"))
    return result


@router.post("/ai/insights")
async def ai_insights(req: InsightsRequest):
    """Generate structured insights from results."""
    result = generate_insights(req.question, req.results, req.language)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Insights generation failed"))
    return result


@router.post("/ai/chart-suggest")
async def ai_chart_suggest(req: ChartSuggestRequest):
    """Suggest chart types for data."""
    return suggest_charts(req.results, req.question, req.language)


# ── Streaming Endpoints ─────────────────────────────────────────

def _sse_event(data: dict) -> str:
    """Format a dict as an SSE event string."""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/ai/explain/stream")
async def ai_explain_stream(req: ExplainRequest):
    """Stream AI explanation as SSE."""
    def event_generator():
        try:
            for chunk in explain_results_stream(req.question, req.sql, req.results, req.conversation_history, req.language):
                yield _sse_event({"type": "text", "content": chunk})
            yield _sse_event({"type": "done"})
        except Exception as e:
            yield _sse_event({"type": "error", "error": str(e)})

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/ai/insights/stream")
async def ai_insights_stream(req: InsightsRequest):
    """Stream AI insights as SSE (raw JSON text chunks)."""
    def event_generator():
        try:
            for chunk in generate_insights_stream(req.question, req.results, req.language):
                yield _sse_event({"type": "text", "content": chunk})
            yield _sse_event({"type": "done"})
        except Exception as e:
            yield _sse_event({"type": "error", "error": str(e)})

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── Semantic Dataset Understanding ────────────────────────────

class SemanticsRequest(BaseModel):
    table: str
    columns: list[dict]
    sample_rows: list[dict]
    language: str = "en"


@router.post("/ai/semantics")
async def ai_semantics(req: SemanticsRequest):
    """Generate semantic understanding of a dataset."""
    return generate_semantics(req.table, req.columns, req.sample_rows, req.language)


class SuggestQuestionsRequest(BaseModel):
    table: str
    profile: dict
    semantics: dict | None = None
    language: str = "en"


@router.post("/ai/suggest-questions")
async def ai_suggest_questions(req: SuggestQuestionsRequest):
    """Suggest analytical questions for a dataset."""
    return suggest_questions(req.table, req.profile, req.semantics, req.language)
