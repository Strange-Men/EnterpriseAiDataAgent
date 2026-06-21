# M4 Product & Frontend Refactor Plan

> M4-0 设计审计报告 — 2026-06-21
> 本轮只做审计、规划、架构设计，不直接重构代码。

---

## 1. Why Refactor

项目已完成 M1/M2/M3 救援，后端和非 AI 主链路基本稳定，线上 Vercel + Render 部署已通。但前端存在以下核心问题：

- **功能堆积严重**：历史迭代中不断加功能入口，没有做过产品减法，导致页面和导航混乱
- **主链路不明显**：新用户打开页面不知道该干什么，Demo 观众 3 分钟看不懂主线
- **新手教程失败**：onboarding 系统与真实页面结构强耦合，跳转混乱，无法稳定教人跑通 demo
- **线上工程边界暴露**：Vercel 部署时 API routing 出现过问题，说明前端对后端的依赖边界不够清晰
- **大组件 / 大 store 积累**：`sql-workspace-panel.tsx`（643 行）、`analysis-workspace-panel.tsx`（535 行）、`analysis-store.ts`（459 行）等文件职责过重

M4 的目标不是新增功能，而是：

1. 产品减法 — 砍掉干扰主线的入口
2. 前端秩序恢复 — 统一架构、拆大组件、统一 API client
3. 重做 Guided Demo — 让新用户 30 秒知道怎么开始，3 分钟跑通主线

---

## 2. Current Frontend Problems

### 2.1 功能入口过多

当前侧边栏有 6 个入口：Home / Data / Query / Analyze / History / Settings。加上 `/performance` 和 `/virtual-table` 两个隐藏页面，实际有 8 个可访问页面。其中 History 和 Settings 功能单薄，占用导航位但价值低。

### 2.2 主链路不明显

核心用户路径是：上传数据 → 查看表 → 执行 SQL → AI 问数 → 生成报告。但当前页面结构把 SQL 和 AI 分成两个独立页面，用户需要来回跳转。Home 页面虽然有快捷入口，但只是三个卡片链接，没有引导用户走完整流程。

### 2.3 Onboarding 与真实页面耦合混乱

- `onboarding-wizard.tsx`（138 行）通过 `router.push(step.route)` 跳转到不同页面
- `feature-tooltip.tsx`（103 行）在每个页面内通过 `data-onboarding` 属性标记引导目标
- 5 个步骤分布在 3 个不同页面（`/data`、`/query`、`/analyze`）
- 跳转后用户迷失，无法稳定完成引导流程
- `onboarding-store.ts` 持久化到 localStorage，重置逻辑复杂

### 2.4 API Client 边界不清晰

- `http-client.ts` 有 `API_BASE`（deprecated）和 `DIRECT_BACKEND` 两个概念
- `streams.ts` 直接用 `DIRECT_BACKEND` 拼接 URL，不走 `apiUrl()`
- 历史上依赖 Next.js rewrites 做代理，线上部署时暴露问题
- 已修复但说明架构边界需要继续巩固

### 2.5 Panel / Component 过大

| 文件 | 行数 | 问题 |
|------|------|------|
| `panels/sql-workspace-panel.tsx` | 643 | 职责过多：tabs、执行、explain、AI SQL、保存、导出全在一个文件 |
| `panels/analysis-workspace-panel.tsx` | 535 | 历史、模板、比较、调度、报告、时间线全在一个文件 |
| `panels/ai-analysis-modes.ts` | 448 | 6 种分析模式的配置和流式处理逻辑 |
| `components/VirtualDataTable.tsx` | 571 | 独立 demo 组件，与主产品无关 |
| `components/investigation/investigation-workspace.tsx` | 263 | AI 分析主入口，状态管理复杂 |
| `components/ai/apply-template-dialog.tsx` | 237 | 模板应用对话框，逻辑过重 |
| `components/ai/report-dialog.tsx` | 217 | 报告生成对话框 |

### 2.6 Store 过复杂

| Store | 行数 | 问题 |
|-------|------|------|
| `analysis-store.ts` | 459 | 分析运行历史、比较、进化链、导入导出、压缩全在一个 store |
| `investigation-store.ts` | 409 | AI 对话上下文、生命周期、知识提取、钻取链全在一个 store |
| `sql-editor-store.ts` | 311 | tabs、执行、分页、历史面板全在一个 store |
| `schedule-store.ts` | 174 | 调度任务 UI 状态 |

### 2.7 实验功能暴露在主导航

- `/performance` 页面：性能基准测试，开发者工具，不应暴露给用户
- `/virtual-table` 页面：50K 行虚拟表格 demo，纯实验性质
- Schedule 功能：在 analysis-workspace-panel 内作为子面板暴露，但不是核心链路
- Templates / Bundle / Diff：高级功能但直接暴露在 analysis panel 的 header 按钮中

### 2.8 中英文 / i18n 历史遗留

- 部分硬编码英文字符串（如 `performance/page.tsx` 中的 "Summary"、"Back"）
- i18n key 命名不统一（有的用 `nav.xxx`，有的用 `cmd.xxx`）
- 但整体 i18n 架构已稳定，不是本轮重点

### 2.9 缺少 Demo-First 的用户路径

- 没有 `demo_sales` 数据集的自动加载机制
- 没有"一键跑通 demo"的流程
- 新用户需要自己摸索上传、查询、AI 分析的完整路径

---

## 3. New Product Scope

### 核心定位

```
EnterpriseAiDataAgent｜面向 CSV/Excel 的 AI 数据分析工作台
```

