# M5.5.6.2 Frontend UX + Mock Answer Polish

## 1. Goal

Polish the M5.5.6 business-user frontend and mock fallback path so the product feels like an internal data analysis tool: upload a spreadsheet, ask Agent a question, and get a readable answer.

## 2. Files Changed

- `backend/agent/langchain_single_agent.py`
- `backend/agent/pipeline_adapter.py`
- `backend/agent/tools.py`
- `tests/unit/test_agent_langchain_single_agent_polish.py`
- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `frontend-react/src/components/ui/badge.tsx`
- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/i18n/en.ts`
- frontend regression tests under `frontend-react/src/app/(shell)/__tests__/`

## 3. Mock Fallback Polish

- Mock provider now returns a business-readable answer first.
- Mock provider note is secondary and framed as demo-model guidance.
- Provider debug fields remain in technical details rather than the main answer area.
- Unavailable provider still falls back to mock in a controlled way.

## 4. Mock SQL Rules

The LangChain Single Agent deterministic mock SQL path now handles:

- even rows
- odd rows
- first 10 rows
- highest sales / revenue
- sales by region
- regional sales ranking
- highest refund rate

For "取偶数行", the generated DuckDB-compatible shape is:

```sql
SELECT *
FROM (
  SELECT *, ROW_NUMBER() OVER () AS row_num
  FROM "demo_sales"
) t
WHERE row_num % 2 = 0
LIMIT 100;
```

## 5. Float Warning Fix

Root cause:

- The readonly SQL execution path could return pandas values such as `Timestamp`, `NaT`, and `nan`.
- Agent tool serialization then failed while dumping the ToolResult to JSON mode.
- The failure was caught and reported as `execute_readonly_sql_fallback_mock: 'float' object cannot be interpreted as an integer`.

Fix:

- Normalize readonly executor output with `normalize_for_response`.
- Coerce positive float row limits to integers.
- Preserve rejection semantics for zero or negative row limits.

## 6. Frontend UX Polish

- Removed visible arrow-flow copy from user-facing pages.
- Replaced long flow copy with concise tagline:
  - zh-CN: `上传表格，直接提问，快速得到分析答案。`
  - en-US: `Upload a spreadsheet, ask a question, and get an answer.`
- Status badges now use fixed height and `nowrap`.
- Agent result technical details remain folded by default.
- Expert SQL remains an advanced folded mode with a bounded dark panel.
- Old user-facing labels such as AI Query, Natural Language Query, Agent Run, and Run Agent remain absent.

## 7. Validation

- backend import: passed (`backend import OK`)
- route smoke:
  - mock provider: 200
  - unavailable provider: 200, fallback to mock
  - empty input: 422
  - answer / sql / evidence / warnings / trace / tool_calls fields present
  - "取偶数行" generated ROW_NUMBER SQL
  - float warning no longer appears
- backend pytest: `805 passed, 31 skipped`
- frontend tests: `48 passed`, `1171 passed`
- frontend build: passed, with existing lint warnings
- browser visual check: completed on `http://127.0.0.1:3000`
- safety search: no hits
- old frontend copy search: no user-facing old copy hits

## 8. Visual Check

Checked:

- Upload Data
- Agent Analysis
- Results
- History
- Settings

Conclusion:

- Dark UI is restored and consistent.
- Green highlight is not dominant or harsh.
- Agent Analysis has no obvious card overlap, clipping, or layout break.
- Result/status badges are consistent and do not wrap vertically.
- Expert SQL is folded by default and visually contained when present.

## 9. Scope Boundary

- No M5.5.7 started.
- No tag created.
- No README change.
- No package or lockfile change.
- No real API key or secret added.
