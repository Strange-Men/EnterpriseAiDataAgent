# M4-7 Full Project Scope & Coupling Audit

> 审计日期：2026-06-21
> 基线：master @ `1121dce`（含 M4-6.0.1 merge）
> 审计范围：全项目前端 127 文件、后端 53 文件、测试 38 文件

---

## 1. Summary

本次审计目标是确认 EnterpriseAiDataAgent 当前是否适合直接进入 M5 Data Analyst Agent 开发。

**结论：当前项目不建议立刻进入 M5 Agent。**

主要原因不是后端不能用，而是前端仍存在功能边界、历史状态、实验入口、Agent 工具边界不够清晰的问题。在进入 M5 前，应先完成 M4-7.1 Scope Pruning 和 M4-7.2 State Boundary Cleanup。

当前项目已经具备 Agent 的部分工具基础：表列表、schema 检查、只读 SQL 执行、AI 生成 SQL、数据质量检查、历史记录。但还缺 structured tool registry、agent state、step trace、tool I/O schema、result verifier、agent run persistence。

---

## 2. Current Core Product

**定位：EnterpriseAiDataAgent｜面向 CSV/Excel 文件的 AI 数据分析工作台**

### 核心主线

1. 上传 CSV / Excel
2. 选择数据表
3. 表预览 / 数据质量
4. 自然语言查询
5. AI 生成 SQL
6. 执行 SQL
7. 展示结果
8. 解释结果 / 生成摘要
9. 历史记录可回溯

### 不是

- 完整 BI
- Dashboard 平台
- Superset / Metabase 替代品
- 多租户企业系统
- 大而全 Agent 平台
- 实验功能集合

---

## 3. Module Map

| Module | Files / Area | Current Role | User-facing? | Risk |
|---|---|---|---|---|
| Upload / Ingestion | `routes/upload.py`, `file-upload-panel.tsx` | CSV/Excel 上传 → DuckDB | Yes | Low |
| DuckDB Storage | `database/`, `services/data_service.py` | 表存储、只读执行 | No | Low |
| Table List / Preview | `routes/tables.py`, `table-management-panel.tsx`, `data-preview-panel.tsx` | 表列表、schema、预览 | Yes | Low |
| Data Quality | `routes/quality.py`, `services/profiler.py` | 质量报告、profile | Yes | Low |
| Analysis Workspace | `analysis-workspace-panel.tsx`, `investigation-workspace.tsx` | 统一分析入口 | Yes | Medium |
| Natural Language Query | `routes/ai.py` → `ai_pipeline.py` | NL → SQL → Execute → Explain | Yes | Medium |
| Expert SQL | `sql-workspace-panel.tsx`, `routes/query.py` | 手动 SQL 编辑执行 | Yes | Low |
| SQL History | `sql-history-store.ts`, `sql-history-panel.tsx`, `services/query_history.py` | 查询历史 | Yes | Low |
| AI Result Rendering | `ai-analysis-modes.ts`, `streaming-output.tsx`, `step-results.tsx` | AI 结果展示 | Yes | Medium |
| Settings / i18n / Theme | `settings/page.tsx`, `i18n/`, `use-theme.ts` | 系统设置 | Yes | Low |
| Feature Flags | `config/features.ts` | 控制实验功能可见性 | No | Medium |
| Command Palette / Search / Shortcuts | `command-palette.tsx`, `global-search.tsx`, `keyboard-shortcuts-modal.tsx`, `use-keyboard-shortcuts.ts` | 快捷操作（未暴露） | No | Remove Candidate |
| Experimental Pages | `/performance`, `/virtual-table` | 开发调试用 | No | Remove Candidate |
| Scheduler | `services/scheduler.py`, `runtime/scheduler_worker.py`, `schedule-store.ts` | 定时分析（hidden） | No | Remove Candidate |
| Templates | `template-store.ts`, `save-template-dialog.tsx`, `apply-template-dialog.tsx` | 分析模板（hidden） | No | Remove Candidate |
| Diff / Compare | `services/diff_engine.py`, `diff-panel.tsx` | 分析对比（hidden） | No | Remove Candidate |
| Charts | `ai-chart.tsx`, chart suggest in AI modes | 图表建议（hidden） | No | Remove Candidate |
| Timeline Evolution | `timeline-evolution.tsx` | 时间线（hidden） | No | Remove Candidate |
| Bundle Import/Export | Bundle endpoints in `routes/ai.py` | 分析包（hidden） | No | Remove Candidate |
| Backend AI Pipeline | `services/ai_pipeline.py`, `services/ai_analyst.py` | NL→SQL 编排 | No | Medium |
| Backend Query Execution | `services/data_service.py` | DuckDB 只读执行 | No | Low |
| Backend SQL Safety | `services/sql_validator.py`, `services/guardrails.py` | SQL 校验、guardrails | No | Low |
| Backend Trace | `services/trace.py`, `runtime/token_budget.py` | LLM 调用追踪、token 预算 | No | Medium |
| Backend Prompts | `prompts/` (10 modules) | Prompt 架构 | No | Low |
| Backend Report / Diff | `services/report_builder.py`, `services/diff_engine.py` | 报告生成、对比 | No | Medium |
| Tests | `tests/` (38 files) | 后端单元测试 | No | Low |
| Middleware | `middleware/auth.py`, `observability.py`, `rate_limit.py` | 认证、监控、限流 | No | Low |

