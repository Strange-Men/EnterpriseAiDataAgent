# V0.8 UX/System Consistency Audit — Enterprise AI Data Agent

> Audit date: 2026-05-26 | Version: v0.8.2 | Phase 3 Complete

## 1. Route/Workspace 一致性

### 1.1 导航结构 vs 实际功能

| 导航项 | 路由 | 实际功能 | 一致性 |
|--------|------|---------|--------|
| Home | `/` | 仪表盘（smart empty states + recent runs） | OK |
| Data | `/data` | 占位符（引导至 `/analyze`） | **不一致** — 导航暗示独立功能页，实际是跳转页 |
| Query | `/query` | 占位符（引导至 `/analyze`） | **不一致** — 同上 |
| Analyze | `/analyze` | 完整 investigation workspace | OK |
| History | `/history` | 占位符（引导至 `/analyze`） | **不一致** — 同上 |
| Settings | `/settings` | 设置页面 | OK |

**问题：** 6 个导航项中，3 个是占位符。用户点击 "Data" 期望看到数据管理界面，结果看到的是引导卡片。这降低了导航的可信度。

**建议：** 
- 短期：将占位符页面内容改为嵌入式功能（从 `/analyze` 的对应面板提取）
- 或：在占位符页面中嵌入实际的 mini 功能（如 `/data` 显示文件上传组件）

### 1.2 Legacy Workspace 可发现性

- `/workspace-legacy` 仅在侧边栏底部有链接（"旧版 workspace"）
- 这是唯一可以独立使用 SQL 编辑器的地方（非 analysis 上下文）
- 新用户如果从 `/analyze` 开始，可能不知道有独立 SQL workspace

**评估：** 故意隐藏是合理的（legacy workspace 是过渡方案），但需要明确的迁移路径。

## 2. Design System 一致性问题

### 2.1 按钮使用不一致

**已使用 Button primitive 的组件：**
- app-shell.tsx（全部 4 个 header 按钮）
- run-header.tsx（操作按钮 + DropdownMenu）
- question-input.tsx（提交按钮）
- follow-up-input.tsx（提交按钮）
- tools-panel.tsx（执行按钮）
- settings/page.tsx（操作按钮）

**未使用 Button primitive 的组件（使用原生 `<button>`）：**
- sidebar.tsx — 6 个导航项
- (shell)/page.tsx — quick-action 卡片
- sql-workspace-panel.tsx — 全部工具栏按钮（Execute、Explain、Cancel、AI buttons、Save Query modal）
- sql-history-panel.tsx — header action buttons
- table-management-panel.tsx — 全部操作按钮（SQL、Rename、CSV、Delete）
- file-upload-panel.tsx — AI 分析操作按钮
- streaming-output.tsx — "Run detail" 链接
- investigation-workspace.tsx — "Run detail" 链接

**影响：** 视觉不一致（原生按钮没有统一的 variant/size/loading 支持），hover/focus 行为不一致，无法全局更新按钮样式。

**迁移优先级：**
1. sql-workspace-panel.tsx（使用频率最高）
2. table-management-panel.tsx + file-upload-panel.tsx（legacy 面板）
3. sidebar.tsx（影响所有页面的导航）

### 2.2 Dialog 使用不一致

**已使用 Dialog primitive：** keyboard-shortcuts-modal.tsx（正确示范）

**未使用 Dialog（手写 modal）：** sql-workspace-panel.tsx 的 "Save Query" modal

**手写 modal 的问题：**
```tsx
// sql-workspace-panel.tsx lines 508-539
<div className="fixed inset-0 z-50 ...">  // 硬编码 z-50 而非 var(--z-modal)
  <div className="absolute inset-0 bg-black/50" />  // 自建 backdrop
  <div className="relative ... bg-[var(--bg-secondary)] ...">
    // 自建输入框和按钮
  </div>
</div>
```
不使用 Dialog primitive 意味着：没有 Escape 关闭、没有 overlay 点击关闭、没有 focus trap、没有 aria 属性。

### 2.3 重复的 Overlay 模式

CommandPalette 和 GlobalSearch 共享几乎相同的结构：
- 固定定位 `inset-0` + `z-command`
- 暗色 backdrop + 模糊
- 搜索输入框 + Esc 快捷键提示
- 键盘导航（↑↓ Enter）
- 结果列表 + 高亮选中项

