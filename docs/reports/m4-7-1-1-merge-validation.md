# M4-7.1.1 Merge Validation

## 1. Merge Summary

| Item | Value |
|------|-------|
| Source branch | `m4-7-1-1-online-regression-hotfix` |
| Hotfix commit | `9d08176` — `fix: resolve online regression issues after scope pruning` |
| Regression test commit | `81014d4` — `test: cover M4-7.1.1 online regression fixes` |
| Merge commit | `1f72173` — `merge: M4-7.1.1 online regression hotfix` |
| Target branch | `master` |
| Merge date | 2026-06-22 |

## 2. Online Issues Fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | 首页卡片白边 | `page.tsx` — 移除多余 padding/margin |
| 2 | AI 步骤 skipped/error 展示吓人 | `ai_pipeline.py` + `step-results.tsx` — skipped 状态改为 `⊘`，错误信息友好化 |
| 3 | `/analyze/[id]` 白屏 | `run-sections.tsx` — safe-render 防护，找不到 run 时显示 fallback |
| 4 | 专家 SQL `+` 新建 tab 白屏 | `sql-editor-store.ts` — 新建空白 tab 时清除旧 queryResult |
| 5 | "分析工作台"按钮改为"自然语言查询" | `analysis-workspace-panel.tsx` + i18n — 更新按钮文案 |
| 6 | AI 历史刷新后消失 | `sql-history-store.ts` — fetchHistory 时保留本地 AI 条目，合并去重 |
| 7 | 历史时间显示 UTC | `datetime.ts` — 新增 formatLocalTime/DateTime/RelativeTime 工具 |
| 8 | `/performance`、`/virtual-table` 保持 404 | 预期行为，未恢复 |

## 3. Regression Tests Added

### 新增文件

| File | Tests | Coverage |
|------|-------|----------|
| `frontend-react/src/stores/__tests__/sql-editor-store.test.ts` | 7 tests | addTab、setActiveTab、removeTab、queryResult 清除逻辑 |
| `frontend-react/src/utils/__tests__/datetime.test.ts` | 18 tests | formatLocalTime、formatLocalDateTime、formatRelativeTime |
| `tests/test_m4_7_1_1_regression.py` | 20 tests | _make_step_result、_build_diagnostics、_determine_overall_status、_build_executive_summary |

### 更新文件

| File | Changes |
|------|---------|
| `frontend-react/src/stores/__tests__/sql-history-store.test.ts` | +4 tests — AI 历史持久化、fetchHistory 合并逻辑、type filter、id 去重 |

### 覆盖点

1. **SQL 新建 Tab 不白屏** — addTab 后 active tab 存在、新 tab 默认结构完整、空白 tab 清除 queryResult、带 SQL tab 保留 queryResult
2. **AI 历史记录持久化** — AI record 不被 fetchHistory 覆盖、SQL/AI record 可共存、type filter 区分、id 去重
3. **本地时间格式化** — formatLocalTime/DateTime/RelativeTime 正确解析 ISO 时间、fallback 处理、invalid input 降级
4. **后端 AI step skipped 防护** — skipped_no_data/skipped_generation_error 状态正确、overall status 判断、executive summary 包含 skipped 信息、diagnostics 输出

## 4. Local Validation

### Frontend

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `vitest run` | ✅ 167 tests passed (13 files) |
| `next build` | ✅ Pass |

### Backend

| Check | Result |
|-------|--------|
| `from backend.main import app` | ✅ OK |
| `pytest tests/ -x -q --ignore=tests/ai` | ✅ 469 tests passed |

## 5. Deployment Notes

- **Vercel**: Push to `master` 已触发自动部署
- **Render**: 如未自动 redeploy，需手动触发
- `/performance`、`/virtual-table` 保持 404 是预期结果，不要恢复

## 6. Online Manual Checklist

部署后请验证：

1. ✅ 首页卡片无突兀白边
2. ✅ 自然语言分析可正常出摘要
3. ✅ step skipped 不再显示 parser error，改为 ⊘ + 友好提示
4. ✅ 调查详情不白屏，或入口已安全处理
5. ✅ 专家 SQL 点击 `+` 不白屏
6. ✅ 专家 SQL 工具栏按钮显示"自然语言查询"
7. ✅ AI 历史刷新后仍存在
8. ✅ 历史时间显示为本地时间（非 UTC）
9. ✅ `/performance` 和 `/virtual-table` 仍为 404
10. ✅ 核心链路：上传 → 预览 → 自然语言查询 → 专家 SQL → 历史 正常

## 7. Next Step

- 线上验证通过后进入 M4-7.2 State Boundary Cleanup
- 暂不进入 M5 Agent
- 暂不打 tag
