# M5 Final Global QA Regression

## 1. Test Scope

This regression validates the M1-M5 release candidate across data ingestion, DuckDB table handling, preview and quality signals, Agent analysis, LangChain Single Agent tool calling, mock fallback, provider fallback, memory, trace, warnings, frontend product flow, bilingual UI, local startup, and CI-equivalent commands.

Branch:

- `m5-final-global-qa-regression`

## 2. M1-M5 Functional Acceptance

- Data upload: passed through API smoke with generated public CSV and Excel fixtures.
- CSV / Excel parsing: passed; both uploads created usable backend tables.
- DuckDB table creation: passed through upload, schema, preview, and readonly SQL checks.
- Schema recognition: passed through `/api/tables/{name}/schema`.
- Data preview: passed through `/api/tables/{name}/data`.
- Data quality prompt: passed through `/api/quality/{name}`.
- Natural language analysis: passed through `/api/agent/runs`.
- LangChain Single Agent: passed.
- Tool calling: passed; response includes `tool_calls` and `trace`.
- Mock fallback: passed.
- Provider selection: passed.
- AI SQL generation: passed for targeted business questions.
- Readonly SQL execution: passed.
- Memory read/write: passed.
- Trace / warnings / tool_calls: passed.
- Expert SQL advanced mode: frontend build and page checks preserve the advanced entry.
- Analysis result display: frontend tests and build passed.
- History page: frontend tests and build passed.
- Settings page: frontend tests and build passed.
- zh-CN / en-US: frontend tests, build, and source checks passed.
- Docker / local startup: `docker compose config` passed; frontend dev server was reachable on port 3000.
- CI commands: backend pytest, frontend tests, frontend build, and changed-file ruff passed.

## 3. Agent Question Set Results

All Agent checks used a generated sales fixture with these public test fields:

- `order_id`
- `region`
- `product`
- `revenue`
- `refund_amount`
- `order_date`
- `customer_id`

Results:

- Basic preview, "这个表有多少行？有哪些字段？": passed; response includes readable answer, SQL, evidence, trace, and tool calls.
- Regional sales, "按地区统计销售额，并按销售额从高到低排序。": passed; SQL groups by region and sums revenue.
- Top N, "找出销售额最高的前 5 个商品。": passed; SQL orders by revenue descending.
- Refund risk, "哪些地区退款金额比较高？": passed after a small fix; SQL now groups by region and sums `refund_amount`.
- Even rows, "取偶数行。": passed; SQL uses `ROW_NUMBER() OVER () AS row_num` and `row_num % 2 = 0`.
- Invalid field, "用不存在的字段 abc_xyz 分析销售额。": passed after a small fix; response returns a controlled message and warning instead of meaningless fallback SQL.
- Empty input: passed; route returns `422`.
- Unavailable provider fallback: passed; response falls back to `mock` and includes `fallback_reason`.
- Memory two-turn check: passed; second turn reports `memory_used=true` and includes `memory_read` / `memory_write` tool calls.

## 4. Mock Fallback Results

Mock provider returned user-readable answers with SQL, evidence, warnings, trace, tool calls, provider metadata, fallback status, and memory metadata. Unavailable provider requests fell back to `mock` with `fallback_reason=unsupported_provider`.

## 5. Even Rows Result

The "取偶数行" scenario generated DuckDB-compatible SQL:

```sql
SELECT *
FROM (
  SELECT *, ROW_NUMBER() OVER () AS row_num
  FROM "<table>"
) t
WHERE row_num % 2 = 0
LIMIT 100;
```

This avoids the previous generic `SELECT * LIMIT 100` fallback for an explicitly supported row-selection intent.

## 6. Memory Result

The memory scenario passed:

- First turn: "按地区统计销售额。"
- Second turn: "基于刚才结果，总结最高的地区。"

The second response reported memory usage and included both memory read and write tool calls.

## 7. Provider Fallback Result

