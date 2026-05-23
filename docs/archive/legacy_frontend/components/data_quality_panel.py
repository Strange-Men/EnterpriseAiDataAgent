"""Data Quality Panel Component — v0.3.2.

Enterprise-grade data quality dashboard.
Input:  session_state.data_quality_score (QualityReport dict)
Output: read-only display with score card, warnings, field health
"""

import streamlit as st
import pandas as pd
from frontend.i18n import t
from frontend.utils import tooltip


def render():
    """Render the data quality dashboard."""
    report = st.session_state.get("data_quality_score")

    if not report:
        st.info(t("quality.no_data"))
        return

    if report.get("overall_score") is None:
        st.info(t("quality.pending"))
        return

    _render_score_card(report)
    _render_warnings(report)

    tab_missing, tab_outlier, tab_duplicate, tab_fields = st.tabs([
        t("quality.tab_missing"),
        t("quality.tab_outliers"),
        t("quality.tab_duplicates"),
        t("quality.tab_fields"),
    ])

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
                    {t("quality.title")}
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

    null_pct = report.get("null_pct", 0)
    anomaly_count = len(report.get("type_anomalies", {}))
    outlier_count = report.get("total_outliers", 0)
    dup_count = report.get("duplicate_rows", 0)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric(
        t("quality.completeness"),
        f"{completeness}",
        delta=f"{null_pct}%{t('quality.null_pct')}" if null_pct > 0 else t("quality.no_nulls"),
        delta_color="inverse",
    )
    c2.metric(
        t("quality.consistency"),
        f"{consistency}",
        delta=f"{anomaly_count} {t('quality.anomalies')}" if anomaly_count > 0 else t("quality.no_anomalies"),
        delta_color="inverse",
    )
    c3.metric(
        t("quality.validity"),
        f"{validity}",
        delta=f"{outlier_count} {t('quality.outliers_label')}" if outlier_count > 0 else t("quality.no_outliers"),
        delta_color="inverse",
    )
    c4.metric(
        t("quality.uniqueness"),
        f"{uniqueness}",
        delta=f"{dup_count} {t('quality.tab_duplicates').lower()}" if dup_count > 0 else t("quality.no_duplicates"),
        delta_color="inverse",
    )


def _score_color(score: float) -> str:
    if score >= 90:
        return "#3FB950"
    elif score >= 70:
        return "#D29922"
    elif score >= 50:
        return "#DB6D28"
    else:
        return "#F85149"


# ════════════════════════════════════════════════════════════════
# Warnings
# ════════════════════════════════════════════════════════════════

def _render_warnings(report: dict):
    warnings = report.get("warnings", [])
    if not warnings:
        st.success(t("quality.no_warnings"))
        return

    warn_label = t("quality.warnings") if len(warnings) == 1 else t("quality.warnings_plural")

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
                ⚠ {len(warnings)} {warn_label}
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
        st.success(t("quality.missing_none"))
        return

    rows = []
    for col, info in sorted(missing.items(), key=lambda x: -x[1]["count"]):
        if info["count"] > 0:
            if info["pct"] >= 15:
                status = f"⚠ {t('quality.high')}"
            elif info["pct"] >= 5:
                status = f"  {t('quality.moderate')}"
            else:
                status = f"✅ {t('quality.low')}"
            rows.append({
                "Column": col,
                "Missing": info["count"],
                "Missing %": f"{info['pct']}%",
                "Status": status,
            })

    if rows:
        st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    else:
        st.success(t("quality.missing_none"))


# ════════════════════════════════════════════════════════════════
# Outlier Table
# ════════════════════════════════════════════════════════════════

def _render_outlier_table(report: dict):
    outliers = report.get("outliers_by_column", {})
    if not outliers:
        st.success(t("quality.outlier_none"))
        return

    rows = []
    for col, info in sorted(outliers.items(), key=lambda x: -x[1]["count"]):
        status = f"⚠ {t('quality.high')}" if info["pct"] > 3 else f"✅ {t('quality.normal')}"
        rows.append({
            "Column": col,
            "Outliers": info["count"],
            "Outlier %": f"{info['pct']}%",
            "Lower Bound": info["lower_bound"],
            "Upper Bound": info["upper_bound"],
            "Status": status,
        })

    st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    st.caption(t("quality.outlier_method"))


# ════════════════════════════════════════════════════════════════
# Duplicate Info
# ════════════════════════════════════════════════════════════════

def _render_duplicate_info(report: dict):
    dup_rows = report.get("duplicate_rows", 0)
    dup_pct = report.get("duplicate_pct", 0)
    candidate_keys = report.get("duplicate_candidate_keys", [])

    col1, col2 = st.columns(2)
    col1.metric(t("quality.dup_rows"), dup_rows)
    col2.metric(t("quality.dup_rate"), f"{dup_pct}%")

    if dup_rows > 0:
        st.warning(f"Found {dup_rows} fully duplicated rows ({dup_pct}% of data).")
    else:
        st.success(t("quality.dup_none"))

    if candidate_keys:
        st.markdown(f"**{t('quality.candidate_keys')}:**")
        for key in candidate_keys:
            st.markdown(f"- `{key}`")


# ════════════════════════════════════════════════════════════════
# Field Health
# ════════════════════════════════════════════════════════════════

_HEALTH_LABELS = {
    (90, 101): "quality.excellent",
    (70, 90): "quality.good",
    (50, 70): "quality.fair",
    (0, 50): "quality.poor",
}


def _render_field_health(report: dict):
    fields = report.get("field_health", [])
    if not fields:
        st.info(t("quality.field_health_none"))
        return

    rows = []
    for f in fields:
        warnings_text = "; ".join(f.get("warnings", [])) if f.get("warnings") else ""
        health_key = "quality.poor"
        for (lo, hi), key in _HEALTH_LABELS.items():
            if lo <= f["score"] < hi:
                health_key = key
                break
        rows.append({
            "Field": f["name"],
            "Type": f["dtype"],
            "Null %": f"{f['null_pct']}%",
            "Unique": f["unique_count"],
            "Outliers": f.get("outlier_count", 0),
            "Score": f["score"],
            "Health": t(health_key),
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

    empty = report.get("empty_columns", [])
    constant = report.get("constant_columns", [])
    if empty:
        st.error(f"{t('quality.empty_cols')}: {', '.join(empty)}")
    if constant:
        st.warning(f"{t('quality.constant_cols')}: {', '.join(constant)}")
