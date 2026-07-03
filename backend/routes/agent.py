"""Agent API route skeleton for M5.4."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from backend.agent.api_contracts import (
    AgentRunMode,
    AgentRunRequest,
    AgentRunResponse,
    api_response_from_runtime_result,
    runtime_request_from_api_request,
)
from backend.agent.memory_store import AgentRunRecord, InMemoryAgentRunStore
from backend.agent.runtime import run_agent_runtime_skeleton


router = APIRouter(prefix="/api/agent", tags=["agent"])
_DEFAULT_AGENT_RUN_STORE = InMemoryAgentRunStore()


def get_agent_run_store() -> Any:
    """Return the process-local AgentRun store used by the route skeleton."""

    return _DEFAULT_AGENT_RUN_STORE


@router.post("/runs", response_model=AgentRunResponse)
def start_agent_run(
    request: AgentRunRequest,
    store: Any = Depends(get_agent_run_store),
) -> AgentRunResponse:
    """Run a skeleton Agent request and save its ephemeral trace."""

    if request.mode == AgentRunMode.SIMULATED_CHAIN:
        raise HTTPException(
            status_code=501,
            detail={
                "error": "simulated_chain route execution is not enabled in M5.4.4",
                "code": "agent_mode_not_enabled",
                "detail": {"mode": request.mode.value},
            },
        )

    runtime_request = runtime_request_from_api_request(request)
    runtime_result = run_agent_runtime_skeleton(runtime_request)
    response = api_response_from_runtime_result(runtime_result)
    _save_agent_run_record(response=response, store=store)
    return response


def _save_agent_run_record(*, response: AgentRunResponse, store: Any) -> None:
    try:
        store.save_run(
            AgentRunRecord(
                run=response.run,
                steps=response.run.steps,
                tool_calls=response.run.tool_calls,
                warnings=response.warnings,
                metadata={
                    "persistence_mode": "in_memory",
                    "persistence_scope": "route_level",
                    "is_ephemeral": True,
                },
            )
        )
    except Exception as exc:
        response.warnings.append(f"persistence_save_failed: {exc}")
