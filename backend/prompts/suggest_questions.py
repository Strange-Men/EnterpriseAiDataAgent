"""推荐问题 Prompt — 基于数据集推荐分析问题。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="suggest_questions",
    purpose="根据数据集概览和语义理解推荐分析问题",
    required_vars=["table", "profile_summary"],
    optional_vars=["semantics_summary"],
    response_format="json",
    max_output_tokens=512,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a data analyst suggesting questions to explore a dataset.
Given the dataset profile and optional semantic understanding, suggest 5 analytical questions.

Rules:
1. Questions must be answerable with SQL against the available columns
2. Mix of: overview, comparison, trend, breakdown, anomaly questions
3. Use business-friendly language
4. Each question should explore a different aspect of the data
5. Questions should be specific and actionable

Output as JSON:
{
  "questions": [
    {"question": "...", "category": "overview|comparison|trend|breakdown|anomaly", "reason": "..."}
  ]
}"""


def build_user_message(
    profile_summary: str,
    semantics_summary: str | None = None,
) -> str:
    """构建推荐问题的用户消息。"""
    user_msg = profile_summary
    if semantics_summary:
        user_msg += f"\n\nSemantic understanding:\n{semantics_summary}"
    return user_msg


def build_profile_summary(
    table: str,
    profile: dict,
) -> str:
    """从 profile 数据构建摘要文本。"""
    col_lines = []
    for col in profile.get("columns", [])[:20]:
        stats = ""
        if col.get("stats"):
            s = col["stats"]
            stats = f" (mean={s.get('mean', '?')}, min={s.get('min', '?')}, max={s.get('max', '?')})"
        elif col.get("top_values"):
            tops = ", ".join(f"{v['value']}" for v in col["top_values"][:3])
            stats = f" (top: {tops})"
        col_lines.append(f"  - {col['name']} ({col.get('dtype', '?')}){stats}")

    return (
        f"Table: {table}\n"
        f"Rows: {profile.get('row_count', '?')}, Columns: {profile.get('column_count', '?')}\n"
        f"Columns:\n" + "\n".join(col_lines)
    )


def build_semantics_summary(semantics: dict) -> str:
    """从语义分析结果构建摘要文本。"""
    if not semantics or not semantics.get("summary"):
        return ""
    parts = [f"Dataset summary: {semantics['summary']}"]
    if semantics.get("detected_metrics"):
        parts.append(f"Metrics: {', '.join(semantics['detected_metrics'])}")
    if semantics.get("detected_dimensions"):
        parts.append(f"Dimensions: {', '.join(semantics['detected_dimensions'])}")
    if semantics.get("suggested_focus"):
        parts.append(f"Suggested focus: {semantics['suggested_focus']}")
    return "\n".join(parts)
