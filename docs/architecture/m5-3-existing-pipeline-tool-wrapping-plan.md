# M5.3 Existing Pipeline Tool Wrapping Plan

## 1. Purpose

M5.3 connects the Agent foundation back to the existing EAI AI pipeline.

M5.1 / M5.2 proved contracts, router, mock tools, mock transcript, and optional LangChain harness. M5.3 must prevent the Agent from becoming an isolated mock demo.

M5.3 is not a rewrite. It should wrap existing SQL generation, readonly SQL execution, summary, and report capabilities behind Agent tool contracts while preserving existing endpoint behavior.

## 2. Current Agent Foundation

M5.1 completed the native Agent foundation:

- `AgentRun`, `AgentStep`, `ToolCall`, `ToolResult`, `EvidenceRef`, `IntentRoute`, and `AgentRunSummary`.
- Deterministic intent routing.
- Mock-safe tool registry with `inspect_schema`, `profile_table`, and mock `execute_readonly_sql`.
- Deterministic mock transcript generation.
- Foundation regression tests.

M5.2 added the optional LangChain harness:

- LangChain is optional.
- EAI native contracts remain the source of truth.
- Native mock runner remains usable.
- The adapter only wraps M5.1 mock-safe tools.

M5.3 must connect the Agent tool layer to existing business capabilities without changing the current API behavior.

## 3. Existing Capability Audit

| Capability | Existing File / Function | Current Behavior | Can Be Wrapped As Agent Tool? | Risk |
|---|---|---|---|---|
| Natural language analysis entry | `backend/routes/ai.py::ai_query`, `backend/services/ai_pipeline.py::run_ai_query` | Routes a question through SQL generation, optional execution, and optional explanation. Provider context is applied at the route layer. | Partial | Wrapping the whole pipeline would duplicate Agent orchestration. Split into smaller tools first. |
| SQL generation | `backend/services/ai_analyst.py::generate_sql`, `backend/utils/llm_sql.py::extract_sql_from_llm_output`, `backend/utils/llm_sql.py::validate_generated_sql` | Calls the configured LLM runtime, extracts SQL, validates generated SQL, and returns status, SQL, timing, model, and quality gates. | Yes, as core `generate_sql` | Provider metadata currently flows through `llm_runtime` context and route responses; the Agent tool must preserve it explicitly. |
| Deterministic SQL fallback | `backend/services/sql_templates.py::try_generate_sql`, used by `backend/services/ai_pipeline.py` | Produces template SQL for common aggregate/filter questions when LLM SQL is empty or invalid. | Partial | Useful as fallback inside `generate_sql`, but should not become a separate M5.3 tool unless needed. |
| Readonly SQL validation | `backend/services/sql_validator.py::validate_readonly`, `backend/utils/llm_sql.py::validate_generated_sql`, `database/query_executor.py::QueryExecutor._validate_readonly` | Blocks write-oriented and unsafe SQL before execution. Generated SQL also gets quality gates. | Yes, as shared guardrail for real `execute_readonly_sql` | M5.3 must not weaken this guardrail or replace it with the simpler M5.1 mock validator. |
| SQL execution | `backend/services/data_service.py::get_readonly_executor`, `database/query_executor.py::QueryExecutor.execute`, `backend/routes/query.py::execute_query`, `backend/services/ai_pipeline.py::_execute_step_sql` | Executes readonly SQL through DuckDB-backed executor and returns columns, rows, row count, status, and error. Query route records history. | Yes, as core real `execute_readonly_sql` path | Tool path must avoid route coupling and avoid accidental query-history side effects until Agent persistence is designed. |
| SQL explain | `database/query_executor.py::QueryExecutor.explain`, `backend/routes/query.py::explain_query` | Produces query plan for readonly SQL. | Future | Useful evidence source later, but not first M5.3 core tool. |
| Summary / explanation | `backend/services/ai_analyst.py::explain_results`, `backend/services/ai_analyst.py::generate_insights`, `backend/services/ai_pipeline.py::_build_executive_summary` | Produces explanation, insights, or executive summary from SQL results or executed steps through LLM runtime. | Yes, as core `summarize_findings` | Must normalize provider fallback, errors, and evidence into `ToolResult`; should not hide mock fallback. |
| Report building | `backend/services/report_builder.py::build_report`, `backend/routes/ai.py::generate_report` | Builds Markdown report from existing analysis-run dictionaries without calling LLM. | Yes, as core `build_report` | Agent transcript and evidence must be converted into the existing report input shape without changing report builder behavior. |
| Provider fallback / mock fallback | `backend/services/llm_runtime.py::run_with_llm_context`, `llm_context`, `call_llm_text`, `summarize_llm_events`; `backend/routes/ai.py::_run_with_provider` | Tracks requested provider, provider used, fallback trigger, and fallback reason; falls back to mock when configured. | Yes, as metadata source | Agent tools must copy provider metadata into `ToolCall` and `ToolResult`; mock results must remain visibly simulated. |
| Query history | `backend/services/query_history.py::QueryHistory`, `backend/routes/query.py::execute_query` | Stores SQL query history in memory and DuckDB from the route layer. | No for M5.3 core | Agent run history belongs to M5.4 persistence; M5.3 tools should not rely on query history as source of truth. |
| Table schema / preview | `backend/services/data_service.py::get_table_schema`, `get_table_preview`, `backend/routes/tables.py` | Reads table schema and preview rows from DuckDB-backed services. | Partial | Existing M5.1 mock `inspect_schema` can later get a real path, but M5.3 should prioritize SQL/summary/report tools. |
| Table profile | `backend/services/data_service.py::get_quality_report`, `backend/services/profiler.py::build_profile`, `backend/routes/analyze.py::get_profile` | Produces deterministic quality/profile data from table samples. | Partial | Useful future real `profile_table`; not required for first pipeline wrapping step. |
| Multi-step autonomous analysis | `backend/services/ai_pipeline.py::run_autonomous_analysis`, `run_autonomous_analysis_stream`, `backend/routes/ai.py::analyze_multi` | Plans, executes multiple SQL steps, and summarizes. | Future | This overlaps with Agent runner responsibilities. M5.3 should wrap smaller functions before considering this whole workflow. |
| Chart suggestion | `backend/services/ai_analyst.py::suggest_charts`, `backend/routes/ai.py::suggest_chart` | Suggests chart types from result data. | Future only | Not in M5.3 core; keep out until evidence, UI, and eval coverage are stable. |
| Anomaly detection | `backend/services/ai_analyst.py::detect_and_interpret_anomalies`, `backend/routes/ai.py::detect_anomalies` | Detects/interprets anomalies using existing route/service flow. | Future only | Not in M5.3 core; avoid reintroducing broad experimental scope. |

