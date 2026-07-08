# Project Context

> Last updated: 2026-07-07

## Current Baseline

- App version: `1.4.1`
- Stable release tag: `v1.4.1-m4-engineering-complete`
- Current product state: M6 Business Analyst Agent is ready for renewed manual testing after Manual Fix 1 / 2 / 3, the manual regression hotfix, and the manual polish hotfix for report export, SQL Query numbering, and provider timeout handling.
- Current stage: M6 manual polish hotfix complete locally; merge back to `master` is pending in this round.

## M6 Direction

M6 is being planned as a Business Analyst Agent upgrade:

```text
understand question -> decompose metrics -> query evidence -> judge risk -> find opportunity -> recommend action -> support follow-up
```

M6.1 is documentation only. M6.2 adds the synthetic business demo dataset. M6.3 adds the backend Business Semantic Layer. M6.4 adds deterministic backend Business Analysis Tools. M6.5 connects the semantic layer and business tools into the LangChain Single Agent backend orchestration. M6.6 adapts the frontend single-page workbench to show the backend `business_report` as the default user-facing answer. M6.7 validates the integrated Business Analyst Agent capability with deterministic pressure tests. M6.8 prepares `master` for user manual testing. Manual Fix 1 repairs the manual-test issues around default dark state, async upload, clean homepage state, and session table recovery. Manual Fix 2 repairs business-report recommendation depth, validator safety, report ordering, and related-data folding.

## Important Boundary

Historical roadmap documents described M6 as Multi-Agent Expansion. The current user-approved M6 direction is Business Analyst Agent:

- M6.1 focuses on Business Analyst Agent architecture.
- M6.2 focuses on demoExcel / demo CSV redesign.
- M6.3 focuses on Business Semantic Layer.
- M6.4 focuses on Business Analysis Tools.
- M6.5 focuses on LangChain Agent orchestration enhancement.
- M6.6 focuses on Business Report frontend adaptation.
- M6.7 focuses on comprehensive business capability pressure testing.
- M6.8 focuses on Final QA / Manual Test Ready.
- M6 Manual Fix 1 focuses on default dark state, async upload, clean homepage state, and session table recovery.
- M6 Manual Fix 2 focuses on Business Report output contract, recommendation validation, report order, and technical data folding.
- M6 Manual Fix 3 focuses on provider transparency, fallback visibility, next-question click-to-fill interaction, and final regression.
- M6 manual regression hotfix focuses on making `demo_sales_business_50k` reliably available by default, diagnosing large upload timeout behavior, and validating five hard business questions against the default table.
- M6 manual polish hotfix focuses on Business Report Markdown/HTML export, Advanced SQL Query numbering normalization, and readable provider timeout/fallback behavior.
- M6.9, Multi-Agent, LangGraph, and RAG have not started.
- Any future Multi-Agent expansion must be separately reviewed and approved.

## Active Planning Docs

- `docs/reports/m6-business-analyst-agent-architecture.md`
- `docs/reports/m6-business-capability-research.md`
- `docs/reports/m6-demo-dataset-redesign-spec.md`
- `docs/reports/m6-pressure-test-plan.md`
- `docs/reports/m6-demo-business-dataset-redesign.md`
- `docs/reports/m6-demo-sales-business-schema-manifest.json`
- `docs/reports/m6-demo-sales-business-profile-summary.md`
- `docs/reports/m6-business-semantic-layer.md`
- `docs/reports/m6-business-analysis-tools.md`
- `docs/reports/m6-langchain-business-agent-orchestration.md`
- `docs/reports/m6-business-report-frontend-adaptation.md`
- `docs/reports/m6-business-capability-pressure-test.md`
- `docs/reports/m6-manual-test-guide.md`
- `docs/reports/m6-final-qa-manual-test-ready.md`
- `docs/reports/m6-manual-fix-plan.md`
- `docs/reports/m6-manual-fix-1-default-state-async-upload.md`
- `docs/reports/m6-manual-fix-2-business-report-readable.md`
- `docs/reports/m6-manual-fix-3-provider-next-question.md`
- `docs/reports/m6-manual-regression-default-table-upload-qa.md`
- `docs/reports/m6-manual-polish-export-query-provider-timeout.md`

## M6.2 Dataset

M6.2 adds a new synthetic enterprise business sales dataset:

- `testExcel/demo_sales_business_50k.csv`
- `testExcel/demo_sales_business_50k.xlsx`

The dataset supports Business Analyst Agent pressure-test scenarios such as business health, risk diagnosis, growth opportunity, region/category/channel/customer analysis, shipping efficiency, data quality and follow-up context.

## M6.5 Backend Orchestration

M6.5 adds backend Business Analyst Agent orchestration:

- business question classification
- structured analysis plan
- LangChain `StructuredTool` wrappers for M6.4 business tools
- multi-evidence business tool execution
- `business_report` backend response field
- compact memory summary for follow-up questions
- anti-hallucination field handling for unsupported fields such as ROI, membership level and fine-grained location
- CI fix: business orchestration now also fills the legacy-compatible `run.sql` field with deterministic SQL after schema inspection, so older Agent SQL regressions remain valid while `business_report` keeps technical details hidden.

M6.5 preserves the existing `answer`, `sql`, `evidence`, `warnings`, `trace`, and `tool_calls` fields for frontend compatibility. It does not change frontend UI.

## M6.6 Frontend Business Report Adaptation

M6.6 adapts the Astryx single-page workbench to render the backend `business_report` as the default Agent answer:

