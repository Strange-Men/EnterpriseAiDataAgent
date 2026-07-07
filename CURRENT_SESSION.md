# Current Session — Enterprise AI Data Agent

> Last updated: 2026-07-07

## M6.5 LangChain Business Agent Orchestration

- M6.5 LangChain Agent orchestration enhancement completed on branch `m6-langchain-business-agent-orchestration`.
- M6.5 backend CI fix completed after GitHub Actions run `28801709028` failed on the backend job.
- CI failure root cause: the M6.5 business orchestration path generated `business_report` for a regional sales ranking question but left the legacy-compatible `run.sql` field empty; the old regression expected deterministic region sales SQL.
- Fix: business orchestration now fills `context["sql"]` with the existing schema-aware `_deterministic_sql()` output after schema inspection. `business_report` still hides SQL, trace, tool calls, provider, run id and memory.
- Before M6.5, `origin/m6-business-analysis-tools` was merged into `master`, validated, and pushed.
- Added `backend/agent/business_orchestration.py` for business question classification, analysis plan generation, Business Report assembly, anti-hallucination field handling, and compact memory summaries.
- Wrapped and registered M6.4 business analysis tools as LangChain `StructuredTool` entries in the existing Single Agent backend loop.
- Extended `AgentRun` with a backward-compatible `business_report` field while preserving `answer`, `sql`, `evidence`, `warnings`, `trace`, and `tool_calls`.
- Added focused tests in `tests/test_m6_langchain_business_agent_orchestration.py`.
- Added M6.5 report at `docs/reports/m6-langchain-business-agent-orchestration.md`.
- Backend import, M6.5 orchestration tests, M6.4 business tools tests, M6.3 semantic layer tests, M6.2 demo dataset tests, and existing LangChain Single Agent regression passed.
- Full backend CI command `python -m pytest tests/ -x -q --ignore=tests/ai` passed locally with `852 passed`.
- M6.6 Business Report frontend adaptation has not started. M6.7/M6.8 have not started. Frontend UI was not changed. Multi-Agent, LangGraph, and RAG were not added. Tag has not been created.

## M6.4 Business Analysis Tools

- M6.4 Business Analysis Tools completed on branch `m6-business-analysis-tools`.
- Before M6.4, `origin/m6-business-semantic-layer` was merged into `master`, validated, and pushed.
- Added `backend/business_tools/` with typed models, read-only table loading helpers, KPI tools, dimension tools, trend tools, risk tools, opportunity tools, quality tools, and recommendation tools.
- Added focused tests in `tests/test_m6_business_analysis_tools.py`.
- Added M6.4 report at `docs/reports/m6-business-analysis-tools.md`.
- Backend import, M6.4 business tools tests, M6.3 semantic layer tests, and M6.2 demo dataset tests passed.
- M6.5 LangChain Agent orchestration enhancement has not started. M6.6/M6.7/M6.8 have not started. Frontend UI and Agent run flow were not changed. Tag has not been created.

## M6.3 Business Semantic Layer

- M6.3 Business Semantic Layer completed on branch `m6-business-semantic-layer`.
- Before M6.3, `origin/m6-business-analyst-agent-architecture-docs` and `origin/m6-demo-business-dataset-redesign` were merged into `master`, validated, and pushed.
- Added `backend/semantic/` with field dictionary, business term mapping, metric definitions, default thresholds, dynamic quantile thresholds, missing-field fallback, and analysis templates.
- Added focused tests in `tests/test_m6_business_semantic_layer.py`.
- Added M6.3 report at `docs/reports/m6-business-semantic-layer.md`.
- Backend import, semantic layer tests, and demo dataset tests passed.
- M6.4 Business Analysis Tools has not started. M6.5/M6.6/M6.7/M6.8 have not started. Frontend UI and Agent orchestration were not changed. Tag has not been created.

## M6 Business Analyst Agent Architecture Docs

- M6.1 planning documentation prepared on branch `m6-business-analyst-agent-architecture-docs`.
- This round only documents the M6 Business Analyst Agent architecture; no frontend source, backend source, demoExcel, CSV, XLSX, tag, or master merge work was done.
- M6 direction is calibrated from plain Text-to-SQL toward a Business Analyst Agent: understand question -> decompose metrics -> query evidence -> judge risks/opportunities -> propose actions -> support follow-up.
- Added main report: `docs/reports/m6-business-analyst-agent-architecture.md`.
- Added research report: `docs/reports/m6-business-capability-research.md`.
- Added demo dataset redesign spec: `docs/reports/m6-demo-dataset-redesign-spec.md`.
- Added pressure test plan: `docs/reports/m6-pressure-test-plan.md`.
- Updated `docs/DEV_STATUS.md` and `docs/PROJECT_CONTEXT.md`.
- M6 implementation has not started. Multi-Agent, LangGraph, and RAG have not started. Tag has not been created.

