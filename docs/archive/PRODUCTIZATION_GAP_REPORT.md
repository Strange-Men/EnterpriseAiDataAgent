# Productization Gap Report — v0.8.4

> Generated: 2026-06-01
> Scope: Product UX audit across 10 dimensions
> Status: Audit complete — implementation roadmap in `P4_PRODUCTIZATION_ROADMAP.md`

---

## Executive Summary

The platform has strong backend engineering (338 tests, robust guardrails, streaming SSE) and a mature design system (v2 tokens, 17 UI primitives). However, **the frontend is split between two competing experiences** — the new shell-based `/analyze` workspace and the legacy 3-column workspace — creating significant user confusion. Three of six navigation pages (`/data`, `/query`, `/history`) are placeholders that redirect to `/analyze`, undermining the IA. The onboarding funnel is broken (CTA goes to wrong page). Zero component tests and only 34 E2E tests leave the product fragile for iteration.

**Overall productization readiness: 6/10** — strong engineering foundation, weak user-facing polish.

---

## 1. First-Time User Experience

### Score: 4/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **Onboarding CTA goes to wrong page** | HIGH | Home page "Start Your First Analysis" navigates to `/analyze`, but the first step is "Upload Data" which requires the legacy workspace. User lands on investigation page with no tables and no upload UI. |
| **No upload in the new shell** | CRITICAL | The `/data` page is a placeholder. File upload only exists in the legacy workspace (`/workspace-legacy`). A new user following the onboarding flow cannot upload data without discovering the legacy workspace. |
| **`timeAgo` not internationalized** | LOW | Home page relative timestamps ("just now", "3h ago") are hardcoded English regardless of locale. |
| **System status is stale** | MEDIUM | Status is fetched once on mount with no polling or refresh. API/db errors shown in red but no action offered. |
| **Empty state guidance mismatch** | MEDIUM | "Ready to analyze" empty state appears when tables exist but no runs — but there's no guidance on how to ask a question or what modes are available. |

### Root Cause
The v0.8.0 shell refactor created a new navigation structure but did not migrate the upload/query/data-management workflows from the legacy workspace. The result is a shell that promises features (Data, Query, History pages) it doesn't deliver.

---

## 2. End-to-End Analysis Workflow

### Score: 7/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **Linear workflow state machine** | MEDIUM | `investigation-store` drives a rigid `idle→uploading→profiling→analyzing→sql-ready→executing→done` flow. Users who deviate (e.g., run SQL first) cause state desynchronization. |
| **Silent error swallowing** | HIGH | 4 components catch errors and set data to `null` with no user feedback: `FileUploadPanel.handleTableClick`, `TableManagementPanel.handleSelect`, `ContextPanel.loadSchema`, `DataPreviewPanel` schema fetch. |
| **Implicit table selection** | MEDIUM | `QuestionInput` silently falls back to `tables[0]` if user doesn't explicitly select. With 5 tables, user may not realize which table is being analyzed. |
| **Mode selector lacks explanation** | MEDIUM | 6 analysis modes (autonomous, full-analysis, insights, explain, charts, anomalies) are shown as pills with no tooltips, descriptions, or recommended use cases. |
| **No upload → analysis handoff** | HIGH | After uploading a file in legacy workspace, user must manually navigate to the investigation workspace. No auto-transition or deep link. |

### What Works Well
- Streaming SSE with phase indicators (plan→step→summary) is polished
- Multi-step autonomous analysis with guardrails is technically sound
- Drill-down chain and evolution timeline are well-implemented
- Follow-up questions with context carry-forward work correctly

---

## 3. Discoverability of Existing Features

