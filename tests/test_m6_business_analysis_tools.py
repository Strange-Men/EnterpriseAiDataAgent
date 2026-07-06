from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
import pytest

from backend.business_tools import (
    channel_effectiveness_analysis,
    compare_by_dimension,
    compute_overall_kpis,
    customer_profile_analysis,
    data_quality_check,
    discount_risk_analysis,
    map_business_terms,
    opportunity_finder,
    profitability_analysis,
    recommendation_builder,
    refund_risk_analysis,
    risk_priority_scoring,
    root_cause_hypothesis,
    shipping_efficiency_analysis,
    top_bottom_analysis,
    trend_analysis,
    validate_fields,
)
from backend.business_tools.models import (
    BusinessTermMappingInput,
    ChannelEffectivenessInput,
    CustomerProfileInput,
    DataQualityInput,
    DimensionAnalysisInput,
    FieldValidationInput,
    MultiDimensionInput,
    OpportunityFinderInput,
    RecommendationInput,
    RiskItem,
    RiskPriorityInput,
    RootCauseInput,
    TableMetricsInput,
    TrendAnalysisInput,
)
from database.db_manager import DatabaseManager


TABLE_NAME = "m6_demo_business"
HIDDEN_OUTPUT_KEYS = {"sql", "trace", "tool_calls", "provider", "run_id", "memory"}


@pytest.fixture(scope="module")
def business_db(tmp_path_factory: pytest.TempPathFactory) -> DatabaseManager:
    DatabaseManager.reset_instance()
    db_path = tmp_path_factory.mktemp("m6_business_tools") / "business.duckdb"
    db = DatabaseManager(str(db_path))
    df = pd.read_csv(Path("testExcel/demo_sales_business_50k.csv"))
    db.import_dataframe(df, table_name=TABLE_NAME)
    yield db
    db.close()
    DatabaseManager.reset_instance()


def _assert_no_hidden_keys(payload: Any) -> None:
    if isinstance(payload, dict):
        assert not HIDDEN_OUTPUT_KEYS.intersection(payload.keys())
        for value in payload.values():
            _assert_no_hidden_keys(value)
    elif isinstance(payload, list):
        for item in payload:
            _assert_no_hidden_keys(item)


def test_compute_overall_kpis_returns_core_kpis(business_db: DatabaseManager) -> None:
    result = compute_overall_kpis(TableMetricsInput(table_name=TABLE_NAME), db_manager=business_db)
    values = {metric.name: metric.value for metric in result.metrics}

    assert result.status == "success"
    assert values["total_sales"] > 79_000_000
    assert values["order_count"] == 50_000
    assert values["avg_order_value"] > 1500
    assert values["refund_rate"] > 0
    assert values["gross_margin_rate"] > 0
    _assert_no_hidden_keys(result.model_dump(mode="json"))


def test_compare_by_dimension_supports_core_dimensions(business_db: DatabaseManager) -> None:
    for dimension in ["region", "category", "ad_channel", "city_level"]:
        result = compare_by_dimension(DimensionAnalysisInput(table_name=TABLE_NAME, dimension=dimension), db_manager=business_db)
        assert result.status == "success"
        assert result.evidence_tables
        assert result.data["dimension"] == dimension


def test_trend_analysis_aggregates_by_month(business_db: DatabaseManager) -> None:
    result = trend_analysis(TrendAnalysisInput(table_name=TABLE_NAME, date_field="order_date"), db_manager=business_db)
    assert result.status == "success"
    assert result.data["trend_direction"] in {"up", "down", "flat"}
    assert len(result.data["time_series"]) >= 12


def test_refund_risk_analysis_identifies_high_refund_objects(business_db: DatabaseManager) -> None:
    result = refund_risk_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["category"], n=5), db_manager=business_db)
    assert result.status == "success"
    assert result.risks
    assert any((risk.evidence.get("refund_rate") or 0) >= 0.08 for risk in result.risks)


def test_discount_risk_analysis_identifies_high_discount_low_margin(business_db: DatabaseManager) -> None:
    result = discount_risk_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["category"], n=5), db_manager=business_db)
    assert result.status == "success"
    assert result.risks
    assert any((risk.evidence.get("avg_discount") or 0) > 0.35 for risk in result.risks)


def test_profitability_analysis_identifies_high_sales_low_profit(business_db: DatabaseManager) -> None:
    result = profitability_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["product"], n=5), db_manager=business_db)
    assert result.status == "success"
    assert result.risks
    assert any((risk.evidence.get("gross_margin_rate") or 1) < 0.05 for risk in result.risks)


def test_shipping_efficiency_analysis_returns_experience_evidence(business_db: DatabaseManager) -> None:
    result = shipping_efficiency_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["region"], n=5), db_manager=business_db)
    assert result.status == "success"
    assert result.risks
    evidence = result.risks[0].evidence
    assert "avg_shipping_days" in evidence
    assert "complaint_rate" in evidence


def test_customer_profile_analysis_supports_age_segment_and_city_level(business_db: DatabaseManager) -> None:
    for field in ["customer_age", "customer_segment", "city_level"]:
        result = customer_profile_analysis(CustomerProfileInput(table_name=TABLE_NAME, fields=[field], n=5), db_manager=business_db)
        assert result.status == "success"
        assert result.evidence_tables


