"""Deterministic mock-safe tool registry for the native EAI Agent path.

This module intentionally avoids real database, provider, network, and
pipeline access. It provides the smallest typed registry needed by M5.1.3.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass
from time import perf_counter
from typing import Any

from pydantic import BaseModel, Field, field_validator

from backend.agent.contracts import EvidenceRef, RiskLevel, ToolResult, ToolResultStatus


_SAMPLE_COLUMNS: list[dict[str, Any]] = [
    {"name": "date", "type": "DATE"},
    {"name": "channel", "type": "VARCHAR"},
    {"name": "revenue", "type": "DOUBLE"},
    {"name": "orders", "type": "INTEGER"},
]

_SAMPLE_ROWS: list[dict[str, Any]] = [
    {"date": "2026-01-01", "channel": "organic", "revenue": 1200.0, "orders": 12},
    {"date": "2026-01-02", "channel": "paid", "revenue": 950.0, "orders": 8},
    {"date": "2026-01-03", "channel": "partner", "revenue": 720.0, "orders": 6},
]

_DANGEROUS_SQL_KEYWORDS = (
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
)


class ToolValidationError(ValueError):
    """Raised when a tool name or input payload is invalid."""


class ToolExecutionError(RuntimeError):
    """Raised when a deterministic mock tool cannot complete."""


class InspectSchemaInput(BaseModel):
    table_name: str = Field(min_length=1)
    columns: list[dict[str, Any]] | None = None

    @field_validator("table_name", mode="before")
    @classmethod
    def _strip_table_name(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value


class InspectSchemaOutput(BaseModel):
    table_name: str
    columns: list[dict[str, Any]]
    column_count: int
    summary: str


class ProfileTableInput(BaseModel):
    table_name: str = Field(min_length=1)
    row_count: int | None = Field(default=None, ge=0)
    columns: list[dict[str, Any]] | None = None

    @field_validator("table_name", mode="before")
    @classmethod
    def _strip_table_name(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value


class ProfileTableOutput(BaseModel):
    table_name: str
    row_count: int
    column_count: int
    missing_values_summary: dict[str, int]
    numeric_columns: list[str]
    summary: str


class ExecuteReadonlySqlInput(BaseModel):
    sql: str = Field(min_length=1)
    row_limit: int = Field(default=50, ge=1)

    @field_validator("sql", mode="before")
    @classmethod
    def _strip_sql(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value


class ExecuteReadonlySqlOutput(BaseModel):
    sql: str
    row_count: int
    columns: list[str]
    rows: list[dict[str, Any]]
    summary: str


class GenerateSqlInput(BaseModel):
    user_goal: str = Field(min_length=1)
    table_name: str | None = None
    schema_payload: dict[str, Any] | None = Field(default=None, alias="schema")
    provider_requested: str = "mock"

    @field_validator("user_goal", "provider_requested", mode="before")
    @classmethod
    def _strip_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value


ToolCallable = Callable[[BaseModel], BaseModel]


@dataclass(frozen=True)
class ToolDefinition:
    name: str
    description: str
    input_model: type[BaseModel]
    output_model: type[BaseModel]
    risk_level: RiskLevel
    requires_readonly_sql: bool
    is_mock: bool
    callable: ToolCallable


class ToolRegistry:
    """Small deterministic registry for M5.1 mock-safe tools."""

    def __init__(self, tools: list[ToolDefinition]) -> None:
        self._tools = {tool.name: tool for tool in tools}

    def list_tools(self) -> list[ToolDefinition]:
        return [self._tools[name] for name in sorted(self._tools)]

    def get_tool(self, name: str) -> ToolDefinition:
        try:
            return self._tools[name]
        except KeyError as exc:
            raise ToolValidationError(f"Unknown tool: {name}") from exc

    def has_tool(self, name: str) -> bool:
        return name in self._tools

    def call_tool(self, name: str, input_data: dict[str, Any]) -> ToolResult:
        tool = self.get_tool(name)
        started_at = perf_counter()

        try:
            validated_input = tool.input_model.model_validate(input_data)
            if tool.requires_readonly_sql:
                sql = getattr(validated_input, "sql", "")
                validate_readonly_sql(sql)
            output_model = tool.callable(validated_input)
            output = tool.output_model.model_validate(output_model).model_dump(mode="json")
            duration_ms = int((perf_counter() - started_at) * 1000)
            return ToolResult(
                tool_name=tool.name,
                status=ToolResultStatus.COMPLETED,
                output=output,
                evidence_refs=[
                    EvidenceRef(
                        source_type="mock_tool",
                        source_name=tool.name,
                        summary=f"Deterministic mock evidence for {tool.name}.",
                        data_ref={"tool_name": tool.name, "is_mock": True},
                    )
                ],
                duration_ms=duration_ms,
                error=None,
                is_simulated=True,
            )
        except ToolValidationError:
            raise
        except Exception as exc:
            raise ToolValidationError(str(exc)) from exc


def validate_readonly_sql(sql: str) -> None:
    """Validate the minimal readonly SQL subset allowed by M5.1.3."""

    raw_normalized = (sql or "").strip().lower()
    raw_tokens = set(re.findall(r"[a-z_]+", raw_normalized))
    dangerous_raw = sorted(raw_tokens.intersection(_DANGEROUS_SQL_KEYWORDS))
    if dangerous_raw:
        raise ToolValidationError(f"Readonly SQL rejected dangerous keyword: {dangerous_raw[0]}")

    normalized = _strip_sql_comments(sql).strip().lower()
    if not normalized:
        raise ToolValidationError("SQL must not be empty.")

    if not (normalized.startswith("select") or normalized.startswith("with")):
        raise ToolValidationError("Only SELECT or WITH readonly SQL is allowed.")

    tokens = set(re.findall(r"[a-z_]+", normalized))
    dangerous = sorted(tokens.intersection(_DANGEROUS_SQL_KEYWORDS))
    if dangerous:
        raise ToolValidationError(f"Readonly SQL rejected dangerous keyword: {dangerous[0]}")

    statements = [statement.strip() for statement in normalized.split(";") if statement.strip()]
    if len(statements) > 1:
        raise ToolValidationError("Multiple SQL statements are not allowed.")


def get_default_tool_registry() -> ToolRegistry:
    return ToolRegistry(
        [
            ToolDefinition(
                name="inspect_schema",
                description="Inspect table fields and types using deterministic mock data.",
                input_model=InspectSchemaInput,
                output_model=InspectSchemaOutput,
                risk_level=RiskLevel.LOW,
                requires_readonly_sql=False,
                is_mock=True,
                callable=_inspect_schema,
            ),
            ToolDefinition(
                name="profile_table",
                description="Profile row count, missing values, and numeric columns with deterministic mock data.",
                input_model=ProfileTableInput,
                output_model=ProfileTableOutput,
                risk_level=RiskLevel.LOW,
                requires_readonly_sql=False,
                is_mock=True,
                callable=_profile_table,
            ),
            ToolDefinition(
                name="execute_readonly_sql",
                description="Execute readonly SQL against deterministic mock rows.",
                input_model=ExecuteReadonlySqlInput,
                output_model=ExecuteReadonlySqlOutput,
                risk_level=RiskLevel.MEDIUM,
                requires_readonly_sql=True,
                is_mock=True,
                callable=_execute_readonly_sql,
            ),
        ]
    )


def list_tool_names() -> list[str]:
    return [tool.name for tool in get_default_tool_registry().list_tools()]


def execute_readonly_sql_real_path(
    input_data: dict[str, Any],
    *,
    executor: Any | None = None,
    table_name: str | None = None,
) -> ToolResult:
    """Explicit real-path readonly SQL helper for M5.3.2.

    The default registry still uses the deterministic mock implementation.
    Callers must opt into this helper to use an existing readonly executor.
    """

    from backend.agent.pipeline_adapter import execute_readonly_sql_with_existing_executor

    payload = ExecuteReadonlySqlInput.model_validate(input_data)
    return execute_readonly_sql_with_existing_executor(
        sql=payload.sql,
        table_name=table_name,
        row_limit=payload.row_limit,
        executor=executor,
    )


def generate_sql_real_path(
    input_data: dict[str, Any],
    *,
    generator: Any | None = None,
) -> ToolResult:
    """Explicit SQL generation helper for M5.3.3.

    The default registry is unchanged. This helper requires an injected
    generator and never calls a live provider by default.
    """

    from backend.agent.pipeline_adapter import generate_sql_with_existing_pipeline

    payload = GenerateSqlInput.model_validate(input_data)
    return generate_sql_with_existing_pipeline(
        user_goal=payload.user_goal,
        table_name=payload.table_name,
        schema=payload.schema_payload,
        provider_requested=payload.provider_requested,
        generator=generator,
        allow_real_provider=False,
    )


def _inspect_schema(input_data: BaseModel) -> InspectSchemaOutput:
    payload = _ensure_model(input_data, InspectSchemaInput)
    columns = payload.columns or _SAMPLE_COLUMNS
    return InspectSchemaOutput(
        table_name=payload.table_name,
        columns=columns,
        column_count=len(columns),
        summary=f"Table {payload.table_name} has {len(columns)} columns.",
    )


def _profile_table(input_data: BaseModel) -> ProfileTableOutput:
    payload = _ensure_model(input_data, ProfileTableInput)
    columns = payload.columns or _SAMPLE_COLUMNS
    numeric_columns = [
        str(column.get("name"))
        for column in columns
        if str(column.get("type", "")).lower() in {"integer", "int", "bigint", "double", "float", "decimal", "numeric"}
    ]
    if not numeric_columns:
        numeric_columns = ["revenue", "orders"]

    row_count = payload.row_count if payload.row_count is not None else 3
    return ProfileTableOutput(
        table_name=payload.table_name,
        row_count=row_count,
        column_count=len(columns),
        missing_values_summary={},
        numeric_columns=numeric_columns,
        summary=f"Table {payload.table_name} mock profile has {row_count} rows and {len(columns)} columns.",
    )


def _execute_readonly_sql(input_data: BaseModel) -> ExecuteReadonlySqlOutput:
    payload = _ensure_model(input_data, ExecuteReadonlySqlInput)
    rows = _SAMPLE_ROWS[: payload.row_limit]
    columns = list(rows[0].keys()) if rows else []
    return ExecuteReadonlySqlOutput(
        sql=payload.sql,
        row_count=len(rows),
        columns=columns,
        rows=rows,
        summary=f"Readonly SQL returned {len(rows)} deterministic mock rows.",
    )


def _ensure_model(value: BaseModel, expected_type: type[BaseModel]) -> Any:
    if isinstance(value, expected_type):
        return value
    raise ToolExecutionError(f"Expected {expected_type.__name__}.")


def _strip_sql_comments(sql: str) -> str:
    without_block_comments = re.sub(r"/\*.*?\*/", " ", sql or "", flags=re.DOTALL)
    return re.sub(r"--.*?$", " ", without_block_comments, flags=re.MULTILINE)