---

## 4. Keep / Hide / Delete Decisions

| Feature / File | Problem | Decision | Why | Safe Removal Plan |
|---|---|---|---|---|
| CSV/Excel Upload | 无 | **Keep** | 核心主线 Step 1 | — |
| DuckDB Storage | 无 | **Keep** | 核心存储 | — |
| Table List / Preview | 无 | **Keep** | 核心主线 Step 2-3 | — |
| Data Quality | 无 | **Keep** | 核心主线 Step 3 | — |
| Expert SQL | 无 | **Keep** | 核心主线 Step 6 | — |
| Natural Language Query | 无 | **Keep** | 核心主线 Step 4-5 | — |
| AI SQL Generation | 无 | **Keep** | 核心主线 Step 5，Agent Tool Candidate | — |
| AI Explanation | 无 | **Keep** | 核心主线 Step 8，Agent Tool Candidate | — |
| AI Summary (autonomous mode) | 仅此模式暴露，其他 hidden | **Keep** | 核心分析模式 | — |
| Export (CSV/JSON/Excel) | 无 | **Keep** | 核心主线 | — |
| Query History | 无 | **Keep** | 核心主线 Step 9 | — |
| Analysis History | 无 | **Keep** | 核心主线 Step 9 | — |
| Settings / i18n / Theme | 无 | **Keep** | 基础体验 | — |
| Charts / Chart Suggestions | feature flag hidden，前端渲染复杂 | **Hide** | 不服务核心主线 | 从 feature flag 保持 false，后续清理引用 |
| Templates | feature flag hidden，无 UI 入口 | **Hide** | 半成品 | 保持 hidden，后续分支删除 |
| Scheduler | feature flag hidden，后端 worker 仍在运行 | **Hide** | 半成品，后台线程浪费资源 | 停止 worker 启动，保持代码 |
| Diff / Compare | feature flag hidden | **Hide** | 半成品 | 保持 hidden |
| Timeline Evolution | feature flag hidden | **Hide** | 半成品 | 保持 hidden |
| Bundle Import/Export | 无 UI 入口，API 存在 | **Hide** | 半成品 | 保持 hidden |
| Performance Page | 标记 EXPERIMENTAL，无导航入口 | **Delete Later** | 开发调试用，非产品功能 | 单独分支删除 `/performance` route |
| Virtual Table Page | 标记 EXPERIMENTAL，无导航入口 | **Delete Later** | 开发调试用 | 单独分支删除 `/virtual-table` route |
| Old `/query` Page | 仅做 redirect 到 `/analyze` | **Delete Later** | 入口债务 | 确认无外部链接后删除 |
| Command Palette | 组件存在但未暴露 | **Delete Later** | 维护成本 > 价值 | 确认无引用后删除 |
| Global Search | 组件存在但未暴露 | **Delete Later** | 维护成本 > 价值 | 确认无引用后删除 |
| Keyboard Shortcuts Modal | 组件存在但未暴露 | **Delete Later** | 维护成本 > 价值 | 确认无引用后删除 |
| AI Charts Mode | feature flag false | **Hide** | 不服务核心主线 | 保持 false |
| AI Anomalies Mode | feature flag false | **Hide** | 不服务核心主线 | 保持 false |
| AI Full-Analysis Mode | feature flag false | **Hide** | 不服务核心主线 | 保持 false |
| AI Autonomous Mode | feature flag true，唯一暴露的 AI 模式 | **Keep** | 核心分析能力 | — |
| Readonly SQL Executor | 无 | **Agent Tool Candidate** | Agent 核心工具 | — |
| Schema Inspection | 无 | **Agent Tool Candidate** | Agent 核心工具 | — |
| Data Quality / Profile | 无 | **Agent Tool Candidate** | Agent 核心工具 | — |
| AI Explanation | 无 | **Agent Tool Candidate** | Agent 辅助工具 | — |
| SQL Safety Validator | 无 | **Agent Tool Candidate** | Agent 安全工具 | — |
| Query History | 无 | **Agent Tool Candidate** | Agent 上下文工具 | — |

