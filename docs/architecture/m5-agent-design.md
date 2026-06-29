# M5 Single Data Analyst Agent Design

> Status: M5.0 design + version governance lock
> Date: 2026-06-29
> App version: 1.4.1
> Release tag: `v1.4.1-m4-engineering-complete`

## 1. Why EAI Needs an Agent

EAI 不需要为了“有 Agent”而加 Agent。当前项目已经有可工作的 AI pipeline：用户提出问题后，系统可以规划、生成 SQL、执行只读查询、解释结果、生成报告。这个流程已经能服务 Natural Language Analysis、Expert SQL、History 和 Analysis Detail。

真正瓶颈不在“模型会不会说话”，而在工程化执行：

- 固定 pipeline 难以根据用户目标选择不同工具。
- 当前 trace 更偏 LLM call 记录，不是完整 tool-call transcript。
- 分析 run 主要靠前端 localStorage 记录，不能作为后端一等审计对象。
- `ai_pipeline.py` / `ai_analyst.py` 已经很大，继续堆流程会扩大技术债。
- Mock fallback 已存在，但 Agent 语境下必须显式标记 simulated，不能让用户误以为是真实 provider 洞察。
- 当前 History / Detail 能看结果，但不能稳定回放“Agent 为什么这么做、调用了什么工具、依据是什么”。

因此，M5 Agent 的真实价值是把现有固定 AI workflow 升级为可控、可审计、可持久化的数据分析执行器。

## 2. Agent Role in EAI

Agent is a tool-based, auditable, persistent data analysis executor.

在 EAI 中，它负责：

- 根据用户目标选择合适的数据分析工具。
- 分步骤检查表结构、生成只读 SQL、执行查询、汇总 evidence、构建报告。
- 为每一步记录 state、input、output、trace_id、evidence、provider metadata。
- 将 Agent run 持久化到后端，供 History / Detail / evaluation 使用。
- 在 Mock fallback 时明确标记 `is_simulated=true`。

It is not:

- chatbot
- RAG bot
- multi-agent system
- decorative AI feature

边界关系：

| Existing Feature | Agent Relationship |
| --- | --- |
| Natural Language Analysis | 继续保留；Agent 是更可审计的 run 模式，不替代现有入口。 |
| Expert SQL | 继续由用户直接控制；Agent 只执行经过 readonly validation 的 SQL tool call。 |
| History | 从前端 localStorage 结果列表升级为后端 Agent run 一等记录。 |
| Detail | 从最终报告展示升级为 report + timeline + evidence + trace。 |
| Mock fallback / multi-provider | Agent 统一记录 `provider_requested`、`provider_used`、`is_simulated`。 |

## 3. Version and Governance Context

- app version: 1.4.1
- release tag: `v1.4.1-m4-engineering-complete`
- M5 future tag should stay in 1.x.x semantic style, for example `v1.5.0-m5-agent-mvp`

Version governance decision:

- `backend/VERSION` and frontend package version should use pure app version `1.4.1`.
- Release tags can include milestone suffixes.
- Historical docs can keep old version references, but new docs must not introduce ad-hoc versions.
- `AGENTS.md` still contains old v1.0.x phase language and should be treated as collaboration-rule drift, not M5 product design.

## 4. Old Agent Docs Review

本轮没有发现可直接执行的根目录 `Agent.md` / `agent.md`。相关材料主要是：

| Source | Current Fit |
| --- | --- |
| `AGENTS.md` | 仍有 v1.0.x 语义和旧阶段说明，可作为协作规则参考，不适合作为 M5 blueprint。 |
| archived frontend rules docs | 是历史前端开发配置资料，不是产品内 Agent 设计。 |
| M4.7 audit reports | 准确指出缺少 tool registry、Agent state、run persistence、verifier、step retry，可作为证据。 |
| active skills | 提供 guardrails、trace、budget、evaluation、analysis workspace 的局部 checklist，但没有完整 Agent workflow skill。 |

结论：

```text
旧 Agent 文档不能直接作为 M5 执行蓝图。
M5 需要基于当前代码、当前 M4.9 能力和 EAI 数据分析业务目标重新设计。
```

## 5. Design Principles

- lowest sufficient complexity
- single agent first
- tool registry with typed input/output
- bounded loop
- readonly SQL first
- trace and evidence first
- mock fallback marked simulated
- backend persistence first
- eval transcript, not only final answer
- no LangGraph / no RAG in M5

