# V0.8 State Ownership Audit — Enterprise AI Data Agent

> Audit date: 2026-05-26 | Version: v0.8.2 | Phase 3 Complete

## 1. Ownership Matrix

### 1.1 核心概念与 Owner

| 概念 | 主 Owner | 次 Reader | 违规？ |
|------|---------|-----------|--------|
| 当前活跃表 | investigation-store.activeTable | data-store.currentTable, sql-editor-store.selectedTable | **是 — 3 个 store 各自持有** |
| 当前活跃运行 | analysis-store.activeRunId | investigation-store.activeRunId | **是 — 2 个 store 各自持有** |
| 当前 SQL | sql-editor-store.currentSql | investigation-store.lastSql | 否 — 语义不同（编辑 vs 历史） |
| AI 对话轮次 | investigation-store.turns | (无) | 否 — 单一 owner |
| 分析历史 | analysis-store.runs | data-store.getDatasetMeta() | 否 — 只读引用 |
| 查询标签页 | sql-editor-store.tabs | (无) | 否 — 单一 owner |
| 工作区布局 | workspace-store.layout | (无) | 否 — 单一 owner |
| 主题 | use-theme.theme | (无) | 否 — 单一 owner |
| 国际化语言 | workspace-store.language | (无) | 否 — 单一 owner |
| SQL 历史 | sql-history-store.history | (无) | 否 — 单一 owner |
| 已保存查询 | saved-queries-store.queries | (无) | 否 — 单一 owner |
| 分析模板 | template-store.templates | (无) | 否 — 单一 owner |
| 调度任务 | schedule-store.tasks | (无) | 否 — 单一 owner |

### 1.2 Store 职责边界

```
investigation-store (382 lines)
  ├── 分析生命周期（stage, source, startedAt）
  ├── AI 对话（turns, compressedSummary）
  ├── 知识管理（keyFindings, investigationSummary）
  ├── 钻取链（drillChain）
  ├── 活跃上下文（activeTable, activeRunId）    ← 与其他 store 重叠
  └── 元数据（lastSql, lastColumns, lastRowCount）

sql-editor-store (299 lines)
  ├── 查询标签页（tabs, activeTabId）
  ├── 当前 SQL（currentSql — invariant: === activeTab.sql）
  ├── 查询执行（isExecuting, queryResult）
  ├── 分页（offset, limit, hasMore, loadMore）
  ├── 选中表（selectedTable）                    ← 与其他 store 重叠
  └── 面板标签页（activePanelTab）

analysis-store (453 lines)
  ├── 分析运行历史（runs）
  ├── 活跃运行（activeRunId）                    ← 与其他 store 重叠
  ├── 运行 CRUD（add/update/delete/save/unsave/rerun）
  ├── 进化链（getEvolutionChain）
  ├── 钻取（drillDownRun）
  ├── 对比（compareRuns）
  └── 导入导出（importRuns/exportRun）

data-store (81 lines) — 未持久化
  ├── 数据库状态（dbStatus, tables）
  ├── 当前表/数据（currentTable, currentData, currentColumns）  ← 与其他 store 重叠
  ├── 质量报告（qualityReport）
  ├── 上传文件（uploadedFiles）
  └── 系统状态（systemStatus）
```

## 2. 重复所有权详细分析

### 违规 1: activeTable 三向分裂

```
investigation-store.activeTable   ← 主 owner（AI 分析上下文）
data-store.currentTable           ← UI 数据展示
sql-editor-store.selectedTable    ← SQL 编辑器上下文
```

**同步链：**
- ContextPanel 选择表 → `investigation.advance("profiling", { table })` → 只更新 investigation-store
- data-store.currentTable 通过 `useTables()` hook 独立设置（首次加载时）
- sql-editor-store.selectedTable 仅在用户手动在 SQL 编辑器中设置时更新

**影响场景：**
1. 用户在 ContextPanel 中选择 "sales" 表
2. investigation-store.activeTable = "sales"
3. data-store.currentTable 仍为之前的值
4. 如果某个组件从 data-store 读取 currentTable 来显示表信息，它会显示错误的表
5. sql-editor-store.selectedTable 不变，quick-SQL textarea 可能使用错误的表名

**建议修复：**
```ts
// 在 investigation-store.advance 中添加同步
advance: (stage, opts) => {
  if (opts?.table) {
    useDataStore.getState().setCurrentTable(opts.table);
    useSqlEditorStore.getState().setSelectedTable(opts.table);
  }
  // ...
}
```

