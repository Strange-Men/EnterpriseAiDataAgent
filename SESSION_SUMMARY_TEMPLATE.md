# Session Summary Template

Use this template at the start of each new Claude session to restore context quickly.

## Current Version

- **Version**: v0.3.9
- **Phase**: v0.3.x Enterprise Data Platform
- **Status**: Stable — AI Engineering Governance complete

## What Was Recently Done

- v0.3.7: Enterprise Query Experience (Monaco Editor, Query Tabs, Saved Queries, Explain, Cancel, Export, Shortcuts, Statistics, Formatting, History Upgrade)
- v0.3.8: AI Engineering Governance (CLAUDE.md, Testing, Error Logging, A/B Testing, Skill Engineering)

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
- `TESTING_STRATEGY.md` — testing approach
- `README.md` — project overview
- `docs/版本记录.md` — version history

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
