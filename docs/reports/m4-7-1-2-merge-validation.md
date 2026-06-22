# M4-7.1.2 Merge Validation

## 1. Merge Summary

| Item | Value |
|------|-------|
| Source Branch | `m4-7-1-2-browser-regression-hotfix` |
| Hotfix Commit | `dd9ac68` |
| Merge Commit | `02e4905` |
| Target Branch | `master` |
| Merge Strategy | `--no-ff` |
| Files Changed | 24 |
| Lines Added | +401 |
| Lines Removed | -46 |

## 2. Bugs Fixed

| # | Bug | Root Cause | Fix |
|---|-----|------------|-----|
| 1 | `/analyze/[runId]` 调查详情白屏 | `useSearchParams()` 未包裹 Suspense 边界 | 移除 searchParams 依赖，改用 store |
| 2 | 专家 SQL `+` 新建 Query 白屏 | `addTab()` 返回 void，调用方使用返回值导致 undefined | 修复 addTab 返回新建 tab ID |
| 3 | React #31: MouseEvent 进入 state | onClick handler 直接传递 MouseEvent 到 setState | 包装 handler 过滤 event 参数 |
| 4 | "自然语言查询"按钮无效 | 切换逻辑未正确重置 editor 状态 | 添加 reset 逻辑到 mode switch |
| 5 | AI 计划过度扩展 | analysis_plan prompt 允许 5-10 步 | 收紧为 1-3 步，添加过度扩展防护 |
| 6 | Skipped step 文案不友好 | 显示原始 parser error | 改为友好提示文案 |

## 3. Validation Results

### Hotfix Branch (Pre-merge)

| Check | Result |
|-------|--------|
| TypeScript `tsc --noEmit` | ✅ Pass |
| Vitest (176 tests) | ✅ Pass |
| Next.js Build | ✅ Pass |
| Backend Import | ✅ Pass |
| Pytest (488 tests) | ✅ Pass |

### Master (Post-merge)

| Check | Result |
|-------|--------|
| TypeScript `tsc --noEmit` | ✅ Pass |
| Vitest (176 tests) | ✅ Pass |
| Next.js Build | ✅ Pass |
| Backend Import | ✅ Pass |
| Pytest (488 tests) | ✅ Pass |

## 4. Deployment Notes

| Service | Status | Notes |
|---------|--------|-------|
| GitHub Actions | ⏳ Waiting | Will trigger on master push |
| Vercel | ⏳ Should trigger | Auto-deploy from master |
| Render | ⚠️ May need manual | If no auto-redeploy configured |
| `/performance` | 404 Expected | Not in M4-7.1.2 scope |
| `/virtual-table` | 404 Expected | Not in M4-7.1.2 scope |

## 5. Manual Online Checklist

用户线上验证清单：

- [ ] 1. 首页卡片无突兀白边
- [ ] 2. 数据页能预览和上传
- [ ] 3. 分析工作台默认是"自然语言查询"
- [ ] 4. 输入：`不同地区的销售额排名如何？`
- [ ] 5. 能生成 SQL、执行并输出摘要
- [ ] 6. 分析计划不要过度扩展，最好 1-3 步
- [ ] 7. Skipped step 显示友好说明，不显示 parser error
- [ ] 8. 点击"调查详情"不白屏
- [ ] 9. 专家 SQL 点击 `+` 能创建 Query 2，不白屏
- [ ] 10. 专家 SQL 的"自然语言查询"按钮能切回自然语言查询
- [ ] 11. 历史页能看到 AI 分析和专家 SQL 记录
- [ ] 12. 历史时间是本地 24 小时制
- [ ] 13. `/performance` 和 `/virtual-table` 仍是 404
- [ ] 14. 顶栏没有命令面板 / 全局搜索 / 快捷键入口

## 6. Decision

当前结论：

- ⏳ 等用户线上验证
- 🚫 暂不进入 M4-7.2
- 🚫 暂不进入 M5 Agent
- 🚫 暂不打 tag
