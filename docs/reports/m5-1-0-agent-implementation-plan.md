# M5.1.0 Agent Implementation Plan

> Date: 2026-06-30
> Branch: `m5-1-0-agent-implementation-plan`

## 1. Goal

Lock the implementation plan for M5.1 before writing Agent code.

M5.1.0 is a planning checkpoint. It defines scope, file boundaries, test boundaries, and acceptance criteria for M5.1.1 through M5.1.5.

## 2. Source of Truth

- `docs/architecture/m5-m6-agent-roadmap.md`
- `docs/architecture/m5-agent-design.md`
- `docs/reports/m5-0-agent-design-merge-validation.md`

Confirmed roadmap:

- M5.1: Intent Router + Native Agent Contracts + Mock Tool Registry
- M5.2: Optional LangChain Harness MVP
- M5.6: Real LLM smoke
- M6: Multi-Agent Expansion

## 3. M5.1 Scope

M5.1 includes:

- Native Agent contracts
- Deterministic intent router
- Mock-safe tool registry
- Deterministic mock run transcript
- Focused backend tests

M5.1 excludes:

- LangChain
- LangGraph
- RAG
- Multi-Agent
- Frontend UI
- Persistence migration
- Real LLM smoke
- Existing pipeline wrapping
- Docker or dependency changes

## 4. Micro-Step Plan

| Step | Goal | Acceptance |
| --- | --- | --- |
| M5.1.1 | Native Contracts | contracts serialize, validate, and preserve M6-ready fields |
| M5.1.2 | Intent Router | all seven intent categories route deterministically |
| M5.1.3 | Mock Tool Registry | three mock-safe tools can be listed, validated, and called |
| M5.1.4 | Deterministic Mock Run Transcript | mock runner emits `AgentRun` / `AgentStep` / `ToolCall` transcript |
| M5.1.5 | M5.1 Regression | backend import and focused tests pass; report is written |

M5.1 must not combine contracts, router, tools, and runner into one large commit.

## 5. File Boundary

Future M5.1 backend files:

```text
backend/agent/__init__.py
backend/agent/contracts.py
backend/agent/router.py
backend/agent/tools.py
backend/agent/mock_runner.py
```

Future M5.1 test files:

```text
tests/unit/test_agent_contracts.py
tests/unit/test_agent_router.py
tests/unit/test_agent_tools.py
tests/unit/test_agent_mock_runner.py
```

M5.1.0 did not create these files.

## 6. Contract Boundary

M5.1.1 contracts:

```text
AgentRun
AgentStep
ToolCall
ToolResult
EvidenceRef
IntentRoute
AgentRunSummary
```

Required field groups:

- Multi-Agent ready fields: `agent_role`, `agent_name`, `parent_run_id`, `root_run_id`, `orchestrator_run_id`, `handoff_from`, `handoff_to`
- fallback fields: `provider_requested`, `provider_used`, `is_simulated`, `fallback_triggered`, `fallback_type`, `fallback_reason`
- trace/evidence fields: `trace_id`, `evidence_json`, `evidence_refs`, `token_usage_json`

M5.1 uses only `agent_role=data_analyst`; M6 expansion remains future work.

## 7. Router Boundary

Intent categories:

```text
simple_summary
sql_question
agent_analysis
data_preview
report_lookup
ambiguous
unsupported
```

Selected modes:

```text
natural_language
expert_sql
agent_run
clarification
unsupported
```

Router rules:

- Not every user request becomes an Agent run.
- Simple requests stay on existing fast paths.
- Ambiguous requests ask clarification.
- Unsupported requests stop before tool execution.

## 8. Tool Boundary

M5.1.3 mock-safe tools:

```text
inspect_schema
profile_table
execute_readonly_sql
```

Excluded from M5.1.3:

```text
generate_sql
summarize_findings
build_report
detect_anomalies
suggest_chart
LangChain
real provider
```

Each tool needs metadata, typed input/output schema, risk level, readonly requirement, callable binding, deterministic mock behavior, and evidence output.

## 9. Testing Boundary

M5.1 testing sequence:

```text
contracts tests
router tests
tools tests
mock runner transcript tests
regression tests
```

Testing constraints:

- no real LLM dependency
- no LangChain dependency
- no external network dependency
- no frontend UI dependency
- no database migration dependency
- no change to existing AI pipeline behavior

## 10. What Was Not Changed

- 未实现 Agent 代码。
- 未创建 `backend/agent` 代码文件。
- 未安装 LangChain / LangGraph。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未修改数据库结构。
- 未提交 `.env` 或敏感凭据。
- 未打 tag。
- 未开始 M5.1.1。

## 11. Validation

- backend import: `backend import OK`
- safety search: no matches
- git status: only M5.1.0 docs and `CURRENT_SESSION.md` changed

## 12. Next Step

等待用户审查。通过后进入：

```text
M5.1.1 Native Contracts
```

M5.1.1 只能创建 native contracts 和对应 tests，不允许顺手实现 router、tools、runner、LangChain adapter、persistence 或 frontend UI。
