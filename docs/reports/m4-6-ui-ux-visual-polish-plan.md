# M4-6 UI/UX Visual Polish Plan

> Created: 2026-06-21
> Scope: Visual polish and UX refinement only — no new features, no backend changes
> Status: Planning

---

## 1. Why This Phase

M4-1 through M4-4.1 took the project from "runs but chaotic" to "main flows basically clear." The core data pipeline, AI analysis, SQL workspace, and history are all functional. However, the project now faces a different kind of problem: **professionalism and legibility**.

An HR person or interviewer opening the site today will see:
- A dark UI with small text and inconsistent spacing
- Feature flags hiding most AI capabilities
- Half-decorated empty states with mixed languages
- An analysis workspace that reads like an engineering log, not a report

This phase exists to close the gap between "working prototype" and "polished product demo." The goal is not more features — it is making existing features **understandable in 30 seconds** and **runnable in 3 minutes**.

Constraints:
- No new features
- No backend changes
- No new UI libraries
- Every change must pass tsc / tests / build
- Every phase is independently revertable

---

## 2. External References

### Metabase

What to take:
- Clean, non-intimidating data analysis UI
- Natural language / visual entry for non-technical users
- SQL editor for technical users
- Core idea: "make data analysis not scary"

What to leave:
- Full BI dashboard system
- Question/card/dashboard hierarchy
- Embedded analytics SDK

### Superset

What to take:
- Clear separation: SQL IDE / Explore / Dashboard
- Complex capabilities don't all live on one page
- Data exploration has its own dedicated space

What to leave:
- Full chart library
- Dashboard builder
- Dataset management complexity

### Evidence

What to take:
- Report-oriented output: data results should feel like readable documents, not engineering logs
- SQL + Markdown + report expression quality
- Publication-grade visualization polish

What to leave:
- Markdown-first authoring
- Static site generation
- Template language

### Linear / Vercel

What to take:
- Dark, restrained, professional aesthetic
- Low-noise navigation
- Clear state feedback (loading, success, error)
- Cards and borders with subtle depth, not flashy gradients

What to leave:
- Animation-heavy transitions
- Complex keyboard shortcut systems
- Feature-rich settings pages

### Conclusion

This project should become: **Dark premium aesthetic + clear data workstation + AI analysis report-style output**

It should NOT become:
- A full BI platform
- A complex dashboard builder
- A cyberpunk toy
- A collection of half-baked features

---

## 3. Current UI/UX Problems