### 核心用户路径

1. **上传** CSV / Excel 文件
2. **浏览** 数据表结构和字段
3. **查询** 执行 SQL 查询
4. **质量** 查看数据质量报告
5. **问数** 用自然语言提问，AI 生成 SQL 并执行
6. **报告** 生成解释 / 洞察 / Markdown 分析报告

### 明确不做

| 不做 | 原因 |
|------|------|
| 完整 BI 平台 | 定位是轻量分析工具，不是 Metabase / Superset |
| 企业级权限 | 单用户工作台，不做 RBAC / 多租户 |
| 复杂 Dashboard | 不做可拖拽仪表盘，报告用 Markdown 即可 |
| 多数据源连接 | 只做文件上传（CSV/Excel），不做数据库连接 |
| 大而全 Agent 平台 | 不做 LangGraph / Multi-Agent / RAG |
| 实时数据同步 | 一次性分析，不做流式数据管道 |
| 协作功能 | 单用户，不做多人协作 / 分享 |

---

## 4. Keep / Hide / Delete / Rebuild List

### 功能决策总表

| Feature | Current State | Decision | Reason |
|---------|--------------|----------|--------|
| File Upload (CSV/Excel) | `/data` 页面左侧面板 | **Keep** | 核心链路第一步 |
| Table Management | `/data` 页面左侧面板 | **Keep** | 核心链路：选择和管理数据表 |
| Data Preview | `/data` 页面主区域 | **Keep** | 核心链路：查看数据内容 |
| Data Quality Report | `/data` 页面内嵌 | **Keep** | 核心链路：查看数据质量 |
| SQL Workspace | `/query` 页面，643 行 panel | **Keep** | 核心链路：执行 SQL 查询 |
| Query History | `/history` 页面 | **Keep** | 有用，但入口可降级 |
| Export (CSV/JSON/Excel) | SQL Workspace 内按钮 | **Keep** | 有用，保留 |
| AI NL→SQL | SQL Workspace 内 AI 按钮 | **Keep** | 核心链路：自然语言生成 SQL |
| AI Explain / Insights | SQL Workspace 内 AI 按钮 | **Keep** | 核心链路：AI 解释查询结果 |
| AI Analysis (autonomous) | `/analyze` 页面 Investigation Workspace | **Keep** | 核心链路：AI 自主分析 |
| AI Report Generation | analysis-workspace-panel 内 | **Keep** | 核心链路：生成 Markdown 报告 |
| Anomaly Detection | SQL Workspace 内按钮 | **Keep** | 有价值，保留 |
| Settings (language/theme) | `/settings` 页面 | **Keep** | 基础功能 |
| Command Palette | 全局 overlay | **Keep** | 提升效率，保留 |
| Global Search | 全局 overlay | **Keep** | 提升效率，保留 |
| Keyboard Shortcuts | 全局 | **Keep** | 提升效率，保留 |
| Status Panel | `/data` 页面左侧面板 | **Keep** | 显示系统状态，有用 |
| Query Explain (EXPLAIN) | SQL Workspace 内按钮 | **Keep** | SQL 调试有用 |
| Saved Queries | SQL Workspace 内面板 | **Keep** | 有用，保留 |
| Analysis History | analysis-workspace-panel 内 | **Keep** | 核心链路的一部分 |
| Run Detail (`/analyze/[runId]`) | 独立页面 | **Keep** | 分析结果详情页 |
| Suggested Questions | AI 分析后显示 | **Keep** | 引导用户深入分析 |
| Follow-up Input | AI 分析后显示 | **Keep** | 多轮对话分析 |
| Drill-down Chain | investigation 组件 | **Keep** | 分析深度探索 |
| Streaming Output | investigation 组件 | **Keep** | 实时显示 AI 分析过程 |
| Trace Timeline | AI 分析结果内 | **Keep** | 调试和透明度 |
| Evaluation | AI 分析结果内 | **Keep** | 质量评估 |
| Context Panel | `/analyze` 左侧面板 | **Keep** | 提供表和列上下文 |
| Templates (Save/Apply) | analysis-workspace-panel 内 | **Hide** | 高级功能，隐藏到菜单 |
| Schedule | analysis-workspace-panel 内 | **Hide** | 高级功能，隐藏到菜单 |
| Diff / Compare | analysis-workspace-panel 内 | **Hide** | 高级功能，隐藏到菜单 |
| Bundle Export/Import | API 层 | **Hide** | 高级功能，不暴露入口 |
| Timeline Evolution | analysis-workspace-panel 内 | **Hide** | 高级功能，隐藏到菜单 |
| Run Notes | analysis-workspace-panel 内 | **Hide** | 高级功能 |
| Duplicate Run | analysis-workspace-panel 内 | **Hide** | 高级功能 |
| Virtual Table Page | `/virtual-table` | **Delete Candidate** | 纯实验 demo，与主产品无关 |
| Performance Page | `/performance` | **Delete Candidate** | 开发者工具，不应暴露 |
| Onboarding Wizard | 全局 overlay + 5 步跳转 | **Rebuild** | 重做为 Guided Demo Mode |
| Feature Tooltip | 每个页面内嵌 | **Rebuild** | 重做为 Guided Demo Mode |
| Workflow Banner | sql-workspace 内 | **Hide** | 旧 workflow 残留，隐藏 |
| AI Mode Selector | investigation 内 | **Keep** | AI 分析模式选择 |
| Streaming Indicator | investigation 内 | **Keep** | 流式状态指示 |
| Monaco SQL Editor | 组件 | **Keep** | 核心编辑器 |
| DataTable | 组件 | **Keep** | 核心数据展示 |
| AiChart | 组件 | **Keep** | 图表展示 |
| Empty State | 组件 | **Keep** | 空状态提示 |
| Error Boundary | 组件 | **Keep** | 错误处理 |

