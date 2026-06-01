# Investigation Workspace 架构设计

## 概述

v0.8.1 Phase 2 将 AI 分析从 legacy 三列 IDE 的碎片化面板提升为以"调查"为中心的主视图。

## 设计原则

1. **AI-first**：分析结果为主视图，SQL/数据为辅助上下文
2. **渐进式迁移**：legacy workspace 完整保留，新旧两套并行
3. **无后端变更**：所有改动限于前端，复用现有 API/SSE
4. **运行时稳定优先**：不破坏已有功能，不修改 store 接口

## 架构层次

```
AppShell (sidebar + header)
  └─ /analyze → InvestigationLayout (react-resizable-panels)
       ├─ ContextPanel (可折叠左侧：表列表、schema)
       ├─ InvestigationWorkspace (中央主视图)
       │   ├─ QuestionInput (问题+表+模式选择)
       │   ├─ StreamingIndicator (流式状态)
       │   └─ StreamingOutput (结果展示)
       └─ ToolsPanel (可折叠右侧：SQL、历史)
```

## 路由设计

| 路由 | 组件 | 用途 |
|------|------|------|
| `/analyze` | `InvestigationWorkspace` | 调查入口，发起新分析 |
| `/analyze/[runId]` | `AnalysisDetailPage` | 运行详情：timeline/sections/trace/eval/drill-down |
| `/workspace-legacy` | 不变 | 兼容旧版三列 IDE |

## 组件树

### investigation/ （新增 14 个组件）

- `investigation-workspace.tsx` — 编排器：协调 API 调用 + 状态管理
- `investigation-layout.tsx` — 自适应三区布局 + focus mode
- `question-input.tsx` — 问题输入、表选择、模式选择
- `streaming-output.tsx` — SSE 流式结果展示
- `context-panel.tsx` — 左侧上下文面板
- `tools-panel.tsx` — 右侧工具面板
- `ai-mode-selector.tsx` — 分析模式 chip 选择器
- `ai-streaming-indicator.tsx` — 流式状态动画
- `run-header.tsx` — 运行详情头部（操作按钮）
- `run-timeline.tsx` — 版本时间线
- `run-sections.tsx` — 分析段落展示
- `run-trace.tsx` — LLM trace 面板
- `run-evaluation.tsx` — 质量评估面板
- `drill-down-chain.tsx` — 下钻链可视化

### 复用组件（不修改）

- `ai/analysis-section.tsx` — Markdown 渲染
- `ai/step-results.tsx` — 多步骤结果
- `ai/trace-timeline.tsx` — Trace 时间线
- `ai/follow-up-input.tsx` — 追问输入
- `ui/ai-chart.tsx` — 图表渲染

### 复用 Store（不修改）

- `analysis-store.ts` — 分析运行历史
- `investigation-store.ts` — 调查生命周期
- `data-store.ts` — 数据表管理

## 数据流

```
用户输入问题 + 表 + 模式
  → QuestionInput.onStart()
  → analysisStore.addRun() → 创建 run
  → fetchTableData() → 获取 columns/sampleRows
  → streamAiAnalyzeMulti() → SSE 流式分析
  → 事件回调更新 UI (plan/step/summary/done)
  → analysisStore.updateRun() → 保存结果
  → investigationStore → 更新上下文/key findings
```

## Focus Mode

- 默认：三区布局（context 18% / main 56% / tools 26%）
- Focus mode：隐藏左右面板，中央 100% 全宽
- 面板比例可通过 `react-resizable-panels` 拖拽调整
- 小屏幕 (<768px) 自动折叠面板，仅显示主内容
