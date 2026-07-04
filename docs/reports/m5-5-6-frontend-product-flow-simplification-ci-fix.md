# M5.5.6 Frontend Product Flow Simplification CI Fix

## 1. Goal

Fix frontend regression tests after M5.5.6 simplified the product flow from feature-stacked pages into:

```text
Upload Data -> Agent Analysis -> Result
```

This fix keeps the M5.5.6 product direction and does not restore the old AI Query / natural language query primary entry.

## 2. CI Failure Cause

Frontend CI failed because two regression test files still asserted older copy:

- Data / 数据
- AI Query / 自然语言查询
- Generate Analysis / 生成分析

M5.5.6 intentionally changed the main flow to:

- Upload Data / 上传数据
- Agent Analysis
- Run Agent
- Upload Data -> Agent Analysis -> Result

## 3. Files Changed

- `frontend-react/src/app/(shell)/__tests__/data-header-upload-guidance.test.tsx`
- `frontend-react/src/app/(shell)/__tests__/analysis-workspace-regression.test.tsx`
- `frontend-react/src/i18n/en.ts`
- `frontend-react/src/i18n/zh.ts`
- `docs/reports/m5-5-6-frontend-product-flow-simplification-ci-fix.md`
- `CURRENT_SESSION.md`

## 4. Test Assertion Updates

- Data page title assertions now expect Upload Data / 上传数据.
- Analyze workspace tab assertions now expect Agent Analysis.
- Agent entry title assertions now expect Agent Analysis.
- Primary action assertions now expect Run Agent.
- Upload flow assertions now expect Upload Data -> Agent Analysis -> Result semantics.

## 5. CSV/Excel Copy

The English and Chinese upload/data copy now uses the exact string `CSV/Excel` where the upload entry is introduced.

This keeps the user-facing product path clearer and avoids ambiguity between CSV and Excel wording.

## 6. Product Direction Preserved

- Upload Data remains the first step.
- Agent Analysis remains the primary analysis entry.
- Run Agent remains the primary action.
- Expert SQL remains available as the advanced path.
- The old AI Query / 自然语言查询 product entry was not restored.

## 7. Validation

- targeted frontend tests: passed, `2 passed`, `106 passed`
- frontend build: passed with existing lint warnings
- backend import: passed, `backend import OK`
- safety search: passed, no matching sensitive/private terms

## 8. Visual Check

- Dashboard was opened in the browser and showed Upload Data -> Agent -> Answer as the main path.
- Data / Upload page was opened in the browser and showed Upload Data, CSV/Excel upload guidance, current table context, and Agent Analysis next step.
- `/analyze` returned HTTP 200 locally. Browser automation timed out while navigating to that route, so the Analyze page was additionally verified through build, targeted tests, and source checks.

## 9. Boundaries

- backend was not modified
- README files were not modified
- package files / lockfiles were not modified
- no UI library was added
- M5.5.6 Merge Validation was not started
- no tag was created
