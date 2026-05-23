"""Tests for Schema Detection module."""

import pytest
import pandas as pd
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.schema_detector import (
    detect_schema,
    generate_create_table_ddl,
    sanitize_table_name,
    get_data_quality_report,
    _map_dtype,
    _sample_values,
    _to_plain,
)


class TestMapDtype:
    def test_integer_types(self):
        assert _map_dtype(np.dtype("int64")) == "BIGINT"
        assert _map_dtype(np.dtype("int32")) == "INTEGER"
        assert _map_dtype(np.dtype("int16")) == "SMALLINT"
        assert _map_dtype(np.dtype("int8")) == "TINYINT"

    def test_float_types(self):
        assert _map_dtype(np.dtype("float64")) == "DOUBLE"
        assert _map_dtype(np.dtype("float32")) == "REAL"

    def test_bool_type(self):
        assert _map_dtype(np.dtype("bool")) == "BOOLEAN"

    def test_object_type(self):
        assert _map_dtype(np.dtype("object")) == "VARCHAR"

    def test_datetime_type(self):
        assert _map_dtype(np.dtype("datetime64[ns]")) == "TIMESTAMP"

    def test_unknown_type_returns_varchar(self):
        assert _map_dtype(np.dtype("complex128")) == "VARCHAR"

    def test_datetime64_prefix(self):
        assert _map_dtype(np.dtype("datetime64[us]")) == "TIMESTAMP"


class TestToPlain:
    def test_numpy_integer(self):
        assert _to_plain(np.int64(42)) == 42
        assert isinstance(_to_plain(np.int64(42)), int)

    def test_numpy_float(self):
        result = _to_plain(np.float64(3.14))
        assert result == 3.14
        assert isinstance(result, float)

    def test_numpy_bool(self):
        assert _to_plain(np.bool_(True)) is True
        assert _to_plain(np.bool_(False)) is False

    def test_string_passthrough(self):
        assert _to_plain("hello") == "hello"

    def test_int_passthrough(self):
        assert _to_plain(42) == 42


class TestSampleValues:
    def test_sample_basic(self):
        series = pd.Series([1, 2, 3, 4, 5])
        samples = _sample_values(series, n=3)
        assert len(samples) == 3
        assert samples == [1, 2, 3]

    def test_sample_with_nulls(self):
        series = pd.Series([None, 1, None, 2, 3])
        samples = _sample_values(series, n=3)
        assert len(samples) == 3
        assert None not in samples

    def test_sample_fewer_than_n(self):
        series = pd.Series([1, 2])
        samples = _sample_values(series, n=5)
        assert len(samples) == 2


class TestDetectSchema:
    def test_basic_schema(self):
        df = pd.DataFrame({"id": [1, 2, 3], "name": ["a", "b", "c"]})
        schema = detect_schema(df)
        assert schema["row_count"] == 3
        assert schema["col_count"] == 2
        assert len(schema["columns"]) == 2

    def test_column_names(self):
        df = pd.DataFrame({"user_id": [1], "email": ["test@test.com"]})
        schema = detect_schema(df)
        names = [c["name"] for c in schema["columns"]]
        assert "user_id" in names
        assert "email" in names

    def test_nullable_detection(self):
        df = pd.DataFrame({"nullable": [1, None, 3], "not_null": [1, 2, 3]})
        schema = detect_schema(df)
        col_map = {c["name"]: c for c in schema["columns"]}
        assert col_map["nullable"]["nullable"] is True
        assert col_map["not_null"]["nullable"] is False

    def test_null_count(self):
        df = pd.DataFrame({"col": [1, None, None, 4]})
        schema = detect_schema(df)
        col = schema["columns"][0]
        assert col["null_count"] == 2

    def test_unique_count(self):
        df = pd.DataFrame({"col": [1, 2, 2, 3, 3]})
        schema = detect_schema(df)
        col = schema["columns"][0]
        assert col["unique_count"] == 3

    def test_duckdb_type_mapping(self):
        df = pd.DataFrame({
            "int_col": pd.array([1, 2], dtype="int64"),
            "float_col": pd.array([1.0, 2.0], dtype="float64"),
            "str_col": ["a", "b"],
            "bool_col": [True, False],
        })
        schema = detect_schema(df)
        type_map = {c["name"]: c["duckdb_type"] for c in schema["columns"]}
        assert type_map["int_col"] == "BIGINT"
        assert type_map["float_col"] == "DOUBLE"
        assert type_map["str_col"] == "VARCHAR"
        assert type_map["bool_col"] == "BOOLEAN"

    def test_empty_dataframe(self):
        df = pd.DataFrame()
        schema = detect_schema(df)
        assert schema["row_count"] == 0
        assert schema["col_count"] == 0
        assert schema["columns"] == []


