# Project Context

> Last updated: 2026-07-06

## Current Baseline

- App version: `1.4.1`
- Stable release tag: `v1.4.1-m4-engineering-complete`
- Current product state: M5 Agent main path is runnable after the final Astryx UX simplification and Doubao provider QA.
- Current stage: M6.2 merged baseline, preparing M6.3 Business Semantic Layer.

## M6 Direction

M6 is being planned as a Business Analyst Agent upgrade:

```text
understand question -> decompose metrics -> query evidence -> judge risk -> find opportunity -> recommend action -> support follow-up
```

M6.1 is documentation only. M6.2 adds the synthetic business demo dataset. M6.3 will add the backend Business Semantic Layer only.

## Important Boundary

Historical roadmap documents described M6 as Multi-Agent Expansion. The current user-approved M6 direction is Business Analyst Agent:

- M6.1 focuses on Business Analyst Agent architecture.
- M6.2 focuses on demoExcel / demo CSV redesign.
- M6.3 focuses on Business Semantic Layer.
- M6.4 Business Analysis Tools have not started.
- M6.5 LangChain Agent orchestration enhancement has not started.
- Frontend Business Report adaptation, Multi-Agent, LangGraph, and RAG have not started.
- Any future Multi-Agent expansion must be separately reviewed and approved.

## Active Planning Docs

- `docs/reports/m6-business-analyst-agent-architecture.md`
- `docs/reports/m6-business-capability-research.md`
- `docs/reports/m6-demo-dataset-redesign-spec.md`
- `docs/reports/m6-pressure-test-plan.md`
- `docs/reports/m6-demo-business-dataset-redesign.md`
- `docs/reports/m6-demo-sales-business-schema-manifest.json`
- `docs/reports/m6-demo-sales-business-profile-summary.md`

## M6.2 Dataset

M6.2 adds a new synthetic enterprise business sales dataset:

- `testExcel/demo_sales_business_50k.csv`
- `testExcel/demo_sales_business_50k.xlsx`

The dataset supports Business Analyst Agent pressure-test scenarios such as business health, risk diagnosis, growth opportunity, region/category/channel/customer analysis, shipping efficiency, data quality and follow-up context.

## Next Stage

M6.3 Business Semantic Layer is the next implementation stage. It should define field dictionary, business term mapping, metric definitions, default thresholds, dynamic quantile thresholds, missing-field fallback, and analysis templates without Agent orchestration or frontend changes.
