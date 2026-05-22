"""System Status Component.

Input:  session_state.system_status
Output: read-only display
"""

import streamlit as st
from frontend.i18n import t


_STATUS_KEY_MAP = {
    "ok": "status.operational",
    "error": "status.error",
    "warn": "status.warning",
    "unknown": "status.unknown",
}

_STATUS_CSS = {
    "ok": "status-ok",
    "error": "status-error",
    "warn": "status-warn",
    "unknown": "status-warn",
}

_COMPONENT_KEYS = {
    "api": "status.api",
    "db": "status.db",
    "rag": "status.rag",
}


def render():
    """Render the system status zone."""
    st.markdown(f'<div class="section-header">{t("status.title")}</div>', unsafe_allow_html=True)

    status = st.session_state.get("system_status", {})

    db_status = st.session_state.get("database_status", "idle")
    real_status = dict(status)
    if db_status == "connected":
        real_status["db"] = "ok"
    elif db_status == "error":
        real_status["db"] = "error"

    cols = st.columns(3)
    for i, (key, label_key) in enumerate(_COMPONENT_KEYS.items()):
        val = real_status.get(key, "unknown")
        text = t(_STATUS_KEY_MAP.get(val, "status.unknown"))
        css_class = _STATUS_CSS.get(val, "status-warn")
        cols[i].markdown(
            f'<span class="{css_class}">● {text}</span>  \n{t(label_key)}',
            unsafe_allow_html=True,
        )

    st.divider()

    col_a, col_b = st.columns(2)
    col_a.metric(t("status.version"), status.get("version", "—"))
    col_b.metric(t("status.uptime"), status.get("uptime", "—"))
