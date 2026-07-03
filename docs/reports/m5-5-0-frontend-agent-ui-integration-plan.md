# M5.5.0 Frontend Agent UI Integration Plan

## 1. Goal

Plan the frontend Agent Run Mode based on the sealed M5.4 Agent Runtime + API + InMemory Persistence Boundary.

## 2. Base

- M5.4 tag: `v1.5.0-m5-4-agent-runtime-api-memory-boundary`
- master commit: `4eb9c87` at branch creation
- backend import: passed

## 3. Frontend Audit Summary

- frontend root: `frontend-react`
- Analyze page location: `frontend-react/src/app/(shell)/analyze/page.tsx`
- API client location: `frontend-react/src/services/api.ts`, `frontend-react/src/services/api/http-client.ts`
- backend base URL config: `NEXT_PUBLIC_API_URL` fallback to `http://localhost:8000`, with `/api` prefix normalization in `apiUrl()`
- reusable UI components: `Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `StatusBadge`, `PanelSkeleton`, `EmptyState`, `PageHeader`, `DataTable`, `DropdownMenu`, `Tooltip`, `TabGroup`
- loading/error pattern: `PanelSkeleton`, inline spinner, `StreamingIndicator`, `ErrorBoundary`, `ErrorFallback`, and `react-hot-toast`
- current analysis flow: `AnalyzePage` dynamically loads `InvestigationWorkspace`; the workspace has AI Query and Expert SQL tabs, table context, natural language input, provider selection, streaming progress, and `StreamingOutput` result rendering

## 4. UIUX Consistency Audit

- existing page layout pattern: full-height shell workspace, tab bar, compact panels, border separators, `p-4` / `p-6` spacing, and constrained analysis content width
- existing card / panel style: `bg-[var(--bg-secondary)]`, `border border-[var(--border-default)]`, `rounded-lg`, compact headers, and muted metadata text
- existing badge style: small rounded badges with success/warning/error/info/accent/muted variants
- existing button style: compact `Button` variants using accent primary, bordered secondary, ghost, and danger styles
- existing loading / error style: skeletons, small inline spinners, toast notifications, and bordered warning/error panels
- existing report/result rendering style: `StreamingOutput`, `RunHeader`, `RunSections`, bordered report cards, compact tables, and muted section metadata
- existing table / preview style: text-xs table rows, border-collapse, `border-[var(--border-default)]`, and `bg-[var(--bg-tertiary)]` headers
- reusable components identified: `Button`, `Textarea`, `Select`, `Card`, `Badge`, `PanelSkeleton`, `EmptyState`, `StreamingOutput`, `RunHeader`, `RunSections`
- Agent UI should reuse: Analyze workspace tabs, current table selector style, textarea rhythm, compact action buttons, result card pattern, fallback warning panel, and muted metadata rows
- Agent UI must not change: global theme variables, Upload / Preview / Query / Report / History visual baseline, existing Analyze flow, or shell navigation

## 5. Backend Contract Summary

- `POST /api/agent/runs`
- `skeleton` mode is the only M5.5 UI target
- `simulated_chain` remains disabled at route level and returns controlled `501` behavior
- provider fallback metadata is available on `run`
- warnings are returned in the response
- unsupported trace is controlled and can be rendered as warning state
- persistence is in-memory and ephemeral

## 6. M5.5 Planned Scope

- Agent Run Mode
- Agent API client
- result card
- fallback badge
- warnings panel
- unsupported controlled state
- ephemeral persistence notice
- UIUX consistency with existing Analyze workspace

## 7. M5.5 Out of Scope

- no history list
- no detail page
- no durable DB memory
- no SQLite migration
- no real provider credential UI
- no `simulated_chain` UI
- no Multi-Agent UI
- no new UI library
- no global visual redesign

## 8. Validation

- backend import: passed
- frontend audit completed: passed
- UIUX audit completed: passed
- no backend code changed: passed
- no frontend code changed: passed
- no package change: passed
- frontend build: passed with existing lint warnings only
- safety search: passed

## 9. Next Step

等待用户审查。通过后进入：

```text
M5.5.0 Merge Validation
```

Do not start implementation in this round.
