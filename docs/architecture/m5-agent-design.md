# M5 Single Data Analyst Agent Design

> Status: M5.0 design review hotfix
> Date: 2026-06-29
> App version: 1.4.1
> Release tag: `v1.4.1-m4-engineering-complete`

## 1. Why EAI Needs an Agent

EAI 不需要为了“有 Agent”而加 Agent。当前项目已经有固定 AI pipeline：用户提出问题后，系统可以规划、生成 SQL、执行只读查询、解释结果、生成报告。它已经支撑 Natural Language Analysis、Expert SQL、History 和 Analysis Detail。

M5 的问题不是“再加一个聊天入口”，而是当前 pipeline 作为工程化执行系统仍有瓶颈：

- 工具选择隐含在代码里，没有一等 Tool Registry。
- Trace 主要记录 LLM call，不是完整 tool-call transcript。
- Analysis run 主要靠前端 localStorage，不能作为后端一等审计对象。
- `ai_pipeline.py` 和 `ai_analyst.py` 已经很大，继续堆流程会扩大技术债。
- Mock fallback 已存在，但 Agent 语境下必须显式标记 simulated，不能伪装成真实 provider 洞察。
- History / Detail 能看结果，但不能稳定回放“执行了哪些工具、依据是什么、哪里失败或降级”。

因此，M5 Agent 的真实价值是把现有固定 workflow 升级为可控、可审计、可持久化的数据分析执行器。

## 2. Agent Role in EAI

Agent is a tool-based, auditable, persistent data analysis executor.

It is not:

- chatbot
- RAG bot
- multi-agent system
- decorative AI feature

边界关系：

| Existing Feature | Agent Relationship |
| --- | --- |
| Natural Language Analysis | 继续保留；Agent 是更可审计的 run 模式，不替代现有入口。 |
| Expert SQL | 继续由用户直接控制；Agent 只执行通过 readonly validation 的 SQL tool call。 |
| History | 从前端 localStorage 结果列表升级为后端 Agent run 一等记录。 |
| Detail | 从最终报告展示升级为 report + timeline + evidence + trace。 |
| Mock fallback / multi-provider | Agent 统一记录 `provider_requested`、`provider_used`、`is_simulated`。 |

## 3. Agent Job in EAI

The EAI Agent is not added for branding. It exists because the current pipeline is fixed and hard to inspect as a tool-execution process.

The Agent should:

1. Turn a user goal into a bounded analysis plan.
2. Select from a small set of safe data-analysis tools.
3. Validate every tool input and output.
4. Execute only readonly SQL.
5. Attach evidence to every finding.
6. Persist the full run, steps, and tool calls.
7. Surface trace and simulated/fallback status in the UI.
8. Produce a report that can be inspected later.

The Agent should not:

1. Chat freely without tool evidence.
2. Use hidden model reasoning as the final proof.
3. Execute write SQL.
4. Call arbitrary tools.
5. Hide Mock fallback as a real model result.

## 4. Version and Governance Context

- app version: 1.4.1
- release tag: `v1.4.1-m4-engineering-complete`
- M5 future tag should stay in 1.x.x semantic style, for example `v1.5.0-m5-agent-mvp`

Version governance decision:

- `backend/VERSION` and frontend package version use pure app version `1.4.1`.
- Release tags can include milestone suffixes.
- Historical docs can keep old version references, but new docs must not introduce ad-hoc versions.
- `AGENTS.md` now declares the current baseline first; older notes remain historical and must not drive M5 implementation.

## 5. Old Agent Docs Review

本轮没有发现可直接执行的根目录 `Agent.md` / `agent.md`。相关材料主要是：

| Source | Current Fit |
| --- | --- |
| `AGENTS.md` | 已补充当前基线。旧 v1.0.x 阶段内容保留为 historical notes，不作为 M5 blueprint。 |
| archived frontend rules docs | 历史前端开发配置资料，不是产品内 Agent 设计。 |
| M4.7 audit reports | 准确指出缺少 tool registry、Agent state、run persistence、verifier、step retry，可作为证据。 |
| active skills | 提供 guardrails、trace、budget、evaluation、analysis workspace 的局部 checklist，但没有完整 Agent workflow skill。 |

结论：

