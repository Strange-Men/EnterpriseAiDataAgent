# M6 Manual Regression Hotfix

> Date: 2026-07-07

## 1. Scope

This round is the M6 manual regression hotfix after Manual Fix 1 / 2 / 3.

- Started from latest `master`.
- Created branch `m6-manual-regression-default-table-upload-qa`.
- Did not add M6.9.
- Did not create a tag.
- Did not add Multi-Agent, LangGraph, or RAG.
- Did not restore Sidebar or five-page navigation.

## 2. User-Reported Problems

Manual testing exposed three high-priority regressions:

1. The default demo table was not visible on first page load. The workbench showed an empty current-table area and the old upload-first message, so HR / evaluator users could not test directly.
2. Large CSV / Excel upload could still show `signal timed out`, reach 100%, and fail to switch into an analyzable table state.
3. Five hard business-analysis questions needed to be validated against the default `demo_sales_business_50k` table for report quality, hallucination safety, speed, and provider transparency.

## 3. Default Table Root Cause

The backend session endpoint could ensure and return the M6 demo table, but `/api/tables` did not independently guarantee that `demo_sales_business_50k` was imported before the frontend requested the table list.

That created a fragile page-load order:

- If the frontend table list path ran first or session recovery failed, the UI could see no tables.
- The session payload did not expose `current_table_exists`, row count, or column count, so the frontend could not distinguish a real missing table from stale table-list state.
- The frontend could therefore fall back to the empty upload prompt even though the default dataset existed on disk.

## 4. Default Table Fix

Implemented the default-table guarantee on both backend and frontend paths:

- `/api/tables` now ensures the default business demo table before returning table metadata.
- `/api/session/current` now returns current/default table metadata including existence, row count, and column count.
- The backend raises a clear default-table-unavailable error if `testExcel/demo_sales_business_50k.csv` is missing or cannot load.
- The frontend can build the current table display from session metadata if the table-list call is stale.
- The empty-table message now points developers to the missing default dataset instead of telling HR / evaluator users to upload first.

Expected default state:

- Current table: `demo_sales_business_50k`
- Row count: `50,000`
- Column count: `28`
- User can ask questions immediately without upload.

## 5. Upload Timeout Root Cause

The observed `signal timed out` was primarily a frontend upload request timeout / state-machine issue.

The frontend had a universal 60-second `AbortSignal.timeout` in the shared API client. Even with async upload tasks, the initial `POST /api/upload` still has to transmit the file body before the backend can return `task_id`. Large or slow CSV / XLSX uploads can exceed 60 seconds before the task polling phase begins.

Additional issue:

- The task status endpoint could expose a task that had `stage=done`, `progress=100`, and `table_name`, but still looked `running` if the final status update was stale. That could leave the UI at 100% without switching tables.

Conclusion:

- Not primarily a network-only issue.
- Not primarily a DuckDB calculation issue.
- The immediate failure mode was frontend timeout on the initial upload request plus incomplete final-state normalization.
- Large XLSX can still be slower than CSV because workbook decompression and parsing are heavier. CSV remains the preferred path for very large uploads.

## 6. Upload Fix

Implemented:

- `apiFetch` supports per-request timeout.
- `startUploadTask()` uses a 310-second timeout instead of the default 60 seconds.
- Upload status polling retries transient timeout-like polling failures instead of immediately failing the whole upload.
- Status polling has an overall timeout guard, so the UI cannot spin forever.
- Backend status lookup normalizes stale final states:
  - `running/pending + stage=done + table_name` becomes `success`.
  - `running/pending + stage=failed` becomes `failed`.
- On success, frontend switches to the returned `table_name`.
- On failure, frontend shows a clear error message instead of a false success or infinite loading.

## 7. Five Hard Question Regression Results

All five questions were run through the backend Agent API against `demo_sales_business_50k` using `provider=mock`.

Provider state for all five:

- `provider_status`: `mock`
- `is_simulated`: `true`
- `fallback_triggered`: `false`
- Expected frontend display: demo-mode / simulated-result notice, not fallback banner.

### Q1 Overall Business Health

Question summary: evaluate overall health using revenue, refund, profit, satisfaction, logistics, channel risk, and provide three priority actions.

- Duration: `1.16s`
- Result: `pass`
- Output quality: has executive summary, recommendations, risks/opportunities, evidence, and next questions.
- Recommendation schema: action / why / how / metrics / deadline / owner_hint present.
- Technical details: hidden from `business_report`.
- Summary: "整体经营具备收入规模，但退款、折扣、履约、体验和数据质量需要结合证据持续监控。"

