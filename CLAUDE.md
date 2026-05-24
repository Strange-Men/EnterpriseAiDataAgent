# CLAUDE.md — Enterprise AI Data Agent

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

**Enterprise AI Data Agent Platform** — an enterprise-grade AI data analysis platform with DuckDB, SQL Workspace, and future AI Agent capabilities.

This is NOT a demo. It is a resume-grade enterprise platform for AI data analyst roles.

## Current Version Status

- **Current**: v0.5.6 (Analysis Workspace — panel refactor, trace visualization, session history)
- **Phase**: v0.5.x AI Data Analyst MVP — DONE
- **Next**: v0.6.x (anomaly detection, multi-turn UX polish, E2E tests)

## Scope Rules

**v0.5.x completed scope**: AI Data Analyst MVP (streaming, semantics, planning, guardrails, trace, evaluation).
Claude must NOT:
- Proactively add LangGraph, Multi-Agent, or RAG features
- Suggest implementing multi-agent capabilities
- Add features beyond v0.6.x scope without user approval

## Development Rules

### Before Starting
1. Read `CURRENT_SESSION.md` (mandatory — session restore)
2. Read `PROJECT_RULES.md` (mandatory)
3. Read `docs/governance/FILE_SYSTEM_RULES.md` (mandatory — file placement)
4. Read `docs/frontend_rules/` files (mandatory)
5. Check `KNOWN_ISSUES.md` for open bugs
6. Check current version in `docs/architecture/版本记录.md`

### Git Rules
- Every version MUST be committed: `git add .` + `git commit -m "version-name"`
- Run `git status` before committing to check for missed files
- NEVER commit `.env`, credentials, or `node_modules/`

### Testing Rules
- EVERY change must be tested: build, run, lint, type-check
- Frontend: `npx next build` must pass before commit
- Backend: `python -c "from backend.main import app"` must pass
- API: Test endpoints with curl before declaring done
- Performance: Test large datasets, measure FPS, DOM, memory

### Debug Rules
- NEVER end a session with broken code
- Read error messages completely
- Fix root causes, not symptoms
- Retry after fixes until system runs

### Code Quality Rules
- NO demo-level implementations
- NO mock implementations (use real data)
- NO temporary solutions ("fix later")
- Enterprise-grade architecture always
- Prefer editing existing files over creating new ones

### Prompt Architecture Rules (v0.5.4+)
- ALL prompts must live in `backend/prompts/` — never in service/route files
- Each prompt module exports: CONTRACT, SYSTEM_PROMPT, build_user_message()
- Use PromptContract.max_output_tokens, not hardcoded values
- Language handling via `apply_language()` from `backend.prompts.locale`
- Register new prompts in `registry.py`

### Documentation Rules
- Update README.md for every major version
- Update docs/architecture/版本记录.md for every version
- Update CLAUDE.md if development rules change
- Follow documentation lifecycle: active → stable → archived
- Skills live in `skills/active/` — never in `docs/skills/`
- Check `skills/SKILL_REGISTRY.md` before creating new workflows

## Architecture

```
frontend-react/ (Next.js 15 + React 19 + TypeScript)
    ↓ /api/* proxy
backend/ (FastAPI + Uvicorn)
    ↓
database/ (DuckDB)
```

## Key Commands

```bash
# Frontend
cd frontend-react && npm run dev        # Dev server (port 3000)
cd frontend-react && npx next build     # Production build

# Backend
uvicorn backend.main:app --reload --port 8000   # Dev server

# Both
# Start backend on 8000, frontend on 3000
```

## State Management

6 Zustand stores (all in `frontend-react/src/stores/`):
- `data-store.ts` — global data state (tables, uploads, quality)
- `workspace-store.ts` — layout, language, panel visibility (persisted)
- `sql-workspace-store.ts` — current SQL, execution state, query result
- `sql-history-store.ts` — query history with search/filter (persisted)
- `query-tabs-store.ts` — multi-tab query system (persisted)
- `saved-queries-store.ts` — saved/favorite queries (persisted)

## API Endpoints

Backend at `http://localhost:8000/api/`:

Data API:
- `/query` (POST) — execute SQL
- `/query/explain` (POST) — EXPLAIN plan
- `/query/cancel` (POST) — cancel running query
- `/query/export` (POST) — export CSV/JSON/Excel
- `/query/schema` (GET) — all table schemas for autocomplete
- `/query/history` (GET) — query history
- `/tables` (GET) — list tables
- `/tables/{name}` (GET/DELETE) — table data / delete
- `/upload` (POST) — upload CSV/Excel
- `/quality/{name}` (GET) — quality report
- `/status` (GET) — system status

AI API:
- `/ai/status` (GET) — AI service config & health
- `/ai/query` (POST) — NL → SQL → execute → explain
- `/ai/explain` (POST) — explain existing results
- `/ai/explain/stream` (POST) — streaming explain (SSE)
- `/ai/insights` (POST) — generate structured insights
- `/ai/insights/stream` (POST) — streaming insights (SSE)
- `/ai/chart-suggest` (POST) — suggest chart types
- `/ai/semantics` (POST) — semantic dataset analysis
- `/ai/suggest-questions` (POST) — smart question suggestions
- `/ai/plan` (POST) — generate analysis plan
- `/ai/analyze-multi` (POST) — multi-step autonomous analysis
- `/ai/analyze-multi/stream` (POST) — streaming multi-step analysis (SSE)