| Page / Area | Problem | UX Impact | UI Impact | Priority |
|---|---|---|---|---|
| **Home** | Hero section center-aligned but rest left-aligned; demo flow steps are decorative only (not clickable); deployment notice uses warning icon for informational message | Medium: first impression is "demo page" not "product" | Medium: layout inconsistency | P1 |
| **Home** | Recent SQL queries navigate to `/analyze` (AI page) instead of SQL workspace | High: wrong click target breaks user expectation | Low: functional bug | P0 |
| **Home** | Empty state is implicit — no explicit "upload data to get started" guidance when zero tables | Medium: new user doesn't know what to do | Low | P1 |
| **Data** | Left sidebar fixed at 272px, no collapse, no mobile handling | Medium: cramped on smaller screens | Medium: no responsive design | P1 |
| **Data** | No page-level loading state; `<hr>` dividers inconsistent with `border-b` elsewhere | Low | Medium: visual inconsistency | P2 |
| **Data Preview** | Empty states hardcoded in English, bypassing i18n system | Medium: Chinese UI shows English text | Medium: i18n gap | P1 |
| **Data Preview** | Schema fetch errors silently swallowed (shows empty state instead of error) | Medium: user thinks data is empty, not that fetch failed | Low | P1 |
| **Analysis Workspace** | No cancel button exposed for running analysis | High: user must wait or navigate away | Low | P0 |
| **Analysis Workspace** | Example questions disappear after first result; no way to reuse without refresh | Medium: reduces discoverability | Low | P1 |
| **Analysis Workspace** | "Expert SQL" tab embeds full SqlWorkspacePanel with its own toolbar — visual nesting confusion | Medium: unclear which "level" user is at | Medium | P1 |
| **Streaming Output** | Error messages use fragile string matching ("Empty LLM response", "JSON") for classification | Medium: backend changes break user-facing messages | Low | P1 |
| **Streaming Output** | No retry button on errors (parent handles retry but no visible affordance) | Medium: user doesn't know retry is possible | Low | P1 |
| **Streaming Output** | Summary uses `whitespace-pre-wrap` — markdown in summary renders as raw syntax | Low: formatting looks broken | Medium | P2 |
| **Expert SQL** | Toolbar overloaded: 10+ buttons, flex-wrap causes multi-line on narrow screens | Medium: confusing toolbar | Medium: layout breaks | P1 |
| **Expert SQL** | Save dialog uses raw HTML overlay instead of shared Dialog component | Low | Medium: inconsistent modals | P2 |
| **Expert SQL** | Cancel button uses hardcoded `border-red-500/50 text-red-400` instead of CSS variables | Low | Medium: breaks theme | P2 |
| **History** | Two separate "history" concepts: SQL history (History page) vs AI analysis history (AnalysisWorkspacePanel sidebar) | High: user expects one History | Medium: discoverability gap | P0 |
| **History** | "Load into current tab" vs "Re-run in new tab" confusing — no visual distinction | Medium: user doesn't know which action does what | Low | P1 |
| **History** | Delete only visible on hover — hidden on touch devices | Medium: mobile users can't delete | Low | P1 |
| **History** | Type badge colors hardcoded (purple/blue) instead of CSS variables | Low | Medium: breaks theme | P2 |
| **Settings** | Version shows "v..." if API unreachable | Low: looks broken | Low | P2 |
| **Settings** | No breadcrumb or back link | Low | Low | P2 |
| **Left Navigation** | Brand shows "EAI" which is cryptic for non-technical users | Medium: first impression confusion | Low | P1 |
| **Left Navigation** | Fixed width 208px, no collapse option | Low: takes space on medium screens | Medium | P2 |
| **Top Toolbar** | Breadcrumb shows 8-char hex prefix of run ID — meaningless to users | Medium: no context for sub-routes | Low | P1 |
| **Top Toolbar** | Header text very small (`text-xs` title, `text-[10px]` breadcrumb) | Medium: readability concern | Medium | P1 |
| **Error States** | ErrorBoundary uses hardcoded emoji `⚠` while ErrorFallback uses Lucide AlertTriangle — visually different | Low | Medium: inconsistency | P2 |
| **Empty States** | Some callers pass `icon=""` resulting in empty circle with no content | Low | Medium: looks broken | P2 |
| **Mobile** | Data page has no responsive handling; InvestigationLayout handles mobile but other pages don't | Medium: unusable below 768px | Medium | P1 |
| **Global** | Hardcoded Tailwind colors (red-400, purple-500, green-400) instead of CSS variables throughout | Low | High: theme switching breaks | P1 |
| **Global** | Two tooltip systems: CSS `[data-tooltip]` and React `Tooltip` component | Low | Medium: inconsistency | P2 |
| **Global** | Feature flags all `false` — production UI hides most AI capabilities | High: app looks less capable than it is | Low | P0 |
| **Global** | `text-[10px]` and `text-xs` used extensively — overall text sizing is quite small | Medium: readability for some users | Medium | P1 |

### Priority Summary

| Priority | Count | Examples |
|---|---|---|
| P0 | 4 | Wrong click target on home, no cancel on analysis, two history concepts, feature flags hiding AI |
| P1 | 16 | Hardcoded colors, small text, i18n gaps, mobile breaks, cryptic brand |
| P2 | 12 | Inconsistent modals, tooltip duplication, version placeholder, emoji icons |

---

## 4. Design Principles

### Product Principle

- Every page serves **one primary task**
- Main flows first, experimental features hidden
- After uploading data, the **next step must be obvious**
- AI output shows **conclusion first, then process**
- Error messages tell the user **what happened** and **what they can do about it**

### Visual Principle

- Dark premium aesthetic (dark backgrounds, subtle borders, restrained highlights)
- Accent color: restrained cyan/teal — used sparingly for primary actions and active states
- Minimal gradients, minimal animation
- More whitespace and consistent alignment
- Tables and code areas maintain "tool feel" — dense but organized
- Report areas maintain "readability feel" — generous line height, clear hierarchy