---

## 5. Coupling Risks

| Coupling Point | Files | Why It Is Risky | Refactor Direction | Priority |
|---|---|---|---|---|
| `ai_pipeline.py` 承担过多职责 | `backend/services/ai_pipeline.py` | 同时负责 NL→SQL、执行、解释、计划、autonomous 编排。改一处影响全局。 | 拆分为 `sql_generator.py`, `step_executor.py`, `analysis_orchestrator.py` | P1 |
| `investigation-store` 混合 UI/API/业务状态 | `frontend-react/src/stores/investigation-store.ts` | 同时管理 UI stage、AI conversation、activeTable、keyFindings、drillChain。一个 store 改动可能影响多个 UI 面板。 | 拆分 conversation store 和 context store | P1 |
| `activeTable` 状态分散 | `data-store.ts`, `investigation-store.ts`, AI request payload | 表名在多处存储，AI 请求时需要从 store 取值，存在同步不一致风险。M4-6.0.1 已修一次，但根因未解决。 | 统一 table context source | P0 |
| AI output contract 不统一 | `ai-analysis-modes.ts`, `streaming-output.tsx` | explain/insights/charts/anomalies/autonomous 各自返回不同结构，前端渲染逻辑分散。 | 统一 ModeResult 接口 | P1 |
| History 分散在多个 store | `sql-history-store.ts`, `analysis-store.ts`, `saved-queries-store.ts` | SQL 历史、分析历史、保存查询各自独立，用户无法统一搜索。 | 合并或建立统一 history 接口 | P2 |
| Feature flag 隐藏但代码到处引用 | `features.ts` → 多个组件 | flag=false 的功能代码仍被 import，增加 bundle size 和维护负担。 | 清理未使用 import | P1 |
| SQL result 存储在多处 | `sql-editor-store.ts`, `analysis-store.ts`, `investigation-store.ts` | 执行结果同时存在于 editor store（当前结果）和 analysis store（历史记录）。 | 统一 result 来源 | P2 |
| Error handling 分散 | 各组件 try/catch, `streaming-output.tsx`, `ai-analysis-modes.ts` | 每个 AI 模式各自处理错误，没有统一错误状态。 | 建立统一 error boundary | P2 |
| Scheduler worker 无 UI 可见性 | `runtime/scheduler_worker.py`, `main.py` lifespan | 后台线程在 main.py 启动，但 feature flag 隐藏了 UI，用户不知道它在运行。 | 停止自动启动 worker | P1 |
| Empty LLM response retry 可能重复记录 | `ai_pipeline.py` L256-259 | retry 时重新调用 generate_sql，如果 history 在上层记录，retry 会产生重复条目。 | 将 retry 逻辑下沉到 service 层 | P2 |

---

## 6. Feature Flag Review

| Flag / Area | Current State | Current Risk | Recommendation | Reason |
|---|---|---|---|---|
| `showAutonomousMode` | true | Low | **Keep true** | 核心 AI 分析模式，唯一暴露的自主分析能力 |
| `showQuickSqlPanel` | false | Low | **Keep false → Delete Later** | 半成品，SQL Workspace 已有完整功能 |
| `showTemplates` | false | Low | **Keep false → Delete Later** | 半成品，无 UI 入口 |
| `showSchedule` | false | Medium | **Keep false + 停止 worker** | 后台线程仍在运行，浪费资源 |
| `showDiffCompare` | false | Low | **Keep false → Delete Later** | 半成品 |
| `showTimeline` | false | Low | **Keep false → Delete Later** | 半成品 |
| `showSaveAsTemplate` | false | Low | **Keep false → Delete Later** | 半成品 |
| `showAiButtonsInSqlWorkspace` | false | Low | **Keep false** | M4-6.0.1 明确隐藏，避免 AI 按钮过多 |
| `showAiSqlInputInWorkspace` | false | Low | **Keep false** | M4-6.0.1 明确隐藏 |
| `showChartsMode` | false | Low | **Keep false → Delete Later** | 不服务核心主线 |
| `showAnomaliesMode` | false | Low | **Keep false → Delete Later** | 不服务核心主线 |
| `showFullAnalysisMode` | false | Low | **Keep false → Delete Later** | 不服务核心主线 |

