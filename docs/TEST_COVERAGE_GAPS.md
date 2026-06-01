# Test Coverage Gaps — Enterprise AI Data Agent

> Audit date: 2026-05-25 | Version: v0.7.6

## Test Count Summary

| Suite | Total | Pass | Fail | Error | Coverage |
|-------|-------|------|------|-------|----------|
| Python backend (tests/) | 383 | 364 | 6 | 13 | ~47% |
| Frontend unit (vitest) | 160 | 160 | 0 | 0 | Stores/services/utils only |
| E2E (Playwright) | ~28 | N/A | N/A | N/A | Not run in audit |
| AI evaluation (manual) | 15 | N/A | N/A | N/A | Needs API key |

**Note**: Backend 6 failures + 13 errors are all DuckDB file lock conflicts (test_api_endpoints.py and test_upload_quality_routes.py use file-based DB, not `:memory:`).

---

## 1. Backend Modules with ZERO Unit Tests

| Module | Lines | Risk | Priority |
|--------|-------|------|----------|
| `services/ai_analyst.py` (core functions) | 1020 | **Critical** — all LLM integration untested | P0 |
| `services/ai_pipeline.py` (orchestration) | 626 | **Critical** — multi-step pipeline untested | P0 |
| `services/data_service.py` | 242 | **High** — only tested via API endpoints | P1 |
| `services/export_service.py` | 43 | Medium | P2 |
| `services/profiler.py` | 63 | Medium | P2 |
| `services/shared_utils.py` | 8 | Low | P3 |
| `runtime/scheduler_worker.py` | 66 | **High** — background worker, zero tests | P1 |
| `routes/upload.py` | 22 | Medium | P2 |
| `routes/tables.py` | 126 | Medium | P2 |
| `routes/quality.py` | 14 | Low | P3 |
| `routes/analyze.py` | 99 | Medium | P2 |
| 11 prompt modules | ~600 total | Low (pure text, no logic) | P3 |
| `config.py` | 21 | Low | P3 |

### What IS Tested in backend

| Module | Tests | Coverage Type |
|--------|-------|---------------|
| `query_executor.py` | 19 tests | Unit — good coverage |
| `query_history.py` | 5 tests | Unit — adequate |
| `schema_detector.py` | ~25 tests | Unit — good coverage |
| `data_quality.py` | ~16 tests | Unit — good coverage |
| `file_loader.py` | ~16 tests | Unit — good coverage |
| `observability.py` | ~10 tests | Unit — adequate |
| `guardrails.py` | ~18 tests | Unit — full coverage |
| `token_budget.py` | ~14 tests | Unit — full coverage |
| `trace.py` | ~10 tests | Unit — full coverage |
| `report_builder.py` | ~13 tests | Unit — good coverage |
| `diff_engine.py` | ~10 tests | Unit — good coverage |
| `scheduler.py` | ~10 tests | Unit — good coverage |
| `anomaly_detector.py` | ~22 tests | Unit — full coverage |
| `follow_up_context.py` | ~12 tests | Unit — good coverage |
| `self_evaluation.py` | 5 tests | Unit — adequate |
| `json_safe.py` | ~28 tests | Unit — full coverage |
| `ai_pipeline.py` (helpers only) | ~13 tests | Partial — only `_infer_column_types`, `_derive_step_summary` |
| `ai_analyst.py` (retry only) | 7 tests | Partial — only `_call_llm` retry logic |
| `api_endpoints.py` | 10 tests | Integration — but 6 fail (DuckDB lock) |
| `ai_endpoints.py` | ~10 tests | Integration with mocks — all LLM calls mocked |
| `upload_quality_routes.py` | 13 tests | Integration — all error (DuckDB lock) |

---

## 2. Critical Uncovered Flows

### 2.1 Full AI Analysis Pipeline (ZERO test coverage)

The entire chain from user question to analysis result is untested:
```
generate_sql() -> execute SQL -> explain_results() -> generate_insights()
  -> suggest_charts() -> [multi-step: generate_analysis_plan() -> loop]
```

**Risk**: If any function signature changes, or if prompt builders produce malformed messages, no test catches it until runtime.

**What's needed**: Integration tests with mocked Anthropic client that verify:
- `run_ai_query()` returns expected structure
- `run_autonomous_analysis()` completes all plan steps
- Streaming variants yield expected event sequence
- Error handling produces diagnostic events

### 2.2 File Upload to Query Flow (broken tests)

The full flow `upload CSV -> schema detection -> DuckDB import -> query -> results` is only tested in `test_upload_quality_routes.py`, which currently errors on all 13 tests due to DuckDB file lock.

**Risk**: Upload path changes could break the entire data ingestion pipeline with no test warning.

**What's needed**: Fix test fixture to use `:memory:` DB. Or add unit tests for each step independently.

### 2.3 SSE Streaming Content (not validated)

AI streaming endpoints are tested only for HTTP 200 status code. No test verifies:
- Event format (`data: {json}\n\n`)
- Event sequence (text chunks -> done)
- Error event format
- Stream cancellation behavior
- Timeout behavior

**Risk**: If event format changes, frontend SSE consumers will silently fail.

### 2.4 Error Propagation Chain

No test covers the path: LLM error -> backend exception -> SSE error event -> frontend error display.

**What's needed**: Tests that simulate Anthropic API errors and verify they surface correctly to the frontend.

### 2.5 Export Service (ZERO tests)

`export_service.py` handles CSV/JSON/Excel export. Zero tests. If format handling changes, data corruption could occur silently.

### 2.6 Scheduler Worker (ZERO tests)

