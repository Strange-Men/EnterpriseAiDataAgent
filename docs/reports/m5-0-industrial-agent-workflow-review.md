# M5.0 Industrial Agent Workflow Review

> Date: 2026-06-29
> Branch: `m5-0-agent-design-version-lock`
> Scope: docs-only industrial workflow review

## 1. Goal

Review M5 Agent design against industrial agent workflow principles before merging or implementation.

This round does not merge master, does not start M5.1, does not implement Agent code, and does not install LangChain.

## 2. External References Reviewed

| Source | Key Principle | EAI Design Impact |
| --- | --- | --- |
| [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Start with simple workflows; agents are useful when the model must dynamically direct tool usage. | Keep existing Natural Language Analysis and Expert SQL. Create AgentRun only for multi-step analysis that needs tool transcript and evidence. |
| [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Routing classifies an input and directs it to a specialized path. | Add Intent Recognition and Mode Router before Agent planning. |
| [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/) | Guardrails exist at input, output, and tool boundaries. | Split EAI guardrails into input, intent, tool input, tool output, runtime, and final report layers. |
| [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/) | Traces/spans should capture tool calls, guardrails, generations, and custom events. | EAI Agent trace must capture route decision, tool calls, SQL evidence, fallback, and final evidence mapping. |
| [OpenAI Agents SDK: Results](https://openai.github.io/openai-agents-python/results/) | Run results can retain input guardrail results, output guardrail results, and raw responses. | Persist guardrail results and tool-call transcript in Agent records instead of only final text. |
| [LangChain: Agents](https://docs.langchain.com/oss/python/langchain/agents) | `create_agent` composes model, tools, prompt, and structured output. | LangChain can be a lightweight harness, not EAI's persistence or state owner. |
| [LangChain: Tools](https://docs.langchain.com/oss/python/langchain/tools) | Tools are callable units with defined schema and descriptions. | M5.1 must define native Tool Registry contracts before optional LangChain wrapping. |
| [Microsoft Azure: AI agent orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) | Multi-agent orchestration is for complex specialization and coordination. | EAI should remain Single Data Analyst Agent because the current task is one data-analysis goal over uploaded tables. |

## 3. Design Gaps Found

| Capability | Previous Design Status | Gap | Patch |
| --- | --- | --- | --- |
| Intent Recognition | Not explicit | Agent could be used for every request | Added deterministic intent categories and route contract. |
| Mode Router | Not explicit | No clear rule for using existing analysis vs Agent | Added router responsibilities and selected modes. |
| Mode Fallback | Provider fallback existed | No mode fallback matrix | Added fallback matrix and metadata. |
| Clarification Flow | Only implied | Ambiguous requests could be guessed | Added `clarification_required` path. |
| Unsupported Intent Handling | Only broad non-goals | Unsafe/non-data requests needed pre-tool handling | Added unsupported route and safe guidance behavior. |
| Tool Guardrails | SQL/runtime guardrails existed | Guardrails were not layered | Added guardrail layer table. |
| Output Guardrails | Evidence mentioned | Final report grounding was not a gate | Added final output guardrail and quality gates. |
| Trace / Evidence | Mentioned | Needed route, guardrail, fallback, and evidence transcript | Added trace/evidence section. |
| LangChain Boundary | Present | Needed stronger ownership boundary | Added explicit EAI owns / LangChain may / must not list. |
| Frontend Mode UX | Present | Needed clear non-forcing mode design | Added Analyze mode tabs, Agent timeline metadata, History card fields. |

## 4. Design Patches Applied

Updated `docs/architecture/m5-agent-design.md` with:

- external reference table
- Intent Recognition and Mode Router
- Router Output Contract
- Clarification and Unsupported Intent Handling
- Mode Fallback Matrix
- Industrial Agent Workflow state path
- Agent Quality Gates
- Guardrail Layers
- Trace and Evidence requirements
- stronger LangChain Boundary
- Frontend Mode UX
- updated M5.1 to M5.6 split plan

## 5. Updated EAI Agent Workflow

Final workflow:

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

Key decision:

```text
Not every user request should become AgentRun.
EAI must route simple, SQL-specific, preview, historical, ambiguous, and unsupported requests before Agent execution.
```

## 6. Updated M5 Split Plan

| Stage | Goal | Scope | Acceptance |
| --- | --- | --- | --- |
| M5.0 | Industrial Agent Design Lock | docs only | design accepted |
| M5.1 | Intent Router + Native Agent Contracts + Mock Tool Registry | backend contracts only | deterministic mock route and tool-call transcript |
| M5.2 | Optional LangChain Harness MVP | wrap 3 safe tools | LangChain run normalized into EAI contracts |
| M5.3 | Existing Pipeline Tool Wrapping | generate_sql / execute_readonly_sql / summarize_findings | no regression to existing analysis |
| M5.4 | Agent Persistence + Trace | agent_runs / agent_steps / agent_tool_calls | backend run history |
| M5.5 | Frontend Agent UI | mode tabs / timeline / evidence / detail | style-consistent Agent run UX |
| M5.6 | Agent Evals + Real LLM Smoke | transcript tests + provider smoke | mock stable, real provider tested |

This keeps M5.1 native-first. LangChain appears only in M5.2 as an optional harness. Real provider smoke is deferred to M5.6 after mock path, persistence, trace, UI, and evals are stable.

## 7. What Was Not Changed

- 未合并 master。
- 未实现 Agent 代码。
- 未安装 LangChain。
- 未修改前端源码。
- 未修改后端业务逻辑。
- 未修改数据库。
- 未提交 `.env`。
- 未打 tag。

## 8. Next Step

等待用户审查。

通过后再考虑将 M5.0 设计分支合并到 master。M5.1 仍应从 native Intent Router、Agent contracts 和 mock tool registry 开始。
