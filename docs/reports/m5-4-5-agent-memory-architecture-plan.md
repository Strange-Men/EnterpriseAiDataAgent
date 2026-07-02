# M5.4.5 Agent Memory Architecture Plan

## 1. Goal

Design dataset/table-scoped long-term memory architecture for the Agent before implementing persistence.

## 2. Files Changed

- docs/architecture/m5-4-agent-memory-architecture.md
- docs/reports/m5-4-5-agent-memory-architecture-plan.md
- CURRENT_SESSION.md

## 3. Existing System Audit

- Agent runtime: `backend/agent/runtime.py`
- API contracts: `backend/agent/api_contracts.py`
- Agent route: `backend/routes/agent.py`
- existing routes: `backend/routes/upload.py`, `backend/routes/tables.py`, `backend/routes/query.py`, `backend/routes/ai.py`, `backend/routes/analyze.py`, `backend/routes/quality.py`
- existing services: `backend/services/data_service.py`, `backend/services/query_history.py`, `backend/services/report_builder.py`, `backend/services/profiler.py`, `backend/services/ai_pipeline.py`, `backend/services/ai_analyst.py`
- existing database/history/report storage: `database/db_manager.py`, `database/file_loader.py`, `database/query_executor.py`, `backend/services/query_history.py`, `backend/services/report_builder.py`
- tests: `tests/unit/test_agent_*`, `tests/test_query_history.py`, API endpoint tests, upload/table/query tests

Audit findings:

- Current uploaded data is primarily identified by table name.
- `AgentRuntimeRequest` accepts `dataset_id`; `AgentRun` currently stores `table_name` but not stable `dataset_id`, `table_id`, or `schema_hash`.
- Existing SQL history is query-centric and should not become Agent memory by default.
- Existing report builder compiles supplied run dictionaries into Markdown and does not persist Agent reports.
- Existing table profile/schema/quality paths can later feed Table Memory.

## 4. Memory Architecture Summary

- Run Memory: stores AgentRun, steps, tool calls, tool results, evidence refs, warnings, provider metadata, fallback metadata, and runtime mode.
- Table Memory: stores schema, column metadata, profile, quality notes, semantic aliases, and schema_hash.
- Query Memory: stores repeated user questions, normalized intent, generated SQL, validation/execution status, summaries, and failure patterns.
- Report Memory: stores summaries, findings, sections, and evidence refs linked to run/table/query scope.
- Global Preference Memory: stores safe output/report/provider/formatting preferences and never raw table rows.

## 5. Table Isolation Strategy

The proposed scope key is:

```text
dataset_id + table_id + schema_hash + memory_type
```

Memory isolation rules:

- table_id is the primary memory scope.
- dataset_id is the parent dataset/file/workbook scope.
- table_name is display and compatibility metadata, not the only identity.
- schema_hash prevents stale memory reuse.
- same table name plus changed schema creates a new memory version.
- cross-table memory must be explicit.

## 6. Multi-Agent Compatibility

Future Multi-Agent can share the same scoped memory records:

- SQLAgent reads table/query memory.
- InsightAgent reads execution/report memory.
- ReportAgent reads findings/evidence memory.
- Orchestrator controls which memory_type each agent can read/write.

This supports later Multi-Agent without replacing the current single Agent MVP.

## 7. What Was Not Changed

- memory store was not implemented
- database change script was not added
- database schema was not modified
- persistence was not implemented
- route was not added
- frontend was not connected
- real LLM was not connected
- network/provider was not accessed
- production database was not accessed
- backend services were not modified
- backend routes were not modified
- requirements.txt was not modified
- tag was not created

## 8. Validation

- backend import: backend import OK
- focused tests: 222 passed
- full pytest: 781 passed, 31 skipped
- safety search: no matches
- provider leakage search: no matches
- persistence implementation leakage search: documentation-only matches for table-scoped planning terms; no executable SQL, no backend implementation, no database change script

## 9. Next Step

等待用户审查。通过后再决定进入：

```text
M5.4.6 Memory Schema Plan
```

Do not implement memory schema in this round.