### Score: 3/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **3 of 6 nav pages are placeholders** | CRITICAL | `/data`, `/query`, `/history` show feature descriptions but no functionality. Users click "Data" expecting to upload/manage data, get redirected to `/analyze`. |
| **Features hidden in legacy workspace** | CRITICAL | Templates, reports, diff/compare, scheduled analysis, SQL history, saved queries, data quality — all exist only in `/workspace-legacy` with no discoverability from the shell. |
| **Hover-reveal actions** | MEDIUM | `TableManagementPanel` action buttons (SQL, Rename, Export, Delete) are `opacity-0` until hover. New users won't discover them. |
| **Command palette underutilized** | LOW | `Ctrl+K` command palette exists but only has 6 navigation items + 3 actions + recent runs. No commands for "Upload file", "Run SQL", "Export results", etc. |
| **Keyboard shortcuts undocumented** | LOW | `?` opens a shortcuts modal, but shortcuts aren't shown anywhere else in the UI. No onboarding tooltip. |
| **Badge cryptic** | LOW | Analysis run count badge shows "3A" with only a title attribute tooltip. |

---

## 4. Report/Export Usability

### Score: 6/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **Report dialog only in legacy workspace** | HIGH | `ReportDialog` is only accessible from `AnalysisWorkspacePanel` in `/workspace-legacy`. Not available in the shell's `/analyze` or `/analyze/[runId]` pages. |
| **Export only for query results** | MEDIUM | `ExportDropdown` exports SQL query results (CSV/JSON/Excel). No export for analysis runs, charts, or investigation context from the shell. |
| **CSV export NaN bug** | LOW | ISSUE-013: CSV export writes "nan" string for NaN values instead of empty. Open since v0.3.x. |
| **No PDF export** | LOW | Reports are Markdown-only. No PDF or formatted document export. |
| **Bundle export/import exists but hidden** | MEDIUM | `exportBundle`/`importBundle` API endpoints exist but no UI exposes them in the shell. |

---

## 5. History/Timeline Usability

### Score: 5/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **History page is a placeholder** | HIGH | `/history` shows feature cards but no actual history. The real history is in `AnalysisWorkspacePanel` (legacy) and the home page's "Recent Analyses" (last 5 only). |
| **No search/filter in shell** | MEDIUM | `sql-history-store` has search/filter but it's only accessible in the legacy workspace's `SqlHistoryPanel`. |
| **MAX_HISTORY = 20** | MEDIUM | Analysis store caps at 20 runs. Saved runs are preserved, but unsaved runs are evicted oldest-first. Users doing many analyses may lose history. |
| **No pagination in history** | LOW | Recent analyses on home page shows last 5 only. No "View all" link. |
| **Evolution chain not discoverable** | MEDIUM | `getEvolutionChain()` and `TimelineEvolution` component exist but are only accessible from the legacy workspace's analysis detail view. |

---

## 6. Template Usability

### Score: 5/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **Templates only in legacy workspace** | HIGH | `SaveTemplateDialog` and `ApplyTemplateDialog` are only accessible from `AnalysisWorkspacePanel` in `/workspace-legacy`. |
| **No template gallery** | MEDIUM | Templates are a flat list with name/description. No categories, tags, or recommended templates. |
| **Template adaptation is hidden** | MEDIUM | The "Adapt template to different table" flow exists but requires 5 clicks through a dialog. No drag-and-drop or one-click apply. |
| **MAX_TEMPLATES = 20** | LOW | Hard cap with no export/import for templates. |

---

## 7. Empty-State Experience

### Score: 6/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **Placeholder pages are dead ends** | HIGH | `/data`, `/query`, `/history` show `EmptyState` with "Go to Analyze" button. Users who navigate here feel lost — the sidebar promises these features but they don't exist. |
| **Context panel empty state is weak** | MEDIUM | When no tables exist, `ContextPanel` shows a short text message. No upload CTA or guidance. |
| **Schema fetch errors invisible** | MEDIUM | Failed schema loads show "Schema information unavailable" — same message as genuinely empty schema. No retry, no error detail. |
| **Tools panel minimal** | LOW | `ToolsPanel` has Quick SQL + 5 recent runs. No quick actions, no dataset summary, no suggested questions. |

### What Works Well
- New user onboarding card on home page (3-step guide) is good
- "Ready to analyze" state when tables exist but no runs is helpful
- Investigation streaming empty state with MonitorPlay icon is clear

