"""AI Pipeline — orchestrates the NL → SQL → Execute → Explain flow."""

from backend.services.ai_analyst import (
    generate_sql,
    explain_results,
    build_schema_context,
    build_follow_up_context,
    generate_analysis_plan,
    _call_llm,
)
from backend.services.data_service import get_readonly_executor, list_tables
from backend.utils.json_safe import normalize_for_response
from backend.prompts.summarizer import (
    CONTRACT as SUMMARIZER_CONTRACT,
    SYSTEM_PROMPT as SUMMARIZER_SYSTEM,
    build_user_message as build_summarizer_user_message,
)
from backend.runtime.token_budget import WorkflowTokenTracker, get_budget
from backend.services.guardrails import AnalysisGuard, AnalysisGuardrails, GuardrailViolation, DEFAULT_GUARDRAILS
from backend.services.trace import TraceRecorder
import json
import time


# ── Shared Helpers ────────────────────────────────────────────────


def _infer_column_types(data: list[dict], columns: list[str]) -> list[dict]:
    """Infer column dtypes from sample data instead of hardcoding VARCHAR.

    Scans up to first 50 non-null values per column for robust type detection.
    """
    if not data or not columns:
        return [{"name": c, "dtype": "VARCHAR"} for c in columns]
    result = []
    for col in columns:
        dtype = "VARCHAR"
        for row in data[:50]:
            val = row.get(col)
            if val is None:
                continue
            if isinstance(val, float):
                dtype = "DOUBLE"
                break
            elif isinstance(val, bool):
                if dtype == "VARCHAR":
                    dtype = "BOOLEAN"
            elif isinstance(val, int):
                if dtype in ("VARCHAR", "BOOLEAN"):
                    dtype = "INTEGER"
        result.append({"name": col, "dtype": dtype})
    return result


def _derive_step_summary(step_result: dict) -> str:
    """Derive a brief insight summary from step execution result data."""
    row_count = step_result.get("row_count", 0)
    columns = step_result.get("columns", [])
    data = step_result.get("data", [])
    purpose = step_result.get("purpose", "")
    parts = [f"Step result: {row_count} rows with columns [{', '.join(columns[:10])}]"]
    if purpose:
        parts.append(f"Purpose: {purpose}")
    if data:
        sample = data[0]
        sample_str = ", ".join(f"{k}={v}" for k, v in list(sample.items())[:5])
        parts.append(f"First row: {sample_str}")
    return "; ".join(parts)


def _make_step_result(step_num: int, purpose: str, sql: str = "",
                      columns: list | None = None, data: list | None = None,
                      row_count: int | None = None, error: str | None = None,
                      status: str = "success") -> dict:
    """Build a normalized step result dict."""
    out = {
        "step": step_num,
        "purpose": purpose,
        "sql": sql,
        "columns": columns or [],
        "data": data or [],
        "status": status,
    }
    if row_count is not None:
        out["row_count"] = row_count
    if error is not None:
        out["error"] = error
    return out


def _check_step_guardrails(guard: AnalysisGuard, step_def: dict,
                           executed_steps: list, trace: TraceRecorder,
                           guardrail_violations: list) -> GuardrailViolation | None:
    """Check guardrails before a step. Returns violation or None."""
    try:
        guard.check_before_step(step_def, executed_steps)
        return None
    except GuardrailViolation as v:
        guardrail_violations.append(f"{v.rule}: {v.message}")
        trace.record_guardrail_violation(v.rule, v.message)
        return v


def _check_step_budget(tracker: WorkflowTokenTracker) -> bool:
    """Returns True if budget allows proceeding."""
    budget = get_budget("sql_generation")
    return tracker.can_proceed(budget.max_input_tokens, budget.max_output_tokens)


