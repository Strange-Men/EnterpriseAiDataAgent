# Development Status

> Last updated: 2026-07-07

## Current Branch

- Branch: `m6-manual-fix-plan-docs`
- Stage: M6 manual-test fix planning docs

## Current Work

M6 manual-test fix planning docs are in progress as a documentation-only follow-up to M6.8 manual testing.

M6.8 has already been merged to `master`, and user manual testing surfaced 9 product and report usability issues. This branch only records the technical fix plan in Markdown. It does not implement Manual Fix 1, Manual Fix 2, or Manual Fix 3.

Completed:

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

## Boundaries

This branch does not:

- Start M6.9.
- Add new product functionality.
- Implement Manual Fix 1, Manual Fix 2, or Manual Fix 3.
- Change frontend code.
- Change backend code.
- Change tests.
- Change CI.
- Restore Sidebar.
- Restore five-tab navigation.
- Add Multi-Agent, LangGraph, or RAG.
- Create a tag.

## Next Step

Wait for user review of `docs/reports/m6-manual-fix-plan.md`. If approved, start Manual Fix 1 in a separate implementation prompt.
