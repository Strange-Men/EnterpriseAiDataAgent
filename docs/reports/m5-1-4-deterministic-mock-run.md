# M5.1.4 Deterministic Mock Run Transcript

> Date: 2026-06-30
> Branch: `m5-1-4-deterministic-mock-run`

## 1. Goal

Create the first deterministic Agent run transcript by connecting native contracts, intent router, and mock tool registry.

## 2. Files Changed

- `backend/agent/mock_runner.py`
- `tests/unit/test_agent_mock_runner.py`
- `docs/reports/m5-1-4-deterministic-mock-run.md`
- `CURRENT_SESSION.md`

## 3. Mock Runner Behavior

The runner is deterministic and does not call an LLM, database, network, FastAPI route, existing AI pipeline, or frontend code.

Route behavior:

- `ambiguous`: creates one `mode_routing` step, sets `status=clarification_required`, and creates no tool calls.
- `unsupported`: creates one `mode_routing` step, records safety flags, sets `status=unsupported`, and creates no tool calls.
- `data_preview`: calls `inspect_schema` and `profile_table`, then sets `status=completed`.
- `sql_question`: calls `execute_readonly_sql` with deterministic readonly SQL: `SELECT * FROM mock_sales LIMIT 3`.
- `agent_analysis`: calls `inspect_schema`, `profile_table`, and `execute_readonly_sql`, then sets `status=completed`.
- `simple_summary`: calls `inspect_schema` and `profile_table`, then sets `status=completed`.

## 4. Transcript Shape

The deterministic transcript includes:

- `AgentRun`: run metadata, route decision, provider metadata, simulated/fallback flags, steps, tool calls, and trace id.
- `AgentStep`: one routing step plus one step per executed tool.
- `ToolCall`: one normalized call per tool execution.
- `ToolResult`: returned by the mock tool registry and copied into step/call output.
- `EvidenceRef`: produced by the mock registry and stored as `evidence_json`.
- `AgentRunSummary`: generated through `build_mock_run_summary()`.

## 5. Simulated / Fallback Behavior

- `provider_requested`: caller-requested provider, default `mock`.
- `provider_used`: always `mock` in M5.1.4.
- `is_simulated`: always `true`.
- `fallback_triggered`: `true` when `provider_requested != "mock"`.
- `fallback_type`: `provider` when fallback is triggered, otherwise `none`.
- `fallback_reason`: `deterministic mock runner fallback` when fallback is triggered.

## 6. Next Integration Reminder

M5.1.4 is only a deterministic mock transcript.

It must not become an isolated mock demo.

M5.3 must connect existing AI pipeline / SQL execution / summary / report capabilities into Agent tools.

The purpose of M5.1.4 is to verify the minimum closed loop for contracts, router, tools, transcript shape, simulated marking, and focused regression tests.

## 7. Tests

- focused pytest: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py` -> 112 passed.
- contracts/router/tools tests: included in focused pytest.
- backend import: `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 671 passed, 31 skipped.
- safety search: no source/test dependency leak; report contains expected "not installed" framework names only.

## 8. What Was Not Changed

- 未实现 persistence。
- 未实现 tracing 独立模块。
- 未实现 FastAPI route。
- 未接现有 AI pipeline。
- 未接真实 DuckDB。
- 未接真实数据库。
- 未接真实 LLM。
- 未安装 LangChain / LangGraph。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未提交 `.env` 或敏感凭据。
- 未打 tag。

## 9. Next Step

等待用户审查。通过后进入：

```text
M5.1.5 M5.1 Regression
```

不要在本分支继续实现 persistence、tracing、FastAPI route、frontend UI、真实数据库接入或 M5.2 framework adapter。
