"""模板适配 Prompt — 将分析模板问题适配到新数据集。"""

from backend.prompts.contracts import PromptContract

CONTRACT = PromptContract(
    name="template_adaptation",
    purpose="将分析模板中的问题适配到目标数据集的 schema",
    required_vars=["template_questions", "original_schema", "target_schema"],
    optional_vars=[],
    response_format="json",
    max_output_tokens=512,
    supports_streaming=False,
)

SYSTEM_PROMPT = """You are a data analyst adapting an analysis template to a new dataset.

Given the original template questions and both schemas, rewrite each question to be meaningful for the target dataset.

Rules:
1. Map column references from source to target schema
2. Adapt domain-specific terms to match target data
3. If a question cannot be adapted (no equivalent columns), mark it as "unadaptable"
4. Keep the analytical intent the same
5. Output valid JSON only

Output format:
{"adapted_questions": [{"order": 1, "question": "...", "status": "ok"|"unadaptable", "reason": "..."}]}"""


def build_user_message(
    template_questions: list[dict],
    original_schema: list[dict],
    target_schema: list[dict],
) -> str:
    """构建模板适配的用户消息。"""

    questions_desc = "\n".join(
        f"  {q['order']}. [{q.get('mode', 'explain')}] {q['question']}"
        for q in template_questions
    )
    orig_cols = "\n".join(
        f"  - {c['name']} ({c.get('dtype', 'VARCHAR')})" for c in original_schema
    )
    target_cols = "\n".join(
        f"  - {c['name']} ({c.get('dtype', 'VARCHAR')})" for c in target_schema
    )

    return (
        f"Template questions:\n{questions_desc}\n\n"
        f"Original dataset columns:\n{orig_cols}\n\n"
        f"Target dataset columns:\n{target_cols}"
    )
