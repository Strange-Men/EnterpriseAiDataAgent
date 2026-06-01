# V0.8 Architecture State — Enterprise AI Data Agent

> Audit date: 2026-05-26 | Version: v0.8.2 | Phase: Phase 3 Complete (Product UX + Design System Refactor)

## 1. High-Level Architecture (v0.8.x delta)

```
┌──────────────────────────────────────────────────────────────┐
│  frontend-react/ (Next.js 15 + React 19 + TS)                │
│                                                              │
│  ┌─ App Shell ───────────────────────────────────────────┐  │
│  │  Sidebar (6 nav items) + Header + Overlays              │  │
│  │  ClientProviders: ErrorBoundary > QueryClient >         │  │
│  │  ThemeSync > Suspense > children                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Investigation Workspace (NEW v0.8.x) ────────────────┐  │
│  │  3-panel resizable layout (18%/56%/26%)                 │  │
│  │  Context | Main (max-w-[1200px]) | Tools                │  │
│  │  Focus mode toggle (hide sidebars)                      │  │
│  │  Mobile: stacked scroll view (< 768px)                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Legacy Workspace (/workspace-legacy) ────────────────┐  │
│  │  Original 3-panel SQL workspace (still operational)     │  │
│  │  Uses compatibility wrappers for stores                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  13 Zustand stores (2 new, 4 wrapper, 7 legacy active)       │
│  17 UI primitives (7 new in v0.8.x)                          │
│  Port 3000                                                   │
└──────────────────────┬───────────────────────────────────────┘
                       │ /api/* proxy
┌──────────────────────▼───────────────────────────────────────┐
│  backend/ (unchanged in v0.8.x)                               │
│    6 routes, 14 services, 11 prompts                         │
│    Token budget, guardrails, trace, scheduler                 │
│    Port 8000                                                  │
└──────────────────────┬───────────────────────────────────────┘
                       │ duckdb.connect()
┌──────────────────────▼───────────────────────────────────────┐
│  database/ (DuckDB — unchanged)                               │
└──────────────────────────────────────────────────────────────┘
```

## 2. Route Hierarchy (v0.8.x state)

```
app/
├── layout.tsx                        # Root: HTML shell, theme FOUC script
├── (shell)/
│   ├── layout.tsx                    # Shell: ClientProviders + AppShell
│   ├── page.tsx                      # / — Home dashboard (smart empty states)
│   ├── analyze/
│   │   ├── page.tsx                  # /analyze — InvestigationWorkspace (dynamic import)
│   │   └── [runId]/page.tsx          # /analyze/:id — Run detail (7 dynamic imports)
│   ├── data/page.tsx                 # /data — Placeholder (routes to /analyze)
│   ├── query/page.tsx                # /query — Placeholder (routes to /analyze)
│   ├── history/page.tsx              # /history — Placeholder (routes to /analyze)
│   └── settings/page.tsx             # /settings — Settings (Card + Button primitives)
├── performance/page.tsx              # /performance — Browser perf dashboard
├── virtual-table/page.tsx            # /virtual-table — 50K row virtual demo
└── workspace-legacy/page.tsx         # /workspace-legacy — Classic 3-panel layout
```

**变化（相对 v0.7.x）：**
- `/analyze` 和 `/analyze/[runId]` 是 v0.8.x 新增路由（替换旧 `/` 的 3-panel workspace）
- `/data`、`/query`、`/history` 从功能页面降级为占位符
- `/` 现在是仪表盘首页（原为功能 workspace）
- `/workspace-legacy` 保留旧 3-panel workspace

## 3. Store Architecture (v0.8.x delta)

### 3.1 New Unified Stores

| Store | Lines | Persist Key | Replaces |
|-------|-------|-------------|----------|
| `investigation-store.ts` | 382 | `"investigation"` | workflow-store + ai-session-store |
| `sql-editor-store.ts` | 299 | `"sql-editor"` | sql-workspace-store + query-tabs-store |

### 3.2 Compatibility Wrappers (Proxy Pattern)

| Wrapper | Lines | Proxies | Pattern |
|---------|-------|---------|---------|
| `workflow-store.ts` | 41 | investigation-store | Zustand subscribe → setState snapshot |
| `ai-session-store.ts` | 65 | investigation-store | Zustand subscribe → setState snapshot |
| `sql-workspace-store.ts` | 69 | sql-editor-store | Zustand subscribe → setState snapshot |
| `query-tabs-store.ts` | 43 | sql-editor-store | Zustand subscribe → setState snapshot |

**Proxy 模式：** 每个 wrapper 通过 `sourceStore.subscribe(() => wrapper.setState(snapshot(), true))` 自动同步。Wrapper 是独立的 Zustand store（有独立内存状态），但每次源 store 变化时完全替换自身状态。

### 3.3 Store Dependency Graph

```
investigation-store ──(subscribe)──> workflow-store (wrapper)
investigation-store ──(subscribe)──> ai-session-store (wrapper)
sql-editor-store    ──(subscribe)──> sql-workspace-store (wrapper)
sql-editor-store    ──(subscribe)──> query-tabs-store (wrapper)

data-store.getDatasetMeta() ──(reads)──> analysis-store.runs

sql-editor-store.loadMore() ──(imports)──> api.ts executeQuery()
```

### 3.4 Persistence Chain (v0.8.x delta)

