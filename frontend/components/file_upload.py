"""File Upload Component.

Input:  user file interaction
Output: session_state.uploaded_files, session_state.upload_status
"""

import streamlit as st
import pandas as pd
from datetime import datetime


def render():
    """Render the file upload zone."""
    st.markdown('<div class="section-header">File Upload</div>', unsafe_allow_html=True)

    uploaded = st.file_uploader(
        "Drag & drop files here",
        type=["csv", "xlsx", "json", "txt", "pdf", "parquet"],
        accept_multiple_files=True,
        key="file_uploader",
    )

    if uploaded:
        _process_files(uploaded)

    _render_file_list()


def _process_files(files):
    """Process newly uploaded files and update session_state."""
    results = []
    for f in files:
        entry = {
            "name": f.name,
            "size": f"{f.size / 1024:.1f} KB",
            "type": f.type or "unknown",
            "uploaded_at": datetime.now().strftime("%H:%M:%S"),
            "preview": None,
        }
        # CSV preview (first 5 rows)
        if f.name.endswith(".csv"):
            try:
                df = pd.read_csv(f, nrows=5)
                entry["preview"] = df.to_dict(orient="records")
                entry["columns"] = list(df.columns)
                entry["rows"] = len(pd.read_csv(f))
            except Exception:
                entry["preview"] = None
        results.append(entry)

    st.session_state.uploaded_files = results
    st.session_state.upload_status = "done"


def _render_file_list():
    """Show list of uploaded files from session_state."""
    files = st.session_state.get("uploaded_files", [])
    if not files:
        st.caption("No files uploaded yet.")
        return

    for i, f in enumerate(files):
        with st.expander(f"{f['name']}  ·  {f['size']}", expanded=(i == 0)):
            col1, col2 = st.columns(2)
            col1.metric("Type", f["type"])
            col2.metric("Uploaded", f["uploaded_at"])

            if f.get("columns"):
                st.caption(f"Columns: {', '.join(f['columns'])}")
            if f.get("rows"):
                st.caption(f"Rows: {f['rows']}")

            if f.get("preview"):
                st.dataframe(pd.DataFrame(f["preview"]), use_container_width=True, hide_index=True)
