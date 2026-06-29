# M5.0 Agent Design Audit

> Date: 2026-06-29
> Branch: `m5-0-agent-design-audit`
> Scope: design audit and architecture lock only.

## 1. Goal

Audit current AI pipeline and old Agent docs, then lock the M5 Single Data Analyst Agent design.

M5.0 does not implement Agent code. It only produces the architecture decision, technical debt audit, and M5.1 to M5.5 phased plan.

## 2. Current Project Status

| Item | Result |
| --- | --- |
| Workspace | `D:/Claude_workfile/EnterpriseAiDataAgent` |
| Remote | `https://github.com/Strange-Men/EnterpriseAiDataAgent.git` |
| Base branch before M5.0 | `master` |
| M5.0 branch | `m5-0-agent-design-audit` |
| Required final tag | `v1.4.1-m4-engineering-complete` |
| Tag commit | `60565454d4d1a6dbc962b12da73f4182b4d1e6b4` |
| Current M4 status | M4 UI/UX, LLM fallback, Docker, README, deployment docs closed |
| Current Agent status | Fixed AI pipeline exists; industrial Agent foundation is incomplete |

The project currently includes:

- Next.js + FastAPI + DuckDB.
- CSV / Excel upload.
- Data preview and table profile.
- Natural language analysis.
- Expert SQL.
- History and Analysis Detail Report.
- Mock / DeepSeek / Doubao / Mimo provider support.
- Mock fallback.
- Docker Compose local demo.
- README / README.en / Deployment / Env docs.

Current likely execution shape:

```text
user question -> plan / sql / execute / summarize / report
```

This is useful and production-shaped as a workflow, but it is not yet a full Agent runtime.

## 3. Old Agent Docs Review

| File | Version / Time | Current Content Summary | Outdated | Suitable for M5 Direct Reuse | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `AGENTS.md` | v1.0.2 rules | Collaboration rules, old v1.0.x roadmap, future AI Agent mention, no proactive LangGraph / multi-agent / RAG rule | Yes | No | Keep as repo instruction reference only; do not use as M5 blueprint. |
| `CLAUDE.md` | v1.0.2 rules | Similar to `AGENTS.md`, old phase and roadmap language | Yes | No | Historical collaboration reference only. |
| `Agent.md` / `agent.md` | Not found | No root product Agent design file found | N/A | No | M5 must create new design based on current code. |
| archived frontend rules docs | 2026-05-06 archived material | Historical front-end development configuration and multi-role development description | Yes | No | Keep archived; not product Agent architecture. |
| `docs/architecture/项目架构说明.md` | v0.5.6 era | Older architecture overview and module map | Yes | Partial | Reuse only high-level module awareness. |
| `docs/architecture/开发路线图.md` | 2026-06-01 | Historical v0.5 to v1.0 roadmap | Yes | Partial | Useful for history, not for M5 execution. |
| `docs/reports/v1.0.0-architecture-optimization-plan.md` | v1.0.0 | Warns not to package future LangGraph / Multi-Agent / RAG as completed | Partly | Partial | Reuse the caution principle. |
| `docs/reports/m4-7-full-project-scope-coupling-audit.md` | M4.7 | Identifies missing tool registry, agent state, step trace, verifier, persistence | No for this topic | Yes as evidence | Reuse as readiness evidence. |
| `docs/reports/m4-7-1-4-ai-sql-history-hardening.md` | M4.7 | States current trace is not complete Agent trace | No for this topic | Yes as evidence | Reuse as gap evidence. |
| `docs/reports/m4-7-2-state-boundary-cleanup.md` | M4.7 | States Agent still needs registry, state, persistence, verifier, retry | No for this topic | Yes as evidence | Reuse as gap evidence. |
| `README.md` | M4/M4.9 current | Current product status, provider config, demo boundary | No | Partial | Use as current scope reference, not Agent blueprint. |
| `README.en.md` | M4/M4.9 current | English current product status and setup | No | Partial | Use as status reference only. |
| `CURRENT_SESSION.md` | v1.4.1-m4 closed | M4 closed, M5 planned, not started | Current | Partial | Use as session status source. |

Audit conclusion:

```text
旧 Agent 文档只能作为历史参考，M5 需要基于当前代码重新设计。
```

Specific findings:

