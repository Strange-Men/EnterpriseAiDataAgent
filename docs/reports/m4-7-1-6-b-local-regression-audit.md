# M4-7.1.6-B Local Full Regression Audit

## 1. Test Environment

| Item | Value |
|------|-------|
| Branch | `m4-7-1-6-b-local-regression-audit` |
| Base Commit | `f121106` (master, post M4-7.1.6-A merge) |
| Node Version | v24.15.0 |
| Python Version | 3.11.5 |
| Date | 2026-06-22 |

## 2. Small Fix: Language Switch Copy

### Before

```
中文界面: {t("settings.switch-to")} English  →  "切换到 English"
英文界面: {t("settings.switch-to")} 中文     →  "Switch to 中文"
```

### After

```
中文界面: {t("settings.switch-language")}  →  "切换成英文"
英文界面: {t("settings.switch-language")}  →  "Switch to Chinese"
```

### Changed Files

| File | Change |
|------|--------|
| `frontend-react/src/i18n/zh.ts` | Added `"settings.switch-language": "切换成英文"` |
| `frontend-react/src/i18n/en.ts` | Added `"settings.switch-language": "Switch to Chinese"` |
| `frontend-react/src/app/(shell)/settings/page.tsx` | Button uses `t("settings.switch-language")` instead of concatenated text |

### Notes

- Only copy changed, no logic change
- `settings.switch-to` preserved (still used by theme toggle button)
- No existing tests for settings page to update

## 3. Frontend Validation

| Check | Result | Detail |
|-------|--------|--------|
| TypeScript (`tsc --noEmit`) | ✅ Pass | 0 errors |
| Vitest Tests | ✅ Pass | 257 passed (20 test files) |
| Production Build | ✅ Pass | All routes built successfully |
| ESLint | ✅ Pass | 3 warnings only (unused vars in test files, non-blocking) |

### Build Routes Confirmed

```
○ /analyze
ƒ /analyze/[runId]
○ /data
○ /history
○ /query
○ /settings
```

No `/performance` or `/virtual-table` routes present.

## 4. Backend Validation

| Check | Result | Detail |
|-------|--------|--------|
| Import Check | ✅ Pass | `backend import OK` |
| Full pytest | ✅ Pass | 523 passed, 31 skipped, 0 failed |

### Skipped Tests

All 31 skipped tests are in `tests/ai/test_golden_questions.py`.

- **Reason**: Requires `RUN_AI_EVAL=1` environment variable + valid `ANTHROPIC_API_KEY`
- **Type**: External LLM API dependency
- **Impact**: None on local core functionality. These are AI quality evaluation tests that run against live API.

## 5. API Smoke Test

| Endpoint | Method | Result | Notes |
|----------|--------|--------|-------|
| `/api/health` | GET | ✅ 200 | `status: "ok"` |
| `/api/tables` | GET | ✅ 200 | 578 tables |
| `/api/query` (SELECT 1) | POST | ✅ 200 | Read-only SQL works |
| `/api/query` (DROP TABLE) | POST | ⚠️ 500 | Blocked correctly (log: "Statement type not allowed: DROP"), HTTP status code is 500 instead of 400/403 — security logic works, status code convention issue only |
| `/api/ai/status` | GET | ✅ 200 | AI service config endpoint works |

### SQL Safety

DROP TABLE is correctly blocked. The guard logic (`Only SELECT queries are permitted`) is functional. The 500 vs 400/403 status code is a minor convention issue that does not affect security.

## 6. Core Flow Regression

### 6.1 AI SQL

| Item | Status |
|------|--------|
| Chinese field semantic mapping | ✅ Present in `semantics.py`, `suggest_questions.py` |
| Deterministic SQL fallback | ✅ Present in `sql_templates.py` |
| CANNOT_ANSWER guard | ✅ Conditional — only when core metric columns truly missing |
| Expert SQL no-auto-execute | ✅ Confirmed in prior audit |

### 6.2 Markdown Report

| Section | Status |
|---------|--------|
| Executive Summary (执行摘要) | ✅ `buildExecutiveSummary()` at line 254 |
| Key Findings (关键发现) | ✅ Section 4 |
| Final Result Table (最终结果表) | ✅ Section 5 |
| Metric Coverage (指标完成情况) | ✅ `evaluateMetricCoverage()` with MetricRequirement |
| Missing Fields (未满足项/缺失字段) | ✅ Section 7 |
| Trace as Appendix | ✅ Section 10 "调用追踪 Trace" (not "Agent") |

### 6.3 Save / Export

| Item | Status |
|------|--------|
| No "Save as Template" in UI | ✅ `showSaveAsTemplate: false` in features.ts |
| No ambiguous save/cancel | ✅ |
| Default export = Markdown | ✅ Confirmed |
| JSON label = "原始 JSON（开发者）" | ✅ `analysis.export-raw-json` |
| SQL default export = CSV | ✅ `handleExportCsv` in sql-history-panel |

### 6.4 History Recall

| Item | Status |
|------|--------|
| AI history → view detail | ✅ `/analyze/[runId]` route |
| AI history → rerun | ✅ `handleRerunAnalysis` dispatches `history:rerun-analysis` |
| AI history → export Markdown | ✅ `handleExportMarkdown` using `runToMarkdown` |
| SQL history → load to workspace | ✅ `history.load-to-workspace` button |
| SQL history → re-execute | ✅ Via `history:rerun-analysis` event |
| SQL history → export CSV | ✅ `handleExportCsv` |

### 6.5 Settings Language Copy

| Locale | Button Text | Status |
|--------|-------------|--------|
| zh | 切换成英文 | ✅ |
| en | Switch to Chinese | ✅ |

### 6.6 Deleted Routes / Features Not Restored

| Item | Status |
|------|--------|
| `/performance` route | ✅ Not present |
| `/virtual-table` route | ✅ Not present |
| Templates (UI visible) | ✅ Hidden behind `showSaveAsTemplate: false` |
| Scheduler | ✅ No route/page |
| Charts (standalone) | ✅ No route/page |
| Anomalies (standalone) | ✅ No route/page |
| Diff | ✅ No route/page |
| Timeline (standalone) | ✅ No route/page |
| Command Palette | ✅ Not present |
| Global Search | ✅ Not present |
| Keyboard Shortcuts | ✅ Not present |

## 7. Issues Found

| # | Severity | Description |
|---|----------|-------------|
| 1 | Low | `/api/query` returns HTTP 500 for blocked SQL (DROP TABLE) instead of 400/403. Security logic works correctly; this is a status code convention issue. Does not affect security or functionality. |

No blocking issues found.

## 8. Stability Rating

**GREEN**

All local tests pass. Core functionality intact. Language switch copy fix is clean and minimal. No regressions detected.

## 9. Recommendation

| Question | Answer |
|----------|--------|
| Merge to master? | ✅ Yes — safe to merge |
| Enter M4-7.2? | ✅ Yes — local validation confirms stability |
| M5 Agent? | ❌ No — still prohibited per scope rules |
| Tag? | ❌ No — user explicitly deferred tagging |