### 决策统计

- **Keep**: 37 个功能
- **Hide**: 8 个功能（不删代码，只隐藏入口）
- **Delete Candidate**: 2 个功能（performance / virtual-table 页面）
- **Rebuild**: 2 个功能（onboarding 相关）
- **Experimental**: 0（归入 Hide）

---

## 5. New Information Architecture

### 方案 A：6 页收敛（推荐）

```text
Home        — 欢迎 + 快速入口 + 系统状态 + 最近活动
Data        — 上传 / 表管理 / 数据预览 / 质量报告
SQL Workspace — SQL 编辑器 / 执行 / 结果 / AI SQL
AI Analysis — AI 自主分析 / 流式输出 / 分析历史
History     — 查询历史 / 搜索 / 筛选
Settings    — 语言 / 主题 / 版本
```

### 方案 B：4 页激进合并

```text
Home            — 欢迎 + 快速入口 + 系统状态
Data Workspace  — 上传 + 表管理 + 数据预览 + 质量 + SQL 编辑器
AI Analysis     — AI 自主分析 + 流式输出 + 分析历史 + 报告
Settings        — 语言 / 主题 / 版本
```

### 方案对比

| 方案 | 页面数 | 优点 | 缺点 | 推荐 |
|------|--------|------|------|------|
| A | 6 | 改动小，与现有代码结构匹配，风险低 | 页面仍然偏多，SQL 和 AI 分离 | **先用 A** |
| B | 4 | 页面更少，用户路径更紧凑 | 改动大，需要合并 SQL 和 Data 页面，风险高 | 后续考虑 |

### 推荐决策

**先用方案 A 做轻量收敛**，原因：

1. 当前代码已经有 Data / SQL / AI / History / Settings 的页面结构，直接砍到 4 页需要大量组件迁移
2. 方案 A 只需要隐藏实验入口、整理导航、重做 onboarding，不改页面路由
3. 方案 A 可以在 M4-1 阶段快速完成，验证效果后再决定是否进一步合并
4. 方案 B 可以作为 M5 的目标，但不急于本轮

### 方案 A 的具体变更

| 变更 | 内容 |
|------|------|
| Home 页面 | 重写为 demo-first 欢迎页，突出"上传数据 → 开始分析"主线 |
| Data 页面 | 保持现有结构，隐藏 FeatureTooltip |
| SQL Workspace | 保持现有结构，隐藏 WorkflowBanner，精简 AI 按钮区 |
| AI Analysis | 保持现有结构，隐藏 Templates/Schedule/Diff/Compare 按钮到"高级"下拉菜单 |
| History | 保持现有结构 |
| Settings | 保持现有结构 |
| 侧边栏 | 保持 6 个入口不变，但隐藏 `/performance` 和 `/virtual-table` 的直接访问 |

---

## 6. New Guided Demo Design

### 设计理念

当前 onboarding 的问题：

- 不是"教程"，而是"功能提示"
- 跳转混乱，用户迷失
- 不能稳定教人跑通完整流程

**重做为 Guided Demo Mode**：目标不是"产品教程"，而是"带用户跑完一次 demo"。

### 形式选择

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| Overlay 弹窗 | 视觉突出 | 遮挡真实界面，用户焦虑 | 不推荐 |
| 右侧 Stepper | 不遮挡主内容，进度清晰 | 占用空间 | **推荐** |
| 独立 `/demo` 页面 | 隔离干净 | 与真实产品脱节 | 不推荐 |
| 顶部 Checklist | 不遮挡，简洁 | 引导力弱 | 备选 |

**推荐：右侧 Stepper**

- 固定在页面右侧，宽度 280px
- 显示 7 个步骤的进度
- 每一步有明确的操作指引和验收条件
- 完成后自动折叠为一个小图标
- 不跳转页面，用户在真实页面中完成操作

### Guided Demo 流程

| Step | User Action | System Check | Success State |
|------|-------------|--------------|---------------|
| 1. 欢迎 | 阅读项目介绍 | — | 点击"开始 Demo" |
| 2. 加载数据 | 点击"使用示例数据"或上传文件 | `tables.length > 0` | 显示已加载的表名 |
| 3. 查看表结构 | 选择一张表并预览 | `currentData !== null` | 显示数据预览表格 |
| 4. 执行 SQL | 点击"运行示例 SQL"或手动输入 | `queryResult?.status === "success"` | 显示查询结果 |
| 5. 查看质量 | 点击"查看数据质量" | `qualityReport !== null` | 显示质量分数 |
| 6. AI 问数 | 输入自然语言问题 | AI 返回 SQL 并执行成功 | 显示 AI 分析结果 |
| 7. 生成报告 | 点击"生成分析报告" | 报告 Markdown 生成成功 | 显示报告内容 |
| 完成 | 查看下一步建议 | — | Stepper 折叠为图标 |

### 实现方案

```text
src/features/guided-demo/
  components/
    guided-demo-stepper.tsx    — 右侧 Stepper 主组件
    guided-demo-step.tsx       — 单个步骤组件
    guided-demo-trigger.tsx    — 展开/折叠触发器
  hooks/
    use-guided-demo.ts         — 步骤状态管理
  store.ts                     — 持久化当前步骤和完成状态
  config.ts                    — 步骤配置（id、验收条件、文案）
```

