"""Session state initialization and management.

All components communicate through session_state only.
No component should directly import or call another component.
"""

import streamlit as st
from datetime import datetime


# ── State schema defaults ──────────────────────────────────────

STATE_DEFAULTS = {
    # File upload
    "uploaded_files": [],          # list[dict]  {name, size, type, preview}
    "upload_status": "idle",       # idle | processing | done | error

    # Chat
    "chat_history": [],            # list[dict]  {role, content, timestamp}
    "chat_input_disabled": False,

    # Analysis
    "analysis_result": None,       # dict | None  {summary, stats, tables}
    "analysis_status": "idle",     # idle | running | done | error

    # Charts
    "charts": [],                  # list[dict]  {type, title, data}
    "active_chart_index": 0,

    # System
    "system_status": {             # dict
        "api": "unknown",          # unknown | ok | error
        "db": "unknown",
        "rag": "unknown",
        "uptime": "0:00:00",
        "version": "0.2.0",
    },

    # Agent logs
    "agent_logs": [],              # list[dict]  {agent, action, status, detail, time}
    "agent_filter": "all",         # all | data | chat | report

    # Data ingestion (v0.3)
    "current_dataframe": None,     # pd.DataFrame | None  — last loaded DataFrame
    "current_table": None,         # str | None  — DuckDB table name
    "database_status": "idle",     # idle | connected | error
    "db_tables": [],               # list[dict]  — tables in DuckDB
    "data_quality_report": None,   # dict | None  — v0.3 schema report
    "ingestion_log": [],           # list[dict]  — upload/import history

    # Data quality (v0.3.2)
    "data_quality_score": None,    # dict | None  — full QualityReport as dict
    "data_warnings": [],           # list[str]    — aggregated warnings
}


def init_session_state():
    """Initialise session_state with defaults. Call once at app start."""
    for key, default in STATE_DEFAULTS.items():
        if key not in st.session_state:
            st.session_state[key] = default


# ── State accessors (read-only helpers) ────────────────────────

def get_uploaded_files() -> list:
    return st.session_state.get("uploaded_files", [])


def get_chat_history() -> list:
    return st.session_state.get("chat_history", [])


def get_analysis_result() -> dict | None:
    return st.session_state.get("analysis_result")


def get_charts() -> list:
    return st.session_state.get("charts", [])


def get_agent_logs() -> list:
    return st.session_state.get("agent_logs", [])


def get_system_status() -> dict:
    return st.session_state.get("system_status", STATE_DEFAULTS["system_status"])


# ── State mutators ─────────────────────────────────────────────

def append_chat_message(role: str, content: str):
    """Append a message to chat_history."""
    st.session_state.chat_history.append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat(),
    })


def append_agent_log(agent: str, action: str, status: str, detail: str = ""):
    """Append an entry to agent_logs."""
    st.session_state.agent_logs.append({
        "agent": agent,
        "action": action,
        "status": status,
        "detail": detail,
        "time": datetime.now().strftime("%H:%M:%S"),
    })


def set_system_status(component: str, status: str):
    """Update a single system component status."""
    st.session_state.system_status[component] = status


def reset_state(keys: list[str] | None = None):
    """Reset specified keys (or all) to defaults."""
    targets = keys or list(STATE_DEFAULTS.keys())
    for key in targets:
        if key in STATE_DEFAULTS:
            st.session_state[key] = STATE_DEFAULTS[key]
