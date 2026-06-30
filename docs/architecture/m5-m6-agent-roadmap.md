# M5-M6 Agent Roadmap

> Status: final design lock
> App version: 1.4.1
> Release baseline: `v1.4.1-m4-engineering-complete`

## 1. Purpose

This document is the roadmap source of truth for M5 and M6 Agent development.

本文档是 M5 / M6 Agent 开发路线的唯一蓝图，后续实现不得偏离。

Its purpose is to lock the transition from the current fixed AI pipeline to an industrial Agent workflow without creating an uncontrolled rewrite.

## 2. Final Decision

```text
M5 = Single Data Analyst Agent MVP
M6 = Multi-Agent Expansion
```

M5 target:

```text
把现有 AI pipeline 升级为工具化、可审计、可持久化、可评估、可兜底的数据分析 Agent。
```

M6 target:

```text
在 M5 稳定契约之上，把单 Agent 内部职责拆分为多 Agent 协作体系。
```

Why single Agent first:

1. 当前 EAI 已有固定 AI pipeline，最适合先升级为单 Agent 工具执行器。
2. Multi-Agent 会引入额外路由、上下文传递、状态同步、错误传播、评估复杂度。
3. 工业级路线应该先把一个 Agent 做稳定，再拆分角色。
4. M5 的 contracts、persistence、trace、ToolCall、`agent_role` 字段要提前 multi-agent ready。
5. M6 再拆成 Supervisor / Planner / SQL / Validator / Report 等角色，避免 M5 返工。

## 3. EAI Agent Is Not

EAI Agent is not:

- 聊天机器人
- 装饰性 AI 功能
- RAG 问答机器人
- 一开始就多 Agent
- 绕过现有 AI pipeline 的新系统
- 无限自主执行器

## 4. M5 Single Agent Scope

M5 Agent shape:

```text
Single Data Analyst Agent
```

M5 responsibilities:

1. 识别用户意图。
2. 判断是否需要 Agent。
3. 制定 bounded plan。
4. 调用安全工具。
5. 执行只读 SQL。
6. 收集 evidence。
7. 生成报告。
8. 持久化 run / steps / tool calls。
9. 标记 fallback / simulated 状态。
10. 在前端展示 timeline / evidence / report。

M5 does not do:

- Multi-Agent collaboration
- LangGraph orchestration
- RAG business knowledge base
- enterprise database connection
- write SQL / data mutation
- long-term memory
- automatic external tool calls

## 5. M5 Industrial Workflow

M5 workflow is locked as:

```text
received_user_goal
  -> intent_classification
  -> mode_routing
  -> preflight_guardrails
  -> planning
  -> plan_validation
  -> running_step
  -> tool_input_validation
  -> tool_execution
  -> tool_output_validation
  -> evidence_collection
  -> step_evaluation
  -> summarizing
  -> report_building
  -> persistence
  -> completed

fallback branches:
  -> clarification_required
  -> unsupported
  -> partial
  -> failed
  -> cancelled
```

Every state must include:

- input contract
- output contract
- timeout
- trace span
- persistence write
- fallback behavior

## 6. M5 Mode Router

Locked intent categories:

```text
simple_summary
sql_question
agent_analysis
data_preview
report_lookup
ambiguous
unsupported
```

Locked route results:

```text
natural_language
expert_sql
agent_run
clarification
unsupported
```

Not every user request should become an Agent run.

The router exists to preserve current fast paths and prevent expensive or unsafe Agent execution for simple, ambiguous, or unsupported requests.

## 7. M5 Tool Registry

M5 first-version core tools:

```text
inspect_schema
profile_table
generate_sql
execute_readonly_sql
summarize_findings
build_report
```

Future tools:

```text
detect_anomalies
suggest_chart
multi_table_join_hint
export_report
business_metric_lookup
```

`detect_anomalies` and `suggest_chart` do not enter the M5 core tool set. They remain Future tools until Agent contracts, persistence, trace, evals, and UI are stable.

## 8. M5 Native Contracts

M5 native contracts are the source of truth. LangChain must normalize back into these contracts and must not own EAI state.

Required contracts:

```text
AgentRun
AgentStep
ToolCall
ToolResult
EvidenceRef
IntentRoute
AgentRunSummary
```

`AgentRun` field draft:

- `run_id`
- `root_run_id`
- `parent_run_id`
- `orchestrator_run_id`
- `agent_role`
- `agent_name`
- `table_name`
- `user_goal`
- `intent`
- `selected_mode`
- `provider_requested`
- `provider_used`
- `is_simulated`
- `fallback_triggered`
- `fallback_type`
- `fallback_reason`
- `status`
- `trace_id`
- `created_at`
- `updated_at`
- `error`

`AgentStep` field draft:

