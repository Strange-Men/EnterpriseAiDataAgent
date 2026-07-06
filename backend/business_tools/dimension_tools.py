"""Dimension comparison tools."""

from __future__ import annotations

from database.db_manager import DatabaseManager

from backend.business_tools.models import DimensionAnalysisInput, ToolResult
from backend.business_tools.query_utils import evidence_table, grouped_metrics, load_table_frame, missing_fields, partial_result, success_result


def compare_by_dimension(input_data: DimensionAnalysisInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    missing = missing_fields(df, [input_data.dimension])
    if missing:
        return partial_result("compare_by_dimension", "缺少分组维度，无法做维度对比。", missing, "请改用 region / category / ad_channel / city_level 等可用维度。")
    grouped = grouped_metrics(df, input_data.dimension, input_data.metrics or None)
    top_rows = grouped.head(input_data.n)
    bottom_rows = grouped.tail(input_data.n).sort_values("total_sales", ascending=True) if "total_sales" in grouped else grouped.tail(input_data.n)
    return success_result(
        "compare_by_dimension",
        f"已按 {input_data.dimension} 对比 {len(grouped)} 个对象，返回 Top/Bottom evidence。",
        tables=[
            evidence_table(f"Top {input_data.dimension}", top_rows, input_data.n),
            evidence_table(f"Bottom {input_data.dimension}", bottom_rows, input_data.n),
        ],
        data={"dimension": input_data.dimension, "group_count": len(grouped), "grouped_metrics": grouped.head(50).to_dict(orient="records")},
    )


def top_bottom_analysis(input_data: DimensionAnalysisInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    missing = missing_fields(df, [input_data.dimension])
    if missing:
        return partial_result("top_bottom_analysis", "缺少分组维度，无法做 Top/Bottom 分析。", missing, "请改用当前表中存在的维度。")
    metric = input_data.metrics[0] if input_data.metrics else "total_sales"
    grouped = grouped_metrics(df, input_data.dimension, [metric] if metric != "total_sales" else None)
    if metric not in grouped.columns:
        return partial_result("top_bottom_analysis", f"缺少指标 {metric}，无法排序。", [metric], "请改用 total_sales / refund_rate / gross_margin_rate 等可计算指标。")
    sorted_grouped = grouped.sort_values(metric, ascending=False)
    top_rows = sorted_grouped.head(input_data.n)
    bottom_rows = sorted_grouped.tail(input_data.n).sort_values(metric, ascending=True)
    contribution = top_rows["total_sales"].sum() / grouped["total_sales"].sum() if "total_sales" in grouped and grouped["total_sales"].sum() else None
    return success_result(
        "top_bottom_analysis",
        f"已按 {input_data.dimension} 的 {metric} 找出 Top/Bottom 对象。",
        tables=[
            evidence_table(f"Top {input_data.n} by {metric}", top_rows, input_data.n),
            evidence_table(f"Bottom {input_data.n} by {metric}", bottom_rows, input_data.n),
        ],
        data={"metric": metric, "top_contribution": contribution, "top_rows": top_rows.to_dict(orient="records")},
    )
