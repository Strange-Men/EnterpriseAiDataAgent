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
    detect_and_interpret_anomalies,
    detect_and_interpret_anomalies_stream,
    evaluate_analysis,
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
    prior_key_findings: list[str] | None = None
    investigation_summary: str | None = None


class AIQueryRequest(BaseModel):
    question: str
    execute: bool = True
    explain: bool = True
    max_rows: int = 1000
    follow_up_context: FollowUpContext | None = None
    language: str = "zh"


class ExplainRequest(BaseModel):
    question: str
    sql: str
    results: list[dict]
    conversation_history: list[dict] | None = None
    language: str = "zh"


class InsightsRequest(BaseModel):
    question: str
    results: list[dict]
    language: str = "zh"
    prior_context: str | None = None


class ChartSuggestRequest(BaseModel):
    results: list[dict]
    question: str = ""
    language: str = "zh"


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
    result = generate_insights(req.question, req.results, req.language, prior_context=req.prior_context)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Insights generation failed"))
    return result


@router.post("/ai/chart-suggest")
async def ai_chart_suggest(req: ChartSuggestRequest):
    """Suggest chart types for data."""
    return suggest_charts(req.results, req.question, req.language)


# ── Anomaly Detection ──────────────────────────────────────────

class AnomalyDetectRequest(BaseModel):
    question: str
    results: list[dict]
    columns: list[str] | None = None
    method: str = "auto"
    language: str = "zh"
    min_deviation_score: float = 1.5
    adaptive: bool = True


@router.post("/ai/anomalies")
async def ai_anomalies(req: AnomalyDetectRequest):
    """Detect and interpret anomalies in query results."""
    result = detect_and_interpret_anomalies(
        req.question, req.results, req.columns, req.method, req.language,
        min_deviation_score=req.min_deviation_score, adaptive=req.adaptive,
    )
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Anomaly detection failed"))
    return result


@router.post("/ai/anomalies/stream")
async def ai_anomalies_stream(req: AnomalyDetectRequest):
    """Stream anomaly detection: statistical results first, then LLM interpretation."""
    def event_generator():
        try:
            for event in detect_and_interpret_anomalies_stream(
                req.question, req.results, req.columns, req.method, req.language,
                min_deviation_score=req.min_deviation_score, adaptive=req.adaptive,
            ):
                yield _sse_event(json.loads(event))
        except Exception as e:
            yield _sse_event({"type": "error", "error": str(e)})

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })


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
            for chunk in generate_insights_stream(req.question, req.results, req.language, prior_context=req.prior_context):
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
    language: str = "zh"


@router.post("/ai/semantics")
async def ai_semantics(req: SemanticsRequest):
    """Generate semantic understanding of a dataset."""
    return generate_semantics(req.table, req.columns, req.sample_rows, req.language)


class SuggestQuestionsRequest(BaseModel):
    table: str
    profile: dict
    semantics: dict | None = None
    language: str = "zh"


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
    language: str = "zh"
    prior_findings: list[str] | None = None


@router.post("/ai/plan")
async def ai_analysis_plan(req: AnalysisPlanRequest):
    """Generate a multi-step analysis plan for a complex question."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    return generate_analysis_plan(req.question, req.table, req.columns, req.sample_rows, req.language, prior_findings=req.prior_findings)


# ── Autonomous Multi-step Analysis ─────────────────────────────

class MultiAnalyzeRequest(BaseModel):
    question: str
    table: str
    columns: list[dict]
    sample_rows: list[dict]
    language: str = "zh"
    max_rows: int = 500
    guardrails: dict | None = None
    prior_findings: list[str] | None = None


@router.post("/ai/analyze-multi")
async def ai_analyze_multi(req: MultiAnalyzeRequest):
    """Autonomous multi-step analysis: plan → execute → summarize."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    gr = _parse_guardrails(req.guardrails)
    return run_autonomous_analysis(
        req.question, req.table, req.columns, req.sample_rows, req.language, req.max_rows, gr,
        prior_findings=req.prior_findings,
    )


@router.post("/ai/analyze-multi/stream")
async def ai_analyze_multi_stream(req: MultiAnalyzeRequest):
    """Stream autonomous analysis as SSE: plan → step_start → step_result → summary → done."""
    gr = _parse_guardrails(req.guardrails)
    def event_generator():
        try:
            for event in run_autonomous_analysis_stream(
                req.question, req.table, req.columns, req.sample_rows, req.language, req.max_rows, gr,
                prior_findings=req.prior_findings,
            ):
                yield _sse_event(event)
        except Exception as e:
            yield _sse_event({"type": "error", "error": str(e)})

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })


# ── Template Adaptation ──────────────────────────────────────────

class AdaptTemplateRequest(BaseModel):
    template_steps: list[dict]
    original_columns: list[dict]
    target_table: str
    target_columns: list[dict]
    language: str = "zh"


