# M4-8.4.0 Analysis Detail Report Layout Planning

> 规划日期：2026-06-24
> 基于 master commit: 2991ada
> 范围：仅规划，不改代码，不改 UI，不进入 M4-8.4 implementation

---

## 1. Problem

分析详情页当前更像调试页，不像可阅读的数据分析报告页。

**核心矛盾**：用户完成分析后进入详情页，期望看到"报告"，但实际看到的是：
- 步骤列表（调试视角）
- Trace 追踪数据（开发者视角）
- 评估指标（质量审计视角）
- Executive Summary 被埋在最底部

**用户期望**：先看到结论，再看支撑数据，最后看技术细节。

---

## 2. Audit

### 2.1 页面结构审计

**当前页面结构**（`[runId]/page.tsx`）：

```
1. Back button (← 返回工作区)
2. RunHeader
   - Mode badge + Status badge
   - Question (h2)
   - Table name + Timestamp
   - Actions: Rerun | Export Markdown | More (Copy Summary, Export JSON, Delete)
3. Error banner (conditional)
4. Grid (2/3 + 1/3):
   Left (2/3):
     4a. RunSections
         - StepResults (multi-step)
         - Markdown sections
         - Charts
         - Executive Summary ← 最后！
     4b. RunTrace ← 主区，不折叠
   Right (1/3):
     5a. RunEvaluation (Confidence Ring + Metric Bars + Diagnostics)
     5b. RunTimeline (evolution chain)
     5c. DrillDownChain
```

### 2.2 详细审计表

| 区域 | 当前问题 | 用户影响 | M4-8.4 处理 | 最小改法 |
|------|---------|---------|-------------|---------|
| **Report Header** | 页面没有"分析报告"标识，标题只是用户问题 | 用户不知道这是报告页 | M4-8.4.1 | 在 RunHeader 增加"分析报告" label |
| **Report Header** | Mode badge 用英文 "autonomous" / "full-analysis" | 中文用户不理解 | M4-8.4.1 | 用 i18n 翻译 mode label |
| **Report Header** | Status badge 是纯文字，不够醒目 | 用户不易注意到状态 | M4-8.4.1 | 用 StatusBadge 组件统一 |
| **Executive Summary** | 被埋在 RunSections 最底部（line 65-74） | 用户看不到结论就先看到步骤 | M4-8.4.1 | 把 Summary 提到 RunSections 顶部 |
| **Executive Summary** | 没有 summary 时不显示任何替代内容 | 用户不知道是否有结论 | M4-8.4.1 | 无 summary 时显示"暂无摘要" |
| **RunSections** | 标题是"分析段落"（inv.sections） | 不像报告章节标题 | M4-8.4.2 | 改为"分析结果"或"报告内容" |
| **RunSections** | Steps / Sections / Charts / Summary 全部平铺 | 信息密度高，无层级 | M4-8.4.2 | Steps 默认折叠 |
| **RunTrace** | 在主区（左 2/3）占据视觉空间 | Trace 抢主视觉，像调试页 | M4-8.4.3 | 移到侧边栏底部，默认折叠 |
| **RunTrace** | 使用 `text-[10px]` 字号 | 违反 M4-8.1 设计规范 | M4-8.4.3 | 改为 `text-xs` |
| **RunTrace** | 标题"追踪数据"（inv.raw-trace）太技术化 | 普通用户不理解 | M4-8.4.3 | 改为"技术追踪"并默认折叠 |
| **RunEvaluation** | ConfidenceRing 用 SVG 圆环，信息密度低 | 占空间但信息量少 | M4-8.4.2 | 简化为数值 + 文字描述 |
| **RunEvaluation** | MetricBar 用 `text-[10px]` | 违反设计规范 | M4-8.4.2 | 改为 `text-xs` |
| **RunEvaluation** | "质量评估"标题太技术化 | 普通用户不关心"评估" | M4-8.4.2 | 改为"分析质量"或折叠 |
| **DrillDownChain** | 大多数 run 没有 drill-down，空态浪费空间 | 侧边栏空间浪费 | M4-8.4.3 | 无 chain 时隐藏整个组件 |
| **DrillDownChain** | Breadcrumb 分隔符用 `text-[8px]` | 违反设计规范 | M4-8.4.3 | 改为 `text-xs` |
| **Actions** | Export Markdown 是 Primary Button ✅ | 正确 | 保持 | — |
| **Actions** | Rerun 是 Secondary Button ✅ | 正确 | 保持 | — |
| **Actions** | More 菜单包含 Copy Summary / Export JSON / Delete | 层级清晰 | 保持 | — |
| **Error banner** | 红色边框 + 红色文字，较醒目 | 可以 | 保持 | — |
| **Empty state** | run not found 有友好提示 + 按钮 ✅ | 正确 | 保持 | — |
| **Back button** | `← 返回工作区` 文字链接 | 可以但不够显眼 | M4-8.4.1 | 保持不变，不抢报告视觉 |