- executive summary
- key findings
- evidence summary
- risk priorities
- recommendations
- limitations
- next questions

Technical details remain hidden by default:

- SQL
- trace
- tool_calls
- provider
- run_id
- memory / memory_used
- raw JSON
- fallback reason

The old `answer` path remains compatible when `business_report` is missing or empty. The Sidebar and five-tab navigation were not restored.

## M6.7 Business Capability Pressure Test

M6.7 adds deterministic pressure tests for the 25-question plan in `docs/reports/m6-pressure-test-plan.md`:

- fixture: `tests/fixtures/m6_pressure_questions.json`
- tests: `tests/test_m6_business_capability_pressure.py`
- report: `docs/reports/m6-business-capability-pressure-test.md`

The test harness validates:

- Business Report structure
- multi-evidence behavior
- anti-hallucination field handling
- memory follow-up
- mock provider behavior
- controlled fallback behavior
- hidden SQL / trace / tool_calls / provider / run_id / memory in the user-facing report
- performance targets

M6.7 automated coverage is 25/25 pressure questions, with 25/25 scoring at least 8/10. M6.7 also fixed two pressure-test-discovered issues: fallback recommendations for evidence-backed questions without explicit risk/opportunity objects, and classification coverage for monitoring/KPI questions.

## M6.8 Manual Test Ready

M6.8 performs final QA and prepares `master` for user manual testing:

- M6.7 branch was merged into `master`, validated, and pushed.
- Backend import and M6 focused tests pass.
- Full backend CI command passes.
- Frontend dependency install, typecheck, tests, and build pass.
- Manual test guide is available at `docs/reports/m6-manual-test-guide.md`.
- Final QA report is available at `docs/reports/m6-final-qa-manual-test-ready.md`.

M6.8 did not add new product functionality and did not create a tag. If manual testing passes, the next user-approved step can be creating the M6 final tag.

## M6 Manual Fix Plan

Manual testing after M6.8 surfaced 9 issues around default product state, upload status, provider fallback transparency, report readability, recommendation depth, next-question interaction, and technical data exposure.

The documentation-only plan is available at `docs/reports/m6-manual-fix-plan.md`.

The proposed development order is:

1. Manual Fix 1: default dark state, async upload, session table state.
2. Manual Fix 2: business report output contract, recommendation validator, report reorder.
3. Manual Fix 3: provider transparency, next-question click-to-fill interaction, final regression.

No code implementation has started for these fixes. No tag has been created.

## M6 Manual Fix 1

Manual Fix 1 implements the first approved repair set from `docs/reports/m6-manual-fix-plan.md`:

- forces the Astryx workbench into dark-only mode and ignores old light-mode localStorage state;
- uses `demo_sales_business_50k` as the app default table;
- keeps the homepage clean by not restoring old answers into the main result area automatically;
- keeps history available only through the explicit History action;
- changes upload to an async task model with `task_id` and `GET /api/tasks/{task_id}/status`;
- stores upload task status in the existing DuckDB-backed persistence layer through an internal `__eai_upload_tasks` table;
- applies a 300-second running timeout fallback with a clear user-facing failure message;
- tracks `current_table` separately from the app default table through backend session state;
- adds `POST /api/session/clear` so reset clears backend memory/current table and returns to `demo_sales_business_50k`.

Manual Fix 1 does not change the business report output contract, recommendation schema, provider transparency contract, Doubao fallback logic, next-question chip behavior, or any M6.9 scope.

## M6 Manual Fix 2

Manual Fix 2 implements the second approved repair set from `docs/reports/m6-manual-fix-plan.md`:

- upgrades `business_report.recommendations` to a stable action-oriented contract with action, why, how, metrics, deadline, and owner hint;
- adds backend Recommendation Schema Validator in `backend/agent/contracts.py`;
- ensures malformed, empty, string, or legacy recommendations never crash the frontend and never produce an empty recommendation list;
- keeps old recommendation fields for compatibility while making the new fields the primary path;
- removes tool names, raw rows, and technical evidence objects from main `business_report.evidence_summary`;
- reorders the frontend report to show overall judgment and priority actions before evidence;
- renders business recommendation cards for non-technical users;
- moves related data preview into collapsed Technical details / Data evidence.

Manual Fix 2 does not change provider status transparency, Doubao fallback investigation, next-question click-to-fill behavior, async upload, or any M6.9 scope.

## M6 Manual Fix 3

Manual Fix 3 implements the third approved repair set from `docs/reports/m6-manual-fix-plan.md`:

- adds a backend provider status contract with `live_success`, `mock`, `fallback`, and `error`;
- returns `requested_provider`, `provider_status`, `provider_used`, `fallback_reason`, and `is_simulated` in Agent responses;
- keeps provider metadata out of the user-facing `business_report`;
- sanitizes fallback reasons so exception stacks and local paths are not exposed to users;
- shows frontend provider banners for demo mode, fallback simulation, and explicit error states;
- prevents fallback output from being presented as a real Doubao result;
- makes `business_report.next_questions` chips clickable so they fill and focus the input without auto-submitting;
- disables next-question chips while a request is submitting;
- preserves Manual Fix 2 report order and recommendation card structure.

Manual Fix 3 does not change Manual Fix 1 upload/session behavior, does not change Manual Fix 2 recommendation contract, does not add M6.9, and does not create a tag.

## Next Stage

After Manual Fix 3 is merged back to `master`, the next step is renewed manual testing. If manual testing passes, creating the M6 final tag should be a separate user-approved step.
