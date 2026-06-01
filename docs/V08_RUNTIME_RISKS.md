# V0.8 Runtime Risks — Enterprise AI Data Agent

> Audit date: 2026-05-26 | Version: v0.8.2 | Phase 3 Complete

## 新增风险（v0.8.x Phase 0→3 引入）

### R13: Compatibility Wrapper Re-render Amplification

**严重程度:** Medium | **概率:** High | **状态:** Unmitigated

**路径:** `stores/workflow-store.ts`, `ai-session-store.ts`, `sql-workspace-store.ts`, `query-tabs-store.ts`

**问题:** 4 个 compatibility wrapper 通过 `sourceStore.subscribe(() => wrapper.setState(snapshot(), true))` 同步状态。每次源 store 发生任何变化时，wrapper 都会调用 `setState(..., true)`（replace），触发所有订阅了 wrapper 的组件重新渲染，即使它们使用的状态切片没有变化。

具体来说：
- `investigation-store` 的每次 `advance()`、`addUserTurn()` 调用都会触发 `workflow-store` 和 `ai-session-store` 两个 wrapper 的完整状态替换
- `sql-editor-store` 的每次按键（`updateTabSql`）都会触发 `sql-workspace-store` 和 `query-tabs-store` 两个 wrapper 的完整状态替换
- 如果 legacy workspace 中有组件同时订阅新旧 store，可能触发双重渲染

**影响:** 不必要的组件重渲染，在 legacy workspace 页面中尤为明显。

**缓解:** 尚无。Wrapper 无法做浅比较，因为它们每次都构建全新的 snapshot 对象。

**建议:** 
1. 在 subscribe 回调中做 shallow comparison，仅在状态实际变化时才 setState
2. 或者为 wrapper 使用 `useSyncExternalStore` 风格的 selector

---

### R14: One-Time Migration Fragility (Cross-Tab Race)

**严重程度:** Medium | **概率:** Low | **状态:** Unmitigated

**路径:**
- `investigation-store.ts::migrateFromLegacy()` (lines 83-111)
- `sql-editor-store.ts::migrateFromLegacy()` (lines 46-70)

**问题:** 两个迁移函数在模块加载时运行（import 时执行），且立即删除旧 localStorage key：
```ts
localStorage.setItem(NEW_KEY, JSON.stringify({ state: migrated, version: 0 }));
localStorage.removeItem(LEGACY_KEY);  // 旧数据永久删除
```

如果用户在两个浏览器标签页中同时打开应用：
- Tab A 完成迁移，删除旧 key
- Tab B 的旧 store（如 `ai-session-store`）仍然在运行并可能在 Tab A 删除 key 后重新写入旧 key
- 此时 Tab B 刷新，迁移函数检查 `localStorage.getItem(LEGACY_KEY)` → 返回数据（Tab B 刚写入的） → 再次迁移，但数据不完整

**影响:** 数据丢失或部分迁移。用户在标签页间切换时可能丢失对话历史。

**缓解:** 尚无。

**建议:**
1. 迁移后不删除旧 key（或延迟删除），而是写入一个 `_migrated: true` 标记
2. 使用 `BroadcastChannel` API 通知其他标签页迁移已完成
3. 检测到旧 key 但已有新 key 时，合并而非覆盖

---

### R15: Dual activeTable Tracking (3-Store Fragmentation)

**严重程度:** Medium | **概率:** High | **状态:** Unmitigated

**路径:**
- `data-store.currentTable` — 用于 UI 数据展示
- `investigation-store.activeTable` — 用于 AI 分析上下文
- `sql-editor-store.selectedTable` — 用于 SQL 编辑器上下文

**问题:** 三个 store 独立跟踪"当前选中的表"，互不同步：
- 用户在 ContextPanel 中选择表 → 更新 `investigation-store.activeTable`
- `data-store.currentTable` 不变 → DataPreview 面板显示错误的表
- `sql-editor-store.selectedTable` 不变 → SQL 编辑器上下文过时

