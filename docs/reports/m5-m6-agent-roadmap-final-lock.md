# M5-M6 Agent Roadmap Final Lock

> Date: 2026-06-30
> Branch: `m5-0-agent-design-version-lock`
> Scope: docs-only roadmap lock

## 1. Goal

Lock the M5 single-agent MVP and M6 multi-agent expansion roadmap before implementation.

This report records the final design decision. It does not start M5.1 and does not implement Agent code.

## 2. Decision

- M5: Single Data Analyst Agent MVP
- M6: Multi-Agent Expansion

M5 remains the production-style MVP for a tool-based, auditable, persistent data analysis Agent.

M6 is reserved for role-specific Agent decomposition after M5 contracts, persistence, trace, guardrails, UI, and evals are stable.

## 3. Why Single Agent First

Single Agent first is the correct EAI path because:

1. Current EAI already has a fixed AI pipeline, so the next engineering step is to turn it into a bounded tool executor.
2. Multi-Agent adds routing, handoff, context transfer, state sync, error propagation, and eval complexity.
3. M5 needs stability in one Agent before role decomposition.
4. M5 can be multi-agent ready through `agent_role`, `agent_name`, `root_run_id`, `parent_run_id`, and handoff metadata.
5. M6 can split responsibilities later without replacing M5 contracts.

## 4. Multi-Agent Ready Design

M5 keeps native EAI contracts as the source of truth:

- `AgentRun`
- `AgentStep`
- `ToolCall`
- `ToolResult`
- `EvidenceRef`
- `IntentRoute`
- `AgentRunSummary`

M5 persistence reserves:

- `agent_role`
- `agent_name`
- `parent_run_id`
- `root_run_id`
- `orchestrator_run_id`
- `handoff_from`
- `handoff_to`

M5 uses `agent_role="data_analyst"` only. M6 can later add role-specific agents while preserving run, step, tool-call, evidence, and trace records.

## 5. M5 Final Target

```text
M5 final target:
A production-style Single Data Analyst Agent MVP that supports intent routing, bounded tool execution, readonly SQL, evidence-based reporting, backend persistence, trace, mock fallback, optional LangChain harness, frontend Agent Run UI, and deterministic evals.
```

## 6. M5 Stage Plan

| Stage | Goal | Acceptance |
| --- | --- | --- |
| M5.1 | Intent Router + Native Agent Contracts + Mock Tool Registry | deterministic mock route and tool-call transcript |
| M5.2 | Optional LangChain Harness MVP | LangChain run normalized into EAI contracts |
| M5.3 | Existing Pipeline Tool Wrapping | no regression to existing analysis |
| M5.4 | Agent Persistence + Trace | backend run history from `agent_runs`, `agent_steps`, `agent_tool_calls` |
| M5.5 | Frontend Agent UI | style-consistent Agent Run mode, timeline, evidence, detail |
| M5.6 | Agent Evals + Real LLM Smoke | mock stable first, real provider tested last |
| M5.7 | M5 Final Regression + Tag Readiness | final verification passes; tag only after explicit approval |

## 7. M6 Final Target

```text
M6 final target:
A multi-agent data analysis workflow that decomposes the single agent into role-specific agents while preserving M5 contracts, persistence, trace, guardrails, frontend patterns, and fallback behavior.
```

## 8. M6 Stage Plan

Initial M6 plan:

| Stage | Goal | Notes |
| --- | --- | --- |
| M6.1 | Multi-Agent readiness audit | verify M5 contracts and persistence support role-specific runs |
| M6.2 | Supervisor / Orchestrator design | feature-flagged; must preserve M5 single-agent path |
| M6.3 | Role agent split | PlannerAgent, SchemaAgent, SQLAgent, ValidationAgent, ReportAgent candidates |
| M6.4 | Multi-Agent trace and handoff persistence | handoff spans, parent/root run hierarchy |
| M6.5 | Multi-Agent evals | transcript, handoff, failure propagation tests |
| M6.x | Optional business metric glossary / RAG evaluation | only after M5 and M6 core evals are stable |

Candidate M6 roles:

- `SupervisorAgent` / `OrchestratorAgent`
- `PlannerAgent`
- `SchemaAgent`
- `SQLAgent`
- `ValidationAgent`
- `ReportAgent`
- `BusinessMetricAgent`

## 9. Technology Stack

Core backend:

- FastAPI
- Pydantic
- DuckDB

Agent native layer:

- EAI contracts
- runner
- tools
- guardrails
- persistence
- trace / evidence

Optional harness:

- LangChain in M5.2 only, as a lightweight tool-calling harness.

Future orchestrator candidate:

- LangGraph only if graph state, conditional edges, checkpoint, or replay become necessary.

Frontend:

- Next.js
- React
- existing M4 UI system
- existing shell, cards, badges, History, and Detail patterns

Testing:

- pytest
- frontend tests
- transcript evals
- deterministic mock runs
- provider smoke tests after mock path is stable

## 10. What Was Not Changed

- 未合并 master。
- 未开始 M5.1。
- 未实现 Agent 代码。
- 未安装 LangChain / LangGraph。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未修改数据库。
- 未提交 `.env`。
- 未打 tag。

## 11. Next Step

等待用户审查。

通过后才允许合并 M5.0 设计分支到 master。M5.1 应从 native Intent Router、Agent contracts、Mock Tool Registry 开始。
