# M4-8.7.2 Merge Validation

## 1. Merge Result

- **Source branch**: `m4-8-7-2-global-i18n-copy-consistency`
- **Target branch**: `master`
- **Merge type**: Fast-forward
- **Commit**: `580b7e3`
- **Date**: 2026-06-25

## 2. M4-8.7.2 Summary

- `status-panel.tsx` i18n 迁移
- `workflow-banner.tsx` i18n 迁移
- `analysis-section.tsx` Toast i18n 迁移
- touched-file 术语一致性修正（Table/Dataset, Export/Download, History/Records）
- zh/en 新增 21 keys
- 新增 37 个测试（global-i18n-copy-consistency.test.tsx）

## 3. Export Markdown Handling

`export-markdown.ts` was not migrated in M4-8.7.2 because safe migration would require changing function signatures / call chains, and `METRIC_REQUIREMENTS.keyword` relies on Chinese keyword matching. This remains a known risk for a future independent stage.

## 4. What Was Not Changed

- 未改业务逻辑
- 未改 Store
- 未改 API
- 未改后端
- 未改 AI query 逻辑
- 未改 SQL execution
- 未改导出数据结构
- 未改导出文件格式
- 未改设置逻辑
- 未开始 M5 Agent

## 5. Local Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest (1010 tests) | ✅ pass |
| next build | ✅ pass |
| eslint | ✅ pass (warnings only) |
| backend import | ✅ pass |

## 6. Next Step

进入 M4-8.7.3 Settings + i18n Regression。
暂不进入 M4-8.8。
暂不进入 M5 Agent。
暂不打 tag。
