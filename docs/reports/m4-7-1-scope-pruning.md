# M4-7.1 Scope Pruning

> 日期：2026-06-21
> 分支：`m4-7-1-scope-pruning`
> 基线：master @ `833ba37`（含 M4-6.0.1 merge + audit commit）

---

## 1. Why This Step

M4-7 Full Project Scope & Coupling Audit 结论：当前项目不适合立刻进入 M5 Agent。

主要原因：
- 前端仍有实验页面、半成品功能入口、低价值全局功能
- Feature flags 缺乏分类，11/12 为 false 但无语义区分
- Scheduler worker 在无 UI 的情况下仍在后台运行
- Command Palette / Global Search / Keyboard Shortcuts 维护成本 > 价值

M4-7.1 的目标是**功能范围裁剪**：清理无用入口、隐藏低价值功能、收敛 feature flags，为核心主线和未来 Agent 铺路。不是大重构，不碰状态边界（那是 M4-7.2）。

---

## 2. What Was Kept

### 核心主线功能（全部保留）

| 功能 | 说明 |
|------|------|
| CSV/Excel Upload | 核心主线 Step 1 |
| Table List / Preview | 核心主线 Step 2-3 |
| Data Quality | 核心主线 Step 3 |
| Natural Language Query | 核心主线 Step 4-5 |
| AI SQL Generation | 核心主线 Step 5 |
| Expert SQL | 核心主线 Step 6 |
| AI Explanation / Summary | 核心主线 Step 8 |
| Query History | 核心主线 Step 9 |
| Export (CSV/JSON/Excel) | 核心主线 |
| Settings / i18n / Theme | 基础体验 |
| `/query` redirect page | 书签兼容，轻量 redirect 到 `/analyze` |

### Agent 未来依赖（后端能力全部保留）

| 能力 | 保留形式 | Agent 用途 |
|------|---------|-----------|
| list tables | API 保留 | list_tables tool |
| inspect schema | API 保留 | inspect_schema tool |
| preview table | API 保留 | preview tool |
| run readonly SQL | API + safety 保留 | run_sql tool |
| data quality | API 保留 | data_quality tool |
| AI SQL generation | API 保留 | ai_generate_sql tool |
| AI explanation | API 保留 | ai_explain tool |
| query history | API 保留 | history tool |
| export | API 保留 | export tool |
| SQL safety validator | 服务保留 | SQL 校验 tool |
| guardrails | 服务保留 | Agent 安全机制 |
| trace | 服务保留 | Agent 追踪基础 |
| token budget | 服务保留 | Agent 资源控制 |
| scheduler worker | 代码保留，启动禁用 | 定时任务能力 |

---

## 3. What Was Hidden

| 入口/功能 | 隐藏方式 | 原因 |
|----------|---------|------|
| Charts / Chart Suggestions | feature flag `showChartsMode: false` | 不服务核心主线 |
| AI Anomalies Mode | feature flag `showAnomaliesMode: false` | 不服务核心主线 |
| AI Full-Analysis Mode | feature flag `showFullAnalysisMode: false` | 不服务核心主线 |
| Templates | feature flag `showTemplates: false` | 半成品，无 UI 入口 |
| Scheduler | feature flag `showSchedule: false` + worker 启动禁用 | 半成品，后台线程浪费资源 |
| Diff / Compare | feature flag `showDiffCompare: false` | 半成品 |
| Timeline | feature flag `showTimeline: false` | 半成品 |
| Quick SQL Panel | feature flag `showQuickSqlPanel: false` | 半成品，SQL Workspace 已有完整功能 |
| Save-as-Template | feature flag `showSaveAsTemplate: false` | 半成品 |

---

## 4. What Was Deleted

### 前端文件删除