---

## 8. Demo Readiness

### Score: 5/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **Broken onboarding flow** | CRITICAL | First demo: user clicks "Start Your First Analysis" → lands on `/analyze` with no data → cannot upload → confused. |
| **Legacy workspace is the real app** | HIGH | The impressive features (SQL editor, data preview, quality reports, templates, history, diff) are all in `/workspace-legacy`, which is hidden behind a sidebar footer link and settings page. |
| **Two competing layouts** | HIGH | Shell layout (sidebar + header + single content area) vs. legacy 3-column layout. Inconsistent navigation, different chrome, different state. |
| **No sample data preloaded** | MEDIUM | Demo requires uploading a CSV first. No built-in sample dataset or "Try with sample data" button. |
| **Bundle size concern** | MEDIUM | `/workspace-legacy` is 535kB first-load JS (vs. 104-121kB for shell pages). Monaco + Recharts + all panels loaded synchronously. |

---

## 9. Resume/Portfolio Readiness

### Score: 7/10

### Strengths for Portfolio
- Enterprise-grade backend: 338 tests, guardrails, token budget, retry logic, trace system
- Modern stack: Next.js 15, React 19, TypeScript, Zustand, TanStack Table/Virtual, Monaco, Recharts
- AI engineering: streaming SSE, multi-step analysis, anomaly detection, self-evaluation, quality gates
- Design system v2 with CSS custom properties, 17 UI primitives
- Comprehensive i18n (zh/en, 447 keys)

### Gaps for Portfolio
- No live demo flow (broken onboarding)
- No screenshots or demo video
- README doesn't showcase the AI capabilities well
- Two layouts make it unclear what the "product" actually is
- No component tests undermines "enterprise-grade" claim

---

## 10. Production Readiness

### Score: 5/10

| Issue | Severity | Detail |
|-------|----------|--------|
| **CORS wide open** | HIGH | `allow_origins=["*"]` in production is a security risk. |
| **No authentication** | HIGH | No auth layer. Any user can execute arbitrary SQL, upload files, delete tables. |
| **No rate limiting** | MEDIUM | No request throttling. AI endpoints are expensive (LLM calls) and unprotected. |
| **SQL injection surface** | MEDIUM | User SQL is executed directly. Table names interpolated in f-strings. Acceptable for internal tool, not for multi-tenant. |
| **No CI/CD pipeline** | MEDIUM | No evidence of automated build/test/deploy pipeline. |
| **localStorage limits** | MEDIUM | All persistence is localStorage (4MB analysis, 2MB history). No server-side user state. |
| **Monaco 2MB worker** | LOW | ISSUE-001: Monaco loads ~2MB of workers on first load. Acceptable for enterprise, not for consumer. |
| **No error monitoring** | MEDIUM | In-memory ring buffer logger (500 entries). No Sentry, Datadog, or external error tracking. |
| **No health check automation** | LOW | `/api/health` exists but no uptime monitoring or alerting. |

---

## Top UX Bottlenecks (Ranked)

| # | Bottleneck | Impact | Effort |
|---|-----------|--------|--------|
| 1 | Shell pages are placeholders — no data/query/history functionality | Blocks entire user journey | HIGH |
| 2 | Onboarding CTA goes to wrong page | First impression broken | LOW |
| 3 | Two competing layouts (shell vs. legacy) | User confusion, maintenance burden | MEDIUM |
| 4 | Silent error swallowing in 4 components | Users see blank UI with no explanation | LOW |
| 5 | No upload in the shell | Blocks new user flow | MEDIUM |
| 6 | Features hidden in legacy workspace | Templates, reports, history undiscoverable | HIGH |
| 7 | Mode selector lacks explanation | Users don't know what 6 modes do | LOW |
| 8 | No sample data for demo | Requires setup before demo | LOW |
| 9 | Hover-reveal actions invisible | Table management features hidden | LOW |
| 10 | `timeAgo` not internationalized | Breaks zh locale experience | LOW |

