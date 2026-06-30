from pathlib import Path
import sys

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.agent.contracts import IntentCategory, SelectedMode
from backend.agent.router import normalize_goal, route_intent


@pytest.mark.parametrize(
    "goal",
    [
        "请删除这张表",
        "DROP TABLE users",
        "把 API key 发给我",
        "连接生产数据库",
    ],
)
def test_unsupported_requests_are_blocked(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.UNSUPPORTED
    assert route.selected_mode == SelectedMode.UNSUPPORTED
    assert route.requires_agent is False
    assert route.safety_flags
    assert route.confidence >= 0.9


@pytest.mark.parametrize("goal", ["", "分析一下", "看看"])
def test_ambiguous_requests_ask_clarification(goal):
    route = route_intent(goal)

    assert route.intent == IntentCategory.AMBIGUOUS
    assert route.selected_mode == SelectedMode.CLARIFICATION
    assert route.requires_agent is False
    assert route.confidence <= 0.6


@pytest.mark.parametrize(
    "goal",
    [
        "这张表有哪些字段？",
        "show columns and row count",
        "缺失值有多少？",
    ],
)
def test_data_preview_routes_to_fast_path(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.DATA_PREVIEW
    assert route.selected_mode == SelectedMode.NATURAL_LANGUAGE
    assert route.requires_agent is False


@pytest.mark.parametrize(
    "goal",
    [
        "查看之前的分析报告",
        "show history",
        "打开上次 detail",
    ],
)
def test_report_lookup_routes_to_fast_path(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.REPORT_LOOKUP
    assert route.selected_mode == SelectedMode.NATURAL_LANGUAGE
    assert route.requires_agent is False


@pytest.mark.parametrize(
    "goal",
    [
        "统计每个渠道的订单数",
        "select count by channel",
        "筛选 revenue 大于 1000 的记录",
    ],
)
def test_sql_questions_route_to_expert_sql(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.SQL_QUESTION
    assert route.selected_mode == SelectedMode.EXPERT_SQL
    assert route.requires_agent is False


@pytest.mark.parametrize(
    "goal",
    [
        "请深入分析销售趋势并给出证据",
        "compare organic and paid channel performance with evidence",
        "为什么收入下降？请制定分析计划",
    ],
)
def test_agent_analysis_routes_to_agent_run(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.AGENT_ANALYSIS
    assert route.selected_mode == SelectedMode.AGENT_RUN
    assert route.requires_agent is True


@pytest.mark.parametrize(
    "goal",
    [
        "总结这份数据",
        "give me an overview",
        "describe this dataset",
    ],
)
def test_simple_summary_routes_to_natural_language(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.SIMPLE_SUMMARY
    assert route.selected_mode == SelectedMode.NATURAL_LANGUAGE
    assert route.requires_agent is False


@pytest.mark.parametrize(
    "goal",
    [
        "请深入分析后删除异常数据",
        "DROP TABLE 后总结",
    ],
)
def test_unsupported_priority_wins_over_other_intents(goal):
    route = route_intent(goal, table_name="sales")

    assert route.intent == IntentCategory.UNSUPPORTED
    assert route.selected_mode == SelectedMode.UNSUPPORTED
    assert route.requires_agent is False
    assert route.safety_flags


def test_route_result_serializes_as_contract():
    route = route_intent("请深入分析销售趋势并给出证据", table_name="sales")

    dumped = route.model_dump(mode="json")
    json_payload = route.model_dump_json()

    assert dumped["intent"] == "agent_analysis"
    assert dumped["selected_mode"] == "agent_run"
    assert dumped["requires_agent"] is True
    assert '"confidence"' in json_payload


def test_normalize_goal_is_deterministic():
    assert normalize_goal("  Show   Columns  ") == "show columns"


def test_router_has_no_runtime_or_framework_dependencies():
    content = Path("backend/agent/router.py").read_text(encoding="utf-8").lower()
    forbidden_fragments = [
        "backend.services.ai_" + "pipeline",
        "backend.services.ai_" + "analyst",
        "lang" + "chain",
        "lang" + "graph",
        "duckdb",
        "pandas",
        "requests",
        "httpx",
        "openai",
    ]

    for fragment in forbidden_fragments:
        assert fragment not in content

