# EnterpriseAiDataAgent — Project Rescue Audit

> Audit date: 2026-06-20
> Auditor: Claude Code (automated + manual review)
> Scope: Full-stack codebase, build/test validation, documentation, security, resume credibility
> Baseline version: v1.0.2

---

## 1. Executive Summary

### Verdict: Worth rescuing — but needs honest repositioning.

This project is a **functional AI data analysis workbench** with real, working features across the full stack. It is significantly more than a demo, but it is **not** an enterprise-grade production system. The gap between documentation claims and actual capability is the single biggest risk.

**Current real positioning**: A single-user, local-first CSV/Excel data analysis tool with SQL workspace and LLM-powered AI features (NL→SQL, explain, insights, anomaly detection, multi-step analysis).

**What works**:
- CSV/Excel upload → DuckDB ingestion (confirmed from code, 50K-row demo seed)
- Full SQL workspace with Monaco Editor, multi-tab, history, save, export, explain, cancel
- AI NL→SQL pipeline with read-only execution, quality gates, retry, and streaming
- AI explain, insights, chart suggest, semantics, smart questions — all backed by real Anthropic API calls
- Statistical anomaly detection (Z-score + IQR) with LLM interpretation
- Multi-step autonomous analysis with planning, guardrails, token budget, and trace
- 11 prompt modules with contracts and registry pattern
- Docker deployment (backend + frontend + compose)
- 420 backend tests passing, 113 frontend tests passing, `next build` clean

**What is overstated**:
- "Enterprise-grade" — no multi-user, no real auth, no RBAC, single DuckDB file
- "Scheduled analysis" — task persistence works, but no background execution worker
- "Production readiness" — no monitoring, no CI/CD, no horizontal scaling
- "Full i18n" — command palette labels still hardcoded English

**Biggest risks**:
1. Resume credibility gap if claims are too bold
2. API key in `.env` (real key present, not a placeholder — must not be committed)
3. No authentication by default (API_KEY env var is empty in dev)
4. Single DuckDB file — no concurrent write safety for multi-user

---

## 2. Real Product Positioning

### Recommended positioning for resume:
> **AI Data Analysis Workbench** — A full-stack tool for CSV/Excel data exploration with SQL workspace and LLM-powered natural language analytics.

### Acceptable alternative:
> **AI-Powered Data Analyst Platform** — SQL Workspace + AI NL→SQL + Anomaly Detection + Multi-step Analysis.

### Do NOT say:
- "Enterprise-grade production system" — no multi-tenant, no real auth, no scaling
- "Multi-agent AI system" — this is single-agent, prompt-chained
- "Real-time analytics platform" — batch queries on local DuckDB
- "Production-ready" — no monitoring, no CI/CD, no load testing

### Why not "enterprise-grade":
1. Authentication is optional (empty API_KEY = open access)
2. Single DuckDB file, no connection pooling, no replication
3. No user management, no RBAC, no audit trail beyond in-memory trace
4. Scheduler persists tasks but has no background worker to execute them
5. Error handling sanitizes stack traces but doesn't integrate with alerting
6. No CI/CD pipeline, no staging environment, no deployment automation

---

## 3. Verified / Likely Real Capabilities

