"""Prompt Architecture Layer — 所有 AI prompt 的统一入口。

使用方式:
    from backend.prompts.sql_generation import CONTRACT, SYSTEM_PROMPT, build_user_message
    from backend.prompts.registry import REGISTRY, get_contract
    from backend.prompts.locale import apply_language
    from backend.prompts.contracts import PromptContract
"""

from backend.prompts.contracts import PromptContract
from backend.prompts.registry import REGISTRY, get_contract, list_prompts, get_system_prompt
from backend.prompts.locale import apply_language

__all__ = [
    "PromptContract",
    "REGISTRY",
    "get_contract",
    "list_prompts",
    "get_system_prompt",
    "apply_language",
]