- `step_id`
- `run_id`
- `root_run_id`
- `agent_role`
- `agent_name`
- `step_index`
- `state`
- `tool_name`
- `handoff_from`
- `handoff_to`
- `status`
- `input_json`
- `output_json`
- `evidence_json`
- `started_at`
- `ended_at`
- `error`

`ToolCall` field draft:

- `call_id`
- `run_id`
- `step_id`
- `agent_role`
- `agent_name`
- `tool_name`
- `input_json`
- `output_json`
- `evidence_json`
- `duration_ms`
- `token_usage_json`
- `provider_used`
- `is_simulated`
- `status`
- `error`

`ToolResult` field draft:

- `tool_name`
- `status`
- `output`
- `evidence_refs`
- `duration_ms`
- `error`
- `is_simulated`

`EvidenceRef` field draft:

- `evidence_id`
- `run_id`
- `step_id`
- `tool_call_id`
- `source_type`
- `source_name`
- `summary`
- `data_ref`
- `created_at`

`IntentRoute` field draft:

- `intent`
- `confidence`
- `selected_mode`
- `route_reason`
- `requires_agent`
- `safety_flags`

`AgentRunSummary` field draft:

- `run_id`
- `status`
- `agent_role`
- `provider_used`
- `is_simulated`
- `fallback_triggered`
- `step_count`
- `tool_call_count`
- `findings_count`
- `trace_id`

M5 can use `agent_role="data_analyst"` only, but the fields must be available for M6.

## 9. M5 Persistence

Locked tables:

```text
agent_runs
agent_steps
agent_tool_calls
```

Persistence fields must support:

```text
run_id
root_run_id
parent_run_id
agent_role
agent_name
status
intent
selected_mode
provider_requested
provider_used
is_simulated
fallback_triggered
fallback_type
fallback_reason
trace_id
evidence_json
token_usage_json
created_at
updated_at
```

M5 no longer relies on localStorage as the source of truth for Agent run history.

localStorage can only store UI draft / preference state. Agent run, steps, tool calls, evidence, trace, and fallback metadata must be persisted by the backend.

## 10. M5 Guardrails

Required guardrail layers:

```text
Input Guardrail
Intent Guardrail
Tool Input Guardrail
Tool Output Guardrail
Runtime Guardrail
Final Output Guardrail
```

Locked limits:

```text
max_steps = 5
max_sql_calls = 5
max_runtime_seconds = 120
per_tool_timeout_seconds = 30
readonly SQL validation
row_limit
Pydantic schema validation
evidence required
trace_id required
is_simulated required when fallback to mock
```

## 11. M5 LangChain MVP

LangChain location:

```text
M5.2 Optional LangChain Harness MVP
```

LangChain may do:

- tool-calling harness
- structured output helper
- wrapping EAI tools

LangChain must not do:

- replace EAI `AgentRun` / `ToolCall` contracts
- bypass EAI persistence
- bypass readonly SQL guardrails
- bypass fallback simulated marking
- bind the project to LangSmith
- bind the project to LangGraph
- become the only runnable path

First LangChain tools:

```text
inspect_schema
profile_table
execute_readonly_sql
```

Acceptance:

```text
LangChain run must normalize back into EAI AgentRun / AgentStep / ToolCall.
```

## 12. M5 Frontend UX

Frontend entry:

```text
Analyze page:
- Natural Language Analysis
- Expert SQL
- Agent Run
```

Agent Run display:

```text
- detected intent
- selected mode
- plan
- current step
- tool call timeline
- SQL evidence
- findings
- final report
- fallback / simulated badge
- partial / failed state
```

History:

```text
AI Analysis / SQL / Agent Run 三类记录保持一致视觉语言。
```

Detail:

```text
Agent report 复用现有 Analysis Detail 风格，只增加 timeline / evidence section。
```

No new visual system.

Reuse M4 shell, cards, badges, History and Detail patterns.

## 13. M5 Evaluation

Test layers:

```text
contract schema tests
intent router tests
mode fallback tests
tool registry tests
readonly SQL guardrail tests
deterministic mock run tests
simulated fallback tests
persistence tests
trace/evidence tests
frontend timeline rendering tests
LangChain adapter tests
real provider smoke tests
```

Provider test order:

```text
Mock stable first.
Real LLM smoke last.
```

## 14. M5 Implementation Plan

