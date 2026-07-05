# M5.5.7 Final Regression Merge Validation

## 1. Goal

Merge `m5-5-7-final-regression-seal-candidate` into `master` and validate that M5 is ready for final tag after master CI passes.

## 2. Source Branch

- source branch: `m5-5-7-final-regression-seal-candidate`
- source commit: `d4a16252161b01f5cb3fb28046ea21380c99da53`
- target branch: `master`
- merge conflict: none

## 3. Merge Result

- merge command: `git merge --no-ff m5-5-7-final-regression-seal-candidate -m "chore: merge M5 final regression seal candidate"`
- merge result: passed
- final regression report entered master: `docs/reports/m5-5-7-final-regression-seal-candidate.md`

## 4. M5 Main Chain

The M5 main chain remains complete on `master`:

```text
Upload Excel/CSV -> current table -> Agent natural-language analysis -> LangChain tools -> answer / SQL / evidence / warnings / trace
```

Validated capabilities:

- Upload Data / current table context remains the first step.
- Agent Analysis remains the main analysis entry.
- LangChain Single Agent backend loop is available.
- Tools remain registered: `inspect_schema`, `profile_table`, `generate_sql`, `execute_readonly_sql`, `summarize_findings`, `memory_read`, `memory_write`.
- Mock provider works without external credentials.
- Unavailable provider falls back to mock with `fallback_reason=unsupported_provider`.
- `取偶数行` generates DuckDB-compatible even-row SQL using `ROW_NUMBER() OVER () AS row_num` and `WHERE row_num % 2 = 0`.
- Agent response keeps old frontend fields while adding answer / SQL / evidence / warnings / trace / tool calls.

## 5. Frontend Validation

- five-page flow: Upload Data / Agent Analysis / Results / History / Settings checked by frontend tests, build, and content checks.
- dark UI: validated by M5.5.7 final regression visual check and unchanged by this docs-only merge validation commit.
- technical details: default folded copy remains present in zh-CN / en-US.
- Expert SQL: remains an advanced mode inside Agent Analysis.
- zh-CN / en-US: primary navigation and Agent/Results copy remain present in both locale files.
- old user-facing copy search: no frontend UI matches for `AI Query`, `自然语言查询`, `Agent Run`, `Run Agent`, `runtime boundary`, or `milestone`.

## 6. Validation Results

- backend import: passed, `backend import OK`.
- pytest: passed, `805 passed, 31 skipped`.
- frontend tests: passed, `48 passed`, `1171 passed`.
- frontend build: passed. Existing lint warnings remain in pre-existing frontend files and were not expanded by this merge validation.
- API smoke:
  - mock provider: `200`, `provider_used=mock`, `fallback_triggered=false`.
  - unavailable provider: `200`, `provider_used=mock`, `fallback_triggered=true`, `fallback_reason=unsupported_provider`.
  - empty input: `422`.
  - response fields present: `answer`, `sql`, `evidence`, `warnings`, `trace`, `tool_calls`.
  - even-row SQL: passed.
- safety search:
  - broad `findstr` found expected local dependency README and historical documentation matches.
  - narrowed source review found no real committed API key, secret value, `.env`, private study content, or new prohibited personal content.
- master CI: pending at report creation; to be updated by GitHub Actions after push.

## 7. Scope Boundaries

- M6 has not started.
- No tag was created.
- No new feature work was added in merge validation.
- No frontend behavior was changed in merge validation.
- No backend behavior was changed in merge validation.

## 8. Recommendation

After user review and passing master CI, proceed to:

```text
M5 Final Tag
```

Do not start M6 before the final tag step is complete.
