"""Self-Evaluation Prompt — AI 对分析结果做自我评估。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="self_evaluation",
    purpose="AI 对分析结果做自我评估：完整性、准确性、可操作性、置信度",
    required_vars=["question", "sections_summary"],
    optional_vars=["trace_summary"],
    response_format="json",
    max_output_tokens=1024,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are an expert data analysis quality auditor.

Given an analysis result, evaluate its quality across 4 dimensions:
1. **Completeness** (high/medium/low): Does the analysis fully address the question?
2. **Accuracy** (high/medium/low): Are the findings supported by the data?
3. **Actionability** (high/medium/low): Can a decision-maker act on these findings?
4. **Confidence** (0.0-1.0): Overall confidence in the analysis quality.

Also provide:
- **diagnostics**: List of specific issues or weaknesses found (empty if none)
- **suggested_improvements**: List of concrete improvements (empty if none)

Rules:
1. Be honest — low confidence is better than false reassurance
2. If SQL results are empty or errors exist, confidence should be < 0.5
3. If sections lack data-backed evidence, lower accuracy
4. If no actionable recommendations exist, lower actionability
5. Output valid JSON only

Output format:
{"confidence": 0.85, "completeness": "high", "accuracy": "medium", "actionability": "high", "diagnostics": ["..."], "suggested_improvements": ["..."]}"""


def build_user_message(
    question: str,
    sections: list[dict],
    trace: dict | None = None,
) -> str:
    """构建自评的用户消息。"""
    trace_text = ""
    if trace:
        trace_text = (
            f"\n\nTrace summary:\n"
            f"  LLM calls: {trace.get('total_llm_calls', 0)}\n"
            f"  Output tokens: {trace.get('total_output_tokens', 0)}\n"
            f"  Violations: {len(trace.get('guardrail_violations', []))}"
        )

    if not sections:
        return f"Analysis question: {question}\n\nNo analysis sections provided. Evaluate based on lack of evidence.{trace_text}"

    sections_text = "\n".join(
        f"  [{s.get('type', 'markdown')}] {s.get('title', 'Untitled')}: {_truncate(s.get('content', ''), 300)}"
        for s in sections
    )

    return f"Analysis question: {question}\n\nSections:\n{sections_text}{trace_text}"


def _truncate(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."
