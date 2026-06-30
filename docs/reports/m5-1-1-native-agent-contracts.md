# M5.1.1 Native Agent Contracts

> Date: 2026-06-30
> Branch: `m5-1-1-native-agent-contracts`

## 1. Goal

Implement native EAI Agent contracts before router, tools, runner, persistence, frontend, or optional Agent framework integration.

## 2. Files Changed

- `backend/agent/__init__.py`
- `backend/agent/contracts.py`
- `tests/unit/test_agent_contracts.py`
- `docs/reports/m5-1-1-native-agent-contracts.md`
- `CURRENT_SESSION.md`

## 3. Contracts Added

- `AgentRun`
- `AgentStep`
- `ToolCall`
- `ToolResult`
- `EvidenceRef`
- `IntentRoute`
- `AgentRunSummary`

Enums added:

- `AgentRole`
- `AgentStatus`
- `AgentStepState`
- `ToolCallStatus`
- `ToolResultStatus`
- `IntentCategory`
- `SelectedMode`
- `FallbackType`
- `RiskLevel`

## 4. Multi-Agent Ready Fields

- `agent_role`
- `agent_name`
- `parent_run_id`
- `root_run_id`
- `orchestrator_run_id`
- `handoff_from`
- `handoff_to`

M5.1.1 only uses `agent_role=data_analyst` by default. These fields reserve the M6 expansion path.

## 5. Fallback / Simulated Fields

- `provider_requested`
- `provider_used`
- `is_simulated`
- `fallback_triggered`
- `fallback_type`
- `fallback_reason`

The default local contract path is mock-aware and keeps `is_simulated=true` unless a later stage explicitly sets real provider metadata.

## 6. Trace / Evidence Fields

- `trace_id`
- `evidence_json`
- `evidence_refs`
- `token_usage_json`

`AgentRun.to_summary()` returns an `AgentRunSummary` without introducing runner behavior.

## 7. Tests

- focused pytest: `pytest tests/unit/test_agent_contracts.py` -> 46 passed.
- backend import: `backend import OK`.
- full pytest: `$env:PYTHONPATH=(Get-Location).Path; pytest` -> 605 passed, 31 skipped.
- safety search: no matches.

## 8. What Was Not Changed

- 未实现 router。
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
M5.1.2 Intent Router
```

不要在本分支继续实现 router、tools、runner、persistence 或 frontend UI。