@router.post("/ai/adapt-template")
async def ai_adapt_template(req: AdaptTemplateRequest):
    """将分析模板适配到目标数据集。"""
    try:
        from backend.prompts.template_adaptation import CONTRACT, build_user_message
        from backend.prompts.locale import apply_language
        from backend.services.ai_analyst import _call_llm

        system = apply_language(CONTRACT.SYSTEM_PROMPT, req.language)
        user_msg = build_user_message(req.template_steps, req.original_columns, req.target_columns)

        raw = _call_llm(
            system=system,
            user_message=user_msg,
            max_tokens=CONTRACT.max_output_tokens,
            language=req.language,
            operation="template_adaptation",
            phase="adapt",
            prompt_name="template_adaptation",
        )

        import json as _json
        try:
            parsed = _json.loads(raw)
        except _json.JSONDecodeError:
            import re
            match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
            if match:
                parsed = _json.loads(match.group(1))
            else:
                raise ValueError(f"Failed to parse LLM response as JSON: {raw[:200]}")

        return {"adapted_questions": parsed.get("adapted_questions", []), "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Report Generation ───────────────────────────────────────────

class ReportOptions(BaseModel):
    title: str = "Analysis Report"
    include_trace: bool = False
    include_data_samples: bool = True
    language: str = "zh"


class ReportRequest(BaseModel):
    runs: list[dict]
    options: ReportOptions | None = None


@router.post("/ai/generate-report")
async def generate_report(req: ReportRequest):
    """将多个分析运行编译为 Markdown 报告。"""
    from backend.services.report_builder import build_report
    opts = req.options.model_dump() if req.options else {}
    md = build_report(req.runs, opts)
    return {"markdown": md, "status": "success"}


# ── Analysis Comparison ─────────────────────────────────────────

class CompareRequest(BaseModel):
    run_a: dict
    run_b: dict


@router.post("/ai/compare")
async def compare_runs(req: CompareRequest):
    """比较两个分析运行的结构化差异。"""
    from backend.services.diff_engine import diff_runs
    return diff_runs(req.run_a, req.run_b)


# ── Analysis Bundle ─────────────────────────────────────────────

class BundleExportRequest(BaseModel):
    runs: list[dict]
    name: str = "Analysis Bundle"


@router.post("/ai/bundle/export")
async def bundle_export(req: BundleExportRequest):
    """将分析运行打包为可分享的 bundle。"""
    from datetime import datetime
    tables = set()
    total_tokens = 0
    for run in req.runs:
        if run.get("table"):
            tables.add(run["table"])
        trace = run.get("trace") or {}
        total_tokens += trace.get("total_output_tokens", 0)
    return {
        "version": "1.0",
        "name": req.name,
        "created_at": datetime.now().isoformat(),
        "runs": req.runs,
        "metadata": {
            "run_count": len(req.runs),
            "total_tokens": total_tokens,
            "tables": list(tables),
        },
        "status": "success",
    }


class BundleImportRequest(BaseModel):
    bundle: dict


@router.post("/ai/bundle/import")
async def bundle_import(req: BundleImportRequest):
    """验证并导入 bundle。"""
    b = req.bundle
    if not isinstance(b, dict):
        raise HTTPException(status_code=400, detail="Invalid bundle: not a dict")
    if "runs" not in b or not isinstance(b["runs"], list):
        raise HTTPException(status_code=400, detail="Invalid bundle: missing runs")
    if "version" not in b:
        raise HTTPException(status_code=400, detail="Invalid bundle: missing version")
    # Validate each run has required fields
    for i, run in enumerate(b["runs"]):
        if not isinstance(run, dict):
            raise HTTPException(status_code=400, detail=f"Invalid run at index {i}: not a dict")
        if "mode" not in run:
            raise HTTPException(status_code=400, detail=f"Invalid run at index {i}: missing mode")
    return {
        "runs": b["runs"],
        "metadata": b.get("metadata", {}),
        "status": "success",
    }


# ── AI Self-Evaluation ──────────────────────────────────────────

class EvaluateRequest(BaseModel):
    question: str
    sections: list[dict]
    trace: dict | None = None
    language: str = "zh"


@router.post("/ai/evaluate")
async def ai_evaluate(req: EvaluateRequest):
    """AI 对分析结果做自我评估。"""
    result = evaluate_analysis(req.question, req.sections, req.trace, req.language)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("diagnostics", ["Evaluation failed"])[0])
    return result


# ── Scheduled Analysis ──────────────────────────────────────────

class ScheduleCreateRequest(BaseModel):
    name: str
    question: str
    table: str
    columns: list[dict]
    sample_rows: list[dict]
    interval: str = "daily"
    language: str = "zh"


@router.post("/ai/schedule")
async def create_schedule(req: ScheduleCreateRequest):
    """创建定时分析任务。"""
    from backend.services.scheduler import get_manager
    manager = get_manager()
    task_id = manager.add_task(
        name=req.name,
        question=req.question,
        table=req.table,
        columns=req.columns,
        sample_rows=req.sample_rows,
        interval=req.interval,
        language=req.language,
    )
    return {"task_id": task_id, "status": "success"}


@router.get("/ai/schedule")
async def list_schedules():
    """列出所有定时分析任务。"""
    from backend.services.scheduler import get_manager
    manager = get_manager()
    return {"tasks": [t.to_dict() for t in manager.list_tasks()]}


@router.delete("/ai/schedule/{task_id}")
async def delete_schedule(task_id: str):
    """删除定时分析任务。"""
    from backend.services.scheduler import get_manager
    manager = get_manager()
    if not manager.remove_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "success"}


@router.patch("/ai/schedule/{task_id}")
async def toggle_schedule(task_id: str, body: dict):
    """启用/禁用定时分析任务。"""
    from backend.services.scheduler import get_manager
    manager = get_manager()
    enabled = body.get("enabled", True)
    if not manager.set_enabled(task_id, enabled):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "success"}


@router.get("/ai/schedule/{task_id}/results")
async def get_schedule_results(task_id: str):
    """获取定时任务的执行结果。"""
    from backend.services.scheduler import get_manager
    manager = get_manager()
    results = manager.get_results(task_id)
    return {"results": results}
