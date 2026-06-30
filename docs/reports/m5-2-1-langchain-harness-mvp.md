# M5.2.1 Optional LangChain Harness MVP

## 1. Goal

Implement an optional LangChain harness MVP without replacing EAI native Agent contracts or native mock runner.

## 2. Files Changed

- `backend/agent/langchain_adapter.py`
- `tests/unit/test_agent_langchain_adapter.py`
- `requirements.txt`
- `docs/reports/m5-2-1-langchain-harness-mvp.md`
- `CURRENT_SESSION.md`

## 3. Dependency Decision

- LangChain was already importable locally: yes.
- LangChain Core was already importable locally: yes.
- `requirements.txt` was changed: yes, added `langchain-core>=1.0.0,<2.0.0`.
- Reason: CI installs backend dependencies from `requirements.txt`; the MVP should not rely on packages that only happen to exist in the local environment.
- LangGraph was added: no.
- LangSmith was added: no.
- Provider SDKs were added: no.

## 4. Adapter Behavior

- EAI router remains responsible for intent routing.
- EAI `ToolRegistry` remains responsible for tools.
- EAI readonly SQL guardrail remains responsible for SQL safety.
- LangChain is used only as a tool-calling harness around M5.1 mock-safe tools.
- Adapter output normalizes into EAI `AgentRun`, `AgentStep`, and `ToolCall`.
- Tool results normalize through EAI `ToolResult` and `EvidenceRef` contracts.
- `AgentRun.to_summary()` remains the native `AgentRunSummary` path.

## 5. Native Fallback

- Native mock runner remains usable.
- Adapter import is safe even if the optional dependency is unavailable.
- If the optional harness is unavailable or fails, `run_langchain_mock_agent()` falls back to `run_mock_agent()` and marks the returned run with fallback metadata.
- Adapter failure does not break M5.1 foundation.

## 6. Tool Scope

Wrapped tools:

- `inspect_schema`
- `profile_table`
- `execute_readonly_sql`

Not wrapped:

- `generate_sql`
- `summarize_findings`
- `build_report`
- `detect_anomalies`
- `suggest_chart`
- `business_metric_lookup`

## 7. Simulated / Fallback Metadata

The adapter preserves:

- `provider_requested`
- `provider_used`
- `is_simulated`
- `fallback_triggered`
- `fallback_type`
- `fallback_reason`

All M5.2.1 adapter results remain simulated and use `provider_used="mock"`.

## 8. Tests

- adapter tests: included in focused pytest -> 10 passed.
- M5.1 foundation tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py tests/unit/test_agent_langchain_adapter.py` -> 145 passed.
- backend import: `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 704 passed, 31 skipped.
- safety search: no matches for credential, private-content, or forbidden personal-material patterns.
- forbidden dependency search: no matches in adapter source or adapter tests.

## 9. What Was Not Changed

- LangGraph was not connected.
- LangSmith was not connected.
- Real LLM access was not added.
- Real DuckDB integration was not added.
- Existing AI pipeline integration was not added.
- Persistence was not implemented.
- FastAPI routes were not implemented.
- Frontend integration was not added.
- Frontend source code was not changed.
- Backend business logic was not changed.
- `.env` was not committed.
- No tag was created.

## 10. Integration Reminder

M5.2 is still not the final business Agent.

M5.3 must connect existing AI pipeline / SQL execution / summary / report capabilities into Agent tools.

## 11. Next Step

Wait for user review. After approval, the next stage can be:

```text
M5.2.2 LangChain Harness Regression / Merge Validation
```

Do not start M5.2.2 in this round.
