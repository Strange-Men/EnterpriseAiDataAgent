"""Optional LangChain harness for the native EAI Agent foundation.

The adapter is intentionally narrow: it wraps the M5.1 mock-safe ToolRegistry
with LangChain-compatible tools and normalizes all results back into native EAI
contracts. It does not call real providers, databases, services, or routes.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from backend.agent.contracts import (
    AgentRun,
    AgentStatus,
    AgentStep,
    AgentStepState,
    FallbackType,
    IntentCategory,
    ToolCall,
    ToolCallStatus,
    ToolResult,
)
from backend.agent.mock_runner import run_mock_agent
from backend.agent.router import route_intent
from backend.agent.tools import ToolDefinition, ToolRegistry, get_default_tool_registry

try:  # pragma: no cover - exercised indirectly when dependency exists.
    from langchain_core.tools import StructuredTool

    LANGCHAIN_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised only without optional dependency.
    StructuredTool = None  # type: ignore[assignment]
    LANGCHAIN_AVAILABLE = False


_DEFAULT_SQL = "SELECT * FROM mock_sales LIMIT 3"
_MAX_STEPS = 5


def is_langchain_available() -> bool:
    """Return whether the optional LangChain tool wrapper is importable."""

    return LANGCHAIN_AVAILABLE


def run_langchain_mock_agent(
    user_goal: str,
    *,
    table_name: str | None = "mock_sales",
    provider_requested: str = "mock",
) -> AgentRun:
    """Run the optional LangChain harness and return a native EAI AgentRun.

    This function remains deterministic and local. If the optional dependency is
    unavailable, it falls back to the native mock runner and marks that fallback
    in the returned run metadata.
    """

    if not LANGCHAIN_AVAILABLE:
        return _fallback_to_native_runner(
            user_goal=user_goal,
            table_name=table_name,
            provider_requested=provider_requested,
            reason="LangChain unavailable; used native mock runner",
        )

    try:
        return _run_langchain_tool_harness(
            user_goal=user_goal,
            table_name=table_name,
            provider_requested=provider_requested,
        )
    except Exception as exc:  # pragma: no cover - defensive fallback.
        return _fallback_to_native_runner(
            user_goal=user_goal,
            table_name=table_name,
            provider_requested=provider_requested,
            reason=f"LangChain adapter failed; used native mock runner: {exc}",
        )


def _run_langchain_tool_harness(
    *,
    user_goal: str,
    table_name: str | None,
    provider_requested: str,
) -> AgentRun:
    table = table_name or "mock_sales"
    route = route_intent(user_goal, table_name=table)
    fallback_triggered = provider_requested != "mock"
    run = AgentRun(
        table_name=table,
        user_goal=_contract_user_goal(user_goal),
        intent=route.intent,
        selected_mode=route.selected_mode,
        provider_requested=provider_requested,
        provider_used="mock",
        is_simulated=True,
        fallback_triggered=fallback_triggered,
        fallback_type=FallbackType.PROVIDER if fallback_triggered else FallbackType.NONE,
        fallback_reason="optional LangChain harness uses deterministic mock provider" if fallback_triggered else None,
        status=AgentStatus.RUNNING,
        agent_name="data_analyst_agent",
    )

    run.steps.append(
        _build_step(
            run=run,
            step_index=0,
            state=AgentStepState.MODE_ROUTING,
            status=AgentStatus.COMPLETED,
        input_json={"user_goal": run.user_goal, "table_name": run.table_name},
            output_json=route.model_dump(mode="json"),
        )
    )

    if route.intent == IntentCategory.AMBIGUOUS:
        run.status = AgentStatus.CLARIFICATION_REQUIRED
        run.updated_at = _utc_now()
        return run

    if route.intent == IntentCategory.UNSUPPORTED:
        run.status = AgentStatus.UNSUPPORTED
        run.updated_at = _utc_now()
        return run

    registry = get_default_tool_registry()
    langchain_tools = _build_langchain_tools(registry)
    tool_plan = _tool_plan_for_intent(route.intent, table_name=table)

    for tool_name, input_json in tool_plan[: _MAX_STEPS - len(run.steps)]:
        langchain_tool = langchain_tools[tool_name]
        result_payload = langchain_tool.invoke(input_json)
        result = ToolResult.model_validate(result_payload)
        step, tool_call = _normalize_tool_result(
            run=run,
            step_index=len(run.steps),
            tool_name=tool_name,
            input_json=input_json,
            result=result,
        )
        run.steps.append(step)
        run.tool_calls.append(tool_call)

    run.status = AgentStatus.COMPLETED
    run.updated_at = _utc_now()
    return run


def _build_langchain_tools(registry: ToolRegistry) -> dict[str, Any]:
    if StructuredTool is None:
        raise RuntimeError("LangChain tool wrapper is unavailable.")

    tools: dict[str, Any] = {}
    for definition in registry.list_tools():
        tools[definition.name] = _build_single_langchain_tool(registry, definition)
    return tools


def _build_single_langchain_tool(registry: ToolRegistry, definition: ToolDefinition) -> Any:
    def _call_tool(**kwargs: Any) -> dict[str, Any]:
        result = registry.call_tool(definition.name, kwargs)
        return result.model_dump(mode="json")

    _call_tool.__name__ = f"call_{definition.name}"
    return StructuredTool.from_function(
        func=_call_tool,
        name=definition.name,
        description=definition.description,
        args_schema=definition.input_model,
    )


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


def _normalize_tool_result(
    *,
    run: AgentRun,
    step_index: int,
    tool_name: str,
    input_json: dict[str, Any],
    result: ToolResult,
) -> tuple[AgentStep, ToolCall]:
    evidence_json = [evidence.model_dump(mode="json") for evidence in result.evidence_refs]
    step = _build_step(
        run=run,
        step_index=step_index,
        state=AgentStepState.TOOL_EXECUTION,
        status=AgentStatus.COMPLETED,
        input_json=input_json,
        output_json=result.output,
        evidence_json=evidence_json,
        tool_name=tool_name,
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


def _build_step(
    *,
    run: AgentRun,
    step_index: int,
    state: AgentStepState,
    status: AgentStatus,
    input_json: dict[str, Any],
    output_json: dict[str, Any] | None,
    evidence_json: list[dict[str, Any]] | None = None,
    tool_name: str | None = None,
) -> AgentStep:
    return AgentStep(
        run_id=run.run_id,
        root_run_id=run.root_run_id or run.run_id,
        agent_role=run.agent_role,
        agent_name=run.agent_name,
        step_index=step_index,
        state=state,
        tool_name=tool_name,
        status=status,
        input_json=input_json,
        output_json=output_json,
        evidence_json=evidence_json or [],
        ended_at=_utc_now(),
    )


def _fallback_to_native_runner(
    *,
    user_goal: str,
    table_name: str | None,
    provider_requested: str,
    reason: str,
) -> AgentRun:
    run = run_mock_agent(_contract_user_goal(user_goal), table_name=table_name, provider_requested=provider_requested)
    if provider_requested == "mock":
        run.fallback_type = FallbackType.TOOL
    run.fallback_triggered = True
    run.fallback_reason = reason
    run.is_simulated = True
    run.provider_used = "mock"
    run.updated_at = _utc_now()
    return run


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _contract_user_goal(user_goal: str) -> str:
    return user_goal.strip() or "(empty goal)"
