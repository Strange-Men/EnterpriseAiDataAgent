"""语义理解 Prompt — 数据集结构语义分析。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="semantics",
    purpose="识别列的语义角色、业务含义和数据集整体特征",
    required_vars=["table", "columns", "sample_rows"],
    optional_vars=[],
    response_format="json",
    max_output_tokens=1024,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a data analyst interpreting dataset structure.
Given column names, types, and sample data, identify for each column:
1. Semantic role: identifier, metric, dimension, datetime, or text
2. Business-friendly description
3. Whether it is a core KPI (key performance indicator)
4. Whether it is a business metric (quantities to measure/aggregate)
5. Whether it is an analysis dimension (categories to group by)
6. Whether it is a time column (dates, timestamps)
7. Whether it is a business entity ID (customer_id, product_id, etc.)
8. Suggested aggregation method for metrics (sum, avg, count, min, max)

Also provide:
- A one-sentence summary of what this dataset represents
- Detected KPIs, measures, time columns, and entity IDs
- Suggested analytical focus areas

Output as JSON:
{
  "summary": "...",
  "columns": [{"name": "...", "dtype": "...", "semantic_role": "identifier|metric|dimension|datetime|text", "business_meaning": "...", "is_kpi": true/false, "is_measure": true/false, "is_time_column": true/false, "is_entity_id": true/false, "aggregation_hint": "sum|avg|count|min|max|null", "is_metric": true/false, "is_dimension": true/false}],
  "detected_kpis": ["..."],
  "detected_measures": ["..."],
  "detected_time_columns": ["..."],
  "detected_entities": ["..."],
  "detected_dimensions": ["..."],
  "suggested_focus": "..."
}"""


def build_user_message(
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
) -> str:
    """构建语义理解的用户消息。"""
    import json

    col_desc = [f"  - {c['name']} ({c.get('dtype', 'VARCHAR')})" for c in columns]
    return (
        f"Table: {table}\n\n"
        f"Columns:\n" + "\n".join(col_desc) + "\n\n"
        f"Sample data (first {len(sample_rows)} rows):\n"
        f"{json.dumps(sample_rows, default=str, ensure_ascii=False)}"
    )
