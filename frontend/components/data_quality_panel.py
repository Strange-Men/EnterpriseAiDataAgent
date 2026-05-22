"""Data Quality Panel Component — v0.3.2.

Enterprise-grade data quality dashboard.
Input:  session_state.data_quality_report (QualityReport dict)
Output: read-only display with score card, warnings, field health
"""

import streamlit as st
import pandas as pd


def render():
    """Render the data quality dashboard."""
    report = st.session_state.get("data_quality_score")

    if not report:
        st.info("No data loaded. Upload a file to see quality analysis.")
        return

    if report.get("overall_score") is None:
        st.info("Quality analysis pending.")
        return

    # ── Score Card Row ───────────────────────────────────────────
    _render_score_card(report)

    # ── Warnings ─────────────────────────────────────────────────
    _render_warnings(report)

    # ── Detail Tabs ──────────────────────────────────────────────
    tab_missing, tab_outlier, tab_duplicate, tab_fields = st.tabs(
        ["Missing Values", "Outliers", "Duplicates", "Field Health"]
    )

    with tab_missing:
        _render_missing_table(report)

    with tab_outlier:
        _render_outlier_table(report)

    with tab_duplicate:
        _render_duplicate_info(report)

    with tab_fields:
        _render_field_health(report)


# ════════════════════════════════════════════════════════════════
# Score Card
# ════════════════════════════════════════════════════════════════

