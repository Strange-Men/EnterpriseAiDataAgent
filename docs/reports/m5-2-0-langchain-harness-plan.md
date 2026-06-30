# M5.2.0 Optional LangChain Harness Plan

## 1. Goal

Plan the optional LangChain harness MVP before installing dependencies or writing adapter code.

## 2. Source of Truth

- `docs/architecture/m5-m6-agent-roadmap.md`
- `docs/architecture/m5-agent-design.md`
- `docs/reports/m5-1-foundation-merge-validation.md`

## 3. M5.2 Decision

LangChain is optional.

EAI native contracts remain the source of truth.

The native mock runner remains the default runnable path until an optional adapter is explicitly approved and validated.

## 4. M5.2 Scope

M5.2 may add:

- optional LangChain adapter
- adapters for M5.1 mock-safe tools
- normalization back into EAI Agent contracts
- focused adapter tests

M5.2 must not add:

- LangGraph
- LangSmith binding
- RAG
- Multi-Agent
- persistence
- FastAPI route
- frontend UI
- real LLM smoke
- existing AI pipeline integration
- real DuckDB execution

## 5. Dependency Check

- Python version: 3.11.5
- dependency files: `requirements.txt`
- LangChain in `requirements.txt`: not declared
- LangGraph in `requirements.txt`: not declared
- LangChain in current Python environment: installed
- LangGraph in current Python environment: installed

Finding:

The active Python environment can find LangChain and LangGraph, but this project has not declared either dependency. M5.2.0 does not treat those packages as project dependencies. M5.2.1 must not rely on undeclared environment state.

## 6. File Boundary

Future allowed files:

- `backend/agent/langchain_adapter.py`
- `tests/unit/test_agent_langchain_adapter.py`
- `docs/reports/m5-2-1-langchain-harness-mvp.md`

M5.2.0 did not create these code files.

## 7. Tool Boundary

First tools:

- `inspect_schema`
- `profile_table`
- `execute_readonly_sql`

Future tools are not part of M5.2.0:

- `generate_sql`
- `summarize_findings`
- `build_report`
- `detect_anomalies`
- `suggest_chart`
- `business_metric_lookup`

## 8. Native Contract Boundary

LangChain output must normalize back into:

- `AgentRun`
- `AgentStep`
- `ToolCall`
- `ToolResult`
- `EvidenceRef`
- `AgentRunSummary`

LangChain objects must not leak into frontend state, persistence, history, report detail, or public API contracts.

## 9. Native Fallback Strategy

Native mock runner remains usable if LangChain adapter fails.

LangChain must remain optional, and M5.1 foundation must stay runnable without LangChain.

## 10. Integration Reminder

M5.2 is not the final business Agent.

M5.3 must connect existing AI pipeline / SQL execution / summary / report into Agent tools.

## 11. What Was Not Changed

- LangChain was not installed.
- LangGraph was not installed.
- LangChain adapter was not implemented.
- Persistence was not implemented.
- FastAPI routes were not implemented.
- Frontend integration was not added.
- Real DuckDB integration was not added.
- Real LLM access was not added.
- Existing AI pipeline integration was not added.
- Frontend source code was not changed.
- Backend business logic was not changed.
- `.env` was not committed.
- No tag was created.

## 12. Validation

- backend import: `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`.
- M5.1 focused tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py` -> 135 passed.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 694 passed, 31 skipped.
- safety search: no matches for credential, private-content, or forbidden personal-material patterns.

## 13. Next Step

Wait for user review. After approval, the next stage may be:

```text
M5.2.1 Optional LangChain Harness MVP
```

Do not start M5.2.1 in this round.
