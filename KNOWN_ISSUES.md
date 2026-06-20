# Known Issues — Enterprise AI Data Agent

Track open bugs and improvements for the current v1.0.x hardening line.

## Open Issues

| id | title | severity | reproducible | status | owner | notes |
|----|-------|----------|-------------|--------|-------|-------|
| ISSUE-001 | Monaco Editor loads large workers on first SQL editor load | Medium | Yes | Open | Codex | Acceptable for enterprise SQL workspace; optimize with deeper editor lazy-loading if needed |
| ISSUE-019 | React Query migration is not yet complete for every API feature | Medium | Yes | In Progress | Codex | v1.0.x migrated status/tables/AI status first; schedule now mirrors backend APIs |
| ISSUE-020 | SQL Workspace still has a relatively large controller component | Medium | Yes | In Progress | Codex | v1.0.1 split feature components; future pass can move execution orchestration into hooks |
| ISSUE-023 | `next lint` script is deprecated for Next.js 16 | Low | Yes | Open | Codex | Migrate to direct ESLint CLI when Next 16 upgrade begins |

## Recently Fixed

| id | title | fixed_in | notes |
|----|-------|----------|-------|
| ISSUE-016 | AI Analysis Panel state scattered across many `useState` calls | v1.0.2 | State moved into reducer hook |
| ISSUE-017 | Command Palette labels still include hardcoded English descriptions | v1.0.3 | M3-4: localized shortcut descriptions, command palette, global search, toolbar titles, SQL buttons |
| ISSUE-018 | Version metadata drift across docs/backend/frontend | v1.0.2 | README, AGENTS, CLAUDE, CURRENT_SESSION, package, lockfile, backend VERSION synchronized |
| ISSUE-021 | Local generated artifacts and DuckDB path governance drift | v1.0.1 | Non-destructive migration and repository health check added |
| ISSUE-022 | AI SQL quality/fallback states not visible enough | v1.0.1 | SQL generation quality gates surfaced in backend and frontend |
| ISSUE-024 | API routes lacked API Key auth and rate limiting | v1.0.2 | Auth and rate limit middleware added |
| ISSUE-025 | Upload route accepted unbounded request bodies | v1.0.2 | 50MB default upload limit added |
| ISSUE-026 | Query IDs used millisecond timestamps | v1.0.2 | Backend/frontend IDs moved to UUID strings |

## Backlog

- Add more E2E tests for upload, virtual scrolling, export, and workspace restore.
- Add query result caching with TTL.
- Support multiple database connections after single-user portfolio scope is stable.