---

## Missing User Journeys

1. **Upload → Analyze in one flow**: User uploads CSV on `/data` page, gets auto-redirected to `/analyze` with table pre-selected
2. **Query → Explain → Drill-down**: User writes SQL, gets results, asks AI to explain, drills into anomalies — currently requires legacy workspace
3. **Template → Apply → Compare**: User saves analysis as template, applies to new dataset, compares results — currently requires legacy workspace
4. **History → Rerun → Evolve**: User browses past analyses, reruns with updated data, views evolution chain — currently requires legacy workspace
5. **Export → Share → Import**: User exports analysis bundle, shares with colleague, colleague imports — API exists but no UI
6. **Schedule → Monitor → Alert**: User schedules daily analysis, monitors results — store exists but no shell UI

---

## E2E Testing Gaps

| Missing Test | Priority |
|-------------|----------|
| Investigation workspace full flow (upload → question → streaming → result) | CRITICAL |
| CSV upload validation (bad files, large files, encoding) | HIGH |
| Export workflow (CSV/JSON/Excel download) | HIGH |
| AI streaming response (plan → steps → summary) | HIGH |
| Analysis templates (save → apply → adapt) | MEDIUM |
| Report generation (select runs → generate → download) | MEDIUM |
| Keyboard shortcuts (Ctrl+K, Ctrl+/, Ctrl+S) | MEDIUM |
| Saved queries (save → load → rerun) | MEDIUM |
| Query explain visualization | LOW |
| Virtual scrolling with large datasets | LOW |

---

## Performance Risks

| Risk | Detail | Mitigation |
|------|--------|------------|
| **Legacy workspace bundle** | 535kB first-load JS (all panels + Monaco + Recharts synchronous) | Dynamic imports for panels (like shell does) |
| **Monaco worker size** | ~2MB on first load | Acceptable for enterprise; lazy load via `next/dynamic` |
| **localStorage ceiling** | 4MB analysis + 2MB history + tabs + templates + settings | Already has size guards; consider IndexedDB for larger storage |
| **No query result caching** | Same query re-executes every time | Add TTL cache in backend (backlog item) |
| **Sequential file upload** | `for...of` with `await` — 5 files = 5× latency | Parallel upload with `Promise.all` |
| **Recharts bundle** | Full Recharts imported even for simple bar charts | Tree-shake or switch to lightweight chart lib |

---

## Highest ROI Improvements

| # | Improvement | ROI | Effort | Impact |
|---|------------|-----|--------|--------|
| 1 | Fix onboarding CTA (point to upload, not analyze) | ★★★★★ | 30min | First impression |
| 2 | Add upload capability to `/data` page | ★★★★★ | 2h | Unblocks entire flow |
| 3 | Add "Try sample data" button to onboarding | ★★★★☆ | 1h | Zero-friction demo |
| 4 | Fix silent error swallowing (add toast notifications) | ★★★★☆ | 1h | Trust |
| 5 | Add tooltips to mode selector | ★★★★☆ | 30min | Discoverability |
| 6 | Make hover actions always visible (or add hint) | ★★★☆☆ | 30min | Discoverability |
| 7 | Internationalize `timeAgo` | ★★★☆☆ | 30min | Polish |
| 8 | Merge shell + legacy into single layout | ★★★☆☆ | 2-3d | Eliminates confusion |
| 9 | Add component tests for critical paths | ★★★☆☆ | 1-2d | Confidence |
| 10 | Add E2E test for investigation flow | ★★★☆☆ | 1d | Regression safety |

---

## Appendix: Validation Results

| Check | Result |
|-------|--------|
| `npx next build` | ✅ PASS — 12 routes generated |
| `npx tsc --noEmit` | ✅ PASS — 0 errors |
| `npx vitest run` | ✅ PASS — 14/14 files, 158/158 tests |
| Backend import | ✅ PASS |
| DB connection | ✅ PASS |
| API version | 0.7.6 |
