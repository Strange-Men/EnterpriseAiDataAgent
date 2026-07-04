# M5 Product Simplification and Completion Plan

## 1. Goal

Refocus M5 on the shortest complete product loop:

```text
Upload Excel/CSV -> ask the Agent in natural language -> choose an API provider -> backend decides provider_used -> mock fallback when needed -> Agent calls tools -> memory context is considered -> answer with SQL, evidence, warnings, and trace.
```

This plan narrows the remaining M5 work so the project can finish a coherent single-agent MVP before any M6 expansion.

## 2. Final M5 Product Target

M5 should complete one understandable workflow:

- User uploads Excel or CSV.
- User previews the current table.
- User asks the Agent a natural language question.
- User may request a provider such as Mock, DeepSeek, Doubao, or OpenAI.
- Backend owns provider selection and returns `provider_requested`, `provider_used`, and fallback reason when fallback happens.
- If provider credentials are missing, provider call fails, or provider is unsupported, backend falls back to mock.
- Agent uses the current table context and available tools.
- Agent considers scoped memory when available.
- Agent returns an answer, generated SQL, evidence references, warnings, and trace metadata.

The final M5 experience should feel like a data-analysis workbench, not a chatbot product.

## 3. Compressed M5.5 Path

M5.5 should be compressed into three remaining steps:

### M5.5.5 LangChain Single Agent Backend Loop

- Complete a single-agent backend loop.
- Keep single-agent scope.
- Support provider request and backend fallback.
- Allow tool execution through the existing controlled tool boundary.
- Return answer, SQL, evidence, warnings, and trace.
- Keep memory scoped and structured.

### M5.5.6 Whole-Site Frontend Simplification

- Simplify the whole product flow, not only Analyze.
- Make upload and Agent analysis the primary path.
- Reduce immature sections that distract from the main path.
- Keep Expert SQL as an advanced mode.
- Keep the current UI system and visual language.

### M5.5.7 Chinese / English Regression and M5 Final Tag

- Run zh-CN and en-US page-level regression.
- Verify upload, preview, Agent run, provider fallback, warnings, and trace display in both languages.
- Confirm M5 out-of-scope items remain out.
- Prepare M5 final tag after validation.

## 4. Whole-Site Frontend Simplification Principles

M5.5.6 should simplify the whole application:

- Home should emphasize uploading data first.
- Upload should focus on Excel and CSV.
- Data Preview should keep only current table context and basic preview.
- Analyze should become the primary Agent Analysis entry.
- Expert SQL should remain available as an advanced entry.
- History, Reports, and Settings should be visually de-emphasized until they are mature enough to support the main path.
- Navigation should guide the user toward Upload -> Preview -> Agent Analysis.
- No new UI library should be added.
- No new animation library should be added.
- No new visual system should be introduced.

## 5. Bilingual Product Requirement

All remaining M5 frontend work must cover:

- zh-CN
- en-US

Both languages should be updated together for:

- navigation labels
- upload guidance
- table preview labels
- Agent input text
- provider labels
- fallback messages
- warning messages
- trace labels
- empty states
- error states

## 6. Provider and Fallback Rules

Frontend may expose provider choices:

- Mock
- DeepSeek
- Doubao
- OpenAI

Backend remains the source of truth for provider execution:

- Frontend sends `provider_requested`.
- Backend decides `provider_used`.
- Backend falls back to mock when provider credentials are unavailable, provider execution fails, or the provider is unsupported.
- Frontend displays `provider_requested`, `provider_used`, and fallback reason.
- Frontend must not handle provider credentials.
- Frontend must not assume the requested provider was actually used.

## 7. M5 Explicit Non-Goals

M5 does not include:

- Multi-Agent
- complex RAG
- vector memory
- permissions system
- commercial-grade history center
- new UI library
- new visual system
- durable multi-table memory browser
- provider credential management UI

## 8. Documentation Slimming Plan

Future M5 implementation should follow only the core documents:

- `docs/architecture/m5-agent-design.md`
- `docs/architecture/m5-m6-agent-roadmap.md`
- `docs/architecture/m5-5-frontend-agent-ui-integration-plan.md`
- `docs/architecture/m5-product-simplification-completion-plan.md`
- latest active M5.5 report
- `CURRENT_SESSION.md`

Historical reports should remain available but should not drive new implementation decisions.

After M5 final tag, older phase reports can be archived under:

```text
docs/archive/
```

Archive rules:

- Move older phase-by-phase reports after the final tag, not during active implementation.
- Keep final tag reports and current active plans discoverable.
- Do not delete historical context.
- Prefer a short index in `docs/archive/README.md` when archiving begins.

## 9. Recommended Next Step

After user review and merge validation, continue with:

```text
M5.5.5 LangChain Single Agent Backend Loop
```

Do not start implementation from this planning branch.
