"""Agent Execution Log Component.

Input:  session_state.agent_logs, session_state.agent_filter
Output: read-only display
"""

import streamlit as st
from frontend.i18n import t
from frontend.utils import tooltip


_STATUS_ICONS = {
    "running": "⏳",
    "done": "✅",
    "error": "❌",
    "pending": "⏸️",
}


def render():
    """Render the agent execution log zone."""
    st.markdown(f'<div class="section-header">{t("logs.title")}</div>', unsafe_allow_html=True)

    _render_filter()
    _render_log_table()


def _render_filter():
    col1, col2 = st.columns([3, 1])
    with col2:
        st.session_state.agent_filter = st.selectbox(
            "Filter",
            ["all", "data", "chat", "report"],
            index=0,
            label_visibility="collapsed",
            key="agent_filter_select",
        )


def _render_log_table():
    logs = st.session_state.get("agent_logs", [])
    agent_filter = st.session_state.get("agent_filter", "all")

    if agent_filter != "all":
        logs = [l for l in logs if l.get("agent") == agent_filter]

    if not logs:
        st.caption(t("logs.empty"))
        return

    for entry in reversed(logs):
        icon = _STATUS_ICONS.get(entry.get("status", ""), "•")
        action_text = entry["action"]
        with st.expander(f"{icon}  [{entry['time']}]  {entry['agent']} — {action_text}", expanded=False):
            detail = entry.get("detail", "") or t("logs.no_detail")
            st.text(detail)
