# M5.5.1 Frontend Agent API Client Contract

## 1. Goal

Add a typed frontend API client contract for `POST /api/agent/runs` without implementing Agent UI.

## 2. Files Changed

- `frontend-react/src/services/api/agent.ts`
- `frontend-react/src/services/api.ts`
- `docs/reports/m5-5-1-frontend-agent-api-client-contract.md`
- `CURRENT_SESSION.md`

## 3. Implemented Scope

- AgentRun request type
- AgentRun response type
- `createAgentRun` API function
- skeleton mode default
- no `simulated_chain` UI exposure
- no provider credential handling

## 4. Contract

- endpoint: `POST /api/agent/runs`
- method: `POST`
- default mode: `skeleton`
- request fields: `user_input`, `table_name`, `provider_requested`, `mode`
- response fields: `run`, `runtime_mode`, `routed_intent`, `warnings`
- warnings handling: response keeps optional `warnings` array for UI rendering later
- fallback metadata fields: `run.provider_requested`, `run.provider_used`, `run.fallback_triggered`, `run.fallback_type`, `run.fallback_reason`

## 5. UIUX Boundary

This step does not implement UI, but it preserves the M5.5.0 UIUX lock:

- no new visual system
- no new UI library
- no component changes
- no Analyze page changes

## 6. What M5.5.1 Does Not Do

- no Analyze UI
- no Agent Run form
- no result card
- no fallback badge UI
- no warnings panel UI
- no unsupported state UI
- no history list
- no run detail page
- no backend changes
- no real DB persistence
- no real LLM credential UI
- no `simulated_chain` UI
- no package changes

## 7. Validation

- backend import: passed
- frontend build: passed with existing lint warnings only
- safety search: passed after reviewing existing non-sensitive matches in frontend services/tests
- simulated_chain frontend exposure search: passed, no frontend services match
- no backend code changed: passed
- no UI code changed: passed
- no package change: passed

## 8. Next Step

Wait for user review. After approval, enter:

```text
M5.5.1 Merge Validation
```

Do not start M5.5.2 in this round.
