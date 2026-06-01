# P4 Productization Roadmap — v0.8.4+

> Generated: 2026-06-01
> Based on: `PRODUCTIZATION_GAP_REPORT.md`
> Principle: **User value over new features. Simplify before adding.**

---

## Guiding Principles

1. **One layout, not two** — the shell must become the single source of truth
2. **Every nav page must do something** — no placeholders in production
3. **Onboarding must work end-to-end** — upload → question → result in <60 seconds
4. **Errors must be visible** — no silent swallowing
5. **Existing features must be discoverable** — templates, reports, history, diff accessible from shell
6. **Remove before adding** — legacy workspace should be deprecated, not maintained in parallel

---

## Phase P4.1: Critical UX Fixes (1-2 days)

**Goal**: Fix the broken user journey without architectural changes.

### P4.1.1 — Fix Onboarding CTA
- **What**: Change "Start Your First Analysis" button to navigate to `/data` (or open upload dialog) instead of `/analyze`
- **Why**: First impression is broken — user lands on empty investigation page
- **Effort**: 30 min
- **ROI**: ★★★★★
- **Files**: `src/app/(shell)/page.tsx`

### P4.1.2 — Add Upload to `/data` Page
- **What**: Embed `FileUploadPanel` (or a simplified upload component) into the `/data` page. Show table list with row/column counts. Add "Analyze" button per table.
- **Why**: Users expect "Data" to mean data management. Currently it's a dead placeholder.
- **Effort**: 2-3h
- **ROI**: ★★★★★
- **Files**: `src/app/(shell)/data/page.tsx`, new component or extract from `panels/file-upload-panel.tsx`

### P4.1.3 — Add "Try Sample Data" Button
- **What**: On the onboarding card and `/data` empty state, add a "Try with sample data" button that uploads a bundled CSV (e.g., `testExcel/sample_sales.csv`) via the upload API.
- **Why**: Zero-friction demo — no file needed to try the product
- **Effort**: 1h
- **ROI**: ★★★★☆
- **Files**: `src/app/(shell)/page.tsx`, `src/app/(shell)/data/page.tsx`, bundle a sample CSV in `public/`

### P4.1.4 — Fix Silent Error Swallowing
- **What**: In `FileUploadPanel.handleTableClick`, `TableManagementPanel.handleSelect`, `ContextPanel.loadSchema`, and `DataPreviewPanel` schema fetch — replace silent `catch` blocks with `toast.error()` calls.
- **Why**: Users see blank UI with no explanation when API calls fail
- **Effort**: 1h
- **ROI**: ★★★★☆
- **Files**: 4 panel/component files

### P4.1.5 — Add Mode Selector Tooltips
- **What**: Add `title` attribute or `Tooltip` component to each mode pill in `ModeSelector` with one-line description:
  - `autonomous`: "AI plans and executes multiple analysis steps automatically"
  - `full-analysis`: "Comprehensive profile, insights, and chart suggestions"
  - `insights`: "Generate structured business insights with evidence"
  - `explain`: "Explain query results in business language"
  - `charts`: "Suggest and render appropriate chart types"
  - `anomalies`: "Detect statistical anomalies and interpret their meaning"
- **Why**: 6 unlabeled modes — users don't know what they do
- **Effort**: 30 min
- **ROI**: ★★★★☆
- **Files**: `src/components/investigation/ai-mode-selector.tsx`

### P4.1.6 — Internationalize `timeAgo`
- **What**: Move `timeAgo` to a shared util, add zh translations ("刚刚", "3小时前", "3天前")
- **Why**: Breaks Chinese locale experience
- **Effort**: 30 min
- **ROI**: ★★★☆☆
- **Files**: `src/utils/time.ts` (new), `src/app/(shell)/page.tsx`, `src/i18n/en.ts`, `src/i18n/zh.ts`

### P4.1.7 — Make Table Actions Visible
- **What**: In `TableManagementPanel`, show action buttons with reduced opacity (0.5) instead of `opacity-0`, or add a subtle "hover for actions" hint text.
- **Why**: New users won't discover SQL/Rename/Export/Delete buttons
- **Effort**: 15 min
- **ROI**: ★★★☆☆
- **Files**: `src/panels/table-management-panel.tsx`

---

