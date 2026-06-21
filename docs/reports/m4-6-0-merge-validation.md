# M4-6.0 Merge Validation

## 1. Merge Summary

- **Source branch**: `m4-6-0-ux-p0-cleanup`
- **Feature commit**: `5bf96ba` — fix: clean up P0 UX issues before visual polish
- **Merge commit**: `2470f5a` — merge: M4-6.0 UX P0 cleanup
- **Target**: `master`
- **Merge date**: 2026-06-21

## 2. Local Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `vitest run` (138 tests) | ✅ Pass |
| `next build` | ✅ Pass |

## 3. UX Changes Shipped

1. **首页跳转修正** — CTA 按钮跳转到正确页面（上传→数据页、分析→工作台、历史→历史页）
2. **历史概念统一** — SQL 历史与 AI 分析记录合并到同一历史页，消除"两套历史"困惑
3. **AI 查询停止/处理中体验** — 运行中状态、停止生成按钮、防重复提交
4. **Feature flags 调整** — `showAiButtonsInSqlWorkspace` 改为 `true`，核心 AI 能力不再被过度隐藏
5. **主流程字体可读性** — 关键路径字号增大，提升阅读体验

## 4. Online Manual Checklist

合并后需在线上手动验证：

- [ ] **首页 CTA** — 上传数据 → 数据页、开始分析 → 分析工作台、查看历史 → 历史页
- [ ] **分析工作台 AI 查询** — 有"停止生成"按钮；停止后不白屏；不重复提交
- [ ] **历史页** — 同时显示 AI 分析记录和专家 SQL 记录
- [ ] **分析工作台"最近分析"** — 不再让人误会成第二套历史系统
- [ ] **数据页** — 无图表建议等半成品入口
- [ ] **专家 SQL 页** — AI 按钮是否过多，是否重新造成"SQL 和 AI 边界混乱"
- [ ] **主流程字体** — 关键路径字号是否更清楚
- [ ] **核心功能可用** — 上传、表预览、专家 SQL、自然语言查询

## 5. Risk Watch

### `showAiButtonsInSqlWorkspace = true` 风险

- **变化**: 专家 SQL 页面现在显示 AI 相关按钮入口
- **风险**: 可能重新增加 SQL 页认知负担，让用户困惑"SQL 和 AI 的边界"
- **观察**: 线上验证时重点关注专家 SQL 页面是否因 AI 按钮过多而影响核心 SQL 编辑体验
- **回退方案**: 若用户困惑，后续 hotfix 改回仅在分析工作台暴露 AI 主入口

## 6. Next Step

- **线上验证通过后**: 进入 M4-6.1 Design Tokens & Base Components
- **暂不进入**: M5 Agent
- **暂不打 tag**: 等线上验证完全通过后再考虑
