# M4-8.8.2.z History Dropdown Position Hotfix — Merge Validation

## 1. Merge Result

Fast-forward merge successful.
Commit: `fae96ad`
Branch: `m4-8-8-2z-history-dropdown-position-hotfix` → `master`

## 2. Fixed Issue

History More (`...`) 菜单覆盖卡片内容。

**Root Cause:** `DropdownMenu` 使用 `position: absolute` 定位于 `relative inline-block` 容器内，History 列表的滚动父级 `overflow-y-auto` 裁切了菜单。单纯提升 z-index 无法解决 overflow clipping。

**Fix:** 使用 `createPortal` 将菜单渲染到 `document.body`，用 `getBoundingClientRect()` 计算视口坐标，`position: fixed` 定位，`align="right"` 右对齐，z-index `2147483647`。

## 3. Frontend Validation

| Check | Result |
| --- | --- |
| tsc --noEmit | ✅ Pass |
| npm run test | ✅ 1171 tests pass (48 files) |
| npm run build | ✅ Pass |
| npm run lint | ✅ Pass (pre-existing warnings only) |

## 4. Backend Validation

| Check | Result |
| --- | --- |
| backend import | ✅ OK |
| ruff check | ✅ All checks passed |
| pytest | ⚠️ Pre-existing ModuleNotFoundError (PYTHONPATH, not related) |

## 5. Safety Check

| Check | Result |
| --- | --- |
| .env committed | ❌ None |
| Real secrets in code | ❌ None |
| Frontend exposes keys | ❌ None |

## 6. CI Result

Branch CI: ✅ success (28225914007, 1m56s)
Master CI: Pending check

## 7. What Was Not Changed

- 未改后端
- 未改数据库
- 未改 History 数据逻辑
- 未改 Detail 页面
- 未改 Export 业务逻辑
- 未改 rerun draft 逻辑
- 未改 LLM provider selector
- 未改 fallback notice
- 未提交 .env / secret
- 未开始 M5 Agent
- 未打 tag

## 8. Next Step

重新进行 History 页面线上 smoke。
通过后进入 M4-8.8.3 Final Release Candidate Report。
暂不进入 M5 Agent。
暂不打 tag。
