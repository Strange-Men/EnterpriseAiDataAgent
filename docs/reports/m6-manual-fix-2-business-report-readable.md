# M6 Manual Fix 2 Business Report Readability

> Date: 2026-07-07
> Stage: M6 Manual Fix 2

## 1. Stage

本轮阶段是 M6 手动测试后的 Manual Fix 2：业务报告输出契约 / 建议校验 / 报告重排。

本轮从最新 `master` 开始，起点 commit 为 `13d7209b4eeef6c69a1cf0ba3735bbec87f1900a`。开始前已检查 master GitHub Actions，最新 master CI run `28859846418` 为 `success`。

## 2. Scope Control

本轮严格只做 Manual Fix 2：

- 升级 `business_report.recommendations` 输出契约。
- 增加后端 Recommendation Schema Validator。
- 优化业务报告主输出文案，减少字段名、tool name 和 raw evidence 暴露。
- 调整前端 Business Report 默认展示顺序。
- 增加业务建议卡片。
- 将相关数据预览移动到默认折叠的技术细节 / 数据证据区域。

本轮未进入：

- Manual Fix 3：provider_status、Doubao fallback 调查、下一步问题点击回填。
- M6.9。
- Multi-Agent / LangGraph / RAG。
- 上传异步任务重构。
- Sidebar 或五分页导航恢复。
- tag。

## 3. Changed Files

Backend:

- `backend/agent/contracts.py`
- `backend/agent/business_orchestration.py`
- `backend/business_tools/models.py`
- `backend/business_tools/recommendation_tools.py`

Frontend:

- `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx`
- `frontend-react/src/components/astryx/__tests__/business-report-view.test.tsx`
- `frontend-react/src/i18n/en.ts`
- `frontend-react/src/i18n/zh.ts`

Tests:

- `tests/test_m6_manual_fix2_business_report_contract.py`

Docs:

- `docs/reports/m6-manual-fix-2-business-report-readable.md`
- `CURRENT_SESSION.md`
- `docs/DEV_STATUS.md`
- `docs/PROJECT_CONTEXT.md`

## 4. Recommendation Output Contract

`business_report.recommendations` 的主路径现在使用面向业务人员的结构：

```json
{
  "priority": "high",
  "action": "优先排查直播渠道的售后问题",
  "why": "直播渠道订单量较高，但退款和投诉压力更高，说明该渠道可能带来了一部分低质量订单。",
  "how": "先抽取直播渠道近 7 天的退款订单，按品类、商品和退货原因分组，找出最集中的问题来源。",
  "metrics": ["退款率", "投诉率", "满意度", "退货原因 Top 3"],
  "deadline": "建议 1 周内完成初查",
  "owner_hint": "运营 / 售后 / 商品负责人"
}
```

旧字段仍保留为兼容信息：

- `target_object`
- `reason`
- `monitoring_metric`
- `expected_action_window`

但主报告和前端展示优先使用新字段。

## 5. Recommendation Schema Validator

Validator 存放在：

- `backend/agent/contracts.py`

原因：`backend/agent/contracts.py` 已承载 Agent response contract，Recommendation 属于后端对外 Business Report contract，不应散落在 route 或前端。

新增内容：

- `BusinessRecommendation`
- `DEFAULT_RECOMMENDATION`
- `validate_business_recommendations(raw)`

处理策略：

- `recommendations` 为空、`None`、空字符串、裸字段名时，返回防御性默认建议。
- 非空字符串如“建议优化渠道”会包装成单条建议，`action` 使用该字符串，其余字段由安全默认值补齐。
- 字符串为空、不可展示或像 `refund_rate` 这种裸字段名时，使用默认建议。
- 缺 `why` / `how` / `metrics` / `deadline` / `owner_hint` 时补齐。
- `metrics` 如果是字符串，会转成数组并把常见字段名转成人话指标名。
- 过长建议会截断到适合展示的长度。
- 校验失败不会抛 500，不会返回空 recommendations。

## 6. Default Fallback Recommendation

默认建议结构：

```json
{
  "priority": "medium",
  "action": "优先排查退款和投诉较高的业务对象",
  "why": "当前数据提示部分渠道、地区或品类可能存在退款和体验压力，需要进一步确认。",
  "how": "先导出相关订单明细，按渠道、地区、品类和退货原因分组，找出问题最集中的对象。",
  "metrics": ["退款率", "投诉率", "满意度", "退货原因"],
  "deadline": "建议 1 周内完成初步排查",
  "owner_hint": "运营 / 售后 / 商品负责人"
}
```

## 7. Business Report Copy Optimization

后端 Business Report 主体继续保留：

- `executive_summary`
- `key_findings`
- `evidence_summary`
- `risk_priorities`
- `opportunities`
- `recommendations`
- `next_questions`
- `limitations`

本轮优化：

- `evidence_summary` 不再包含 `tool_name`、raw rows、business tool 原始输出。
- 常见字段名会转换为中文业务口径，例如 `refund_rate` -> 退款率。
- `render_business_answer()` 中建议区改为“优先行动建议”，不再拼接 `target_object` 和技术指标串。
- memory summary 只存压缩后的建议摘要，不存 raw JSON。