## M6.2 Demo Business Dataset Redesign

- M6.2 demoExcel redesign completed on branch `m6-demo-business-dataset-redesign`.
- Generated `testExcel/demo_sales_business_50k.csv` and `testExcel/demo_sales_business_50k.xlsx` with 50,000 rows and 28 required fields.
- Added reusable generator script at `scripts/generate_demo_sales_business_dataset.py` using faker + conditional logic with seed `20260706`.
- Added schema manifest at `docs/reports/m6-demo-sales-business-schema-manifest.json`.
- Added profile summary at `docs/reports/m6-demo-sales-business-profile-summary.md`.
- Added M6.2 report at `docs/reports/m6-demo-business-dataset-redesign.md`.
- Added lightweight generator tests in `tests/test_m6_demo_business_dataset.py`.
- CSV/XLSX consistency, required fields, order id uniqueness, anomaly ratios, upload/schema/profile verification, backend import and focused tests passed.
- M6.3 Business Semantic Layer has not started. M6.4/M6.5 have not started. No frontend/backend Agent implementation was changed. Tag has not been created.

## M5 Render Doubao Real LLM Agent QA

- M5 Render Doubao Real LLM Agent QA completed on branch `m5-render-doubao-real-llm-agent-qa` and merged to master.
- Render `/api/status` and `/api/ai/status` were reachable. `/api/ai/insights` with `llm_provider=doubao` proved Render can read Doubao env and return `provider_used=doubao`, `fallback_triggered=false`.
- Remote `/api/agent/runs` produced readable real-model-quality answers, SQL, evidence, warnings, trace, and tool_calls, but deployed Agent metadata still reported `provider_used=mock` and fallback.
- A minimal backend fix now lets successful tool-level real-provider metadata override the initial mock fallback marker in the final AgentRun.
- Speed/output QA continuation added schema-aware SQL fast paths, run-scope profile cache, 20-row evidence limits, LLM call counting, and controlled invalid-SQL execution fallback.
- Local true-provider stress improved from the Render baseline average `24.760s` to `17.054s`, with `provider_used=doubao`, `fallback_triggered=false`, and no 500s after the fix.
- Backend import, focused tests, full pytest, frontend tests/build, changed-file ruff, safety search, master CI, and post-deploy Render Agent route re-smoke passed.
- M5 Final Tag is recommended after user review.
- M6 has not started. Tag has not been created.

## M5 Final Global QA Regression Merge Validation

- M5 Final Global QA Regression merged to master.
- Merge validation confirmed backend import, full pytest with `PYTHONPATH=.`, frontend tests, frontend build, Docker Compose config, Agent API smoke, and safety search.
- Master CI is checked after push. Render Doubao Real Provider QA is recommended next if CI passes.
- M6 has not started. Tag has not been created.

## M5 Final Global QA Regression

- M5 Final Global QA Regression completed on branch `m5-final-global-qa-regression`.
- M1-M5 core flow was validated: upload CSV/Excel, create DuckDB tables, inspect schema, preview data, run LangChain Single Agent analysis, call tools, use mock/provider fallback, read/write memory, and return answer / SQL / evidence / warnings / trace / tool_calls.
- Necessary small fixes were made for refund amount SQL generation and controlled unknown-field handling.
- Backend import, full pytest, changed-file ruff, API smoke, frontend tests, frontend build, frontend HTTP page checks, docker compose config, old-copy search, and safety search were completed.
- Full-repo ruff still has historical/legacy issues; changed files pass. Local Playwright browser launch was unavailable because the browser binary is not installed, so page checks used the local dev server HTTP routes.
- M5 Final Global QA Merge Validation is recommended next. M6 has not started. Tag has not been created.

## M5.5.7 Final Regression / Seal Candidate

