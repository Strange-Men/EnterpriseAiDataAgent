"""Risk-oriented business analysis tools."""

from __future__ import annotations

from typing import Any

import pandas as pd
from database.db_manager import DatabaseManager

from backend.business_tools.models import (
    ChannelEffectivenessInput,
    CustomerProfileInput,
    MultiDimensionInput,
    RiskItem,
    RiskPriorityInput,
    ToolResult,
)
from backend.business_tools.query_utils import evidence_table, grouped_metrics, load_table_frame, missing_fields, partial_result, round_value, success_result
from backend.semantic import DEFAULT_THRESHOLDS
from backend.semantic.dynamic_thresholds import quantile


def _risk_level(score: float) -> str:
    return "high" if score >= 75 else "medium" if score >= 45 else "low"


def _dimension_risk_items(rows: list[dict[str, Any]], name_field: str, risk_name: str, score_fn: Any) -> list[RiskItem]:
    risks = []
    for row in rows:
        score, reason = score_fn(row)
        risks.append(
            RiskItem(
                risk_name=f"{risk_name}: {row.get(name_field)}",
                risk_level=_risk_level(score),
                priority_score=round_value(score, 2),
                reason=reason,
                evidence=row,
                impact=round_value(float(row.get("total_sales") or 0), 2),
                severity=round_value(score / 100, 4),
                confidence=0.82,
            )
        )
    return risks


