"""Chat Panel Component.

Input:  user text input
Output: session_state.chat_history
"""

import streamlit as st
from frontend.state import append_chat_message


def render():
    """Render the AI chat zone."""
    st.markdown('<div class="section-header">AI Assistant</div>', unsafe_allow_html=True)

    _render_history()

    if prompt := st.chat_input("Ask about your data...", disabled=st.session_state.get("chat_input_disabled", False)):
        append_chat_message("user", prompt)
        _mock_assistant_reply(prompt)
        st.rerun()


def _render_history():
    """Display chat history from session_state."""
    history = st.session_state.get("chat_history", [])
    if not history:
        st.caption("Start a conversation by typing below.")
        return

    for msg in history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])


def _mock_assistant_reply(user_msg: str):
    """Mock assistant reply — no real AI logic."""
    reply = (
        f"I received your message: **{user_msg[:80]}**\n\n"
        "This is a mock response. AI integration will be added in a later phase."
    )
    append_chat_message("assistant", reply)