- M5.5.7 Final Regression / Seal Candidate completed on branch `m5-5-7-final-regression-seal-candidate`.
- M5 main path is validated: Upload Excel/CSV -> Agent Analysis -> business result, with LangChain Single Agent tools, provider selection, mock fallback, SQL, evidence, warnings, trace, and folded technical details.
- Backend import, full pytest, frontend tests, frontend build, Agent API smoke, source safety search, and browser visual checks passed.
- M5.5.7 Final Regression / Seal Candidate merged to master and merge validation prepared.
- M5 Final Tag is the recommended next step after master CI passes. M6 has not started. Tag has not been created.

## M5.5.6.1 Frontend UX Hard Simplification

- M5.5.6.1 Frontend UX Hard Simplification completed.
- Frontend now prioritizes business-user flow: Upload Data -> Agent Analysis -> Results.
- Primary navigation is Upload Data / Agent Analysis / Results / History / Settings.
- Technical Agent details are hidden by default behind Technical Details.
- M5.5.6.1 Frontend UX Hard Simplification merged to master and merge validation report prepared.
- M5.5.7 has not started.
- Tag has not been created.

## M5.5.6.2 Frontend UX + Mock Answer Polish

- M5.5.6.2 Frontend UX + Mock Answer Polish completed.
- Mock fallback now returns readable business answers and better deterministic SQL for common questions such as even rows and regional sales ranking.
- Agent results keep technical details folded by default; status badges and Expert SQL advanced mode were visually polished.
- Backend pytest, frontend tests, frontend build, route smoke, safety search, and browser visual check passed.
- M5.5.7 has not started.
- Tag has not been created.

## Current Version

- **Version**: v1.4.1-m4-engineering-complete
- **Phase**: M4 Engineering Completeness — CLOSED
- **Tag**: `v1.4.1-m4-engineering-complete`
- **Status**: M4 最终封板完成

## M4 Status

M4 is fully closed: UI/UX polish, LLM fallback, Docker Compose, README, deployment docs, and final engineering tag.

Closed scope:
- Home / Data / Analyze / History / Detail / Settings polish
- LLM provider selector (Mock / DeepSeek / Doubao / Mimo)
- Mock fallback when real provider unavailable
- Online smoke hotfixes (7 user-reported issues fixed)
- Docker Compose local demo
- README / README.en value polish (STAR-style)
- Deployment docs, environment docs, LLM provider docs
- Final engineering regression (559 backend, 1171 frontend)
- CONTRIBUTING.md

RC Report: `docs/reports/m4-final-release-candidate-report.md`
Regression Report: `docs/reports/m4-9-5-engineering-completeness-regression.md`
Polish Report: `docs/reports/m4-9-6-readme-value-polish-final-tag.md`

## Next Stage

**M5 Agent Workflow Enhancement** — Planned, not started.

After this tag, future work can choose either:
- Real hosted deployment smoke
- M5 Agent workflow enhancement

Do not start M5 until user confirms.

## M5.0 Status

- M5.0 Agent Design + Version Governance Lock completed on 2026-06-29.
- App version governance is aligned on `1.4.1`; release tag remains `v1.4.1-m4-engineering-complete`.
- M5 target is Single Data Analyst Agent.
- Implementation has not started.
- No frontend source, backend business logic, database, Docker, or README changes were made for M5.0.
- Start M5.1 only after design review.

## M5.0 Design Review Hotfix

- M5.0 design review hotfix completed on 2026-06-29.
- LangChain is approved only as an optional lightweight harness after native EAI Agent contracts are stable.
- M5.1 implementation has not started.

## M5.0 Industrial Agent Workflow Review

- M5.0 industrial agent workflow review completed on 2026-06-29.
- Design now includes intent recognition, mode router, fallback matrix, tool guardrails, trace/evidence, and an updated M5.1-M5.6 implementation plan.
- Implementation has not started.

## M5/M6 Agent Roadmap Final Design Lock

- M5/M6 Agent roadmap final design lock completed on 2026-06-30.
- M5 remains Single Data Analyst Agent MVP; M6 is reserved for multi-agent expansion.
- Implementation has not started.

## M5.0 Agent Design Merge

- M5.0 Agent design branch merged into `master` on 2026-06-30.
- Merge validation report created at `docs/reports/m5-0-agent-design-merge-validation.md`.
- M5.1 has not started; begin with M5.1.0 only after master CI passes.

## M5.1.0 Agent Implementation Plan

- M5.1.0 Agent Implementation Plan completed on 2026-06-30.
- Agent implementation has not started.
- Next step is M5.1.1 Native Contracts after user approval.

## M5.1.1 Native Agent Contracts