## 4. Wrapping Candidates

M5.3 core Agent tools:

- `generate_sql`
- real-path `execute_readonly_sql`
- `summarize_findings`
- `build_report`

Keep existing M5.1 mock tools:

- `inspect_schema`
- `profile_table`
- mock-path `execute_readonly_sql`

Future tools only:

- `detect_anomalies`
- `suggest_chart`
- `business_metric_lookup`
- `export_report`
- `explain_sql_plan`
- real-path `inspect_schema`
- real-path `profile_table`

Because M5.1 already has a mock `execute_readonly_sql`, M5.3 must design explicit mock and real paths instead of overwriting the deterministic mock behavior.

## 5. Integration Principles

1. Agent tools should wrap existing pipeline functions, not duplicate them.
2. Existing API behavior must not regress.
3. Mock path remains deterministic and testable.
4. Real pipeline path must preserve provider fallback metadata.
5. `ToolResult` remains the normalized EAI contract.
6. `ToolCall` must record `provider_used`, `is_simulated`, `token_usage_json`, and `evidence_json` where available.
7. Readonly SQL guardrails cannot be weakened.
8. Existing pipeline errors must normalize into `ToolResult` `failed` or `rejected`, not crash `AgentRun`.
9. M5.3 should not introduce frontend changes.
10. M5.3 should not introduce persistence yet.
11. LangChain remains optional and must not own EAI contracts or tool outputs.

## 6. Mock vs Real Tool Path

M5.3 must keep two clear execution paths:

- Mock path: deterministic M5.1 behavior, no database, no network, `is_simulated=true`.
- Real path: thin wrappers around existing SQL generation, readonly execution, summary, and report services.

The real path should return the same contract shape as the mock path:

