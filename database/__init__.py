"""Database package — DuckDB data ingestion layer.

Modules:
    db_manager      : DuckDB connection & table management
    file_loader     : CSV / Excel file reading
    schema_detector : DataFrame schema analysis & DDL generation
    query_executor  : SQL query execution with structured results
"""

from database.db_manager import DatabaseManager
from database.file_loader import load_file, FileLoadError
from database.schema_detector import detect_schema, get_data_quality_report
from database.query_executor import QueryExecutor

__all__ = [
    "DatabaseManager",
    "load_file",
    "FileLoadError",
    "detect_schema",
    "get_data_quality_report",
    "QueryExecutor",
]