```text
旧 Agent 文档不能直接作为 M5 执行蓝图。
M5 需要基于当前代码、当前 M4.9 能力和 EAI 数据分析业务目标重新设计。
```

## 6. Design Principles

- lowest sufficient complexity
- single agent first
- tool registry with typed input/output
- bounded loop
- readonly SQL first
- trace and evidence first
- mock fallback marked simulated
- backend persistence first
- eval transcript, not only final answer
- optional LangChain harness only after native contracts are stable
- no LangGraph / no RAG in M5

Industrial references used as direction:

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI: Function calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/)
- [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/)
- [Microsoft Azure Architecture Center: AI agent orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [LangChain: Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [LangChain: Tools](https://docs.langchain.com/oss/python/langchain/tools)

## 7. Target Architecture

```text
User Goal
  -> AgentRun
  -> Planner
  -> Tool Registry
      - inspect_schema
      - profile_table
      - generate_sql
      - execute_readonly_sql
      - summarize_findings
      - build_report
  -> Guardrails
  -> Trace / Evidence
  -> Persistence
  -> Report / History
```

M5 不替换当前 pipeline，而是新增薄 Agent runtime：

- M5.1 先定义 native contracts 和 mock tool registry。
- M5.2 再把现有 plan / SQL / execute / summary 包装为 tools，并可选引入 LangChain harness adapter。
- M5.3 加后端 persistence 和 Agent trace。
- M5.4 加前端 timeline / evidence / detail。
- M5.5 加 transcript evals 和真实 provider smoke。

## 8. Where Agent Lives

Backend proposed location:

```text
backend/agent/
  contracts.py
  models.py
  tools.py
  runner.py
  planner.py
  guardrails.py
  persistence.py
  tracing.py
  evals.py
  langchain_adapter.py
```

本轮不创建这些代码文件。

| Module | Responsibility |
| --- | --- |
| `contracts.py` | Pydantic contracts for AgentRun, AgentStep, ToolCall, ToolResult. |
| `models.py` | Agent state, status, risk level, provider metadata models. |
| `tools.py` | Tool Registry, tool metadata, typed input/output, adapter binding. |
| `runner.py` | State machine, bounded loop, retry, timeout, cancellation. |
| `planner.py` | Convert user goal into bounded plan. |
| `guardrails.py` | Agent-level step/sql/runtime/provider/evidence policies. |
| `persistence.py` | DuckDB repository for agent_runs, agent_steps, agent_tool_calls. |
| `tracing.py` | Normalize trace/evidence records for tool calls. |
| `evals.py` | Deterministic mock runs and transcript regression tests. |
| `langchain_adapter.py` | Optional LangChain harness adapter after native contracts stabilize. |

Frontend placement:

```text
Analyze page:
  Agent Run mode / tab

History:
  Agent run as first-class record

Detail:
  Agent report with timeline and evidence
```

## 9. Agent Workflow

Engineering workflow:

```text
created
  -> planning
  -> validating_plan
  -> running_step
  -> validating_tool_result
  -> summarizing
  -> completed

failure branches:
  -> partial
  -> failed
  -> cancelled
```

Each step must have:

- state
- input contract
- output contract
- timeout
- trace_id
- evidence
- error handling

Optional future state:

```text
awaiting_approval
```

M5 first version only uses readonly tools, so approval is reserved and not blocking.

## 10. First-Version Tool Set

第一版只保守放已稳定可复用、且适合 Agent 基础链路的工具：

| Tool | Purpose | Input | Output | Existing Reuse | Risk |
| --- | --- | --- | --- | --- | --- |
| `inspect_schema` | inspect table fields/types | table_name | schema summary | table metadata | low |
| `profile_table` | row count/nulls/basic stats | table_name | profile summary | preview/profile code | low |
| `generate_sql` | generate readonly SQL | goal/schema | SQL + rationale | existing NL to SQL | medium |
| `execute_readonly_sql` | execute validated query | SQL | rows/row_count/sample | existing SQL execution | medium |
| `summarize_findings` | summarize evidence | evidence list | findings | existing summary | medium |
| `build_report` | build final report | steps/findings | markdown/report | existing detail/report | low |

Future tools:

- `detect_anomalies`
- `suggest_chart`
- `multi_table_join_hint`
- `export_report`

Capability recheck:

| Capability | Code Evidence | User-visible Status | M4 Current Formal Capability | M5 First Core Tool | Recommendation |
| --- | --- | --- | --- | --- | --- |
| anomaly detection | `backend/services/anomaly_detector.py`, `/api/ai/anomalies`, frontend anomaly mode code | Main mode is feature-flagged off | Backend implemented, UI not stable as core path | No | Keep as Future tool. |
| chart suggestion | `/api/ai/chart-suggest`, `suggest_charts()`, chart components | Main charts mode is feature-flagged off | Backend implemented, UI not stable as core path | No | Keep as Future tool. |

## 11. Guardrails

Defaults:

- `max_steps = 5`
- `max_sql_calls = 5`
- `max_runtime_seconds = 120`
- `per_tool_timeout_seconds = 30`
- `row_limit` default
- readonly SQL validation
- Pydantic input/output validation
- provider fallback must set `is_simulated=true`
- every tool result must include evidence
- every run must include `trace_id`

SQL guardrails:

- only readonly SQL
- reject DDL / DML / destructive keywords
- reject multiple statement bypass
- enforce row limit
- only `execute_readonly_sql` can call the query executor

## 12. Mock First, Real LLM Later

M5 implementation order:

1. Deterministic Mock Agent run.
2. Mock tool-call persistence.
3. Mock timeline UI.
4. Mock evals.
5. Real provider smoke with DeepSeek / Doubao / Mimo.

Real provider failure must not block local demo.

Fallback to Mock must set:

```text
is_simulated = true
fallback_triggered = true
provider_requested = <real provider>
provider_used = mock
```

The UI must show a simulated / fallback badge.

Testing path:

```text
contract tests
  -> deterministic mock agent run
  -> tool transcript snapshots
  -> fallback simulated tests
  -> persistence tests
  -> real provider smoke
```

## 13. LangChain Feasibility

### Why Consider LangChain

- It can provide a lightweight agent harness.
- It supports tool-calling style agent loops.
- It makes the M5 Agent implementation recognizable as an industrial Agent pattern.
- It can wrap existing EAI tools without replacing the current FastAPI / DuckDB architecture.

### Why Not Use LangChain Everywhere

- EAI already has a working AI pipeline.
- Full LangChain rewrite would increase complexity.
- LangChain should not own persistence, UI state, or business data model.
- M5 should keep EAI contracts and DuckDB persistence as the source of truth.

### Recommended Use

Use LangChain only as an optional harness inside the Agent runner:

```text
backend/agent/langchain_adapter.py
```

The adapter may:

- expose EAI tools as LangChain tools
- call a LangChain agent in Mock or real provider mode
- return normalized EAI AgentRun / AgentStep / ToolCall contracts

The adapter must not:

- bypass EAI guardrails
- bypass readonly SQL validation
- bypass persistence
- bypass simulated fallback marking
- require LangSmith or hosted LangGraph
- require real provider credentials for local demo

## 14. LangChain MVP Plan

### Goal

Add a minimal LangChain-backed Single Data Analyst Agent path after base EAI contracts and tools are stable.

### Scope

- Add optional dependency only after design approval.
- Create `backend/agent/langchain_adapter.py`.
- Wrap 3 safe tools first:
  - `inspect_schema`
  - `profile_table`
  - `execute_readonly_sql`
- Use deterministic Mock model path first if feasible.
- Keep EAI AgentRun contracts as the output format.
- Persist all LangChain tool calls into EAI `agent_tool_calls`.
- Mark mock/fallback output as `is_simulated=true`.

### Non-Goals

- No LangGraph graph design in M5.
- No multi-agent.
- No RAG.
- No LangSmith requirement.
- No real provider required for first pass.
- No frontend rewrite.

### Acceptance

- One deterministic Agent run can call at least 2 tools.
- Tool calls are captured in normalized AgentStep / ToolCall records.
- SQL is still readonly validated.
- Mock fallback is visibly simulated.
- Existing AI analysis path remains unchanged.

Recommended staging:

```text
M5.1 native contracts first.
M5.2 optional LangChain adapter after native contracts stabilize.
```

Reason:

```text
先有自己的 AgentRun / ToolCall / Guardrails / Persistence，再让 LangChain 作为 harness 调用这些工具，避免被 LangChain 数据结构绑架。
```

## 15. Persistence

DuckDB table draft:

```text
agent_runs
agent_steps
agent_tool_calls
```

`agent_runs` fields:

- `run_id`
- `table_name`
- `user_goal`
- `provider_requested`
- `provider_used`
- `is_simulated`
- `status`
- `step_count`
- `trace_id`
- `created_at`
- `updated_at`
- `error_message`

`agent_steps` fields:

- `step_id`
- `run_id`
- `step_index`
- `state`
- `tool_name`
- `input_json`
- `output_json`
- `evidence_json`
- `started_at`
- `ended_at`
- `status`
- `error_message`

`agent_tool_calls` fields:

- `call_id`
- `run_id`
- `step_id`
- `tool_name`
- `input_json`
- `output_json`
- `duration_ms`
- `token_usage_json`
- `provider_used`
- `is_simulated`
- `status`

Why not only localStorage:

- localStorage cannot be authoritative audit storage.
- localStorage is capped and already trimmed by current stores.
- Agent transcript can be larger than current analysis summary.
- Backend needs run state for replay, debugging, evaluation and History source.

## 16. Frontend Style Consistency

M5 Agent UI must reuse the M4 visual language:

- existing page shell
- existing cards
- existing badges
- existing dark theme tokens
- existing History card pattern
- existing Detail report layout
- existing toast / fallback notice style

No new visual system.

Agent UI placement:

- Analyze page: add `Agent Run` mode / tab beside existing natural language analysis.
- Agent panel: show Plan, Current Step, Tool Calls, Evidence, Findings.
- History page: Agent run as a first-class record using the same card style.
- Detail page: Agent report extends current report layout with timeline/evidence sections.

Suggested layout:

```text
Analyze
  left/main: Agent result and findings
  side panel: plan + current step
  bottom/detail panel: SQL evidence + trace

History
  record type: Agent Run
  metadata: status, provider_used, is_simulated, step_count

Detail
  report
  timeline
  evidence
  trace
```

## 17. Evaluation Plan

Tests:

- contract schema tests
- tool registry tests
- readonly SQL guardrail tests
- deterministic mock run tests
- simulated fallback tests
- persistence tests
- transcript snapshot tests
- frontend timeline render tests
- real provider smoke only after mock path stable
- LangChain harness transcript tests after optional adapter is introduced

Evaluation must validate:

- tool-call sequence
- tool input/output schema
- state transitions
- SQL validation behavior
- evidence references
- provider metadata
- simulated fallback marking
- LangChain adapter normalization, if enabled

## 18. M5 Split Plan

| Stage | Goal | Scope | Acceptance |
| --- | --- | --- | --- |
| M5.0 | Design + Version Lock | docs + version fields | accepted design |
| M5.1 | Contracts + Mock Tool Registry | backend contracts/tools only | deterministic mock run |
| M5.2 | Existing Pipeline Tool Wrapping + Optional LangChain Adapter | plan/sql/execute/summary wrappers; optional lightweight LangChain harness | no behavior regression; LangChain path normalized to EAI contracts if enabled |
| M5.3 | Persistence + Trace | agent_runs/steps/tool_calls | backend run history |
| M5.4 | Frontend Agent UI | timeline/evidence/detail | style-consistent Agent run view |
| M5.5 | Agent Evals + Real LLM Smoke | transcript tests + provider smoke | mock stable, real LLM tested |

## 19. Risks

- version drift could reappear without release checklist
- `ai_pipeline.py` / `ai_analyst.py` complexity
- fallback mock may hide provider failures
- localStorage history is not enough for Agent run
- static schema semantics weak for arbitrary enterprise tables
- too much autonomy too early may reduce reliability
- route-level orchestration may grow if Agent APIs are not thin
- LangChain adapter could leak framework structures into EAI contracts if introduced before native contracts stabilize

## 20. Final Decision

Proceed with Single Data Analyst Agent.

Use LangChain only as an optional lightweight tool-calling harness after native EAI Agent contracts are stable.

Do not implement multi-agent, LangGraph orchestration, or RAG in M5.

Start M5.1 only after user reviews this design.
