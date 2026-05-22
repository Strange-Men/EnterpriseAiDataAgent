"""Data Preview Component — v0.3.

Input:  session_state.current_dataframe, session_state.data_quality_report
Output: read-only display with preview, schema, and data quality stats
"""

import streamlit as st
import pandas as pd
from frontend.components import data_quality_panel


def render():
    """Render the data preview zone."""
    st.markdown('<div class="section-header">Data Preview</div>', unsafe_allow_html=True)

    df = st.session_state.get("current_dataframe")
    table = st.session_state.get("current_table")

    if df is None or not isinstance(df, pd.DataFrame) or df.empty:
        st.info("No data loaded. Upload a CSV or Excel file to begin.")
        return

    # Table name header
    if table:
        st.markdown(f"**Table:** `{table}`")

    # ── Tabs: Preview | Schema | Quality ─────────────────────────
    tab_preview, tab_schema, tab_quality = st.tabs(["Preview", "Schema", "Quality"])

    with tab_preview:
        _render_preview(df)

    with tab_schema:
        _render_schema(df)

    with tab_quality:
        data_quality_panel.render()


def _render_preview(df: pd.DataFrame):
    """Show DataFrame head with shape info."""
    st.caption(f"Showing {min(len(df), 100)} of {len(df)} rows · {len(df.columns)} columns")
    st.dataframe(df.head(100), use_container_width=True, hide_index=True)


def _render_schema(df: pd.DataFrame):
    """Show column-level schema details."""
    report = st.session_state.get("data_quality_report", {})
    col_stats = report.get("columns", {})

    schema_rows = []
    for col in df.columns:
        col_name = str(col)
        stats = col_stats.get(col_name, {})
        schema_rows.append({
            "Column": col_name,
            "Dtype": str(df[col].dtype),
            "Non-Null": f"{len(df) - int(df[col].isna().sum())}",
            "Null": int(df[col].isna().sum()),
            "Null %": f"{stats.get('null_pct', 0)}%",
            "Unique": int(df[col].nunique()),
        })

    st.dataframe(
        pd.DataFrame(schema_rows),
        use_container_width=True,
        hide_index=True,
    )
