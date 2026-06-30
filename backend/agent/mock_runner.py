"""Deterministic mock Agent run transcript builder for M5.1.4.

This module connects native contracts, the deterministic router, and the
mock-safe tool registry. It does not access databases, networks, providers,
routes, or existing AI pipeline services.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from backend.agent.contracts import (
    AgentRun,
    AgentRunSummary,
    AgentStatus,
    AgentStep,
    AgentStepState,
    FallbackType,
    IntentCategory,
    ToolCall,
    ToolCallStatus,
)
from backend.agent.router import route_intent
from backend.agent.tools import ToolRegistry, get_default_tool_registry


_DEFAULT_SQL = "SELECT * FROM mock_sales LIMIT 3"
_MAX_STEPS = 5


def run_mock_agent(
    user_goal: str,
    *,
    table_name: str | None = "mock_sales",
    provider_requested: str = "mock",
) -> AgentRun:
    """Build a deterministic mock AgentRun transcript.

    The run is intentionally local and deterministic: no LLM, no database,
    no network, no persistence, and no existing pipeline integration.
    """

    table = table_name or "mock_sales"
    route = route_intent(user_goal, table_name=table)
    fallback_triggered = provider_requested != "mock"
    run = AgentRun(
        table_name=table,
        user_goal=user_goal,
        intent=route.intent,
        selected_mode=route.selected_mode,
        provider_requested=provider_requested,
        provider_used="mock",
        is_simulated=True,
        fallback_triggered=fallback_triggered,
        fallback_type=FallbackType.PROVIDER if fallback_triggered else FallbackType.NONE,
        fallback_reason="deterministic mock runner fallback" if fallback_triggered else None,
        status=AgentStatus.RUNNING,
        agent_name="data_analyst_agent",
    )

    routing_step = _build_routing_step(run=run, route_payload=route.model_dump(mode="json"))
    run.steps.append(routing_step)

    if route.intent == IntentCategory.AMBIGUOUS:
        run.status = AgentStatus.CLARIFICATION_REQUIRED
        run.updated_at = _utc_now()
        return run

    if route.intent == IntentCategory.UNSUPPORTED:
        run.status = AgentStatus.UNSUPPORTED
        run.updated_at = _utc_now()
        return run

    tool_plan = _tool_plan_for_intent(route.intent, table_name=table)
    if not tool_plan:
        run.status = AgentStatus.COMPLETED
        run.updated_at = _utc_now()
        return run

    registry = get_default_tool_registry()
    for tool_name, input_json in tool_plan[: _MAX_STEPS - len(run.steps)]:
        step, tool_call = _run_mock_tool(
            run=run,
            registry=registry,
            step_index=len(run.steps),
            tool_name=tool_name,
            input_json=input_json,
        )
        run.steps.append(step)
        run.tool_calls.append(tool_call)

    run.status = AgentStatus.COMPLETED
    run.updated_at = _utc_now()
    return run


def build_mock_run_summary(run: AgentRun, findings_count: int = 0) -> AgentRunSummary:
    return run.to_summary(findings_count=findings_count)


def _tool_plan_for_intent(intent: IntentCategory, *, table_name: str) -> list[tuple[str, dict[str, Any]]]:
    if intent in {IntentCategory.DATA_PREVIEW, IntentCategory.SIMPLE_SUMMARY}:
        return [
            ("inspect_schema", {"table_name": table_name}),
            ("profile_table", {"table_name": table_name}),
        ]
    if intent == IntentCategory.SQL_QUESTION:
        return [("execute_readonly_sql", {"sql": _DEFAULT_SQL, "row_limit": 3})]
    if intent == IntentCategory.AGENT_ANALYSIS:
        return [
            ("inspect_schema", {"table_name": table_name}),
            ("profile_table", {"table_name": table_name}),
            ("execute_readonly_sql", {"sql": _DEFAULT_SQL, "row_limit": 3}),
        ]
    return []


def _build_routing_step(run: AgentRun, route_payload: dict[str, Any]) -> AgentStep:
    return AgentStep(
        run_id=run.run_id,
        root_run_id=run.root_run_id or run.run_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        step_index=0,
        state=AgentStepState.MODE_ROUTING,
        status=AgentStatus.COMPLETED,
        input_json={"user_goal": run.user_goal, "table_name": run.table_name},
        output_json=route_payload,
        evidence_json=[],
        ended_at=_utc_now(),
    )


def _run_mock_tool(
    *,
    run: AgentRun,
    registry: ToolRegistry,
    step_index: int,
    tool_name: str,
    input_json: dict[str, Any],
) -> tuple[AgentStep, ToolCall]:
    result = registry.call_tool(tool_name, input_json)
    evidence_json = [evidence.model_dump(mode="json") for evidence in result.evidence_refs]
    step = AgentStep(
        run_id=run.run_id,
        root_run_id=run.root_run_id or run.run_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        step_index=step_index,
        state=AgentStepState.TOOL_EXECUTION,
        tool_name=tool_name,
        status=AgentStatus.COMPLETED,
        input_json=input_json,
        output_json=result.output,
        evidence_json=evidence_json,
        ended_at=_utc_now(),
    )
    tool_call = ToolCall(
        run_id=run.run_id,
        step_id=step.step_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        tool_name=tool_name,
        input_json=input_json,
        output_json=result.output,
        evidence_json=evidence_json,
        duration_ms=result.duration_ms,
        provider_used=run.provider_used,
        is_simulated=True,
        status=ToolCallStatus.COMPLETED,
        error=result.error,
    )
    return step, tool_call


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)