**分类建议：**

- **Core flags**（不应长期存在）：`showAutonomousMode` — 确认稳定后移除 flag，功能永久开启
- **Experimental flags**（保持 false）：charts, anomalies, full-analysis — 保持 hidden
- **Deprecated flags**（准备清理）：templates, schedule, diff, timeline, quickSqlPanel, saveAsTemplate — 代码引用清理后删除 flag
- **M4-6.0.1 flags**（保持 false）：aiButtonsInSqlWorkspace, aiSqlInputInWorkspace — 产品决策，保持 hidden

---

## 7. Agent Readiness

# M5 Data Analyst Agent Readiness

## 已具备工具能力

| 能力 | 后端入口 | 稳定性 | 说明 |
|---|---|---|---|
| list tables | `GET /api/tables` | 稳定 | 返回所有表名和行数 |
| inspect schema | `GET /api/tables/{name}/schema` | 稳定 | 返回列名、类型 |
| preview table | `GET /api/tables/{name}/data` | 稳定 | 分页返回数据 |
| run readonly SQL | `POST /api/query` | 稳定 | DuckDB 只读执行，有 SQL 校验 |
| data quality | `GET /api/quality/{name}` | 稳定 | 质量报告 |
| table profile | `GET /api/analyze/{name}/profile` | 稳定 | 统计 profile |
| AI SQL generation | `POST /api/ai/query` | 稳定 | NL → SQL，含 retry |
| AI explanation | `POST /api/ai/explain/stream` | 稳定 | 流式解释 |
| AI insights | `POST /api/ai/insights` | 稳定 | 结构化洞察 |
| autonomous analysis | `POST /api/ai/analyze-multi/stream` | 稳定 | 多步自主分析 |
| query history | `GET /api/query/history` | 稳定 | 后端持久化 |
| export | `POST /api/query/export` | 稳定 | CSV/JSON/Excel |
| SQL safety | `services/sql_validator.py` | 稳定 | 只读校验、危险操作拦截 |
| guardrails | `services/guardrails.py` | 稳定 | 步数、超时、连续失败限制 |
| trace | `services/trace.py` | 稳定 | LLM 调用追踪 |
| token budget | `runtime/token_budget.py` | 稳定 | Token 消耗控制 |

## 缺失能力

| 能力 | 为什么缺 | 影响 |
|---|---|---|
| structured tool registry | 后端能力分散在 routes 和 services 中，没有统一的 tool 定义 | Agent 无法发现和调用工具 |
| tool input/output schema | 各 endpoint 的 request/response 没有 JSON Schema 定义 | Agent 无法可靠地构造调用参数 |
| agent state | 当前无 agent 运行状态管理 | Agent 无法追踪自己的执行进度 |
| step trace (agent-level) | 现有 trace 是 LLM 调用级别的，不是 agent 步骤级别的 | 无法展示 agent 决策过程 |
| agent run persistence | 分析结果存在前端 localStorage，不是后端持久化 | Agent 运行历史不可靠 |
| retry policy (agent-level) | 现有 retry 在 SQL 生成层面，agent 层面无重试策略 | Agent 工具调用失败时无恢复机制 |
| result verifier | 无工具验证 SQL 结果是否回答了问题 | Agent 可能返回不相关结果 |
| SQL safety as explicit tool | SQL 校验在 services 中，但不是 agent 可调用的工具 | Agent 无法在生成 SQL 后主动校验 |
| report builder contract | 报告生成是纯函数，没有结构化输入输出约定 | Agent 无法可靠地生成报告 |
| user-facing run timeline | 前端有 trace-timeline 组件，但后端无 agent run timeline API | 用户无法看到 agent 决策链 |

## Agent Capability Matrix

