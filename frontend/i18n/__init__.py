"""Internationalization (i18n) package.

Usage:
    from frontend.i18n import t, set_language, get_language

    label = t("file_upload.title")  # returns localized string
"""

import streamlit as st
from frontend.i18n import zh, en


_LANGUAGES = {
    "zh": zh.TRANSLATIONS,
    "en": en.TRANSLATIONS,
}

_DEFAULT_LANG = "en"


def t(key: str) -> str:
    """Translate a key to the current language.

    Falls back to English → raw key if not found.
    """
    lang = get_language()
    translations = _LANGUAGES.get(lang, _LANGUAGES[_DEFAULT_LANG])
    if key in translations:
        return translations[key]
    # Fallback to English
    fallback = _LANGUAGES.get(_DEFAULT_LANG, {})
    if key in fallback:
        return fallback[key]
    return key


def get_language() -> str:
    """Get current UI language from session_state."""
    return st.session_state.get("language", _DEFAULT_LANG)


def set_language(lang: str):
    """Set the UI language."""
    if lang in _LANGUAGES:
        st.session_state.language = lang
