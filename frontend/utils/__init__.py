"""UI utility helpers.

Tooltip, loading states, empty states, text truncation.
"""

import streamlit as st


def tooltip(text: str, full_text: str = None, max_len: int = 20) -> str:
    """Render a truncated text with HTML tooltip showing full text.

    Usage in markdown:
        st.markdown(tooltip("app_error_logs_table_extra_long", max_len=15), unsafe_allow_html=True)
    """
    if full_text is None:
        full_text = text

    if len(text) <= max_len:
        return f'<span title="{_escape(full_text)}">{_escape(text)}</span>'

    truncated = text[:max_len] + "..."
    return f'<span title="{_escape(full_text)}" class="truncated-text">{_escape(truncated)}</span>'


def tooltip_span(text: str, full_text: str = None, max_len: int = 20, css_class: str = "") -> str:
    """Same as tooltip() but returns a styled span with optional class."""
    if full_text is None:
        full_text = text

    cls = f'truncated-text {css_class}'.strip() if len(text) > max_len else css_class
    display = text if len(text) <= max_len else text[:max_len] + "..."
    return f'<span title="{_escape(full_text)}" class="{cls}">{_escape(display)}</span>'


def loading_spinner(text: str = "Loading..."):
    """Context manager for loading state."""
    return st.spinner(text)


def empty_state(message: str, icon: str = "📭"):
    """Display an empty state message."""
    st.markdown(
        f"""
        <div style="
            text-align: center;
            padding: 40px 20px;
            color: #8B949E;
        ">
            <div style="font-size: 2rem; margin-bottom: 12px;">{icon}</div>
            <div style="font-size: 0.9rem;">{message}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def success_toast(message: str):
    """Display a success notification."""
    st.success(message)


def error_toast(message: str):
    """Display an error notification."""
    st.error(message)


def warning_toast(message: str):
    """Display a warning notification."""
    st.warning(message)


def info_toast(message: str):
    """Display an info notification."""
    st.info(message)


def _escape(text: str) -> str:
    """Escape HTML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
