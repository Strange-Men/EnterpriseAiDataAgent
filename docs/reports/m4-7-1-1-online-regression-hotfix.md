# M4-7.1.1 Online Regression Hotfix

## 1. Problems Found Online

M4-7.1 合并后线上验证发现以下回归问题：

| # | 问题 | 严重度 |
|---|------|--------|
| 1 | 首页"分析工作台"卡片出现明显白边 | UI |
| 2 | AI 分析步骤结果有多个失败（Parser Error、空失败步骤） | UX |
| 3 | 点击"调查详情"进入 `/analyze/<id>` 后白屏 | P0 |
| 4 | 专家 SQL 中"分析工作台"按钮语义混乱 | UX |
| 5 | 专家 SQL 点击 `+` 后白屏 | P0 |
| 6 | AI 分析历史记录一闪而过 | P1 |
| 7 | 专家 SQL 历史时间显示为 UTC | UX |
| 8 | `/performance` 和 `/virtual-table` 404 | 预期（不修） |

## 2. Root Causes

### 首页白边
- 分析工作台卡片使用 `border-[var(--accent)]/30` 默认高亮边框，视觉上形成白边
- 交互元素缺少 `focus:outline-none` 和 `focus-visible:ring` 样式

### AI 步骤失败
- 后端 prompt 未约束 LLM 只使用现有列，导致生成引用不存在字段的 SQL
- `-- CANNOT_ANSWER` 和空 SQL 被标记为 `error` 而非 `skipped`
- 前端直接渲染 parser error 作为主内容
- 摘要未区分成功/跳过/失败步骤

### `/analyze/[id]` 白屏
- `run-sections.tsx` 直接渲染 `section.title`/`section.content`，未做类型安全检查
- 数组存在性检查缺失（`run.sections`、`run.multiResult?.steps`、`run.chartSpecs`）

### 专家 SQL `+` 白屏
- 新建 tab 后 `queryResult` 残留旧 tab 数据，可能导致渲染异常
- `getActiveTab()` 未做 fallback 处理

### 按钮语义
- `sql.goto-ai-assistant` 翻译为"分析工作台"，与导航栏的"分析工作台"页面重名

### AI 历史一闪而过
- `sql-history-store.fetchHistory()` 直接用后端数据覆盖整个 history 数组
- 后端 `fetchQueryHistory` 只返回 SQL 条目，AI 条目被丢弃
- `sql-history-panel.tsx` 也直接调用 API 覆盖而非使用 store 的合并逻辑

### 时间 UTC
- 后端 `time.strftime("%Y-%m-%dT%H:%M:%S")` 生成无时区后缀的服务器本地时间
- 前端 `new Date()` 将无后缀时间戳解析为浏览器本地时间，导致 UTC 服务器上时间偏移

## 3. Fixes Applied

### 3.1 首页白边 (`page.tsx`)
- 分析工作台卡片边框改为 `border-[var(--border-default)]`
- 所有交互按钮添加 `focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]`
- 保留键盘焦点可访问性

### 3.2 AI 步骤质量 (`analysis_plan.py`, `ai_pipeline.py`, `summarizer.py`)
**后端：**
- `analysis_plan.py`: Prompt 增加 CRITICAL 规则约束 LLM 只使用 schema 中存在的列
- `analysis_plan.py`: `build_user_message` 增加 Column Names 列表和 IMPORTANT 提示
- `ai_pipeline.py`: `-- CANNOT_ANSWER` 标记为 `skipped_no_data`（非 `error`）
- `ai_pipeline.py`: 空 SQL 标记为 `skipped_generation_error`
- `ai_pipeline.py`: 摘要中区分 ✓/✗/⊘ 状态标签
- `ai_pipeline.py`: 跳过步骤包含原因说明
- `ai_pipeline.py`: `partial` 状态包含 skipped 步骤
- `summarizer.py`: 指令区分成功/跳过步骤

**前端：**
- `step-results.tsx`: 跳过步骤使用 amber 色调（AlertCircle 图标）
- `step-results.tsx`: 跳过步骤展开显示原因文本
- `step-results.tsx`: 增强 `renderSafeText` 防护

