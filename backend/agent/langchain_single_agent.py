"""LangChain Single Agent backend loop for M5.5.5.

This module keeps one Data Analyst Agent behind the existing Agent API route.
It uses LangChain Core tools for the tool-calling boundary, reuses existing
provider fallback, SQL guardrails, readonly execution, AgentRun contracts, and
the in-memory AgentRun store. It does not implement multiple cooperating
agents, graph orchestration, embedding memory, or frontend behavior.
"""

from __future__ import annotations

from datetime import datetime, timezone
import re
from time import perf_counter
from typing import Any

from pydantic import BaseModel, Field

from backend.agent.contracts import (
    AgentRun,
    AgentStatus,
    AgentStep,
    AgentStepState,
    EvidenceRef,
    FallbackType,
    IntentCategory,
    ToolCall,
    ToolCallStatus,
    ToolResult,
    ToolResultStatus,
)
from backend.agent.memory_store import AgentRunMemoryStore
from backend.agent.router import route_intent
from backend.agent.runtime import AgentRuntimeMode, AgentRuntimeRequest, AgentRuntimeResult
from backend.agent.tools import (
    ExecuteReadonlySqlInput,
    GenerateSqlInput,
    InspectSchemaInput,
    ProfileTableInput,
    SummarizeFindingsInput,
    get_default_tool_registry,
)
from backend.services import ai_analyst
from backend.services.data_service import get_quality_report, get_readonly_executor, get_table_schema
from backend.services.llm_runtime import (
    LLMProviderSelectionError,
    SUPPORTED_LLM_PROVIDERS,
    llm_context,
    summarize_llm_events,
)

try:  # pragma: no cover - import availability is also covered by route smoke.
    from langchain_core.tools import StructuredTool

    LANGCHAIN_SINGLE_AGENT_AVAILABLE = True
except ImportError:  # pragma: no cover - dependency is declared in requirements.
    StructuredTool = None  # type: ignore[assignment]
    LANGCHAIN_SINGLE_AGENT_AVAILABLE = False


class MemoryReadInput(BaseModel):
    run_id: str | None = None
    table_name: str | None = None


class MemoryWriteInput(BaseModel):
    run_id: str = Field(min_length=1)
    table_name: str | None = None
    summary: str | None = None