### Q2 Most Dangerous Business Problem

Question summary: boss-oriented risk diagnosis, high / medium / low ranking, evidence and actions.

- Duration: `0.79s`
- Result: `pass`
- Output quality: risk diagnosis produced ranked risks and executable actions.
- Recommendation schema: complete.
- Technical details: hidden from `business_report`.
- Summary: "当前最需要优先处理的是 促销依赖风险: Apparel，它同时具备影响面和风险强度。"

### Q3 Looks Good But Has Hidden Risk

Question summary: find channels, regions, or categories that look good in sales but have hidden risks.

- Duration: `0.75s`
- Result: `pass`
- Output quality: explains why the object looks good, where the hidden risk is, and what to do next.
- Recommendation schema: complete.
- Technical details: hidden from `business_report`.

### Q4 Membership-Level Anti-Hallucination

Question summary: analyze refund and repurchase by membership level.

- Duration: `0.09s`
- Result: `pass`
- Anti-hallucination: passed.
- The dataset has no `membership_level` field. The response clearly says the field is missing and does not fabricate member levels.
- Alternative analysis is provided using available fields such as customer type, channel, and repurchase-related customer/order fields.
- Summary: "当前数据缺少 membership_level，不能直接完成该字段口径的分析。"

### Q5 Full Business Health Report

Question summary: full health diagnosis report with three next questions.

- Duration: `0.99s`
- Result: `pass`
- Output quality: has overall judgment, priority recommendations, human-readable evidence, and `next_questions`.
- `next_questions`: generated successfully.
- Technical details: hidden from `business_report`.

## 8. Frontend Default State Check

Verified by code path and tests:

- The workbench no longer depends only on a non-empty table list to display the default demo table.
- Session metadata can recover the active table display.
- The old default empty prompt no longer tells the user to upload first when the default table is unavailable.
- Default table metadata now supports displaying `demo_sales_business_50k`, 50,000 rows, and 28 fields.

## 9. Backend Test Results

Passed:

- `python -c "from backend.main import app; print('backend import OK')"`
- `python -m pytest tests/test_m6_manual_regression_default_table_upload_qa.py -q` -> `6 passed`
- `python -m pytest tests/test_m6_manual_fix1_upload_tasks.py -q` -> `6 passed`
- `python -m pytest tests/test_m6_manual_fix2_business_report_contract.py tests/test_m6_manual_fix3_provider_status.py tests/test_m6_manual_fix1_upload_tasks.py -q` -> `27 passed`
- `python -m pytest tests/test_m6_business_capability_pressure.py tests/test_m6_langchain_business_agent_orchestration.py -q` -> `20 passed`
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> `13 passed`
- Full backend CI: `python -m pytest tests/ -x -q --ignore=tests/ai` -> `892 passed`

## 10. Frontend Test Results

Passed:

- Node version check:
  - `.nvmrc`: not present
  - `package.json engines.node`: not set
  - local Node: `v24.15.0`
  - local npm: `11.12.1`
  - CI uses Node.js 20.
- `npm ci` -> passed
- `npx tsc --noEmit` -> passed
- `npm run test` -> `50 passed`, `1193 passed`
- `npm run build` -> passed

Build warnings:

- Existing lint warnings remain in unrelated files and one hook-dependency warning in the touched workbench component. They do not block the build.

## 11. Safety Search

Command requested by the task was executed. Because `findstr /s` follows package-file paths under `frontend-react/node_modules`, it produced dependency-name false positives such as `task-list-item`.

Broad scan also reports existing, expected matches:

- Environment variable names in `.env.example`, `backend/config.py`, and CI empty env values.
- Auth middleware/test placeholders containing `Authorization`, `Bearer`, or `API_KEY`.
- Historical report text that predates this hotfix.

No real API key, `.env`, credential value, or new private content was added by this round.

## 12. Remaining Risks

- Very large XLSX files may still feel slower than CSV because Excel parsing is inherently heavier. The upload task now avoids false failure, but later work could add finer per-stage progress if needed.
- The first default-table import still depends on `testExcel/demo_sales_business_50k.csv` being present. The backend now fails clearly if it is missing.
- Frontend timeout handling is improved, but real deployment proxies can still impose their own request limits. If deployed behind a stricter proxy, upload limits should be aligned with the 310-second client timeout.

## 13. Recommendation

Recommend renewed manual testing from `master`.

If manual testing passes after this hotfix, the next user-approved step can be creating the M6 final tag.
