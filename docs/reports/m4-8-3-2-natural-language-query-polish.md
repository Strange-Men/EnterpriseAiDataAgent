# M4-8.3.2 Natural Language Query Panel Polish

## 1. Goal

让普通用户更清楚如何用自然语言提问，并理解分析完成后下一步做什么。

## 2. Changes

### Input area copy / hierarchy
- 标题：`AI 数据分析` → `用自然语言分析数据`
- 副标题：更简洁，强调"描述问题 → AI 生成 SQL → 执行分析"
- Textarea rows：3 → 4，更舒适输入

### Example questions
- 示例文案更具体（地区销售排名、品类占比、同比增长、异常订单）
- 新增第 4 个示例问题
- 示例区域增加 Lightbulb 图标
- Header 文案：`试试这些问题：` → `试试这样提问：`

### Primary action wording
- 按钮文案：`生成 SQL 并分析` → `生成分析`

### Loading / error copy
- Loading：已有 StreamingIndicator（阶段进度条 + 文案），保持
- Error：已有友好错误处理（分类提示 + 技术详情折叠 + 重试按钮），保持

### Result next-step hint
- 分析完成后显示轻量提示：可打开详情查看报告，或在历史页重新运行和导出 Markdown

### i18n
- 所有文案通过 i18n key 管理，中英双语

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改 AI SQL generation
- 未改 SQL execution
- 未改 Analysis Detail
- 未改 Expert SQL toolbar
- 未改 SQL editor 内部
- 未改 History
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/natural-language-query-polish.test.tsx`

测试覆盖：
1. 中文标题包含"自然语言"和"分析"
2. 英文标题包含"natural language"
3. 中文副标题包含"AI"和"SQL"
4. 英文副标题包含"ai"和"sql"
5. 中文按钮文案为"生成分析"
6. 英文按钮文案为"Generate Analysis"
7. 4 个中文示例问题存在
8. 4 个英文示例问题存在
9. 中文示例问题包含"销售"
10. 英文示例问题包含"sales"
11. 中文示例区域 header 为"试试这样提问："
12. 英文示例区域 header 为"Try asking:"
13. 中文结果提示包含"详情"和"历史"
14. 英文结果提示包含"detail"和"history"
15. 不恢复 Templates feature flag
16. 不恢复 /performance route
17. 不恢复 /virtual-table route

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ 0 errors |
| vitest | ✅ 315 passed (23 files) |
| next build | ✅ Compiled successfully |
| lint | ✅ 0 errors, warnings only |
| backend import | ✅ OK |

## 6. Online Check List

- [x] 用户是否知道可以直接提问 — 标题"用自然语言分析数据"明确
- [x] 示例问题是否清楚 — 4 个具体示例，涵盖排名、占比、趋势、异常
- [x] 点击示例问题是否只填入、不自动执行 — handleExampleClick 只 setQuestion
- [x] 生成按钮是否明确 — "生成分析"简洁明了
- [x] Loading / Error 是否友好 — StreamingIndicator + 分类错误提示
- [x] 分析完成后是否知道去哪里看报告 — 结果提示文案引导
- [x] 自然语言分析主链路是否没回归 — 未改业务逻辑

## 7. Next Step

通过后进入 M4-8.3.3 Expert SQL Toolbar Grouping。
暂不进入 M5 Agent。
暂不打 tag。
