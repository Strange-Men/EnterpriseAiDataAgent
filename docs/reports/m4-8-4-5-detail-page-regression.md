# M4-8.4.5 Detail Page Regression

## 1. Goal

确认 M4-8.4.1 到 M4-8.4.4 的分析详情页 UI/UX 改造没有破坏详情页主链路。

## 2. Regression Scope

- Report Header
- Summary First
- Key Findings
- Main Result
- SQL Appendix
- Trace Appendix
- Empty / Error States
- Disabled experimental features

## 3. Findings

### 3.1 Report Header ✅

- 标题"分析报告"存在
- 副标题存在
- 用户问题作为 h2 显示
- Mode badge 正确翻译
- Status badge 显示正确
- 数据表名显示
- 时间戳显示

### 3.2 Summary First ✅

- Summary 在 Steps/Sections 前显示
- Summary 缺失时显示友好空态
- Summary 有 accent 边框样式

### 3.3 Key Findings ✅

- Key Findings 在 Trace 前显示
- Key Findings 缺失时显示友好空态
- 从 sections 中正确提取

### 3.4 Main Result ✅

- 结果表在 Trace 前显示
- 有 rows 时显示前 20 行预览
- 长单元格截断到 50 字符
- 无结果时显示友好空态

### 3.5 SQL Appendix ✅

- SQL Appendix 存在
- 默认折叠
- 可展开查看
- 显示 SQL 数量
- 无 SQL 时显示空态

### 3.6 Trace Appendix ✅

- Trace 存在
- 默认折叠
- 可展开查看
- 无 trace 时返回 null
- 显示展开提示

### 3.7 Empty / Error States ✅

- invalid run id 不崩
- failed run 不崩
- partial report 显示所有空态
- summary / findings / result / SQL / Trace 缺失不崩

### 3.8 Disabled Features ✅

- 不含 template 引用
- 不含 schedule 引用
- 不含 /performance
- 不含 /virtual-table

### 3.9 Steps Collapsible ✅

- Steps 默认折叠
- 点击可展开

## 4. Fixes

修复了回归测试中的 trace mock 类型问题：
- 将 `entries` 改为正确的 `events` 字段
- 使用 `TraceSnapshot` 接口的正确结构
- 修复未使用变量 lint warning

**未做业务代码修改**。仅修改了测试文件。

## 5. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 Markdown export
- 未改 Trace data source
- 未改 SQL data source
- 未开始 M4-8.5
- 未开始 M5 Agent

## 6. Tests

新增 `analysis-detail-regression.test.tsx`，覆盖：

| # | 测试分类 | 测试数 |
|---|---------|--------|
| 1 | Report Header | 7 |
| 2 | Export Markdown | 3 |
| 3 | Summary Before Trace | 2 |
| 4 | Key Findings Before Trace | 2 |
| 5 | Main Result Before Trace | 3 |
| 6 | SQL Appendix | 4 |
| 7 | Trace Appendix | 4 |
| 8 | Invalid Run ID | 2 |
| 9 | Failed Run | 2 |
| 10 | Partial Report | 1 |
| 11 | Steps Collapsible | 2 |
| 12 | Disabled Features | 6 |
| 13 | Store Behavior | 3 |
| 14 | Page Structure | 2 |

总测试：602 passed（新增 43 个回归测试）

## 7. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| npm run test | ✅ 602 passed (31 files) |
| npm run build | ✅ pass |
| npm run lint | ✅ 2 warnings (pre-existing) |
| backend import | ✅ pass |

## 8. Online Manual Check List

- [ ] 打开详情页第一眼像报告页
- [ ] Summary / Findings / Result 优先展示
- [ ] SQL / Trace 默认折叠
- [ ] invalid run id 友好
- [ ] failed / partial report 友好
- [ ] Export Markdown 正常
- [ ] History 打开详情正常
- [ ] 已删除实验路由仍然不存在

## 9. Next Step

通过后再进入 M4-8.5 History UX Polish。
暂不进入 M5 Agent。
暂不打 tag。
