# M4-8.6.2 Table List / Current Table Card Polish

## 1. Goal

让 Data Page 清楚展示当前正在分析的数据表，并让表列表更像可选择的数据源列表。

## 2. Changes

### Current Table Card
- 新增 `CurrentTableCard` 组件，位于 `frontend-react/src/components/current-table-card.tsx`
- 显示当前选中表名、行数、列数、分析次数、质量评分
- 无当前表时显示友好空态（📋 icon + 引导文案）
- 提供「开始分析 →」链接，跳转 `/analyze`

### Selected Table Highlight
- Table Management Panel 中选中表添加 accent 边框和背景高亮
- 未选中表保持原有 border-default 样式
- 选中表显示「当前选中 / Selected」badge

### Table Metadata Labels
- 行数列数从 `1,234 × 5` 改为 `1,234 行 · 5 列`
- 增加 `table.rows-label` 和 `table.cols-label` i18n key

### Data Page Layout
- Current Table Card 插入在 FileUploadPanel 和 TableManagementPanel 之间
- sidebar space-y 从 6 调整为 4，保持紧凑

### i18n
新增 key：
| Key | zh | en |
|-----|----|----|
| `table.current-card-title` | 当前数据表 | Current Table |
| `table.current-card-desc` | 这张表会作为自然语言分析和专家 SQL 的默认数据源。 | This table is used as the default data source for natural language analysis and expert SQL. |
| `table.current-empty-title` | 尚未选择数据表 | No table selected |
| `table.current-empty-desc` | 上传或选择一张数据表后，可以进入分析工作台继续分析。 | Upload or choose a table, then continue to the analysis workspace. |
| `table.current-selected-badge` | 当前选中 | Selected |
| `table.rows-label` | 行 | rows |
| `table.cols-label` | 列 | cols |
| `table.start-analysis` | 开始分析 | Start Analysis |

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改上传逻辑
- 未改表选择逻辑（handleSelect 保持原样）
- 未改删除逻辑（handleDelete 保持原样，包括原生 confirm）
- 未改 Data Quality 逻辑
- 未改 active table store 逻辑
- 未开始 M4-8.6.3
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/data-table-list-current-table.test.tsx`

测试覆盖（28 个测试）：
1. Current Table Card 中英文标题
2. Current Table Card 中英文描述（提及默认数据源、自然语言分析、专家 SQL）
3. 无选中表空态中英文标题
4. 无选中表空态中英文描述（提及上传、分析工作台）
5. 选中 badge 中英文文案
6. 行数/列数标签中英文
7. 开始分析入口中英文文案
8. 现有表管理 key 保留验证（management、no-tables、delete、confirm-delete、query、rename、export）
9. 不恢复 Templates / /performance / /virtual-table

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 867/867 passed (39 files, +28 new) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 6. Online Check List

- [ ] 当前表是否一眼可见 — CurrentTableCard 显示表名 + 行列 + 分析入口
- [ ] 表列表是否能看出当前选中项 — accent 边框 + 背景高亮 +「当前选中」badge
- [ ] 表名 / 行数 / 列数是否清楚 — `1,234 行 · 5 列` 格式
- [ ] 开始分析入口是否清楚 — `开始分析 →` 按钮链接到 `/analyze`
- [ ] 选择表 / 删除表功能是否没回归 — 未改 handleSelect / handleDelete
- [ ] 上传功能是否没回归 — 未改上传逻辑

## 7. Changed Files

| 文件 | 改动 |
|------|------|
| `frontend-react/src/components/current-table-card.tsx` | 新增 Current Table Card 组件 |
| `frontend-react/src/app/(shell)/data/page.tsx` | 插入 CurrentTableCard |
| `frontend-react/src/panels/table-management-panel.tsx` | 选中高亮 + badge + metadata 标签 |
| `frontend-react/src/i18n/zh.ts` | 新增 8 个 key |
| `frontend-react/src/i18n/en.ts` | 新增 8 个 key |
| `frontend-react/src/app/(shell)/__tests__/data-table-list-current-table.test.tsx` | 新增测试文件 |

## 8. Next Step

通过后进入 M4-8.6.3 Preview + Data Quality Polish。
暂不进入 M5 Agent。
暂不打 tag。
