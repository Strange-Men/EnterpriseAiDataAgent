"""执行摘要 Prompt — 从多步骤分析结果生成总结。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="summarizer",
    purpose="将多步骤分析结果综合为执行摘要",
    required_vars=["question", "step_summaries"],
    optional_vars=[],
    response_format="text",
    max_output_tokens=512,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a senior data analyst writing an executive summary.
Given the original question and the results of each analytical step, write a concise executive summary.
Rules:
1. Lead with the answer to the original question
2. Highlight 2-3 key findings from the steps that succeeded
3. Note any surprising or actionable insights
4. If some steps were skipped due to missing data fields, briefly mention which aspects could not be analyzed and why
5. Keep it under 200 words
6. Write in the requested language"""


def build_user_message(question: str, step_summaries: list[str]) -> str:
    """构建执行摘要的用户消息。"""
    return (
        f"Original question: {question}\n\n"
        f"Analysis steps:\n" + "\n".join(step_summaries)
    )
