# Rescue Next Actions — EnterpriseAiDataAgent

> Generated: 2026-06-20
> Purpose: Concrete next-step action plan for project rescue and resume packaging
> Prerequisite: Read project-rescue-audit.md, resume-positioning.md, demo-flow.md first

---

## 1. Current Status

### Completed Audit Reports

| Report | Path | Purpose |
|--------|------|---------|
| Project Rescue Audit | `docs/reports/project-rescue-audit.md` | Full codebase audit, capability verification, security review |
| Resume Positioning | `docs/reports/resume-positioning.md` | Honest resume bullets, interview Q&A, red flags to avoid |
| Demo Flow | `docs/reports/demo-flow.md` | Step-by-step demo script with two paths (with/without API key) |
| Next Actions | `docs/reports/rescue-next-actions.md` | This file — prioritized task list for next phase |

### Verdict: Worth rescuing

This is a **functional AI data analysis workbench** with real working features. It demonstrates strong AI application engineering (prompt contracts, guardrails, token budget, trace). The gap is between documentation claims and reality — fixable by honest repositioning, not code rewrite.

### Current Minimum Rescue Goal

> Make the project demo-ready, resume-ready, and interview-defendable in ~16 hours of focused work.
>
> Target: One clean git tag, one honest README, one working demo path, one set of resume bullets.

---

## 2. Immediate Priorities

### P0 — Must fix before demo (blocks everything)

---

**Task P0-1: Verify `.env` is not in git history**

- **Priority**: P0
- **Goal**: Confirm the real API key has never been committed
- **Why it matters**: A leaked API key in git history is a hard blocker — anyone cloning the repo gets it
- **Files likely involved**: `.gitignore`, git history
- **Suggested implementation steps**:
  1. Run `git log --all -p -- .env` to check if `.env` was ever committed
  2. Run `git log --all -p -- .env.example` to verify only placeholders exist
  3. If key was committed: rotate the key immediately, then `git filter-branch` or BFG to purge
  4. Verify `.env` is in `.gitignore`
- **Acceptance criteria**: `git log --all -p -- .env` returns zero content with API key patterns
- **Risk**: If key is in history, this requires key rotation + history rewrite — 1-2 hours extra

---

**Task P0-2: Freeze baseline with git tag**

- **Priority**: P0
- **Goal**: Create a safe rollback point before any rescue changes
- **Why it matters**: If rescue changes break something, we need a clean baseline to return to
- **Files likely involved**: Git tags only
- **Suggested implementation steps**:
  1. Verify current build passes: `npx.cmd next build` + `python -c "from backend.main import app"`
  2. Run `git add . && git commit -m "pre-rescue baseline v1.0.2"`
  3. Run `git tag pre-rescue-v1.0.2`
- **Acceptance criteria**: `git tag -l` shows `pre-rescue-v1.0.2`, commit is clean
- **Risk**: None — this is a read-only safety measure

---

**Task P0-3: Verify demo seed works end-to-end**

- **Priority**: P0
- **Goal**: Confirm that `demo_sales` table loads correctly on fresh start
- **Why it matters**: If demo data doesn't load, the entire demo flow breaks
- **Files likely involved**: `scripts/seed-demo-data.py`, `testExcel/large_sales_data.csv`, `.env`
- **Suggested implementation steps**:
  1. Set `SEED_DEMO_DATA=true` in `.env`
  2. Delete `data/enterprise.duckdb` (fresh start)
  3. Start backend: `uvicorn backend.main:app --port 8000`
  4. Verify: `curl http://localhost:8000/api/tables` shows `demo_sales`
  5. Verify: `curl http://localhost:8000/api/tables/demo_sales/data?limit=5` returns rows
- **Acceptance criteria**: `demo_sales` table exists with ~50,000 rows after fresh backend start
- **Risk**: If seed script is broken, need to debug `seed-demo-data.py` — could be 30-60 min

---

