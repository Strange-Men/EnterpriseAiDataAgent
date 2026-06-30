# M5.3.0 Existing Pipeline Tool Wrapping Audit / Plan

## 1. Goal

Audit existing AI pipeline / SQL execution / summary / report capabilities before wrapping them into Agent tools.

M5.3.0 is audit and planning only. It does not implement pipeline wrapping.

## 2. Source of Truth

- `docs/architecture/m5-m6-agent-roadmap.md`
- `docs/architecture/m5-agent-design.md`
- `docs/architecture/m5-3-existing-pipeline-tool-wrapping-plan.md`
- `docs/reports/m5-1-foundation-merge-validation.md`
- `docs/reports/m5-2-2-langchain-harness-merge-validation.md`

## 3. Existing Capability Audit

Audited existing Agent foundation:

- `backend/agent/contracts.py`
- `backend/agent/router.py`
- `backend/agent/tools.py`
- `backend/agent/mock_runner.py`
- `backend/agent/langchain_adapter.py`

Audited existing business pipeline and service files:

- `backend/services/ai_pipeline.py`
- `backend/services/ai_analyst.py`
- `backend/services/llm_runtime.py`
- `backend/services/sql_validator.py`
- `backend/services/sql_templates.py`
- `backend/services/data_service.py`
- `backend/services/query_history.py`
- `backend/services/report_builder.py`
- `backend/services/profiler.py`
- `database/query_executor.py`
- `backend/routes/ai.py`
- `backend/routes/query.py`
- `backend/routes/analyze.py`

Key findings:

| Capability | Existing Location | M5.3 Decision |
|---|---|---|
| SQL generation | `backend/services/ai_analyst.py::generate_sql`, `backend/utils/llm_sql.py` | Wrap as core `generate_sql` Agent tool. |
| Readonly SQL validation | `backend/services/sql_validator.py::validate_readonly`, `database/query_executor.py::QueryExecutor._validate_readonly` | Reuse as mandatory guardrail; do not weaken. |
| SQL execution | `backend/services/data_service.py::get_readonly_executor`, `database/query_executor.py::QueryExecutor.execute`, `backend/services/ai_pipeline.py::_execute_step_sql` | Wrap as real-path `execute_readonly_sql`; keep mock path separate. |
| Summary / explanation | `backend/services/ai_analyst.py::explain_results`, `generate_insights`, `backend/services/ai_pipeline.py::_build_executive_summary` | Wrap as `summarize_findings` after SQL tools are stable. |
| Report building | `backend/services/report_builder.py::build_report`, `backend/routes/ai.py::generate_report` | Wrap as `build_report` by converting Agent transcript/evidence to report input. |
| Provider fallback | `backend/services/llm_runtime.py::run_with_llm_context`, `summarize_llm_events`, `call_llm_text` | Preserve metadata in `ToolCall` / `ToolResult`. |
| Query history | `backend/services/query_history.py`, `backend/routes/query.py` | Do not use as Agent run source of truth in M5.3; persistence is M5.4. |
| Schema/profile | `backend/services/data_service.py`, `backend/services/profiler.py`, `backend/routes/analyze.py` | Keep M5.1 mock tools; real schema/profile can be future work. |

## 4. Wrapping Decision

M5.3 core Agent tools:

- `generate_sql`
- real-path `execute_readonly_sql`
- `summarize_findings`
- `build_report`

Keep existing M5.1 mock tools:

- `inspect_schema`
- `profile_table`
- mock-path `execute_readonly_sql`

Future tools:

- `detect_anomalies`
- `suggest_chart`
- `business_metric_lookup`
- `export_report`
- `explain_sql_plan`

M5.3 should add real paths without deleting or weakening deterministic mock paths.

## 5. Risk Findings

- Duplicate logic risk: copying `ai_pipeline.py` logic into Agent tools would create two behavior sources.
- Mock / real path confusion: `execute_readonly_sql` already exists as a mock tool, so real execution must be explicit and test-covered.
- Provider fallback metadata risk: current provider metadata is summarized by `llm_runtime`; Agent tools must carry it into `ToolCall` / `ToolResult`.
- Readonly SQL guardrail risk: M5.1 mock validation is intentionally minimal; M5.3 real path must reuse the existing production guardrail.
- Existing API regression risk: M5.3 must not change `/ai/*` or `/query/*` route behavior.
- History confusion risk: SQL query history is not Agent run persistence.

## 6. M5.3 Micro-Step Plan

| Step | Goal | Acceptance |
|---|---|---|
| M5.3.1 | Pipeline Adapter Boundary | Add thin adapter file and tests; no service/route behavior changes. |
| M5.3.2 | Wrap Existing SQL Execution | Real `execute_readonly_sql` path works with existing readonly executor; mock path remains deterministic. |
| M5.3.3 | Wrap SQL Generation | Existing SQL generation returns normalized `ToolResult` with fallback metadata. |
| M5.3.4 | Wrap Summary / Report | Existing summary and report functions return evidence-based Agent tool outputs. |
| M5.3.5 | Pipeline Tool Regression | Focused and full tests pass; no API regression. |

## 7. Validation Results

- backend import: `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`.
- focused Agent tests: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py tests/unit/test_agent_foundation_regression.py tests/unit/test_agent_langchain_adapter.py` -> 145 passed.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 704 passed, 31 skipped.
- safety search: no credential, private-content, or forbidden personal-material patterns found.

## 8. What Was Not Changed

- Pipeline wrapping was not implemented.
- Existing AI pipeline behavior was not modified.
- Real LLM access was not added.
- Real DuckDB access was not added through Agent tools.
- Persistence was not implemented.
- FastAPI routes were not implemented.
- Frontend integration was not added.
- New dependencies were not installed.
- `requirements.txt` was not modified.
- No tag was created.

## 9. Next Step

Wait for user review. After approval, enter:

```text
M5.3.1 Pipeline Adapter Boundary
```

Do not start M5.3.1 in this round.