| Module | Status | Evidence |
|--------|--------|----------|
| CSV/Excel upload | **Confirmed** | `backend/routes/upload.py`, `database/file_loader.py`, pandas + openpyxl, 50K-row demo CSV exists |
| DuckDB table CRUD | **Confirmed** | `database/db_manager.py` — list/get/drop/rename/import, tested in `test_query_executor.py` |
| SQL workspace (Monaco) | **Confirmed** | `frontend-react/src/components/monaco-sql-editor.tsx`, multi-tab store, autocomplete from schema |
| Query execution | **Confirmed** | `database/query_executor.py`, read-only and read-write executors, EXPLAIN, cancel via AbortController |
| Query export | **Confirmed** | `backend/services/export_service.py` — CSV/JSON/Excel via openpyxl |
| Query history | **Confirmed** | `backend/services/query_history.py`, `frontend-react/src/stores/sql-history-store.ts` (persisted) |
| Saved queries | **Confirmed** | `frontend-react/src/stores/saved-queries-store.ts` (persisted) |
| Data quality | **Confirmed** | `database/data_quality.py` — missing values, outliers, duplicates, quality scoring, sampling at 10K rows |
| AI NL→SQL | **Confirmed** | `backend/services/ai_analyst.py:generate_sql()`, Anthropic SDK, real API calls, quality gates |
| AI explain/insights | **Confirmed** | `ai_analyst.py:explain_results()`, `generate_insights()`, both sync and streaming variants |
| AI chart suggest | **Confirmed** | `ai_analyst.py:suggest_charts()` — LLM recommends chart types |
| AI semantics | **Confirmed** | `ai_analyst.py:generate_semantics()` — column role detection (metric/dimension/KPI) |
| Smart questions | **Confirmed** | `ai_analyst.py:suggest_questions()` — dataset-aware question generation |
| Anomaly detection | **Confirmed** | `backend/services/anomaly_detector.py` — pure Python Z-score + IQR, no LLM dependency |
| Anomaly interpretation | **Confirmed** | `ai_analyst.py:detect_and_interpret_anomalies()` — stats → LLM interpretation pipeline |
| Multi-step analysis | **Confirmed** | `backend/services/ai_pipeline.py` — plan → execute steps → summarize, with guardrails |
| Streaming (SSE) | **Confirmed** | All AI endpoints have `/stream` variants, `StreamingResponse` in FastAPI |
| Token budget | **Confirmed** | `backend/runtime/token_budget.py` — per-operation budgets, workflow tracker |
| Guardrails | **Confirmed** | `backend/services/guardrails.py` — max steps, timeouts, consecutive failures, recursion depth |
| Trace | **Confirmed** | `backend/services/trace.py` — records every LLM call with latency, tokens, status |
| Self-evaluation | **Confirmed** | `ai_analyst.py:evaluate_analysis()` — LLM evaluates its own output quality |
| Quality gates | **Confirmed** | Deterministic checks on evaluation results, surfaced in frontend |
| Prompt architecture | **Confirmed** | 11 prompt modules in `backend/prompts/`, each with CONTRACT/SYSTEM_PROMPT/build_user_message |
| Report generation | **Confirmed (basic)** | `backend/services/report_builder.py` — pure Python Markdown builder, no LLM |
| Template adaptation | **Confirmed** | `backend/routes/ai.py:ai_adapt_template()` — LLM adapts saved analysis patterns |
| Analysis bundle | **Confirmed (simple)** | Export/import analysis runs as JSON bundles |
| Diff engine | **Confirmed** | `backend/services/diff_engine.py` — structural diff of two analysis runs |
| i18n (zh/en) | **Partial** | `react-i18next` with `zh.ts`/`en.ts`, but command palette labels still English |
| Docker | **Confirmed** | `Dockerfile`, `Dockerfile.frontend`, `docker-compose.yml` — multi-stage builds |
| Onboarding | **Confirmed** | 5-step game-style tutorial in `frontend-react/src/components/onboarding/` |
| Auth middleware | **Confirmed** | `backend/middleware/auth.py` — Bearer token, optional (empty = open) |
| Rate limiting | **Confirmed** | `backend/middleware/rate_limit.py` — sliding window, per-IP |

### Not verified in this continuation:
| Item | Notes |
|------|-------|
| Docker build | `docker-compose build` not run in this session — previously reported passing |
| E2E tests | `tests/ai/` has golden question tests but depend on live API key |
| Virtual table | Experimental page, not part of main demo flow |
| Scheduler execution | `backend/runtime/scheduler_worker.py` exists but actual execution not verified |

---

