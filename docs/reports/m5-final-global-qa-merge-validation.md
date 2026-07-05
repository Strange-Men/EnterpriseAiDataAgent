# M5 Final Global QA Regression Merge Validation

## 1. Goal

Merge `m5-final-global-qa-regression` into `master` and validate that the M1-M5 global QA regression result is stable on master before any final tag work.

## 2. Source Branch

- source branch: `m5-final-global-qa-regression`
- source commit: `59c7baf3876b6febb8e318db3a8df08cd1131c38`
- target branch: `master`

## 3. Merge Result

- merge result: passed
- conflicts: none
- M1-M5 global QA report entered master: yes
- report path: `docs/reports/m5-final-global-qa-regression.md`

## 4. Regression Scope Confirmed

- M1-M5 global QA: entered master
- Agent question set: passed in source QA and re-smoked on master
- Mock fallback: passed
- even rows SQL: passed with `ROW_NUMBER() OVER ()` and `row_num % 2 = 0`
- Memory: passed
- Provider fallback: passed
- API smoke: passed
- Frontend five pages: passed through frontend tests/build and source QA report checks

## 5. Validation Results

- backend import: passed, `backend import OK`
- pytest: passed with `PYTHONPATH=.`; `807 passed, 31 skipped`
- frontend test: passed; `48` test files, `1171` tests
- frontend build: passed with existing non-blocking lint warnings
- docker compose config: passed
- safety search: broad search produced benign dependency / environment-name / historical-doc matches only; no real key or private content found
- master CI: pending at report creation; checked after push in final validation output

## 6. Master API Smoke

Master smoke covered:

- uploaded generated CSV fixture
- `/api/agent/runs` with mock provider returned `200`
- response preserved old frontend fields: `run_id`, `status`, `intent`, `provider_requested`, `provider_used`, `fallback_triggered`, `is_simulated`
- response included `answer`, `sql`, `evidence`, `warnings`, `trace`, and `tool_calls`
- "取偶数行。" generated SQL with `ROW_NUMBER() OVER ()` and `row_num % 2 = 0`
- unavailable provider fell back to `mock` with `fallback_reason=unsupported_provider`
- memory two-turn scenario returned `memory_used=true`
- empty input returned `422`

## 7. Notes

Direct `pytest` without `PYTHONPATH=.` failed during local collection because `backend` was not on the import path for `tests/ai`. The project-standard Windows command with `PYTHONPATH=.` passed the full suite.

## 8. Recommendation

M5 Final Global QA Merge Validation is ready for user review. If master CI passes, the next recommended validation step is:

```text
Render Doubao Real Provider QA
```

No tag was created. M6 has not started.
