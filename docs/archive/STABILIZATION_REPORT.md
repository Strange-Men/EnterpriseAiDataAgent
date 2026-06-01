# STABILIZATION_REPORT.md — v0.8.3

> P3.5 Stabilization Sprint — v0.8.x P0 风险修复

---

## 修复摘要

### Fix 1: activeTable 单一 owner ✅

**问题**：3 个 store 各自维护"当前表"，无同步机制
- `investigation-store.activeTable` — 4 个组件读取
- `data-store.currentTable` — 2 个组件读取
- `sql-editor-store.selectedTable` — 0 个组件直接读取

**修复**：
- `investigation-store.activeTable` 成为单一 source of truth
- 删除 `data-store.currentTable` / `setCurrentTable`
- 删除 `sql-editor-store.selectedTable` / `setSelectedTable`
- 更新 `data-preview-panel.tsx` → 从 investigation-store 读取
- 更新 `table-management-panel.tsx` → 写入 investigation-store
- 更新 `file-upload-panel.tsx` → 写入 investigation-store
- `investigation-store.setContext()` 支持 `table: null` 用于清除

**影响**：
- 3 个字段合并为 1 个
- 消除 table 显示不一致的可能
- 0 个组件行为变化

### Fix 2: activeRunId 单一 owner ✅

**问题**：2 个 store 各自维护 `activeRunId`
- `analysis-store.activeRunId` — 4 个组件读取，6+ 处写入
- `investigation-store.activeRunId` — 0 个组件读取，1 处写入

**修复**：
- `analysis-store.activeRunId` 成为单一 source of truth
- 删除 `investigation-store.activeRunId` / `setActiveRun`
- 删除 `investigation-workspace.tsx` 中的双写

**影响**：
- 0 个组件行为变化（investigation-store 的 activeRunId 从未被读取）

### Fix 3: 删除 dead wrapper stores ✅

**问题**：4 个 deprecated compatibility wrapper 造成：
- 代码膨胀
- 潜在 rerender 风险（subscribe 无变更检测）
- 概念混淆

**修复**：删除以下 dead code 文件：
- `ai-session-store.ts` (0 import)
- `workflow-store.ts` (0 import)
- `query-tabs-store.ts` (0 import)
- `sql-workspace-store.ts` (0 import)

**影响**：
- 测试文件保留（已使用 canonical store import）
- 158/158 测试通过

### Fix 4: Rerender 修复 ✅

**问题**：wrapper store 的 subscribe + setState 模式无变更检测

**修复**：因删除 wrapper store 而自然消除。现有组件使用 selector 模式，已是最佳实践。

---

## 验证结果

| 检查项 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ PASS |
| `npx next build` | ✅ PASS |
| `npx vitest run` | ✅ 158/158 PASS |
| `python -c "from backend.main import app"` | ✅ PASS |

---

## 修改文件清单

### Stores (核心变更)
| 文件 | 变更 |
|---|---|
| `stores/investigation-store.ts` | 删除 activeRunId/setActiveRun；setContext 支持 null |
| `stores/data-store.ts` | 删除 currentTable/setCurrentTable |
| `stores/sql-editor-store.ts` | 删除 selectedTable/setSelectedTable |

### 删除文件
| 文件 | 原因 |
|---|---|
| `stores/ai-session-store.ts` | Dead code (0 import) |
| `stores/workflow-store.ts` | Dead code (0 import) |
| `stores/query-tabs-store.ts` | Dead code (0 import) |
| `stores/sql-workspace-store.ts` | Dead code (0 import) |

### 组件适配
| 文件 | 变更 |
|---|---|
| `panels/data-preview-panel.tsx` | 从 investigation-store 读取 activeTable |
| `panels/table-management-panel.tsx` | 写入 investigation-store；删除 data-store/sql-editor-store 的 table 写入 |
| `panels/file-upload-panel.tsx` | 删除 setCurrentTable 调用 |
| `components/investigation/investigation-workspace.tsx` | 删除 investigation.setActiveRun 双写 |

### 测试
| 文件 | 变更 |
|---|---|
| `__tests__/data-store.test.ts` | 删除 currentTable 相关测试 |
| `__tests__/sql-workspace-store.test.ts` | 删除 selectedTable 相关测试 |

### 文档
| 文件 | 状态 |
|---|---|
| `docs/OWNERSHIP_FIX_PLAN.md` | 新增 |
| `docs/STABILIZATION_REPORT.md` | 新增（本文件） |
| `docs/RERENDER_ANALYSIS.md` | 新增 |

---

## 风险评估

| 风险项 | 修复前 | 修复后 |
|---|---|---|
| activeTable 三向分裂 | **P0** | ✅ 消除 |
| activeRunId 双向分裂 | **P0** | ✅ 消除 |
| wrapper rerender | **P1** (dead code) | ✅ 消除 |
| /analyze/[runId] 路由 | 无风险 | 无风险 (URL-driven) |
| localStorage 兼容性 | 无风险 | 无风险 (仅删除非关键字段) |

---

## 结论

**v0.8.x P0 风险已全部关闭。可以进入 Phase 4。**
