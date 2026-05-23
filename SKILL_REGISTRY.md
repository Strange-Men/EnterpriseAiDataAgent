# Skill Registry — Enterprise AI Data Agent

Register reusable skills and workflows for Claude to discover and apply.

## How Skills Work

Before starting a complex task, Claude should:
1. Check this registry for matching skills
2. Apply the skill's steps
3. Refine the skill if new patterns emerge

## Skills

### frontend-enterprise-workspace

**When to use**: Building or modifying React workspace panels.

**Steps**:
1. Read `docs/frontend_rules/` for architecture patterns
2. Use Zustand for state (persist if user data)
3. Use `react-resizable-panels` for layout
4. Use TanStack Table + Virtual for data display
5. Use `react-hot-toast` for notifications
6. Use `useTranslation()` for i18n
7. Test dark/light theme rendering
8. Verify responsive behavior

**Key files**: `src/panels/`, `src/stores/`, `src/components/`

### react-virtualization-performance

**When to use**: Displaying large datasets (1000+ rows).

**Steps**:
1. Use `@tanstack/react-virtual` for row virtualization
2. Use `@tanstack/react-table` for column management
3. Set `overscan` to 10 for smooth scrolling
4. Measure FPS during scroll (target: 60fps)
5. Measure DOM node count (target: <500 visible)
6. Test with 10K+ row datasets

**Key files**: `src/components/ui/data-table.tsx`, `src/components/VirtualDataTable.tsx`

### duckdb-query-workflow

**When to use**: Adding new SQL features or query endpoints.

**Steps**:
1. Add method to `database/query_executor.py`
2. Add route to `backend/routes/query.py`
3. Add API function to `frontend-react/src/services/api.ts`
4. Add i18n keys to `en.ts` and `zh.ts`
5. Update UI in `sql-workspace-panel.tsx`
6. Test with curl + browser

**Key files**: `database/query_executor.py`, `backend/routes/query.py`, `src/services/api.ts`

### ai-debugging-workflow

**When to use**: Debugging build errors, runtime errors, or API failures.

**Steps**:
1. Read the full error message (don't skip stack traces)
2. Identify the root file and line
3. Check if it's a type error, import error, or runtime error
4. For build errors: `npx next build` shows exact location
5. For API errors: check `uvicorn` console output
6. For frontend errors: check browser DevTools console
7. Fix the root cause, not the symptom
8. Re-run the failing command to verify

### store-persistence-pattern

**When to use**: Adding a new Zustand store that needs localStorage persistence.

**Steps**:
1. Import `persist` from `zustand/middleware`
2. Wrap store with `persist()`, set `name` key
3. Keep store interface clean (actions + state)
4. Add to documentation if it persists user data

**Pattern**:
```typescript
export const useXxxStore = create<XxxState>()(
  persist(
    (set, get) => ({ ... }),
    { name: "xxx-store" }
  )
);
```

### export-workflow

**When to use**: Adding new export formats or export features.

**Steps**:
1. Add backend endpoint in `backend/routes/query.py`
2. Use `StreamingResponse` for large files
3. Add frontend API function in `services/api.ts`
4. Add to `export-dropdown.tsx` component
5. Add i18n keys for new format
6. Test with actual data

## Adding New Skills

1. Add entry to this file following the template
2. Include: **When to use**, **Steps**, **Key files**
3. Keep steps actionable (Claude can follow them directly)
4. Commit with the version that uses the skill
