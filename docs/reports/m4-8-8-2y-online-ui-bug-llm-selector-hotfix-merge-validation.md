# M4-8.8.2.y Online UI Bug + LLM Selector Hotfix — Merge Validation

## 1. Merge Result

- **Source branch**: `m4-8-8-2y-online-ui-bug-llm-selector-hotfix`
- **Target branch**: `master`
- **Merge type**: Fast-forward
- **Commit**: `0e5c740`
- **Merge status**: ✅ 成功

## 2. Fixed Issues

| 问题 | 状态 | 说明 |
|------|------|------|
| 首页上传数据默认高亮 | ✅ 已修复 | 两个 CTA 统一为 neutral 默认状态，hover 才 accent |
| Analyze 旧结果残留 | ✅ 已修复 | 删除旧 run 恢复逻辑，仅显示当前 session 结果 |
| LLM selector 不可见 | ✅ 已修复 | 在 Analyze 页面添加可见 provider selector |
| fallback notice 不显示 | ✅ 已修复 | 检测 fallback metadata 并显示温和提示 |
| i18n 空态文案缺失 | ✅ 已修复 | 添加中英文 waiting state 文案 |

## 3. Frontend Validation

| 检查项 | 结果 |
|--------|------|
| TypeScript (`tsc --noEmit`) | ✅ 通过 |
| Vitest (47 files, 1153 tests) | ✅ 全部通过 |
| Next.js build | ✅ 通过 |

## 4. Backend Validation

| 检查项 | 结果 |
|--------|------|
| `python -c "from backend.main import app"` | ✅ 通过 |
| pytest (559 passed, 31 skipped) | ✅ 全部通过 |
| ruff check | ✅ All checks passed |

## 5. Security Search

| 检查项 | 结果 |
|--------|------|
| 前端源码无暴露 API key | ✅ 通过 |
| 未提交 .env | ✅ 通过 |
| 未暴露 secret | ✅ 通过 |

## 6. CI Result

- **Branch CI**: ✅ 通过 (frontend + backend)
- **Master CI**: 待确认

## 7. What Was Not Changed

- 未改数据库结构
- 未改上传逻辑
- 未改表选择逻辑
- 未改普通表删除逻辑
- 未改 History 数据持久化逻辑
- 未改 Detail 数据逻辑
- 未改 SQL execution 核心逻辑
- 未提交真实 env / secret
- 未恢复禁用实验功能
- 未开始 M5 Agent
- 未打 tag

## 8. Files Changed

| 文件 | 改动 |
|------|------|
| `frontend-react/src/app/(shell)/page.tsx` | CTA 默认样式修复 |
| `frontend-react/src/components/investigation/investigation-workspace.tsx` | 删除旧结果恢复、添加 provider selector、fallback notice、空态 |
| `frontend-react/src/i18n/zh.ts` | 新增 3 个 i18n key |
| `frontend-react/src/i18n/en.ts` | 新增 3 个 i18n key |
| `docs/reports/m4-8-8-2y-online-ui-bug-llm-selector-hotfix.md` | Hotfix 报告 |
| `docs/reports/m4-8-8-2y-online-ui-bug-llm-selector-hotfix-merge-validation.md` | 本报告 |

## 9. Next Step

重新进行 M4-8.8.2 Online Manual Acceptance。
若通过，进入 M4-8.8.3 Final Release Candidate Report。
暂不进入 M5 Agent。
暂不打 tag。
