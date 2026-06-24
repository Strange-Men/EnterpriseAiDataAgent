# M4-8.3.5 Analysis Workspace Regression

## 1. Goal

确认 M4-8.3.1 到 M4-8.3.4 的分析工作台 UI/UX 改造没有破坏主链路。

## 2. Regression Scope

- Analyze Shell (Tab Bar + Current Table Strip)
- Natural Language Query (input, examples, button, states)
- Expert SQL Toolbar (grouping, primary action, AI hint)
- Result / Error / Loading / Empty States
- Disabled experimental features (Templates, Scheduler, Diff, Timeline, /performance, /virtual-table)

## 3. Findings

| 检查项 | 结果 |
|--------|------|
| 当前表状态条存在 | ✅ workspace.current-table / workspace.no-table key 正常 |
| 自然语言查询 tab 推荐标签存在 | ✅ workspace.tab.ai-query = "自然语言查询" / "AI Query" |
| 专家 SQL tab 高级标签存在 | ✅ workspace.tab.expert-sql = "专家 SQL" / "Expert SQL" |
| 自然语言标题和说明 | ✅ workspace.ai-query-title / workspace.ai-query-subtitle |
| 生成分析按钮文案 | ✅ workspace.generate-sql-analyze = "生成分析" / "Generate Analysis" |
| 示例问题 4 个 | ✅ workspace.example.q1-q4 中英双语 |
| 示例区域 header | ✅ workspace.example-questions = "试试这样提问：" / "Try asking:" |
| NL loading 文案 | ✅ inv.loading-description / inv.loading-hint |
| NL error 友好化 | ✅ inv.error-friendly / inv.error-guidance / inv.error-technical-detail |
| NL success 提示 | ✅ inv.success-title / inv.success-hint / inv.view-detail-btn |
| Expert SQL 工具栏分组 | ✅ sql.execute (primary) / ai.generate-sql (AI) / format / export / saved |
| Run SQL 是 primary | ✅ sql.execute = "执行" / "Execute" |
| AI 生成 SQL 说明检查后手动执行 | ✅ ai.generate-sql-hint 包含 "检查"/"执行" / "review"/"running" |
| AI SQL 填充提示 | ✅ ai.sql-filled 包含 "检查"/"执行" |
| SQL loading 文案 | ✅ sql.loading-description / sql.loading-hint |
| SQL error 友好化 | ✅ sql.error-friendly / sql.error-guidance / sql.error-technical-detail / sql.retry |
| SQL success row count 文案 | ✅ sql.success-hint 包含 "预览"/"导出" |
| Empty result 不是 error | ✅ sql.empty-result-title 包含 "成功"/"succeeded"，不含 "失败"/"error" |
| Templates 不显示 | ✅ key 存在但受 feature flag 控制 |
| Schedule 不显示 | ✅ key 存在但受 feature flag 控制 |
| Diff 不显示 | ✅ key 存在但受 feature flag 控制 |
| Timeline 不显示 | ✅ key 存在但受 feature flag 控制 |
| /performance 不恢复 | ✅ perf.title key 存在但路由不存在 |
| /virtual-table 不恢复 | ✅ 路由不存在 |
| 不改 API 调用参数 | ✅ sql.execute / ai.generate-sql / query.cancel key 未变 |
| 不改 Store 行为 | ✅ analysis.workspace key 未变 |

## 4. Fixes

No code fix required. 所有检查项通过，无需小修。

## 5. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未开始 M4-8.4
- 未开始 M5 Agent

## 6. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/analysis-workspace-regression.test.tsx`

覆盖 81 个测试用例（跨 8 个 describe block）：

| 分类 | 测试数 |
|------|--------|
| Tab labels | 4 |
| Current Table Strip | 4 |
| NL query copy | 8 |
| NL states | 16 |
| Expert SQL toolbar | 20 |
| SQL states | 18 |
| Disabled experimental features | 6 |
| Stable API/Store/Backend keys | 5 |

总计：26 个 test 文件，476 个测试用例全部通过（原 395 + 新增 81）。

## 7. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass (no errors) |
| `vitest run` | ✅ 476 tests passed (26 files) |
| `next build` | ✅ Compiled successfully |
| `next lint` | ✅ Warnings only (pre-existing, no new) |
| `backend import` | ✅ OK |

## 8. Online Manual Check List

- [ ] 当前表状态清楚（表名 + 行数）
- [ ] 自然语言查询主链路正常（输入 → 生成 → 结果 → 查看详情）
- [ ] 专家 SQL 主链路正常（输入 → 执行 → 结果）
- [ ] loading 状态友好（spinner + 说明文案）
- [ ] error 状态友好（友好标题 + 引导 + 重试 + 技术详情折叠）
- [ ] success 状态清楚（行数提示 / 下一步引导）
- [ ] empty result 不显示为 error
- [ ] 导出功能没有回归
- [ ] History 没有回归
- [ ] 已删除实验路由仍然不存在（/performance, /virtual-table）

## 9. Next Step

通过后进入 M4-8.4 Analysis Detail Report Layout。
暂不进入 M5 Agent。
暂不打 tag。
