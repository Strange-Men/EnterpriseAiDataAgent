"""Question analysis templates for M6 Business Semantic Layer."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AnalysisTemplate:
    question_type: str
    trigger_keywords: tuple[str, ...]
    required_fields: tuple[str, ...]
    optional_fields: tuple[str, ...]
    metrics: tuple[str, ...]
    suggested_dimensions: tuple[str, ...]
    expected_evidence: tuple[str, ...]
    report_sections: tuple[str, ...]
    missing_field_fallback: tuple[str, ...]


USER_REPORT_SECTIONS: tuple[str, ...] = (
    "one_sentence_judgment",
    "core_findings",
    "key_data_evidence",
    "risk_priority",
    "business_recommendations",
    "suggested_follow_up_questions",
)


HIDDEN_TECHNICAL_FIELDS: tuple[str, ...] = (
    "sql",
    "tool_calls",
    "trace",
    "provider",
    "run_id",
    "memory",
    "raw_json",
    "fallback_reason",
)


def _template(
    question_type: str,
    trigger_keywords: tuple[str, ...],
    required_fields: tuple[str, ...],
    optional_fields: tuple[str, ...],
    metrics: tuple[str, ...],
    dimensions: tuple[str, ...],
    evidence: tuple[str, ...],
    fallback: tuple[str, ...],
) -> AnalysisTemplate:
    return AnalysisTemplate(
        question_type=question_type,
        trigger_keywords=trigger_keywords,
        required_fields=required_fields,
        optional_fields=optional_fields,
        metrics=metrics,
        suggested_dimensions=dimensions,
        expected_evidence=evidence,
        report_sections=USER_REPORT_SECTIONS,
        missing_field_fallback=fallback,
    )


ANALYSIS_TEMPLATES: dict[str, AnalysisTemplate] = {
    "business_health_assessment": _template(
        "经营健康度评估",
        ("健康度", "整体经营", "经营怎么样", "总体表现"),
        ("order_id", "sales_amount", "profit_amount", "refund_amount", "discount", "shipping_days"),
        ("satisfaction_score", "complaint_count", "region", "category", "ad_channel"),
        (
            "total_sales",
            "order_count",
            "avg_order_value",
            "gross_margin_rate",
            "refund_rate",
            "avg_discount",
            "avg_shipping_days",
            "complaint_rate",
            "avg_satisfaction_score",
        ),
        ("region", "category", "ad_channel", "city_level"),
        ("overall_kpis", "region_comparison", "category_comparison", "risk_summary", "data_quality_notes"),
        ("profitability", "satisfaction", "channel_effectiveness"),
    ),
    "business_review_summary": _template(
        "业务复盘总结",
        ("复盘", "汇报", "简报", "老板", "经营简报"),
        ("order_date", "order_id", "sales_amount"),
        ("profit_amount", "refund_amount", "region", "category", "ad_channel"),
        ("total_sales", "order_count", "gross_margin_rate", "refund_rate", "sales_contribution"),
        ("order_date", "region", "category", "ad_channel"),
        ("trend_summary", "top_contributors", "risk_points", "next_actions"),
        ("profitability", "channel_effectiveness"),
    ),
    "risk_diagnosis": _template(
        "风险排查",
        ("风险", "异常", "问题", "排查", "优先处理"),
        ("sales_amount", "refund_amount", "discount", "profit_amount"),
        ("satisfaction_score", "complaint_count", "shipping_days", "return_reason"),
        ("refund_rate", "gross_margin_rate", "avg_discount", "complaint_rate", "avg_shipping_days"),
        ("region", "category", "product", "ad_channel"),
        ("risk_metric_table", "high_risk_segments", "possible_causes", "priority_order"),
        ("profitability", "satisfaction", "channel_effectiveness"),
    ),
    "growth_opportunity": _template(
        "增长机会识别",
        ("机会", "增长", "加大投入", "下季度"),
        ("sales_amount", "profit_amount", "refund_amount", "order_id"),
        ("satisfaction_score", "complaint_count", "discount", "region", "category", "ad_channel"),
        ("total_sales", "gross_margin_rate", "refund_rate", "avg_discount", "sales_contribution", "profit_contribution"),
        ("region", "category", "ad_channel", "city_level"),
        ("opportunity_candidates", "profit_quality", "risk_guardrails", "investment_reason"),
        ("profitability", "channel_effectiveness", "satisfaction"),
    ),
    "region_performance": _template(
        "地区表现分析",
        ("地区", "区域", "省份", "城市", "华南", "华东"),
        ("region", "sales_amount", "order_id"),
        ("province", "city", "city_level", "profit_amount", "refund_amount", "satisfaction_score"),
        ("total_sales", "order_count", "gross_margin_rate", "refund_rate", "sales_contribution"),
        ("region", "province", "city", "city_level"),
        ("region_rank", "risk_by_region", "opportunity_by_region", "region_actions"),
        ("profitability", "satisfaction"),
    ),
    "product_category_analysis": _template(
        "商品 / 品类分析",
        ("商品", "品类", "产品", "SKU", "销量"),
        ("category", "product", "sales_amount", "quantity"),
        ("subcategory", "profit_amount", "refund_amount", "discount", "return_reason"),
        ("total_sales", "order_count", "gross_margin_rate", "refund_rate", "avg_discount", "profit_contribution"),
        ("category", "subcategory", "product"),
        ("category_rank", "high_volume_low_profit", "refund_reason_distribution", "product_actions"),
        ("profitability",),
    ),
    "customer_profile": _template(
        "客户画像分析",
        ("客户", "用户", "人群", "年龄", "性别", "高价值客户"),
        ("customer_id", "sales_amount", "order_id"),
        ("customer_segment", "customer_age", "customer_gender", "city_level", "category"),
        ("total_sales", "order_count", "avg_order_value", "refund_rate", "gross_margin_rate"),
        ("customer_segment", "customer_age", "customer_gender", "city_level", "category"),
        ("segment_contribution", "preference_pattern", "segment_risk", "profile_limitations"),
        ("age_profile", "membership_profile"),
    ),
    "channel_effectiveness": _template(
        "广告渠道分析",
        ("渠道", "广告", "投放", "流量", "ROI"),
        ("ad_channel", "sales_amount", "order_id"),
        ("refund_amount", "satisfaction_score", "complaint_count", "discount"),
        ("total_sales", "order_count", "refund_rate", "avg_satisfaction_score", "complaint_rate", "avg_discount"),
        ("ad_channel",),
        ("channel_volume", "channel_quality", "experience_risk", "optimization_actions"),
        ("channel_effectiveness", "roi", "satisfaction"),
    ),
    "time_trend": _template(
        "时间趋势分析",
        ("趋势", "最近", "月份", "环比", "变化"),
        ("order_date", "sales_amount", "order_id"),
        ("profit_amount", "refund_amount", "complaint_count", "satisfaction_score"),
        ("total_sales", "order_count", "gross_margin_rate", "refund_rate", "complaint_rate", "avg_satisfaction_score"),
        ("order_date", "region", "category", "ad_channel"),
        ("monthly_trend", "recent_change", "risk_trend", "monitoring_metrics"),
        ("profitability", "satisfaction"),
    ),
    "shipping_efficiency": _template(
        "发货效率分析",
        ("发货", "物流", "履约", "配送", "发货慢"),
        ("shipping_days", "order_id"),
        ("ship_date", "order_date", "complaint_count", "satisfaction_score", "refund_amount"),
        ("avg_shipping_days", "complaint_rate", "avg_satisfaction_score", "refund_rate"),
        ("region", "province", "city_level", "ad_channel"),
        ("slow_shipping_segments", "experience_correlation", "fulfillment_risk", "shipping_actions"),
        ("satisfaction",),
    ),
    "data_quality_check": _template(
        "数据质量检查",
        ("数据质量", "异常值", "缺失", "脏数据", "质量问题"),
        ("order_id", "sales_amount", "quantity", "discount", "order_date", "ship_date"),
        ("refund_amount", "satisfaction_score", "ad_channel"),
        ("order_count",),
        ("all_fields",),
        ("missing_rates", "range_anomalies", "date_logic_anomalies", "impact_and_cleanup"),
        ("satisfaction", "channel_effectiveness"),
    ),
    "anti_hallucination_field_check": _template(
        "反胡编字段检查",
        ("ROI", "会员等级", "小区", "地址", "经纬度", "不存在字段"),
        (),
        ("ad_channel", "customer_id", "order_date", "region", "province", "city", "city_level"),
        (),
        ("schema",),
        ("requested_field_validation", "unsupported_conclusions", "alternative_analysis"),
        ("roi", "membership_profile", "fine_location"),
    ),
}


def get_analysis_template(template_name: str) -> AnalysisTemplate | None:
    return ANALYSIS_TEMPLATES.get(template_name)