### Engineering Principle

- No new UI libraries
- No business logic changes
- Every polish change must be independently revertable
- All changes pass tsc / tests / build
- Order: design tokens first, then pages, then components

---

## 5. User Flow

### Target User Journey

| Step | Page | User Goal | Primary CTA | Success State |
|---|---|---|---|---|
| 1 | Home | Understand what this project does | "Start Analysis" button | User clicks through to Data or Analyze |
| 2 | Data | Upload a CSV/Excel file or select existing table | Upload dropzone / table list click | Table appears in preview with row count |
| 3 | Analyze (AI) | Ask a question in natural language | Question textarea + Submit | AI result card shows conclusion, sections, charts |
| 4 | Analyze (SQL) | Write and execute SQL | Execute button in Monaco editor | Results table appears with row count |
| 5 | History | Find and re-open a past analysis or query | Click history entry | Past result loads in context |
| 6 | Settings | Switch language or theme | Toggle buttons | UI updates immediately |

### Flow Rules

- **Home** is a product entry, not a dashboard. Two action cards max. No feature dump.
- **Data** is a data asset panel. Upload → select → preview. No half-baked chart suggestions.
- **Analyze** is the core page. AI tab for natural language, Expert SQL tab for code. Both feed into History.
- **History** is a unified analysis record library. SQL and AI records in one place, filterable.
- **Settings** is minimal: language, theme, version. No API key configuration, no model settings.

### 3-Minute Test

A new user should be able to:
1. Land on Home → understand the value proposition in 5 seconds
2. Click "Upload Data" → drag a CSV → see it in the table list (30 seconds)
3. Click "Start Analysis" → type a question → see AI results (60 seconds)
4. Switch to Expert SQL → write a query → see results (30 seconds)
5. Go to History → find the analysis they just ran → click to re-open (15 seconds)

Total: ~3 minutes from zero to full loop.

---

## 6. Visual System Proposal

> This section is design guidance only. No code changes.

### Colors

| Token | Usage | Suggested Direction |
|---|---|---|
| `bg-app` | Page background | Keep current dark (`#0A0A0F` or similar deep dark) |
| `bg-surface` | Card / panel background | Slightly lighter than app bg, subtle elevation |
| `bg-surface-elevated` | Dropdowns, modals, popovers | One step above surface |
| `border-subtle` | Default card/panel borders | Very low contrast, barely visible |
| `border-strong` | Active/focused borders | Slightly more visible, used sparingly |
| `text-primary` | Headings, body text | Near-white, high contrast |
| `text-secondary` | Labels, descriptions | Medium gray |
| `text-muted` | Timestamps, metadata | Low contrast gray |
| `accent` | Primary actions, active states | Keep cyan/teal (`#00D4AA`), but reduce usage面积 |
| `accent-soft` | Hover backgrounds, subtle highlights | 10-15% opacity of accent |
| `success` | Completed states, healthy scores | Muted green, not neon |
| `warning` | Warnings, in-progress states | Muted amber |
| `error` | Errors, destructive actions | Muted red — not alarming unless P0 |

Key rule: **reduce highlight surface area.** Accent should appear on 1-2 elements per screen, not everywhere.

### Typography

| Element | Strategy |
|---|---|
| Chinese body | System sans-serif stack (`-apple-system, "Microsoft YaHei", sans-serif`) |
| English / numbers / SQL | Monospace (`JetBrains Mono`, `Consolas`, monospace) |
| Page title | `text-lg` or `text-xl`, semibold, `text-primary` |
| Section heading | `text-sm` or `text-base`, semibold, `text-primary` |
| Body text | `text-sm` (14px), `text-secondary` |
| Metadata / timestamps | `text-xs` (12px), `text-muted` |
| Table numbers | Right-aligned, monospace |
| SQL / code | Monospace, `text-sm`, with syntax highlighting |
| Report body | `text-sm`, line-height 1.6-1.7, max-width 680px |

Key rule: **no `text-[10px]` in user-facing areas.** Minimum readable size is `text-xs` (12px).

### Layout

