"""Agent Execution Log Component.

Input:  session_state.agent_logs, session_state.agent_filter
Output: read-only display
"""

import streamlit as st
import pandas as pd


_STATUS_ICONS = {
    "running": "⏳",
    "done": "✅",
    "error": "❌",
    "pending": "⏸️",
}


def render():
    """Render the agent execution log zone."""
    st.markdown('<div class="section-header">Agent Logs</div>', unsafe_allow_html=True)

    _render_filter()
    _render_log_table()


def _render_filter():
    """Render agent filter bar."""
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
    """Render log entries from session_state."""
    logs = st.session_state.get("agent_logs", [])
    agent_filter = st.session_state.get("agent_filter", "all")

    if agent_filter != "all":
        logs = [l for l in logs if l.get("agent") == agent_filter]

    if not logs:
        st.caption("No agent activity yet.")
        return

    for entry in reversed(logs):
        icon = _STATUS_ICONS.get(entry.get("status", ""), "•")
        with st.expander(f"{icon}  [{entry['time']}]  {entry['agent']} — {entry['action']}", expanded=False):
            st.text(entry.get("detail", "No details."))