### 2.3 最大问题 Top 5

1. **Executive Summary 被埋在底部**：用户先看到步骤和 Trace，最后才看到结论。报告应该结论先行。
2. **Trace 抢主视觉**：Trace 在主区（左 2/3），不是折叠状态，占据报告阅读空间。
3. **缺少"报告"框架感**：页面没有明确标识为"分析报告"，Mode badge 用英文，不像报告入口。
4. **Evaluation 信息密度低**：SVG 圆环 + MetricBar 占大量空间，信息量少，且用 `text-[10px]`。
5. **DrillDownChain 空态浪费**：大多数 run 没有 drill-down，但组件始终显示空态。

### 2.4 Trace 当前主要问题

- 在主区（左 2/3 列），不是侧边栏
- 不折叠，默认展开
- 标题"追踪数据"太技术化
- 使用 `text-[10px]` 字号
- 与报告内容混排，视觉层级不清晰

### 2.5 SQL 附录当前主要问题

- 当前详情页没有独立的 SQL 附录区
- SQL 内联在 StepResults 的各步骤中
- 已在 M4-7.1.6-A 中将 SQL 移到 Markdown 导出的附录，但页面 UI 未同步
- 用户需要复制 SQL 时需要展开每个步骤

### 2.6 操作按钮当前主要问题

- Export Markdown 已是 Primary Button ✅
- Rerun 已是 Secondary Button ✅
- More 菜单层级清晰 ✅
- 问题不大，主要优化空间在 Header 整体布局

---

## 3. Design Principles

基于 M4-8.0 UI/UX 规划和 M4-7.1.6-A Markdown 报告质量改进：

```
P1: Summary First
    — 用户第一眼看到结论，不是步骤或 Trace。
    — Executive Summary 必须在页面首屏。

P2: Findings Before Trace
    — 关键发现、结果表在前。
    — Trace / SQL 在后，默认折叠。

P3: Report Before Debug
    — 页面框架是"分析报告"，不是"运行详情"。
    — Mode / Status / Table / Time 是元数据，不是主标题。

P4: SQL and Trace as Appendix
    — SQL 和 Trace 是附录，不是正文。
    — 默认折叠，需要时展开。

P5: User Question and Data Context Visible
    — 用户问题始终可见（标题区）。
    — 数据表名始终可见。

P6: Export Markdown is Primary Output Action
    — 已实现，保持。
```

---

## 4. Proposed Report Structure

**推荐页面结构**（从上到下）：

```
1. Report Header
   - "分析报告" label
   - Mode badge (translated)
   - Status badge
   - User Question (h2)
   - Table name + Timestamp
   - Actions: Export Markdown (Primary) | Rerun (Secondary) | More

2. Executive Summary (首屏核心)
   - 如果有 summary：显示摘要文本
   - 如果没有：显示"暂无摘要"

3. Key Findings / Result Table
   - 如果有 sections：显示分析段落
   - 如果有 steps：显示步骤结果（可折叠）
   - 如果有 charts：显示图表

4. Analysis Quality (侧边栏)
   - 简化的评估指标（数值 + 文字，不用 SVG 圆环）
   - Diagnostics（如有）

5. Evolution Timeline (侧边栏)
   - 如果有 chain：显示时间线
   - 如果没有：隐藏

6. SQL Appendix (折叠)
   - 集中展示所有 SQL
   - 默认折叠

7. Technical Trace (折叠)
   - Trace 追踪数据
   - 默认折叠
   - 放在页面底部
```

---

## 5. M4-8.4 Split Plan

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 |
|------|------|---------|---------|---------|
| **M4-8.4.1** | Report Header + Summary First | RunHeader + RunSections 顺序调整 | 不改 Trace、不改 SQL、不改 Evaluation、不改 Store/API/后端 | Summary 在首屏可见；Header 有"报告"感；tsc/test/build/lint pass |
| **M4-8.4.2** | Result Table + Key Findings Layout | RunSections 内 Steps 折叠 + Evaluation 简化 | 不改 Trace、不改 SQL 附录、不改 Store/API/后端 | Steps 默认折叠；Evaluation 信息密度提升；tsc/test/build/lint pass |
| **M4-8.4.3** | SQL / Trace Appendix Folding | RunTrace 移位 + 折叠 + DrillDownChain 空态隐藏 | 不改报告内容、不改 Store/API/后端 | Trace 在底部折叠；SQL 附录折叠；空态隐藏；tsc/test/build/lint pass |
| **M4-8.4.4** | Detail Page Empty / Error States | 空态 + 错误态优化 | 不改正常状态布局、不改 Store/API/后端 | 各种空态/错误态友好；tsc/test/build/lint pass |
| **M4-8.4.5** | Detail Page Regression | 回归测试 | 不改功能、不改逻辑 | 所有主链路可走通；tsc/test/build/lint pass |

