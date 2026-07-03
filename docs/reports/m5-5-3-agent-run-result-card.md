# M5.5.3 Agent Run Result Card

## 1. Goal

Connect the Analyze Agent Run tab to the typed frontend Agent API client and render a basic Agent Run Result Card using the existing Analyze workspace UI style.

## 2. Files Changed

- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `docs/reports/m5-5-3-agent-run-result-card.md`
- `CURRENT_SESSION.md`

## 3. createAgentRun Integration

- integration location: Agent Run tab in `InvestigationWorkspace`
- API client: `createAgentRun` from `@/services/api`
- endpoint: `POST /api/agent/runs`
- request mode: fixed to `skeleton`
- request fields: `user_input`, `table_name`, `provider_requested`, `mode`
- provider requested: `mock`
- missing table behavior: inline local error message

## 4. Result Card Fields

The basic result card renders:

- `run_id`
- `status`
- `intent`
- `provider_requested`
- `provider_used`
- `fallback_triggered`
- `is_simulated`
- lightweight warnings list when present

## 5. UIUX Reuse

- Reuses the existing Analyze workspace tab.
- Reuses `Textarea`, `Button`, `Badge`, and `Card`.
- Reuses compact spacing, muted metadata labels, bordered panels, and existing warning/error panel style.
- Does not introduce a separate Agent visual system.
- Does not add a UI library or animation library.

## 6. Scope Boundaries

- no full result report card
- no history list
- no run detail page
- no durable memory UI
- no real provider credential UI
- no simulated chain exposure
- no backend changes
- no package changes
- no new dependency
- no tag

## 7. Validation

- backend import: passed
- frontend build: passed with existing lint warnings only
- API/result field search: passed
- simulated chain exposure search: passed, no frontend source match
- safety search: passed after reviewing broad existing non-sensitive matches
- no backend code changed: passed
- no package change: passed

## 8. Next Step

Wait for user review. After approval, enter:

```text
M5.5.3 Merge Validation
```

Do not start M5.5.4 in this round.