| Stage | Goal | Scope | Files Allowed | Acceptance Criteria | What Not To Do |
| --- | --- | --- | --- | --- | --- |
| M5.1 | Intent Router + Native Agent Contracts + Mock Tool Registry | backend contracts only | future `backend/agent/contracts.py`, `router.py`, `tools.py`, focused tests | deterministic mock route and tool-call transcript | no LangChain install, no persistence migration, no frontend source |
| M5.2 | Optional LangChain Harness MVP | optional harness around 3 safe tools | future `backend/agent/langchain_adapter.py`, dependency files only after approval | LangChain run normalized into EAI contracts | no LangGraph, no contract replacement, no real provider dependency |
| M5.3 | Existing Pipeline Tool Wrapping | wrap generate_sql / execute_readonly_sql / summarize_findings | future `backend/agent/tools.py` plus thin adapters | no regression to existing analysis path | no large rewrite of `ai_pipeline.py` / `ai_analyst.py` |
| M5.4 | Agent Persistence + Trace | backend run history and transcript | future persistence/tracing modules and database migration design | `agent_runs`, `agent_steps`, `agent_tool_calls` source of truth | no localStorage-only Agent history |
| M5.5 | Frontend Agent UI | mode tabs, timeline, evidence, detail | future focused Analyze / History / Detail UI files | style-consistent Agent run UX | no new visual system |
| M5.6 | Agent Evals + Real LLM Smoke | transcript tests and provider smoke | tests and smoke docs | mock stable, real provider tested last | no provider smoke before mock path is stable |
| M5.7 | M5 Final Regression + Tag | final verification and release docs | docs, tests, version checklist | release candidate passes and tag can be created after approval | no tag before explicit approval |

## 15. M6 Multi-Agent Expansion

M6 is the first stage that may introduce Multi-Agent design.

M6 target:

```text
把 M5 的 Single Data Analyst Agent 内部职责拆分成多 Agent 协作，但复用 M5 的 contracts / persistence / trace / guardrails / UI patterns。
```

Candidate agents:

| Agent | Role | Input | Output | Tools | Guardrails | Trace Responsibility | Failure Behavior |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SupervisorAgent` / `OrchestratorAgent` | Route and coordinate role agents | user goal, run state | final decision, handoff plan | router, status reader | max handoffs, role whitelist | root run trace, handoff spans | stop as partial or clarify |
| `PlannerAgent` | Build bounded analysis plan | goal, schema summary | validated plan | planning prompt/tool | max steps, no unsafe tool request | plan span and validation result | return clarification or partial |
| `SchemaAgent` | Inspect schema and profile data | table name | schema/profile evidence | inspect_schema, profile_table | table exists, row/sample limits | schema/profile evidence refs | fail step without SQL execution |
| `SQLAgent` | Generate candidate readonly SQL | goal, schema, plan step | SQL + rationale | generate_sql | readonly intent only, SQL shape checks | SQL generation span | return no-SQL result for unsafe query |
| `ValidationAgent` | Validate SQL and tool results | SQL, result, evidence | validation decision | readonly validator, output checker | strict readonly, evidence required | validation span | reject unsafe or ungrounded output |
| `ReportAgent` | Build grounded report | findings, evidence refs | final report | summarize_findings, build_report | evidence required per finding | report span and evidence map | mark report partial |
| `BusinessMetricAgent` | Future metric glossary lookup | metric name, dataset context | metric definition / mapping | future business_metric_lookup | glossary evidence required | metric evidence refs | fallback to no mapping |

## 16. M6 Multi-Agent Workflow

Candidate workflow:

```text
User Goal
  -> SupervisorAgent
  -> Intent Router
  -> PlannerAgent
  -> SchemaAgent
  -> SQLAgent
  -> ValidationAgent
  -> ReportAgent
  -> SupervisorAgent final review
  -> Persistence / History / Detail
```

M6 must not break M5 single-agent path.

M6 should be feature-flagged.

M6 should preserve native EAI contracts.

## 17. M6 Technology Options

M6 technology choices are evaluation options, not commitments.

| Option | Use When | Risk |
| --- | --- | --- |
| Option A: Native EAI Orchestrator | Native state machine is enough for role dispatch and persistence | more custom orchestration code |
| Option B: LangChain multi-agent supervisor pattern | tool-calling and agent wrapping are enough | framework structures may leak into EAI contracts |
| Option C: LangGraph | graph state, conditional edges, checkpoint, replay become necessary | higher complexity and migration cost |

Decision standard:

```text
Use Native first if enough.
Use LangChain if tool-calling and agent wrapping is enough.
Use LangGraph only if graph state, conditional edges, checkpoint/replay become necessary.
```

Do not install LangGraph during M5.

Do not claim LangGraph is implemented.

## 18. M6 RAG / Business Knowledge Base

RAG is M6+ / Future only.

```text
BusinessMetricAgent may use a small business metric glossary later.
RAG is optional and must be evidence-based.
Do not introduce RAG before Agent run contracts and evals are stable.
```

## 19. Final Targets

M5 final target:

```text
M5 final target:
A production-style Single Data Analyst Agent MVP that supports intent routing, bounded tool execution, readonly SQL, evidence-based reporting, backend persistence, trace, mock fallback, optional LangChain harness, frontend Agent Run UI, and deterministic evals.
```

M6 final target:

```text
M6 final target:
A multi-agent data analysis workflow that decomposes the single agent into role-specific agents while preserving M5 contracts, persistence, trace, guardrails, frontend patterns, and fallback behavior.
```
