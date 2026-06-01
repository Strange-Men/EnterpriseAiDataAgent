# V0.8 Tech Debt After Phase 3 — Enterprise AI Data Agent

> Audit date: 2026-05-26 | Version: v0.8.2 | Phase 3 Complete
> 目的：Phase 4 前的技术债务清单，按优先级排序

## 优先级：P0 — 必须在 Phase 4 前修复

### TD-1: activeTable 三向分裂（R15 相关）

**影响：** 用户选择表后，不同面板可能显示不同表的上下文。

**位置：**
- `investigation-store.ts::activeTable`
- `data-store.ts::currentTable`
- `sql-editor-store.ts::selectedTable`

**修复方案：**
1. 指定 investigation-store.activeTable 为唯一 owner
2. 在 `advance()` 中同步更新 data-store 和 sql-editor-store
3. 或：从 data-store 和 sql-editor-store 中移除该字段，所有消费者从 investigation-store 读取

**预估工作量：** 2-4 小时

### TD-2: activeRunId 双向分裂（R16 相关）

**影响：** 钻取链可能引用错误的运行 ID。

**位置：**
- `analysis-store.ts::activeRunId`
- `investigation-store.ts::activeRunId`

**修复方案：** 从 investigation-store 中移除 activeRunId，所有代码从 analysis-store 读取。

**预估工作量：** 1-2 小时

### TD-3: Compatibility Wrapper 重渲染放大（R13）

**影响：** legacy workspace 页面不必要的组件重渲染。

**位置：** 4 个 wrapper store 的 subscribe 回调

**修复方案：** 在 subscribe 回调中添加 shallow comparison，仅在状态实际变化时才调用 setState。

**预估工作量：** 2-3 小时

## 优先级：P1 — Phase 4 中处理

### TD-4: 跨标签页迁移协调（R14）

**影响：** 多标签页场景下数据丢失风险。

**位置：** `investigation-store.ts::migrateFromLegacy()`, `sql-editor-store.ts::migrateFromLegacy()`

**修复方案：**
1. 迁移后不删除旧 key（保留 7 天作为安全网）
2. 写入 `_migrated_at` 时间戳
3. 使用 `BroadcastChannel` 通知其他标签页
4. 检测到旧 key 但已有新 key 时，合并而非覆盖

**预估工作量：** 3-5 小时

### TD-5: 大量组件未迁移到 UI Primitives

**影响：** 视觉不一致，无法主题化，难以维护。

**未迁移清单（按使用频率排序）：**

| 文件 | 未迁移元素 | 行数范围 |
|------|-----------|---------|
| `sql-workspace-panel.tsx` | 全部按钮、Save Query modal | ~354-539 |
| `sidebar.tsx` | 6 个导航按钮 | ~30-82 |
| `table-management-panel.tsx` | 4 个操作按钮 | full file |
| `file-upload-panel.tsx` | AI 操作按钮 | full file |
| `sql-history-panel.tsx` | header action buttons | full file |
| `(shell)/page.tsx` | quick-action cards | full file |

**修复方案：** 分批迁移，每批一个文件。优先 sql-workspace-panel.tsx（最复杂、使用频率最高）。

**预估工作量：** 8-12 小时（全部）

### TD-6: sql-workspace-panel 手写 Dialog

**影响：** 无 Escape 关闭、无 focus trap、无 aria 属性。

**位置：** `sql-workspace-panel.tsx` lines 508-539

**修复方案：** 替换为 `<Dialog>` + `<DialogHeader>` + `<DialogBody>` + `<DialogFooter>`。同时修复 z-index（使用 `var(--z-modal)` 而非硬编码 `z-50`）。

**预估工作量：** 1-2 小时

### TD-7: CommandPalette 和 GlobalSearch 代码重复

**影响：** ~120 行重复的 overlay 逻辑。修改 overlay 行为需要同步两个文件。

**位置：** `command-palette.tsx` (205 lines), `global-search.tsx` (146 lines)

**修复方案：** 提取 `<OverlaySearch>` 基组件，包含：backdrop、search input、keyboard navigation、Esc close、results list。CommandPalette 和 GlobalSearch 仅提供搜索源和渲染函数。

**预估工作量：** 3-5 小时

### TD-8: Focus Mode 不持久化（R17）

**影响：** 页面刷新后 focus mode 丢失。

**位置：** `investigation-layout.tsx::isFocusMode` (useState)

