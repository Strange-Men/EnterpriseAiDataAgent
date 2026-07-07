# M6 Final QA Manual Test Ready

## 1. Stage

本轮阶段是 M6.8 Final QA / Manual Test Ready。

本轮目标不是新增功能，而是确认 M6.1-M6.7 的 Business Analyst Agent 主体能力已经合入 `master`，并让用户可以基于 `master` 做手动测试。

## 2. Merge And Branch

- 已合并 M6.7 分支 `origin/m6-business-capability-pressure-test` 到 `master`。
- M6.7 merge commit: `040e1386d5219257acbf339a458884c3edb9116f`。
- 合并后已执行 M6 基线后端验证并推送 `master`。
- 已从最新 `master` 创建 M6.8 分支 `m6-final-qa-manual-test-ready`。

## 3. Scope Control

本轮严格保持 M6.8 范围：

- 执行 Final QA 验证。
- 检查 CI workflow 覆盖。
- 生成手动测试指南。
- 生成 M6 Final QA 报告。
- 更新状态文档。
- 完成后直接合并回 `master`，供用户手动测试。

本轮未做：

- 未新增 M6.9。
- 未新增大功能。
- 未新增 Multi-Agent、LangGraph 或 RAG。
- 未推翻前端 UI。
- 未恢复 Sidebar。
- 未恢复五分页导航。
- 未默认暴露 SQL / trace / tool_calls / provider / run_id / memory。
- 未打 tag。

## 4. M6.1-M6.7 Summary

| Stage | Status | Main Output |
| --- | --- | --- |
| M6.1 | Completed | Business Analyst Agent architecture docs and research docs |
| M6.2 | Completed | `demo_sales_business_50k.csv` / `.xlsx`, schema manifest, profile summary, generator |
| M6.3 | Completed | `backend/semantic/` Business Semantic Layer |
| M6.4 | Completed | `backend/business_tools/` deterministic Business Analysis Tools |
| M6.5 | Completed | LangChain Single Agent business orchestration and `business_report` backend contract |
| M6.6 | Completed | Frontend Business Report default view and collapsed technical details |
| M6.7 | Completed | 25-question capability pressure tests and focused defect fixes |

## 5. Demo Dataset Status

Demo dataset remains ready for manual testing:

- CSV: `testExcel/demo_sales_business_50k.csv`
- XLSX: `testExcel/demo_sales_business_50k.xlsx`
- Rows: 50,000
- Required fields: 28
- Generator: `scripts/generate_demo_sales_business_dataset.py`
- Schema manifest: `docs/reports/m6-demo-sales-business-schema-manifest.json`
- Profile summary: `docs/reports/m6-demo-sales-business-profile-summary.md`

## 6. Semantic Layer Status

`backend/semantic/` remains complete:

- Field dictionary for all M6.2 fields
- Business term mapping
- Metric definitions
- Default thresholds
- Dynamic quantile thresholds
- Missing-field fallback
- Analysis templates

Focused test result:

- `python -m pytest tests/test_m6_business_semantic_layer.py -q` -> `9 passed`

## 7. Business Tools Status

`backend/business_tools/` remains complete:

- typed input / output
- read-only deterministic computation
- KPI, dimension, trend, risk, opportunity, root-cause hypothesis, recommendation and data-quality tools

Focused test result:

- `python -m pytest tests/test_m6_business_analysis_tools.py -q` -> `17 passed`

## 8. LangChain Business Orchestration Status

M6.5 orchestration remains complete:

- question classification
- analysis plan
- business tool wrapping
- multi-evidence execution
- anti-hallucination field handling
- compact memory summary
- `business_report` response contract

Focused test result:

- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> `13 passed`

## 9. Frontend Business Report Status

M6.6 frontend adaptation remains complete:

- Business Report is rendered by default when present.
- Old answer rendering remains compatible when `business_report` is missing.
- SQL, trace, tool_calls, provider, run_id, memory, raw JSON and fallback reason remain in collapsed technical details.
- Sidebar and five-tab navigation were not restored.

