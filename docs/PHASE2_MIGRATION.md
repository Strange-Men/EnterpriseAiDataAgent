# Phase 2 渐进式迁移

## 版本

v0.8.1 — Investigation Workspace + UX Refactor

## 迁移原则

1. **不删除**：保留所有 legacy 代码，新旧并行
2. **不破坏**：不修改 store 接口、API 调用、后端代码
3. **可回退**：`/workspace-legacy` 始终可用
4. **增量交付**：先建 investigation workspace，后续逐步迁移其它路由

## 迁移步骤

### Step 1 — 本次 (v0.8.1)
- [x] 新建 `components/investigation/` 下 14 个组件
- [x] 重写 `/analyze` → `InvestigationWorkspace`
- [x] 重写 `/analyze/[runId]` → 完整详情视图
- [x] i18n 新增 40+ investigation keys（en/zh）
- [x] AppShell 支持 investigation 路由的布局需求
- [x] /workspace-legacy 保持不变

### Step 2 — 后续 (v0.8.2)
- [ ] 拆分 `sql-workspace-panel.tsx` 为 `sql-editor-toolbar` + `sql-editor-area` + `sql-result-view`
- [ ] 重写 `/query` → 独立 SQL workspace（使用拆分后的组件）
- [ ] 重写 `/data` → 数据管理页（文件上传 + 表管理 + 预览）

### Step 3 — 后续 (v0.8.3)
- [ ] 重写 `/history` → 统一历史页（查询历史 + 分析历史）
- [ ] 拆分 `ai-analysis-panel.tsx` 为 mode selector + streaming indicator
- [ ] `/workspace-legacy` 内部逐步使用新组件替换

### Step 4 — 后续 (v0.9.0)
- [ ] 标记 legacy stores（workflow-store, ai-session-store, sql-workspace-store, query-tabs-store）为 deprecated
- [ ] 删除 deprecated stores
- [ ] 删除 `/workspace-legacy` 路由
- [ ] 全量迁移完成

## 风险控制

| 风险 | 措施 |
|------|------|
| 新组件引入 bug | 不影响 legacy workspace 可用性 |
| SSE 流式兼容 | 复用 `streamAiAnalyzeMulti`，不改 API |
| Store 状态冲突 | investigation 和 legacy 共享同一 store 实例，状态一致 |
| 路由冲突 | 使用 Next.js route group `(shell)` 隔离 |
| 构建失败 | 每次文件变更后立即 type-check + build |

## 回退方案

如有严重问题：
1. 恢复 `/analyze` 和 `/analyze/[runId]` 的占位页面
2. 删除 `components/investigation/` 目录
3. 保留 i18n keys（不影响功能）
4. 用户通过 `/workspace-legacy` 继续使用

## 文件变更总结

### 新增
- `components/investigation/` — 14 个文件
- `docs/` — 4 个文档

### 修改
- `app/(shell)/analyze/page.tsx`
- `app/(shell)/analyze/[runId]/page.tsx`
- `layout/app-shell.tsx`
- `i18n/en.ts` — 新增 keys
- `i18n/zh.ts` — 新增 keys

### 未修改
- `panels/` — 全部 legacy panel
- `stores/` — 全部 store
- `services/api.ts`
- `layout/workspace-layout.tsx`
- `layout/header.tsx`
- `backend/` — 全部