class TestGenerateCreateTableDdl:
    def test_basic_ddl(self):
        df = pd.DataFrame({"id": [1, 2], "name": ["a", "b"]})
        ddl = generate_create_table_ddl("users", df)
        assert 'CREATE TABLE IF NOT EXISTS "users"' in ddl
        assert '"id"' in ddl
        assert '"name"' in ddl

    def test_nullable_column(self):
        df = pd.DataFrame({"col": [1, None, 3]})
        ddl = generate_create_table_ddl("test", df)
        # nullable columns should NOT have NOT NULL
        assert "NOT NULL" not in ddl

    def test_not_null_column(self):
        df = pd.DataFrame({"col": [1, 2, 3]})
        ddl = generate_create_table_ddl("test", df)
        assert "NOT NULL" in ddl

    def test_semicolon_terminated(self):
        df = pd.DataFrame({"a": [1]})
        ddl = generate_create_table_ddl("t", df)
        assert ddl.rstrip().endswith(");")


class TestSanitizeTableName:
    def test_basic(self):
        assert sanitize_table_name("my_file.csv") == "my_file"

    def test_uppercase_to_lowercase(self):
        assert sanitize_table_name("MyData.xlsx") == "mydata"

    def test_special_chars(self):
        result = sanitize_table_name("my data (2024).csv")
        assert "_" in result
        assert " " not in result
        assert "(" not in result

    def test_starts_with_digit(self):
        result = sanitize_table_name("2024_data.csv")
        assert result.startswith("t_")

    def test_empty_string(self):
        result = sanitize_table_name("")
        assert result == "unnamed_table"

    def test_only_extension(self):
        result = sanitize_table_name(".csv")
        assert result == "unnamed_table"


class TestGetDataQualityReport:
    def test_basic_report(self):
        df = pd.DataFrame({"a": [1, 2, 3], "b": ["x", "y", "z"]})
        report = get_data_quality_report(df)
        assert report["total_rows"] == 3
        assert report["total_columns"] == 2
        assert report["total_cells"] == 6
        assert report["null_cells"] == 0
        assert report["null_percentage"] == 0
        assert report["duplicate_rows"] == 0

    def test_with_nulls(self):
        df = pd.DataFrame({"a": [1, None, 3]})
        report = get_data_quality_report(df)
        assert report["null_cells"] == 1
        assert report["null_percentage"] > 0

    def test_with_duplicates(self):
        df = pd.DataFrame({"a": [1, 1, 2]})
        report = get_data_quality_report(df)
        assert report["duplicate_rows"] == 1

    def test_column_details(self):
        df = pd.DataFrame({"id": [1, 2, 3], "name": ["a", None, "c"]})
        report = get_data_quality_report(df)
        assert "id" in report["columns"]
        assert report["columns"]["id"]["null_count"] == 0
        assert report["columns"]["name"]["null_count"] == 1

    def test_empty_dataframe(self):
        df = pd.DataFrame()
        report = get_data_quality_report(df)
        assert report["total_rows"] == 0