| Element | Suggested Value |
|---|---|
| Left navigation width | 208px (keep current) |
| Content max-width | 1280px for most pages, unlimited for data tables |
| Card padding | `p-4` to `p-5` |
| Card gap | `gap-4` or `space-y-4` |
| Top bar height | 48px |
| Page title area | `py-4 px-6` with page title + optional subtitle |
| Table area | Full width within content, horizontal scroll if needed |
| Analysis workspace | Single column with collapsible detail sections |

### Components to Unify

| Component | Current State | Target |
|---|---|---|
| **Button** | Mix of raw `<button>` and `<Button>` component | Standardize on `<Button>` with consistent variants |
| **Card** | Consistent via `Card` component | Keep, ensure consistent padding |
| **Table** | `DataTable` component exists | Keep, ensure consistent header/body styling |
| **Empty State** | `EmptyState` component exists, some callers pass `icon=""` | Fix icon="" bug, ensure all empty states have i18n |
| **Error State** | Two implementations (ErrorBoundary emoji vs ErrorFallback Lucide) | Standardize on Lucide icon |
| **Toast** | `react-hot-toast` | Keep, ensure consistent styling |
| **Badge** | Various inline implementations | Create shared `Badge` component |
| **Tabs** | `TabGroup` component exists | Keep, ensure consistent active/inactive styling |
| **Input** | `Input` component exists | Keep, ensure consistent focus/error states |
| **AI Result Card** | Custom inline cards in streaming-output | Standardize card structure: summary → sections → details |
| **History Item** | Custom inline cards in sql-history-panel | Standardize: type badge + preview + metadata |
| **SQL Result Table** | Uses `DataTable` | Keep, ensure consistent with data preview table |

### Motion

Allowed:
- Hover: subtle background change, 150ms ease
- Loading: shimmer skeleton animation (already exists)
- Fade: content appearing, 200ms ease
- Focus: border color change, 150ms ease

Forbidden:
- Page transitions
- Complex enter/exit animations
- Bounce, spring, or elastic effects
- Parallax or scroll-triggered animations
- Any animation that blocks user interaction

---

## 7. Page-by-page Redesign Plan

### Home

**Current problems:**
- Hero center-aligned, rest left-aligned — layout inconsistency
- Demo flow steps are decorative, not clickable
- Recent SQL queries navigate to wrong page
- Empty state is implicit when no data
- Deployment notice uses warning icon for info message
- Two primary action cards have different border styles

**Recommended changes:**
- Left-align everything consistently
- Make demo steps clickable links to corresponding pages
- Fix recent query click target → navigate to SQL workspace with query loaded
- Add explicit empty state: "Upload a CSV or Excel file to start analyzing"
- Change deployment notice icon to `Info`
- Unify action card border styles — one primary (accent border), one secondary (subtle border)

**Acceptance criteria:**
- HR person knows what the project does in 30 seconds
- All click targets go to correct destinations
- Empty state clearly guides user to upload data
- Visual hierarchy: hero → action cards → recent activity

### Data

**Current problems:**
- Left sidebar fixed at 272px, no collapse, no mobile handling
- Empty states hardcoded in English
- Schema fetch errors silently swallowed
- No page-level loading state
- `<hr>` dividers inconsistent with rest of app

**Recommended changes:**
- Make left sidebar collapsible on smaller screens
- Move empty state text to i18n system
- Show error state when schema fetch fails (not silent empty)
- Add skeleton loading state for initial data fetch
- Replace `<hr>` with consistent `border-b` dividers
- Improve table card visual hierarchy: name prominent, metadata secondary

**Acceptance criteria:**
- All empty/error states use i18n
- Schema fetch failure shows error, not empty
- Page works reasonably at 1024px width
- Table cards have clear visual hierarchy

### Analysis Workspace

**Current problems:**
- No cancel button for running analysis
- Example questions disappear after first result
- "Expert SQL" tab embeds full SqlWorkspacePanel — visual nesting confusion
- Input area uses important overrides suggesting component defaults are wrong
- Table info badge uses `text-[10px]`

**Recommended changes:**
- Add visible Cancel button during analysis execution
- Keep example questions visible (collapsed) after results appear
- When Expert SQL tab is active, simplify the toolbar context (remove AI-specific buttons or clearly separate them)
- Fix textarea component defaults so important overrides are not needed
- Increase minimum text size to `text-xs`

**Acceptance criteria:**
- User can cancel a running analysis
- Example questions remain accessible after first result
- Expert SQL tab feels like a clean SQL workspace, not a nested page
- All text is at least 12px

### Streaming Output (AI Results)

**Current problems:**
- Error messages use fragile string matching
- No retry button on errors
- Summary renders raw markdown syntax
- Steps hidden by default in `<details>`
- Duplicate plan rendering during streaming/completion transition

**Recommended changes:**
- Use error codes from backend instead of string matching
- Add visible "Retry" button on error cards
- Render summary as simple formatted text (not raw markdown, not full markdown — keep it simple)
- Show steps expanded by default during streaming, collapsed after completion
- Fix plan rendering transition to avoid flash

**Acceptance criteria:**
- Error cards show retry button
- Summary is readable (no raw markdown syntax)
- Steps are visible during streaming
- Error classification works without string matching

### Expert SQL

**Current problems:**
- Toolbar overloaded with 10+ buttons
- Save dialog uses raw HTML overlay
- Cancel button uses hardcoded colors
- AI buttons use hardcoded purple/amber

**Recommended changes:**
- Group toolbar buttons: primary (Execute) | secondary (Explain, Format) | tertiary (Save, Clear, Export) — with visual separation
- Replace save dialog with shared `Dialog` component
- Replace all hardcoded colors with CSS variables
- On narrow screens, collapse tertiary buttons into a "More" dropdown

**Acceptance criteria:**
- Toolbar has clear visual grouping
- All colors use CSS variables
- Save dialog matches other modals in the app
- Toolbar works at 1024px without multi-line wrapping

### History

**Current problems:**
- Two separate "history" concepts on different pages
- "Load into current tab" vs "Re-run in new tab" confusing
- Delete only visible on hover
- Type badge colors hardcoded
- Empty state uses emoji icons
- No pagination or virtualization

**Recommended changes:**
- Merge SQL history and AI analysis history into one unified view (with type filter)
- Make click-to-load and re-run visually distinct (different icons + tooltips)
- Show delete button always (not just on hover), or use a context menu
- Replace hardcoded colors with CSS variables
- Replace emoji with Lucide icons
- Add simple pagination or limit display to last 100 entries

**Acceptance criteria:**
- One History page shows all records (SQL + AI)
- Each record clearly shows its type
- Actions are discoverable without hover
- All colors use CSS variables

### Settings

**Current problems:**
- Version shows "v..." if API unreachable
- No breadcrumb or back link
- Monitor icon is weak metaphor for version/about

**Recommended changes:**
- Show fallback version string when API is unreachable (e.g., "v1.0.x")
- Add back-to-home link or breadcrumb
- Change version icon to `Info`

**Acceptance criteria:**
- Version always shows a meaningful string
- User can navigate back to home
- Visual consistency with rest of app

---

## 8. Execution Roadmap

Each phase is a separate branch, merged independently. No phase depends on another being complete first (though M4-6.1 should go first for token consistency).

### M4-6.1 Design Tokens & Base Components

| Item | Detail |
|---|---|
| **Goal** | Unify colors, borders, spacing, typography — no business logic changes |
| **Allowed files** | `globals.css`, `tailwind.config.ts`, `src/components/ui/*`, `src/styles/*` |
| **Forbidden files** | `backend/*`, `src/stores/*`, `src/panels/*`, `src/app/*`, `src/components/investigation/*`, `src/components/ai/*`, `src/components/sql-workspace/*` |
| **Acceptance** | Pages look more consistent; no functional changes; tsc/tests/build pass |
| **Rollback** | Revert merge commit; all changes are in style files and shared UI primitives |

Specific tasks:
- Replace hardcoded Tailwind colors (`red-400`, `purple-500`, `green-400`, `amber-400`, `blue-400`) with CSS variables
- Ensure minimum text size is `text-xs` (12px) — remove all `text-[10px]` from user-facing areas
- Standardize error state icons (Lucide only, no emoji)
- Fix `EmptyState` icon="" bug
- Unify tooltip system (pick one: CSS or React, remove the other)
- Clean up light theme CSS duplication (define shared tokens once on `:root`)

