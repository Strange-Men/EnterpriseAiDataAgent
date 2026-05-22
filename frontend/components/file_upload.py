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


def render():
    """Render the file upload zone with DuckDB integration."""
    st.markdown('<div class="section-header">File Upload</div>', unsafe_allow_html=True)

    supported_ext = list(SUPPORTED_FORMATS.keys())
    uploaded = st.file_uploader(
        "Drag & drop CSV or Excel files here",
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
            # 1. Load file into DataFrame
            df = load_file(f)

            # 2. Detect schema
            schema = detect_schema(df)
            entry["row_count"] = schema["row_count"]
            entry["column_count"] = schema["col_count"]
            entry["columns"] = [c["name"] for c in schema["columns"]]

            # 3. Import to DuckDB
            table_name = sanitize_table_name(f.name)
            import_result = db.import_dataframe(df, table_name=table_name, filename=f.name)
            entry["table_name"] = import_result["table_name"]
            entry["status"] = "success"

            # 4. Update session state with latest DataFrame
            st.session_state.current_dataframe = df
            st.session_state.current_table = import_result["table_name"]
            st.session_state.data_quality_report = get_data_quality_report(df)

        except FileLoadError as e:
            entry["status"] = "error"
            entry["error"] = str(e)
        except Exception as e:
            entry["status"] = "error"
            entry["error"] = f"Unexpected error: {e}"

        results.append(entry)

    st.session_state.uploaded_files = results
    st.session_state.upload_status = "done"

    # Refresh table list
    _refresh_db_tables(db)


def _refresh_db_tables(db: DatabaseManager):
    """Refresh the list of tables in DuckDB."""
    try:
        st.session_state.db_tables = db.list_tables()
        st.session_state.database_status = "connected"
    except Exception:
        st.session_state.database_status = "error"


def _render_database_tables():
    """Show current tables in DuckDB."""
    tables = st.session_state.get("db_tables", [])
    db_status = st.session_state.get("database_status", "idle")

    if db_status == "connected" and tables:
        st.markdown("**Database Tables**")
        for tbl in tables:
            col1, col2 = st.columns([3, 1])
            with col1:
                if st.button(
                    f" {tbl['name']}  ({tbl['row_count']} rows × {tbl['column_count']} cols)",
                    key=f"tbl_{tbl['name']}",
                    use_container_width=True,
                ):
                    _load_table_to_preview(tbl["name"])
            with col2:
                if st.button("🗑", key=f"del_{tbl['name']}", help=f"Drop table {tbl['name']}"):
                    _drop_table(tbl["name"])


def _load_table_to_preview(table_name: str):
    """Load a table from DuckDB into the preview state."""
    try:
        db = DatabaseManager()
        df = db.get_sample_data(table_name, limit=500)
        st.session_state.current_dataframe = df
        st.session_state.current_table = table_name
        st.session_state.data_quality_report = get_data_quality_report(df)
    except Exception as e:
        st.error(f"Failed to load table '{table_name}': {e}")


def _drop_table(table_name: str):
    """Drop a table from DuckDB."""
    try:
        db = DatabaseManager()
        db.drop_table(table_name)
        if st.session_state.current_table == table_name:
            st.session_state.current_dataframe = None
            st.session_state.current_table = None
            st.session_state.data_quality_report = None
        _refresh_db_tables(db)
        st.rerun()
    except Exception as e:
        st.error(f"Failed to drop table '{table_name}': {e}")


def _render_file_list():
    """Show list of uploaded files with status."""
    files = st.session_state.get("uploaded_files", [])
    if not files:
        st.caption("No files uploaded yet.")
        return

    for i, f in enumerate(files):
        icon = "✅" if f["status"] == "success" else ("❌" if f["status"] == "error" else "⏳")
        with st.expander(f"{icon} {f['name']}  ·  {f['size']}", expanded=(i == 0)):
            col1, col2 = st.columns(2)
            col1.metric("Type", f["type"])
            col2.metric("Uploaded", f["uploaded_at"])

            if f["status"] == "success":
                st.caption(f"Table: `{f['table_name']}`")
                st.caption(f"Rows: {f['row_count']} · Columns: {f['column_count']}")
                if f.get("columns"):
                    st.caption(f"Fields: {', '.join(f['columns'][:10])}")
            elif f["status"] == "error":
                st.error(f.get("error", "Unknown error"))
