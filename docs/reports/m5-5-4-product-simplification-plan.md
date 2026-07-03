# M5.5.4 Product Simplification and M5 Completion Plan

## 1. Goal

Refocus M5 on the shortest coherent product path and compress the remaining M5.5 work.

## 2. Files Changed

- `docs/architecture/m5-product-simplification-completion-plan.md`
- `docs/reports/m5-5-4-product-simplification-plan.md`
- `CURRENT_SESSION.md`

## 3. Final M5 Target

M5 is re-locked around this user flow:

```text
Upload Excel/CSV -> ask Agent in natural language -> choose provider -> backend provider decision -> mock fallback -> tool execution -> memory context -> answer, SQL, evidence, warnings, trace.
```

## 4. Compressed M5.5 Path

- M5.5.5 LangChain Single Agent Backend Loop
- M5.5.6 Whole-Site Frontend Simplification
- M5.5.7 Chinese / English Regression and M5 Final Tag

## 5. Whole-Site Frontend Simplification

- Home highlights upload.
- Upload focuses on Excel and CSV.
- Data Preview keeps current table and basic preview.
- Analyze becomes Agent Analysis.
- Expert SQL becomes an advanced entry.
- History, Reports, and Settings are de-emphasized until mature.
- Existing UI system and visual language remain the standard.

## 6. Bilingual Requirement

Remaining M5 frontend work must update both:

- zh-CN
- en-US

This applies to navigation, upload guidance, Agent analysis, provider display, fallback copy, warnings, trace labels, empty states, and error states.

## 7. Provider and Fallback Rules

- Frontend can request Mock, DeepSeek, Doubao, or OpenAI.
- Frontend sends `provider_requested`.
- Backend returns `provider_used`.
- Backend falls back to mock if provider credentials are unavailable, provider execution fails, or provider is unsupported.
- Frontend shows `provider_requested`, `provider_used`, and fallback reason.
- Frontend does not manage provider credentials.

## 8. M5 Non-Goals

- no Multi-Agent
- no complex RAG
- no vector memory
- no permissions system
- no commercial-grade history center
- no new UI library
- no new visual system

## 9. Documentation Slimming

Future development should follow core active documents only:

- `docs/architecture/m5-agent-design.md`
- `docs/architecture/m5-m6-agent-roadmap.md`
- `docs/architecture/m5-5-frontend-agent-ui-integration-plan.md`
- `docs/architecture/m5-product-simplification-completion-plan.md`
- latest active M5.5 report
- `CURRENT_SESSION.md`

Historical phase reports should be archived under `docs/archive/` after M5 final tag.

## 10. Validation

- no backend code changed: passed
- no frontend source changed: passed
- no package or lockfile changed: passed
- safety search: passed

## 11. Next Step

Wait for user review. After merge validation, continue with:

```text
M5.5.5 LangChain Single Agent Backend Loop
```

Do not start M5.5.5 in this round.
