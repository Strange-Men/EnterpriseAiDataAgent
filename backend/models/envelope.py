"""Shared API response envelope contracts."""

from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class ApiErrorInfo(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ApiResponseEnvelope(BaseModel, Generic[T]):
    status: Literal["success", "error", "partial"]
    data: T | None = None
    error: ApiErrorInfo | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class AiQualityGate(BaseModel):
    name: str
    passed: bool
    score: float | None = None
    message: str | None = None


class AiResultEnvelope(BaseModel, Generic[T]):
    status: Literal["success", "partial", "fallback", "error", "low_confidence"]
    data: T | None = None
    fallback: str | None = None
    error: ApiErrorInfo | None = None
    quality_gates: list[AiQualityGate] = Field(default_factory=list)
    trace: dict[str, Any] | None = None
    partial_data: dict[str, Any] | None = None
