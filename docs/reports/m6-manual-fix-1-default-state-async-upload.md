# M6 Manual Fix 1 Default State And Async Upload

> Date: 2026-07-07
> Stage: M6 Manual Fix 1

## 1. Stage

This round implements Manual Fix 1 from `docs/reports/m6-manual-fix-plan.md`: default state, async upload, and session table state.

It first merged `origin/m6-manual-fix-plan-docs` into `master`, pushed `master`, and then created the implementation branch `m6-manual-fix-1-default-state-async-upload`.

## 2. Scope Control

Completed in this round:

- Dark-only frontend behavior.
- Default table preference for `demo_sales_business_50k`.
- Clean first-load workbench state without automatically showing old answers.
- User-opened history drawer behavior.
- Async upload task API and frontend polling.
- Session `current_table` update after upload success.
- Backend clear session endpoint and frontend reset session integration.

Not started:

- Manual Fix 2: business report contract, recommendation validator, and report reorder.
- Manual Fix 3: provider transparency and next-question click-to-fill interaction.
- M6.9.
- Tag creation.

## 3. Changed Files

Backend:

- `backend/routes/upload.py`
- `backend/routes/session.py`
- `backend/services/upload_tasks.py`
- `backend/services/session_state.py`
- `backend/services/data_service.py`
- `backend/main.py`

Frontend:

- `frontend-react/src/app/layout.tsx`
- `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx`
- `frontend-react/src/hooks/use-theme.ts`
- `frontend-react/src/services/api/data.ts`
- `frontend-react/src/services/api.ts`
- `frontend-react/src/stores/astryx-workbench-store.ts`
- `frontend-react/src/types/index.ts`
- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/i18n/en.ts`

Tests:

- `tests/test_m6_manual_fix1_upload_tasks.py`
- `tests/test_upload_quality_routes.py`
- `tests/test_error_sanitization.py`
- `tests/test_m4_7_2_table_boundary.py`
- `frontend-react/src/components/astryx/__tests__/manual-fix1-workbench.test.tsx`
- `frontend-react/src/services/__tests__/api.test.ts`

## 4. Dark-only Fix

The frontend now forces `data-theme="dark"` on startup and ignores old `workspace-theme` localStorage values that previously could restore light mode.

The Astryx workbench settings drawer no longer exposes a light/dark toggle. The remaining theme store methods keep compatibility for callers but always resolve to dark.

## 5. Default Table Fix

The application default table is now:

- `demo_sales_business_50k`

Backend session state returns this as `app_default_table`. If the table does not exist in the current DuckDB database, the backend loads it from:

- `testExcel/demo_sales_business_50k.csv`

The frontend load order is:

1. Read backend session `current_table`.
2. Use that table if it exists.
3. Fall back to `demo_sales_business_50k`.
4. Fall back to the first available table only if the default is unavailable.

## 6. Clean Homepage State

The workbench no longer restores the latest persisted analysis record into the main answer area on page load.

History records remain available, but the main result area stays empty until the user runs a new analysis or explicitly selects a record from the History drawer.

## 7. Async Upload Task API

Actual route paths:

```text
POST /api/upload
GET /api/tasks/{task_id}/status
```

`POST /api/upload` now returns immediately with:

```json
{
  "task_id": "...",
  "status": "pending",
  "progress": 0,
  "stage": "uploading"
}
```

`GET /api/tasks/{task_id}/status` returns:

```json
{
  "task_id": "...",
  "status": "pending | running | success | failed",
  "progress": 0,
  "stage": "uploading | parsing | loading | profiling | done | failed",
  "table_name": "...",
  "error_message": "..."
}
```

## 8. Task Status Storage

Task state is stored in the existing DuckDB database through an internal table:

- `__eai_upload_tasks`

This reuses the current database access layer instead of adding a separate SQLite file. Internal `__eai_*` tables are filtered out by `backend/services/data_service.py` so they do not appear in user table lists.

## 9. Timeout Fallback

The status endpoint applies the 300-second running timeout rule:

```text
if status == running and now - started_at > 300 seconds:
    status = failed
    error_message = "文件处理超时，请重试或改用 CSV 格式上传。"