## Phase P4.2: Feature Integration into Shell (3-5 days)

**Goal**: Make `/data`, `/query`, `/history` pages functional. Eliminate placeholder pages.

### P4.2.1 — Functional `/data` Page
- **What**: Full data management page with:
  - Upload zone (drag-and-drop)
  - Table list with row/column counts
  - Click table → data preview (DataTable with virtual scrolling)
  - Schema tab, Quality report tab
  - Per-table actions: rename, export CSV, delete
- **Why**: Users expect `/data` to be the data management hub
- **Effort**: 1-2d (mostly extracting from legacy panels)
- **ROI**: ★★★★★
- **Files**: `src/app/(shell)/data/page.tsx`, may extract components from `panels/`

### P4.2.2 — Functional `/query` Page
- **What**: Embedded SQL workspace with:
  - Monaco editor with autocomplete
  - Execute/Cancel/Explain toolbar
  - Results table with virtual scrolling
  - Export dropdown
  - Query history sidebar
  - Saved queries
- **Why**: Users expect `/query` to be the SQL workspace
- **Effort**: 1-2d (extract from `SqlWorkspacePanel`)
- **ROI**: ★★★★★
- **Files**: `src/app/(shell)/query/page.tsx`, may extract components

### P4.2.3 — Functional `/history` Page
- **What**: Unified history view with:
  - Tab: SQL Query History (from `sql-history-store`)
  - Tab: Analysis Run History (from `analysis-store`)
  - Search and filter
  - Click to navigate to run detail or re-load query
  - Export history
- **Why**: Users expect `/history` to browse past work
- **Effort**: 1d
- **ROI**: ★★★★☆
- **Files**: `src/app/(shell)/history/page.tsx`

### P4.2.4 — Add Report/Export to Shell
- **What**: Add report generation and export buttons to `/analyze/[runId]` detail page. Include:
  - Generate Markdown report
  - Export run as JSON
  - Export bundle (for sharing)
- **Why**: Reports and export are built but only accessible in legacy workspace
- **Effort**: 4h
- **ROI**: ★★★★☆
- **Files**: `src/app/(shell)/analyze/[runId]/page.tsx`, `src/components/investigation/run-header.tsx`

### P4.2.5 — Add Templates to Shell
- **What**: Add template management to the `/analyze` page:
  - "Save as Template" action on completed runs
  - Template list in tools panel or a dedicated section
  - "Apply Template" action that opens the adapt dialog
- **Why**: Templates are a differentiating feature but completely hidden
- **Effort**: 4h
- **ROI**: ★★★☆☆
- **Files**: `src/components/investigation/tools-panel.tsx`, `src/components/investigation/run-header.tsx`

---

## Phase P4.3: Layout Consolidation (2-3 days)

**Goal**: Single layout. Deprecate legacy workspace.

### P4.3.1 — Merge Legacy Panels into Shell Pages
- **What**: Ensure every panel in `/workspace-legacy` has a home in the shell:
  - `FileUploadPanel` → `/data` page
  - `DataPreviewPanel` → `/data` page (as tab or inline)
  - `TableManagementPanel` → `/data` page sidebar
  - `SqlWorkspacePanel` → `/query` page
  - `SqlHistoryPanel` → `/history` page tab
  - `AnalysisWorkspacePanel` → split between `/analyze` (tools panel) and `/history` (run list)
  - `StatusPanel` → `/settings` page or footer
  - `DiffPanel` → `/analyze/[runId]` page or `/history`
  - `AIAnalysisPanel` → integrated into `/analyze` streaming output
- **Why**: Two layouts = two codepaths = double maintenance = user confusion
- **Effort**: 2-3d
- **ROI**: ★★★☆☆

### P4.3.2 — Deprecate Legacy Workspace Route
- **What**: After P4.3.1, add a deprecation banner to `/workspace-legacy` pointing users to the shell. Remove from sidebar footer. Eventually remove the route entirely.
- **Why**: Maintaining two layouts is unsustainable
- **Effort**: 1h (banner), later 1d (removal)
- **ROI**: ★★★☆☆

### P4.3.3 — Dynamic Import Legacy Bundle
- **What**: If legacy workspace is kept temporarily, use `next/dynamic` for all panel imports to reduce the 535kB first-load JS.
- **Why**: 535kB vs 104-121kB for shell pages
- **Effort**: 2h
- **ROI**: ★★★☆☆
- **Files**: `src/app/workspace-legacy/page.tsx`

