"""AI Pipeline — orchestrates the NL → SQL → Execute → Explain flow."""

from backend.services.ai_analyst import (
    generate_sql,
    explain_results,
    build_schema_context,
    build_follow_up_context,
    generate_analysis_plan,
    _call_llm,
)
from backend.services.data_service import _executor, _sanitize_for_json, list_tables
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


def run_ai_query(
    question: str,
    execute: bool = True,
    explain: bool = True,
    max_rows: int = 1000,
    follow_up_context: dict | None = None,
    language: str = "en",
) -> dict:
    """Natural language → SQL → Execute → Explain pipeline.

    Returns a dict with keys: question, sql, status, columns, data, explanation, etc.
    """
    question = question.strip()
    if not question:
        return {"question": "", "sql": "", "error": "Empty question", "status": "error"}

    # 1. Build schema context
    tables = list_tables()
    schema_context = build_schema_context(tables)

    # 2. Build follow-up context (if provided)
    fu_ctx = build_follow_up_context(follow_up_context) if follow_up_context else None

    # 3. Generate SQL
    sql_result = generate_sql(question, schema_context, fu_ctx, language)
    if sql_result["status"] == "error":
        return {
            "question": question,
            "sql": "",
            "error": sql_result.get("error", "Failed to generate SQL"),
            "status": "error",
            "generation_ms": sql_result.get("elapsed_ms", 0),
        }

    sql = sql_result["sql"]

    # Check if the model determined the question can't be answered
    if sql.startswith("-- CANNOT_ANSWER"):
        return {
            "question": question,
            "sql": sql,
            "error": sql.replace("-- CANNOT_ANSWER:", "").strip(),
            "status": "cannot_answer",
            "generation_ms": sql_result["elapsed_ms"],
        }

    response = {
        "question": question,
        "sql": sql,
        "status": "success",
        "generation_ms": sql_result["elapsed_ms"],
    }

    # 3. Execute SQL (if requested)
    if execute:
        exec_result = _executor.execute(sql)
        if exec_result["status"] == "error":
            response["execution_error"] = exec_result["error"]
            response["status"] = "sql_error"
            return response

        data = _sanitize_for_json(exec_result["data"][:max_rows])
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


# ── Autonomous Multi-step Analysis ─────────────────────────────────


def _execute_step_sql(sql: str, max_rows: int = 500) -> dict:
    """Execute a single step's SQL and return sanitized results."""
    exec_result = _executor.execute(sql)
    if exec_result["status"] == "error":
        return {"columns": [], "data": [], "error": exec_result["error"], "status": "error"}
    data = _sanitize_for_json(exec_result["data"][:max_rows])
    return {
        "columns": exec_result["columns"],
        "data": data,
        "row_count": exec_result["row_count"],
        "status": "success",
    }


