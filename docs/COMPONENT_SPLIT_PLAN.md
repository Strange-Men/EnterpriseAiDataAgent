# 组件拆分方案

## 目标

将 `panels/sql-workspace-panel.tsx` (~700行) 和 `panels/ai-analysis-panel.tsx` (~836行) 拆分为小而聚焦的组件，降低耦合度，提高可复用性。

## 策略

**兼容优先**：拆分后原 panel 文件保留为组合入口，内部引用新组件。所有现有消费者无需修改。

## ai-analysis-panel 拆分

### 已有小组件（不变）
- `AnalysisSectionView` — Markdown 渲染
- `TraceTimeline` — Trace 时间线
- `AnalysisHeader` — 分析面板头部
- `StepResults` — 多步骤结果
- `FollowUpInput` — 追问输入

### 新拆分

| 新组件 | 来源 | 职责 |
|--------|------|------|
| `ai-mode-selector.tsx` | panel 内 mode 选择逻辑 | 6 种分析模式 chip 选择 |
| `ai-streaming-indicator.tsx` | panel 内 loading/streaming 状态 | 流式分析进度动画 |

### 组合入口
`ai-analysis-panel.tsx` 保持不变，内部逐步迁移为使用新模式选择器和流式指示器。

## sql-workspace-panel 拆分

### 新拆分

| 新组件 | 来源 | 职责 |
|--------|------|------|
| `sql-editor-toolbar.tsx` | panel 内工具栏 | Execute/Cancel/Explain/Format/AI buttons/Export 按钮行 |
| `sql-editor-area.tsx` | panel 内 Monaco 封装 | Monaco Editor + schema 自动补全 + Ctrl+Enter |
| `sql-result-view.tsx` | panel 内结果展示 | DataTable + 统计栏 + error 展示 |

### 组合入口
`sql-workspace-panel.tsx` 保持不变，内部逐步迁移为使用新组件组合。

## investigation/ 新组件（本次新建）

全部位于 `src/components/investigation/`，不与 legacy panels 重叠。

| 组件 | 行数 | 职责 |
|------|------|------|
| `investigation-workspace.tsx` | ~150 | 编排器：API 调用 + 状态协调 |
| `investigation-layout.tsx` | ~80 | 三区 resizable 布局 + focus mode |
| `question-input.tsx` | ~80 | 问题 + 表 + 模式一体输入 |
| `streaming-output.tsx` | ~100 | SSE 结果懒加载展示 |
| `context-panel.tsx` | ~80 | 表列表 + schema 展开 |
| `tools-panel.tsx` | ~90 | 快速 SQL + 最近运行 |
| `run-header.tsx` | ~90 | 运行详情头部 + 操作按钮 |
| `run-timeline.tsx` | ~55 | 版本演进时间线 |
| `run-sections.tsx` | ~45 | 分析段落 + 多步骤结果 |
| `run-trace.tsx` | ~25 | Trace 面板包装 |
| `run-evaluation.tsx` | ~65 | 评估指标 + 诊断 + 建议 |
| `drill-down-chain.tsx` | ~70 | 下钻链可视化 |

## 删除计划

以下文件将在 v0.9.0 标记 deprecated：
- `panels/analysis-workspace-panel.tsx` — 功能迁移到 investigation workspace
- `panels/sql-workspace-panel.tsx` — 待拆分后迁入 tools-panel
- `panels/ai-analysis-panel.tsx` — 功能迁移到 investigation workspace

v0.9.0 之前不删除任何文件，保持完全向后兼容。