An unavailable provider request returned `200`, preserved `provider_requested`, used `provider_used=mock`, set fallback metadata, and included a fallback reason.

## 8. API Smoke Results

API smoke passed 17 checks:

- CSV upload
- Excel upload
- schema
- preview
- quality
- readonly SQL execution
- `/api/ai/status`
- `/api/status`
- Agent basic preview
- Agent regional sales
- Agent top N
- Agent refund risk
- Agent even rows
- Agent invalid field
- unavailable provider fallback
- memory two-turn scenario
- empty input validation

Uploaded test tables were cleaned up after the smoke run.

## 9. Frontend Five-Page Check

Frontend tests and build passed for the simplified M5 flow:

- Upload Data / 上传数据
- Agent Analysis / Agent 分析
- Results / 分析结果
- History / 历史
- Settings / 设置

The local dev server was already reachable on port 3000. Automated browser launch through local Playwright could not run because the browser binary is not installed in this environment, and installing new browser dependencies was out of scope. Source checks, frontend tests, and production build passed as the fallback validation layer.

After restarting a stale dev server process, HTTP checks against the current branch returned `200` for:

- `/`
- `/data`
- `/analyze`
- `/results`
- `/history`
- `/settings`

## 10. zh-CN / en-US Check

Frontend tests and source checks confirmed the product flow remains aligned with the bilingual M5 copy. The old user-facing labels `AI Query`, `自然语言查询`, `Agent Run`, `Run Agent`, `skeleton`, `runtime boundary`, `milestone`, `M5`, and `M6` were not found in `frontend-react/src`.

## 11. UIUX Check

The product flow remains centered on:

```text
Upload Data -> Agent Analysis -> Results
```

Technical details remain behind folded UI sections by default, Expert SQL remains an advanced mode, and the frontend build passed without layout-blocking errors.

## 12. pytest Result

Backend full pytest passed:

```text
807 passed, 31 skipped
```

## 13. Frontend Test Result

Frontend full test run passed:

```text
48 test files passed
1171 tests passed
```

## 14. Frontend Build Result

Frontend production build passed. Existing lint warnings remain non-blocking and were not introduced by this regression:

- `src/app/(shell)/analyze/[runId]/page.tsx`
- `history-stale-table-invalid-record.test.tsx`
- `drill-down-chain.tsx`
- `sql-history-panel.tsx`

## 15. Docker Compose Config Result

`docker compose config` passed and rendered the backend/frontend service configuration. `docker compose build` was not required for this regression round.

## 16. Safety Search Result

Broad `findstr` safety search produced benign matches from local dependency folders, environment variable names, historical docs, and test placeholders. A narrowed search excluding dependency folders and archived/historical docs found no real API key, secret, private study content, interview content, resume content, or packaging content.

## 17. Issues Found

- Refund-risk question used a generic fallback SQL instead of `refund_amount` aggregation.
- Invalid-field question with `abc_xyz` did not return a controlled missing-field message.
- Full-repo `ruff check` still reports historical/legacy issues in archived frontend docs, old tests, and `database/query_executor.py`.
- Local Playwright browser launch failed because the Chromium binary is not installed in this environment. HTTP page checks against the restarted dev server passed for the five core pages plus home.

## 18. Issues Fixed

- Added deterministic refund amount SQL generation for regional refund-risk questions.
- Added controlled handling for unknown requested fields such as `abc_xyz`.
- Added unit coverage for refund amount SQL and unknown-field controlled response.

## 19. Remaining Non-Blocking Issues

- Full-repo ruff has historical/legacy issues; changed files pass `ruff check`.
- Frontend build has existing lint warnings; build passes.
- Automated browser visual check could not run through Playwright without installing browser binaries; HTTP page checks, frontend tests, and production build passed.

## 20. Recommendation

M5 final global QA is complete with no blocking issues found after the targeted fixes above. The branch is ready for M5 Final Global QA Merge Validation. If merge validation and master CI pass, M5 can proceed to Final Tag.

M6 has not started. No tag was created in this round.
