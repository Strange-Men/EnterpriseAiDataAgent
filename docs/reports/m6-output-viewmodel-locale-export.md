# M6 Output ViewModel Locale Export

> Date: 2026-07-08
> Stage: M6 five-round route, Round 3

## 1. Round Name

This round implements **BusinessReportViewModel + locale pass-through + Export cleanup unification**.

It starts from latest `master` commit `6355a9d`, after:

- Round 1 SQL UI Layout Hotfix was merged.
- Round 2 LangChain compliance + LangGraph architecture README documentation was merged.

## 2. Scope Control

This round is the latest five-round technical route's third round.

Completed in scope:

- Added backend `business_report_view_model`.
- Added first-class `locale` to Agent API/runtime contracts.
- Kept legacy `business_report` compatibility.
- Made frontend Agent run requests send `locale`.
- Made frontend UI and Markdown / HTML export prefer the ViewModel.
- Cleaned technical evidence, system-log evidence, raw objects, and semi-technical opportunity fields from the main business-facing output.
- Kept SQL UI Layout Hotfix behavior intact.

Not done in this round:

- No Intent Router implementation.
- No `data_table` generation logic.
- No LangGraph MVP code.
- No README / LangGraph architecture text changes.
- No M6.9.
- No tag.

## 3. Changed Files

Backend:

- `backend/agent/business_report_view_model.py`
- `backend/agent/contracts.py`
- `backend/agent/runtime.py`
- `backend/agent/api_contracts.py`
- `backend/agent/langchain_single_agent.py`

Frontend:

- `frontend-react/src/services/api/agent.ts`
- `frontend-react/src/services/api.ts`
- `frontend-react/src/stores/astryx-workbench-store.ts`
- `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx`
- `frontend-react/src/utils/business-report-export.ts`

Tests:

- `tests/test_m6_output_viewmodel_locale_export.py`
- `tests/unit/test_agent_api_contracts.py`
- `frontend-react/src/services/__tests__/api.test.ts`
- `frontend-react/src/utils/__tests__/business-report-export-viewmodel.test.ts`
- `frontend-react/src/utils/__tests__/business-report-export-regression.test.ts`
- `frontend-react/src/components/astryx/__tests__/business-report-view.test.tsx`
- `frontend-react/src/components/astryx/__tests__/manual-fix1-workbench.test.tsx`

Docs:

- `docs/reports/m6-output-viewmodel-locale-export.md`
- `CURRENT_SESSION.md`
- `docs/DEV_STATUS.md`
- `docs/PROJECT_CONTEXT.md`

## 4. BusinessReportViewModel Design

The new backend ViewModel lives in:

- `backend/agent/business_report_view_model.py`

It is a presentation-focused layer:

```text
business_report
-> BusinessReportViewModel
-> UI
-> Markdown export
-> HTML export
```

It does not route intent, plan tools, execute SQL, or generate ranking data tables.

## 5. ViewModel Fields

The ViewModel includes:

- `title`
- `locale`
- `provider_badge`
- `provider_notice`
- `is_simulated`
- `sections`
- `overall_assessment`
- `priority_actions`
- `risks_and_opportunities`
- `key_evidence`
- `limitations`
- `next_questions`
- `technical_note`
- `data_table`

`data_table` is reserved as an optional placeholder and is currently emitted as `null`. This round does not implement `ranking_summary` or `data_table` generation.

## 6. Locale Pass-through

Frontend Agent requests now send locale as a first-class field:

- Chinese UI: `zh-CN`
- English UI: `en-US`

The frontend still passes legacy `metadata.language` for compatibility.

Backend contracts now accept and normalize `locale`:

- `zh`, `zh-CN`, `cn` -> `zh-CN`
- `en`, `en-US` -> `en-US`
- invalid values -> `zh-CN`

The API-to-runtime mapper preserves existing metadata and adds `language` / `locale` for old backend paths.

## 7. Chinese Output Cleanup

Chinese ViewModel output removes or rewrites:

- `object_type`
- `object_name`
- `score`
- evidence dicts
- raw JSON
- `trace`
- `tool_calls`
- SQL content
- `impact`
- `severity`
- `confidence`
- dynamic P90
- Top/Bottom evidence
- field-validation system logs
- business-term mapping system logs

The Chinese report uses business-facing sections:

- 总体判断
- 最优先的 3 条行动建议
- 主要风险与机会
- 关键数据依据
- 数据局限
- 下一步可以继续问
- 技术说明

## 8. Pure-English Output

English ViewModel and export labels use English-only section labels:

