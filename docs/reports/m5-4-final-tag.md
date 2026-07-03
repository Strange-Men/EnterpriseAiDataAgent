# M5.4 Final Tag

## 1. Goal

Finalize M5.4 as the Agent Runtime + Agent API + Memory / Persistence Boundary milestone.

## 2. Tag

- tag: `v1.5.0-m5-4-agent-runtime-api-memory-boundary`

## 3. Base

- master commit before final tag report: `9cff85f102d92b429682cc5a51c2cea4be5134f8`
- master CI before final tag: passed, run `28646207591`
- M5.4.10 merge validation report: `docs/reports/m5-4-10-final-regression-seal-candidate-merge-validation.md`

## 4. M5.4 Completed Scope

- M5.4.1 Runtime Skeleton
- M5.4.2 Runtime Simulated Chain
- M5.4.3 API Contract Skeleton
- M5.4.4 API Route Skeleton
- M5.4.5 Memory Architecture Plan
- M5.4.6 Memory Schema Plan
- M5.4.7 AgentRun Persistence Skeleton
- M5.4.8 AgentRun Store Integration Plan
- M5.4.9 Route-Level InMemory Store Integration
- M5.4.10 Final Regression / Seal Candidate

## 5. Final Capability

- Runtime skeleton works.
- Runtime simulated chain works internally.
- API contracts are stable.
- `POST /api/agent/runs` works in skeleton mode.
- Route-level `InMemoryAgentRunStore` saves `AgentRunRecord`.
- Provider fallback metadata is preserved.
- Warnings are preserved.
- Unsupported controlled trace is preserved.
- `simulated_chain` remains disabled at route level.
- Runtime -> API -> InMemory Persistence Boundary loop is complete.

## 6. Explicitly Out of Scope

- no real SQLite / DuckDB persistence
- no database migration
- no database schema change
- no new database table
- no history list API
- no detail API route
- no frontend Agent UI
- no real LLM provider execution
- no table/query/report/global durable memory

## 7. Final Validation

- backend import: passed
- final API/store smoke: passed
- focused tests: 237 passed
- full pytest: 796 passed, 31 skipped
- safety search: passed
- provider leakage search: passed
- DB / migration leakage search: passed
- simulated chain route leakage search: passed

## 8. Next Stage Recommendation

After this tag is pushed, the next stage can start:

```text
M5.5 Frontend Agent UI Integration / Agent Run Mode
```

Do not start M5.5 in this round.
