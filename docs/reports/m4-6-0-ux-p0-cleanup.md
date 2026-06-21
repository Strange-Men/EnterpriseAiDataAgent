# M4-6.0 UX P0 Cleanup

> Date: 2026-06-21
> Branch: `m4-6-0-ux-p0-cleanup`
> Scope: P0 UX fixes before visual polish — no new features, no backend changes

---

## 1. Why This Step

M4-6 UI/UX Visual Polish Plan identified 4 P0-level UX problems that would confuse HR or interviewers before any visual polish could help. These are functional/navigation issues, not visual ones:

1. Feature flags hiding all AI capabilities — project looks like a bare SQL shell
2. Two competing "history" concepts confusing users
3. No cancel/stop mechanism for long-running AI queries
4. Home page entries navigating to wrong destinations
5. Widespread `text-[10px]` making content hard to read

Fixing these P0 issues first ensures the visual polish in M4-6.1+ lands on a solid functional foundation.

---

## 2. Problems Fixed

### 2.1 Home Page Entry Navigation

**Before:** Recent SQL queries navigated to `/analyze` without loading the SQL. Demo flow steps were decorative (not clickable). Deploy notice used `AlertCircle` (warning icon) for an informational message.

**After:**
- Recent SQL queries now load the SQL into a new editor tab via `useSqlEditorStore.addTab()` before navigating to `/analyze`
- Demo flow steps are clickable buttons linking to `/data` (steps 1-2) and `/analyze` (steps 3-4)
- Deploy notice uses `Info` icon instead of `AlertCircle`

**Files:** `src/app/(shell)/page.tsx`

### 2.2 Unified History Concept

**Before:** `AnalysisWorkspacePanel` had a "历史" (History) button showing analysis runs, creating a second "history" concept separate from the main `/history` page.

**After:**
- Renamed the button from "历史" to "最近分析" (Recent Analyses)
- Added "查看全部历史 →" link at the bottom of the recent runs list, linking to `/history`
- Main `/history` page remains the single source of truth for all SQL + AI records

**Files:** `src/panels/analysis-workspace-panel.tsx`, `src/i18n/zh.ts`, `src/i18n/en.ts`

### 2.3 AI Query Cancel/Stop

**Before:** `InvestigationWorkspace` had `abortRef` internally but no visible Stop button. Users had to wait or navigate away.

**After:**
- Added a visible "停止生成" (Stop) button that appears next to the submit button during loading
- Uses existing `abortRef.current?.abort()` to cancel the stream
- Shows toast notification "已停止生成" on stop
- Button uses red styling to indicate destructive action

**Files:** `src/components/investigation/investigation-workspace.tsx`, `src/i18n/zh.ts`, `src/i18n/en.ts`

### 2.4 Feature Flags

**Before:** All 12 feature flags were `false`, hiding core AI capabilities.

**After:** 3 core flags enabled:

| Flag | Before | After | Reason |
|------|--------|-------|--------|
| `showAiButtonsInSqlWorkspace` | false | **true** | AI Explain/Insights in SQL workspace is a core differentiator |
| `showAiSqlInputInWorkspace` | false | **true** | Natural language → SQL is a core feature |
| `showAutonomousMode` | false | **true** | Multi-step autonomous analysis is a core capability |
| `showQuickSqlPanel` | false | false | Experimental sidebar panel |
| `showTemplates` | false | false | Experimental, not fully polished |
| `showSchedule` | false | false | Experimental, not fully polished |
| `showDiffCompare` | false | false | Experimental, not fully polished |
| `showTimeline` | false | false | Experimental, not fully polished |
| `showSaveAsTemplate` | false | false | Depends on templates |
| `showChartsMode` | false | false | Not stable enough |
| `showAnomaliesMode` | false | false | Not stable enough |
| `showFullAnalysisMode` | false | false | Overlaps with autonomous |

**Files:** `src/config/features.ts`

### 2.5 Typography Readability

