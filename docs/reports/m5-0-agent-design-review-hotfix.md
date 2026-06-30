# M5.0 Agent Design Review Hotfix

> Date: 2026-06-29
> Branch: `m5-0-agent-design-version-lock`
> Scope: docs-only design review hotfix

## 1. Goal

Review and patch the M5.0 design before implementation.

This hotfix:

- prevents old Agent notes from driving future work
- rechecks anomaly / chart suggestion capability status
- evaluates LangChain MVP feasibility
- strengthens the EAI Agent job definition
- keeps M5.1 unstarted

## 2. AGENTS / Old Agent Docs

| File | Current Version Semantics | Outdated | Context Pollution Risk | This Round Handling |
| --- | --- | --- | --- | --- |
| `AGENTS.md` | Had v1.0.x current status and old phase language | Yes | Yes, because Codex reads it before work | Added current baseline section and changed old roadmap to historical notes. |
| `Agent.md` / `agent.md` | Not found | N/A | No direct file risk | No action. |
| `docs/architecture/m5-agent-design.md` | Current M5 design | No | No | Rebuilt as authoritative M5 design. |
| `docs/VERSIONING.md` | Current version governance | No | No | Added `AGENTS.md` to pre-tag checklist. |
| `CURRENT_SESSION.md` | Current M5.0 status | No | No | Added small hotfix status note. |

Conclusion:

```text
M5 Agent work must follow docs/architecture/m5-agent-design.md.
Older Agent notes are historical references only and must not be used as the execution blueprint.
```

## 3. Capability Recheck

| Capability | Code Evidence | User Visible | M4 Current Formal Capability | M5 First Core Tool | Recommendation |
| --- | --- | --- | --- | --- | --- |
| anomaly detection | `backend/services/anomaly_detector.py`, `/api/ai/anomalies`, `/api/ai/anomalies/stream`, frontend anomaly mode code | Primary mode is feature-flagged off by `showAnomaliesMode=false` | Backend/API implemented, but not stable UI core path | No | Keep as Future tool. |
| chart suggestion | `/api/ai/chart-suggest`, `suggest_charts()`, `AiChart`, frontend chart mode code | Primary mode is feature-flagged off by `showChartsMode=false` | Backend/API implemented, but not stable UI core path | No | Keep as Future tool. |
| table profiling | `backend/services/profiler.py`, `/api/analyze/{table}/profile` | Yes | Stable enough | Yes | Keep as core `profile_table`. |

Design correction:

- Core tools stay small: `inspect_schema`, `profile_table`, `generate_sql`, `execute_readonly_sql`, `summarize_findings`, `build_report`.
- `detect_anomalies` and `suggest_chart` stay Future tools until Agent contracts, persistence, trace, and UI are stable.

## 4. LangChain Feasibility

LangChain is feasible for EAI only as a lightweight harness, not as the architecture owner.

Recommended boundary:

```text
backend/agent/langchain_adapter.py
```

The adapter may:

- expose EAI tools as LangChain tools
- run a minimal tool-calling loop
- return normalized EAI `AgentRun`, `AgentStep`, and `ToolCall` contracts

The adapter must not:

- bypass EAI guardrails
- bypass readonly SQL validation
- bypass persistence
- bypass simulated fallback marking
- require LangGraph
- require LangSmith
- require real provider credentials for local demo

Decision:

```text
Use LangChain only after native EAI contracts are stable.
Do not make LangChain the source of truth for Agent state, persistence, or UI.
```

## 5. LangChain MVP Plan

Goal:

```text
Add a minimal LangChain-backed Single Data Analyst Agent path after base EAI contracts and tools are stable.
```

Stage:

```text
M5.1 native contracts first.
M5.2 optional LangChain adapter after native contracts stabilize.
```

First LangChain MVP tools:

- `inspect_schema`
- `profile_table`
- `execute_readonly_sql`

Acceptance:

- One deterministic Agent run can call at least 2 tools.
- Tool calls are captured in normalized AgentStep / ToolCall records.
- SQL is still readonly validated.
- Mock fallback is visibly simulated.
- Existing AI analysis path remains unchanged.

Non-goals:

- No LangGraph orchestration.
- No multi-agent.
- No RAG.
- No frontend rewrite.
- No dependency installation in this hotfix.

## 6. Agent Job in EAI

The Agent is an auditable data-analysis executor.

It should:

1. Turn a user goal into a bounded analysis plan.
2. Select from a small set of safe tools.
3. Validate every tool input and output.
4. Execute only readonly SQL.
5. Attach evidence to every finding.
6. Persist the full run, steps, and tool calls.
7. Surface trace and simulated/fallback status in the UI.
8. Produce a report that can be inspected later.

It should not:

1. Chat freely without tool evidence.
2. Use hidden model reasoning as final proof.
3. Execute write SQL.
4. Call arbitrary tools.
5. Hide Mock fallback as a real model result.

## 7. Frontend Style Consistency

M5 Agent UI must reuse the M4 visual language:

- existing page shell
- existing cards
- existing badges
- existing dark theme tokens
- existing History card pattern
- existing Detail report layout
- existing toast / fallback notice style

Placement:

- Analyze page: add `Agent Run` mode / tab beside existing natural language analysis.
- Agent panel: show Plan, Current Step, Tool Calls, Evidence, Findings.
- History page: Agent run as a first-class record using the same card style.
- Detail page: Agent report extends current report layout with timeline/evidence sections.

No new visual system.

## 8. Mock and Real LLM Testing Order

M5 implementation order:

1. Deterministic Mock Agent run.
2. Mock tool-call persistence.
3. Mock timeline UI.
4. Mock evals.
5. Real provider smoke with DeepSeek / Doubao / Mimo.

Fallback to Mock must set:

```text
is_simulated = true
fallback_triggered = true
provider_requested = <real provider>
provider_used = mock
```

The UI must show a simulated / fallback badge.

## 9. What Was Not Changed

- 未实现 Agent 代码。
- 未安装 LangChain。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未修改数据库。
- 未开始 M5.1。
- 未打 tag。

## 10. Next Step

等待用户审查。

通过后进入：

```text
M5.1 native Agent contracts and mock tool registry
```
