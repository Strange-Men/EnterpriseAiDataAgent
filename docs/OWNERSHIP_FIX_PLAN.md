# OWNERSHIP_FIX_PLAN.md — v0.8.3 Stabilization Sprint

> 消除 v0.8.x audit 中的 P0 状态分裂风险

---

## 一、问题诊断

### 1. activeTable 三向分裂

当前三个 store 各自维护"当前表"概念，无同步机制：

| Store | 字段 | 写入方 | 读取方 |
|---|---|---|---|
| `investigation-store` | `activeTable` | `advance()`, `setContext()` | context-panel, question-input, tools-panel, sql-workspace-panel |
| `data-store` | `currentTable` | `setCurrentTable()` | data-preview-panel, table-management-panel |
| `sql-editor-store` | `selectedTable` | `setSelectedTable()` | **无直接读取**（仅通过 deprecated wrapper） |

**风险**：三个字段可能指向不同 table，导致 UI 显示不一致。

### 2. activeRunId 双向分裂

两个 store 各自维护 `activeRunId`：

| Store | 写入方 | 读取方 |
|---|---|---|
| `analysis-store` | `addRun()`, `setActiveRun()` | analysis-workspace-panel, tools-panel, investigation-workspace, ai-analysis-panel |
| `investigation-store` | `setActiveRun()` (仅 1 处) | **无组件读取** |

**风险**：两处 activeRunId 可能不一致，但 investigation-store 的版本实际无人消费。

### 3. 兼容 wrapper 的 rerender 问题

4 个 deprecated wrapper store 使用 `subscribe()` + `setState(snapshot(), true)` 模式：
- 每次源 store 任何字段变化，wrapper 都会重建整个 snapshot
- `setState(snapshot(), true)` 中 `true` = replace，但无 shallow compare
- 即使 snapshot 内容未变，也会触发所有 subscriber 的 rerender

**实际影响**：零。4 个 wrapper store 均为 dead code（无任何 import）。

---

## 二、修复方案

### Fix 1: activeTable 单一 owner

**Source of truth**：`investigation-store.activeTable`

**变更**：

1. **data-store.ts** — 删除 `currentTable` / `setCurrentTable`
   - 移除字段和 setter
   - `getDatasetMeta()` 不受影响（不依赖 currentTable）

2. **sql-editor-store.ts** — 删除 `selectedTable` / `setSelectedTable`
   - 移除字段、setter、persist partialize/merge 中的相关逻辑
   - 无组件直接读取此字段

3. **table-management-panel.tsx** — `handleSelect` 停止写入已删除字段
   - 删除 `setSelectedTable(table.name)` 调用
   - 删除 `setCurrentTable(table.name)` 调用
   - 改为写入 `investigation-store` 的 `setContext({ table: table.name })`

4. **file-upload-panel.tsx** — `handleTableClick` 停止写入 `setCurrentTable`
   - 删除 `setCurrentTable(tableName)` 调用
   - 已有 `investigation-store.advance()` 调用覆盖此场景

5. **data-preview-panel.tsx** — 从 `investigation-store` 读取 activeTable
   - `const activeTable = useInvestigationStore((s) => s.activeTable)`
   - 替换所有 `currentTable` 引用为 `activeTable`

### Fix 2: activeRunId 单一 owner

**Source of truth**：`analysis-store.activeRunId`

**变更**：

1. **investigation-store.ts** — 删除 `activeRunId` / `setActiveRun`
   - 从 interface、state、reset()、clear()、partialize 中移除
   - 保留 `activeTable` 等其他 investigation 上下文

2. **investigation-workspace.tsx** — `handleStart` 删除 `investigation.setActiveRun(runId)`
   - `addRun()` 已在 analysis-store 中设置 activeRunId
   - 无需双写

### Fix 3: 删除 dead wrapper stores

以下 4 个文件为 dead code（零 import），直接删除：

| 文件 | 包装目标 |
|---|---|
| `ai-session-store.ts` | investigation-store |
| `workflow-store.ts` | investigation-store |
| `query-tabs-store.ts` | sql-editor-store |
| `sql-workspace-store.ts` | sql-editor-store |

**测试文件处理**：
- `workflow-store.test.ts` — 已直接测试 investigation-store，保留
- `ai-session-store.test.ts` — 已直接测试 investigation-store，保留
- `query-tabs-store.test.ts` — 已直接测试 sql-editor-store，保留
- `sql-workspace-store.test.ts` — 已直接测试 sql-editor-store，保留

测试文件无需修改（已使用 canonical store import）。

### Fix 4: Rerender 修复

**实际状态**：wrapper store 的 rerender 问题因删除 wrapper 而自然消除。
- 不存在其他需要 shallow compare 的场景
- 现有组件使用 selector 模式（如 `useAnalysisStore((s) => s.activeRunId)`），已是最佳实践

---

## 三、不变性保证

- `/analyze/[runId]` 页面使用 URL 参数，不依赖 activeRunId → 不受影响
- investigation-store 的 `getContextForApi()` 不包含 activeRunId → 不受影响
- analysis-store 的 persist 逻辑不变 → 历史数据兼容
- 所有现有 API 不变 → 后端无影响

---

## 四、验证清单

- [ ] `npx next build` 通过
- [ ] TypeScript 类型检查通过
- [ ] 所有 frontend 测试通过
- [ ] 运行时导航正常（/analyze, /analyze/[runId]）
- [ ] SSE 分析流程正常
- [ ] 无回归
