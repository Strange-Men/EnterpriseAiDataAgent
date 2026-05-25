# Interaction Patterns — Enterprise AI Data Agent

> Version: v0.8.0 | Last updated: 2026-05-26

## Command Palette Interaction

### Trigger
- `Ctrl+K` / `Cmd+K` from anywhere
- Click search icon in header

### Behavior
1. Opens with backdrop blur (`backdrop-blur-sm`)
2. Input auto-focused
3. Results displayed in groups: Navigation, Actions, Recent
4. Fuzzy filtering as user types (case-insensitive includes match)

### Keyboard Navigation
- `ArrowDown/Up` — Move selection
- `Enter` — Execute selected command + close
- `Escape` — Close palette
- Click backdrop — Close palette

### Commands
- **Navigation**: Go Home, Go to Data, Go to Query, Go to Analyze, Go to History, Go to Settings
- **Actions**: New Investigation, Toggle Theme, Toggle Language
- **Recent**: Last 8 analysis runs (from analysis-store)

---

## Global Search Interaction

### Trigger
- `Ctrl+/` / `Cmd+/` from anywhere

### Behavior
1. Opens with backdrop blur
2. Input auto-focused
3. Searches across: runs (question, table, mode), tables (name), pages (label)
4. Results grouped by type with type badges (run, table, page)

### Result Display
- Icon per type: Clock (run), Database (table), FileText (page)
- Label truncation with ellipsis
- Detail field shows table name or context
- Selected result highlighted with accent background

### Keyboard Navigation
- Same as Command Palette (Arrow keys, Enter, Escape)

---

## Keyboard Shortcut Registration

### Architecture
- Centralized in `hooks/use-keyboard-shortcuts.ts`
- Single `window.addEventListener("keydown")` at AppShell level
- Shortcuts defined as `Shortcut[]` array with: id, key, mod (ctrl/ctrl+shift/alt), description, handler, global flag

### Input Focus Protection
- By default, shortcuts do NOT fire when focus is in `<input>`, `<textarea>`, `<select>`, or `[contenteditable]`
- Set `global: true` to override (for Esc, Cmd+K, Cmd+/)
- Uses `document.activeElement` check

### Key Format
- Mac detection via `navigator.platform` for display (⌘ vs Ctrl)
- Format function: `formatShortcutKey()` produces "Ctrl + K" or "⌘ + K"

---

## Form Submission Patterns

### Textarea
- `Enter` alone = submit (calls `handleSubmit()`)
- `Shift+Enter` = newline
- Prevented during loading state

### Input
- `Enter` = submit
- Prevented when input is empty or loading

### Quick SQL (Tools Panel)
- `Ctrl+Enter` = execute SQL
- Standard textarea behavior otherwise

---

## Dialog/Modal Patterns

### Dialog Component
- Portal-free (renders inline with `position: fixed`)
- `Escape` to close
- Click backdrop to close
- Body scroll lock (`document.body.style.overflow = "hidden"`)
- Animation: backdrop fade-in + content slide-up

### DropdownMenu Component
- Click trigger to toggle
- Click outside to close
- `Escape` to close
- Focus management: ArrowDown to focus first item
- Animation: `animate-fade-in`

---

## Streaming Interaction Patterns

### Investigation Streaming
1. User submits question → loading state begins
2. Progress bar appears at top (animated width transitions)
3. Phase indicator shows current phase with icon
4. Plan steps appear immediately (static)
5. Step results appear progressively with slide-up animation
6. Summary streams with typing cursor effect
7. On completion: loading stops, full results rendered

### Abort/Retry
- `abortRef.current.abort()` on new submission cancels previous stream
- Cleanup on component unmount
- SSE timeout: 60s for explain, 120s for autonomous analysis
- Auto-reconnect: 2 retries with exponential backoff (1s, 2s)

---

## Drill-Down Navigation Pattern

### Evolution Chain
- `getEvolutionChain(runId)` walks parentRunId links to build full chain
- Two view modes: Timeline (vertical dots + connector lines) and Breadcrumb (horizontal chips with `/` separators)
- Current run highlighted with accent ring
- Click any chain node to navigate

### Navigation
- Uses Next.js `router.push()` for full navigation
- `setActiveRun()` updates the active run in the store before navigation
- Back button in RunHeader returns to `/analyze`

---

## Focus Management

### Auto-Focus
- Command palette input on open (50ms delay for render)
- Global search input on open (50ms delay for render)
- Question input on investigation page load (browser default)

### Focus Traps
- Dialog: no explicit focus trap (Escape closes, Tab cycles naturally)
- Dropdown: ArrowDown from trigger focuses first item

### Focus Visible
- Buttons: `focus-visible:ring-1 focus-visible:ring-[var(--accent)]`
- Inputs: `focus:border-[var(--accent)] focus:ring-1`

---

## Confirmation Patterns

### Destructive Actions
- Delete run: No native confirmation dialog (uses toast feedback)
- Clear history: Direct action with toast

### Unsaved Changes
- Not currently implemented (no form-based editing of analysis runs)

---

## Animation Guidelines

### When to Animate
- **Enter**: New elements (step cards, dialog, command palette) — slide up/down + fade
- **Loading**: Pulsing/shimmmer (skeleton, streaming indicator dots)
- **Transitions**: Colors (theme, hover), borders, opacity — 150-200ms
- **Progress**: Streaming progress bar — smooth width transition

### When NOT to Animate
- Initial page load (let browser render immediately)
- Large DOM changes (table data, markdown sections)
- Theme toggle (CSS variable swap is instant, body has 200ms transition)

### Performance
- All animations are CSS-only (keyframes or transitions)
- No framer-motion dependency
- No JavaScript-driven animations
- `transform` and `opacity` only for composited animations
