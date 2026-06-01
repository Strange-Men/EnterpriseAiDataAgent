# Known Runtime Risks — Enterprise AI Data Agent

> Audit date: 2026-05-25 | Version: v0.7.6

## Risk Severity Matrix

| ID | Risk | Severity | Likelihood | Status |
|----|------|----------|------------|--------|
| R1 | DuckDB singleton race condition | High | Medium | Partially mitigated |
| R2 | Thread-unsafe shared state | High | Medium | Unmitigated |
| R3 | localStorage corruption | Medium | Medium | Partially mitigated |
| R4 | SSE retry duplication | Medium | Low | Mitigated |
| R5 | State duplication (currentSql) | Medium | High | Unmitigated |
| R6 | Token budget estimation inaccuracy | Medium | Low | Accepted |
| R7 | Scheduler worker silent failures | Medium | Low | Unmitigated |
| R8 | Memory growth (long sessions) | Medium | Medium | Partially mitigated |
| R9 | CSV export NaN handling | Low | High | Unmitigated |
| R10 | Lazy import fragility | Low | Low | Accepted |
| R11 | LLM non-determinism | Medium | High | Mitigated |
| R12 | Dual history fetch | Low | High | Unmitigated |

---

## Detailed Risk Analysis

### R1: DuckDB Singleton Race Condition

**Path**: `database/db_manager.py::DatabaseManager.__new__` + `data_service.get_db()`

**Problem**: Two-layer singleton pattern:
1. `DatabaseManager.__new__` returns `_instance` if exists
2. `data_service.get_db()` creates `DatabaseManager()` (gets singleton) and caches in `_db`

If `DatabaseManager.__new__` is called before `get_db()`, the singleton is created but `data_service._db` remains `None`. Conversely, if `get_db().close()` is called but someone else holds a reference to `DatabaseManager()`, the connection is closed but the singleton still exists.

**Impact**: File locking on restart, connection state inconsistency.

**Current Mitigation**: Lazy init (v0.7.4), lifespan startup calls `get_db().connect()`, shutdown calls `get_db().close()`.

**Residual Risk**: `reset_instance()` exists but is not auto-called at startup. If `uvicorn --reload` spawns a new process, the old process's singleton is garbage-collected, but if the new process imports the module before the old one exits, both hold connections.

**Recommendation**: Call `DatabaseManager.reset_instance()` in lifespan startup.

---

### R2: Thread-Unsafe Shared State

**Paths**:
- `data_service._UPLOAD_TIMESTAMPS` — plain dict, written by `upload_file()`, read by `list_tables()`
- `routes/query.py::_active_queries` — plain dict for query cancellation
- `services/query_history.py` — `deque(maxlen=200)`, DuckDB persistence not atomic

**Problem**: FastAPI runs async handlers, but `run_in_executor` (used for DuckDB queries) runs in thread pool. Concurrent uploads or queries could race on these structures.

**Impact**: Data corruption, lost entries, DuckDB write conflicts.

**Current Mitigation**: Typical single-user deployment. FastAPI's GIL provides partial protection for dict operations.

**Residual Risk**: Under concurrent requests (multiple browser tabs, API clients), race conditions are possible. The `deque` append + DuckDB INSERT + cleanup DELETE sequence in `query_history.add()` is not atomic.

**Recommendation**: Use `threading.Lock` for `_UPLOAD_TIMESTAMPS` and `_active_queries`. Use connection-level transactions for `QueryHistory` persistence.

---

### R3: localStorage Corruption

**Paths**: 9 persisted Zustand stores

**Problem**: localStorage can be corrupted by browser bugs, storage quota exceeded, concurrent tab writes, or manual edits. If a store reads corrupted JSON, `JSON.parse` throws and the store reverts to default state (losing all user data).

**Impact**: User loses all analysis history, saved queries, tabs, templates.

**Current Mitigation (v0.7.5)**: 7 stores have `merge` functions that validate array fields and fall back to defaults. `analysis-store.onRehydrateStorage` calls `recoverInterruptedRuns()`.