def _build_dependency_context(depends_on: int | None, executed_steps: list):
    """Build follow-up context from a dependency step, or None."""
    if depends_on is None:
        return None
    for prev in executed_steps:
        if prev["step"] == depends_on and prev["status"] == "success" and prev["data"]:
            return build_follow_up_context({
                "previous_sql": prev["sql"],
                "previous_result_schema": _infer_column_types(prev["data"], prev["columns"]),
                "previous_sample_rows": prev["data"][:5],
                "previous_insight_summary": _derive_step_summary(prev),
            })
    return None


def _generate_step_sql_with_retry(step_question: str, schema_context: str,
                                   fu_ctx, language: str, step_num: int,
                                   tracker: WorkflowTokenTracker,
                                   trace: TraceRecorder,
                                   on_retry=None) -> dict:
    """Generate SQL for a step, with one retry on failure.

    Args:
        on_retry: Optional callback(step_num, attempt, error) called before retry.
                  Used by streaming variant to yield step_retry events.
    """
    sql_result = generate_sql(step_question, schema_context, fu_ctx, language,
                              tracker=tracker, trace=trace,
                              phase=f"step_{step_num}", step=step_num)
    if sql_result["status"] == "error":
        if on_retry:
            on_retry(step_num, 2, sql_result.get("error", "")[:200])
        retry_question = (
            f"{step_question}\n\nPrevious attempt failed with: "
            f"{sql_result.get('error', 'unknown error')[:200]}. Try a different approach."
        )
        sql_result = generate_sql(retry_question, schema_context, fu_ctx, language,
                                  tracker=tracker, trace=trace,
                                  phase=f"step_{step_num}_retry", step=step_num)
    return sql_result


def _build_diagnostics(executed_steps: list) -> dict | None:
    """Build diagnostic if all steps failed."""
    if not executed_steps:
        return None
    has_success = any(s["status"] == "success" and s["data"] for s in executed_steps)
    if has_success:
        return None
    failures = []
    for s in executed_steps:
        if s.get("error"):
            failures.append(f"Step {s['step']}: {s['error'][:100]}")
        elif s["status"].startswith("skipped"):
            failures.append(f"Step {s['step']}: {s['status']}")
    return {
        "message": f"All {len(executed_steps)} steps failed or were skipped.",
        "failures": failures,
    }


def _build_executive_summary(question: str, executed_steps: list, language: str,
                              tracker: WorkflowTokenTracker,
                              trace: TraceRecorder) -> str:
    """Generate executive summary from executed steps."""
    successful = [s for s in executed_steps if s["status"] == "success" and s["data"]]
    if not successful:
        return ""
    step_summaries = []
    summarizer_budget = get_budget("summarizer")
    for s in executed_steps:
        status_label = "✓" if s["status"] == "success" else "✗"
        data_note = ""
        if s["status"] == "success" and s["data"]:
            data_note = f" ({s.get('row_count', len(s['data']))} rows)"
            sample = s["data"][:summarizer_budget.max_sample_rows]
            if sample:
                data_note += f"\nSample: {json.dumps(sample, default=str, ensure_ascii=False)[:500]}"
        elif s.get("error"):
            data_note = f" Error: {s['error'][:200]}"
        step_summaries.append(f"[{status_label} Step {s['step']}: {s['purpose']}{data_note}]")

    summary_input = build_summarizer_user_message(question, step_summaries)
    try:
        return _call_llm(
            SUMMARIZER_SYSTEM, summary_input,
            max_tokens=summarizer_budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="summarizer",
            trace=trace, phase="summary", prompt_name="summarizer",
        )
    except Exception:
        return "Summary generation failed."


def _determine_overall_status(executed_steps: list, guardrail_violations: list) -> str:
    """Determine overall analysis status based on outcomes."""
    successful = [s for s in executed_steps if s["status"] == "success" and s.get("data")]
    has_errors = any(s["status"] == "error" for s in executed_steps)
    if not successful:
        return "error"
    if has_errors or guardrail_violations:
        return "partial"
    return "success"


