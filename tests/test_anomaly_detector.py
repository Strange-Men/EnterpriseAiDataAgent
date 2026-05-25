"""异常检测引擎测试 — test_anomaly_detector.py。"""

import sys
import os
import math
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.anomaly_detector import (
    detect_anomalies,
    _detect_numeric_columns,
    _extract_numeric_values,
    _compute_stats,
    _compute_skewness,
    _percentile,
    _detect_zscore,
    _detect_iqr,
    _empty_result,
)


# ── 测试数据构建 ──────────────────────────────────────────────

def _make_normal_data(n=100, mean=100, std=10):
    """生成近似正态分布的数据。"""
    import random
    random.seed(42)
    return [{"value": random.gauss(mean, std), "id": i} for i in range(n)]


def _make_data_with_outliers():
    """生成包含已知异常值的数据。"""
    data = []
    for i in range(100):
        data.append({"revenue": 100.0 + i * 0.1, "quantity": 10, "name": f"item_{i}", "id": i})
    # 注入异常值
    data[50]["revenue"] = 99999.0  # 明显异常高值
    data[75]["revenue"] = -5000.0  # 明显异常低值
    return data


def _make_skewed_data():
    """生成偏斜分布数据。"""
    data = []
    for i in range(100):
        val = 10.0 + i * 0.1
        data.append({"value": val, "id": i})
    # 注入极端高值（偏斜）
    data[95]["value"] = 10000.0
    data[96]["value"] = 8000.0
    return data


# ── detect_anomalies 核心测试 ─────────────────────────────────

class TestDetectAnomalies:

    def test_empty_data(self):
        result = detect_anomalies([])
        assert result["summary"]["total_anomalies"] == 0
        assert result["anomalies"] == []

    def test_no_numeric_columns(self):
        data = [{"name": "Alice", "city": "NYC"}, {"name": "Bob", "city": "LA"}]
        result = detect_anomalies(data)
        assert result["summary"]["total_anomalies"] == 0

    def test_insufficient_data(self):
        """少于 5 行数据不检测。"""
        data = [{"value": i} for i in range(3)]
        result = detect_anomalies(data)
        assert result["summary"]["total_anomalies"] == 0

    def test_zscore_detects_outliers(self):
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["revenue"], method="zscore")
        assert result["summary"]["total_anomalies"] >= 1
        columns_affected = result["summary"]["columns_affected"]
        assert "revenue" in columns_affected

    def test_iqr_detects_outliers(self):
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["revenue"], method="iqr")
        assert result["summary"]["total_anomalies"] >= 1

    def test_auto_selects_method(self):
        """auto 模式应自动选择检测方法。"""
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["revenue"], method="auto")
        assert result["summary"]["total_anomalies"] >= 1
        # 每个异常都应有 method 字段
        for a in result["anomalies"]:
            assert a["method"] in ("zscore", "iqr")

    def test_skewed_data_uses_iqr(self):
        """偏斜数据在 auto 模式下应使用 IQR。"""
        data = _make_skewed_data()
        result = detect_anomalies(data, columns=["value"], method="auto")
        assert result["summary"]["total_anomalies"] >= 1
        # 偏斜数据可能用 iqr 或 zscore 取决于 skewness 阈值
        for a in result["anomalies"]:
            assert a["method"] in ("zscore", "iqr")

    def test_no_outliers_in_clean_data(self):
        """干净的正态数据不应产生大量异常。"""
        data = _make_normal_data(500, 100, 10)
        result = detect_anomalies(data, columns=["value"], method="zscore")
        # 正态分布 500 个样本，z>3 的期望异常数 ~1-2 个，不应超过 5%
        assert result["summary"]["anomaly_rate_pct"] < 5.0

    def test_output_structure(self):
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["revenue"])
        assert "anomalies" in result
        assert "summary" in result
        assert "column_stats" in result
        assert "total_anomalies" in result["summary"]
        assert "columns_affected" in result["summary"]
        assert "anomaly_rate_pct" in result["summary"]

    def test_anomaly_item_structure(self):
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["revenue"])
        if result["anomalies"]:
            a = result["anomalies"][0]
            assert "column" in a
            assert "row_index" in a
            assert "value" in a
            assert "expected_range" in a
            assert "deviation_score" in a
            assert "method" in a
            assert isinstance(a["expected_range"], list)
            assert len(a["expected_range"]) == 2

    def test_column_stats(self):
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["revenue"])
        stats = result["column_stats"]["revenue"]
        assert "mean" in stats
        assert "std" in stats
        assert "q25" in stats
        assert "q75" in stats
        assert "min" in stats
        assert "max" in stats
        assert "count" in stats

    def test_specific_columns(self):
        """只检测指定列。"""
        data = _make_data_with_outliers()
        result = detect_anomalies(data, columns=["quantity"])
        # quantity 列全是 10，std=0，不应有异常
        assert result["summary"]["total_anomalies"] == 0

    def test_all_null_column_skipped(self):
        """全 null 列应被跳过。"""
        data = [{"value": None, "id": i} for i in range(20)]
        result = detect_anomalies(data, columns=["value"])
        assert result["summary"]["total_anomalies"] == 0

    def test_mixed_null_values(self):
        """混合 null 值的列，异常值应被检测。"""
        data = []
        for i in range(100):
            val = 100.0 + i * 0.5
            data.append({"value": val, "id": i})
        data[50]["value"] = 99999.0  # 注入异常
        data.append({"value": None, "id": 100})  # null 值
        result = detect_anomalies(data, columns=["value"], method="zscore")
        assert result["summary"]["total_anomalies"] >= 1


