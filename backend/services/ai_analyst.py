"""AI Analyst Service — Single-Agent SQL Intelligence.

所有 prompt 已迁移至 backend/prompts/。
本文件只保留 LLM 调用和业务逻辑。
"""

import json
import time

import anthropic

from backend.config import (
    ANTHROPIC_API_KEY,
    ANTHROPIC_BASE_URL,
    DEFAULT_LLM_MODEL,
    DEFAULT_TEMPERATURE,
)

# Prompt 层导入
from backend.prompts.locale import apply_language
from backend.prompts.sql_generation import (
    CONTRACT as SQL_GEN_CONTRACT,
    SYSTEM_PROMPT as SQL_GEN_SYSTEM,
    build_user_message as build_sql_user_message,
)
from backend.prompts.explanation import (
    CONTRACT as EXPLAIN_CONTRACT,
    SYSTEM_PROMPT as EXPLAIN_SYSTEM,
    build_user_message as build_explain_user_message,
)
from backend.prompts.insights import (
    CONTRACT as INSIGHTS_CONTRACT,
    SYSTEM_PROMPT as INSIGHTS_SYSTEM,
    build_user_message as build_insights_user_message,
)
from backend.prompts.chart_suggest import (
    CONTRACT as CHART_CONTRACT,
    SYSTEM_PROMPT as CHART_SYSTEM,
    build_user_message as build_chart_user_message,
)
from backend.prompts.semantics import (
    CONTRACT as SEMANTICS_CONTRACT,
    SYSTEM_PROMPT as SEMANTICS_SYSTEM,
    build_user_message as build_semantics_user_message,
)
from backend.prompts.suggest_questions import (
    CONTRACT as QUESTIONS_CONTRACT,
    SYSTEM_PROMPT as QUESTIONS_SYSTEM,
    build_user_message as build_questions_user_message,
    build_profile_summary,
    build_semantics_summary,
)
from backend.prompts.analysis_plan import (
    CONTRACT as PLAN_CONTRACT,
    SYSTEM_PROMPT as PLAN_SYSTEM,
    build_user_message as build_plan_user_message,
)

# Token Budget 导入
from backend.runtime.token_budget import (
    get_budget,
    estimate_tokens,
    truncate_text,
    WorkflowTokenTracker,
)

# Trace 导入
from backend.services.trace import TraceRecorder


# ── Configuration ────────────────────────────────────────────────

def _get_client():
    """Lazy-init Anthropic client."""
    import anthropic
    return anthropic.Anthropic(
        api_key=ANTHROPIC_API_KEY,
        base_url=ANTHROPIC_BASE_URL,
    )


MODEL = DEFAULT_LLM_MODEL
TEMPERATURE = DEFAULT_TEMPERATURE


# ── Schema Context Builder ──────────────────────────────────────

def build_schema_context(tables: list[dict]) -> str:
    """构建可用表和列的文本描述，供 LLM 使用。"""
    if not tables:
        return "No tables available in the database."

    lines = ["Available tables and columns:\n"]
    for table in tables:
        name = table["name"]
        cols = table.get("columns", [])
        col_descriptions = []
        for col in cols:
            col_type = col.get("type", col.get("dtype", "VARCHAR"))
            col_descriptions.append(f"  - {col['name']} ({col_type})")
        lines.append(f"Table: {name}")
        lines.extend(col_descriptions)
        lines.append("")

    return "\n".join(lines)


def _safe_serialize(obj):
    """安全序列化: datetime→ISO, Decimal→float, bytes→base64。"""
    import decimal
    import datetime
    import base64
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    if isinstance(obj, bytes):
        return base64.b64encode(obj).decode("ascii")
    return str(obj)


