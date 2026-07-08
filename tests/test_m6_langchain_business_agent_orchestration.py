from pathlib import Path
import sys

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.langchain_single_agent import LangChainSingleAgentService, run_langchain_single_agent  # noqa: E402
from backend.agent.memory_store import AgentRunRecord, InMemoryAgentRunStore  # noqa: E402
from backend.agent.runtime import AgentRuntimeRequest  # noqa: E402
from database.db_manager import DatabaseManager  # noqa: E402


TABLE_NAME = "m6_demo_business"


@pytest.fixture()
def m6_db(tmp_path):
    DatabaseManager.reset_instance()
    db = DatabaseManager(str(tmp_path / "m6_agent.duckdb"))
    df = pd.read_csv(ROOT / "testExcel" / "demo_sales_business_50k.csv")
    db.import_dataframe(df, table_name=TABLE_NAME)
    yield db
    db.close()
    DatabaseManager.reset_instance()


def run_business_question(question: str, m6_db, *, provider: str = "mock", memory_store=None, metadata=None):
    return run_langchain_single_agent(
        AgentRuntimeRequest(
            user_input=question,
            table_name=TABLE_NAME,
            provider_requested=provider,
            metadata=metadata or {},
        ),
        memory_store=memory_store,
        db_manager=m6_db,
    )


def assert_business_report_shape(report: dict) -> None:
    assert report["executive_summary"]
    assert isinstance(report["key_findings"], list)
    assert isinstance(report["evidence_summary"], list)
    assert isinstance(report["risk_priorities"], list)
    assert isinstance(report["recommendations"], list)
    assert isinstance(report["next_questions"], list)
    assert isinstance(report["limitations"], list)
    for hidden in ["tool_calls", "trace", "provider", "run_id", "memory"]:
        assert hidden not in report


def test_business_health_check_generates_business_report(m6_db) -> None:
    result = run_business_question("帮我评估这张表整体经营健康度，先给结论。", m6_db)
    report = result.run.business_report

    assert result.run.status == "completed"
    assert report is not None
    assert_business_report_shape(report)
    assert result.run.answer
    assert "核心结论" in result.run.answer
    assert "SELECT" not in result.run.answer.upper()
    assert {"compute_overall_kpis", "refund_risk_analysis", "recommendation_builder"}.issubset(
        {call.tool_name for call in result.run.tool_calls}
    )


def test_risk_diagnosis_uses_multiple_business_tools(m6_db) -> None:
    result = run_business_question("帮我做经营风险排查，判断最该优先处理的问题。", m6_db)
    business_tools = {
        call.tool_name
        for call in result.run.tool_calls
        if call.tool_name
        not in {
            "inspect_schema",
            "memory_read",
            "memory_write",
        }
    }

    assert len(business_tools) >= 3
    assert "risk_priority_scoring" in business_tools
    assert result.run.business_report
    assert result.run.business_report["risk_priorities"]


def test_growth_opportunity_returns_opportunities_and_recommendations(m6_db) -> None:
    result = run_business_question("寻找增长机会，哪些地区或品类值得加大投入？", m6_db)
    report = result.run.business_report

    assert report is not None
    assert report["opportunities"]
    assert report["recommendations"]
    assert any(call.tool_name == "opportunity_finder" for call in result.run.tool_calls)


def test_data_quality_check_detects_injected_anomalies(m6_db) -> None:
    result = run_business_question("这张表有哪些明显的数据质量问题？", m6_db)
    quality_call = next(call for call in result.run.tool_calls if call.tool_name == "data_quality_check")
    checks = quality_call.output_json["data"]["quality_checks"]

    assert checks["sales_amount_non_positive"] == 175
    assert checks["quantity_non_positive"] == 90
    assert checks["discount_out_of_range"] == 175
    assert result.run.business_report["executive_summary"]