- Older docs still contain v1.0.x status and roadmap language.
- Archived Agent-related docs do not match current M4/M4.9 engineering state.
- Some historical docs mention multi-role or future Agent-like capabilities that are not implemented product runtime.
- M4.7 reports are useful because they accurately identify current Agent gaps.
- No old Agent doc should be directly reused as the M5 execution blueprint.

## 4. Current Pipeline Audit

Line count snapshot:

| File | Lines | Current Responsibility | Complexity Risk | M5 Agent Impact | Recommendation |
| --- | ---: | --- | --- | --- | --- |
| `backend/services/ai_analyst.py` | 1017 | LLM calls, SQL generation, explanation, insights, chart suggestion, semantics, planning, anomaly interpretation, evaluation | Large mixed service; provider calls and feature logic are concentrated | Many functions can become tool adapters, but the file should not keep absorbing Agent runtime | Wrap existing functions behind tools first; refactor later. |
| `backend/services/ai_pipeline.py` | 800 | Fixed workflow for AI query and autonomous multi-step analysis; token tracking, guardrails, trace, SQL execution | Orchestrates too many responsibilities; close to Agent but not a stateful Agent runtime | Best source for M5.2 adapters; should not become the Agent runner directly | Add Agent runner outside this file in M5.1/M5.2, keep behavior stable. |
| `backend/routes/ai.py` | 659 | AI API endpoints, request models, streaming endpoints, schedule endpoints, route-level orchestration | Route file is large; request models and orchestration live together | New Agent APIs should avoid increasing route complexity | Keep thin routes for Agent endpoints and move lifecycle into backend Agent module later. |
| `backend/services/schema_semantics.py` | 154 | Static semantic hints for column names and table intent | Static mapping has limited generalization | Useful as supporting evidence for inspect/profile tools | Reuse as optional context, not a core reasoning engine. |
| `frontend-react/src/components/investigation/investigation-workspace.tsx` | 595 | Multi-step analysis UI, streaming consumption, selected table context, run update | Large component with orchestration and rendering mixed | Agent timeline UI could make it larger if added directly | M5.4 should split timeline/evidence/detail components. |
| `frontend-react/src/stores/analysis-store.ts` | inspected | Local analysis run state, persisted in localStorage, trims events and reports | localStorage is not enough for Agent audit trail | Confirms need for backend Agent persistence | Keep as UI cache; backend should own Agent run source. |
| `frontend-react/src/services/api/ai.ts` | inspected | AI API client, streaming event types, LLM metadata | Types are workflow-oriented, not Agent-run-oriented | Can guide Agent API response shape | Add separate Agent client types later, do not overload existing stream events. |
| `backend/services/guardrails.py` | inspected | Pipeline-level analysis guardrails | Useful but scoped to current workflow, not generic tool guardrails | Reusable ideas: max steps, SQL count, timeouts | Extract concepts into Agent guardrails in M5.1+. |
| `backend/services/trace.py` | inspected | Records LLM calls, plans, guardrail violations in in-memory trace object | Not persisted Agent transcript | Useful source for trace normalization | M5 needs persistent step/tool trace. |
| `backend/runtime/token_budget.py` | inspected | Operation and workflow budget accounting | Already useful for bounded runs | Reuse in Agent runner | Add per-run budget metadata in AgentRun. |
| `backend/services/llm_runtime.py` | inspected | Provider selection and fallback behavior | Fallback metadata exists but simulated result is not first-class Agent status | M5 must expose `is_simulated` consistently | Add provider_requested/provider_used/is_simulated contract. |
| `backend/services/query_history.py` | inspected | Query history with in-memory ring and DuckDB persistence fallback | Query-centric, not Agent run history | Not sufficient for Agent run persistence | Introduce agent_runs/steps/tool_calls tables. |
| `backend/services/profiler.py` | inspected | Table profile stats | Low-risk Agent tool candidate | Good `profile_table` implementation source | Wrap as first-class tool. |
| `backend/services/anomaly_detector.py` | inspected | Statistical anomaly detection | Useful but additional tool complexity | Candidate Future tool | Keep outside M5.1 core tool set. |
| `backend/utils/llm_sql.py` and `backend/services/sql_validator.py` | inspected | SQL extraction, readonly validation, quality gates | Critical safety path | Core for `execute_readonly_sql` | Reuse and strengthen in guardrails. |

Pipeline core files:

