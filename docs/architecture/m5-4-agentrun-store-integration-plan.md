# M5.4 AgentRun Store Integration Plan

## 1. Goal

Plan how AgentRun persistence boundary should be integrated into Runtime and API without immediately implementing real database persistence.

This document is planning-only. It does not modify routes, runtime, database schema, or migrations.

## 2. Current State

- Runtime skeleton exists in `backend/agent/runtime.py`.
- Runtime simulated chain exists and can call M5.3 wrappers through injected controlled tools.
- API contracts exist in `backend/agent/api_contracts.py`.
- `POST /api/agent/runs` route exists in `backend/routes/agent.py`.
- `InMemoryAgentRunStore` exists in `backend/agent/memory_store.py`.
- `AgentRunRecord` can preserve `AgentRun`, steps, tool calls, warnings, and metadata.
- No real DB persistence exists yet.
- No Agent history/detail API exists yet.
- No frontend Agent UI exists yet.

M5.4.8 does not connect the store to runtime or route execution. It only defines the integration plan.

## 3. Integration Principles

- Runtime produces `AgentRun`.
- Route should not write memory directly except through a store boundary.
- Tools must not write memory directly.
- Store should be injected or resolved through a small boundary.
- In-memory store is for tests/demo only.
- Real DB store is a future implementation.
- Memory must stay dataset/table scoped.
- `schema_hash` must be included before real persistence.
- Store writes should be explicit and auditable.
- Store reads should be scoped by `run_id`, and later by `dataset_id`, `table_id`, and `schema_hash`.

The runtime should keep producing deterministic `AgentRuntimeResult`. Persistence should be an integration layer around that result, not a hidden side effect inside tool wrappers.

## 4. Proposed Runtime Integration

Future behavior:

1. Runtime receives `AgentRuntimeRequest`.
2. Runtime executes skeleton or simulated chain.
3. Runtime returns `AgentRuntimeResult`.
4. Integration layer wraps result into `AgentRunRecord`.
5. Store saves `AgentRunRecord`.
6. API response returns `AgentRunResponse`.

Important boundaries:

- Runtime should not import route modules.
- Runtime may accept an optional store later, but only through the `AgentRunMemoryStore` interface.
- Store write failure should not crash all execution in MVP; it should return a warning or controlled error depending on runtime mode.
- Runtime should not promote run traces into table/query/report memory by itself.
- Runtime should not select a real store based on environment variables.

The first integration step should keep runtime behavior stable: execute runtime first, wrap the result, then persist through the boundary.

## 5. Proposed API Integration

### POST /api/agent/runs

Future behavior:

- execute runtime
- save `AgentRunRecord` into store
- return `run_id` in response
- include persistence status metadata
- still no real DB until SQLite store stage

The current route should remain skeleton-only until explicit implementation approval. When store integration starts, route-level store wiring should be tested with `InMemoryAgentRunStore` first.

### GET /api/agent/runs/{run_id}

Future behavior:

- read `AgentRunRecord` by `run_id`
- return `AgentRunDetailResponse`
- include `tool_calls`, `steps`, and `warnings`
- return controlled not-found response for missing runs

This route should not be added in M5.4.8. It should wait until route-level store integration is reviewed.

### GET /api/agent/runs

Future behavior:

- list recent runs
- filter by `dataset_id`
- filter by `table_id`
- filter by `runtime_mode`
- filter by `status`
- add pagination later

This list API should return summaries only. Detailed steps and tool calls should remain in the detail API.

## 6. Store Boundary Options

### Option A: Route-level store injection

- route calls runtime
- route wraps result
- route saves record
- simple for MVP
- keeps runtime free of persistence details
- easiest to test with `TestClient` and `InMemoryAgentRunStore`

Tradeoff:

- route owns more orchestration logic until a higher-level orchestrator exists

### Option B: Runtime-level store injection

- runtime receives optional store
- runtime saves internally
- cleaner for execution-oriented orchestration later
- can persist partial steps closer to the point where they occur

Tradeoff:

- increases runtime coupling to persistence timing
- risks making tool-chain execution and memory writes harder to separate

### Option C: Orchestrator-level store integration

- future Orchestrator owns memory writes
- best for Multi-Agent
- separates route, runtime, and memory policy
- can coordinate SQLAgent, InsightAgent, and ReportAgent later

Tradeoff:

- requires an orchestrator layer that the current MVP does not yet have

Recommendation:

- M5.4 MVP: Option A.
- M6 Multi-Agent: move toward Option C.

## 7. Dataset/Table Scoped Persistence

Required fields before real persistence:

- `dataset_id`
- `table_id`
- `table_name`
- `schema_hash`
- `run_id`
- `runtime_mode`
- `status`
- `created_at`

Rules:

- If `dataset_id` or `table_id` is missing, save as unscoped draft or reject based on mode.
- If `schema_hash` is missing, the run trace can still be saved but should not be reused as stable table memory.
- Run trace can be saved without table memory promotion.
- Table/query/report memory promotion must be a later explicit step.
- `table_name` is a compatibility label, not a durable identity.
- `schema_hash` mismatch must prevent automatic context reuse.

The integration layer should preserve current runtime behavior while recording whether a run is scoped, partially scoped, or unscoped.

## 8. Failure and Partial Run Persistence

Plan:

- Successful runs should be saved.
- Rejected runs should be saved with rejection reason.
- Failed runs should be saved with error summary.
- Partial tool calls should be saved.
- Store warnings with the run record.
- Store provider fallback metadata for audit.
- Never store credentials.
- Never store raw rows by default.

For MVP behavior, store failure should be represented in response metadata instead of silently hiding the issue.

## 9. Multi-Agent Compatibility

- Current `AgentRunRecord` can become parent trace for future SQLAgent / InsightAgent / ReportAgent.
- Future `AgentStep` can include `agent_name` and role to distinguish agent participation.
- Tool calls remain reusable because they already carry `tool_name`, status, input/output summaries, provider metadata, and simulation flags.
- Orchestrator later controls memory write policy.
- Store interface should not assume single-agent forever.

The route-level MVP should not block later orchestrator-level ownership. It should treat the store as an interface, not as a global singleton hidden inside tools.

## 10. Future Implementation Micro-Steps

- M5.4.9 Route-Level InMemory Store Integration
- M5.4.10 AgentRun Detail API Skeleton
- M5.4.11 AgentRun List API Skeleton
- M5.4.12 SQLite Store Plan / Migration Plan
- M5.4.13 SQLite AgentRun Store Implementation
- M5.4 Final Regression

Each step should include focused tests, full pytest, safety search, provider leakage search, and DB/migration leakage review.

## 11. What Not To Do Yet

- no real SQLite store yet
- no migration yet
- no frontend yet
- no vector memory yet
- no table/query/report memory writes yet
- no Multi-Agent orchestration yet
- no global hidden memory writes
- no tool-level memory writes
