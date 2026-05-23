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
| ISSUE-003 | No backend test suite exists | Medium | Yes | Open | Claude | Manual curl tests |
| ISSUE-004 | No frontend unit tests | Medium | Yes | Open | Claude | Manual browser testing |
| ISSUE-005 | `docs/frontend_rules/` files reference Vue/Element Plus (different project) | Low | Yes | Open | Claude | Keep as reference pattern; not directly applicable |

## Closed Issues

| id | title | severity | status | closed_date | notes |
|----|-------|----------|--------|-------------|-------|
| — | — | — | — | — | No closed issues yet |

## Backlog (Future Improvements)

- [ ] Persist query history to DuckDB or file (instead of in-memory deque)
- [ ] Add comprehensive backend pytest suite
- [ ] Add Vitest frontend unit tests
- [ ] Add Playwright E2E tests
- [ ] Add query result caching with TTL
- [ ] Support for multiple database connections
- [ ] Dark/light theme toggle refinement
- [ ] Mobile responsive improvements