`scheduler_worker.py` is a daemon thread that polls for due tasks. Zero tests for:
- Task execution
- Error handling
- Thread lifecycle (start/stop)
- Concurrent task execution

---

## 3. Frontend Coverage Gaps

### 3.1 Zero Component Tests

The vitest config only covers `src/stores/**`, `src/services/**`, `src/utils/**`. All 40+ React components have zero tests.

| Component | Lines | Risk |
|-----------|-------|------|
| `ai-analysis-panel.tsx` | 835 | **Critical** — largest component, complex state |
| `sql-workspace-panel.tsx` | 705 | **Critical** — main workspace |
| `analysis-workspace-panel.tsx` | 535 | High |
| `VirtualDataTable.tsx` | 529 | Low (orphaned) |
| `monaco-sql-editor.tsx` | 297 | High |
| `data-table.tsx` | 283 | High |
| `file-upload-panel.tsx` | 262 | High |
| `table-management-panel.tsx` | 216 | Medium |

**Risk**: UI regressions are only caught by E2E tests (which are not run regularly). Component logic bugs (e.g., wrong store read, missing state reset) go undetected.

### 3.2 No Hook Tests

Three custom hooks have no tests:
- `use-theme.ts`
- `use-tables.ts`
- `use-language.ts`

### 3.3 No Integration Tests Between Stores

Store tests verify each store in isolation. No test verifies:
- `data-store.getDatasetMeta()` correctly reads `analysis-store.runs`
- `sql-workspace-panel` correctly syncs `query-tabs-store` and `sql-workspace-store`
- Store persist/rehydrate produces consistent state across reload

---

## 4. Mocked-But-Not-Real Flows

### 4.1 `test_ai_endpoints.py` — All AI Endpoints Mocked

Every AI endpoint test mocks the underlying service function:
```python
monkeypatch.setattr("backend.routes.ai.run_ai_query", mock_run_ai_query)
monkeypatch.setattr("backend.routes.ai.explain_results", mock_explain_results)
```

**What this means**: Tests pass even if the real `run_ai_query` is completely broken. They only verify that the route handler correctly calls the service function and returns its result.

**What's NOT tested**: Actual LLM integration, prompt building, token budget enforcement, guardrail checking, trace recording.

### 4.2 `frontend-react/src/services/__tests__/api.test.ts` — Fetch Mocked

All 17 tests mock `global.fetch`. They verify correct URL/method/body but never test actual API responses or error parsing.

### 4.3 `tests/ai/test_golden_questions.py` — Real But Unreliable

These ARE real integration tests (hit actual Claude API), but:
- Not auto-discovered by `pytest` (must run `pytest tests/ai/` explicitly)
- Skip without `ANTHROPIC_API_KEY`
- LLM non-determinism causes intermittent failures
- Not run in CI

---

## 5. E2E Test Gaps

### 5.1 What IS Covered (28 tests across 6 files)

- Basic SQL execution
- File upload
- Error handling (invalid SQL, empty SQL)
- Tab management
- Theme switching
- Reload persistence
- Performance thresholds

### 5.2 What is NOT Covered

| Flow | Risk |
|------|------|
| AI analysis (explain/insights/autonomous) | **Critical** — core feature, zero E2E |
| Anomaly detection UI | High |
| Export (CSV/JSON/Excel) | Medium |
| Saved queries CRUD | Medium |
| Template save/apply | Medium |
| Report generation | Medium |
| Schedule create/execute | Medium |
| Diff/compare | Low |
| Keyboard shortcuts (Ctrl+Enter, Ctrl+S) | Low |
| Multi-tab SQL execution | Medium |
| Pagination (load more) | Medium |
| Quality report display | Low |
| Schema panel | Low |

### 5.3 E2E Test Quality Issues

- `waitForTimeout()` used extensively (500ms-5000ms hardcoded sleeps) instead of waiting for specific UI states
- `performance.spec.ts` heap test uses Chrome-specific API (`performance.memory`), no-op on Firefox/Safari
- No visual regression tests
- No accessibility tests

---

## 6. Test Infrastructure Issues

### 6.1 DuckDB Lock in API Tests

`test_api_endpoints.py` and `test_upload_quality_routes.py` use a real file-based DuckDB, causing lock conflicts when run alongside the dev server or other test files. All 19 affected tests should use `:memory:` DB.

### 6.2 Test Isolation

- `test_scheduler.py` uses file-based persistence with autouse cleanup — if cleanup fails, tests become flaky
- `test_observability.py` imports `TestClient(app)` inline — vulnerable to app state contamination

### 6.3 Missing Test Data

E2E tests only use a 10-row CSV. No tests for:
- Large files (>1MB)
- Files with special characters in column names
- Files with all-null columns
- Files with mixed encodings (GBK, etc.)
- Excel files with multiple sheets

---

## 7. Coverage Improvement Priority

### P0 — Must Have (blocks production confidence)
1. Fix DuckDB lock in API tests (use `:memory:`)
2. Add integration test for `run_ai_query()` with mocked LLM
3. Add integration test for `run_autonomous_analysis()` with mocked LLM
4. Add E2E test for AI explain flow

### P1 — Should Have (reduces regression risk)
5. Add unit tests for `data_service.py`
6. Add unit tests for `scheduler_worker.py`
7. Add SSE content validation tests
8. Add component test for `ai-analysis-panel.tsx`

### P2 — Nice to Have
9. Add component tests for remaining panels
10. Add export service tests
11. Add profiler tests
12. Add hook tests

### P3 — Future
13. Visual regression tests
14. Accessibility tests
15. Large dataset performance tests
16. Concurrent request tests
