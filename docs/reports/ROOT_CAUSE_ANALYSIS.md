# Root Cause Analysis — Enterprise AI Data Agent

> Audit date: 2026-05-25 | Version: v0.7.6

## Historical Bug Registry

All major bugs from v0.3.9 through v0.7.6, with root causes, fixes, and regression risk.

---

### ISSUE-009: Corrupted .next Build Cache — Blank Page

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Found** | v0.3.10 |
| **Status** | Fixed |

**Symptom**: SSR 500, missing webpack chunk, blank page after build.

**Root Cause**: Stale `.next` build cache from previous build contained orphaned chunks referenced by new build.

**Fix**: Added `dev:clean` script (`rm -rf .next && npm run dev`). Added `clean` script to package.json.

**Regression Risk**: Low. Cache corruption is environment-specific. `dev:clean` is a reliable escape hatch.

---

### ISSUE-010: DuckDB File Lock — SQL Execution Fails

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Found** | v0.3.10 |
| **Status** | Fixed (v0.7.4 further hardened) |

**Symptom**: `另一个程序正在使用此文件` — DuckDB file locked by stale Python process.

**Root Cause**: Orphaned Python process (PID 15232) held exclusive DuckDB lock. The `DatabaseManager` singleton connected to the file at import time, and `uvicorn --reload` spawned new processes without releasing the old connection.

**Fix (v0.3.10)**: Kill stale process. Added `dev:clean` workflow.
**Fix (v0.7.4)**: Lazy initialization — `QueryHistory.__init__()` no longer calls `_init_table()`. `data_service._db`/`_executor` changed from module-level to lazy getters. Import-time no longer triggers `duckdb.connect()`.

**Regression Risk**: Medium. The lazy init fixes the `--reload` case, but if `DatabaseManager.__new__` singleton is called directly from two processes, the old pattern still applies. The `reset_instance()` method exists but is not auto-called.

---

### ISSUE-011: queryId Always Null — Cancel Never Works

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Found** | v0.3.10 |
| **Status** | Fixed |

**Symptom**: Cancel button visible during execution, but `queryId` is null, so backend cancel endpoint never called.

**Root Cause**: `queryId` was stored in `useState`, which is only set after query completes. But Cancel button is only visible during execution (`isExecuting === true`), so `queryId` was always null when the button was visible.

**Fix**: Moved `queryId` from `useState` to `useRef`. `useRef` is synchronous and doesn't trigger re-renders.

**Regression Risk**: Low. The pattern is now correct. Future developers adding state to the cancel flow should use `useRef` for values read during async operations.

---

### ISSUE-012: handleExecute Stale Closure

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Found** | v0.3.10 |
| **Status** | Fixed |

**Symptom**: Monaco Editor Ctrl+Enter executes stale SQL or wrong tab.

**Root Cause**: `handleExecute` was recreated on every `isExecuting` change because `isExecuting` was in the dependency array. Each state change created a new function ref, causing Monaco's `onExecute` callback to capture stale state.

**Fix**: Read `isExecuting` from `useSqlWorkspaceStore.getState()` directly inside the handler, removing it from the dependency array.

**Regression Risk**: Low. The `getState()` pattern is now standard. But any future `useCallback` that includes store state in its deps could reintroduce this class of bug.

---

### ISSUE-015: numpy.bool_ Serialization 500

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Found** | v0.7.5 |
| **Status** | Fixed in v0.7.6 |

**Symptom**: SQL query API returns HTTP 500. FastAPI `jsonable_encoder` crashes on `numpy.bool_`.

**Root Cause Chain**:
```
POST /api/query
  -> execute_paginated() returns has_more = (offset + len(df)) < total_rows
  -> numpy int64 arithmetic -> numpy.bool_ result
  -> FastAPI serialize_response() -> jsonable_encoder()
  -> dict(obj) fails (TypeError: not iterable) -> vars(obj) fails -> ValueError -> 500
```

**Additional issues with old `_sanitize_for_json`**: Only processed `data` list rows, not response dict scalar fields. Missing datetime, Decimal, numpy.datetime64, pandas Timestamp, UUID, NaN/Inf handling.

**Fix**: New `backend/utils/json_safe.py` with `normalize_for_response()` (recursive) and `json_safe_encoder()` (json.dumps handler). Applied to all route returns + SSE events. 41 regression tests. Global exception handler as safety net.

**Regression Risk**: Low for covered types. Risk: custom objects with unusual `__repr__` or classes with both `__iter__` and numeric `__bool__` could still hit edge cases. The `normalize_for_response` returns unknown types as-is (defers to jsonable_encoder), so truly unknown types could still fail.

---

### SSR Hydration Mismatch (v0.5.7/v0.5.8)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Found** | v0.5.7 |
| **Status** | Fixed |

**Symptom**: React hydration errors on page load. Theme flash (dark->light or vice versa).

