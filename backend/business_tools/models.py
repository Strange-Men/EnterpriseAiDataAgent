"""Typed input and output models for M6 business analysis tools."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


RiskLevel = Literal["high", "medium", "low"]
Priority = Literal["P0", "P1", "P2", "high", "medium", "low"]


class JsonSafeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class EvidenceRow(JsonSafeModel):
    values: dict[str, Any]


class EvidenceTable(JsonSafeModel):
    title: str
    columns: list[str]
    rows: list[EvidenceRow] = Field(default_factory=list)
    row_count: int = 0


class MetricValue(JsonSafeModel):
    name: str
    value: float | int | str | None
    display_format: str = "number"
    available: bool = True
    missing_fields: list[str] = Field(default_factory=list)
    evidence: dict[str, Any] = Field(default_factory=dict)


class RiskItem(JsonSafeModel):
    risk_name: str
    risk_level: RiskLevel
    priority_score: float
    reason: str
    evidence: dict[str, Any] = Field(default_factory=dict)
    impact: float = 0.0
    severity: float = 0.0
    confidence: float = 0.0


class OpportunityItem(JsonSafeModel):
    object_type: str
    object_name: str
    score: float
    reason: str
    risk_reminder: str
    evidence: dict[str, Any] = Field(default_factory=dict)


class RecommendationItem(JsonSafeModel):
    priority: Priority
    target_object: str
    action: str
    why: str
    how: str
    metrics: list[str]
    deadline: str
    owner_hint: str
    monitoring_metric: str
    expected_action_window: str
    reason: str


class ToolResult(JsonSafeModel):
    tool_name: str
    status: Literal["success", "partial", "error"]
    evidence_summary: str
    metrics: list[MetricValue] = Field(default_factory=list)
    evidence_tables: list[EvidenceTable] = Field(default_factory=list)
    risks: list[RiskItem] = Field(default_factory=list)
    opportunities: list[OpportunityItem] = Field(default_factory=list)
    recommendations: list[RecommendationItem] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    fallback_message: str = ""
    can_continue: bool = True
    data: dict[str, Any] = Field(default_factory=dict)


class FieldValidationInput(JsonSafeModel):
    requested_fields: list[str]
    table_schema: list[str] = Field(default_factory=list)


class BusinessTermMappingInput(JsonSafeModel):
    question: str | None = None
    terms: list[str] = Field(default_factory=list)
    available_fields: list[str] = Field(default_factory=list)


class TableMetricsInput(JsonSafeModel):
    table_name: str
    metric_set: list[str] = Field(default_factory=list)

    @field_validator("table_name", mode="before")
    @classmethod
    def _strip_table_name(cls, value: Any) -> Any:
        return value.strip() if isinstance(value, str) else value


class DimensionAnalysisInput(JsonSafeModel):
    table_name: str
    dimension: str
    metrics: list[str] = Field(default_factory=list)
    n: int = Field(default=5, ge=1, le=20)

    @field_validator("table_name", "dimension", mode="before")
    @classmethod
    def _strip_text(cls, value: Any) -> Any:
        return value.strip() if isinstance(value, str) else value


class TrendAnalysisInput(JsonSafeModel):
    table_name: str
    date_field: str = "order_date"
    granularity: Literal["month"] = "month"
    metrics: list[str] = Field(default_factory=list)


class MultiDimensionInput(JsonSafeModel):
    table_name: str
    dimensions: list[str]
    n: int = Field(default=5, ge=1, le=20)


class CustomerProfileInput(JsonSafeModel):
    table_name: str
    fields: list[str]
    n: int = Field(default=5, ge=1, le=20)


class ChannelEffectivenessInput(JsonSafeModel):
    table_name: str
    channel_field: str = "ad_channel"
    n: int = Field(default=5, ge=1, le=20)


class DataQualityInput(JsonSafeModel):
    table_name: str


class RiskPriorityInput(JsonSafeModel):
    risks: list[RiskItem]


class OpportunityFinderInput(JsonSafeModel):
    evidence_rows: list[dict[str, Any]]
    object_type: str = "dimension"
    n: int = Field(default=5, ge=1, le=20)


class RootCauseInput(JsonSafeModel):
    risks: list[RiskItem]
    evidence_rows: list[dict[str, Any]] = Field(default_factory=list)


class RecommendationInput(JsonSafeModel):
    risks: list[RiskItem] = Field(default_factory=list)
    opportunities: list[OpportunityItem] = Field(default_factory=list)