## 4. Questionable / Overstated Capabilities

### 4.1 "Enterprise-grade"
**Reality**: Single-user, single-file DuckDB, optional auth. This is a portfolio/MVP project, not enterprise software.

### 4.2 "Scheduled Analysis"
**Reality**: `backend/services/scheduler.py` persists tasks to JSON and has `is_due()` checking. `backend/runtime/scheduler_worker.py` exists as a background worker started in `main.py` lifespan. However, the actual execution path (calling `run_autonomous_analysis` on due tasks) needs manual verification — the worker code was not fully read in this session.

### 4.3 "Autonomous Multi-step Analysis"
**Reality**: This IS real — `ai_pipeline.py` has genuine planning → step execution → summarization with guardrails, retry, and token budget. But calling it "autonomous" overstates it: it's a deterministic loop calling LLM for each step, not an agent with tool-use or self-directed exploration.

### 4.4 "Full i18n"
**Reality**: Core UI is translated (zh/en). Command palette shortcut descriptions are still English (KNOWN_ISSUES ISSUE-017).

### 4.5 "Production Readiness"
**Reality**: Has Docker, health endpoints, error sanitization, CORS config. But no monitoring, no CI/CD, no load testing, no horizontal scaling, no real auth by default.

### 4.6 "Governance" (v0.6.x scope)
**Reality**: Language governance rules exist in CLAUDE.md. Template/report/scheduler features exist. But "governance" in enterprise sense (access control, audit trails, data lineage) does not exist.

### 4.7 "Design System V2"
**Reality**: Has Tailwind CSS variables and basic Card/Button/EmptyState primitives. This is a minimal component library, not a design system.

---

## 5. Architecture Audit

### 5.1 Overall Architecture (Verified)

```
frontend-react/ (Next.js 15 + React 19 + TypeScript, 17K lines)
    ↓ /api/* proxy (Next.js rewrites)
backend/ (FastAPI + Uvicorn, 6.6K lines)
    ↓
database/ (DuckDB, 1.1K lines)
```

### 5.2 Frontend Structure

```
frontend-react/src/
├── app/                    # Next.js App Router
│   ├── (shell)/            # Shell layout group (sidebar + main)
│   │   ├── page.tsx        # Home/dashboard
│   │   ├── query/page.tsx  # SQL Workspace (main page)
│   │   ├── data/page.tsx   # Data management
│   │   ├── analyze/page.tsx # AI Analysis
│   │   ├── history/page.tsx # Query history
│   │   └── settings/page.tsx # Settings
│   ├── performance/page.tsx # Performance monitoring
│   └── virtual-table/page.tsx # Experimental virtual table
├── panels/                 # 10 panel components
├── components/             # UI + feature components
│   ├── ai/                 # AI-specific components
│   ├── investigation/      # Investigation workspace
│   ├── onboarding/         # Tutorial
│   ├── sql-workspace/      # SQL editor components
│   └── ui/                 # Primitives (button, card, dialog, etc.)
├── stores/                 # 10 Zustand stores (persisted where noted)
├── services/api/           # API layer with SSE streaming
├── hooks/                  # Custom hooks
├── i18n/                   # zh/en translations
└── layout/                 # App shell, sidebar
```

**Assessment**: Reasonable structure. Shell layout group is clean. Panels are large but functional. The `(shell)` route group with shared layout is a good Next.js pattern.

### 5.3 Backend Structure