def build_follow_up_context(ctx: dict) -> str:
    """构建结构化的前序分析上下文，用于追问查询。

    Token 预算: ~220-500 tokens。
    """
    parts = ["=== PREVIOUS ANALYSIS CONTEXT ===\n"]

    if ctx.get("previous_sql"):
        parts.append(f"Previous SQL:\n{ctx['previous_sql']}\n")

    schema = ctx.get("previous_result_schema", [])
    if schema:
        parts.append("Previous Result Schema:")
        for col in schema:
            parts.append(f"  - {col['name']} ({col['dtype']})")
        parts.append("")

    samples = ctx.get("previous_sample_rows", [])[:5]
    if samples:
        parts.append(
            f"Previous Result Sample (first {len(samples)} rows):\n"
            f"{json.dumps(samples, default=_safe_serialize, ensure_ascii=False)}\n"
        )

    summary = ctx.get("previous_insight_summary", "")
    if summary:
        if len(summary) > 500:
            summary = summary[:500] + "..."
        parts.append(f"Previous Insight Summary:\n{summary}\n")

    return "\n".join(parts)


# ── LLM Call ────────────────────────────────────────────────────

_TRANSIENT_ERRORS = (
    anthropic.RateLimitError,
    anthropic.APITimeoutError,
    anthropic.APIConnectionError,
    anthropic.InternalServerError,
)

MAX_RETRIES = 2
RETRY_DELAYS = [1, 3]  # exponential backoff in seconds


def _call_llm(
    system: str,
    user_message: str,
    max_tokens: int = 1024,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    operation: str = "unknown",
    trace: TraceRecorder | None = None,
    phase: str = "unknown",
    prompt_name: str = "unknown",
    step: int | None = None,
) -> str:
    """调用 LLM（同步）。支持 budget enforcement、token tracking 和 trace。"""
    input_tokens = estimate_tokens(user_message)

    # Budget enforcement: 如果 tracker 存在且预算不足，拒绝调用
    if tracker and not tracker.can_proceed(input_tokens, max_tokens):
        tracker.record_budget_exceeded(operation)
        raise RuntimeError(f"Token budget exceeded for {operation} (need ~{input_tokens + max_tokens}, have {tracker.remaining})")

    # 输入 token 上限检查
    budget = get_budget(operation)
    if input_tokens > budget.max_input_tokens:
        user_message = truncate_text(user_message, budget.max_input_tokens)

    start = time.time()
    client = _get_client()
    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=max_tokens,
                temperature=TEMPERATURE,
                system=apply_language(system, language),
                messages=[{"role": "user", "content": user_message}],
            )

            # 提取输出文本 — concatenate ALL text blocks
            text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    text += block.text
            if not text:
                text = str(response.content[0])

            elapsed = (time.time() - start) * 1000

            # 记录到 tracker
            if tracker:
                output_tokens = estimate_tokens(text)
                tracker.record(operation, input_tokens, output_tokens)

            # 记录到 trace
            if trace:
                trace.record_llm_call(
                    operation=operation,
                    phase=phase,
                    prompt_name=prompt_name,
                    input_text=user_message,
                    output_text=text,
                    latency_ms=elapsed,
                    status="success",
                    sql=text if operation == "sql_generation" else None,
                    step=step,
                )

            return text
        except _TRANSIENT_ERRORS as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAYS[attempt])
                continue
            break
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            if trace:
                trace.record_llm_call(
                    operation=operation,
                    phase=phase,
                    prompt_name=prompt_name,
                    input_text=user_message,
                    output_text="",
                    latency_ms=elapsed,
                    status="error",
                    error=str(e),
                    step=step,
                )
            raise

    # All retries exhausted
    elapsed = (time.time() - start) * 1000
    if trace:
        trace.record_llm_call(
            operation=operation,
            phase=phase,
            prompt_name=prompt_name,
            input_text=user_message,
            output_text="",
            latency_ms=elapsed,
            status="error",
            error=f"Retried {MAX_RETRIES}x: {last_error}",
            step=step,
        )
    raise last_error