| Agent Capability | Current Status | Required Before M5? | Suggested Implementation |
|---|---|---|---|
| list_tables tool | ✅ 已有 API | Yes | 包装为 tool schema |
| inspect_schema tool | ✅ 已有 API | Yes | 包装为 tool schema |
| run_sql tool | ✅ 已有 API + safety | Yes | 包装为 tool schema，复用 sql_validator |
| data_quality tool | ✅ 已有 API | Yes | 包装为 tool schema |
| ai_generate_sql tool | ✅ 已有 API | Yes | 包装为 tool schema |
| ai_explain tool | ✅ 已有 API | No (M5.1) | 后续加入 |
| tool registry | ❌ 缺失 | Yes | 新建 `backend/agent/tools.py` |
| tool input/output schema | ❌ 缺失 | Yes | 用 Pydantic 定义每个 tool 的 schema |
| agent state | ❌ 缺失 | Yes | 新建 `backend/agent/state.py` |
| agent step trace | ❌ 缺失 | Yes | 扩展 TraceRecorder 或新建 AgentTrace |
| agent run persistence | ❌ 缺失 | Yes | 后端持久化到 DuckDB 或 JSON |
| result verifier | ❌ 缺失 | No (M5.1) | LLM 验证结果相关性 |
| report builder tool | ❌ 缺失 | No (M5.1) | 包装现有 report_builder |
| retry policy | ❌ 缺失 | Yes | agent 级别的工具调用重试 |
| user-facing timeline API | ❌ 缺失 | No (M5.1) | 后端返回 agent run timeline |

**判断：现在不适合直接做多 Agent，不适合引入 LangGraph。应先做单 Agent MVP，围绕已有工具能力编排。**

---

## 8. Recommended Pruning Plan

### A. 立即隐藏，低风险

这些功能不删源码，只从 UI 入口隐藏（当前已通过 feature flag 隐藏，确认无遗漏入口即可）。

| Feature | Current State | Action | Risk |
|---|---|---|---|
| Chart suggestions | feature flag false | 确认无其他入口暴露 | Low |
| Templates | feature flag false | 确认无其他入口暴露 | Low |
| Diff / Compare | feature flag false | 确认无其他入口暴露 | Low |
| Timeline Evolution | feature flag false | 确认无其他入口暴露 | Low |
| AI Charts Mode | feature flag false | 保持 hidden | Low |
| AI Anomalies Mode | feature flag false | 保持 hidden | Low |
| AI Full-Analysis Mode | feature flag false | 保持 hidden | Low |
| Bundle Import/Export | 无 UI 入口 | 保持 hidden | Low |
| Scheduler UI | feature flag false | **停止 worker 自动启动** | Low |

### B. 后续删除，需要确认依赖

这些功能先标记，后续单独分支删除。

| Feature | Why Not Now | Dependencies to Check | Branch Plan |
|---|---|---|---|
| `/performance` page | 可能有开发者在用 | 确认无外部链接 | `m4-7.1-delete-performance` |
| `/virtual-table` page | 可能有开发者在用 | 确认无外部链接 | `m4-7.1-delete-virtual-table` |
| `/query` redirect page | 可能有外部书签 | 确认无外部引用 | `m4-7.1-delete-query-redirect` |
| Command palette 组件 | 可能被其他组件引用 | grep 确认无 import | `m4-7.1-delete-command-palette` |
| Global search 组件 | 可能被其他组件引用 | grep 确认无 import | `m4-7.1-delete-global-search` |
| Keyboard shortcuts | 可能被 shell layout 引用 | grep 确认无 import | `m4-7.1-delete-shortcuts` |
| Scheduler worker 代码 | feature flag 控制 | 确认无其他调用 | `m4-7.1-stop-scheduler-worker` |
| Template store + dialogs | feature flag 控制 | 确认无其他引用 | `m4-7.1-delete-templates` |
| Diff panel + engine | feature flag 控制 | 确认无其他引用 | `m4-7.1-delete-diff` |
| Timeline component | feature flag 控制 | 确认无其他引用 | `m4-7.1-delete-timeline` |

### C. 不删除，未来 Agent 会用

