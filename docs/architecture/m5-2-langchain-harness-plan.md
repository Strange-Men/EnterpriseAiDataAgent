# M5.2 Optional LangChain Harness Plan

> Status: M5.2.0 planning lock
> Date: 2026-06-30
> Source of truth: `docs/architecture/m5-m6-agent-roadmap.md`, `docs/architecture/m5-agent-design.md`

## 1. Purpose

This document locks the boundary for the M5.2 Optional LangChain Harness MVP.

The goal is to prevent a future LangChain adapter from taking ownership of EAI native contracts, persistence, tool registry, trace, evidence, fallback metadata, or runtime semantics.

M5.2.0 is planning only. It does not install dependencies, create adapter code, or change Agent runtime behavior.

## 2. Why M5.2 Exists

M5.2 does not exist to rewrite the Agent.

M5.2 exists to verify whether LangChain can be used as an optional tool-calling harness while preserving the M5.1 native Agent foundation:

- native contracts remain the source of truth
- EAI Tool Registry remains the tool owner
- EAI readonly SQL guardrail remains mandatory
- simulated and fallback metadata remain explicit
- native mock runner remains available if the adapter fails

## 3. M5.2 Scope

M5.2 may do:

- add an optional LangChain adapter after approval
- expose the existing M5.1 mock-safe tools to LangChain
- normalize LangChain results back into EAI `AgentRun`, `AgentStep`, `ToolCall`, `ToolResult`, and `EvidenceRef`
- keep the native mock runner as the default runnable path
- add focused adapter tests

M5.2 must not do:

- LangGraph
- LangSmith binding
- RAG
- Multi-Agent
- persistence
- FastAPI route
- frontend UI
- real LLM smoke
- existing AI pipeline integration
- real DuckDB execution

## 4. Dependency Strategy

M5.2.0 does not install dependencies.

M5.2.1 may evaluate and add LangChain-related dependencies only after user approval.

Any dependency change must be:

- minimal
- explicit in project dependency files
- easy to revert
- covered by focused tests
- validated by backend import and full pytest

Current dependency check:

| Item | Result |
| --- | --- |
| Python version | 3.11.5 |
| project dependency file | `requirements.txt` |
| LangChain in `requirements.txt` | not declared |
| LangGraph in `requirements.txt` | not declared |
| LangChain import in current Python environment | installed |
| LangGraph import in current Python environment | installed |

The current Python environment can find LangChain and LangGraph, but the project does not declare either dependency. M5.2 implementation must not rely on undeclared environment packages. If M5.2.1 proceeds, dependency ownership must be made explicit and reviewed.

## 5. Native Contract Boundary

EAI native contracts remain the source of truth.

LangChain output must normalize back into:

- `AgentRun`
- `AgentStep`
- `ToolCall`
- `ToolResult`
- `EvidenceRef`
- `AgentRunSummary`

LangChain objects must not leak into:

- frontend state
- persistence records
- history
- report detail
- public API response contracts

## 6. Tool Boundary

M5.2 first version may wrap only M5.1 mock-safe tools:

- `inspect_schema`
- `profile_table`
- `execute_readonly_sql`

M5.2 must not wrap:

- `generate_sql`
- `summarize_findings`
- `build_report`
- `detect_anomalies`
- `suggest_chart`
- `business_metric_lookup`

These tools remain for M5.3 pipeline integration or later stages. M5.2 only validates whether LangChain can safely call existing mock-safe tools.

## 7. Adapter File Boundary

Future M5.2.1 may add:

```text
backend/agent/langchain_adapter.py
tests/unit/test_agent_langchain_adapter.py
docs/reports/m5-2-1-langchain-harness-mvp.md
```

M5.2.0 does not create these code files. It records the allowed future boundary only.

## 8. LangChain Adapter Expected Behavior

Future adapter shape:

```text
run_langchain_mock_agent(
  user_goal,
  table_name="mock_sales",
  provider_requested="mock"
) -> AgentRun
```

Behavior requirements:

- `route_intent` remains owned by EAI router
- tools remain owned by EAI `ToolRegistry`
- readonly SQL validation remains owned by EAI tools
- output must be an EAI `AgentRun`
- all mock results must set `is_simulated=true`
- provider fallback metadata must be preserved
- native mock runner remains the fallback path
- no network or real LLM is required for local deterministic tests

## 9. Fallback Strategy

If the LangChain adapter fails, the native mock runner must remain usable.

LangChain adapter failure must not break M5.1 foundation.

LangChain is optional. It must not become the only runnable Agent path.

Required failure behavior:

- return or raise a normalized adapter failure in tests
- preserve native mock runner execution
- keep `provider_used`, `is_simulated`, `fallback_triggered`, `fallback_type`, and `fallback_reason` semantics intact

## 10. Testing Strategy

Future M5.2.1 tests must cover:

- adapter import
- dependency availability
- run result normalized into `AgentRun`
- tool calls normalized into `ToolCall`
- tool results remain `is_simulated=true`
- readonly SQL guardrail still works
- unsupported and ambiguous intents still do not call tools
- native mock runner still passes
- no LangGraph import
- no `ai_pipeline` / `ai_analyst` import
- no network
- no real LLM

Existing M5.1 tests must continue to pass:

```text
tests/unit/test_agent_contracts.py
tests/unit/test_agent_router.py
tests/unit/test_agent_tools.py
tests/unit/test_agent_mock_runner.py
tests/unit/test_agent_foundation_regression.py
```

## 11. Risk Control

Risks to control:

1. LangChain must not become the main architecture.
2. LangChain must not replace EAI native contracts.
3. LangChain must not bypass EAI Tool Registry.
4. LangChain must not bypass readonly SQL guardrails.
5. LangChain must not introduce LangGraph in M5.
6. LangChain must not trigger real LLM access before M5.6.
7. LangChain must not make Agent work more isolated from existing EAI features.
8. M5.3 must connect existing AI pipeline / SQL execution / summary / report capabilities into Agent tools.

## 12. Acceptance for Entering M5.2.1

M5.2.1 can start only when:

- M5.2.0 plan is reviewed
- dependency strategy is clear
- adapter file boundary is clear
- native fallback strategy is clear
- user explicitly approves dependency changes or adapter code

Do not start M5.2.1 from this planning step.
