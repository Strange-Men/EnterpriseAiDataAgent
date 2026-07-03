# M5.4 Agent Memory Architecture

## 1. Background

Current Agent Runtime can run the skeleton route and a controlled simulated chain, but it has no long-term memory yet.

M5.3 introduced Agent-side wrappers for SQL generation, readonly SQL execution, summary, and report building. M5.4.1 to M5.4.4 added runtime, API contracts, and a minimal route. The next design problem is how the Agent remembers prior work without turning into a global chat log or leaking knowledge across unrelated tables.

## 2. Memory Design Principle

This project should not use one global chat memory.

It should use dataset/table-scoped structured memory. The Agent is a data-analysis executor, so memory should be organized around data assets, execution traces, evidence, and safe preferences.

Core namespace:

- dataset_id
- table_id
- table_name
- schema_hash
- memory_type
- created_at / updated_at

The current codebase mostly identifies data through `table_name`. `AgentRuntimeRequest` already accepts `dataset_id`, but `AgentRun` does not yet carry stable `dataset_id`, `table_id`, or `schema_hash`. Future memory implementation should add or derive those identifiers deliberately rather than relying on table name alone.

## 3. Memory Layers

### 3.1 Run Memory

Run Memory stores one Agent execution trace:

- AgentRun
- AgentStep
- ToolCall
- ToolResult
- EvidenceRef
- warnings
- provider metadata
- fallback metadata
- runtime mode

Run Memory is the audit trail. It is scoped by `run_id`, linked to dataset/table scope, and should preserve whether the run was skeleton, simulated, or later real-path approved.

### 3.2 Table Memory

Table Memory stores long-term table-specific knowledge:

- schema
- column names
- column types
- column semantic aliases
- null ratio
- row count
- numeric stats
- likely date columns
- likely metric columns
- data quality notes
- schema_hash

Table Memory should be regenerated or versioned when schema changes. The current upload/table APIs expose table name, row count, column count, schema, preview, and quality/profile data that can later feed this layer.

### 3.3 Query Memory

Query Memory stores repeated user questions and SQL patterns:

- user_input
- normalized intent
- generated_sql
- validation status
- execution status
- result summary
- failure reason
- linked table_id
- linked schema_hash

Query Memory is not the same as existing `query_history`. Existing query history is SQL-centric and stores recent executions with SQL, status, runtime, row count, error, and timestamp. Agent Query Memory should keep Agent context, validation outcome, and relationship to table/schema scope.

### 3.4 Report Memory

Report Memory stores generated analysis outputs:

- summary
- findings
- report sections
- evidence_refs
- linked run_id
- linked table_id
- linked query_id

Report Memory should remain evidence-grounded. It should not become an unverified narrative cache. Later runtime should read report memory as context summary and still prefer current evidence for final answers.

### 3.5 Global Preference Memory

Global Preference Memory stores stable user/application preferences:

- output language
- report style
- default provider preference
- safe mode defaults
- formatting preferences

Do not store raw table rows here. Global preferences must not contain table facts, credentials, private study notes, interview content, or resume material.

## 4. Memory Isolation Across Tables

Different tables need isolated memory:

- `table_id` should be the primary table memory scope.
- `dataset_id` should be the parent scope for files/workbooks that may contain one or more tables.
- `table_name` should remain a display and compatibility field, not the only identity.
- `schema_hash` prevents stale memory reuse after upload replacement, rename, or schema drift.
- Same table name with different schema should create a new memory version.
- Cross-table memory must be explicit, not implicit.

Recommended scope key:

```text
dataset_id + table_id + schema_hash + memory_type
```

If `table_id` is not yet available, M5.4 implementation should either generate a stable table identity at upload/import time or explicitly mark memory as table-name-scoped and temporary until table identity is introduced.

## 5. Proposed Storage Model

This section plans future storage only. It does not define a database change script or executable schema.

