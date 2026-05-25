"""Statistical Anomaly Detection Engine — 纯 Python 统计异常检测。

提供:
- Z-score 检测（正态分布）
- IQR 检测（偏斜分布）
- Auto 模式（自动选择最佳方法）
- 无 LLM 依赖，可独立测试
"""

import math
from typing import Any


def detect_anomalies(
    data: list[dict],
    columns: list[str] | None = None,
    method: str = "auto",
    z_threshold: float = 3.0,
    iqr_multiplier: float = 1.5,
) -> dict:
    """检测数据中的统计异常。

    Args:
        data: 查询结果行列表 (list[dict])
        columns: 要检测的列名列表，None 表示全部数值列
        method: "zscore" | "iqr" | "auto"
        z_threshold: z-score 阈值（默认 3.0）
        iqr_multiplier: IQR 倍数（默认 1.5）

    Returns:
        {
            "anomalies": [{"column", "row_index", "value", "expected_range", "deviation_score", "method"}],
            "summary": {"total_anomalies", "columns_affected", "anomaly_rate_pct"},
            "column_stats": {"col": {"mean", "std", "q25", "q75", "min", "max", "count", "null_count"}}
        }
    """
    if not data:
        return _empty_result()

    # 确定要检测的列
    if columns is None:
        columns = _detect_numeric_columns(data)

    if not columns:
        return _empty_result()

    anomalies: list[dict[str, Any]] = []
    column_stats: dict[str, dict[str, float]] = {}

    for col in columns:
        values, indices = _extract_numeric_values(data, col)
        if len(values) < 5:
            continue

        stats = _compute_stats(values)
        column_stats[col] = stats

        # 选择检测方法
        effective_method = method
        if method == "auto":
            skewness = _compute_skewness(values, stats["mean"], stats["std"])
            effective_method = "iqr" if abs(skewness) > 2 else "zscore"

        # 执行检测
        if effective_method == "zscore":
            col_anomalies = _detect_zscore(values, indices, col, stats, z_threshold)
        else:
            col_anomalies = _detect_iqr(values, indices, col, stats, iqr_multiplier)

        anomalies.extend(col_anomalies)

    total_rows = len(data)
    anomaly_rate = round(len(anomalies) / total_rows * 100, 2) if total_rows > 0 else 0.0
    columns_affected = sorted(set(a["column"] for a in anomalies))

    return {
        "anomalies": anomalies,
        "summary": {
            "total_anomalies": len(anomalies),
            "columns_affected": columns_affected,
            "anomaly_rate_pct": anomaly_rate,
        },
        "column_stats": column_stats,
    }


def _empty_result() -> dict:
    return {
        "anomalies": [],
        "summary": {"total_anomalies": 0, "columns_affected": [], "anomaly_rate_pct": 0.0},
        "column_stats": {},
    }


def _detect_numeric_columns(data: list[dict]) -> list[str]:
    """从数据中自动检测数值列。"""
    if not data:
        return []
    sample = data[0]
    numeric_cols = []
    for key, val in sample.items():
        if isinstance(val, (int, float)) and not isinstance(val, bool):
            numeric_cols.append(key)
    return numeric_cols


def _extract_numeric_values(data: list[dict], column: str) -> tuple[list[float], list[int]]:
    """提取列中的数值和对应行索引。"""
    values = []
    indices = []
    for i, row in enumerate(data):
        val = row.get(column)
        if isinstance(val, (int, float)) and not isinstance(val, bool):
            if not (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
                values.append(float(val))
                indices.append(i)
    return values, indices


def _compute_stats(values: list[float]) -> dict[str, float]:
    """计算基本统计量。"""
    n = len(values)
    if n == 0:
        return {"mean": 0.0, "std": 0.0, "q25": 0.0, "q75": 0.0, "min": 0.0, "max": 0.0, "count": 0, "null_count": 0}

    mean = sum(values) / n
    variance = sum((v - mean) ** 2 for v in values) / n
    std = math.sqrt(variance)

    sorted_vals = sorted(values)
    q25 = _percentile(sorted_vals, 25)
    q75 = _percentile(sorted_vals, 75)

    return {
        "mean": round(mean, 4),
        "std": round(std, 4),
        "q25": round(q25, 4),
        "q75": round(q75, 4),
        "min": round(sorted_vals[0], 4),
        "max": round(sorted_vals[-1], 4),
        "count": n,
        "null_count": 0,
    }


def _percentile(sorted_vals: list[float], pct: float) -> float:
    """计算百分位数（线性插值）。"""
    n = len(sorted_vals)
    if n == 0:
        return 0.0
    k = (n - 1) * pct / 100.0
    f = int(k)
    c = f + 1 if f + 1 < n else f
    return sorted_vals[f] + (k - f) * (sorted_vals[c] - sorted_vals[f])


def _compute_skewness(values: list[float], mean: float, std: float) -> float:
    """计算偏度（Fisher）。"""
    if std == 0 or len(values) < 3:
        return 0.0
    n = len(values)
    m3 = sum((v - mean) ** 3 for v in values) / n
    return m3 / (std ** 3)


def _detect_zscore(
    values: list[float],
    indices: list[int],
    column: str,
    stats: dict,
    threshold: float,
) -> list[dict]:
    """Z-score 异常检测。"""
    anomalies = []
    mean = stats["mean"]
    std = stats["std"]

    if std == 0:
        return anomalies

    for val, idx in zip(values, indices):
        z = abs(val - mean) / std
        if z > threshold:
            anomalies.append({
                "column": column,
                "row_index": idx,
                "value": round(val, 4),
                "expected_range": [round(mean - threshold * std, 4), round(mean + threshold * std, 4)],
                "deviation_score": round(z, 2),
                "method": "zscore",
            })

    return anomalies


def _detect_iqr(
    values: list[float],
    indices: list[int],
    column: str,
    stats: dict,
    multiplier: float,
) -> list[dict]:
    """IQR 异常检测。"""
    anomalies = []
    q25 = stats["q25"]
    q75 = stats["q75"]
    iqr = q75 - q25

    if iqr == 0:
        return anomalies

    lower = q25 - multiplier * iqr
    upper = q75 + multiplier * iqr

    for val, idx in zip(values, indices):
        if val < lower or val > upper:
            # 计算偏离分数（以 IQR 为单位）
            if val < lower:
                deviation = (lower - val) / iqr
            else:
                deviation = (val - upper) / iqr

            anomalies.append({
                "column": column,
                "row_index": idx,
                "value": round(val, 4),
                "expected_range": [round(lower, 4), round(upper, 4)],
                "deviation_score": round(deviation, 2),
                "method": "iqr",
            })

    return anomalies
