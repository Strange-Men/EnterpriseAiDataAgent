"""Minimal Agent Runtime boundary for M5.4.1.

This module defines the backend Agent runtime entry boundary only. It routes
intent and constructs a native AgentRun, but it does not execute tools, call
providers, run SQL, access persistence, expose routes, or call the M5.3
pipeline wrappers.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator

from backend.agent.contracts import (
    AgentRun,
    AgentRunSummary,
    AgentStatus,
    AgentStep,
    AgentStepState,
    FallbackType,
    IntentCategory,
    IntentRoute,
)
from backend.agent.router import route_intent


class AgentRuntimeMode(str, Enum):
    SKELETON = "skeleton"
    SIMULATED = "simulated"


class AgentRuntimeRequest(BaseModel):
    user_input: str = Field(min_length=1)
    table_name: str | None = None
    dataset_id: str | None = None
    provider_requested: str = Field(default="mock", min_length=1)
    mode: AgentRuntimeMode = AgentRuntimeMode.SKELETON
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


class AgentRuntimeConfig(BaseModel):
    enable_real_provider: bool = False
    enable_sql_execution: bool = False
    enable_persistence: bool = False
    enable_frontend_contract: bool = False


class AgentRuntimeResult(BaseModel):
    run: AgentRun
    summary: AgentRunSummary | None = None
    routed_intent: IntentRoute | None = None
    runtime_mode: AgentRuntimeMode
    warnings: list[str] = Field(default_factory=list)


def run_agent_runtime_skeleton(
    request: AgentRuntimeRequest,
    config: AgentRuntimeConfig | None = None,
) -> AgentRuntimeResult:
    """Route a request and build an AgentRun without executing tools.

    M5.4.1 intentionally stops at the runtime boundary. The simulated tool
    chain is reserved for M5.4.2 after review.
    """

    runtime_config = config or AgentRuntimeConfig()
    warnings = _config_warnings(runtime_config)
    route = route_intent(request.user_input, table_name=request.table_name)
    provider_requested = request.provider_requested or "mock"
    fallback_triggered = provider_requested != "mock"

    run = AgentRun(
        table_name=request.table_name,
        user_goal=request.user_input,
        intent=route.intent,
        selected_mode=route.selected_mode,
        provider_requested=provider_requested,
        provider_used="mock",
        is_simulated=True,
        fallback_triggered=fallback_triggered,
        fallback_type=FallbackType.PROVIDER if fallback_triggered else FallbackType.NONE,
        fallback_reason="Agent runtime skeleton uses mock provider boundary." if fallback_triggered else None,
        status=_status_for_route(route),
        agent_name="data_analyst_agent",
    )
    run.steps.append(_routing_step(run=run, route=route, request=request, config=runtime_config))
    run.updated_at = _utc_now()

    if route.intent == IntentCategory.AMBIGUOUS:
        warnings.append("Clarification required before tool execution.")
    elif route.intent == IntentCategory.UNSUPPORTED:
        warnings.append("Unsupported or unsafe request stopped before tool execution.")
    else:
        warnings.append("Runtime skeleton completed routing only; tool chain execution is disabled in M5.4.1.")

    return AgentRuntimeResult(
        run=run,
        summary=run.to_summary(),
        routed_intent=route,
        runtime_mode=request.mode,
        warnings=warnings,
    )


def _status_for_route(route: IntentRoute) -> AgentStatus:
    if route.intent == IntentCategory.AMBIGUOUS:
        return AgentStatus.CLARIFICATION_REQUIRED
    if route.intent == IntentCategory.UNSUPPORTED:
        return AgentStatus.UNSUPPORTED
    return AgentStatus.COMPLETED


def _routing_step(
    *,
    run: AgentRun,
    route: IntentRoute,
    request: AgentRuntimeRequest,
    config: AgentRuntimeConfig,
) -> AgentStep:
    return AgentStep(
        run_id=run.run_id,
        root_run_id=run.root_run_id or run.run_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        step_index=0,
        state=AgentStepState.MODE_ROUTING,
        status=AgentStatus.COMPLETED,
        input_json={
            "user_input": request.user_input,
            "table_name": request.table_name,
            "dataset_id": request.dataset_id,
            "runtime_mode": request.mode.value,
            "metadata": request.metadata,
        },
        output_json={
            "route": route.model_dump(mode="json"),
            "runtime": {
                "mode": request.mode.value,
                "enable_real_provider": config.enable_real_provider,
                "enable_sql_execution": config.enable_sql_execution,
                "enable_persistence": config.enable_persistence,
                "enable_frontend_contract": config.enable_frontend_contract,
                "tool_chain_executed": False,
            },
        },
        evidence_json=[],
        ended_at=_utc_now(),
    )


def _config_warnings(config: AgentRuntimeConfig) -> list[str]:
    warnings: list[str] = []
    if config.enable_real_provider:
        warnings.append("Real provider execution is disabled by the M5.4.1 skeleton.")
    if config.enable_sql_execution:
        warnings.append("SQL execution is disabled by the M5.4.1 skeleton.")
    if config.enable_persistence:
        warnings.append("Persistence is disabled by the M5.4.1 skeleton.")
    if config.enable_frontend_contract:
        warnings.append("Frontend contract exposure is disabled by the M5.4.1 skeleton.")
    return warnings


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)
