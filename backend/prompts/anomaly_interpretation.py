"""Anomaly Interpretation Prompt — LLM 解读统计异常的业务意义。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="anomaly_interpretation",
    purpose="解读统计异常并评估业务意义和严重性",
    required_vars=["question", "anomalies", "data_context"],
    optional_vars=["profile_summary"],
    response_format="json",
    max_output_tokens=1024,
    supports_streaming=True,
)

SYSTEM_PROMPT = """You are an AI data analyst interpreting statistical anomalies detected in a dataset.

Given the detected anomalies, the original question, and the data context, assess the business significance of each anomaly.

Output as JSON:
{
  "interpretations": [
    {
      "column": "column_name",
      "anomaly_type": "outlier_spike|outlier_drop|distribution_shift|unexpected_value",
      "business_meaning": "what this anomaly likely means in business terms",
      "severity": "high|medium|low",
      "suggested_investigation": "specific action to investigate this anomaly",
      "confidence": 0.0-1.0
    }
  ],
  "summary": "overall assessment of data health based on anomalies",
  "recommended_actions": ["action 1", "action 2"]
}

Rules:
- Consider the original question context when interpreting anomalies
- severity: high = potentially critical business issue, medium = worth investigating, low = likely noise
- confidence: how certain you are about the interpretation (not the anomaly itself)
- anomaly_type classification:
  - outlier_spike: value significantly above expected range
  - outlier_drop: value significantly below expected range
  - distribution_shift: value suggests underlying distribution changed
  - unexpected_value: value doesn't fit expected pattern
- Be specific in business_meaning — avoid generic statements
- If anomalies seem like data quality issues rather than real patterns, say so"""


def build_user_message(
    question: str,
    anomalies: list[dict],
    data_context: str,
    profile_summary: str | None = None,
) -> str:
    """构建异常解读的用户消息。"""
    import json

    parts = [
        f"Original question: {question}",
        f"\nData context: {data_context}",
        f"\nDetected anomalies ({len(anomalies)} total):",
        json.dumps(anomalies[:20], default=str, ensure_ascii=False),
    ]

    if profile_summary:
        parts.append(f"\nDataset profile summary: {profile_summary}")

    return "\n".join(parts)
