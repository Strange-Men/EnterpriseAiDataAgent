# Development Status

> Last updated: 2026-07-07

## Current Branch

- Branch: `m6-manual-regression-default-table-upload-qa`
- Stage: M6 manual regression hotfix for default table, upload timeout diagnosis, and hard-question QA

## Current Work

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