### P1 — Should fix for interview credibility

---

**Task P1-1: Rewrite README.md to match actual capabilities**

- **Priority**: P1
- **Goal**: Replace overclaiming README with honest, accurate description
- **Why it matters**: README is the first thing anyone sees — overclaims destroy credibility instantly
- **Files likely involved**: `README.md`
- **Suggested implementation steps**:
  1. Read current README
  2. Rewrite using positioning from `resume-positioning.md` Section 2
  3. Remove "enterprise-grade" claims
  4. Add accurate feature list with [verified] tags
  5. Add screenshots placeholder (P1-3)
  6. Add "Quick Start" section with actual commands
  7. Add "Architecture" section matching real structure
- **Acceptance criteria**: Every claim in README is verifiable from code or tests. No "enterprise-grade", "production-ready", "multi-agent" language.
- **Risk**: Low — this is a documentation-only change

---

**Task P1-2: Test full demo path end-to-end**

- **Priority**: P1
- **Goal**: Walk through demo-flow.md Path A (with API key) and verify every step works
- **Why it matters**: If any step fails during a real demo, the entire project credibility drops
- **Files likely involved**: All backend routes, frontend pages
- **Suggested implementation steps**:
  1. Start backend + frontend
  2. Follow demo-flow.md Path A step by step
  3. Record any failures with screenshots/error messages
  4. Fix blocking issues only (don't refactor, just patch)
  5. Document workarounds for non-blocking issues
- **Acceptance criteria**: Complete Path A (15 min) without any hard crashes or API errors
- **Risk**: Medium — AI features depend on live API key; if key is invalid, Path B (no API key) must work perfectly

---

**Task P1-3: Capture 3-5 screenshots for README**

- **Priority**: P1
- **Goal**: Visual proof that the project works
- **Why it matters**: Screenshots make README 10x more convincing — text alone looks like vaporware
- **Files likely involved**: `docs/screenshots/` (new directory), `README.md`
- **Suggested implementation steps**:
  1. Run demo path and capture:
     - SQL Workspace with query results
     - AI NL→SQL generating and executing SQL
     - AI Analysis multi-step results
     - Anomaly detection with interpretation
     - Data quality report
  2. Save as PNG in `docs/screenshots/`
  3. Add image references to README
- **Acceptance criteria**: 5 screenshots in README, each showing a distinct feature
- **Risk**: Low — manual task, no code changes

---

**Task P1-4: Verify scheduler worker actually executes tasks**

- **Priority**: P1
- **Goal**: Determine if scheduled analysis actually runs, or just persists tasks
- **Why it matters**: If scheduler doesn't work, mark it as "experimental" in README before anyone asks
- **Files likely involved**: `backend/runtime/scheduler_worker.py`, `backend/services/scheduler.py`
- **Suggested implementation steps**:
  1. Read `scheduler_worker.py` to understand execution path
  2. Create a scheduled task via API: `POST /api/ai/schedule`
  3. Wait for execution window
  4. Check `GET /api/ai/schedule/{task_id}/results`
  5. If works: document it. If not: mark as "experimental" in README
- **Acceptance criteria**: Either confirmed working with evidence, or clearly documented as experimental
- **Risk**: Medium — if worker is broken, fixing it could be complex; better to just document limitation

---

### P2 — Nice to have (improves quality)

---

**Task P2-1: Add i18n keys for command palette shortcuts**

- **Priority**: P2
- **Goal**: Fix KNOWN_ISSUES ISSUE-017 — command palette labels still hardcoded English
- **Why it matters**: Shows attention to detail; small but noticeable inconsistency
- **Files likely involved**: `frontend-react/src/i18n/zh.ts`, `frontend-react/src/i18n/en.ts`, command palette component
- **Suggested implementation steps**:
  1. Find command palette component
  2. Extract hardcoded English strings
  3. Add translation keys to `zh.ts` and `en.ts`
  4. Replace hardcoded strings with `t('key')` calls
- **Acceptance criteria**: Toggle language → all command palette labels switch language
- **Risk**: Low — isolated UI change

---

**Task P2-2: Hide experimental virtual-table page**

- **Priority**: P2
- **Goal**: Remove experimental page from main navigation
- **Why it matters**: Could confuse demo viewers; not part of core feature set
- **Files likely involved**: Navigation/sidebar component
- **Suggested implementation steps**:
  1. Find where virtual-table is linked in navigation
  2. Add `hidden` flag or remove from nav
  3. Page still accessible via direct URL (for development)
- **Acceptance criteria**: Virtual table not visible in main navigation
- **Risk**: Low — simple UI visibility change

---

**Task P2-3: Verify FastAPI `/docs` endpoint works**

- **Priority**: P2
- **Goal**: Ensure auto-generated API docs are accessible and complete
- **Why it matters**: Free API documentation — just needs to work
- **Files likely involved**: `backend/main.py`
- **Suggested implementation steps**:
  1. Start backend
  2. Open `http://localhost:8000/docs`
  3. Verify all endpoints are listed
  4. Verify request/response schemas are correct
- **Acceptance criteria**: `/docs` loads with all API endpoints visible and testable
- **Risk**: Low — FastAPI generates this automatically

---

### P3 — Future cleanup (not now)

---

**Task P3-1: Split `ai_analyst.py` (1053 lines)**

- **Priority**: P3
- **Goal**: Reduce God Service complexity
- **Why it matters**: Long-term maintainability, but functional as-is
- **Files likely involved**: `backend/services/ai_analyst.py` → split into 3-4 modules
- **Risk**: High refactor risk — don't do before demo

---

**Task P3-2: Add GitHub Actions CI**

- **Priority**: P3
- **Goal**: Automated pytest + next build on push
- **Why it matters**: Shows engineering maturity; free to set up
- **Risk**: Low risk, but not blocking demo

---

**Task P3-3: Add more diverse test datasets**

- **Priority**: P3
- **Goal**: Have 3-5 different CSV/Excel files for varied demos
- **Why it matters**: More convincing demo with different data domains
- **Risk**: None — additive only

---

## 3. Phase 0 — Freeze Current Baseline

### Recommended Git Actions

```bash
# 1. Verify clean state
git status

# 2. Stage and commit audit docs (already staged per git status)
git add docs/reports/
git commit -m "docs: add rescue audit reports (audit, positioning, demo-flow, next-actions)"

# 3. Tag baseline
git tag pre-rescue-v1.0.2

# 4. Verify
git log --oneline -3
git tag -l
```

### Files to Preserve (Do Not Modify)

| File | Reason |
|------|--------|
| `docs/reports/project-rescue-audit.md` | Audit record — reference for all future work |
| `docs/reports/resume-positioning.md` | Resume bullets — interview prep source |
| `docs/reports/demo-flow.md` | Demo script — presentation reference |
| `docs/reports/rescue-next-actions.md` | This file — task tracking |
| `backend/VERSION` | Version source of truth |
| `CLAUDE.md` | Development rules — don't change mid-rescue |

### What NOT to Change Right Now

| Item | Why not |
|------|---------|
| `ai_analyst.py` refactor | Too risky before demo; functional as-is |
| Add LangGraph / RAG | Out of scope; overcomplicates the project |
| Add multi-user auth | Changes project positioning; not needed for portfolio |
| Add CI/CD pipeline | Nice to have but doesn't block demo |
| Rewrite test suite | Tests pass; rewriting wastes time |
| Upgrade dependencies | Could break things; not blocking |

---

## 4. Phase 1 — Validation Baseline

Run these commands in order. Record results. Each one must pass before proceeding to Phase 2.

### 4.1 Backend Import Check

```bash
python -c "from backend.main import app; print('OK')"
```

| Field | Value |
|-------|-------|
| **Command** | `python -c "from backend.main import app; print('OK')"` |
| **Expected result** | Prints `OK`, exits 0 |
| **If failed** | Record full traceback. Check `backend/main.py` for import errors. Likely missing dependency or syntax error. |
| **Blocks demo?** | **Yes** — backend must start |

### 4.2 Backend Pytest

```bash
python -m pytest tests/ -x -q
```

| Field | Value |
|-------|-------|
| **Command** | `python -m pytest tests/ -x -q` |
| **Expected result** | 420+ passed, 31 skipped, 0 failed |
| **If failed** | Record failing test name + traceback. Check if test is outdated or code is broken. |
| **Blocks demo?** | **No** — but failing tests indicate regressions |

### 4.3 Frontend Type-Check

```bash
cd frontend-react && npx.cmd tsc --noEmit
```

| Field | Value |
|-------|-------|
| **Command** | `npx.cmd tsc --noEmit` |
| **Expected result** | Clean exit, no type errors |
| **If failed** | Record each type error with file:line. Likely missing type import or interface mismatch. |
| **Blocks demo?** | **Yes** — type errors indicate broken code |

### 4.4 Frontend Vitest

```bash
cd frontend-react && npx.cmd vitest run
```

| Field | Value |
|-------|-------|
| **Command** | `npx.cmd vitest run` |
| **Expected result** | 113+ tests pass across 10 test files |
| **If failed** | Record failing test name + assertion error. Check if store API changed. |
| **Blocks demo?** | **No** — but indicates frontend regressions |

### 4.5 Frontend Build

```bash
cd frontend-react && npx.cmd next build
```

| Field | Value |
|-------|-------|
| **Command** | `npx.cmd next build` |
| **Expected result** | Clean build, 10 routes, no errors |
| **If failed** | Record build error. Likely import error or missing component. |
| **Blocks demo?** | **Yes** — must build for production |

### 4.6 Docker Compose Config

```bash
docker-compose config
```

| Field | Value |
|-------|-------|
| **Command** | `docker-compose config` |
| **Expected result** | Valid YAML output, no warnings |
| **If failed** | Record YAML parse error. Check `docker-compose.yml` syntax. |
| **Blocks demo?** | **No** — Docker is optional for local demo |

### 4.7 Docker Build (Optional)

```bash
docker-compose build
```

| Field | Value |
|-------|-------|
| **Command** | `docker-compose build` |
| **Expected result** | Images build successfully |
| **If failed** | Record build error. Check Dockerfile syntax and dependencies. |
| **Blocks demo?** | **No** — can demo without Docker |

### Validation Checklist Template

```
Date: ___________
Tester: ___________

[ ] Backend import: PASS / FAIL — notes: ___
[ ] Backend pytest: PASS / FAIL — ___ passed, ___ failed
[ ] Frontend tsc: PASS / FAIL — notes: ___
[ ] Frontend vitest: PASS / FAIL — ___ passed, ___ failed
[ ] Frontend build: PASS / FAIL — notes: ___
[ ] Docker config: PASS / FAIL — notes: ___
[ ] Docker build: PASS / FAIL — notes: ___

Demo data:
[ ] Seed script works: PASS / FAIL
[ ] demo_sales table loaded: PASS / FAIL — ___ rows
```

---

## 5. Phase 2 — Demo Loop Repair

### Minimum Viable Demo Path

The demo must work in this exact order without errors:

```
1. Start backend → auto-seed demo_sales
2. Open frontend → SQL Workspace
3. Run SELECT * FROM demo_sales LIMIT 10 → results appear
4. Run AI NL→SQL question → SQL generated, executed, explained
5. Navigate to Analyze → run multi-step analysis → results shown
6. Navigate to Data → view quality report
7. Export results as CSV
```

### Step-by-Step Repair Checklist

#### Step 1: Demo Dataset

| Item | Status | Action |
|------|--------|--------|
| `testExcel/large_sales_data.csv` exists | Verify | Check file exists and has ~50K rows |
| `scripts/seed-demo-data.py` works | Verify | Run script, check output |
| Auto-seed on startup | Verify | Set `SEED_DEMO_DATA=true`, restart backend |
| `demo_sales` table accessible | Verify | `curl /api/tables/demo_sales/data?limit=5` |

#### Step 2: Upload Flow

| Item | Status | Action |
|------|--------|--------|
| Upload CSV via UI | Test | Navigate to Data page, upload a CSV |
| Upload Excel via UI | Test | Upload `.xlsx` file |
| Table appears in list | Verify | Check table list after upload |
| Data preview works | Verify | Click table, see paginated rows |

#### Step 3: DuckDB Query

| Item | Status | Action |
|------|--------|--------|
| Simple SELECT | Test | `SELECT COUNT(*) FROM demo_sales` |
| Aggregation | Test | `SELECT region, SUM(sales) FROM demo_sales GROUP BY region` |
| EXPLAIN | Test | Click Explain button on any query |
| Cancel running query | Test | Run long query, click Cancel |
| Export CSV | Test | Export query results as CSV |
| Export JSON | Test | Export query results as JSON |
| Export Excel | Test | Export query results as Excel |

#### Step 4: Data Quality

| Item | Status | Action |
|------|--------|--------|
| Quality report loads | Test | Navigate to Data → click demo_sales → quality tab |
| Missing values shown | Verify | Should show per-column missing counts |
| Outliers detected | Verify | Should flag statistical outliers |
| Quality score displayed | Verify | Should show overall quality score |

#### Step 5: AI NL→SQL (requires API key)

| Item | Status | Action |
|------|--------|--------|
| AI status shows configured | Verify | `curl /api/ai/status` → `configured: true` |
| NL question generates SQL | Test | "What are the top 10 products by sales?" |
| SQL executes correctly | Verify | Results match expected output |
| Explanation streams | Verify | SSE streaming works for explanation |
| Quality gates display | Verify | Frontend shows SQL quality checks |

#### Step 6: AI Explain/Insight (requires API key)

| Item | Status | Action |
|------|--------|--------|
| Explain results | Test | After query, click "Explain" |
| Generate insights | Test | After query, click "Insights" |
| Streaming works | Verify | Text appears incrementally |
| Token usage shown | Verify | Token count visible in UI |

#### Step 7: Report Generation

| Item | Status | Action |
|------|--------|--------|
| Generate report | Test | After analysis, click "Generate Report" |
| Report is valid Markdown | Verify | Copy report, check formatting |
| Template save/load | Test | Save analysis as template, load it |

#### Step 8: No API Key Fallback

| Item | Status | Action |
|------|--------|--------|
| Remove API key from .env | Action | Set `ANTHROPIC_API_KEY=` |
| Backend starts cleanly | Verify | No crash on missing key |
| AI status shows "not configured" | Verify | `/api/ai/status` → `configured: false` |
| SQL Workspace still works | Verify | All non-AI features functional |
| Data management still works | Verify | Upload, browse, quality report |
| Frontend shows graceful fallback | Verify | AI buttons show "AI not configured" message |

---

## 6. Phase 3 — Packaging for Resume

### 6.1 README Modification Tasks

| Task | Description | Priority |
|------|-------------|----------|
| README-1 | Remove "Enterprise" from title | P1 |
| README-2 | Rewrite project description to match actual capabilities | P1 |
| README-3 | Add accurate feature list with [verified] markers | P1 |
| README-4 | Add Quick Start section with real commands | P1 |
| README-5 | Add Architecture section with diagram | P1 |
| README-6 | Add screenshots (5 images) | P1 |
| README-7 | Add Tech Stack section | P2 |
| README-8 | Add Testing section (420+ backend, 113+ frontend) | P2 |
| README-9 | Add License section | P3 |

### 6.2 Demo Flow Modification Tasks

| Task | Description | Priority |
|------|-------------|----------|
| DEMO-1 | Verify demo-flow.md Path A works end-to-end | P1 |
| DEMO-2 | Verify demo-flow.md Path B works end-to-end | P1 |
| DEMO-3 | Add timing estimates per step | P2 |
| DEMO-4 | Add troubleshooting for common failures | P2 |
| DEMO-5 | Add "What to say" talking points per step | P2 |

### 6.3 Screenshot/GIF Tasks

| Task | Description | Priority |
|------|-------------|----------|
| SCREEN-1 | Capture SQL Workspace with query results | P1 |
| SCREEN-2 | Capture AI NL→SQL generating SQL | P1 |
| SCREEN-3 | Capture AI Analysis multi-step results | P1 |
| SCREEN-4 | Capture Anomaly Detection results | P1 |
| SCREEN-5 | Capture Data Quality report | P1 |
| SCREEN-6 | (Optional) Record GIF of full demo flow | P2 |

### 6.4 Resume Bullet Final Confirmation

| Task | Description | Priority |
|------|-------------|----------|
| RESUME-1 | Review Option A bullets (3-4 concise) from resume-positioning.md | P1 |
| RESUME-2 | Verify each bullet is defensible with code evidence | P1 |
| RESUME-3 | Prepare 2-3 "deep dive" talking points for each bullet | P1 |
| RESUME-4 | Practice explaining prompt architecture (Section 6 Q&A) | P2 |
| RESUME-5 | Practice explaining safety layers (Section 6 Q&A) | P2 |

### 6.5 Interview Q&A Tasks

| Task | Description | Priority |
|------|-------------|----------|
| QA-1 | Review all Q&A in resume-positioning.md Section 6 | P1 |
| QA-2 | Prepare code examples for "show me the code" questions | P1 |
| QA-3 | Practice "Is this production?" answer | P1 |
| QA-4 | Practice "How much did AI help?" answer | P1 |
| QA-5 | Prepare "What would you change?" answer with specifics | P2 |

---

## 7. Phase 4 — Optional Cleanup

These items improve quality but are **not required** for demo or resume. Do them only if time permits.

### 7.1 Scheduled Analysis

| Item | Notes |
|------|-------|
| Current state | Task persistence works; background execution needs verification |
| What to verify | Does `scheduler_worker.py` actually call `run_autonomous_analysis()`? |
| If broken | Mark as "experimental" in README — don't fix now |
| Estimated effort | 1-2 hours to verify, 4+ hours to fix if broken |

### 7.2 Autonomous Multi-step Analysis

| Item | Notes |
|------|-------|
| Current state | Works — `ai_pipeline.py` has genuine plan → execute → summarize |
| What to improve | Better error recovery on step failure, clearer progress indication |
| Why not now | Functional; improvements are polish |
| Estimated effort | 2-3 hours for polish |

### 7.3 i18n Hardcoded Text

| Item | Notes |
|------|-------|
| Current state | Core UI translated; command palette shortcuts still English |
| What to fix | Add i18n keys for shortcut descriptions |
| Why not now | Minor inconsistency; doesn't break demo |
| Estimated effort | 1 hour |

### 7.4 Monaco Lazy Loading

| Item | Notes |
|------|-------|
| Current state | Monaco Editor loads eagerly on SQL Workspace page |
| What to improve | Dynamic import to reduce initial bundle size |
| Why not now | Performance is acceptable; not blocking |
| Estimated effort | 1-2 hours |

### 7.5 SQL Workspace Controller Split

| Item | Notes |
|------|-------|
| Current state | `sql-workspace-panel.tsx` is 643 lines |
| What to improve | Extract execution logic into custom hook |
| Why not now | Functional; refactor risk before demo |
| Estimated effort | 2-3 hours |

### 7.6 React Query Migration Completion

| Item | Notes |
|------|-------|
| Current state | Some endpoints still use direct fetch instead of React Query |
| What to improve | Migrate remaining fetch calls to React Query hooks |
| Why not now | Current approach works; migration is optimization |
| Estimated effort | 3-4 hours |

---

## 8. Recommended Claude/Codex Task Order

Each task below is small enough for a single commit. Tasks are ordered by dependency — earlier tasks unblock later ones.

| Step | Task | Tool Suggestion | Files | Acceptance Criteria |
|------|------|-----------------|-------|---------------------|
| 1 | Verify `.env` not in git history | Bash | `.gitignore`, git log | `git log --all -p -- .env` returns no key content |
| 2 | Tag pre-rescue baseline | Bash | Git tags | `git tag pre-rescue-v1.0.2` exists |
| 3 | Run full validation baseline | Bash | All | All 7 checks pass (see Phase 1) |
| 4 | Verify demo seed end-to-end | Bash + curl | `scripts/seed-demo-data.py` | `demo_sales` table with 50K rows after fresh start |
| 5 | Rewrite README.md | Edit | `README.md` | No overclaims; accurate feature list; Quick Start section |
| 6 | Capture screenshots (5 images) | Manual | `docs/screenshots/`, `README.md` | 5 PNGs showing distinct features |
| 7 | Test demo Path A end-to-end | Manual | All | Complete 15-min demo without crashes |
| 8 | Test demo Path B end-to-end | Manual | All | Complete 10-min demo without API key |
| 9 | Verify scheduler worker | Test + curl | `scheduler_worker.py` | Either confirmed working or documented as experimental |
| 10 | Fix command palette i18n | Edit | `frontend-react/src/i18n/zh.ts`, `en.ts` | All labels follow language toggle |
| 11 | Hide virtual-table page | Edit | Navigation component | Not visible in main nav |
| 12 | Final README + resume review | Edit | `README.md`, `resume-positioning.md` | All claims verified, bullets defensible |

---

## 9. Do Not Do List

These actions are explicitly **out of scope** for the current rescue phase. Doing any of them wastes time and increases risk.

### Architecture

- ❌ **Do NOT rewrite the architecture** — the current architecture works and is well-designed
- ❌ **Do NOT add LangGraph** — the prompt pipeline is simpler and more controllable
- ❌ **Do NOT add RAG** — the current context-injection approach is appropriate
- ❌ **Do NOT add multi-tenant support** — changes the project scope entirely
- ❌ **Do NOT add real authentication** — optional API key is fine for portfolio

### Features

- ❌ **Do NOT add new complex features** — focus on making existing features demo-ready
- ❌ **Do NOT implement multi-agent capabilities** — not in scope, overcomplicates the project
- ❌ **Do NOT add real-time streaming analytics** — current batch approach is correct
- ❌ **Do NOT expand "enterprise-grade" narrative** — reposition honestly instead

### Testing

- ❌ **Do NOT delete tests to make them pass** — fix the code, not the tests
- ❌ **Do NOT rewrite the test suite** — 533+ passing tests is good enough
- ❌ **Do NOT add tests for untested edge cases** — focus on demo path first

### Security

- ❌ **Do NOT commit API keys** — keep them in `.env` only
- ❌ **Do NOT hardcode credentials** — use environment variables
- ❌ **Do NOT disable security features** (rate limit, CORS) to fix issues

### Dependencies

- ❌ **Do NOT add new dependencies** unless absolutely necessary for demo
- ❌ **Do NOT upgrade existing dependencies** — could break working code
- ❌ **Do NOT add monitoring/observability libraries** — not needed for portfolio

### Documentation

- ❌ **Do NOT continue expanding enterprise-grade claims** — reposition honestly
- ❌ **Do NOT add documentation for features that don't exist** — only document what works
- ❌ **Do NOT create architecture docs that overstate capabilities**

---

*End of next actions plan. Generated by Claude Code on 2026-06-20.*
