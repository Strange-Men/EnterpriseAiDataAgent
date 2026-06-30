from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.contracts import AgentRun, AgentStatus, FallbackType, ToolCallStatus
from backend.agent.langchain_adapter import is_langchain_available, run_langchain_mock_agent
from backend.agent.mock_runner import run_mock_agent


def test_adapter_import_is_safe_without_runtime_side_effects() -> None:
    assert isinstance(is_langchain_available(), bool)


def test_native_mock_runner_still_works() -> None:
    run = run_mock_agent("show columns and row count")

    assert run.status == AgentStatus.COMPLETED
    assert run.provider_used == "mock"
    assert run.is_simulated is True
    assert run.tool_calls


def test_adapter_returns_native_agent_run_for_data_preview() -> None:
    run = run_langchain_mock_agent("show columns and row count")

    assert isinstance(run, AgentRun)
    assert run.status == AgentStatus.COMPLETED
    assert run.provider_used == "mock"
    assert run.is_simulated is True
    assert run.tool_calls
    assert {call.tool_name for call in run.tool_calls} == {"inspect_schema", "profile_table"}

    if not is_langchain_available():
        assert run.fallback_triggered is True
        assert run.fallback_reason
        assert "native mock runner" in run.fallback_reason


def test_adapter_tool_scope_is_limited_to_mock_safe_tools() -> None:
    run = run_langchain_mock_agent("compare organic and paid channel performance with evidence")
    tool_names = {call.tool_name for call in run.tool_calls}

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


@pytest.mark.parametrize(
    ("user_goal", "expected_status"),
    [
        ("DROP TABLE users", AgentStatus.UNSUPPORTED),
        ("", AgentStatus.CLARIFICATION_REQUIRED),
    ],
)
def test_adapter_does_not_call_tools_for_unsupported_or_ambiguous_goals(
    user_goal: str, expected_status: AgentStatus
) -> None:
    run = run_langchain_mock_agent(user_goal)

    assert run.status == expected_status
    assert run.tool_calls == []


def test_adapter_provider_fallback_is_simulated() -> None:
    run = run_langchain_mock_agent(
        "compare organic and paid channel performance with evidence",
        provider_requested="deepseek",
    )

    assert run.provider_requested == "deepseek"
    assert run.provider_used == "mock"
    assert run.is_simulated is True
    assert run.fallback_triggered is True
    assert run.fallback_type == FallbackType.PROVIDER
    assert run.fallback_reason


def test_adapter_serialization_uses_native_contracts() -> None:
    run = run_langchain_mock_agent("select count by channel")
    summary = run.to_summary(findings_count=1)

    run_dump = run.model_dump(mode="json")
    run_json = run.model_dump_json()
    summary_dump = summary.model_dump(mode="json")
    summary_json = summary.model_dump_json()

    assert run_dump["run_id"] == run.run_id
    assert run.trace_id in run_json
    assert summary_dump["run_id"] == run.run_id
    assert summary.trace_id in summary_json


def test_adapter_tool_calls_are_normalized_and_simulated() -> None:
    run = run_langchain_mock_agent("select count by channel")

    assert run.tool_calls
    for tool_call in run.tool_calls:
        assert tool_call.status == ToolCallStatus.COMPLETED
        assert tool_call.provider_used == "mock"
        assert tool_call.is_simulated is True
        assert tool_call.output_json
        assert tool_call.evidence_json


def test_adapter_source_has_no_forbidden_dependencies() -> None:
    source = (ROOT / "backend" / "agent" / "langchain_adapter.py").read_text(encoding="utf-8").lower()
    forbidden = [
        "lang" + "graph",
        "lang" + "smith",
        "ai_" + "pipeline",
        "ai_" + "analyst",
        "duck" + "db",
        "pan" + "das",
        "open" + "ai",
        "req" + "uests",
        "ht" + "tpx",
    ]

    for name in forbidden:
        assert name not in source
