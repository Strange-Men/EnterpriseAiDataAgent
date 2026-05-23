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
| ISSUE-002 | Query history lost on server restart (in-memory deque) | Medium | Yes | Open | Claude | Frontend localStorage persists history |
| ISSUE-005 | `docs/frontend_rules/` files reference Vue/Element Plus (different project) | Low | Yes | Open | Claude | Keep as reference pattern; not directly applicable |
| ISSUE-006 | SQL query API returns all data in one response (no pagination) | Medium | Yes | Open | Claude | Works for <10K rows; for larger use virtual-table page |

## Closed Issues

| id | title | severity | status | closed_date | notes |
|----|-------|----------|--------|-------------|-------|
| ISSUE-003 | No backend test suite exists | Medium | Fixed | 2026-05-23 | 28 pytest tests added (v0.3.8) |
| ISSUE-004 | No frontend unit tests | Medium | Fixed | 2026-05-23 | 21 Vitest tests added (v0.3.8) |
| ISSUE-007 | SQL query limit hardcoded to 500 rows | High | Fixed | 2026-05-23 | Increased to 10,000 (v0.3.9) |
| ISSUE-008 | DataTable `contain: strict` breaks virtualization scroll | Medium | Fixed | 2026-05-23 | Changed to `contain: layout style` (v0.3.9) |

## Backlog (Future Improvements)

- [ ] Add server-side pagination to SQL query endpoint (like `/tables/{name}/data`)
- [ ] Persist query history to DuckDB or file (instead of in-memory deque)
- [ ] Add Playwright E2E tests
- [ ] Add query result caching with TTL
- [ ] Support for multiple database connections
- [ ] Mobile responsive improvements
