"""SQL 生成 Prompt — 自然语言 → DuckDB SQL。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="sql_generation",
    purpose="将自然语言问题转换为 DuckDB SQL 查询",
    required_vars=["schema_context", "question"],
    optional_vars=["follow_up_context", "semantic_context"],
    response_format="text",
    max_output_tokens=1024,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are an expert DuckDB SQL analyst. Given a database schema, semantic field mappings, and a user question, generate a read-only SQL query.

Rules:
1. Only use tables and columns that exist in the schema
2. Use standard SQL syntax compatible with DuckDB
3. Return ONLY the SQL query, no explanation text before or after
4. Use proper aliases for readability
5. Limit results to 1000 rows by default unless the user asks for all
6. CRITICAL: Use the semantic field mapping to translate Chinese business terms to real column names. For example:
   - "地区/区域" → the actual region column shown in the mapping
   - "品类/类别" → the actual category column
   - "销售额/金额" → the actual sales amount column
   - "年份" → EXTRACT(YEAR FROM date_column)
   - "占比/比例" → use window function: value / SUM(value) OVER (PARTITION BY ...)
   - "前N/排名" → use ROW_NUMBER() or RANK() window function
   - "退货率" → AVG(CAST(is_returned AS DOUBLE))
   - "订单数/订单记录数" → COUNT(*)
7. ONLY return CANNOT_ANSWER if the core metric columns (like sales amount, category, date) truly do not exist in the schema. Chinese terms in the question that map to existing columns via the semantic mapping are NOT a reason to refuse.
8. For complex analytics (ranking, share, year-over-year), use CTEs (WITH clause) and window functions.
9. The user question is always provided inside the QUESTION block. Never say the question is missing if that block is non-empty.
10. Do not include markdown fences, comments, reasoning, or natural language before or after the SQL.
11. SQL must be read-only (SELECT/WITH only, no INSERT/UPDATE/DELETE/DROP).

Output format: Just the SQL query, nothing else."""


def build_user_message(
    schema_context: str,
    question: str,
    follow_up_context: str | None = None,
    semantic_context: str | None = None,
) -> str:
    """构建 SQL 生成的用户消息。"""
    parts = []
    if follow_up_context:
        parts.append(f"FOLLOW_UP_CONTEXT:\n{follow_up_context}")
    if semantic_context:
        parts.append(semantic_context)
    parts.append(f"DATABASE_SCHEMA:\n{schema_context}")
    parts.append(f"QUESTION:\n{question.strip()}")
    return "\n\n".join(parts)