**Before:** 38 files used `text-[10px]` (10px) for user-facing text — too small for comfortable reading, especially for HR/interviewers.

**After:** Upgraded `text-[10px]` → `text-xs` (12px) in all critical user-facing areas:

| Area | Files Changed | Impact |
|------|--------------|--------|
| Home page | `page.tsx` | Recent query/analysis timestamps now 12px |
| Sidebar | `sidebar.tsx` | Brand subtitle and version text now 12px |
| App shell header | `app-shell.tsx` | Breadcrumb and shortcut hint now 12px |
| History panel | `sql-history-panel.tsx` | Type badges, metadata, action buttons, error text now 12px |
| Analysis workspace | `analysis-workspace-panel.tsx` | History items, action buttons, labels, evaluation text now 12px |
| Investigation workspace | `investigation-workspace.tsx` | Table info badge, labels, example questions header now 12px |
| AI analysis panel | `ai-analysis-panel.tsx` | Progress steps, drill-down hints, evaluation badges, diagnostics now 12px |

**Note:** Only changed critical user-facing paths. Some internal/debug `text-[10px]` (e.g., in performance page, timeline internals) left unchanged to avoid layout breakage.

---

## 3. History UX Decision

**Decision:** The main `/history` page is the single, unified history entry point.

- It already shows both SQL and AI records with type filtering (`all | sql | ai`)
- The `AnalysisWorkspacePanel` sidebar shows "最近分析" as a convenience shortcut, not a second history system
- A "查看全部历史 →" link directs users to the full history page
- AI analyses from `InvestigationWorkspace` are written to the unified `sql-history-store` with `type: "ai"`

---

## 4. AI Running State

**Implemented:** Visible Stop button with abort support.

- `InvestigationWorkspace` already had `abortRef` for stream cancellation
- Added a "停止生成" button that appears when `isLoading` is true
- Clicking calls `abortRef.current?.abort()` and resets loading state
- Toast notification confirms the stop action
- No backend changes required — AbortController was already wired into the stream

---

## 5. Validation Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Passed (no errors) |
| `vitest run` | ✅ 138 tests passed (11 files) |
| `next build` | ✅ All 11 routes built successfully |

---

## 6. Files Changed

| File | Changes |
|------|---------|
| `src/config/features.ts` | Enabled 3 core AI flags |
| `src/app/(shell)/page.tsx` | Fixed SQL query navigation, demo flow clickable, Info icon, font sizes |
| `src/panels/analysis-workspace-panel.tsx` | Renamed history → recent analyses, added "view all" link, font sizes |
| `src/components/investigation/investigation-workspace.tsx` | Added Stop button, font sizes |
| `src/panels/sql-history-panel.tsx` | Font size upgrades |
| `src/panels/ai-analysis-panel.tsx` | Font size upgrades |
| `src/layout/sidebar.tsx` | Font size upgrades |
| `src/layout/app-shell.tsx` | Font size upgrades |
| `src/i18n/zh.ts` | Added `ai.stop`, `ai.stopped`, `analysis.view-all-history`, updated `analysis.recent-runs` |
| `src/i18n/en.ts` | Added `ai.stop`, `ai.stopped`, `analysis.view-all-history`, updated `analysis.recent-runs` |

---

## 7. Remaining Work

| Item | Planned Phase |
|------|---------------|
| Full design token system (CSS variables for all colors) | M4-6.1 |
| Home page visual polish (layout, empty states, brand) | M4-6.2 |
| Data page responsive design | M4-6.3 |
| Analysis workspace polish (retry button, summary rendering) | M4-6.4 |
| History page unification improvements | M4-6.5 |
| True cancel for all AI modes (not just streaming) | Future |
| M5 Agent features | Not started |

---

## 8. Constraints Respected

- ✅ No new features added
- ✅ No backend changes
- ✅ No new UI libraries
- ✅ No `.env` changes
- ✅ No tag created
- ✅ No M5 Agent work started
- ✅ All existing tests pass
- ✅ Build passes
