# M4-8.3.4 Result / Error / Loading States Polish

## 1. Goal

让分析工作台的加载、错误、成功、空结果状态更友好、更清晰。

## 2. Changes

### Natural Language Loading State

- StreamingIndicator 下方新增说明文案："正在生成 SQL 并分析当前数据表..."
- 补充提示："通常需要几秒，请保持页面打开。"
- 流开始前（无 streamStage 时）显示 spinner + 加载描述
- 保留现有 StreamingIndicator 进度条和阶段图标逻辑不变

### Natural Language Error State

- 通用错误（非 AI_EMPTY_RESPONSE / JSON parse）改为友好标题："分析失败"
- 补充用户可理解的建议："请检查当前数据表是否包含相关字段，或换一种提问方式。"
- 技术详情默认折叠（`<details>`），标题"技术详情"
- 所有错误类型均显示重试按钮（之前仅 AI_EMPTY_RESPONSE 可重试）
- 不吞掉原始错误，技术详情仍可查看

### Natural Language Success State

- 分析完成后显示绿色勾 + "分析已完成" 标题
- 提示："你可以打开详情查看报告，或在历史页重新运行和导出 Markdown。"
- "查看详情" 从普通链接升级为 accent 色实心按钮

### Expert SQL Loading State

- 执行中时在结果区显示 spinner + "正在执行 SQL 查询..."
- 补充提示："结果会在下方显示。"

### Expert SQL Error State

- 错误标题从 "查询错误" 改为 "SQL 执行失败"
- 补充用户引导："请检查表名、字段名或 SQL 语法。"
- 新增"重试"按钮（调用 handleExecute）
- 技术详情默认折叠（`<details>`），标题"技术详情"
- 背景色和边框色柔和化（opacity 降低）

### Expert SQL Success State

- DataTable 下方新增一行提示：显示行数 + 耗时 + "可预览结果或导出 CSV。"
- 使用现有 `sql.query-ok` key 拼接 `sql.success-hint`

### Empty Result State

- 当 `queryResult.status === "success"` 且 `rowCount === 0` 时显示专用状态
- 标题："查询成功，但没有返回数据"
- 提示："可以检查筛选条件，或尝试放宽 WHERE 条件。"
- 不显示为错误，不显示 DataTable（避免空白表格误导）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API 请求参数 / 响应处理
- 未改 Store 状态结构
- 未改 SQL execution logic
- 未改 AI SQL generation
- 未改 Analysis Detail 页面
- 未改 History 页面
- 未改后端
- 未恢复 Templates / Scheduler / Charts / Anomalies / Diff / Timeline
- 未恢复 `/performance`、`/virtual-table`
- 未恢复 Command Palette / Global Search / Keyboard Shortcuts
- 未开始 M5 Agent

## 4. Tests

新增 `result-error-loading-polish.test.tsx`，50 个测试用例：

| 分类 | 覆盖内容 |
|------|---------|
| SQL Loading State | loading-description、loading-hint 中英文 |
| SQL Error State | error-friendly、error-guidance、retry、error-technical-detail 中英文 |
| SQL Empty Result State | empty-result-title 不含"失败/错误"、empty-result-hint 中英文 |
| SQL Success State | success-hint 含"预览/导出" |
| NL Loading State | loading-description、loading-hint 中英文 |
| NL Error State | error-friendly、error-guidance、error-technical-detail 中英文 |
| NL Success State | success-title、success-hint、view-detail-btn 中英文 |
| Analysis Error State | error-friendly、error-guidance、retry、error-technical-detail 中英文 |
| Negative checks | SQL execute、AI generate-sql、store、template、schedule、diff、timeline、perf keys 未变 |

总计：25 个 test 文件，395 个测试用例全部通过。

## 5. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass (no errors) |
| `vitest run` | ✅ 395 tests passed (25 files) |
| `next build` | ✅ Compiled successfully |
| `next lint` | ✅ Warnings only (pre-existing, no new) |
| `backend import` | ✅ OK |

## 6. Online Check List

- [ ] 自然语言分析 loading 是否清楚
- [ ] 自然语言分析失败是否友好
- [ ] 技术详情是否弱化
- [ ] 分析成功后是否知道打开详情 / 历史
- [ ] SQL 查询 loading 是否清楚
- [ ] SQL 失败是否友好
- [ ] 0 行结果是否不是失败
- [ ] SQL 成功是否显示返回行数
- [ ] 主链路是否没回归

## 7. Next Step

通过后进入 M4-8.3.5 Analysis Workspace Regression。
暂不进入 M5 Agent。
暂不打 tag。
