# M5.4 Agent Runtime / API / Persistence Plan

## 1. Background

M5.3 completed Agent pipeline tool wrappers, but production Agent runs are not enabled yet.

M5.1 and M5.2 established native Agent contracts, routing, deterministic mock execution, and an optional harness. M5.3 added explicit wrappers for SQL generation, readonly SQL execution, summary, and report output through safe injected / simulated paths.

M5.4 must decide how those pieces become a backend Agent Runtime that can be called by API, persisted safely, and later shown in frontend history/detail without changing existing routes or business behavior.

## 2. Existing Backend Capability Map

| Area | Current Location | Current Behavior | M5.4 Relevance |
|---|---|---|---|
| Upload | `backend/routes/upload.py`, `backend/services/data_service.py::upload_file`, `database/file_loader.py` | Upload route enforces size limits, loads file content, imports table data through service/database layer. | Agent run request may reference existing uploaded tables; M5.4 should not alter upload behavior. |
| Table preview / schema | `backend/routes/tables.py`, `backend/services/data_service.py`, `database/db_manager.py` | Table list, preview, schema, paginated data, rename, delete, export. | Agent runtime can use table name/schema context later, but M5.4.0 does not implement that integration. |
| Natural language analysis | `backend/routes/ai.py::ai_query`, `backend/services/ai_pipeline.py::run_ai_query` | Existing API route runs natural language to SQL to optional execution/explanation through existing service flow. | Agent route must not replace this existing route in early M5.4. |
| Expert SQL | `backend/routes/query.py::execute_query`, `get_history`, `explain_query`, `export_query` | Readonly query execution, pagination, cancellation, export, and query history write. | Agent SQL tool path must remain separate from existing query route until persistence is designed. |
| Report generation | `backend/routes/ai.py::generate_report`, `backend/services/report_builder.py::build_report` | Builds markdown from existing analysis run dictionaries. | M5.4 runtime may normalize AgentRun into report input later; M5.4.0 only plans the boundary. |
| History | `backend/services/query_history.py::QueryHistory`, `backend/routes/query.py::get_history`, frontend `sql-history-store.ts` | SQL history is a DuckDB-backed ring buffer; frontend also preserves local AI entries. | AgentRun history should not be forced into query_history without explicit schema decision. |
| Detail | Frontend `frontend-react/src/app/(shell)/analyze/[runId]/page.tsx`, `analysis-store.ts` | Detail page reads local analysis runs and renders sections, timeline, trace, evaluation. | Future Agent detail can reuse timeline/detail concepts after backend run retrieval exists. |
| Database/session access | `database/db_manager.py`, `database/query_executor.py`, `backend/services/data_service.py` | DuckDB singleton connection manager and readonly QueryExecutor. | Agent persistence should use the existing database access style or a dedicated repository layer, not route-side writes. |
| Error handling | `backend/main.py`, route-level `HTTPException`, `backend/utils/json_safe.py` | Global handlers return structured error JSON; route handlers sanitize operational errors. | Agent API should follow the same status/error/detail style and never leak internal provider errors. |
| Tests | `tests/unit/test_agent_*`, `tests/test_*`, frontend app/store tests | Agent tests are unit-focused; current full pytest is stable. | M5.4 should add small focused runtime/API/persistence tests before broad integration. |

## 3. M5.4 Goal

Turn M5.3 tool wrappers into a backend Agent Runtime that can be called safely by API and later shown in frontend history/detail.

M5.4 should make the Agent a real backend workflow boundary while preserving existing query, AI, table, report, and history routes.

## 4. Non-goals

- no frontend implementation in early M5.4
- no external model provider by default
- no graph orchestration framework
- no multi-agent execution
- no retrieval layer
- no broad UI rewrite
- no modification to existing API behavior
- no database migration in M5.4.0

## 5. Proposed Runtime Design

The minimal Agent Runtime should be a backend module that turns a request into an `AgentRun`.

Suggested runtime boundary:

1. Validate request input:
   - `user_goal`
   - optional `table_name`
   - optional `selected_mode` override
   - provider preference, defaulting to mock/simulated behavior
   - runtime options such as `max_steps`
2. Route intent with the existing deterministic router.
3. Select a runtime plan:
   - fast safe-fail for unsupported intent
   - clarification for ambiguous intent
   - simulated tool chain for initial M5.4 runtime
   - later explicit real-path wrappers after review
4. Run tool chain through existing M5.3 wrappers.
5. Collect:
   - `AgentStep`
   - `ToolCall`
   - `ToolResult`
   - `EvidenceRef`
   - provider/fallback metadata
6. Produce an `AgentRun`.
7. Keep persistence optional until the schema is approved.

Runtime invariants:

- native EAI contracts remain the output contract
- mock/simulated metadata must be accurate
- errors normalize into Agent status and tool result status
- no existing route behavior changes
- no frontend assumptions inside runtime

## 6. Proposed API Boundary

M5.4 should plan but not implement these endpoints in M5.4.0.

### POST /api/agent/runs

Purpose:

- Start one Agent run from a user goal.

Request fields:

- `user_goal: str`
- `table_name: str | None`
- `provider_requested: str = "mock"`
- `execution_mode: "simulated" | "real"` with simulated as default
- `max_steps: int = 5`

Response fields:

