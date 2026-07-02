"""Agent API route skeleton for M5.4.4."""

from fastapi import APIRouter, HTTPException

from backend.agent.api_contracts import (
    AgentRunMode,
    AgentRunRequest,
    AgentRunResponse,
    api_response_from_runtime_result,
    runtime_request_from_api_request,
)
from backend.agent.runtime import run_agent_runtime_skeleton


router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/runs", response_model=AgentRunResponse)
def create_agent_run(request: AgentRunRequest) -> AgentRunResponse:
    """Create a skeleton Agent run without persistence or tool-chain execution."""

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
    return api_response_from_runtime_result(runtime_result)
