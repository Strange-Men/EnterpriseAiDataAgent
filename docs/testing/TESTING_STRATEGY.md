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
- Services: API functions, SSE consumers

**Test files** (117 tests across 11 files):
- `src/stores/__tests__/query-tabs-store.test.ts`
- `src/stores/__tests__/saved-queries-store.test.ts`
- `src/stores/__tests__/sql-history-store.test.ts`
- `src/stores/__tests__/sql-workspace-store.test.ts`
- `src/stores/__tests__/data-store.test.ts`
- `src/stores/__tests__/workflow-store.test.ts`
- `src/stores/__tests__/ai-session-store.test.ts`
- `src/services/__tests__/api.test.ts`
- `src/utils/__tests__/logger.test.ts`
- `src/utils/__tests__/cn-util.test.ts`
- `src/utils/__tests__/utils-index.test.ts`

### Backend (pytest)

**Setup**: `cd tests && python -m pytest -v`

**What to test**:
- `QueryExecutor` — SQL execution, explain, edge cases
- `QueryHistory` — ring buffer behavior
- API endpoints — request/response validation
- `_sanitize_for_json()` — NaN/Inf/NaT handling
- AI infrastructure (v0.6.0): guardrails, trace, token_budget, AI endpoints, pipeline unit

**Test files** (161+ tests):
- `tests/test_query_executor.py` — Basic SQL execution
- `tests/test_query_executor_extended.py` — Joins, subqueries, window functions
- `tests/test_api_endpoints.py` — All REST endpoints
- `tests/test_upload_quality_routes.py` — Upload, quality, table CRUD, AI status
- `tests/test_observability.py` — Error classification, speed, QueryTimer
- `tests/test_query_history.py` — Query history tracking
- `tests/test_schema_detector.py` — Schema detection
- `tests/test_data_quality.py` — Data quality checks
- `tests/test_file_loader.py` — File loading
- `tests/test_guardrails.py` — Guardrail system (v0.6.0)
- `tests/test_trace.py` — Trace recorder (v0.6.0)
- `tests/test_token_budget.py` — Token budget (v0.6.0)
- `tests/test_ai_endpoints.py` — AI API endpoints mocked (v0.6.0)
- `tests/test_ai_pipeline_unit.py` — Pipeline unit tests (v0.6.0)

### AI Evaluation (pytest — requires API key)

**Setup**: `cd tests/ai && python -m pytest test_golden_questions.py -v`

- 15 golden questions across 7 categories (basic, aggregation, sorting, filtering, window, subquery, hallucination, edge_case)
- SQL evaluation: pattern matching, column checks, row count, hallucination detection
- Pass rate threshold: 60%, zero hallucination tolerance

## 2. Integration Tests

**What to test**:
- Full query flow: frontend → API → DuckDB → response
- File upload flow: CSV → upload → table creation → query
- Export flow: query → export → file download

**Tools**: pytest + httpx (TestClient)

## 3. E2E Tests (Playwright)

**Setup**: `cd frontend-react && npx playwright test`

**Critical user flows**:
1. Upload CSV → see table → query → results (`sql-workspace.spec.ts`)
2. Write SQL → execute → results → export CSV
3. AI workflow: upload → explain → insights → charts → follow-up → autonomous (`ai-workflow.spec.ts`, v0.6.0)
4. Error handling: timeout, empty input, network error (`ai-error-handling.spec.ts`, v0.6.0)
5. Performance: page load, DOM nodes, heap memory (`performance.spec.ts`)

## 4. Performance Tests

**Automated checks**:
- Build size monitoring (Next.js bundle analyzer)
- Query execution time benchmarks
- Large dataset rendering (10K+ rows virtual table)
- Memory usage monitoring

**Run**: `cd frontend-react && npx playwright test e2e/performance.spec.ts`

## 5. Regression Tests

After every version:
1. Run full unit test suite
2. Run integration tests
3. Manual smoke test: upload → query → export flow
4. Check `git diff` for unintended changes

## CI-Ready Commands

```bash
# Backend tests (no API key needed)
cd tests && python -m pytest -v

# Frontend unit tests
cd frontend-react && npm run test

# Frontend E2E tests (requires backend running on port 8000)
cd frontend-react && npx playwright test

# AI golden question evaluation (requires ANTHROPIC_API_KEY)
cd tests/ai && python -m pytest test_golden_questions.py -v

# TypeScript type check
cd frontend-react && npx tsc --noEmit

# Full build
cd frontend-react && npm run build
```

## CI/CD (Future)

When CI is set up:
- Pre-commit: lint + type-check
- PR: unit tests + integration tests
- Merge: E2E tests + performance benchmarks
- Release: full regression suite
