# Product UX Guidelines — Enterprise AI Data Agent

> Version: v0.8.0 | Last updated: 2026-05-26

## Navigation Patterns

### Sidebar Navigation
- **6 primary nav items**: Home, Data, SQL Query, AI Analyze, History, Settings
- **Active state**: `bg-[var(--accent)]/10` with accent text color
- **Hover state**: `bg-[var(--bg-tertiary)]` with primary text color
- **Responsive**: Hidden on mobile (`max-md:hidden`)
- **Footer link**: "Classic View" → legacy 3-column layout

### Header
- Left: Page title (uppercase, accent color, tracking-wider)
- Right (left to right): Cmd Pal trigger, Shortcuts help, Theme toggle, Language toggle
- Shows breadcrumb hint on nested routes (e.g., `/analyze/abc123`)

### Command Palette (`Ctrl+K`)
- Opens from anywhere via keyboard shortcut or header button
- Fuzzy search across navigation, actions, and recent runs
- Keyboard navigation: Arrow keys, Enter, Escape
- Backdrop blur for depth

### Global Search (`Ctrl+/`)
- Searches across runs, tables, and pages
- Results grouped by type with type badges
- Keyboard navigation

### Breadcrumb
- Shown in header on investigation detail pages
- Displays truncated run ID

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+/` | Open global search |
| `?` | Keyboard shortcuts help |
| `Ctrl+H` | Go Home |
| `Ctrl+A` | Go to Analyze |
| `Ctrl+D` | Go to Data |
| `Ctrl+Q` | Go to Query |
| `Ctrl+,` | Go to Settings |
| `Ctrl+Shift+T` | Toggle theme |
| `Ctrl+Shift+L` | Toggle language |

---

## Investigation Workflow UX

### Phases
1. **Idle** — Empty state with "Ask a question" prompt
2. **Plan** — AI generates analysis plan (step list)
3. **Step execution** — Progressive step results with streaming
4. **Summary** — Executive summary with typing cursor
5. **Done** — Full results with sections, charts, trace

### Streaming UX
- **Progress bar**: Thin accent-colored bar tracking overall progress (20% → 95%)
- **Phase indicator**: Lucide icon (Lightbulb/Play/FileText/BrainCircuit) with pulsing animation
- **Step count**: "Step 3/5" during step execution
- **Typing cursor**: Blinking `|` during summary generation
- **Skeleton**: Shows `StreamingSkeleton` while waiting for first content
- **Step animation**: Cards slide up with staggered delay (80ms per step)
- **Active step**: Pulsing border animation
- **Completed steps**: Collapsible with CheckCircle2 icon

### Post-Streaming
- **Sections**: Markdown-rendered with syntax highlighting, copy button per section
- **Charts**: Recharts with theme colors, download SVG, fullscreen toggle
- **Summary**: Highlighted card with accent border
- **Trace**: Collapsible by phase with latency bars and token counts
- **Evaluation**: SVG confidence ring + metric bars
- **Drill-down**: Timeline or breadcrumb view for evolution chain

---

## Empty State Patterns

### Smart Empty States
- Consistent `EmptyState` component with:
  - Icon circle (14×14, bg-tertiary, centered)
  - Title (text-sm, font-medium, text-primary)
  - Description (text-xs, text-muted, max-w-260px)
  - Optional action slot

### Contextual Variations
- **No data**: "Upload data first" → CTA link to analyze
- **No runs**: "Start an investigation" → CTA button
- **No results**: "No analysis sections generated"
- **New user**: 3-step onboarding guide on homepage

### Placeholder Routes
`/data`, `/query`, `/history` show feature preview cards (3 per page) with descriptions of what will be available, plus a link to the working `/analyze` route.

---

## Error Handling Patterns

### Error Boundary (Root Level)
- Uses `react-error-boundary` with custom `ErrorFallback` component
- Shows: warning icon, error message, "Try Again" button
- Resets boundary state on click

### Inline Errors
- Red-tinted cards with red text for API/streaming errors
- Error messages in step results shown in red-tinted blocks
- Guardrail violations shown in yellow warning blocks in trace

### Toast Notifications
- Position: top-right, 3.5s duration (5s for errors)
- Themed to match current dark/light mode
- Success: green icon, Error: red icon

---

## Loading State Patterns

### Skeleton Variants
- `Skeleton` — Generic line skeleton (configurable rows)
- `TableSkeleton` — Table with header + row outlines
- `PanelSkeleton` — Panel with title + content lines
- `ChartSkeleton` — Chart title + 280px rectangle
- `StreamingSkeleton` — Plan skeleton + step card skeletons
- `AnalysisCardSkeleton` — Card with icon + title + content lines

### Spinner
- Lucide `Loader2` with `animate-spin` class
- Used in Button loading state, SQL execution, data fetching

### Progressive Loading
- `next/dynamic` with loading fallback for heavy pages (/analyze, /analyze/[runId])
- `Suspense` boundary at app root with PanelSkeleton fallback
- Command palette and global search components loaded eagerly (small footprint)

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Ultra-wide | ≥1920px | Main content centered at max-w-[1200px] |
| Desktop | 1024–1919px | Full sidebar, 3-zone investigation layout |
| Laptop | 768–1023px | Full sidebar, investigation layout auto-collapses tools panel |
| Tablet | <768px | Sidebar hidden, investigation defaults to single-column |
| Mobile | <640px | Single column, no sidebar, cards stack vertically |

### Mobile Safety
- All pages scrollable within their container
- No horizontal overflow on minimum width (320px)
- Touch-friendly button sizes (minimum 28px tap target)
