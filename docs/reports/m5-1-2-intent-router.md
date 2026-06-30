# M5.1.2 Intent Router

> Date: 2026-06-30
> Branch: `m5-1-2-intent-router`

## 1. Goal

Implement a deterministic intent router before tools, runner, persistence, frontend, or optional Agent framework integration.

## 2. Files Changed

- `backend/agent/router.py`
- `tests/unit/test_agent_router.py`
- `docs/reports/m5-1-2-intent-router.md`
- `CURRENT_SESSION.md`

## 3. Intent Categories

- `simple_summary`
- `sql_question`
- `agent_analysis`
- `data_preview`
- `report_lookup`
- `ambiguous`
- `unsupported`

## 4. Selected Modes

- `natural_language`
- `expert_sql`
- `agent_run`
- `clarification`
- `unsupported`

## 5. Routing Priority

```text
unsupported -> ambiguous -> report_lookup -> data_preview -> sql_question -> agent_analysis -> simple_summary -> fallback ambiguous
```

## 6. Safety Behavior

Unsupported and unsafe requests are blocked before Agent execution.

The router is deterministic and does not call an LLM, database, network, current AI pipeline, tools, runner, or persistence layer.

## 7. Tests

- focused pytest: `pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py` -> 73 passed.
- contract tests: included in focused pytest -> 46 passed.
- backend import: `backend import OK`.
- full pytest: `$env:PYTHONPATH="."; pytest` -> 632 passed, 31 skipped.
- safety search: no matches.

## 8. What Was Not Changed

- 未实现 tools。
- 未实现 runner。
- 未实现 persistence。
- 未接现有 AI pipeline。
- 未安装 optional Agent framework / graph framework。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未提交 `.env` 或敏感凭据。
- 未打 tag。

## 9. Next Step

等待用户审查。通过后进入：

```text
M5.1.3 Mock Tool Registry
```

不要在本分支继续实现 tools、runner、persistence、tracing、FastAPI route 或 frontend UI。