class LangChainSingleAgentService:
    """Small single-agent loop using LangChain Core tools."""

    def __init__(self, *, memory_store: AgentRunMemoryStore | None = None) -> None:
        self.memory_store = memory_store
        self.tool_names = [
            "inspect_schema",
            "profile_table",
            "generate_sql",
            "execute_readonly_sql",
            "summarize_findings",
            "memory_read",
            "memory_write",
        ]
        self._schema_cache: dict[str, Any] = {}
        self._memory_notes: list[dict[str, Any]] = []
        self._warnings: list[str] = []
        self._used_default_executor = False

    def run(self, request: AgentRuntimeRequest) -> AgentRuntimeResult:
        if not LANGCHAIN_SINGLE_AGENT_AVAILABLE:
            raise RuntimeError("langchain_core is required for the M5.5.5 single agent loop.")

        route = route_intent(request.user_input, table_name=request.table_name)
        provider_metadata = self._resolve_provider(request.provider_requested)
        warnings: list[str] = []

        run = AgentRun(
            table_name=request.table_name,
            user_goal=request.user_input,
            intent=route.intent,
            selected_mode=route.selected_mode,
            provider_requested=provider_metadata["provider_requested"],
            provider_used=provider_metadata["provider_used"],
            is_simulated=provider_metadata["provider_used"] == "mock",
            fallback_triggered=provider_metadata["fallback_triggered"],
            fallback_type=FallbackType.PROVIDER if provider_metadata["fallback_triggered"] else FallbackType.NONE,
            fallback_reason=provider_metadata["fallback_reason"],
            status=AgentStatus.RUNNING,
            agent_name="data_analyst_agent",
            trace={
                "agent": "langchain_single_agent",
                "langchain_core": True,
                "tool_plan": [],
                "provider": dict(provider_metadata),
            },
        )

        run.steps.append(self._routing_step(run=run, request=request, route=route, provider_metadata=provider_metadata))

        if route.intent == IntentCategory.AMBIGUOUS:
            warning = "Clarification required before LangChain Single Agent tool execution."
            run.status = AgentStatus.CLARIFICATION_REQUIRED
            warnings.append(warning)
            self._finalize_run(run=run, warnings=warnings)
            return self._runtime_result(run=run, route=route, warnings=warnings)

        if route.intent == IntentCategory.UNSUPPORTED:
            warning = "Unsupported or unsafe request stopped before LangChain Single Agent tool execution."
            run.status = AgentStatus.UNSUPPORTED
            warnings.append(warning)
            self._finalize_run(run=run, warnings=warnings)
            return self._runtime_result(run=run, route=route, warnings=warnings)

        tools = self._build_tools(request)
        context: dict[str, Any] = {
            "table_name": request.table_name or self._default_table_name(),
            "provider_requested": provider_metadata["provider_requested"],
            "sql": "",
            "rows": [],
            "evidence": [],
        }
        plan = self._plan_for_route(route.intent)
        run.trace["tool_plan"] = plan

        for tool_name in plan:
            input_json = self._input_for_tool(tool_name=tool_name, request=request, run=run, context=context)
            tool_result = self._invoke_tool(tool=tools[tool_name], input_json=input_json)
            self._append_tool_result(run=run, result=tool_result, input_json=input_json)
            self._merge_tool_context(context=context, result=tool_result)
            if tool_result.status != ToolResultStatus.COMPLETED:
                run.status = AgentStatus.PARTIAL
                warnings.append(tool_result.error or f"{tool_name} did not complete.")
                break

        if run.status == AgentStatus.RUNNING:
            run.status = AgentStatus.COMPLETED

        warnings.extend(self._warnings)
        self._populate_final_output(run=run, context=context, provider_metadata=provider_metadata)
        self._finalize_run(run=run, warnings=warnings)
        return self._runtime_result(run=run, route=route, warnings=warnings)

    def _build_tools(self, request: AgentRuntimeRequest) -> dict[str, Any]:
        if StructuredTool is None:
            raise RuntimeError("LangChain StructuredTool is unavailable.")

        return {
            "inspect_schema": StructuredTool.from_function(
                func=self._inspect_schema,
                name="inspect_schema",
                description="Inspect the current table schema.",
                args_schema=InspectSchemaInput,
            ),
            "profile_table": StructuredTool.from_function(
                func=self._profile_table,
                name="profile_table",
                description="Profile the current table.",
                args_schema=ProfileTableInput,
            ),
            "generate_sql": StructuredTool.from_function(
                func=lambda **kwargs: self._generate_sql(request=request, **kwargs),
                name="generate_sql",
                description="Generate read-only SQL for the user question.",
                args_schema=GenerateSqlInput,
            ),
            "execute_readonly_sql": StructuredTool.from_function(
                func=self._execute_readonly_sql,
                name="execute_readonly_sql",
                description="Execute a read-only SQL statement with a preview limit.",
                args_schema=ExecuteReadonlySqlInput,
            ),
            "summarize_findings": StructuredTool.from_function(
                func=lambda **kwargs: self._summarize_findings(request=request, **kwargs),
                name="summarize_findings",
                description="Summarize grounded SQL results.",
                args_schema=SummarizeFindingsInput,
            ),
            "memory_read": StructuredTool.from_function(
                func=self._memory_read,
                name="memory_read",
                description="Read prior in-memory AgentRun context when available.",
                args_schema=MemoryReadInput,
            ),
            "memory_write": StructuredTool.from_function(
                func=self._memory_write,
                name="memory_write",
                description="Stage current AgentRun memory metadata.",
                args_schema=MemoryWriteInput,
            ),
        }

    def _inspect_schema(self, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = InspectSchemaInput.model_validate(kwargs)
        try:
            columns = get_table_schema(payload.table_name)
            output = {
                "table_name": payload.table_name,
                "columns": columns,
                "column_count": len(columns),
                "summary": f"Table {payload.table_name} has {len(columns)} columns from the active database.",
                "source": "data_service.get_table_schema",
            }
            self._schema_cache[payload.table_name] = columns
            return self._tool_result("inspect_schema", output, started, table_name=payload.table_name).model_dump(mode="json")
        except Exception as exc:
            self._warnings.append(f"inspect_schema_fallback_mock: {exc}")
            registry = get_default_tool_registry()
            result = registry.call_tool("inspect_schema", payload.model_dump())
            if result.output.get("columns"):
                self._schema_cache[payload.table_name] = result.output.get("columns")
            return self._with_duration(result, started).model_dump(mode="json")

    def _profile_table(self, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = ProfileTableInput.model_validate(kwargs)
        try:
            quality = get_quality_report(payload.table_name)
            output = {
                "table_name": payload.table_name,
                "row_count": quality.get("totalRows", 0),
                "column_count": quality.get("totalColumns", 0),
                "missing_values_summary": {"null_cells": quality.get("nullCells", 0)},
                "numeric_columns": [
                    field.get("name")
                    for field in quality.get("fieldHealth", [])
                    if str(field.get("dtype", "")).lower() in {"int", "integer", "float", "double", "decimal", "numeric"}
                ],
                "warnings": quality.get("warnings", []),
                "summary": f"Table {payload.table_name} profile loaded from data quality service.",
                "source": "data_service.get_quality_report",
            }
            return self._tool_result("profile_table", output, started, table_name=payload.table_name).model_dump(mode="json")
        except Exception as exc:
            self._warnings.append(f"profile_table_fallback_mock: {exc}")
            columns = self._schema_cache.get(payload.table_name)
            registry = get_default_tool_registry()
            result = registry.call_tool("profile_table", {"table_name": payload.table_name, "columns": columns})
            return self._with_duration(result, started).model_dump(mode="json")

    def _generate_sql(self, *, request: AgentRuntimeRequest, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = GenerateSqlInput.model_validate(kwargs)
        schema_context = self._schema_context(payload.table_name)
        schema_columns = self._schema_cache.get(payload.table_name or "") or []
        missing_field = self._requested_unknown_field(payload.user_goal, self._column_names(schema_columns))
        metadata = self._resolve_provider(payload.provider_requested)
        sql = ""
        error: str | None = None
        if missing_field:
            available = ", ".join(self._column_names(schema_columns)[:8]) or "unknown"
            sql = (
                "SELECT "
                f"{self._sql_string_literal(f'Requested field {missing_field} was not found. Available fields include: {available}.')} "
                "AS message;"
            )
            self._warnings.append(f"requested_field_not_found: {missing_field}")
            llm_metadata = {
                "provider_requested": payload.provider_requested,
                "provider_used": "mock",
                "fallback_triggered": payload.provider_requested != "mock",
                "fallback_reason": "requested_field_not_found",
            }
            output = {
                "sql": sql,
                "table_name": payload.table_name,
                "user_goal": payload.user_goal,
                "summary": f"Requested field {missing_field} was not found in the current schema.",
                "llm": llm_metadata,
                **llm_metadata,
            }
            return self._tool_result("generate_sql", output, started, table_name=payload.table_name).model_dump(mode="json")
        try:
            if payload.provider_requested != "mock" and payload.provider_requested in SUPPORTED_LLM_PROVIDERS:
                with llm_context(payload.provider_requested):
                    generated = ai_analyst.generate_sql(
                        payload.user_goal,
                        schema_context,
                        language=str(request.metadata.get("language") or "zh"),
                    )
                    llm_metadata = summarize_llm_events()
                sql = str(generated.get("sql") or "").strip()
                if generated.get("status") == "error" or not sql:
                    error = str(generated.get("error") or "SQL generation returned no SQL.")
            else:
                error = "mock_provider" if payload.provider_requested == "mock" else "unsupported_provider"
        except (LLMProviderSelectionError, Exception) as exc:
            error = str(exc)

        if not sql:
            sql = self._deterministic_sql(
                payload.table_name,
                user_goal=payload.user_goal,
                schema_columns=schema_columns,
            )
            metadata = {
                "provider_requested": payload.provider_requested,
                "provider_used": "mock",
                "fallback_triggered": payload.provider_requested != "mock",
                "fallback_reason": error or "provider_unavailable",
            }
            llm_metadata = dict(metadata)
        else:
            llm_metadata = locals().get("llm_metadata", metadata)
            metadata = self._metadata_from_llm_events(payload.provider_requested, llm_metadata)

        output = {
            "sql": sql,
            "table_name": payload.table_name,
            "user_goal": payload.user_goal,
            "summary": "SQL generated for the LangChain Single Agent loop.",
            "llm": llm_metadata,
            **metadata,
        }
        return self._tool_result("generate_sql", output, started, table_name=payload.table_name).model_dump(mode="json")

    def _execute_readonly_sql(self, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = ExecuteReadonlySqlInput.model_validate(kwargs)
        row_limit = self._coerce_positive_int(payload.row_limit, default=50)
        try:
            from backend.agent.pipeline_adapter import execute_readonly_sql_with_existing_executor

            result = execute_readonly_sql_with_existing_executor(
                sql=payload.sql,
                row_limit=row_limit,
                executor=get_readonly_executor(),
            )
            if result.status == ToolResultStatus.COMPLETED:
                self._used_default_executor = True
                return self._with_duration(result, started).model_dump(mode="json")
            self._warnings.append(f"execute_readonly_sql_fallback_mock: {result.error}")
        except Exception as exc:
            self._warnings.append(f"execute_readonly_sql_fallback_mock: {exc}")

        registry = get_default_tool_registry()
        fallback_payload = payload.model_dump()
        fallback_payload["row_limit"] = row_limit
        fallback = registry.call_tool("execute_readonly_sql", fallback_payload)
        return self._with_duration(fallback, started).model_dump(mode="json")

    def _summarize_findings(self, *, request: AgentRuntimeRequest, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = SummarizeFindingsInput.model_validate(kwargs)
        rows = payload.rows or []
        metadata = self._resolve_provider(payload.provider_requested)
        try:
            if payload.provider_requested != "mock" and payload.provider_requested in SUPPORTED_LLM_PROVIDERS:
                with llm_context(payload.provider_requested):
                    explanation = ai_analyst.explain_results(
                        payload.user_goal,
                        payload.sql or "",
                        rows,
                        language=str(request.metadata.get("language") or "zh"),
                    )
                    llm_metadata = summarize_llm_events()
                summary = str(explanation.get("explanation") or "").strip()
                if explanation.get("status") == "error" or not summary:
                    raise RuntimeError(str(explanation.get("error") or "empty_summary"))
                metadata = self._metadata_from_llm_events(payload.provider_requested, llm_metadata)
            else:
                raise LLMProviderSelectionError("unsupported_provider")
        except Exception as exc:
            summary = self._deterministic_summary(payload.user_goal, payload.sql, rows)
            metadata = {
                "provider_requested": payload.provider_requested,
                "provider_used": "mock",
                "fallback_triggered": payload.provider_requested != "mock",
                "fallback_reason": str(exc) if payload.provider_requested != "mock" else None,
            }
            llm_metadata = dict(metadata)

        output = {
            "summary": summary,
            "findings": [{"title": "Agent answer", "evidence": summary}],
            "user_goal": payload.user_goal,
            "sql": payload.sql,
            "row_count": len(rows),
            "rows": rows[:5],
            "evidence": payload.evidence,
            "llm": llm_metadata,
            **metadata,
        }
        return self._tool_result("summarize_findings", output, started).model_dump(mode="json")

    def _memory_read(self, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = MemoryReadInput.model_validate(kwargs)
        record = None
        if self.memory_store is not None and payload.run_id:
            record = self.memory_store.get_run(payload.run_id)
        output = {
            "memory_used": record is not None,
            "record_found": record is not None,
            "table_name": payload.table_name,
            "summary": "No prior in-memory AgentRun record was provided." if record is None else "Prior AgentRun record loaded.",
        }
        if record is not None:
            output["prior_run_id"] = record.run.run_id
            output["prior_status"] = record.run.status.value
        self._memory_notes.append(output)
        return self._tool_result("memory_read", output, started, table_name=payload.table_name).model_dump(mode="json")

    def _memory_write(self, **kwargs: Any) -> dict[str, Any]:
        started = perf_counter()
        payload = MemoryWriteInput.model_validate(kwargs)
        output = {
            "memory_used": True,
            "run_id": payload.run_id,
            "table_name": payload.table_name,
            "summary": payload.summary or "AgentRun memory metadata staged for route-level in-memory persistence.",
        }
        self._memory_notes.append(output)
        return self._tool_result("memory_write", output, started, table_name=payload.table_name).model_dump(mode="json")

    def _invoke_tool(self, *, tool: Any, input_json: dict[str, Any]) -> ToolResult:
        payload = tool.invoke(input_json)
        return ToolResult.model_validate(payload)

    def _append_tool_result(self, *, run: AgentRun, result: ToolResult, input_json: dict[str, Any]) -> None:
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
            is_simulated=result.is_simulated,
            status=ToolCallStatus.COMPLETED if result.status == ToolResultStatus.COMPLETED else ToolCallStatus.FAILED,
            error=result.error,
        )
        run.steps.append(step)
        run.tool_calls.append(call)

    def _routing_step(
        self,
        *,
        run: AgentRun,
        request: AgentRuntimeRequest,
        route: Any,
        provider_metadata: dict[str, Any],
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
                "provider_requested": request.provider_requested,
            },
            output_json={
                "route": route.model_dump(mode="json"),
                "provider": provider_metadata,
                "agent": "langchain_single_agent",
                "registered_tools": self.tool_names,
            },
            ended_at=_utc_now(),
        )

    def _input_for_tool(
        self,
        *,
        tool_name: str,
        request: AgentRuntimeRequest,
        run: AgentRun,
        context: dict[str, Any],
    ) -> dict[str, Any]:
        table_name = str(context.get("table_name") or request.table_name or self._default_table_name())
        if tool_name == "inspect_schema":
            return {"table_name": table_name}
        if tool_name == "profile_table":
            return {"table_name": table_name, "columns": self._schema_cache.get(table_name)}
        if tool_name == "generate_sql":
            return {
                "user_goal": request.user_input,
                "table_name": table_name,
                "schema": {"columns": self._schema_cache.get(table_name, [])},
                "provider_requested": request.provider_requested,
            }
        if tool_name == "execute_readonly_sql":
            return {
                "sql": context.get("sql") or self._deterministic_sql(
                    table_name,
                    user_goal=request.user_input,
                    schema_columns=self._schema_cache.get(table_name, []),
                ),
                "row_limit": 50,
            }
        if tool_name == "summarize_findings":
            return {
                "user_goal": request.user_input,
                "sql": context.get("sql"),
                "rows": context.get("rows") or [],
                "evidence": context.get("evidence") or [],
                "provider_requested": request.provider_requested,
            }
        if tool_name == "memory_read":
            previous_run_id = request.metadata.get("previous_run_id") if isinstance(request.metadata, dict) else None
            return {"run_id": previous_run_id, "table_name": table_name}
        if tool_name == "memory_write":
            return {"run_id": run.run_id, "table_name": table_name, "summary": context.get("answer")}
        raise ValueError(f"Unknown tool: {tool_name}")

    def _merge_tool_context(self, *, context: dict[str, Any], result: ToolResult) -> None:
        output = result.output
        if result.tool_name == "inspect_schema":
            context["schema"] = output.get("columns", [])
            context["evidence"].extend([{"type": "schema", "summary": output.get("summary"), "columns": output.get("columns", [])}])
        elif result.tool_name == "profile_table":
            context["profile"] = output
            context["evidence"].append({"type": "profile", "summary": output.get("summary"), "row_count": output.get("row_count")})
        elif result.tool_name == "generate_sql":
            context["sql"] = output.get("sql")
            self._merge_provider_context(context=context, output=output)
        elif result.tool_name == "execute_readonly_sql":
            context["rows"] = output.get("rows", [])
            context["result_preview"] = {
                "columns": output.get("columns", []),
                "rows": output.get("rows", []),
                "row_count": output.get("row_count", 0),
            }
            context["evidence"].append({"type": "result_preview", "summary": output.get("summary"), "rows": output.get("rows", [])})
        elif result.tool_name == "summarize_findings":
            context["answer"] = output.get("summary")
            self._merge_provider_context(context=context, output=output)
        elif result.tool_name in {"memory_read", "memory_write"}:
            context["memory_used"] = bool(output.get("memory_used") or context.get("memory_used"))

    def _populate_final_output(
        self,
        *,
        run: AgentRun,
        context: dict[str, Any],
        provider_metadata: dict[str, Any],
    ) -> None:
        run.answer = str(context.get("answer") or self._deterministic_summary(run.user_goal, context.get("sql"), context.get("rows") or []))
        run.sql = str(context.get("sql") or "")
        run.evidence = list(context.get("evidence") or [])
        run.result_preview = context.get("result_preview") or {"columns": [], "rows": [], "row_count": 0}
        run.memory_used = bool(context.get("memory_used") or self._memory_notes)
        run.provider_used = str(context.get("provider_used") or provider_metadata["provider_used"])
        run.is_simulated = run.provider_used == "mock"
        run.fallback_triggered = bool(
            context.get("fallback_triggered")
            if "fallback_triggered" in context
            else run.provider_used == "mock" and run.provider_requested != "mock"
        )
        run.fallback_type = FallbackType.PROVIDER if run.fallback_triggered else FallbackType.NONE
        run.fallback_reason = (
            str(context.get("fallback_reason") or provider_metadata.get("fallback_reason") or "provider_fallback_to_mock")
            if run.fallback_triggered
            else None
        )
        run.trace.update(
            {
                "tool_calls": [
                    {
                        "tool_name": call.tool_name,
                        "status": call.status.value,
                        "duration_ms": call.duration_ms,
                    }
                    for call in run.tool_calls
                ],
                "memory": self._memory_notes,
                "provider": {
                    "provider_requested": run.provider_requested,
                    "provider_used": run.provider_used,
                    "fallback_triggered": run.fallback_triggered,
                    "fallback_reason": run.fallback_reason,
                },
                "used_default_readonly_executor": self._used_default_executor,
            }
        )

    def _merge_provider_context(self, *, context: dict[str, Any], output: dict[str, Any]) -> None:
        if output.get("provider_used"):
            context["provider_used"] = output.get("provider_used")
        if "fallback_triggered" in output:
            context["fallback_triggered"] = bool(output.get("fallback_triggered"))
        if "fallback_reason" in output:
            context["fallback_reason"] = output.get("fallback_reason")

    def _finalize_run(self, *, run: AgentRun, warnings: list[str]) -> None:
        run.warnings = list(dict.fromkeys(warnings))
        run.updated_at = _utc_now()

    def _runtime_result(self, *, run: AgentRun, route: Any, warnings: list[str]) -> AgentRuntimeResult:
        return AgentRuntimeResult(
            run=run,
            summary=run.to_summary(findings_count=len(run.evidence)),
            routed_intent=route,
            runtime_mode=AgentRuntimeMode.SKELETON,
            warnings=list(dict.fromkeys(warnings)),
        )

    def _resolve_provider(self, provider_requested: str | None) -> dict[str, Any]:
        requested = (provider_requested or "mock").strip().lower() or "mock"
        if requested == "mock":
            return {
                "provider_requested": "mock",
                "provider_used": "mock",
                "fallback_triggered": False,
                "fallback_reason": None,
            }
        if requested not in SUPPORTED_LLM_PROVIDERS:
            return {
                "provider_requested": requested,
                "provider_used": "mock",
                "fallback_triggered": True,
                "fallback_reason": "unsupported_provider",
            }
        return {
            "provider_requested": requested,
            "provider_used": "mock",
            "fallback_triggered": True,
            "fallback_reason": "provider_unavailable_or_mock_fallback",
        }

    def _metadata_from_llm_events(self, provider_requested: str, llm_metadata: dict[str, Any]) -> dict[str, Any]:
        requested = str(llm_metadata.get("provider_requested") or provider_requested or "mock")
        used = str(llm_metadata.get("provider_used") or "mock")
        return {
            "provider_requested": requested,
            "provider_used": used,
            "fallback_triggered": bool(llm_metadata.get("fallback_triggered") or (requested != used)),
            "fallback_reason": llm_metadata.get("fallback_reason"),
        }

    def _plan_for_route(self, intent: IntentCategory | None) -> list[str]:
        if intent == IntentCategory.DATA_PREVIEW:
            return ["memory_read", "inspect_schema", "profile_table", "generate_sql", "execute_readonly_sql", "summarize_findings", "memory_write"]
        if intent == IntentCategory.SIMPLE_SUMMARY:
            return ["memory_read", "inspect_schema", "profile_table", "generate_sql", "execute_readonly_sql", "summarize_findings", "memory_write"]
        if intent in {IntentCategory.SQL_QUESTION, IntentCategory.AGENT_ANALYSIS}:
            return ["memory_read", "inspect_schema", "profile_table", "generate_sql", "execute_readonly_sql", "summarize_findings", "memory_write"]
        return ["memory_read", "inspect_schema", "profile_table", "generate_sql", "execute_readonly_sql", "summarize_findings", "memory_write"]

    def _schema_context(self, table_name: str | None) -> str:
        table = table_name or self._default_table_name()
        columns = self._schema_cache.get(table) or []
        if not columns:
            return f"Table: {table}\nColumns: unknown"
        lines = [f"Table: {table}", "Columns:"]
        for column in columns:
            name = column.get("name") or column.get("column_name") or "unknown"
            dtype = column.get("dtype") or column.get("type") or "unknown"
            lines.append(f"- {name}: {dtype}")
        return "\n".join(lines)

    def _deterministic_sql(
        self,
        table_name: str | None,
        *,
        user_goal: str | None = None,
        schema_columns: list[dict[str, Any]] | None = None,
    ) -> str:
        table = self._quote_identifier(table_name or self._default_table_name())
        goal = (user_goal or "").strip().lower()
        columns = self._column_names(schema_columns or [])
        region_column = self._find_column(columns, ["region", "area", "province", "city", "channel", "地区", "区域", "城市", "渠道"])
        if region_column is None and table_name == "demo_sales":
            region_column = self._quote_identifier("channel")
        sales_column = self._find_column(
            columns,
            ["sales_amount", "sales", "revenue", "amount", "total_amount", "gmv", "销售额", "收入", "金额"],
        )
        refund_rate_column = self._find_column(columns, ["refund_rate", "refundrate", "退款率", "退货率"])
        refund_amount_column = self._find_column(columns, ["refund_amount", "refund amount", "refund_amt", "refund_value", "退款金额", "退款额"])
        refund_count_column = self._find_column(columns, ["refund_count", "refunds", "refund", "退款数", "退款"])
        order_count_column = self._find_column(columns, ["order_count", "orders", "order_num", "订单数", "订单"])

        if "偶数" in goal or "even row" in goal or "even rows" in goal:
            return (
                "SELECT *\n"
                "FROM (\n"
                "  SELECT *, ROW_NUMBER() OVER () AS row_num\n"
                f"  FROM {table}\n"
                ") t\n"
                "WHERE row_num % 2 = 0\n"
                "LIMIT 100;"
            )
        if "奇数" in goal or "odd row" in goal or "odd rows" in goal:
            return (
                "SELECT *\n"
                "FROM (\n"
                "  SELECT *, ROW_NUMBER() OVER () AS row_num\n"
                f"  FROM {table}\n"
                ") t\n"
                "WHERE row_num % 2 = 1\n"
                "LIMIT 100;"
            )
        if "前 10" in goal or "前十" in goal or "top 10" in goal or "first 10" in goal:
            return f"SELECT *\nFROM {table}\nLIMIT 10;"
        if ("按地区" in goal or "不同地区" in goal or "by region" in goal or "regional" in goal) and sales_column:
            if region_column:
                return (
                    f"SELECT {region_column} AS region, SUM({sales_column}) AS total_sales\n"
                    f"FROM {table}\n"
                    f"GROUP BY {region_column}\n"
                    "ORDER BY total_sales DESC\n"
                    "LIMIT 100;"
                )
            return f"SELECT SUM({sales_column}) AS total_sales\nFROM {table};"
        if "销售额最高" in goal or "highest sales" in goal or "highest revenue" in goal or "top sales" in goal:
            if sales_column:
                return f"SELECT *\nFROM {table}\nORDER BY {sales_column} DESC\nLIMIT 100;"
            return f"SELECT *\nFROM {table}\nLIMIT 100;"
        if (
            "退款金额" in goal
            or "退款额" in goal
            or "refund amount" in goal
            or "refund_amount" in goal
            or ("refund" in goal and "amount" in goal)
        ):
            if refund_amount_column and region_column:
                return (
                    f"SELECT {region_column} AS region, SUM({refund_amount_column}) AS total_refund_amount\n"
                    f"FROM {table}\n"
                    f"GROUP BY {region_column}\n"
                    "ORDER BY total_refund_amount DESC\n"
                    "LIMIT 100;"
                )
            if refund_amount_column:
                return f"SELECT *\nFROM {table}\nORDER BY {refund_amount_column} DESC\nLIMIT 100;"
            return (
                "SELECT "
                f"{self._sql_string_literal('Refund amount field was not found in the current table schema.')} "
                "AS message;"
            )
        if "退款率最高" in goal or "highest refund" in goal or "refund rate" in goal:
            if refund_rate_column:
                return f"SELECT *\nFROM {table}\nORDER BY {refund_rate_column} DESC\nLIMIT 100;"
            if refund_count_column and order_count_column:
                return (
                    f"SELECT *, {refund_count_column} * 1.0 / NULLIF({order_count_column}, 0) AS refund_rate\n"
                    f"FROM {table}\n"
                    "ORDER BY refund_rate DESC\n"
                    "LIMIT 100;"
                )
            return f"SELECT *\nFROM {table}\nLIMIT 100;"
        return f"SELECT *\nFROM {table}\nLIMIT 100;"

    def _deterministic_summary(self, user_goal: str, sql: str | None, rows: list[dict[str, Any]]) -> str:
        row_count = len(rows or [])
        goal = (user_goal or "the question").strip()
        if self._looks_chinese(goal):
            if "偶数" in goal:
                lead = f"已按你的要求筛选偶数行，本次预览返回 {row_count} 行相关数据。"
            elif "奇数" in goal:
                lead = f"已按你的要求筛选奇数行，本次预览返回 {row_count} 行相关数据。"
            elif "销售" in goal or "收入" in goal:
                lead = f"已围绕销售问题生成演示分析，本次预览返回 {row_count} 行相关数据。"
            else:
                lead = f"已根据问题“{goal}”生成演示分析，本次预览返回 {row_count} 行相关数据。"
            return (
                f"{lead} 你可以先查看下方 SQL、相关数据和风险提示来判断结果是否符合预期。"
                "当前使用演示模型生成结果；配置真实模型后，可获得更准确的业务解读。"
            )
        if "even" in goal.lower():
            lead = f"Even rows were selected, and the preview returned {row_count} related rows."
        elif "odd" in goal.lower():
            lead = f"Odd rows were selected, and the preview returned {row_count} related rows."
        elif "sales" in goal.lower() or "revenue" in goal.lower():
            lead = f"A demo sales analysis was prepared, and the preview returned {row_count} related rows."
        else:
            lead = f"A demo analysis was prepared for '{goal}', with {row_count} preview rows."
        return (
            f"{lead} Review the SQL, related data, and warnings below before making decisions. "
            "This result uses the demo model; configuring a real provider can produce a more precise business answer."
        )

    def _column_names(self, columns: list[dict[str, Any]]) -> list[str]:
        names: list[str] = []
        for column in columns:
            if isinstance(column, dict):
                raw_name = column.get("name") or column.get("column_name") or column.get("field")
                if raw_name:
                    names.append(str(raw_name))
        return names

    def _find_column(self, columns: list[str], candidates: list[str]) -> str | None:
        normalized = {column.lower(): column for column in columns}
        for candidate in candidates:
            lowered = candidate.lower()
            if lowered in normalized:
                return self._quote_identifier(normalized[lowered])
        for column in columns:
            lowered = column.lower()
            if any(candidate.lower() in lowered for candidate in candidates):
                return self._quote_identifier(column)
        return None

    def _requested_unknown_field(self, user_goal: str | None, columns: list[str]) -> str | None:
        column_names = {column.lower() for column in columns}
        for token in re.findall(r"\b[A-Za-z][A-Za-z0-9_]{2,}\b", user_goal or ""):
            lowered = token.lower()
            if "_" in lowered and lowered not in column_names:
                return token
        return None

    def _quote_identifier(self, identifier: str) -> str:
        return f'"{identifier.replace(chr(34), chr(34) + chr(34))}"'

    def _sql_string_literal(self, value: str) -> str:
        return f"'{value.replace(chr(39), chr(39) + chr(39))}'"

    def _looks_chinese(self, value: str) -> bool:
        return any("\u4e00" <= char <= "\u9fff" for char in value)

    def _coerce_positive_int(self, value: Any, *, default: int) -> int:
        try:
            coerced = int(value)
        except (TypeError, ValueError):
            coerced = default
        return max(1, coerced)

    def _default_table_name(self) -> str:
        try:
            from backend.services.data_service import list_tables

            tables = list_tables()
            if tables:
                return str(tables[0].get("name") or "mock_sales")
        except Exception:
            pass
        return "mock_sales"

    def _tool_result(
        self,
        tool_name: str,
        output: dict[str, Any],
        started: float,
        *,
        table_name: str | None = None,
        status: ToolResultStatus = ToolResultStatus.COMPLETED,
        error: str | None = None,
    ) -> ToolResult:
        return ToolResult(
            tool_name=tool_name,
            status=status,
            output=output,
            evidence_refs=[
                EvidenceRef(
                    source_type="langchain_single_agent",
                    source_name=tool_name,
                    summary=str(output.get("summary") or f"{tool_name} completed."),
                    data_ref={"table_name": table_name, "status": status.value},
                )
            ],
            duration_ms=int((perf_counter() - started) * 1000),
            error=error,
            is_simulated=output.get("provider_used") == "mock" if "provider_used" in output else False,
        )

    def _with_duration(self, result: ToolResult, started: float) -> ToolResult:
        return result.model_copy(update={"duration_ms": int((perf_counter() - started) * 1000)})


def run_langchain_single_agent(
    request: AgentRuntimeRequest,
    *,
    memory_store: AgentRunMemoryStore | None = None,
) -> AgentRuntimeResult:
    service = LangChainSingleAgentService(memory_store=memory_store)
    return service.run(request)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)
