from backend.semantic import (
    ANALYSIS_TEMPLATES,
    BUSINESS_TERM_MAPPINGS,
    DEFAULT_THRESHOLDS,
    DYNAMIC_THRESHOLD_RULES,
    FIELD_DICTIONARY,
    HIDDEN_TECHNICAL_FIELDS,
    METRIC_DEFINITIONS,
    USER_REPORT_SECTIONS,
    calculate_dynamic_thresholds,
    map_business_term,
    quantile,
    validate_fields,
)
from backend.semantic.field_validation import MISSING_FIELD_FALLBACKS, get_fallbacks_for_missing_fields


REQUIRED_M6_FIELDS = {
    "order_id",
    "order_date",
    "ship_date",
    "shipping_days",
    "region",
    "province",
    "city",
    "city_level",
    "customer_id",
    "customer_segment",
    "customer_age",
    "customer_gender",
    "ad_channel",
    "category",
    "subcategory",
    "product",
    "sales_amount",
    "quantity",
    "unit_price",
    "discount",
    "cost_amount",
    "profit_amount",
    "refund_amount",
    "is_returned",
    "return_reason",
    "satisfaction_score",
    "complaint_count",
    "payment_method",
}


def test_field_dictionary_covers_all_m6_demo_fields() -> None:
    assert set(FIELD_DICTIONARY) == REQUIRED_M6_FIELDS

    for field_name, definition in FIELD_DICTIONARY.items():
        assert definition.field_name == field_name
        assert definition.business_meaning
        assert definition.data_type
        assert definition.semantic_category
        assert isinstance(definition.required_for_core_analysis, bool)
        assert definition.common_aliases
        assert definition.example_values
        assert definition.data_quality_rules


def test_chinese_business_terms_map_to_fields_and_metrics() -> None:
    assert map_business_term("销售额") == {"fields": ("sales_amount",), "metric": "total_sales"}
    assert map_business_term("订单数") == {"fields": ("order_id",), "metric": "order_count"}
    assert map_business_term("客单价") == {"fields": ("sales_amount", "order_id"), "metric": "avg_order_value"}
    assert map_business_term("退款率") == {"fields": ("refund_amount", "sales_amount"), "metric": "refund_rate"}
    assert map_business_term("毛利率") == {"fields": ("profit_amount", "sales_amount"), "metric": "gross_margin_rate"}
    assert map_business_term("渠道") == {"fields": ("ad_channel",), "metric": ""}
    assert map_business_term("地区") == {"fields": ("region", "province", "city"), "metric": ""}
    assert map_business_term("不存在的业务词") is None

    required_terms = {"销售额", "订单数", "客单价", "退款金额", "退款率", "退货率", "毛利率", "折扣", "发货周期", "满意度", "投诉", "渠道", "地区", "城市等级", "品类", "商品", "客户分层"}
    assert required_terms.issubset(set(BUSINESS_TERM_MAPPINGS))


def test_metric_definitions_include_required_fields_and_formulas() -> None:
    assert METRIC_DEFINITIONS["refund_rate"].required_fields == ("refund_amount", "sales_amount")
    assert "SUM(refund_amount)" in METRIC_DEFINITIONS["refund_rate"].formula
    assert METRIC_DEFINITIONS["gross_margin_rate"].required_fields == ("profit_amount", "sales_amount")
    assert "SUM(profit_amount)" in METRIC_DEFINITIONS["gross_margin_rate"].formula
    assert METRIC_DEFINITIONS["avg_discount"].required_fields == ("discount",)
    assert METRIC_DEFINITIONS["avg_discount"].formula == "AVG(discount)"

    expected_metrics = {
        "total_sales",
        "order_count",
        "avg_order_value",
        "refund_amount",
        "refund_rate",
        "return_rate",
        "gross_margin_rate",
        "avg_discount",
        "avg_shipping_days",
        "complaint_rate",
        "avg_satisfaction_score",
        "sales_contribution",
        "profit_contribution",
    }
    assert expected_metrics.issubset(set(METRIC_DEFINITIONS))


