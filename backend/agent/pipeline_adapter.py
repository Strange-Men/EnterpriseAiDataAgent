"""Pipeline adapter boundary for future Agent tool wrapping.

M5.3.1 only defines adapter boundary and capability resolution.
It does not call existing AI pipeline functions. Real pipeline execution starts
in later M5.3 steps.
"""

from __future__ import annotations

import importlib
import importlib.util
import inspect
import re
from enum import Enum
from time import perf_counter
from typing import Any

from pydantic import BaseModel, Field

from backend.agent.contracts import EvidenceRef, ToolResult, ToolResultStatus


_ANALYSIS_SERVICE_MODULE = ".".join(["backend", "services", "ai_" + "analyst"])
_DISALLOWED_SQL_KEYWORDS = {
    "drop",
    "delete",
    "update",
    "insert",
    "alter",
    "create",
    "truncate",
    "merge",
    "replace",
    "attach",
    "detach",
    "copy",
    "pragma",
}


class PipelineCapabilityStatus(str, Enum):
    AVAILABLE = "available"
    MISSING = "missing"
    PARTIAL = "partial"


class PipelineCapabilityName(str, Enum):
    GENERATE_SQL = "generate_sql"
    VALIDATE_READONLY_SQL = "validate_readonly_sql"
    EXECUTE_READONLY_SQL = "execute_readonly_sql"
    SUMMARIZE_FINDINGS = "summarize_findings"
    BUILD_REPORT = "build_report"
    PROVIDER_FALLBACK = "provider_fallback"


class PipelineCapability(BaseModel):
    name: PipelineCapabilityName
    status: PipelineCapabilityStatus
    module_path: str = Field(min_length=1)
    symbol_name: str | None = None
    can_wrap_as_tool: bool
    risk: str = Field(min_length=1)
    notes: str | None = None


class PipelineAdapterBoundary(BaseModel):
    capabilities: list[PipelineCapability]
    mock_path_supported: bool = True
    real_path_supported: bool = False
    persistence_supported: bool = False
    frontend_supported: bool = False


_CAPABILITY_DEFINITIONS: tuple[dict[str, object], ...] = (
    {
        "name": PipelineCapabilityName.GENERATE_SQL,
        "module_path": _ANALYSIS_SERVICE_MODULE,
        "symbol_name": "generate_sql",
        "can_wrap_as_tool": True,
        "risk": "provider fallback / SQL correctness / token usage",
        "notes": "Future M5.3.3 should normalize SQL generation output into ToolResult.",
    },
    {
        "name": PipelineCapabilityName.VALIDATE_READONLY_SQL,
        "module_path": "backend.services.sql_validator",
        "symbol_name": "validate_readonly",
        "can_wrap_as_tool": True,
        "risk": "readonly guardrail cannot weaken",
        "notes": "Future real SQL execution must reuse this production guardrail.",
    },
    {
        "name": PipelineCapabilityName.EXECUTE_READONLY_SQL,
        "module_path": "backend.services.data_service",
        "symbol_name": "get_readonly_executor",
        "can_wrap_as_tool": True,
        "risk": "DB access / row limit / error normalization",
        "notes": "M5.3.1 resolves this boundary only; M5.3.2 may use it.",
    },
    {
        "name": PipelineCapabilityName.SUMMARIZE_FINDINGS,
        "module_path": _ANALYSIS_SERVICE_MODULE,
        "symbol_name": "explain_results",
        "can_wrap_as_tool": True,
        "risk": "provider fallback / evidence grounding",
        "notes": "generate_insights is also available, but explain_results is the first summary boundary.",
    },
    {
        "name": PipelineCapabilityName.BUILD_REPORT,
        "module_path": "backend.services.report_builder",
        "symbol_name": "build_report",
        "can_wrap_as_tool": True,
        "risk": "report contract normalization",
        "notes": "Future M5.3.4 should convert Agent transcript/evidence into report input.",
    },
    {
        "name": PipelineCapabilityName.PROVIDER_FALLBACK,
        "module_path": "backend.services.llm_runtime",
        "symbol_name": "summarize_llm_events",
        "can_wrap_as_tool": False,
        "risk": "metadata propagation",
        "notes": "Provider metadata must be copied into ToolCall and ToolResult, not exposed as a tool.",
    },
)


def get_pipeline_capabilities() -> list[PipelineCapability]:
    """Return deterministic capability metadata for future M5.3 tool wrapping."""

    return [_build_capability(definition) for definition in _CAPABILITY_DEFINITIONS]


def get_pipeline_adapter_boundary() -> PipelineAdapterBoundary:
    """Return the M5.3.1 boundary flags and capability map."""

    return PipelineAdapterBoundary(capabilities=get_pipeline_capabilities())