def _call_llm_stream(
    system: str,
    user_message: str,
    max_tokens: int = 1024,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    operation: str = "unknown",
    trace: TraceRecorder | None = None,
    phase: str = "unknown",
    prompt_name: str = "unknown",
    step: int | None = None,
):
    """流式调用 LLM，yield 文本块。支持 budget enforcement、token tracking 和 trace。"""
    input_tokens = estimate_tokens(user_message)

    # Budget enforcement
    if tracker and not tracker.can_proceed(input_tokens, max_tokens):
        tracker.record_budget_exceeded(operation)
        raise RuntimeError(f"Token budget exceeded for {operation}")

    budget = get_budget(operation)
    if input_tokens > budget.max_input_tokens:
        user_message = truncate_text(user_message, budget.max_input_tokens)

    start = time.time()
    client = _get_client()
    output_text = ""
    last_error = None

    # Retry only on stream establishment (before any chunks yielded)
    for attempt in range(MAX_RETRIES + 1):
        try:
            with client.messages.stream(
                model=MODEL,
                max_tokens=max_tokens,
                temperature=TEMPERATURE,
                system=apply_language(system, language),
                messages=[{"role": "user", "content": user_message}],
            ) as stream:
                for chunk in stream.text_stream:
                    output_text += chunk
                    yield chunk
            break  # success — exit retry loop
        except _TRANSIENT_ERRORS as e:
            last_error = e
            if output_text:
                # Already yielded chunks — can't retry mid-stream
                raise
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAYS[attempt])
                continue
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            if trace:
                trace.record_llm_call(
                    operation=operation,
                    phase=phase,
                    prompt_name=prompt_name,
                    input_text=user_message,
                    output_text=output_text,
                    latency_ms=elapsed,
                    status="error",
                    error=str(e),
                    step=step,
                )
            raise
    else:
        # All retries exhausted without success
        elapsed = (time.time() - start) * 1000
        if trace:
            trace.record_llm_call(
                operation=operation,
                phase=phase,
                prompt_name=prompt_name,
                input_text=user_message,
                output_text="",
                latency_ms=elapsed,
                status="error",
                error=f"Retried {MAX_RETRIES}x: {last_error}",
                step=step,
            )
        raise last_error

    elapsed = (time.time() - start) * 1000

    # 流式完成后记录
    if tracker:
        output_tokens = estimate_tokens(output_text)
        tracker.record(operation, input_tokens, output_tokens)

    # 记录到 trace
    if trace:
        trace.record_llm_call(
            operation=operation,
            phase=phase,
            prompt_name=prompt_name,
            input_text=user_message,
            output_text=output_text,
            latency_ms=elapsed,
            status="success",
            step=step,
        )


# ── Public API ──────────────────────────────────────────────────

