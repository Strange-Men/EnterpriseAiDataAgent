# M4-2 AI Workspace & Guided Demo Design

## 1. Current Problem

### 1.1 AI 功能入口重复

项目当前有两个独立的 AI 入口：

- **`/query` 页面** (`SqlWorkspacePanel`, 643 行)：包含 AI 生成 SQL 按钮 + 查询后出现的 Explain / Insights / Charts / Anomalies 按钮
- **`/analyze` 页面** (`InvestigationWorkspace`)：独立的 AI 调查工作区，支持 6 种分析模式（autonomous, full-analysis, insights, explain, charts, anomalies）

两个页面都能做 "AI 解释数据"，用户不知道该点哪里。

### 1.2 AI 分析页面过度复杂

`/analyze` 页面背后的实际组件链：

| 组件 | 行数 | 职责 |
|------|------|------|
| `investigation-workspace.tsx` | 263 | 主编排器 |
| `investigation-layout.tsx` | 102 | 三栏布局 |
| `question-input.tsx` | 101 | 问题输入 + 表选择 + 模式选择 |
| `ai-mode-selector.tsx` | 43 | 6 种模式单选 |
| `streaming-output.tsx` | 158 | 流式结果渲染 |
| `context-panel.tsx` | 127 | 左侧表上下文 |
| `tools-panel.tsx` | 132 | 右侧 Quick SQL + 最近运行 |
| `ai-analysis-modes.ts` | 448 | 6 种模式执行逻辑 |
| `ai-analysis-panel.tsx` | 446 | 分析结果面板 |

加上 `analysis-workspace-panel.tsx`（535 行）做历史管理、模板、调度、报告、对比——整个 AI 子系统超过 **3000 行**，分布在 15+ 个文件中。

**核心问题**：一个页面同时承载了聊天框、SQL 编辑器、调度器、模板中心、报告中心的功能。

### 1.3 Quick SQL 与 SQL 页面重复

`tools-panel.tsx` 中的 Quick SQL 只是 `SELECT * FROM "table" LIMIT 10` 的快捷方式，与 `/query` 页面的完整 SQL Workspace 功能重复。用户已经有专门的 SQL 页面，不需要在 AI 页面里再嵌一个简化版。

### 1.4 新手教程系统失效

审计发现：
- `OnboardingWizard` 组件**已实现但未挂载**到任何布局中
- 5 步教程跨越 3 个页面（`/data` → `/query` → `/data` → `/analyze` → `/analyze`）
- 用户在页面间跳转，容易迷失
- `FeatureTooltip` 已在 4 个页面中集成，但 wizard 不显示就永远不会触发
- 首页有静态的 4 步 "How to Get Started" 卡片，但与交互式教程系统完全断开

### 1.5 JSON 解析失败无降级

当 AI 返回非 JSON 格式时，前端直接报 `Failed to parse LLM response as JSON`，没有降级展示原始文本的机制。

---

## 2. Product Re-alignment

### 核心定位

```
EnterpriseAiDataAgent = 文件数据分析工作台 + AI 数据助手
```

### 核心流程（7 步闭环）

```
1. 上传 CSV / Excel
2. 选择数据表
3. 用自然语言提问
4. AI 生成 SQL
5. 用户看到 SQL 和结果
6. AI 解释结果
7. 生成洞察或 Markdown 报告
```

### 核心页面（5 个）

| 页面 | 路由 | 定位 |
|------|------|------|
| **Data** | `/data` | 上传、表预览、数据质量 |
| **AI 数据助手** | `/ai` | 自然语言问数 → SQL → 结果 → 解释 → 报告 |
| **SQL Workspace** | `/query` | 手写 SQL 的专家模式 |
| **History** | `/history` | 查询和分析历史 |
| **Settings** | `/settings` | 语言、主题、版本 |

### AI 页面新定位

当前 `/analyze` 改名为 **AI 数据助手**（`/ai`），只保留 3 个核心模式：

| 模式 | 功能 | 用户操作 |
|------|------|----------|
| **问数据** | 自然语言 → SQL → 执行 → 结果 | 输入问题，看 SQL 和表格 |
| **解释结果** | 对当前查询结果做 AI 解释 | 点击 "AI 解释" 按钮 |
| **生成报告** | 基于当前表/结果生成 Markdown | 点击 "生成报告" 按钮 |

