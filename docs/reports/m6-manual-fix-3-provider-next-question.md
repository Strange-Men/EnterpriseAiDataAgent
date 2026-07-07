# M6 Manual Fix 3 Provider Transparency And Next Questions

> Date: 2026-07-07
> Stage: M6 Manual Fix 3

## 1. Stage

This round implements Manual Fix 3 from `docs/reports/m6-manual-fix-plan.md`: provider transparency, fallback visibility, next-question click-to-fill interaction, and final regression.

The work started from latest `master` after Manual Fix 2 had been merged. The starting commit was `2ab62acf0a87c4b4de8482d9985b90ec307eddfb`. Before creating the Fix 3 branch, the latest master GitHub Actions run was checked and was green.

## 2. Scope Control

This round strictly stays inside Manual Fix 3:

- Adds a product-level provider status contract to the backend Agent response.
- Makes Mock, live model success, fallback, and error states explicit.
- Keeps fallback output visible as simulated output instead of presenting it as a real Doubao result.
- Adds frontend provider status banners.
- Adds click-to-fill behavior for `business_report.next_questions`.
- Runs regression against Fix 1, Fix 2, M6.7 pressure tests, and M6 backend/frontend checks.

This round does not:

- Start M6.9.
- Create a tag.
- Change the async upload task model from Manual Fix 1.
- Change the recommendation output contract or report order from Manual Fix 2.
- Add Multi-Agent, LangGraph, or RAG.
- Restore the Sidebar.
- Restore the five-tab navigation.

## 3. Changed Files

Backend:

- `backend/agent/contracts.py`
- `backend/agent/langchain_single_agent.py`
- `backend/agent/business_orchestration.py`

Frontend:

- `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx`
- `frontend-react/src/components/astryx/__tests__/business-report-view.test.tsx`
- `frontend-react/src/components/astryx/__tests__/manual-fix1-workbench.test.tsx`
- `frontend-react/src/services/api.ts`
- `frontend-react/src/services/api/agent.ts`
- `frontend-react/src/stores/astryx-workbench-store.ts`
- `frontend-react/src/i18n/en.ts`
- `frontend-react/src/i18n/zh.ts`

Tests:

- `tests/test_m6_manual_fix3_provider_status.py`

Docs:

- `docs/reports/m6-manual-fix-3-provider-next-question.md`
- `CURRENT_SESSION.md`
- `docs/DEV_STATUS.md`
- `docs/PROJECT_CONTEXT.md`

## 4. Backend Provider Status Contract

The backend Agent response now exposes product-level provider state fields:

```json
{
  "requested_provider": "doubao",
  "provider_used": "mock",
  "provider_status": "fallback",
  "fallback_reason": "Doubao request timed out after 30s",
  "is_simulated": true
}
```

The provider status enum is defined in `backend/agent/contracts.py`:

- `live_success`: a real provider completed successfully.
- `mock`: the user explicitly selected Mock.
- `fallback`: a requested real provider failed or timed out and the run used Mock fallback.
- `error`: the requested provider failed and no successful fallback result should be presented as success.

The backend keeps legacy fields for compatibility:

- `provider_used`
- `fallback_triggered`
- `fallback_reason`
- `warnings`
- `trace`
- `tool_calls`

Frontend display uses `provider_status` first and only falls back to legacy fields when the new field is absent.

## 5. Provider State Rules

Implemented rules:

- User requests `mock`:
  - `provider_status = "mock"`
  - `provider_used = "mock"`
  - `is_simulated = true`
  - `fallback_triggered = false`

- User requests `doubao` and the provider succeeds:
  - `requested_provider = "doubao"`
  - `provider_used = "doubao"`
  - `provider_status = "live_success"`
  - `is_simulated = false`

- User requests `doubao` but the provider fails or times out and fallback is used:
  - `requested_provider = "doubao"`
  - `provider_used = "mock"`
  - `provider_status = "fallback"`
  - `is_simulated = true`
  - `fallback_triggered = true`
  - `fallback_reason` is readable and sanitized.

- User requests a real provider and the run fails without usable fallback:
  - `provider_status = "error"`
  - `is_simulated = false`
  - the frontend must show failure instead of a fake successful report.

## 6. Doubao Investigation Checklist

Checklist result for this round:

- Frontend provider selector already passes provider values into the Agent request through the existing Agent request path.
- Backend now records both `requested_provider` and legacy `provider_requested`.
- Doubao environment names are still owned by the existing provider configuration path; this round did not add or commit any environment file.
- Doubao timeout/failure is converted into readable `fallback_reason` when fallback is used.
- Agent-level provider metadata and final `AgentRun` fields are synchronized before the run is returned.
- Business orchestration keeps provider metadata outside `business_report` so the user-facing report remains business-focused.
- Local real Doubao smoke was not executed because no safe local real provider credentials were used in this round. Contract behavior was validated with Mock and monkeypatched provider metadata tests without printing or storing any key.

## 7. Fallback Transparency

Fallback can no longer be presented as a normal Doubao result:

- `provider_status = "fallback"` is explicit.
- `is_simulated = true` is explicit.
- `fallback_reason` is included outside `business_report`.
- `business_report` does not include provider metadata, raw trace, tool calls, run id, or memory.
- Frontend displays a warning banner for fallback results.