**修复方案：** 将 isFocusMode 移到 investigation-store 或 workspace-store 中持久化。

**预估工作量：** 1 小时

## 优先级：P2 — Phase 4 或后续处理

### TD-9: 占位符路由（/data, /query, /history）

**影响：** 6 个导航项中 3 个是占位符，降低导航可信度。

**修复方案（二选一）：**
- A) 将占位符页面改为嵌入式功能（从 `/analyze` 的对应面板提取）
- B) 在占位符页面中嵌入实际的 mini 功能

**预估工作量：** 5-10 小时（取决于方案 A/B）

### TD-10: Tailwind Config Dead Code（R19）

**影响：** 维护负担。CSS 变量方案已被所有组件采用，theme config 无用。

**位置：** `tailwind.config.ts` (colors, borderRadius, fontSize, fontFamily, transitionDuration, boxShadow, zIndex 扩展)

**修复方案：** 删除未使用的 Tailwind theme extensions，或标记为"备用/文档参考"。

**预估工作量：** 0.5 小时

### TD-11: StatusBadge 非主题感知（R20）

**影响：** 亮色主题下状态颜色不匹配。

**位置：** `status-badge.tsx`

**修复方案：** 替换硬编码 Tailwind 颜色为 CSS 变量：
- `text-green-400` → `text-[var(--success)]`
- `text-red-400` → `text-[var(--error)]`
- `text-yellow-400` → `text-[var(--warning)]`

**预估工作量：** 0.5 小时

### TD-12: ErrorBoundary Class 组件 vs ErrorFallback Function 组件重复

**影响：** 两个略有不同的错误 UI。Debug 时困惑。

**位置：** `error-boundary.tsx` (class, 55 lines), `error-fallback.tsx` (function, 31 lines)

**修复方案：** 删除 class ErrorBoundary 的内联 fallback UI，统一使用 ErrorFallback。或在 ErrorBoundary 中接受 FallbackComponent prop。

**预估工作量：** 1 小时

### TD-13: Data Store 未持久化

**影响：** 刷新后短暂的空状态闪烁（API 返回前）。

**位置：** `data-store.ts`

**修复方案：** 可选——当前设计是合理的选择（数据始终从后端获取）。如果用户体验需要，可以持久化 `tables` 和 `systemStatus`。

**预估工作量：** 1-2 小时

### TD-14: Legacy Workspace Deprecation Path

**影响：** 两套 workspace 共存，维护负担翻倍。

**位置：** `/workspace-legacy` + 所有 `panels/` 下的 legacy 组件

**修复方案：**
1. 在 v0.9.x 中添加 deprecation banner（"此 workspace 将在下个版本移除，请使用 Analyze"）
2. 将 legacy workspace 的核心功能（独立 SQL 编辑器）迁移到新 investigation workspace
3. 确保 investigation workspace 可以覆盖 legacy workspace 的所有使用场景
4. 删除 legacy workspace

**预估工作量：** 8-16 小时（跨版本）

## TD Summary Matrix

| ID | 优先级 | 预估工时 | 类别 | 风险 |
|----|--------|---------|------|------|
| TD-1 | P0 | 2-4h | State ownership | 用户可见不一致 |
| TD-2 | P0 | 1-2h | State ownership | 钻取链错误 |
| TD-3 | P0 | 2-3h | Performance | 不必要重渲染 |
| TD-4 | P1 | 3-5h | Migration | 多标签页数据丢失 |
| TD-5 | P1 | 8-12h | UI consistency | 视觉不一致 |
| TD-6 | P1 | 1-2h | Accessibility | 无 focus trap/aria |
| TD-7 | P1 | 3-5h | Code quality | 维护负担 |
| TD-8 | P1 | 1h | UX | 刷新丢失设置 |
| TD-9 | P2 | 5-10h | UX | 导航可信度 |
| TD-10 | P2 | 0.5h | Code quality | 配置文件维护 |
| TD-11 | P2 | 0.5h | UI consistency | 亮色主题颜色 |
| TD-12 | P2 | 1h | Code quality | 重复错误 UI |
| TD-13 | P2 | 1-2h | UX | 空状态闪烁 |
| TD-14 | P2 | 8-16h | Architecture | 双 workspace 维护 |

**Phase 4 前最小修复集（P0）：5-9 小时**
**Phase 4 完整清理（P0+P1）：20-36 小时**
**全部技术债务（P0+P1+P2）：38-62 小时**