**Residual Risk**: 
- `workspace-store` and `query-tabs-store` have merge functions but don't validate individual field types
- `saved-queries-store` merge only checks `queries` array existence, not item structure
- No store uses `zustand/migrate` for schema versioning — if the `AnalysisRun` type changes, old localStorage data may have missing/extra fields

**Recommendation**: Add schema version numbers to persisted stores. Implement `zustand/migrate` for versioned migrations.

---

### R4: SSE Retry Duplication

**Paths**: `consumeSseStream` and `consumeSseStreamGeneric` in `api.ts`

**Problem**: Both consumers retry up to 2 times with exponential backoff if no data is received. If the first attempt sent data but the connection dropped mid-stream, the retry could re-execute the entire backend operation (LLM call, SQL execution), producing duplicate results.

**Impact**: Duplicate analysis steps, double LLM calls (cost), duplicate UI events.

**Current Mitigation**: Retry only fires if `!hasReceivedData` — no data was ever received. If any data was received, the stream ends without retry.

**Residual Risk**: If the first chunk arrives but the connection drops before the frontend processes it, `hasReceivedData` might not be set in time (race between chunk arrival and timeout). Also, the backend has no deduplication — a retried request creates a new LLM call.

**Recommendation**: Backend should accept an `idempotency_key` parameter. Frontend should generate one per analysis run.

---

### R5: State Duplication — currentSql

**Path**: `sql-workspace-store.currentSql` vs `query-tabs-store.tabs[].sql`

**Problem**: `table-management-panel.tsx` writes `setCurrentSql(sql)` to `sql-workspace-store.currentSql` when user selects a table. But `sql-workspace-panel.tsx` reads SQL from `query-tabs-store.getActiveTab().sql`. The write goes nowhere — the editor never displays the SQL.

**Impact**: "Select table -> populate SQL" feature is broken. User selects a table, nothing happens in the editor.

**Current Mitigation**: None — this is a latent bug.

**Residual Risk**: If a future developer reads `sql-workspace-store.currentSql` somewhere, they'll get stale data from the table panel, not the current editor SQL.

**Recommendation**: Remove `currentSql` and `setCurrentSql` from `sql-workspace-store`. Fix `table-management-panel` to call `query-tabs-store.updateTabSql(activeTabId, sql)` instead.

---

### R6: Token Budget Estimation Inaccuracy

**Path**: `token_budget.py::estimate_tokens()` = `len(text) // 3`

**Problem**: Heuristic estimation. Actual token count depends on language (Chinese chars = more tokens), code (special chars), and model tokenizer. The `// 3` heuristic is conservative for English but could be 2x off for Chinese or code-heavy text.

**Impact**: Budget could be exhausted prematurely (truncating useful context) or overrun (hitting Claude API limits).

**Current Mitigation**: Conservative heuristic. WorkflowTokenTracker has 25K total budget, well below Claude's context limits.

**Residual Risk**: For Chinese-heavy analysis (default language is zh), actual tokens could be 1.5-2x the estimate, meaning the 25K budget could actually consume 37-50K tokens. This could hit Claude's context limit on large schemas.

**Recommendation**: Accept the heuristic. Monitor actual vs estimated tokens via trace data. If discrepancy grows, add a `-- 2` variant for Chinese text.

---

### R7: Scheduler Worker Silent Failures

**Path**: `runtime/scheduler_worker.py::_run_due_tasks()`

**Problem**: Exception during `run_autonomous_analysis()` is caught, logged via `mark_executed(task.id, success=False, error=str(e))`, but the traceback is lost. If the error is transient (network), the task won't be retried until next interval.

**Impact**: Scheduled tasks silently fail. No alerting, no retry.

**Current Mitigation**: Error is recorded in `ScheduleResult` and visible in the schedule dialog.

**Residual Risk**: No exponential backoff for transient failures. No dead-letter queue. If a task consistently fails, it keeps running every interval, wasting resources.

**Recommendation**: Add retry count to `ScheduledTask`. After N consecutive failures, disable the task and notify via UI.

---

### R8: Memory Growth (Long Sessions)

