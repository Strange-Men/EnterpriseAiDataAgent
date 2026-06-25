# M4-8.5.4 Stale Table / Invalid Record UX

## 1. Goal

避免历史记录引用已不存在的数据表时误导用户继续执行，让失效记录可读、可复制、可回查，但不直接执行失败操作。

## 2. Scope Audit

### 初始状态

分支 `m4-8-5-4-stale-table-invalid-record` 最初只包含 CI fix：
- 修复了 TypeScript 类型推断问题（`as const` 断言）
- 重构了 SQL 历史面板的 action 按钮为 dropdown menu
- 添加了 `history.more-actions` i18n 标签

**不包含** stale table UX 实现。

### 补齐内容

本轮补齐了完整的 M4-8.5.4 实现：
- Stale table 检测逻辑
- Stale badge / warning UI
- Stale AI record action guard
- Stale SQL record action guard
- Table not recorded 状态
- i18n 标签
- 测试用例

## 3. Changes

### Stale Table Detection in UI Layer

在 `sql-history-panel.tsx` 中添加了 `isRecordStale` 函数：
- 使用 `useDataStore` 中的 `tables` 列表判断 table 是否存在
- 只在展示层计算，不写回 store
- 不改历史记录数据

```typescript
const isRecordStale = useCallback((entry: { tableName?: string }): boolean => {
  if (!entry.tableName) return false; // No table field = not stale (不误判)
  if (tables.length === 0) return false; // No table list loaded yet = can't判断
  return !tables.some((t) => t.name === entry.tableName);
}, [tables]);
```

### Stale Badge / Warning

失效记录显示：
- **中文**：数据表已失效
- **英文**：Table unavailable

样式：
- warning / amber 样式
- 放在 card metadata 附近（status badge 右侧）
- 不遮挡主内容

### Stale Table Description

失效记录显示描述：
- **中文**：原始数据表不存在，请重新上传数据或选择新的数据表。
- **英文**：The original table no longer exists. Re-upload the data or choose another table.

### Table Name Display

- 正常记录：显示 table name（accent 色 + bg-tertiary 背景）
- 失效记录：显示 table name（amber 色 + line-through 删除线 + amber 背景）
- 无 table 字段：显示"未记录数据表"（italic 样式）

### Stale AI Record Action Guard

| Action | Allowed | Guard |
|--------|---------|-------|
| 查看详情 (View Details) | ✅ | - |
| 复制问题 (Copy Question) | ✅ | - |
| 导出 Markdown (Export Markdown) | ✅ | - |
| 重新运行 (Re-run) | ❌ | 显示 guard message |

### Stale SQL Record Action Guard

| Action | Allowed | Guard |
|--------|---------|-------|
| 复制 SQL (Copy SQL) | ✅ | - |
| 导出 CSV (Export CSV) | ✅ | - |
| 加载到工作台 (Load to Workspace) | ❌ | 显示 guard message |
| 重新执行 (Re-execute) | ❌ | 显示 guard message |

### Guard Message

- **中文**：原始数据表已不存在，无法直接继续执行。
- **英文**：The original table no longer exists, so this action cannot continue directly.

使用 `toast.error()` 显示 guard message。

### i18n Copy

新增标签：
- `history.stale-badge`
- `history.stale-description`
- `history.stale-guard`
- `history.table-not-recorded`

## 4. What Was Not Changed

- ❌ 未改业务逻辑
- ❌ 未改 API
- ❌ 未改 Store 数据结构
- ❌ 未改后端
- ❌ 未改 SQL execution
- ❌ 未改 AI query pipeline
- ❌ 未改导出逻辑
- ❌ 未开始 M5 Agent

## 5. Tests

### 新增测试文件

`frontend-react/src/app/(shell)/__tests__/history-stale-table-invalid-record.test.tsx`

### 测试覆盖

1. ✅ i18n keys exist for stale table badge (zh/en)
2. ✅ i18n keys exist for stale table description (zh/en)
3. ✅ i18n keys exist for stale guard message (zh/en)
4. ✅ i18n keys exist for table not recorded (zh/en)
5. ✅ Existing i18n keys preserved (no regression)
6. ✅ Stale table detection logic requirements
7. ✅ Stale record action guard requirements (AI records)
8. ✅ Stale record action guard requirements (SQL records)
9. ✅ Negative checks - should NOT change store behavior
10. ✅ Negative checks - should NOT restore disabled features

### 测试结果

```
Test Files  35 passed (35)
Tests  717 passed (717)
```

## 6. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `npm run test` | ✅ 717 tests passed |
| `npm run build` | ✅ Compiled successfully |
| `npm run lint` | ✅ Pass (only warnings) |
| `python -c "from backend.main import app"` | ✅ backend import OK |

## 7. Known Limitations

1. **Stale 判断来源**：本轮只用前端已有 `useDataStore.tables` 判断 stale。如果前端没有可靠 table list（tables 为空），则无法判断 stale。

2. **No Table Field**：如果历史记录没有 `tableName` 字段，不误判为 stale，显示"未记录数据表"。

3. **SQL Export CSV**：不处理 SQL 导出 CSV 实际是元数据的问题，保持现状。

4. **Real-time Sync**：Stale 状态基于当前 tables 列表，如果 table 在用户打开历史页面后被删除，需要刷新页面才能看到 stale 状态。

## 8. Online Check List

- ✅ 失效记录是否显示"数据表已失效"
- ✅ 失效记录 table name 是否显示删除线
- ✅ 失效记录是否显示 stale description
- ✅ 失效 AI 记录是否仍可查看详情
- ✅ 失效 AI 记录是否仍可复制问题
- ✅ 失效 AI 记录是否仍可导出 Markdown
- ✅ 失效 AI 记录的重新运行是否被 guard
- ✅ 失效 SQL 记录是否仍可复制 SQL
- ✅ 失效 SQL 记录是否仍可导出 CSV
- ✅ 失效 SQL 记录的加载到工作台是否被 guard
- ✅ 失效 SQL 记录的重新执行是否被 guard
- ✅ 正常记录 action 是否不受影响
- ✅ 无 table 字段记录是否显示"未记录数据表"
- ✅ Export / Copy / Details 是否没回归

## 9. Next Step

通过后进入 M4-8.5.5 History Regression。
暂不进入 M5 Agent。
暂不打 tag。
