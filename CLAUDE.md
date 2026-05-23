# CLAUDE.md — Enterprise AI Data Agent

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

**Enterprise AI Data Agent Platform** — an enterprise-grade AI data analysis platform with DuckDB, SQL Workspace, and future AI Agent capabilities.

This is NOT a demo. It is a resume-grade enterprise platform for AI data analyst roles.

## Current Version Status

- **Current**: v0.3.9 (Stability & Consistency Pass)
- **Phase**: v0.3.x Enterprise Data Platform — STABLE
- **Next**: v0.4.x AI Analysis Layer — DO NOT START until v0.3.x is fully stable

## Version Freeze Rules

**v0.4.x is FROZEN.** Claude must NOT:
- Proactively add LangGraph, Multi-Agent, or RAG features
- Suggest implementing AI Agent capabilities
- Add any v0.4.x planned features

**v0.3.x priorities only:**
- Workspace Stability
- Query Stability
- API Stability
- Performance
- Bug fixes
- Test coverage

## Development Rules

### Before Starting
1. Read `PROJECT_RULES.md` (mandatory)
2. Read `docs/frontend_rules/` files (mandatory)
3. Check `KNOWN_ISSUES.md` for open bugs
4. Check current version in `docs/architecture/版本记录.md`

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

### Documentation Rules
- Update README.md for every major version
- Update docs/architecture/版本记录.md for every version
- Update CLAUDE.md if development rules change

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