| 文件 | 原因 | 风险 |
|------|------|------|
| `frontend-react/src/app/performance/page.tsx` | 实验页面，浏览器性能指标面板，非产品功能 | Low — 无导航入口，无外部引用 |
| `frontend-react/src/app/virtual-table/page.tsx` | 实验页面，虚拟表格 demo，非产品功能 | Low — 无导航入口，无外部引用 |
| `frontend-react/src/components/VirtualDataTable.tsx` | 仅被 virtual-table 页面引用 | Low — 随页面一起删除 |
| `frontend-react/src/components/ui/command-palette.tsx` | Command Palette 组件，维护成本 > 价值 | Medium — 需同步清理 app-shell |
| `frontend-react/src/components/ui/global-search.tsx` | Global Search 组件，维护成本 > 价值 | Medium — 需同步清理 app-shell |
| `frontend-react/src/components/ui/keyboard-shortcuts-modal.tsx` | Keyboard Shortcuts Modal，维护成本 > 价值 | Medium — 需同步清理 app-shell |
| `frontend-react/src/hooks/use-keyboard-shortcuts.ts` | 键盘快捷键 hook，随 modal 一起删除 | Medium — 需同步清理 app-shell |

### 代码修改

| 文件 | 改动 |
|------|------|
| `frontend-react/src/layout/app-shell.tsx` | 移除 CommandPalette / GlobalSearch / KeyboardShortcutsModal 导入和使用；移除 useKeyboardShortcuts / shortcutsList；简化顶栏为仅保留主题切换和语言切换 |
| `backend/main.py` | 注释掉 scheduler worker 自动启动/停止代码（保留代码供未来启用） |
| `frontend-react/src/config/features.ts` | 重新分类 feature flags 为 core / internal / experimental / deprecated 四类 |

---

## 5. What Was Kept for Agent

以下能力在后端完整保留，M5 Agent 可直接使用：

| 能力 | 后端位置 | Agent Tool |
|------|---------|-----------|
| list tables | `GET /api/tables` | `list_tables` |
| inspect schema | `GET /api/tables/{name}/schema` | `inspect_schema` |
| preview table | `GET /api/tables/{name}/data` | `preview_table` |
| run readonly SQL | `POST /api/query` + `sql_validator.py` | `run_sql` |
| data quality | `GET /api/quality/{name}` | `data_quality` |
| table profile | `GET /api/analyze/{name}/profile` | `table_profile` |
| AI SQL generation | `POST /api/ai/query` | `ai_generate_sql` |
| AI explanation | `POST /api/ai/explain/stream` | `ai_explain` |
| autonomous analysis | `POST /api/ai/analyze-multi/stream` | `autonomous_analysis` |
| query history | `GET /api/query/history` | `query_history` |
| export | `POST /api/query/export` | `export` |
| SQL safety | `services/sql_validator.py` | `sql_safety` |
| guardrails | `services/guardrails.py` | 复用 guardrail 逻辑 |
| trace | `services/trace.py` | 扩展为 agent trace |
| token budget | `runtime/token_budget.py` | 复用 token budget |
| scheduler worker | `runtime/scheduler_worker.py` | 代码保留，启动已禁用 |

---

## 6. Feature Flag Cleanup

### 分类前（M4-7 审计时）

12 个 flag，全部平铺，11 个 false，无语义区分。

### 分类后（M4-7.1）

| Flag | Value | Category | Reason |
|------|-------|----------|--------|
| `showAutonomousMode` | `true` | **core** | 核心 AI 分析模式，确认稳定后移除 flag |
| `showAiButtonsInSqlWorkspace` | `false` | **internal** | M4-6.0.1 产品决策，保持 hidden |
| `showAiSqlInputInWorkspace` | `false` | **internal** | M4-6.0.1 产品决策，保持 hidden |
| `showChartsMode` | `false` | **experimental** | 不服务核心主线，可能删除 |
| `showAnomaliesMode` | `false` | **experimental** | 不服务核心主线，可能删除 |
| `showFullAnalysisMode` | `false` | **experimental** | 不服务核心主线，可能删除 |
| `showQuickSqlPanel` | `false` | **deprecated** | 半成品，SQL Workspace 已有完整功能 |
| `showTemplates` | `false` | **deprecated** | 半成品，无 UI 入口 |
| `showSchedule` | `false` | **deprecated** | 半成品，worker 已禁用 |
| `showDiffCompare` | `false` | **deprecated** | 半成品 |
| `showTimeline` | `false` | **deprecated** | 半成品 |
| `showSaveAsTemplate` | `false` | **deprecated** | 半成品 |

