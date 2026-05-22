"""Database package — DuckDB data ingestion layer.

Modules:
    db_manager      : DuckDB connection & table management
    file_loader     : CSV / Excel file reading
    schema_detector : DataFrame schema analysis & DDL generation
    query_executor  : SQL query execution with structured results
    data_quality    : Data quality analysis engine
"""

from database.db_manager import DatabaseManager
from database.file_loader import load_file, FileLoadError
from database.schema_detector import detect_schema, get_data_quality_report
from database.query_executor import QueryExecutor
from database.data_quality import DataQualityAnalyzer, analyze_dataframe, QualityReport

__all__ = [
    "DatabaseManager",
    "load_file",
    "FileLoadError",
    "detect_schema",
    "get_data_quality_report",
    "QueryExecutor",
    "DataQualityAnalyzer",
    "analyze_dataframe",
    "QualityReport",
]
