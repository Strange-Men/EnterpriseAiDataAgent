# M4-8.6.3 Preview + Data Quality Polish

## 1. Goal

让 Data Page 的数据预览和数据质量区域更容易理解，帮助用户判断数据是否适合继续分析。

## 2. Changes

### Preview Header
- 添加区域标题「数据预览 / Data Preview」
- 添加说明文案：「查看前几行样例数据，确认字段是否符合分析需求。」
- 从原来的单行 `表名: activeTable` 改为结构化 header + summary 布局

### Preview Summary
- 显示总行数 / 总列数（复用 qualityReport 元数据）
- 显示当前预览行数：「当前显示前 100 行预览」
- Preview Tab 内增加行数 / 列数 badge
- 无质量数据时仅显示预览行数，不报错

### Data Quality Summary
- 标题从「数据质量评分」改为「数据质量」
- 添加说明文案：「基础质量检查帮助你判断这张表是否适合继续分析。」
- 总分旁显示质量就绪状态（「数据质量良好」/「数据存在部分质量问题」）
- stats 区域从纯文本 `<p>` 改为结构化 StatBadge 组件
- 缺失值 / 重复行 / 异常值各用独立 badge，高风险项用黄色警告样式

### Missing Values / Field Types
- 缺失值区域单独分组，带标题「缺失值 / Missing Values」
- 字段类型区域单独分组，带标题「字段类型 / Field Types」
- Schema Tab 和 Quality Tab 都显示字段类型统计（如 `VARCHAR × 3`）
- 没有质量数据时显示友好空态，带 quality.description 说明

### Empty State
- 空态 icon 从空格 `" "` 修复为 `"📋"` / `"📊"` / `"📄"`
- 空态描述使用 i18n key `preview.no-data-loaded`
- 去除硬编码英文描述

### Start Analysis Entry
- 在预览区底部添加「开始分析 →」链接
- 说明文案：「数据看起来没问题后，可以进入分析工作台继续分析。」
- 链接到 `/analyze`，不改 active table 逻辑

### i18n
新增 key：
| Key | zh | en |
|-----|----|----|
| `preview.description` | 查看前几行样例数据，确认字段是否符合分析需求。 | Review sample rows and confirm that the fields are ready for analysis. |
| `preview.rows-summary` | 共 {{rows}} 行 · {{columns}} 列 | {{rows}} rows · {{columns}} columns |
| `preview.preview-rows` | 当前显示前 {{count}} 行预览 | Showing the first {{count}} preview rows |
| `preview.no-data-loaded` | 暂无数据，请在左侧选择一张数据表。 | No data loaded. Select a table from the left panel. |
| `preview.start-analysis` | 开始分析 → | Start Analysis → |
| `preview.analysis-hint` | 数据看起来没问题后，可以进入分析工作台继续分析。 | Once the data looks ready, continue to the analysis workspace. |
| `quality.title` | 数据质量 | Data Quality |
| `quality.description` | 基础质量检查帮助你判断这张表是否适合继续分析。 | Basic quality checks help you decide whether this table is ready for analysis. |
| `quality.field-types` | 字段类型 | Field Types |
| `quality.missing-values` | 缺失值 | Missing Values |
| `quality.ready` | 数据质量良好，可以开始分析。 | Data quality looks good. Ready for analysis. |
| `quality.needs-attention` | 数据存在部分质量问题，建议检查后继续。 | Some quality issues detected. Review before continuing. |

修改 key：
| Key | 旧值 (zh) | 新值 (zh) |
|-----|-----------|-----------|
| `quality.title` | 数据质量评分 | 数据质量 |

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改上传逻辑
- 未改表选择逻辑
- 未改删除逻辑
- 未改预览数据加载逻辑（fetchTableData / fetchTableSchema）
- 未改 Data Quality 计算逻辑
- 未改表格虚拟化 / 分页逻辑
- 未开始 M4-8.6.4
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/data-preview-quality-polish.test.tsx`

测试覆盖（16 个测试）：
1. preview title 存在（中英文）
2. preview description 表达「样例数据 / ready for analysis」
3. rows-summary 显示行数和列数
4. preview-rows 显示当前预览行数
5. quality title 存在且用户友好
6. quality description 用户友好
7. missing-values 标签存在
8. field-types 标签存在
9. quality ready / needs-attention 标签存在
10. start-analysis 入口存在
11. analysis-hint 存在且友好
12. no-data-loaded 空态存在
13. 现有 preview key 保留
14. 现有 quality key 保留
15. 不新增 Templates / Schedule / Diff / Timeline key
16. 新增 key 均在 preview.* / quality.* 命名空间下

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 883/883 passed (40 files, +16 new) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 6. Online Check List

- [x] 预览区是否说明用途 — ✅ 标题「数据预览」+ 说明「查看前几行样例数据…」
- [x] 行数 / 列数 / 预览行数是否清楚 — ✅ badge 显示总行列 + 预览行数
- [x] 数据质量是否更容易理解 — ✅ 标题 + 说明 + 质量就绪状态
- [x] 缺失值 / 字段类型是否清楚 — ✅ 分组 badge 展示
- [x] 开始分析入口是否清楚 — ✅ 底部链接 + 说明文案
- [x] 上传 / 选表 / 删除是否没回归 — ✅ 未改相关逻辑

## 7. Changed Files

| 文件 | 改动 |
|------|------|
| `frontend-react/src/panels/data-preview-panel.tsx` | 重构：Preview header、summary、quality 展示、start analysis 入口 |
| `frontend-react/src/i18n/zh.ts` | 新增 12 个 key，修改 1 个 key |
| `frontend-react/src/i18n/en.ts` | 新增 12 个 key，修改 1 个 key |
| `frontend-react/src/app/(shell)/__tests__/data-preview-quality-polish.test.tsx` | 新增测试文件 |

## 8. Next Step

通过后进入 M4-8.6.4 Delete / Empty / Error State Polish。
暂不进入 M5 Agent。
暂不打 tag。
