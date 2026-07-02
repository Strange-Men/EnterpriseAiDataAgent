from pathlib import Path

import pytest
from pydantic import ValidationError

from backend.agent.api_contracts import (
    AgentErrorResponse,
    AgentRunDetailResponse,
    AgentRunListItem,
    AgentRunListResponse,
    AgentRunMode,
    AgentRunRequest,
    AgentRunResponse,
    api_response_from_runtime_result,
    runtime_request_from_api_request,
)
from backend.agent.runtime import AgentRuntimeRequest, AgentRuntimeMode, run_agent_runtime_skeleton


CONTRACT_PATH = Path("backend/agent/api_contracts.py")
TEST_PATH = Path("tests/unit/test_agent_api_contracts.py")


def test_agent_run_request_defaults() -> None:
    request = AgentRunRequest(user_input="Analyze sales data")

    assert request.provider_requested == "mock"
    assert request.mode == AgentRunMode.SKELETON
    assert request.metadata == {}
    assert request.table_name is None
    assert request.dataset_id is None


def test_agent_run_request_validation_rejects_empty_input() -> None:
    with pytest.raises(ValidationError):
        AgentRunRequest(user_input="")

    with pytest.raises(ValidationError):
        AgentRunRequest(user_input="   ")


def test_runtime_request_mapping_preserves_fields() -> None:
    request = AgentRunRequest(
        user_input="Analyze sales data",
        table_name="sales",
        dataset_id="dataset_1",
        provider_requested="mock",
        mode=AgentRunMode.SIMULATED_CHAIN,
        metadata={"source": "unit"},
    )
    runtime_request = runtime_request_from_api_request(request)

    assert isinstance(runtime_request, AgentRuntimeRequest)
    assert runtime_request.user_input == request.user_input
    assert runtime_request.provider_requested == request.provider_requested
    assert runtime_request.table_name == request.table_name
    assert runtime_request.dataset_id == request.dataset_id
    assert runtime_request.metadata == request.metadata
    assert runtime_request.mode == AgentRuntimeMode.SIMULATED


def test_api_response_mapping_from_runtime_result() -> None:
    runtime_result = run_agent_runtime_skeleton(
        AgentRuntimeRequest(user_input="Please summarize sales", table_name="sales")
    )
    response = api_response_from_runtime_result(runtime_result)

    assert isinstance(response, AgentRunResponse)
    assert response.run.run_id == runtime_result.run.run_id
    assert response.runtime_mode == runtime_result.runtime_mode.value
    assert response.routed_intent == runtime_result.routed_intent
    assert response.warnings == runtime_result.warnings


def test_api_contract_models_are_serializable() -> None:
    runtime_result = run_agent_runtime_skeleton(AgentRuntimeRequest(user_input="Please summarize sales"))
    response = api_response_from_runtime_result(runtime_result)
    list_item = AgentRunListItem(
        run_id=runtime_result.run.run_id,
        status=runtime_result.run.status.value,
        user_input=runtime_result.run.user_goal,
        intent=runtime_result.run.intent.value if runtime_result.run.intent else None,
        provider_requested=runtime_result.run.provider_requested,
        provider_used=runtime_result.run.provider_used,
        is_simulated=runtime_result.run.is_simulated,
        created_at=runtime_result.run.created_at.isoformat(),
    )
    list_response = AgentRunListResponse(items=[list_item], total=1)
    detail_response = AgentRunDetailResponse(
        run=runtime_result.run,
        steps=runtime_result.run.steps,
        tool_calls=runtime_result.run.tool_calls,
        warnings=runtime_result.warnings,
    )
    error_response = AgentErrorResponse(error="Invalid request", code="invalid_request", detail={"field": "user_input"})

    for model in [
        AgentRunRequest(user_input="Analyze sales data"),
        response,
        list_item,
        list_response,
        detail_response,
        error_response,
    ]:
        dumped = model.model_dump(mode="json")
        json_text = model.model_dump_json()
        assert dumped
        assert json_text


def test_api_contract_source_has_no_route_leakage() -> None:
    source = CONTRACT_PATH.read_text(encoding="utf-8")
    test_source = TEST_PATH.read_text(encoding="utf-8")
    forbidden = ["API" + "Router", "@rou" + "ter", "Fast" + "API", "Dep" + "ends"]

    for term in forbidden:
        assert term not in source
        assert term not in test_source


def test_api_contract_source_has_no_storage_or_provider_leakage() -> None:
    source = CONTRACT_PATH.read_text(encoding="utf-8").lower()
    test_source = TEST_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "sql" + "ite",
        "duck" + "db",
        "sess" + "ion",
        "mig" + "ration",
        "ale" + "mbic",
        "create_" + "table",
        "ins" + "ert",
        "up" + "date",
        "del" + "ete",
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
        "lang" + "graph",
        "lang" + "smith",
        "_run_with_" + "provider",
        "provider_" + "runtime",
        "api_" + "key",
    ]

    for term in forbidden:
        assert term not in source
        assert term not in test_source