# ── Simple NL → SQL → Execute → Explain ──────────────────────────


def run_ai_query(
    question: str,
    execute: bool = True,
    explain: bool = True,
    max_rows: int = 1000,
    follow_up_context: dict | None = None,
    language: str = "zh",
    table: str | None = None,
) -> dict:
    """Natural language → SQL → Execute → Explain pipeline.

    Returns a dict with keys: question, sql, status, columns, data, explanation, etc.
    """
    question = question.strip()
    if not question:
        return {"question": "", "sql": "", "error": "Empty question", "status": "error"}

    # 1. Build schema context — filter to specified table if provided
    all_tables = list_tables()
    if table:
        tables = [t for t in all_tables if t.get("name") == table]
        if not tables:
            # Fallback: use all tables but warn
            tables = all_tables
    else:
        tables = all_tables
    schema_context = build_schema_context(tables)

    # 2. Build follow-up context (if provided)
    fu_ctx = build_follow_up_context(follow_up_context) if follow_up_context else None

    # 3. Generate SQL — with retry on empty response
    sql_result = generate_sql(question, schema_context, fu_ctx, language)
    generation_ms = sql_result.get("elapsed_ms", 0)

    # Retry once if SQL generation succeeded but returned empty SQL
    if sql_result["status"] == "success" and not (sql_result.get("sql") or "").strip():
        retry_question = f"{question}\n\nPlease generate a valid SQL query. Do not return empty."
        sql_result = generate_sql(retry_question, schema_context, fu_ctx, language)
        generation_ms += sql_result.get("elapsed_ms", 0)

    if sql_result["status"] == "error":
        return {
            "question": question,
            "sql": "",
            "error": sql_result.get("error", "Failed to generate SQL"),
            "status": "error",
            "generation_ms": generation_ms,
            "quality_gates": sql_result.get("quality_gates", []),
        }

    sql = sql_result.get("sql") or ""

    # If still empty after retry, return structured empty response error
    if not sql.strip():
        return {
            "question": question,
            "sql": "",
            "error": "AI_EMPTY_RESPONSE",
            "error_detail": "AI did not return a valid SQL query. Please try rephrasing your question.",
            "status": "error",
            "error_code": "AI_EMPTY_RESPONSE",
            "generation_ms": generation_ms,
            "quality_gates": sql_result.get("quality_gates", []),
        }

    # Check if the model determined the question can't be answered
    if sql.startswith("-- CANNOT_ANSWER"):
        return {
            "question": question,
            "sql": sql,
            "error": sql.replace("-- CANNOT_ANSWER:", "").strip(),
            "status": "cannot_answer",
            "generation_ms": sql_result["elapsed_ms"],
            "quality_gates": sql_result.get("quality_gates", []),
        }

    response = {
        "question": question,
        "sql": sql,
        "status": "success",
        "generation_ms": sql_result["elapsed_ms"],
        "quality_gates": sql_result.get("quality_gates", []),
    }

    # 3. Execute SQL (if requested)
    if execute:
        exec_result = get_readonly_executor().execute(sql)
        if exec_result["status"] == "error":
            response["execution_error"] = exec_result["error"]
            response["status"] = "sql_error"
            return response

        data = normalize_for_response(exec_result["data"][:max_rows])
        response["columns"] = exec_result["columns"]
        response["data"] = data
        response["rowCount"] = exec_result["row_count"]
        response["truncated"] = exec_result["row_count"] > max_rows

        # 4. Explain results (if requested and we have data)
        if explain and data:
            explanation = explain_results(question, sql, data, language=language)
            response["explanation"] = explanation.get("explanation", "")
            response["explanation_ms"] = explanation.get("elapsed_ms", 0)

    return response


# ── Autonomous Multi-step Analysis ────────────────────────────────