def generate_sql(
    question: str,
    schema_context: str,
    follow_up_context: str | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    phase: str = "unknown",
    step: int | None = None,
) -> dict:
    """从自然语言问题生成 SQL。"""
    start = time.time()
    user_msg = build_sql_user_message(schema_context, question, follow_up_context)
    budget = get_budget("sql_generation")
    try:
        sql = _call_llm(
            SQL_GEN_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="sql_generation",
            trace=trace, phase=phase, prompt_name="sql_generation", step=step,
        )
        sql = sql.strip()
        if sql.startswith("```"):
            lines = sql.split("\n")
            sql = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        elapsed = (time.time() - start) * 1000
        return {
            "sql": sql.strip(),
            "model": MODEL,
            "elapsed_ms": round(elapsed, 2),
            "status": "success",
        }
    except Exception as e:
        return {
            "sql": "",
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


def explain_results(
    question: str, sql: str, results: list[dict],
    conversation_history: list[dict] | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """用业务语言解释查询结果。"""
    start = time.time()
    budget = get_budget("explanation")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_explain_user_message(question, sql, truncated_rows, conversation_history)
    try:
        explanation = _call_llm(
            EXPLAIN_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="explanation",
            trace=trace, phase="explain", prompt_name="explanation",
        )
        return {
            "explanation": explanation,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "explanation": "",
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


def explain_results_stream(
    question: str, sql: str, results: list[dict],
    conversation_history: list[dict] | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
):
    """流式生成解释。"""
    budget = get_budget("explanation")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_explain_user_message(question, sql, truncated_rows, conversation_history)
    yield from _call_llm_stream(
        EXPLAIN_SYSTEM, user_msg,
        max_tokens=budget.max_output_tokens,
        language=language,
        tracker=tracker,
        operation="explanation",
        trace=trace, phase="explain", prompt_name="explanation",
    )


def generate_insights(
    question: str, results: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """生成结构化洞察。"""
    start = time.time()
    budget = get_budget("insights")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_insights_user_message(question, truncated_rows)
    try:
        raw = _call_llm(
            INSIGHTS_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="insights",
            trace=trace, phase="insights", prompt_name="insights",
        )
        insights = json.loads(raw)
        return {
            **insights,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except json.JSONDecodeError:
        return {
            "insights": [raw] if 'raw' in locals() else [],
            "trends": [],
            "data_quality_notes": [],
            "suggested_next_steps": [],
            "status": "partial",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


def generate_insights_stream(
    question: str, results: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
):
    """流式生成洞察。"""
    budget = get_budget("insights")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_insights_user_message(question, truncated_rows)
    yield from _call_llm_stream(
        INSIGHTS_SYSTEM, user_msg,
        max_tokens=budget.max_output_tokens,
        language=language,
        tracker=tracker,
        operation="insights",
        trace=trace, phase="insights", prompt_name="insights",
    )


def suggest_charts(
    results: list[dict],
    question: str = "",
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """推荐图表类型。"""
    start = time.time()
    if not results:
        return {"recommended_charts": [], "status": "empty"}

    budget = get_budget("chart_suggest")
    columns = list(results[0].keys()) if results else []
    sample = results[:budget.max_sample_rows]
    user_msg = build_chart_user_message(columns, sample, question)
    try:
        raw = _call_llm(
            CHART_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="chart_suggest",
            trace=trace, phase="chart_suggest", prompt_name="chart_suggest",
        )
        charts = json.loads(raw)
        return {
            **charts,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "recommended_charts": [],
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Semantic Dataset Understanding ────────────────────────────

def generate_semantics(
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """生成数据集的语义理解。"""
    start = time.time()
    budget = get_budget("semantics")
    cols = columns[:20]
    user_msg = build_semantics_user_message(table, cols, sample_rows[:budget.max_sample_rows])
    try:
        raw = _call_llm(
            SEMANTICS_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="semantics",
            trace=trace, phase="semantics", prompt_name="semantics",
        )
        result = json.loads(raw)
        return {
            **result,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except json.JSONDecodeError:
        return {
            "summary": "",
            "columns": [],
            "detected_metrics": [],
            "detected_dimensions": [],
            "suggested_focus": "",
            "status": "partial",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Smart Suggested Questions ─────────────────────────────────

def suggest_questions(
    table: str,
    profile: dict,
    semantics: dict | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """基于数据集概览推荐分析问题。"""
    start = time.time()
    budget = get_budget("suggest_questions")

    profile_summary = build_profile_summary(table, profile)
    semantics_summary = build_semantics_summary(semantics) if semantics else None
    user_msg = build_questions_user_message(profile_summary, semantics_summary)

    try:
        raw = _call_llm(
            QUESTIONS_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="suggest_questions",
            trace=trace, phase="suggest_questions", prompt_name="suggest_questions",
        )
        result = json.loads(raw)
        return {
            **result,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "questions": [],
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Analysis Planning Engine ──────────────────────────────────

def generate_analysis_plan(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    phase: str = "planning",
) -> dict:
    """为复杂问题生成多步骤分析计划。"""
    start = time.time()
    budget = get_budget("analysis_plan")
    cols = columns[:20]
    user_msg = build_plan_user_message(question, table, cols, sample_rows[:budget.max_sample_rows])
    try:
        raw = _call_llm(
            PLAN_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="analysis_plan",
            trace=trace, phase=phase, prompt_name="analysis_plan",
        )
        result = json.loads(raw)
        if "plan" in result:
            result["plan"] = result["plan"][:6]
        return {
            **result,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "plan": [],
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