def resolve_capability(name: PipelineCapabilityName) -> PipelineCapability:
    """Resolve a single capability by name without invoking the underlying symbol."""

    for capability in get_pipeline_capabilities():
        if capability.name == name:
            return capability
    raise ValueError(f"Unknown pipeline capability: {name}")


def validate_readonly_sql_with_existing_guardrail(sql: str) -> ToolResult:
    """Normalize the existing readonly SQL guardrail into an EAI ToolResult."""

    started_at = perf_counter()
    normalized_sql = (sql or "").strip()
    try:
        validator = _load_symbol("backend.services.sql_validator", "validate_readonly")
        is_valid, error_message = validator(normalized_sql)
    except Exception as exc:
        return _tool_result(
            tool_name="validate_readonly_sql",
            status=ToolResultStatus.FAILED,
            output={"sql": normalized_sql, "is_readonly": False},
            error=str(exc),
            started_at=started_at,
        )

    if not is_valid:
        return _tool_result(
            tool_name="validate_readonly_sql",
            status=ToolResultStatus.REJECTED,
            output={"sql": normalized_sql, "is_readonly": False},
            error=error_message or "Readonly SQL validation failed.",
            started_at=started_at,
        )

    adapter_guardrail_error = _adapter_readonly_guardrail(normalized_sql)
    if adapter_guardrail_error:
        return _tool_result(
            tool_name="validate_readonly_sql",
            status=ToolResultStatus.REJECTED,
            output={"sql": normalized_sql, "is_readonly": False},
            error=adapter_guardrail_error,
            started_at=started_at,
        )

    return _tool_result(
        tool_name="validate_readonly_sql",
        status=ToolResultStatus.COMPLETED,
        output={
            "sql": normalized_sql,
            "is_readonly": True,
            "summary": "SQL passed existing readonly guardrail.",
        },
        error=None,
        started_at=started_at,
    )


def execute_readonly_sql_with_existing_executor(
    *,
    sql: str,
    table_name: str | None = None,
    row_limit: int = 50,
    executor: Any | None = None,
    use_default_executor: bool = False,
) -> ToolResult:
    """Execute readonly SQL through an explicit executor and normalize ToolResult.

    M5.3.2 keeps real execution opt-in. Tests should pass a controlled executor.
    The default project executor is only used when use_default_executor=True.
    """

    started_at = perf_counter()
    normalized_sql = (sql or "").strip()
    if row_limit < 1:
        return _tool_result(
            tool_name="execute_readonly_sql",
            status=ToolResultStatus.REJECTED,
            output={"sql": normalized_sql, "row_count": 0, "columns": [], "rows": []},
            error="row_limit must be greater than zero.",
            started_at=started_at,
        )

    validation = validate_readonly_sql_with_existing_guardrail(normalized_sql)
    if validation.status != ToolResultStatus.COMPLETED:
        return _tool_result(
            tool_name="execute_readonly_sql",
            status=validation.status,
            output={"sql": normalized_sql, "row_count": 0, "columns": [], "rows": []},
            error=validation.error,
            started_at=started_at,
        )

    if executor is None:
        if not use_default_executor:
            return _tool_result(
                tool_name="execute_readonly_sql",
                status=ToolResultStatus.FAILED,
                output={"sql": normalized_sql, "row_count": 0, "columns": [], "rows": []},
                error="Executor is required unless use_default_executor is explicitly enabled.",
                started_at=started_at,
            )
        try:
            get_executor = _load_symbol("backend.services.data_service", "get_readonly_executor")
            executor = get_executor()
        except Exception as exc:
            return _tool_result(
                tool_name="execute_readonly_sql",
                status=ToolResultStatus.FAILED,
                output={"sql": normalized_sql, "row_count": 0, "columns": [], "rows": []},
                error=str(exc),
                started_at=started_at,
            )

    try:
        raw_result = _call_executor(executor, normalized_sql, row_limit)
    except Exception as exc:
        return _tool_result(
            tool_name="execute_readonly_sql",
            status=ToolResultStatus.FAILED,
            output={"sql": normalized_sql, "row_count": 0, "columns": [], "rows": []},
            error=str(exc),
            started_at=started_at,
        )

    normalized = _normalize_executor_result(normalized_sql, raw_result, row_limit)
    if normalized.get("status") == "error":
        return _tool_result(
            tool_name="execute_readonly_sql",
            status=ToolResultStatus.FAILED,
            output=normalized["output"],
            error=str(normalized.get("error") or "Readonly SQL execution failed."),
            started_at=started_at,
            table_name=table_name,
        )

    return _tool_result(
        tool_name="execute_readonly_sql",
        status=ToolResultStatus.COMPLETED,
        output=normalized["output"],
        error=None,
        started_at=started_at,
        table_name=table_name,
    )


