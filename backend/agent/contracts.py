"""Pydantic contracts for the native EAI Agent runtime.

This module defines data contracts only. It must not execute routing, tools,
persistence, or existing AI pipeline behavior.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator, model_validator


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"


class AgentRole(str, Enum):
    DATA_ANALYST = "data_analyst"
    SUPERVISOR = "supervisor"
    PLANNER = "planner"
    SCHEMA = "schema"
    SQL = "sql"
    VALIDATION = "validation"
    REPORT = "report"
    BUSINESS_METRIC = "business_metric"


class AgentStatus(str, Enum):
    CREATED = "created"
    PLANNING = "planning"
    RUNNING = "running"
    SUMMARIZING = "summarizing"
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"
    CANCELLED = "cancelled"
    CLARIFICATION_REQUIRED = "clarification_required"
    UNSUPPORTED = "unsupported"


class AgentStepState(str, Enum):
    INTENT_CLASSIFICATION = "intent_classification"
    MODE_ROUTING = "mode_routing"
    PREFLIGHT_GUARDRAILS = "preflight_guardrails"
    PLANNING = "planning"
    PLAN_VALIDATION = "plan_validation"
    RUNNING_STEP = "running_step"
    TOOL_INPUT_VALIDATION = "tool_input_validation"
    TOOL_EXECUTION = "tool_execution"
    TOOL_OUTPUT_VALIDATION = "tool_output_validation"
    EVIDENCE_COLLECTION = "evidence_collection"
    STEP_EVALUATION = "step_evaluation"
    SUMMARIZING = "summarizing"
    REPORT_BUILDING = "report_building"
    PERSISTENCE = "persistence"
    COMPLETED = "completed"


class ToolCallStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    REJECTED = "rejected"


class ToolResultStatus(str, Enum):
    COMPLETED = "completed"
    FAILED = "failed"
    REJECTED = "rejected"


class IntentCategory(str, Enum):
    SIMPLE_SUMMARY = "simple_summary"
    SQL_QUESTION = "sql_question"
    AGENT_ANALYSIS = "agent_analysis"
    DATA_PREVIEW = "data_preview"
    REPORT_LOOKUP = "report_lookup"
    AMBIGUOUS = "ambiguous"
    UNSUPPORTED = "unsupported"


class SelectedMode(str, Enum):
    NATURAL_LANGUAGE = "natural_language"
    EXPERT_SQL = "expert_sql"
    AGENT_RUN = "agent_run"
    CLARIFICATION = "clarification"
    UNSUPPORTED = "unsupported"


class FallbackType(str, Enum):
    NONE = "none"
    PROVIDER = "provider"
    MODE = "mode"
    TOOL = "tool"
    UI = "ui"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class EvidenceRef(BaseModel):
    evidence_id: str = Field(default_factory=lambda: _new_id("evidence"), min_length=1)
    run_id: str | None = None
    step_id: str | None = None
    tool_call_id: str | None = None
    source_type: str = Field(min_length=1)
    source_name: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    data_ref: dict[str, Any] | None = None
    created_at: datetime = Field(default_factory=_utc_now)


class ToolResult(BaseModel):
    tool_name: str = Field(min_length=1)
    status: ToolResultStatus = ToolResultStatus.COMPLETED
    output: dict[str, Any] = Field(default_factory=dict)
    evidence_refs: list[EvidenceRef] = Field(default_factory=list)
    duration_ms: int | None = Field(default=None, ge=0)
    error: str | None = None
    is_simulated: bool = True


class ToolCall(BaseModel):
    call_id: str = Field(default_factory=lambda: _new_id("tool_call"), min_length=1)
    run_id: str = Field(min_length=1)
    step_id: str | None = None
    agent_role: AgentRole = AgentRole.DATA_ANALYST
    agent_name: str = Field(default="Data Analyst Agent", min_length=1)
    tool_name: str = Field(min_length=1)
    input_json: dict[str, Any] = Field(default_factory=dict)
    output_json: dict[str, Any] | None = None
    evidence_json: list[dict[str, Any]] = Field(default_factory=list)
    duration_ms: int | None = Field(default=None, ge=0)
    token_usage_json: dict[str, Any] | None = None
    provider_used: str = Field(default="mock", min_length=1)
    is_simulated: bool = True
    status: ToolCallStatus = ToolCallStatus.PENDING
    error: str | None = None
    created_at: datetime = Field(default_factory=_utc_now)
    updated_at: datetime = Field(default_factory=_utc_now)


class AgentStep(BaseModel):
    step_id: str = Field(default_factory=lambda: _new_id("step"), min_length=1)
    run_id: str = Field(min_length=1)
    root_run_id: str = Field(min_length=1)
    agent_role: AgentRole = AgentRole.DATA_ANALYST
    agent_name: str = Field(default="Data Analyst Agent", min_length=1)
    step_index: int = Field(ge=0)
    state: AgentStepState
    tool_name: str | None = None
    handoff_from: str | None = None
    handoff_to: str | None = None
    status: AgentStatus = AgentStatus.RUNNING
    input_json: dict[str, Any] = Field(default_factory=dict)
    output_json: dict[str, Any] | None = None
    evidence_json: list[dict[str, Any]] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=_utc_now)
    ended_at: datetime | None = None
    error: str | None = None


class IntentRoute(BaseModel):
    intent: IntentCategory
    confidence: float = Field(ge=0.0, le=1.0)
    selected_mode: SelectedMode
    route_reason: str = Field(min_length=1)
    requires_agent: bool
    safety_flags: list[str] = Field(default_factory=list)


class AgentRunSummary(BaseModel):
    run_id: str = Field(min_length=1)
    status: AgentStatus
    agent_role: AgentRole = AgentRole.DATA_ANALYST
    provider_used: str = Field(min_length=1)
    is_simulated: bool
    fallback_triggered: bool
    step_count: int = Field(ge=0)
    tool_call_count: int = Field(ge=0)
    findings_count: int = Field(ge=0)
    trace_id: str = Field(min_length=1)


class AgentRun(BaseModel):
    run_id: str = Field(default_factory=lambda: _new_id("run"), min_length=1)
    root_run_id: str | None = None
    parent_run_id: str | None = None
    orchestrator_run_id: str | None = None
    agent_role: AgentRole = AgentRole.DATA_ANALYST
    agent_name: str = Field(default="Data Analyst Agent", min_length=1)
    table_name: str | None = None
    user_goal: str = Field(min_length=1)
    intent: IntentCategory | None = None
    selected_mode: SelectedMode | None = None
    provider_requested: str = Field(default="mock", min_length=1)
    provider_used: str = Field(default="mock", min_length=1)
    is_simulated: bool = True
    fallback_triggered: bool = False
    fallback_type: FallbackType = FallbackType.NONE
    fallback_reason: str | None = None
    status: AgentStatus = AgentStatus.CREATED
    trace_id: str = Field(default_factory=lambda: _new_id("trace"), min_length=1)
    steps: list[AgentStep] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=_utc_now)
    updated_at: datetime = Field(default_factory=_utc_now)
    error: str | None = None

    @field_validator("user_goal", "trace_id", mode="before")
    @classmethod
    def _strip_required_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            value = value.strip()
        return value

    @model_validator(mode="after")
    def _default_root_run_id(self) -> "AgentRun":
        if self.root_run_id is None:
            self.root_run_id = self.run_id
        return self

    def to_summary(self, findings_count: int = 0) -> AgentRunSummary:
        return AgentRunSummary(
            run_id=self.run_id,
            status=self.status,
            agent_role=self.agent_role,
            provider_used=self.provider_used,
            is_simulated=self.is_simulated,
            fallback_triggered=self.fallback_triggered,
            step_count=len(self.steps),
            tool_call_count=len(self.tool_calls),
            findings_count=findings_count,
            trace_id=self.trace_id,
        )

