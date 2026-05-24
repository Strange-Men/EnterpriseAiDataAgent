"""AI Analyst Service — Single-Agent SQL Intelligence.

Natural language → SQL → Execute → Explain → Insights → Chart suggestions.

Uses Claude API for LLM capabilities. No LangGraph, no Multi-Agent.
"""

import json
import time

from backend.config import (
    ANTHROPIC_API_KEY,
    ANTHROPIC_BASE_URL,
    DEFAULT_LLM_MODEL,
    DEFAULT_TEMPERATURE,
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
    """Build a text description of available tables and columns for the LLM."""
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
    """Build structured previous-analysis context for follow-up queries.

    Token budget: ~220-500 tokens.
    - previous_sql: full text (~50-100 tokens)
    - previous_result_schema: col name + dtype (~20-50 tokens)
    - previous_sample_rows: max 5 rows JSON (~50-150 tokens)
    - previous_insight_summary: truncated to 500 chars (~100-200 tokens)
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


# ── Prompts ─────────────────────────────────────────────────────

SQL_GENERATION_SYSTEM = """You are an expert SQL analyst. Given a database schema and a user question, generate a SQL query.

Rules:
1. Only use tables and columns that exist in the schema
2. Use standard SQL syntax compatible with DuckDB
3. Return ONLY the SQL query, no explanation
4. Use proper aliases for readability
5. Limit results to 1000 rows by default unless the user asks for all
6. If the question cannot be answered with available data, return: -- CANNOT_ANSWER: explain why

Output format: Just the SQL query, nothing else."""

EXPLANATION_SYSTEM = """You are a data analyst explaining query results to a business user.

Given:
- The user's original question
- The SQL query used
- The query results (as JSON)

Provide a clear, concise explanation that:
1. Summarizes what the data shows
2. Highlights key findings and patterns
3. Points out any anomalies or notable values
4. Uses business-friendly language

Keep the explanation under 200 words."""

INSIGHTS_SYSTEM = """You are an AI data analyst generating insights from query results.

Given the query results and the original question, provide:
1. Top 3 key insights from the data
2. Any trends or patterns noticed
3. Potential data quality issues
4. Recommended next analysis steps

Output as JSON:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "trends": ["trend 1"],
  "data_quality_notes": ["note 1"],
  "suggested_next_steps": ["step 1", "step 2"]
}"""

CHART_SUGGESTION_SYSTEM = """You are a data visualization expert. Given query results, suggest the best chart types.

Output as JSON:
{
  "recommended_charts": [
    {
      "type": "bar|line|pie|scatter|table|heatmap",
      "title": "Chart title",
      "x_axis": "column name",
      "y_axis": "column name",
      "reason": "why this chart type"
    }
  ],
  "best_chart_index": 0
}

Consider:
- Data types (numeric, categorical, temporal)
- Number of data points
- Relationships between columns
- The user's original question"""


# ── LLM Call ────────────────────────────────────────────────────

def _call_llm(system: str, user_message: str, max_tokens: int = 1024) -> str:
    """Make a call to the LLM."""
    client = _get_client()
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=TEMPERATURE,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    )
    # Extract text from response, handling different block types
    for block in response.content:
        if hasattr(block, "text"):
            return block.text
    # Fallback: convert first block to string
    return str(response.content[0])


def _call_llm_stream(system: str, user_message: str, max_tokens: int = 1024):
    """Yield text chunks from Anthropic streaming API.

    This is a sync generator suitable for use with FastAPI StreamingResponse.
    """
    client = _get_client()
    with client.messages.stream(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=TEMPERATURE,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        for text in stream.text_stream:
            yield text


# ── Public API ──────────────────────────────────────────────────

def generate_sql(question: str, schema_context: str, follow_up_context: str | None = None) -> dict:
    """Generate SQL from a natural language question."""
    start = time.time()
    parts = []
    if follow_up_context:
        parts.append(follow_up_context)
    parts.append(f"Database schema:\n{schema_context}")
    parts.append(f"User question: {question}")
    user_msg = "\n\n".join(parts)
    try:
        sql = _call_llm(SQL_GENERATION_SYSTEM, user_msg, max_tokens=512)
        sql = sql.strip()
        # Strip markdown code blocks if present
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


def _build_explain_user_msg(
    question: str, sql: str, results: list[dict],
    conversation_history: list[dict] | None = None,
) -> str:
    """Build the user message for explain, optionally including conversation history."""
    truncated = results[:50]
    parts = []
    if conversation_history:
        parts.append("Previous conversation:")
        for turn in conversation_history[-6:]:
            parts.append(f"[{turn['role']}]: {turn['content']}")
        parts.append("")
    parts.append(f"Original question: {question}")
    parts.append(f"SQL query: {sql}")
    parts.append(
        f"Results ({len(results)} rows total, showing first {len(truncated)}):\n"
        f"{json.dumps(truncated, default=str, ensure_ascii=False)}"
    )
    return "\n\n".join(parts)


def explain_results(
    question: str, sql: str, results: list[dict],
    conversation_history: list[dict] | None = None,
) -> dict:
    """Explain query results in natural language."""
    start = time.time()
    user_msg = _build_explain_user_msg(question, sql, results, conversation_history)
    try:
        explanation = _call_llm(EXPLANATION_SYSTEM, user_msg, max_tokens=1024)
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
):
    """Yield text chunks for streaming explanation."""
    user_msg = _build_explain_user_msg(question, sql, results, conversation_history)
    yield from _call_llm_stream(EXPLANATION_SYSTEM, user_msg, max_tokens=1024)


def generate_insights(question: str, results: list[dict]) -> dict:
    """Generate structured insights from query results."""
    start = time.time()
    truncated = results[:50]
    user_msg = (
        f"Question: {question}\n\n"
        f"Results ({len(results)} rows, showing first {len(truncated)}):\n"
        f"{json.dumps(truncated, default=str, ensure_ascii=False)}"
    )
    try:
        raw = _call_llm(INSIGHTS_SYSTEM, user_msg, max_tokens=1024)
        # Parse JSON from response
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


def generate_insights_stream(question: str, results: list[dict]):
    """Yield text chunks for streaming insights (raw JSON text)."""
    truncated = results[:50]
    user_msg = (
        f"Question: {question}\n\n"
        f"Results ({len(results)} rows, showing first {len(truncated)}):\n"
        f"{json.dumps(truncated, default=str, ensure_ascii=False)}"
    )
    yield from _call_llm_stream(INSIGHTS_SYSTEM, user_msg, max_tokens=1024)


def suggest_charts(results: list[dict], question: str = "") -> dict:
    """Suggest appropriate chart types for the data."""
    start = time.time()
    if not results:
        return {"recommended_charts": [], "status": "empty"}

    # Build column info
    columns = list(results[0].keys()) if results else []
    sample = results[:10]

    user_msg = (
        f"Columns: {columns}\n"
        f"Sample data (first {len(sample)} rows):\n"
        f"{json.dumps(sample, default=str, ensure_ascii=False)}\n"
        f"Question: {question}"
    )
    try:
        raw = _call_llm(CHART_SUGGESTION_SYSTEM, user_msg, max_tokens=512)
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
