"""Metric definitions for the M6 Business Semantic Layer."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MetricDefinition:
    metric_name: str
    business_meaning: str
    formula: str
    required_fields: tuple[str, ...]
    fallback_behavior: str
    aggregation_level: str
    display_format: str


METRIC_DEFINITIONS: dict[str, MetricDefinition] = {
    "total_sales": MetricDefinition(
        "total_sales",
        "总销售额，用于衡量经营规模。",
        "SUM(sales_amount)",
        ("sales_amount",),
        "缺 sales_amount 时不能计算销售规模。",
        "overall, dimension, time",
        "currency_2",
    ),
    "order_count": MetricDefinition(
        "order_count",
        "订单量，用于衡量交易规模。",
        "COUNT(DISTINCT order_id)",
        ("order_id",),
        "缺 order_id 时可退化为行数，但必须标注不是严格订单数。",
        "overall, dimension, time",
        "integer",
    ),
    "avg_order_value": MetricDefinition(
        "avg_order_value",
        "客单价，用于衡量单笔订单平均贡献。",
        "SUM(sales_amount) / COUNT(DISTINCT order_id)",
        ("sales_amount", "order_id"),
        "缺 sales_amount 或 order_id 时不能计算标准客单价。",
        "overall, dimension, time",
        "currency_2",
    ),
    "refund_amount": MetricDefinition(
        "refund_amount",
        "退款金额，用于衡量售后损失规模。",
        "SUM(refund_amount)",
        ("refund_amount",),
        "缺 refund_amount 时不能计算退款金额，可改看 is_returned 退货量。",
        "overall, dimension, time",
        "currency_2",
    ),
    "refund_rate": MetricDefinition(
        "refund_rate",
        "退款率，用于衡量销售额中被退款侵蚀的比例。",
        "SUM(refund_amount) / NULLIF(SUM(sales_amount), 0)",
        ("refund_amount", "sales_amount"),
        "缺 refund_amount 或 sales_amount 时不能计算退款率。",
        "overall, dimension, time",
        "percent_2",
    ),
    "return_rate": MetricDefinition(
        "return_rate",
        "退货率，用于衡量订单退货发生比例。",
        "SUM(CASE WHEN is_returned THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT order_id), 0)",
        ("is_returned", "order_id"),
        "缺 is_returned 时不能计算退货率，可改看 refund_amount。",
        "overall, dimension, time",
        "percent_2",
    ),
    "gross_margin_rate": MetricDefinition(
        "gross_margin_rate",
        "毛利率，用于衡量利润质量。",
        "SUM(profit_amount) / NULLIF(SUM(sales_amount), 0)",
        ("profit_amount", "sales_amount"),
        "缺 profit_amount 时不能计算毛利率；可替代看销售、退款和折扣。",
        "overall, dimension, time",
        "percent_2",
    ),
    "avg_discount": MetricDefinition(
        "avg_discount",
        "平均折扣率，用于判断促销依赖。",
        "AVG(discount)",
        ("discount",),
        "缺 discount 时不能判断促销依赖。",
        "overall, dimension, time",
        "percent_2",
    ),
    "avg_shipping_days": MetricDefinition(
        "avg_shipping_days",
        "平均发货周期，用于判断履约效率。",
        "AVG(shipping_days)",
        ("shipping_days",),
        "缺 shipping_days 时可尝试用 ship_date - order_date 计算，但需校验日期。",
        "overall, dimension, time",
        "number_2",
    ),
    "complaint_rate": MetricDefinition(
        "complaint_rate",
        "投诉率，用于衡量客户体验风险。",
        "SUM(CASE WHEN complaint_count > 0 THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT order_id), 0)",
        ("complaint_count", "order_id"),
        "缺 complaint_count 时不能计算投诉率，可替代看满意度和退款。",
        "overall, dimension, time",
        "percent_2",
    ),
    "avg_satisfaction_score": MetricDefinition(
        "avg_satisfaction_score",
        "平均满意度，用于衡量客户体验。",
        "AVG(satisfaction_score)",
        ("satisfaction_score",),
        "缺 satisfaction_score 时不能判断满意度，可替代看投诉和退款。",
        "overall, dimension, time",
        "score_2",
    ),
    "sales_contribution": MetricDefinition(
        "sales_contribution",
        "销售贡献占比，用于识别关键地区、渠道或品类。",
        "SUM(sales_amount) / NULLIF(SUM(SUM(sales_amount)) OVER (), 0)",
        ("sales_amount",),
        "缺 sales_amount 时不能计算销售贡献。",
        "dimension",
        "percent_2",
    ),
    "profit_contribution": MetricDefinition(
        "profit_contribution",
        "利润贡献占比，用于识别真正贡献利润的对象。",
        "SUM(profit_amount) / NULLIF(SUM(SUM(profit_amount)) OVER (), 0)",
        ("profit_amount",),
        "缺 profit_amount 时不能计算利润贡献。",
        "dimension",
        "percent_2",
    ),
}


def get_metric_definition(metric_name: str) -> MetricDefinition | None:
    return METRIC_DEFINITIONS.get(metric_name)
