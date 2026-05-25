# MIGRATION_NOTES.md — v0.8.0 State Refactor 迁移指南

## 变更摘要

v0.8.0 Phase 1 将 4 个 store 合并为 2 个：

| 旧 Store | 新 Store | 状态 |
|---------|---------|------|
| `workflow-store` | `investigation-store` | @deprecated 兼容层 |
| `ai-session-store` | `investigation-store` | @deprecated 兼容层 |
| `sql-workspace-store` | `sql-editor-store` | @deprecated 兼容层 |
| `query-tabs-store` | `sql-editor-store` | @deprecated 兼容层 |

## 对现有代码的影响

### 无需修改（兼容层保证）

旧 import 路径继续有效：

```typescript
// 这些 import 继续工作，无需修改
import { useWorkflowStore } from "@/stores/workflow-store";
import { useAiSessionStore } from "@/stores/ai-session-store";
import { useSqlWorkspaceStore } from "@/stores/sql-workspace-store";
import { useQueryTabsStore } from "@/stores/query-tabs-store";
```

### 推荐迁移

新代码应直接使用新 store：

```typescript
// 新 import（推荐）
import { useInvestigationStore } from "@/stores/investigation-store";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
```

### 字段映射

#### workflow-store → investigation-store

| 旧字段 | 新字段 | 备注 |
|--------|--------|------|
| `stage` | `stage` | 同类型 |
| `activeTable` | `activeTable` | 同类型 |
| `aiSql` | `lastSql` | 重命名 |
| `startedAt` | `startedAt` | 同类型 |
| `source` | `source` | 同类型 |
| `advance()` | `advance()` | 同签名 |
| `reset()` | `reset()` | 同签名 |

#### ai-session-store → investigation-store

| 旧字段/方法 | 新字段/方法 | 备注 |
|------------|------------|------|
| 所有字段和方法 | 同名 | 完全兼容 |

#### sql-workspace-store → sql-editor-store

| 旧字段 | 新字段 | 备注 |
|--------|--------|------|
| `activeTab` | `activePanelTab` | 重命名（避免与 query tab 冲突） |
| `setActiveTab` | `setActivePanelTab` | 重命名 |
| 其它所有字段 | 同名 | 完全兼容 |

#### query-tabs-store → sql-editor-store

| 旧字段/方法 | 新字段/方法 | 备注 |
|------------|------------|------|
| 所有字段和方法 | 同名 | 完全兼容 |

## localStorage 迁移

| 旧 Key | 新 Key | 迁移方式 |
|--------|--------|---------|
| `ai-session` | `investigation` | 自动（首次加载时检测并迁移，删除旧 key） |
| `query-tabs` | `sql-editor` | 自动（首次加载时检测并迁移，删除旧 key） |

迁移是一次性的。用户首次打开新版本时自动完成。

## 新增 API

### investigation-store

```typescript
// 设置当前分析运行
useInvestigationStore.getState().setActiveRun(runId);

// 添加到 drill-down 链路
useInvestigationStore.getState().addToDrillChain(runId);

// 读取 drill-down 链路
const chain = useInvestigationStore.getState().drillChain;
```

### sql-editor-store

```typescript
// currentSql 自动与 active tab 同步
// 切换 tab 时自动更新 currentSql
// 调用 setCurrentSql 时自动更新 active tab 的 sql

const { currentSql, setCurrentSql } = useSqlEditorStore();
// currentSql === getActiveTab()?.sql （始终一致）
```

## 删除时间表

| 文件 | 计划删除版本 |
|------|------------|
| `workflow-store.ts` | v0.9.0 |
| `ai-session-store.ts` | v0.9.0 |
| `sql-workspace-store.ts` | v0.9.0 |
| `query-tabs-store.ts` | v0.9.0 |

## 回滚方案

如需回滚：
1. 恢复旧 store 文件的 git 历史版本
2. 恢复消费者文件的 git 历史版本
3. 新 key `investigation` 和 `sql-editor` 的 localStorage 数据可忽略