**代码重复量：** ~120 lines of similar overlay logic across two files

**建议：** 提取 `<OverlaySearch>` 基组件，CommandPalette 和 GlobalSearch 仅提供搜索源和渲染函数。

### 2.4 CSS 变量 vs Tailwind Theme Config 不一致

所有 UI primitive 使用 `bg-[var(--bg-secondary)]` 而非 `bg-bg-secondary`。tailwind.config.ts 中的主题映射从未被使用。

**影响：**
- tailwind.config.ts 成为维护负担（需要手动保持与 globals.css 同步）
- 新开发者可能困惑该用哪种方式
- IDE 自动补全可能提示两种路径

**建议：** 二选一：
- A) 删除 tailwind.config.ts 中的主题映射，仅保留 CSS 变量方案（推荐，更灵活）
- B) 将现有 `var(--xxx)` 全部替换为 Tailwind theme token

### 2.5 StatusBadge 颜色不一致

`status-badge.tsx` 使用 `text-green-400` 等硬编码 Tailwind 颜色，而非 `var(--success)` 等语义标记。亮色主题下颜色不匹配。

## 3. 空状态/加载状态一致性

### 3.1 空状态模式

| 页面/组件 | 使用的组件 | 模式 |
|----------|-----------|------|
| `/data` | 自定义（inline） | Icon + text + CTA button + feature cards |
| `/query` | 自定义（inline） | 同上 |
| `/history` | 自定义（inline） | 同上 |
| `/` (no tables) | 自定义（inline） | 3-step onboarding |
| `/` (tables, no runs) | 自定义（inline） | Icon + text + CTA |
| streaming-output (no result) | 自定义（inline） | Icon + hint text |
| run-sections (no sections) | 自定义（inline） | Text message |
| run-trace (no trace) | 自定义（inline） | Text message |

**问题：** `EmptyState` 组件存在（`components/ui/empty-state.tsx`，40 行），支持 icon/title/description/action 参数。但 6 个以上的页面/组件使用了手写的空状态。

**已使用 EmptyState 的组件：** data-preview-panel, table-management-panel, file-upload-panel, sql-workspace-panel, sql-history-panel, home page, query page, history page (10 个引用中只有部分实际使用)

### 3.2 加载状态模式

| 场景 | 使用的模式 |
|------|-----------|
| 路由级懒加载 | `<PanelSkeleton />` (next/dynamic loading fallback) |
| ClientProviders Suspense | `<PanelSkeleton />` |
| 流式 AI 分析 | `<StreamingSkeleton />` (专用 2-phase skeleton) |
| 图表加载 | `<ChartSkeleton />` |
| 数据表加载 | `<TableSkeleton />` |

**评估：** Skeleton 系统一致且设计良好。6 种变体覆盖了主要场景。

### 3.3 错误状态模式

| 场景 | 使用的模式 |
|------|-----------|
| React error boundary | `<ErrorFallback />` (AlertTriangle + message + retry) |
| Class ErrorBoundary default | 内联 UI (emoji + message + button) |
| AI 流错误 | toast (react-hot-toast) + 红色 error block |
| API 错误 | toast + inline error text |

**问题：** ErrorBoundary class 组件有一个默认 fallback UI 在视觉上重复了 ErrorFallback，但使用了不同的样式（emoji vs lucide icon，硬编码颜色 vs CSS 变量）。应该删除 ErrorBoundary 的内联 fallback，强制使用 ErrorFallback 或使用 react-error-boundary 的 FallbackComponent prop。

## 4. Streaming UX 生命周期一致性

### 4.1 阶段顺序

```
idle → plan → step(s) → summary → done
         ↓                    ↓
       error                error
```

**阶段映射：**
- `"plan"` → Lightbulb 图标，进度 20%
- `"step"` → Play 图标，进度 20-80%（渐变）
- `"summary"` → FileText 图标，进度 85%
- `"analyzing"` → 脉冲图标，进度 95%
- `""` (空) → 隐藏 StreamingIndicator

### 4.2 状态转换检查