**Paths**: 
- `analysis-store.ts` — `runs` array grows unbounded (capped at 20 unsaved, but saved runs never expire)
- `ai-session-store.ts` — `turns` array compresses at 15, but `keyFindings` and `compressedSummary` grow
- `sql-history-store.ts` — `history` deque capped at 200, but localStorage 2MB limit enforced

**Problem**: After hours of use, saved analysis runs accumulate. Each run can be 50KB+ (with sections, multi-step data, trace). 50 saved runs = 2.5MB+ in localStorage.

**Impact**: localStorage quota exceeded. Slow store hydration. Possible OOM in extreme cases.

**Current Mitigation**: `analysis-store` partialize truncates content. 4MB localStorage limit with oldest-unsaved-first eviction. `MAX_HISTORY=20` for unsaved runs.

**Residual Risk**: Saved runs are never evicted. If user saves every run, localStorage will eventually fill. No user-facing warning until the 4MB limit triggers silent data loss.

**Recommendation**: Add a "storage usage" indicator. Cap saved runs at 50. Allow user to export/delete saved runs in bulk.

---

### R9: CSV Export NaN Handling

**Path**: `routes/tables.py` line ~116

**Problem**: CSV export uses `df.iterrows()` + `row.tolist()`. numpy NaN values are written as string `"nan"` instead of empty string.

**Impact**: Downstream tools (Excel, pandas) interpret "nan" as literal string, not missing value.

**Current Mitigation**: None.

**Recommendation**: Use `df.fillna('').to_csv()` instead of manual iteration.

---

### R10: Lazy Import Fragility

**Paths**: Multiple modules use lazy imports inside functions:
- `routes/ai.py` -> `scheduler`, `report_builder`, `diff_engine`, `locale`
- `data_service.get_system_health()` -> `scheduler`, `query_history`, `scheduler_worker`
- `ai_analyst.detect_and_interpret_anomalies()` -> `anomaly_detector`

**Problem**: Lazy imports prevent circular dependencies but make the dependency graph invisible to static analysis. If a lazy-imported module is renamed or removed, the error only surfaces at runtime when that specific code path is hit.

**Impact**: Runtime ImportError on specific API calls, not at startup.

**Current Mitigation**: All lazy imports are in well-tested code paths. The modules they import are stable.

**Residual Risk**: If someone refactors `scheduler.py` -> `scheduler_manager.py`, the lazy imports in `routes/ai.py` and `data_service.get_system_health()` would break silently.

**Recommendation**: Accept the pattern. Add a lint rule or CI check that validates lazy import targets exist.

---

### R11: LLM Non-Determinism

**Path**: All AI endpoints

**Problem**: Claude API responses are non-deterministic. Same input can produce different SQL, explanations, or insights. This affects:
- SQL generation (different queries for same question)
- Insight quality (varying confidence scores)
- Chart suggestions (different chart types)
- Self-evaluation (inconsistent scoring)

**Impact**: Inconsistent user experience. Golden question tests can pass or fail randomly.

**Current Mitigation**: Temperature is set to prompt defaults (typically 0 for SQL generation). Retry logic for transient errors. Guardrails limit blast radius.

**Residual Risk**: Cannot be fully eliminated. Temperature 0 reduces but doesn't eliminate variance.

**Recommendation**: Document as inherent limitation. Use golden question tests with pass-rate thresholds (>60%) rather than exact-match assertions.

---

### R12: Dual History Fetch

**Paths**: 
- `sql-workspace-panel.tsx` useEffect -> `fetchHistory()` (sql-history-store)
- `sql-history-panel.tsx` useEffect -> `fetchQueryHistory()` (direct API call)

**Problem**: Both fire on mount, both populate `sql-history-store.history`. The second call overwrites the first. Two redundant API calls.

**Impact**: Double network traffic on page load. If the two calls return different results (e.g., one fails), the store could briefly have inconsistent state.

**Current Mitigation**: Harmless in practice — both call the same backend endpoint.

**Recommendation**: Remove the `fetchQueryHistory()` call in `sql-history-panel.tsx`. Let `sql-workspace-panel` be the sole owner of history fetching.
