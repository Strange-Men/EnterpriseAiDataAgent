# M5.4.10 Final Regression / Seal Candidate

## 1. Goal

Validate M5.4 as a seal candidate for Agent Runtime + Agent API + Memory / Persistence Boundary.

## 2. M5.4 Scope Reviewed

- M5.4.1 Runtime Skeleton
- M5.4.2 Runtime Simulated Chain
- M5.4.3 API Contract Skeleton
- M5.4.4 API Route Skeleton
- M5.4.5 Memory Architecture Plan
- M5.4.6 Memory Schema Plan
- M5.4.7 AgentRun Persistence Skeleton
- M5.4.8 AgentRun Store Integration Plan
- M5.4.9 Route-Level InMemory Store Integration

## 3. Final Capability Summary

- Runtime skeleton works.
- Runtime simulated chain works internally.
- API contracts serialize correctly.
- `POST /api/agent/runs` works in skeleton mode.
- Route-level `InMemoryAgentRunStore` saves `AgentRunRecord`.
- Provider fallback metadata is preserved.
- Warnings are preserved.
- Unsupported controlled trace is preserved.
- Chinese destructive intent and English destructive intent are both handled as controlled traces; English destructive intent is confirmed as `UNSUPPORTED`.
- `simulated_chain` remains disabled at route level.
- No real DB persistence yet.
- No frontend yet.
- No real LLM yet.

## 4. Regression Results

- backend import: passed
- M5.4 API / Store smoke: passed
  - normal skeleton: 200, record saved, `provider_used=mock`, `persistence_mode=in_memory`
  - fallback skeleton: 200, `deepseek -> mock`, `fallback_triggered=true`, record saved
  - Chinese destructive intent: controlled trace saved
  - English destructive intent: `UNSUPPORTED` trace saved
  - `simulated_chain`: 501
  - empty input: 422
- focused tests: 237 passed
- full pytest: 796 passed, 31 skipped
- safety search: passed
- provider leakage search: passed
- DB / migration leakage search: passed
- simulated chain route leakage search: passed

## 5. What M5.4 Proves

M5.4 proves that the project now has a working Agent Runtime + Agent API + InMemory Persistence Boundary loop, while keeping real DB persistence, frontend integration, and real provider execution out of scope.

## 6. What M5.4 Does Not Do

- 未实现真实 SQLite / DuckDB persistence
- 未新增 database migration
- 未修改 database schema
- 未创建新数据库表
- 未新增 history list API
- 未新增 detail API route
- 未接 frontend
- 未接真实 LLM
- 未访问业务网络/provider
- 未执行 `simulated_chain` route
- 未实现 table/query/report/global durable memory
- 未修改 backend services
- 未修改 requirements
- 未打 tag

## 7. Seal Candidate Recommendation

M5.4 is ready for merge validation and later tag after user review.

Recommended next step:

```text
M5.4.10 Merge Validation
```

Do not merge or tag in this round.
