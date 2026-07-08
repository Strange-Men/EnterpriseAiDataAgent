# M6 Manual Polish Hotfix

> Date: 2026-07-08

## 1. Scope

This round is the M6 manual polish hotfix after renewed manual testing.

- Started from latest `master`.
- Branch: `m6-manual-polish-export-query-provider-timeout`.
- Did not add M6.9.
- Did not create a tag.
- Did not add Multi-Agent, LangGraph, or RAG.
- Did not restore Sidebar or five-page navigation.

## 2. Report Export

### What Changed

Added user-facing export actions in the Business Report result area:

- `导出 Markdown` / `Export Markdown`
- `导出 HTML` / `Export HTML`

The export action is visible with the business report, not hidden inside technical details. If no `business_report` exists, export buttons are disabled.

### Format Choice

Markdown is the required primary export format because it is lightweight, readable, stable for review, and easy to send or archive.

HTML was also added because it can reuse the same fixed report structure without introducing PDF dependencies or server-side rendering complexity. PDF was not added because the project does not currently need a complex PDF export pipeline for this polish hotfix.

### Template

The export helper lives in:

- `frontend-react/src/utils/business-report-export.ts`

The Markdown template is fixed:

1. 报告信息
2. 总体判断
3. 优先行动建议
4. 主要风险与机会
5. 关键原因解释
6. 关键数据依据
7. 数据局限
8. 下一步可以继续问
9. 技术说明

Recommendation fields use the Manual Fix 2 contract:

- `action`
- `why`
- `how`
- `metrics`
- `deadline`
- `owner_hint`

Legacy fields such as `reason`, `monitoring_metric`, and `expected_action_window` remain compatible.

### Excluded Content

The export intentionally excludes:

- SQL content
- trace
- tool_calls
- raw JSON
- run_id
- memory

The exported report includes only a short technical note explaining that these details remain available inside the app's folded technical-details section.

## 3. SQL Query Numbering

### Root Cause

The SQL editor store used persisted tab state and generated new default tab names with `tabs.length + 1`. If localStorage already had a stale single tab named `Query 2`, or if tabs were deleted after skipped numbering, the UI could show `Query 2` as the only tab.

### Fix

Added tab normalization in:

- `frontend-react/src/stores/sql-editor-store.ts`

Rules:

- A fresh SQL workspace starts with one tab: `Query 1`.
- Default Query labels are normalized in current order.
- Deleting a Query tab renumbers remaining default Query tabs.
- Adding a new default Query uses the current normalized tab count.
- Persisted localStorage with a single `Query 2` becomes `Query 1`.
- Persisted skipped labels such as `Query 2` / `Query 4` become `Query 1` / `Query 2`.
- SQL content is preserved.
- Custom non-default names are preserved.

No Sidebar or five-page navigation was restored.

## 4. Real LLM Timeout Diagnosis

### Diagnosis

The visible fallback reason `provider_unavailable_or_mock_fallback` came from product-level provider metadata when a real provider path did not complete and the Agent fell back to mock. It was an internal code leaking into the frontend.

Potential real-provider timeout sources are:

- Provider HTTP read timeout.
- Provider connect timeout.
- Provider 429 / 5xx transient errors.
- Missing provider env such as API key, base URL, or model.
- Invalid credentials.
- Provider API latency.

This hotfix did not use or print a real key. Real-provider behavior was validated with monkeypatched provider calls and fake slow/error provider responses.

### What Was Optimized

Backend changes:

- `LLM_REQUEST_TIMEOUT_SECONDS` default increased from `30s` to `60s`.
- Added `LLM_CONNECT_TIMEOUT_SECONDS` with default `10s`.
- HTTP timeout configuration is centralized in `backend/config.py` and used by `backend/services/llm_runtime.py`.
- Timeout / 429 / 5xx errors retry once with a short backoff.
- 401 / 403 auth errors do not retry.
- Fallback reasons are converted to readable user-facing messages.

Readable examples:

- `未检测到真实模型配置，当前使用演示模式。`
- `真实模型服务响应超时，已切换为模拟分析结果。`
- `真实模型鉴权失败，请检查 provider 配置。`
- `真实模型服务暂时不可用，已切换为模拟分析结果。`

### Prompt / Token Risk