| Capability | Why Keep | Agent Usage |
|---|---|---|
| Readonly SQL Executor | Agent 核心工具 | run_sql tool |
| Schema Inspection | Agent 核心工具 | inspect_schema tool |
| Table List | Agent 核心工具 | list_tables tool |
| Data Quality / Profile | Agent 核心工具 | data_quality tool |
| SQL Safety Validator | Agent 安全工具 | SQL 校验 tool |
| AI SQL Generation | Agent 辅助工具 | ai_generate_sql tool |
| AI Explanation | Agent 辅助工具 | ai_explain tool |
| Query History | Agent 上下文工具 | 历史查询 tool |
| Streaming Output | Agent 展示工具 | 流式输出 |
| Export | Agent 输出工具 | export tool |
| Guardrails | Agent 安全机制 | 复用 guardrail 逻辑 |
| Trace | Agent 追踪基础 | 扩展为 agent trace |
| Token Budget | Agent 资源控制 | 复用 token budget |

**为什么不能一口气删：**
- 部分功能虽然 hidden，但代码可能被其他 hidden 功能依赖
- 删除前需要 grep 确认无 import 链
- 每个删除动作应独立分支，失败时可单独 revert

**删除前需要补的测试：**
- 确认删除后 frontend build 通过
- 确认删除后 TypeScript 类型检查通过
- 确认删除后核心功能（upload → query → explain）不受影响

---

## 9. Recommended Refactor Roadmap

| Phase | Goal | Allowed Files | Forbidden Files | Acceptance Criteria | Rollback |
|---|---|---|---|---|---|
| M4-7.1 | Scope Pruning | UI 入口、feature flags、实验页面 | 后端 services、stores 业务逻辑 | Build 通过，核心功能不受影响 | revert merge commit |
| M4-7.2 | State Boundary Cleanup | stores、panels、hooks | 后端 routes、services | Table context 单一来源，history 统一 | revert merge commit |
| M4-7.3 | Agent Tool Preparation | 后端 agent/ 目录（新建） | 前端代码 | tool schema 定义完成，不改变现有 API | revert merge commit |
| M5.0 | Agent MVP | 后端 agent/，前端 agent UI（新建） | 现有 analysis modes | 单 Agent 可执行 query → explain 流程 | revert merge commit |

### M4-7.1 Scope Pruning

**Goal：** 隐藏/删除候选入口，清理 old routes，清理 feature flags，清理无用组件。

**Allowed Files：**
- `frontend-react/src/config/features.ts`
- `frontend-react/src/layout/sidebar.tsx`
- `frontend-react/src/app/performance/page.tsx`（删除）
- `frontend-react/src/app/virtual-table/page.tsx`（删除）
- `frontend-react/src/app/(shell)/query/page.tsx`（删除或保留 redirect）
- `frontend-react/src/components/ui/command-palette.tsx`（删除）
- `frontend-react/src/components/ui/global-search.tsx`（删除）
- `frontend-react/src/components/ui/keyboard-shortcuts-modal.tsx`（删除）
- `frontend-react/src/hooks/use-keyboard-shortcuts.ts`（删除）
- `backend/runtime/scheduler_worker.py`（停止自动启动）
- `backend/main.py`（移除 scheduler worker 启动代码）

**Forbidden Files：**
- `backend/services/ai_pipeline.py`
- `backend/services/ai_analyst.py`
- `backend/services/data_service.py`
- `frontend-react/src/stores/investigation-store.ts`
- `frontend-react/src/stores/analysis-store.ts`
- `frontend-react/src/panels/analysis-workspace-panel.tsx`

**Acceptance Criteria：**
- `npx next build` 通过
- `python -c "from backend.main import app"` 通过
- 449 tests 全部通过
- 侧边栏只显示 Home / Data / Analyze / History / Settings
- 无 `/performance`、`/virtual-table` 路由

**Rollback：** `git revert <merge-commit>`

### M4-7.2 State Boundary Cleanup

**Goal：** 明确 current table 来源，明确 history 来源，明确 AI result 来源，减少跨 store 状态同步风险。

**Allowed Files：**
- `frontend-react/src/stores/data-store.ts`
- `frontend-react/src/stores/investigation-store.ts`
- `frontend-react/src/stores/analysis-store.ts`
- `frontend-react/src/stores/sql-editor-store.ts`
- `frontend-react/src/stores/sql-history-store.ts`
- `frontend-react/src/panels/analysis-workspace-panel.tsx`
- `frontend-react/src/panels/sql-workspace-panel.tsx`
- `frontend-react/src/hooks/`

**Forbidden Files：**
- 后端所有文件
- 前端路由文件
- 前端 UI 组件（除 panel 外）

**Acceptance Criteria：**
- `activeTable` 只有一个来源（data-store）
- AI request 始终从 data-store 获取当前表
- SQL history 和 analysis history 有统一接口
- 状态变更不影响现有功能行为

