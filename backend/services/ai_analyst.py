"""AI Analyst Service — Single-Agent SQL Intelligence.

所有 prompt 已迁移至 backend/prompts/。
本文件只保留 LLM 调用和业务逻辑。
"""

import json
import time

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
            f"{json.dumps(samples, default=str, ensure_ascii=False)}\n"
        )

    summary = ctx.get("previous_insight_summary", "")
    if summary:
        if len(summary) > 500:
            summary = summary[:500] + "..."
        parts.append(f"Previous Insight Summary:\n{summary}\n")

    return "\n".join(parts)


# ── LLM Call ────────────────────────────────────────────────────

def _call_llm(system: str, user_message: str, max_tokens: int = 1024, language: str = "en") -> str:
    """调用 LLM（同步）。"""
    client = _get_client()
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=TEMPERATURE,
        system=apply_language(system, language),
        messages=[{"role": "user", "content": user_message}],
    )
    for block in response.content:
        if hasattr(block, "text"):
            return block.text
    return str(response.content[0])


def _call_llm_stream(system: str, user_message: str, max_tokens: int = 1024, language: str = "en"):
    """流式调用 LLM，yield 文本块。"""
    client = _get_client()
    with client.messages.stream(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=TEMPERATURE,
        system=apply_language(system, language),
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        for text in stream.text_stream:
            yield text


# ── Public API ──────────────────────────────────────────────────

def generate_sql(question: str, schema_context: str, follow_up_context: str | None = None, language: str = "en") -> dict:
    """从自然语言问题生成 SQL。"""
    start = time.time()
    user_msg = build_sql_user_message(schema_context, question, follow_up_context)
    try:
        sql = _call_llm(SQL_GEN_SYSTEM, user_msg, max_tokens=SQL_GEN_CONTRACT.max_output_tokens, language=language)
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
    language: str = "en",
) -> dict:
    """用业务语言解释查询结果。"""
    start = time.time()
    user_msg = build_explain_user_message(question, sql, results, conversation_history)
    try:
        explanation = _call_llm(EXPLAIN_SYSTEM, user_msg, max_tokens=EXPLAIN_CONTRACT.max_output_tokens, language=language)
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
    language: str = "en",
):
    """流式生成解释。"""
    user_msg = build_explain_user_message(question, sql, results, conversation_history)
    yield from _call_llm_stream(EXPLAIN_SYSTEM, user_msg, max_tokens=EXPLAIN_CONTRACT.max_output_tokens, language=language)


def generate_insights(question: str, results: list[dict], language: str = "en") -> dict:
    """生成结构化洞察。"""
    start = time.time()
    user_msg = build_insights_user_message(question, results)
    try:
        raw = _call_llm(INSIGHTS_SYSTEM, user_msg, max_tokens=INSIGHTS_CONTRACT.max_output_tokens, language=language)
        insights = json.loads(raw)
        return {
            **insights,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except json.JSONDecodeError:
        return {
            "insights": [raw] if 'raw' in dir() else [],
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


def generate_insights_stream(question: str, results: list[dict], language: str = "en"):
    """流式生成洞察。"""
    user_msg = build_insights_user_message(question, results)
    yield from _call_llm_stream(INSIGHTS_SYSTEM, user_msg, max_tokens=INSIGHTS_CONTRACT.max_output_tokens, language=language)


def suggest_charts(results: list[dict], question: str = "", language: str = "en") -> dict:
    """推荐图表类型。"""
    start = time.time()
    if not results:
        return {"recommended_charts": [], "status": "empty"}

    columns = list(results[0].keys()) if results else []
    sample = results[:10]
    user_msg = build_chart_user_message(columns, sample, question)
    try:
        raw = _call_llm(CHART_SYSTEM, user_msg, max_tokens=CHART_CONTRACT.max_output_tokens, language=language)
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
    language: str = "en",
) -> dict:
    """生成数据集的语义理解。"""
    start = time.time()
    cols = columns[:20]
    user_msg = build_semantics_user_message(table, cols, sample_rows[:5])
    try:
        raw = _call_llm(SEMANTICS_SYSTEM, user_msg, max_tokens=SEMANTICS_CONTRACT.max_output_tokens, language=language)
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
    language: str = "en",
) -> dict:
    """基于数据集概览推荐分析问题。"""
    start = time.time()

    profile_summary = build_profile_summary(table, profile)
    semantics_summary = build_semantics_summary(semantics) if semantics else None
    user_msg = build_questions_user_message(profile_summary, semantics_summary)

    try:
        raw = _call_llm(QUESTIONS_SYSTEM, user_msg, max_tokens=QUESTIONS_CONTRACT.max_output_tokens, language=language)
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
    language: str = "en",
) -> dict:
    """为复杂问题生成多步骤分析计划。"""
    start = time.time()
    cols = columns[:20]
    user_msg = build_plan_user_message(question, table, cols, sample_rows[:5])
    try:
        raw = _call_llm(PLAN_SYSTEM, user_msg, max_tokens=PLAN_CONTRACT.max_output_tokens, language=language)
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