### 验收条件实现

每一步的验收条件通过检查现有 store 状态判断：

- Step 2: `useDataStore.getState().tables.length > 0`
- Step 3: `useDataStore.getState().currentData !== null`
- Step 4: `useSqlEditorStore.getState().queryResult?.status === "success"`
- Step 5: `useDataStore.getState().qualityReport !== null`
- Step 6: `useAnalysisStore.getState().runs.some(r => r.status === "success")`
- Step 7: 检查报告是否生成（通过 analysis run 的 sections 判断）

### 与现有 Onboarding 的关系

- 删除 `onboarding-wizard.tsx` 和 `feature-tooltip.tsx`
- 删除 `onboarding-store.ts`
- 删除所有页面中的 `FeatureTooltip` 和 `data-onboarding` 属性
- 用 `guided-demo` feature 完全替代

---

## 7. Target Frontend Architecture

### 目标目录结构

```text
frontend-react/src/
  app/
    page.tsx                          — Home（欢迎 + 快速入口）
    data/page.tsx                     — 数据管理
    query/page.tsx                    — SQL 工作区
    analyze/page.tsx                  — AI 分析
    analyze/[runId]/page.tsx          — 分析详情
    history/page.tsx                  — 查询历史
    settings/page.tsx                 — 设置
    layout.tsx                        — Root layout
    error.tsx / not-found.tsx         — 全局错误页

  features/                           — 业务模块（逐步迁移）
    data/
      components/
        file-upload-panel.tsx
        table-management-panel.tsx
        data-preview-panel.tsx
        status-panel.tsx
      hooks/
        use-data-upload.ts
      store.ts                        — 从 data-store.ts 迁移
    sql/
      components/
        sql-workspace-panel.tsx
        query-tabs-bar.tsx
        ai-sql-input.tsx
        query-stats-bar.tsx
        monaco-sql-editor.tsx
      hooks/
        use-sql-execution.ts
      store.ts                        — 从 sql-editor-store.ts 迁移
    analysis/
      components/
        investigation-workspace.tsx
        streaming-output.tsx
        run-header.tsx
        run-sections.tsx
        ai-analysis-panel.tsx
        analysis-workspace-panel.tsx
      hooks/
        use-analysis-stream.ts
      store.ts                        — 从 analysis-store.ts + investigation-store.ts 迁移
    guided-demo/
      components/
        guided-demo-stepper.tsx
        guided-demo-step.tsx
        guided-demo-trigger.tsx
      hooks/
        use-guided-demo.ts
      store.ts
      config.ts

  shared/                             — 通用能力
    api/
      http-client.ts                  — apiUrl + apiFetch（统一入口）
      streams.ts                      — SSE 流式处理
      errors.ts                       — 统一错误类型和处理
    ui/
      button.tsx
      card.tsx
      dialog.tsx
      data-table.tsx
      empty-state.tsx
      skeleton.tsx
      error-boundary.tsx
      command-palette.tsx
      global-search.tsx
      keyboard-shortcuts-modal.tsx
      ai-chart.tsx
      tab-group.tsx
      tooltip.tsx
      dropdown-menu.tsx
      input.tsx
      status-badge.tsx
    hooks/
      use-keyboard-shortcuts.ts
      use-language.ts
      use-theme.ts
      use-server-state.ts
      use-system-status.ts
      use-tables.ts
    types/
      index.ts

  stores/                             — 全局 store（逐步合并到 features）
    workspace-store.ts                — 布局 / 语言 / 面板状态
    sql-history-store.ts              — 查询历史
    saved-queries-store.ts            — 保存的查询
    template-store.ts                 — 分析模板（隐藏功能）
    schedule-store.ts                 — 调度任务（隐藏功能）
    onboarding-store.ts               — 删除，替换为 guided-demo store

  layout/
    app-shell.tsx
    sidebar.tsx

  services/
    logger.ts
```

### 迁移原则

1. **不要一次性重写**：逐步迁移，每个 M4 阶段只动一部分
2. **先迁移小文件**：hooks、小组件先迁，大 panel 后迁
3. **保持 import 路径兼容**：迁移时在旧路径留 re-export，避免大面积修改
4. **store 迁移要谨慎**：store 有持久化，迁移 key 会导致用户数据丢失

### API Client 统一方案

当前状态：
- `http-client.ts` 导出 `apiUrl()` 和 `apiFetch()` — 这是正确的
- `streams.ts` 直接用 `DIRECT_BACKEND` 拼接 URL — 需要统一
- `services/api.ts` 是 barrel export — 保持

目标：
- 所有 API 请求都通过 `apiUrl()` 构建 URL
- `streams.ts` 改用 `apiUrl()` 替代直接拼接
- 统一错误处理：网络错误、超时、非 JSON 响应都有统一的错误类型

### Zustand Store 拆分方案

| 当前 Store | 目标 | 策略 |
|-----------|------|------|
| `data-store.ts` (86 行) | 保持 | 小 store，不需要拆 |
| `sql-editor-store.ts` (311 行) | 拆分 | tabs + execution + pagination 分离 |
| `analysis-store.ts` (459 行) | 拆分 | runs + comparison + evolution 分离 |
| `investigation-store.ts` (409 行) | 拆分 | lifecycle + conversation + knowledge 分离 |
| `sql-history-store.ts` (131 行) | 保持 | 小 store |
| `saved-queries-store.ts` (101 行) | 保持 | 小 store |
| `template-store.ts` (102 行) | 保持 | 隐藏功能 |
| `schedule-store.ts` (174 行) | 保持 | 隐藏功能 |
| `workspace-store.ts` (57 行) | 保持 | 小 store |
| `onboarding-store.ts` (68 行) | 删除 | 替换为 guided-demo store |

