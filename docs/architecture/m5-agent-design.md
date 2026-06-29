# M5 Single Data Analyst Agent Design

> Status: M5.0 industrial agent workflow review
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

1. Route every user request into Agent mode.
2. Chat freely without tool evidence.
3. Use hidden model reasoning as the final proof.
4. Execute write SQL.
5. Call arbitrary tools.
6. Hide Mock fallback as a real model result.

## 4. Version and Governance Context

- app version: 1.4.1
- release tag: `v1.4.1-m4-engineering-complete`
- M5 future tag should stay in 1.x.x semantic style, for example `v1.5.0-m5-agent-mvp`

Version governance decision:

- `backend/VERSION` and frontend package version use pure app version `1.4.1`.
- Release tags can include milestone suffixes.
- Historical docs can keep old version references, but new docs must not introduce ad-hoc versions.
- `AGENTS.md` declares the current baseline first; older notes remain historical and must not drive M5 implementation.

## 5. Old Agent Docs Review

本轮没有发现可直接执行的根目录 `Agent.md` / `agent.md`。相关材料主要是：

| Source | Current Fit |
| --- | --- |
| `AGENTS.md` | 已补充当前基线。旧 v1.0.x 阶段内容保留为 historical notes，不作为 M5 blueprint。 |
| archived frontend rules docs | 历史前端开发配置资料，不是产品内 Agent 设计。 |
| M4.7 audit reports | 准确指出缺少 tool registry、Agent state、run persistence、verifier、step retry，可作为证据。 |
| active skills | 提供 guardrails、trace、budget、evaluation、analysis workspace 的局部 checklist，但没有完整 industrial Agent workflow skill。 |

结论：

```text
旧 Agent 文档不能直接作为 M5 执行蓝图。
M5 需要基于当前代码、当前 M4.9 能力和 EAI 数据分析业务目标重新设计。
```

## 6. External Agent Workflow Principles

本轮联网复核了官方 / 一手资料，并把原则落到 EAI 设计：