```
backend/
├── main.py                 # FastAPI entry, lifespan, middleware, exception handlers
├── config.py               # Centralized env var loading
├── VERSION                 # Single source of truth for version
├── routes/                 # 6 route modules (ai, analyze, quality, query, tables, upload)
├── services/               # 12 service modules
│   ├── ai_analyst.py       # Core LLM integration (1053 lines — largest file)
│   ├── ai_pipeline.py      # Multi-step orchestration (631 lines)
│   ├── anomaly_detector.py # Statistical detection
│   ├── guardrails.py       # Execution limits
│   ├── scheduler.py        # Task persistence
│   ├── trace.py            # LLM call recording
│   ├── sql_validator.py    # Read-only enforcement
│   ├── data_service.py     # DB access facade
│   ├── report_builder.py   # Markdown generation
│   ├── diff_engine.py      # Analysis comparison
│   └── export_service.py   # CSV/JSON/Excel export
├── prompts/                # 11 prompt modules + registry + locale
├── runtime/                # Token budget + scheduler worker
├── middleware/              # Auth, rate limit, observability
├── models/                 # Pydantic schemas
└── utils/                  # JSON safe, LLM JSON/SQL parsing, validation
```

**Assessment**: Clean route/service/prompt separation. Prompt architecture with CONTRACT pattern is well-designed. The `ai_analyst.py` at 1053 lines is the biggest concern — it's a God Service handling all LLM operations.

### 5.4 DuckDB Layer

`database/` package has clean separation:
- `db_manager.py` — singleton connection, table CRUD, DataFrame import
- `query_executor.py` — read-only and read-write executors
- `data_quality.py` — quality analysis (sampling, stats)
- `file_loader.py` — CSV/Excel → DataFrame
- `schema_detector.py` — type inference from DataFrame

**Assessment**: Good boundary. The singleton pattern is appropriate for single-user DuckDB. Read-only executor for AI-generated SQL is a critical safety feature.

### 5.5 AI Prompt/Runtime/Guardrails/Trace/Token Budget

This is the **most architecturally mature** part of the project:

- **Prompt architecture**: 11 modules, each with `CONTRACT` (name, max_output_tokens), `SYSTEM_PROMPT`, `build_user_message()`. Registry pattern for centralized access. Language-aware via `apply_language()`.
- **Token budget**: Per-operation budgets (e.g., sql_generation: 512 output tokens, explanation: 1024). Workflow-level tracker for multi-step analysis.
- **Guardrails**: `AnalysisGuard` enforces max steps (6), max SQL queries (8), consecutive failures (2), total timeout (120s), per-step timeout (30s), recursion depth (2).
- **Trace**: `TraceRecorder` records every LLM call with operation, phase, prompt name, input/output tokens, latency, status. Serializable to JSON for debugging.
- **Quality gates**: Deterministic checks on AI evaluation results, surfaced in frontend UI.

**Assessment**: This is genuinely well-engineered. The separation of concerns (prompts → services → runtime → trace) is textbook AI application architecture. This is the strongest selling point of the project.

### 5.6 State Management

- **React Query**: Server state (system status, table metadata, AI status). Polling for health checks.
- **Zustand**: 10 stores for local workspace state. Key stores:
  - `sql-editor-store.ts` (311 lines) — multi-tab editor, execution state, pagination
  - `analysis-store.ts` (459 lines) — AI analysis runs, key findings, streaming state
  - `workspace-store.ts` — layout, language, panel visibility (persisted)
  - `data-store.ts` — table selection, uploads, quality cache

**Assessment**: Reasonable split. React Query for server state + Zustand for client state is a standard pattern. The stores are well-persisted with `zustand/middleware/persist`.

### 5.7 Top 5 Most Complex Files

| File | Lines | Why complex |
|------|-------|-------------|
| `backend/services/ai_analyst.py` | 1053 | God service: all LLM operations, sync + streaming, retry, budget, trace |
| `frontend-react/src/panels/sql-workspace-panel.tsx` | 643 | Main workspace: editor, execution, results, tabs, shortcuts |
| `backend/services/ai_pipeline.py` | 631 | Multi-step orchestration: plan → execute → summarize, guardrails |
| `frontend-react/src/stores/analysis-store.ts` | 459 | AI analysis state: runs, findings, streaming, persistence |
| `frontend-react/src/panels/ai-analysis-panel.tsx` | 446 | AI panel: modes, streaming, results display |

