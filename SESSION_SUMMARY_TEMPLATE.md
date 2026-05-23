# Session Summary Template

Use this template at the start of each new Claude session to restore context quickly.

## Current Version

- **Version**: v0.3.12
- **Phase**: v0.3.x Enterprise Data Platform — STABLE
- **Status**: Maintainability, Governance & Bug Fixes complete

## What Was Recently Done

- v0.3.7: Enterprise Query Experience (Monaco Editor, Query Tabs, Saved Queries, Explain, Cancel, Export, Shortcuts, Statistics, Formatting, History Upgrade)
- v0.3.8: AI Engineering Governance (CLAUDE.md, Testing, Error Logging, A/B Testing, Skill Engineering)
- v0.3.9: Stability & Consistency Pass (500-row limit fix, DataTable fix, docs restructuring)
- v0.3.10: Enterprise Maintenance System (SQL execution fix, docs architecture, E2E testing, workflow governance)
- v0.3.11: Repository Architecture Governance (FILE_SYSTEM_RULES, SKILL_LIFECYCLE, REPOSITORY_HEALTH)
- v0.3.12: Maintainability & Governance (repo cleanup, coverage audit, skills, bug hunt, ISSUE-006 partial fix)

## Known Issues

- See `KNOWN_ISSUES.md` for current open issues
- Check error logs in `error_logs/` if applicable

## Next Steps

- **DO NOT** start v0.4.x features yet
- Priority: Bug fixes, stability, test coverage
- Review `KNOWN_ISSUES.md` for tasks

## Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, Monaco Editor |
| State | Zustand (6 stores) |
| Backend | FastAPI, Uvicorn |
| Database | DuckDB |
| Testing | Vitest, pytest, Playwright |

## Key Files

- `PROJECT_RULES.md` — development rules (MUST read)
- `CLAUDE.md` — Claude long-term rules (MUST read)
- `docs/frontend_rules/` — frontend architecture rules (MUST read)
- `KNOWN_ISSUES.md` — open issues tracker
- `docs/testing/testing-strategy.md` — testing approach
- `README.md` — project overview
- `docs/architecture/版本记录.md` — version history

## Quick Commands

```bash
# Frontend
cd frontend-react && npm run dev        # Dev
cd frontend-react && npx next build     # Build

# Backend
uvicorn backend.main:app --reload --port 8000

# Tests
cd frontend-react && npx vitest run     # Frontend tests
python -m pytest backend/ tests/        # Backend tests
npx playwright test                     # E2E tests
```

## Last Test Results

- Frontend build: Pass
- Backend imports: Pass
- API endpoints: All pass
- Git status: Clean
