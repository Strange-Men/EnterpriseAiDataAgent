# M4-8.5.1 History Page Header + Filters

## 1. Goal

让 History 页从"日志列表"转向"可回查、可复用、可导出"的历史工作台入口。

## 2. Changes

### History Page Header

- 标题从 "查询历史" 改为 "历史记录"（zh）/ "History"（en）
- 说明从 "查看和管理您的查询历史" 改为 "回查、复用和导出之前的 AI 分析与 SQL 查询。"（zh）/ "Review, reuse, and export previous AI analyses and SQL queries."（en）
- 使用 `history.title` 替代 `nav.history` 作为页面标题

### Panel Header

- 移除冗余的 section title（页面标题已提供上下文）
- 改为 count + title badge 格式："N 历史记录"

### Filter Chips

- Type filter：从原生 `<select>` 改为可见的 pill-shaped chip 按钮
  - 全部 | AI 分析 | 专家 SQL
  - All | AI Analysis | Expert SQL
- Status filter：从原生 `<select>` 改为可见的 pill-shaped chip 按钮
  - 全部 | 成功 | 失败 / 失效
  - All | Success | Failed / Invalid
- 选中状态使用 accent 背景色，未选中使用 border + muted 文字
- 两组 filter 用 `|` 分隔

### Search Placeholder

- 从 "搜索问题或 SQL..." 改为 "搜索问题、SQL 或表名..."
- 从 "Search questions or SQL..." 改为 "Search questions, SQL, or table names..."

### Empty State

- 说明文案更新：强调 "回查、重新运行和导出"
- 新增两个行动按钮：
  - 上传数据（primary accent 样式）→ 跳转 /data
  - 开始分析（secondary border 样式）→ 跳转 /analyze
- 搜索结果空态不显示行动按钮

### i18n

新增/修改的 keys：

| Key | zh | en |
|-----|----|----|
| history.title | 历史记录 | History |
| history.description | 回查、复用和导出之前的 AI 分析与 SQL 查询。 | Review, reuse, and export previous AI analyses and SQL queries. |
| history.search | 搜索问题、SQL 或表名... | Search questions, SQL, or table names... |
| history.filter-failed | 失败 / 失效 | Failed / Invalid |
| history.no-history-desc | 上传数据并完成一次分析后，你可以在这里回查、重新运行和导出结果。 | After uploading data and running an analysis, you can review, rerun, and export results here. |
| history.no-history-action-upload | 上传数据 | Upload Data |
| history.no-history-action-analyze | 开始分析 | Start Analysis |

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store（filterType / filterStatus / getFiltered 逻辑不变）
- 未改后端
- 未改 History action logic（openDetail / rerun / loadToWorkspace / export 不变）
- 未改导出逻辑
- 未处理 stale table 逻辑
- 未改卡片布局（M4-8.5.2 处理）
- 未改按钮主次（M4-8.5.3 处理）
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/history-header-filters.test.tsx`

覆盖：

1. History 页面标题存在（中/英）
2. History 页面说明表达"回查 / 复用 / 导出"（中/英）
3. All filter 存在（中/英）
4. AI Analysis filter 存在（中/英）
5. Expert SQL filter 存在（中/英）
6. Success filter 存在（中/英）
7. Failed / Invalid filter 存在（中/英）
8. 搜索 placeholder 包含"SQL"和"表名"（中/英）
9. 空态标题存在（中/英）
10. 空态说明包含"回查 / 重新运行 / 导出"（中/英）
11. 空态"上传数据"按钮文案存在（中/英）
12. 空态"开始分析"按钮文案存在（中/英）
13. 不恢复 Templates 页
14. 不恢复 /performance 路由
15. 不恢复 /virtual-table 路由
16. 保留现有 action keys（open-detail / rerun / load-to-workspace / export-md / export-csv / delete / table-not-found）

总计：32 个测试文件，636 个测试通过。

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 636 tests passed (32 files) |
| next build | ✅ compiled successfully |
| next lint | ✅ pass (pre-existing warnings only) |
| backend import | ✅ OK |

## 6. Online Check List

- [ ] History 页第一眼是否说明用途
- [ ] AI / SQL 筛选是否清楚（chip 按钮而非 select）
- [ ] 空态是否有上传数据 / 开始分析入口
- [ ] 历史记录动作是否没回归
- [ ] Export / Rerun / Load to Workspace 是否没被修改

## 7. Next Step

通过后进入 M4-8.5.2 History Record Cards Polish。
暂不进入 M5 Agent。
暂不打 tag。
