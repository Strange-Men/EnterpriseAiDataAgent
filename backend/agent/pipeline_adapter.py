"""Pipeline adapter boundary for future Agent tool wrapping.

M5.3.1 only defines adapter boundary and capability resolution.
It does not call existing AI pipeline functions. Real pipeline execution starts
in later M5.3 steps.
"""

from __future__ import annotations

import importlib
import importlib.util
from enum import Enum

from pydantic import BaseModel, Field


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
        "module_path": "backend.services.ai_analyst",
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
        "module_path": "backend.services.ai_analyst",
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


def _append_note(existing: str, note: str) -> str:
    if not existing:
        return note
    return f"{existing} {note}"
