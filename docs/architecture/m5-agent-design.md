# M5 Single Data Analyst Agent Design

> Status: M5.0 design lock
> Date: 2026-06-29
> Scope: documentation only. No Agent code is implemented in this stage.

## 1. Background

当前项目已经具备一条可用的 AI data analysis pipeline：用户问题进入后，系统可以生成分析计划、生成只读 SQL、执行 DuckDB 查询、生成摘要和报告，并通过前端 History / Detail 展示结果。M4 还补齐了 Mock / DeepSeek / Doubao / Mimo provider、Mock fallback、Docker Compose、部署文档和 README。

但这仍然主要是固定 pipeline / workflow：

```text
user question
  -> plan / sql / execute / summarize / report
```

它还不是完整工业 Agent。当前系统缺少一等 Agent run、工具注册表、稳定 step state machine、后端 run persistence、tool-call transcript、可审计 evidence、Agent 级 evaluation，以及 Mock fallback 的显式 simulated 标记。

M5 的目标不是另起炉灶，而是把现有 pipeline 升级为可控、可审计、可持久化的 Single Data Analyst Agent。

## 2. Why Not Reuse Old Agent.md Directly

本轮审计没有发现当前根目录存在可直接执行的 `Agent.md` / `agent.md` 产品设计文档。现有相关材料主要分为三类：

| 文档类型 | 当前判断 |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | 仍保留 v1.0.2 阶段的协作规则和旧路线图，适合作为协作约束参考，不适合作为 M5 产品 Agent 蓝图。 |
| archived frontend rules docs | 是历史前端开发规则资料，包含外部工具配置和多角色开发描述，不对应当前产品内 Single Data Analyst Agent。 |
| M4/M4.7/M4.9 reports | 对“当前还不是 Agent”的判断有参考价值，尤其指出缺少 tool registry、Agent state、run persistence、verifier、step retry。 |

结论：旧 Agent 相关文档只能作为历史参考。M5 必须基于当前 `v1.4.1-m4-engineering-complete` 后的真实代码、README、M4 报告和现有 pipeline 重新设计。

## 3. Design Goal

M5 的目标形态是 Single Data Analyst Agent：

- tool-based：把 schema inspection、profiling、SQL generation、readonly execution、summary、report 变成明确工具。
- auditable：每一步都有 trace、evidence、input/output、provider metadata。
- persistent：Agent run、step、tool call 由后端持久化，不能只依赖前端 localStorage。
- bounded：有 step limit、runtime limit、per-tool timeout、retry 和 budget control。
- mock-aware：Mock fallback 必须显式标记 `is_simulated=true`，不能伪装成真实 LLM 结果。
- evidence-first：最终结论必须能回到 SQL、rows、profile、schema、LLM call metadata 等 evidence。

## 4. Non-Goals

M5 不做以下事情：

- 不做多 Agent。
- 不引入 LangGraph。
- 不做 RAG。
- 不接企业数据库。
- 不做生产级权限系统。
- 不做长期记忆。
- M5 第一版不做高风险写操作。
- 不重写现有 AI pipeline。
- 不把 Mock fallback 当作真实智能能力宣传。

## 5. Target Architecture

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

第一版 Agent 应该优先复用现有 pipeline 能力，并增加薄抽象层：

| Layer | Responsibility |
| --- | --- |
| AgentRun | 承载一次用户目标、状态、provider、budget、trace_id、steps。 |
| Planner | 生成 bounded step plan，不负责执行工具。 |
| Tool Registry | 注册工具名、Pydantic input/output schema、风险等级、timeout、执行器。 |
| Runner | 按 state machine 调度工具调用，记录 step 和 tool result。 |
| Guardrails | SQL readonly、row limit、step/runtime limit、provider fallback 标记。 |
| Trace / Evidence | 记录每个 tool call 的 input/output、SQL、row_count、LLM metadata、错误。 |
| Persistence | DuckDB 持久化 Agent run、step、tool call，供 History / Detail 使用。 |

`detect_anomalies` 和 `suggest_chart` 当前已有相关实现，但不建议放入 M5 第一版核心工具。它们更适合作为 Future tools，等 Agent contract、trace、persistence、evaluation 稳定后再接入。

## 6. Agent State Machine

建议状态机：

```text
created
  -> planning
  -> running_step
  -> evaluating
  -> completed
```

异常和中断状态：

```text
failed
cancelled
partial
```

预留人工审批状态：

```text
awaiting_approval
```

M5 第一版只执行只读工具，默认不阻塞到人工审批。`awaiting_approval` 只作为后续高风险操作的扩展点。

## 7. Backend Proposed Modules

以下是 M5.1 之后建议新增的后端模块。本轮 M5.0 不创建这些代码文件。

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

