# M4-8.4.4 Detail Page Empty / Error States

## 1. Goal

让分析详情页在记录缺失、内容不完整、执行失败时仍然像产品页面，而不是白屏或调试页。

## 2. Changes

### 2.1 Invalid Run ID / Missing Run

- 改进 not-found 文案：从"未找到这次分析记录，可能是浏览器本地历史已清理"改为"未找到分析记录" + "这条分析记录可能已被删除、尚未同步，或链接已失效"
- 保留 run ID 显示
- 保留"返回分析工作台"和"查看历史"按钮

### 2.2 Failed Run

- 替换原始红色 error banner 为用户友好文案
- 显示"分析未完成"标题 + "本次分析没有成功完成。你可以重新运行，或返回分析工作台换一种提问方式。"
- 技术详情默认折叠，可点击展开查看
- 不吞掉错误信息

### 2.3 Partial Report

- 新增 `isPartialReport()` 检测函数
- 当 run status 为 success 但缺少 summary、sections、steps 时显示黄色警告
- 显示"报告内容不完整" + "当前分析只返回了部分内容，你仍可以查看已有结果或重新运行分析。"

### 2.4 Existing Empty States (保持)

- no summary: "暂无摘要" + hint ✅
- no findings: "暂无关键发现" + hint ✅
- no result table: "暂无结果表" + hint ✅
- no SQL appendix: "暂无 SQL 记录" ✅
- no trace: 返回 null ✅

### 2.5 Cleanup

- 移除未使用的 `MonitorPlay` import（修复 1 个 lint warning）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 Markdown export
- 未改 Trace data source
- 未改 SQL data source
- 未开始 M5 Agent

## 4. Tests

新增 `analysis-detail-empty-error-states.test.tsx`，覆盖：

| # | 测试 |
|---|------|
| 1 | invalid run id 显示友好空态 |
| 2 | invalid run id 不白屏 |
| 3 | failed run 不崩溃 |
| 4 | failed run 显示 summary empty state |
| 5 | no summary 显示友好空态 |
| 6 | no findings 显示友好空态 |
| 7 | no result table 显示友好空态 |
| 8 | no sections + no steps 不崩溃 |
| 9 | no SQL steps 不崩溃 |
| 10 | steps without SQL 不崩溃 |
| 11 | null trace 不崩溃 |
| 12 | undefined trace 不崩溃 |
| 13 | SQL appendix 可展开 |
| 14 | steps section 可展开 |
| 15 | 不恢复 templates |
| 16 | 不恢复 schedule |
| 17 | 不恢复 /performance |
| 18 | 不恢复 /virtual-table |

总测试：559 passed（新增 18 个）

## 5. Validation

| Step | Result |
|------|--------|
| tsc --noEmit | ✅ pass |
| npm run test | ✅ 559 passed |
| npm run build | ✅ pass |
| npm run lint | ✅ 2 warnings (pre-existing) |
| backend import | ✅ pass |

## 6. Online Check List

- [ ] invalid run id 是否友好
- [ ] missing run 是否不白屏
- [ ] failed run 是否可读
- [ ] partial report 是否有提示
- [ ] summary / findings / result 缺失是否有空态
- [ ] SQL / Trace 缺失是否不崩
- [ ] Export Markdown 是否仍正常
- [ ] 历史页打开详情是否没回归

## 7. Next Step

通过后进入 M4-8.4.5 Detail Page Regression。
暂不进入 M5 Agent。
暂不打 tag。
