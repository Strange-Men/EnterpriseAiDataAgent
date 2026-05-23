# Testing Strategy — Enterprise AI Data Agent

## Testing Pyramid

```
        ┌─────────┐
        │  E2E    │  Playwright — user flows
        │  Tests  │
       ┌┴─────────┴┐
       │Integration │  API tests — endpoint behavior
       │   Tests    │
      ┌┴────────────┴┐
      │  Unit Tests   │  Vitest + pytest — isolated logic
      └──────────────┘
```

## 1. Unit Tests

### Frontend (Vitest)

**Setup**: `cd frontend-react && npx vitest`

**What to test**:
- Zustand stores: state transitions, persist/rehydrate
- Utility functions: `cn.ts`, formatters
- Components: render, props, interactions

**Example test files**:
- `src/stores/__tests__/query-tabs-store.test.ts`
- `src/stores/__tests__/saved-queries-store.test.ts`
- `src/stores/__tests__/sql-history-store.test.ts`
- `src/components/__tests__/export-dropdown.test.tsx`

### Backend (pytest)

**Setup**: `python -m pytest backend/ tests/`

**What to test**:
- `QueryExecutor.execute()` — success, error, edge cases
- `QueryExecutor.explain()` — valid SQL, invalid SQL
- `QueryHistory.add/get_all` — ring buffer behavior
- API endpoints — request/response validation
- `_sanitize_for_json()` — NaN/Inf/NaT handling

**Example test files**:
- `tests/test_query_executor.py`
- `tests/test_query_history.py`
- `tests/test_api_endpoints.py`
- `tests/test_data_quality.py`

## 2. Integration Tests

**What to test**:
- Full query flow: frontend → API → DuckDB → response
- File upload flow: CSV → upload → table creation → query
- Export flow: query → export → file download

**Tools**: pytest + httpx (TestClient), Vitest + MSW

## 3. E2E Tests (Playwright)

**Setup**: `npx playwright test`

**Critical user flows**:
1. Upload CSV → see table in list → query table → see results
2. Write SQL → execute → see results → export CSV
3. Explain query → see plan → format SQL
4. Create tab → rename tab → switch tabs → delete tab
5. Save query → load saved query → favorite → delete

## 4. Performance Tests

**Automated checks**:
- Build size monitoring (Next.js bundle analyzer)
- Query execution time benchmarks
- Large dataset rendering (10K+ rows virtual table)
- Memory usage monitoring
- Monaco Editor load time

**Run**: `cd frontend-react && npm run build` (check bundle sizes)

## 5. Fuzz Tests

**Inputs to test**:
- Random SQL (invalid syntax, injection attempts)
- Oversized CSV (100K+ rows)
- Empty files
- Special characters in table names
- Unicode content
- Concurrent queries

**Strategy**: Generate random inputs, verify system doesn't crash, returns appropriate errors.

## 6. Regression Tests

After every version:
1. Run full unit test suite
2. Run integration tests
3. Manual smoke test: upload → query → export flow
4. Check `git diff` for unintended changes

## Test Configuration

### vitest.config.ts
Located at `frontend-react/vitest.config.ts`

### pytest
Located at `pytest.ini` or `pyproject.toml`

### playwright
Located at `playwright.config.ts`

## CI/CD (Future)

When CI is set up:
- Pre-commit: lint + type-check
- PR: unit tests + integration tests
- Merge: E2E tests + performance benchmarks
- Release: full regression suite
