# Known Issues — Enterprise AI Data Agent

Track all open issues, bugs, and improvements here.

## How to Use

- **id**: Unique issue ID (ISSUE-XXX)
- **title**: Short description
- **severity**: Critical / High / Medium / Low
- **reproducible**: Yes / No / Intermittent
- **status**: Open / In Progress / Fixed / Won't Fix
- **owner**: Who should fix it
- **workaround**: Temporary solution if any
- **created**: Date added
- **notes**: Additional context

## Open Issues

| id | title | severity | reproducible | status | owner | workaround |
|----|-------|----------|-------------|--------|-------|------------|
| ISSUE-001 | Monaco Editor loads large workers (~2MB) on first load | Medium | Yes | Open | Claude | Acceptable for enterprise use |
| ISSUE-002 | Query history lost on server restart (in-memory deque) | Medium | Yes | Fixed | Claude | v0.6.4: Added DuckDB persistence, loads on startup |
| ISSUE-005 | `docs/frontend_rules/` files reference Vue/Element Plus (different project) | Low | Yes | Fixed | Claude | v0.9.8: Directory already archived in v0.6.0; docs now reference Next.js/React/Tailwind |
| ISSUE-006 | SQL query API returns all data in one response (no pagination) | Medium | Yes | Fixed | Claude | v0.6.4: Added server-side OFFSET/LIMIT pagination, infinite scroll |
| ISSUE-013 | CSV export writes "nan" string for NaN values instead of empty | Low | Yes | Fixed | Claude | v0.9.4: Changed to df.to_csv() which handles NaN correctly |
| ISSUE-014 | Test isolation: QueryHistory shares DuckDB between tests | Low | Yes | Fixed | Claude | v0.9.5: Added `use_memory=True` parameter |
| ISSUE-016 | ai-analysis-panel.tsx 575-line runAnalysis callback | Medium | Yes | Open | Claude | P2-5 deferred: split into per-mode handlers |
| ISSUE-017 | Command Palette i18n (hardcoded English labels) | Low | Yes | Open | Claude | P2-2 deferred: add i18n keys for command labels |

## Closed Issues

| id | title | severity | status | closed_date | notes |
|----|-------|----------|--------|-------------|-------|
| ISSUE-003 | No backend test suite exists | Medium | Fixed | 2026-05-23 | 28 pytest tests added (v0.3.8) |
| ISSUE-004 | No frontend unit tests | Medium | Fixed | 2026-05-23 | 21 Vitest tests added (v0.3.8) |
| ISSUE-007 | SQL query limit hardcoded to 500 rows | High | Fixed | 2026-05-23 | Increased to 10,000 (v0.3.9) |
| ISSUE-008 | DataTable `contain: strict` breaks virtualization scroll | Medium | Fixed | 2026-05-23 | Changed to `contain: layout style` (v0.3.9) |
| ISSUE-009 | Corrupted `.next` build cache causes blank page (SSR 500, missing webpack chunk) | Critical | Fixed | 2026-05-23 | Root cause: stale `.next` cache. Fix: `npm run dev:clean`. Added `clean` script to package.json (v0.3.10) |
| ISSUE-010 | DuckDB file locked by stale Python process — SQL execution fails with "另一个程序正在使用此文件" | Critical | Fixed | 2026-05-23 | Root cause: orphaned Python process (PID 15232) held exclusive DuckDB lock. Fix: kill stale process. Added `dev:clean` workflow (v0.3.10) |
| ISSUE-011 | `queryId` always null when Cancel button clicked — backend cancel never called | Critical | Fixed | 2026-05-23 | Root cause: `queryId` in `useState` only set after query completes, but Cancel only visible during execution. Fix: moved to `useRef` (v0.3.10) |
| ISSUE-012 | `handleExecute` recreated on every `isExecuting` change — stale closure risk in Monaco | Medium | Fixed | 2026-05-23 | Root cause: `isExecuting` in dependency array causes new function ref on every state change. Fix: read from `useSqlWorkspaceStore.getState()` directly (v0.3.10) |
| ISSUE-015 | SQL query API returns 500 — numpy.bool_ not serializable by FastAPI | Critical | Fixed | 2026-05-25 | Root cause: `jsonable_encoder` can't handle `numpy.bool_`. Fix: new `normalize_for_response()` utility, applied to all route returns + SSE events. Added 41 regression tests. (v0.7.6) |

## Backlog (Future Improvements)

- [ ] Add server-side pagination to SQL query endpoint (like `/tables/{name}/data`)
- [ ] Persist query history to DuckDB or file (instead of in-memory deque)
- [ ] Add more E2E tests (CSV upload, virtual scrolling, export, workspace restore)
- [ ] Add query result caching with TTL
- [ ] Support for multiple database connections
- [ ] Mobile responsive improvements
