"""Data Preview Component — v0.3.

Input:  session_state.current_dataframe, session_state.data_quality_report
Output: read-only display with preview, schema, and data quality stats
"""

import streamlit as st
import pandas as pd


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
    tab_preview, tab_schema, tab_quality = st.tabs(["Preview", "Schema", "Data Quality"])

    with tab_preview:
        _render_preview(df)

    with tab_schema:
        _render_schema(df)

    with tab_quality:
        _render_quality(df)


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


def _render_quality(df: pd.DataFrame):
    """Show data quality summary and missing value stats."""
    report = st.session_state.get("data_quality_report", {})

    if report:
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Rows", report.get("total_rows", len(df)))
        col2.metric("Total Columns", report.get("total_columns", len(df.columns)))
        col3.metric("Null Cells", report.get("null_cells", 0))
        col4.metric("Duplicate Rows", report.get("duplicate_rows", 0))

        null_pct = report.get("null_percentage", 0)
        if null_pct > 0:
            st.warning(f"Data has {null_pct}% missing values across all cells.")

    # Per-column null breakdown
    st.markdown("**Missing Values by Column**")
    null_data = []
    for col in df.columns:
        null_count = int(df[col].isna().sum())
        if null_count > 0:
            null_data.append({
                "Column": str(col),
                "Null Count": null_count,
                "Null %": f"{round(null_count / len(df) * 100, 2)}%",
            })

    if null_data:
        st.dataframe(pd.DataFrame(null_data), use_container_width=True, hide_index=True)
    else:
        st.success("No missing values detected.")