### 5.8 Top 5 Most Risky Files

| File | Risk | Why |
|------|------|-----|
| `backend/services/ai_analyst.py` | God service | All LLM calls go through here; any bug affects all AI features |
| `backend/services/ai_pipeline.py` | Complex orchestration | Multi-step analysis with guardrails, retry, budget — hard to debug |
| `frontend-react/src/stores/analysis-store.ts` | State complexity | 459 lines of state management, persistence, streaming coordination |
| `database/db_manager.py` | Singleton | Single connection for entire app; concurrent access issues |
| `.env` | Security | Contains real API key (not placeholder); must never be committed |

### 5.9 Top 5 Best Designs

1. **Prompt contract pattern** — `CONTRACT` dataclass with `name`, `max_output_tokens`, `SYSTEM_PROMPT`, `build_user_message()`. Clean, testable, language-aware.
2. **Guardrails system** — `AnalysisGuard` with configurable limits, pre-step checks, post-analysis validation. Prevents runaway LLM costs.
3. **Token budget system** — Per-operation budgets + workflow-level tracker. Prevents cost explosion in multi-step analysis.
4. **Trace recorder** — Records every LLM call with full context. Enables debugging without reproducing issues.
5. **Read-only SQL executor** — `get_readonly_executor()` for AI-generated SQL. `sql_validator.py` blocks DDL/DML. Critical safety layer.

### 5.10 Top 5 Places That Need Refactoring (But Not Now)

1. **`ai_analyst.py` (1053 lines)** — Should split into `llm_client.py`, `sql_service.py`, `insight_service.py`, `anomaly_service.py`. But risky to do before demo.
2. **`sql-workspace-panel.tsx` (643 lines)** — Should extract execution logic into hook. But functional as-is.
3. **`analysis-store.ts` (459 lines)** — Should split into smaller slices. But works correctly.
4. **`data_service.py`** — Mixes DB access with health checks. Should have a proper repository pattern. But functional.
5. **Route-level error handling** — Some routes return raw dicts, others use Pydantic models. Should standardize. But not blocking.

---

## 6. Security Audit

### P0 — Must fix before demo

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| S1 | Real API key in `.env` | **Needs attention** | `.env` contains a real key (51 chars, `tp-c8bt3ep...` — likely third-party proxy). Must ensure `.gitignore` blocks it and it's never committed. The `.env.example` correctly uses placeholder. |
| S2 | No auth by default | **By design** | `API_KEY` env var is empty → middleware skips auth. For local demo this is acceptable. For any deployment, must set `API_KEY`. |
| S3 | AI SQL uses read-only executor | **FIXED in v1.0.2** | `ai_pipeline.py` uses `get_readonly_executor()`. `sql_validator.py` blocks DDL/DML keywords. |

### P1 — Should fix for resume credibility

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| S4 | Rate limiting | **FIXED in v1.0.2** | `RateLimitMiddleware` with sliding window, configurable via env vars |
| S5 | Upload size limit | **FIXED in v1.0.2** | `MAX_UPLOAD_BYTES` enforced, 413 response on overflow |
| S6 | Error sanitization | **FIXED in v1.0.2** | Global exception handler returns "Internal server error", logs full traceback server-side |
| S7 | CORS config | **FIXED in v1.0.2** | Explicit origins by default, credentials disabled when `*` is used |

### P2 — Can fix later

| # | Issue | Notes |
|---|-------|-------|
| S8 | No CSRF protection | Single-user local tool, low risk |
| S9 | No request body size limit on non-upload endpoints | DuckDB queries could return huge results |
| S10 | SQL injection via string formatting | `db_manager.py` uses f-strings for table names, but they come from DuckDB's own `information_schema` or user uploads — low risk in single-user context |

### P3 — Low priority

