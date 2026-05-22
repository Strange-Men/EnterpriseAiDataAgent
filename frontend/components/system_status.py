"""System Status Component.

Input:  session_state.system_status
Output: read-only display
"""

import streamlit as st


# Status → display mapping
_STATUS_LABEL = {
    "ok": ("Operational", "status-ok"),
    "error": ("Error", "status-error"),
    "warn": ("Warning", "status-warn"),
    "unknown": ("Unknown", "status-warn"),
}

_COMPONENT_LABELS = {
    "api": "LLM API",
    "db": "Database",
    "rag": "RAG Engine",
}


def render():
    """Render the system status zone."""
    st.markdown('<div class="section-header">System Status</div>', unsafe_allow_html=True)

    status = st.session_state.get("system_status", {})

    cols = st.columns(3)
    for i, (key, label) in enumerate(_COMPONENT_LABELS.items()):
        val = status.get(key, "unknown")
        text, css_class = _STATUS_LABEL.get(val, ("Unknown", "status-warn"))
        cols[i].markdown(
            f'<span class="{css_class}">● {text}</span>  \n{label}',
            unsafe_allow_html=True,
        )

    st.divider()

    col_a, col_b = st.columns(2)
    col_a.metric("Version", status.get("version", "—"))
    col_b.metric("Uptime", status.get("uptime", "—"))