def run_autonomous_analysis(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "en",
    max_rows: int = 500,
    guardrails: AnalysisGuardrails | None = None,
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
    plan_result = generate_analysis_plan(question, table, columns, sample_rows, language, tracker=tracker, trace=trace, phase="planning")
    if plan_result["status"] == "error":
        trace.finish("error")
        return {
            "question": question,
            "plan": [],
            "steps": [],
            "summary": "",
            "error": plan_result.get("error", "Planning failed"),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
            "token_budget": tracker.to_dict(),
            "trace": trace.to_dict(),
        }

    plan = plan_result.get("plan", [])
    if not plan:
        trace.finish("error")
        return {
            "question": question,
            "plan": [],
            "steps": [],
            "summary": "No analysis plan could be generated.",
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
            "token_budget": tracker.to_dict(),
            "trace": trace.to_dict(),
        }

    trace.set_plan(plan)

    # 2. Build schema context for SQL generation
    tables = list_tables()
    schema_context = build_schema_context(tables)

    # 3. Execute each step
    executed_steps: list[dict] = []
    for step_def in plan:
        step_num = step_def.get("step", 0)
        purpose = step_def.get("purpose", "")
        sql_goal = step_def.get("sql_goal", "")
        depends_on = step_def.get("depends_on")

        # Guardrail check: 在每步之前检查限制
        try:
            guard.check_before_step(step_def, executed_steps)
        except GuardrailViolation as v:
            guardrail_violations.append(f"{v.rule}: {v.message}")
            trace.record_guardrail_violation(v.rule, v.message)
            executed_steps.append({
                "step": step_num,
                "purpose": purpose,
                "sql": "",
                "columns": [],
                "data": [],
                "error": v.message,
                "status": f"skipped_{v.rule}",
            })
            if v.rule in ("max_sql_queries", "consecutive_failures", "total_timeout"):
                break  # 严重违规，停止执行
            continue

        # Budget check: 如果 token 已耗尽，跳过剩余步骤
        budget = get_budget("sql_generation")
        if not tracker.can_proceed(budget.max_input_tokens, budget.max_output_tokens):
            tracker.record_budget_exceeded("sql_generation")
            executed_steps.append({
                "step": step_num,
                "purpose": purpose,
                "sql": "",
                "columns": [],
                "data": [],
                "error": "Token budget exceeded",
                "status": "skipped_budget",
            })
            continue

        # Build follow-up context from dependency
        fu_ctx = None
        if depends_on is not None:
            for prev in executed_steps:
                if prev["step"] == depends_on and prev["status"] == "success" and prev["data"]:
                    fu_ctx = build_follow_up_context({
                        "previous_sql": prev["sql"],
                        "previous_result_schema": [
                            {"name": c, "dtype": "VARCHAR"} for c in prev["columns"]
                        ],
                        "previous_sample_rows": prev["data"][:5],
                        "previous_insight_summary": prev.get("purpose", ""),
                    })
                    break

        # Generate SQL for this step
        step_question = f"{purpose}: {sql_goal}"
        sql_result = generate_sql(step_question, schema_context, fu_ctx, language, tracker=tracker, trace=trace, phase=f"step_{step_num}", step=step_num)

        if sql_result["status"] == "error":
            guard.record_step_result(success=False)
            executed_steps.append({
                "step": step_num,
                "purpose": purpose,
                "sql": "",
                "columns": [],
                "data": [],
                "error": sql_result.get("error", "SQL generation failed"),
                "status": "error",
            })
            continue

        sql = sql_result["sql"]
        if sql.startswith("-- CANNOT_ANSWER"):
            guard.record_step_result(success=False)
            executed_steps.append({
                "step": step_num,
                "purpose": purpose,
                "sql": sql,
                "columns": [],
                "data": [],
                "error": "Cannot answer this step with available data",
                "status": "error",
            })
            continue

        # Execute SQL
        exec_result = _execute_step_sql(sql, max_rows)
        is_success = exec_result["status"] == "success"
        guard.record_step_result(success=is_success)
        executed_steps.append({
            "step": step_num,
            "purpose": purpose,
            "sql": sql,
            "columns": exec_result.get("columns", []),
            "data": exec_result.get("data", []),
            "row_count": exec_result.get("row_count", 0),
            "error": exec_result.get("error"),
            "status": exec_result["status"],
        })

    # 4. Check minimum success guardrail
    try:
        guard.check_after_all(executed_steps)
    except GuardrailViolation as v:
        guardrail_violations.append(f"{v.rule}: {v.message}")
        trace.record_guardrail_violation(v.rule, v.message)

    # 5. Generate executive summary
    successful_steps = [s for s in executed_steps if s["status"] == "success" and s["data"]]
    summary = ""
    if successful_steps:
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
            summary = _call_llm(
                SUMMARIZER_SYSTEM, summary_input,
                max_tokens=summarizer_budget.max_output_tokens,
                language=language,
                tracker=tracker,
                operation="summarizer",
                trace=trace, phase="summary", prompt_name="summarizer",
            )
        except Exception:
            summary = "Summary generation failed."

    trace.finish("success")
    return {
        "question": question,
        "plan": plan,
        "steps": executed_steps,
        "summary": summary,
        "status": "success",
        "elapsed_ms": round((time.time() - start) * 1000, 2),
        "token_budget": tracker.to_dict(),
        "guardrails": guard.to_dict(),
        "guardrail_violations": guardrail_violations,
        "trace": trace.to_dict(),
    }


def run_autonomous_analysis_stream(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "en",
    max_rows: int = 500,
    guardrails: AnalysisGuardrails | None = None,
):
    """Streaming variant: yields dict events at each stage.

    集成 Token Budget: 超预算时跳过剩余步骤。
    集成 Guardrails: 超限时跳过或停止。
    集成 Trace: 记录每次 LLM 调用。
    Events:
    - {"type": "plan", "plan": [...]}
    - {"type": "step_start", "step": N, "purpose": "..."}
    - {"type": "step_result", "step": N, ...full step dict...}
    - {"type": "summary", "summary": "..."}
    - {"type": "done", "elapsed_ms": ..., "token_budget": {...}, "guardrails": {...}, "trace": {...}}
    """
    start = time.time()
    tracker = WorkflowTokenTracker(total_budget=25000)
    guard = AnalysisGuard(guardrails or DEFAULT_GUARDRAILS)
    guardrail_violations: list[str] = []
    trace = TraceRecorder(question, table=table, mode="autonomous", language=language)

    # 1. Generate plan
    plan_result = generate_analysis_plan(question, table, columns, sample_rows, language, tracker=tracker, trace=trace, phase="planning")
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
        try:
            guard.check_before_step(step_def, executed_steps)
        except GuardrailViolation as v:
            guardrail_violations.append(f"{v.rule}: {v.message}")
            trace.record_guardrail_violation(v.rule, v.message)
            step_out = {
                "step": step_num, "purpose": purpose, "sql": "",
                "columns": [], "data": [],
                "error": v.message,
                "status": f"skipped_{v.rule}",
            }
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            if v.rule in ("max_sql_queries", "consecutive_failures", "total_timeout"):
                break
            continue

        # Budget check
        budget = get_budget("sql_generation")
        if not tracker.can_proceed(budget.max_input_tokens, budget.max_output_tokens):
            tracker.record_budget_exceeded("sql_generation")
            step_out = {
                "step": step_num, "purpose": purpose, "sql": "",
                "columns": [], "data": [],
                "error": "Token budget exceeded",
                "status": "skipped_budget",
            }
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        # Build follow-up context from dependency
        fu_ctx = None
        if depends_on is not None:
            for prev in executed_steps:
                if prev["step"] == depends_on and prev["status"] == "success" and prev["data"]:
                    fu_ctx = build_follow_up_context({
                        "previous_sql": prev["sql"],
                        "previous_result_schema": [
                            {"name": c, "dtype": "VARCHAR"} for c in prev["columns"]
                        ],
                        "previous_sample_rows": prev["data"][:5],
                        "previous_insight_summary": prev.get("purpose", ""),
                    })
                    break

        # Generate SQL
        step_question = f"{purpose}: {sql_goal}"
        sql_result = generate_sql(step_question, schema_context, fu_ctx, language, tracker=tracker, trace=trace, phase=f"step_{step_num}", step=step_num)

        if sql_result["status"] == "error":
            guard.record_step_result(success=False)
            step_out = {
                "step": step_num, "purpose": purpose, "sql": "",
                "columns": [], "data": [],
                "error": sql_result.get("error", "SQL generation failed"),
                "status": "error",
            }
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        sql = sql_result["sql"]
        if sql.startswith("-- CANNOT_ANSWER"):
            guard.record_step_result(success=False)
            step_out = {
                "step": step_num, "purpose": purpose, "sql": sql,
                "columns": [], "data": [],
                "error": "Cannot answer this step with available data",
                "status": "error",
            }
            executed_steps.append(step_out)
            yield {"type": "step_result", **step_out}
            continue

        # Execute SQL
        exec_result = _execute_step_sql(sql, max_rows)
        is_success = exec_result["status"] == "success"
        guard.record_step_result(success=is_success)
        step_out = {
            "step": step_num, "purpose": purpose, "sql": sql,
            "columns": exec_result.get("columns", []),
            "data": exec_result.get("data", []),
            "row_count": exec_result.get("row_count", 0),
            "error": exec_result.get("error"),
            "status": exec_result["status"],
        }
        executed_steps.append(step_out)
        yield {"type": "step_result", **step_out}

    # 4. Check minimum success guardrail
    try:
        guard.check_after_all(executed_steps)
    except GuardrailViolation as v:
        guardrail_violations.append(f"{v.rule}: {v.message}")
        trace.record_guardrail_violation(v.rule, v.message)

    # 5. Generate executive summary
    summary = ""
    successful_steps = [s for s in executed_steps if s["status"] == "success" and s["data"]]
    if successful_steps:
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
            summary = _call_llm(
                SUMMARIZER_SYSTEM, summary_input,
                max_tokens=summarizer_budget.max_output_tokens,
                language=language,
                tracker=tracker,
                operation="summarizer",
                trace=trace, phase="summary", prompt_name="summarizer",
            )
        except Exception:
            summary = "Summary generation failed."

    trace.finish("success")
    yield {"type": "summary", "summary": summary}
    yield {"type": "done", "elapsed_ms": round((time.time() - start) * 1000, 2), "token_budget": tracker.to_dict(), "guardrails": guard.to_dict(), "guardrail_violations": guardrail_violations, "trace": trace.to_dict()}