**Rollback：** `git revert <merge-commit>`

### M4-7.3 Agent Tool Preparation

**Goal：** 把后端已有能力整理成 Agent tools，定义 tool input/output schema，不做 Agent，只做工具边界。

**Allowed Files：**
- `backend/agent/`（新建目录）
- `backend/agent/__init__.py`
- `backend/agent/tools.py`
- `backend/agent/schemas.py`

**Forbidden Files：**
- 前端所有文件
- 现有 `backend/routes/`、`backend/services/`（只读引用，不修改）

**Acceptance Criteria：**
- 每个 tool 有 Pydantic input/output schema
- tool 定义不改变现有 API 行为
- `python -c "from backend.agent.tools import TOOL_REGISTRY"` 通过
- 449 tests 全部通过（不新增后端测试，只新增 agent 目录测试）

**Rollback：** `git revert <merge-commit>` 或删除 `backend/agent/` 目录

### M5.0 Data Analyst Agent MVP

**Goal：** 单 Agent，工具调用，结构化步骤，SQL 执行，解释和报告，可回溯 run timeline。

**Allowed Files：**
- `backend/agent/`（扩展）
- `backend/routes/agent.py`（新建）
- `frontend-react/src/app/(shell)/agent/`（新建）
- `frontend-react/src/components/agent/`（新建）

**Forbidden Files：**
- 现有 analysis modes（`ai-analysis-modes.ts`）
- 现有 investigation workspace
- 现有 SQL workspace

**Acceptance Criteria：**
- 用户输入问题 → Agent 检查 schema → 生成 SQL → 执行 → 验证 → 输出结论
- Agent 运行 timeline 可回溯
- Agent 失败时有清晰错误信息
- 不影响现有功能

**Rollback：** `git revert <merge-commit>` 或删除 `backend/agent/` 和 `frontend-react/src/app/(shell)/agent/`

---

## 10. Risks and Rollback

### 风险

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| 删除功能误伤隐藏依赖 | Medium | High | 每次删除前 grep 确认无 import |
| Feature flag 清理导致入口异常 | Low | Medium | 保持 core flags，只清理 deprecated flags |
| 历史记录结构变更影响旧记录 | Medium | Medium | 保持 localStorage key 不变，只改内部结构 |
| current table 状态收敛影响 Data/Analysis 同步 | Medium | High | 逐步收敛，每步测试 |
| Agent tool preparation 过度设计 | Low | Low | 只做 schema 定义，不做运行时 |
| M5 Agent 与现有功能冲突 | Medium | High | Agent 路由独立，不修改现有 routes |

### 回滚策略

1. **每阶段独立分支**：`m4-7.1-*`, `m4-7.2-*`, `m4-7.3-*`, `m5.0-*`
2. **每阶段只做一类改动**：scope pruning 不碰 state，state cleanup 不碰 routes
3. **每阶段先测试再合并**：build + 449 tests + TypeScript check
4. **每阶段合并前生成报告**：`docs/reports/m4-7.x-*.md`
5. **线上失败时 revert merge commit**：`git revert <merge-commit-hash>`

---

## 11. Next Step

### 结论

1. **当前项目不适合立刻进入 M5 Agent。**
2. **推荐下一步：M4-7.1 Scope Pruning。**
3. M4-7.1 完成后，再做 M4-7.2 State Boundary Cleanup。
4. M4-7.3 再准备 Agent tools。
5. M5 才正式做 Data Analyst Agent MVP。

### M5 最小可行形态

1. 用户提出问题
2. Agent 检查当前表 schema
3. Agent 生成 SQL
4. 系统只读执行 SQL
5. Agent 验证结果是否回答问题
6. Agent 输出简短结论
7. 保存完整 run timeline 到历史

### 关键判断

| Question | Answer |
|---|---|
| 当前项目是否适合马上加 Agent？ | **否**，需要先清理 scope 和 state boundary |
| 必须先做哪些清理？ | M4-7.1 Scope Pruning + M4-7.2 State Boundary Cleanup |
| 哪些功能应该删除/隐藏？ | 见第 4、8 节 |
| 哪些能力应该保留给 Agent？ | 见第 7、8C 节 |
| M5 Agent 的最小可行形态是什么？ | 单 Agent + 6 个 core tools + SQL 执行 + 结论输出 |
