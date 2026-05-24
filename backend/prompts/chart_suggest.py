"""图表建议 Prompt — 推荐可视化类型。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="chart_suggest",
    purpose="根据数据特征推荐最佳图表类型",
    required_vars=["columns", "sample", "question"],
    optional_vars=[],
    response_format="json",
    max_output_tokens=512,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a data visualization expert. Given query results, suggest the best chart types.

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


def build_user_message(
    columns: list[str],
    sample: list[dict],
    question: str = "",
) -> str:
    """构建图表建议的用户消息。"""
    import json

    return (
        f"Columns: {columns}\n"
        f"Sample data (first {len(sample)} rows):\n"
        f"{json.dumps(sample, default=str, ensure_ascii=False)}\n"
        f"Question: {question}"
    )