---

## 8. Risky Files

### 最危险文件表

| File | Risk | Why | Suggested Action |
|------|------|-----|------------------|
| `panels/sql-workspace-panel.tsx` (643 行) | **High** | 核心链路最大 panel，职责过多（tabs、执行、explain、AI SQL、保存、导出），修改任何部分都可能影响主链路 | M4-4 阶段拆分，先加测试 |
| `panels/ai-analysis-panel.tsx` (446 行) | **High** | AI 分析面板，6 种模式的流式处理，状态管理复杂 | M4-4 阶段精简，隐藏高级按钮 |
| `stores/analysis-store.ts` (459 行) | **High** | 持久化 store，有 localStorage 迁移逻辑，拆分可能导致用户数据丢失 | M4-4 阶段拆分，保留迁移兼容 |
| `stores/investigation-store.ts` (409 行) | **High** | 持久化 store，有 legacy 迁移逻辑，AI 对话上下文核心 | M4-4 阶段拆分，保留迁移兼容 |
| `layout/app-shell.tsx` (192 行) | **Medium** | 全局布局，包含 onboarding、command palette、global search、keyboard shortcuts | M4-1 阶段移除 onboarding 集成 |
| `services/api/http-client.ts` (43 行) | **Low** | API client 核心，但行数少，逻辑清晰 | M4-3 阶段巩固，不改核心逻辑 |
| `services/api/streams.ts` (301 行) | **Medium** | SSE 流式处理，直接用 `DIRECT_BACKEND` 拼接 URL | M4-3 阶段统一为 `apiUrl()` |
| `components/VirtualDataTable.tsx` (571 行) | **Low** | 独立 demo 组件，与主产品无关，删除不影响主链路 | M4-1 阶段隐藏入口 |
| `components/onboarding/onboarding-wizard.tsx` (138 行) | **Medium** | onboarding 核心组件，删除需要同步清理所有页面的 FeatureTooltip | M4-2 阶段替换为 guided-demo |
| `components/onboarding/feature-tooltip.tsx` (103 行) | **Medium** | 每个页面内嵌的引导提示，删除需要清理 4 个页面文件 | M4-2 阶段替换为 guided-demo |
| `stores/onboarding-store.ts` (68 行) | **Medium** | 持久化 store，删除需要同步清理 localStorage | M4-2 阶段替换为 guided-demo store |
| `components/ui/command-palette.tsx` (211 行) | **Low** | 全局 overlay，逻辑清晰 | 保持不动 |
| `components/ui/global-search.tsx` (153 行) | **Low** | 全局 overlay，逻辑清晰 | 保持不动 |
| `panels/analysis-workspace-panel.tsx` (535 行) | **High** | 历史、模板、比较、调度、报告、时间线全在一个文件，按钮过多 | M4-1 阶段隐藏高级按钮到下拉菜单 |
| `components/investigation/investigation-workspace.tsx` (263 行) | **Medium** | AI 分析主入口，状态管理复杂 | M4-4 阶段精简 |
| `components/ai/apply-template-dialog.tsx` (237 行) | **Medium** | 模板应用对话框，逻辑过重 | M4-4 阶段精简 |
| `components/ai/report-dialog.tsx` (217 行) | **Medium** | 报告生成对话框 | M4-4 阶段精简 |

### 文件分类

#### 不应该动的文件（M4 期间）

| 文件 | 原因 |
|------|------|
| `services/api/http-client.ts` | API client 核心，行数少，逻辑清晰，只在 M4-3 做小调整 |
| `services/api/query.ts` | 查询 API，稳定 |
| `services/api/tables.ts` | 表 API，稳定 |
| `services/api/data.ts` | 数据 API，稳定 |
| `services/api/status.ts` | 状态 API，稳定 |
| `services/api/envelope.ts` | 响应封装，稳定 |
| `components/ui/button.tsx` | 基础 UI 组件 |
| `components/ui/card.tsx` | 基础 UI 组件 |
| `components/ui/dialog.tsx` | 基础 UI 组件 |
| `components/ui/skeleton.tsx` | 基础 UI 组件 |
| `components/ui/error-boundary.tsx` | 错误处理 |
| `components/ui/error-fallback.tsx` | 错误处理 |
| `components/client-providers.tsx` | 全局 Provider |
| `app/layout.tsx` | Root layout |
| `app/error.tsx` | 全局错误页 |
| `app/not-found.tsx` | 404 页 |

#### 可以安全动的文件

