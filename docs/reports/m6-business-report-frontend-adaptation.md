# M6 Business Report Frontend Adaptation

> Date: 2026-07-07
> Stage: M6.6 Business Report frontend adaptation

## 1. Stage Scope

本轮严格是 M6.6：Business Report 前端适配。

已完成：

- 确认 M6.5 GitHub Actions run `28835705148` 已通过后才开始 M6.6。
- 将 `origin/m6-langchain-business-agent-orchestration` 合并到 `master`，完成后端回归并推送 `master`。
- 从最新 `master` 创建 `m6-business-report-frontend-adaptation` 分支。
- 在前端 Agent 单页工作台中默认展示 `business_report`。
- 保留旧 `answer` / `evidence` / `warnings` 兼容渲染。
- 将 SQL、trace、tool_calls、provider、run_id、memory、raw JSON、fallback reason 放入默认折叠的技术细节区。
- 新增 Business Report 前端测试。
- 检查并按 `.github/workflows/ci.yml` 执行前端和后端 CI 对应命令。

未进入：

- M6.7 综合能力压力测试。
- M6.8 Final QA。
- 前端多页重构。
- Sidebar 或五分页导航恢复。
- Multi-Agent / LangGraph / RAG。
- tag。

## 2. Markdown / Code Basis

本轮读取并对齐：

- `docs/reports/m6-business-analyst-agent-architecture.md`
- `docs/reports/m6-pressure-test-plan.md`
- `docs/reports/m6-demo-business-dataset-redesign.md`
- `docs/reports/m6-business-semantic-layer.md`
- `docs/reports/m6-business-analysis-tools.md`
- `docs/reports/m6-langchain-business-agent-orchestration.md`
- `backend/agent/contracts.py`
- `backend/agent/langchain_single_agent.py`
- `backend/agent/business_orchestration.py`
- `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx`
- `.github/workflows/ci.yml`

## 3. Changed Files

| Type | Path |
| --- | --- |
| Frontend workbench UI | `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx` |
| Frontend Business Report test | `frontend-react/src/components/astryx/__tests__/business-report-view.test.tsx` |
| Frontend API type | `frontend-react/src/services/api/agent.ts` |
| Frontend API barrel export | `frontend-react/src/services/api.ts` |
| Workbench persisted record type | `frontend-react/src/stores/astryx-workbench-store.ts` |
| Chinese i18n | `frontend-react/src/i18n/zh.ts` |
| English i18n | `frontend-react/src/i18n/en.ts` |
| M6.6 report | `docs/reports/m6-business-report-frontend-adaptation.md` |
| Session status | `CURRENT_SESSION.md` |
| Development status | `docs/DEV_STATUS.md` |
| Project context | `docs/PROJECT_CONTEXT.md` |

## 4. Business Report Frontend Structure

当后端响应包含 `run.business_report` 且内容非空时，前端默认渲染 Business Report：

- `ExecutiveSummary`：一句话总判断。
- `KeyFindingsList`：3-5 条核心结论。
- `EvidenceSummaryList`：关键数据依据。
- `RiskPriorityPanel`：按 high / medium / low / other 分组的风险优先级。
- `RecommendationList`：可执行业务建议。
- `LimitationsBlock`：数据限制和缺字段说明。
- `NextQuestionsChips`：下一步可继续追问的问题。
- `TechnicalDetailsAccordion`：默认折叠的技术细节。

如果 `business_report` 缺失或为空，前端继续使用旧 `answer` / `findings` / `nextSteps` 渲染，避免破坏旧响应。

## 5. Default Visible Content

默认向业务用户展示：

- 一句话总判断。
- 核心结论。
- 关键数据依据。
- 风险优先级。
- 业务建议。
- 数据限制。
- 下一步可追问方向。
- 必要 warning。
- 相关数据预览。

## 6. Default Hidden Technical Details

以下内容默认不进入主报告，也不会在折叠区展开前渲染到页面内容：

- SQL。
- trace。
- tool_calls。
- provider。
- run_id。
- memory / memory_used。
- raw JSON。
- fallback_reason。

展开 `Technical Details` 后才显示 SQL、provider metadata、run id、tool_calls、trace、memory flag 和 raw run JSON。

## 7. Compatibility Logic

- `AgentRun` 前端类型新增 `business_report`，但保留所有旧字段。
- `BusinessAnalysisRecord` 保存 `businessReport`，历史记录仍保留 `rawRun` 追溯。
- 旧 `answer` 仍在没有 `business_report` 时展示。
- 空数组、缺字段或空 `business_report` 不渲染空标题，不导致页面崩溃。
- fallback / mock provider 信息不进入主业务报告，只在 warning 或技术细节中体现。

## 8. CI Sync

已检查 `.github/workflows/ci.yml`：

- backend job：`python -m pytest tests/ -x -q --ignore=tests/ai`
- frontend job：`npm ci`、`npx tsc --noEmit`、`npm run test`、`npm run build`

本轮没有修改 `.github/workflows/ci.yml`。原因：现有 CI 命令已经覆盖新增前端测试、TypeScript、build 和后端回归。

本轮没有修改 package 依赖或 lockfile。`npm ci` 完成后仅报告既有 npm audit 提示，未影响 CI 命令。

## 9. Verification Results

| Check | Result |
| --- | --- |
| M6.5 CI run `28835705148` | `success` |
| Merge M6.5 to master | PASS |
| Push master | PASS |
| Backend import | `backend import OK` |
| `tests/test_m6_langchain_business_agent_orchestration.py -q` | `13 passed` |
| `tests/test_m6_business_analysis_tools.py -q` | `17 passed` |
| `tests/test_m6_business_semantic_layer.py -q` | `9 passed` |
| `tests/test_m6_demo_business_dataset.py -q` | `2 passed` |
| Full backend CI command | `852 passed` |
| `npm ci` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run test` | `49 passed`, `1177 passed` |
| `npm run build` | PASS, with existing lint warnings |

Build warnings were existing non-blocking lint warnings in unrelated files:

- `history-stale-table-invalid-record.test.tsx`
- `drill-down-chain.tsx`
- `sql-history-panel.tsx`

## 10. Frontend Test Coverage

New test file:

- `frontend-react/src/components/astryx/__tests__/business-report-view.test.tsx`

Covered:

- `business_report` exists -> executive summary shown by default.
- key findings shown.
- evidence summary shown.
- risk priorities shown.
- recommendations shown.
- limitations shown.
- next questions shown.
- SQL hidden by default.
- trace / tool_calls / provider / run_id / memory hidden by default.
- technical details expansion reveals SQL / trace-style details.
- missing `business_report` falls back to old answer.
- empty `business_report` does not crash or render empty headings.
- single-page workbench shell remains present.
- Sidebar / five-tab style navigation does not return.

## 11. Remaining Risks

- M6.6 only adapts frontend display. It does not score the full 25-question pressure test set.
- Business Report object values are rendered with generic readable summaries; if M6.7 discovers more structured fields, the renderer can add richer formatting later.
- Existing Next build lint warnings remain outside this scope.

## 12. Recommendation

建议等待 M6.6 branch CI 通过和用户审查后，再进入 M6.7 综合能力压力测试。
