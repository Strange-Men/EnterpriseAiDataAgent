"""Data Quality Analysis Engine.

Enterprise-grade data quality detection:
  - Missing value analysis
  - Duplicate detection
  - Outlier detection (IQR)
  - Type anomaly detection
  - Field completeness analysis
  - Quality scoring (0-100)

Designed for Agent integration and 50k+ row performance.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field


# ── Thresholds ──────────────────────────────────────────────────

HIGH_NULL_THRESHOLD = 15.0       # % — trigger warning
OUTLIER_IQR_FACTOR = 1.5         # standard IQR multiplier
LOW_CARDINALITY_RATIO = 0.01     # unique/total below this = low cardinality
HIGH_CARDINALITY_RATIO = 0.95    # unique/total above this = high cardinality
CONSTANT_RATIO = 1               # only 1 unique value


@dataclass
class FieldHealth:
    """Health status for a single column."""
    name: str
    dtype: str
    null_count: int = 0
    null_pct: float = 0.0
    unique_count: int = 0
    unique_ratio: float = 0.0
    is_empty: bool = False
    is_constant: bool = False
    is_high_cardinality: bool = False
    is_low_cardinality: bool = False
    outlier_count: int = 0
    outlier_pct: float = 0.0
    type_anomaly_count: int = 0
    warnings: list = field(default_factory=list)
    score: float = 100.0


@dataclass
class QualityReport:
    """Full data quality report."""
    total_rows: int = 0
    total_columns: int = 0
    total_cells: int = 0

    # Scores (0-100)
    completeness_score: float = 100.0
    consistency_score: float = 100.0
    validity_score: float = 100.0
    uniqueness_score: float = 100.0
    overall_score: float = 100.0

    # Missing values
    null_cells: int = 0
    null_pct: float = 0.0
    missing_by_column: dict = field(default_factory=dict)

    # Duplicates
    duplicate_rows: int = 0
    duplicate_pct: float = 0.0
    duplicate_candidate_keys: list = field(default_factory=list)

    # Outliers
    total_outliers: int = 0
    outliers_by_column: dict = field(default_factory=dict)

    # Type anomalies
    type_anomalies: dict = field(default_factory=dict)

    # Field health
    field_health: list = field(default_factory=list)
    empty_columns: list = field(default_factory=list)
    constant_columns: list = field(default_factory=list)

    # Warnings (aggregated)
    warnings: list = field(default_factory=list)


class DataQualityAnalyzer:
    """Analyze DataFrame quality and produce structured reports."""

    def __init__(self, max_rows: int = 50000):
        self.max_rows = max_rows

    def analyze(self, df: pd.DataFrame) -> QualityReport:
        """Run all quality checks on a DataFrame.

        For DataFrames larger than max_rows, a random sample is analysed
        for outlier/type checks (exact counts for nulls/duplicates).
        """
        report = QualityReport()

        if df is None or df.empty:
            report.warnings.append("DataFrame is empty.")
            report.overall_score = 0
            return report

        report.total_rows = len(df)
        report.total_columns = len(df.columns)
        report.total_cells = df.shape[0] * df.shape[1]

        # Use sample for expensive operations
        sample = df
        sample_ratio = 1.0
        if len(df) > self.max_rows:
            sample = df.sample(n=self.max_rows, random_state=42)
            sample_ratio = self.max_rows / len(df)

        # 1. Missing values
        self._analyze_missing(df, report)

        # 2. Duplicates
        self._analyze_duplicates(df, report)

        # 3. Outliers (on sample)
        self._analyze_outliers(sample, report, sample_ratio)

        # 4. Type anomalies (on sample)
        self._analyze_type_anomalies(sample, report)

        # 5. Field completeness
        self._analyze_field_health(df, sample, report)

        # 6. Scores
        self._compute_scores(report)

        return report

    # ── 1. Missing Values ───────────────────────────────────────

    def _analyze_missing(self, df: pd.DataFrame, report: QualityReport):
        null_counts = df.isna().sum()
        report.null_cells = int(null_counts.sum())
        report.null_pct = round(report.null_cells / report.total_cells * 100, 2) if report.total_cells else 0

        for col in df.columns:
            n = int(null_counts[col])
            pct = round(n / len(df) * 100, 2) if len(df) else 0
            report.missing_by_column[str(col)] = {"count": n, "pct": pct}
            if pct >= HIGH_NULL_THRESHOLD:
                report.warnings.append(f"High missing rate: {col} ({pct}%)")

    # ── 2. Duplicates ───────────────────────────────────────────

    def _analyze_duplicates(self, df: pd.DataFrame, report: QualityReport):
        report.duplicate_rows = int(df.duplicated().sum())
        report.duplicate_pct = round(report.duplicate_rows / len(df) * 100, 2) if len(df) else 0

        if report.duplicate_rows > 0:
            report.warnings.append(f"Duplicate rows detected: {report.duplicate_rows} ({report.duplicate_pct}%)")

        # Candidate primary keys (columns with unique ratio ~1.0)
        for col in df.columns:
            if df[col].nunique() == len(df) and df[col].notna().all():
                report.duplicate_candidate_keys.append(str(col))

    # ── 3. Outliers (IQR) ───────────────────────────────────────

    def _analyze_outliers(self, df: pd.DataFrame, report: QualityReport, sample_ratio: float):
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        total_outliers = 0

        for col in numeric_cols:
            series = df[col].dropna()
            if len(series) < 4:
                continue

            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1

            if iqr == 0:
                continue

            lower = q1 - OUTLIER_IQR_FACTOR * iqr
            upper = q3 + OUTLIER_IQR_FACTOR * iqr
            outlier_mask = (series < lower) | (series > upper)
            count = int(outlier_mask.sum())

            # Scale up if sampled
            estimated_count = int(count / sample_ratio) if sample_ratio < 1 else count
            pct = round(estimated_count / len(df) * 100, 2)

            report.outliers_by_column[str(col)] = {
                "count": estimated_count,
                "pct": pct,
                "lower_bound": round(lower, 2),
                "upper_bound": round(upper, 2),
            }
            total_outliers += estimated_count

            if pct > 3:
                report.warnings.append(f"High outlier rate: {col} ({pct}%)")

        report.total_outliers = total_outliers

    # ── 4. Type Anomalies ───────────────────────────────────────

    def _analyze_type_anomalies(self, df: pd.DataFrame, report: QualityReport):
        for col in df.columns:
            series = df[col].dropna()
            if series.empty:
                continue

            col_name = str(col)
            anomaly_count = 0
            dtype_str = str(df[col].dtype)

            if dtype_str == "object":
                # Try to detect if it should be numeric
                numeric_parsed = pd.to_numeric(series, errors="coerce")
                non_numeric = series[numeric_parsed.isna() & series.notna()]
                # Check if most values are numeric
                if len(non_numeric) < len(series) * 0.1 and len(non_numeric) > 0:
                    anomaly_count = len(non_numeric)
                    report.type_anomalies[col_name] = {
                        "expected": "numeric",
                        "anomaly_count": anomaly_count,
                        "samples": [str(v) for v in non_numeric.head(3)],
                    }
                    report.warnings.append(f"Type anomaly: {col_name} contains mixed text/numeric values")

        # Detect date columns stored as strings
        for col in df.select_dtypes(include=["object"]).columns:
            series = df[col].dropna().head(200)
            date_count = 0
            for val in series:
                if _looks_like_date(str(val)):
                    date_count += 1
            if date_count > len(series) * 0.8 and len(series) > 5:
                col_name = str(col)
                if col_name not in report.type_anomalies:
                    report.type_anomalies[col_name] = {
                        "expected": "datetime",
                        "anomaly_count": 0,
                        "hint": "Column appears to contain dates stored as strings",
                    }

    # ── 5. Field Health ─────────────────────────────────────────

    def _analyze_field_health(self, df: pd.DataFrame, sample: pd.DataFrame, report: QualityReport):
        for col in df.columns:
            col_name = str(col)
            series = df[col]
            n = len(df)
            null_count = int(series.isna().sum())
            null_pct = round(null_count / n * 100, 2) if n else 0
            unique_count = int(series.nunique())
            unique_ratio = round(unique_count / n, 4) if n else 0

            health = FieldHealth(
                name=col_name,
                dtype=str(series.dtype),
                null_count=null_count,
                null_pct=null_pct,
                unique_count=unique_count,
                unique_ratio=unique_ratio,
                is_empty=(null_count == n),
                is_constant=(unique_count <= CONSTANT_RATIO and null_count < n),
                is_high_cardinality=(unique_ratio >= HIGH_CARDINALITY_RATIO and n > 10),
                is_low_cardinality=(unique_ratio <= LOW_CARDINALITY_RATIO and n > 10),
            )

            # Outlier info for numeric columns
            if col_name in report.outliers_by_column:
                info = report.outliers_by_column[col_name]
                health.outlier_count = info["count"]
                health.outlier_pct = info["pct"]

            # Type anomaly info
            if col_name in report.type_anomalies:
                health.type_anomaly_count = report.type_anomalies[col_name]["anomaly_count"]

            # Generate warnings
            if health.is_empty:
                health.warnings.append("Column is entirely empty")
                report.empty_columns.append(col_name)
            if health.is_constant:
                health.warnings.append(f"Constant value: only {unique_count} unique")
                report.constant_columns.append(col_name)
            if null_pct >= HIGH_NULL_THRESHOLD:
                health.warnings.append(f"High null rate: {null_pct}%")
            if health.outlier_pct > 3:
                health.warnings.append(f"High outlier rate: {health.outlier_pct}%")

            # Field-level score
            health.score = _field_score(health)

            report.field_health.append(health)

    # ── 6. Scoring ──────────────────────────────────────────────

    def _compute_scores(self, report: QualityReport):
        if report.total_cells == 0:
            report.overall_score = 0
            return

        # Completeness: penalise missing values
        report.completeness_score = round(
            max(0, 100 - (report.null_cells / report.total_cells * 100) * 2), 1
        )

        # Consistency: penalise type anomalies
        anomaly_cells = sum(
            v.get("anomaly_count", 0) for v in report.type_anomalies.values()
        )
        report.consistency_score = round(
            max(0, 100 - (anomaly_cells / report.total_rows * 100) * 3) if report.total_rows else 100, 1
        )

        # Validity: penalise outliers
        report.validity_score = round(
            max(0, 100 - (report.total_outliers / report.total_rows * 100) * 2) if report.total_rows else 100, 1
        )

        # Uniqueness: penalise duplicates
        report.uniqueness_score = round(
            max(0, 100 - report.duplicate_pct * 2), 1
        )

        # Overall: weighted average
        report.overall_score = round(
            report.completeness_score * 0.35
            + report.consistency_score * 0.25
            + report.validity_score * 0.20
            + report.uniqueness_score * 0.20,
            1,
        )


# ── Helpers ─────────────────────────────────────────────────────

def _field_score(health: FieldHealth) -> float:
    """Compute 0-100 score for a single field."""
    score = 100.0
    if health.is_empty:
        return 0.0
    if health.is_constant:
        score -= 30
    score -= min(40, health.null_pct * 1.5)
    score -= min(20, health.outlier_pct * 2)
    score -= min(15, health.type_anomaly_count / max(1, health.unique_count) * 100)
    return round(max(0, score), 1)


def _looks_like_date(val: str) -> bool:
    """Heuristic: does this string look like a date?"""
    import re
    patterns = [
        r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}",
        r"^\d{1,2}[-/]\d{1,2}[-/]\d{4}",
        r"^\d{4}年\d{1,2}月\d{1,2}日",
    ]
    return any(re.match(p, val) for p in patterns)


def analyze_dataframe(df: pd.DataFrame, max_rows: int = 50000) -> QualityReport:
    """Convenience function to analyze a DataFrame."""
    analyzer = DataQualityAnalyzer(max_rows=max_rows)
    return analyzer.analyze(df)
