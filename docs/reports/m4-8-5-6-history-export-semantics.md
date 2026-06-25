# M4-8.5.6 History Export Semantics Hotfix

## 1. Goal

修正 SQL 历史记录中"导出 CSV"的语义误导，明确当前导出的是历史记录元数据，而不是 SQL 查询结果数据。

## 2. Changes

| 改动 | 文件 | 说明 |
|------|------|------|
| SQL history export copy clarified | `i18n/zh.ts`, `i18n/en.ts` | "导出 CSV" → "导出记录 CSV" / "Export Record CSV" |
| Tooltip explains metadata export | `i18n/zh.ts`, `i18n/en.ts` | 新增 `history.export-csv-tooltip` key |
| DropdownMenuItem title prop | `components/ui/dropdown-menu.tsx` | 支持 `title` 属性 |
| Export button tooltip | `panels/sql-history-panel.tsx` | 导出按钮增加 tooltip |
| AI Markdown export unchanged | — | "导出 Markdown" / "Export Markdown" 不变 |
| stale record export availability unchanged | — | stale 记录仍可导出 |

### i18n Changes

| Key | Before (zh) | After (zh) | Before (en) | After (en) |
|-----|-------------|------------|-------------|------------|
| `history.export-csv` | 导出 CSV | 导出记录 CSV | Export CSV | Export Record CSV |
| `history.export-csv-tooltip` | (new) | 导出这条历史记录的元数据，不是查询结果数据。 | (new) | Export metadata for this history record, not the query result rows. |

## 3. What Was Not Changed

- ❌ 未改业务逻辑
- ❌ 未改 API
- ❌ 未改 Store 数据结构
- ❌ 未改后端
- ❌ 未改导出实现
- ❌ 未改导出文件内容
- ❌ 未改 SQL execution
- ❌ 未改 AI query pipeline
- ❌ 未开始 M4-8.6
- ❌ 未开始 M5 Agent

## 4. Tests

### 新增测试文件

`frontend-react/src/app/(shell)/__tests__/history-export-semantics.test.tsx`

### 测试覆盖

1. ✅ SQL 历史不再只显示"导出 CSV"
2. ✅ SQL 历史显示"导出记录 CSV"（含"记录"关键词）
3. ✅ 导出 tooltip 说明这是历史记录元数据
4. ✅ AI 历史仍显示"导出 Markdown"
5. ✅ 导出按钮 handler 没有被修改
6. ✅ stale SQL record 导出仍保持可用
7. ✅ stale SQL record 加载到工作台 / 重新执行仍被 guard
8. ✅ 不改 Store 行为
9. ✅ 不改 API 调用
10. ✅ 不恢复 Templates / Schedule / Diff / Timeline
11. ✅ 不恢复 /performance、/virtual-table

### 更新的现有测试

- `history-header-filters.test.tsx` — 更新 export-csv 断言为新文案
- `history-record-cards.test.tsx` — 更新 export-csv 断言为新文案

## 5. Validation

| 检查项 | 结果 |
|--------|------|
| `tsc --noEmit` | ✅ 通过 |
| `npm run test` | ✅ 814 tests passed (37 files) |
| `npm run build` | ✅ Compiled successfully |
| `npm run lint` | ✅ 通过（仅 warnings） |
| `python -c "from backend.main import app"` | ✅ backend import OK |

## 6. Online Check List

- [ ] SQL 历史导出文案是否不再误导（显示"导出记录 CSV"而非"导出 CSV"）
- [ ] 导出 tooltip 是否说明这是元数据不是查询结果
- [ ] AI 历史导出 Markdown 是否没回归
- [ ] stale record export 是否没回归
- [ ] 加载到工作台 / 重新执行 guard 是否没回归
- [ ] History 页面整体布局是否没回归

## 7. Next Step

通过后再进入 M4-8.6 Data Page Polish Planning。
暂不进入 M5 Agent。
暂不打 tag。
