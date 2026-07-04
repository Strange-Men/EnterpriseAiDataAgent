# M5.5.5 LangChain Single Agent Backend Loop

## 1. Goal

Implement a real LangChain Single Agent backend loop for `/api/agent/runs` while preserving the existing M5.5 frontend contract.

## 2. Branch

- branch: m5-5-5-langchain-single-agent-backend-loop
- continued existing branch: yes

## 3. Files Changed

- backend/agent/contracts.py
- backend/agent/langchain_single_agent.py
- backend/agent/router.py
- backend/routes/agent.py
- tests/unit/test_agent_api_route_skeleton.py
- tests/unit/test_agent_langchain_single_agent.py
- docs/reports/m5-5-5-langchain-single-agent-backend-loop.md
- CURRENT_SESSION.md

## 4. Implemented Scope

- LangChain Core `StructuredTool` based Single Agent service
- route-level `/api/agent/runs` integration
- provider_requested handling
- mock fallback metadata
- AgentRun answer / SQL / evidence / result_preview / warnings / trace / memory_used fields
- AgentRun tool_calls populated from LangChain tool execution
- InMemory AgentRun store compatibility
- old frontend fields preserved

## 5. LangChain Single Agent Location

- implementation: `backend/agent/langchain_single_agent.py`
- route integration: `backend/routes/agent.py`

## 6. Registered Tools

- inspect_schema
- profile_table
- generate_sql
- execute_readonly_sql
- summarize_findings
- memory_read
- memory_write

## 7. Reused Existing Capabilities

- provider runtime and mock fallback metadata from `backend.services.llm_runtime`
- SQL generation entry from existing AI analyst service
- read-only SQL guardrail and executor adapter
- DuckDB read-only executor when a table exists
- deterministic mock-safe Agent tools when a table is absent
- AgentRun / AgentStep / ToolCall contracts
- InMemoryAgentRunStore route persistence boundary
- warning and trace metadata fields

## 8. Provider Fallback Behavior

- `provider_requested=mock` runs in mock mode and remains zero-config.
- supported but unavailable providers, such as DeepSeek without credentials, fall back to mock.
- unsupported provider values are controlled and fall back to mock with `fallback_reason`.
- the backend owns `provider_used`, `fallback_triggered`, and `fallback_reason`.

## 9. API Compatibility

`POST /api/agent/runs` remains compatible with the M5.5.3 frontend Result Card fields:

- run_id
- status
- intent
- provider_requested
- provider_used
- fallback_triggered
- is_simulated

The response now also includes:

- answer
- sql
- evidence
- result_preview
- warnings
- trace
- tool_calls
- memory_used

`mode=simulated_chain` remains disabled at the route level.

## 10. What M5.5.5 Does Not Do

- no Multi-Agent
- no graph orchestration
- no complex RAG
- no vector memory
- no frontend changes
- no README changes
- no package.json / lockfile changes
- no real API key
- no tag

## 11. Validation

- backend import: passed (`backend import OK`)
- focused Agent tests: 243 passed
- full pytest: passed (`802 passed, 31 skipped`)
- ruff check: full repository `ruff check` failed on pre-existing archived/test lint issues; changed-file ruff check passed
- smoke test: passed
  - mock provider returned 200 with answer / SQL / evidence / warnings / trace / tool_calls
  - unavailable or unsupported provider returned 200 with `provider_used=mock` and `fallback_reason`
  - empty input returned 422
- safety search: passed, no matches
- no frontend-react/src changes: confirmed
- no README changes: confirmed
- no package.json / lockfile changes: confirmed

## 12. Next Step

After user review, enter:

```text
M5.5.5 Merge Validation
```

Do not start M5.5.6 in this round.
