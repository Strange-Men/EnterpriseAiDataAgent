# Error Logs — Enterprise AI Data Agent

## Purpose

Centralized error log collection for debugging and analysis.

## Structure

```
error_logs/
├── README.md                   # This file
├── frontend/                   # Frontend error logs
│   └── .gitkeep
├── backend/                    # Backend error logs
│   └── .gitkeep
└── reports/                    # Error analysis reports
    └── .gitkeep
```

## How to Collect Logs

### Frontend Errors
- Browser console errors: Open DevTools → Console
- Build errors: `npx next build` output
- Type errors: `npx tsc --noEmit` output

### Backend Errors
- Uvicorn console output
- Python traceback logs
- API 500 errors from curl tests

### Runtime Errors
- Query execution failures
- File upload failures
- DuckDB connection errors

## Analysis Process

1. Collect error logs into `error_logs/reports/`
2. Review `ERROR_ANALYSIS.md` for patterns
3. Track in `KNOWN_ISSUES.md`
4. Fix and verify

## Log Format

When saving error logs, use:
```
error_logs/reports/YYYY-MM-DD_error-type.md
```

Example: `error_logs/reports/2026-05-23_monaco-load-error.md`
