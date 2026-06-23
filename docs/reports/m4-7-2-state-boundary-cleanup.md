# M4-7.2 State Boundary Cleanup

## 1. Problem

项目中存在多套表选择状态，可能导致以下问题：

- 数据页选了 A 表，分析工作台仍然用 B 表
- 自然语言查询显示 demo_sales，但生成 SQL 用了 sales_data
- 专家 SQL 当前 tab 和右上角当前数据表不一致
- History 重新运行时 question 回填了，但 table 没同步
- 上传新表后，旧 activeTable 残留
- 删除当前表后，分析工作台还引用不存在的表
- 后续 Agent 工具调用不知道应该操作哪张表

## 2. State Audit

| 状态名 | 所在文件 | 当前用途 | 是否重复 | 风险 | 建议处理 |
| --- | ---- | ---- | ---- | -- | ---- |
| `activeTable` | `investigation-store.ts:122` | 全局分析上下文，persisted to localStorage | 主要来源 | localStorage 可能保存过期表 | 添加 `setActiveTable` + `ensureValidSelectedTable` |
| `selectedTable` | `investigation-workspace.tsx:39` (useState) | AI 查询表选择 | **重复** | 与 store 不同步 | 删除，改用 store |
| `selectedTable` | `question-input.tsx:23` (useState) | AI 查询表选择 | **重复** | 与 store 不同步 | 删除，改用 store |
| `selectedTable` | `apply-template-dialog.tsx:30` (useState) | 模板应用表选择 | 独立 | 无 | 保留（对话框临时状态） |
| `wfTable` | `sql-workspace-panel.tsx:40` | Workflow 上下文 | 读取自 store | 无 | 保留 |
| `tableName` | `sql-history-store.ts:10` | 历史记录关联表 | 数据字段 | 可能指向已删除表 | 需校验 |
| `tables` | `data-store.ts:14` | 可用表列表 | 数据源 | 无 | 保留 |

### Key Findings

1. **`investigation-workspace.tsx`** 有本地 `selectedTable` state，初始化自 store 但不同步回 store。提交时用本地值，store 的 `activeTable` 可能已过期。
2. **`question-input.tsx`** 同样有本地 `selectedTable` state，与 store 不同步。
3. **`handleLoadToWorkspace`** (sql-history-panel) 不设置 table，导致加载历史 SQL 后 table 不一致。
4. **`run_ai_query`** (backend) table 不存在时静默 fallback 到所有表，可能导致生成错误 SQL。

## 3. Decision

选定 `investigation-store.ts` 的 `activeTable` 作为**全局唯一事实来源**。

新增两个方法：
- `setActiveTable(table: string | null)` — 直接设置当前表
- `ensureValidSelectedTable(availableTables: string[])` — 校验并自动修正

规则：
1. 如果 `activeTable` 存在且仍在 table list 中，保持不变
2. 如果 `activeTable` 不存在，但有表，默认选择第一张表
3. 如果 `activeTable` 指向已删除表，自动 reset
4. 如果没有任何表，`activeTable = null`

## 4. Changes

### 4.1 investigation-store.ts
- 新增 `setActiveTable(table: string | null)` 方法
- 新增 `ensureValidSelectedTable(availableTables: string[])` 方法
- 在 interface 中声明新方法

### 4.2 investigation-workspace.tsx
- 删除本地 `selectedTable` useState
- 改用 `useInvestigationStore((s) => s.activeTable)` + `setActiveTable`
- 添加 `ensureValidSelectedTable` 在 table list 变化时自动校验
- `handleSubmit` 使用 `activeTable` 而非本地 `selectedTable`
- 表选择下拉框使用 `setActiveTable` 同步到 store

### 4.3 question-input.tsx
- 删除本地 `selectedTable` useState
- 改用 `useInvestigationStore((s) => s.activeTable)` + `setActiveTable`
- 表选择下拉框使用 `setActiveTable` 同步到 store

### 4.4 sql-history-panel.tsx
- `handleRerunAnalysis`: 校验 table 存在性，设置 `setActiveTable`
- `handleLoadToWorkspace`: 校验 table 存在性，设置 `setActiveTable`
- 添加 `isTableValid` 辅助函数
- table 不存在时 toast 提示用户

### 4.5 table-management-panel.tsx
- 删除当前表后，自动选择下一个有效表（而非设为 null）
- 保留 `setInvestigationContext` 调用

### 4.6 i18n (zh.ts / en.ts)
- 新增 `history.table-not-found` 翻译 key

### 4.7 backend/services/ai_pipeline.py
- `run_ai_query`: table 不存在时返回 error（不再静默 fallback）
- `run_autonomous_analysis`: 添加 table 存在性校验
- `run_autonomous_analysis_stream`: 添加 table 存在性校验

## 5. Edge Cases

| 场景 | 处理方式 |
| --- | --- |
| 上传新表 | `file-upload-panel` 调用 `advance("profiling", { table })` 设置新表 |
| 删除当前表 | `table-management-panel` 自动选择下一个有效表或 null |
| 历史记录表不存在 | `sql-history-panel` toast 提示，不设置无效 table |
| localStorage 过期 table | `ensureValidSelectedTable` 在组件 mount 时校验 |
| 无表状态 | `activeTable = null`，分析按钮 disabled |

## 6. Tests

### Frontend Tests
- **`investigation-store.test.ts`** — 14 tests covering:
  - `setActiveTable`: set, overwrite, null
  - `ensureValidSelectedTable`: valid, invalid, empty, null
  - `advance` with table
  - `setContext` with table
  - `reset` and `clear`

### Backend Tests
- **`test_m4_7_2_table_boundary.py`** — 6 tests covering:
  - AI query with non-existent table returns error
  - AI query with valid table works
  - Autonomous analysis with non-existent table returns error
  - Dangerous SQL still returns 400
  - Normal SELECT works
  - Delete table then query returns error

## 7. Validation

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ Pass |
| `npm run test` | ✅ 257/257 passed |
| `npm run build` | ✅ Pass |
| `python -c "from backend.main import app"` | ✅ Pass |
| `python -m pytest tests/` | ✅ 558 passed (552 existing + 6 new) |
| `npm run lint` | ✅ No new warnings |

## 8. Remaining Risks

- **这不是 M5 Agent。** Agent 仍需要 tool registry、agent state、run persistence、verifier、step retry。
- **UI/UX 大重设仍在后续 M4-8。** 本轮仅做状态边界收敛，不做 UI 大重设。
- **`apply-template-dialog.tsx` 仍有独立的 `selectedTable` state。** 这是对话框临时状态，不影响全局一致性，保留。
- **localStorage 中的旧 `activeTable` 可能在用户浏览器中残留。** `ensureValidSelectedTable` 会在组件 mount 时自动校验和修正。

## 9. Next Step

通过后可进入：
- **M4-8 UI/UX Redesign** — 大规模 UI 重构
- **M5 Agent 前置设计** — tool registry、agent state、run persistence

暂不打 tag，除非用户完成线上验证。
