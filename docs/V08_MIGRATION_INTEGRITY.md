# V0.8 Migration Integrity Audit — Enterprise AI Data Agent

> Audit date: 2026-05-26 | Version: v0.8.2 | Phase 3 Complete

## 1. Store Migration Summary

### Migration 1: ai-session-store → investigation-store

| 维度 | 状态 |
|------|------|
| 旧 key | `"ai-session"` |
| 新 key | `"investigation"` |
| 迁移时机 | Module import 时（一次性） |
| 迁移字段 | turns, compressedSummary, activeTable, lastColumns, lastRowCount, lastSql, lastInsightSummary, keyFindings, investigationSummary |
| 旧 key 处理 | `localStorage.removeItem()` — 永久删除 |
| 错误处理 | try-catch（静默） |

**迁移映射：**
```
ai-session.turns              → investigation.turns (截断至最近 8 条)
ai-session.compressedSummary  → investigation.compressedSummary
ai-session.activeTable        → investigation.activeTable
ai-session.lastColumns        → investigation.lastColumns
ai-session.lastRowCount       → investigation.lastRowCount
ai-session.lastSql            → investigation.lastSql
ai-session.lastInsightSummary → investigation.lastInsightSummary
ai-session.keyFindings        → investigation.keyFindings
ai-session.investigationSummary → investigation.investigationSummary
```

**缺失迁移：** ai-session-store 原有的 `MAX_TURNS` (20) 在迁移中被转换为 `KEEP_TURNS` (8)。超过 8 条的历史对话轮次在迁移过程中永久丢失。

### Migration 2: query-tabs-store → sql-editor-store

| 维度 | 状态 |
|------|------|
| 旧 key | `"query-tabs"` |
| 新 key | `"sql-editor"` |
| 迁移时机 | Module import 时（一次性） |
| 迁移字段 | tabs, activeTabId |
| 旧 key 处理 | `localStorage.removeItem()` — 永久删除 |
| 错误处理 | try-catch（静默） |

**迁移映射：**
```
query-tabs.tabs        → sql-editor.tabs (过滤无效条目)
query-tabs.activeTabId → sql-editor.activeTabId
```

**缺失迁移：** query-tabs-store 原有的 `activeTabId` 始终存在，但迁移后的 `sql-editor-store` merge 函数增加了验证（检查 activeTabId 是否在 tabs 中），比迁移函数更严格。

**缺失迁移：** `sql-workspace-store` 的数据（currentSql, isExecuting, queryResult, pagination 等）不迁移——这些都是运行时状态，不应持久化。

## 2. Compatibility Wrapper Integrity

### 2.1 API 兼容性检查

| Wrapper | 暴露的 API | 源 Store API | 兼容？ |
|---------|-----------|-------------|--------|
| workflow-store | stage, activeTable, aiSql, startedAt, source, advance, reset | investigation-store: stage, activeTable, lastSql→aiSql, startedAt, source, advance, reset | 完全兼容 |
| ai-session-store | turns, activeTable, lastColumns, lastRowCount, lastSql, lastInsightSummary, compressedSummary, keyFindings, investigationSummary + 9 actions | investigation-store: 相同字段/方法 | 完全兼容 |
| sql-workspace-store | currentSql, isExecuting, queryResult, offset/limit/hasMore, selectedTable, activeTab→activePanelTab, loadMore, resetPagination + setters | sql-editor-store: 相同字段 | 完全兼容（activeTab 重映射） |
| query-tabs-store | tabs, activeTabId, addTab, removeTab, renameTab, setActiveTab, updateTabSql, getActiveTab | sql-editor-store: 相同字段/方法 | 完全兼容 |

### 2.2 Wrapper 数据流验证

```
写入路径：Component → wrapper.action() → sourceStore.action() → state update
读取路径：sourceStore change → subscribe → wrapper.setState(snapshot) → Component re-render
```

**验证结果：**
- 写入路径正确：wrapper 的 action 直接调用 sourceStore 对应方法
- 读取路径正确：subscribe 在每次 sourceStore 变化时更新 wrapper
- 双向一致性：wrapper 的 state 始终是 sourceStore state 的完整快照

### 2.3 Wrapper 边界情况

| 场景 | 行为 | 风险评估 |
|------|------|----------|
| 直接调用 `wrapper.setState()` | 状态被下一次 subscribe 触发覆盖 | Low（不应发生，但无害） |
| 多个 wrapper 订阅同一 source | 每个 wrapper 独立更新 | Low（预期行为） |
| source store reset | 所有 wrapper 同步更新 | OK |
| 组件同时用新旧 store | 数据一致（wrapper 是实时快照） | OK |
| wrapper 在 source store 创建前被导入 | Zustand create 在 import 时执行，source store 也已创建 | OK（ES module 静态导入保证顺序） |

## 3. Persistence Integrity

### 3.1 Partialize 比较