No large prompt expansion was added. The existing Business Analyst flow already keeps raw SQL, trace, tool calls, and raw JSON out of the main `business_report`. This hotfix keeps that boundary and does not pass raw frontend technical details into report export.

## 5. Three Business Question Regression

All three questions were run through `/api/agent/runs` against the default `demo_sales_business_50k` table after clearing the session back to the default table.

Default table check:

- `current_table`: `demo_sales_business_50k`
- rows: `50,000`
- columns: `28`

Provider used for regression:

- `provider_requested`: `mock`
- `provider_status`: `mock`
- `is_simulated`: `true`
- fallback: `false`

### Q1

Question: boss-readable business health diagnosis with revenue, profit, refund, complaints, satisfaction, logistics, channel quality, region performance, and three priority recommendations.

- Duration: `1.08s`
- Result: pass
- `business_report`: present
- Recommendation schema: complete
- `next_questions`: 4
- Technical details hidden from `business_report`: yes
- Markdown export coverage: frontend export test passed

### Q2

Question: growth and risk balance analysis, investment / contraction / profit drag / weekly monitoring, no SQL or technical details.

- Duration: `0.73s`
- Result: pass
- `business_report`: present
- Recommendation schema: complete
- `next_questions`: 4
- Technical details hidden from `business_report`: yes
- Note: The response is structured through priority recommendations and monitoring metrics; it does not create a separate nested report schema for "立刻做 / 本周做 / 下月观察".

### Q3

Question: calculate ROI by ad creative and choose which creative deserves more budget.

- Duration: `0.10s`
- Result: pass
- Anti-hallucination: pass
- The dataset lacks `ad_spend`, `campaign_cost`, and `campaign_creative`.
- The report clearly states that the requested ROI / creative analysis cannot be directly calculated.
- No ROI ranking was fabricated.
- Alternative analysis is provided within available fields.
- `next_questions`: 3

## 6. Test Results

Backend:

- `python -c "from backend.main import app; print('backend import OK')"` -> passed
- `python -m pytest tests/test_m6_manual_polish_export_query_provider.py tests/test_m6_manual_fix1_upload_tasks.py tests/test_m6_manual_fix2_business_report_contract.py tests/test_m6_manual_fix3_provider_status.py tests/test_m6_business_capability_pressure.py tests/test_m6_langchain_business_agent_orchestration.py -q` -> `51 passed`
- Full backend CI: `python -m pytest tests/ -x -q --ignore=tests/ai` -> `896 passed`

Frontend:

- Node check:
  - `.nvmrc`: not present
  - `package.json engines.node`: not set
  - local Node: `v24.15.0`
  - local npm: `11.12.1`
  - CI uses Node.js 20
- `npm ci` -> passed
- `npx tsc --noEmit` -> passed
- `npm run test` -> `50 files`, `1200 tests passed`
- `npm run build` -> passed

Focused frontend tests:

- Business Report export buttons and template output.
- SQL Query tab numbering and persisted-state normalization.

## 7. CI Workflow

Checked `.github/workflows/ci.yml`.

The backend job runs `python -m pytest tests/ -x -q --ignore=tests/ai`, so the new backend test is automatically covered. The frontend job already runs install, typecheck, tests, and build. No CI workflow change was needed.

## 8. Safety Search

The requested `findstr /s` safety command was executed. Because `findstr /s` follows package-file paths under `frontend-react/node_modules`, it reported dependency-name false positives such as `task-list-item`.

Other broad matches were expected existing project content:

- Environment variable names in env examples and config files.
- Auth middleware/test placeholders such as `Authorization`, `Bearer`, and `API_KEY`.
- Historical documentation matches that predate this hotfix.

No real API key, `.env`, credential value, or new private content was added by this round.

## 9. Remaining Risks

- Real Doubao / DeepSeek / Mimo latency still depends on the provider service and deployment network. This round validated timeout and retry structure with fake provider responses, not a real key.
- If deployment proxies have shorter request limits than the backend provider timeout, proxy timeout settings should be aligned separately.
- Q2 currently expresses action timing through recommendation fields and deadlines, not a dedicated grouped schema for "立刻做 / 本周做 / 下月观察".

## 10. Recommendation

Recommend renewed manual testing from `master`.

If manual testing passes, the next user-approved step can be creating the M6 final tag.
