# M6 Manual Polish Regression｜SQL Editor, English Report, Doubao Timeout, Export Quality

## 1. Round Name

This round is **M6 Manual Polish Regression**. It is a manual-test hotfix after the previous M6 manual polish work, not a new M6.9 stage.

## 2. Starting Point

- Started from latest `master`.
- Created branch: `m6-manual-polish-regression-sql-i18n-doubao-export`.
- Scope was limited to:
  - Advanced SQL editor visibility and generated SQL binding.
  - English-mode Business Report parity.
  - Doubao-only live LLM timeout diagnosis.
  - Markdown / HTML export quality cleanup.

## 3. Stage Boundaries

- M6.9 was not added.
- No tag was created.
- Sidebar and five-page navigation were not restored.
- Multi-Agent, LangGraph and RAG were not introduced.
- No `.env` file or API key was committed.

## 4. Advanced SQL Editor Root Cause

The Query tab numbering normalization had been fixed, but the SQL editor area could still look empty because the SQL workspace container did not provide a stable editor height in the single-page Astryx workbench, and AI-generated SQL was written through a stale active-tab reference in some render paths.

This caused two user-visible symptoms:

- The tab label showed `Query 1`, but the editable code area was not reliably visible.
- AI-generated SQL could complete successfully while the visible active query editor stayed empty.

## 5. Advanced SQL Editor Fix

Changes made:

- Added stable height constraints to the embedded SQL workspace and Monaco editor shell.
- Ensured the current active tab is read from the latest SQL editor store state when AI SQL generation completes.
- Ensured generated SQL is written into the active Query editor value.
- Preserved existing Query label normalization for add / delete / persisted tabs.
- Kept readonly SQL guard and `sql_or_cannot_answer` guard untouched.

## 6. AI Generated SQL Visibility

AI-generated SQL is now inserted into the current active Query editor and can be executed from that query tab. Query switching preserves each tab's own SQL content.

## 7. Query Normalize Status

Query normalization remains intact:

- First tab is `Query 1`.
- Adding tabs produces continuous labels.
- Deleting tabs renumbers the remaining labels.
- Old persisted `Query 2`-only or skipped-number states are normalized without dropping SQL content.

## 8. English Mode `unsupported` Root Cause

English business-report prompts such as `create a business executive-level operational diagnosis report` were being partially misrouted:

- `create` was treated as a destructive SQL keyword even when the user meant "create a report".
- `report` could be interpreted as a history/report lookup rather than a new business report.
- English report rendering did not consistently reuse the Manual Fix 2 business-report order and recommendation vocabulary.

## 9. English Mode Alignment

English mode now follows the same product structure as Chinese mode:

1. Overall assessment
2. Priority action suggestions
3. Main risks and opportunities
4. Key cause explanation
5. Key evidence
6. Follow-up questions
7. Technical details / data evidence

English recommendations render the business fields:

- Action
- Why it matters
- How to do it
- Metrics to watch
- Suggested timeline
- Suggested owner

Bare `unsupported` is no longer shown in the English Business Report path. Missing-field cases use readable limitation text instead.

## 10. English Provider Messaging

English provider status remains aligned with Manual Fix 3:

- `live_success`: normal report, no fallback banner.
- `mock`: demo-mode notice.
- `fallback`: model fallback notice explaining that the live model timed out or was unavailable.
- `error`: explicit failure state, not a fake success.

## 11. Doubao Live LLM Timeout Diagnosis

This round only performed live-provider diagnosis for Doubao, because the user confirmed only Doubao has a real key. DeepSeek / OpenAI / Mimo were not live-tested.

Safe configuration check:

- Doubao key read: yes.
- Doubao base URL host read: `ark.cn-beijing.volces.com`.
- Doubao model read: `doubao-seed-2-0-lite-260428`.
- Connect timeout: 10 seconds.
- Request/read timeout from current environment: 30 seconds.
- Max retries: 1.

No key value was printed or committed.

## 12. Doubao Minimal Prompt Smoke

Minimal prompt:

```text
ping
```

Result:

- Live result: not successful.
- Provider status after fallback: `fallback`.
- Provider used: `mock`.
- Elapsed: 18.715 seconds.
- Fallback reason: `真实模型网络连接失败，已切换为模拟分析结果。`

The failure happened on the minimal prompt, without table data, raw evidence, trace, or a large business-report prompt. Therefore the primary failure category for this environment is **network**, not prompt/token size.

## 13. Doubao Agent Light Smoke

Question:

```text
请用一句话总结当前业务健康度。
```

Result:

- Provider status: `fallback`.
- Provider used: `mock`.
- Elapsed: 38.45 seconds.
- Fallback reason: `真实模型网络连接失败，已切换为模拟分析结果。`
- This simple-summary route did not produce `business_report`, which is expected for the lightweight smoke question.

## 14. Doubao Complex Business Smoke

Question:

```text
请用豆包真实模型生成一份业务负责人能直接执行的经营诊断报告，要求包含优先行动建议、风险依据和下一步动作。
```

Result:

- Provider status: `fallback`.
- Provider used: `mock`.
- Elapsed: 19.82 seconds.
- `business_report`: present.
- Fallback reason: `真实模型网络连接失败，已切换为模拟分析结果。`

## 15. Doubao Failure Category

Category: **network**.

Evidence:

- Doubao key, base URL host, and model were all read.
- Minimal prompt did not live-succeed.
- Failure is not caused by 50k table context or a large Agent prompt.
- Backend now maps network/TLS provider errors to a readable fallback reason instead of `provider_unavailable_or_mock_fallback`.

