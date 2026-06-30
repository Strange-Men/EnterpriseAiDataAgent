from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.contracts import AgentRun, AgentStatus, FallbackType, IntentCategory, SelectedMode, ToolCallStatus
from backend.agent.mock_runner import run_mock_agent
from backend.agent.router import route_intent
from backend.agent.tools import get_default_tool_registry


@pytest.mark.parametrize(
    ("user_goal", "expected_intent"),
    [
        ("这张表有哪些字段和行数？", IntentCategory.DATA_PREVIEW),
        ("统计每个渠道的订单数", IntentCategory.SQL_QUESTION),
        ("请深入分析销售趋势并给出证据", IntentCategory.AGENT_ANALYSIS),
        ("总结这份数据", IntentCategory.SIMPLE_SUMMARY),
        ("分析一下", IntentCategory.AMBIGUOUS),
        ("请删除这张表", IntentCategory.UNSUPPORTED),
    ],
)
def test_router_and_mock_runner_keep_intent_consistent(user_goal: str, expected_intent: IntentCategory) -> None:
    route = route_intent(user_goal, table_name="mock_sales")
    run = run_mock_agent(user_goal)

    assert route.intent == expected_intent
    assert run.intent == route.intent


@pytest.mark.parametrize(
    "user_goal",
    [
        "这张表有哪些字段和行数？",
        "统计每个渠道的订单数",
        "请深入分析销售趋势并给出证据",
        "总结这份数据",
    ],
)
def test_completed_agent_run_transcript_integrity(user_goal: str) -> None:
    run = run_mock_agent(user_goal)

    assert isinstance(run, AgentRun)
    assert run.run_id
    assert run.root_run_id
    assert run.trace_id
    assert run.status == AgentStatus.COMPLETED
    assert run.steps
    assert run.tool_calls

    for tool_call in run.tool_calls:
        assert tool_call.run_id == run.run_id
        assert tool_call.is_simulated is True
        assert tool_call.provider_used == "mock"
        assert tool_call.status == ToolCallStatus.COMPLETED
        assert tool_call.output_json


def test_unsupported_and_ambiguous_runs_do_not_call_tools() -> None:
    unsupported = run_mock_agent("请删除这张表")
    ambiguous = run_mock_agent("分析一下")

    assert unsupported.status == AgentStatus.UNSUPPORTED
    assert unsupported.tool_calls == []
    assert ambiguous.status == AgentStatus.CLARIFICATION_REQUIRED
    assert ambiguous.tool_calls == []


@pytest.mark.parametrize(
    ("user_goal", "expected_mode"),
    [
        ("总结这份数据", SelectedMode.NATURAL_LANGUAGE),
        ("统计每个渠道的订单数", SelectedMode.EXPERT_SQL),
        ("请深入分析销售趋势并给出证据", SelectedMode.AGENT_RUN),
        ("这张表有哪些字段和行数？", SelectedMode.NATURAL_LANGUAGE),
        ("查看之前的分析报告", SelectedMode.NATURAL_LANGUAGE),
        ("请删除这张表", SelectedMode.UNSUPPORTED),
        ("分析一下", SelectedMode.CLARIFICATION),
    ],
)
def test_mode_fast_path_boundary(user_goal: str, expected_mode: SelectedMode) -> None:
    route = route_intent(user_goal, table_name="mock_sales")

    assert route.selected_mode == expected_mode


def test_tool_registry_scope_boundary() -> None:
    registry = get_default_tool_registry()
    tool_names = {tool.name for tool in registry.list_tools()}

    assert tool_names == {"inspect_schema", "profile_table", "execute_readonly_sql"}

    future_tools = {
        "generate_sql",
        "summarize_findings",
        "build_report",
        "detect_anomalies",
        "suggest_chart",
        "business_metric_lookup",
    }
    assert tool_names.isdisjoint(future_tools)


def test_provider_fallback_simulated_metadata() -> None:
    run = run_mock_agent("请深入分析销售趋势并给出证据", provider_requested="deepseek")

    assert run.provider_requested == "deepseek"
    assert run.provider_used == "mock"
    assert run.is_simulated is True
    assert run.fallback_triggered is True
    assert run.fallback_type == FallbackType.PROVIDER
    assert run.fallback_reason


def test_agent_run_and_summary_serialization_regression() -> None:
    run = run_mock_agent("请深入分析销售趋势并给出证据")
    summary = run.to_summary(findings_count=1)

    run_dump = run.model_dump(mode="json")
    run_json = run.model_dump_json()
    summary_dump = summary.model_dump(mode="json")
    summary_json = summary.model_dump_json()

    assert run_dump["run_id"] == run.run_id
    assert run.trace_id in run_json
    assert summary_dump["run_id"] == run.run_id
    assert summary.trace_id in summary_json


def test_m5_1_agent_modules_do_not_leak_forbidden_dependencies() -> None:
    module_paths = [
        ROOT / "backend" / "agent" / "contracts.py",
        ROOT / "backend" / "agent" / "router.py",
        ROOT / "backend" / "agent" / "tools.py",
        ROOT / "backend" / "agent" / "mock_runner.py",
    ]
    forbidden = [
        "ai_" + "pipeline",
        "ai_" + "analyst",
        "duck" + "db",
        "pandas",
        "lang" + "chain",
        "lang" + "graph",
        "openai",
        "requests",
        "httpx",
    ]

    for path in module_paths:
        source = path.read_text(encoding="utf-8").lower()
        for name in forbidden:
            assert name not in source, f"{name} leaked into {path.name}"


def test_m5_3_integration_reminder_remains_documented() -> None:
    report = (ROOT / "docs" / "reports" / "m5-1-4-deterministic-mock-run.md").read_text(encoding="utf-8")

    assert "M5.3" in report
    assert "existing AI pipeline" in report
    assert "SQL execution" in report
    assert "summary" in report
    assert "report" in report
