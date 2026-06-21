# M4-2.1 Unified Analysis Workspace

## 1. Why This Correction

M4-2 (AI Workspace Refactor) hid experimental features behind feature flags and simplified the product surface. However, it did **not** actually merge SQL and AI into a single workspace. Users still saw two separate navigation entries — "SQL 查询" and "AI 数据助手" — and had to guess which one to use. The core capability "自然语言转 SQL" was buried inside the AI Assistant page behind a mode selector that showed "解释" and "洞察" as equal choices, confusing users about the product's primary value.

This correction (M4-2.1) truly unifies SQL and AI into one "分析工作台" entry point.

## 2. Product Decision

Final information architecture (5 entries):

| Entry | Route | Purpose |
|-------|-------|---------|
| 首页 | `/` | Landing, how-to-get-started, system status |
| 数据 | `/data` | Upload, table management, data preview, quality |
| 分析工作台 | `/analyze` | Unified AI + SQL workspace (default: NL→SQL) |
| 历史 | `/history` | Query history |
| 设置 | `/settings` | Theme, language, version |

`/query` route is preserved but hidden from navigation. Accessing it shows a redirect notice to the Analysis Workspace.

## 3. Navigation Changes

| Component | Change |
|-----------|--------|
| `sidebar.tsx` | Removed "query" entry (5 items instead of 6), removed `Code` icon import |
| `app-shell.tsx` | Removed `Ctrl+Q` shortcut for `/query`, kept `/query` in PAGE_TITLES for direct access |
| `command-palette.tsx` | Removed "Go to Query" entry, removed `Code` icon import |
| `global-search.tsx` | Removed `/query` from searchable pages |
| `i18n/zh.ts` | `nav.analyze`: "AI 数据助手" → "分析工作台" |
| `i18n/en.ts` | `nav.analyze`: "AI Assistant" → "Analysis Workspace" |
| Home page | 3 quick-start cards → 2 cards (Upload Data + Analysis Workspace) |

## 4. Onboarding Removal

The old onboarding system (wizard + feature tooltips + Zustand store) was **never actually mounted** in the app shell — the `OnboardingWizard` component existed but was not rendered anywhere. The `showGuidedDemo` feature flag was `false` and unused.

| File | Action | Reason |
|------|--------|--------|
| `components/onboarding/onboarding-wizard.tsx` | **Deleted** | Never mounted, home page "如何开始" suffices |
| `components/onboarding/feature-tooltip.tsx` | **Deleted** | Only wrapped page content, no functional impact |
| `stores/onboarding-store.ts` | **Deleted** | No consumers after component deletion |
| `config/features.ts` `showGuidedDemo` | **Removed** | Unused flag |
| `data/page.tsx` | Removed FeatureTooltip wrapper | No visual change |
| `query/page.tsx` | Removed FeatureTooltip wrapper | Page now shows redirect notice |
| `analyze/page.tsx` | Removed FeatureTooltip wrapper | No visual change |
| `analyze/[runId]/page.tsx` | Removed FeatureTooltip wrapper | No visual change |
| i18n `onboarding.*` keys | **Kept** | Harmless strings, can clean up later |

## 5. New Analysis Workspace

The `/analyze` page is now a **tabbed workspace** with two modes:

### Tab 1: AI 问数 (default)
- **Title**: "自然语言问数"
- **Subtitle**: "AI 会根据当前数据表生成 SQL、执行查询，并解释结果。"
- **Input**: Textarea with placeholder "用自然语言提问，例如：营收最高的品类是哪些？"
- **Button**: "生成 SQL 并分析"
- **Example questions**: 3 clickable chips
- **Results**: Streaming plan → steps → summary → trace (same as before)
- Internally uses `autonomous` mode (multi-step analysis)

### Tab 2: 专家 SQL
- Embeds the full `SqlWorkspacePanel` component
- Monaco SQL editor with Execute, Explain, Format, Save, Export
- All existing SQL capabilities preserved

### Table info badge
- Shows current table name and row count in the tab bar

## 6. What Was Hidden, Not Deleted

These features remain in source code but are invisible to users:

| Feature | Location | Status |
|---------|----------|--------|
| Explain mode | `ai-mode-selector.tsx` | Hidden (not in workspace tabs) |
| Insights mode | `ai-mode-selector.tsx` | Hidden (not in workspace tabs) |
| Charts mode | `ai-mode-selector.tsx` | Feature-flagged off |
| Anomalies mode | `ai-mode-selector.tsx` | Feature-flagged off |
| Full-analysis mode | `ai-mode-selector.tsx` | Feature-flagged off |
| Templates | Feature-flagged off | Hidden |
| Scheduled analysis | Feature-flagged off | Hidden |
| Diff/Compare | Feature-flagged off | Hidden |
| Quick SQL panel | Feature-flagged off | Hidden |
| AI buttons in SQL workspace | Feature-flagged off | Hidden |
| `/query` route | Preserved | Shows redirect notice |

## 7. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Passed (0 errors) |
| `vitest run` | ✅ 113/113 tests passed |
| `next build` | ✅ Compiled successfully |
| Main navigation shows 5 entries | ✅ 首页, 数据, 分析工作台, 历史, 设置 |
| AI Assistant renamed to 分析工作台 | ✅ |
| Analysis workspace default is AI 问数 | ✅ |
| Natural language → SQL is prominent | ✅ Title, subtitle, examples, button |
| Table selector present | ✅ In AI 问数 tab header |
| Expert SQL mode available | ✅ Second tab embeds SqlWorkspacePanel |
| `/query` hidden from navigation | ✅ Route shows redirect notice |
| Old onboarding removed | ✅ Files deleted, references removed |
| Data upload & table preview unaffected | ✅ Data page unchanged |
| Home page shows 2 cards (not 3) | ✅ Upload + Analysis Workspace |

## 8. Remaining Work

- **M4-4**: Fix AI JSON output contract (error messages already reference this)
- **M4-5**: Break down large components (investigation-workspace, sql-workspace-panel)
- **M5**: Real Agent capabilities — not in current scope
- **Cleanup**: Remove orphaned i18n keys (`onboarding.*`, unused mode labels)
- **Cleanup**: Remove unused investigation sub-components (`context-panel.tsx`, `tools-panel.tsx`, `question-input.tsx`, `ai-mode-selector.tsx`, `investigation-layout.tsx`) that are no longer imported
