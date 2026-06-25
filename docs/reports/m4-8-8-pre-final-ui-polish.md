# M4-8.8 Pre-final UI Polish

## 1. Goal

修复用户在线上人工检查时发现的 3 个前端问题，为 M4-8.8 Final Frontend Regression 做准备。

## 2. User-reported Issues

1. 首页入口重复
2. `query_history` 历史表说明不足，容易误删
3. 分析工作台未运行新分析时残留旧历史结果

## 3. Changes

- 首页入口去重
- `query_history` 历史表说明 / 误删保护
- Analysis Workspace 旧结果清理 / 空态
- i18n copy
- tests

## 4. What Was Changed

### Problem 1: Home page entry dedup

**File:** `frontend-react/src/app/(shell)/page.tsx`

- Removed the three duplicate entry cards (Upload Data / Natural Language Analysis / Expert SQL) that appeared below the two primary CTAs
- Kept only the two primary CTAs: "Upload Data" and "Start Analysis"
- Removed unused `Terminal` icon import
- No route or navigation logic changed

### Problem 2: `query_history` table description and delete protection

**File:** `frontend-react/src/panels/table-management-panel.tsx`

- Added `SYSTEM_HISTORY_TABLE = "query_history"` constant
- Added amber badge "历史记录表" / "History Table" for `query_history` table
- Added description text explaining the table stores query and analysis history
- Modified delete button styling for `query_history` (amber color instead of red)
- Modified delete handler to show stronger confirmation warning for `query_history`
- Added `aria-label` and `title` with system table warning for the delete button
- Normal table delete behavior is completely unchanged

### Problem 3: Analysis workspace old results residual

**File:** `frontend-react/src/components/investigation/investigation-workspace.tsx`

- Added `useEffect` on mount to clear `activeRunId` in the analysis store, preventing stale results from auto-loading
- Added `useEffect` that watches `activeTable` changes and clears transient result state (result, currentRunId, error, stream state) when the user switches tables
- The empty state text was updated to be more descriptive

### i18n

**Files:** `frontend-react/src/i18n/zh.ts`, `frontend-react/src/i18n/en.ts`

Added keys:
- `table.system-history-badge` — "历史记录表" / "History Table"
- `table.system-history-desc` — description explaining the table's purpose
- `table.system-table-delete-warning` — stronger confirmation text for delete
- `table.system-table-delete-title` — title attribute for delete button

Updated keys:
- `inv.start-hint` — updated empty state text to be more descriptive about current-run results

### Tests

**File:** `frontend-react/src/app/(shell)/__tests__/pre-final-ui-polish.test.tsx`

New test file covering:
- Home page CTA keys still exist
- Card i18n keys retained for backward compatibility
- System history badge in zh/en
- System history description in zh/en
- System table delete warning in zh/en
- System table delete title in zh/en
- Analysis empty state hint in zh/en
- Negative checks for unchanged areas (history, detail, normal table delete, AI API)

## 5. What Was Not Changed

- 未重新设计前端
- 未改后端
- 未改 API
- 未改数据库
- 未改上传逻辑
- 未改普通表删除逻辑
- 未改 History 页面数据
- 未改 Analysis Detail 页面
- 未改 AI API
- 未改 SQL execution
- 未开始 M4-8.8.1
- 未开始 M5 Agent

## 6. Tests

| Test File | Status |
|-----------|--------|
| `pre-final-ui-polish.test.tsx` | ✅ NEW — 15 tests |
| All existing tests (46 files, 1068 tests) | ✅ PASS |

## 7. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ No errors |
| `npm run test` | ✅ 46 files, 1068 tests passed |
| `npm run build` | ✅ Build succeeded |
| `npm run lint` | ✅ Pass (pre-existing warnings only) |
| `python -c "from backend.main import app"` | ✅ backend import OK |

## 8. Online Manual Check List

- [ ] 首页是否只剩一组主入口（上方两个 CTA）
- [ ] 首页不再显示下方三个重复功能卡片
- [ ] `query_history` 旁边显示"历史记录表"badge
- [ ] `query_history` 显示说明文案
- [ ] `query_history` 删除按钮有更强的确认提示
- [ ] 普通表不显示历史记录表 badge
- [ ] 普通表删除按钮仍可用且行为不变
- [ ] Analysis Workspace 初始状态不显示旧历史结果
- [ ] 切换表后旧结果被清空
- [ ] 新分析仍能正常显示
- [ ] History 页面不受影响
- [ ] Detail 页面不受影响
- [ ] Data / Analyze 主链路正常

## 9. Next Step

通过后进入 M4-8.8.1 Final Frontend Regression Tests。
暂不进入 M5 Agent。
暂不打 tag。