| 转换 | 触发 | StreamingIndicator | StreamingOutput |
|------|------|-------------------|-----------------|
| idle → plan | onPlan callback | 显示 plan 阶段 | 显示 StreamingSkeleton |
| plan → step | onStepStart | 显示 step 阶段 | 显示 StreamingSkeleton + step 列表 |
| step → another step | onStepResult | 更新 step 进度 | 显示步骤结果 |
| step → summary | onSummary | 显示 summary 阶段 | 显示 summary + 步骤 |
| summary → done | onDone | 隐藏 | 显示完成结果 |
| any → error | onError | 隐藏 | 显示错误 block |

**验证：** 转换逻辑正确。`isLoading` 标志在所有路径中都被正确设置。

### 4.3 AbortController 生命周期

```ts
// investigation-workspace.tsx
abortRef.current?.abort();  // 新运行开始时中止旧流
abortRef.current = abort;   // 保存当前 AbortController

// useEffect cleanup:
return () => { abortRef.current?.abort(); };  // 卸载时中止
```

**验证：** 正确。不会出现挂起的流或内存泄漏。

## 5. 响应式行为一致性

### 5.1 断点

| 组件 | 断点 | 行为 |
|------|------|------|
| AppShell sidebar | `max-md:hidden` (768px) | 隐藏侧边栏 |
| InvestigationLayout | `isMobile` (768px) | 禁用可调整面板，堆叠布局 |

**一致性：** 两个组件使用相同的 768px 断点。移动端体验一致。

### 5.2 缺失的响应式适配

- RunDetail 页面 (`[runId]/page.tsx`)：3 列 grid 在 `lg:grid-cols-3` (1024px) 以下变为单列。OK。
- Settings 页面：无响应式适配（设置了 `max-w-3xl` width 限制）。OK。

## 6. Focus Mode 一致性

### 6.1 行为

| 操作 | 预期 | 实际 |
|------|------|------|
| 进入 focus mode | 隐藏左右面板 | 正确（`hidden` class） |
| 退出 focus mode | 恢复面板 | 正确（移除 `hidden`） |
| 页面刷新 | 恢复 focus mode | **不正确** — focus mode 是本地 useState，刷新后丢失 |
| 导航到 run detail | focus mode 保持 | **不正确** — focus mode 仅在 investigation-layout 内，切换页面会丢失 |

**评估：** Focus mode 的 scope 限定在 `investigation-layout.tsx` 内部是合理的设计选择，但刷新持久化是预期的。

## 7. 键盘快捷键一致性

| 快捷键 | 范围 | 冲突？ |
|--------|------|--------|
| Ctrl+K | 全局（命令面板） | 无 |
| Ctrl+/ | 全局（搜索） | 无 |
| ? | 全局（快捷键帮助） | **可能** — 在 textarea 中用户可能想输入 `?` |
| Ctrl+H | 全局（首页） | 无 |
| Ctrl+A | 全局（分析） | **冲突** — textarea 中的全选 |
| Ctrl+D | 全局（数据） | 无 |
| Ctrl+Q | 全局（查询） | 无 |
| Ctrl+, | 全局（设置） | 无 |
| Ctrl+Shift+T | 全局（主题） | 无 |
| Ctrl+Shift+L | 全局（语言） | 无 |

**use-keyboard-shortcuts.ts 的输入检测：** 当焦点在 `input`、`textarea`、`select` 或 `[contenteditable]` 元素时，跳过非 global 快捷键。但 `?` 快捷键的 `global: true` 标记意味着它在 textarea 中也会触发。这是一个潜在的 UX 问题。

## 8. UX/System 一致性评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 路由/功能对齐 | 5/10 | 3/6 导航项是占位符 |
| 组件一致性 | 5/10 | 大量原生元素未迁移到 primitives |
| 空状态一致性 | 6/10 | EmptyState 组件存在但未被广泛使用 |
| 加载状态一致性 | 9/10 | Skeleton 系统完整且一致 |
| 错误状态一致性 | 7/10 | ErrorBoundary 有重复 UI |
| 流式 UX 一致性 | 10/10 | 生命周期正确，AbortController 正确 |
| 响应式一致性 | 8/10 | 断点对齐，移动端有覆盖 |
| Focus mode 一致性 | 6/10 | 功能正确，但不持久化 |
| 快捷键一致性 | 8/10 | 良好，`?` global 标记可改进 |

**综合评分：7.1/10** — 流式 UX 和加载状态设计良好，但组件迁移和导航一致性有提升空间。
