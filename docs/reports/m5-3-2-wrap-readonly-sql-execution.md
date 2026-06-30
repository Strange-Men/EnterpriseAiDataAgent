# M5.3.2 Wrap Existing Readonly SQL Execution

## 1. Goal

Wrap existing readonly SQL validation / execution capability into Agent `ToolResult` semantics without changing existing backend services or routes.

M5.3.2 only adds an explicit real-path helper for readonly SQL execution. It does not connect SQL generation, LLM, summary, report, persistence, routes, or frontend.

## 2. Files Changed

- `backend/agent/pipeline_adapter.py`
- `backend/agent/tools.py`
- `tests/unit/test_agent_readonly_sql_wrapping.py`
- `docs/reports/m5-3-2-wrap-readonly-sql-execution.md`
- `CURRENT_SESSION.md`

## 3. Existing Functions Reviewed

- sql validator: `backend/services/sql_validator.py::validate_readonly`
- readonly executor factory: `backend/services/data_service.py::get_readonly_executor`
- query executor: `database/query_executor.py::QueryExecutor.execute`

M5.3.2 uses the existing readonly validator through the adapter. Tests use controlled fake executors, so this round does not touch real DuckDB data.

## 4. Mock vs Real Path

- The default tool registry still uses the deterministic mock `execute_readonly_sql`.
- Real path requires explicit call to `execute_readonly_sql_with_existing_executor` or `execute_readonly_sql_real_path`.
- `run_mock_agent` still uses the simulated mock path.
- `run_langchain_mock_agent` still uses the simulated mock path.
- The real path returns `is_simulated=false`.

## 5. Readonly Guardrail

The real-path wrapper first calls existing `validate_readonly`.

The adapter also rejects dangerous Agent tool SQL patterns so the real path does not weaken readonly behavior:

- `DROP`
- `DELETE`
- `UPDATE`
- `INSERT`
- `ALTER`
- `CREATE`
- `TRUNCATE`
- `MERGE`
- `REPLACE`
- `ATTACH`
- `DETACH`
- `COPY`
- `PRAGMA`
- multiple SQL statements

The extra adapter-level check does not modify existing validator behavior.

## 6. ToolResult Normalization

Completed:

- `ToolResult.status = completed`
- `tool_name = execute_readonly_sql`
- output includes `sql`, `row_count`, `columns`, `rows`, `summary`
- `is_simulated = false`
- evidence refs are attached

Rejected:

- unsafe SQL or invalid row limit returns `ToolResult.status = rejected`
- `error` is populated
- `is_simulated = false`

Failed:

- executor failures return `ToolResult.status = failed`
- `error` is populated
- unhandled executor exceptions do not escape the adapter

## 7. Tests

- readonly SQL wrapping tests: included in focused suite -> passed.
- M5.1 / M5.2 / M5.3.1 focused tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py tests/unit/test_agent_langchain_adapter.py tests/unit/test_agent_pipeline_adapter.py tests/unit/test_agent_readonly_sql_wrapping.py` -> 164 passed.
- backend import: `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 723 passed, 31 skipped.
- safety search: no credential, private-content, or forbidden personal-material patterns found.
- forbidden dependency search: no provider, network, LangGraph, LangSmith, `ai_pipeline`, or `ai_analyst` strings found in the Agent adapter/tools/test boundary.

## 8. What Was Not Changed

- SQL generation was not connected.
- Real LLM access was not connected.
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

## 9. Next Step

Wait for user review. After approval, enter:

```text
M5.3.3 Wrap Existing SQL Generation
```

Do not start M5.3.3 in this round.