**不再**同时显示聊天框、SQL 编辑器、调度器、模板中心、报告中心。

---

## 3. AI Feature Merge Decision

### 3.1 AI 入口地图

| Entry | Page / Component | Current Purpose | Problem | Decision |
|-------|-----------------|-----------------|---------|----------|
| `/query` AI 生成 SQL | `SqlWorkspacePanel` + `AiSqlInput` | NL→SQL | 与 `/analyze` 重复 | **Merge** → AI 数据助手 |
| `/query` Explain 按钮 | `SqlWorkspacePanel` line 395 | 查询后解释 | 散落在 SQL 页 | **Merge** → AI 数据助手 |
| `/query` Insights 按钮 | `SqlWorkspacePanel` line 401 | 查询后洞察 | 散落在 SQL 页 | **Merge** → AI 数据助手 |
| `/query` Charts 按钮 | `SqlWorkspacePanel` line 407 | 查询后图表 | 散落在 SQL 页 | **Hide** (experimental) |
| `/query` Anomalies 按钮 | `SqlWorkspacePanel` line 411 | 查询后异常检测 | 散落在 SQL 页 | **Hide** (experimental) |
| `/analyze` 主页 | `InvestigationWorkspace` | AI 调查 | 过度复杂 | **Rebuild** → AI 数据助手 |
| `/analyze` 6 模式选择器 | `ModeSelector` | 6 种分析模式 | 用户不理解区别 | **Simplify** → 3 模式 |
| `/analyze` Quick SQL | `ToolsPanel` | SQL 快捷执行 | 与 SQL 页重复 | **Hide** |
| `/analyze` 历史管理 | `AnalysisWorkspacePanel` | 保存/模板/调度/报告 | 过度堆积 | **Simplify** |
| `/analyze/[runId]` | 详情页 | 分析详情 | 有用 | **Keep** |
| `AIAnalysisPanel` | 独立面板 | 分析结果渲染 | 有用 | **Keep** |

### 3.2 功能去留总表

| Feature | Decision | Reason | M4 Phase |
|---------|----------|--------|----------|
| AI 生成 SQL（SQL 页） | **Merge** | 合并到 AI 数据助手的 "问数据" 模式 | M4-2 |
| AI explain（SQL 页按钮） | **Merge** | 合并到 AI 数据助手的 "解释结果" 模式 | M4-2 |
| AI insights（SQL 页按钮） | **Merge** | 合并到 AI 数据助手的 "解释结果" 模式 | M4-2 |
| AI chart suggest | **Hide** | 有用但非核心，标为 experimental | M4-2 |
| AI anomaly detection | **Hide** | 有用但非核心，标为 experimental | M4-2 |
| Quick SQL 右侧面板 | **Hide** | 与 SQL Workspace 重复 | M4-2 |
| 6 种分析模式 | **Simplify** | 用户不理解区别，收敛为 3 种 | M4-2 |
| Templates | **Experimental** | 有用但非核心流程 | M4-5 |
| Schedule | **Experimental** | 有用但非核心流程 | M4-5 |
| Diff / Compare | **Experimental** | 有用但非核心流程 | M4-5 |
| Report 生成 | **Keep** | 核心流程第 7 步 | M4-2 |
| Analysis 详情页 | **Keep** | 历史查看有用 | M4-2 |
| AI 评估 / Quality Gates | **Keep** | 质量保障有用 | M4-4 |
| Guided Onboarding | **Rebuild** | 系统失效，重做为 Guided Demo | M4-3 |
| Command Palette | **Experimental** | 高级功能 | M4-5 |
| Autonomous 分析模式 | **Hide** | 6 步自主分析过于复杂 | M4-2 |
| Follow-up Input | **Keep** | 多轮对话有用 | M4-2 |
| Suggested Questions | **Keep** | 引导用户继续探索 | M4-2 |
| Drill-down Chain | **Keep** | 深度分析有用 | M4-2 |
| Investigation Store | **Simplify** | 去掉过度压缩逻辑 | M4-4 |

---

## 4. New AI Data Assistant Design

### 4.1 页面布局（双栏）