- M5.1.1 Native Agent Contracts completed on 2026-06-30.
- Router/tools/runner implementation has not started.

## M5.1.2 Intent Router

- M5.1.2 Intent Router completed on 2026-06-30.
- Tools/runner/persistence implementation has not started.

## M5.1.3 Mock Tool Registry

- M5.1.3 Mock Tool Registry completed on 2026-06-30.
- Runner/persistence/pipeline wrapping implementation has not started.

## M5.1.4 Deterministic Mock Run Transcript

- M5.1.4 Deterministic Mock Run Transcript completed on 2026-06-30.
- Persistence/pipeline wrapping/frontend implementation has not started.

## M5.1.5 Agent Foundation Regression

- M5.1.5 Agent Foundation Regression completed on 2026-06-30.
- M5.1 foundation is ready for review.
- M5.2 has not started.

## M5.1 Agent Foundation Merge Validation

- M5.1 Agent Foundation merged to master on 2026-06-30.
- M5.1 is ready for review.
- M5.2 has not started.

## M5.2.0 Optional LangChain Harness Plan

- M5.2.0 Optional LangChain Harness Plan completed on 2026-06-30.
- LangChain has not been installed.
- Adapter implementation has not started.

## M5.2.1 Optional LangChain Harness MVP

- M5.2.1 Optional LangChain Harness MVP completed on 2026-06-30.
- LangGraph, real LLM, persistence, frontend, and pipeline wrapping have not started.

## M5.2.2 LangChain Harness Merge Validation

- M5.2 Optional LangChain Harness merged to master on 2026-06-30.
- M5.3 pipeline wrapping has not started.

## M5.3.0 Existing Pipeline Tool Wrapping Audit / Plan

- M5.3.0 Existing Pipeline Tool Wrapping Audit / Plan completed on 2026-06-30.
- Pipeline wrapping implementation has not started.

## M5.3.1 Pipeline Adapter Boundary

- M5.3.1 Pipeline Adapter Boundary completed on 2026-06-30.
- Real pipeline wrapping has not started.

## M5.3.2 Wrap Existing Readonly SQL Execution

- M5.3.2 Wrap Existing Readonly SQL Execution completed on 2026-06-30.
- SQL generation / summary / report wrapping has not started.

## M5.3.3 Wrap Existing SQL Generation

- M5.3.3 Wrap Existing SQL Generation completed on 2026-06-30.
- Real LLM / summary / report wrapping has not started.

## M5.3.3 SQL Generation Wrapping Merge Validation

- M5.3.3 SQL Generation Wrapping merged to master on 2026-06-30.
- M5.3.4 summary/report wrapping has not started.

## M5.3.4 Wrap Summary / Report

- M5.3.4 Wrap Summary / Report completed on 2026-07-02.
- Pipeline tool regression has not started.

## M5.3.4 Summary / Report Wrapping Merge Validation

- M5.3.4 Summary / Report Wrapping merged to master on 2026-07-02.
- M5.3.5 pipeline tool regression has not started.

## M5.3.5 Pipeline Tool Regression

- M5.3.5 Pipeline Tool Regression completed on 2026-07-02.
- M5.3 final merge validation has not started.

## M5.3 Final Merge Validation

- M5.3 Final Merge Validation completed on 2026-07-02.
- M5.4 has not started.

## M5.4.0 Agent Runtime / API / Persistence Plan

- M5.4.0 Agent Runtime / API / Persistence Plan completed on 2026-07-02.
- Implementation has not started.

## M5.4.0 Agent Runtime / API / Persistence Plan Merge Validation

- M5.4.0 Agent Runtime / API / Persistence Plan merged to master on 2026-07-02.
- M5.4.1 has not started.

## M5.4.1 Agent Runtime Skeleton

- M5.4.1 Agent Runtime Skeleton completed on 2026-07-02.
- Runtime simulated chain / API / persistence / frontend have not started.

## M5.4.1 Agent Runtime Skeleton Merge Validation

- M5.4.1 Agent Runtime Skeleton merged to master on 2026-07-02.
- M5.4.2 has not started.

## M5.4.2 Agent Runtime Simulated Chain

- M5.4.2 Agent Runtime Simulated Chain completed on 2026-07-02.
- API / persistence / frontend have not started.

## M5.4.2 Agent Runtime Simulated Chain Merge Validation

- M5.4.2 Agent Runtime Simulated Chain merged to master on 2026-07-02.
- M5.4.3 has not started.