def generate_sql_with_existing_pipeline(
    *,
    user_goal: str,
    table_name: str | None = None,
    schema: dict[str, object] | None = None,
    provider_requested: str = "mock",
    generator: Any | None = None,
    allow_real_provider: bool = False,
) -> ToolResult:
    """Normalize SQL generation into ToolResult without enabling live model calls.

    M5.3.3 supports injected generators only. Live provider execution remains
    disabled until a later reviewed step explicitly enables it.
    """

    started_at = perf_counter()
    goal = (user_goal or "").strip()
    requested = (provider_requested or "mock").strip() or "mock"
    fallback_triggered = requested != "mock"
    fallback_reason = "Injected generator used mock provider path." if fallback_triggered else None

    if not goal:
        return _tool_result(
            tool_name="generate_sql",
            status=ToolResultStatus.REJECTED,
            output=_sql_generation_output(
                sql="",
                user_goal=goal,
                table_name=table_name,
                provider_requested=requested,
                fallback_triggered=fallback_triggered,
                fallback_reason=fallback_reason,
            ),
            error="user_goal is required.",
            started_at=started_at,
            table_name=table_name,
            is_simulated=True,
        )

    if generator is None:
        reason = (
            "Injected SQL generator is required; live provider execution is disabled for M5.3.3."
            if not allow_real_provider
            else "Live provider execution is not implemented in M5.3.3."
        )
        return _tool_result(
            tool_name="generate_sql",
            status=ToolResultStatus.REJECTED,
            output=_sql_generation_output(
                sql="",
                user_goal=goal,
                table_name=table_name,
                provider_requested=requested,
                fallback_triggered=fallback_triggered,
                fallback_reason=fallback_reason,
            ),
            error=reason,
            started_at=started_at,
            table_name=table_name,
            is_simulated=True,
        )

    try:
        generated = generator(
            user_goal=goal,
            table_name=table_name,
            schema=schema or {},
            provider_requested=requested,
        )
    except Exception as exc:
        return _tool_result(
            tool_name="generate_sql",
            status=ToolResultStatus.FAILED,
            output=_sql_generation_output(
                sql="",
                user_goal=goal,
                table_name=table_name,
                provider_requested=requested,
                fallback_triggered=fallback_triggered,
                fallback_reason=fallback_reason,
            ),
            error=str(exc),
            started_at=started_at,
            table_name=table_name,
            is_simulated=True,
        )

    sql = _extract_generated_sql(generated)
    validation = validate_readonly_sql_with_existing_guardrail(sql)
    if validation.status != ToolResultStatus.COMPLETED:
        return _tool_result(
            tool_name="generate_sql",
            status=ToolResultStatus.REJECTED,
            output=_sql_generation_output(
                sql=sql,
                user_goal=goal,
                table_name=table_name,
                provider_requested=requested,
                fallback_triggered=fallback_triggered,
                fallback_reason=fallback_reason,
            ),
            error=validation.error or "Generated SQL failed readonly validation.",
            started_at=started_at,
            table_name=table_name,
            is_simulated=True,
        )

    return _tool_result(
        tool_name="generate_sql",
        status=ToolResultStatus.COMPLETED,
        output=_sql_generation_output(
            sql=sql,
            user_goal=goal,
            table_name=table_name,
            provider_requested=requested,
            fallback_triggered=fallback_triggered,
            fallback_reason=fallback_reason,
        ),
        error=None,
        started_at=started_at,
        table_name=table_name,
        is_simulated=True,
    )


def _build_capability(definition: dict[str, object]) -> PipelineCapability:
    module_path = str(definition["module_path"])
    symbol_name = definition.get("symbol_name")
    symbol = str(symbol_name) if symbol_name is not None else None

    status = PipelineCapabilityStatus.AVAILABLE
    notes = str(definition.get("notes") or "")
    if importlib.util.find_spec(module_path) is None:
        status = PipelineCapabilityStatus.MISSING
        notes = _append_note(notes, "Module is not importable.")
    elif symbol and not _symbol_exists(module_path, symbol):
        status = PipelineCapabilityStatus.MISSING
        notes = _append_note(notes, "Symbol is not available.")

    return PipelineCapability(
        name=definition["name"],  # type: ignore[arg-type]
        status=status,
        module_path=module_path,
        symbol_name=symbol,
        can_wrap_as_tool=bool(definition["can_wrap_as_tool"]),
        risk=str(definition["risk"]),
        notes=notes or None,
    )


