"""Minimal Agent Runtime boundary for M5.4.

This module defines the backend Agent runtime entry boundary only. It routes
intent and constructs native AgentRun records. M5.4.2 adds a controlled
simulated chain that can call M5.3 wrappers only through injected fakes.
It does not call providers, access production databases, write persistence,
or expose routes.
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
    ToolCall,
    ToolCallStatus,
    ToolResult,
    ToolResultStatus,
)
from backend.agent import pipeline_adapter
from backend.agent.router import route_intent


class AgentRuntimeMode(str, Enum):
    SKELETON = "skeleton"
    SIMULATED = "simulated"


class AgentRuntimeRequest(BaseModel):
    user_input: str = Field(min_length=1)
    table_name: str | None = None
    dataset_id: str | None = None
    provider_requested: str = Field(default="mock", min_length=1)
    locale: str = "zh-CN"
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

    @field_validator("locale", mode="before")
    @classmethod
    def _normalize_locale(cls, value: Any) -> str:
        text = str(value or "").strip().lower().replace("_", "-")
        if text in {"en", "en-us", "enus"}:
            return "en-US"
        return "zh-CN"


class AgentRuntimeConfig(BaseModel):
    enable_real_provider: bool = False
    enable_sql_execution: bool = False
    enable_persistence: bool = False
    enable_frontend_contract: bool = False


class AgentRuntimeInjectedTools(BaseModel):
    generator: Any | None = None
    executor: Any | None = None
    summarizer: Any | None = None
    report_builder: Any | None = None


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
        locale=request.locale,
        status=_status_for_route(route),
        agent_name="data_analyst_agent",
    )
    run.steps.append(_routing_step(run=run, route=route, request=request, config=runtime_config))

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


def run_agent_runtime_simulated_chain(
    request: AgentRuntimeRequest,
    tools: AgentRuntimeInjectedTools,
    config: AgentRuntimeConfig | None = None,
) -> AgentRuntimeResult:
    """Run a controlled simulated chain through M5.3 wrappers.

    All variable external capabilities must be injected. The runtime never
    enables live providers, route handling, persistence, or default database
    executors in this stage.
    """

    runtime_config = config or AgentRuntimeConfig()
    warnings = _config_warnings(runtime_config)
    route = route_intent(request.user_input, table_name=request.table_name)
    run = _new_runtime_run(request=request, route=route, mode=AgentRuntimeMode.SIMULATED)
    run.status = AgentStatus.RUNNING
    run.steps.append(_routing_step(run=run, route=route, request=request, config=runtime_config))

    if route.intent == IntentCategory.AMBIGUOUS:
        run.status = AgentStatus.CLARIFICATION_REQUIRED
        warnings.append("Clarification required before simulated chain execution.")
        return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)

    if route.intent == IntentCategory.UNSUPPORTED:
        run.status = AgentStatus.UNSUPPORTED
        warnings.append("Unsupported or unsafe request stopped before simulated chain execution.")
        return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)

    sql_result = _call_generate_sql(request=request, tools=tools)
    _append_tool_result(run=run, result=sql_result, input_json={"user_goal": request.user_input, "table_name": request.table_name})
    if _stop_if_not_completed(run=run, result=sql_result, warnings=warnings):
        return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)

    sql = str(sql_result.output.get("sql") or "")
    execution_result = _call_execute_sql(request=request, tools=tools, sql=sql)
    _append_tool_result(
        run=run,
        result=execution_result,
        input_json={"sql": sql, "table_name": request.table_name, "row_limit": 50},
    )
    if _stop_if_not_completed(run=run, result=execution_result, warnings=warnings):
        return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)

    execution_evidence = [
        {
            "summary": execution_result.output.get("summary", "Readonly SQL execution completed."),
            "rows": execution_result.output.get("rows", []),
            "columns": execution_result.output.get("columns", []),
        }
    ]
    summary_result = _call_summarize(request=request, tools=tools, sql=sql, execution_result=execution_result, evidence=execution_evidence)
    _append_tool_result(
        run=run,
        result=summary_result,
        input_json={"user_goal": request.user_input, "sql": sql, "evidence": execution_evidence},
    )
    if _stop_if_not_completed(run=run, result=summary_result, warnings=warnings):
        return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)

    report_result = _call_build_report(request=request, tools=tools, summary_result=summary_result)
    _append_tool_result(
        run=run,
        result=report_result,
        input_json={
            "user_goal": request.user_input,
            "summary": summary_result.output.get("summary"),
            "findings": summary_result.output.get("findings", []),
            "evidence": summary_result.output.get("evidence", []),
        },
    )
    if _stop_if_not_completed(run=run, result=report_result, warnings=warnings):
        return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)

    run.status = AgentStatus.COMPLETED
    warnings.append("Runtime simulated chain completed with injected tools.")
    return _runtime_result(run=run, route=route, warnings=warnings, mode=AgentRuntimeMode.SIMULATED)


def _status_for_route(route: IntentRoute) -> AgentStatus:
    if route.intent == IntentCategory.AMBIGUOUS:
        return AgentStatus.CLARIFICATION_REQUIRED
    if route.intent == IntentCategory.UNSUPPORTED:
        return AgentStatus.UNSUPPORTED
    return AgentStatus.COMPLETED


def _new_runtime_run(*, request: AgentRuntimeRequest, route: IntentRoute, mode: AgentRuntimeMode) -> AgentRun:
    provider_requested = request.provider_requested or "mock"
    fallback_triggered = provider_requested != "mock"
    return AgentRun(
        table_name=request.table_name,
        user_goal=request.user_input,
        intent=route.intent,
        selected_mode=route.selected_mode,
        provider_requested=provider_requested,
        provider_used="mock",
        is_simulated=True,
        fallback_triggered=fallback_triggered,
        fallback_type=FallbackType.PROVIDER if fallback_triggered else FallbackType.NONE,
        fallback_reason=f"Agent runtime {mode.value} uses mock provider boundary." if fallback_triggered else None,
        locale=request.locale,
        status=_status_for_route(route),
        agent_name="data_analyst_agent",
    )


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


def _append_tool_result(*, run: AgentRun, result: ToolResult, input_json: dict[str, Any]) -> None:
    evidence_json = [evidence.model_dump(mode="json") for evidence in result.evidence_refs]
    step = AgentStep(
        run_id=run.run_id,
        root_run_id=run.root_run_id or run.run_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        step_index=len(run.steps),
        state=AgentStepState.TOOL_EXECUTION,
        tool_name=result.tool_name,
        status=AgentStatus.COMPLETED if result.status == ToolResultStatus.COMPLETED else AgentStatus.FAILED,
        input_json=input_json,
        output_json=result.output,
        evidence_json=evidence_json,
        ended_at=_utc_now(),
        error=result.error,
    )
    call = ToolCall(
        run_id=run.run_id,
        step_id=step.step_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        tool_name=result.tool_name,
        input_json=input_json,
        output_json=result.output,
        evidence_json=evidence_json,
        duration_ms=result.duration_ms,
        provider_used=run.provider_used,
        is_simulated=True,
        status=_tool_call_status(result.status),
        error=result.error,
    )
    run.steps.append(step)
    run.tool_calls.append(call)


def _tool_call_status(status: ToolResultStatus) -> ToolCallStatus:
    if status == ToolResultStatus.COMPLETED:
        return ToolCallStatus.COMPLETED
    if status == ToolResultStatus.REJECTED:
        return ToolCallStatus.REJECTED
    return ToolCallStatus.FAILED


def _stop_if_not_completed(*, run: AgentRun, result: ToolResult, warnings: list[str]) -> bool:
    if result.status == ToolResultStatus.COMPLETED:
        return False
    run.status = AgentStatus.FAILED
    run.error = result.error or f"{result.tool_name} did not complete."
    warnings.append(run.error)
    return True


def _runtime_result(
    *,
    run: AgentRun,
    route: IntentRoute,
    warnings: list[str],
    mode: AgentRuntimeMode,
) -> AgentRuntimeResult:
    return AgentRuntimeResult(
        run=run,
        summary=run.to_summary(),
        routed_intent=route,
        runtime_mode=mode,
        warnings=warnings,
    )


def _call_generate_sql(*, request: AgentRuntimeRequest, tools: AgentRuntimeInjectedTools) -> ToolResult:
    function = getattr(pipeline_adapter, "generate_sql_with_existing_" + "pipeline")
    return function(
        user_goal=request.user_input,
        table_name=request.table_name,
        schema=request.metadata.get("schema") if isinstance(request.metadata.get("schema"), dict) else None,
        provider_requested=request.provider_requested,
        generator=tools.generator,
        allow_real_provider=False,
    )


def _call_execute_sql(*, request: AgentRuntimeRequest, tools: AgentRuntimeInjectedTools, sql: str) -> ToolResult:
    function = getattr(pipeline_adapter, "execute_readonly_sql_with_existing_" + "executor")
    return function(
        sql=sql,
        table_name=request.table_name,
        row_limit=50,
        executor=tools.executor,
        use_default_executor=False,
    )


def _call_summarize(
    *,
    request: AgentRuntimeRequest,
    tools: AgentRuntimeInjectedTools,
    sql: str,
    execution_result: ToolResult,
    evidence: list[dict[str, Any]],
) -> ToolResult:
    function = getattr(pipeline_adapter, "summarize_findings_with_existing_" + "pipeline")
    return function(
        user_goal=request.user_input,
        sql=sql,
        rows=execution_result.output.get("rows", []),
        evidence=evidence,
        provider_requested=request.provider_requested,
        summarizer=tools.summarizer,
        allow_real_provider=False,
    )


def _call_build_report(
    *,
    request: AgentRuntimeRequest,
    tools: AgentRuntimeInjectedTools,
    summary_result: ToolResult,
) -> ToolResult:
    function = getattr(pipeline_adapter, "build_report_with_existing_" + "pipeline")
    return function(
        user_goal=request.user_input,
        summary=summary_result.output.get("summary"),
        findings=summary_result.output.get("findings", []),
        evidence=summary_result.output.get("evidence", []),
        provider_requested=request.provider_requested,
        report_builder=tools.report_builder,
        allow_real_provider=False,
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
