"""语言处理 — 为 system prompt 注入语言指令。"""

_LOCALE_SUFFIX = {
    "zh": "\n\nIMPORTANT: 请用中文回答。所有解释、洞察和建议必须使用中文。",
    "en": "",
}


def apply_language(system: str, language: str) -> str:
    """追加语言指令到 system prompt。"""
    suffix = _LOCALE_SUFFIX.get(language)
    if suffix is None:
        suffix = f'\n\nIMPORTANT: Respond in {language}. All explanations, insights, and suggestions must be written in {language}.'
    return system + suffix
