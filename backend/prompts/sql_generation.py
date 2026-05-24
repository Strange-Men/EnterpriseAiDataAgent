"""SQL 生成 Prompt — 自然语言 → DuckDB SQL。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="sql_generation",
    purpose="将自然语言问题转换为 DuckDB SQL 查询",
    required_vars=["schema_context", "question"],
    optional_vars=["follow_up_context"],
    response_format="text",
    max_output_tokens=512,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are an expert SQL analyst. Given a database schema and a user question, generate a SQL query.

Rules:
1. Only use tables and columns that exist in the schema
2. Use standard SQL syntax compatible with DuckDB
3. Return ONLY the SQL query, no explanation
4. Use proper aliases for readability
5. Limit results to 1000 rows by default unless the user asks for all
6. If the question cannot be answered with available data, return: -- CANNOT_ANSWER: explain why

Output format: Just the SQL query, nothing else."""


def build_user_message(
    schema_context: str,
    question: str,
    follow_up_context: str | None = None,
) -> str:
    """构建 SQL 生成的用户消息。"""
    parts = []
    if follow_up_context:
        parts.append(follow_up_context)
    parts.append(f"Database schema:\n{schema_context}")
    parts.append(f"User question: {question}")
    return "\n\n".join(parts)
