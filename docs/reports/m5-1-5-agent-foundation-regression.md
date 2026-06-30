# M5.1.5 Agent Foundation Regression

> Date: 2026-06-30
> Branch: `m5-1-5-agent-foundation-regression`

## 1. Goal

Run M5.1 foundation regression after contracts, intent router, mock tool registry, and deterministic mock runner are implemented.

## 2. Scope

M5.1 completed:

- Native Agent Contracts
- Intent Router
- Mock Tool Registry
- Deterministic Mock Run Transcript

M5.1.5 adds regression coverage only. It does not add Agent product capability or connect runtime infrastructure beyond the M5.1 foundation.

## 3. Regression Coverage

- Router to Runner consistency
- AgentRun transcript integrity
- ToolCall simulated metadata
- Unsupported / ambiguous no-tool behavior
- Tool registry scope boundary
- Provider fallback simulated metadata
- Serialization
- Dependency leakage check
- M5.3 integration reminder

## 4. Test Results

- M5.1 focused tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py` -> 135 passed.
- foundation regression tests: included in focused pytest -> 23 passed.
- backend import: `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 694 passed, 31 skipped.
- safety search: no credential patterns found; only expected documentation mentions of LangChain / LangGraph were present.

## 5. What Was Not Changed

- No new Agent feature was added.
- No contracts / router / tools / mock_runner behavior was changed.
- Persistence was not implemented.
- A standalone tracing module was not implemented.
- FastAPI routes were not implemented.
- Existing AI pipeline integration was not added.
- Real DuckDB integration was not added.
- Real database access was not added.
- Real LLM access was not added.
- LangChain / LangGraph were not installed.
- Frontend source code was not changed.
- Backend business logic was not changed.
- `.env` or sensitive credentials were not committed.
- No tag was created.
- M5.2 was not started.

## 6. M5.3 Integration Reminder

M5.1 proves the native Agent foundation only.

It must not remain a standalone mock demo.

M5.3 must wrap the existing AI pipeline / SQL execution / summary / report capabilities into Agent tools.

## 7. Release Decision

If all tests pass:

```text
M5.1 Agent foundation is ready for review and merge.
```

## 8. Next Step

Wait for user review. After approval, M5.1 foundation can be merged to master and the next stage can begin:

```text
M5.2 Optional LangChain Harness MVP
```

Do not start M5.2 in this round.
