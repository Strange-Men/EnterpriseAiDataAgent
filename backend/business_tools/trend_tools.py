"""Trend analysis tool."""

from __future__ import annotations

import pandas as pd
from database.db_manager import DatabaseManager

from backend.business_tools.models import TrendAnalysisInput, ToolResult
from backend.business_tools.query_utils import compute_metrics_for_frame, evidence_table, load_table_frame, missing_fields, partial_result, success_result


def trend_analysis(input_data: TrendAnalysisInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    missing = missing_fields(df, [input_data.date_field])
    if missing:
        return partial_result("trend_analysis", "缺少日期字段，无法做时间趋势。", missing, "请提供 order_date 或其它可解析日期字段。")
    work = df.copy()
    work[input_data.date_field] = pd.to_datetime(work[input_data.date_field], errors="coerce")
    work = work.dropna(subset=[input_data.date_field])
    work["period"] = work[input_data.date_field].dt.to_period("M").astype(str)
    rows = []
    for period, part in work.groupby("period"):
        _, metrics = compute_metrics_for_frame(part, input_data.metrics or None)
        metrics["period"] = period
        rows.append(metrics)
    trend = pd.DataFrame(rows).sort_values("period")
    direction = "flat"
    latest_comparison = {}
    if len(trend) >= 2 and "total_sales" in trend:
        prev = float(trend.iloc[-2]["total_sales"])
        latest = float(trend.iloc[-1]["total_sales"])
        delta = latest - prev
        direction = "up" if delta > 0 else "down" if delta < 0 else "flat"
        latest_comparison = {"previous_period": trend.iloc[-2]["period"], "latest_period": trend.iloc[-1]["period"], "sales_delta": round(delta, 2)}
    return success_result(
        "trend_analysis",
        f"已按月聚合 {len(trend)} 个周期，最近趋势为 {direction}。",
        tables=[evidence_table("Monthly trend", trend.tail(12), 12)],
        data={"trend_direction": direction, "latest_period_comparison": latest_comparison, "time_series": trend.to_dict(orient="records")},
    )
