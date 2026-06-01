# PHASE 4 READINESS REVIEW

> Delta audit against v0.8.3 state. 2026-06-01.

---

## DECISION: NO-GO

Phase 4 cannot start. 2 blockers and 5 high-risk items require resolution first.

**Estimated confidence after fixes: 85%**

---

## BLOCKERS

### B1. Investigation store never scoped per-investigation

`investigation-store.ts` is a singleton. `handleStart` in `investigation-workspace.tsx` does NOT call `reset()` or `clear()` before starting a new analysis. Consequences:

- `turns[]` from investigation A bleed into investigation B's API context
- `keyFindings` from prior runs are sent as `prior_findings` to new requests
- `compressedSummary` accumulates across sessions
- `drillChain` grows unboundedly (capped at 20 but never scoped)

**Impact**: Multi-investigation UX is broken. Context pollution produces degraded AI responses.

**Fix**: Call `reset()` at the start of `handleStart`, or scope investigation state per `runId`.

### B2. No persist version field on any store

All 8 persisted stores lack a `version` property in their zustand persist config. Schema changes will silently merge stale localStorage data via shallow spread, corrupting state.

**Impact**: Any future store shape change risks silent data corruption for returning users.

**Fix**: Add `version: 1` to all 8 persist configs with `migrate` functions.

---

## RISKS

### R1. Cross-store getState coupling [HIGH]

`data-store.ts:66` calls `useAnalysisStore.getState().runs` inside `getDatasetMeta()`. Creates an implicit dependency not captured in the type interface. Silently breaks if `analysis-store` shape changes.

### R2. Store imports UI component type [HIGH]

`analysis-store.ts:11` imports `ChartSpec` from `@/components/ui/ai-chart`. Store layer depends on a UI component's type definition. Refactoring the chart component breaks the store.

**Fix**: Extract `ChartSpec` to a shared types file.

### R3. Legacy migration dual-write race condition [MEDIUM]

`investigation-store.ts:83-111` and `sql-editor-store.ts:46-70` call `localStorage.setItem` at module load time before zustand persist initializes. If persist reads the old key first, migration data is lost.

**Risk level**: Low in practice (module evaluation is synchronous in bundlers), but not guaranteed.

### R4. Only analysis-store has hydration recovery [MEDIUM]

`analysis-store.ts` uses `onRehydrateStorage` to call `recoverInterruptedRuns()`. The other 7 stores have no recovery path. If `investigation-store` is persisted with `stage: "analyzing"` from a crash, it stays stuck forever.

**Fix**: Add `onRehydrateStorage` to `investigation-store` to reset stale stages.

### R5. sql-editor-store embeds HTTP fetch [MEDIUM]

`sql-editor-store.ts:229` directly imports and calls `executeQuery` from `@/services/api`. Embeds fetch logic inside state management. Violates separation of concerns and makes the store untestable without mocking HTTP.

### R6. No store reset on component unmount [LOW]

When `InvestigationWorkspace` unmounts (navigation away), only the SSE AbortController is cleaned up. Store state (`stage`, `turns`, `keyFindings`, `drillChain`) persists in memory and localStorage.

### R7. Panel shadows AnalysisMode type [LOW]

`ai-analysis-panel.tsx:33-34` re-defines `AnalysisMode` locally while other files import it from `analysis-store`. Drift risk.

---

## NON-BLOCKERS (acknowledged, acceptable)

| Area | Status | Notes |
|------|--------|-------|
| Store ownership | **CLEAN** | Zero cross-store writes, zero direct mutations, zero duplicate state |
| SSE lifecycle | **CLEAN** | Proper abort, timeout (120s), retry (2x), cleanup on unmount |
| activeRun flow | **CLEAN** | State transitions correct, crash recovery via `recoverInterruptedRuns` |
| activeTable flow | **CLEAN** | Selection paths consistent, stale-on-mount is acceptable (remembers last) |
| Routing (core 6 routes) | **CLEAN** | Consistent across sidebar, command palette, global search, keyboard shortcuts |
| App Router patterns | **CLEAN** | No Pages Router remnants, proper route groups, code splitting |
| Utils | **CLEAN** | Self-contained, no store/service imports |
| Legacy store imports | **CLEAN** | Zero import references to removed stores |
| Backend layer | **CLEAN** | Not audited (out of scope for frontend P4 readiness) |

---

## ROUTING HOUSEKEEPING (non-blocking)

| Item | Location | Severity |
|------|----------|----------|
| 4x `<a href>` instead of `<Link>` | virtual-table:22, settings:62, header:63, sidebar:72 | Low |
| No `error.tsx` or `not-found.tsx` anywhere | `app/` tree | Low |
| `/performance` has zero inbound links | Dead page | Low |
| No centralized route constants | Duplicated across 5+ files | Low |
| `/history` missing keyboard shortcut | `app-shell.tsx` | Low |
| Legacy test file names | `__tests__/workflow-store.test.ts` etc. | Cosmetic |

---

## REQUIRED FIXES BEFORE P4

| # | Fix | Effort | Priority |
|---|-----|--------|----------|
| 1 | Scope investigation store per run or call `reset()` on new investigation start | 1h | Blocker |
| 2 | Add `version: 1` + `migrate` to all 8 persist configs | 2h | Blocker |
| 3 | Extract `ChartSpec` from UI component to shared types | 30m | High |
| 4 | Remove `data-store → analysis-store` getState coupling | 1h | High |
| 5 | Add `onRehydrateStorage` to investigation-store (reset stale stages) | 30m | Medium |
| 6 | Move `executeQuery` call out of sql-editor-store into a service/hook | 1h | Medium |

**Total estimated effort: ~6 hours**

---

## P4 READINESS CHECKLIST

After fixes above are applied:

- [ ] Investigation store resets between runs
- [ ] All 8 persist configs have version + migrate
- [ ] ChartSpec lives in shared types
- [ ] No cross-store getState() calls
- [ ] investigation-store has hydration recovery
- [ ] sql-editor-store doesn't import executeQuery
- [ ] `npx next build` passes
- [ ] Manual smoke test: 2 consecutive investigations don't share context