| # | Issue | Notes |
|---|-------|-------|
| S11 | Docker image copies entire `data/` directory | Could include `.duckdb` file with real data |
| S12 | No Content-Security-Policy headers | Not critical for local tool |
| S13 | Scheduler worker has no access control | Only relevant if API_KEY is set |

---

## 7. Runtime / Validation Status

All checks below were run in the session on 2026-06-20:

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Backend import | `python -c "from backend.main import app; print('OK')"` | **PASS** | |
| Backend pytest | `python -m pytest tests/ -x -q` | **PASS** | 420 passed, 31 skipped |
| Frontend type-check | `npx.cmd tsc --noEmit` | **PASS** | Clean, no errors |
| Frontend vitest | `npx.cmd vitest run` | **PASS** | 10 test files, 113 tests |
| Frontend build | `npx.cmd next build` | **PASS** | 10 routes, clean output |
| Docker compose | Not run in this session | **Not verified** | Previously reported passing |
| Docker build | Not run in this session | **Not verified** | Previously reported passing |
| Demo seed | `scripts/seed-demo-data.py` | **Exists** | Loads 50K-row CSV into `demo_sales` table |
| API key configured | Checked | **Yes** | Real key present (51 chars), not placeholder |

### Test Coverage Summary

- **Backend**: 420 tests covering routes, services, middleware, utils, guards, trace, token budget
- **Frontend**: 113 tests covering stores (analysis, data, workspace, history, saved queries, template)
- **AI evaluation**: Golden question test harness exists in `tests/ai/` (requires live API key)

---

## 8. Resume Credibility Audit

### Can this go on a resume?
**Yes** — with honest positioning. This is a strong portfolio project that demonstrates full-stack + AI application engineering skills.

### Recommended project slot:
**Second or third project** on resume. Not the flagship (that should be a production project or open-source contribution), but a strong demonstration of AI application architecture.

### Safe to write:
- Full-stack TypeScript + Python project
- SQL workspace with Monaco Editor (autocomplete, multi-tab, history)
- AI NL→SQL pipeline with read-only execution safety
- Statistical anomaly detection (Z-score, IQR)
- Multi-step analysis with guardrails and token budget
- Streaming SSE for real-time AI responses
- Prompt architecture with contracts and registry
- Zustand + React Query state management
- DuckDB integration with quality analysis
- Docker containerization