## M5.4.3 Agent API Contract Skeleton

- M5.4.3 Agent API Contract Skeleton completed on 2026-07-02.
- FastAPI route / persistence / frontend have not started.

## M5.4.3 Agent API Contract Skeleton Merge Validation

- M5.4.3 Agent API Contract Skeleton merged to master on 2026-07-02.
- M5.4.4 has not started.

## M5.4.4 Agent API Route Skeleton

- M5.4.4 Agent API Route Skeleton completed on 2026-07-02.
- Persistence / frontend / real provider have not started.

## M5.4.4 Agent API Route Skeleton Merge Validation

- M5.4.4 Agent API Route Skeleton merged to master on 2026-07-03.
- M5.4.5 has not started.

## M5.4.5 Agent Memory Architecture Plan

- M5.4.5 Agent Memory Architecture Plan completed on 2026-07-03.
- Memory implementation / persistence / frontend have not started.

## M5.4.5 Agent Memory Architecture Plan Merge Validation

- M5.4.5 Agent Memory Architecture Plan merged to master on 2026-07-03.
- M5.4.6 has not started.

## M5.4.6 Memory Schema Plan

- M5.4.6 Memory Schema Plan completed on 2026-07-03.
- Memory implementation / persistence / migration have not started.

## M5.4.6 Memory Schema Plan Merge Validation

- M5.4.6 Memory Schema Plan merged to master on 2026-07-03.
- M5.4.7 has not started.

## M5.4.7 AgentRun Persistence Skeleton

- M5.4.7 AgentRun Persistence Skeleton completed on 2026-07-03.
- Real DB persistence / migration / frontend have not started.

## M5.4.7 AgentRun Persistence Skeleton Merge Validation

- M5.4.7 AgentRun Persistence Skeleton merged to master on 2026-07-03.
- M5.4.8 has not started.

## M5.4.8 AgentRun Store Integration Plan

- M5.4.8 AgentRun Store Integration Plan completed on 2026-07-03.
- Runtime/route store integration and real DB persistence have not started.

## M5.4.8 AgentRun Store Integration Plan Merge Validation

- M5.4.8 AgentRun Store Integration Plan merged to master on 2026-07-03.
- M5.4.9 has not started.

## M5.4.9 Route-Level InMemory Store Integration

- M5.4.9 Route-Level InMemory Store Integration completed on 2026-07-03.
- Real DB persistence / history detail APIs / frontend have not started.

## M5.4.9 Route-Level InMemory Store Integration Merge Validation

- M5.4.9 Route-Level InMemory Store Integration merged to master on 2026-07-03.
- M5.4.10 has not started.

## M5.4.10 Final Regression / Seal Candidate

- M5.4.10 Final Regression / Seal Candidate completed on 2026-07-03.
- M5.4 is ready for merge validation if tests and CI pass. Tag has not been created.

## M5.4.10 Final Regression / Seal Candidate Merge Validation

- M5.4.10 Final Regression / Seal Candidate merged to master on 2026-07-03.
- M5.4 is ready for final tag after user review. Tag has not been created.

## M5.4 Final Tag

- M5.4 Final Tag prepared on 2026-07-03.
- M5.4 seals Agent Runtime + Agent API + InMemory Persistence Boundary.
- Next stage after tag: M5.5 Frontend Agent UI Integration / Agent Run Mode.

## M5.5.0 Frontend Agent UI Integration Plan

- M5.5.0 Frontend Agent UI Integration Plan completed on 2026-07-03.
- Existing UIUX consistency requirements were audited and locked. M5.5 implementation has not started.

## M5.5.0 Frontend Agent UI Integration Plan Merge Validation

- M5.5.0 Frontend Agent UI Integration Plan merged to master on 2026-07-03.
- UIUX consistency requirements are locked. M5.5 implementation has not started.

## M5.5.1 Frontend Agent API Client Contract

- M5.5.1 Frontend Agent API Client Contract completed on 2026-07-03.
- Agent UI implementation has not started.

## M5.5.1 Frontend Agent API Client Contract Merge Validation

- M5.5.1 Frontend Agent API Client Contract merged to master on 2026-07-03.
- Agent UI implementation has not started.

## M5.5.2 Analyze Agent Run UI Skeleton

- M5.5.2 Analyze Agent Run UI Skeleton completed on 2026-07-03.
- Full Agent result rendering, history/detail UI, and real provider integration have not started.

