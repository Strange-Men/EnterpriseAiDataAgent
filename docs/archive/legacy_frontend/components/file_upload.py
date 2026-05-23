"""File Upload Component — v0.3 Data Ingestion.

Input:  user file interaction
Output: session_state.uploaded_files, session_state.current_dataframe,
        session_state.current_table, session_state.database_status
"""

import streamlit as st
import pandas as pd
from datetime import datetime

from database.file_loader import load_file, FileLoadError, SUPPORTED_FORMATS
from database.db_manager import DatabaseManager
from database.schema_detector import detect_schema, get_data_quality_report, sanitize_table_name
from database.data_quality import analyze_dataframe
from frontend.i18n import t
from frontend.utils import tooltip


def render():
    """Render the file upload zone with DuckDB integration."""
    st.markdown(f'<div class="section-header">{t("file_upload.title")}</div>', unsafe_allow_html=True)

    supported_ext = list(SUPPORTED_FORMATS.keys())
    uploaded = st.file_uploader(
        t("file_upload.dropzone"),
        type=[e.lstrip(".") for e in supported_ext],
        accept_multiple_files=True,
        key="file_uploader",
    )

    if uploaded:
        _process_files(uploaded)

    _render_database_tables()
    _render_file_list()


def _process_files(files):
    """Process uploaded files: load → detect schema → import to DuckDB."""
    db = DatabaseManager()
    results = []

    for f in files:
        entry = {
            "name": f.name,
            "size": f"{f.size / 1024:.1f} KB",
            "type": f.type or "unknown",
            "uploaded_at": datetime.now().strftime("%H:%M:%S"),
            "table_name": None,
            "row_count": 0,
            "column_count": 0,
            "status": "pending",
            "error": None,
        }

        try:
            df = load_file(f)
            schema = detect_schema(df)
            entry["row_count"] = schema["row_count"]
            entry["column_count"] = schema["col_count"]
            entry["columns"] = [c["name"] for c in schema["columns"]]

            table_name = sanitize_table_name(f.name)
            import_result = db.import_dataframe(df, table_name=table_name, filename=f.name)
            entry["table_name"] = import_result["table_name"]
            entry["status"] = "success"

            st.session_state.current_dataframe = df
            st.session_state.current_table = import_result["table_name"]
            st.session_state.data_quality_report = get_data_quality_report(df)

            dq_report = analyze_dataframe(df)
            st.session_state.data_quality_score = _quality_report_to_dict(dq_report)
            st.session_state.data_warnings = dq_report.warnings

        except FileLoadError as e:
            entry["status"] = "error"
            entry["error"] = str(e)
        except Exception as e:
            entry["status"] = "error"
            entry["error"] = f"Unexpected error: {e}"

        results.append(entry)

    st.session_state.uploaded_files = results
    st.session_state.upload_status = "done"
    _refresh_db_tables(db)


def _refresh_db_tables(db: DatabaseManager):
    try:
        st.session_state.db_tables = db.list_tables()
        st.session_state.database_status = "connected"
    except Exception:
        st.session_state.database_status = "error"


def _render_database_tables():
    tables = st.session_state.get("db_tables", [])
    db_status = st.session_state.get("database_status", "idle")

    if db_status == "connected" and tables:
        st.markdown(f"**{t('file_upload.db_tables')}**")
        for tbl in tables:
            col1, col2 = st.columns([3, 1])
            with col1:
                label = f" {tbl['name']}  ({tbl['row_count']} rows × {tbl['column_count']} cols)"
                if st.button(label, key=f"tbl_{tbl['name']}", use_container_width=True):
                    _load_table_to_preview(tbl["name"])
            with col2:
                if st.button("🗑", key=f"del_{tbl['name']}", help=f"{t('file_upload.drop_table')} {tbl['name']}"):
                    _drop_table(tbl["name"])


