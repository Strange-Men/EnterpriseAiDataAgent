# Development Status

> Last updated: 2026-07-08

## Current Branch

- Branch: `m6-agent-output-strategy-plan-docs`
- Stage: M6 Agent output strategy refactor plan docs

## Current Work

M6 Agent output strategy refactor planning is documented. This is a documentation-only round, not M6.9, and no tag has been created.

Completed in this documentation round:

- Added `docs/reports/m6-agent-output-strategy-refactor-plan.md`.
- Recorded the latest 6 manual-test issues around SQL editor layout, overly technical growth-opportunity output, ranking questions being forced into health-diagnosis reports, template-dependent success, mixed English output, and LangChain / LangGraph architecture review.
- Locked the core diagnosis: the Agent still does not reliably "answer what was asked"; it overuses the Business Health Report template.
- Proposed the next development order:
  1. SQL UI Layout Hotfix.
  2. BusinessReportViewModel + locale + export infrastructure.
  3. Backend Intent Router + `data_table` output.
  4. LangChain compliance audit + LangGraph future integration plan.
- No frontend code, backend code, tests, CI workflow, README, M6.9, or tag change was made.

Next step after user review: start with `m6-polish-sql-editor-layout` as a separate implementation prompt.

M6 backend CI fix is complete locally. This is not a new feature round, not M6.9, and no tag has been created.

Completed in this CI fix:

- Inspected GitHub Actions run `28917188098` for commit `de4e777bd5d6e2acd79f2c7249b1e35e0f5250c4`.
- Confirmed backend job failed while frontend passed.
- Identified the failure as an environment-dependent Doubao fallback assertion in `tests/test_m6_manual_fix3_provider_status.py`.
- Reworked the Doubao fallback transparency tests to use monkeypatched fake provider metadata, so default CI never performs a real Doubao network call and does not depend on whether env keys exist.
- Preserved provider status, fallback transparency, business_report hiding, and trace metadata coverage.
- Added `docs/reports/m6-ci-fix-backend-after-polish-regression.md`.
- Backend import, target tests, focused M6 backend regressions, and full backend CI passed locally.
- Next step is to wait for GitHub Actions to rerun green; after CI is green, resume manual testing from `master`.

M6 manual polish regression is complete locally. This is not M6.9 and no tag has been created.

Completed in this hotfix:

- Fixed the Advanced SQL editor regression after Query numbering normalization:
  - Stable visible SQL editor area.
  - AI-generated SQL writes into the active Query.
  - Query switching preserves SQL content.
  - Query add/delete numbering normalization remains intact.
- Fixed English-mode Business Report parity:
  - English business-report creation no longer routes to unsafe SQL or legacy report lookup.
  - English reports use the new Manual Fix 2 section order and recommendation structure.
  - Bare `unsupported` is not shown in the English business-report path.
- Diagnosed Doubao live LLM path:
  - Doubao key/base URL/model are detected without exposing the key.
  - Minimal prompt and Agent smoke both fall back due to a network/TLS style provider failure.
  - Fallback remains transparent with readable user-facing reason.
- Improved exported Markdown / HTML quality:
  - Removed system-log style evidence from export.
  - Removed raw JSON, SQL, trace, tool calls, dynamic P90, Top/Bottom evidence, and internal scoring language.
  - Deduplicated recommendations and limited export to the top 3 priority actions.
- Added regression tests for backend routing/provider diagnosis, frontend SQL editor behavior, and export cleanup.
- Added `docs/reports/m6-manual-polish-regression-sql-i18n-doubao-export.md`.
- Backend import, focused regressions, full backend CI, frontend install, typecheck, tests, and build passed locally.
- Next step remains renewed manual testing from `master`; if manual testing passes, the next user-approved step can be an M6 final tag.

M6 manual polish hotfix is complete locally. This is not M6.9 and no tag has been created.

Completed in this hotfix:

- Added Business Report Markdown export with a fixed report template.
- Added lightweight Business Report HTML export using the same structure.
- Kept SQL, trace, tool calls, raw JSON, run id, and memory out of exported reports.
- Added `frontend-react/src/utils/business-report-export.ts`.
- Added export buttons to the Business Report result card.
- Fixed Advanced SQL default Query numbering and persisted-state normalization.
- Added `LLM_CONNECT_TIMEOUT_SECONDS`, changed default request timeout to 60s, and centralized provider timeout handling.
- Added limited retry for timeout / 429 / 5xx and avoided retry for 401 / 403.
- Converted provider fallback reasons from internal codes into readable user-facing messages.
- Ran three default-table business questions against `demo_sales_business_50k`; Q3 passed anti-hallucination for missing ad creative / ROI fields.
- Added `tests/test_m6_manual_polish_export_query_provider.py` and updated frontend Business Report / SQL store tests.
- Added `docs/reports/m6-manual-polish-export-query-provider-timeout.md`.
- Backend import, focused regressions, full backend CI, frontend install, typecheck, tests, and build passed locally.
- Next step remains renewed manual testing from `master`; if manual testing passes, the next user-approved step can be an M6 final tag.

