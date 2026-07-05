# M5 Render Doubao Real LLM Agent QA Merge Validation

## 1. Goal

Merge the Render Doubao Real LLM Agent QA branch into master and validate that the real-provider metadata, speed, and controlled-output fixes are ready for deployment.

## 2. Source Branch

- source branch: `m5-render-doubao-real-llm-agent-qa`
- target branch: `master`
- branch commits merged:
  - `308d980a99d60fe3833f0a2310b646665ac6eac1`
  - `b248b3f`

## 3. Merge Result

- merge command: `git merge --no-ff m5-render-doubao-real-llm-agent-qa -m "test: merge Render Doubao real LLM agent QA"`
- merge status: passed
- conflicts: none

## 4. Fixes Confirmed In Master

- provider metadata propagation fix entered master
- successful tool-level real-provider metadata can override the initial mock fallback marker
- final AgentRun can preserve `provider_used=doubao` and `fallback_triggered=false`
- schema-aware SQL fast paths entered master
- run-scope profile cache entered master
- SQL result evidence passed to summarization is capped at 20 rows
- execute preview row limit is capped at 20 rows
- invalid / non-executable SQL execution is now controlled and returns warnings instead of route-level 500
- trace now records `sql_fast_path` and `llm_calls`

## 5. Real Doubao QA Summary

Render pre-merge proof:

- `/api/status`: passed
- `/api/ai/status`: passed
- `/api/ai/insights` with `llm_provider=doubao`: returned `provider_used=doubao`, `fallback_triggered=false`

Pre-fix Render Agent baseline:

- average response time: `24.760s`
- slowest response time: `32.052s`
- a later pre-deploy regional-sales Agent call returned `500` after `39.697s`

Post-fix local true-provider validation:

- representative regional sales smoke: `200`, `19.373s`, `provider_used=doubao`, `fallback_triggered=false`, `sql_fast_path=true`, `llm_calls=1`
- row count / fields smoke: `200`, `21.079s`, `provider_used=doubao`, `fallback_triggered=false`, `sql_fast_path=true`, `llm_calls=1`
- 10-call light stress: `10/10` success, `0` fallback, `0` 500, `0` empty answers
- optimized stress average: `17.054s`
- optimized stress slowest: `22.320s`

Note: Render must deploy the merged master before online `/api/agent/runs` can show the fixed metadata and speed behavior.

## 6. Output Quality

Validated output behavior:

- answer is readable for ordinary users
- SQL is present and grounded
- evidence / result preview is present
- warnings are controlled
- trace and tool_calls remain available for folded technical details
- common deterministic questions avoid generic `SELECT * LIMIT 100`
- even-row SQL uses `ROW_NUMBER() OVER ()` and `row_num % 2 = 0`
- bad provider fallback remains readable and controlled

## 7. Validation Results

- backend import: passed, `backend import OK`
- pytest: passed, `811 passed, 31 skipped`
- frontend tests: passed, `1171 passed`
- frontend build: passed with existing lint warnings
- changed-file ruff: passed before merge
- safety search: broad search has benign historical docs / dependency / environment-variable-name matches; changed M5 Render QA scope contains no real key, token, `.env`, or private content
- master CI: passed, GitHub Actions run `28746312758`
- post-push Render re-smoke: passed after Render picked up merged master

## 8. Post-Push Render Re-Smoke

After master push and CI success, Render was re-smoked with the deployed backend.

Regional sales:

- HTTP status: `200`
- elapsed: `22.547s`
- `provider_requested=doubao`
- `provider_used=doubao`
- `fallback_triggered=false`
- `fallback_reason=null`
- `trace.sql_fast_path=true`
- `trace.llm_calls=1`
- SQL used `customer_region`, `SUM(sales_amount)`, `GROUP BY`, and `ORDER BY`

Even rows:

- HTTP status: `200`
- elapsed: `19.845s`
- `provider_used=doubao`
- `fallback_triggered=false`
- `trace.sql_fast_path=true`
- `trace.llm_calls=1`
- SQL used `ROW_NUMBER()` and `row_num % 2 = 0`

Invalid field:

- HTTP status: `200`
- elapsed: `16.597s`
- `provider_used=doubao`
- `fallback_triggered=false`
- warnings count: `1`
- SQL contained controlled `abc_xyz` missing-field handling
- no 500

## 9. Remaining Non-Blocking Issues

- Doubao latency remains variable; optimized local stress average met the 15-20s target, but one scenario outlier was observed during scenario testing.
- `/api/ai/status` still reports default provider status, not per-provider Doubao readiness.

## 10. Recommendation

Master CI and the short post-deploy Render Agent route re-smoke both passed.

M5 can proceed to Final Tag after user review.

M6 has not started. No tag was created.