- `backend/services/ai_pipeline.py`
- `backend/services/ai_analyst.py`
- `backend/routes/ai.py`
- `backend/services/guardrails.py`
- `backend/services/trace.py`
- `backend/runtime/token_budget.py`
- `backend/services/llm_runtime.py`

Logic that can become Agent tools:

- Schema inspection from table metadata.
- Table profiling from profiler / analyze route.
- NL to readonly SQL generation.
- Readonly SQL execution.
- Summary / findings generation.
- Report building.
- Later: anomaly detection and chart suggestion.

Logic that should not keep accumulating in current files:

- Agent state machine.
- Tool registry.
- Tool-call transcript persistence.
- Agent-run recovery.
- Agent-specific evaluation.
- Frontend Agent timeline rendering inside the existing large workspace component.

## 5. Capability Inventory

| Capability | Status | Evidence File | Reuse in M5 | Notes |
| --- | --- | --- | --- | --- |
| plan generation | Implemented | `backend/services/ai_analyst.py`, `backend/routes/ai.py`, `backend/services/ai_pipeline.py` | Yes | Existing plan generation is workflow-oriented, not Agent state. |
| SQL generation | Implemented | `backend/services/ai_analyst.py`, `backend/utils/llm_sql.py` | Yes | Wrap as `generate_sql`. |
| readonly SQL validation | Implemented | `backend/services/sql_validator.py`, `backend/utils/llm_sql.py` | Yes | Core guardrail. |
| SQL execution | Implemented | `backend/services/data_service.py`, `backend/services/query_executor.py`, `backend/services/ai_pipeline.py` | Yes | Wrap as `execute_readonly_sql`. |
| summary generation | Implemented | `backend/services/ai_analyst.py`, `backend/services/ai_pipeline.py` | Yes | Wrap as `summarize_findings`. |
| trace | Partially implemented | `backend/services/trace.py`, streaming events in `frontend-react/src/services/api/ai.ts` | Partial | This is pipeline trace, not Agent step/tool-call transcript. |
| guardrails | Partially implemented | `backend/services/guardrails.py`, SQL validator | Yes | Needs Agent-level tool guardrails. |
| token budget | Partially implemented | `backend/runtime/token_budget.py`, `backend/services/ai_pipeline.py` | Yes | Existing workflow budget should become AgentRun metadata. |
| history | Partially implemented | `backend/services/query_history.py`, `frontend-react/src/stores/analysis-store.ts` | Partial | Query history and UI localStorage are not Agent run persistence. |
| analysis detail | Implemented for current workflow | `frontend-react/src/app/analysis/[id]`, `analysis-store.ts` | Partial | Needs backend Agent report source. |
| provider fallback | Implemented | `backend/services/llm_runtime.py` | Yes | M5 must expose provider_requested/provider_used/is_simulated. |
| mock result | Implemented | `backend/services/llm_runtime.py`, Mock provider docs | Yes | Must be clearly marked simulated in Agent outputs. |
| schema semantics | Partially implemented | `backend/services/schema_semantics.py` | Partial | Static mapping; useful as evidence, not full semantic layer. |
| table profiling | Implemented | `backend/services/profiler.py`, `backend/routes/analyze.py` | Yes | Wrap as `profile_table`. |
| anomaly detection | Implemented | `backend/services/anomaly_detector.py`, `backend/services/ai_analyst.py`, `backend/routes/ai.py` | Future | Exists, but should not be first core tool until Agent runtime is stable. |
| chart suggestion | Implemented | `backend/services/ai_analyst.py`, `backend/routes/ai.py` | Future | Useful Future tool. |
| agent run persistence | Not implemented | Search found no `agent_runs` runtime table | No | Required for M5.3. |
| tool registry | Not implemented | Search found docs-only references | No | Required for M5.1. |
| agent state machine | Not implemented | Search found no runtime Agent state model | No | Required for M5.1. |
| checkpoint / resume | Not implemented | Frontend has interrupted UI recovery only | No | Future after persistence. |
| human approval | Not implemented | No product approval flow found | No | Reserve state only; M5 readonly tools do not block. |

Important distinction:

- Current trace is not Agent trace.
- Current guardrails are not complete Agent guardrails.
- Current history is not backend Agent run persistence.
- Current Mock fallback must not be presented as real provider output.

## 6. Recommended Agent Direction

