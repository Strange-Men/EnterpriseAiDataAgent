# M5.4 Agent Memory Schema Plan

## 1. Goal

Plan future database schema for dataset/table-scoped Agent long-term memory.

This document is planning-only. It does not implement migrations or database schema changes.

## 2. Design Principles

- Structured memory first.
- Dataset/table scoped.
- `schema_hash` aware.
- No raw row storage by default.
- Evidence refs over raw data.
- Runtime-controlled reads and writes.
- Tools do not write memory directly.
- Multi-Agent compatible.

The schema should make Agent memory auditable without turning the Agent into a global chat cache. Memory must be tied to the data it came from, the schema version it was derived from, and the run that produced it.

## 3. Namespace Model

The future memory namespace should include:

- `dataset_id`
- `table_id`
- `table_name`
- `schema_hash`
- `run_id`
- `memory_type`
- `created_at`
- `updated_at`

`dataset_id` scopes an uploaded file, workbook, or imported dataset. A workbook may later contain multiple tables or sheets.

`table_id` scopes one sheet/table. It should become the primary long-term memory key once the project has a stable table identity. Until then, `table_name` remains useful for compatibility but should not be the only durable memory key.

`table_name` is human-readable and compatible with current routes, but it can be renamed or reused. It should be stored as context, not treated as the only identity.

`schema_hash` prevents stale memory reuse. It should change when the table structure changes in a way that can invalidate generated SQL, semantic aliases, or report findings.

`run_id` links memory back to the Agent execution trace that created or refreshed it.

`memory_type` separates table, query, report, run, and global preference memory so future agents can request only the memory they are allowed to use.

`created_at` and `updated_at` support retention, ordering, and future refresh policies.

## 4. Proposed Tables

The following are future table plans only. This section does not define executable SQL.

### 4.1 agent_runs

Purpose:

- Persist one Agent execution.
- Provide the parent audit record for steps, tool calls, evidence refs, and derived memories.

Key fields:

- `run_id`
- `dataset_id`
- `table_id`
- `table_name`
- `schema_hash`
- `user_input`
- `intent`
- `runtime_mode`
- `status`
- `provider_requested`
- `provider_used`
- `fallback_triggered`
- `is_simulated`
- `created_at`

Relationships:

- Parent of `agent_steps`.
- Parent of `agent_tool_calls`.
- Linked to query memory through `source_run_id`.
- Linked to report memory through `source_run_id`.
- Linked to dataset/table scope through `dataset_id`, `table_id`, `table_name`, and `schema_hash`.

Read/write timing:

- Written when a runtime starts.
- Completed or updated when runtime finishes, rejects, or fails.
- Read by future history/detail APIs and by audit views.

### 4.2 agent_steps

Purpose:

- Persist ordered runtime/agent steps.
- Preserve what the runtime planned or executed without requiring raw tool output.

Key fields:

- `step_id`
- `run_id`
- `step_index`
- `step_name`
- `status`
- `started_at`
- `ended_at`
- `message`
- `metadata_json`

Relationships:

- Child of `agent_runs`.
- Parent or grouping record for `agent_tool_calls` through `step_id`.

Read/write timing:

- Written as each runtime step starts or finishes.
- Read by future detail/timeline views.

### 4.3 agent_tool_calls

Purpose:

- Persist tool calls and normalized tool results.
- Keep input/output summaries and evidence references without storing raw table rows.

Key fields:

- `tool_call_id`
- `run_id`
- `step_id`
- `tool_name`
- `status`
- `input_summary_json`
- `output_summary_json`
- `error_message`
- `evidence_refs_json`
- `is_simulated`
- `created_at`

Relationships:

- Child of `agent_runs`.
- Optional child of `agent_steps`.
- May link to query/report memory when the call produces durable knowledge.

Read/write timing:

- Written after each tool result is completed, rejected, or failed.
- Read by detail views, debugging, and future regression review.

### 4.4 agent_table_memory

Purpose:

- Persist long-term table knowledge.
- Store schema-aware profile and semantic hints for a specific table version.

Key fields:

- `table_memory_id`
- `dataset_id`
- `table_id`
- `table_name`
- `schema_hash`
- `column_profile_json`
- `semantic_aliases_json`
- `data_quality_summary`
- `likely_date_columns_json`
- `likely_metric_columns_json`
- `row_count`
- `updated_at`

Relationships:

- Scoped by dataset/table/schema.
- May record the latest refresh run through a future `source_run_id` or `last_refresh_run_id`.
- Read by SQL generation and insight planning stages after memory integration is explicitly implemented.

Read/write timing:

- Written or refreshed after upload/profile/schema inspection.
- Versioned or refreshed when `schema_hash` changes.

### 4.5 agent_query_memory

Purpose:

- Persist reusable query patterns and failures.
- Help future runtime learn which natural language questions map safely to which SQL patterns for the same table/schema.

Key fields:

- `query_memory_id`
- `dataset_id`
- `table_id`
- `schema_hash`
- `normalized_user_input`
- `intent`
- `generated_sql`
- `validation_status`
- `execution_status`
- `result_summary`
- `failure_reason`
- `source_run_id`
- `created_at`

Relationships:

- Scoped by dataset/table/schema.
- Linked to `agent_runs` through `source_run_id`.
- May link to the `agent_tool_calls` record that generated or executed the SQL in a later schema revision.