- Overall Assessment
- Priority Actions
- Main Risks and Opportunities
- Key Evidence
- Data Limitations
- Follow-up Questions
- Technical Note
- Demo mode
- Model fallback result

The ViewModel and export tests guard against common Chinese labels leaking into English output.

## 9. Markdown / HTML Export Unification

`frontend-react/src/utils/business-report-export.ts` now accepts:

- `business_report_view_model`
- legacy `business_report`

The export helper prefers ViewModel input and converts it into the legacy export structure internally. If ViewModel is missing, legacy `business_report` still works through the existing cleanup path.

Markdown and HTML share the same cleaned structure. English Markdown now uses:

- `# Business Diagnosis Report`

Chinese Markdown continues to use:

- `# 业务健康度诊断报告`

## 10. Growth Opportunity Cleanup

Growth-opportunity objects are converted from semi-technical shapes such as:

```json
{"object_type": "region", "object_name": "East China", "score": 62.93, "evidence": {...}}
```

into business-facing language:

- Chinese: `机会对象：East China。为什么是机会：该对象具备一定业务规模，需要结合退款率、毛利率和满意度设置护栏。建议动作：先选择代表商品或渠道做小流量试点。`
- English: `Opportunity: East China. Why it matters: it has meaningful business volume and should be evaluated with refund, margin, and satisfaction guardrails. Suggested action: run a small controlled test before scaling investment.`

## 11. Provider Notice Unification

The ViewModel emits one provider notice at most:

- `mock`: demo-mode notice.
- `fallback`: simulated-result notice with readable reason.
- `live_success`: no fallback banner.
- `error`: model-call failure notice.

The UI still renders its existing provider banner. The ViewModel notice is used by export and downstream ViewModel consumers so exported reports do not repeat fallback/mock text.

## 12. Legacy Compatibility

The backend keeps `business_report` unchanged for old clients and tests.

The frontend stores both:

- `businessReport`
- `businessReportViewModel`

The UI converts ViewModel into the existing Business Report display shape, so the current workbench layout remains stable. If ViewModel is absent, old `business_report` fallback rendering remains available.

## 13. Validation

Backend:

- `python -c "from backend.main import app; print('backend import OK')"` -> passed
- `python -m pytest tests/test_m6_output_viewmodel_locale_export.py -q` -> `5 passed`
- `python -m pytest tests/test_m6_manual_fix2_business_report_contract.py -q` -> `13 passed`
- `python -m pytest tests/test_m6_manual_fix3_provider_status.py -q` -> `8 passed`
- `python -m pytest tests/test_m6_manual_polish_regression_sql_i18n_doubao_export.py -q` -> `8 passed`
- `python -m pytest tests/test_m6_business_capability_pressure.py -q` -> `7 passed`
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> `13 passed`
- `python -m pytest tests/unit/test_agent_api_contracts.py -q` -> `7 passed`
- `python -m pytest tests/ -x -q --ignore=tests/ai` -> `909 passed`

Frontend:

- `npm ci` -> passed; npm reported existing audit advisories.
- `npx tsc --noEmit` -> passed
- Focused ViewModel/export/API/business-report/SQL layout tests -> passed
- `npm run test` -> `53 files`, `1214 tests passed`
- `npm run build` -> passed; existing lint warnings remain unrelated to this round.

## 14. Safety Search

Safety search was executed against `backend`, `frontend-react/src`, `tests`, `docs`, `CURRENT_SESSION.md`, and `README.md`.

Result:

- No real API key, `.env` content, bearer token value, provider secret, or private-study content was added by this round.
- Matches were existing environment-variable names such as `DOUBAO_API_KEY`, `DEEPSEEK_API_KEY`, `MIMO_API_KEY`, and `API_KEY`.
- Additional matches were existing auth middleware strings, test placeholders such as `placeholder-secret`, historical documentation, and pre-existing archive/report wording.
- The exact `findstr /s` command can traverse dependency folders on Windows; a narrowed source scan excluding dependency/build folders found no newly introduced secret or private-content issue.

## 15. Remaining Risks

- The ViewModel performs deterministic cleanup and field-label conversion; it is not a full translation engine.
- English reports are guarded by ViewModel/export cleanup, but old raw `answer` text can still contain legacy language if a client bypasses ViewModel.
- `data_table` is only reserved in this round; ranking/statistics questions still need Round 4 Intent Router + data_table output.
- UI still uses the existing Business Report component via ViewModel-to-legacy conversion; a deeper ViewModel-native renderer can be considered after Round 4 if needed.

## 16. Next Recommendation

Proceed to Round 4: backend Intent Router + `data_table` output mode.
