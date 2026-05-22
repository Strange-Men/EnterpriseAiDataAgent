"""English translations."""

TRANSLATIONS = {
    # ── App ───────────────────────────────────────────────────
    "app.title": "Enterprise AI Data Agent",
    "app.subtitle": "Multi-Agent Data Analysis Platform",
    "app.language": "Language",

    # ── File Upload ───────────────────────────────────────────
    "file_upload.title": "File Upload",
    "file_upload.dropzone": "Drag & drop CSV or Excel files here",
    "file_upload.no_files": "No files uploaded yet.",
    "file_upload.db_tables": "Database Tables",
    "file_upload.type": "Type",
    "file_upload.uploaded": "Uploaded",
    "file_upload.table": "Table",
    "file_upload.rows": "Rows",
    "file_upload.columns": "Columns",
    "file_upload.fields": "Fields",
    "file_upload.drop_table": "Drop table",
    "file_upload.load_failed": "Failed to load table",
    "file_upload.drop_failed": "Failed to drop table",

    # ── Chat ──────────────────────────────────────────────────
    "chat.title": "AI Assistant",
    "chat.placeholder": "Ask about your data...",
    "chat.empty": "Start a conversation by typing below.",
    "chat.mock_reply": "This is a mock response. AI integration will be added in a later phase.",

    # ── Data Preview ──────────────────────────────────────────
    "preview.title": "Data Preview",
    "preview.no_data": "No data loaded. Upload a CSV or Excel file to begin.",
    "preview.table": "Table",
    "preview.tab_preview": "Preview",
    "preview.tab_schema": "Schema",
    "preview.tab_quality": "Quality",
    "preview.showing": "Showing {shown} of {total} rows · {cols} columns",

    # ── Data Quality ──────────────────────────────────────────
    "quality.title": "Data Quality Score",
    "quality.no_data": "No data loaded. Upload a file to see quality analysis.",
    "quality.pending": "Quality analysis pending.",
    "quality.completeness": "Completeness",
    "quality.consistency": "Consistency",
    "quality.validity": "Validity",
    "quality.uniqueness": "Uniqueness",
    "quality.no_nulls": "No nulls",
    "quality.no_anomalies": "No anomalies",
    "quality.no_outliers": "No outliers",
    "quality.no_duplicates": "No duplicates",
    "quality.tab_missing": "Missing Values",
    "quality.tab_outliers": "Outliers",
    "quality.tab_duplicates": "Duplicates",
    "quality.tab_fields": "Field Health",
    "quality.warnings": "Warning",
    "quality.warnings_plural": "Warnings",
    "quality.no_warnings": "No quality warnings detected.",
    "quality.missing_none": "No missing values detected.",
    "quality.outlier_none": "No numeric columns or no outliers detected.",
    "quality.outlier_method": "Method: IQR (Interquartile Range) with 1.5× multiplier",
    "quality.dup_none": "No fully duplicated rows detected.",
    "quality.dup_rows": "Duplicate Rows",
    "quality.dup_rate": "Duplicate Rate",
    "quality.candidate_keys": "Candidate Primary Keys (unique, no nulls)",
    "quality.field_health_none": "No field health data available.",
    "quality.empty_cols": "Empty columns",
    "quality.constant_cols": "Constant columns",
    "quality.high": "High",
    "quality.moderate": "Moderate",
    "quality.low": "Low",
    "quality.normal": "Normal",
    "quality.excellent": "Excellent",
    "quality.good": "Good",
    "quality.fair": "Fair",
    "quality.poor": "Poor",
    "quality.null_pct": "% null",
    "quality.anomalies": "anomalies",
    "quality.outliers_label": "outliers",

    # ── System Status ─────────────────────────────────────────
    "status.title": "System Status",
    "status.operational": "Operational",
    "status.error": "Error",
    "status.warning": "Warning",
    "status.unknown": "Unknown",
    "status.api": "LLM API",
    "status.db": "Database",
    "status.rag": "RAG Engine",
    "status.version": "Version",
    "status.uptime": "Uptime",

    # ── Agent Logs ────────────────────────────────────────────
    "logs.title": "Agent Logs",
    "logs.empty": "No agent activity yet.",
    "logs.no_detail": "No details.",

    # ── Charts ────────────────────────────────────────────────
    "charts.title": "Visualizations",
    "charts.empty": "No charts generated yet. Showing demo chart.",
    "charts.no_data": "No data for this chart.",

    # ── Schema ────────────────────────────────────────────────
    "schema.column": "Column",
    "schema.dtype": "Dtype",
    "schema.non_null": "Non-Null",
    "schema.null": "Null",
    "schema.null_pct": "Null %",
    "schema.unique": "Unique",
}