def refund_risk_analysis(input_data: MultiDimensionInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    dimension = input_data.dimensions[0] if input_data.dimensions else "region"
    missing = missing_fields(df, [dimension, "refund_amount", "sales_amount", "is_returned"])
    if missing:
        return partial_result("refund_risk_analysis", "缺少退款风险字段，无法完整计算。", missing, "可替代看已存在的售后或投诉字段。")
    grouped = grouped_metrics(df, dimension)
    refund_threshold = DEFAULT_THRESHOLDS["refund_rate"].threshold
    dynamic = quantile(grouped["refund_rate"], 0.9)
    candidates = grouped[(grouped["refund_rate"] >= refund_threshold) | (grouped["refund_rate"] >= dynamic)].copy()
    if candidates.empty:
        candidates = grouped.sort_values("refund_rate", ascending=False).head(input_data.n)
    candidates = candidates.sort_values(["refund_rate", "total_sales"], ascending=False).head(input_data.n)

    def score_fn(row: dict[str, Any]) -> tuple[float, str]:
        score = min(100, (float(row.get("refund_rate") or 0) / max(refund_threshold, 0.01)) * 45 + float(row.get("sales_contribution") or 0) * 100)
        return score, "退款率高于默认或动态阈值，并结合销售贡献判断风险优先级。"

    rows = candidates.to_dict(orient="records")
    risks = _dimension_risk_items(rows, dimension, "退款风险", score_fn)
    result = success_result(
        "refund_risk_analysis",
        f"已按 {dimension} 识别退款风险对象，默认阈值 {refund_threshold:.0%}，动态 P90 {dynamic:.2%}。",
        tables=[evidence_table("Refund risk objects", candidates, input_data.n)],
        data={"dimension": dimension, "dynamic_threshold": dynamic, "top_risk_objects": rows},
    )
    result.risks = risks
    return result


def discount_risk_analysis(input_data: MultiDimensionInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    dimension = input_data.dimensions[0] if input_data.dimensions else "category"
    missing = missing_fields(df, [dimension, "discount", "profit_amount", "sales_amount"])
    if missing:
        return partial_result("discount_risk_analysis", "缺少折扣或利润字段，无法完整判断促销依赖。", missing, "可替代看销售额和退款率，但不能判断折扣依赖。")
    grouped = grouped_metrics(df, dimension)
    discount_threshold = DEFAULT_THRESHOLDS["avg_discount"].threshold
    margin_threshold = DEFAULT_THRESHOLDS["gross_margin_rate"].threshold
    candidates = grouped[(grouped["avg_discount"] > discount_threshold) & (grouped["gross_margin_rate"] < margin_threshold)]
    if candidates.empty:
        candidates = grouped.sort_values(["avg_discount", "gross_margin_rate"], ascending=[False, True]).head(input_data.n)
    candidates = candidates.head(input_data.n)

    def score_fn(row: dict[str, Any]) -> tuple[float, str]:
        score = min(100, float(row.get("avg_discount") or 0) * 120 + max(0, margin_threshold - float(row.get("gross_margin_rate") or 0)) * 180)
        return score, "高折扣叠加低毛利，存在促销依赖风险。"

    rows = candidates.to_dict(orient="records")
    result = success_result("discount_risk_analysis", f"已按 {dimension} 识别高折扣低毛利对象。", tables=[evidence_table("Discount dependency risk", candidates, input_data.n)], data={"dimension": dimension, "risk_objects": rows})
    result.risks = _dimension_risk_items(rows, dimension, "促销依赖风险", score_fn)
    return result


def profitability_analysis(input_data: MultiDimensionInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    dimension = input_data.dimensions[0] if input_data.dimensions else "product"
    missing = missing_fields(df, [dimension, "sales_amount", "profit_amount"])
    if missing:
        return partial_result("profitability_analysis", "缺少利润字段，无法判断利润质量。", missing, "可替代看销售额、退款率和折扣。")
    grouped = grouped_metrics(df, dimension).sort_values(["total_sales", "gross_margin_rate"], ascending=[False, True])
    high_sales_threshold = quantile(grouped["total_sales"], 0.75)
    low_margin_threshold = quantile(grouped["gross_margin_rate"], 0.25)
    candidates = grouped[(grouped["total_sales"] >= high_sales_threshold) & (grouped["gross_margin_rate"] <= low_margin_threshold)].head(input_data.n)
    if candidates.empty:
        candidates = grouped.head(input_data.n)
    rows = candidates.to_dict(orient="records")
    result = success_result("profitability_analysis", f"已按 {dimension} 识别高销售低利润对象。", tables=[evidence_table("High sales low profit", candidates, input_data.n)], data={"dimension": dimension, "high_sales_low_profit_objects": rows})
    result.risks = _dimension_risk_items(rows, dimension, "利润质量风险", lambda row: (min(100, abs(float(row.get("gross_margin_rate") or 0)) * 160 + 45), "销售贡献较高但毛利率偏低，需谨慎扩大投放。"))
    return result


def shipping_efficiency_analysis(input_data: MultiDimensionInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    dimension = input_data.dimensions[0] if input_data.dimensions else "region"
    missing = missing_fields(df, [dimension, "shipping_days"])
    if missing:
        return partial_result("shipping_efficiency_analysis", "缺少发货周期字段，无法判断履约效率。", missing, "可尝试用 ship_date - order_date 计算，但需校验日期。")
    grouped = grouped_metrics(df, dimension)
    delayed = df[pd.to_numeric(df["shipping_days"], errors="coerce") > DEFAULT_THRESHOLDS["avg_shipping_days"].threshold].groupby(dimension).size()
    grouped["delayed_order_count"] = grouped[dimension].map(delayed).fillna(0).astype(int)
    dynamic = quantile(grouped["avg_shipping_days"], 0.9)
    candidates = grouped[(grouped["avg_shipping_days"] >= dynamic) | (grouped["delayed_order_count"] > 0)].sort_values("avg_shipping_days", ascending=False).head(input_data.n)
    rows = candidates.to_dict(orient="records")
    result = success_result("shipping_efficiency_analysis", f"已按 {dimension} 检查发货效率，动态 P90 为 {dynamic:.2f} 天。", tables=[evidence_table("Shipping efficiency risk", candidates, input_data.n)], data={"dimension": dimension, "slow_shipping_objects": rows})
    result.risks = _dimension_risk_items(rows, dimension, "履约体验风险", lambda row: (min(100, float(row.get("avg_shipping_days") or 0) * 10 + float(row.get("complaint_rate") or 0) * 120), "发货周期偏长，并结合投诉率/满意度判断体验风险。"))
    return result


def customer_profile_analysis(input_data: CustomerProfileInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    existing = [field for field in input_data.fields if field in df.columns]
    missing = [field for field in input_data.fields if field not in df.columns]
    if not existing:
        return partial_result("customer_profile_analysis", "请求的人群画像字段均缺失。", missing, "可替代看 customer_segment 或 city_level。")
    dimension = existing[0]
    work = df.copy()
    if dimension == "customer_age":
        work["age_bucket"] = pd.cut(pd.to_numeric(work["customer_age"], errors="coerce"), bins=[0, 25, 35, 45, 100], labels=["<=25", "26-35", "36-45", "46+"])
        dimension = "age_bucket"
    grouped = grouped_metrics(work, dimension)
    preference = pd.DataFrame()
    if "category" in work.columns:
        preference = work.groupby([dimension, "category"], dropna=False, observed=False).size().reset_index(name="orders").sort_values("orders", ascending=False)
    result = success_result("customer_profile_analysis", f"已按 {dimension} 生成人群画像指标。", tables=[evidence_table("Customer segment metrics", grouped.head(input_data.n), input_data.n), evidence_table("Category preference", preference.head(input_data.n), input_data.n)], data={"dimension": dimension, "missing_fields": missing, "segment_metrics": grouped.head(50).to_dict(orient="records")})
    result.missing_fields = missing
    return result


def channel_effectiveness_analysis(input_data: ChannelEffectivenessInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    missing = missing_fields(df, [input_data.channel_field])
    if missing:
        return partial_result("channel_effectiveness_analysis", "缺少渠道字段，无法分析渠道效果。", missing, "可替代看地区 / 品类表现。")
    grouped = grouped_metrics(df, input_data.channel_field)
    candidates = grouped.sort_values(["order_count", "avg_satisfaction_score", "complaint_rate"], ascending=[False, True, False]).head(input_data.n)
    rows = candidates.to_dict(orient="records")
    result = success_result("channel_effectiveness_analysis", "已识别订单多但体验偏弱的渠道候选。", tables=[evidence_table("Channel effectiveness", candidates, input_data.n)], data={"channel_quality_summary": rows})
    result.risks = _dimension_risk_items(rows, input_data.channel_field, "渠道体验风险", lambda row: (min(100, float(row.get("order_count") or 0) / max(float(grouped["order_count"].max() or 1), 1) * 45 + float(row.get("complaint_rate") or 0) * 220 + max(0, 4.2 - float(row.get("avg_satisfaction_score") or 5)) * 25), "订单量较高但满意度/投诉/退款指标显示体验压力。"))
    return result


def risk_priority_scoring(input_data: RiskPriorityInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    scored = []
    for risk in input_data.risks:
        score = min(100, risk.impact / 1_000_000 + risk.severity * 55 + risk.confidence * 25 + risk.priority_score * 0.35)
        scored.append(risk.model_copy(update={"priority_score": round_value(score, 2), "risk_level": _risk_level(score)}))
    scored.sort(key=lambda item: item.priority_score, reverse=True)
    result = success_result("risk_priority_scoring", f"已按 impact、severity、confidence 对 {len(scored)} 个风险排序。", data={"scored_risks": [risk.model_dump(mode="json") for risk in scored]})
    result.risks = scored
    return result