- `run: AgentRun`
- `status`
- `error`

Error semantics:

- `400` for empty goal or invalid request
- `422` for unsupported execution mode or unsafe request
- `500` only for unexpected runtime failure after sanitization

Existing routes remain unchanged:

- `/api/ai/query`
- `/api/query`
- `/api/ai/generate-report`
- `/api/query/history`

### GET /api/agent/runs

Purpose:

- List persisted Agent runs after persistence is implemented.

Response fields:

- `items: list[AgentRunSummary]`
- `limit`
- `offset`
- `has_more`

Error semantics:

- If persistence is disabled, this endpoint should not exist or should return a clear disabled response in a later reviewed step.

### GET /api/agent/runs/{run_id}

Purpose:

- Retrieve one persisted Agent run with steps, tool calls, and evidence.

Response fields:

- `run: AgentRun`

Error semantics:

- `404` for missing run
- `500` for sanitized unexpected retrieval failure

## 7. Proposed Persistence Boundary

M5.4 should not implement migration in M5.4.0.

Persistence should be designed around these logical records:

- `AgentRun`
- `AgentStep`
- `ToolCall`
- `ToolResult`
- `EvidenceRef`
- provider metadata
- fallback metadata
- status and error fields
- created/updated timestamps

Possible storage options:

| Option | Description | Pros | Risks |
|---|---|---|---|
| New `agent_runs` style tables | Dedicated tables for Agent runs, steps, calls, results, evidence. | Clean model, queryable detail, avoids mixing SQL history and Agent history. | Requires migration design and careful serialization. |
| Store AgentRun JSON blob | One table with run summary columns plus full JSON. | Small first migration, easy detail retrieval. | Harder querying and partial updates. |
| Reuse query history | Add Agent records into existing query history flow. | Fast to surface in current History UI. | Blurs SQL query records with Agent workflows and can regress current history semantics. |

Recommendation for review:

- Use dedicated Agent persistence rather than mutating `query_history`.
- Keep a summary projection for list views.
- Store full AgentRun JSON or normalized subrecords after schema review.

## 8. Frontend Placement Plan

M5.4.0 does not implement frontend changes.

Planned placement:

- Analyze page: add an Agent Run mode after backend runtime/API are stable.
- History list: show Agent Run records separately or with a clear `type="agent"` marker.
- Detail page: render Agent timeline, tool calls, evidence, status, and fallback metadata.

Existing frontend locations reviewed:

- `frontend-react/src/app/(shell)/analyze/page.tsx`
- `frontend-react/src/app/(shell)/analyze/[runId]/page.tsx`
- `frontend-react/src/app/(shell)/history/page.tsx`
- `frontend-react/src/stores/analysis-store.ts`
- `frontend-react/src/stores/sql-history-store.ts`

## 9. Risk Analysis

| Risk | Why It Matters | Control |
|---|---|---|
| Existing pipeline behavior regression | Current AI/query routes are already user-facing. | Keep Agent route separate and do not modify existing route behavior. |
| Route compatibility | Frontend depends on existing response shapes. | Add new Agent API only after contract tests. |
| Persistence schema complexity | AgentRun contains nested steps, calls, results, evidence. | Decide JSON blob vs normalized tables before implementation. |
| Provider leakage | Runtime metadata can accidentally imply real provider execution. | Default to simulated path and preserve `is_simulated` / fallback fields. |
| Frontend UIUX risk | Agent timeline is richer than current local analysis runs. | Wait for backend API + persistence stability before UI work. |
| Overbuilding risk | Runtime, API, persistence, and UI could become too large if combined. | Keep M5.4 micro-steps narrow and review each step. |

## 10. M5.4 Micro-step Plan

| Step | Goal | Scope | Files Allowed | Acceptance |
|---|---|---|---|---|
| M5.4.1 | Agent Runtime Skeleton | Define runtime boundary and request/result helpers without route or persistence. | future runtime module + tests | Runtime imports cleanly and can build an unsupported/clarification AgentRun. |
| M5.4.2 | Agent Runtime Simulated Chain | Connect router + M5.3 wrappers through simulated/injected chain. | runtime module + tests | Completed AgentRun transcript produced without provider/network. |
| M5.4.3 | Agent API Contract Plan or API Skeleton | Define request/response schema and optional route skeleton after runtime tests. | route/schema docs or minimal route + tests | Existing routes unchanged; API contract test passes. |
| M5.4.4 | Agent Persistence Plan / Schema Draft | Decide storage model and draft schema without broad migration. | docs or migration draft only after approval | User approves table/JSON strategy before implementation. |
| M5.4.5 | Agent Runtime Regression | Cross-module regression for runtime/API/persistence boundary. | tests + report | focused tests and full pytest pass. |
| M5.4 Final Merge Validation | Merge reviewed M5.4 work. | report only unless fixes required | master CI passes. |

## 11. Decision Needed Before Implementation

- Runtime first vs persistence first.
- API skeleton before database schema or after.
- Whether Agent runs should be stored in existing history table or new Agent-specific storage.
- Whether frontend should wait until backend route and persistence are stable.
- Whether M5.4.1 should remain simulated-only or expose a real-path flag behind tests.
- Whether Agent detail should store fully normalized subrecords or an AgentRun JSON blob first.
