# Project Context

> Last updated: 2026-07-06

## Current Baseline

- App version: `1.4.1`
- Stable release tag: `v1.4.1-m4-engineering-complete`
- Current product state: M5 Agent main path is runnable after the final Astryx UX simplification and Doubao provider QA.
- Current stage: M6.5 LangChain Agent orchestration enhancement completed for review.

## M6 Direction

M6 is being planned as a Business Analyst Agent upgrade:

```text
understand question -> decompose metrics -> query evidence -> judge risk -> find opportunity -> recommend action -> support follow-up
```

M6.1 is documentation only. M6.2 adds the synthetic business demo dataset. M6.3 adds the backend Business Semantic Layer. M6.4 adds deterministic backend Business Analysis Tools. M6.5 connects the semantic layer and business tools into the LangChain Single Agent backend orchestration.

## Important Boundary

Historical roadmap documents described M6 as Multi-Agent Expansion. The current user-approved M6 direction is Business Analyst Agent:

- M6.1 focuses on Business Analyst Agent architecture.
- M6.2 focuses on demoExcel / demo CSV redesign.
- M6.3 focuses on Business Semantic Layer.
- M6.4 focuses on Business Analysis Tools.
- M6.5 focuses on LangChain Agent orchestration enhancement.
- M6.6 Frontend Business Report adaptation, Multi-Agent, LangGraph, and RAG have not started.
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

M6.5 preserves the existing `answer`, `sql`, `evidence`, `warnings`, `trace`, and `tool_calls` fields for frontend compatibility. It does not change frontend UI.

## Next Stage

M6.6 Business Report frontend adaptation is the next implementation stage after user review. M6.5 did not touch frontend UI, did not run formal 25-question pressure scoring, and did not create a tag.