```
┌─────────────────────────────────────────────────────────┐
│  AI 数据助手                        [问数据] [历史记录]   │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  数据上下文   │  问数据主区                               │
│              │                                          │
│  当前表:      │  ┌──────────────────────────────────┐    │
│  sales_data  │  │ 输入你的问题...                    │    │
│              │  │                                  │    │
│  字段:        │  │ [示例: 营收最高的品类是哪些？]     │    │
│  - product   │  └──────────────────────────────────┘    │
│  - revenue   │                                          │
│  - region    │  ┌─ 生成的 SQL ─────────────────────┐    │
│  - date      │  │ SELECT product, SUM(revenue)...  │    │
│              │  └──────────────────────────────────┘    │
│  行数: 1,234 │                                          │
│              │  ┌─ 查询结果 ──────────────────────┐     │
│  最近查询:    │  │ product  │ revenue │ rank      │     │
│  SELECT ...  │  │ Electronics│ 50000 │ 1         │     │
│  SELECT ...  │  │ Clothing  │ 32000 │ 2         │     │
│              │  └──────────────────────────────────┘    │
│              │                                          │
│              │  ┌─ AI 解释 ───────────────────────┐    │
│              │  │ 电子产品营收最高，占比 45%...    │    │
│              │  │                                  │    │
│              │  │ [生成报告] [复制SQL] [导出结果]   │    │
│              │  └──────────────────────────────────┘    │
│              │                                          │
│              │  ┌─ 推荐问题 ──────────────────────┐    │
│              │  │ • 各地区的营收分布？              │    │
│              │  │ • 月度趋势如何？                  │    │
│              │  └──────────────────────────────────┘    │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### 4.2 模式说明

**默认模式：问数据**

1. 用户在输入框输入自然语言问题
2. 系统生成 SQL（显示在 SQL 区域）
3. 自动执行 SQL（显示结果表格）
4. AI 自动生成解释（显示在解释区域）
5. 推荐后续问题

**解释结果模式**

- 用户点击 "AI 解释" 按钮
- 对当前查询结果做深度分析
- 输出关键发现、趋势、异常

**生成报告模式**

- 用户点击 "生成报告" 按钮
- 基于当前表和最近查询生成 Markdown 报告
- 支持预览和下载

### 4.3 左侧数据上下文面板

| 元素 | 说明 |
|------|------|
| 当前表名 | 高亮显示选中的表 |
| 字段列表 | 可展开的字段名 + 类型 |
| 行数 | 实时显示 |
| 最近查询 | 最近 5 条 SQL，点击可复用 |
| 表切换 | 下拉选择其他表 |

### 4.4 错误处理设计

| 错误类型 | 当前行为 | 新行为 |
|----------|----------|--------|
| API 不可用 | 无提示 | 显示 "AI 服务不可用，请检查 API Key" |
| JSON 解析失败 | `Failed to parse LLM response as JSON` | 显示原始文本 + "AI 返回了非结构化结果" |
| 模型输出为空 | 空白 | 显示 "AI 未生成结果，请重新提问" |
| 网络超时 | 无提示 | 显示 "请求超时，请检查网络" |
| SQL 执行失败 | SQL 错误 | 显示 SQL 错误 + "AI 生成的 SQL 有误，可手动修改" |

---

## 5. Guided Demo Mode Design

### 5.1 设计原则

- **不做弹窗乱跳**：不使用 tooltip 弹出方式
- **做成线性流程**：用户从首页点击 "开始演示"，按步骤完成
- **每步一个成功条件**：明确的完成标准
- **自带 demo 数据**：不依赖用户已有数据

### 5.2 流程设计

| Step | User Action | Success Condition | Page |
|------|-------------|-------------------|------|
| 1 | 点击首页 "开始演示" 按钮 | 进入演示模式 | `/` (首页) |
| 2 | 系统自动加载 `demo_sales.csv` | 表出现在数据列表中 | `/data` (自动) |
| 3 | 查看表预览 | 表格数据正常显示 | `/data` |
| 4 | 进入 AI 数据助手，输入 "营收最高的品类是哪些？" | 问题提交成功 | `/ai` |
| 5 | 查看 AI 生成的 SQL | SQL 正确显示 | `/ai` |
| 6 | 查看查询结果 | 结果表格正常显示 | `/ai` |
| 7 | 查看 AI 解释 | 解释文本正常显示 | `/ai` |
| 8 | 点击 "生成报告" | Markdown 报告生成 | `/ai` |
| 9 | 完成演示 | 显示 "演示完成" 通知 | `/ai` |

### 5.3 技术方案

- **入口**：首页添加 "开始演示" 按钮（替代旧的 onboarding 启动方式）
- **路由**：使用 `/ai?demo=true` 参数激活演示模式
- **数据**：后端提供 `/api/demo/load` 端点，加载内置 demo_sales 数据
- **状态**：新建 `demo-store.ts`，用 Zustand 管理演示进度
- **UI**：页面顶部显示 stepper 进度条，每步高亮对应区域
- **退出**：用户可随时点击 "退出演示" 回到正常模式

### 5.4 与旧 Onboarding 的对比

| 维度 | 旧 Onboarding | 新 Guided Demo |
|------|---------------|----------------|
| 形式 | 浮动 wizard + tooltip | 线性 stepper + 页面内引导 |
| 页面跳转 | 跨 3 个页面 | 主要在 `/ai` 一个页面 |
| 数据依赖 | 需要用户上传数据 | 自带 demo 数据 |
| 完成条件 | 点击 "Got it" | 实际操作成功 |
| 组件状态 | Wizard 未挂载，系统失效 | 全新实现 |

---

## 6. Keep / Merge / Hide / Rebuild List

### Keep（保留不变）
- `/data` 页面（上传、表管理、数据预览）
- `/query` 页面的 Monaco SQL 编辑器
- `/history` 页面
- `/settings` 页面
- `/analyze/[runId]` 详情页
- `AIAnalysisPanel` 分析结果渲染
- `FollowUpInput` 多轮对话
- `SuggestedQuestions` 推荐问题
- `DrillDownChain` 深度分析链
- `AiChart` 图表渲染
- `QualityGates` 质量门
- `TraceTimeline` 追踪时间线

### Merge（合并到 AI 数据助手）
- SQL 页的 AI 生成 SQL → AI 数据助手 "问数据"
- SQL 页的 Explain 按钮 → AI 数据助手 "解释结果"
- SQL 页的 Insights 按钮 → AI 数据助手 "解释结果"
- AI 分析页的 6 模式 → 收敛为 3 模式

### Hide（隐藏，标 experimental）
- Quick SQL 右侧面板
- Charts 按钮（SQL 页）
- Anomalies 按钮（SQL 页）
- Autonomous 分析模式
- Command Palette
- Templates
- Schedule
- Diff / Compare

### Rebuild（重做）
- Guided Onboarding → Guided Demo
- `/analyze` 页面 → `/ai` AI 数据助手

### Simplify（简化）
- `analysis-workspace-panel.tsx`（535 行）→ 拆分历史管理和工具面板
- `investigation-store.ts`（409 行）→ 简化压缩逻辑
- 模式选择器（6 种 → 3 种）

---

## 7. M4 Execution Plan

### M4-2：AI Workspace 重构

**目标**：合并 AI SQL 和 AI 分析，隐藏 Quick SQL，明确 Ask Data 主线

**任务清单**：
1. 将 `/analyze` 路由改为 `/ai`，页面标题改为 "AI 数据助手"
2. 移除 `investigation-workspace.tsx` 中的 6 模式选择器，收敛为 3 种（问数据 / 解释结果 / 生成报告）
3. 隐藏 `tools-panel.tsx` 中的 Quick SQL（保留 recent runs）
4. 从 `sql-workspace-panel.tsx` 中移除 AI 按钮（Explain / Insights / Charts / Anomalies），SQL 页只保留纯 SQL 功能
5. 重新设计 `question-input.tsx`，去掉模式选择，改为默认 "问数据" 流程
6. 修改 `streaming-output.tsx`，默认流式输出 SQL → 结果 → 解释
7. 更新导航标签：`AI 分析` → `AI 数据助手`
8. 更新首页快速入口卡片

**验收标准**：
- 用户能在一个页面完成：自然语言问数 → SQL → 结果 → 解释
- SQL Workspace 仍可单独使用（纯 SQL 模式）
- AI JSON 解析失败有清晰错误提示
- Build 通过（`npx next build`）
- 无 TypeScript 错误

**影响范围**：
- `frontend-react/src/app/(shell)/analyze/page.tsx`
- `frontend-react/src/app/(shell)/analyze/[runId]/page.tsx`
- `frontend-react/src/app/(shell)/query/page.tsx`
- `frontend-react/src/app/(shell)/page.tsx`
- `frontend-react/src/panels/sql-workspace-panel.tsx`
- `frontend-react/src/components/investigation/` (多个文件)
- `frontend-react/src/components/sql-workspace/ai-sql-input.tsx`
- `frontend-react/src/i18n/zh.ts`, `en.ts`

### M4-3：Guided Demo 重做

**目标**：替换旧 onboarding，做成稳定 demo flow

**任务清单**：
1. 创建 `demo-store.ts`（Zustand），管理演示状态（active / step / completed）
2. 创建 `GuidedDemoStepper` 组件，显示步骤进度
3. 首页添加 "开始演示" 按钮
4. 后端添加 `/api/demo/load` 端点，加载 demo_sales 数据
5. 实现 9 步演示流程（见 Section 5.2）
6. 每步添加成功条件检测
7. 移除旧的 `OnboardingWizard` 和 `FeatureTooltip` 集成
8. 更新 i18n 翻译

**验收标准**：
- 用户能从首页开始演示
- 每一步有明确完成条件
- 不再出现乱跳转
- 演示数据自动加载
- 可随时退出演示

**影响范围**：
- 新建 `frontend-react/src/stores/demo-store.ts`
- 新建 `frontend-react/src/components/demo/` 目录
- `frontend-react/src/app/(shell)/page.tsx`
- `frontend-react/src/app/(shell)/ai/page.tsx`（M4-2 产出）
- `frontend-react/src/components/onboarding/`（移除旧系统）
- 后端 `backend/` 添加 demo 端点

### M4-4：AI 输出契约修复

**目标**：修复 JSON 解析失败，增加 fallback

**任务清单**：
1. 在 `ai-analysis-modes.ts` 中为每个 mode runner 添加 JSON parse try-catch
2. 添加 fallback 逻辑：非 JSON 输出时展示原始文本
3. 在 `streaming-output.tsx` 中添加 "非结构化结果" 渲染模式
4. 添加错误类型分类（API / 模型输出 / JSON 解析 / 网络）
5. 简化 `investigation-store.ts` 的压缩逻辑
6. 添加测试覆盖

**验收标准**：
- AI 返回非 JSON 时页面不崩
- 能展示原始文本或结构化降级结果
- 有测试覆盖
- 用户能看到有意义的错误提示

**影响范围**：
- `frontend-react/src/panels/ai-analysis-modes.ts`
- `frontend-react/src/components/investigation/streaming-output.tsx`
- `frontend-react/src/stores/investigation-store.ts`
- 新建测试文件

### M4-5：组件拆分与 Experimental 标记

**目标**：拆大 panel，隐藏 experimental 功能

**任务清单**：
1. 拆分 `sql-workspace-panel.tsx`（643 行）→ 编辑器组件 + 执行逻辑 + 结果展示
2. 拆分 `analysis-workspace-panel.tsx`（535 行）→ 历史侧边栏 + 运行详情 + 工具栏
3. 拆分 `ai-analysis-modes.ts`（448 行）→ 每个模式独立文件
4. 为 experimental 功能添加 feature flag（templates, schedule, diff, command palette）
5. 隐藏 experimental 功能的 UI 入口（不删除代码）

**验收标准**：
- `sql-workspace-panel.tsx` 行数下降至 < 300
- `analysis-workspace-panel.tsx` 行数下降至 < 300
- `ai-analysis-modes.ts` 拆分为独立文件
- 测试和 build 通过
- experimental 功能代码保留但 UI 隐藏

---

## 8. Acceptance Criteria

### M4-2 验收清单

- [ ] `/ai` 页面取代 `/analyze`，标题为 "AI 数据助手"
- [ ] 用户输入自然语言 → 看到 SQL → 看到结果 → 看到解释，全流程在一个页面完成
- [ ] SQL 页面不再显示 AI 按钮（Explain / Insights / Charts / Anomalies）
- [ ] Quick SQL 面板隐藏
- [ ] 模式选择器从 6 种收敛为 3 种
- [ ] `npx next build` 通过
- [ ] 无 TypeScript 错误

### M4-3 验收清单

- [ ] 首页有 "开始演示" 按钮
- [ ] 点击后进入演示模式，自动加载 demo 数据
- [ ] 9 步流程线性推进，每步有成功条件
- [ ] 旧 onboarding 系统移除
- [ ] 可随时退出演示

### M4-4 验收清单

- [ ] AI 返回非 JSON 时页面不崩溃
- [ ] 显示原始文本或降级结果
- [ ] 错误提示区分 API / 模型 / 解析 / 网络
- [ ] 有测试覆盖

### M4-5 验收清单

- [ ] 大文件行数下降
- [ ] experimental 功能 UI 隐藏
- [ ] build 和测试通过

---

## 9. Risks and Rollback

### 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AI 功能合并后用户找不到入口 | 高 | 首页保留 "AI 数据助手" 快速入口卡片 |
| 移除 SQL 页 AI 按钮影响现有工作流 | 中 | SQL 页保留 "跳转到 AI 数据助手" 链接 |
| Demo 数据加载失败 | 中 | 后端端点添加 fallback，前端显示错误提示 |
| JSON 修复引入新 bug | 低 | 添加测试覆盖，逐步 rollout |
| 组件拆分破坏现有功能 | 中 | 每次拆分后运行 build + 手动测试 |

### 回滚方案

- **M4-2 回滚**：`git revert` 到 M4-1 commit，恢复 `/analyze` 路由和 AI 按钮
- **M4-3 回滚**：保留旧 onboarding 代码（注释掉），恢复 FeatureTooltip 集成
- **M4-4 回滚**：JSON fallback 逻辑是 additive，不影响现有路径
- **M4-5 回滚**：组件拆分是纯重构，revert 即可

### 依赖关系

```
M4-2 (AI Workspace 重构)
  ↓