| Store | v0.7.x 持久化字段 | v0.8.x 持久化字段 | 数据密度 |
|-------|------------------|------------------|----------|
| ai-session (旧) | turns, activeTable, lastColumns, lastRowCount, lastSql, lastInsightSummary, compressedSummary | — | 完整轮次+摘要 |
| investigation (新) | — | stage, source, startedAt, activeTable, activeRunId, turns(8), compressedSummary, keyFindings, investigationSummary, lastSql, lastColumns, lastRowCount, lastInsightSummary, drillChain | 更多字段但有截断限制 |
| query-tabs (旧) | tabs, activeTabId | — | 完整tabs |
| sql-editor (新) | — | tabs, activeTabId, activePanelTab, selectedTable | 更多字段但执行状态不持久化 |

**评估：** 新 store 的 partialize 策略更细致，持久化了上下文字段但限制了数据量（turns 限制 8 条，执行状态不持久化）。

### 3.2 Merge 函数比较

| Store | v0.7.x Merge | v0.8.x Merge | 改进 |
|-------|-------------|-------------|------|
| ai-session | 无（当时无 persist） | — | |
| investigation | — | 检查 turns 数组 + stage 字段 | 新增防护 |
| query-tabs | 检查 tabs 数组 | — | |
| sql-editor | — | 检查 tabs 数组 + 过滤无效条目 + 验证 activeTabId | 更严格 |

**评估：** v0.8.x 的 merge 函数比 v0.7.x 的 merge 函数更严格，提供更好的损坏防护。

## 4. Consumer Migration Status

### 4.1 已迁移消费者（直接使用新 store）

| 文件 | 使用的新 Store |
|------|---------------|
| `investigation-workspace.tsx` | investigation-store, analysis-store |
| `investigation-layout.tsx` | (无 store) |
| `context-panel.tsx` | investigation-store |
| `tools-panel.tsx` | sql-editor-store, investigation-store |
| `question-input.tsx` | investigation-store |
| `ai-streaming-indicator.tsx` | (无 store) |
| `streaming-output.tsx` | (无 store) |
| `run-header.tsx` | (通过 props) |
| `run-sections.tsx` | (通过 props) |
| `run-timeline.tsx` | (通过 props) |
| `run-trace.tsx` | (通过 props) |
| `run-evaluation.tsx` | (通过 props) |
| `drill-down-chain.tsx` | (通过 props) |
| `ai-analysis-panel.tsx` | investigation-store |
| `follow-up-input.tsx` | investigation-store |
| `file-upload-panel.tsx` | investigation-store |
| `sql-workspace-panel.tsx` | sql-editor-store, investigation-store |
| `sql-history-panel.tsx` | sql-editor-store |
| `table-management-panel.tsx` | sql-editor-store |

### 4.2 未迁移消费者（仍使用兼容 wrapper）

**无。** Grep 验证：`useWorkflowStore`、`useAiSessionStore`、`useSqlWorkspaceStore`、`useQueryTabsStore` 仅在 wrapper 文件自身和测试文件中被引用。所有外部消费者已迁移到新 store。

### 4.3 测试覆盖

| 测试文件 | 测试的 Store | 状态 |
|----------|-------------|------|
| `stores/__tests__/ai-session-store.test.ts` | investigation-store (via new import) | 已更新 |
| `stores/__tests__/query-tabs-store.test.ts` | sql-editor-store (via new import) | 已更新 |
| `stores/__tests__/sql-workspace-store.test.ts` | sql-editor-store (via new import) | 已更新 |
| `stores/__tests__/workflow-store.test.ts` | investigation-store (via new import) | 已更新 |
| `stores/__tests__/analysis-store.test.ts` | analysis-store | 未变 |
| `stores/__tests__/template-store.test.ts` | template-store | 未变 |

测试文件已更新为直接测试新 store，而非测试 wrapper。Wrapper 本身没有独立测试。

## 5. Migration Integrity Score

| 维度 | 评分 | 说明 |
|------|------|------|
| 数据迁移正确性 | 8/10 | 核心字段正确迁移，旧轮次截断有数据丢失 |
| 旧 key 清理 | 7/10 | 立即删除有风险（R14），但避免残留 |
| API 兼容性 | 10/10 | 4 个 wrapper 完全兼容旧 API |
| 消费者迁移完整性 | 10/10 | 0 个旧 store 外部引用 |
| 错误处理 | 6/10 | 静默 try-catch，迁移失败无用户提示 |
| 回滚能力 | 0/10 | 旧 key 已删除，无法回滚 |
| 测试覆盖 | 8/10 | 测试文件已更新，但 wrapper 无独立测试 |
| 跨标签页安全 | 4/10 | 无 BroadcastChannel 协调 |

**综合评分：6.6/10** — 迁移基本正确，消费者迁移完整，但缺乏回滚能力和跨标签页协调。

## 6. 改进建议

1. **不删除旧 key**：迁移后将旧 key 保留 7 天（或写入 `_migrated_at` 时间戳），作为回滚安全网
2. **迁移提示**：迁移成功后 console.info 告知用户数据已迁移到新版本
3. **BroadcastChannel**：使用 `BroadcastChannel` API 通知其他标签页迁移状态
4. **Wrapper 测试**：为 compatibility wrapper 添加独立测试，验证 snapshot 映射正确性
5. **迁移日志**：添加 `logger.ts` 记录迁移事件，便于排查问题