| 文件 | 阶段 | 操作 |
|------|------|------|
| `app/(shell)/page.tsx` | M4-1 | 重写 Home 页面 |
| `app/performance/page.tsx` | M4-1 | 隐藏入口或删除 |
| `app/virtual-table/page.tsx` | M4-1 | 隐藏入口或删除 |
| `layout/sidebar.tsx` | M4-1 | 整理导航 |
| `components/onboarding/*.tsx` | M4-2 | 替换为 guided-demo |
| `stores/onboarding-store.ts` | M4-2 | 替换为 guided-demo store |
| `panels/status-panel.tsx` | M4-4 | 小 panel，安全 |
| `panels/file-upload-panel.tsx` | M4-4 | 小 panel，安全 |
| `panels/table-management-panel.tsx` | M4-4 | 小 panel，安全 |
| `panels/data-preview-panel.tsx` | M4-4 | 小 panel，安全 |
| `panels/sql-history-panel.tsx` | M4-4 | 小 panel，安全 |
| `hooks/use-keyboard-shortcuts.ts` | M4-1 | 安全 |
| `hooks/use-language.ts` | M4-1 | 安全 |
| `hooks/use-theme.ts` | M4-1 | 安全 |

#### 必须先加测试再动的文件

| 文件 | 原因 |
|------|------|
| `panels/sql-workspace-panel.tsx` | 核心链路最大 panel，无测试覆盖 |
| `panels/ai-analysis-panel.tsx` | AI 分析面板，无测试覆盖 |
| `panels/analysis-workspace-panel.tsx` | 分析工作区面板，无测试覆盖 |
| `stores/analysis-store.ts` | 持久化 store，有 localStorage 迁移逻辑 |
| `stores/investigation-store.ts` | 持久化 store，有 legacy 迁移逻辑 |
| `stores/sql-editor-store.ts` | 持久化 store，有查询执行逻辑 |
| `layout/app-shell.tsx` | 全局布局，影响所有页面 |
| `components/investigation/investigation-workspace.tsx` | AI 分析主入口 |
| `services/api/streams.ts` | SSE 流式处理，复杂的状态机 |

---

## 9. M4 Execution Roadmap

### M4-1：产品减法

**目标**：隐藏实验入口，整理导航，不删除核心代码。

| 项目 | 内容 |
|------|------|
| **Goal** | 主导航只暴露核心功能，隐藏实验/高级入口 |
| **Allowed Files** | `layout/sidebar.tsx`, `app/(shell)/page.tsx`, `app/(shell)/layout.tsx`, `layout/app-shell.tsx` |
| **Forbidden Files** | 所有 store 文件, 所有 panel 文件, 所有 service 文件 |
| **Acceptance Criteria** | 1. 侧边栏只显示 Home/Data/Query/Analyze/History/Settings<br>2. `/performance` 和 `/virtual-table` 无直接入口<br>3. `analysis-workspace-panel` 的 Templates/Schedule/Diff/Compare 按钮移到"高级"下拉菜单<br>4. Home 页面重写为 demo-first 欢迎页<br>5. `npx next build` 通过 |
| **Rollback** | `git revert` 即可，只改了 4 个文件 |

**具体操作**：

1. `layout/sidebar.tsx`：不改，保持 6 个入口
2. `app/(shell)/page.tsx`：重写 Home 页面，突出"上传数据 → 开始分析"主线
3. `layout/app-shell.tsx`：移除 onboarding 集成（`OnboardingWizard` 和 `FeatureTooltip` 引用），保留 command palette / global search / keyboard shortcuts
4. `panels/analysis-workspace-panel.tsx`：将 Templates/Schedule/Diff/Compare 按钮移到"高级"下拉菜单（只改按钮位置，不改逻辑）
5. 隐藏 `/performance` 和 `/virtual-table` 的直接访问（不删除文件，只移除导航入口）

### M4-2：Guided Demo 重做

**目标**：重做新手教程为 Guided Demo Mode。

| 项目 | 内容 |
|------|------|
| **Goal** | 新用户 30 秒知道怎么开始，3 分钟跑通主线 |
| **Allowed Files** | `features/guided-demo/*`, `stores/onboarding-store.ts`（删除）, `components/onboarding/*`（删除）, `app/(shell)/data/page.tsx`（移除 FeatureTooltip）, `app/(shell)/query/page.tsx`（移除 FeatureTooltip）, `app/(shell)/analyze/page.tsx`（移除 FeatureTooltip）, `app/(shell)/analyze/[runId]/page.tsx`（移除 FeatureTooltip） |
| **Forbidden Files** | 所有 panel 核心逻辑, 所有 store 核心逻辑, 所有 service 文件 |
| **Acceptance Criteria** | 1. 新建 `features/guided-demo/` 目录<br>2. 右侧 Stepper 组件正常显示<br>3. 7 个步骤的验收条件都能正确判断<br>4. 所有页面的 `FeatureTooltip` 和 `data-onboarding` 属性已移除<br>5. `onboarding-wizard.tsx` 和 `feature-tooltip.tsx` 已删除<br>6. `onboarding-store.ts` 已删除<br>7. `npx next build` 通过 |
| **Rollback** | `git revert` 即可，onboarding 文件删除可从 git 恢复 |

**具体操作**：

1. 新建 `frontend-react/src/features/guided-demo/` 目录结构
2. 实现 `guided-demo-stepper.tsx`：右侧 Stepper 主组件
3. 实现 `guided-demo-step.tsx`：单个步骤组件
4. 实现 `guided-demo-trigger.tsx`：展开/折叠触发器
5. 实现 `use-guided-demo.ts`：步骤状态管理 hook
6. 实现 `store.ts`：持久化当前步骤和完成状态
7. 实现 `config.ts`：步骤配置（id、验收条件、文案）
8. 删除 `components/onboarding/onboarding-wizard.tsx`
9. 删除 `components/onboarding/feature-tooltip.tsx`
10. 删除 `stores/onboarding-store.ts`
11. 清理所有页面中的 `FeatureTooltip` 引用和 `data-onboarding` 属性
12. 在 `app-shell.tsx` 中集成 guided-demo-stepper