| Module | Responsibility |
| --- | --- |
| `contracts.py` | Pydantic request/response schema、tool input/output schema、AgentRunSummary。 |
| `models.py` | Agent state enum、risk enum、domain model。 |
| `tools.py` | Tool Registry、tool metadata、tool adapter。 |
| `runner.py` | Agent run lifecycle、step execution、retry、timeout、budget check。 |
| `planner.py` | 把用户目标和 schema context 转成 bounded plan。 |
| `guardrails.py` | SQL readonly、row limit、step limit、runtime limit、provider fallback policy。 |
| `persistence.py` | DuckDB agent_runs / agent_steps / agent_tool_calls CRUD。 |
| `tracing.py` | Agent 级 trace 和 evidence normalization。 |
| `evals.py` | deterministic mock run、tool transcript、guardrail regression evals。 |

## 8. Core Contracts

概念级 schema：

```text
AgentRun
  run_id
  table_name
  user_goal
  provider_requested
  provider_used
  is_simulated
  status
  steps
  trace_id
  created_at
  updated_at
  error

AgentStep
  step_id
  run_id
  index
  name
  status
  tool_calls
  started_at
  finished_at
  error

ToolCall
  call_id
  run_id
  step_id
  tool_name
  input
  output
  status
  started_at
  finished_at
  duration_ms
  evidence_refs
  error

ToolResult
  call_id
  tool_name
  output
  evidence_refs
  is_simulated
  metadata

AgentState
  created
  planning
  running_step
  evaluating
  completed
  failed
  cancelled
  partial
  awaiting_approval

AgentRunSummary
  run_id
  status
  table_name
  user_goal
  provider_used
  is_simulated
  step_count
  tool_call_count
  key_findings
  report_preview
  created_at
  updated_at

EvidenceRef
  evidence_id
  type
  source
  summary
  ref
```

关键要求：

- 所有外部可见结果都必须带 `run_id` 和 `trace_id`。
- `provider_requested` 与 `provider_used` 必须同时记录。
- 任何 Mock fallback 或 deterministic mock run 都必须设置 `is_simulated=true`。
- `steps` 必须可重放为 tool-call transcript。
- `error` 必须结构化，不能只保存文本堆栈。

## 9. Tool Registry Design

第一版工具：

| Tool | Input | Output | Reuse Existing Code | Risk |
| --- | --- | --- | --- | --- |
| `inspect_schema` | `table_name` | columns/types | existing table metadata / `get_table_schema` | low |
| `profile_table` | `table_name` | row count, nulls, stats | existing profiler / preview / profile | low |
| `generate_sql` | goal + schema | readonly SQL | existing NL to SQL in `ai_analyst` / `ai_pipeline` | medium |
| `execute_readonly_sql` | SQL | rows + row_count | existing readonly SQL execution | medium |
| `summarize_findings` | evidence | findings | existing summary / insights flow | medium |
| `build_report` | steps + findings | report | existing report/detail generation | low |

Future tools：

```text
detect_anomalies
suggest_chart
multi_table_join_hint
export_report
```

当前代码中已存在 anomaly detection 和 chart suggestion 能力，但 M5 第一版核心工具仍建议保持小集合，先锁定 Agent run、tool transcript、guardrails、persistence 和 evals，再逐步把这些能力升级为 Agent tools。

Tool Registry 每个工具必须声明：

- `name`
- `description`
- `input_schema`
- `output_schema`
- `risk_level`
- `timeout_seconds`
- `max_retries`
- `requires_approval`
- `executor`
- `evidence_policy`

## 10. Guardrails

M5 第一版默认 guardrails：

| Guardrail | Default |
| --- | ---: |
| `max_steps` | 5 |
| `max_sql_calls` | 5 |
| `max_runtime_seconds` | 120 |
| `per_tool_timeout_seconds` | 30 |
| `row_limit` | configurable default, hard cap required |
| SQL readonly validation | required |
| Pydantic input/output validation | required |
| trace id | required |
| evidence refs | required for final findings |
| provider fallback simulated marking | required |

SQL safety 要求：

- 只允许只读查询。
- 禁止 DDL / DML / destructive keywords。
- 禁止多语句绕过。
- 自动加 row limit 或强制执行结果上限。
- `execute_readonly_sql` 只能接收已经通过 validator 的 SQL。

Mock / fallback 要求：

- Mock provider 主动使用时设置 `is_simulated=true`。
- 真实 provider 失败后 fallback 到 Mock 时也必须设置 `is_simulated=true`。
- UI 必须展示 simulated fallback badge。
- Evaluation 必须覆盖 simulated 标记，防止回归。

## 11. Persistence

Agent run 不能只依赖 localStorage，原因：

- localStorage 无法支持跨设备、跨页面稳定恢复。
- localStorage 不适合保存完整 tool-call transcript。
- Agent run 需要后端 audit trail、evaluation replay 和故障诊断。
- History / Detail 应该能读取后端一等记录。

建议 DuckDB 表：