## M5.5.2 Analyze Agent Run UI Skeleton Merge Validation

- M5.5.2 Analyze Agent Run UI Skeleton merged to master on 2026-07-03.
- M5.5.3 has not started. Tag has not been created.

## M5.5.3 Agent Run Result Card

- M5.5.3 Agent Run Result Card completed on 2026-07-03.
- Full warning/fallback/unsupported state polish, history/detail UI, and real provider credential UI have not started.

## M5.5.3 Agent Run Result Card Merge Validation

- M5.5.3 Agent Run Result Card merged to master on 2026-07-03.
- M5.5.4 has not started. Tag has not been created.

## M5.5.4 Product Simplification and M5 Completion Plan

- M5.5.4 Product Simplification and M5 Completion Plan completed on 2026-07-03.
- M5 final target, compressed M5.5 path, whole-site simplification, bilingual requirement, provider fallback rules, and documentation slimming plan are re-locked.
- M5.5.5 implementation has not started. Tag has not been created.

## M5.5.4 Product Simplification Plan Merge Validation

- M5.5.4 Product Simplification and M5 Completion Plan merged to master on 2026-07-04.
- README documentation commits on the source branch were preserved.
- M5.5.5 implementation has not started. Tag has not been created.

## M5.5.5 LangChain Single Agent Backend Loop

- M5.5.5 LangChain Single Agent Backend Loop implementation completed on 2026-07-04.
- `/api/agent/runs` now uses a LangChain Core single-agent tool loop while preserving the existing frontend contract.
- M5.5.6 has not started. Tag has not been created.

## M5.5.5 LangChain Single Agent Backend Loop Merge Validation

- M5.5.5 LangChain Single Agent Backend Loop merged to master on 2026-07-04.
- Backend import, full pytest, changed-file ruff, smoke test, and safety search passed.
- M5.5.6 has not started. Tag has not been created.

## M5.5.6 Frontend Product Flow Simplification

- M5.5.6 Frontend Product Flow Simplification completed on 2026-07-05.
- Frontend flow is simplified around Upload Data -> Agent Analysis -> Result.
- Expert SQL remains as advanced mode; History and Settings are auxiliary.
- zh-CN / en-US copy was synchronized.
- Backend, README, package files, M5.5.7, and tag creation were not touched.

## M5.5.6 Frontend CI Fix

- M5.5.6 frontend CI regression tests were aligned with Upload Data / Agent Analysis / Run Agent copy on 2026-07-05.
- CSV/Excel wording was clarified in zh-CN and en-US.
- Targeted frontend tests and frontend build passed.
- M5.5.6 Merge Validation has not started. Tag has not been created.

## M5.5.6 Frontend CI Full Fix

- M5.5.6 frontend full CI regression tests were aligned with the simplified Upload Data → Agent Analysis → Results flow on 2026-07-05.
- Full frontend tests, type check, frontend build, backend import, safety search, and visual checks were completed.
- M5.5.6 Merge Validation has not started. M5.5.7 has not started. Tag has not been created.

## M5 Final Astryx UX Redesign

- M5 Final Astryx UX Redesign completed on 2026-07-06.
- Astryx was installed from `facebook/astryx` npm packages and cached on D drive.
- Frontend default experience was redesigned into a business data Agent workbench.
- SQL, trace, provider metadata, memory details, run id, and raw payload are folded by default.
- Backend import, pytest with `PYTHONPATH=.`, frontend tests, frontend build, Astryx doctor, and browser visual check passed.
- M6 has not started. Tag has not been created.

## M5 Final Astryx UX Redesign Merge Validation

- M5 Final Astryx UX Redesign merged to master on 2026-07-06.
- Backend import, pytest with `PYTHONPATH=.`, frontend tests, frontend build, Astryx doctor, D-drive cache check, and safety search passed after merge.
- M5 Final Tag is recommended after master CI passes. M6 has not started. Tag has not been created.

## M5 Final Astryx UX Redesign Hard Fix

- M5 Final Astryx UX Redesign Hard Fix completed on 2026-07-06.
- The visible left sidebar and five-entry main navigation were removed from the default frontend experience.
- The app now opens directly into a single business data analysis workbench with History and Settings as top-right drawers.
- Backend import, pytest with `PYTHONPATH=.`, frontend tests, frontend build, Astryx doctor, browser visual check, old-structure search, and safety search passed.
- M6 has not started. Tag has not been created.
