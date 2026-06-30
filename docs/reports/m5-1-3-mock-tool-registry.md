# M5.1.3 Mock Tool Registry

> Date: 2026-06-30
> Branch: `m5-1-3-mock-tool-registry`

## 1. Goal

Implement a deterministic mock-safe tool registry before runner, persistence, pipeline wrapping, frontend, or LangChain.

## 2. Files Changed

- `backend/agent/tools.py`
- `tests/unit/test_agent_tools.py`
- `docs/reports/m5-1-3-mock-tool-registry.md`
- `CURRENT_SESSION.md`

## 3. Tools Added

- `inspect_schema`
- `profile_table`
- `execute_readonly_sql`

## 4. Future Tools Not Added

- `generate_sql`
- `summarize_findings`
- `build_report`
- `detect_anomalies`
- `suggest_chart`
- `business_metric_lookup`

## 5. Readonly SQL Guardrail

Allowed:

- `SELECT`
- `WITH ... SELECT`

Rejected:

- empty SQL
- non-readonly statements
- multiple statements
- dangerous keywords including `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`, `TRUNCATE`, `MERGE`, `REPLACE`, `ATTACH`, `DETACH`, `COPY`, and `PRAGMA`
- obvious dangerous keywords hidden in SQL comments

This is the minimal M5.1.3 guardrail. M5.3 can reuse or harden it when existing pipeline tools are wrapped.

## 6. Mock Behavior

All tool results are deterministic and `is_simulated=true`.

- `inspect_schema` returns provided columns or the sample schema: `date`, `channel`, `revenue`, `orders`.
- `profile_table` returns deterministic row count, column count, missing-value summary, and numeric columns.
- `execute_readonly_sql` validates readonly SQL and returns deterministic sample rows without touching DuckDB or any real database.

## 7. Tests

- focused pytest: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py` -> 102 passed.
- contracts/router tests: included in focused pytest.
- backend import: `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 661 passed, 31 skipped.
- safety search: no source/test dependency leak; report contains expected "not installed" framework names only.

## 8. What Was Not Changed

- 未实现 runner。
- 未实现 persistence。
- 未实现 tracing。
- 未实现 FastAPI route。
- 未接现有 AI pipeline。
- 未接真实 DuckDB。
- 未接 provider / LLM。
- 未安装 LangChain / LangGraph。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未提交 `.env` 或敏感凭据。
- 未打 tag。

## 9. Next Step

等待用户审查。通过后进入：

```text
M5.1.4 Deterministic Mock Run Transcript
```

不要在本分支继续实现 runner、persistence、tracing、FastAPI route、frontend UI 或真实数据库接入。
