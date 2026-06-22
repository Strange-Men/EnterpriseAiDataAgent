# M4-7.1.3 Merge Validation

## 1. Merge Summary

| Item | Value |
|------|-------|
| Source branch | `m4-7-1-3-detail-nl-sql-hotfix` |
| Hotfix commit | `fee4b46` — fix: stabilize analysis details and SQL generation flow |
| Merge commit | `31c2df5` — merge: M4-7.1.3 detail and NL-to-SQL hotfix |
| Pushed to master | `31c2df5` (pushed 2026-06-22) |
| Files changed | 11 files, +481 insertions |

## 2. Bugs Fixed

| # | Bug | Root Cause | Fix |
|---|-----|-----------|-----|
| 1 | `/analyze/[id]` React #185 白屏 | Render body 中调用 selector 产生新数组引用 | selector 返回稳定引用，render body 不再产生新数组 |
| 2 | `getEvolutionChain` selector 返回新数组导致无限 re-render | Zustand selector 每次 render 返回新数组 | `useMemo` / stable selector 确保引用稳定 |
| 3 | 详情页 `getEvolutionChain` 在 render body 中调用产生新数组 | 函数调用时机错误 | 移至 selector 层，render body 只读取稳定值 |
| 4 | 专家 SQL 自然语言按钮流程错误 | 点击后跳转页面并自动执行 SQL | 改为：生成 SQL → 填入当前编辑器 → 用户手动执行 |
| 5 | Query `+` 按钮偶发不稳定 | 多 tab 状态竞争 | 补充回归测试，稳定 tab 创建逻辑 |

## 3. NL-to-SQL Workspace Flow

当前专家 SQL 自然语言流程：

```
用户输入自然语言 → AI 生成 SQL → 填入当前 Query 编辑器 → 用户检查 → 用户手动执行
```

关键约束：
- **不跳转页面** — SQL 填入当前编辑器，不触发路由变化
- **不自动执行** — 用户必须手动点击执行按钮
- **不混入 AI 分析结果** — 专家 SQL 和 AI 分析是独立功能

## 4. Validation Results

### Pre-merge (hotfix branch)

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | ✅ Pass |
| Vitest (201 tests) | ✅ Pass |
| Next.js build | ✅ Pass |
| Backend import | ✅ OK |
| Pytest (488 tests) | ✅ Pass |

### Post-merge (master)

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | ✅ Pass |
| Vitest (201 tests) | ✅ Pass |
| Next.js build | ✅ Pass |
| Backend import | ✅ OK |
| Pytest (488 tests) | ✅ Pass |

## 5. Deployment Notes

| Platform | Status | Action |
|----------|--------|--------|
| GitHub Actions | 待确认 | Push 后自动触发 CI |
| Vercel | 应自动部署 | Push 到 master 触发 |
| Render | 可能需要手动 redeploy | 如果未自动部署，用户需手动触发 |

**预期 404 路由**（不恢复）：
- `/performance` — 404 是预期
- `/virtual-table` — 404 是预期

## 6. Manual Online Checklist

用户线上验证清单：

1. ✅ 分析工作台自然语言查询正常
2. ✅ 输入 `不同地区的销售额排名如何？` 后能生成 SQL、执行并输出摘要
3. ✅ 分析步骤控制在 1-3 步左右
4. ✅ 点击"调查详情"不白屏
5. ✅ `/analyze/<真实 run id>` 能显示只读详情
6. ✅ `/analyze/invalid-id` 显示友好空态，不白屏
7. ✅ 专家 SQL 点击 `+` 能创建 Query 2，不白屏
8. ✅ 专家 SQL 点击 `AI 生成 SQL` 或自然语言输入入口后，只生成 SQL 并填入当前编辑器
9. ✅ 生成 SQL 后不自动执行
10. ✅ 用户手动点击执行后才出现查询结果
11. ✅ 历史页仍能看到 AI 分析和专家 SQL 记录
12. ✅ `/performance` 和 `/virtual-table` 仍是 404

## 7. Decision

- ✅ 等用户线上验证
- ⏸ 暂不进入 M4-7.2
- ⏸ 暂不进入 M5 Agent
- ⏸ 暂不打 tag
