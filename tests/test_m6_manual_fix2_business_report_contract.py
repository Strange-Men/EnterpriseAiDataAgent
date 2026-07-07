from pathlib import Path
import sys

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.business_orchestration import build_business_report  # noqa: E402
from backend.agent.contracts import DEFAULT_RECOMMENDATION, validate_business_recommendations  # noqa: E402
from backend.agent.langchain_single_agent import run_langchain_single_agent  # noqa: E402
from backend.agent.runtime import AgentRuntimeRequest  # noqa: E402
from database.db_manager import DatabaseManager  # noqa: E402


TABLE_NAME = "m6_demo_business"
TECHNICAL_KEYS = {"sql", "trace", "tool_calls", "provider", "run_id", "memory"}


@pytest.fixture()
def m6_db(tmp_path):
    DatabaseManager.reset_instance()
    db = DatabaseManager(str(tmp_path / "m6_fix2.duckdb"))
    df = pd.read_csv(ROOT / "testExcel" / "demo_sales_business_50k.csv")
    db.import_dataframe(df, table_name=TABLE_NAME)
    yield db
    db.close()
    DatabaseManager.reset_instance()


def _run(question: str, db: DatabaseManager):
    return run_langchain_single_agent(
        AgentRuntimeRequest(user_input=question, table_name=TABLE_NAME, provider_requested="mock"),
        db_manager=db,
    )


def test_recommendation_validator_returns_new_complete_structure() -> None:
    recommendations = validate_business_recommendations(
        [
            {
                "priority": "high",
                "action": "优先排查直播渠道的售后问题",
                "why": "直播渠道订单量较高，但退款和投诉压力更高，需要尽快确认低质量订单来源。",
                "how": "抽取近 7 天直播渠道退款订单，按品类、商品和退货原因分组。",
                "metrics": ["退款率", "投诉率", "满意度", "退货原因 Top 3"],
                "deadline": "建议 1 周内完成初查",
                "owner_hint": "运营 / 售后 / 商品负责人",
            }
        ]
    )

    item = recommendations[0]
    assert item["priority"] == "high"
    assert item["action"]
    assert item["why"]
    assert item["how"]
    assert isinstance(item["metrics"], list)
    assert item["deadline"]
    assert item["owner_hint"]


@pytest.mark.parametrize("raw", [[], None, "", "refund_rate"])
def test_recommendation_validator_empty_or_bad_values_use_default(raw) -> None:
    recommendations = validate_business_recommendations(raw)

    assert recommendations
    assert recommendations[0]["action"] == DEFAULT_RECOMMENDATION["action"]
    assert recommendations[0]["metrics"] == DEFAULT_RECOMMENDATION["metrics"]


def test_recommendation_validator_wraps_non_empty_string() -> None:
    recommendations = validate_business_recommendations("建议优化直播渠道售后")

    assert recommendations[0]["action"] == "建议优化直播渠道售后"
    assert recommendations[0]["why"] == DEFAULT_RECOMMENDATION["why"]
    assert recommendations[0]["how"] == DEFAULT_RECOMMENDATION["how"]


def test_recommendation_validator_fills_missing_fields_and_array_metrics() -> None:
    recommendations = validate_business_recommendations(
        [
            {
                "priority": "P0",
                "action": "优先排查华南退款问题",
                "why": "退款压力偏高。",
                "metrics": "refund_rate + complaint_rate",
            }
        ]
    )

    item = recommendations[0]
    assert item["priority"] == "high"
    assert item["how"] == DEFAULT_RECOMMENDATION["how"]
    assert item["deadline"] == DEFAULT_RECOMMENDATION["deadline"]
    assert item["owner_hint"] == DEFAULT_RECOMMENDATION["owner_hint"]
    assert item["metrics"] == ["退款率", "投诉率"]


def test_recommendation_validator_truncates_overlong_text() -> None:
    overlong = "优先排查售后问题" * 80
    recommendations = validate_business_recommendations(
        [{"action": overlong, "why": overlong, "how": overlong, "metrics": ["退款率"], "deadline": overlong, "owner_hint": overlong}]
    )

    item = recommendations[0]
    assert len(item["action"]) <= 140
    assert len(item["why"]) <= 220
    assert len(item["how"]) <= 240
    assert len(item["deadline"]) <= 80
    assert len(item["owner_hint"]) <= 80


def test_new_fields_are_primary_when_legacy_fields_coexist() -> None:
    recommendations = validate_business_recommendations(
        [
            {
                "priority": "medium",
                "action": "新结构行动",
                "why": "新结构原因足够清楚，应该优先展示。",
                "how": "新结构方法足够清楚，应该优先展示。",
                "metrics": ["满意度"],
                "deadline": "建议 1 周内完成",
                "owner_hint": "运营负责人",
                "reason": "旧字段原因",
                "monitoring_metric": "legacy_metric",
                "expected_action_window": "legacy window",
            }
        ]
    )

    item = recommendations[0]
    assert item["action"] == "新结构行动"
    assert item["why"].startswith("新结构原因")
    assert item["metrics"] == ["满意度"]
    assert item["deadline"] == "建议 1 周内完成"


def test_business_report_builder_never_returns_empty_recommendations() -> None:
    report = build_business_report(
        question="帮我总结经营情况",
        question_type="customer_profile_analysis",
        evidence_results=[
            {
                "tool_name": "customer_profile_analysis",
                "evidence_summary": "高价值客户销售贡献较高，但需要继续观察满意度。",
            }
        ],
    )

    assert report["recommendations"]
    assert {"action", "why", "how", "metrics", "deadline", "owner_hint"}.issubset(report["recommendations"][0])
    assert "tool_name" not in report["evidence_summary"][0]


def test_agent_business_report_uses_readable_recommendation_contract(m6_db: DatabaseManager) -> None:
    result = _run("帮我评估这张表整体经营健康度，先给结论，再说明主要风险和机会。", m6_db)
    report = result.run.business_report or {}

    assert report["recommendations"]
    for item in report["recommendations"]:
        assert item["action"]
        assert item["why"]
        assert item["how"]
        assert isinstance(item["metrics"], list)
        assert item["deadline"]
        assert item["owner_hint"]
        assert item["action"] not in {"refund_rate", "gross_margin_rate", "avg_discount"}


def test_business_report_excludes_technical_fields_from_main_contract(m6_db: DatabaseManager) -> None:
    result = _run("帮我输出一份面向老板的经营简报。", m6_db)
    report = result.run.business_report or {}
    serialized = str(report)

    for key in TECHNICAL_KEYS:
        assert key not in report
        assert key not in serialized


def test_anti_hallucination_keeps_readable_limitations_and_alternative_recommendation(m6_db: DatabaseManager) -> None:
    result = _run("我想知道广告花费 ROI，帮我分析。", m6_db)
    report = result.run.business_report or {}

    assert any("ad_spend" in item or "campaign_cost" in item for item in report["limitations"])
    assert report["recommendations"]
    assert report["recommendations"][0]["action"]
    assert "SELECT" not in result.run.answer.upper()