M6 manual regression hotfix is complete locally. This is not M6.9 and no tag has been created.

Completed in this hotfix:

- Started from latest `master` and created `m6-manual-regression-default-table-upload-qa`.
- Fixed the first-load default demo table path so `demo_sales_business_50k` is guaranteed by backend table/session endpoints and can be displayed by the frontend even if the table list is stale.
- Added session metadata for current/default table existence, row count, and column count.
- Replaced the default empty upload-first wording with a clearer default-demo-unavailable error for developer diagnosis.
- Diagnosed large upload `signal timed out` as a frontend request-timeout/state-machine issue on the initial upload request, plus a stale final task-state normalization gap.
- Added per-request upload timeout support, longer initial upload timeout, transient polling retry behavior, and backend normalization for `stage=done` / `progress=100` tasks.
- Added `tests/test_m6_manual_regression_default_table_upload_qa.py`.
- Ran five hard business questions against `demo_sales_business_50k`; all passed, including the membership-level anti-hallucination case.
- Added `docs/reports/m6-manual-regression-default-table-upload-qa.md`.
- Backend import, hotfix tests, Manual Fix 1 / 2 / 3 regressions, M6.7/M6.5 regressions, full backend CI, frontend install, typecheck, tests, and build passed locally.
- Next step remains renewed manual testing from `master`; if manual testing passes, the next user-approved step can be an M6 final tag.

M6 Manual Fix 3 is complete locally as an implementation follow-up to M6.8 manual testing.

Manual Fix 3 addresses provider transparency and next-question interaction issues found during manual testing. It adds explicit backend provider status, shows frontend Mock/Fallback/Error state clearly, and lets users click next-question chips to fill the input without auto-submitting. It does not add M6.9 and does not create a tag.

Completed:

