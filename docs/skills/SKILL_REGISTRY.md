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

### virtual-scroll-debugging

**When to use**: Diagnosing blank rows, FPS drops, or scroll issues in virtual tables.

**Steps**:
1. Open DevTools → Elements, count `<tr>` nodes in tbody
2. Check `overscan` parameter (10-20 recommended)
3. Profile with Performance tab, check FPS during scroll
4. Inspect for `contain: strict` on parent (use `layout style` instead)
5. Verify `estimateSize` matches actual CSS row height
6. Check `React.memo` on row/cell components

**Key files**: `src/components/ui/data-table.tsx`, `src/components/VirtualDataTable.tsx`
**Location**: `skills/active/virtual-scroll-debugging.md`

### performance-audit

**When to use**: Before releases, after new features, or when slowness is reported.

**Steps**:
1. Run Lighthouse audit (target: Performance >= 80)
2. Chrome Performance profile (record 30s of user flows)
3. Check for long tasks > 50ms
4. Memory heap snapshot comparison (baseline vs. after 10 queries)
5. Bundle size check (`npx next build`)
6. Generate performance report using template

**Key files**: All frontend source, `.next/static/` for bundle analysis
**Location**: `skills/active/performance-audit.md`

### ai-sql-analysis

**When to use**: User asks natural language questions about data.

**Steps**:
1. Build schema context from available tables
2. Generate SQL from question via Claude API
3. Execute SQL via QueryExecutor
4. Generate natural language explanation
5. Suggest chart types for visualization

**Key files**: `backend/services/ai_analyst.py`, `backend/routes/ai.py`, `frontend-react/src/panels/chat-panel.tsx`
**Location**: `skills/active/ai-sql-analysis.md`

### auto-analysis-pipeline

**When to use**: New data is uploaded or user requests data profiling.

**Steps**:
1. Profile data (types, stats, distributions)
2. Run quality checks (nulls, duplicates, outliers)
3. Generate AI summary and chart suggestions
4. Return structured analysis report

**Key files**: `backend/routes/analyze.py`, `database/data_quality.py`
**Location**: `skills/active/auto-analysis-pipeline.md`

### runtime-guardrails

**When to use**: Running autonomous multi-step analysis; need to enforce execution limits.

**Steps**:
1. Import `AnalysisGuard`, `GuardrailViolation`, `DEFAULT_GUARDRAILS` from `backend/services/guardrails.py`
2. Create guard: `guard = AnalysisGuard(config)`
3. Before each step: `guard.check_before_step(step_def, executed_steps)`
4. After each step: `guard.record_step_result(success=bool)`
5. After all steps: `guard.check_after_all(executed_steps)`
6. Export guard state: `guard.to_dict()` for API response

**Key files**: `backend/services/guardrails.py`, `backend/services/ai_pipeline.py`
**Location**: `skills/active/runtime-guardrails.md`

### analysis-trace

**When to use**: Debugging AI analysis, measuring LLM performance, auditing autonomous analysis.

**Steps**:
1. Create recorder: `trace = TraceRecorder(question, table, mode, language)`
2. Pass to LLM functions: `generate_sql(..., trace=trace, phase="step_1", step=1)`
3. Record guardrail violations: `trace.record_guardrail_violation(rule, message)`
4. Set plan: `trace.set_plan(plan)`
5. Finish: `trace.finish("success")`
6. Export: `trace.to_dict()` for API, `trace.save_to_file()` for persistence

**Key files**: `backend/services/trace.py`, `backend/services/ai_analyst.py`, `backend/services/ai_pipeline.py`
**Location**: `skills/active/analysis-trace.md`

### ai-evaluation-harness

**When to use**: After prompt changes, before releases, or when evaluating SQL generation quality.

**Steps**:
1. Define new `GoldenQuestion` in `tests/ai/golden_questions.py`
2. Run: `pytest tests/ai/test_golden_questions.py -v`
3. Check pass_rate (target: >= 60%, improve over time)
4. Check hallucination_count (must be 0)
5. Review failed cases in report output
6. Add new questions to cover discovered failure modes

**Key files**: `tests/ai/golden_questions.py`, `tests/ai/eval_sql.py`, `tests/ai/runner.py`, `tests/ai/test_golden_questions.py`
**Location**: `skills/active/ai-evaluation-harness.md`

## Skill Lifecycle

Skills are stored in `skills/` with lifecycle states:

| State | Directory | Description |
|-------|-----------|-------------|
| active | `skills/active/` | Currently used in development |
| stable | `skills/stable/` | Mature, unlikely to change |
| archived | `skills/archived/` | Historical reference |
| deprecated | `skills/deprecated/` | Superseded by better approach |

## Adding New Skills

1. Create `skills/active/{skill-name}.md` following the template in `docs/governance/SKILL_LIFECYCLE.md`
2. Add entry to this file with: **When to use**, **Steps**, **Key files**, **Location**
3. Keep steps actionable (Claude can follow them directly)
4. Commit with the version that uses the skill