这是同一概念（当前活跃表）被三个独立 store 各自维护的结果。

**影响:** UI 不一致。不同的面板可能显示不同表的上下文。

**缓解:** 尚无。当前实践中，`handleTableSelect` 只调用 `investigation.advance("profiling", { table })`，不更新其他 store。

**建议:** 指定单一 owner（推荐 `investigation-store.activeTable`），在其他 store 中通过 getState() 读取，或使用 subscribe 同步。

---

### R16: Dual activeRunId Tracking

**严重程度:** Low | **概率:** Medium | **状态:** Unmitigated

**路径:**
- `analysis-store.activeRunId` — 分析历史面板的选中运行
- `investigation-store.activeRunId` — 钻取链和当前分析上下文

**问题:** 两个 store 独立跟踪"当前活跃的运行"：
- `investigation-workspace.tsx` 调用 `investigation.setActiveRun(runId)` + `analysisStore.addRun()` 
- 但从未调用 `analysisStore.setActiveRun(runId)`
- 如果用户在 analysis history panel 中选择不同的运行，`analysis-store.activeRunId` 会变化，但 `investigation-store.activeRunId` 不会

**影响:** 钻取链可能引用错误的运行 ID。

**缓解:** `investigation-workspace.tsx` 在 `handleStart` 中同时设置两个 store 的 active run。但在外部导航场景中可能不同步。

**建议:** 在 `investigation-store.setActiveRun` 中同步更新 `analysis-store.activeRunId`，或反之。统一 ownership。

---

### R17: Focus Mode Not Persisted

**严重程度:** Low | **概率:** High | **状态:** Unmitigated

**路径:** `investigation-layout.tsx::isFocusMode` (useState)

**问题:** Focus mode 是本地 `useState`，页面刷新后丢失。用户每次进入 `/analyze` 都需要重新切换 focus mode。

**影响:** 用户体验摩擦。不符合 workspace 级别设置应有的持久化预期。

**建议:** 移到 `workspace-store` 中持久化，或移到 `investigation-store` 中 partialize。

---

### R18: Legacy Workspace Coexistence Risk

**严重程度:** Low | **概率:** Low | **状态:** Accepted (temporary)

**路径:** `/workspace-legacy` vs `/analyze`

**问题:** 两套完全独立的 workspace 实现并存：
- 新的 investigation workspace 使用 investigation-store + sql-editor-store
- 旧的 legacy workspace 使用 compatibility wrappers（最终指向同一 store）
- 但两套 workspace 的 UI 组件完全不同，没有代码共享

如果用户同时打开两个标签页（一个 `/analyze`，一个 `/workspace-legacy`），它们会共享同一个 localStorage 和 store 状态（因为 wrapper 代理到同一源 store）。这是正确的行为，但可能导致困惑。

**影响:** Legacy workspace 的行为由新 store 驱动，但 UI 代码仍然是旧的。如果新 store 的状态 shape 与 legacy workspace UI 的假设不完全匹配，可能出现 UI 错误。

**当前缓解:** Compatibility wrappers 保证 API 兼容。Legacy workspace 通过 wrapper 读写新 store。

**建议:** 在 v0.9.x 中将 `/workspace-legacy` 标记为 deprecated 并提示用户迁移到 `/analyze`。

---

## 遗留风险状态更新（v0.7.x 风险在 v0.8.x 中的变化）

### R5: State Duplication (currentSql) — **已修复**

**原问题:** `sql-workspace-store.currentSql` vs `query-tabs-store.tabs[].sql` 不同步，导致 "Select table → populate SQL" 功能失效。

**v0.8.x 状态:** `sql-editor-store` 实现了 invariant：`currentSql === activeTab.sql`（始终同步）。`setCurrentSql()` 同时更新两个字段。这个 bug 已消除。

### R12: Dual History Fetch — **未验证**

**原问题:** `sql-workspace-panel.tsx` 和 `sql-history-panel.tsx` 都在 mount 时调用 fetchHistory。

