# M5.0 Agent Design + Version Governance Lock

> Date: 2026-06-29
> Branch: `m5-0-agent-design-version-lock`
> Scope: version fields + docs only

## 1. Goal

Resolve version drift and lock the M5 Single Data Analyst Agent design.

This round does not implement Agent business code and does not start M5.1.

## 2. Version Governance

Version rule:

- app version uses semantic style: `1.x.x`
- current app version: `1.4.1`
- release tag: `v1.4.1-m4-engineering-complete`
- future M5 tag example: `v1.5.0-m5-agent-mvp`

Version audit:

| File | Current Version | Expected Version | Drift | Handling |
| --- | --- | --- | --- | --- |
| `backend/VERSION` | `1.0.4` | `1.4.1` | Yes | Updated to `1.4.1`. |
| `frontend-react/package.json` | `1.0.4` | `1.4.1` | Yes | Updated project version only. |
| `frontend-react/package-lock.json` | root `1.0.2`, package root `1.0.2` | `1.4.1` | Yes | Updated only project-owned version fields. |
| root `package.json` | missing | N/A | No | No action. |
| `CURRENT_SESSION.md` | `v1.4.1-m4-engineering-complete` | same release tag | No | Appended M5.0 status only. |
| `README.md` | M4 current, no pure app field | release docs only | No blocking drift | No change this round. |
| `README.en.md` | M4 current, no pure app field | release docs only | No blocking drift | No change this round. |
| `AGENTS.md` | v1.0.2 / v1.0.x phase language | should be reviewed later | Yes | Not changed because it is outside allowed edit list; recorded as governance drift. |
| `Agent.md` / `agent.md` | not found | N/A | N/A | No action. |
| `docs/DEV_STATUS.md` | not found | N/A | N/A | No action. |
| `docs/PROJECT_CONTEXT.md` | not found | N/A | N/A | No action. |
| `docs/reports/m4-9-6-readme-value-polish-final-tag.md` | final tag report | historical release report | No | No change. |
| `docs/reports/hosted-deployment-smoke-check.md` | records backend `1.0.4` smoke result | historical observation | Historical drift | No change; superseded by `backend/VERSION` update. |

New governance doc:

- `docs/VERSIONING.md`

## 3. Skill / Workflow Check

Local skill / workflow audit:

| Skill / Workflow | Source File | Main Content | Suitable for M5 Agent Design | Adopted |
| --- | --- | --- | --- | --- |
| Runtime Guardrails | `skills/active/runtime-guardrails.md` | step/sql/time/failure limits for current pipeline | Partial | Yes, as guardrail checklist. |
| Analysis Trace | `skills/active/analysis-trace.md` | LLM call trace, latency, phase, status | Partial | Yes, as trace baseline. |
| Token Budget Control | `skills/active/token-budget-control.md` | per-operation and workflow budget accounting | Partial | Yes, as budget checklist. |
| AI Evaluation Harness | `skills/active/ai-evaluation-harness.md` | golden question evaluation for SQL quality | Partial | Yes, extended to Agent transcript evals. |
| Auto Analysis Pipeline | `skills/active/auto-analysis-pipeline.md` | profile, quality, anomalies, AI summary, chart suggestions | Partial | Yes, as tool candidate map. |
| AI SQL Analysis | `skills/active/ai-sql-analysis.md` | NL question to SQL to execution to explanation | Partial | Yes, as existing pipeline map. |
| Analysis Workspace | `skills/active/analysis-workspace.md` | frontend history, detail, trace visualization | Partial | Yes, as UX consistency input. |
| Dedicated industrial Agent workflow skill | not found | N/A | No | No. |
| startup-skill / agent-design / improve-codebase-architecture | not found | N/A | No | No. |

Conclusion:

```text
No reusable local industrial Agent workflow skill found. M5 design uses a custom checklist derived from current project needs, existing local skills, and industrial Agent principles.
```