Industrial references used as direction:

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI: Function calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/)
- [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/)
- [Microsoft Azure Architecture Center: AI agent orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

## 6. Target Architecture

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

M5 不应替换当前 pipeline，而应新增一层薄 Agent runtime：

- M5.1 先定义 contracts 和 mock tool registry。
- M5.2 再把现有 plan / SQL / execute / summary 包装为 tools。
- M5.3 加后端 persistence 和 Agent trace。
- M5.4 加前端 timeline / evidence / detail。
- M5.5 加 transcript evals 和真实 provider smoke。

## 7. Where Agent Lives

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
```

本轮不创建这些代码文件。职责建议：

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

Frontend placement:

```text
Analyze page:
  Agent Run mode / tab

History:
  Agent run as first-class record

Detail:
  Agent report with timeline and evidence
```

Frontend should reuse current M4 shell, panels, badge, timeline and detail visual language. It should not introduce a new visual system.

## 8. Agent Workflow

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

## 9. First-Version Tool Set

第一版只保守放已能复用或容易封装的工具：

| Tool | Purpose | Input | Output | Existing Reuse | Risk |
| --- | --- | --- | --- | --- | --- |
| `inspect_schema` | inspect table fields/types | table_name | schema summary | table metadata | low |
| `profile_table` | row count/nulls/basic stats | table_name | profile summary | preview/profile code | low |
| `generate_sql` | generate readonly SQL | goal/schema | SQL + rationale | existing NL to SQL | medium |
| `execute_readonly_sql` | execute validated query | SQL | rows/row_count/sample | existing SQL execution | medium |
| `summarize_findings` | summarize evidence | evidence list | findings | existing summary | medium |
| `build_report` | build final report | steps/findings | markdown/report | existing detail/report | low |

Future tools only if verified later:

- `detect_anomalies`
- `suggest_chart`
- `multi_table_join_hint`
- `export_report`

当前代码已经存在 anomaly detection 和 chart suggestion，但它们不应抢在 Agent contracts、state、persistence、evals 之前进入核心工具集。

## 10. Guardrails

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

## 11. Mock Fallback and Real LLM Testing

Design requirements:

- Mock is the default fallback.
- Mock result must be marked simulated.
- Fallback to Mock must not be displayed as real LLM insight.
- UI must show simulated / fallback badge.
- M5 should first complete deterministic mock agent tests.
- Real LLM smoke should happen only after mock path is stable.
- DeepSeek / Doubao / Mimo keys stay in backend env only.

Testing path:

```text
contract tests
  -> deterministic mock agent run
  -> tool transcript snapshots
  -> fallback simulated tests
  -> persistence tests
  -> real provider smoke
```

## 12. Persistence

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

## 13. Frontend UX and Style Consistency

Requirements:

- Reuse current M4 UI style.
- Do not create a new visual system.
- Add Agent Run mode on Analyze page.
- Reuse existing panel/card/badge/timeline style.
- Show:
  - plan
  - current step
  - tool call timeline
  - SQL evidence
  - findings
  - trace
  - fallback/simulated badge
- History should present Agent run using the same visual language as AI/SQL records.
- Detail page should display Agent report without a separate style system.

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

## 14. Evaluation Plan

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

Evaluation must validate:

- tool-call sequence
- tool input/output schema
- state transitions
- SQL validation behavior
- evidence references
- provider metadata
- simulated fallback marking

## 15. M5 Split Plan

| Stage | Goal | Scope | Acceptance |
| --- | --- | --- | --- |
| M5.0 | Design + Version Lock | docs + version fields | accepted design |
| M5.1 | Contracts + Mock Tool Registry | backend contracts/tools only | deterministic mock run |
| M5.2 | Existing Pipeline Tool Wrapping | plan/sql/execute/summary wrappers | no behavior regression |
| M5.3 | Persistence + Trace | agent_runs/steps/tool_calls | backend run history |
| M5.4 | Frontend Agent UI | timeline/evidence/detail | style-consistent Agent run view |
| M5.5 | Agent Evals + Real LLM Smoke | transcript tests + provider smoke | mock stable, real LLM tested |

## 16. Risks

- version drift could reappear without release checklist
- `ai_pipeline.py` / `ai_analyst.py` complexity
- fallback mock may hide provider failures
- localStorage history is not enough for Agent run
- static schema semantics weak for arbitrary enterprise tables
- too much autonomy too early may reduce reliability
- route-level orchestration may grow if Agent APIs are not thin

## 17. Final Decision

Proceed with Single Data Analyst Agent.

Do not implement multi-agent, LangGraph, or RAG in M5.

Start M5.1 only after user reviews this design.