```

This prevents the frontend from spinning forever if an upload task becomes stale.

## 10. app_default_table / user_active_table

Definitions:

- `app_default_table = demo_sales_business_50k`
- `user_active_table = backend session current_table`

Upload success writes `current_table` to the backend session state. Browser refresh then restores that uploaded table instead of returning to the default demo table.

## 11. Reset Session

New backend route:

```text
POST /api/session/clear
```

It clears:

- route-level Agent memory store
- backend session `current_table`

It returns:

```json
{
  "ok": true,
  "current_table": "demo_sales_business_50k"
}
```

The frontend reset button in Settings calls this backend route, clears the current main result, clears local question state, hides the History drawer, and reloads the default business demo table.

## 12. Frontend Upload Polling UI

The upload panel now shows:

- Uploading
- Parsing
- Loading into database
- Building data profile
- Upload complete
- Upload failed

The frontend polls task status every 2 seconds until success or failure. Failed tasks show the backend `error_message` instead of leaving the user with an ambiguous timeout.

## 13. Verification

Backend:

- `python -c "from backend.main import app; print('backend import OK')"` -> passed.
- `python -m pytest tests/test_m6_manual_fix1_upload_tasks.py -q` -> `6 passed`.
- `python -m pytest tests/test_m6_business_capability_pressure.py -q` -> `7 passed`.
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> `13 passed`.
- `python -m pytest tests/test_m6_business_analysis_tools.py -q` -> `17 passed`.
- `python -m pytest tests/test_m6_business_semantic_layer.py -q` -> `9 passed`.
- `python -m pytest tests/test_m6_demo_business_dataset.py -q` -> `2 passed`.
- `python -m pytest tests/ -x -q --ignore=tests/ai` -> `865 passed`.

Frontend:

- `npm ci` -> passed.
- `npx tsc --noEmit` -> passed.
- `npm run test` -> `50 files passed`, `1183 tests passed`.
- `npm run build` -> passed.

Build warnings remain existing unrelated warnings in history/drill-down/sql-history files. No new `use-theme.ts` warning remains after the fix.

## 14. CI Workflow

Checked `.github/workflows/ci.yml`.

No workflow change was required because CI already runs:

- backend import check
- `python -m pytest tests/ -x -q --ignore=tests/ai`
- frontend `npm ci`
- frontend `npx tsc --noEmit`
- frontend `npm run test`
- frontend `npm run build`

The new backend and frontend tests are covered by automatic test discovery.

## 15. Node Version

No `frontend-react/.nvmrc` exists and `frontend-react/package.json` does not declare `engines.node`.

The effective project CI Node version remains Node.js 20 from `.github/workflows/ci.yml`.

## 16. Safety Search

Safety search was run before commit across backend, frontend source, tests, docs, workflow, status docs and dependency manifests.

Result:

- No real API keys were found.
- No `.env` file was committed.
- No new private learning, interview, resume, or packaging content was added by Manual Fix 1.
- Expected matches such as `API_KEY`, `DOUBAO_API_KEY`, `Authorization`, and `Bearer` appear as configuration field names, env examples, auth middleware code, CI empty values, or test placeholders, not as real secrets.
- The broader docs scan still reports pre-existing historical project-report wording around interview/resume/packaging and existing dependency names such as `task-list-item`; these are not Manual Fix 1 additions and are not committed secrets.

## 17. Remaining Risks

- The async upload background task currently runs in the FastAPI background task mechanism; multi-worker production behavior may need a durable worker queue later if deployment scales beyond the current local-first design.
- The default demo table is loaded on first session lookup, which may add a short first-load cost in a fresh DuckDB database.
- Manual browser verification is still useful for the 50k XLSX upload path because local tests use small fixtures for speed.

## 18. Recommendation

Manual Fix 1 is ready for user manual testing from `master` after merge.

The next recommended stage is Manual Fix 2: business report output contract, recommendation validator, and report reorder.