Fallback reasons are sanitized before user display. Exception stacks and local path-like details are replaced with readable short text instead of being leaked to the frontend.

## 8. Frontend Provider Banner

The Astryx workbench now displays provider status above the report card:

- `live_success`: normal report display with no fallback banner.
- `mock`: shows a demo-mode notice explaining that the result is simulated.
- `fallback`: shows a yellow warning banner explaining that the model service timed out or was unavailable and the result is simulated.
- `error`: shows an explicit failure state and does not render a fake successful business report.

Display priority:

1. Use `provider_status`.
2. If `provider_status` is missing, fall back to `fallback_triggered`, `provider_used`, and `is_simulated`.
3. If `provider_status = "fallback"`, show the fallback banner even when `provider_used = "mock"`.
4. If `provider_status = "live_success"`, do not infer fallback from unrelated technical detail text.
5. If `is_simulated = true`, show simulation notice unless a more specific provider status already controls the banner.

## 9. Next Question Click-to-fill

`business_report.next_questions` chips are now clickable.

Click behavior:

- fills the full question into the input textarea;
- clears the transient error state;
- scrolls the input area into view;
- focuses the textarea;
- does not auto-submit.

If the user already typed a draft, clicking a chip intentionally replaces it with the selected full question. The chip text can be visually truncated, but the full question is written into the input.

## 10. Submitting State

While an analysis request is submitting, next-question chips are disabled. Clicking a disabled chip does not interrupt the running request and does not mutate the input value.

## 11. Fix 2 Report Structure Preservation

Manual Fix 2 report structure is preserved:

1. Overall judgment.
2. Priority action recommendations.
3. Main risks and opportunities.
4. Key cause explanation.
5. Key evidence.
6. Next questions.
7. Collapsed technical details / data evidence.

Provider banners are rendered above the report body as status notices. They do not reorder the business report content and do not move technical details into the main report.

## 12. Backend Validation

Executed:

- `python -c "from backend.main import app; print('backend import OK')"` -> passed
- `python -m pytest tests/test_m6_manual_fix3_provider_status.py -q` -> `8 passed`
- `python -m pytest tests/test_m6_manual_fix2_business_report_contract.py -q` -> `13 passed`
- `python -m pytest tests/test_m6_manual_fix1_upload_tasks.py -q` -> `6 passed`
- `python -m pytest tests/test_m6_business_capability_pressure.py -q` -> `7 passed`
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> `13 passed`
- `python -m pytest tests/test_m6_business_analysis_tools.py -q` -> `17 passed`
- `python -m pytest tests/test_m6_business_semantic_layer.py -q` -> `9 passed`
- `python -m pytest tests/test_m6_demo_business_dataset.py -q` -> `2 passed`
- `python -m pytest tests/ -x -q --ignore=tests/ai` -> `886 passed`

## 13. Frontend Validation

Node version check:

- `.nvmrc`: not present in `frontend-react`.
- `frontend-react/package.json`: no `engines.node` constraint.
- CI uses Node.js 20.
- Local runtime used for validation: Node.js `v24.15.0`, npm `11.12.1`.

Executed:

- `npm ci` -> passed
- `npx tsc --noEmit` -> passed
- `npm run test` -> `50 files`, `1192 tests passed`
- `npm run build` -> passed

Build warnings were existing lint warnings unrelated to this change:

- `history-stale-table-invalid-record.test.tsx`: unused `entry` dependency warning.
- `drill-down-chain.tsx`: unnecessary `runs` dependency warning.
- `sql-history-panel.tsx`: unnecessary `t` dependency warning.

## 14. CI Workflow

Checked:

- `.github/workflows/ci.yml`

No CI workflow change was needed. Backend CI runs `python -m pytest tests/ -x -q --ignore=tests/ai`, which auto-discovers the new Fix 3 backend test. Frontend CI already runs dependency install, typecheck, tests, and build.

## 15. Safety Search

Safety search command required for this round:

```text
findstr /s /i /n "sk- api_key API_KEY secret SECRET bearer Bearer authorization Authorization 面试 简历 包装 手撕 复习 个人学习 mystudy .agents 手机号 电话 身份证 邮箱" backend frontend-react/src tests docs .github CURRENT_SESSION.md requirements.txt requirements.lock frontend-react/package.json frontend-react/package-lock.json
```

Result: no real API key, `.env`, credential, or private study/interview/resume content was added by this round. The only visible matches in this run were `task-list-item` dependency-name false positives from package metadata; `findstr /s` also traversed `frontend-react/node_modules` package metadata because of the package-file pattern, but no source or committed-secret issue was found.

## 16. Remaining Risks

- Real Doubao live smoke was not executed in this round because no safe local credentials were used.
- Provider status relies on all future provider adapters preserving metadata consistently.
- Frontend fallback display now depends on `provider_status` as the primary contract; older historical records without this field still use legacy fallback logic.
- Next-question click-to-fill overwrites the current draft by design; this is documented and tested, but users may still expect a confirmation if they had typed a long draft.

## 17. Recommendation

Manual Fix 3 is ready for renewed manual testing from `master` after merge.

Recommended next step:

1. Re-run manual tests focused on Doubao/Mock/fallback visibility and next-question interaction.
2. If manual testing passes, create the M6 final tag only after explicit user approval.
