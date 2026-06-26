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
    SYSTEM_PROMPT as SUMMARIZER_SYSTEM,
    build_user_message as build_summarizer_user_message,
)
from backend.runtime.token_budget import WorkflowTokenTracker, get_budget
from backend.services.guardrails import AnalysisGuard, AnalysisGuardrails, GuardrailViolation, DEFAULT_GUARDRAILS
from backend.services.trace import TraceRecorder
from backend.services.schema_semantics import build_semantic_context
from backend.services.sql_templates import try_generate_sql
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
                                   on_retry=None,
                                   semantic_context: str | None = None) -> dict:
    """Generate SQL for a step, with one retry on failure.

    Args:
        on_retry: Optional callback(step_num, attempt, error) called before retry.
                  Used by streaming variant to yield step_retry events.
        semantic_context: Semantic field mapping context.
    """
    sql_result = generate_sql(step_question, schema_context, fu_ctx, language,
                              tracker=tracker, trace=trace,
                              phase=f"step_{step_num}", step=step_num,
                              semantic_context=semantic_context)
    if sql_result["status"] == "error":
        if on_retry:
            on_retry(step_num, 2, sql_result.get("error", "")[:200])
        retry_question = (
            f"{step_question}\n\nPrevious attempt failed with: "
            f"{sql_result.get('error', 'unknown error')[:200]}. Try a different approach."
        )
        sql_result = generate_sql(retry_question, schema_context, fu_ctx, language,
                                  tracker=tracker, trace=trace,
                                  phase=f"step_{step_num}_retry", step=step_num,
                                  semantic_context=semantic_context)
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
            failures.append(f"Step {s['step']}: skipped — {s.get('error', 'data not available')[:80]}")
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
        if s["status"] == "success":
            status_label = "✓"
        elif s["status"].startswith("skipped"):
            status_label = "⊘"
        else:
            status_label = "✗"
        data_note = ""
        if s["status"] == "success" and s["data"]:
            data_note = f" ({s.get('row_count', len(s['data']))} rows)"
            sample = s["data"][:summarizer_budget.max_sample_rows]
            if sample:
                data_note += f"\nSample: {json.dumps(sample, default=str, ensure_ascii=False)[:500]}"
        elif s["status"].startswith("skipped"):
            data_note = f" [Skipped: {s.get('error', 'data not available')[:100]}]"
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
    has_skipped = any(s["status"].startswith("skipped") for s in executed_steps)
    if not successful:
        return "error"
    if has_errors or guardrail_violations:
        return "partial"
    if has_skipped:
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
            return {
                "question": question, "sql": "", "error": f"Table '{table}' not found",
                "status": "error", "columns": [], "data": [], "rowCount": 0,
                "explanation": "", "runtimeMs": 0, "generation_ms": 0,
            }
    else:
        tables = all_tables
    schema_context = build_schema_context(tables, include_semantics=True)

    # 2. Build semantic context for the target table
    semantic_ctx = None
    target_table = tables[0] if tables else None
    if target_table:
        col_names = [c["name"] for c in target_table.get("columns", [])]
        semantic_ctx = build_semantic_context(col_names)

    # 3. Build follow-up context (if provided)
    fu_ctx = build_follow_up_context(follow_up_context) if follow_up_context else None

    # 4. Generate SQL — with retry on empty response
    sql_result = generate_sql(question, schema_context, fu_ctx, language,
                               semantic_context=semantic_ctx)
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
        # Try deterministic SQL fallback before giving up
        if target_table:
            fallback_sql = try_generate_sql(
                question, target_table["name"],
                [c["name"] for c in target_table.get("columns", [])],
            )
            if fallback_sql:
                sql = fallback_sql
            else:
                return {
                    "question": question,
                    "sql": sql,
                    "error": sql.replace("-- CANNOT_ANSWER:", "").strip(),
                    "status": "cannot_answer",
                    "generation_ms": sql_result["elapsed_ms"],
                    "quality_gates": sql_result.get("quality_gates", []),
                }
        else:
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
                         guardrail_violations: list,
                         semantic_context: str | None = None,
                         target_table: str | None = None,
                         target_columns: list[str] | None = None) -> list[dict]:
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
                step_num, purpose, error=violation.message,
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
            step_question, schema_context, fu_ctx, language, step_num, tracker, trace,
            semantic_context=semantic_context)

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
            # Try deterministic fallback
            if target_table and target_columns:
                fallback_sql = try_generate_sql(step_question, target_table, target_columns)
                if fallback_sql:
                    sql = fallback_sql
                else:
                    reason = sql.replace("-- CANNOT_ANSWER:", "").strip() or "当前数据缺少所需字段"
                    guard.record_step_result(success=False)
                    executed_steps.append(_make_step_result(
                        step_num, purpose, sql=sql,
                        error=reason,
                        status="skipped_no_data",
                    ))
                    continue
            else:
                reason = sql.replace("-- CANNOT_ANSWER:", "").strip() or "当前数据缺少所需字段"
                guard.record_step_result(success=False)
                executed_steps.append(_make_step_result(
                    step_num, purpose, sql=sql,
                    error=reason,
                    status="skipped_no_data",
                ))
                continue

        # Handle empty SQL after retry
        if not sql.strip():
            guard.record_step_result(success=False)
            executed_steps.append(_make_step_result(
                step_num, purpose,
                error="当前数据表缺少用于该分析的字段，已跳过此步骤。",
                status="skipped_generation_error",
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

    # Validate table exists
    all_tables = list_tables()
    if not any(t.get("name") == table for t in all_tables):
        return {
            "question": question, "plan": [], "steps": [], "summary": "",
            "error": f"Table '{table}' not found", "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
            "token_budget": {}, "trace": {},
        }

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
    schema_context = build_schema_context(tables, include_semantics=True)

    # Build semantic context for the target table
    semantic_ctx = None
    target_cols = None
    if table:
        target_table_info = next((t for t in tables if t["name"] == table), None)
        if target_table_info:
            target_cols = [c["name"] for c in target_table_info.get("columns", [])]
            semantic_ctx = build_semantic_context(target_cols)

    # 3. Execute each step
    executed_steps = _execute_plan_steps(plan, schema_context, language, max_rows,
                                          guard, tracker, trace, guardrail_violations,
                                          semantic_context=semantic_ctx,
                                          target_table=table,
                                          target_columns=target_cols)

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

    # Validate table exists
    all_tables = list_tables()
    if not any(t.get("name") == table for t in all_tables):
        yield {"type": "error", "error": f"Table '{table}' not found"}
        return

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
    schema_context = build_schema_context(tables, include_semantics=True)

    # Build semantic context for the target table
    semantic_ctx = None
    target_cols = None
    if table:
        target_table_info = next((t for t in tables if t["name"] == table), None)
        if target_table_info:
            target_cols = [c["name"] for c in target_table_info.get("columns", [])]
            semantic_ctx = build_semantic_context(target_cols)

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
            semantic_context=semantic_ctx,
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
            # Try deterministic fallback
            if table and target_cols:
                fallback_sql = try_generate_sql(step_question, table, target_cols)
                if fallback_sql:
                    sql = fallback_sql
                else:
                    reason = sql.replace("-- CANNOT_ANSWER:", "").strip() or "当前数据缺少所需字段"
                    guard.record_step_result(success=False)
                    step_out = _make_step_result(step_num, purpose, sql=sql,
                                                  error=reason,
                                                  status="skipped_no_data")
                    executed_steps.append(step_out)
                    yield {"type": "step_result", **step_out}
                    continue
            else:
                reason = sql.replace("-- CANNOT_ANSWER:", "").strip() or "当前数据缺少所需字段"
                guard.record_step_result(success=False)
                step_out = _make_step_result(step_num, purpose, sql=sql,
                                              error=reason,
                                              status="skipped_no_data")
                executed_steps.append(step_out)
                yield {"type": "step_result", **step_out}
                continue

        # Handle empty SQL after retry
        if not sql.strip():
            guard.record_step_result(success=False)
            step_out = _make_step_result(step_num, purpose,
                                          error="AI 未能生成有效 SQL",
                                          status="skipped_generation_error")
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
