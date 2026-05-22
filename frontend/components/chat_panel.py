"""Chat Panel Component.

Input:  user text input
Output: session_state.chat_history
"""

import streamlit as st
from frontend.state import append_chat_message
from frontend.i18n import t


def render():
    """Render the AI chat zone."""
    st.markdown(f'<div class="section-header">{t("chat.title")}</div>', unsafe_allow_html=True)

    _render_history()

    if prompt := st.chat_input(
        t("chat.placeholder"),
        disabled=st.session_state.get("chat_input_disabled", False),
    ):
        append_chat_message("user", prompt)
        _mock_assistant_reply(prompt)
        st.rerun()


def _render_history():
    history = st.session_state.get("chat_history", [])
    if not history:
        st.caption(t("chat.empty"))
        return

    for msg in history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])


def _mock_assistant_reply(user_msg: str):
    reply = (
        f"I received your message: **{user_msg[:80]}**\n\n"
        f"{t('chat.mock_reply')}"
    )
    append_chat_message("assistant", reply)