### Do NOT write:
- "Enterprise-grade production system"
- "Multi-agent architecture"
- "Real-time streaming analytics"
- "Production-ready with CI/CD"
- "Handles millions of rows" (DuckDB can, but this app hasn't been tested at that scale)
- "Full RBAC and audit trail"

### Easy to defend in interview:
1. "Why DuckDB?" — Embedded, zero-config, fast OLAP on local files, perfect for single-user data analysis tool
2. "How does AI SQL generation work?" — Schema context → LLM prompt → SQL extraction → validation → read-only execution → explain
3. "How do you prevent dangerous SQL?" — `sql_validator.py` blocks DDL/DML, `get_readonly_executor()` for AI queries, quality gates on generated SQL
4. "Why not use LangChain?" — Direct Anthropic SDK gives more control over prompts, token budgets, and trace. LangChain adds abstraction overhead without benefit for this use case.
5. "What's the prompt architecture?" — Each operation has a CONTRACT (name, max_tokens), SYSTEM_PROMPT, and build_user_message(). Registry pattern for centralized access. Language-aware via apply_language().

### Risky interview questions:
1. "Is this a production system?" → "No, it's a portfolio project demonstrating AI application architecture. It runs locally with DuckDB."
2. "How much did AI help build this?" → "I used Claude Code as a development tool. I designed the architecture, defined requirements, and validated every change. The prompt architecture and guardrails system are my design decisions."
3. "What's the difference from a BI tool?" → "BI tools are visualization-first. This is analysis-first — the AI plans multi-step investigations, generates SQL, and interprets results. It's closer to an AI data analyst than a dashboard."

---

## 9. P0/P1/P2/P3 Rescue List

### P0 — Must fix before demo

| # | Issue | Impact | Suggested Fix | Acceptance Criteria |
|---|-------|--------|---------------|---------------------|
| R1 | `.env` has real API key | Security — key could leak | Verify `.gitignore` blocks `.env`; ensure key is never in git history | `git log --all -p -- .env` returns no key content |
| R2 | Demo data not auto-seeded | First-run experience broken | Set `SEED_DEMO_DATA=true` in `.env` or document manual seed step | Fresh start loads `demo_sales` table automatically |
| R3 | README overclaims capabilities | Resume credibility risk | Rewrite README to match actual capabilities (see resume-positioning.md) | Every claim in README is verifiable from code or tests |

### P1 — Should fix for interview credibility

| # | Issue | Impact | Suggested Fix | Acceptance Criteria |
|---|-------|--------|---------------|---------------------|
| R4 | No demo script | Hard to demo consistently | Create demo-flow.md with step-by-step walkthrough | Follow script for 10-min demo without errors |
| R5 | Scheduler has no visible execution | Interviewer might ask about scheduled analysis | Either verify worker executes tasks, or mark as "experimental" in README | If worker works: show it. If not: document limitation. |
| R6 | Command palette English labels | i18n inconsistency | Add i18n keys for shortcut descriptions | All UI text follows language toggle |
| R7 | No screenshots in README | Hard to understand without running | Add 3-5 screenshots of key features | README shows SQL workspace, AI analysis, anomaly detection |

### P2 — Nice to have

| # | Issue | Impact | Suggested Fix | Acceptance Criteria |
|---|-------|--------|---------------|---------------------|
| R8 | `ai_analyst.py` is 1053 lines | Hard to maintain | Split into 3-4 modules (not urgent) | Each module < 400 lines |
| R9 | No CI/CD pipeline | Can't show automated testing | Add GitHub Actions for pytest + next build | Push triggers build + test |
| R10 | Virtual table page is experimental | Could confuse demo | Hide from navigation or mark as experimental | Not visible in main demo flow |

### P3 — Future cleanup

| # | Issue | Impact | Suggested Fix | Acceptance Criteria |
|---|-------|--------|---------------|---------------------|
| R11 | Dead code in some modules | Code quality | Run linter, remove unused imports | `eslint --max-warnings 0` passes |
| R12 | No API documentation page | Developer experience | FastAPI auto-generates `/docs` — just verify it works | `/docs` loads with all endpoints |
| R13 | Test data in `testExcel/` could be cleaner | Demo quality | Add more diverse test datasets | At least 3 different CSV/Excel files |

---

## 10. Minimum Rescue Plan

### Phase 0: Freeze (1 hour)
- Tag current state: `git tag pre-rescue-v1.0.2`
- Verify `.env` is in `.gitignore` and not in history
- Backup `data/enterprise.duckdb` if it has real data

### Phase 1: Validation (2 hours)
- Run all checks documented in Section 7
- Verify demo seed works: `python scripts/seed-demo-data.py`
- Verify full demo path works end-to-end
- Document any failures

### Phase 2: Demo Loop (4 hours)
- Create `demo-flow.md` with step-by-step walkthrough
- Test demo path: upload CSV → query → AI question → anomaly detection → export
- Prepare "no API key" fallback: SQL workspace + data quality (no AI features)
- Prepare "with API key" path: full AI analysis flow
- Add 3-5 screenshots to README

### Phase 3: Packaging (2 hours)
- Rewrite README to match actual capabilities
- Update CLAUDE.md and AGENTS.md version alignment
- Create `resume-positioning.md` with honest bullet points
- Create `interview-prep.md` with Q&A

### Phase 4: Optional Cleanup (ongoing)
- Split `ai_analyst.py` if time permits
- Add GitHub Actions CI
- Hide experimental pages
- Add more test datasets

---

*End of audit report. Generated by Claude Code on 2026-06-20.*