def _execute_step_sql(sql: str, max_rows: int = 500) -> dict:
    """Execute a single step's SQL and return sanitized results."""
    exec_result = get_readonly_executor().execute(sql)
    if exec_result["status"] == "error":
        return {"columns": [], "data": [], "error": exec_result["error"], "status": "error"}
    data = normalize_for_response(exec_result["data"][:max_rows])
    return {
        "columns": exec_result["columns"],
        "data": data,
        "row_count": exec_result["row_count"],
        "status": "success",
    }


def _execute_plan_steps(plan: list, schema_context: str, language: str,
                         max_rows: int, guard: AnalysisGuard,
                         tracker: WorkflowTokenTracker,
                         trace: TraceRecorder,
                         guardrail_violations: list) -> list[dict]:
    """Execute all plan steps, returning the list of step results.

    Shared by both streaming and non-streaming variants.
    Uses step-level retry on SQL generation failure.
    """
    executed_steps: list[dict] = []
    for step_def in plan:
        step_num = step_def.get("step", 0)
        purpose = step_def.get("purpose", "")
        sql_goal = step_def.get("sql_goal", "")
        depends_on = step_def.get("depends_on")

        # Guardrail check
        violation = _check_step_guardrails(guard, step_def, executed_steps,
                                           trace, guardrail_violations)
        if violation:
            executed_steps.append(_make_step_result(
                step_num, purpose, error=v.message,
                status=f"skipped_{violation.rule}",
            ))
            if violation.rule in ("max_sql_queries", "consecutive_failures", "total_timeout"):
                break
            continue

        # Budget check
        if not _check_step_budget(tracker):
            tracker.record_budget_exceeded("sql_generation")
            executed_steps.append(_make_step_result(
                step_num, purpose, error="Token budget exceeded",
                status="skipped_budget",
            ))
            continue

        # Build follow-up context from dependency
        fu_ctx = _build_dependency_context(depends_on, executed_steps)

        # Generate SQL (with retry on failure)
        step_question = f"{purpose}: {sql_goal}"
        sql_result = _generate_step_sql_with_retry(
            step_question, schema_context, fu_ctx, language, step_num, tracker, trace)

        if sql_result["status"] == "error":
            guard.record_step_result(success=False)
            executed_steps.append(_make_step_result(
                step_num, purpose,
                error=sql_result.get("error", "SQL generation failed"),
                status="error",
            ))
            continue

        sql = sql_result.get("sql") or ""
        if sql.startswith("-- CANNOT_ANSWER"):
            guard.record_step_result(success=False)
            executed_steps.append(_make_step_result(
                step_num, purpose, sql=sql,
                error="Cannot answer this step with available data",
                status="error",
            ))
            continue

        # Handle empty SQL after retry
        if not sql.strip():
            guard.record_step_result(success=False)
            executed_steps.append(_make_step_result(
                step_num, purpose,
                error="AI_EMPTY_RESPONSE",
                status="error",
            ))
            continue

        # Execute SQL
        exec_result = _execute_step_sql(sql, max_rows)
        is_success = exec_result["status"] == "success"
        guard.record_step_result(success=is_success)
        executed_steps.append(_make_step_result(
            step_num, purpose, sql=sql,
            columns=exec_result.get("columns", []),
            data=exec_result.get("data", []),
            row_count=exec_result.get("row_count", 0),
            error=exec_result.get("error"),
            status=exec_result["status"],
        ))

    return executed_steps


