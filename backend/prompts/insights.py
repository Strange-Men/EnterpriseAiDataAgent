"""洞察 Prompt — 生成结构化数据洞察。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="insights",
    purpose="从查询结果中生成带置信度的结构化洞察",
    required_vars=["question", "results"],
    optional_vars=[],
    response_format="json",
    max_output_tokens=1024,
    supports_streaming=True,
)

SYSTEM_PROMPT = """You are an AI data analyst generating insights from query results.

Given the query results and the original question, provide ranked insights.

Output as JSON:
{
  "insights": [
    {
      "text": "insight description",
      "confidence": 0.0-1.0,
      "severity": "high|medium|low",
      "impact": "high|medium|low",
      "category": "trend|anomaly|distribution|correlation|quality"
    }
  ],
  "trends": [{"text": "trend description", "confidence": 0.0-1.0}],
  "data_quality_notes": ["note 1"],
  "suggested_next_steps": ["step 1", "step 2"]
}

Rules:
- confidence: how certain you are based on the data (0.0 = guess, 1.0 = definitive)
- severity: how critical this finding is for the business
- impact: how much this finding could affect decisions
- category: type of finding"""


def build_user_message(question: str, results: list[dict]) -> str:
    """构建洞察的用户消息。"""
    import json

    truncated = results[:50]
    return (
        f"Question: {question}\n\n"
        f"Results ({len(results)} rows, showing first {len(truncated)}):\n"
        f"{json.dumps(truncated, default=str, ensure_ascii=False)}"
    )
