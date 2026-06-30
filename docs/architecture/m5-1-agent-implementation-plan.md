# M5.1 Agent Implementation Plan

> Status: M5.1.0 planning lock
> Date: 2026-06-30
> Source of truth: `docs/architecture/m5-m6-agent-roadmap.md`, `docs/architecture/m5-agent-design.md`

## 1. Purpose

本文档用于锁定 M5.1 的小步实现计划，防止一次性实现 contracts、router、tools、runner、persistence、frontend 导致复杂度失控。

M5.1.0 仍然是计划阶段。本轮不创建 Agent 代码文件，不安装依赖，不修改现有前后端业务逻辑。

## 2. M5.1 Scope

M5.1 只做：

```text
Intent Router
Native Agent Contracts
Mock Tool Registry
Deterministic Mock Run Transcript
Focused backend tests
```

M5.1 不做：

```text
LangChain
LangGraph
RAG
Multi-Agent
Frontend UI
Persistence migration
Real LLM smoke
Pipeline wrapping
Docker changes
```

M5.1 的目标不是完成完整 Agent 产品形态，而是先把最小 native Agent 骨架做成可测试、可回归、可继续扩展的基础。

## 3. M5.1 File Boundary

M5.1 未来允许新增的后端文件建议：

```text
backend/agent/__init__.py
backend/agent/contracts.py
backend/agent/router.py
backend/agent/tools.py
backend/agent/mock_runner.py
```

M5.1 未来允许新增的测试文件建议：

```text
tests/unit/test_agent_contracts.py
tests/unit/test_agent_router.py
tests/unit/test_agent_tools.py
tests/unit/test_agent_mock_runner.py
```

本轮 M5.1.0 不创建这些代码文件，只记录未来边界。

M5.1 不允许修改：

```text
backend/services/
backend/routes/
frontend-react/src/
database schema
requirements.txt
pyproject.toml
package.json
Dockerfile
docker-compose.yml
```

## 4. M5.1 Micro-Step Plan

| Step | Goal | Scope | Files Allowed | Acceptance |
| --- | --- | --- | --- | --- |
| M5.1.1 | Native Contracts | 定义 Pydantic contracts | `backend/agent/contracts.py`, `tests/unit/test_agent_contracts.py` | contracts 可序列化、字段支持 M6 扩展 |
| M5.1.2 | Intent Router | 实现 deterministic intent router | `backend/agent/router.py`, `tests/unit/test_agent_router.py` | `simple_summary` / `sql_question` / `agent_analysis` / `data_preview` / `report_lookup` / `ambiguous` / `unsupported` 可分类 |
| M5.1.3 | Mock Tool Registry | 实现 mock-safe tool registry | `backend/agent/tools.py`, `tests/unit/test_agent_tools.py` | `inspect_schema` / `profile_table` / `execute_readonly_sql` mock 工具可调用 |
| M5.1.4 | Deterministic Mock Run Transcript | 最小 mock runner 串起 router + tools | `backend/agent/mock_runner.py`, `tests/unit/test_agent_mock_runner.py` | 生成 `AgentRun` / `AgentStep` / `ToolCall` transcript |
| M5.1.5 | M5.1 Regression | 回归测试和报告 | `docs/reports/` + focused tests | backend import + focused tests pass |

M5.1 不允许把 contracts、router、tools、runner 合并成一个大提交。每个 micro-step 必须独立验收。

## 5. Contracts Draft

M5.1.1 必须实现的 contracts：

```text
AgentRun
AgentStep
ToolCall
ToolResult
EvidenceRef
IntentRoute
AgentRunSummary
```

必须包含 Multi-Agent Ready 字段：

```text
agent_role
agent_name
parent_run_id
root_run_id
orchestrator_run_id
handoff_from
handoff_to
```

M5.1 只使用：

```text
agent_role = data_analyst
```

这些扩展字段只是为 M6 预留，不代表 M5 启动 Multi-Agent。

必须包含 fallback 字段：

```text
provider_requested
provider_used
is_simulated
fallback_triggered
fallback_type
fallback_reason
```

必须包含 trace / evidence 字段：

```text
trace_id
evidence_json
evidence_refs
token_usage_json
```

M5.1.1 合同验收要求：

- 所有 contract 可以构造、序列化、反序列化。
- `is_simulated` 在 mock path 中默认为 `true` 或必须显式传入。
- status / intent / selected_mode 等枚举值范围清晰。
- 不依赖真实 LLM、不依赖 LangChain、不访问数据库。

## 6. Intent Router Draft

M5.1.2 router 分类：

```text
simple_summary
sql_question
agent_analysis
data_preview
report_lookup
ambiguous
unsupported
```

输出：

```text
IntentRoute:
  intent
  confidence
  selected_mode
  route_reason
  requires_agent
  safety_flags
```

selected modes：

```text
natural_language
expert_sql
agent_run
clarification
unsupported
```

Router 原则：