**v0.8.x 状态:** `sql-history-store.fetchHistory()` 仍然存在。Legacy workspace 中双调用仍在。Investigation workspace 的 tools-panel 不调用 fetchHistory，所以新 workspace 不受影响。

### R3: localStorage Corruption — **变化**

**原缓解:** 7 个 store 有 merge 函数。

**v0.8.x 新增缓解:** `investigation-store` 和 `sql-editor-store` 都有 merge 函数。
- `investigation-store` merge: 检查 `turns` 数组和 `stage` 字段
- `sql-editor-store` merge: 检查 `tabs` 数组，过滤无效条目，验证 activeTabId

**残留风险:** 迁移函数 (`migrateFromLegacy`) 没有 try-catch 包围 localStorage.setItem/removeItem。JSON.parse 有 try-catch，但 setItem 没有。在 localStorage 满的情况下，setItem 会静默失败（不抛异常），导致迁移部分完成。

### R8: Memory Growth — **无变化**

**v0.8.x 新增数据:**
- `investigation-store` partialize: turns 限制 8 条，drillChain 限制 20
- `sql-editor-store` partialize: 仅持久化 tabs/activeTabId/activePanelTab/selectedTable（不含大数据）

两个新 store 都比旧 store 更高效。但 `investigation-store.keyFindings`（上限 10）和 `investigationSummary` 没有大小限制。

## 设计系统风险

### R19: Tailwind Theme Config Dead Code

**严重程度:** Low | **概率:** N/A | **状态:** Accepted

**路径:** `tailwind.config.ts` 中的 colors/fontSize/borderRadius/boxShadow 扩展

**问题:** UI primitives 全部使用 `bg-[var(--bg-secondary)]` 这样的任意值语法，而不是 `bg-bg-secondary` 这样的 Tailwind theme token。`tailwind.config.ts` 的整个主题映射实际上未被使用。

**影响:** 无运行时影响。仅增加了配置文件维护负担和代码审查困惑。

**建议:** 保持现状（CSS 变量方案更灵活），或明确标记 tailwind theme extensions 为 "备用/文档"。

### R20: StatusBadge 非主题感知

**严重程度:** Low | **概率:** Medium | **状态:** Unmitigated

**路径:** `components/ui/status-badge.tsx`

**问题:** 使用硬编码 Tailwind 颜色 (`text-green-400`, `text-red-400`, `text-yellow-400`)，在亮色主题下不会适配。

**影响:** 亮色主题下状态徽章颜色可能与设计系统语义色不一致。

---

## Risk Matrix Summary

| ID | Risk | Severity | Added In | Status |
|----|------|----------|----------|--------|
| R1 | DuckDB singleton race | High | v0.7.x | Partially mitigated |
| R2 | Thread-unsafe shared state | High | v0.7.x | Unmitigated |
| R3 | localStorage corruption | Medium | v0.7.x | Improved (v0.8 merge fns) |
| R5 | currentSql duplication | Medium | v0.7.x | **FIXED in v0.8** |
| R8 | Memory growth | Medium | v0.7.x | Unchanged |
| R12 | Dual history fetch | Low | v0.7.x | Unchanged |
| **R13** | Wrapper re-render amplification | **Medium** | **v0.8.x** | **NEW** |
| **R14** | Cross-tab migration race | **Medium** | **v0.8.x** | **NEW** |
| **R15** | 3-store activeTable fragmentation | **Medium** | **v0.8.x** | **NEW** |
| **R16** | Dual activeRunId tracking | **Low** | **v0.8.x** | **NEW** |
| **R17** | Focus mode not persisted | **Low** | **v0.8.x** | **NEW** |
| **R18** | Legacy workspace coexistence | **Low** | **v0.8.x** | **NEW** |
| **R19** | Tailwind config dead code | **Low** | **v0.8.x** | **NEW** |
| **R20** | StatusBadge non-theme-aware | **Low** | **v0.8.x** | **NEW** |
