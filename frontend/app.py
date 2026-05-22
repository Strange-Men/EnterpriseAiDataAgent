"""Enterprise AI Data Agent — Main Application Entry.

Layout:
  ┌──────────────┬────────────────────┬──────────────────┐
  │  Left Col    │   Center Col       │  Right Col       │
  │  File Upload │   AI Chat          │  Analysis Result │
  │  System Stat │                    │  Charts          │
  │              │                    │  Agent Logs      │
  └──────────────┴────────────────────┴──────────────────┘
"""

import streamlit as st
from frontend.state import init_session_state
from frontend.styles import load_theme
from frontend.components import file_upload, chat_panel, data_result, chart_viewer, system_status, agent_log
from frontend.mock import seed_mock_data


# ── Page config ────────────────────────────────────────────────

st.set_page_config(
    page_title="Enterprise AI Data Agent",
    page_icon=" ",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Theme ──────────────────────────────────────────────────────

st.markdown(f"<style>{load_theme()}</style>", unsafe_allow_html=True)

# ── State ──────────────────────────────────────────────────────

init_session_state()
seed_mock_data()

# ── Header ─────────────────────────────────────────────────────

st.markdown(
    """
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
        <span style="font-size:1.6rem;"> </span>
        <h1 style="margin:0; font-size:1.4rem; color:#E6EDF3;">
            Enterprise AI Data Agent
        </h1>
    </div>
    <p style="color:#8B949E; margin-top:0; font-size:0.85rem;">
        Multi-Agent Data Analysis Platform
    </p>
    """,
    unsafe_allow_html=True,
)

# ── Layout ─────────────────────────────────────────────────────

left, center, right = st.columns([1, 2, 1.5], gap="medium")

with left:
    file_upload.render()
    st.divider()
    system_status.render()

with center:
    chat_panel.render()

with right:
    tab_analysis, tab_charts, tab_logs = st.tabs(["Analysis", "Charts", "Agent Logs"])

    with tab_analysis:
        data_result.render()

    with tab_charts:
        chart_viewer.render()

    with tab_logs:
        agent_log.render()