def test_ad_spend_roi_missing_field_returns_alternative_analysis(m6_db) -> None:
    result = run_business_question("我想知道广告花费 ROI，帮我分析。", m6_db)
    report = result.run.business_report

    assert report is not None
    assert "ad_spend" in report["executive_summary"]
    assert any("不能直接计算广告 ROI" in item for item in report["limitations"])
    assert any(call.tool_name == "validate_fields" for call in result.run.tool_calls)


def test_membership_level_is_not_fabricated(m6_db) -> None:
    result = run_business_question("按会员等级分析复购率。", m6_db)
    report = result.run.business_report

    assert report is not None
    assert any("membership_level" in item for item in report["limitations"])
    assert "钻石会员" not in result.run.answer
    assert "黄金会员" not in result.run.answer


def test_neighborhood_is_not_fabricated(m6_db) -> None:
    result = run_business_question("用户来自哪些小区？", m6_db)
    report = result.run.business_report

    assert report is not None
    assert any("neighborhood" in item or "address" in item for item in report["limitations"])
    assert "小区A" not in result.run.answer


def test_follow_up_reads_previous_memory_summary(m6_db) -> None:
    memory_store = InMemoryAgentRunStore()
    first = run_business_question("哪些地区是高收入但高风险？", m6_db, memory_store=memory_store)
    memory_store.save_run(AgentRunRecord(run=first.run, warnings=first.warnings))

    follow_up = run_business_question(
        "基于刚才的高风险地区，继续看具体品类原因。",
        m6_db,
        memory_store=memory_store,
        metadata={"previous_run_id": first.run.run_id},
    )

    assert follow_up.run.memory_used is True
    assert follow_up.run.trace["business_classification"]["question_type"] == "follow_up_drilldown"
    assert any(call.tool_name == "memory_read" for call in follow_up.run.tool_calls)
    assert follow_up.run.business_report["executive_summary"]


def test_business_report_excludes_technical_fields(m6_db) -> None:
    result = run_business_question("帮我输出一份面向老板的经营简报。", m6_db)

    assert result.run.business_report is not None
    assert_business_report_shape(result.run.business_report)
    serialized = str(result.run.business_report)
    for forbidden in ["tool_calls", "trace", "provider", "run_id", "memory"]:
        assert forbidden not in serialized


def test_mock_provider_runs_without_real_llm(m6_db) -> None:
    result = run_business_question("哪些渠道带来了订单但体验不好？", m6_db, provider="mock")

    assert result.run.provider_used == "mock"
    assert result.run.fallback_triggered is False
    assert result.run.business_report
    assert result.run.trace.get("llm_calls", 0) == 0


def test_bad_provider_fallback_is_controlled(m6_db) -> None:
    result = run_business_question("发货效率有没有拖累客户体验？", m6_db, provider="bad-provider")

    assert result.run.provider_requested == "bad-provider"
    assert result.run.provider_used == "mock"
    assert result.run.fallback_triggered is True
    assert result.run.fallback_reason == "当前选择的模型 provider 不受支持，已切换为模拟分析结果。"
    assert result.run.business_report


def test_legacy_agent_basic_question_still_runs() -> None:
    result = run_langchain_single_agent(
        AgentRuntimeRequest(user_input="Analyze sales data", table_name="sales", provider_requested="mock")
    )

    assert result.run.status == "completed"
    assert result.run.answer
    assert result.run.sql
    assert result.run.evidence


def test_registered_business_tool_names_are_available() -> None:
    service = LangChainSingleAgentService()

    for tool_name in [
        "validate_fields",
        "map_business_terms",
        "compute_overall_kpis",
        "compare_by_dimension",
        "trend_analysis",
        "top_bottom_analysis",
        "refund_risk_analysis",
        "discount_risk_analysis",
        "profitability_analysis",
        "shipping_efficiency_analysis",
        "customer_profile_analysis",
        "channel_effectiveness_analysis",
        "data_quality_check",
        "risk_priority_scoring",
        "opportunity_finder",
        "root_cause_hypothesis",
        "recommendation_builder",
    ]:
        assert tool_name in service.tool_names
