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
    generate_analysis_plan,
    MODEL,
    TEMPERATURE,
)
from backend.services.ai_pipeline import run_ai_query, run_autonomous_analysis, run_autonomous_analysis_stream
from backend.services.guardrails import AnalysisGuardrails

router = APIRouter()


def _parse_guardrails(config: dict | None) -> AnalysisGuardrails | None:
    """将 guardrails dict 解析为 AnalysisGuardrails 对象。"""
    if not config:
        return None
    valid_fields = {
        "max_steps", "max_sql_queries", "max_consecutive_failures",
        "max_total_time_seconds", "max_step_time_seconds",
        "max_recursion_depth", "require_minimum_success",
    }
    filtered = {k: v for k, v in config.items() if k in valid_fields and isinstance(v, int)}
    if not filtered:
        return None
    return AnalysisGuardrails(**filtered)


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

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })


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

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })


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


# ── Analysis Planning ───────────────────────────────────────────

class AnalysisPlanRequest(BaseModel):
    question: str
    table: str
    columns: list[dict]
    sample_rows: list[dict]
    language: str = "en"


@router.post("/ai/plan")
async def ai_analysis_plan(req: AnalysisPlanRequest):
    """Generate a multi-step analysis plan for a complex question."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    return generate_analysis_plan(req.question, req.table, req.columns, req.sample_rows, req.language)


# ── Autonomous Multi-step Analysis ─────────────────────────────

class MultiAnalyzeRequest(BaseModel):
    question: str
    table: str
    columns: list[dict]
    sample_rows: list[dict]
    language: str = "en"
    max_rows: int = 500
    guardrails: dict | None = None


@router.post("/ai/analyze-multi")
async def ai_analyze_multi(req: MultiAnalyzeRequest):
    """Autonomous multi-step analysis: plan → execute → summarize."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    gr = _parse_guardrails(req.guardrails)
    return run_autonomous_analysis(
        req.question, req.table, req.columns, req.sample_rows, req.language, req.max_rows, gr
    )


@router.post("/ai/analyze-multi/stream")
async def ai_analyze_multi_stream(req: MultiAnalyzeRequest):
    """Stream autonomous analysis as SSE: plan → step_start → step_result → summary → done."""
    gr = _parse_guardrails(req.guardrails)
    def event_generator():
        try:
            for event in run_autonomous_analysis_stream(
                req.question, req.table, req.columns, req.sample_rows, req.language, req.max_rows, gr
            ):
                yield _sse_event(event)
        except Exception as e:
            yield _sse_event({"type": "error", "error": str(e)})

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })
