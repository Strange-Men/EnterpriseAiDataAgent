# Phase 3 Changelog — v0.8.0 Product UX + Design System Refactor

> Date: 2026-05-26 | Previous version: v0.7.6

---

## New: Design System V2

### CSS Custom Properties (globals.css)
- **Spacing scale**: `--space-1` through `--space-24` (4px–96px)
- **Typography**: `--font-size-xs` through `--font-size-2xl`, `--font-weight-*`, `--line-height-*`, `--font-mono`
- **Border radius**: `--radius-sm` through `--radius-xl`, `--radius-full`
- **Elevation**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Motion**: `--duration-fast/normal/slow`, `--ease-default/out/in`
- **Z-index scale**: `--z-dropdown/sticky/modal/toast/command`
- **Semantic color extensions**: `--accent-subtle`, `--accent-emphasis`, `--success-subtle`, `--warning-subtle`, `--danger-subtle`

### Tailwind Config (tailwind.config.ts)
- Extended `colors` to use CSS variable references
- Extended `borderRadius`, `fontSize`, `fontFamily`, `transitionDuration`, `transitionTimingFunction`, `boxShadow`, `zIndex`
- Added `tailwindcss/plugin` with `.scrollbar-thin` and `.scrollbar-gutter-stable` utilities

### New Animation Keyframes
- `slide-up`, `slide-down`, `fade-in`, `pulse-border`, `typing-cursor`
- Utility classes: `.animate-slide-up`, `.animate-slide-down`, `.animate-fade-in`, `.animate-pulse-border`, `.animate-typing-cursor`
- `.transition-theme` utility for smooth theme transitions

---

## New: UI Primitive Components (13 new files)

| Component | File | Purpose |
|-----------|------|---------|
| Button | `src/components/ui/button.tsx` | 5 variants, 3 sizes, loading state, icon slots |
| Card | `src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Input | `src/components/ui/input.tsx` | Input, Textarea, Select with unified styling |
| Dialog | `src/components/ui/dialog.tsx` | Portal-based modal with Escape/backdrop close, body scroll lock |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Position-aware dropdown with keyboard nav |
| CommandPalette | `src/components/ui/command-palette.tsx` | Ctrl+K command palette with fuzzy search, keyboard nav |
| GlobalSearch | `src/components/ui/global-search.tsx` | Ctrl+/ search across runs, tables, pages |
| KeyboardShortcutsModal | `src/components/ui/keyboard-shortcuts-modal.tsx` | Dialog displaying all shortcuts grouped by category |
| ErrorFallback | `src/components/ui/error-fallback.tsx` | Error boundary fallback with retry button |
| useKeyboardShortcuts | `src/hooks/use-keyboard-shortcuts.ts` | Centralized keyboard shortcut hook with 10 shortcuts |

---

## Enhanced: Investigation UX (14 files modified)

### Streaming Feedback
- Phase icons (Lightbulb/Play/FileText/BrainCircuit) replace generic pulsing dots
- Progress bar showing overall streaming progress (20% → 95%)
- Step count display ("Step 3/5")
- Typing cursor animation during summary phase

### Step Results
- Slide-up animation on new steps (staggered 80ms delay)
- Collapsible completed steps with CheckCircle2/XCircle icons
- Active step has pulsing border animation
- Click header to toggle data preview

### Confidence & Evaluation
- SVG confidence ring gauge (circular progress, color-coded)
- Horizontal metric bars for completeness/accuracy/actionability
- Quality gates section removed (not in EvaluationResult type)

### Trace Timeline
- Events grouped by phase with collapsible sections
- Per-phase summary (calls, tokens, latency)
- ChevronRight icons from lucide-react
- Always-visible summary line

### Chart Presentation
- Loading state with ChartSkeleton
- Empty state for no-data charts
- Download SVG button
- Fullscreen toggle
- Theme-aware color palette (CSS variable references)

### Drill-Down Chain
- Toggle between Timeline and Breadcrumb view modes
- Breadcrumb uses horizontal chips with `/` separators
- Timeline preserves vertical dots + connector lines

### Skeleton Components
- New: `ChartSkeleton`, `StreamingSkeleton`, `AnalysisCardSkeleton`
- Streaming skeleton shown during investigation loading

---

## New: Product-Level UX Features

### Command Palette
- Triggered by Ctrl+K or header button
- Search across navigation, actions, and recent analysis runs
- Keyboard navigation with Arrow keys, Enter, Escape

### Global Search
- Triggered by Ctrl+/ or header button
- Full-text search across runs, tables, and pages
- Results grouped by type with type badges

### Keyboard Shortcuts
- Centralized system: 10 registered shortcuts
- Context-aware (disabled in input fields by default)
- Keyboard shortcuts help modal (press `?`)
- Mac-friendly display (⌘ vs Ctrl)

### Smart Empty States
- `/data`, `/query`, `/history` now have feature preview cards instead of "Coming in next PR"
- Each shows 3 feature cards and a link to the working `/analyze` route
- Homepage: 3-step onboarding guide for new users

### Homepage Enhancements
- "time ago" relative timestamps for recent analyses
- New user onboarding card with 3-step visual guide
- Smart empty state when tables exist but no runs

---

## Enhanced: Icons Migration

All inline SVG icons replaced with `lucide-react` components (already installed, previously unused):

| File | Icons Replaced |
|------|---------------|
| `sidebar.tsx` | 6 nav icons (House, Database, Code, MonitorPlay, Clock, Settings) |
| `app-shell.tsx` | Theme/language toggles (Sun, Moon, Languages) |
| `streaming-output.tsx` | Empty state icon (MonitorPlay) |
| `context-panel.tsx` | Expand chevron (ChevronRight) |
| `analysis-section.tsx` | Copy button (Copy) |
| `trace-timeline.tsx` | Expand chevron (ChevronRight) |
| `step-results.tsx` | Status icons (CheckCircle2, XCircle, ChevronRight, ChevronDown) |
| `run-evaluation.tsx` | (no new icon dependencies) |
| 3 placeholder pages | Database, Code, Clock, Search, Filter, Table, etc. |
| `page.tsx` (home) | Upload, Code, MonitorPlay, ArrowRight, Database, Zap, BrainCircuit |

---

## Performance Optimizations

- **next/dynamic lazy loading**: `/analyze` page (InvestigationWorkspace) and `/analyze/[runId]` page (all sub-components)
- **Suspense boundary**: Root-level with PanelSkeleton fallback
- **react-error-boundary**: Replaced custom class-based ErrorBoundary with library version (already in package.json)
- **Error fallback**: Extracted to dedicated component with retry functionality

---

## Responsive Polish

- **Ultra-wide** (≥1920px): Main content centered at max-w-[1200px]
- **Sidebar**: Hidden on mobile (`max-md:hidden`), icon-only mode ready
- **Investigation Layout**: 3-zone layout preserved, ultra-wide centering on main column

---

## Breaking Changes

**None.** All Zustand store shapes, persist keys, API endpoints, SSE protocol, and existing tests are unchanged.

---

## Migration Notes

- No migration required. All changes are additive or drop-in replacements.
- Components using inline Tailwind buttons/inputs/cards continue to work.
- New UI primitives (Button, Card, Input, Dialog, DropdownMenu) can be adopted gradually.

---

## Known Limitations

- Quality gates section was planned for run-evaluation but `EvaluationResult` type does not include `quality_gates` field
- Chart SVG download captures the SVG element but may not include all CSS variable styles
- Global search scope is limited to frontend store data (runs, tables, page labels)

---

## Files Summary

- **New files**: 14 (5 UI primitives + 4 UX features + 1 hook + 4 docs)
- **Modified files**: 28
- **Deleted files**: 0
- **New dependencies**: 0 (lucide-react and react-error-boundary already in package.json)
