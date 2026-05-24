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

_SUMMARY_SYSTEM = """You are a senior data analyst writing an executive summary.
Given the original question and the results of each analytical step, write a concise executive summary.
Rules:
1. Lead with the answer to the original question
2. Highlight 2-3 key findings from the steps
3. Note any surprising or actionable insights
4. Keep it under 200 words
5. Write in the requested language"""


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
) -> dict:
    """Plan → Execute each step → Executive summary.

    Returns dict with: question, plan, steps (each with sql/data), summary, status, elapsed_ms.
    """
    start = time.time()

    # 1. Generate plan
    plan_result = generate_analysis_plan(question, table, columns, sample_rows, language)
    if plan_result["status"] == "error":
        return {
            "question": question,
            "plan": [],
            "steps": [],
            "summary": "",
            "error": plan_result.get("error", "Planning failed"),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }

    plan = plan_result.get("plan", [])
    if not plan:
        return {
            "question": question,
            "plan": [],
            "steps": [],
            "summary": "No analysis plan could be generated.",
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }

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
        sql_result = generate_sql(step_question, schema_context, fu_ctx, language)

        if sql_result["status"] == "error":
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

    # 4. Generate executive summary
    successful_steps = [s for s in executed_steps if s["status"] == "success" and s["data"]]
    summary = ""
    if successful_steps:
        step_summaries = []
        for s in executed_steps:
            status_label = "✓" if s["status"] == "success" else "✗"
            data_note = ""
            if s["status"] == "success" and s["data"]:
                data_note = f" ({s.get('row_count', len(s['data']))} rows)"
                # Include first few rows as JSON for context
                sample = s["data"][:3]
                if sample:
                    data_note += f"\nSample: {json.dumps(sample, default=str, ensure_ascii=False)[:500]}"
            elif s.get("error"):
                data_note = f" Error: {s['error'][:200]}"
            step_summaries.append(f"[{status_label} Step {s['step']}: {s['purpose']}{data_note}]")

        summary_input = (
            f"Original question: {question}\n\n"
            f"Analysis steps:\n" + "\n".join(step_summaries)
        )
        try:
            summary = _call_llm(_SUMMARY_SYSTEM, summary_input, max_tokens=512, language=language)
        except Exception:
            summary = "Summary generation failed."

    return {
        "question": question,
        "plan": plan,
        "steps": executed_steps,
        "summary": summary,
        "status": "success",
        "elapsed_ms": round((time.time() - start) * 1000, 2),
    }


def run_autonomous_analysis_stream(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "en",
    max_rows: int = 500,
):
    """Streaming variant: yields dict events at each stage.

    Events:
    - {"type": "plan", "plan": [...]}
    - {"type": "step_start", "step": N, "purpose": "..."}
    - {"type": "step_result", "step": N, ...full step dict...}
    - {"type": "summary", "summary": "..."}
    - {"type": "done", "elapsed_ms": ...}
    """
    start = time.time()

    # 1. Generate plan
    plan_result = generate_analysis_plan(question, table, columns, sample_rows, language)
    if plan_result["status"] == "error":
        yield {"type": "error", "error": plan_result.get("error", "Planning failed")}
        return

    plan = plan_result.get("plan", [])
    if not plan:
        yield {"type": "error", "error": "No analysis plan could be generated."}
        return

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
        sql_result = generate_sql(step_question, schema_context, fu_ctx, language)

        if sql_result["status"] == "error":
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

    # 4. Generate executive summary
    summary = ""
    successful_steps = [s for s in executed_steps if s["status"] == "success" and s["data"]]
    if successful_steps:
        step_summaries = []
        for s in executed_steps:
            status_label = "✓" if s["status"] == "success" else "✗"
            data_note = ""
            if s["status"] == "success" and s["data"]:
                data_note = f" ({s.get('row_count', len(s['data']))} rows)"
                sample = s["data"][:3]
                if sample:
                    data_note += f"\nSample: {json.dumps(sample, default=str, ensure_ascii=False)[:500]}"
            elif s.get("error"):
                data_note = f" Error: {s['error'][:200]}"
            step_summaries.append(f"[{status_label} Step {s['step']}: {s['purpose']}{data_note}]")

        summary_input = (
            f"Original question: {question}\n\n"
            f"Analysis steps:\n" + "\n".join(step_summaries)
        )
        try:
            summary = _call_llm(_SUMMARY_SYSTEM, summary_input, max_tokens=512, language=language)
        except Exception:
            summary = "Summary generation failed."

    yield {"type": "summary", "summary": summary}
    yield {"type": "done", "elapsed_ms": round((time.time() - start) * 1000, 2)}
