# M4-8.1 Merge Validation

## 1. Merge Result

- **Source branch**: `m4-8-1-design-tokens-base-ui`
- **Target branch**: `master`
- **Merge type**: Fast-forward
- **Commit**: `1196b6b` → `36179fe..1196b6b`
- **Files changed**: 26 modified, 5 new
- **Conflict**: 无

## 2. M4-8.1 Summary

- Design tokens 审计与字号层级修复（35+ 处）
- 基础 UI 组件清理：Button、Card、Badge（新增）、PageHeader（新增）
- Settings / History 页面低风险试点应用
- 设计规则文档：`m4-8-1-design-rules.md`、`m4-8-1-audit.md`

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API endpoints
- 未改 Store（zustand）
- 未改 SQL editor 核心区
- 未改后端 Python 代码
- 未开始 M5 Agent
- 未恢复 Templates / Scheduler / Charts / Anomalies / Diff / Timeline
- 未恢复 `/performance`、`/virtual-table`
- 未恢复 Command Palette / Global Search / Keyboard Shortcuts

## 4. Local Validation

| 检查项 | 结果 | 备注 |
|--------|------|------|
| `tsc --noEmit` | ✅ PASS | 无错误 |
| `vitest run` | ✅ PASS | 271/271 tests |
| `next build` | ✅ PASS | 9 pages, 仅预先存在 warnings |
| `npm run lint` | ✅ PASS | 仅预先存在 warnings，M4-8.1 无新增 |
| `backend import` | ✅ PASS | `from backend.main import app` 正常 |

### Lint Warnings（均为预先存在，非 M4-8.1 引入）

- `analyze/[runId]/page.tsx` — unused import `MonitorPlay`
- `analyze/[runId]/page.tsx` — unnecessary `runs` dependency in useMemo
- `drill-down-chain.tsx` — unnecessary `runs` dependency in useMemo
- `analysis-detail-regression.test.ts` — unused import `AnalysisRun`
- `sql-editor-store.test.ts` — unused variable `tab1Id`
- `sql-history-store.test.ts` — unused import `vi`

## 5. Online Quick Check List

用户需在线上手动确认：

- [ ] History 页面是否正常显示（卡片、时间线、字号）
- [ ] Settings 页面语言切换是否正常
- [ ] 字号是否比之前清晰（Body / Caption / Small 层级）
- [ ] Save / Export / Markdown / History 主链路是否没回归
- [ ] Badge 组件在 History 标签上是否正常渲染
- [ ] PageHeader 在 Settings 页面是否正常显示

## 6. Next Step

等待用户线上快速确认后，再进入 M4-8.2 Home + Navigation Clarity。
暂不进入 M5 Agent。
暂不打 tag。