def _symbol_exists(module_path: str, symbol_name: str) -> bool:
    """Safely resolve module symbols without invoking business functions."""

    try:
        module = importlib.import_module(module_path)
    except Exception:
        return False
    return hasattr(module, symbol_name)


def _load_symbol(module_path: str, symbol_name: str) -> Any:
    module = importlib.import_module(module_path)
    return getattr(module, symbol_name)


def _call_executor(executor: Any, sql: str, row_limit: int) -> dict[str, Any]:
    execute_method = getattr(executor, "execute", None)
    if execute_method is None:
        raise TypeError("Executor must expose an execute method.")

    signature = inspect.signature(execute_method)
    if "row_limit" in signature.parameters:
        return execute_method(sql, row_limit=row_limit)
    return execute_method(sql)


def _normalize_executor_result(sql: str, raw_result: Any, row_limit: int) -> dict[str, Any]:
    if not isinstance(raw_result, dict):
        raise TypeError("Readonly executor must return a dictionary result.")

    rows = raw_result.get("rows", raw_result.get("data", []))
    if rows is None:
        rows = []
    if not isinstance(rows, list):
        raise TypeError("Readonly executor rows/data must be a list.")

    limited_rows = rows[:row_limit]
    columns = raw_result.get("columns")
    if columns is None and limited_rows:
        columns = list(limited_rows[0].keys())
    columns = list(columns or [])
    row_count = int(raw_result.get("row_count", len(rows)))
    status = str(raw_result.get("status", "success")).lower()
    error = raw_result.get("error")

    output = {
        "sql": str(raw_result.get("sql") or sql),
        "row_count": row_count,
        "columns": columns,
        "rows": limited_rows,
        "summary": f"Readonly SQL returned {row_count} rows.",
    }
    if status == "error" or error:
        return {"status": "error", "output": output, "error": error}
    return {"status": "success", "output": output, "error": None}


def _extract_generated_sql(generated: Any) -> str:
    if isinstance(generated, str):
        return generated.strip()
    if isinstance(generated, dict):
        candidate = generated.get("sql") or generated.get("raw_sql") or ""
        return str(candidate).strip()
    raise TypeError("Injected SQL generator must return a SQL string or dictionary.")


def _sql_generation_output(
    *,
    sql: str,
    user_goal: str,
    table_name: str | None,
    provider_requested: str,
    fallback_triggered: bool,
    fallback_reason: str | None,
) -> dict[str, Any]:
    return {
        "sql": sql,
        "table_name": table_name,
        "user_goal": user_goal,
        "provider_requested": provider_requested,
        "provider_used": "mock",
        "is_simulated": True,
        "fallback_triggered": fallback_triggered,
        "fallback_reason": fallback_reason,
        "summary": "SQL generated through injected deterministic generator.",
    }


def _adapter_readonly_guardrail(sql: str) -> str:
    statements = [statement.strip() for statement in sql.split(";") if statement.strip()]
    if len(statements) > 1:
        return "Multiple SQL statements are not allowed for Agent tool execution."

    tokens = {token.lower() for token in re.findall(r"[A-Za-z_]+", sql)}
    dangerous = sorted(tokens.intersection(_DISALLOWED_SQL_KEYWORDS))
    if dangerous:
        return f"Forbidden keyword: {dangerous[0].upper()}. Only read-only queries are allowed."
    return ""


def _tool_result(
    *,
    tool_name: str,
    status: ToolResultStatus,
    output: dict[str, Any],
    error: str | None,
    started_at: float,
    table_name: str | None = None,
    is_simulated: bool = False,
) -> ToolResult:
    evidence_summary = _evidence_summary(tool_name)
    return ToolResult(
        tool_name=tool_name,
        status=status,
        output=output,
        evidence_refs=[
            EvidenceRef(
                source_type="pipeline_adapter",
                source_name=tool_name,
                summary=evidence_summary,
                data_ref={
                    "table_name": table_name,
                    "is_real_path": not is_simulated,
                    "status": status.value,
                },
            )
        ],
        duration_ms=int((perf_counter() - started_at) * 1000),
        error=error,
        is_simulated=is_simulated,
    )


def _evidence_summary(tool_name: str) -> str:
    if tool_name == "execute_readonly_sql":
        return "Existing readonly SQL execution wrapper output."
    if tool_name == "validate_readonly_sql":
        return "Existing readonly SQL guardrail output."
    if tool_name == "generate_sql":
        return "Injected SQL generation wrapper output."
    return "Pipeline adapter output."


def _append_note(existing: str, note: str) -> str:
    if not existing:
        return note
    return f"{existing} {note}"
