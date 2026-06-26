# M4-8.8.2.y Follow-up: History Menu + Rerun Draft

## 1. Goal

修复线上人工验收发现的 History More 菜单重叠，以及"重新运行"未回填历史问题的问题。

## 2. User-reported Issues

1. History 卡片 More 菜单（`...`）弹出后与卡片内容重叠
2. 点击"重新运行"只跳转 Analyze 页面，未回填原问题到输入框

## 3. Root Cause

| 问题 | 根因 |
|------|------|
| More 菜单重叠 | `DropdownMenu` 使用 `absolute` 定位在 `relative inline-block` 容器内，z-index 为 `z-dropdown`（50）。但卡片 `div` 无 `position: relative`，且无 z-index 管理。当菜单向下展开时，被同级后续卡片（DOM 顺序靠后）遮盖。同时父级 `overflow-y-auto` 滚动容器也可能裁切溢出内容 |
| 重新运行不回填 | `handleRerunAnalysis` 通过 `CustomEvent("history:rerun-analysis")` 分发事件，但 `InvestigationWorkspace` 组件从未监听此事件。组件初始化 `question` 为空字符串，无 draft/pending 机制。事件被丢弃，用户到达空白工作区 |

## 4. Changes

### 4.1 History More 菜单重叠修复

**文件**: `frontend-react/src/components/ui/dropdown-menu.tsx`

- 添加 `onOpenChange?: (open: boolean) => void` 回调 prop
- 触发器点击和 close 时调用 `onOpenChange`

**文件**: `frontend-react/src/panels/sql-history-panel.tsx`

- 添加 `openDropdownEntryId` state 追踪当前打开菜单的卡片 ID
- 卡片 `div` 添加 `relative` 定位 + 条件 `z-10`（当该卡片的菜单打开时）
- AI 和 SQL 两种卡片的 `DropdownMenu` 均添加 `onOpenChange` 回调
- 菜单显式设置 `align="right"` 确保右对齐

### 4.2 重新运行回填问题修复

**文件**: `frontend-react/src/stores/workspace-store.ts`

- 新增 `PendingRerunDraft` 接口：`{ question, tableName?, source }`
- 新增 `pendingRerunDraft` state 和 `setPendingRerunDraft` action

**文件**: `frontend-react/src/panels/sql-history-panel.tsx`

- `handleRerunAnalysis` 改为：先通过 `setPendingRerunDraft` 设置 draft，再 `router.push("/analyze")`
- 移除无效的 `CustomEvent("history:rerun-analysis")` 分发
- 表不存在时仍设置 draft 并跳转（不再直接 return），由 Analyze 页面处理提示

**文件**: `frontend-react/src/components/investigation/investigation-workspace.tsx`

- 添加 `pendingRerunDraft` / `setPendingRerunDraft` 从 workspace store 读取
- 新增 `useEffect` 消费 draft：
  - 将 `question` 填入输入框
  - 如果 `tableName` 存在且可用，选择对应表
  - 如果 `tableName` 不存在，显示 toast 提示用户重新选择数据表
  - 切换到 AI Query tab
  - 显示"已从历史记录载入问题"成功 toast
  - 消费 draft（设为 null），避免重复触发

### 4.3 i18n 新增

| Key | 中文 | 英文 |
|-----|------|------|
| `ai.rerun-loaded` | 已从历史记录载入问题，你可以确认后重新生成分析。 | Question loaded from history. Review it and run analysis again. |
| `ai.rerun-table-missing` | 原数据表已不存在，已载入问题，请重新选择数据表后再生成分析。 | The original table is no longer available. The question was loaded; choose a table before running analysis. |

## 5. Rerun Behavior

- 从 History 点击"重新运行" → 设置 `pendingRerunDraft` → 跳转 `/analyze`
- Analyze 页面 mount 后检测 draft → 填入问题 → 消费 draft
- **不会自动运行**：仅回填问题，用户需手动点击"生成分析"
- 表存在时：自动选择对应表，用户可直接运行
- 表失效时：显示 toast 提示重新选择数据表，不崩溃
- 旧结果不残留：`setActiveRun(null)` 在 draft 消费前执行，不会加载旧 run

## 6. What Was Not Changed

- 未改后端数据库结构
- 未改 History 数据持久化逻辑
- 未改 Detail 页面
- 未改 Export / 复制 / 删除的业务行为
- 未暴露 API key
- 未提交 .env
- 未恢复禁用实验功能
- 未开始 M5 Agent
- 未打 tag

## 7. Validation

| 检查项 | 结果 |
|--------|------|
| TypeScript (`tsc --noEmit`) | ✅ 通过 |
| Next.js build | ✅ 通过 |
| Vitest (47 files, 1153 tests) | ✅ 全部通过 |
| Backend import | ✅ 通过 |
| pytest (559 passed, 31 skipped) | ✅ 全部通过 |
| ruff check | ✅ All checks passed |
| 安全搜索 | ✅ 前端源码无暴露 key |
| .env 提交检查 | ✅ 未提交 .env |

## 8. Files Changed

| 文件 | 改动 |
|------|------|
| `frontend-react/src/components/ui/dropdown-menu.tsx` | 添加 `onOpenChange` 回调 |
| `frontend-react/src/panels/sql-history-panel.tsx` | 菜单 z-index 管理 + rerun draft 设置 |
| `frontend-react/src/stores/workspace-store.ts` | 新增 `pendingRerunDraft` state |
| `frontend-react/src/components/investigation/investigation-workspace.tsx` | 消费 draft、回填问题、表校验 |
| `frontend-react/src/i18n/zh.ts` | 新增 2 个 i18n key |
| `frontend-react/src/i18n/en.ts` | 新增 2 个 i18n key |

## 9. Next Step

重新进行线上 smoke。通过后进入 M4-8.8.3 Final Release Candidate Report。暂不进入 M5 Agent，暂不打 tag。