def run_autonomous_analysis(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "zh",
    max_rows: int = 500,
    guardrails: AnalysisGuardrails | None = None,
    prior_findings: list[str] | None = None,
) -> dict:
    """Plan → Execute each step → Executive summary.

    集成 Token Budget: WorkflowTokenTracker 控制总 token 消耗。
    集成 Guardrails: AnalysisGuard 控制步数、超时、连续失败等。
    集成 Trace: TraceRecorder 记录每次 LLM 调用。
    Returns dict with: question, plan, steps, summary, status, elapsed_ms, token_budget, guardrails, trace.
    """
    start = time.time()
    tracker = WorkflowTokenTracker(total_budget=25000)
    guard = AnalysisGuard(guardrails or DEFAULT_GUARDRAILS)
    guardrail_violations: list[str] = []
    trace = TraceRecorder(question, table=table, mode="autonomous", language=language)

    # 1. Generate plan
    plan_result = generate_analysis_plan(question, table, columns, sample_rows, language,
                                         tracker=tracker, trace=trace, phase="planning",
                                         prior_findings=prior_findings)
    if plan_result["status"] == "error":
        trace.finish("error")
        return {
            "question": question, "plan": [], "steps": [], "summary": "",
            "error": plan_result.get("error", "Planning failed"), "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
            "token_budget": tracker.to_dict(), "trace": trace.to_dict(),
        }

    plan = plan_result.get("plan", [])
    if not plan:
        trace.finish("error")
        return {
            "question": question, "plan": [], "steps": [],
            "summary": "No analysis plan could be generated.", "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
            "token_budget": tracker.to_dict(), "trace": trace.to_dict(),
        }

    trace.set_plan(plan)

    # 2. Build schema context for SQL generation
    tables = list_tables()
    schema_context = build_schema_context(tables)

    # 3. Execute each step
    executed_steps = _execute_plan_steps(plan, schema_context, language, max_rows,
                                          guard, tracker, trace, guardrail_violations)

    # 4. Check minimum success guardrail
    try:
        guard.check_after_all(executed_steps)
    except GuardrailViolation as v:
        guardrail_violations.append(f"{v.rule}: {v.message}")
        trace.record_guardrail_violation(v.rule, v.message)

    # 4b. Dead-end recovery
    diagnostic = _build_diagnostics(executed_steps)

    # 5. Generate executive summary
    summary = _build_executive_summary(question, executed_steps, language, tracker, trace)

    # Determine actual status
    overall_status = _determine_overall_status(executed_steps, guardrail_violations)
    trace.finish(overall_status)

    return {
        "question": question,
        "plan": plan,
        "steps": executed_steps,
        "summary": summary,
        "status": overall_status,
        "elapsed_ms": round((time.time() - start) * 1000, 2),
        "token_budget": tracker.to_dict(),
        "guardrails": guard.to_dict(),
        "guardrail_violations": guardrail_violations,
        "diagnostic": diagnostic,
        "trace": trace.to_dict(),
    }