### M4-6.2 Home + Navigation Polish

| Item | Detail |
|---|---|
| **Goal** | Home reads as product entry; navigation brand is professional |
| **Allowed files** | `src/app/(shell)/page.tsx`, `src/layout/sidebar.tsx`, `src/layout/app-shell.tsx` |
| **Forbidden files** | `backend/*`, `src/stores/*`, `src/panels/*`, `src/components/investigation/*` |
| **Acceptance** | HR person understands project in 30 seconds; brand area looks professional |
| **Rollback** | Revert merge commit |

Specific tasks:
- Left-align home page layout consistently
- Make demo flow steps clickable (link to Data, Analyze, etc.)
- Fix recent SQL query click target → SQL workspace
- Add explicit empty state when no data
- Change deployment notice icon from `AlertCircle` to `Info`
- Unify action card border styles
- Improve sidebar brand area (consider showing full name or better abbreviation)

### M4-6.3 Data Page Polish

| Item | Detail |
|---|---|
| **Goal** | Data page feels like a data asset panel, not a raw file manager |
| **Allowed files** | `src/app/(shell)/data/page.tsx`, `src/panels/data-preview-panel.tsx`, `src/panels/file-upload-panel.tsx`, `src/panels/table-management-panel.tsx`, `src/panels/status-panel.tsx` |
| **Forbidden files** | `backend/*`, `src/stores/*`, `src/components/investigation/*`, `src/components/ai/*` |
| **Acceptance** | All empty/error states use i18n; schema errors shown; page works at 1024px |
| **Rollback** | Revert merge commit |

Specific tasks:
- Move hardcoded English empty states to i18n
- Show schema fetch errors instead of silent empty
- Add skeleton loading for initial fetch
- Replace `<hr>` with consistent border dividers
- Improve table card hierarchy
- Fix hardcoded colors in status-panel.tsx

### M4-6.4 Analysis Workspace Polish

| Item | Detail |
|---|---|
| **Goal** | Analysis workspace feels like an AI report workstation, not an engineering log |
| **Allowed files** | `src/app/(shell)/analyze/page.tsx`, `src/app/(shell)/analyze/[runId]/page.tsx`, `src/components/investigation/*`, `src/components/ai/*`, `src/panels/ai-analysis-panel.tsx`, `src/panels/ai-analysis-modes.ts`, `src/panels/sql-workspace-panel.tsx`, `src/components/sql-workspace/*` |
| **Forbidden files** | `backend/*`, `src/stores/*` |
| **Acceptance** | AI results read like reports; cancel button visible; steps visible during streaming; toolbar grouped |
| **Rollback** | Revert merge commit |

Specific tasks:
- Add Cancel button for running analysis
- Keep example questions accessible after results
- Simplify Expert SQL tab toolbar context
- Fix textarea important overrides
- Add retry button on error cards
- Render summary as formatted text (not raw markdown)
- Show steps expanded during streaming
- Group SQL toolbar buttons with visual separation
- Replace save dialog with shared Dialog component
- Replace hardcoded colors with CSS variables

### M4-6.5 History + Settings Polish

| Item | Detail |
|---|---|
| **Goal** | History page is a unified analysis record library; settings is minimal but not broken |
| **Allowed files** | `src/app/(shell)/history/page.tsx`, `src/app/(shell)/settings/page.tsx`, `src/panels/sql-history-panel.tsx`, `src/panels/analysis-workspace-panel.tsx` |
| **Forbidden files** | `backend/*`, `src/stores/*` |
| **Acceptance** | One history view for SQL + AI; actions discoverable without hover; settings shows meaningful version |
| **Rollback** | Revert merge commit |

Specific tasks:
- Merge SQL history and AI analysis history into unified view
- Make actions visible without hover
- Replace hardcoded badge colors with CSS variables
- Replace emoji icons with Lucide icons
- Fix version fallback in settings
- Add back navigation to settings

---

## 9. Acceptance Criteria

### M4-6 Overall