Read/write timing:

- Written after SQL generation and readonly validation.
- Updated with execution status after readonly execution.
- Failed/rejected records should store normalized failure patterns only, not raw data.

### 4.6 agent_report_memory

Purpose:

- Persist report summaries and findings.
- Preserve evidence-grounded outputs for future context without treating old reports as current truth.

Key fields:

- `report_memory_id`
- `dataset_id`
- `table_id`
- `schema_hash`
- `source_run_id`
- `summary`
- `findings_json`
- `evidence_refs_json`
- `report_sections_json`
- `created_at`

Relationships:

- Scoped by dataset/table/schema.
- Linked to `agent_runs` through `source_run_id`.
- May link to query memory through future evidence refs.

Read/write timing:

- Written after summary/report generation succeeds.
- Read as contextual summary only, with current evidence preferred for final answers.

### 4.7 agent_global_preferences

Purpose:

- Persist stable app/user preferences that are not table facts.
- Keep preferences separate from dataset/table memory.

Key fields:

- `preference_key`
- `preference_value_json`
- `scope`
- `updated_at`

Relationships:

- Independent from `agent_runs` by default.
- May support explicit app/user/dataset scope later.

Read/write timing:

- Written when a user or app setting changes.
- Read before report formatting or runtime defaults are selected.

## 5. Suggested Indexes

Suggested indexes, expressed as planning text only:

- `agent_runs(dataset_id, table_id, created_at)`
- `agent_runs(run_id)`
- `agent_table_memory(dataset_id, table_id, schema_hash)`
- `agent_query_memory(dataset_id, table_id, schema_hash, intent)`
- `agent_report_memory(dataset_id, table_id, schema_hash, created_at)`
- `agent_tool_calls(run_id, tool_name)`

These indexes are intended to support history lookup, table-scoped memory retrieval, schema-version isolation, and tool-call audit review.

## 6. Schema Hash Strategy

The initial `schema_hash` should be based on ordered column names and normalized column types.

Future extensions may include:

- Optional `file_hash` for uploaded file identity.
- Optional `sheet_hash` for workbook sheet identity.
- Optional table profile version when profiling logic changes.

Rules:

- If `schema_hash` changes, query/report memory should not be blindly reused.
- Table memory can create a new version for the new schema.
- Old memory can remain available for audit but should not be default runtime context.
- Global preference memory is unaffected by table schema changes.

This keeps a renamed or replaced table from silently inheriting SQL or findings from an incompatible structure.

## 7. Memory Read Path

Future runtime read path:

1. Receive `AgentRunRequest`.
2. Resolve `dataset_id`, `table_id`, and `table_name`.
3. Compute or fetch `schema_hash`.
4. Load `agent_table_memory` for the exact dataset/table/schema scope.
5. Load recent successful `agent_query_memory` for the same table/schema.
6. Load recent report memory summaries only when useful for context.
7. Pass selected memory summaries into runtime/tool context.

If table memory is missing, runtime should proceed with current schema/profile fallback. If table identity is ambiguous, runtime should ask for clarification or return a controlled rejection.

## 8. Memory Write Path

Future runtime write path:

1. Persist `agent_run` at start.
2. Persist `agent_steps` and `agent_tool_calls` during runtime.
3. Update table memory after profiling or schema inspection.
4. Write query memory after SQL validation/execution.
5. Write report memory after summary/report generation.
6. Write failure patterns for rejected/failed runs without storing raw data.

Tools should return `ToolResult`; the runtime or persistence layer should decide what memory is written. This keeps tool wrappers deterministic and avoids hidden side effects.

## 9. Multi-Agent Compatibility

Future agents can share the same memory store while keeping access scoped:

- `SQLAgent` uses table/query memory.
- `InsightAgent` uses query/report/evidence memory.
- `ReportAgent` uses report/global preference memory.
- `Orchestrator` owns memory access policy.
- Shared memory access is constrained by `run_id`, `table_id`, `schema_hash`, and `memory_type`.

This preserves the current single-Agent MVP while leaving room for later Multi-Agent orchestration.

## 10. Data Minimization

Rules:

- Do not store raw rows by default.
- Store aggregates, summaries, and evidence refs.
- Do not store provider credentials.
- Do not store private career-prep or personal study notes.
- Support future removal by `dataset_id` and `table_id`.
- Avoid cross-table memory leakage.
- Keep report memory evidence-grounded instead of narrative-only.

## 11. Open Decisions

- Reuse existing history records or create dedicated `agent_*` records.
- Exact source and lifecycle of `dataset_id` and `table_id`.
- Whether `schema_hash` should include column names/types only or also file/sheet identity.
- Whether report memory stores full sections or summary plus evidence refs.
- Whether failed SQL should be stored fully or normalized.
- How frontend should display Agent memory later.
- Whether table rename should preserve `table_id` or create a new table identity.

## 12. Future Micro-Steps

- M5.4.7 AgentRun Persistence Skeleton
- M5.4.8 Agent ToolCall Persistence Skeleton
- M5.4.9 Table Memory Persistence Skeleton
- M5.4.10 Query / Report Memory Skeleton
- M5.4.11 Runtime Memory Read/Write Controlled Integration
- M5.4 Final Regression

Do not implement these in M5.4.6.
