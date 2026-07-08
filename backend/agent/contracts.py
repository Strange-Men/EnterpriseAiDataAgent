"""Pydantic contracts for the native EAI Agent runtime.

This module defines data contracts only. It must not execute routing, tools,
persistence, or existing AI pipeline behavior.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from backend.services.llm_runtime import readable_fallback_reason


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


class ProviderStatus(str, Enum):
    LIVE_SUCCESS = "live_success"
    MOCK = "mock"
    FALLBACK = "fallback"
    ERROR = "error"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


DEFAULT_RECOMMENDATION = {
    "priority": "medium",
    "action": "优先排查退款和投诉较高的业务对象",
    "why": "当前数据提示部分渠道、地区或品类可能存在退款和体验压力，需要进一步确认。",
    "how": "先导出相关订单明细，按渠道、地区、品类和退货原因分组，找出问题最集中的对象。",
    "metrics": ["退款率", "投诉率", "满意度", "退货原因"],
    "deadline": "建议 1 周内完成初步排查",
    "owner_hint": "运营 / 售后 / 商品负责人",
}


_METRIC_LABELS = {
    "sales_amount": "销售额",
    "total_sales": "销售额",
    "order_count": "订单数",
    "avg_order_value": "客单价",
    "refund_amount": "退款金额",
    "refund_rate": "退款率",
    "return_rate": "退货率",
    "gross_margin_rate": "毛利率",
    "avg_discount": "平均折扣",
    "discount": "折扣",
    "avg_shipping_days": "平均发货周期",
    "shipping_days": "发货周期",
    "complaint_rate": "投诉率",
    "complaint_count": "投诉量",
    "avg_satisfaction_score": "满意度",
    "satisfaction_score": "满意度",
    "return_reason": "退货原因",
    "monthly_sales": "月销售额",
    "anomaly_count": "异常数据量",
    "missing_rate": "缺失率",
}


def _truncate_text(value: str, *, limit: int = 180) -> str:
    text = " ".join(str(value or "").split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _looks_like_bare_field(value: str) -> bool:
    text = str(value or "").strip()
    if not text:
        return True
    if text in _METRIC_LABELS:
        return True
    return bool(__import__("re").fullmatch(r"[a-z_]+(?:\s*[+,/]\s*[a-z_]+)*", text))


def _humanize_metric(value: Any) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    if text in _METRIC_LABELS:
        return _METRIC_LABELS[text]
    return text


def _metric_list(value: Any) -> list[str]:
    if isinstance(value, list):
        raw_items = value
    elif isinstance(value, str):
        raw_items = [part.strip() for part in __import__("re").split(r"[+,/，、]", value) if part.strip()]
    else:
        raw_items = []
    metrics = [_humanize_metric(item) for item in raw_items if _humanize_metric(item)]
    return metrics[:6] or list(DEFAULT_RECOMMENDATION["metrics"])


def _priority_label(value: Any) -> str:
    raw = str(value or "").strip().lower()
    if raw in {"p0", "critical", "high", "高", "高优先级"}:
        return "high"
    if raw in {"p2", "low", "低", "低优先级"}:
        return "low"
    return "medium"


def _default_recommendation(action: str | None = None) -> dict[str, Any]:
    data = dict(DEFAULT_RECOMMENDATION)
    data["metrics"] = list(DEFAULT_RECOMMENDATION["metrics"])
    if action and not _looks_like_bare_field(action):
        data["action"] = _truncate_text(action, limit=140)
    return data


class BusinessRecommendation(BaseModel):
    """Stable user-facing recommendation contract for Business Report output."""

    model_config = ConfigDict(extra="ignore")

    priority: str = "medium"
    action: str
    why: str
    how: str
    metrics: list[str]
    deadline: str
    owner_hint: str
    target_object: str | None = None
    reason: str | None = None
    monitoring_metric: str | None = None
    expected_action_window: str | None = None

    @field_validator("priority", mode="before")
    @classmethod
    def _normalize_priority(cls, value: Any) -> str:
        return _priority_label(value)

    @field_validator("action", mode="before")
    @classmethod
    def _validate_action(cls, value: Any) -> str:
        text = _truncate_text(str(value or ""), limit=140)
        if len(text) < 4 or _looks_like_bare_field(text):
            return str(DEFAULT_RECOMMENDATION["action"])
        return text

    @field_validator("why", mode="before")
    @classmethod
    def _validate_why(cls, value: Any) -> str:
        text = _truncate_text(str(value or ""), limit=220)
        if len(text) < 12 or _looks_like_bare_field(text):
            return str(DEFAULT_RECOMMENDATION["why"])
        return text

    @field_validator("how", mode="before")
    @classmethod
    def _validate_how(cls, value: Any) -> str:
        text = _truncate_text(str(value or ""), limit=240)
        if len(text) < 12 or _looks_like_bare_field(text):
            return str(DEFAULT_RECOMMENDATION["how"])
        return text

    @field_validator("metrics", mode="before")
    @classmethod
    def _validate_metrics(cls, value: Any) -> list[str]:
        return _metric_list(value)

    @field_validator("deadline", mode="before")
    @classmethod
    def _validate_deadline(cls, value: Any) -> str:
        text = _truncate_text(str(value or ""), limit=80)
        return text if len(text) >= 3 and not _looks_like_bare_field(text) else str(DEFAULT_RECOMMENDATION["deadline"])

    @field_validator("owner_hint", mode="before")
    @classmethod
    def _validate_owner(cls, value: Any) -> str:
        text = _truncate_text(str(value or ""), limit=80)
        return text if len(text) >= 2 and not _looks_like_bare_field(text) else str(DEFAULT_RECOMMENDATION["owner_hint"])


def validate_business_recommendations(raw: Any) -> list[dict[str, Any]]:
    """Normalize recommendation-like output into a non-empty user-safe list."""

    if isinstance(raw, str):
        stripped = raw.strip()
        if stripped and not _looks_like_bare_field(stripped):
            raw_items: list[Any] = [_default_recommendation(stripped)]
        else:
            raw_items = [_default_recommendation()]
    elif isinstance(raw, dict):
        raw_items = [raw]
    elif isinstance(raw, list):
        raw_items = raw
    else:
        raw_items = []

    normalized: list[dict[str, Any]] = []
    for item in raw_items:
        if isinstance(item, str):
            candidate = _default_recommendation(item.strip() or None)
        elif isinstance(item, dict):
            candidate = dict(item)
            candidate.setdefault("action", candidate.get("recommendation") or candidate.get("title") or DEFAULT_RECOMMENDATION["action"])
            candidate.setdefault("why", candidate.get("why") or candidate.get("reason") or DEFAULT_RECOMMENDATION["why"])
            candidate.setdefault("how", candidate.get("how") or DEFAULT_RECOMMENDATION["how"])
            candidate.setdefault("metrics", candidate.get("metrics") or candidate.get("monitoring_metric") or DEFAULT_RECOMMENDATION["metrics"])
            candidate.setdefault("deadline", candidate.get("deadline") or candidate.get("expected_action_window") or DEFAULT_RECOMMENDATION["deadline"])
            candidate.setdefault("owner_hint", candidate.get("owner_hint") or DEFAULT_RECOMMENDATION["owner_hint"])
        else:
            continue
        try:
            normalized.append(BusinessRecommendation.model_validate(candidate).model_dump(mode="json", exclude_none=True))
        except Exception:
            normalized.append(BusinessRecommendation.model_validate(_default_recommendation()).model_dump(mode="json", exclude_none=True))

    return normalized[:6] or [BusinessRecommendation.model_validate(_default_recommendation()).model_dump(mode="json", exclude_none=True)]


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
    provider_status: ProviderStatus = ProviderStatus.MOCK
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
    requested_provider: str | None = None
    provider_used: str = Field(default="mock", min_length=1)
    provider_status: ProviderStatus = ProviderStatus.MOCK
    is_simulated: bool = True
    fallback_triggered: bool = False
    fallback_type: FallbackType = FallbackType.NONE
    fallback_reason: str | None = None
    status: AgentStatus = AgentStatus.CREATED
    answer: str | None = None
    business_report: dict[str, Any] | None = None
    business_report_view_model: dict[str, Any] | None = None
    locale: str = "zh-CN"
    sql: str | None = None
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    result_preview: dict[str, Any] | None = None
    warnings: list[str] = Field(default_factory=list)
    trace: dict[str, Any] = Field(default_factory=dict)
    memory_used: bool = False
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

    @field_validator("locale", mode="before")
    @classmethod
    def _normalize_locale(cls, value: Any) -> str:
        text = str(value or "").strip().lower().replace("_", "-")
        if text in {"en", "en-us", "enus"}:
            return "en-US"
        return "zh-CN"

    @model_validator(mode="after")
    def _default_root_run_id(self) -> "AgentRun":
        if self.root_run_id is None:
            self.root_run_id = self.run_id
        self.sync_provider_status()
        return self

    def sync_provider_status(self) -> "AgentRun":
        """Keep product-facing provider status aligned with legacy metadata."""

        requested = (self.provider_requested or self.requested_provider or "mock").strip().lower() or "mock"
        used = (self.provider_used or "mock").strip().lower() or "mock"
        self.provider_requested = requested
        self.requested_provider = requested
        self.provider_used = used
        self.fallback_reason = _safe_fallback_reason(self.fallback_reason)

        if requested == "mock":
            self.provider_status = ProviderStatus.MOCK
            self.provider_used = "mock"
            self.is_simulated = True
            self.fallback_triggered = False
            self.fallback_type = FallbackType.NONE
            self.fallback_reason = None
        elif self.status == AgentStatus.FAILED and not self.fallback_triggered and used != "mock":
            self.provider_status = ProviderStatus.ERROR
            self.is_simulated = False
        elif self.fallback_triggered or used == "mock":
            self.provider_status = ProviderStatus.FALLBACK
            self.provider_used = "mock"
            self.is_simulated = True
            self.fallback_triggered = True
            self.fallback_type = FallbackType.PROVIDER
            self.fallback_reason = self.fallback_reason or "provider_fallback_to_mock"
        else:
            self.provider_status = ProviderStatus.LIVE_SUCCESS
            self.is_simulated = False
            self.fallback_triggered = False
            self.fallback_type = FallbackType.NONE
            self.fallback_reason = None
        return self

    def to_summary(self, findings_count: int = 0) -> AgentRunSummary:
        self.sync_provider_status()
        return AgentRunSummary(
            run_id=self.run_id,
            status=self.status,
            agent_role=self.agent_role,
            provider_used=self.provider_used,
            provider_status=self.provider_status,
            is_simulated=self.is_simulated,
            fallback_triggered=self.fallback_triggered,
            step_count=len(self.steps),
            tool_call_count=len(self.tool_calls),
            findings_count=findings_count,
            trace_id=self.trace_id,
        )


def _safe_fallback_reason(reason: str | None) -> str | None:
    if not reason:
        return None
    text = " ".join(str(reason).split())
    if not text:
        return None
    if any(marker in text for marker in ("Traceback", "File \"", "File '", " at ", "\\backend\\", "/backend/")):
        return readable_fallback_reason("provider_request_failed")
    if len(text) > 180:
        return text[:177].rstrip() + "..."
    return readable_fallback_reason(text)

