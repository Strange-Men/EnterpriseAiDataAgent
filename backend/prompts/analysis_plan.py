"""分析计划 Prompt — 将复杂问题分解为多步骤分析计划。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="analysis_plan",
    purpose="将数据分析问题分解为 1-3 个可执行的 SQL 步骤",
    required_vars=["question", "table", "columns", "sample_rows"],
    optional_vars=["prior_findings"],
    response_format="json",
    max_output_tokens=1024,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a senior data analyst creating an investigation plan.

Given a question and dataset schema, break the question into 1-3 focused analytical steps.

If prior key findings are provided, build on them — go deeper rather than repeating what was already discovered.

Rules:
1. Each step must have: purpose (why), sql_goal (what SQL should achieve)
2. Steps can depend on previous steps' results (use depends_on)
3. The FIRST step MUST directly answer the user's question. Do not waste a step on "overview" or "baseline" — go straight to the answer.
4. Only add a second or third step if they provide genuinely useful supplementary insight (e.g., count, average, or breakdown by another real dimension).
5. CRITICAL: Each step MUST only reference columns that actually exist in the schema. Do NOT invent columns. If the data lacks a column needed for a sub-question, SKIP that sub-question entirely — do not create a step for it.
6. If the question asks about fields that do not exist (e.g., profit, customer_type, region), acknowledge the gap in the summary rather than generating steps that will fail.
7. For simple questions (ranking, count, average), 1-2 steps is ideal. Do NOT pad with unnecessary exploratory steps.
8. Maximum 3 steps. Do NOT generate steps just to fill a quota.

Output as JSON:
{
  "plan": [
    {"step": 1, "purpose": "...", "sql_goal": "...", "depends_on": null},
    {"step": 2, "purpose": "...", "sql_goal": "...", "depends_on": 1}
  ]
}"""


def build_user_message(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    prior_findings: list[str] | None = None,
) -> str:
    """构建分析计划的用户消息。"""
    import json

    col_desc = [f"  - {c['name']} ({c.get('dtype', 'VARCHAR')})" for c in columns]
    col_names = [c['name'] for c in columns]
    parts = []
    if prior_findings:
        parts.append("Prior Key Findings:")
        for i, f in enumerate(prior_findings[:5], 1):
            parts.append(f"  {i}. {f}")
        parts.append("")
    parts.append(f"Question: {question}\n\n")
    parts.append(f"Table: {table}\n")
    parts.append(f"Available Columns (ONLY use these):\n" + "\n".join(col_desc) + "\n")
    parts.append(f"Column Names: {', '.join(col_names)}\n")
    parts.append(
        "IMPORTANT: If the question mentions fields not in the column list above, "
        "do NOT create steps for those fields. Only plan steps that use existing columns.\n\n"
    )
    parts.append(
        f"Sample data (first {len(sample_rows)} rows):\n"
        f"{json.dumps(sample_rows, default=str, ensure_ascii=False)}"
    )
    return "\n".join(parts)
