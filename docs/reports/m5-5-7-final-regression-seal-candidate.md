# M5.5.7 Final Regression / Seal Candidate

## 1. Goal

Validate M5 as a final seal candidate without adding new product features, starting M6, or creating a tag.

## 2. M5 Acceptance Chain

| Check | Result |
| --- | --- |
| Upload Excel/CSV | Passed. Upload Data remains the first business-user entry. |
| Select current table | Passed. Current table context is visible in Upload Data and Agent Analysis. |
| Ask Agent in natural language | Passed. Agent Analysis is the primary analysis entry. |
| LangChain Single Agent tools | Passed. The backend uses the LangChain Single Agent loop with `inspect_schema`, `profile_table`, `generate_sql`, `execute_readonly_sql`, `summarize_findings`, `memory_read`, and `memory_write`. |
| Provider selection and mock fallback | Passed. Mock provider works and unavailable providers fall back to mock with `fallback_reason`. |
| Readable answer, SQL, related data, warning | Passed. Agent responses include business answer, SQL, evidence/data preview, warnings, trace, and tool calls. |
| Technical details folded by default | Passed. Results keep tool calls, trace, provider debug, run id, memory details, and raw details under Technical Details. |
| Expert SQL advanced mode | Passed. Expert SQL is retained as an advanced mode, not the primary entry. |
| Frontend simplicity for non-technical users | Passed. The main navigation is Upload Data / Agent Analysis / Results / History / Settings. |
| zh-CN / en-US | Passed in browser inspection; primary navigation and page copy render correctly in the current UI shell. |

## 3. Validation Results

- backend import: passed, `backend import OK`.
- pytest: passed, `805 passed, 31 skipped`.
- frontend tests: passed, `48 files`, `1171 passed`.
- frontend build: passed. Existing lint warnings remain in pre-existing frontend files and were not expanded by this regression.
- API smoke:
  - mock provider: `200`, `provider_used=mock`, `fallback_triggered=false`.
  - unavailable provider: `200`, `provider_used=mock`, `fallback_triggered=true`, `fallback_reason=unsupported_provider`.
  - empty input: `422`.
  - response contains `answer`, `sql`, `evidence`, `warnings`, `trace`, and `tool_calls`.
  - old frontend fields remain present: `run_id`, `status`, `intent`, `provider_requested`, `provider_used`, `fallback_triggered`, and `is_simulated`.
  - even-row request (`取偶数行`) generated DuckDB-compatible `ROW_NUMBER() OVER () AS row_num` SQL with `WHERE row_num % 2 = 0`.
- browser visual check: passed on `http://127.0.0.1:3000`.
- source safety search: no real API key, secret, private-study content, or new prohibited personal content found in changed source/report scope.
- broad safety search note: the full historical repository still contains benign environment-variable names, archived `.agents` references, and legacy report language. These are pre-existing documentation matches, not committed secrets and not M5.5.7 changes.
- old user-facing copy search: no user-facing `AI Query`, `自然语言查询`, `Agent Run`, `Run Agent`, `runtime boundary`, or `milestone` copy found in frontend UI. A historical internal test title still contains "AI query"; it is not rendered UI.

## 4. Page Checks

| Page | Result |
| --- | --- |
| Upload Data | Passed. Page focuses on CSV/Excel upload, current table context, preview, and quality cues. |
| Agent Analysis | Passed. Page focuses on current table, question input, provider selection, and Start Analysis. |
| Results | Passed. Business result is primary; technical details are folded. Status badges render consistently. |
| History | Passed. History is framed as analysis records and no longer promotes old AI Analysis / Expert SQL labels. |
| Settings | Passed. Settings stays secondary and focuses on provider/mock fallback, language, and theme. |

## 5. UI Regression Notes

- Dark UI is restored and visually consistent.
- High-saturation green is not dominant; success states use small, soft badges.
- No visible naked HTML, major overlap, clipping, or card-cutting was observed in the checked pages.
- The obvious arrow-flow hero pattern is not present in the inspected UI.

## 6. Scope Boundaries Confirmed

- No new feature development was started.
- No Multi-Agent work was started.
- No LangGraph work was started.
- No complex RAG or vector memory was added.
- No new UI library was added.
- No tag was created.

## 7. Seal Candidate Recommendation

M5 is ready for M5.5.7 Merge Validation. If master validation and CI pass after merge, the next release-management step can be M5 Final Tag.
