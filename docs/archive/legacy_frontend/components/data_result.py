"""Data Preview Component — v0.3.

Input:  session_state.current_dataframe, session_state.data_quality_report
Output: read-only display with preview, schema, and data quality stats
"""

import streamlit as st
import pandas as pd
from frontend.components import data_quality_panel
from frontend.i18n import t


def render():
    """Render the data preview zone."""
    st.markdown(f'<div class="section-header">{t("preview.title")}</div>', unsafe_allow_html=True)

    df = st.session_state.get("current_dataframe")
    table = st.session_state.get("current_table")

    if df is None or not isinstance(df, pd.DataFrame) or df.empty:
        st.info(t("preview.no_data"))
        return

    if table:
        st.markdown(f"**{t('preview.table')}:** `{table}`")

    tab_preview, tab_schema, tab_quality = st.tabs([
        t("preview.tab_preview"),
        t("preview.tab_schema"),
        t("preview.tab_quality"),
    ])

    with tab_preview:
        _render_preview(df)

    with tab_schema:
        _render_schema(df)

    with tab_quality:
        data_quality_panel.render()


def _render_preview(df: pd.DataFrame):
    shown = min(len(df), 100)
    st.caption(t("preview.showing").format(shown=shown, total=len(df), cols=len(df.columns)))
    st.dataframe(df.head(100), use_container_width=True, hide_index=True)


def _render_schema(df: pd.DataFrame):
    report = st.session_state.get("data_quality_report", {})
    col_stats = report.get("columns", {})

    schema_rows = []
    for col in df.columns:
        col_name = str(col)
        stats = col_stats.get(col_name, {})
        schema_rows.append({
            t("schema.column"): col_name,
            t("schema.dtype"): str(df[col].dtype),
            t("schema.non_null"): f"{len(df) - int(df[col].isna().sum())}",
            t("schema.null"): int(df[col].isna().sum()),
            t("schema.null_pct"): f"{stats.get('null_pct', 0)}%",
            t("schema.unique"): int(df[col].nunique()),
        })

    st.dataframe(
        pd.DataFrame(schema_rows),
        use_container_width=True,
        hide_index=True,
    )
