# M4-2 AI Workspace Refactor

## 1. Goal

本轮目标：合并 AI SQL 和 AI 分析入口，降低前端混乱度。用户能在一个页面完成：自然语言提问 → AI 生成 SQL → 执行查询 → 查看结果 → 查看解释 / 洞察 / 报告入口。

**不是**新增功能，而是收敛入口、隐藏实验功能、明确页面定位。

## 2. Changes

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/config/features.ts` | 新建 | Feature flags 配置，集中控制实验入口 |
| `src/panels/sql-workspace-panel.tsx` | 修改 | 隐藏 AI 按钮，添加跳转 AI 助手链接 |
| `src/components/investigation/ai-mode-selector.tsx` | 修改 | 6 种模式收敛为 3 种（通过 feature flag） |
| `src/components/investigation/question-input.tsx` | 修改 | 默认模式改为 explain |
| `src/components/investigation/tools-panel.tsx` | 修改 | 隐藏 Quick SQL 面板 |
| `src/components/investigation/streaming-output.tsx` | 修改 | JSON 解析错误用户友好提示 |
| `src/panels/analysis-workspace-panel.tsx` | 修改 | 隐藏 Templates/Schedule/Diff/Timeline 按钮 |
| `src/i18n/zh.ts` | 修改 | 更新标签：AI 分析 → AI 数据助手 |
| `src/i18n/en.ts` | 修改 | 更新标签：AI Analyze → AI Assistant |
| `docs/reports/m4-2-ai-workspace-refactor.md` | 新建 | 本报告 |

## 3. AI Feature Decisions

| Feature | Before | After | Reason |
|---------|--------|-------|--------|
| AI Generate SQL (SQL 页) | SQL 页内 NL→SQL 按钮 | 隐藏，改为跳转 AI 助手链接 | 合并到 AI 数据助手 |
| AI Explain (SQL 页按钮) | 查询后可点击解释 | 隐藏 (feature flag) | 合并到 AI 数据助手 |
| AI Insights (SQL 页按钮) | 查询后可点击洞察 | 隐藏 (feature flag) | 合并到 AI 数据助手 |
| AI Charts (SQL 页按钮) | 查询后图表建议 | 隐藏 (feature flag) | 实验功能 |
| AI Anomalies (SQL 页按钮) | 查询后异常检测 | 隐藏 (feature flag) | 实验功能 |
| Quick SQL 右侧面板 | AI 页右侧 SQL 快捷执行 | 隐藏 (feature flag) | 与 SQL 页重复 |
| 6 种分析模式 | autonomous/full/insights/explain/charts/anomalies | 收敛为 3 种：autonomous/explain/insights | 用户不理解区别 |
| Templates | 模板管理入口可见 | 隐藏 (feature flag) | 非核心流程 |
| Schedule | 定时分析入口可见 | 隐藏 (feature flag) | 非核心流程 |
| Diff / Compare | 运行对比入口可见 | 隐藏 (feature flag) | 非核心流程 |
| Timeline Evolution | 版本演进入口可见 | 隐藏 (feature flag) | 非核心流程 |
| Save as Template | 保存为模板按钮可见 | 隐藏 (feature flag) | 非核心流程 |
| Report 生成 | 生成报告入口 | **保留** | 核心流程第 7 步 |
| Analysis 详情页 | /analyze/[runId] | **保留** | 历史查看有用 |
| Recent runs | 最近分析记录 | **保留** | 用户需要 |
| Follow-up Input | 多轮追问 | **保留** | 有用 |
| Suggested Questions | 推荐问题 | **保留** | 引导用户 |
| Drill-down Chain | 深度分析链 | **保留** | 有用 |

## 4. New AI Assistant UX

### 页面定位

- **名称**：AI 数据助手（原 "AI 分析"）
- **路由**：保持 `/analyze`（URL 不变，标签更新）
- **定位**：自然语言问数 → SQL → 结果 → 解释 → 报告

### 核心模式（3 种）

| 模式 | 功能 | 用户操作 |
|------|------|----------|
| **问数据** (autonomous) | 自然语言 → SQL → 执行 → 多步分析 | 输入问题，看 SQL 和结果 |
| **解释结果** (explain) | 对数据做 AI 解释 | 默认模式 |
| **洞察** (insights) | 生成关键洞察 | 选择模式 |

### SQL 页面变化

- SQL 页面变成纯专家模式
- AI 按钮全部隐藏
- 保留一个 "AI 数据助手" 链接，方便用户跳转
- 保留：执行、Explain、格式化、保存、导出

## 5. What Was Hidden, Not Deleted

以下功能**仅隐藏 UI 入口**，源码完整保留：

| 功能 | 隐藏方式 | 恢复方法 |
|------|----------|----------|
| AI Generate SQL (SQL 页) | `featureFlags.showAiSqlInputInWorkspace` | 设为 `true` |
| AI 按钮 (SQL 页) | `featureFlags.showAiButtonsInSqlWorkspace` | 设为 `true` |
| Quick SQL | `featureFlags.showQuickSqlPanel` | 设为 `true` |
| Templates | `featureFlags.showTemplates` | 设为 `true` |
| Schedule | `featureFlags.showSchedule` | 设为 `true` |
| Diff/Compare | `featureFlags.showDiffCompare` | 设为 `true` |
| Timeline | `featureFlags.showTimeline` | 设为 `true` |
| Save as Template | `featureFlags.showSaveAsTemplate` | 设为 `true` |
| Autonomous 模式 | `featureFlags.showAutonomousMode` | 设为 `true` |
| Charts 模式 | `featureFlags.showChartsMode` | 设为 `true` |
| Anomalies 模式 | `featureFlags.showAnomaliesMode` | 设为 `true` |
| Full-analysis 模式 | `featureFlags.showFullAnalysisMode` | 设为 `true` |

**为什么不删除代码**：
1. 这些功能本身是有用的，只是当前阶段增加了用户认知负担
2. 后续版本（M4-5）会逐步拆分并选择性恢复
3. 删除代码不可逆，隐藏入口可逆

## 6. Validation

| 检查项 | 结果 |
|--------|------|
| `npx tsc --noEmit` | ✅ 通过 |
| `vitest run` | ✅ 113 tests passed |
| `npm run build` | ✅ 通过 |
| SQL 页面是否更像专家 SQL 工作台 | ✅ AI 按钮已隐藏 |
| AI 页面是否变成 AI 数据助手 | ✅ 标签已更新 |
| Quick SQL 是否隐藏 | ✅ feature flag 控制 |
| 实验功能入口是否隐藏 | ✅ Templates/Schedule/Diff/Timeline 隐藏 |
| Data / SQL / AI / History / Settings 是否仍可访问 | ✅ 导航完整 |
| 上传和 SQL 查询是否没有被影响 | ✅ 核心功能不受影响 |

## 7. Remaining Work

| 项目 | 留到 | 说明 |
|------|------|------|
| Guided Demo | M4-3 | 替换旧 onboarding，做成稳定 demo flow |
| AI JSON 输出契约修复 | M4-4 | 系统修复 JSON 解析失败，增加 fallback |
| 大组件拆分 | M4-5 | sql-workspace-panel (643行)、analysis-workspace-panel (535行) 等 |
| /analyze → /ai 路由迁移 | M4-5 | 需要处理 redirect 和 SEO |
| Investigation store 简化 | M4-4 | 去掉过度压缩逻辑 |
| Feature flags 恢复策略 | M4-5 | 逐个评估哪些功能恢复、哪些永久隐藏 |
