# M4-8.5.3 History Actions Clarity

## 1. Goal

让历史记录卡片的操作区从"按钮堆叠"变成主次清晰的工作流入口。

## 2. Changes

### Action Hierarchy Restructure

- AI history: primary action = "查看详情"（紫色按钮），其余收入 More 菜单
- SQL history: primary action = "加载到工作台"（蓝色按钮），其余收入 More 菜单
- More 菜单使用现有 DropdownMenu 组件
- 每条记录默认只显示 2 个交互元素：primary button + More trigger

### AI Record Actions

| Action | Before | After |
|--------|--------|-------|
| 查看详情 | purple button | primary button（更大、更突出） |
| 重新运行 | secondary button | More 菜单项 |
| 导出 Markdown | secondary button | More 菜单项 |
| 复制问题 | secondary button | More 菜单项 |
| 删除 | hover 显示 | More 菜单项（danger） |

### SQL Record Actions

| Action | Before | After |
|--------|--------|-------|
| 加载到工作台 | blue button | primary button（更大、更突出） |
| 重新执行 | secondary button | More 菜单项 |
| 导出 CSV | secondary button | More 菜单项 |
| 复制 SQL | secondary button | More 菜单项 |
| 删除 | hover 显示 | More 菜单项（danger） |

### Visual Details

- Primary button: `px-3 py-1 text-xs font-medium`（比原来更宽、加粗）
- More trigger: `MoreHorizontal` 图标，ghost 样式
- More 菜单项：带图标（Play / FileText / ClipboardCopy / ArrowDownToLine / Trash2）
- Delete 在 More 菜单中用 `danger` 样式，与次操作用 separator 分隔

### i18n

新增 key：

| Key | zh | en |
|-----|----|----|
| history.more-actions | 更多操作 | More actions |

### Imports Added

- `DropdownMenu`, `DropdownMenuItem`, `DropdownMenuSeparator` from `@/components/ui/dropdown-menu`
- `MoreHorizontal`, `Play`, `FileText`, `ClipboardCopy`, `Trash2`, `ArrowDownToLine` from `lucide-react`

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 action handlers（handleOpenDetail / handleRerunAnalysis / handleLoadToWorkspace / handleReExecute / handleExportMarkdown / handleExportCsv / handleCopy / removeEntry 全部不变）
- 未改导出逻辑
- 未处理 stale table 逻辑
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/history-actions-clarity.test.tsx`

覆盖：

1. AI primary action key 存在（open-detail）
2. SQL primary action key 存在（load-to-workspace）
3. AI secondary actions keys 存在（rerun-analysis / export-md / copy-question）
4. SQL secondary actions keys 存在（re-execute / export-csv / copy-sql）
5. Delete action key 存在
6. More actions i18n key 存在（zh + en）
7. 所有 action keys 无回归
8. Negative checks：不恢复 Templates / Schedule / Diff / Timeline / /performance / /virtual-table

总计：34 个测试文件，689 个测试通过。

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 689 tests passed (34 files) |
| next build | ✅ compiled successfully |
| next lint | ✅ pass (pre-existing warnings only) |
| backend import | ✅ OK |

## 6. Online Check List

- [x] AI 记录主操作是"查看详情"（紫色 primary button）
- [x] SQL 记录主操作是"加载到工作台"（蓝色 primary button）
- [x] secondary actions 在 More 菜单中仍存在
- [x] 删除不再抢主视觉（在 More 菜单中，danger 样式）
- [x] 所有 action 点击逻辑没变（handler 不变）
- [x] 导出 / 重新运行 / 加载到工作台没被改
- [x] 每条记录默认只显示 2 个交互元素
- [x] More 菜单使用现有 DropdownMenu 组件
- [x] 未改 Store
- [x] 未改 API
- [x] 未恢复 Templates / Schedule / Diff / Timeline
- [x] 未恢复 /performance、/virtual-table

## 7. Next Step

通过后进入 M4-8.5.4 Stale Table / Invalid Record UX。
暂不进入 M5 Agent。
暂不打 tag。
