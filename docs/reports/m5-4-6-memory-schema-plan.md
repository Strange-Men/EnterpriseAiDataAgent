# M5.4.6 Memory Schema Plan

## 1. Goal

Plan future Agent Memory database schema before implementing persistence or migrations.

## 2. Files Changed

- `docs/architecture/m5-4-agent-memory-schema-plan.md`
- `docs/reports/m5-4-6-memory-schema-plan.md`
- `CURRENT_SESSION.md`

## 3. Existing System Audit

- Agent runtime: reviewed `backend/agent/runtime.py`; current runtime accepts `dataset_id` and `table_name`, builds `AgentRun`, and keeps mock/simulated provider metadata.
- Agent API contracts: reviewed `backend/agent/api_contracts.py`; API request maps to runtime request and keeps `provider_requested` defaulting to `mock`.
- Agent route: reviewed `backend/routes/agent.py`; route skeleton only creates skeleton Agent runs and does not execute the simulated chain.
- existing routes: reviewed upload/table/query/analyze/AI routes; current data APIs mainly identify data by `table_name`.
- existing services: reviewed data/query/report-related services; query history is SQL-centric and report building is not Agent memory persistence.
- existing database/history/report storage: reviewed current DuckDB/data service/query history boundaries; no stable Agent memory store exists yet.
- tests: reviewed current Agent unit tests and route skeleton coverage.

## 4. Proposed Schema Summary

Planned future records:

- `agent_runs`
- `agent_steps`
- `agent_tool_calls`
- `agent_table_memory`
- `agent_query_memory`
- `agent_report_memory`
- `agent_global_preferences`

These records are planning-only in M5.4.6.

## 5. Table Isolation Strategy

The schema plan uses:

- `dataset_id`
- `table_id`
- `table_name`
- `schema_hash`
- `memory_type`
- `run_id`

`dataset_id` scopes uploaded datasets. `table_id` scopes one table/sheet. `table_name` remains a compatibility label. `schema_hash` prevents memory from an old table structure from becoming default context for a changed structure. `memory_type` separates run, table, query, report, and global preference memory.

## 6. Multi-Agent Compatibility

Future `SQLAgent`, `InsightAgent`, and `ReportAgent` can share the same memory store while reading only the memory types they need. The orchestrator should own memory access policy and scope all reads/writes by `run_id`, `table_id`, `schema_hash`, and `memory_type`.

## 7. What Was Not Changed

- Memory store was not implemented.
- Database migration was not added.
- Database schema was not modified.
- New database records were not created.
- Persistence was not implemented.
- Route was not added.
- Frontend was not connected.
- Real LLM was not connected.
- Network/provider access was not added.
- Production database access was not added.
- Backend services were not modified.
- Backend routes were not modified.
- Requirements were not modified.
- Tag was not created.

## 8. Validation

- backend import: backend import OK
- focused tests: 222 passed
- full pytest: 781 passed, 31 skipped
- safety search: no matches
- provider leakage search: no matches after wording cleanup for a non-dependency substring
- persistence implementation leakage search: documentation-only matches for proposed table names, table-scoped planning terms, `updated_at`, and the word migration; no executable SQL, no backend implementation, no database change script

## 9. Next Step

Wait for user review. After approval, decide whether to enter:

```text
M5.4.6 Merge Validation
```

Do not start merge validation in this round.