---

## 6. M4-8.4.1 Scope

### 目标

Report Header + Summary First — 让详情页第一眼看起来像"分析报告"。

### 允许改动

1. **RunHeader 调整**：
   - 在标题区增加"分析报告"标识（可用小标签或文字）
   - Mode badge 改用 i18n 翻译后的文案
   - 确保 Status badge 使用统一的 StatusBadge 组件（如 M4-8.1 已创建）

2. **RunSections 顺序调整**：
   - 把 Executive Summary 从底部移到顶部
   - 有 summary 时：Summary → Steps → Sections → Charts
   - 无 summary 时：显示"暂无分析摘要"占位

3. **Summary 样式强化**：
   - Summary 区域用 accent 边框标识（当前已有 `border-[var(--accent)]/20`）
   - 确保字号 ≥ `text-sm`（14px）

### 禁止

- ❌ 不重排整个详情页
- ❌ 不改 Trace 展示逻辑
- ❌ 不改 SQL 附录
- ❌ 不改 Evaluation 组件
- ❌ 不改 Markdown export
- ❌ 不改 Store / API / 后端
- ❌ 不改 DrillDownChain
- ❌ 不改 RunTimeline

### 验收标准

1. `tsc --noEmit` pass
2. `vitest run` pass
3. `next build` pass
4. `next lint` warnings only
5. 人工检查：Summary 在首屏可见
6. 人工检查：Header 有"报告"感
7. 人工检查：Mode badge 是中文

### 预计文件

| 文件 | 改动类型 |
|------|---------|
| `frontend-react/src/components/investigation/run-header.tsx` | 增加报告标识、Mode badge i18n |
| `frontend-react/src/components/investigation/run-sections.tsx` | Summary 移到顶部 |
| `frontend-react/src/i18n/zh.ts` | 可能增加 key |
| `frontend-react/src/i18n/en.ts` | 可能增加 key |

---

## 7. Risks

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Summary 移动后布局跳动 | 用户体验不连贯 | 保持 Summary 原有样式，只改位置 |
| Mode badge i18n 不完整 | 部分 mode 没有翻译 | 检查所有 MODE_LABELS 的 i18n key |
| 详情页入口 URL 不变 | 历史记录中的链接仍有效 | 不改路由，只改组件内部布局 |
| Trace 后续移到底部 | 可能影响侧边栏布局 | M4-8.4.3 再处理，本轮不动 |
| 不改 Store/API | 数据结构不变 | 确保组件只读取现有字段 |

---

## 8. Next Step

等待用户确认后，进入 M4-8.4.1 implementation。

**暂不进入 M5 Agent。**
**暂不打 tag。**

M4-8.4.1 的执行流程：
1. 在当前分支 `m4-8-4-0-analysis-detail-report-planning` 上工作
2. 调整 RunHeader（增加报告标识）
3. 调整 RunSections（Summary 移到顶部）
4. 更新 i18n（如需）
5. 每改一个文件运行 `npx next build`
6. 全部改完后 tsc/test/build/lint
7. 提交 + push
8. 输出测试报告

---

## 附录：Markdown Export 与 Page UI 的对应关系

M4-7.1.6-A 已定义的 Markdown 报告结构：

```markdown
# AI 数据分析报告
## 1. 用户问题
## 2. 数据表
## 3. 执行摘要
## 4. 关键发现
## 5. 最终结果
## 6. 指标完成情况
## 7. 未满足项 / 缺失字段说明
## 8. 分析步骤
## 9. SQL 附录
## 10. 调用追踪 Trace
## 11. 生成时间
```

页面 UI 应与此结构对齐：
- Markdown §1-2 → RunHeader（已对齐）
- Markdown §3 → Executive Summary（需要移到顶部）
- Markdown §4-5 → RunSections（已对齐）
- Markdown §6-7 → 需要新增（M4-8.4.2 或后续）
- Markdown §8 → RunSections > StepResults（已对齐）
- Markdown §9 → SQL Appendix（M4-8.4.3 新增）
- Markdown §10 → RunTrace（M4-8.4.3 移到底部折叠）
