"""AgentRun memory store boundary for M5.4.7.

This module maps the future agent_runs / agent_steps / agent_tool_calls
concepts to an in-memory test double. It does not define durable storage,
write files, call providers, execute runtime chains, or expose routes.
"""

from __future__ import annotations

from typing import Any, Protocol

from pydantic import BaseModel, Field, model_validator

from backend.agent.contracts import AgentRun, AgentStep, ToolCall


class AgentRunRecord(BaseModel):
    """Stored AgentRun detail record used by the memory boundary."""

    run: AgentRun
    steps: list[AgentStep] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def _fill_run_children(self) -> "AgentRunRecord":
        if not self.steps:
            self.steps = list(self.run.steps)
        if not self.tool_calls:
            self.tool_calls = list(self.run.tool_calls)
        return self


class AgentRunMemoryStore(Protocol):
    """Boundary for saving and reading AgentRun detail records."""

    def save_run(self, record: AgentRunRecord) -> AgentRunRecord:
        """Save one AgentRun detail record."""
        ...

    def get_run(self, run_id: str) -> AgentRunRecord | None:
        """Read one AgentRun detail record by run_id."""
        ...

    def clear(self) -> None:
        """Remove all in-memory records."""
        ...


class InMemoryAgentRunStore:
    """In-memory fake store for tests and runtime boundary validation."""

    def __init__(self) -> None:
        self._records: dict[str, AgentRunRecord] = {}

    def save_run(self, record: AgentRunRecord) -> AgentRunRecord:
        run_id = record.run.run_id.strip()
        if not run_id:
            raise ValueError("run_id is required")

        stored = record.model_copy(deep=True)
        self._records[run_id] = stored
        return stored.model_copy(deep=True)

    def get_run(self, run_id: str) -> AgentRunRecord | None:
        key = run_id.strip()
        if not key:
            return None

        record = self._records.get(key)
        if record is None:
            return None
        return record.model_copy(deep=True)

    def clear(self) -> None:
        self._records.clear()