```text
agent_runs
  run_id TEXT PRIMARY KEY
  table_name TEXT
  user_goal TEXT
  provider_requested TEXT
  provider_used TEXT
  is_simulated BOOLEAN
  status TEXT
  trace_id TEXT
  max_steps INTEGER
  max_sql_calls INTEGER
  max_runtime_seconds INTEGER
  started_at TIMESTAMP
  completed_at TIMESTAMP
  created_at TIMESTAMP
  updated_at TIMESTAMP
  error_json TEXT
  summary_json TEXT

agent_steps
  step_id TEXT PRIMARY KEY
  run_id TEXT
  step_index INTEGER
  step_name TEXT
  status TEXT
  started_at TIMESTAMP
  finished_at TIMESTAMP
  duration_ms INTEGER
  input_json TEXT
  output_json TEXT
  error_json TEXT

agent_tool_calls
  call_id TEXT PRIMARY KEY
  run_id TEXT
  step_id TEXT
  tool_name TEXT
  status TEXT
  input_json TEXT
  output_json TEXT
  evidence_json TEXT
  provider_used TEXT
  is_simulated BOOLEAN
  started_at TIMESTAMP
  finished_at TIMESTAMP
  duration_ms INTEGER
  error_json TEXT
```

M5.3 之前可以先用 repository abstraction 包住 DuckDB 写入，避免 routes / services 直接拼 SQL。

## 12. Frontend UX

Analyze 页建议新增 Agent Run 模式，而不是替换现有普通分析：

- Plan panel：展示 Agent plan、step status、当前运行步骤。
- Tool call timeline：按时间展示 tool name、status、duration、input/output 摘要。
- SQL evidence panel：展示生成 SQL、readonly validation、row_count、sample rows。
- Findings panel：展示从 evidence 推导出的 key findings。
- Trace panel：展示 trace_id、provider_requested、provider_used、fallback、budget 状态。
- simulated fallback badge：当 `is_simulated=true` 时显著展示。
- History：Agent run 作为一等记录，不再只靠前端 localStorage。
- Detail 页面：支持 Agent report、tool transcript、evidence refs。

UI 原则：

- Timeline 优先展示可解释过程，而不是只展示最终文本。
- Evidence panel 必须能让用户看到结论来自哪些 SQL / rows / profile。
- 对 Mock fallback 的展示要明确，不能让用户误以为是真实 provider 输出。

## 13. Evaluation

M5 evaluation 不只测最终文本，还要测 tool-call transcript。

建议测试：

- deterministic mock agent run tests。
- tool registry schema tests。
- readonly SQL guardrail tests。
- transcript snapshot tests。
- simulated fallback tests。
- persistence tests。
- frontend timeline rendering tests。
- provider metadata propagation tests。
- partial / failed run lifecycle tests。

验收重点：

- 相同 mock input 产生稳定 step transcript。
- 非只读 SQL 必须被拒绝。
- fallback 到 Mock 时必须标记 simulated。
- completed run 必须有 evidence_refs。
- failed / partial run 必须能在 History / Detail 中解释失败点。

## 14. M5 Split Plan

| Stage | Goal | Scope | Acceptance |
| --- | --- | --- | --- |
| M5.0 | Design Lock | docs only | design accepted |
| M5.1 | Contracts + Tool Registry Mock | backend contracts/tools only | deterministic mock run |
| M5.2 | Wrap Existing Pipeline Tools | connect existing plan/sql/execute/summary | no behavior regression |
| M5.3 | Persistence + Trace | agent_runs/steps/tool_calls | backend history source |
| M5.4 | Frontend Agent UI | timeline/evidence/detail | user can inspect run |
| M5.5 | Agent Evals | transcript/tool-call tests | regression suite |

M5.1 开始前必须完成设计审查。M5.1 只做 contracts 和 mock registry，不直接改造大文件。

## 15. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `ai_pipeline.py` / `ai_analyst.py` 文件过大 | 继续堆逻辑会让 Agent 边界不清 | 先加薄 adapter，不做大重构。 |
| Mock fallback 可能掩盖真实 provider 质量 | 用户可能误判结果来源 | 强制 `is_simulated`、UI badge、eval 覆盖。 |
| History 依赖 localStorage | Agent run 无法审计和恢复 | M5.3 引入后端 persistence。 |
| `schema_semantics.py` 静态映射泛化弱 | 工具选择和 SQL 生成上下文不足 | 先作为 inspect/profile evidence 的辅助输入。 |
| tool autonomy 过高 | 容易产生不可控循环和成本膨胀 | max_steps、max_sql_calls、runtime limit。 |
| SQL safety 必须严格 | 数据安全和稳定性风险 | readonly validator、row limit、tool I/O validation。 |
| route / service 边界过厚 | Agent 接入时容易牵动现有 API | M5.2 使用 adapter 包装现有能力。 |

## 16. Decision

Decision:

```text
Proceed with Single Data Analyst Agent.
Do not implement multi-agent, RAG, or LangGraph in M5.
Start M5.1 only after design review.
```

本设计采用“最低足够复杂度”的工业 Agent 路径：先把当前固定 pipeline 变成单 Agent + 明确工具 + 有界执行 + 后端持久化 + 可审计 transcript，再考虑更多工具和更高自主性。

Reference directions used for M5.0 design:

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI: Function calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/)
- [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/)
- [Microsoft: AI agent design patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Anthropic: Agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