### 3.3 `/analyze/[id]` 白屏 (`run-sections.tsx`)
- 增加 `Array.isArray()` 检查 sections/steps/charts
- section 渲染增加类型安全：验证 object、提取安全 title/content
- 空 content section 跳过渲染
- summary 增加 `typeof === "string"` 检查

### 3.4 专家 SQL `+` (`sql-editor-store.ts`)
- `getActiveTab()` 增加 fallback 到 `tabs[0]`
- `addTab()` 创建空白 tab 时清除残留 `queryResult`
- `StepResults` 组件增加 columns 数组验证、row 可选链、safe render 防护

### 3.5 按钮语义 (`zh.ts`, `en.ts`)
- `sql.goto-ai-assistant`: "分析工作台" → "自然语言查询"
- English: "Analysis Workspace" → "Natural Language Query"

### 3.6 AI 历史持久化 (`sql-history-store.ts`, `sql-history-panel.tsx`)
- `fetchHistory()` 改为合并策略：后端 SQL 条目 + 本地 AI 条目
- 按 id 去重，按时间排序
- `sql-history-panel.tsx` 改用 store 的 `fetchHistory()` 方法

### 3.7 时间本地化 (`query_history.py`, `datetime.ts`, `sql-history-panel.tsx`, `analysis-workspace-panel.tsx`)
- 后端改为 `datetime.now(timezone.utc).isoformat(timespec="seconds")` 生成 UTC+00:00 时间戳
- 新增 `frontend-react/src/utils/datetime.ts`：`formatLocalTime`、`formatLocalDateTime`、`formatRelativeTime`
- 前端统一使用 `formatLocalTime()` 显示时间

## 4. AI Result Quality Improvement

| 改进 | 前 | 后 |
|------|----|----|
| LLM 生成不存在列的 SQL | 直接执行，Parser Error | Prompt 约束跳过，`skipped_no_data` |
| 空 SQL | `error` + `AI_EMPTY_RESPONSE` | `skipped_generation_error` + 中文提示 |
| 步骤状态 | 只有 success/error | success/error/skipped_no_data/skipped_generation_error |
| 前端展示 | 红色 error + parser error 原文 | amber skipped + 原因折叠 |
| 摘要 | 不区分步骤状态 | ✓/✗/⊘ + 跳过原因 |

## 5. History Persistence Fix

**根本原因：** `fetchHistory()` 用后端返回的 SQL-only 数组直接覆盖 history，AI 条目丢失。

**修复：**
- `sql-history-store.ts`: `fetchHistory()` 合并后端 SQL 条目与本地 AI 条目，按 id 去重
- `sql-history-panel.tsx`: 使用 store 的 `fetchHistory()` 而非直接调用 API

## 6. Timezone Fix

**根本原因：** 后端 `time.strftime()` 生成无时区后缀的服务器本地时间，前端 `new Date()` 按浏览器本地时间解析。

**修复：**
- 后端改为 `datetime.now(timezone.utc).isoformat()` 生成 `+00:00` 后缀
- 前端 `formatLocalTime()` 统一转为用户本地时间显示

## 7. Validation Results

| 检查项 | 结果 |
|--------|------|
| TypeScript `tsc --noEmit` | ✅ 通过 |
| Frontend `npm run build` | ✅ 通过 |
| Frontend `npm run test` | ✅ 138/138 通过 |
| Backend `python -c "from backend.main import app"` | ✅ 通过 |
| Backend `pytest tests/` | ✅ 449/449 通过 |

## 8. Remaining Risks

- **activeTable 状态分散仍未彻底治理**，留到 M4-7.2。
- **暂不进入 M5 Agent**。
- 后端 query_history 时间戳格式变更：旧记录（无时区后缀）在前端仍按浏览器本地时间解析，显示可能不一致。新记录完全正确。

## 9. Next Step

合并到 master 后进入 M4-7.2：activeTable 状态治理。
