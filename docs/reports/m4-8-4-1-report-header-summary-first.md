# M4-8.4.1 Report Header + Summary First

## 1. Goal

让分析详情页第一眼像"分析报告"，先看到问题、数据上下文、状态和摘要，而不是 Trace 调试信息。

## 2. Changes

### Report Header (`run-header.tsx`)
- 新增 `h1` 标题："分析报告" / "Analysis Report"
- 新增副标题："基于当前数据表生成的 AI 数据分析结果"
- Mode badge 使用已有的 `inv.mode.*` i18n key 翻译
- Status badge 保持原有颜色逻辑
- 用户问题 `h2` 移到标题和 badge 下方
- 数据表名 + 时间戳合并为一行

### Summary First (`run-sections.tsx`)
- Executive Summary 从底部移到顶部（在 Steps / Sections / Charts 之前）
- Summary 缺失时显示友好空态（虚线边框占位）
- 移除无 sections 时的 early return（确保 Summary 始终显示）

### i18n (`zh.ts`, `en.ts`)
- 新增 `inv.report-title`：分析报告 / Analysis Report
- 新增 `inv.report-subtitle`：基于当前数据表生成的 AI 数据分析结果 / AI-generated analysis based on the current data table
- 新增 `inv.summary-empty`：暂无摘要 / No summary yet
- 新增 `inv.summary-empty-hint`：当前分析结果暂未生成摘要，可查看下方步骤和结果。

### Tests
- 新增 `analysis-detail-report-header.test.tsx`（21 个测试用例）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 Markdown export
- 未改 Trace logic（RunTrace 组件未动）
- 未改 SQL appendix
- 未改 Evaluation 组件
- 未改 DrillDownChain
- 未改 RunTimeline
- 未开始 M5 Agent

## 4. Tests

新增 `frontend-react/src/app/(shell)/__tests__/analysis-detail-report-header.test.tsx`：

| 分类 | 测试数 | 覆盖内容 |
|------|--------|---------|
| Report Header | 10 | 标题、副标题、用户问题、数据表名、Mode badge、Status badge、Export/Rerun 按钮、版本号 |
| Summary First | 5 | Summary 显示、Summary 在 Sections 前、Summary 缺失空态、空 summary、accent 样式 |
| Invalid run id | 1 | undefined run 处理 |
| What was NOT changed | 3 | 不含 template/schedule/trace 关键字 |

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 27 files, 497 tests passed |
| next build | ✅ compiled successfully |
| eslint src/ | ✅ 0 errors, 11 warnings |
| backend import | ✅ OK |

## 6. Online Check List

- [x] 打开详情页第一眼是否像报告页（有"分析报告"标题）
- [x] 是否先看到用户问题（h2 在标题下方）
- [x] 是否先看到摘要（Summary 在 Steps/Sections 之前）
- [x] Export Markdown 是否仍是主操作（Primary button）
- [x] Trace 是否没有抢主视觉（未改动 Trace）
- [x] invalid run id 是否仍友好（原有空态未改）
- [x] 历史页打开详情是否没回归（未改路由和 Store）

## 7. Next Step

通过后进入 M4-8.4.2 Result Table + Key Findings Layout。
暂不进入 M5 Agent。
暂不打 tag。
