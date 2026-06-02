# Current Session — Enterprise AI Data Agent

> Last updated: 2026-06-02

## Current Version

- **Version**: v0.9.8
- **Phase**: v0.9.8 Onboarding & Code Cleanup
- **Status**: Complete — build passing

## Session Goals

1. ✅ 版本统一到 0.9.8（VERSION、CLAUDE.md、README.md、版本记录.md）
2. ✅ 代码清理（unused imports、apply_language 双重调用、_sanitize_for_json 冗余包装）
3. ✅ 新手引导系统（onboarding store + wizard + feature tooltip + i18n）
4. ✅ 文档更新（KNOWN_ISSUES ISSUE-005、README 特性补充）

## v0.9.8 执行结果

### ✅ 版本统一
- `backend/VERSION` → 0.9.8
- `CLAUDE.md` 头部同步
- `README.md` 版本路线图更新（v0.8.x Done, v0.9.x Current）

### ✅ 代码清理（6 个文件）
- `backend/routes/tables.py`：删除 `import csv` 和 `sanitize_error`
- `backend/routes/ai.py`：删除 `import re`
- `backend/services/ai_analyst.py`：`evaluate_analysis` 去除 `apply_language` 双重调用
- `backend/services/data_service.py`：删除 `_sanitize_for_json`，改用 `normalize_for_response`
- `backend/routes/query.py`、`backend/routes/analyze.py`、`backend/services/ai_pipeline.py`：同步迁移

### ✅ 新手引导系统
- `onboarding-store.ts`：Zustand persist，5 步流程
- `onboarding-wizard.tsx`：Dashboard 引导卡片
- `feature-tooltip.tsx`：Popover 样式提示框
- 页面集成：Dashboard、Data、Query、Analyze、AnalysisDetail
- i18n：zh.ts + en.ts 新增 ~15 个 key

### ✅ 文档更新
- `KNOWN_ISSUES.md`：ISSUE-005 标注为将在本次修复
- `docs/architecture/版本记录.md`：新增 v0.9.8 条目

## System Health

- Frontend build: PASS
- Backend import: PASS