| Future record | Purpose | Key fields | Relationship to AgentRun | Relationship to dataset/table | Write timing |
|---|---|---|---|---|---|
| agent_runs | Store run-level audit and summary state. | run_id, root_run_id, status, user_goal, provider fields, runtime_mode, trace_id, created_at, updated_at | One row per AgentRun. | Links to dataset_id, table_id, table_name, schema_hash when known. | At run creation and completion checkpoints. |
| agent_steps | Store ordered runtime steps. | step_id, run_id, step_index, state, status, input/output summary, error | Many steps per AgentRun. | Inherits dataset/table scope through run_id. | After each step finishes. |
| agent_tool_calls | Store tool execution records. | call_id, run_id, step_id, tool_name, status, provider_used, is_simulated, duration | Many calls per AgentRun and AgentStep. | Inherits dataset/table scope through run_id; may store table_id for query efficiency. | After each tool completes/rejects/fails. |
| agent_evidence_refs | Store pointers to evidence used by tools/reports. | evidence_id, run_id, step_id, tool_call_id, source_type, source_name, summary, data_ref | Evidence can link to run, step, and tool call. | Should include dataset_id/table_id/schema_hash when evidence is table-derived. | When tool output produces evidence. |
| agent_table_memory | Store table-level durable profile and semantic hints. | table_id, dataset_id, table_name, schema_hash, profile_json, quality_json, semantic_aliases | May reference last_refresh_run_id. | Primary table-scoped memory record. | After upload/profile/quality refresh or schema change. |
| agent_query_memory | Store repeated question and SQL patterns. | query_memory_id, table_id, schema_hash, normalized_intent, user_input, generated_sql, status, summary | May reference originating run_id and tool_call_id. | Scoped to table_id/schema_hash. | After SQL generation/validation/execution. |
| agent_report_memory | Store report outputs and evidence summary. | report_memory_id, run_id, table_id, query_memory_id, summary, findings, sections, evidence_refs | Links to final report-producing run/tool call. | Scoped to table_id/schema_hash when table-derived. | After summary/report generation. |
| agent_global_preferences | Store safe user/application preferences. | preference_key, preference_value, scope, created_at, updated_at | Not tied to one run by default. | Optional dataset/table override only when explicit. | When user or app settings change. |

## 6. Memory Write Policy

Memory should be written only at clear lifecycle boundaries:

- after upload / table profiling
- after successful SQL generation
- after successful readonly SQL execution
- after summary/report generation
- after failed/rejected runs, store failure pattern only
- never write credentials, private interview material, resume material, or unrelated personal study notes

Rejected/failed runs can be useful memory, but only as safety and failure patterns. They should not be promoted into table facts.

## 7. Memory Read Policy

Runtime should read memory narrowly:

- request with table_id/table_name loads table memory for that table scope
- runtime loads recent successful query memories for the same table/schema
- runtime loads report memories only as context summary, not raw final truth
- if table memory is missing, runtime should proceed with schema/profile fallback
- if table scope is ambiguous, runtime should ask clarification or reject
- if schema_hash does not match, runtime should avoid stale table/query/report memory

The current route skeleton should not read memory. Memory reads should begin only after persistence and schema decisions are approved.

## 8. Multi-Agent Compatibility

This memory shape supports future Multi-Agent without replacing the single Agent MVP:

- SQLAgent reads table/query memory.
- InsightAgent reads execution/report memory.
- ReportAgent reads findings/evidence memory.
- Orchestrator controls memory access.
- All agents share a memory store, but access is scoped by run_id/table_id/memory_type.

The single Agent can continue using the same records. Multi-Agent later becomes an access-control and orchestration layer over the same structured memory, not a separate memory universe.

## 9. Safety / Privacy / Data Minimization

Memory must be conservative:

- avoid storing raw rows unless explicitly needed and approved
- store evidence refs, aggregates, profile summaries, and schema metadata instead of full raw data
- no API keys or credentials
- no private learning, interview, or resume notes
- allow future removal by dataset_id/table_id
- memory should not leak across tables
- provider and fallback metadata should be stored for audit, not as proof that a provider was used

## 10. Why Not Vector Memory First

Vector memory should not be first for M5.4:

- current data is structured CSV/Excel analysis
- relational / JSON structured memory is enough for MVP
- exact scoping by dataset/table/schema matters more than semantic similarity
- vector memory can be future optional support for report semantic search
- do not add a vector database in M5.4

## 11. M5.4 Memory Micro-step Plan

| Step | Goal | Scope | Acceptance |
|---|---|---|---|
| M5.4.6 | Memory Schema Plan | Decide records, identifiers, and storage strategy without implementing persistence. | User approves table_id/schema_hash strategy and storage model. |
| M5.4.7 | AgentRun Persistence Skeleton | Persist AgentRun/summary only behind controlled tests. | Runtime can persist a skeleton run without changing existing routes. |
| M5.4.8 | Table Memory Persistence Skeleton | Persist table profile/schema memory after explicit refresh path. | Table memory is scoped and schema_hash-aware. |
| M5.4.9 | Query / Report Memory Skeleton | Persist query/report memory from controlled Agent results. | Memory writes are evidence-linked and failure-safe. |
| M5.4.10 | Runtime Memory Read/Write Controlled Integration | Let runtime load/write approved memory behind config. | No cross-table leakage; full regression passes. |
| M5.4 Final Regression | Validate runtime/API/persistence/memory boundaries. | Focused tests, full pytest, and CI pass. |

Do not implement these stages in M5.4.5.

## 12. Decisions Needed Before Implementation

- Reuse existing history tables or create dedicated `agent_*` records.
- Whether `table_id` already exists or needs stable generation.
- Whether `schema_hash` should be based on column names/types only or include file hash.
- Whether report memory stores full report or summary plus evidence refs.
- Whether frontend should show memory in the detail page.
- Whether existing table rename/removal should mark table memory inactive or create redirect records.
- Whether memory should be enabled by default or behind an explicit runtime flag during early implementation.