```text
Not every request becomes an Agent run.
Simple request keeps existing fast path.
Ambiguous request asks clarification.
Unsupported request safe-fails before tools.
```

M5.1.2 可以先用 deterministic rules，而不是 LLM classifier。示例规则：

- 包含 quick summary / summarize / 概览 / 总结，优先 `simple_summary`。
- 包含 SQL-like 聚合、排序、过滤、top N，且目标明确，优先 `sql_question`。
- 包含 investigate / compare / explain with evidence / 分析原因 / 多步分析，优先 `agent_analysis`。
- 包含 columns / schema / row count / missing values / 字段 / 行数 / 缺失值，优先 `data_preview`。
- 包含 history / previous report / past analysis / 历史 / 详情，优先 `report_lookup`。
- 空输入、目标过短、缺少表上下文，优先 `ambiguous`。
- 写入、删除、外部系统访问、非数据分析请求，优先 `unsupported`。

## 7. Mock Tool Registry Draft

M5.1.3 第一批 mock-safe tools：

```text
inspect_schema
profile_table
execute_readonly_sql
```

不要在 M5.1.3 接：

```text
generate_sql
summarize_findings
build_report
detect_anomalies
suggest_chart
LangChain
real provider
```

这些留到后续阶段。

每个 tool 需要：

```text
name
description
input_schema
output_schema
risk_level
requires_readonly_sql
callable
mock behavior
```

Mock behavior 必须 deterministic，并且输出带 evidence：

| Tool | Mock Input | Mock Output | Guardrail |
| --- | --- | --- | --- |
| `inspect_schema` | `table_name` | fixed schema summary | table name non-empty |
| `profile_table` | `table_name` | row count, null summary, sample stats | table name non-empty |
| `execute_readonly_sql` | readonly SQL | rows, row_count, evidence refs | readonly SQL only |

## 8. Deterministic Mock Run Draft

M5.1.4 最小 mock run 目标：

```text
user_goal
  -> IntentRoute
  -> AgentRun
  -> AgentStep
  -> ToolCall
  -> ToolResult
  -> AgentRunSummary
```

要求：

```text
deterministic
no real LLM
no LangChain
no database migration
no frontend
no external network
```

最小 transcript 应包含：

- route decision
- run id / trace id
- at least one step
- at least one tool call
- tool input and output payloads
- evidence refs
- `is_simulated=true`
- final summary status

M5.1.4 不生成真实分析报告，不接现有 `ai_pipeline.py`，不修改现有 API。

## 9. Guardrails for M5.1

M5.1 最小 guardrails：

```text
empty goal guard
unsupported intent guard
tool exists guard
tool input schema guard
readonly SQL guard for execute_readonly_sql
max_steps default 5
trace_id required
is_simulated true for mock path
```

Readonly SQL guard 在 M5.1.3 / M5.1.4 中必须覆盖：

- 允许 `SELECT` / `WITH ... SELECT`。
- 拒绝写入、删除、修改、建表、删表。
- 拒绝多语句绕过。
- 输出安全失败结果，不抛出未归一化异常。

## 10. Testing Strategy

测试顺序：

```text
M5.1.1 contracts tests
M5.1.2 router tests
M5.1.3 tools tests
M5.1.4 mock runner transcript tests
M5.1.5 regression tests
```

测试要求：

- 不依赖真实 LLM。
- 不依赖 LangChain。
- 不依赖外部网络。
- 不改现有 AI pipeline 行为。
- 不破坏现有 pytest。
- focused tests 先跑，再做 backend import。

M5.1.5 regression 至少验证：

```text
python -c "from backend.main import app; print('backend import OK')"
python -m pytest tests/unit/test_agent_contracts.py tests/unit/test_agent_router.py tests/unit/test_agent_tools.py tests/unit/test_agent_mock_runner.py -q
```

如果测试文件尚未全部存在，M5.1.5 报告必须说明已完成的 focused tests 和未进入阶段的测试。

## 11. Risk Control

风险控制：

1. 不要在 M5.1 过早接入现有 `ai_pipeline.py`。
2. 不要在 M5.1 过早接入 LangChain。
3. 不要在 M5.1 过早做 UI。
4. 不要在 M5.1 把 persistence 一起塞进来。
5. 不要恢复 anomaly / chart experimental UI。
6. 不要把 mock result 混成真实 LLM result。
7. 不要让 `backend/agent/tools.py` 直接调用复杂业务流程；M5.1.3 只做 mock-safe registry。
8. 不要让 router 变成聊天分类器；M5.1.2 先做 deterministic mode router。

## 12. Acceptance for Entering M5.1.1

只有满足以下条件，才能进入 M5.1.1：

```text
M5.1.0 plan merged or approved
file boundaries clear
contracts fields reviewed
no unresolved design conflict
user explicitly approves starting M5.1.1
```

M5.1.1 的第一步只能创建 `backend/agent/contracts.py` 和对应 tests，不允许顺手创建 router、tools、runner 或依赖适配器。

