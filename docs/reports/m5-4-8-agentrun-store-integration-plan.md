# M5.4.8 AgentRun Store Integration Plan

## 1. Goal

Plan how AgentRun store boundary should be integrated with Runtime and API before implementing route-level store integration or real database persistence.

## 2. Files Changed

- `docs/architecture/m5-4-agentrun-store-integration-plan.md`
- `docs/reports/m5-4-8-agentrun-store-integration-plan.md`
- `CURRENT_SESSION.md`

## 3. Existing System Audit

- memory_store: reviewed `AgentRunRecord`, `AgentRunMemoryStore`, `InMemoryAgentRunStore`, `save_run`, `get_run`, and `clear`.
- runtime: reviewed skeleton and simulated chain outputs through `AgentRuntimeResult`.
- API contracts: reviewed API request/response mapping and existing detail/list response models.
- Agent route: reviewed current `POST /api/agent/runs` skeleton route; it does not save runs yet.
- memory schema plan: reviewed future `agent_runs`, `agent_steps`, `agent_tool_calls`, dataset/table scope, and `schema_hash` boundaries.
- tests: reviewed memory store, runtime, API contract, and route skeleton tests.

## 4. Integration Summary

- Runtime produces `AgentRuntimeResult`.
- API route can wrap result into `AgentRunRecord`.
- Store saves `AgentRunRecord`.
- Future detail/list APIs read from store.
- Route-level integration is recommended for M5.4 MVP.
- Orchestrator-level integration is recommended for future Multi-Agent.

## 5. Dataset/Table Scope

The integration plan requires:

- `dataset_id`
- `table_id`
- `table_name`
- `schema_hash`
- unscoped run behavior

If stable table scope is unavailable, the run trace can be saved as unscoped or partially scoped, but it should not be promoted into stable table/query/report memory.

## 6. Multi-Agent Compatibility

- Future SQLAgent / InsightAgent / ReportAgent can share `AgentRunRecord` as a parent trace.
- Orchestrator should own memory policy in M6.
- Future `AgentStep` can preserve agent name / role.
- Store boundary should not assume one agent forever.

## 7. What Was Not Changed

- 未修改 runtime
- 未修改 route
- 未新增 route
- 未实现 store integration
- 未实现 real DB persistence
- 未新增 database migration
- 未修改 database schema
- 未创建新数据库表
- 未接 frontend
- 未接真实 LLM
- 未访问网络/provider
- 未修改 backend services
- 未修改 requirements
- 未打 tag

## 8. Validation

- backend import: backend import OK
- focused tests: 229 passed
- full pytest: 788 passed, 31 skipped
- safety search: no matches
- provider leakage search: no matches
- DB / migration leakage search: documentation-only matches for future SQLite/migration planning and table-scoped planning terms; no executable SQL, no backend implementation, no database change script

## 9. Next Step

等待用户审查。通过后再决定进入：

```text
M5.4.8 Merge Validation
```

Do not start merge validation in this round.