| Source | Key Principle | EAI Design Impact |
| --- | --- | --- |
| [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Workflows use predefined code paths; agents dynamically direct tool usage. Start simple and add complexity only when it improves outcomes. | EAI must keep existing Natural Language Analysis / Expert SQL for simple cases, and use Agent only when multi-step tool execution is necessary. |
| [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Routing classifies an input and sends it to a specialized path. | Add Intent Recognition and Mode Router before AgentRun creation. |
| [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Agents need ground truth from environment feedback and stopping conditions. | Every EAI tool result must include evidence, and every run needs max steps, timeout, partial status, and trace. |
| [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/) | Input, output, and tool guardrails run at different workflow boundaries. Tool guardrails wrap custom tool calls. | EAI guardrails must be layered: user input, intent, tool input, tool output, runtime, and final report. |
| [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/) | Tracing records LLM generations, tool calls, guardrails, handoffs, and custom events as traces/spans. | EAI Agent trace must be tool-call transcript + evidence, not only LLM latency logging. |
| [OpenAI Agents SDK: Results](https://openai.github.io/openai-agents-python/results/) | Guardrail results accumulate separately for agent-level and tool-level checks. | EAI should persist guardrail decisions in `agent_steps` / `agent_tool_calls` for debugging blocked or partial runs. |
| [LangChain: Agents](https://docs.langchain.com/oss/python/langchain/agents) | `create_agent` can compose model, tools, prompt, and structured output. | LangChain can be an optional harness only after native EAI contracts exist. |
| [LangChain: Tools](https://docs.langchain.com/oss/python/langchain/tools) | Tools are callable functions with well-defined inputs and outputs. | EAI Tool Registry needs typed input/output contracts and clear tool descriptions before LangChain wrapping. |
| [Microsoft Azure: AI agent orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) | Multi-agent orchestration is useful for specialized units and complex coordination, but adds coordination concerns. | EAI current scope is one data-analysis goal over uploaded tables, so Single Agent is the lowest sufficient complexity. |

## 7. Design Principles

- lowest sufficient complexity
- route before Agent
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

## 8. Target Architecture

```text
User Goal
  -> Intent Recognition
  -> Mode Router
      - natural_language
      - expert_sql
      - agent_run
      - clarification
      - unsupported
  -> AgentRun only when needed
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

- M5.1 先定义 native IntentRoute、Agent contracts 和 mock tool registry。
- M5.2 再引入 optional LangChain harness MVP。
- M5.3 把现有 plan / SQL / execute / summary 包装为 tools。
- M5.4 加后端 persistence 和 Agent trace。
- M5.5 加前端 mode tabs / timeline / evidence / detail。
- M5.6 加 transcript evals 和真实 provider smoke。

## 9. Where Agent Lives

Backend proposed location:

```text
backend/agent/
  contracts.py
  models.py
  tools.py
  runner.py
  planner.py
  router.py
  guardrails.py
  persistence.py
  tracing.py
  evals.py
  langchain_adapter.py
```

本轮不创建这些代码文件。

| Module | Responsibility |
| --- | --- |
| `contracts.py` | Pydantic contracts for IntentRoute, AgentRun, AgentStep, ToolCall, ToolResult. |
| `models.py` | Agent state, status, risk level, provider metadata models. |
| `tools.py` | Tool Registry, tool metadata, typed input/output, adapter binding. |
| `runner.py` | State machine, bounded loop, retry, timeout, cancellation. |
| `planner.py` | Convert user goal into bounded plan. |
| `router.py` | Intent recognition and mode selection before AgentRun creation. |
| `guardrails.py` | Agent-level step/sql/runtime/provider/evidence policies. |
| `persistence.py` | DuckDB repository for agent_runs, agent_steps, agent_tool_calls. |
| `tracing.py` | Normalize trace/evidence records for tool calls. |
| `evals.py` | Deterministic mock runs and transcript regression tests. |
| `langchain_adapter.py` | Optional LangChain harness adapter after native contracts stabilize. |

Frontend placement:

```text
Analyze page:
  mode tabs: Natural Language Analysis / Expert SQL / Agent Run

History:
  Agent run as first-class record

Detail:
  Agent report with timeline and evidence
```

## 10. Intent Recognition and Mode Router

EAI should not route every user request into Agent Run.

Before starting an Agent run, the backend should classify the user goal into a small set of deterministic modes.

### Intent Categories

| Intent | Meaning | Route |
| --- | --- | --- |
| `simple_summary` | User asks for a quick summary of the selected table | existing natural language analysis |
| `sql_question` | User asks a specific query that maps cleanly to SQL | NL to SQL / expert SQL path |
| `agent_analysis` | User asks for multi-step analysis, compare, investigate, explain with evidence | Single Data Analyst Agent |
| `data_preview` | User asks about columns, row count, missing values, schema | inspect_schema / profile_table |
| `report_lookup` | User wants to review past analysis | History / Detail |
| `ambiguous` | User intent is unclear | clarification question |
| `unsupported` | User requests unsupported action, write SQL, external DB, private credential, or non-data task | safe refusal / guidance |

### Router Responsibilities

The router should:

1. Decide whether Agent mode is necessary.
2. Avoid using Agent for simple one-step questions.
3. Route ambiguous requests to clarification instead of guessing.
4. Block unsupported or unsafe requests before tool execution.
5. Record `intent`, `confidence`, and `route_reason` in `AgentRun` or analysis metadata.

### Router Output Contract

```text
IntentRoute:
  intent: simple_summary | sql_question | agent_analysis | data_preview | report_lookup | ambiguous | unsupported
  confidence: float
  selected_mode: natural_language | expert_sql | agent_run | clarification | unsupported
  route_reason: string
  requires_agent: bool
  safety_flags: list[string]
```

### Landing Stage

M5.1 should implement only the native route contract and deterministic mock router tests. It should not install LangChain or start real provider routing.

## 11. Clarification and Unsupported Intent Handling

Clarification is a first-class non-Agent route.

Use clarification when:

- intent confidence is below threshold
- selected table is missing
- user asks for broad analysis without a concrete table or goal
- request mixes incompatible modes, such as “write data” and “summarize”
- user asks for external database access that M5 does not support

Use unsupported when:

- request requires write SQL or destructive action
- request asks for external systems beyond uploaded files / DuckDB
- request is not a data-analysis task
- request tries to bypass readonly validation or provider policy

The system should not silently create an Agent run for these cases. It should return a clear clarification prompt or safe guidance and persist the routing decision when an AgentRun was already created.

## 12. Mode Fallback Matrix

EAI needs two levels of fallback:

1. Provider fallback: real LLM provider fails, fallback to Mock.
2. Mode fallback: Agent mode is unnecessary, unsafe, ambiguous, or fails gracefully.

| Situation | Fallback Behavior | User-visible Result |
| --- | --- | --- |
| Intent confidence too low | Ask clarification | Show clarification prompt |
| Request is simple summary | Use existing natural language analysis | No Agent run created |
| Request maps directly to SQL | Use NL to SQL / expert SQL | Show SQL evidence |
| Data preview request | Use schema/profile path | Show schema/profile evidence |
| Unsupported or unsafe request | Safe refusal / guidance | No tool execution |
| Agent planner fails | Return partial / ask clarification | Mark run as partial |
| Tool validation fails | Stop step, record failure | Show failed tool call |
| SQL not readonly | Reject tool call | Show safety message |
| Real provider unavailable | Fallback to Mock | Mark `is_simulated=true` |
| LangChain adapter unavailable | Use native Agent runner | No user-facing failure |
| Agent exceeds max steps | Stop with partial report | Show bounded stop reason |
| Frontend cannot render timeline | Show report fallback | Preserve history/detail access |

### Required Metadata

Every fallback path must record:

```text
fallback_triggered: bool
fallback_type: provider | mode | tool | ui | none
fallback_reason: string
provider_requested: string
provider_used: string
is_simulated: bool
```

Agent must not swallow failures. Failures become `partial`, `clarification_required`, `unsupported`, `failed`, or safe refusal; they must not be presented as successful analysis.

## 13. Industrial Agent Workflow

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

failure / fallback branches:
  -> clarification_required
  -> unsupported
  -> partial
  -> failed
  -> cancelled
```

Each state must define:

- input contract
- output contract
- timeout
- trace span
- persistence write
- fallback behavior

Optional future state:

```text
awaiting_approval
```

M5 first version only uses readonly tools, so approval is reserved and not blocking.

## 14. Agent Quality Gates

Before execution:

- valid table selected
- user goal non-empty
- intent confidence above threshold or clarification required
- provider selected
- run budget available

Before tool call:

- tool exists in registry
- input schema validated
- SQL readonly validated if SQL tool
- row limit applied
- trace id attached

After tool call:

- output schema validated
- evidence stored
- error normalized
- simulated/fallback flags preserved

Before final report:

- every finding has evidence
- provider metadata included
- trace id included
- partial status shown if incomplete

## 15. First-Version Tool Set

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
| anomaly detection | `backend/services/anomaly_detector.py`, `/api/ai/anomalies`, frontend anomaly mode code | Main mode is feature-flagged off | Backend/API implemented, UI not stable as core path | No | Keep as Future tool. |
| chart suggestion | `/api/ai/chart-suggest`, `suggest_charts()`, chart components | Main charts mode is feature-flagged off | Backend/API implemented, UI not stable as core path | No | Keep as Future tool. |

## 16. Guardrail Layers

| Layer | Purpose | EAI Risk Covered | Example |
| --- | --- | --- | --- |
| Input Guardrail | Validate user request before routing | empty goal, unsafe action, no selected table | reject empty `user_goal` |
| Intent Guardrail | Prevent wrong mode selection | simple request accidentally enters expensive Agent loop | route `simple_summary` to current analysis |
| Tool Input Guardrail | Validate tool arguments | invalid table, unsafe SQL, missing row limit | table exists, SQL readonly |
| Tool Output Guardrail | Validate tool result shape | tool returns ungrounded text or malformed rows | `row_count` and `evidence` required |
| Runtime Guardrail | Bound cost and latency | runaway steps, repeated SQL calls, long provider wait | `max_steps`, timeout, `max_sql_calls` |
| Final Output Guardrail | Ensure report is grounded | final report claims unsupported findings | every finding links to evidence |

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

## 17. Trace and Evidence

Agent trace is not just LLM trace. It must capture the execution transcript:

- route decision and confidence
- preflight guardrail decisions
- planner input/output
- every tool call input/output
- SQL text after readonly validation
- row_count, sample rows, and evidence refs
- provider metadata and simulated flags
- runtime budget and stop reason
- final report evidence mapping

Evidence rules:

- every tool result must produce `EvidenceRef` or explicitly state why no evidence applies
- every final finding must cite one or more evidence refs
- failed tool calls must still be visible in timeline with normalized error metadata
- provider fallback and mode fallback must be trace events

## 18. Mock First, Real LLM Later

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
  -> deterministic mock route and run
  -> tool transcript snapshots
  -> fallback simulated tests
  -> persistence tests
  -> real provider smoke
```

## 19. LangChain Boundary

LangChain is allowed only as an optional harness after native EAI contracts are stable.

EAI owns:

- `IntentRoute` contract
- `AgentRun` contract
- `ToolCall` contract
- Guardrails
- Persistence
- Trace / Evidence
- Provider fallback metadata
- UI state

LangChain may provide:

- model + tools loop
- tool calling wrapper
- structured output helper
- middleware / retry helper if useful

LangChain must not:

- replace EAI persistence
- bypass readonly SQL guardrails
- hide tool-call traces
- require LangSmith
- require LangGraph design
- become the only runnable path

Use LangChain only as an optional adapter:

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
- require hosted LangGraph
- require real provider credentials for local demo

## 20. LangChain MVP Plan

### Goal

Add a minimal LangChain-backed Single Data Analyst Agent path after base EAI contracts and tools are stable.

### Stage

```text
M5.1 native IntentRoute + Agent contracts + mock tool registry.
M5.2 optional LangChain adapter MVP.
```

M5.1 must not install LangChain. M5.2 may add the optional adapter only after native contracts and guardrails are stable.

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

Reason:

```text
先有自己的 AgentRun / ToolCall / Guardrails / Persistence，再让 LangChain 作为 harness 调用这些工具，避免被 LangChain 数据结构绑定。
```

## 21. Persistence

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
- `intent`
- `intent_confidence`
- `selected_mode`
- `route_reason`
- `provider_requested`
- `provider_used`
- `is_simulated`
- `fallback_triggered`
- `fallback_type`
- `fallback_reason`
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
- `guardrail_results_json`
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
- `evidence_json`
- `duration_ms`
- `usage_json`
- `provider_used`
- `is_simulated`
- `status`

Why not only localStorage:

- localStorage cannot be authoritative audit storage.
- localStorage is capped and already trimmed by current stores.
- Agent transcript can be larger than current analysis summary.
- Backend needs run state for replay, debugging, evaluation and History source.

## 22. Frontend Mode UX

Analyze page should not force users into Agent mode.

Suggested layout:

- Natural Language Analysis: current default
- Expert SQL: current advanced path
- Agent Run: multi-step analysis with timeline and evidence

Agent Run UI should show:

- intent detected
- selected mode
- plan
- current step
- tool calls
- SQL evidence
- fallback / simulated badge
- final report
- partial / failed state

History cards should show:

- record type: AI Analysis / SQL / Agent Run
- provider used
- simulated badge if applicable
- status: completed / partial / failed

M5 Agent UI must reuse the M4 visual language:

- existing page shell
- existing cards
- existing badges
- existing dark theme tokens
- existing History card pattern
- existing Detail report layout
- existing toast / fallback notice style

No new visual system. Do not restore hidden experimental modes just to fill the Agent UI.

## 23. Evaluation Plan

Tests:

- intent route contract tests
- mode fallback matrix tests
- contract schema tests
- tool registry tests
- readonly SQL guardrail tests
- deterministic mock route and run tests
- simulated fallback tests
- persistence tests
- transcript snapshot tests
- frontend mode/timeline render tests
- real provider smoke only after mock path stable
- LangChain harness transcript tests after optional adapter is introduced

Evaluation must validate:

- selected mode
- tool-call sequence
- tool input/output schema
- state transitions
- SQL validation behavior
- evidence references
- provider metadata
- simulated fallback marking
- LangChain adapter normalization, if enabled

## 24. Updated M5 Split Plan

| Stage | Goal | Scope | Acceptance |
| --- | --- | --- | --- |
| M5.0 | Industrial Agent Design Lock | docs only | design accepted |
| M5.1 | Intent Router + Native Agent Contracts + Mock Tool Registry | backend contracts only | deterministic mock route and tool-call transcript |
| M5.2 | Optional LangChain Harness MVP | wrap 3 safe tools | LangChain run normalized into EAI contracts |
| M5.3 | Existing Pipeline Tool Wrapping | generate_sql / execute_readonly_sql / summarize_findings | no regression to existing analysis |
| M5.4 | Agent Persistence + Trace | agent_runs / agent_steps / agent_tool_calls | backend run history |
| M5.5 | Frontend Agent UI | mode tabs / timeline / evidence / detail | style-consistent Agent run UX |
| M5.6 | Agent Evals + Real LLM Smoke | transcript tests + provider smoke | mock stable, real provider tested |

## 25. Risks

- version drift could reappear without release checklist
- `ai_pipeline.py` / `ai_analyst.py` complexity
- fallback mock may hide provider failures unless simulated is visible
- localStorage history is not enough for Agent run
- static schema semantics weak for arbitrary enterprise tables
- too much autonomy too early may reduce reliability
- route-level orchestration may grow if Agent APIs are not thin
- LangChain adapter could leak framework structures into EAI contracts if introduced before native contracts stabilize
- wrong intent routing could create expensive or confusing Agent runs
- final reports could overclaim unless every finding maps to evidence

## 26. Final Decision

Proceed with Single Data Analyst Agent.

Use Intent Recognition and Mode Router before creating AgentRun.

Use LangChain only as an optional lightweight tool-calling harness after native EAI Agent contracts are stable.

Do not implement multi-agent, LangGraph orchestration, or RAG in M5.

Start M5.1 only after user reviews this design.
