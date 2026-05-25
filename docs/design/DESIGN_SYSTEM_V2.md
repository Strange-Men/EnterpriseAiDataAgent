# Design System V2 — Enterprise AI Data Agent

> Version: v0.8.0 | Last updated: 2026-05-26

## Overview

The design system is built on CSS custom properties (variables) defined in `frontend-react/src/styles/globals.css`. They are mapped into Tailwind's `theme.extend` in `tailwind.config.ts`. All tokens have dark and light variants under `[data-theme="dark"]` / `[data-theme="light"]`.

---

## Color Semantics

### Surfaces

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--bg-primary` | `#0E1117` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#161B22` | `#F6F8FA` | Card backgrounds, sidebar, header |
| `--bg-tertiary` | `#21262D` | `#EAECEF` | Hover states, skeleton, tertiary surfaces |
| `--border-default` | `#30363D` | `#D0D7DE` | Default borders |
| `--border-hover` | `#484F58` | `#AFB8C1` | Border hover state |

### Text

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--text-primary` | `#E6EDF3` | `#1F2328` | Primary text, headings |
| `--text-secondary` | `#C9D1D9` | `#24292F` | Body text |
| `--text-muted` | `#8B949E` | `#656D76` | Muted/helper text |

### Semantic Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--accent` | `#00D4AA` | `#00876C` | Primary brand, CTA, links |
| `--accent-hover` | `#00B894` | `#006D55` | Accent hover state |
| `--accent-subtle` | `rgba(0,212,170,0.1)` | `rgba(0,135,108,0.1)` | Accent backgrounds |
| `--success` | `#3FB950` | `#1A7F37` | Success states |
| `--warning` | `#D29922` | `#9A6700` | Warning states |
| `--error` | `#F85149` | `#CF222E` | Error/danger states |
| `--info` | `#58A6FF` | `#0969DA` | Info states |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Internal gaps |
| `--space-3` | 12px | Card padding x |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Large section gaps |
| `--space-8` | 32px | Layout gaps |
| `--space-10` | 40px | Major section gaps |
| `--space-12` | 48px | Page-level spacing |
| `--space-16` | 64px | Hero spacing |
| `--space-20` | 80px | Full-page spacing |
| `--space-24` | 96px | Max spacing |

Tailwind mapping: `p-ds-1`, `gap-ds-4`, etc.

---

## Typography

| Token | Value |
|-------|-------|
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif` |
| `--font-mono` | `"JetBrains Mono", "Cascadia Code", "Fira Code", ui-monospace, monospace` |
| `--font-size-xs` | 0.75rem (12px) |
| `--font-size-sm` | 0.8125rem (13px) |
| `--font-size-base` | 0.875rem (14px) |
| `--font-size-lg` | 1rem (16px) |
| `--font-size-xl` | 1.125rem (18px) |
| `--font-size-2xl` | 1.5rem (24px) |
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--line-height-tight` | 1.25 |
| `--line-height-normal` | 1.5 |
| `--line-height-relaxed` | 1.75 |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inline code, badges |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, dialogs |
| `--radius-xl` | 12px | Modals, command palette |
| `--radius-full` | 9999px | Avatars, pills |

---

## Elevation (Shadows)

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(...)` |
| `--shadow-md` | `0 4px 12px rgba(...)` |
| `--shadow-lg` | `0 8px 24px rgba(...)` |

Uses `--shadow-color` for dark/light adaptivity.

---

## Motion

| Token | Value |
|-------|-------|
| `--duration-fast` | 150ms |
| `--duration-normal` | 200ms |
| `--duration-slow` | 300ms |
| `--ease-default` | `cubic-bezier(0.4,0,0.2,1)` |
| `--ease-out` | `cubic-bezier(0,0,0.2,1)` |
| `--ease-in` | `cubic-bezier(0.4,0,1,1)` |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 50 | Dropdown menus |
| `--z-sticky` | 100 | Sticky headers, tooltips |
| `--z-modal` | 200 | Dialogs, modals |
| `--z-toast` | 300 | Toast notifications |
| `--z-command` | 400 | Command palette, global search |

---

## Component Catalog

### UI Primitives (`src/components/ui/`)

| Component | File | Exports |
|-----------|------|---------|
| Button | `button.tsx` | `Button` — variant (primary/secondary/ghost/danger/danger-ghost), size (sm/md/lg), loading, leftIcon/rightIcon |
| Card | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Input | `input.tsx` | `Input`, `Textarea`, `Select` |
| Dialog | `dialog.tsx` | `Dialog`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogCloseButton` |
| DropdownMenu | `dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel` |
| CommandPalette | `command-palette.tsx` | `CommandPalette` (Ctrl+K) |
| GlobalSearch | `global-search.tsx` | `GlobalSearch` (Ctrl+/) |
| Skeleton | `skeleton.tsx` | `Skeleton`, `TableSkeleton`, `PanelSkeleton`, `ChartSkeleton`, `StreamingSkeleton`, `AnalysisCardSkeleton` |
| EmptyState | `empty-state.tsx` | `EmptyState` — icon (ReactNode), title, description, action |
| ErrorFallback | `error-fallback.tsx` | `ErrorFallback` — for react-error-boundary |
| StatusBadge | `status-badge.tsx` | `StatusBadge` — colored dot + label |
| TabGroup | `tab-group.tsx` | `TabGroup` — simple tab switcher |
| AiChart | `ai-chart.tsx` | `AiChart` — Recharts wrapper with theme colors, loading/empty states, download/fullscreen |
| DataTable | `data-table.tsx` | Virtualized TanStack table |
| Tooltip | `tooltip.tsx` | CSS-based tooltip |

### Icons

All icons use `lucide-react` (v0.511.0, already installed). Common icons:
- Navigation: `House`, `Database`, `Code`, `MonitorPlay`, `Clock`, `Settings`
- Actions: `Search`, `Plus`, `Save`, `Copy`, `Download`, `Trash2`, `Play`, `MoreHorizontal`
- Feedback: `CheckCircle2`, `XCircle`, `AlertTriangle`, `RefreshCcw`, `Loader2`
- UI: `ChevronRight`, `ChevronDown`, `X`, `Maximize2`, `Minimize2`, `Sun`, `Moon`, `Languages`
- AI: `Lightbulb`, `FileText`, `BrainCircuit`, `Zap`

---

## Animation Utilities

Pre-built CSS utility classes in `globals.css`:

| Class | Animation |
|-------|-----------|
| `.animate-slide-up` | Fade in + 8px upward slide |
| `.animate-slide-down` | Fade in + 8px downward slide |
| `.animate-fade-in` | Simple fade in |
| `.animate-pulse-border` | Pulsing border color (accent → subtle) |
| `.animate-typing-cursor` | Blinking `\|` pseudo-element cursor |
| `.transition-theme` | Smooth background/color/border transitions |
