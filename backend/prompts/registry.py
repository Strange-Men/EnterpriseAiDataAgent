"""Prompt 注册表 — 所有 prompt 的集中索引。"""

from backend.prompts.contracts import PromptContract
from backend.prompts import (
    sql_generation,
    explanation,
    insights,
    chart_suggest,
    semantics,
    suggest_questions,
    analysis_plan,
    summarizer,
    template_adaptation,
    self_evaluation,
)

# 所有 prompt 合约的注册表
REGISTRY: dict[str, PromptContract] = {
    c.name: c
    for c in [
        sql_generation.CONTRACT,
        explanation.CONTRACT,
        insights.CONTRACT,
        chart_suggest.CONTRACT,
        semantics.CONTRACT,
        suggest_questions.CONTRACT,
        analysis_plan.CONTRACT,
        summarizer.CONTRACT,
        template_adaptation.CONTRACT,
        self_evaluation.CONTRACT,
    ]
}


def get_contract(name: str) -> PromptContract | None:
    """按名称获取 prompt 合约。"""
    return REGISTRY.get(name)


def list_prompts() -> list[PromptContract]:
    """列出所有已注册的 prompt。"""
    return list(REGISTRY.values())


def get_system_prompt(name: str) -> str | None:
    """按名称获取 system prompt 文本。"""
    module_map = {
        "sql_generation": sql_generation,
        "explanation": explanation,
        "insights": insights,
        "chart_suggest": chart_suggest,
        "semantics": semantics,
        "suggest_questions": suggest_questions,
        "analysis_plan": analysis_plan,
        "summarizer": summarizer,
        "template_adaptation": template_adaptation,
        "self_evaluation": self_evaluation,
    }
    module = module_map.get(name)
    return module.SYSTEM_PROMPT if module else None