### M4-3：API Client 与错误处理统一

**目标**：继续巩固 apiUrl/apiFetch，统一错误显示和网络失败提示。

| 项目 | 内容 |
|------|------|
| **Goal** | 所有 API 请求走统一 apiUrl/apiFetch，错误处理统一 |
| **Allowed Files** | `services/api/streams.ts`, `services/api/http-client.ts`（小调整）, `components/ui/error-boundary.tsx`, `components/ui/error-fallback.tsx` |
| **Forbidden Files** | 所有 panel 文件, 所有 store 文件, 所有 page 文件 |
| **Acceptance Criteria** | 1. `streams.ts` 中所有 URL 构建都用 `apiUrl()` 替代直接拼接<br>2. 统一错误类型：网络错误、超时、非 JSON 响应<br>3. `npx next build` 通过<br>4. 后端 `uvicorn` 启动正常 |
| **Rollback** | `git revert` 即可，只改了 2-3 个文件 |

**具体操作**：

1. `services/api/streams.ts`：将所有 `${DIRECT_BACKEND}/api/...` 替换为 `apiUrl(...)`
2. `services/api/http-client.ts`：小调整，确保 `apiUrl()` 处理所有边界情况
3. 新建 `services/api/errors.ts`：统一错误类型（`NetworkError`、`TimeoutError`、`ApiError`）
4. 更新 `components/ui/error-boundary.tsx`：显示更友好的错误信息
5. 更新 `components/ui/error-fallback.tsx`：提供重试按钮

### M4-4：Data / SQL / AI 功能区整理

**目标**：整理三大功能区，减少跳转和状态混乱。

| 项目 | 内容 |
|------|------|
| **Goal** | Data / SQL / AI 三大区职责清晰，减少不必要的跳转 |
| **Allowed Files** | `panels/*.tsx`, `components/investigation/*.tsx`, `components/ai/*.tsx`, `components/sql-workspace/*.tsx`, `stores/*.ts`（拆分） |
| **Forbidden Files** | `services/api/*`, `app/layout.tsx`, `app/error.tsx`, `app/not-found.tsx` |
| **Acceptance Criteria** | 1. SQL Workspace 的 AI 按钮区精简（只保留核心 4 个：Generate SQL / Explain / Insights / Anomalies）<br>2. Analysis Workspace 的高级功能移到下拉菜单<br>3. `analysis-store.ts` 拆分出 `comparison-store.ts` 和 `evolution-store.ts`<br>4. `investigation-store.ts` 拆分出 `conversation-store.ts` 和 `knowledge-store.ts`<br>5. 所有现有功能仍然可用（只是入口位置变化）<br>6. `npx next build` 通过 |
| **Rollback** | `git revert` 即可，但需要验证 store 迁移兼容性 |

**具体操作**：

1. `panels/sql-workspace-panel.tsx`：
   - 精简 AI 按钮区，只保留核心 4 个
   - 移除 WorkflowBanner（旧 workflow 残留）
   - 将 Save/Clear/Export 按钮移到"更多"下拉菜单
2. `panels/analysis-workspace-panel.tsx`：
   - 将 Templates/Schedule/Diff/Compare 按钮移到"高级"下拉菜单（M4-1 已完成）
   - 精简 header 按钮数量
3. `stores/analysis-store.ts`：
   - 拆分出 `comparison-store.ts`（compareRuns、SectionDiff、MetricDelta）
   - 拆分出 `evolution-store.ts`（getEvolutionChain）
   - 保留 `analysis-store.ts` 的核心功能（runs、addRun、updateRun、deleteRun）
4. `stores/investigation-store.ts`：
   - 拆分出 `conversation-store.ts`（turns、compressedSummary、addUserTurn、addAssistantTurn）
   - 拆分出 `knowledge-store.ts`（keyFindings、investigationSummary、addKeyFinding）
   - 保留 `investigation-store.ts` 的核心功能（stage、activeTable、advance、reset）
5. 更新所有引用拆分 store 的组件

### M4-5：组件拆分

**目标**：拆大组件，只拆表现层，不改业务逻辑。

| 项目 | 内容 |
|------|------|
| **Goal** | 大组件拆分为小组件，提高可维护性 |
| **Allowed Files** | `panels/*.tsx`, `components/investigation/*.tsx`, `components/ai/*.tsx` |
| **Forbidden Files** | `stores/*`, `services/api/*`, `app/*`, `layout/*` |
| **Acceptance Criteria** | 1. `sql-workspace-panel.tsx` 从 643 行拆到 <300 行<br>2. `analysis-workspace-panel.tsx` 从 535 行拆到 <300 行<br>3. `investigation-workspace.tsx` 从 263 行拆到 <200 行<br>4. 所有拆分出的组件都在同一目录下<br>5. 不改业务逻辑，只拆表现层<br>6. `npx next build` 通过 |
| **Rollback** | `git revert` 即可，只改了表现层 |

**具体操作**：

1. `panels/sql-workspace-panel.tsx` 拆分：
   - `sql-toolbar.tsx`：执行、取消、explain、AI SQL、format、保存、导出按钮
   - `sql-ai-panel.tsx`：AI 分析面板（explain/insights/charts/anomalies）
   - `sql-save-dialog.tsx`：保存查询对话框
   - `sql-saved-panel.tsx`：已保存查询面板