def test_default_threshold_rules_exist() -> None:
    assert DEFAULT_THRESHOLDS["refund_rate"].operator == ">"
    assert DEFAULT_THRESHOLDS["refund_rate"].threshold == 0.10
    assert DEFAULT_THRESHOLDS["avg_discount"].threshold == 0.35
    assert DEFAULT_THRESHOLDS["gross_margin_rate"].operator == "<"
    assert DEFAULT_THRESHOLDS["gross_margin_rate"].threshold == 0.10
    assert DEFAULT_THRESHOLDS["avg_shipping_days"].threshold == 7.0
    assert DEFAULT_THRESHOLDS["satisfaction_score"].threshold == 3.5


def test_dynamic_quantile_thresholds_calculate_p90_and_p10() -> None:
    values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    assert quantile(values, 0.90) == 9.1
    assert quantile(values, 0.10) == 1.9

    thresholds = calculate_dynamic_thresholds(
        {
            "refund_rate": values,
            "gross_margin_rate": values,
            "avg_discount": values,
            "shipping_days": values,
            "satisfaction_score": values,
        }
    )

    assert thresholds["refund_rate"]["threshold"] == 9.1
    assert thresholds["refund_rate"]["direction"] == "top"
    assert thresholds["gross_margin_rate"]["threshold"] == 1.9
    assert thresholds["gross_margin_rate"]["direction"] == "bottom"
    assert DYNAMIC_THRESHOLD_RULES["shipping_days"].quantile == 0.90


def test_missing_field_fallbacks_are_explicit() -> None:
    fallbacks = get_fallbacks_for_missing_fields(["profit_amount", "ad_channel", "satisfaction_score"])
    limitations = [fallback.limitation for fallback in fallbacks]

    assert any("毛利率" in limitation for limitation in limitations)
    assert any("渠道效果" in limitation for limitation in limitations)
    assert any("满意度" in limitation for limitation in limitations)
    assert MISSING_FIELD_FALLBACKS["membership_profile"].alternative
    assert MISSING_FIELD_FALLBACKS["roi"].alternative
    assert MISSING_FIELD_FALLBACKS["fine_location"].alternative


def test_unknown_fields_are_not_forced_into_semantic_mapping() -> None:
    available_fields = set(FIELD_DICTIONARY)
    result = validate_fields(["sales_amount", "ad_spend", "membership_level"], available_fields)

    assert result["valid"] == ["sales_amount"]
    assert result["missing"] == ["ad_spend", "membership_level"]
    assert "ad_spend" not in FIELD_DICTIONARY
    assert "membership_level" not in FIELD_DICTIONARY


def test_analysis_templates_cover_twelve_question_types() -> None:
    expected_templates = {
        "business_health_assessment",
        "business_review_summary",
        "risk_diagnosis",
        "growth_opportunity",
        "region_performance",
        "product_category_analysis",
        "customer_profile",
        "channel_effectiveness",
        "time_trend",
        "shipping_efficiency",
        "data_quality_check",
        "anti_hallucination_field_check",
    }
    assert expected_templates.issubset(set(ANALYSIS_TEMPLATES))

    for template in ANALYSIS_TEMPLATES.values():
        assert template.question_type
        assert template.trigger_keywords
        assert template.report_sections == USER_REPORT_SECTIONS
        assert template.expected_evidence


def test_user_output_contract_hides_technical_fields_by_default() -> None:
    assert USER_REPORT_SECTIONS == (
        "one_sentence_judgment",
        "core_findings",
        "key_data_evidence",
        "risk_priority",
        "business_recommendations",
        "suggested_follow_up_questions",
    )
    assert {"tool_calls", "trace", "memory", "sql"}.issubset(set(HIDDEN_TECHNICAL_FIELDS))
    assert not set(USER_REPORT_SECTIONS).intersection(HIDDEN_TECHNICAL_FIELDS)
