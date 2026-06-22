# M4-7.1.3 Detail Page + NL-to-SQL Workspace Flow Hotfix

## 1. Browser Issues

用户在线上验证 M4-7.1.2 后发现两个关键问题：

1. `/analyze/[id]` 调查详情页白屏，线上报 `Minified React error #185`（maximum update depth exceeded）。
2. 专家 SQL 内的"自然语言查询"按钮行为错误 — 跳转到自然语言查询 Tab，而不是将 AI 生成的 SQL 填入当前编辑器。

## 2. React #185 Root Cause

**主因：`DrillDownChain` 组件中的 Zustand selector 返回新引用导致无限 re-render。**

`drill-down-chain.tsx:19` 原代码：
```typescript
const chain = useAnalysisStore((s) => s.getEvolutionChain(currentRunId));
```

`getEvolutionChain` 是 store 上的方法，每次调用都会：
1. 读取 `runs` 数组
2. 遍历构建新的 `chain` 数组
3. 返回新引用

当作为 Zustand selector 使用时，每次 render 都返回新的数组引用 → Zustand 检测到"变化" → 触发 re-render → selector 再次运行 → 再次返回新引用 → **无限循环**。

**次因：`AnalysisDetailPage` 在 render body 中直接调用 `getEvolutionChain`。**

`analyze/[runId]/page.tsx:57` 原代码：
```typescript
const chain = getEvolutionChain(runId);
```

每次 render 创建新数组，传递给 `RunTimeline` 作为 `runs` prop，导致子组件 cascade re-render。

| Issue | Evidence | File | Root Cause | Fix |
|-------|----------|------|------------|-----|
| React #185 (primary) | Zustand selector returns new array each render | `drill-down-chain.tsx:19` | `getEvolutionChain` in selector → new reference → infinite loop | `useMemo` with `runs` as dependency |
| React #185 (secondary) | New array in render body | `analyze/[runId]/page.tsx:57` | `getEvolutionChain` called directly in render | `useMemo` with `runs` as dependency |

## 3. Detail Page Fix

**方案 A 已实现：稳定只读详情页。**

修改内容：
- `DrillDownChain`：将 `getEvolutionChain` 从 Zustand selector 移出，改为 `useMemo` 计算，依赖 `runs` 数组。
- `AnalysisDetailPage`：同样使用 `useMemo` memoize chain 计算。
- 空态处理：当 run 不存在时，显示友好提示（而非白屏）：
  - 图标 + 文字：「未找到这次分析记录，可能是浏览器本地历史已清理。」
  - 显示 ID（便于调试）
  - 两个按钮：「返回分析工作台」「查看历史」
- 新增翻译键：`analysis.not-found`、`analysis.back-to-workspace`、`analysis.view-history`

**调查详情入口保留**，因为详情页已稳定工作。

## 4. Expert SQL NL-to-SQL Flow

**新流程：自然语言 → AI 生成 SQL → 填入当前编辑器 → 用户手动执行。**

实现方式：
1. 启用 feature flag `showAiSqlInputInWorkspace: true`（原为 `false`）。
2. 专家 SQL 工具栏显示「AI 生成 SQL」按钮。
3. 点击后展开输入框，用户输入自然语言描述。
4. 调用 `aiQuery(question, execute=false, explain=false)` — 只生成 SQL，不执行。
5. 将生成的 SQL 写入当前 active tab 的编辑器。
6. 显示 toast：「已生成 SQL，请检查后点击执行。」
7. 用户检查后手动点击「执行」按钮。

**不跳转页面，不切换 Tab，不自动执行。**

## 5. Coupling Cleanup

本轮只清理了相关耦合点：
- `DrillDownChain` 和 `AnalysisDetailPage` 中 `getEvolutionChain` 的调用模式从 Zustand selector 改为 `useMemo`。
- Feature flag `showAiSqlInputInWorkspace` 从 `false` 改为 `true`。
- SQL 生成 toast 消息从 `ai.ready`（暗示需要分析）改为 `ai.sql-filled`（明确说检查后执行）。

**未做**：未重构所有 stores，未做 M4-7.2 State Boundary Cleanup，未改页面架构。

## 6. Tests Added

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `analysis-detail-regression.test.ts` | 6 | `getEvolutionChain` 稳定性、run field safety |
| `features-regression.test.ts` | 3 | Feature flag 状态验证 |
| `safe-render-regression.test.ts` | 9 | Event-like object 防御 |
| `sql-editor-regression.test.ts` | 8 | `addTab` 防御、`updateTabSql` 正确性、Query 2 稳定性 |

**总计新增 26 个回归测试，全部通过。**

## 7. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ 零错误 |
| `vitest run` | ✅ 201 passed (17 files) |
| `next build` | ✅ 成功，9 routes |
| `python -c "from backend.main import app"` | ✅ import OK |
| `pytest tests/ -x -q --ignore=tests/ai` | ✅ 488 passed |

## 8. Remaining Risks

- **activeTable / workspace state 边界**：仍需 M4-7.2 统一治理。多个 store 之间存在隐式依赖（investigation-store 的 activeTable 被 sql-workspace-panel 读取）。
- **Agent 暂不开始**：M5 Agent 范围未启动。
- **Tag 暂不打**：等合并验证后决定。
- **`/analyze/[id]` 依赖 localStorage**：如果用户清除了浏览器 localStorage，详情页会显示空态。这是预期行为，不是 bug。
