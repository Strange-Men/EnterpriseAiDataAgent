"""Enterprise AI Data Agent — Main Application Entry.

Workspace Layout:
  ┌──────────────┬────────────────────┬──────────────────┐
  │  Left Col    │   Center Col       │  Right Col       │
  │  File Upload │   AI Chat          │  Data Preview    │
  │  System Stat │                    │  Charts          │
  │              │                    │  Agent Logs      │
  └──────────────┴────────────────────┴──────────────────┘

Responsive: column ratios adapt to workspace_layout session state.
"""

# Ensure project root is on sys.path so `from frontend.xxx` works
import os, sys
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import streamlit as st
from frontend.state import init_session_state
from frontend.styles import load_theme
from frontend.components import file_upload, chat_panel, data_result, chart_viewer, system_status, agent_log
from database.db_manager import DatabaseManager
from frontend.i18n import t, get_language, set_language
from frontend.layout import get_layout_ratios


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

# ── Database init ──────────────────────────────────────────────

db = DatabaseManager()
try:
    db.connect()
    st.session_state.database_status = "connected"
    st.session_state.db_tables = db.list_tables()
except Exception as e:
    st.session_state.database_status = "error"
    st.error(f"Database connection failed: {e}")

# ── Header with language toggle ────────────────────────────────

col_title, col_lang = st.columns([6, 1])
with col_title:
    st.markdown(
        f"""
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
            <span style="font-size:1.6rem;"> </span>
            <h1 style="margin:0; font-size:1.4rem; color:#E6EDF3;">
                {t("app.title")}
            </h1>
        </div>
        <p style="color:#8B949E; margin-top:0; font-size:0.85rem;">
            {t("app.subtitle")}
        </p>
        """,
        unsafe_allow_html=True,
    )
with col_lang:
    current_lang = get_language()
    lang_options = {"en": "English", "zh": "中文"}
    selected = st.selectbox(
        t("app.language"),
        list(lang_options.keys()),
        format_func=lambda x: lang_options[x],
        index=list(lang_options.keys()).index(current_lang) if current_lang in lang_options else 0,
        key="lang_toggle",
        label_visibility="collapsed",
    )
    if selected != current_lang:
        set_language(selected)
        st.rerun()

# ── Layout ─────────────────────────────────────────────────────

ratios = get_layout_ratios()
left, center, right = st.columns(ratios, gap="medium")

with left:
    file_upload.render()
    st.divider()
    system_status.render()

with center:
    chat_panel.render()

with right:
    tab_analysis, tab_charts, tab_logs = st.tabs(
        [t("preview.tab_preview"), t("charts.title"), t("logs.title")]
    )

    with tab_analysis:
        data_result.render()

    with tab_charts:
        chart_viewer.render()

    with tab_logs:
        agent_log.render()