def run_autonomous_analysis_stream(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "zh",
    max_rows: int = 500,
    guardrails: AnalysisGuardrails | None = None,
    prior_findings: list[str] | None = None,
):
    """Streaming variant: yields dict events at each stage.

    Events:
    - {"type": "plan", "plan": [...]}
    - {"type": "step_start", "step": N, "purpose": "..."}
    - {"type": "step_result", "step": N, ...full step dict...}
    - {"type": "step_retry", "step": N, "attempt": 2, "error": "..."}
    - {"type": "summary", "summary": "..."}
    - {"type": "done", "elapsed_ms": ..., "token_budget": {...}, "guardrails": {...}, "trace": {...}}
    """
    start = time.time()
    tracker = WorkflowTokenTracker(total_budget=25000)
    guard = AnalysisGuard(guardrails or DEFAULT_GUARDRAILS)
    guardrail_violations: list[str] = []
    trace = TraceRecorder(question, table=table, mode="autonomous", language=language)

    # 1. Generate plan
    plan_result = generate_analysis_plan(question, table, columns, sample_rows, language,
                                         tracker=tracker, trace=trace, phase="planning",
                                         prior_findings=prior_findings)
    if plan_result["status"] == "error":
        trace.finish("error")
        yield {"type": "error", "error": plan_result.get("error", "Planning failed")}
        return

    plan = plan_result.get("plan", [])
    if not plan:
        trace.finish("error")
        yield {"type": "error", "error": "No analysis plan could be generated."}
        return

    trace.set_plan(plan)
    yield {"type": "plan", "plan": plan}

    # 2. Build schema context
    tables = list_tables()
    schema_context = build_schema_context(tables)

    # 3. Execute each step, yielding events
    executed_steps: list[dict] = []
    for step_def in plan:
        step_num = step_def.get("step", 0)
        purpose = step_def.get("purpose", "")
        sql_goal = step_def.get("sql_goal", "")
        depends_on = step_def.get("depends_on")

        yield {"type": "step_start", "step": step_num, "purpose": purpose}

        # Guardrail check
        violation = _check_step_guardrails(guard, step_def, executed_steps,
                                           trace, guardrail_violations)
        if violation:
            step_out = _make_step_result(step_num, purpose, error=violation.message,
                                          status=f"skipped_{violation.rule}")
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            if violation.rule in ("max_sql_queries", "consecutive_failures", "total_timeout"):
                break
            continue

        # Budget check
        if not _check_step_budget(tracker):
            tracker.record_budget_exceeded("sql_generation")
            step_out = _make_step_result(step_num, purpose, error="Token budget exceeded",
                                          status="skipped_budget")
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        # Build follow-up context from dependency
        fu_ctx = _build_dependency_context(depends_on, executed_steps)

        # Generate SQL (with retry on failure)
        step_question = f"{purpose}: {sql_goal}"
        retry_events: list[dict] = []
        sql_result = _generate_step_sql_with_retry(
            step_question, schema_context, fu_ctx, language, step_num, tracker, trace,
            on_retry=lambda s, a, e: retry_events.append({"type": "step_retry", "step": s, "attempt": a, "error": e}),
        )
        for evt in retry_events:
            yield evt

        if sql_result["status"] == "error":
            guard.record_step_result(success=False)
            step_out = _make_step_result(step_num, purpose,
                                          error=sql_result.get("error", "SQL generation failed"),
                                          status="error")
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        sql = sql_result.get("sql") or ""
        if sql.startswith("-- CANNOT_ANSWER"):
            guard.record_step_result(success=False)
            step_out = _make_step_result(step_num, purpose, sql=sql,
                                          error="Cannot answer this step with available data",
                                          status="error")
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        # Handle empty SQL after retry
        if not sql.strip():
            guard.record_step_result(success=False)
            step_out = _make_step_result(step_num, purpose,
                                          error="AI_EMPTY_RESPONSE",
                                          status="error")
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        # Execute SQL
        exec_result = _execute_step_sql(sql, max_rows)
        is_success = exec_result["status"] == "success"
        guard.record_step_result(success=is_success)
        step_out = _make_step_result(step_num, purpose, sql=sql,
                                      columns=exec_result.get("columns", []),
                                      data=exec_result.get("data", []),
                                      row_count=exec_result.get("row_count", 0),
                                      error=exec_result.get("error"),
                                      status=exec_result["status"])
        executed_steps.append(step_out)
        yield {"type": "step_result", **step_out}

    # 4. Check minimum success guardrail
    try:
        guard.check_after_all(executed_steps)
    except GuardrailViolation as v:
        guardrail_violations.append(f"{v.rule}: {v.message}")
        trace.record_guardrail_violation(v.rule, v.message)

    # 4b. Dead-end recovery
    diagnostic = _build_diagnostics(executed_steps)
    if diagnostic:
        yield {"type": "diagnostic", **diagnostic}

    # 5. Generate executive summary
    summary = _build_executive_summary(question, executed_steps, language, tracker, trace)

    # Determine actual status
    overall_status = _determine_overall_status(executed_steps, guardrail_violations)
    trace.finish(overall_status)

    yield {"type": "summary", "summary": summary}
    yield {"type": "done", "elapsed_ms": round((time.time() - start) * 1000, 2),
           "token_budget": tracker.to_dict(), "guardrails": guard.to_dict(),
           "guardrail_violations": guardrail_violations, "trace": trace.to_dict()}
