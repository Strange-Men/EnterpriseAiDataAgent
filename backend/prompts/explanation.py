"""解释 Prompt — 解释查询结果。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="explanation",
    purpose="用业务语言解释 SQL 查询结果",
    required_vars=["question", "sql", "results"],
    optional_vars=["conversation_history"],
    response_format="text",
    max_output_tokens=1024,
    supports_streaming=True,
)

SYSTEM_PROMPT = """You are a data analyst explaining query results to a business user.

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


def build_user_message(
    question: str,
    sql: str,
    results: list[dict],
    conversation_history: list[dict] | None = None,
) -> str:
    """构建解释的用户消息。"""
    import json

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