### 分类规则

- **core** — 产品核心功能，flag 是临时的，稳定后移除
- **internal** — 产品决策，有意隐藏，不对外部用户开放
- **experimental** — 未就绪，可能升级或删除
- **deprecated** — 计划删除，不应继续投入

---

## 7. Validation Results

| 检查项 | 结果 |
|--------|------|
| `npx tsc --noEmit` | ✅ 通过（清理 .next 缓存后） |
| `npm run build` | ✅ 通过，9 路由生成 |
| `python -c "from backend.main import app"` | ✅ 通过 |
| `pytest tests/ -x -q --ignore=tests/ai` | ✅ 449 passed |
| 侧边栏 | ✅ 仅 Home / Data / Analyze / History / Settings |
| `/performance` 路由 | ✅ 已删除，404 |
| `/virtual-table` 路由 | ✅ 已删除，404 |
| `/query` 路由 | ✅ 保留为 redirect 到 `/analyze` |
| 顶栏 | ✅ 仅保留主题切换 + 语言切换 |
| Scheduler worker | ✅ 不再自动启动 |

### Build Output

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    3.38 kB         125 kB
├ ○ /_not-found                            128 B         103 kB
├ ○ /analyze                             1.82 kB         104 kB
├ ƒ /analyze/[runId]                     5.29 kB         120 kB
├ ○ /data                                 432 kB         567 kB
├ ○ /history                             4.47 kB         118 kB
├ ○ /query                                1.4 kB         106 kB
└ ○ /settings                            2.52 kB         120 kB
```

---

## 8. Remaining Risks

| 风险 | 说明 | 后续处理 |
|------|------|---------|
| `activeTable` 状态分散 | 表名在 data-store / investigation-store / AI request 中多处存储 | M4-7.2 State Boundary Cleanup |
| AI output contract 不统一 | explain/insights/charts/anomalies/autonomous 各自返回不同结构 | M4-7.2 或更晚 |
| History 分散在多个 store | SQL 历史、分析历史、保存查询各自独立 | M4-7.2 |
| deprecated flags 代码仍在 | feature flag false 的功能代码仍被 import | 后续分支逐个清理 |
| i18n 死字符串 | perf.* / shortcut.* 等 i18n key 不再有对应 UI | 低优先级，不影响功能 |
| `VirtualDataTable.tsx` 已删除 | 若未来需要虚拟表格能力需重新实现 | 可接受 |

---

## 9. Next Step

**推荐：M4-7.2 State Boundary Cleanup**

目标：
- `activeTable` 只有一个来源（data-store）
- AI request 始终从 data-store 获取当前表
- SQL history 和 analysis history 有统一接口
- 状态变更不影响现有功能行为

不推荐直接进入 M5 Agent，因为状态边界问题会影响 Agent 的工具调用可靠性。

---

## Appendix: Build Route Comparison

### Before (M4-7 audit)

```
/                    — Home
/analyze             — Analysis Workspace
/analyze/[runId]     — Run Detail
/data                — Data Management
/history             — History
/performance         — Performance (experimental, no nav entry)
/query               — Query redirect
/settings            — Settings
/virtual-table       — Virtual Table (experimental, no nav entry)
```

### After (M4-7.1)

```
/                    — Home
/analyze             — Analysis Workspace
/analyze/[runId]     — Run Detail
/data                — Data Management
/history             — History
/query               — Query redirect (kept for bookmark compat)
/settings            — Settings
```

Removed: `/performance`, `/virtual-table`
