"""Data Analysis Result Component.

Input:  session_state.analysis_result
Output: read-only display
"""

import streamlit as st
import pandas as pd


def render():
    """Render the data analysis result zone."""
    st.markdown('<div class="section-header">Analysis Results</div>', unsafe_allow_html=True)

    status = st.session_state.get("analysis_status", "idle")

    if status == "idle":
        _render_idle()
    elif status == "running":
        _render_running()
    elif status == "done":
        _render_result()
    elif status == "error":
        _render_error()


def _render_idle():
    """Show placeholder when no analysis has run."""
    st.info("No analysis yet. Upload data and start a conversation to begin.")


def _render_running():
    """Show progress indicator."""
    with st.spinner("Running analysis..."):
        st.progress(0.5, text="Processing data...")


def _render_result():
    """Display analysis result from session_state."""
    result = st.session_state.get("analysis_result")
    if not result:
        st.info("Analysis complete but no results available.")
        return

    if result.get("summary"):
        st.markdown("**Summary**")
        st.write(result["summary"])

    if result.get("stats"):
        st.markdown("**Statistics**")
        stats_df = pd.DataFrame([result["stats"]])
        st.dataframe(stats_df, use_container_width=True, hide_index=True)

    if result.get("tables"):
        for table in result["tables"]:
            st.markdown(f"**{table.get('name', 'Table')}**")
            st.dataframe(pd.DataFrame(table["data"]), use_container_width=True, hide_index=True)


def _render_error():
    """Show error state."""
    st.error("Analysis failed. Check Agent logs for details.")