2. `panels/analysis-workspace-panel.tsx` 拆分：
   - `analysis-header.tsx`：header 按钮区
   - `analysis-history-list.tsx`：历史列表
   - `analysis-run-detail.tsx`：运行详情
   - `analysis-templates-section.tsx`：模板区
   - `analysis-compare-section.tsx`：比较区
   - `analysis-schedule-section.tsx`：调度区
3. `components/investigation/investigation-workspace.tsx` 拆分：
   - `investigation-header.tsx`：header 区
   - `investigation-stream-area.tsx`：流式输出区
   - `investigation-result-area.tsx`：结果展示区

---

## 10. Definition of Done

M4 全部完成的标准：

### 产品层

- [ ] 新用户 30 秒知道怎么开始（Home 页面 demo-first 设计）
- [ ] Guided Demo Mode 能稳定带用户跑通主链路（7 步全部完成）
- [ ] 主导航只暴露核心功能（6 个入口）
- [ ] 实验功能不再干扰主线（Templates/Schedule/Diff/Compare 隐藏到下拉菜单）
- [ ] `/performance` 和 `/virtual-table` 无直接导航入口

### 工程层

- [ ] 所有 API 请求走统一 `apiUrl()`/`apiFetch()`
- [ ] `streams.ts` 不再直接拼接 `DIRECT_BACKEND`
- [ ] 统一错误类型和错误显示
- [ ] Data / SQL / AI 三大区职责清晰
- [ ] 大组件拆分完成（<300 行/文件）
- [ ] 大 store 拆分完成（<200 行/store）

### 质量层

- [ ] `cd frontend-react && npx next build` 通过
- [ ] `cd frontend-react && npx vitest run` 通过
- [ ] `cd frontend-react && npx tsc --noEmit` 通过
- [ ] 线上 Vercel + Render 主链路可用
- [ ] 没有新增 P0/P1 bug
- [ ] 没有引入新的大组件屎山（>500 行/文件）

### 文档层

- [ ] 本报告已提交
- [ ] README.md 在 M4 完成后更新（不在本轮）

---

## Appendix: File Size Audit Summary

### Panels（总计 3262 行）

| 文件 | 行数 | 状态 |
|------|------|------|
| `sql-workspace-panel.tsx` | 643 | 需拆分 |
| `analysis-workspace-panel.tsx` | 535 | 需拆分 |
| `ai-analysis-modes.ts` | 448 | 保持 |
| `ai-analysis-panel.tsx` | 446 | 保持 |
| `file-upload-panel.tsx` | 267 | 保持 |
| `table-management-panel.tsx` | 223 | 保持 |
| `sql-history-panel.tsx` | 203 | 保持 |
| `data-preview-panel.tsx` | 199 | 保持 |
| `diff-panel.tsx` | 181 | 隐藏 |
| `status-panel.tsx` | 117 | 保持 |

### Stores（总计 1898 行）

| 文件 | 行数 | 状态 |
|------|------|------|
| `analysis-store.ts` | 459 | 需拆分 |
| `investigation-store.ts` | 409 | 需拆分 |
| `sql-editor-store.ts` | 311 | 保持 |
| `schedule-store.ts` | 174 | 隐藏 |
| `sql-history-store.ts` | 131 | 保持 |
| `template-store.ts` | 102 | 隐藏 |
| `saved-queries-store.ts` | 101 | 保持 |
| `data-store.ts` | 86 | 保持 |
| `onboarding-store.ts` | 68 | 删除 |
| `workspace-store.ts` | 57 | 保持 |

### Investigation Components（总计 1555 行）

| 文件 | 行数 | 状态 |
|------|------|------|
| `investigation-workspace.tsx` | 263 | 需拆分 |
| `streaming-output.tsx` | 158 | 保持 |
| `run-header.tsx` | 144 | 保持 |
| `drill-down-chain.tsx` | 143 | 保持 |
| `tools-panel.tsx` | 132 | 保持 |
| `context-panel.tsx` | 127 | 保持 |
| `run-evaluation.tsx` | 117 | 保持 |
| `investigation-layout.tsx` | 102 | 保持 |
| `question-input.tsx` | 101 | 保持 |
| 其他 5 个文件 | 268 | 保持 |

### AI Components（总计 1324 行）

| 文件 | 行数 | 状态 |
|------|------|------|
| `apply-template-dialog.tsx` | 237 | 隐藏 |
| `report-dialog.tsx` | 217 | 保持 |
| `trace-timeline.tsx` | 149 | 保持 |
| `analysis-section.tsx` | 136 | 保持 |
| `analysis-header.tsx` | 134 | 保持 |
| `step-results.tsx` | 131 | 保持 |
| `save-template-dialog.tsx` | 117 | 隐藏 |
| `follow-up-input.tsx` | 114 | 保持 |
| 其他 3 个文件 | 89 | 保持 |

### Layout（总计 271 行）

| 文件 | 行数 | 状态 |
|------|------|------|
| `app-shell.tsx` | 192 | M4-1 移除 onboarding 集成 |
| `sidebar.tsx` | 79 | 保持 |

### API Services（总计 1080 行）

| 文件 | 行数 | 状态 |
|------|------|------|
| `ai.ts` | 497 | 保持 |
| `streams.ts` | 301 | M4-3 统一 URL 构建 |
| `query.ts` | 93 | 保持 |
| `tables.ts` | 53 | 保持 |
| `envelope.ts` | 49 | 保持 |
| `http-client.ts` | 43 | 小调整 |
| `status.ts` | 24 | 保持 |
| `data.ts` | 20 | 保持 |