| Criterion | How to Verify |
|---|---|
| HR person knows what the project does in 30 seconds | Show home page to someone unfamiliar; they should describe it correctly |
| User can run the main loop in 3 minutes | Upload CSV → AI question → SQL query → History → all working |
| Each page has one clear primary task | Home=entry, Data=upload/select, Analyze=query, History=review, Settings=config |
| All error states are user-friendly | Trigger API errors; each shows message + action |
| All empty states suggest next step | Clear all data; each page shows guidance |
| Visual style is unified | No hardcoded colors; consistent spacing; consistent typography |
| No half-baked entry points | No placeholder links, no "(0)" counts, no broken icons |
| No new P0/P1 regressions | All existing tests pass; manual smoke test of main flows |
| Vercel + Render main loop works | Deploy and verify end-to-end on production |
| tsc / tests / build all pass | `npx tsc --noEmit && npm run test && npm run build` |

### Per-Phase

Each phase has its own acceptance criteria listed in Section 8 above. A phase is not complete until all its criteria are met and the build passes.

---

## 10. Risks and Rollback

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Visual changes cause functional regression | Medium | High | Each phase tested with tsc/tests/build; manual smoke test before merge |
| CSS token changes affect global layout | Medium | High | M4-6.1 isolates token changes; visual diff before/after each page |
| Analysis workspace UI changes break AI result display | Low | High | M4-6.4 is the most complex phase; test with real AI responses |
| History page unification loses data or breaks navigation | Low | Medium | Keep both data sources; merge the view, not the stores |
| Mobile layout breaks on new responsive changes | Medium | Medium | Test at 375px, 768px, 1024px breakpoints |
| CSS variable migration breaks light theme | Low | Medium | Test both dark and light themes after M4-6.1 |

### Rollback Strategy

1. **Each phase is a separate branch** (`m4-6-1-design-tokens`, `m4-6-2-home-nav`, etc.)
2. **Each phase is a separate merge commit** to master
3. **If a phase causes regression**, revert its merge commit: `git revert -m 1 <merge-commit>`
4. **M4-6.1 is the riskiest** (global CSS changes) — test thoroughly before merging
5. **M4-6.4 is the most complex** (analysis workspace) — test with real AI responses
6. **No phase changes backend or stores** — data layer is untouched, so rollback is purely visual

### Emergency Procedure

If a deployed phase breaks the main loop:
1. Revert the merge commit on master
2. Push to trigger Vercel redeploy (auto-deploys previous good state)
3. Investigate the issue on the feature branch
4. Fix and re-merge when ready

---

## Appendix: Files Likely to Change Per Phase

### M4-6.1
- `frontend-react/src/styles/globals.css`
- `frontend-react/tailwind.config.ts`
- `frontend-react/src/components/ui/empty-state.tsx`
- `frontend-react/src/components/ui/error-boundary.tsx`
- `frontend-react/src/components/ui/error-fallback.tsx`

### M4-6.2
- `frontend-react/src/app/(shell)/page.tsx`
- `frontend-react/src/layout/sidebar.tsx`
- `frontend-react/src/layout/app-shell.tsx`

### M4-6.3
- `frontend-react/src/app/(shell)/data/page.tsx`
- `frontend-react/src/panels/data-preview-panel.tsx`
- `frontend-react/src/panels/file-upload-panel.tsx`
- `frontend-react/src/panels/table-management-panel.tsx`
- `frontend-react/src/panels/status-panel.tsx`
- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/i18n/en.ts`

### M4-6.4
- `frontend-react/src/app/(shell)/analyze/page.tsx`
- `frontend-react/src/app/(shell)/analyze/[runId]/page.tsx`
- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `frontend-react/src/components/investigation/streaming-output.tsx`
- `frontend-react/src/components/investigation/ai-streaming-indicator.tsx`
- `frontend-react/src/panels/sql-workspace-panel.tsx`
- `frontend-react/src/components/sql-workspace/query-tabs-bar.tsx`

### M4-6.5
- `frontend-react/src/app/(shell)/history/page.tsx`
- `frontend-react/src/app/(shell)/settings/page.tsx`
- `frontend-react/src/panels/sql-history-panel.tsx`
- `frontend-react/src/panels/analysis-workspace-panel.tsx`
