# M5.5.6 Frontend Product Flow Simplification CI Full Fix

## 1. Goal

Fix the frontend CI regression caused by M5.5.6 product-flow simplification, audit route/navigation copy, and keep the new product direction:

```text
Upload Data → Agent Analysis → Results
```

This fix does not revert the UI to the older AI Query / Natural Language Query flow.

## 2. CI Failure Root Cause

Frontend Vitest still asserted older M4/M5.5.2 product copy:

- Data / 数据
- AI Query / 自然语言查询
- Generate Analysis / 生成分析
- 自然语言分析
- 分析工作台
- older ASCII arrow flow hints
- older default data source wording

M5.5.6 intentionally changed the user-facing product flow to Upload Data / 上传数据, Agent Analysis / Agent 分析, Run Agent / 开始 Agent 分析, and Upload Data → Agent Analysis → Results.

## 3. Files Changed

Updated frontend tests:

- `frontend-react/src/app/(shell)/__tests__/analysis-workspace-regression.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/data-header-upload-guidance.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/data-page-regression.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/data-preview-quality-polish.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/data-table-list-current-table.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/final-frontend-regression.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/global-i18n-copy-consistency.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/history-header-filters.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/history-regression.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/home-navigation-clarity.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/natural-language-query-polish.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/pre-final-ui-polish.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/settings-i18n-regression.test.tsx`

Updated frontend copy:

- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/i18n/en.ts`

## 4. Product Flow Lock

Final main navigation:

- Upload Data / 上传数据
- Agent Analysis / Agent 分析
- Results / 分析结果
- History / 历史
- Settings / 设置

The sidebar currently exposes:

- Home
- Upload Data
- Agent Analysis
- History
- Settings

Home presents the simplified path:

```text
Upload Data → Agent Analysis → Results
```

History is auxiliary for review, reuse, and export. Settings is auxiliary for preferences/provider-related configuration. Expert SQL remains available as advanced mode and is not a primary sidebar entry.

## 5. Copy Updates

Canonical zh-CN copy now includes:

- 上传数据
- Agent 分析
- 分析结果
- 历史
- 设置
- 上传 CSV/Excel 文件，选择当前数据表，然后进入 Agent 分析。
- 当前表会作为 Agent 分析的默认数据源。
- 开始 Agent 分析
- 上传数据 → Agent 分析 → 查看结果

Canonical en-US copy now includes:

- Upload Data
- Agent Analysis
- Results
- History
- Settings
- Upload a CSV/Excel file, choose the current table, then start Agent Analysis.
- This table is the default data source for Agent Analysis.
- Run Agent
- Upload Data → Agent Analysis → Result

The rendered UI uses the visual arrow character for the flow hint.

## 6. Route / Navigation Audit

- Dashboard/Home highlights upload first, then Agent Analysis, then results.
- Upload Data page focuses on CSV/Excel upload, current table, and preview context.
- Data Preview is embedded inside Upload Data instead of promoted as a primary route.
- Analyze is the Agent Analysis entry.
- Expert SQL remains an advanced mode inside the analysis surface and is not in the main sidebar.
- History is for review/reuse/export and does not replace the main flow.
- Settings is auxiliary and does not compete with Upload Data or Agent Analysis.
- Reports are not a primary route in this frontend flow.

## 7. Validation

- Full frontend test: passed, `48 passed`, `1171 passed`
- Type check: passed, `npx tsc --noEmit`
- Frontend build: passed, with existing lint warnings only
- Backend import: passed, `backend import OK`
- Safety search: passed, no secrets or private-study/interview/resume content found
- Old copy search: passed with the required command; no forbidden old main-entry copy found

## 8. Visual Check

Checked with local frontend dev server at `http://127.0.0.1:3000`.

- Home showed `上传数据 → Agent 分析 → 分析结果` and the path Upload Data → Agent Analysis → Results.
- Upload Data showed CSV/Excel upload guidance, current table context, and preview context.
- History showed review/reuse/export copy and remained auxiliary.
- Settings showed preference configuration and remained auxiliary.

Browser automation timed out while loading `/analyze`, but `/analyze` returned HTTP 200 and the Agent Analysis page was covered by full frontend tests, type check, production build, and source checks.

## 9. Boundaries

- Backend was not changed.
- README files were not changed.
- `package.json` / lockfiles were not changed.
- No UI library or animation library was added.
- M5.5.6 Merge Validation has not started.
- M5.5.7 has not started.
- No tag was created.