### 违规 2: activeRunId 双向分裂

```
analysis-store.activeRunId        ← 主 owner（历史面板选中运行）
investigation-store.activeRunId   ← 钻取链上下文
```

**同步链（当前）：**
- `investigation-workspace.tsx::handleStart` → `investigation.setActiveRun(runId)` + `addRun(runId)` → 但未调用 `analysisStore.setActiveRun(runId)`
- 用户在 RunDetail 页面通过 URL 参数隐式设置了当前运行，但两个 store 的 activeRunId 都可能未更新

**影响场景：**
1. 用户从历史面板选择 run-123 → analysis-store.activeRunId = "run-123"
2. investigation-store.activeRunId 仍为之前的值或 null
3. 钻取链 `addToDrillChain()` 可能引用错误的运行

**建议修复：**
- 指定 analysis-store 为 activeRunId 的唯一 owner
- investigation-store 移除 activeRunId，改为 `getContextForApi()` 中从 analysis-store 读取

### 违规 3: data-store 未持久化导致的数据丢失

```
data-store.tables        ← 刷新后丢失
data-store.currentData   ← 刷新后丢失
data-store.qualityReport ← 刷新后丢失
```

**影响：** `getDatasetMeta()` 方法跨 store 读取 analysis-store.runs（持久化）来计算分析次数，但 `qualityScore` 在刷新后始终为 null（因为 qualityReport 未持久化）。

**评估：** 这是设计选择而非 bug——tables/qualityReport 由后端 API 重新获取。但在刷新后的短暂时刻（API 返回之前），UI 可能闪烁空状态。

## 3. Compatibility Wrapper 所有权

### 3.1 Wrapper 作为独立 Zustand Store

每个 wrapper 是独立的 Zustand store，有自己的内存状态。这引入了微妙的所有权问题：

```
investigation-store (源, 持久化)
  ├── subscribe → workflow-store (wrapper, 非持久化, 独立内存)
  └── subscribe → ai-session-store (wrapper, 非持久化, 独立内存)
```

**问题：** wrapper 的状态在技术上是 source store 状态的副本，但如果有人直接调用 `wrapper.setState()`，它会暂时不同步。

**当前保护：** 所有 wrapper action 都转发到 source store（不直接修改 wrapper 状态）。仅 subscribe 回调修改 wrapper 状态。

**验证通过：** Grep 确认没有外部代码调用 `useWorkflowStore.setState()` 或类似操作。

### 3.2 Wrapper 的持久化状态

所有 4 个 wrapper 都没有 `persist` 中间件。这意味着：
- wrapper 的状态仅在内存中
- 页面刷新后，wrapper 重新从 source store 快照
- source store 从 localStorage 恢复 → subscribe 触发 → wrapper 更新

这是正确的设计。

## 4. 跨 Store 通信模式

### 4.1 已使用的模式

| 模式 | 使用者 | 评估 |
|------|--------|------|
| 直接 getState() 读取 | data-store → analysis-store (getDatasetMeta) | 正确，单向只读 |
| Subscribe 推送 | source store → wrapper stores | 正确，但无变化检测 |
| 组件协调 | investigation-workspace 同时更新 investigation + analysis store | 脆弱，依赖组件不遗漏 |
| Import 依赖 | sql-editor-store → api.ts (loadMore) | 正确，store 依赖 service |

### 4.2 缺失的模式

| 模式 | 适用场景 | 状态 |
|------|---------|------|
| Store 间 action 调用 | activeTable 同步 | 未实现 |
| Event bus | 跨 store 通知 | 未实现 |
| Derived store | 计算属性 | 未使用 Zustand derived |

## 5. 所有权评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 单一事实来源清晰度 | 7/10 | 大部分概念有明确 owner，2 个概念有重叠 |
| 跨 store 同步 | 4/10 | activeTable 和 activeRunId 无自动同步 |
| 持久化一致性 | 8/10 | 持久化策略清晰，data-store 不持久化是设计选择 |
| Wrapper 隔离 | 9/10 | Wrapper 正确隔离，无泄漏 |
| 迁移安全性 | 7/10 | 迁移后状态 shape 正确，但 cross-tab 无协调 |

**综合评分：7.0/10** — 所有权基本清晰，两个高优先级重复需要修复。
