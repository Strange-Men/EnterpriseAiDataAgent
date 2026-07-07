# Development Status

> Last updated: 2026-07-07

## Current Branch

- Branch: `m6-manual-fix-1-default-state-async-upload`
- Stage: M6 Manual Fix 1 default state / async upload / session table state

## Current Work

M6 Manual Fix 1 is complete locally as an implementation follow-up to M6.8 manual testing.

Manual Fix 1 addresses the default product state and upload/session issues found during manual testing. It does not implement Manual Fix 2 or Manual Fix 3, does not add M6.9, and does not create a tag.

Completed:

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
- Implement Manual Fix 2.
- Implement Manual Fix 3.
- Change business report output contract.
- Change recommendation schema or report order.
- Change provider status/fallback transparency.
- Implement next-question click-to-fill.
- Restore Sidebar.
- Restore five-tab navigation.
- Add Multi-Agent, LangGraph, or RAG.
- Create a tag.

## Next Step

After Manual Fix 1 is merged back to `master`, the user can continue manual testing. If approved, the next stage is Manual Fix 2: business report output contract, recommendation validator, and report reorder.
