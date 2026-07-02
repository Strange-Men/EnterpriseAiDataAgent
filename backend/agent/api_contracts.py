"""Agent API contract models for future M5.4 endpoints.

This module defines request and response schemas only. It performs object
mapping between API-facing contracts and runtime contracts, but it does not
execute runtime functions, tools, providers, storage, or network behavior.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator

from backend.agent.contracts import AgentRun, AgentStep, IntentRoute, ToolCall
from backend.agent.runtime import AgentRuntimeMode, AgentRuntimeRequest, AgentRuntimeResult


class AgentRunMode(str, Enum):
    SKELETON = "skeleton"
    SIMULATED_CHAIN = "simulated_chain"
    skeleton = "skeleton"
    simulated_chain = "simulated_chain"


class AgentRunRequest(BaseModel):
    user_input: str = Field(min_length=1)
    table_name: str | None = None
    dataset_id: str | None = None
    provider_requested: str = Field(default="mock", min_length=1)
    mode: AgentRunMode = AgentRunMode.SKELETON
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("user_input", "provider_requested", mode="before")
    @classmethod
    def _strip_required_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("table_name", "dataset_id", mode="before")
    @classmethod
    def _strip_optional_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        return value


class AgentRunResponse(BaseModel):
    run: AgentRun
    runtime_mode: str = Field(min_length=1)
    routed_intent: IntentRoute | None = None
    warnings: list[str] = Field(default_factory=list)


class AgentRunListItem(BaseModel):
    run_id: str = Field(min_length=1)
    status: str = Field(min_length=1)
    user_input: str | None = None
    intent: str | None = None
    provider_requested: str = Field(default="mock", min_length=1)
    provider_used: str = Field(default="mock", min_length=1)
    is_simulated: bool = True
    created_at: str | None = None


class AgentRunListResponse(BaseModel):
    items: list[AgentRunListItem] = Field(default_factory=list)
    total: int = Field(ge=0)


class AgentRunDetailResponse(BaseModel):
    run: AgentRun
    steps: list[AgentStep] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class AgentErrorResponse(BaseModel):
    error: str = Field(min_length=1)
    code: str = Field(min_length=1)
    detail: dict[str, Any] = Field(default_factory=dict)


def runtime_request_from_api_request(request: AgentRunRequest) -> AgentRuntimeRequest:
    """Map an API request model into a runtime request model."""

    return AgentRuntimeRequest(
        user_input=request.user_input,
        table_name=request.table_name,
        dataset_id=request.dataset_id,
        provider_requested=request.provider_requested,
        mode=_runtime_mode_from_api_mode(request.mode),
        metadata=request.metadata,
    )


def api_response_from_runtime_result(result: AgentRuntimeResult) -> AgentRunResponse:
    """Map a runtime result into the future API response contract."""

    return AgentRunResponse(
        run=result.run,
        runtime_mode=result.runtime_mode.value,
        routed_intent=result.routed_intent,
        warnings=result.warnings,
    )


def _runtime_mode_from_api_mode(mode: AgentRunMode) -> AgentRuntimeMode:
    if mode == AgentRunMode.SIMULATED_CHAIN:
        return AgentRuntimeMode.SIMULATED
    return AgentRuntimeMode.SKELETON
