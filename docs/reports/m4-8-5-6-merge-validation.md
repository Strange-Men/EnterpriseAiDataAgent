# M4-8.5.6 Merge Validation

## 1. Merge Result

- Source branch: `m4-8-5-6-history-export-semantics`
- Target branch: `master`
- Merge type: Fast-forward
- Commit: `5d9d924 fix: clarify SQL history export semantics`
- Parent: `f8468f5 docs: validate M4-8.5.5 merge`

## 2. M4-8.5.6 Summary

- SQL history export copy clarified: "导出 CSV" → "导出记录 CSV"
- English copy: "Export CSV" → "Export Record CSV"
- Tooltip/title explains: exports history record metadata, not query result data
- AI Markdown export unchanged
- Stale record export availability unchanged
- i18n: zh + en updated
- Tests: 814 passed
- Branch CI: frontend ✅ / backend ✅

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store 数据结构
- 未改后端
- 未改导出实现
- 未改导出文件内容
- 未改 SQL execution
- 未改 AI query pipeline
- 未开始 M5 Agent

## 4. Local Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ No errors |
| vitest run | ✅ 814 passed (37 test files) |
| next build | ✅ Compiled successfully |
| next lint | ✅ Warnings only (pre-existing) |
| backend import | ✅ OK |

Build warnings (pre-existing, not from M4-8.5.6):
- `analyze/[runId]/page.tsx:95` — unnecessary useMemo dependency
- `history-stale-table-invalid-record.test.tsx:92` — unused variable
- `drill-down-chain.tsx:24` — unnecessary useMemo dependency

## 5. Files Changed

| File | Change |
|------|--------|
| `docs/reports/m4-8-5-6-history-export-semantics.md` | New report |
| `frontend-react/src/app/(shell)/__tests__/history-export-semantics.test.tsx` | New test |
| `frontend-react/src/app/(shell)/__tests__/history-header-filters.test.tsx` | Copy update |
| `frontend-react/src/app/(shell)/__tests__/history-record-cards.test.tsx` | Copy update |
| `frontend-react/src/components/ui/dropdown-menu.tsx` | Minor enhancement |
| `frontend-react/src/i18n/en.ts` | Copy update |
| `frontend-react/src/i18n/zh.ts` | Copy update |
| `frontend-react/src/panels/sql-history-panel.tsx` | Copy update |

## 6. Next Step

进入 M4-8.6.0 Data Page Polish Planning。
暂不进入 M5 Agent。
暂不打 tag。
