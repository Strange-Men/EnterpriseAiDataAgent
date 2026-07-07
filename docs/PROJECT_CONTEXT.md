# Project Context

> Last updated: 2026-07-07

## Current Baseline

- App version: `1.4.1`
- Stable release tag: `v1.4.1-m4-engineering-complete`
- Current product state: M5 Agent main path is runnable after the final Astryx UX simplification and Doubao provider QA.
- Current stage: M6 manual-test fix planning docs.

## M6 Direction

M6 is being planned as a Business Analyst Agent upgrade:

```text
understand question -> decompose metrics -> query evidence -> judge risk -> find opportunity -> recommend action -> support follow-up
```

M6.1 is documentation only. M6.2 adds the synthetic business demo dataset. M6.3 adds the backend Business Semantic Layer. M6.4 adds deterministic backend Business Analysis Tools. M6.5 connects the semantic layer and business tools into the LangChain Single Agent backend orchestration. M6.6 adapts the frontend single-page workbench to show the backend `business_report` as the default user-facing answer. M6.7 validates the integrated Business Analyst Agent capability with deterministic pressure tests. M6.8 prepares `master` for user manual testing. The current documentation-only follow-up captures manual-test fixes before implementation.

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
- M6 Manual Fix planning focuses on documenting user manual-test issues and the proposed Fix 1 / Fix 2 / Fix 3 sequence.
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

## Next Stage

The next step is user review of the Manual Fix plan. If approved, Manual Fix 1 should start in a separate implementation prompt.
