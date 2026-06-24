# M4-8.4.3 SQL / Trace Appendix Folding

## 1. Goal

让 SQL 和 Trace 从主视觉降级为可展开的技术附录，保证详情页更像分析报告，而不是调试页面。

## 2. Changes

### SQL Appendix (`run-sections.tsx`)
- 新增 `extractAllSql()` 从 multiResult.steps 提取所有 SQL
- 新增 SQL Appendix 折叠区域，位于 Charts 之后
- 默认折叠，点击展开查看
- 显示 SQL 数量
- 展开后显示描述文案和每个步骤的 SQL
- 新增"复制 SQL"按钮，复制全部 SQL 到剪贴板
- 无 SQL 时显示友好空态

### Trace Collapsed (`run-trace.tsx`)
- 重写 `RunTrace` 组件，默认折叠
- 标题从"追踪数据"改为"调用追踪" / "Technical Trace"
- 折叠时只显示标题和展开提示
- 展开后显示描述文案和 TraceTimeline
- 无 trace 时返回 null（不显示空态）

### Trace Relocated (`page.tsx`)
- `RunTrace` 从主内容区（左 2/3）移到侧边栏（右 1/3）
- 位于 `DrillDownChain` 之后

### DrillDownChain Empty State (`drill-down-chain.tsx`)
- chain.length <= 1 时返回 null（隐藏组件）
- 不再显示空态占位

### i18n (`zh.ts`, `en.ts`)
- 新增 `inv.sections`：分析段落 → 分析内容 / Analysis Content
- 新增 `inv.sql-appendix`：SQL 附录 / SQL Appendix
- 新增 `inv.sql-appendix-desc`：查看本次分析过程中生成和执行的 SQL。
- 新增 `inv.sql-appendix-expand`：展开查看 SQL / Expand to view SQL
- 新增 `inv.sql-appendix-empty`：暂无 SQL 记录。
- 新增 `inv.copy-sql`：复制 SQL / Copy SQL
- 新增 `inv.copy-sql-success`：SQL 已复制到剪贴板
- 新增 `inv.technical-trace`：调用追踪 / Technical Trace
- 新增 `inv.technical-trace-desc`：用于排查问题的技术执行记录，默认折叠。
- 新增 `inv.technical-trace-expand`：展开查看调用追踪 / Expand to view trace

### Tests
- 新增 `analysis-detail-sql-trace-appendix.test.tsx`（17 个测试用例）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 Markdown export
- 未改 SQL execution
- 未改 Trace data source
- 未改 TraceTimeline 组件内部逻辑
- 未开始 M5 Agent

## 4. Tests

新增 `frontend-react/src/app/(shell)/__tests__/analysis-detail-sql-trace-appendix.test.tsx`：

| 分类 | 测试数 | 覆盖内容 |
|------|--------|---------|
| SQL Appendix | 7 | 存在性、默认折叠、展开查看、复制按钮、SQL 计数、空态、多 SQL |
| Technical Trace | 4 | 存在性、默认折叠、展开查看、无 trace 返回 null |
| Appendix Position | 2 | SQL 在 main result 后、SQL 在 key findings 后 |
| What was NOT changed | 4 | 不含 template/schedule/performance/virtual-table |

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 29 files, 541 tests passed |
| next build | ✅ compiled successfully |
| next lint | ✅ 3 warnings (pre-existing only) |
| backend import | ✅ OK |

## 6. Online Check List

- [ ] 打开详情页是否先看到 Summary / Findings / Results
- [ ] SQL 是否不再抢主视觉
- [ ] SQL 是否仍可展开查看
- [ ] Copy SQL 是否可用
- [ ] Trace 是否默认折叠
- [ ] Trace 是否仍可展开查看
- [ ] Trace 是否位于侧边栏底部
- [ ] DrillDownChain 无下钻时是否隐藏
- [ ] Export Markdown 是否仍正常
- [ ] invalid run id 是否仍友好
- [ ] 历史页打开详情是否没回归

## 7. Next Step

通过后进入 M4-8.4.4 Detail Page Empty / Error States。
暂不进入 M5 Agent。
暂不打 tag。
