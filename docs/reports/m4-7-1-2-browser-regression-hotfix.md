# M4-7.1.2 Browser Regression Hotfix

## 1. Browser Issues Found

| # | Issue | Severity | URL |
|---|-------|----------|-----|
| 1 | `/analyze/[runId]` 调查详情白屏 (React #185) | Critical | `/analyze/<uuid>` |
| 2 | 专家 SQL `+` 新建 Query 白屏 (React #31) | Critical | `/analyze` (Expert SQL tab) |
| 3 | 专家 SQL "自然语言查询"按钮点击无效 | High | `/analyze` (Expert SQL tab) |
| 4 | AI 分析计划过度扩展，多步 skipped | Medium | `/analyze` (AI Query) |
| 5 | Skipped step 显示技术错误消息 | Medium | `/analyze` (AI Query) |

## 2. Root Causes

### React #185 — `/analyze/[runId]` 白屏
- **根因**: `streaming-output.tsx`, `analysis-section.tsx`, `run-evaluation.tsx`, `run-header.tsx`, `run-timeline.tsx`, `drill-down-chain.tsx` 中多处直接渲染 `section.title`, `step.purpose`, `result.summary`, `run.question`, `eval_.completeness` 等字段，未使用 `renderSafeText()` 防御。
- 当 localStorage 中存储了损坏数据（如之前版本写入的 event object），反序列化后这些字段变成对象，React 无法渲染对象，触发 #185。

### React #31 — 专家 SQL `+` 白屏
- **根因**: `query-tabs-bar.tsx` 第 91 行 `onClick={onAdd}` 直接将 `addTab` 作为 onClick handler。React 的 `onClick` 会传入 `MouseEvent` 作为第一个参数，`addTab(mouseEvent)` 将 event 对象存入 `tab.name`。
- Zustand persist 中间件将损坏的 tabs 序列化到 localStorage。
- 后续渲染时 `tab.name` 是一个对象，JSX 尝试渲染 `{tab.name}` 触发 React #31。

### "自然语言查询"按钮无效
- **根因**: `sql-workspace-panel.tsx` 使用 `<Link href="/analyze">` 实现按钮，但用户已经在 `/analyze` 页面。Link 只是重新加载同一页面，不会切换内部 tab 状态。
- 应该通过事件或回调切换父组件的 `activeTab` state。

### AI 计划过度扩展
- **根因**: Planner prompt 指示 "break the question into 3-6 analytical steps"，强制最少 3 步。
- Prompt 要求 "First step should establish baseline/overview"，导致简单问题也被拆成 overview + answer + extras。
- 无简单问题短路机制，所有问题都走 3-6 步 planner。
- Guardrails 默认 `max_steps=6`，不会限制过度扩展。

### Skipped step 技术错误
- **根因**: 后端 `llm_sql.py` 空 SQL 返回 `"Model returned an empty SQL response."` 作为 CANNOT_ANSWER 原因。
- 前端 `step-results.tsx` 直接展示 `step.error` 原始文本，不区分技术细节和用户消息。

## 3. Fixes Applied

### Fix 1: React #31 — SQL `+` 按钮
- `query-tabs-bar.tsx:91`: `onClick={onAdd}` → `onClick={() => onAdd()}`
- `sql-editor-store.ts` `addTab()`: 添加 `typeof name === "string"` 防御，非字符串 name 回退到默认名。
- `sql-editor-store.ts` `onRehydrateStorage`: 添加 tabs 清洗逻辑，修复 localStorage 中已损坏的 tab name。

### Fix 2: React #185 — 安全渲染防御
以下文件的所有动态字符串渲染添加了 `renderSafeText()` 防御:
- `streaming-output.tsx`: `step.purpose`, `result.summary` (添加 `typeof` 检查), `anomalies.summary` (添加 null 检查)
- `analysis-section.tsx`: `section.title`
- `run-evaluation.tsx`: `MetricBar` value, `diagnostics[]`, `suggested_improvements[]`
- `run-header.tsx`: `run.question || run.table || run.mode`
- `run-timeline.tsx`: `run.question || run.table || run.mode`, `run.error`
- `drill-down-chain.tsx`: `run.question?.slice(0, 30) || run.mode`, `run.question || run.table || run.mode`
- `analyze/[runId]/page.tsx`: `run.error`

### Fix 3: "自然语言查询"按钮
- `sql-workspace-panel.tsx`: `<Link href="/analyze">` → `<button onClick={() => window.dispatchEvent(new CustomEvent("workspace:switch-tab", { detail: "ai-query" }))}>` 
- `investigation-workspace.tsx`: 添加 `useEffect` 监听 `workspace:switch-tab` 事件，切换 `activeTab`。

### Fix 4: AI 计划优化
- `analysis_plan.py` SYSTEM_PROMPT:
  - "3-6 analytical steps" → "1-3 focused analytical steps"
  - "Maximum 6 steps" → "Maximum 3 steps"
  - 移除 "First step should establish baseline/overview"
  - 新增: "The FIRST step MUST directly answer the user's question"
  - 新增: "For simple questions, 1-2 steps is ideal. Do NOT pad with unnecessary exploratory steps."
  - 新增: "Do NOT generate steps just to fill a quota."
- `ai_analyst.py`: `result["plan"][:6]` → `result["plan"][:3]`
- `guardrails.py`: `max_steps` 默认 6→3, `max_sql_queries` 默认 8→4, STRICT 4→2/5→3

### Fix 5: Skipped step 友好展示
- `llm_sql.py`: 空 SQL 的 CANNOT_ANSWER 消息改为 "当前数据表缺少用于该分析的字段，无法生成查询。"
- `ai_pipeline.py`: `skipped_generation_error` 消息改为 "当前数据表缺少用于该分析的字段，已跳过此步骤。"
- `step-results.tsx`: skipped 步骤显示友好文案 "当前数据表缺少用于该分析的字段，已跳过此步骤。"，技术详情折叠到 `<details>` 中。
- i18n: 添加 `ai.step-skipped-reason` 中英文翻译。

## 4. AI Planning Quality Improvement

**问题**: 用户问 "不同地区的销售额排名如何？" 时，系统生成 4 步，后 3 步涉及客户类型、利润、趋势等表中不存在的字段。

**原因**:
1. Prompt 指示 "3-6 步"，强制最少 3 步
2. "Baseline first" 规则迫使简单排名问题也要先做 overview
3. 无 schema 字段验证短路

**改进**:
1. Prompt 改为 "1-3 步"，简单问题 1-2 步即可
2. 第一步必须直接回答用户问题，不做无意义 overview
3. 后续步骤只能使用 schema 中真实存在的字段
4. Guardrails 从 6 步降到 3 步，防止过度扩展

**预期效果**: "不同地区的销售额排名" 只生成 1-2 步：按地区汇总销售额排名，可选统计订单数。

## 5. React Crash Prevention

### React #31 防御策略
1. **事件隔离**: `onClick={() => onAdd()}` 确保 event 不传入业务函数
2. **Store 防御**: `addTab()` 检查 `typeof name === "string"`，非字符串回退默认值
3. **Rehydration 防御**: `onRehydrateStorage` 清洗 localStorage 中已损坏的 tabs
4. **纵深防御**: 即使前两层都失败，渲染层 `renderSafeText` 也能兜底

### React #185 防御策略
1. **统一安全渲染**: 所有动态字符串字段使用 `renderSafeText(value, fallback)`
2. **类型守卫**: `typeof value === "string"` 在渲染前检查
3. **Null 安全**: `result?.anomalies?.summary` 可选链访问
4. **已有模式推广**: `run-sections.tsx` 和 `step-results.tsx` 已有的安全模式推广到所有组件

## 6. Validation Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ Pass |
| `npm run test` (vitest) | ✅ 176 passed |
| `npx next build` | ✅ Pass |
| `python -c "from backend.main import app"` | ✅ OK |
| `python -m pytest tests/ -x -q --ignore=tests/ai` | ✅ 488 passed |

## 7. Remaining Risks

- **activeTable 状态边界**: `investigation-store` 中 `activeTable` 在某些边界条件下可能为空或不一致，需要 M4-7.2 统一治理。
- **Agent 暂不开始**: M5 Agent 功能不在本轮范围内。
- **localStorage 数据迁移**: 已有 rehydration 清洗逻辑，但用户如果在修复前已经产生了损坏数据，首次加载时会被自动修复。

## 8. Next Step

1. 合并 `m4-7-1-2-browser-regression-hotfix` 到 `master`
2. 线上验证所有 5 个问题是否修复
3. 验证通过后进入 M4-7.2
4. 暂不进入 M5 Agent
5. 暂不打 tag
