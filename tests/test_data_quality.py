"""Tests for Data Quality Analysis module."""

import pytest
import pandas as pd
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.data_quality import (
    DataQualityAnalyzer,
    analyze_dataframe,
    FieldHealth,
    QualityReport,
    _field_score,
    _looks_like_date,
)


class TestLooksLikeDate:
    def test_iso_date(self):
        assert _looks_like_date("2024-01-15") is True

    def test_slash_date(self):
        assert _looks_like_date("2024/01/15") is True

    def test_us_date(self):
        assert _looks_like_date("01/15/2024") is True

    def test_chinese_date(self):
        assert _looks_like_date("2024年1月15日") is True

    def test_not_date(self):
        assert _looks_like_date("hello") is False

    def test_number_string(self):
        assert _looks_like_date("12345") is False

    def test_empty_string(self):
        assert _looks_like_date("") is False


class TestFieldScore:
    def test_perfect_score(self):
        health = FieldHealth(name="col", dtype="int64")
        score = _field_score(health)
        assert score == 100.0

    def test_empty_field(self):
        health = FieldHealth(name="col", dtype="int64", is_empty=True)
        score = _field_score(health)
        assert score == 0.0

    def test_constant_field(self):
        health = FieldHealth(name="col", dtype="int64", is_constant=True, unique_count=1)
        score = _field_score(health)
        assert score == 70.0  # 100 - 30

    def test_high_null_penalty(self):
        health = FieldHealth(name="col", dtype="int64", null_pct=50.0, unique_count=10)
        score = _field_score(health)
        # penalty = min(40, 50 * 1.5) = 40
        assert score == 60.0

    def test_outlier_penalty(self):
        health = FieldHealth(name="col", dtype="float64", outlier_pct=10.0, unique_count=10)
        score = _field_score(health)
        # penalty = min(20, 10 * 2) = 20
        assert score == 80.0


class TestDataQualityAnalyzer:
    def test_empty_dataframe(self):
        analyzer = DataQualityAnalyzer()
        df = pd.DataFrame()
        report = analyzer.analyze(df)
        assert report.overall_score == 0
        assert "empty" in report.warnings[0].lower()

    def test_none_dataframe(self):
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(None)
        assert report.overall_score == 0

    def test_perfect_data(self):
        df = pd.DataFrame({"id": range(100), "value": np.random.rand(100)})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert report.total_rows == 100
        assert report.total_columns == 2
        assert report.null_cells == 0
        assert report.duplicate_rows == 0
        assert report.overall_score > 90

    def test_missing_values(self):
        df = pd.DataFrame({"col": [1, None, None, 4, 5]})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert report.null_cells == 2
        assert report.null_pct > 0
        assert report.completeness_score < 100

    def test_duplicate_rows(self):
        df = pd.DataFrame({"a": [1, 1, 1, 2, 3], "b": ["x", "x", "x", "y", "z"]})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert report.duplicate_rows == 2
        assert report.uniqueness_score < 100

    def test_outlier_detection(self):
        # Create data with clear outliers
        np.random.seed(42)
        normal = np.random.normal(50, 5, 100)
        values = list(normal) + [200, 300, -100]  # outliers
        df = pd.DataFrame({"value": values})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert report.total_outliers > 0
        assert "value" in report.outliers_by_column

    def test_constant_column(self):
        df = pd.DataFrame({"const": ["same"] * 20, "var": range(20)})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert "const" in report.constant_columns

    def test_empty_column(self):
        df = pd.DataFrame({"empty": [None] * 10, "full": range(10)})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert "empty" in report.empty_columns

    def test_field_health_generated(self):
        df = pd.DataFrame({"a": [1, 2, 3], "b": ["x", "y", "z"]})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert len(report.field_health) == 2
        names = [fh.name for fh in report.field_health]
        assert "a" in names
        assert "b" in names

    def test_scoring_weights(self):
        df = pd.DataFrame({"id": range(100), "value": np.random.rand(100)})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        # Overall should be weighted average of components
        expected = round(
            report.completeness_score * 0.35
            + report.consistency_score * 0.25
            + report.validity_score * 0.20
            + report.uniqueness_score * 0.20,
            1,
        )
        assert report.overall_score == expected

    def test_high_null_warning(self):
        # Create column with > 15% nulls
        data = [1] * 50 + [None] * 20
        df = pd.DataFrame({"col": data})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        has_null_warning = any("High missing rate" in w or "High null rate" in w for w in report.warnings)
        assert has_null_warning

    def test_large_dataframe_sampling(self):
        # Test that large DataFrames are sampled correctly
        df = pd.DataFrame({"value": np.random.rand(60000)})
        analyzer = DataQualityAnalyzer(max_rows=10000)
        report = analyzer.analyze(df)
        assert report.total_rows == 60000

    def test_candidate_primary_keys(self):
        df = pd.DataFrame({"id": range(10), "name": [f"user_{i}" for i in range(10)]})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert "id" in report.duplicate_candidate_keys

    def test_type_anomaly_detection(self):
        # Column with >90% numeric-like strings but a few non-numeric
        # The detector triggers when len(non_numeric) < len(series) * 0.1 and > 0
        # With 100 rows, need 1-9 non-numeric out of 100
        data = [str(i) for i in range(95)] + ["abc", "def", "ghi", "jkl", "mno"]
        df = pd.DataFrame({"mixed": data})
        analyzer = DataQualityAnalyzer()
        report = analyzer.analyze(df)
        assert "mixed" in report.type_anomalies
        assert report.type_anomalies["mixed"]["expected"] == "numeric"


class TestAnalyzeDataframe:
    def test_convenience_function(self):
        df = pd.DataFrame({"a": [1, 2, 3]})
        report = analyze_dataframe(df)
        assert isinstance(report, QualityReport)
        assert report.total_rows == 3

    def test_custom_max_rows(self):
        df = pd.DataFrame({"a": range(100)})
        report = analyze_dataframe(df, max_rows=50)
        assert report.total_rows == 100  # total_rows still correct