Recommended direction:

```text
Single Data Analyst Agent
```

Design principles:

1. Prefer simple workflow first, then add autonomy only where needed.
2. Single Agent + tools is enough for the current product stage.
3. Tool interfaces must have clear Pydantic input/output schema.
4. Agent must have step limit, timeout, retry, and budget guard.
5. SQL must pass readonly validation.
6. Every tool call must have trace and evidence.
7. Mock fallback must be explicitly marked simulated.
8. Run state must be persisted by backend, not only localStorage.
9. Evaluation must cover tool-call transcript, not only final text.
10. M5 should not introduce LangGraph / RAG / multi-agent complexity.

## 7. Why Not Multi-Agent / LangGraph / RAG

| Option | Decision | Reason |
| --- | --- | --- |
| Multi-Agent | Do not implement in M5 | Current need is auditable single-run data analysis, not role delegation. Multi-Agent would add coordination overhead before tool/state/persistence exist. |
| LangGraph | Do not introduce in M5 | Existing system already has enough orchestration complexity. M5 needs contract and runtime discipline before graph framework complexity. |
| RAG | Do not implement in M5 | Current data source is uploaded tabular data in DuckDB. M5 does not require document retrieval or vector memory. |

## 8. Proposed Architecture

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

Proposed backend modules for later stages:

| Module | Responsibility |
| --- | --- |
| `backend/agent/contracts.py` | Pydantic contracts for Agent run, step, tool call, summary. |
| `backend/agent/models.py` | Agent state and domain model. |
| `backend/agent/tools.py` | Tool Registry and tool adapters. |
| `backend/agent/runner.py` | State machine, execution loop, retry, timeout. |
| `backend/agent/planner.py` | Bounded plan generation. |
| `backend/agent/guardrails.py` | Agent-level guardrails. |
| `backend/agent/persistence.py` | DuckDB persistence for agent_runs / agent_steps / agent_tool_calls. |
| `backend/agent/tracing.py` | Trace and evidence normalization. |
| `backend/agent/evals.py` | Agent transcript and guardrail regression tests. |

First core tools:

| Tool | Purpose |
| --- | --- |
| `inspect_schema` | Get table schema and column metadata. |
| `profile_table` | Produce row count, nulls, and stats. |
| `generate_sql` | Generate readonly SQL from goal and schema. |
| `execute_readonly_sql` | Execute validated readonly SQL. |
| `summarize_findings` | Summarize evidence into findings. |
| `build_report` | Build final Agent report from steps and findings. |

Guardrails:

- `max_steps=5`
- `max_sql_calls=5`
- `max_runtime_seconds=120`
- `per_tool_timeout_seconds=30`
- readonly SQL validation
- row limit
- Pydantic validation
- provider fallback simulated marking
- required trace id
- required evidence refs

Persistence:

- `agent_runs`
- `agent_steps`
- `agent_tool_calls`

Frontend UX:

- Agent Run mode.
- Plan panel.
- Tool call timeline.
- SQL evidence panel.
- Findings panel.
- Trace panel.
- simulated fallback badge.
- Agent run as first-class History record.
- Detail page supports Agent report and transcript.

## 9. M5 Split Plan

| Stage | Goal | Scope | Acceptance |
| --- | --- | --- | --- |
| M5.0 | Design Lock | docs only | design accepted |
| M5.1 | Contracts + Tool Registry Mock | backend contracts/tools only | deterministic mock run |
| M5.2 | Wrap Existing Pipeline Tools | connect existing plan/sql/execute/summary | no behavior regression |
| M5.3 | Persistence + Trace | agent_runs/steps/tool_calls | backend history source |
| M5.4 | Frontend Agent UI | timeline/evidence/detail | user can inspect run |
| M5.5 | Agent Evals | transcript/tool-call tests | regression suite |

## 10. What Was Not Changed

- 未修改前端源码。
- 未修改后端业务逻辑。
- 未创建 Agent 代码。
- 未改数据库。
- 未改 Docker / Compose。
- 未开始 M5.1 实现。
- 未提交 environment files。
- 未打 tag。

## 11. Next Step

等待用户审查。

通过后进入：

```text
M5.1 Contracts + Tool Registry Mock
```

M5.1 前不要实现真实 Agent orchestration，也不要引入多 Agent、LangGraph 或 RAG。
