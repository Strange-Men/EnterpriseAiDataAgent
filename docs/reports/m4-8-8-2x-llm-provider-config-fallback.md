# M4-8.8.2.x LLM Provider Config + Mock Fallback

## Goal

Add configurable LLM providers with safe Mock LLM fallback, without exposing or committing secrets, and without starting M5 Agent work.

## Changes

- Added backend LLM runtime configuration for `mock`, `deepseek`, `doubao`, and `mimo`.
- Added deterministic Mock LLM responses for SQL generation, insights, charts, semantics, questions, planning, anomaly interpretation, template adaptation, and self-evaluation.
- Added OpenAI-compatible backend provider adapter for DeepSeek, Doubao, and Mimo.
- Added `llm_provider` request fields to AI API contracts while keeping existing fields backward compatible.
- Added `llm` metadata to AI responses and stream completion events.
- Added an Analyze panel provider selector and persisted provider preference in the workspace store.
- Added fallback notice copy in i18n.
- Added env examples and provider configuration documentation.
- Updated backend and frontend tests for provider selection and fallback.

## Env Design

Mock LLM is the default safe runtime:

- `LLM_MODE=mock`
- `LLM_DEFAULT_PROVIDER=mock`
- `LLM_ALLOWED_PROVIDERS=mock,deepseek,doubao,mimo`
- `LLM_FALLBACK_PROVIDER=mock`
- `LLM_FALLBACK_ON_ERROR=true`

Real provider keys are backend-only:

- `DEEPSEEK_API_KEY`
- `DOUBAO_API_KEY`
- `MIMO_API_KEY`

Frontend env only contains public API URLs and provider names.

## Backend Behavior

- `mock` needs no key and always returns deterministic demo-safe output.
- `deepseek`, `doubao`, and `mimo` use backend OpenAI-compatible `/chat/completions` calls.
- Missing key, base URL, or model falls back to Mock LLM.
- Provider request errors, auth failures, rate limits, timeouts, and parsing failures fall back to Mock LLM.
- Unsupported or disallowed providers return `422`.
- Metadata identifies requested provider, provider used, and fallback reason without exposing secrets.

## Frontend Behavior

- Analyze panel header includes a provider selector:
  - Mock LLM
  - DeepSeek
  - Doubao
  - Mimo
- Selection is persisted in `workspace-store`.
- Analysis requests and streaming analysis requests send `llm_provider`.
- When fallback metadata is present, the UI shows a gentle notice that Mock LLM was used.
- No API key input or key text is exposed in frontend source.

## Tests

Added / updated:

- `tests/test_ai_analyst_retry.py`
- `tests/test_ai_endpoints.py`
- `frontend-react/src/services/__tests__/api.test.ts`
- `frontend-react/src/app/(shell)/__tests__/final-frontend-regression.test.tsx`

## Validation

Validation completed:

- `python -c "from backend.main import app; print('backend import OK')"` — PASS
- `python -m pytest -q` — PASS, 559 passed, 31 skipped
- `ruff check backend` — PASS
- `cd frontend-react && npx.cmd tsc --noEmit` — PASS
- `cd frontend-react && npm run test` — PASS, 1153 passed
- `cd frontend-react && npm run build` — PASS
- `cd frontend-react && npm run lint` — PASS with existing warnings in analyze detail, history stale-table test, and drill-down-chain.
- Security search — PASS; only env example variable names, backend auth/header code, and token-budget wording matched.

## What Was Not Changed

- No database schema changes.
- No upload flow changes.
- No table selection changes.
- No SQL execution engine changes.
- No M5 Agent work.
- No tag creation.

## Remaining Risks

- Real providers require users to configure keys in the deployment platform.
- API key expiration or quota exhaustion will fallback to Mock LLM.
- This round does not verify paid real model quality.
- Online smoke is still required before M4 final closure.

## Next Step

Run full backend and frontend validation, perform security search, then commit and push the hotfix branch only if all required checks pass.
