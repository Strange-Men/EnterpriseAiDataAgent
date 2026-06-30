# M5.3.3 Wrap Existing SQL Generation

## 1. Goal

Wrap existing SQL generation capability into Agent `ToolResult` semantics without calling real LLM providers in this stage.

M5.3.3 only supports an injected SQL generator path. It does not enable live provider execution.

## 2. Files Changed

- `backend/agent/pipeline_adapter.py`
- `backend/agent/tools.py`
- `tests/unit/test_agent_sql_generation_wrapping.py`
- `docs/reports/m5-3-3-wrap-sql-generation.md`
- `CURRENT_SESSION.md`

## 3. Existing Functions Reviewed

- SQL generation: `backend/services/ai_analyst.py::generate_sql`
- LLM SQL helper: `backend/utils/llm_sql.py::extract_sql_from_llm_output`, `validate_generated_sql`, `build_sql_quality_gates`
- provider runtime: `backend/services/llm_runtime.py`

M5.3.3 does not call these provider-backed functions in tests. It only preserves the boundary and normalizes injected generator output.

## 4. Wrapper Behavior

- `generate_sql_with_existing_pipeline` accepts an injected generator.
- If no generator is provided and live provider execution is disabled, it returns a rejected `ToolResult`.
- Generated SQL is validated through the existing readonly guardrail wrapper.
- Unsafe SQL becomes `ToolResult.status = rejected`.
- Generator exceptions become `ToolResult.status = failed`.
- Successful generated SQL becomes `ToolResult.status = completed`.

## 5. Mock / Real Provider Semantics

- Injected generator output is treated as simulated.
- `provider_used` remains `mock` in M5.3.3 tests.
- `provider_requested` is preserved in output metadata.
- If `provider_requested != "mock"`, fallback metadata is marked as simulated fallback.
- Live provider call is not enabled in M5.3.3.

## 6. Tests

- SQL generation wrapping tests: included in focused suite -> passed.
- M5.1 / M5.2 / M5.3.2 focused tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py tests/unit/test_agent_langchain_adapter.py tests/unit/test_agent_pipeline_adapter.py tests/unit/test_agent_readonly_sql_wrapping.py tests/unit/test_agent_sql_generation_wrapping.py` -> 173 passed.
- backend import: `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 732 passed, 31 skipped.
- safety search: no credential, private-content, or forbidden personal-material patterns found.
- forbidden dependency search: no provider, network, LangGraph, or LangSmith dependency strings found in the Agent adapter/tools/test boundary.
- real provider execution search: no real provider execution strings found in the Agent adapter/tools/test boundary.

## 7. What Was Not Changed

- Real LLM access was not connected.
- Real provider access was not connected.
- Network access was not added.
- Summary / report wrapping was not connected.
- Backend services were not modified.
- Backend routes were not modified.
- `database/query_executor.py` was not modified.
- Persistence was not implemented.
- FastAPI routes were not implemented.
- Frontend integration was not added.
- New dependencies were not installed.
- `requirements.txt` was not modified.
- No tag was created.

## 8. Next Step

Wait for user review. After approval, enter:

```text
M5.3.4 Wrap Summary / Report
```

Do not start M5.3.4 in this round.