## 8. Frontend Report Order

前端默认 Business Report 顺序调整为：

1. 总体判断
2. 优先行动建议
3. 主要风险与机会
4. 关键原因解释
5. 关键数据依据
6. 数据限制
7. 下一步可以继续问
8. 技术细节 / 数据证据

第一屏优先展示结论和可执行行动，不再先把证据表格或技术数据推给非技术用户。

## 9. Recommendation Card

前端新增建议卡片展示：

- 优先级
- 做什么：`action`
- 为什么：`why`
- 怎么做：`how`
- 看什么指标：`metrics`
- 多久完成：`deadline`
- 建议负责人：`owner_hint`

新旧字段渲染优先级：

1. 优先展示 `action` / `why` / `how` / `metrics` / `deadline` / `owner_hint`。
2. 只有新字段缺失时才回退到 `reason` / `monitoring_metric` / `expected_action_window`。
3. 新旧字段同时存在时，新字段是主路径。

## 10. Related Data Handling

原默认展示的“相关数据”已移动到默认折叠区。

折叠区名称：

- English: `Technical details / Data evidence`
- Chinese: `技术细节 / 数据证据`

展开后才显示：

- SQL
- provider metadata
- run id
- tool_calls
- trace
- memory flag
- raw run JSON
- 数据预览 / 数据证据

主报告只展示人话版 evidence summary。

## 11. Old Format Compatibility

兼容策略：

- 后端仍保留旧字段，避免历史记录或旧调用路径断裂。
- 前端收到旧 recommendations 格式时不会崩溃。
- 如果只有旧字段，前端会把 `reason` 显示为“为什么”，把 `monitoring_metric` 显示为指标，把 `expected_action_window` 显示为时间。
- 空 `business_report` 仍回退到旧 `answer`。

## 12. Backend Validation

已执行：

- `python -c "from backend.main import app; print('backend import OK')"` -> passed
- `python -m pytest tests/test_m6_manual_fix2_business_report_contract.py -q` -> `13 passed`
- `python -m pytest tests/test_m6_manual_fix1_upload_tasks.py -q` -> included in focused M6 regression
- `python -m pytest tests/test_m6_business_capability_pressure.py -q` -> included in focused M6 regression
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q` -> included in focused M6 regression
- `python -m pytest tests/test_m6_business_analysis_tools.py -q` -> included in focused M6 regression
- `python -m pytest tests/test_m6_business_semantic_layer.py -q` -> included in focused M6 regression
- `python -m pytest tests/test_m6_demo_business_dataset.py -q` -> included in focused M6 regression
- Focused M6 regression command -> `54 passed`
- Full backend CI command `python -m pytest tests/ -x -q --ignore=tests/ai` -> `878 passed`

## 13. Frontend Validation

已执行：

- `npm ci` -> passed
- `npx tsc --noEmit` -> passed
- `npm run test -- business-report-view` -> `1 file passed`, `7 tests passed`
- `npm run test` -> `50 files passed`, `1184 tests passed`
- `npm run build` -> passed

Build warnings remain existing unrelated warnings:

- `history-stale-table-invalid-record.test.tsx`
- `drill-down-chain.tsx`
- `sql-history-panel.tsx`

## 14. CI Workflow

已检查 `.github/workflows/ci.yml`。

无需修改：

- Backend job 已运行 `python -m pytest tests/ -x -q --ignore=tests/ai`，会自动发现 Fix 2 后端测试。
- Frontend job 已运行 `npm ci`、`npx tsc --noEmit`、`npm run test`、`npm run build`。
- 本轮没有新增依赖，没有修改 lockfile。

## 15. Node Version

- `frontend-react/.nvmrc` 不存在。
- `frontend-react/package.json` 未声明 `engines.node`。
- 项目 CI 使用 Node.js 20。

## 16. Safety Search

Safety search was run before commit across backend, frontend source, tests, docs, workflow, status docs and dependency manifests, excluding build outputs and dependency folders.

Result:

- No real API key or provider secret was found.
- No `.env` file was committed.
- Manual Fix 2 adds no private study, interview, resume, or packaging content.
- Matches such as `API_KEY`, `DOUBAO_API_KEY`, `Authorization`, and `Bearer` are configuration names, env examples, auth middleware code, CI empty values, or test placeholders.
- Broad docs matches around interview/resume/packaging and `.agents` are pre-existing historical/archive project documents, not Manual Fix 2 additions.
- `task-list-item` matches in `frontend-react/package-lock.json` are dependency-name false positives for the `sk-` pattern.

## 17. Remaining Risks

- 前端仍需要真实浏览器手测确认第一屏视觉顺序是否符合业务人员预期。
- 旧历史记录中若保存了旧 `business_report`，前端会走兼容渲染，但内容质量仍受旧数据限制。
- Fix 3 的 provider fallback 透明度和 next-question click-to-fill 尚未开始。

## 18. Recommendation

Manual Fix 2 完成并合并回 `master` 后，建议用户继续手动测试业务报告可读性。

如果 Fix 2 手测通过，下一阶段才进入 Manual Fix 3：provider 透明度 / 下一步提问交互 / 最终回归。
