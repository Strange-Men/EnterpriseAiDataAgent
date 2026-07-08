from pathlib import Path
import sys

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.business_report_view_model import build_business_report_view_model, normalize_locale  # noqa: E402
from backend.agent.langchain_single_agent import run_langchain_single_agent  # noqa: E402
from backend.agent.runtime import AgentRuntimeRequest  # noqa: E402
from database.db_manager import DatabaseManager  # noqa: E402


TABLE_NAME = "m6_demo_business"


@pytest.fixture()
def m6_db(tmp_path):
    DatabaseManager.reset_instance()
    db = DatabaseManager(str(tmp_path / "m6_viewmodel.duckdb"))
    df = pd.read_csv(ROOT / "testExcel" / "demo_sales_business_50k.csv")
    db.import_dataframe(df, table_name=TABLE_NAME)
    yield db
    db.close()
    DatabaseManager.reset_instance()


def _sample_report():
    return {
        "executive_summary": "整体经营具备收入规模，但退款、履约和客户体验需要优先关注。",
        "recommendations": [
            {
                "priority": "high",
                "action": "优先排查直播渠道售后问题",
                "why": "直播渠道订单多，但退款和投诉压力更高。",
                "how": "按品类、商品和退货原因拆解近 7 天退款订单。",
                "metrics": ["refund_rate", "complaint_rate", "satisfaction_score"],
                "deadline": "建议 1 周内完成初查",
                "owner_hint": "运营 / 售后 / 商品负责人",
            },
            {
                "priority": "high",
                "action": "优先排查直播渠道售后问题",
                "why": "重复建议应被去重。",
                "how": "重复建议应被去重。",
                "metrics": ["refund_rate"],
                "deadline": "1 周",
                "owner_hint": "运营",
            },
            {
                "priority": "medium",
                "action": "建立每周经营质量复盘",
                "why": "需要同时看收入和风险。",
                "how": "每周复盘销售、退款、利润和履约指标。",
                "metrics": ["sales_amount", "gross_margin_rate"],
                "deadline": "本周启动",
                "owner_hint": "运营负责人",
            },
            {
                "priority": "low",
                "action": "观察低风险区域",
                "why": "作为对照组。",
                "how": "保留监控。",
                "metrics": ["sales_amount"],
                "deadline": "下月观察",
                "owner_hint": "区域负责人",
            },
        ],
        "risk_priorities": [
            {"risk_name": "字段校验完成：6 个可用，0 个缺失"},
            {"risk_name": "South China 高收入高风险，需要优先处理"},
        ],
        "opportunities": [
            {"object_type": "region", "object_name": "East China", "score": 62.93, "evidence": {"sales": 100}},
        ],
        "key_findings": ["业务术语映射完成：0 个已映射", "Apparel 高销售但毛利承压"],
        "evidence_summary": [
            {"summary": "字段校验完成：6 个可用，0 个缺失"},
            {"summary": "已按 region 返回 Top/Bottom evidence，impact/severity/confidence 已排序"},
            {"summary": "South China 的 refund_rate 和 complaint_rate 高于整体水平。"},
            {"summary": "Apparel 和 Beauty 的 sales_amount 较高，但 avg_discount 偏高。"},
            {"summary": "物流 shipping_days 偏慢会影响 satisfaction_score。"},
            {"summary": "渠道 ad_channel 的退款差异需要持续监控。"},
            {"summary": "额外证据不应超过 5 条。"},
        ],
        "limitations": ["campaign_creative 不存在，不能计算 ROI。"],
        "next_questions": ["继续看高风险渠道的具体品类。", "生成一周整改计划。"],
        "trace": {"hidden": True},
        "tool_calls": [{"tool": "hidden"}],
        "sql": "SELECT * FROM t",
    }


def test_normalize_locale_allows_only_zh_cn_or_en_us() -> None:
    assert normalize_locale("en") == "en-US"
    assert normalize_locale("en-US") == "en-US"
    assert normalize_locale("zh") == "zh-CN"
    assert normalize_locale("bad") == "zh-CN"


def test_viewmodel_zh_cn_cleans_technical_objects_and_limits_lists() -> None:
    view_model = build_business_report_view_model(
        _sample_report(),
        locale="zh-CN",
        provider_status="mock",
        is_simulated=True,
    )

    serialized = str(view_model)
    assert view_model["locale"] == "zh-CN"
    assert view_model["title"] == "业务健康度诊断报告"
    assert len(view_model["priority_actions"]) == 3
    assert len(view_model["key_evidence"]) <= 5
    assert view_model["data_table"] is None
    assert "object_type" not in serialized
    assert "score" not in serialized
    assert "evidence dict" not in serialized
    assert "字段校验完成" not in serialized
    assert "业务术语映射完成" not in serialized
    assert "Top/Bottom evidence" not in serialized
    assert "tool_calls" not in serialized
    assert "SELECT" not in serialized
    assert "机会对象：East China" in serialized
    assert view_model["provider_notice"]["message"].count("演示模式") == 1


def test_viewmodel_en_us_is_pure_english_for_labels_and_notices() -> None:
    view_model = build_business_report_view_model(
        _sample_report(),
        locale="en-US",
        provider_status="fallback",
        is_simulated=True,
        fallback_reason="provider_unavailable_or_mock_fallback",
    )

    serialized = str(view_model)
    assert view_model["locale"] == "en-US"
    assert view_model["title"] == "Business Diagnosis Report"
    assert "Overall Assessment" in serialized
    assert "Priority Actions" in serialized
    assert "Data Limitations" in serialized
    assert "Follow-up Questions" in serialized
    for forbidden in ["退款率", "建议负责人", "具体怎么做", "看什么指标", "建议周期", "暂无", "数据局限", "下一步可以继续问", "当前为模拟分析结果", "真实模型未成功返回"]:
        assert forbidden not in serialized


def test_agent_response_keeps_business_report_and_adds_viewmodel(m6_db: DatabaseManager) -> None:
    result = run_langchain_single_agent(
        AgentRuntimeRequest(
            user_input="帮我评估这张表整体经营健康度，先给结论，再说明主要风险和机会。",
            table_name=TABLE_NAME,
            provider_requested="mock",
            locale="en-US",
        ),
        db_manager=m6_db,
    )

    assert result.run.business_report
    assert result.run.business_report_view_model
    assert result.run.locale == "en-US"
    assert result.run.business_report_view_model["locale"] == "en-US"
    assert result.run.business_report_view_model["data_table"] is None


def test_illegal_locale_falls_back_to_zh_cn() -> None:
    request = AgentRuntimeRequest(user_input="分析经营健康度", table_name=TABLE_NAME, locale="fr-FR")
    assert request.locale == "zh-CN"