def test_channel_effectiveness_analysis_finds_high_volume_poor_experience_channel(business_db: DatabaseManager) -> None:
    result = channel_effectiveness_analysis(ChannelEffectivenessInput(table_name=TABLE_NAME, channel_field="ad_channel"), db_manager=business_db)
    assert result.status == "success"
    assert result.risks
    risk_names = " ".join(risk.risk_name for risk in result.risks)
    assert "Livestream" in risk_names or "Feed Ads" in risk_names


def test_data_quality_check_detects_injected_anomalies(business_db: DatabaseManager) -> None:
    result = data_quality_check(DataQualityInput(table_name=TABLE_NAME), db_manager=business_db)
    checks = result.data["quality_checks"]

    assert checks["sales_amount_non_positive"] == 175
    assert checks["quantity_non_positive"] == 90
    assert checks["discount_out_of_range"] == 175
    assert checks["ship_before_order"] == 100
    assert checks["refund_exceeds_sales"] == 100
    assert checks["missing_satisfaction_score"] == 1000
    assert checks["missing_ad_channel"] == 500


def test_risk_priority_scoring_outputs_high_medium_low() -> None:
    risks = [
        RiskItem(
            risk_name="high",
            risk_level="medium",
            priority_score=95,
            reason="high impact",
            impact=50_000_000,
            severity=0.9,
            confidence=0.9,
        ),
        RiskItem(
            risk_name="medium",
            risk_level="low",
            priority_score=50,
            reason="medium impact",
            impact=5_000_000,
            severity=0.55,
            confidence=0.7,
        ),
        RiskItem(
            risk_name="low",
            risk_level="low",
            priority_score=5,
            reason="low impact",
            impact=10,
            severity=0.05,
            confidence=0.4,
        ),
    ]
    result = risk_priority_scoring(RiskPriorityInput(risks=risks))
    levels = {risk.risk_level for risk in result.risks}
    assert {"high", "medium", "low"}.issubset(levels)


def test_opportunity_finder_outputs_growth_candidates(business_db: DatabaseManager) -> None:
    comparison = compare_by_dimension(DimensionAnalysisInput(table_name=TABLE_NAME, dimension="region"), db_manager=business_db)
    result = opportunity_finder(OpportunityFinderInput(evidence_rows=comparison.data["grouped_metrics"], object_type="region", n=3))
    assert result.status == "success"
    assert result.opportunities
    assert result.opportunities[0].reason
    assert result.opportunities[0].risk_reminder


def test_root_cause_hypothesis_uses_candidate_wording(business_db: DatabaseManager) -> None:
    risk_result = refund_risk_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["category"], n=2), db_manager=business_db)
    result = root_cause_hypothesis(RootCauseInput(risks=risk_result.risks))
    text = str(result.data)
    assert "可能" in text or "候选原因" in text
    assert "确定根因" not in text


def test_recommendation_builder_outputs_actionable_recommendations(business_db: DatabaseManager) -> None:
    risk_result = refund_risk_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["category"], n=2), db_manager=business_db)
    opportunity_result = opportunity_finder(
        OpportunityFinderInput(evidence_rows=[risk.evidence for risk in risk_result.risks], object_type="category", n=2)
    )
    result = recommendation_builder(RecommendationInput(risks=risk_result.risks, opportunities=opportunity_result.opportunities))
    assert result.status == "success"
    assert result.recommendations
    assert all(item.action and item.monitoring_metric and item.expected_action_window for item in result.recommendations)


def test_validate_fields_and_map_terms_return_missing_fields() -> None:
    available = ["sales_amount", "refund_amount", "ad_channel", "category"]
    result = validate_fields(
        FieldValidationInput(requested_fields=["ad_spend", "membership_level", "neighborhood", "sales_amount"], table_schema=available)
    )
    assert result.status == "partial"
    assert {"ad_spend", "membership_level", "neighborhood"}.issubset(set(result.missing_fields))

    mapping = map_business_terms(BusinessTermMappingInput(terms=["退款率", "渠道", "不存在词"], available_fields=available))
    assert mapping.data["term_to_metric"]["退款率"] == "refund_rate"
    assert "不存在词" in mapping.data["unmapped_terms"]


def test_top_bottom_analysis_and_outputs_have_no_technical_fields(business_db: DatabaseManager) -> None:
    result = top_bottom_analysis(
        DimensionAnalysisInput(table_name=TABLE_NAME, dimension="product", metrics=["gross_margin_rate"], n=5),
        db_manager=business_db,
    )
    assert result.status == "success"
    _assert_no_hidden_keys(result.model_dump(mode="json"))


def test_tools_do_not_depend_on_llm_provider_or_modify_data(business_db: DatabaseManager) -> None:
    before = business_db.get_table_info(TABLE_NAME)["row_count"]
    compute_overall_kpis(TableMetricsInput(table_name=TABLE_NAME), db_manager=business_db)
    refund_risk_analysis(MultiDimensionInput(table_name=TABLE_NAME, dimensions=["region"]), db_manager=business_db)
    after = business_db.get_table_info(TABLE_NAME)["row_count"]
    assert before == after == 50_000