## 16. Fixes Made

- Added safe provider configuration diagnostics without exposing API keys.
- Added provider failure classification for auth, model/base URL, timeout, provider, network and unknown categories.
- Added readable Doubao fallback reasons for network and model/base URL failures.
- Kept provider transparency: fallback remains fallback and is not presented as `live_success`.
- Compressed real-provider polishing to a compact executive-summary prompt only; raw JSON, trace, tool calls and full evidence payloads are not sent to the live provider.
- Increased frontend Agent request timeout so the frontend does not abort before backend provider timeout/retry completes.
- Fixed router handling for business-report creation and ROI/ad-creative field-gap requests.

## 17. Markdown Quality Check

Markdown export was cleaned to be a saved business report rather than a system execution log.

The export now excludes:

- SQL
- trace
- tool calls
- raw JSON
- field-validation execution logs
- business-term-mapping execution logs
- dynamic P90 / internal threshold language
- Top/Bottom evidence tool wording
- impact / severity / confidence internal scoring language
- bare `unsupported`

## 18. Markdown Template Optimization

The Markdown template now uses a shorter business-facing structure:

1. Report information
2. Overall assessment
3. Top 3 priority action suggestions
4. Main risks and opportunities
5. Key evidence
6. Data limitations
7. Follow-up questions
8. A short technical note

The technical note is limited to one sentence explaining that SQL, trace, tool calls and raw JSON are hidden.

## 19. Evidence Cleanup

System-log style evidence is filtered or rewritten before export. Evidence is limited to concise business-facing points. Repeated risk/opportunity records are deduplicated.

## 20. Recommendation Deduplication

Exported recommendations are deduplicated and limited to the top 3. This keeps the exported file useful for saving, reviewing and forwarding.

## 21. HTML Export

HTML export was updated using the same cleaned content model as Markdown. It keeps the same section structure and escapes user/report content before rendering.

## 22. Q1-Q4 API Regression

All regression questions used default table `demo_sales_business_50k`.

| Question | Provider | Provider Status | Time | Result |
| --- | --- | --- | ---: | --- |
| Q1 Chinese executive health diagnosis | mock | mock | 0.93s | Pass. New `business_report`, 5 recommendations, 4 next questions, no SQL in answer. |
| Q2 English executive report | mock | mock | 0.85s | Pass. English new report structure, no bare `unsupported`, 3 recommendations, 4 next questions. |
| Q3 ROI / ad creative anti-hallucination | mock | mock | 0.08s | Pass. Refused missing `ad_spend`, `campaign_cost`, `campaign_creative`; gave alternatives. |
| Q4 Doubao real-model business report | doubao | fallback | 19.82s | Partial by provider. Real Doubao path was attempted but network failed; fallback was transparent and returned `business_report`. |

## 23. Backend Test Results

Passed locally:

- `python -c "from backend.main import app; print('backend import OK')"`
- `python -m pytest tests/test_m6_manual_polish_regression_sql_i18n_doubao_export.py -q` -> 8 passed
- `python -m pytest tests/test_m6_manual_polish_export_query_provider.py -q` -> 4 passed
- `python -m pytest tests/test_m6_manual_fix1_upload_tasks.py tests/test_m6_manual_fix2_business_report_contract.py tests/test_m6_manual_fix3_provider_status.py -q` -> 27 passed
- `python -m pytest tests/test_m6_business_capability_pressure.py tests/test_m6_langchain_business_agent_orchestration.py -q` -> 20 passed

## 24. Frontend Test Results

Passed locally:

- `npm ci`
- `npx tsc --noEmit`
- `npm run test` -> 52 files, 1206 tests passed

## 25. Frontend Build Result

Passed locally:

- `npm run build`

Next build completed successfully. Existing lint warnings remain, but they did not fail the build.

## 26. Full Backend CI Result

Passed locally:

- `python -m pytest tests/ -x -q --ignore=tests/ai` -> 904 passed

## 27. CI Workflow Check

Checked `.github/workflows/ci.yml`.

- Backend CI uses `python -m pytest tests/ -x -q --ignore=tests/ai`, so the new backend regression test is auto-discovered.
- Frontend CI uses Node.js 20 with `npm ci`, `npx tsc --noEmit`, `npm run test`, and `npm run build`.
- No CI workflow change was required.

Local machine note:

- No `.nvmrc` or `engines.node` is present.
- Local Node used for validation: `v24.15.0`.
- CI remains the source of truth for Node.js 20 compatibility.

## 28. Safety Search

Safety search was run against backend, frontend source, tests, docs, `.github`, status docs and dependency manifests, excluding `node_modules`, build outputs and `__pycache__`.

Result:

- No real API key was found.
- No `.env` file was committed.
- No private study / interview / resume / packaging content was added by this round.
- Matches are configuration names, auth middleware strings, historical docs, dependency names, or documented placeholders such as `sk-your-openai-key-here` in old baseline validation notes.

## 29. Remaining Risks

- Doubao live calls still fail in the current local environment because the minimal prompt falls back with a network/TLS style failure. This likely requires network/provider environment verification outside this code change.
- Local frontend validation used Node 24.15.0, while CI uses Node 20. CI should remain the compatibility gate.
- Some legacy source files still contain historical mojibake Chinese constants. This round avoided a broad encoding cleanup to keep scope tight.

## 30. Recommendation

Recommend renewed manual testing from `master` after this branch is merged.

If manual testing passes, the next user-approved step can be creating the M6 final tag. No tag was created in this round.
