# M4-8.4.2 Result Table + Key Findings Layout

## 1. Goal

让分析详情页在摘要之后优先展示关键发现和主要结果，而不是让用户先看到步骤或 Trace。

## 2. Changes

### Key Findings Layout (`run-sections.tsx`)
- 从 sections 中提取标题包含"关键发现"/"Key Findings"的内容
- Key Findings 显示在 Summary 后方，Steps 前方
- 无 findings 时显示友好空态（虚线边框占位）
- 从 sections 中过滤掉 key findings section 避免重复显示

### Main Result Table (`run-sections.tsx`)
- 从最后一个成功步骤提取 columns 和 data
- 显示预览表格，限制前 20 行
- 长单元格截断到 50 字符
- 超过 20 行时显示行数提示和导出提示
- 无结果时显示友好空态

### Steps Collapsible (`run-sections.tsx`)
- Steps 区域默认折叠
- 点击标题可展开/折叠
- 显示步骤数量

### Evaluation Simplified (`run-evaluation.tsx`)
- 移除 SVG 圆环，改为数值 + 文字描述
- 保留 MetricBar（completeness, accuracy, actionability）
- 保留 Diagnostics 和 Suggested improvements
- 使用 `text-xs` 替代 `text-[10px]`

### i18n (`zh.ts`, `en.ts`)
- 新增 `inv.key-findings`：关键发现 / Key Findings
- 新增 `inv.key-findings-desc`：AI 根据查询结果提炼出的主要结论。
- 新增 `inv.key-findings-empty`：暂无关键发现
- 新增 `inv.key-findings-empty-hint`：当前分析结果暂未生成关键发现...
- 新增 `inv.main-result`：主要结果 / Main Result
- 新增 `inv.main-result-desc`：展示本次分析返回的核心数据结果。
- 新增 `inv.main-result-empty`：暂无结果表
- 新增 `inv.main-result-empty-hint`：当前分析没有可直接展示的表格结果。
- 新增 `inv.main-result-rows`：显示前 {{shown}} / {{total}} 行
- 新增 `inv.main-result-export-hint`：可导出或查看完整结果。
- 新增 `ai.high-confidence`：高置信度
- 新增 `ai.medium-confidence`：中等置信度

### Tests
- 新增 `analysis-detail-results-findings.test.tsx`（27 个测试用例）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 Markdown export
- 未改 Trace logic
- 未改 SQL appendix
- 未开始 M5 Agent

## 4. Tests

新增 `frontend-react/src/app/(shell)/__tests__/analysis-detail-results-findings.test.tsx`：

| 分类 | 测试数 | 覆盖内容 |
|------|--------|---------|
| Key Findings Layout | 5 | findings 显示、空态、中文标题提取、DOM 顺序 |
| Main Result Table | 6 | 结果表显示、空态、行数限制、截断、DOM 顺序 |
| Steps Collapsible | 2 | 默认折叠、点击展开 |
| Evaluation Simplified | 7 | 置信度数值、高/中/低置信度文案、诊断列表、改进列表、空态 |
| What was NOT changed | 5 | 不含 template/schedule/trace/performance/virtual-table、无 SVG 圆环 |

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 28 files, 524 tests passed |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (28 total, all test-only `as any` or pre-existing) |
| backend import | ✅ OK |

## 6. Online Check List

- [x] 打开详情页是否先看到摘要、关键发现、主要结果
- [x] Trace 是否没有抢主视觉（未改动 Trace）
- [x] 有结果表时是否能预览
- [x] 没有结果表时是否有友好空态
- [x] Export Markdown 是否仍正常（未改动）
- [x] invalid run id 是否仍友好（未改动）
- [x] 历史页打开详情是否没回归（未改动路由和 Store）

## 7. Next Step

通过后进入 M4-8.4.3 SQL / Trace Appendix Folding。
暂不进入 M5 Agent。
暂不打 tag。