Industrial references checked:

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI: Function calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/)
- [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/)
- [Microsoft Azure Architecture Center: AI agent orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

## 4. Old Agent Docs Review

| File | Current Version / Stage | Summary | Outdated | Directly Reusable | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `AGENTS.md` | v1.0.2 / v1.0.x | Repo rules and old roadmap; mentions future AI Agent and bans unapproved LangGraph / Multi-Agent / RAG | Yes | No | Keep as collaboration reference, review separately later. |
| `Agent.md` / `agent.md` | not found | No root product Agent design exists | N/A | No | Create new M5 design. |
| archived frontend rules docs | archived | Historical external frontend workflow material | Yes | No | Historical reference only. |
| `docs/reports/m4-7-full-project-scope-coupling-audit.md` | M4.7 | Identifies missing tool registry, state, persistence, verifier, step retry | No for Agent gap | Yes as evidence | Reuse as gap evidence. |
| `docs/reports/m4-7-1-4-ai-sql-history-hardening.md` | M4.7 | Says current trace is not full Agent trace | No for Agent gap | Yes as evidence | Reuse as gap evidence. |
| `docs/reports/m4-7-2-state-boundary-cleanup.md` | M4.7 | States M5 still needs registry/state/persistence/verifier/retry | No for Agent gap | Yes as evidence | Reuse as gap evidence. |
| `docs/reports/project-rescue-audit.md` | v1.0.2 era | Warns that deterministic loop is not true tool-use Agent | Partly | Yes as caution | Reuse the honesty principle. |
| `docs/reports/v1.0.0-architecture-optimization-plan.md` | v1.0.0 | Warns not to package LangGraph / Multi-Agent / RAG as complete capability | Partly | Yes as boundary | Reuse scope boundary. |

Answers:

1. Old Agent docs do not fit current EAI as an execution blueprint.
2. Some old materials risk overclaiming Agent-like capability; M5 must avoid adding Agent for decoration.
3. Multi-Agent / LangGraph / RAG are not needed for the current M5 goal.
4. M4.7 and rescue-era audits are useful historical references.
5. M5 needs a fresh design based on current code and EAI data-analysis goals.

## 5. Why EAI Needs an Agent

EAI needs an Agent because the current product is moving from “single fixed AI workflow” to “auditable data-analysis execution”.

Without Agent, current pipeline bottlenecks are:

- Tool choice is implicit in code, not explicit in a registry.
- Runs are not persisted as backend Agent runs.
- Trace is useful but does not fully capture tool-call transcript.
- Current UI can show final results, but cannot explain every tool decision and evidence chain.
- Mock fallback can be useful for demo stability, but needs explicit simulated semantics.

With Agent, improvements are:

- User sees plan, current step, tool timeline, SQL evidence, findings and fallback status.
- Engineering gets typed tool interfaces, bounded state machine, persistence and transcript evals.
- History and Detail become reliable inspection surfaces, not only local UI state.
- Existing Natural Language Analysis and Expert SQL remain intact; Agent is a structured run mode.

Core positioning:

```text
Agent = 工具化、可审计、可持久化的数据分析执行器
不是 = 聊天机器人 / 多 Agent 编排 / RAG 知识库 / 装饰性功能
```

## 6. Current Pipeline Audit

| File | Lines | Current Responsibility | M5 Risk | Need Thin Abstraction |
| --- | ---: | --- | --- | --- |
| `backend/services/ai_analyst.py` | 1017 | LLM operations: SQL, explanations, insights, chart suggestions, semantics, plan, anomaly interpretation, evaluation | Large mixed service; easy to keep growing | Yes |
| `backend/services/ai_pipeline.py` | 800 | Fixed workflow: AI query, autonomous analysis, streaming, guardrails, trace, summary | Close to Agent but lacks tool registry/state/persistence | Yes |
| `backend/routes/ai.py` | 659 | API models, endpoints, streaming, schedule, errors | Route could become orchestration dumping ground | Yes |
| `backend/services/schema_semantics.py` | 154 | Static semantic hints | Weak for arbitrary enterprise tables | Use as auxiliary context |
| `frontend-react/src/components/investigation/investigation-workspace.tsx` | 595 | Investigation UI orchestration and streaming run state | Agent UI could make component heavier | Yes |
| `frontend-react/src/stores/analysis-store.ts` | inspected | Persisted local run history, trace snapshot, trimming | localStorage is not backend audit trail | Yes |
| `frontend-react/src/components/ai/*` | inspected | report, trace, step, quality and dialog components | Can be reused for style consistency | No large change in M5.0 |
| `frontend-react/src/stores/*` | inspected | local workspace, SQL, history, analysis, schedule, template state | Multiple local stores cannot own Agent source of truth | Agent run should come from backend |

Tool candidates from current code:

- schema inspection
- table profile
- SQL generation
- readonly SQL execution
- findings summary
- report building
- later: anomaly detection and chart suggestion

Areas not to touch in M5.0:

- frontend source
- backend business logic
- database schema
- Docker / Compose
- existing API contracts

## 7. Capability Inventory

| Capability | Status | Evidence File | M5 Reuse | Notes |
| --- | --- | --- | --- | --- |
| plan generation | Implemented | `backend/services/ai_analyst.py`, `backend/services/ai_pipeline.py`, `backend/routes/ai.py` | Wrap later | Workflow plan, not Agent state. |
| SQL generation | Implemented | `backend/services/ai_analyst.py`, `backend/utils/llm_sql.py` | Core tool | Use typed tool contract. |
| readonly SQL validation | Implemented | `backend/services/sql_validator.py`, `backend/utils/llm_sql.py` | Core guardrail | Must remain mandatory. |
| SQL execution | Implemented | `backend/services/data_service.py`, `backend/services/query_executor.py`, `backend/services/ai_pipeline.py` | Core tool | Only validated SQL. |
| summary generation | Implemented | `backend/services/ai_analyst.py`, `backend/services/ai_pipeline.py` | Core tool | Needs evidence input. |
| trace | Partially implemented | `backend/services/trace.py`, frontend trace components | Extend | Pipeline trace, not Agent transcript. |
| guardrails | Partially implemented | `backend/services/guardrails.py`, SQL validator | Extend | Not complete Agent guardrails. |
| token budget | Partially implemented | `backend/runtime/token_budget.py` | Reuse | Add per-run metadata. |
| history | Partially implemented | `backend/services/query_history.py`, `frontend-react/src/stores/analysis-store.ts` | Replace for Agent runs | localStorage trimming exists. |
| analysis detail | Implemented for current workflow | frontend detail/report components | Reuse UI | Needs Agent report source. |
| provider fallback | Implemented | `backend/services/llm_runtime.py`, frontend fallback notice | Reuse | Add `is_simulated`. |
| mock result | Implemented | `backend/services/llm_runtime.py` | Reuse | Must be explicit simulated. |
| schema semantics | Partially implemented | `backend/services/schema_semantics.py` | Auxiliary | Static mapping. |
| table profiling | Implemented | `backend/services/profiler.py`, `backend/routes/analyze.py` | Core tool | Low risk. |
| anomaly detection | Implemented | `backend/services/anomaly_detector.py`, `backend/services/ai_analyst.py`, `backend/routes/ai.py` | Future tool | Do not make first core tool. |
| chart suggestion | Implemented | `backend/services/ai_analyst.py`, `backend/routes/ai.py` | Future tool | Do not make first core tool. |
| agent run persistence | Not implemented | no runtime `agent_runs` found | Required | M5.3. |
| tool registry | Not implemented | no runtime registry found | Required | M5.1. |
| agent state machine | Not implemented | no Agent state model found | Required | M5.1. |
| checkpoint / resume | Not implemented | frontend interruption recovery only | Future | Requires persistence. |
| human approval | Not implemented | no approval workflow found | Future | Reserve state only. |
| real provider testing path | Partially implemented | provider config, AI status, hosted smoke docs, eval harness | Extend | Add Agent smoke after mock stable. |

## 8. Recommended Agent Design

Recommended shape:

```text
Single Data Analyst Agent
```

Target architecture:

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

Why single Agent:

- Current scenario is one user asking one data-analysis goal over uploaded tabular data.
- Tool count is small and controllable.
- The main missing foundation is runtime discipline, not inter-agent delegation.
- Single Agent aligns with existing UI and avoids unnecessary complexity.

## 9. Engineering Workflow

State machine:

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

Tool Registry:

- typed Pydantic input/output
- risk level
- timeout
- retry policy
- approval flag reserved
- evidence policy
- adapter to existing service code

Guardrails:

- `max_steps=5`
- `max_sql_calls=5`
- `max_runtime_seconds=120`
- `per_tool_timeout_seconds=30`
- row limit
- readonly SQL validation
- provider fallback must set `is_simulated=true`

Persistence:

- `agent_runs`
- `agent_steps`
- `agent_tool_calls`

Trace / Evidence:

- every run has `trace_id`
- every tool call has input/output/evidence refs
- final report links findings to evidence

Mock fallback:

- Mock path is allowed and useful.
- Mock path must be visually and structurally marked simulated.

Real LLM testing path:

- deterministic mock run first
- transcript snapshot tests
- fallback simulated tests
- real provider smoke only after mock path is stable

## 10. Version Files Changed

- `backend/VERSION`
- `frontend-react/package.json`
- `frontend-react/package-lock.json`
- `docs/VERSIONING.md`

Also changed:

- `docs/architecture/m5-agent-design.md`
- `docs/reports/m5-0-agent-design-version-lock.md`
- `CURRENT_SESSION.md`

## 11. What Was Not Changed

- 未实现 Agent 代码。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未修改数据库结构。
- 未修改 Docker。
- 未开始 M5.1。
- 未打 tag。
- 未提交 `.env`。

## 12. Next Step

等待用户审查。

通过后进入：

```text
M5.1 Contracts + Mock Tool Registry
```

M5.1 仍应避免多 Agent、LangGraph 和 RAG。
