# M4-8.5.2 History Record Cards Polish

## 1. Goal

让每条历史记录从"日志条目"变成可识别、可理解、可继续操作的历史工作卡片。

## 2. Changes

### Card Layout Restructure

- Header 行：Type Badge + Status Badge（含文字）+ 相对时间（右对齐）
- Title 行：问题摘要或 SQL 摘要（加粗、更大字号，更突出）
- Metadata 行：表名 · 行数 · 耗时（紧凑、辅助信息）
- AI Summary 行：AI 分析摘要（如存在，line-clamp-2）
- Actions 区域：用 subtle border-top 与正文分隔

### Type Badge

- AI 记录：紫色 badge "AI 分析" / "AI Analysis"
- SQL 记录：蓝色 badge "专家 SQL" / "Expert SQL"
- 视觉差异轻微但可区分

### Status Badge

- 从纯色圆点改为圆点 + 文字标签
- 成功：绿色圆点 + "成功" / "Success"
- 部分成功：琥珀色圆点 + "部分成功" / "Partial"
- 失败：红色圆点 + "失败" / "Failed"

### Time Display

- 从绝对时间（HH:mm）改为相对时间（如 "5 min", "2h"）
- 绝对时间保留在 title 属性中（hover 可见）

### Runtime Display

- 从毫秒（如 "1234ms"）改为人类可读格式（如 "1.2s", "1m 5s"）
- 新增 `formatRuntime()` 工具函数

### Card Spacing

- 从 `space-y-2`（8px）改为 `space-y-3`（12px）

### Title Display

- AI 记录：优先显示用户问题，无问题时显示 "未命名分析" / "Untitled analysis"
- SQL 记录：显示 SQL 第一行或压缩后的摘要，长 SQL 截断到 100 字符
- 无 SQL 时显示 "未命名 SQL 查询" / "Untitled SQL query"

### Metadata Labels

- 表名前增加 "表:" / "Table:" 标签
- 耗时前增加 "耗时:" / "Duration:" 标签
- 行数和耗时之间用 `·` 分隔

### i18n

新增 keys：

| Key | zh | en |
|-----|----|----|
| history.status-success | 成功 | Success |
| history.status-partial | 部分成功 | Partial |
| history.status-error | 失败 | Failed |
| history.table-label | 表 | Table |
| history.duration-label | 耗时 | Duration |
| history.unnamed-analysis | 未命名分析 | Untitled analysis |
| history.unnamed-sql | 未命名 SQL 查询 | Untitled SQL query |

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 History action logic（openDetail / rerun / loadToWorkspace / export / copy / delete 不变）
- 未改导出逻辑
- 未改按钮数量和行为
- 未处理 stale table 逻辑
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/history-record-cards.test.tsx`

覆盖：

1. formatRuntime: 毫秒格式化（500ms → "500ms"）
2. formatRuntime: 秒格式化（1200ms → "1.2s"）
3. formatRuntime: 分秒格式化（65000ms → "1m 5s"）
4. formatRuntime: 零值处理
5. formatRuntime: null/undefined 处理
6. formatRuntime: 负值处理
7. Status badge i18n: 中文成功/部分成功/失败
8. Status badge i18n: 英文 Success/Partial/Failed
9. Metadata label i18n: 中文表/耗时
10. Metadata label i18n: 英文 Table/Duration
11. Fallback title i18n: 中文未命名分析/未命名 SQL 查询
12. Fallback title i18n: 英文 Untitled analysis/Untitled SQL query
13. Existing action keys preserved: open-detail / rerun-analysis / load-to-workspace / export-md / export-csv / copy-question / copy-sql / delete / table-not-found
14. Negative checks: 不恢复 Templates / /performance / /virtual-table

总计：33 个测试文件，669 个测试通过。

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 669 tests passed (33 files) |
| next build | ✅ compiled successfully |
| next lint | ✅ pass (pre-existing warnings only) |
| backend import | ✅ OK |

## 6. Online Check List

- [x] AI 记录一眼看出是 AI 分析（紫色 badge）
- [x] SQL 记录一眼看出是专家 SQL（蓝色 badge）
- [x] 问题 / SQL 摘要清楚（标题行加粗突出）
- [x] 表名 / 状态 / 时间清楚（metadata 行 + status badge）
- [x] 行数 / 耗时信息可见（metadata 行）
- [x] 耗时显示人类可读（formatRuntime）
- [x] 时间显示相对时间（formatRelativeTime）
- [x] 卡片间距合理（space-y-3）
- [x] Actions 没回归（按钮数量和行为不变）
- [x] 导出 / 重新运行 / 加载到工作台没被改
- [x] 未改 Store
- [x] 未改 API
- [x] 未恢复 Templates / Schedule / Diff / Timeline
- [x] 未恢复 /performance、/virtual-table

## 7. Next Step

通过后进入 M4-8.5.3 History Actions Clarity。
暂不进入 M5 Agent。
暂不打 tag。