Frontend validation:

- `npm ci` -> passed
- `npx tsc --noEmit` -> passed
- `npm run test` -> 49 files passed, 1177 tests passed
- `npm run build` -> passed, with existing lint warnings only

## 10. Pressure Test Status

M6.7 pressure test remains complete:

- Fixture: `tests/fixtures/m6_pressure_questions.json`
- Test: `tests/test_m6_business_capability_pressure.py`
- Automated coverage: 25/25 questions
- Questions scoring at least 8/10: 25/25
- Anti-hallucination tests: passed
- Memory follow-up tests: passed
- Mock provider and fallback tests: passed

Focused test result:

- `python -m pytest tests/test_m6_business_capability_pressure.py -q` -> `7 passed`

## 11. Final QA Results

Backend:

- `python -c "from backend.main import app; print('backend import OK')"` -> `backend import OK`
- `python -m pytest tests/test_m6_business_capability_pressure.py -q` -> `7 passed`
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> `13 passed`
- `python -m pytest tests/test_m6_business_analysis_tools.py -q` -> `17 passed`
- `python -m pytest tests/test_m6_business_semantic_layer.py -q` -> `9 passed`
- `python -m pytest tests/test_m6_demo_business_dataset.py -q` -> `2 passed`
- `python -m pytest tests/ -x -q --ignore=tests/ai` -> `859 passed`

Frontend:

- `npm ci` -> passed
- `npx tsc --noEmit` -> passed
- `npm run test` -> 49 files passed, 1177 tests passed
- `npm run build` -> passed

## 12. CI Workflow Check

Checked `.github/workflows/ci.yml`.

Current CI covers:

- backend import check
- full backend pytest command: `python -m pytest tests/ -x -q --ignore=tests/ai`
- frontend `npm ci`
- frontend `npx tsc --noEmit`
- frontend `npm run test`
- frontend `npm run build`

M6.7 pressure tests are covered by CI because they live under `tests/` and the backend job runs the full tests directory. No workflow change was required.

## 13. Doubao Smoke

Doubao true-provider smoke was not executed in this M6.8 run.

Reason:

- Local environment did not expose safe provider variable names such as Doubao / ARK / OpenAI / DeepSeek / Volcengine.
- This run must not request, print, or commit API keys.

Mock provider and controlled fallback behavior remain covered by M6.5/M6.7 tests.

## 14. Manual Test Guide

Generated manual test guide:

- `docs/reports/m6-manual-test-guide.md`

The guide includes:

- how to pull latest `master`
- backend dependency and startup commands
- frontend dependency and startup commands
- demo CSV/XLSX paths
- 12 recommended manual business questions
- manual acceptance criteria
- troubleshooting notes

## 15. Safety Search

Safety search command was executed across backend, frontend, tests, docs, workflow, status files, and dependency files.

Result:

- No real API keys were found.
- No `.env` file was committed.
- No private learning, interview, resume, or packaging content was found.
- The only matches were `task-list-item` package names in `frontend-react/node_modules` and `frontend-react/package-lock.json`; these are dependency-name false positives for the `sk-` pattern.

## 16. Issues Found And Fixed

No new code defects were found during M6.8 Final QA.

No backend, frontend, test, or CI behavior changes were needed in M6.8 beyond documentation and status updates.

## 17. Remaining Risks

- Doubao true-provider smoke still needs a safe configured environment before final tag confidence is complete.
- Frontend build has existing lint warnings, but they do not block build or tests.
- Manual UX verification is still needed on `master`, especially upload flow, multi-turn behavior, and visual default folding of technical details.

## 18. Recommendation

M6 is ready for user manual testing on `master`.

Recommended next step:

1. User performs manual testing using `docs/reports/m6-manual-test-guide.md`.
2. If manual testing passes, create the M6 final tag in a separate user-approved step.