---

## Phase P4.4: Testing & Confidence (2-3 days)

**Goal**: Component tests for critical paths. E2E for the full user journey.

### P4.4.1 — Component Tests for Core Components
- **What**: Add Vitest + Testing Library tests for:
  - `InvestigationWorkspace` (mock API, verify streaming lifecycle)
  - `QuestionInput` (submit, validation, table selection)
  - `StreamingOutput` (plan rendering, step rendering, error display)
  - `DataTable` (virtual scrolling, sorting, null display)
  - `CommandPalette` (keyboard navigation, search, execute)
  - `EmptyState` (renders title, description, action)
- **Why**: Zero component tests = zero confidence in UI changes
- **Effort**: 2d
- **ROI**: ★★★☆☆
- **Files**: `src/components/**/__tests__/`

### P4.4.2 — E2E Test: Investigation Full Flow
- **What**: Playwright test covering:
  1. Upload CSV
  2. Navigate to `/analyze`
  3. Select table
  4. Ask question
  5. Verify streaming output (plan, steps, summary)
  6. Verify run appears in history
  7. Click run → verify detail page
- **Why**: The primary user journey has no E2E coverage
- **Effort**: 1d
- **ROI**: ★★★☆☆
- **Files**: `frontend-react/e2e/investigation-flow.spec.ts`

### P4.4.3 — E2E Test: Data Management Flow
- **What**: Playwright test covering:
  1. Upload CSV → verify table appears
  2. Preview data → verify rows/columns
  3. View schema → verify column types
  4. View quality report → verify scores
  5. Export CSV → verify download
  6. Delete table → verify removal
- **Why**: Data management is core but untested in E2E
- **Effort**: 4h
- **ROI**: ★★★☆☆
- **Files**: `frontend-react/e2e/data-management.spec.ts`

### P4.4.4 — Fix Test Isolation (ISSUE-014)
- **What**: Use in-memory DuckDB or per-test fixtures for `QueryHistory` tests
- **Why**: Test ordering affects results
- **Effort**: 2h
- **ROI**: ★★☆☆☆

---

## Phase P4.5: Polish & Production (1-2 days)

**Goal**: Production hardening and demo readiness.

### P4.5.1 — Add Sample Dataset
- **What**: Bundle a realistic sample dataset (e.g., 1000-row sales data) in `public/`. Add "Load sample data" button to onboarding and `/data` empty state. Auto-upload on click.
- **Why**: Demo readiness — no external file needed
- **Effort**: 1h
- **ROI**: ★★★★☆

### P4.5.2 — System Status Polling
- **What**: Add 30s polling to system status on home page. Show "Last checked: X seconds ago". Add refresh button.
- **Why**: Stale status is misleading
- **Effort**: 30 min
- **ROI**: ★★☆☆☆

### P4.5.3 — CORS Configuration
- **What**: Make CORS origins configurable via env var. Default to `["http://localhost:3000"]` in dev, require explicit config in production.
- **Why**: `allow_origins=["*"]` is a security risk
- **Effort**: 30 min
- **ROI**: ★★★☆☆

### P4.5.4 — Error Monitoring Hook
- **What**: Add a `window.onerror` / `unhandledrejection` handler that logs to the backend `/api/health/system` endpoint or a new `/api/errors` endpoint. Keep the in-memory ring buffer but add server-side persistence.
- **Why**: In-memory logger is lost on page refresh
- **Effort**: 2h
- **ROI**: ★★☆☆☆

### P4.5.5 — README Update
- **What**: Update README with:
  - Screenshots of the shell layout (not legacy)
  - Clear feature list with GIF demos
  - "Quick Start" section with sample data
  - Architecture diagram showing the current shell-based IA
- **Why**: Portfolio readiness
- **Effort**: 2h
- **ROI**: ★★★☆☆

---

## What to Remove

