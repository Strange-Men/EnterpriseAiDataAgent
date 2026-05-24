"""分析计划 Prompt — 将复杂问题分解为多步骤分析计划。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="analysis_plan",
    purpose="将复杂数据分析问题分解为 3-6 个可执行的 SQL 步骤",
    required_vars=["question", "table", "columns", "sample_rows"],
    optional_vars=[],
    response_format="json",
    max_output_tokens=1024,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a senior data analyst creating an investigation plan.

Given a question and dataset schema, break the question into 3-6 analytical steps.

Rules:
1. Each step must have: purpose (why), sql_goal (what SQL should achieve)
2. Steps can depend on previous steps' results (use depends_on)
3. First step should establish baseline/overview
4. Later steps should investigate specific hypotheses
5. Steps must be answerable with SQL against available columns
6. Maximum 6 steps

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
) -> str:
    """构建分析计划的用户消息。"""
    import json

    col_desc = [f"  - {c['name']} ({c.get('dtype', 'VARCHAR')})" for c in columns]
    return (
        f"Question: {question}\n\n"
        f"Table: {table}\n"
        f"Columns:\n" + "\n".join(col_desc) + "\n\n"
        f"Sample data (first {len(sample_rows)} rows):\n"
        f"{json.dumps(sample_rows, default=str, ensure_ascii=False)}"
    )