M4-3 (Guided Demo 重做)  ← 依赖 M4-2 的新页面结构
  ↓
M4-4 (AI 输出契约修复)   ← 可与 M4-3 并行
  ↓
M4-5 (组件拆分)          ← 依赖 M4-2/M4-4 稳定后
```

---

## Appendix: File Impact Summary

### M4-2 涉及文件

| 文件 | 操作 |
|------|------|
| `app/(shell)/analyze/page.tsx` | 修改（路由改名） |
| `app/(shell)/analyze/[runId]/page.tsx` | 保留 |
| `app/(shell)/query/page.tsx` | 修改（移除 AI 按钮包装） |
| `app/(shell)/page.tsx` | 修改（更新入口卡片） |
| `panels/sql-workspace-panel.tsx` | 修改（移除 AI 按钮） |
| `components/investigation/question-input.tsx` | 修改（简化模式） |
| `components/investigation/ai-mode-selector.tsx` | 修改（6→3 模式） |
| `components/investigation/tools-panel.tsx` | 修改（隐藏 Quick SQL） |
| `components/investigation/streaming-output.tsx` | 修改（默认流程） |
| `components/sql-workspace/ai-sql-input.tsx` | 保留（可选移除） |
| `i18n/zh.ts`, `i18n/en.ts` | 修改（更新标签） |

### M4-3 涉及文件

| 文件 | 操作 |
|------|------|
| `stores/demo-store.ts` | 新建 |
| `components/demo/guided-demo-stepper.tsx` | 新建 |
| `components/demo/demo-complete.tsx` | 新建 |
| `app/(shell)/page.tsx` | 修改（添加演示按钮） |
| `components/onboarding/onboarding-wizard.tsx` | 移除 |
| `components/onboarding/feature-tooltip.tsx` | 移除 |
| `stores/onboarding-store.ts` | 移除 |
| 后端 `backend/` | 新增 demo 端点 |

### M4-4 涉及文件

| 文件 | 操作 |
|------|------|
| `panels/ai-analysis-modes.ts` | 修改（添加 fallback） |
| `components/investigation/streaming-output.tsx` | 修改（非结构化渲染） |
| `stores/investigation-store.ts` | 修改（简化压缩） |
| `__tests__/ai-fallback.test.ts` | 新建 |
