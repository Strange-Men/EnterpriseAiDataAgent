# UI 流程与交互地图

## 入口

### 从导航进入
```
Sidebar "AI 分析" → /analyze → InvestigationWorkspace
```

### 从首页进入
```
Home "AI Analyze" card → /analyze
```

## 主流程：发起调查

```
/analyze
  │
  ├─ 选择数据集（下拉菜单，列出所有已上传表）
  ├─ 选择分析模式（chip：自主分析/全面分析/洞察/解释/图表/异常检测）
  ├─ 输入问题（textarea，Enter 提交）
  └─ 点击 "开始调查" → 触发流式分析
       │
       ├─ StreamingIndicator 显示当前状态
       │   ├─ "生成计划..." (plan)
       │   ├─ "执行第 N 步" (step)
       │   └─ "流式输出..." (summary)
       │
       ├─ StreamingOutput 逐块展示
       │   ├─ Plan 列表 → 分析计划
       │   ├─ Step Results → 每步 SQL + 数据表格
       │   ├─ Sections → Markdown 分析段落
       │   ├─ Charts → 图表
       │   └─ Summary → 执行摘要
       │
       └─ 完成 → "调查详情 →" 链接
```

## 详情流程：查看运行

```
/analyze/[runId]
  │
  ├─ RunHeader
  │   ├─ 返回按钮 → /analyze
  │   ├─ 模式标签 + 状态标签 + 版本号
  │   ├─ 问题标题 + 表名 + 时间戳
  │   └─ 操作：保存/复制/重新运行/导出/删除
  │
  ├─ 主体（2:1 布局）
  │   ├─ 左侧（主要内容）
  │   │   ├─ RunSections（分析段落）
  │   │   │   ├─ StepResults（多步骤结果表格）
  │   │   │   ├─ AnalysisSection（Markdown 渲染）
  │   │   │   ├─ AiChart（图表）
  │   │   │   └─ Executive Summary
  │   │   └─ RunTrace（LLM trace 时间线）
  │   │
  │   └─ 右侧（辅助信息）
  │       ├─ RunEvaluation（质量评估：置信度/完整性/准确性/可操作性）
  │       ├─ RunTimeline（版本演进时间线）
  │       └─ DrillDownChain（下钻链）
  │
  └─ Error banner（如有错误）
```

## 辅助交互

### 左侧 Context Panel
```
上下文面板
  ├─ 表列表（可展开查看 schema）
  │   ├─ 点击表名 → 设为当前活动表
  │   └─ 点击箭头 → 展开/折叠列信息（名称+类型）
  └─ 空状态：提示上传数据
```

### 右侧 Tools Panel
```
工具面板
  ├─ 快速 SQL
  │   ├─ 文本编辑器（Ctrl+Enter 执行）
  │   └─ 执行按钮 + 结果显示
  │
  └─ 最近调查
      ├─ 最近 5 条运行记录
      ├─ 状态点（绿/黄/红）
      └─ 点击 → 跳转 /analyze/[runId]
```

### Focus Mode
```
任意 /analyze 页面
  └─ 点击 "专注模式" → 隐藏 Context + Tools
       └─ 点击 "退出专注" → 恢复三区布局
```