- `ToolResult.status`
- `ToolResult.tool_name`
- `ToolResult.output_json`
- `ToolResult.evidence_refs` or `evidence_json`
- `ToolResult.duration_ms`
- `ToolResult.provider_used`
- `ToolResult.is_simulated`

Suggested design:

- Add a thin `backend/agent/pipeline_adapter.py` in M5.3.1.
- Keep existing `backend/services/*` behavior unchanged.
- Let `backend/agent/tools.py` call the adapter only after adapter tests prove the boundary.
- Use explicit tool input such as `execution_mode="mock" | "real"` or separate internal call path, but keep public tool names stable.

## 7. Error / Fallback Semantics

M5.3 tools should normalize existing errors into Agent semantics:

| Situation | ToolResult Status | Required Metadata |
|---|---|---|
| Generated SQL fails readonly validation | `rejected` | validation reason, SQL candidate, evidence note |
| SQL execution blocked by readonly executor | `rejected` | guardrail reason, SQL, no rows |
| SQL execution runtime error | `failed` | error message, duration, no crash |
| LLM provider unavailable and mock fallback used | `completed` or `partial` depending output | `provider_requested`, `provider_used="mock"`, `fallback_triggered=true`, `is_simulated=true` |
| LLM provider request fails without fallback | `failed` | provider requested, fallback metadata, normalized error |
| Report builder input cannot be normalized | `failed` | missing fields, no markdown report |

Tool failure should be visible in the Agent transcript. It must not be silently converted into a successful final report.

## 8. M5.3 Micro-Step Plan

| Step | Goal | Scope | Files Allowed | Acceptance |
|---|---|---|---|---|
| M5.3.1 | Pipeline Adapter Boundary | Add a thin adapter layer and tests without changing existing services or tool behavior. | `backend/agent/pipeline_adapter.py`, `tests/unit/test_agent_pipeline_adapter.py`, report | Adapter imports cleanly, exposes planned functions, no existing test regression. |
| M5.3.2 | Wrap Existing SQL Execution | Add real-path readonly SQL execution behind Agent tool boundary. | `backend/agent/tools.py`, `backend/agent/pipeline_adapter.py`, focused tests | Mock and real paths are separate; readonly guardrail remains enforced. |
| M5.3.3 | Wrap SQL Generation | Add `generate_sql` Agent tool using existing `ai_analyst.generate_sql` and LLM runtime metadata. | adapter/tools tests, no route changes | Tool returns normalized `ToolResult`; provider fallback metadata is preserved. |
| M5.3.4 | Wrap Summary / Report | Add `summarize_findings` and `build_report` tools using existing summary/report functions. | adapter/tools tests, report | Final report is evidence-based and normalized; no frontend/persistence change. |
| M5.3.5 | Pipeline Tool Regression | Run cross-module regression for M5.3 tools. | tests and validation report only unless clear bug fix is needed | Focused tests and full pytest pass; M5.3 ready for review. |

## 9. Files Boundary

Future M5.3 implementation may add:

- `backend/agent/pipeline_adapter.py`
- `tests/unit/test_agent_pipeline_adapter.py`
- `tests/unit/test_agent_pipeline_tools.py`
- `docs/reports/m5-3-1-pipeline-adapter-boundary.md`
- `docs/reports/m5-3-2-existing-sql-execution-tool.md`
- `docs/reports/m5-3-3-sql-generation-tool.md`
- `docs/reports/m5-3-4-summary-report-tools.md`
- `docs/reports/m5-3-5-pipeline-tool-regression.md`

M5.3.0 does not create these code files.

M5.3 implementation must not modify these areas without explicit approval:

- `backend/services/ai_pipeline.py`
- `backend/services/ai_analyst.py`
- `backend/routes/`
- `frontend-react/src/`
- dependency files
- Docker files

## 10. What M5.3 Does Not Do

- frontend UI
- persistence
- FastAPI route
- LangGraph
- RAG
- Multi-Agent
- real enterprise database connection beyond existing local DuckDB services
- broad rewrite
- provider smoke tests

## 11. Acceptance for Entering M5.3.1

M5.3.1 can start only after:

- this audit is reviewed;
- wrapping order is clear;
- existing function map is accepted;
- mock and real paths are understood;
- user explicitly approves M5.3.1 Pipeline Adapter Boundary.
