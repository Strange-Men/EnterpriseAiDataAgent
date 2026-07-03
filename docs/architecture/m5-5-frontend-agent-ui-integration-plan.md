# M5.5 Frontend Agent UI Integration Plan

## 1. Goal

Plan the frontend integration of the M5.4 Agent Runtime + API + InMemory Persistence Boundary.

M5.5 should introduce an Agent Run Mode in the frontend while keeping real DB persistence, history/detail APIs, real LLM provider execution, and durable memory out of scope.

## 2. M5.4 Backend Boundary

- `POST /api/agent/runs` exists.
- `skeleton` mode works.
- `AgentRunRecord` is saved to `InMemoryAgentRunStore`.
- Provider fallback metadata is preserved.
- Warnings are preserved.
- Unsupported controlled trace is preserved.
- `simulated_chain` route remains disabled and returns controlled `501` behavior.
- Persistence is process-local and ephemeral.

## 3. Frontend Audit

- frontend root: `frontend-react`
- Analyze page location: `frontend-react/src/app/(shell)/analyze/page.tsx`
- Analyze workspace implementation: `frontend-react/src/components/investigation/investigation-workspace.tsx`
- existing API client / fetch helper: `frontend-react/src/services/api.ts` and `frontend-react/src/services/api/http-client.ts`
- backend base URL config: `NEXT_PUBLIC_API_URL` with fallback to `http://localhost:8000`; `apiUrl()` prepends `/api` when needed.
- reusable UI components: `Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `StatusBadge`, `PanelSkeleton`, `EmptyState`, `PageHeader`, `DataTable`, `DropdownMenu`, `Tooltip`, `TabGroup`.
- current loading/error pattern: `PanelSkeleton`, inline spinner, `StreamingIndicator`, `ErrorBoundary`, `ErrorFallback`, and `react-hot-toast`.
- current table/query/report flow: Analyze renders `InvestigationWorkspace`, which currently has AI Query and Expert SQL tabs, uses table context from stores, submits natural language analysis, streams progress, and renders results through `StreamingOutput`.

## 4. UIUX Consistency Requirements

M5.5 Agent Run Mode must inherit the existing frontend visual language.

The Agent UI should feel like a native extension of the current Analyze workspace, not a separate product surface.

It should reuse existing layout, cards, panels, badges, buttons, loading states, error states, spacing, typography, table preview style, report rendering pattern, and page hierarchy.

No new UI library, no unrelated visual redesign, and no global style refactor should be introduced in M5.5.

- existing page layout pattern: full-height shell pages, compact workbench panels, tab bars, border separators, `p-4` / `p-6` content rhythm, and constrained analysis content such as `max-w-3xl`.
- existing card / panel style: `bg-[var(--bg-secondary)]`, `border border-[var(--border-default)]`, `rounded-lg`, compact headers, and restrained shadows.
- existing badge style: small rounded badges using `success`, `warning`, `error`, `info`, `accent`, and `muted` variants.
- existing button style: `Button` variants `primary`, `secondary`, `ghost`, `danger`, and `danger-ghost` with small/medium compact sizing.
- existing loading / error style: `PanelSkeleton`, `StreamingIndicator`, small inline spinners, toast notifications, and bordered warning/error cards.
- existing report/result rendering style: `StreamingOutput`, `RunHeader`, `RunSections`, bordered report sections, compact tables, and muted metadata rows.
- reusable components identified: `Button`, `Textarea`, `Select`, `Card`, `Badge`, `PanelSkeleton`, `EmptyState`, `StreamingOutput`, `RunHeader`, and `RunSections`.
- Agent UI should reuse: the Analyze tab bar, table selector, textarea/input rhythm, compact action button, result cards, warning badge/card pattern, and muted metadata typography.
- Agent UI must not change: Upload, Preview, Query, Report, History, global theme variables, existing navigation, existing Analyze flow, or current visual hierarchy.

## 5. Proposed Agent Run Mode UX

- Add Agent Run Mode inside the existing Analyze page or analysis workspace.
- Prefer adding it as a native Analyze workspace mode/tab next to existing AI Query and Expert SQL flows.
- User enters a natural language request.
- User selects or uses current table context.
- Frontend calls `POST /api/agent/runs` with `mode=skeleton`.
- Show run status.
- Show provider requested / provider used.
- Show fallback badge when `fallback_triggered=true`.
- Show warnings panel.
- Show unsupported controlled trace message.
- Show ephemeral persistence notice.

Important:

Agent Run Mode must look like part of the existing Analyze workspace.

It must not look like a separate chatbot product.

## 6. Request Contract

Plan request body:

```json
{
  "user_input": "分析销售数据",
  "table_name": "sales",
  "provider_requested": "mock",
  "mode": "skeleton"
}
```

Rules:

- `mode` must default to `skeleton`.
- Do not expose `simulated_chain` as selectable UI yet.
- Do not require real provider credentials.
- `provider_requested` may default to `mock`.

## 7. Response Rendering Contract

Plan fields to render:

- `run.run_id`
- `run.status`
- `run.intent`
- `run.provider_requested`
- `run.provider_used`
- `run.fallback_triggered`
- `run.is_simulated`
- `warnings`
- metadata persistence mode if available

## 8. Error Handling

- `422` empty input should render an inline validation message.
- `501` `simulated_chain` is not reachable from UI, but should still be handled gracefully if returned.
- Network failure should render a non-blocking error card.
- Unsupported intent should render as a controlled warning, not a crash.
- Provider fallback should render as an informational badge, not an error.

## 9. Scope Boundaries

M5.5 does:

- frontend Agent Run Mode
- call `POST /api/agent/runs`
- render AgentRun response
- render fallback/warnings/unsupported states
- show ephemeral memory notice
- maintain existing UIUX consistency

M5.5 does not:

- no history list
- no run detail page
- no durable memory history
- no SQLite persistence
- no database migration
- no real provider credential handling
- no `simulated_chain` UI
- no Multi-Agent UI
- no new UI library
- no global visual redesign

## 10. Implementation Micro-Steps

- M5.5.1 Frontend Agent API Client Contract
- M5.5.2 Analyze Agent Run UI Skeleton using existing UI style
- M5.5.3 Agent Run Result Card reusing existing card/report components
- M5.5.4 Fallback / Warning / Unsupported States using existing badge/alert patterns
- M5.5.5 UIUX Consistency Regression
- M5.5 Final Tag

## 11. Risks

- Confusing in-memory persistence with durable history.
- Exposing `simulated_chain` too early.
- Presenting mock fallback as a real provider result.
- Breaking existing Analyze flow.
- Adding frontend dependencies unnecessarily.
- Introducing a mismatched Agent UI style.
- Making Agent Run Mode look like a separate product.

## 12. Recommendation

Start with API client contract first, then UI skeleton.

All implementation steps must preserve existing UIUX consistency.