| Item | Reason | Action |
|------|--------|--------|
| `/workspace-legacy` route | Competing layout confuses users | Deprecate after P4.3.1, remove in v0.9.0 |
| `/virtual-table` route | Performance demo, not a product feature | Move to `/settings` as a link, or remove from sidebar |
| `/performance` route | Internal benchmarking tool | Move to dev-only or remove from production build |
| Dead code: `ResizeHandle` in `investigation-layout.tsx` | Unused component | Delete |
| Dead store tests: `workflow-store.test.ts`, `ai-session-store.test.ts`, `query-tabs-store.test.ts`, `sql-workspace-store.test.ts` | Tests for stores that no longer exist (migrated to `investigation-store` and `sql-editor-store`) | Delete or migrate |

---

## What to Simplify

| Item | Current | Simplified |
|------|---------|------------|
| Navigation | 6 pages (3 placeholders) | 4 pages: Home, Data, Analyze, Settings |
| Layout | 2 competing layouts | 1 shell layout |
| Mode selector | 6 modes with no explanation | 3 primary modes (autonomous, explain, insights) + "More" dropdown |
| Table selection | Implicit fallback to `tables[0]` | Explicit required selection |
| Upload flow | Legacy workspace only | Integrated into `/data` page |
| History | Split across home page + legacy panel | Unified `/history` page or section |

---

## Task Priority Matrix

| # | Task | Phase | Effort | Impact | Priority |
|---|------|-------|--------|--------|----------|
| 1 | Fix onboarding CTA | P4.1 | 30min | Critical | **P0** |
| 2 | Add upload to `/data` page | P4.1 | 2-3h | Critical | **P0** |
| 3 | Add "Try sample data" button | P4.1 | 1h | High | **P0** |
| 4 | Fix silent error swallowing | P4.1 | 1h | High | **P0** |
| 5 | Add mode selector tooltips | P4.1 | 30min | High | **P1** |
| 6 | Internationalize `timeAgo` | P4.1 | 30min | Medium | **P1** |
| 7 | Make table actions visible | P4.1 | 15min | Medium | **P1** |
| 8 | Functional `/data` page | P4.2 | 1-2d | Critical | **P1** |
| 9 | Functional `/query` page | P4.2 | 1-2d | Critical | **P1** |
| 10 | Functional `/history` page | P4.2 | 1d | High | **P1** |
| 11 | Add report/export to shell | P4.2 | 4h | High | **P2** |
| 12 | Add templates to shell | P4.2 | 4h | Medium | **P2** |
| 13 | Merge legacy into shell | P4.3 | 2-3d | High | **P2** |
| 14 | Deprecate legacy workspace | P4.3 | 1h | Medium | **P2** |
| 15 | Dynamic import legacy bundle | P4.3 | 2h | Medium | **P2** |
| 16 | Component tests (core) | P4.4 | 2d | High | **P2** |
| 17 | E2E: investigation flow | P4.4 | 1d | High | **P2** |
| 18 | E2E: data management | P4.4 | 4h | Medium | **P3** |
| 19 | Fix test isolation | P4.4 | 2h | Low | **P3** |
| 20 | Bundle sample dataset | P4.5 | 1h | High | **P1** |
| 21 | System status polling | P4.5 | 30min | Low | **P3** |
| 22 | CORS configuration | P4.5 | 30min | Medium | **P2** |
| 23 | Error monitoring hook | P4.5 | 2h | Medium | **P3** |
| 24 | README update | P4.5 | 2h | Medium | **P2** |
| 25 | Remove dead code/stores | P4.5 | 1h | Low | **P3** |

---

## Estimated Total Effort

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| P4.1 | 1-2 days | Broken journey fixed, errors visible, tooltips added |
| P4.2 | 3-5 days | All nav pages functional, templates/reports in shell |
| P4.3 | 2-3 days | Single layout, legacy deprecated |
| P4.4 | 2-3 days | Component + E2E tests for critical paths |
| P4.5 | 1-2 days | Production hardening, demo ready |
| **Total** | **10-15 days** | **Production-ready product** |

---

## Success Criteria

- [ ] New user can go from landing page to first AI analysis result in <60 seconds
- [ ] All 6 sidebar navigation items lead to functional pages
- [ ] No placeholder pages in production
- [ ] Single layout (no legacy workspace)
- [ ] All errors shown to user (no silent swallowing)
- [ ] Component tests for 5+ core components
- [ ] E2E tests for upload → analysis → history flow
- [ ] Build passes, TypeScript clean, all tests green
- [ ] Demo works without external data files