| Key | Store | New in v0.8? | Migration |
|-----|-------|-------------|-----------|
| `"investigation"` | investigation-store | YES | From `"ai-session"` (auto-migrate + delete old key) |
| `"sql-editor"` | sql-editor-store | YES | From `"query-tabs"` (auto-migrate + delete old key) |
| `"analysis-history"` | analysis-store | No | — |
| `"workspace-settings"` | workspace-store | No | — |
| `"workspace-theme"` | use-theme | No | — |
| `"sql-history"` | sql-history-store | No | — |
| `"saved-queries"` | saved-queries-store | No | — |
| `"analysis-templates"` | template-store | No | — |
| `"schedule-tasks"` | schedule-store | No | — |

**变化：** 2 个新 key，1 个旧 key 被删除（`"ai-session"`），1 个旧 key 被删除（`"query-tabs"`），总计 9 个 localStorage key（与 v0.7.x 相同，替换非新增）。

## 4. Investigation Workspace Architecture

### 4.1 Component Tree

```
InvestigationWorkspace (258 lines) — orchestrator
  └── InvestigationLayout (109 lines) — resizable 3-panel
        ├── ContextPanel (119 lines) — table list + schema
        ├── main slot
        │     ├── QuestionInput (102 lines) — question + table + mode
        │     ├── StreamingIndicator (64 lines) — phase icons + progress
        │     └── StreamingOutput (160 lines) — results | skeleton | error | empty
        └── ToolsPanel (126 lines) — quick SQL + recent runs
```

### 4.2 Streaming Lifecycle

```
handleStart(question, table, mode)
  → addRun() → setActiveRun() → addUserTurn() → advance("analyzing")
  → fetchTableData() for context
  → streamAiAnalyzeMulti() with callbacks:
      onPlan        → setStreamStage("plan")
      onStepStart   → setStreamStage("step")
      onStepResult  → accumulate steps
      onSummary     → setStreamStage("summary")
      onError       → updateRun(error) + advance("done") + toast
      onDone        → build result → updateRun(success) → addAssistantTurn()
                      → extract keyFindings → advance("done") → toast
  → AbortController ref for cleanup/cancellation
```

### 4.3 Run Detail Lifecycle

```
[runId]/page.tsx
  → use(params) → get run from analysis-store
  → 7 dynamic() lazy-loaded sub-components:
      RunHeader (PanelSkeleton fallback)
      RunSections, RunTrace, RunEvaluation,
      RunTimeline, DrillDownChain (null fallback)
  → 3-col grid: main (2/3) | sidebar (1/3)
  → getEvolutionChain() for timeline
```

## 5. Design System Integration (v0.8.x delta)

### 5.1 CSS Token Architecture

```
globals.css:
  :root / [data-theme="dark"] — dark defaults
  [data-theme="light"] — color overrides only

Token categories: colors (bg/text/border/semantic), spacing (1-24),
  typography (sans/mono, sizes, weights), radius, elevation (sm/md/lg),
  motion (fast/normal/slow), z-index (dropdown/sticky/modal/toast/command)

tailwind.config.ts: Extended with CSS variable mappings
  (colors, borderRadius, fontSize, fontFamily, transitionDuration,
   boxShadow, zIndex, plugins)
```

### 5.2 UI Primitives (7 new in v0.8.x)

| Component | Lines | Variants/Features |
|-----------|-------|-------------------|
| Button | 83 | 5 variants, 3 sizes, loading, icons |
| Card | 118 | 6 sub-components, 3 variants |
| Input | 48 | Input, Textarea, Select |
| Dialog | 162 | 7 sub-components, Esc/overlay close |
| DropdownMenu | 140 | 4 sub-components, align support |
| CommandPalette | 205 | Keyboard nav, scored search |
| GlobalSearch | 146 | Multi-source search |
| KeyboardShortcutsModal | 53 | Uses Dialog primitive |
| ErrorFallback | 31 | For react-error-boundary |
| Skeleton | 127 | 6 variants |

### 5.3 Animation System

Keyframes: shimmer, slide-up, slide-down, fade-in, pulse-border, typing-cursor
Utility classes: animate-slide-up, animate-fade-in, animate-pulse-border, animate-typing-cursor

### 5.4 Component Migration Status

已迁移到 primitives：app-shell, question-input, run-header, follow-up-input, tools-panel, settings/page, sidebar icons, context-panel
未迁移（仍使用原生元素）：sql-workspace-panel（全部按钮）、table-management-panel、file-upload-panel、sidebar nav items、home page cards

## 6. Keyboard & Command System

- **useKeyboardShortcuts.ts** — centralized hook, input-focus detection, cross-platform mod key
- 10 global shortcuts registered in AppShell
- CommandPalette (Ctrl+K): navigation, theme, language, recent runs
- GlobalSearch (Ctrl+/): tables, runs, pages
- KeyboardShortcutsModal (?): help reference

## 7. Responsive Architecture

- AppShell sidebar: hidden on mobile (`max-md:hidden`)
- InvestigationLayout: mobile detection at <768px, disables resizable panels, stacked scroll view
- InvestigationLayout: ultra-wide centering (`max-w-[1200px]`)

## 8. Key Architectural Changes Summary

| Dimension | v0.7.x | v0.8.x |
|-----------|--------|--------|
| Primary workspace | 3-panel at `/` | Investigation at `/analyze` |
| Homepage | N/A (workspace was home) | Dashboard at `/` |
| Store count | 12 (all active) | 13 (2 new + 4 wrapper + 7 active) |
| UI primitives | 0 (inline styles) | 7 component families |
| Design tokens | Scattered CSS vars | Full token system (60+ vars) |
| Lazy loading | 0 boundaries | 8 next/dynamic boundaries |
| Streaming UX | Basic text display | Phase icons, progress bar, step animation, skeleton states |
| Focus mode | None | Toggle in investigation layout |
| Route count | 10 | 10 (3 demoted to placeholder) |
| Theme system | CSS vars + Tailwind | Extended token system with config mapping |