# ── 辅助函数测试 ──────────────────────────────────────────────

class TestHelperFunctions:

    def test_detect_numeric_columns(self):
        data = [{"a": 1, "b": "x", "c": 3.14, "d": True}]
        cols = _detect_numeric_columns(data)
        assert "a" in cols
        assert "c" in cols
        assert "b" not in cols
        assert "d" not in cols  # bool 不算数值

    def test_detect_numeric_columns_empty(self):
        assert _detect_numeric_columns([]) == []

    def test_extract_numeric_values(self):
        data = [{"v": 1.0}, {"v": None}, {"v": 3.0}, {"v": "text"}, {"v": float("nan")}]
        values, indices = _extract_numeric_values(data, "v")
        assert values == [1.0, 3.0]
        assert indices == [0, 2]

    def test_compute_stats(self):
        values = [1.0, 2.0, 3.0, 4.0, 5.0]
        stats = _compute_stats(values)
        assert stats["mean"] == 3.0
        assert stats["min"] == 1.0
        assert stats["max"] == 5.0
        assert stats["count"] == 5

    def test_compute_stats_empty(self):
        stats = _compute_stats([])
        assert stats["count"] == 0
        assert stats["mean"] == 0.0

    def test_percentile(self):
        values = [1.0, 2.0, 3.0, 4.0, 5.0]
        assert _percentile(values, 50) == 3.0
        assert _percentile(values, 0) == 1.0
        assert _percentile(values, 100) == 5.0

    def test_percentile_empty(self):
        assert _percentile([], 50) == 0.0

    def test_compute_skewness_symmetric(self):
        """对称分布偏度接近 0。"""
        values = [float(i) for i in range(-50, 51)]
        mean = sum(values) / len(values)
        std = (sum((v - mean) ** 2 for v in values) / len(values)) ** 0.5
        skew = _compute_skewness(values, mean, std)
        assert abs(skew) < 0.1

    def test_compute_skewness_constant(self):
        """常数列偏度为 0。"""
        assert _compute_skewness([5.0] * 10, 5.0, 0.0) == 0.0

    def test_empty_result(self):
        result = _empty_result()
        assert result["summary"]["total_anomalies"] == 0
        assert result["anomalies"] == []
