from pathlib import Path

import pytest
from pydantic import ValidationError

from backend.agent.contracts import AgentStatus, AgentStepState, FallbackType, IntentCategory
from backend.agent.runtime import (
    AgentRuntimeConfig,
    AgentRuntimeMode,
    AgentRuntimeRequest,
    run_agent_runtime_skeleton,
)


RUNTIME_PATH = Path("backend/agent/runtime.py")


def test_skeleton_runtime_returns_agent_run() -> None:
    request = AgentRuntimeRequest(user_input="Please summarize this sales dataset", table_name="sales")
    result = run_agent_runtime_skeleton(request)

    assert result.run.run_id
    assert result.routed_intent is not None
    assert result.runtime_mode == AgentRuntimeMode.SKELETON
    assert result.run.is_simulated is True
    assert result.run.provider_used == "mock"
    assert result.run.status == AgentStatus.COMPLETED
    assert result.run.steps[0].state == AgentStepState.MODE_ROUTING
    assert result.run.tool_calls == []
    assert result.summary is not None
    assert result.summary.tool_call_count == 0
    assert result.warnings


def test_provider_fallback_metadata_is_simulated() -> None:
    request = AgentRuntimeRequest(
        user_input="Please summarize this sales dataset",
        table_name="sales",
        provider_requested="deepseek",
    )
    result = run_agent_runtime_skeleton(request)

    assert result.run.provider_requested == "deepseek"
    assert result.run.provider_used == "mock"
    assert result.run.fallback_triggered is True
    assert result.run.fallback_type == FallbackType.PROVIDER
    assert result.run.fallback_reason
    assert result.run.is_simulated is True


def test_empty_input_is_validation_error() -> None:
    with pytest.raises(ValidationError):
        AgentRuntimeRequest(user_input="")

    with pytest.raises(ValidationError):
        AgentRuntimeRequest(user_input="   ")


def test_unsupported_intent_stops_before_tools() -> None:
    request = AgentRuntimeRequest(user_input="drop this table", table_name="sales")
    result = run_agent_runtime_skeleton(request)

    assert result.routed_intent is not None
    assert result.routed_intent.intent == IntentCategory.UNSUPPORTED
    assert result.run.status == AgentStatus.UNSUPPORTED
    assert result.run.tool_calls == []
    assert result.warnings
    assert result.run.steps[0].output_json is not None
    assert result.run.steps[0].output_json["route"]["safety_flags"]


def test_ambiguous_intent_requests_clarification_before_tools() -> None:
    request = AgentRuntimeRequest(user_input="analyze")
    result = run_agent_runtime_skeleton(request)

    assert result.routed_intent is not None
    assert result.routed_intent.intent == IntentCategory.AMBIGUOUS
    assert result.run.status == AgentStatus.CLARIFICATION_REQUIRED
    assert result.run.tool_calls == []
    assert result.warnings


def test_disabled_runtime_config_records_warnings_without_execution() -> None:
    request = AgentRuntimeRequest(user_input="Please summarize this sales dataset", table_name="sales")
    config = AgentRuntimeConfig(
        enable_real_provider=True,
        enable_sql_execution=True,
        enable_persistence=True,
        enable_frontend_contract=True,
    )
    result = run_agent_runtime_skeleton(request, config=config)

    assert result.run.status == AgentStatus.COMPLETED
    assert result.run.tool_calls == []
    assert len(result.warnings) >= 4
    assert result.run.steps[0].output_json is not None
    assert result.run.steps[0].output_json["runtime"]["tool_chain_executed"] is False


def test_runtime_result_serializes() -> None:
    result = run_agent_runtime_skeleton(AgentRuntimeRequest(user_input="Please summarize sales", table_name="sales"))

    dumped = result.model_dump(mode="json")
    json_text = result.model_dump_json()

    assert dumped["run"]["run_id"] == result.run.run_id
    assert dumped["summary"]["tool_call_count"] == 0
    assert "runtime_mode" in json_text


def test_runtime_source_has_no_tool_chain_execution_calls() -> None:
    source = RUNTIME_PATH.read_text(encoding="utf-8")
    forbidden = [
        "generate_sql_with_existing_" + "pipeline(",
        "execute_readonly_sql_with_existing_" + "executor(",
        "summarize_findings_with_existing_" + "pipeline(",
        "build_report_with_existing_" + "pipeline(",
        "run_langchain_mock_" + "agent(",
        "run_mock_" + "agent(",
    ]

    for term in forbidden:
        assert term not in source


def test_runtime_source_has_no_provider_or_network_leakage() -> None:
    source = RUNTIME_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
        "lang" + "graph",
        "lang" + "smith",
        "api_" + "key",
        "_run_with_" + "provider",
        "provider_" + "runtime",
    ]

    for term in forbidden:
        assert term not in source