- Confirmed latest master CI passed before starting Fix 3.
- Created implementation branch `m6-manual-fix-3-provider-next-question`.
- Added product-level provider status fields: `requested_provider`, `provider_status`, `provider_used`, `fallback_reason`, and `is_simulated`.
- Added provider states: `live_success`, `mock`, `fallback`, and `error`.
- Sanitized fallback reasons so frontend users see readable failure reasons instead of exception stacks or local paths.
- Updated frontend provider banners for live success, demo mode, fallback simulation, and explicit error states.
- Added click-to-fill next-question chips that scroll and focus the input without auto-submitting.
- Kept next-question chips disabled while an analysis request is submitting.
- Preserved Manual Fix 2 report order and recommendation contract.
- Added `tests/test_m6_manual_fix3_provider_status.py`.
- Updated frontend Business Report tests for provider banners and next-question interaction.
- Added `docs/reports/m6-manual-fix-3-provider-next-question.md`.
- Backend import, Fix 3 tests, Fix 2/Fix 1/M6 focused regression, full backend CI, frontend install, typecheck, full Vitest, and Next build passed locally.
- Confirmed latest master CI passed before starting Fix 2.
- Created implementation branch `m6-manual-fix-2-business-report-readable`.
- Added `BusinessRecommendation`, `DEFAULT_RECOMMENDATION`, and `validate_business_recommendations()` in `backend/agent/contracts.py`.
- Updated `backend/business_tools/recommendation_tools.py` and `backend/business_tools/models.py` so business recommendations include action, why, how, metrics, deadline, and owner hint while retaining legacy compatibility fields.
- Updated `backend/agent/business_orchestration.py` so `business_report.recommendations` is normalized through the validator, evidence summaries avoid tool names/raw rows, and rendered answers say "priority actions" instead of technical recommendation fragments.
- Updated `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx` to render priority action cards before risks, findings, and evidence.
- Moved related data preview into collapsed Technical details / Data evidence.
- Added/updated tests for recommendation contract and frontend report order/legacy compatibility.
- Added `docs/reports/m6-manual-fix-2-business-report-readable.md`.
- Backend import, Fix 2 tests, M6 focused regression, full backend CI, frontend install, typecheck, full Vitest, and Next build passed locally.
- Merged `origin/m6-manual-fix-plan-docs` into `master` and pushed `master`.
- Created implementation branch `m6-manual-fix-1-default-state-async-upload`.
- Forced dark-only frontend behavior and removed the Astryx light-mode entry from Settings.
- Changed default table recovery to `demo_sales_business_50k`.
- Added backend session table state for `current_table`.
- Added async upload task state stored in the existing DuckDB database through internal `__eai_*` tables.
- Added `POST /api/upload` task creation and `GET /api/tasks/{task_id}/status` polling.
- Added `POST /api/session/clear` and frontend reset session integration.
- Kept the homepage clean by not automatically loading old analysis records into the main answer area.
- Kept history available only through the user-opened History drawer.
- Added Manual Fix 1 tests and report.
- Created `docs/reports/m6-business-analyst-agent-architecture.md`.
- Created `docs/reports/m6-business-capability-research.md`.
- Created `docs/reports/m6-demo-dataset-redesign-spec.md`.
- Created `docs/reports/m6-pressure-test-plan.md`.
- Updated session and project context docs.
- Generated `testExcel/demo_sales_business_50k.csv`.
- Generated `testExcel/demo_sales_business_50k.xlsx`.
- Added `scripts/generate_demo_sales_business_dataset.py`.
- Added schema manifest and profile summary reports.
- Added M6.2 completion report.
- Added lightweight generator tests.
- Added `backend/semantic/` field dictionary, business term mapping, metric definitions, thresholds, dynamic threshold helper, missing-field fallback, and analysis templates.
- Added `tests/test_m6_business_semantic_layer.py`.
- Added `docs/reports/m6-business-semantic-layer.md`.
- Merged M6.3 Business Semantic Layer into master.
- Added `backend/business_tools/` typed business analysis tools.
- Added `tests/test_m6_business_analysis_tools.py`.
- Added `docs/reports/m6-business-analysis-tools.md`.
- Merged M6.4 Business Analysis Tools into master.
- Added `backend/agent/business_orchestration.py`.
- Registered / wrapped M6.4 business tools as LangChain `StructuredTool` entries.
- Added `business_report` to the backend AgentRun response contract.
- Added multi-evidence business orchestration, anti-hallucination field handling, and compact memory summary support.
- Added `tests/test_m6_langchain_business_agent_orchestration.py`.
- Added `docs/reports/m6-langchain-business-agent-orchestration.md`.
- Added M6.5 CI Fix notes to `docs/reports/m6-langchain-business-agent-orchestration.md`.
- Full backend CI command passed locally: `python -m pytest tests/ -x -q --ignore=tests/ai` -> `852 passed`.
- Merged M6.5 LangChain Business Agent orchestration into master.
- Added frontend `business_report` API and workbench record types.
- Updated `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx` to render Business Report by default.
- Added a collapsed Technical Details section for SQL, trace, tool_calls, provider, run_id, memory, raw JSON, and fallback reason.
- Added `frontend-react/src/components/astryx/__tests__/business-report-view.test.tsx`.
- Added `docs/reports/m6-business-report-frontend-adaptation.md`.
- Frontend CI commands passed locally: `npm ci`, `npx tsc --noEmit`, `npm run test`, `npm run build`.
- Merged M6.6 Business Report frontend adaptation into master.
- Added `tests/fixtures/m6_pressure_questions.json` covering all 25 M6 pressure questions.
- Added `tests/test_m6_business_capability_pressure.py`.
- Added `docs/reports/m6-business-capability-pressure-test.md`.
- Fixed M6.7-discovered gaps in fallback recommendations and monitoring/KPI question classification.
- M6.7 pressure tests passed locally: `7 passed`.
- Full backend CI command passed locally: `python -m pytest tests/ -x -q --ignore=tests/ai` -> `859 passed`.
- Frontend CI commands passed locally: `npm ci`, `npx tsc --noEmit`, `npm run test`, `npm run build`.
- Merged M6.7 Business Capability Pressure Tests into master.
- Added `docs/reports/m6-manual-test-guide.md`.
- Added `docs/reports/m6-final-qa-manual-test-ready.md`.
- M6.8 Final QA passed locally: backend import, M6 focused tests, full backend CI, frontend install, typecheck, tests, and build.
- Added `docs/reports/m6-manual-fix-plan.md` as a documentation-only plan for Manual Fix 1 / 2 / 3.
- Added `docs/reports/m6-manual-fix-1-default-state-async-upload.md`.
- Full backend CI command passed locally: `python -m pytest tests/ -x -q --ignore=tests/ai` -> `865 passed`.
- Frontend CI commands passed locally: `npm ci`, `npx tsc --noEmit`, `npm run test` -> `50 files / 1183 tests`, and `npm run build`.

## Boundaries

This branch does not:

- Start M6.9.
- Rework Manual Fix 1 upload/session behavior.
- Rework Manual Fix 2 recommendation contract or report order.
- Change async upload task logic.
- Restore Sidebar.
- Restore five-tab navigation.
- Add Multi-Agent, LangGraph, or RAG.
- Create a tag.

## Next Step

After Manual Fix 3 is merged back to `master`, the next step is renewed manual testing. If manual testing passes, the M6 final tag should only be created after explicit user approval.
