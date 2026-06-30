# M5.3.1 Pipeline Adapter Boundary

## 1. Goal

Create a safe Agent pipeline adapter boundary before wrapping existing AI pipeline functions as tools.

M5.3.1 is a boundary step only. It does not execute existing pipeline functions.

## 2. Files Changed

- `backend/agent/pipeline_adapter.py`
- `tests/unit/test_agent_pipeline_adapter.py`
- `docs/reports/m5-3-1-pipeline-adapter-boundary.md`
- `CURRENT_SESSION.md`

## 3. Boundary Scope

M5.3.1 defines:

- capability map
- symbol resolution
- mock/real path flags
- risk notes
- future wrapping boundary

M5.3.1 does not execute existing pipeline functions.

## 4. Capability Map

| Capability | Module Path | Symbol | Status | Can Wrap As Tool | Risk |
|---|---|---|---|---|---|
| `generate_sql` | `backend.services.ai_analyst` | `generate_sql` | available | true | provider fallback / SQL correctness / token usage |
| `validate_readonly_sql` | `backend.services.sql_validator` | `validate_readonly` | available | true | readonly guardrail cannot weaken |
| `execute_readonly_sql` | `backend.services.data_service` | `get_readonly_executor` | available | true | DB access / row limit / error normalization |
| `summarize_findings` | `backend.services.ai_analyst` | `explain_results` | available | true | provider fallback / evidence grounding |
| `build_report` | `backend.services.report_builder` | `build_report` | available | true | report contract normalization |
| `provider_fallback` | `backend.services.llm_runtime` | `summarize_llm_events` | available | false | metadata propagation |

## 5. Mock / Real Path

- `mock_path_supported = true`
- `real_path_supported = false` for M5.3.1
- `persistence_supported = false`
- `frontend_supported = false`

Real path starts in later M5.3 steps. M5.3.2 is the earliest planned step for readonly SQL execution wrapping.

## 6. Tests

- pipeline adapter tests: included in focused suite -> passed.
- M5.1 / M5.2 focused tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py tests/unit/test_agent_langchain_adapter.py tests/unit/test_agent_pipeline_adapter.py` -> 154 passed.
- backend import: `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 713 passed, 31 skipped.
- safety search: no credential, private-content, or forbidden personal-material patterns found.
- forbidden dependency search: no forbidden provider/network dependency strings found in adapter source or tests.
- real pipeline execution search: no real pipeline execution call patterns found in adapter source or tests.

## 7. What Was Not Changed

- Real pipeline was not executed.
- Backend services were not modified.
- Backend routes were not modified.
- `database/query_executor.py` was not modified.
- Real SQL execution was not connected.
- Real LLM access was not connected.
- Persistence was not implemented.
- FastAPI routes were not implemented.
- Frontend integration was not added.
- New dependencies were not installed.
- `requirements.txt` was not modified.
- No tag was created.

## 8. Next Step

Wait for user review. After approval, enter:

```text
M5.3.2 Wrap Existing Readonly SQL Execution
```

Do not start M5.3.2 in this round.
