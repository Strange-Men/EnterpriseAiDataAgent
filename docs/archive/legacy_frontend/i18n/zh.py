"""Chinese (Simplified) translations."""

TRANSLATIONS = {
    # ── App ───────────────────────────────────────────────────
    "app.title": "Enterprise AI Data Agent",
    "app.subtitle": "多智能体数据分析平台",
    "app.language": "语言",

    # ── File Upload ───────────────────────────────────────────
    "file_upload.title": "文件上传",
    "file_upload.dropzone": "拖拽 CSV 或 Excel 文件到此",
    "file_upload.no_files": "暂无已上传文件。",
    "file_upload.db_tables": "数据库表",
    "file_upload.type": "类型",
    "file_upload.uploaded": "上传时间",
    "file_upload.table": "表名",
    "file_upload.rows": "行数",
    "file_upload.columns": "列数",
    "file_upload.fields": "字段",
    "file_upload.drop_table": "删除表",
    "file_upload.load_failed": "加载表失败",
    "file_upload.drop_failed": "删除表失败",

    # ── Chat ──────────────────────────────────────────────────
    "chat.title": "AI 助手",
    "chat.placeholder": "输入你的问题...",
    "chat.empty": "在下方输入开始对话。",
    "chat.mock_reply": "这是模拟回复。AI 集成将在后续版本中添加。",

    # ── Data Preview ──────────────────────────────────────────
    "preview.title": "数据预览",
    "preview.no_data": "暂无数据。请上传 CSV 或 Excel 文件。",
    "preview.table": "表名",
    "preview.tab_preview": "预览",
    "preview.tab_schema": "结构",
    "preview.tab_quality": "质量",
    "preview.showing": "显示 {shown} / {total} 行 · {cols} 列",

    # ── Data Quality ──────────────────────────────────────────
    "quality.title": "数据质量评分",
    "quality.no_data": "暂无数据。请上传文件查看质量分析。",
    "quality.pending": "质量分析中。",
    "quality.completeness": "完整性",
    "quality.consistency": "一致性",
    "quality.validity": "有效性",
    "quality.uniqueness": "唯一性",
    "quality.no_nulls": "无缺失值",
    "quality.no_anomalies": "无异常",
    "quality.no_outliers": "无异常值",
    "quality.no_duplicates": "无重复行",
    "quality.tab_missing": "缺失值",
    "quality.tab_outliers": "异常值",
    "quality.tab_duplicates": "重复行",
    "quality.tab_fields": "字段健康",
    "quality.warnings": "警告",
    "quality.warnings_plural": "警告",
    "quality.no_warnings": "未检测到质量警告。",
    "quality.missing_none": "未检测到缺失值。",
    "quality.outlier_none": "无数值列或未检测到异常值。",
    "quality.outlier_method": "方法：IQR（四分位距）1.5× 乘数",
    "quality.dup_none": "未检测到完全重复行。",
    "quality.dup_rows": "重复行",
    "quality.dup_rate": "重复率",
    "quality.candidate_keys": "候选主键（唯一且非空）",
    "quality.field_health_none": "暂无字段健康数据。",
    "quality.empty_cols": "空列",
    "quality.constant_cols": "常量列",
    "quality.high": "高",
    "quality.moderate": "中",
    "quality.low": "低",
    "quality.normal": "正常",
    "quality.excellent": "优秀",
    "quality.good": "良好",
    "quality.fair": "一般",
    "quality.poor": "差",
    "quality.null_pct": "% 缺失",
    "quality.anomalies": "异常",
    "quality.outliers_label": "异常值",

    # ── System Status ─────────────────────────────────────────
    "status.title": "系统状态",
    "status.operational": "正常",
    "status.error": "异常",
    "status.warning": "警告",
    "status.unknown": "未知",
    "status.api": "LLM API",
    "status.db": "数据库",
    "status.rag": "RAG 引擎",
    "status.version": "版本",
    "status.uptime": "运行时间",

    # ── Agent Logs ────────────────────────────────────────────
    "logs.title": "智能体日志",
    "logs.empty": "暂无智能体活动。",
    "logs.no_detail": "无详细信息。",

    # ── Charts ────────────────────────────────────────────────
    "charts.title": "可视化",
    "charts.empty": "暂无图表。显示示例图表。",
    "charts.no_data": "无图表数据。",

    # ── Schema ────────────────────────────────────────────────
    "schema.column": "列名",
    "schema.dtype": "类型",
    "schema.non_null": "非空",
    "schema.null": "空值",
    "schema.null_pct": "空值%",
    "schema.unique": "唯一",
}
