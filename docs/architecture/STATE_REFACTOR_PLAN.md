# STATE_REFACTOR_PLAN.md — v0.8.0 Phase 1 状态架构重构计划

> 渐进式迁移，不大爆炸重写，优先运行时稳定性。

## 当前问题

11 个 Zustand store，存在严重状态重复：

| 重复状态 | 出现位置 |
|---------|---------|
| `activeTable` | data-store, workflow-store, ai-session-store |
| `currentSql` / `aiSql` / `lastSql` | sql-workspace-store, workflow-store, ai-session-store |
| `selectedTable` | data-store (currentTable), sql-workspace-store (selectedTable) |

## 目标架构

```
stores/
├── investigation-store.ts   ← NEW: workflow + ai-session 合并
├── sql-editor-store.ts      ← NEW: sql-workspace + query-tabs 合并
├── sql-history-store.ts     ← KEEP (独立职责)
├── saved-queries-store.ts   ← KEEP (独立职责)
├── analysis-store.ts        ← KEEP (独立职责)
├── data-store.ts            ← KEEP (currentTable 唯一 owner)
├── workspace-store.ts       ← KEEP (UI 状态)
├── template-store.ts        ← KEEP
├── schedule-store.ts        ← KEEP
│
├── workflow-store.ts        ← DEPRECATED (re-export from investigation)
├── ai-session-store.ts      ← DEPRECATED (re-export from investigation)
├── sql-workspace-store.ts   ← DEPRECATED (re-export from sql-editor)
└── query-tabs-store.ts      ← DEPRECATED (re-export from sql-editor)
```

4 个旧 store 保留为兼容层，内部委托给新 store。

## 迁移步骤

### Step 1: 创建新 store（不影响现有代码）

1. `investigation-store.ts` — 完整实现，独立于旧 store
2. `sql-editor-store.ts` — 完整实现，独立于旧 store
3. 新 store 使用新的 localStorage key，不污染旧数据

### Step 2: 旧 store 改写为兼容层

4. `workflow-store.ts` → 从 investigation-store 读写
5. `ai-session-store.ts` → 从 investigation-store 读写
6. `sql-workspace-store.ts` → 从 sql-editor-store 读写
7. `query-tabs-store.ts` → 从 sql-editor-store 读写

### Step 3: 消费者逐步迁移

8. 低风险组件先迁移（table-management-panel, sql-history-panel）
9. 高风险组件后迁移（ai-analysis-panel, sql-workspace-panel）
10. 每个组件迁移后立即验证

### Step 4: 清理

11. 旧 store 标记 `@deprecated`
12. 旧 localStorage key 数据迁移到新 key
13. 所有消费者迁移完成后删除旧 store

## 兼容性保证

- **Legacy workspace 不崩**: 旧 store 的 interface 完全保留
- **SSE 不中断**: 状态读写逻辑不变，只改 owner
- **Persistence 不损坏**:
  - 新 store 用新 key (`investigation`, `sql-editor`)
  - 旧 key 保留，提供一次性迁移
  - `onRehydrateStorage` 检测旧 key 并迁移
- **Existing tests**: 旧 store 的 test 文件不改（验证兼容层行为一致）

## localStorage Key 映射

| 旧 Key | 新 Key | 迁移策略 |
|--------|--------|---------|
| `workflow` (无 persist) | `investigation` | 无需迁移 |
| `ai-session` | `investigation` | onRehydrate 检测旧 key |
| `query-tabs` | `sql-editor` | onRehydrate 检测旧 key |
| `sql-workspace` (无 persist) | `sql-editor` | 无需迁移 |

## 风险控制

1. **每个 step 独立可回滚** — 新 store 和旧 store 共存期间互不影响
2. **消费者逐个迁移** — 一个组件出问题不影响其他
3. **旧 store 保留到 v0.9.0** — 给足缓冲期
4. **build + test 在每个 step 后运行** — 不累积问题