def _render_score_card(report: dict):
    overall = report.get("overall_score", 0)
    completeness = report.get("completeness_score", 0)
    consistency = report.get("consistency_score", 0)
    validity = report.get("validity_score", 0)
    uniqueness = report.get("uniqueness_score", 0)

    # Overall score with color
    score_color = _score_color(overall)

    st.markdown(
        f"""
        <div style="
            background: linear-gradient(135deg, #161B22 0%, #0D1117 100%);
            border: 1px solid #30363D;
            border-radius: 12px;
            padding: 20px 24px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 24px;
        ">
            <div style="
                width: 80px; height: 80px;
                border-radius: 50%;
                border: 3px solid {score_color};
                display: flex; align-items: center; justify-content: center;
                font-size: 1.6rem; font-weight: 700;
                color: {score_color};
                flex-shrink: 0;
            ">{overall}</div>
            <div>
                <div style="font-size: 1.1rem; font-weight: 600; color: #E6EDF3; margin-bottom: 4px;">
                    Data Quality Score
                </div>
                <div style="font-size: 0.8rem; color: #8B949E;">
                    {report.get('total_rows', 0)} rows × {report.get('total_columns', 0)} columns
                    · {report.get('total_cells', 0)} cells
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Dimension scores
    c1, c2, c3, c4 = st.columns(4)
    c1.metric(
        "Completeness",
        f"{completeness}",
        delta=f"{report.get('null_pct', 0)}% null" if report.get('null_pct', 0) > 0 else "No nulls",
        delta_color="inverse",
    )
    c2.metric(
        "Consistency",
        f"{consistency}",
        delta=f"{len(report.get('type_anomalies', {}))} anomalies",
        delta_color="inverse",
    )
    c3.metric(
        "Validity",
        f"{validity}",
        delta=f"{report.get('total_outliers', 0)} outliers",
        delta_color="inverse",
    )
    c4.metric(
        "Uniqueness",
        f"{uniqueness}",
        delta=f"{report.get('duplicate_rows', 0)} duplicates",
        delta_color="inverse",
    )


def _score_color(score: float) -> str:
    if score >= 90:
        return "#3FB950"  # green
    elif score >= 70:
        return "#D29922"  # yellow
    elif score >= 50:
        return "#DB6D28"  # orange
    else:
        return "#F85149"  # red


# ════════════════════════════════════════════════════════════════
# Warnings
# ════════════════════════════════════════════════════════════════

def _render_warnings(report: dict):
    warnings = report.get("warnings", [])
    if not warnings:
        st.success("No quality warnings detected.")
        return

    st.markdown(
        f"""
        <div style="
            background: #1C1206;
            border: 1px solid #9E6A03;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
        ">
            <div style="color: #D29922; font-weight: 600; margin-bottom: 8px;">
                ⚠ {len(warnings)} Warning{'s' if len(warnings) != 1 else ''}
            </div>
        """,
        unsafe_allow_html=True,
    )

    for w in warnings:
        st.markdown(
            f'<div style="color: #C9D1D9; font-size: 0.85rem; padding: 2px 0;">• {w}</div>',
            unsafe_allow_html=True,
        )

    st.markdown("</div>", unsafe_allow_html=True)


# ════════════════════════════════════════════════════════════════
# Missing Values Table
# ════════════════════════════════════════════════════════════════

def _render_missing_table(report: dict):
    missing = report.get("missing_by_column", {})
    if not missing:
        st.success("No missing values.")
        return

    rows = []
    for col, info in sorted(missing.items(), key=lambda x: -x[1]["count"]):
        if info["count"] > 0:
            rows.append({
                "Column": col,
                "Missing": info["count"],
                "Missing %": f"{info['pct']}%",
                "Status": "⚠ High" if info["pct"] >= 15 else ("  Moderate" if info["pct"] >= 5 else "✅ Low"),
            })

    if rows:
        st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    else:
        st.success("No missing values detected.")


# ════════════════════════════════════════════════════════════════
# Outlier Table
# ════════════════════════════════════════════════════════════════

def _render_outlier_table(report: dict):
    outliers = report.get("outliers_by_column", {})
    if not outliers:
        st.success("No numeric columns or no outliers detected.")
        return

    rows = []
    for col, info in sorted(outliers.items(), key=lambda x: -x[1]["count"]):
        rows.append({
            "Column": col,
            "Outliers": info["count"],
            "Outlier %": f"{info['pct']}%",
            "Lower Bound": info["lower_bound"],
            "Upper Bound": info["upper_bound"],
            "Status": "⚠ High" if info["pct"] > 3 else "✅ Normal",
        })

    st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    st.caption("Method: IQR (Interquartile Range) with 1.5× multiplier")


# ════════════════════════════════════════════════════════════════
# Duplicate Info
# ════════════════════════════════════════════════════════════════

def _render_duplicate_info(report: dict):
    dup_rows = report.get("duplicate_rows", 0)
    dup_pct = report.get("duplicate_pct", 0)
    candidate_keys = report.get("duplicate_candidate_keys", [])

    col1, col2 = st.columns(2)
    col1.metric("Duplicate Rows", dup_rows)
    col2.metric("Duplicate Rate", f"{dup_pct}%")

    if dup_rows > 0:
        st.warning(f"Found {dup_rows} fully duplicated rows ({dup_pct}% of data).")
    else:
        st.success("No fully duplicated rows detected.")

    if candidate_keys:
        st.markdown("**Candidate Primary Keys** (unique, no nulls):")
        for key in candidate_keys:
            st.markdown(f"- `{key}`")


# ════════════════════════════════════════════════════════════════
# Field Health
# ════════════════════════════════════════════════════════════════

def _render_field_health(report: dict):
    fields = report.get("field_health", [])
    if not fields:
        st.info("No field health data available.")
        return

    rows = []
    for f in fields:
        warnings_text = "; ".join(f.get("warnings", [])) if f.get("warnings") else ""
        rows.append({
            "Field": f["name"],
            "Type": f["dtype"],
            "Null %": f"{f['null_pct']}%",
            "Unique": f["unique_count"],
            "Outliers": f.get("outlier_count", 0),
            "Score": f["score"],
            "Health": _health_badge(f["score"]),
            "Warnings": warnings_text,
        })

    df = pd.DataFrame(rows)
    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Score": st.column_config.ProgressColumn(
                "Score", min_value=0, max_value=100, format="%.0f"
            ),
            "Health": st.column_config.TextColumn("Health"),
        },
    )

    # Summary
    empty = report.get("empty_columns", [])
    constant = report.get("constant_columns", [])
    if empty:
        st.error(f"Empty columns: {', '.join(empty)}")
    if constant:
        st.warning(f"Constant columns: {', '.join(constant)}")


def _health_badge(score: float) -> str:
    if score >= 90:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 50:
        return "Fair"
    else:
        return "Poor"