def _load_table_to_preview(table_name: str):
    try:
        db = DatabaseManager()
        df = db.get_sample_data(table_name, limit=500)
        st.session_state.current_dataframe = df
        st.session_state.current_table = table_name
        st.session_state.data_quality_report = get_data_quality_report(df)

        dq_report = analyze_dataframe(df)
        st.session_state.data_quality_score = _quality_report_to_dict(dq_report)
        st.session_state.data_warnings = dq_report.warnings
    except Exception as e:
        st.error(f"{t('file_upload.load_failed')} '{table_name}': {e}")


def _drop_table(table_name: str):
    try:
        db = DatabaseManager()
        db.drop_table(table_name)
        if st.session_state.current_table == table_name:
            st.session_state.current_dataframe = None
            st.session_state.current_table = None
            st.session_state.data_quality_report = None
            st.session_state.data_quality_score = None
            st.session_state.data_warnings = []
        _refresh_db_tables(db)
        st.rerun()
    except Exception as e:
        st.error(f"{t('file_upload.drop_failed')} '{table_name}': {e}")


def _render_file_list():
    files = st.session_state.get("uploaded_files", [])
    if not files:
        st.caption(t("file_upload.no_files"))
        return

    for i, f in enumerate(files):
        icon = "✅" if f["status"] == "success" else ("❌" if f["status"] == "error" else "⏳")
        with st.expander(f"{icon} {f['name']}  ·  {f['size']}", expanded=(i == 0)):
            col1, col2 = st.columns(2)
            col1.metric(t("file_upload.type"), f["type"])
            col2.metric(t("file_upload.uploaded"), f["uploaded_at"])

            if f["status"] == "success":
                st.caption(f"{t('file_upload.table')}: `{f['table_name']}`")
                st.caption(f"{t('file_upload.rows')}: {f['row_count']} · {t('file_upload.columns')}: {f['column_count']}")
                if f.get("columns"):
                    fields_text = ", ".join(f["columns"][:10])
                    st.markdown(
                        f"{t('file_upload.fields')}: {tooltip(fields_text, ', '.join(f['columns']), max_len=40)}",
                        unsafe_allow_html=True,
                    )
            elif f["status"] == "error":
                st.error(f.get("error", "Unknown error"))


def _quality_report_to_dict(report) -> dict:
    return {
        "total_rows": report.total_rows,
        "total_columns": report.total_columns,
        "total_cells": report.total_cells,
        "overall_score": report.overall_score,
        "completeness_score": report.completeness_score,
        "consistency_score": report.consistency_score,
        "validity_score": report.validity_score,
        "uniqueness_score": report.uniqueness_score,
        "null_cells": report.null_cells,
        "null_pct": report.null_pct,
        "missing_by_column": report.missing_by_column,
        "duplicate_rows": report.duplicate_rows,
        "duplicate_pct": report.duplicate_pct,
        "duplicate_candidate_keys": report.duplicate_candidate_keys,
        "total_outliers": report.total_outliers,
        "outliers_by_column": report.outliers_by_column,
        "type_anomalies": report.type_anomalies,
        "field_health": [
            {
                "name": fh.name,
                "dtype": fh.dtype,
                "null_count": fh.null_count,
                "null_pct": fh.null_pct,
                "unique_count": fh.unique_count,
                "unique_ratio": fh.unique_ratio,
                "is_empty": fh.is_empty,
                "is_constant": fh.is_constant,
                "is_high_cardinality": fh.is_high_cardinality,
                "is_low_cardinality": fh.is_low_cardinality,
                "outlier_count": fh.outlier_count,
                "outlier_pct": fh.outlier_pct,
                "type_anomaly_count": fh.type_anomaly_count,
                "warnings": fh.warnings,
                "score": fh.score,
            }
            for fh in report.field_health
        ],
        "empty_columns": report.empty_columns,
        "constant_columns": report.constant_columns,
        "warnings": report.warnings,
    }
