# M4-8.5.4 Merge Validation

## 1. Merge Result

- **Source branch**: `m4-8-5-4-stale-table-invalid-record`
- **Target branch**: `master`
- **Merge type**: Fast-forward
- **Merge commit**: `7db1086`

## 2. M4-8.5.4 Summary

### Implemented Features

1. **Stale table detection in UI layer**
   - 使用 `useDataStore.tables` 判断 table 是否存在
   - 只在展示层计算，不写回 store
   - 不改历史记录数据

2. **Stale badge / warning**
   - 显示"数据表已失效" / "Table unavailable"
   - amber 样式 + AlertTriangle 图标
   - 放在 status badge 右侧

3. **Stale AI record action guard**
   - 允许：查看详情、复制问题、导出 Markdown
   - Guard：重新运行

4. **Stale SQL record action guard**
   - 允许：复制 SQL、导出 CSV
   - Guard：加载到工作台、重新执行

5. **Table not recorded state**
   - 无 table 字段时显示"未记录数据表" / "Table not recorded"
   - 不误判为 stale

6. **CI type fix**
   - 修复 TypeScript 类型推断问题（`as const` 断言）
   - 重构 SQL 历史面板 action 按钮为 dropdown menu

7. **Tests**
   - 新增 `history-stale-table-invalid-record.test.tsx`
   - 覆盖 i18n keys、stale 检测逻辑、action guard 等

### Changed Files

| 文件 | 变更类型 |
|------|----------|
| `frontend-react/src/i18n/zh.ts` | 修改 (添加 stale i18n 标签) |
| `frontend-react/src/i18n/en.ts` | 修改 (添加 stale i18n 标签) |
| `frontend-react/src/panels/sql-history-panel.tsx` | 修改 (添加 stale 检测和 UI) |
| `frontend-react/src/app/(shell)/__tests__/history-actions-clarity.test.tsx` | 新增 (actions clarity 测试) |
| `frontend-react/src/app/(shell)/__tests__/history-stale-table-invalid-record.test.tsx` | 新增 (stale table 测试) |
| `docs/reports/m4-8-5-3-history-actions-clarity.md` | 新增 (M4-8.5.3 报告) |
| `docs/reports/m4-8-5-4-ci-fix.md` | 新增 (CI fix 报告) |
| `docs/reports/m4-8-5-4-stale-table-invalid-record.md` | 新增 (M4-8.5.4 报告) |

## 3. What Was Not Changed

- ❌ 未改业务逻辑
- ❌ 未改 API
- ❌ 未改 Store 数据结构
- ❌ 未改后端
- ❌ 未改 SQL execution
- ❌ 未改 AI query pipeline
- ❌ 未改导出逻辑
- ❌ 未开始 M5 Agent

## 4. Local Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `npm run test` | ✅ 717 tests passed |
| `npm run build` | ✅ Compiled successfully |
| `npm run lint` | ✅ Pass (only warnings) |
| `python -c "from backend.main import app"` | ✅ backend import OK |

## 5. Next Step

进入 M4-8.5.5 History Regression。
暂不进入 M5 Agent。
暂不打 tag。
