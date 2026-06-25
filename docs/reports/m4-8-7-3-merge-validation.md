# M4-8.7.3 Merge Validation

## 1. Merge Result

- **Source branch**: `m4-8-7-3-settings-i18n-regression`
- **Target branch**: `master`
- **Merge type**: Fast-forward
- **Commit**: `d24e1fe` → `98e6872..d24e1fe`
- **Files changed**: 2 files, +484 insertions
  - `docs/reports/m4-8-7-3-settings-i18n-regression.md` (new)
  - `frontend-react/src/app/(shell)/__tests__/settings-i18n-regression.test.tsx` (new)

## 2. M4-8.7.3 Summary

| Regression Area | Status | Notes |
|---|---|---|
| Settings page regression | ✅ Covered | Settings page rendering, language toggle, theme toggle |
| i18n regression | ✅ Covered | Chinese/English switching, key copy consistency |
| status-panel regression | ✅ Covered | Status panel rendering and data display |
| workflow-banner regression | ✅ Covered | Workflow banner rendering and state |
| analysis toast regression | ✅ Covered | Analysis toast notification rendering |
| disabled experimental features regression | ✅ Covered | Confirmed disabled routes return 404 |
| export-markdown remaining risk | ⚠️ Recorded | Hardcoded Chinese and keyword matching in `export-markdown.ts` |

## 3. M4-8.7 Completion Status

| Stage | Status | Commit |
|---|---|---|
| M4-8.7.0 Settings + i18n Copy Polish Planning | ✅ Done | Planning report only |
| M4-8.7.1 Settings Page Copy + Visual Polish | ✅ Done | `94b216c` |
| M4-8.7.2 Global i18n Copy Consistency | ✅ Done | `580b7e3` |
| M4-8.7.3 Settings + i18n Regression | ✅ Done | `d24e1fe` |

**M4-8.7 阶段全部完成。**

## 4. What Was Not Changed

- 未改业务逻辑
- 未改 Store
- 未改 API
- 未改后端
- 未改设置逻辑
- 未改主题切换逻辑
- 未改语言切换逻辑
- 未改 AI query 逻辑
- 未改 SQL execution
- 未改导出逻辑
- 未处理 `export-markdown.ts`
- 未开始 M5 Agent

## 5. Local Validation

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ Passed (0 errors) |
| Tests | `npm run test` | ✅ 1049 passed (45 files) |
| Build | `npm run build` | ✅ Compiled in 6.3s, 9 routes |
| Lint | `npm run lint` | ✅ Passed (3 warnings, 0 errors) |
| Backend | `python -c "from backend.main import app"` | ✅ Import OK |

### Build Routes

| Route | Type | Size |
|---|---|---|
| `/` | Static | 3.77 kB / 126 kB |
| `/analyze` | Static | 1.82 kB / 104 kB |
| `/analyze/[runId]` | Dynamic | 5.99 kB / 121 kB |
| `/data` | Static | 434 kB / 572 kB |
| `/history` | Static | 11.6 kB / 138 kB |
| `/query` | Static | 784 B / 106 kB |
| `/settings` | Static | 2.7 kB / 120 kB |

### Lint Warnings (non-blocking)

1. `analyze/[runId]/page.tsx:95` — unnecessary `runs` dependency in useMemo
2. `history-stale-table-invalid-record.test.tsx:92` — unused variable `entry`
3. `drill-down-chain.tsx:24` — unnecessary `runs` dependency in useMemo

## 6. Next Step

进入 M4-8.8.0 Final Frontend Regression Planning。
暂不进入 M5 Agent。
暂不打 tag。