**Root Cause**: Zustand persisted stores read from localStorage during SSR (which doesn't have localStorage), causing server/client state mismatch. Theme was applied after hydration, causing FOUC.

**Fix (v0.5.7)**: SSR hydration safety in 6 persisted stores.
**Fix (v0.5.8)**: Inline `<script>` in layout.tsx reads theme from localStorage before React hydrates. `suppressHydrationWarning` on `<html>`.

**Regression Risk**: Low. The inline script pattern is robust. Risk: if a new store adds `persist` without the merge function (added v0.7.5), corrupted localStorage could cause hydration errors.

---

### SSE Stream Truncation (v0.5.8)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Found** | v0.5.8 |
| **Status** | Fixed |

**Symptom**: Last SSE event(s) lost. Stream ends without final "done" event.

**Root Cause**: `consumeSseStream` and `consumeSseStreamGeneric` did not drain the remaining buffer after the stream loop ended. If the final chunk arrived in the same read as the stream close, it was lost.

**Fix**: Added buffer drain after the while loop. Both consumers now process remaining buffer content before calling `onDone`.

**Regression Risk**: Low. The drain pattern is solid. Risk: if the SSE format changes (e.g., multi-line data events), the line-based parser could misparse.

---

### AI Explanation Truncation (v0.5.9)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Found** | v0.5.9 |
| **Status** | Fixed |

**Symptom**: AI explanations were truncated or empty.

**Root Cause**: `_call_llm` only concatenated the first text block from Claude API response. Subsequent blocks were dropped.

**Fix**: Concatenate ALL text blocks from the response.

**Regression Risk**: Low. The fix is straightforward. Risk: if Claude API returns a mix of text and tool_use blocks, the concatenation logic might need adjustment.

---

### Analysis Store Persistence Zeroing (v0.5.9)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Found** | v0.5.9 |
| **Status** | Fixed |

**Symptom**: After page refresh, analysis history was empty — all run data lost.

**Root Cause**: `analysis-store` `partialize` function was stripping all content fields (sections, multiResult, chartSpecs, trace) to reduce localStorage size. But it was too aggressive — it zeroed everything, leaving only metadata (id, mode, question, timestamp, status).

**Fix**: Partialize now preserves section titles + truncated content (500 chars), chart metadata, step metadata, trace summary.

**Regression Risk**: Medium. The partialize logic is complex. If new fields are added to `AnalysisRun` without updating partialize, they'll be lost on persist. The 4MB localStorage limit enforcement could also silently drop data.

---

### Follow-Up Context Corruption (v0.5.7)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Found** | v0.5.7 |
| **Status** | Fixed |

**Symptom**: Follow-up questions produced wrong SQL — referencing tables/columns from the wrong context.

**Root Cause**: Follow-up context was not properly reset between analysis runs. Previous run's schema context leaked into subsequent runs.

**Fix**: `followUpQuestion` state properly reset between analysis runs.

**Regression Risk**: Medium. The AI session store's `compressedSummary` and `keyFindings` accumulate across turns. If the compression logic drops context that's still needed, follow-up quality could degrade.

---

### SQL Generation Missing FROM Clause (Intermittent)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Found** | v0.5.x (AI golden questions) |
| **Status** | Mitigated |

**Symptom**: LLM occasionally generates SQL without FROM clause (e.g., `SELECT COUNT(*)` instead of `SELECT COUNT(*) FROM table`).

**Root Cause**: LLM non-determinism. The prompt includes schema context but the model sometimes produces incomplete SQL.

**Mitigation**: `_generate_step_sql_with_retry()` in ai_pipeline.py retries once with error context injected. Step-level retry was added in v0.7.3 for non-streaming path.

**Regression Risk**: Inherent to LLM-based SQL generation. Cannot be fully eliminated, only mitigated with retry + guardrails.

---

## Regression Patterns

### Pattern 1: Import-Time Side Effects
- **ISSUE-010** (DuckDB lock): Module-level `DatabaseManager()` at import time
- **Multiple versions**: Lazy getters were introduced in v0.7.4
- **Risk**: Any new module that connects to DuckDB at import time will reintroduce this
- **Defense**: All DB access through `get_db()` / `get_executor()` lazy getters

### Pattern 2: Stale Closures in React
- **ISSUE-011** (queryId null): useState not synced with async flow
- **ISSUE-012** (handleExecute): useCallback with store state in deps
- **Risk**: Any new async handler that captures Zustand store state via `useSelector` could go stale
- **Defense**: Use `useRef` for values read during async ops; use `getState()` for store reads in callbacks

### Pattern 3: Serialization Type Leakage
- **ISSUE-015** (numpy.bool_): numpy types in DuckDB results leaking to JSON
- **Earlier**: `_safe_serialize` (v0.5.8) handled datetime/Decimal but missed numpy
- **Risk**: New DuckDB operations returning unusual types (e.g., DuckDB LIST, STRUCT) could break serialization
- **Defense**: `normalize_for_response()` on all route returns + 41 regression tests

### Pattern 4: localStorage Corruption
- **ISSUE-009** (.next cache): Build artifacts corrupt
- **v0.7.5**: Merge functions added to 7 stores to handle corrupted localStorage
- **Risk**: If `zustand/migrate` is not used, future schema changes could break old localStorage data
- **Defense**: Merge functions validate array fields, fall back to defaults on corruption

### Pattern 5: SSE Buffer Loss
- **v0.5.8**: Last events lost due to missing buffer drain
- **Risk**: Any new SSE endpoint must ensure buffer drain after stream ends
- **Defense**: Both SSE consumers now drain buffer. Pattern documented in ai_pipeline.py streaming variant.
