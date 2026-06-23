# M4-8.0 UI/UX Redesign Planning

> 规划日期：2026-06-23
> 基于 master commit: a0afc5b
> 范围：仅规划，不改代码，不改 UI，不进入 M5 Agent

---

## 1. Current Status

master 当前已完成的稳定性工作：

| 版本 | 内容 | 状态 |
|------|------|------|
| M4-7.1.4 | AI SQL 能力增强 + History Recall | ✅ |
| M4-7.1.5 | Save / Export / Template 语义修复 | ✅ |
| M4-7.1.6-A | Markdown Report Quality | ✅ |
| M4-7.1.6-B | Local Full Regression Audit | ✅ |
| M4-7.1.7 | SQL Safety Error Semantics | ✅ |
| M4-7.2 | State Boundary Cleanup (table selection) | ✅ |

当前状态：
- Frontend CI pass
- Backend CI pass
- 数据表状态边界已统一
- 所有核心链路（Save / Export / History / Markdown / AI SQL fallback）功能完整
- 深色主题稳定，Design Tokens 已定义（CSS variables）
- i18n 中英双语已就位
- Feature flags 体系已就位，实验功能已隐藏
- 无残留 `/performance`、`/virtual-table`、Command Palette 入口

结论：master 稳定，可以进入 UI/UX 规划阶段。

---

## 2. UI/UX Audit

### 2.1 页面级问题表

| 页面 | 当前问题 | 用户影响 | 严重程度 | 阻塞体验 | 建议阶段 |
|------|---------|---------|---------|---------|---------|
| **首页** | Hero 区文案抽象（"AI Data Agent"），用户无法一屏知道产品能干什么 | 新用户流失 | High | 是 | M4-8.2 |
| **首页** | Quick Start 两个按钮（上传数据 / 开始分析）功能区分不明确 | 用户不知道先点哪个 | Medium | 是 | M4-8.2 |
| **首页** | Demo Flow 4 步骤与 Quick Start 重复，信息冗余 | 页面过长，核心 CTA 被稀释 | Medium | 否 | M4-8.2 |
| **首页** | Recent Analyses / Recent Queries 仅在有数据时显示，空态无引导 | 首次访问页面太空 | Medium | 否 | M4-8.2 |
| **数据页** | 左侧 sidebar 272px 固定宽度，上传 / 表管理 / 状态三段挤在一起 | 小屏幕拥挤，信息密度不均 | Medium | 否 | M4-8.6 |
| **数据页** | 数据预览区空态无引导（仅显示空表格或空白） | 用户不知道下一步干什么 | Medium | 是 | M4-8.6 |
| **数据页** | AI 分析按钮（"AI" 标签）太小（10px），功能不明确 | 用户不知道点了会怎样 | Low | 否 | M4-8.6 |
| **分析工作台** | SQL Workspace 工具栏 10+ 按钮，无分组，视觉层级扁平 | 高级功能淹没基础操作 | High | 是 | M4-8.3 |
| **分析工作台** | AI 按钮（Explain / Insights / Charts / Anomalies）被 feature flag 隐藏，但 SQL Workspace 的 AI 按钮仍显示 | 体验不一致 | Medium | 否 | M4-8.3 |
| **分析工作台** | AI Query Tab 的 example questions 过于通用，不与当前数据表关联 | 用户觉得是 demo 不是真实功能 | Medium | 否 | M4-8.3 |
| **分析工作台** | Tab 切换（AI Query / Expert SQL）无视觉过渡，切换后布局跳动 | 体验不流畅 | Low | 否 | M4-8.3 |
| **分析工作台** | WorkflowBanner 在 SQL Tab 中显示，但与 AI Query Tab 无关 | 视觉噪音 | Low | 否 | M4-8.3 |
| **分析详情页** | Trace 区域占据过多视觉空间（左侧 2/3 布局） | 普通用户看到的是调试信息不是报告 | High | 是 | M4-8.4 |
| **分析详情页** | Evaluation badges（completeness / accuracy / actionability）用色块显示，含义不直观 | 用户不理解评估结果 | Medium | 否 | M4-8.4 |
| **分析详情页** | DrillDownChain 在 sidebar 显示，但大多数 run 没有 drill-down | 空态浪费空间 | Low | 否 | M4-8.4 |
| **分析详情页** | 导出 Markdown 按钮在 header 右侧，但不够显眼 | 用户找不到成果出口 | Medium | 是 | M4-8.4 |
| **历史页** | 每条记录 4-6 个操作按钮，界面过于密集 | 信息过载 | Medium | 否 | M4-8.5 |
| **历史页** | 没有按数据表分组，没有时间线视感 | 像日志不像工作流 | Medium | 否 | M4-8.5 |
| **历史页** | Export All CSV 功能隐藏在 header 小按钮中 | 用户不知道可以批量导出 | Low | 否 | M4-8.5 |
| **设置页** | 仅语言 / 主题 / 版本三项，过于简单 | 可以但无问题 | Low | 否 | M4-8.7 |
| **全局** | 字号普遍偏小（xs=12px, 10px 大量使用），按钮 padding 小 | 阅读疲劳，点击困难 | High | 是 | M4-8.1 |
| **全局** | 空态组件过于简单（emoji + 一行文字），无行动引导 | 用户不知道该干什么 | Medium | 是 | M4-8.1 |
| **全局** | 错误态用纯红色块 + 技术错误信息，吓人 | 用户恐慌 | Medium | 否 | M4-8.1 |
| **全局** | Sidebar 品牌 "EAI" 过于缩写，新用户不理解 | 品牌认知弱 | Low | 否 | M4-8.2 |
| **全局** | 英中双语文案部分生硬（如 "Expert SQL"、"Autonomous"） | 中国用户理解成本高 | Low | 否 | M4-8.7 |
| **全局** | 移动端 sidebar 折叠 + header 汉堡菜单已实现，但内容区未响应式适配 | 移动端可用但体验差 | Low | 否 | M4-8.8 |
| **全局** | 无残留实验功能入口（Templates / Scheduler / Diff / Timeline 已隐藏） | 无问题 | ✅ | — | — |

### 2.2 Top 5 核心问题

1. **字号层级太小**：10px / 12px 大量使用，阅读疲劳，按钮难点击。这是所有页面的共同基础问题。
2. **分析工作台工具栏过载**：SQL Workspace 10+ 按钮无分组，AI 功能入口不统一。
3. **分析详情页像调试页不像报告**：Trace 过度占据视觉，Evaluation 不直观，导出不显眼。
4. **首页无法一屏传达产品价值**：Hero 文案抽象，Demo Flow 与 Quick Start 重复。
5. **历史页是日志不是工作流**：无分组、无时间线、操作按钮过多。

---

## 3. Core User Paths

### Path A：首次使用 Demo 数据

```
首页 → 点击"开始分析" → 分析工作台 (AI Query Tab)
→ 选择数据表 → 输入问题 → AI 执行多步分析
→ 查看结果 → 点击"查看详情" → 分析详情页
→ 点击"导出 Markdown" → 下载报告
```

| 维度 | 当前状态 | 卡点 | 需优化页面 | 验收标准 |
|------|---------|------|-----------|---------|
| 是否顺畅 | 基本顺畅 | 首页 Hero 不知道产品干什么 | 首页 | 一屏知道产品用途 + 主 CTA 明确 |
| 上传后下一步 | 有引导但不明确 | 数据表选择器在 AI Query Tab 顶部，不显眼 | 分析工作台 | 数据表状态条始终可见 |
| 分析结果可读性 | 中等 | Streaming Output 是平铺文本，不够报告化 | 分析详情页 | 结果区有章节感，导出按钮显眼 |
| 导出是否易发现 | 不够显眼 | 详情页 header 右侧小按钮 | 分析详情页 | 导出是主操作按钮 |

### Path B：上传自己的 CSV/Excel

```
首页 → 点击"上传数据" → 数据页
→ 拖拽上传 CSV → 数据预览 → 点击表名
→ 点击 "AI" 分析按钮 → 分析工作台
→ 输入问题 → AI 分析 → 查看结果
```

| 维度 | 当前状态 | 卡点 | 需优化页面 | 验收标准 |
|------|---------|------|-----------|---------|
| 上传流程 | 顺畅 | 无 | 数据页 | 保持 |
| 上传后下一步 | 不够清楚 | 预览区空态无引导 | 数据页 | 上传成功后自动跳转或强引导 |
| AI 入口 | 不够明显 | "AI" 按钮 10px 太小 | 数据页 | AI 入口按钮加大，文案明确 |
| 分析入口 | 顺畅 | 无 | 分析工作台 | 保持 |

### Path C：专家 SQL 用户

```
分析工作台 → Expert SQL Tab
→ 输入 SQL 或点击"AI 生成 SQL" → 执行
→ 查看结果表格 → 导出 CSV / 保存查询
```

| 维度 | 当前状态 | 卡点 | 需优化页面 | 验收标准 |
|------|---------|------|-----------|---------|
| Tab 切换 | 基本顺畅 | 无视觉过渡 | 分析工作台 | 保持 |
| SQL 编辑 | 顺畅（Monaco Editor） | 无 | — | 保持 |
| AI 生成 SQL | 顺畅但入口不统一 | feature flag 控制，部分用户看不到 | 分析工作台 | AI 生成 SQL 入口始终可见 |
| 工具栏 | 过载 | 10+ 按钮无分组 | 分析工作台 | 按钮分组 + 层级区分 |
| 导出 CSV | 顺畅 | ExportDropdown 在工具栏右侧 | — | 保持 |

### Path D：回查历史

```
历史页 → 搜索/筛选
→ 打开详情 / 重新运行 / 加载到工作台 / 导出
```

| 维度 | 当前状态 | 卡点 | 需优化页面 | 验收标准 |
|------|---------|------|-----------|---------|
| 搜索筛选 | 顺畅 | 无 | — | 保持 |
| 记录可读性 | 中等 | 类型 badge + 文本 + 元数据 + 4-6 按钮，太密集 | 历史页 | 简化操作按钮，默认折叠 |
| 工作流复用 | 基本顺畅 | "重新运行" 和 "加载到工作台" 功能明确 | — | 保持 |
| 导出 | 不够明显 | Export All 隐藏在 header | 历史页 | 导出入口更显眼 |

---

## 4. M4-8 Design Principles

### 核心设计原则

```
P1: Professional（专业）
    — 数据工作台感，不是 demo 玩具。
    — 字号、间距、按钮层级符合企业级产品标准。

P2: Clear（清晰）
    — 一屏知道产品用途。
    — 主要路径按钮明确，次要功能弱化。
    — 空态有引导，错误态不吓人。

P3: Trustworthy（可信）
    — AI 输出像报告，不像调试日志。
    — 评估结果用自然语言，不用抽象 badge。
    — 导出是用户成果出口，必须显眼。

P4: Workflow-oriented（工作流导向）
    — History 是工作流入口，不是日志列表。
    — 分析结果可以一键复用（重新运行 / 导出 / 加载）。
    — 数据上传 → 分析 → 导出是一条清晰路径。

P5: Non-intrusive AI（AI 辅助但不喧宾夺主）
    — AI 功能是增强，不是必须。
    — Expert SQL 面向高级用户，不干扰普通用户。
    — Trace 是辅助信息，默认弱化。

P6: Dark-first（深色优先）
    — 保持当前深色主题风格。
    — 提高层级对比（surface / border / text）。
    — 语义色（accent / success / warning / error）保持克制。
```

### 不做清单

- ❌ 不做大而全 BI 仪表盘
- ❌ 不引入重型 UI 库（Ant Design / MUI）
- ❌ 不恢复已删除实验功能
- ❌ 不恢复 Command Palette / Global Search / Keyboard Shortcuts
- ❌ 不做复杂图表编辑器
- ❌ 不做实时协作
- ❌ 不做 Agent 界面（M5 才做）
- ❌ 不破坏当前深色风格

---

## 5. Page Information Architecture

### 5.1 首页（/）

```
Primary Goal:
用户一屏知道产品能干什么，并开始使用。

Recommended Layout:
1. Hero 区：一句话产品价值 + 主插图/图标
2. 主 CTA：两个明确按钮（上传数据 / 开始分析）
3. 快速开始：3-4 步引导（带图标，不重复 CTA）
4. 最近分析：最近 3 条 AI 分析结果（如有）
5. 系统状态：API / DB / 表数量（紧凑）

Must Fix:
- Hero 文案从抽象变为具体（"用自然语言分析你的数据"）
- Quick Start 与 Demo Flow 合并，去重
- 空态引导（首次访问时显示"上传 CSV 开始"）

Should Avoid:
- 过多卡片导致页面过长
- 重复的导航入口
- 抽象的营销文案
```

### 5.2 数据页（/data）

```
Primary Goal:
管理数据表、预览数据、快速进入分析。

Recommended Layout:
1. 左侧：上传区 + 数据表列表（可折叠）
2. 主区域：数据预览表格
3. 顶部操作栏：表名 + 行列数 + "分析此表" CTA

Must Fix:
- 上传成功后自动选中新表
- AI 分析入口加大、文案明确
- 空态引导（"拖拽 CSV 到此处开始"）

Should Avoid:
- 在 sidebar 中嵌入 AI Analysis Panel（太拥挤）
- 过多元数据信息
```

### 5.3 分析工作台（/analyze）

```
Primary Goal:
用户用自然语言或 SQL 分析当前数据表。

Recommended Layout:
1. Tab Bar：自然语言查询 / 专家 SQL（清晰切换）
2. 数据表状态条：当前表名 + 行列数（始终可见）
3. 主输入区：
   - AI Tab：问题输入框 + 示例问题 + 执行按钮
   - SQL Tab：Monaco Editor + 工具栏（分组）+ 执行按钮
4. 结果区：流式输出 / 查询结果表格
5. 操作区：查看详情 / 导出 / 保存历史

Must Fix:
- SQL Workspace 工具栏分组（执行 / AI / 格式化 / 保存 / 导出）
- AI 入口始终可见（不受 feature flag 影响）
- Example questions 与当前数据表关联
- Tab 切换有视觉过渡

Should Avoid:
- 在 SQL Workspace 中嵌入 AI Analysis Panel
- 工具栏按钮超过 8 个（溢出用 More 菜单）
- Trace 在结果区直接展开
```

### 5.4 分析详情页（/analyze/[runId]）

```
Primary Goal:
像报告一样阅读分析结果，并导出成果。

Recommended Layout:
1. 报告头部：问题 + 状态 + 数据表 + 时间 + 操作按钮
2. 报告正文（2/3 宽）：
   - Executive Summary
   - 各分析章节
   - 步骤详情（可折叠）
3. 侧边栏（1/3 宽）：
   - 评估摘要（简化）
   - 关联分析链
   - Trace（默认折叠）

Must Fix:
- Trace 默认折叠，不占据视觉主区
- Evaluation 用自然语言描述，不用色块 badge
- 导出 Markdown 是主操作按钮（Primary Button）
- 步骤详情默认折叠

Should Avoid:
- Trace 展开后占据整个页面
- Evaluation 区域过于技术化
- 操作按钮过多（保留 3-4 个核心操作）
```

### 5.5 历史页（/history）

```
Primary Goal:
复用和回查历史分析，像工作流入口。

Recommended Layout:
1. 搜索 + 筛选栏（类型 / 状态 / 时间）
2. 分组视图：按数据表分组 或 按时间分组（可切换）
3. 记录卡片：类型 badge + 问题/SQL + 元数据 + 主操作
4. 批量操作：导出全部 / 清除历史

Must Fix:
- 操作按钮默认折叠（hover 展开或 More 菜单）
- 记录卡片简化信息密度
- 导出入口更显眼

Should Avoid:
- 每条记录 6 个按钮全显示
- 无分组的纯列表
```

### 5.6 设置页（/settings）

```
Primary Goal:
低频配置：语言、主题、API 状态。

Recommended Layout:
1. 语言切换
2. 主题切换
3. API 连接状态
4. 版本信息

Must Fix:
- 当前结构已足够，无需大改
- 可以增加 API 连接状态详情

Should Avoid:
- 增加过多配置项
```

---

## 6. M4-8 Iteration Plan

### 概览

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 | 预计文件 |
|------|------|---------|---------|---------|---------|
| **M4-8.1** | Design Tokens + Base UI Cleanup | CSS variables + 全局基础组件 | 不改页面布局、不改业务逻辑、不改 store | 统一字号层级、按钮层级、卡片间距、空态、错误态 | `globals.css`, `button.tsx`, `card.tsx`, `empty-state.tsx`, `error-boundary.tsx`, `status-badge.tsx` |
| **M4-8.2** | Home + Navigation Clarity | 首页 + sidebar | 不改数据流、不改 API、不改其他页面 | 一屏知道产品用途、主 CTA 明确、sidebar 品牌清晰 | `page.tsx`(home), `sidebar.tsx` |
| **M4-8.3** | Analysis Workspace UX Polish | 分析工作台（两个 Tab） | 不改 AI 逻辑、不改 SQL 执行、不改 store | 工具栏分组、AI 入口统一、Example questions 关联数据表 | `investigation-workspace.tsx`, `sql-workspace-panel.tsx` |
| **M4-8.4** | Analysis Detail Report Layout | 分析详情页 | 不改分析逻辑、不改 store、不恢复 Trace 全展开 | 像报告不像调试页、Trace 折叠、导出显眼 | `[runId]/page.tsx`, `run-header.tsx`, `run-trace.tsx`, `run-evaluation.tsx` |
| **M4-8.5** | History UX Polish | 历史页 | 不改 history store、不改导出逻辑 | 操作按钮简化、信息密度降低、导出入口显眼 | `sql-history-panel.tsx` |
| **M4-8.6** | Data Page Polish | 数据页 | 不改上传逻辑、不改表管理、不恢复实验功能 | 上传引导清晰、AI 入口加大、空态友好 | `data/page.tsx`, `file-upload-panel.tsx`, `data-preview-panel.tsx` |
| **M4-8.7** | Settings + i18n Copy Polish | 设置页 + i18n 文案 | 不改设置逻辑、不增加新设置项 | 文案自然、API 状态可见 | `settings/page.tsx`, `en.ts`, `zh.ts` |
| **M4-8.8** | Final Frontend Regression | 全站回归测试 | 不改功能、不改逻辑 | `npx next build` pass、所有主链路可走通、无视觉回归 | 无新文件，仅测试 |

### 详细说明

#### M4-8.1 Design Tokens + Base UI Cleanup

**目标**：建立统一的视觉底座，不改页面布局。

**改动清单**：
1. 统一字号层级：
   - 页面标题：`text-lg` (18px) → `text-xl` (20px)
   - 区域标题：`text-sm` (14px) → `text-base` (16px)
   - 正文：`text-xs` (12px) 保持，但增加行高
   - 辅助信息：`text-xs` (12px) 最小，禁止 `text-[10px]`
2. 统一按钮层级：
   - Primary：实心按钮，用于主操作
   - Secondary：边框按钮，用于次要操作
   - Ghost：文字按钮，用于弱操作
   - 统一 padding：`px-4 py-2`（md），`px-3 py-1.5`（sm）
3. 统一卡片间距：
   - 卡片间距：`gap-4` (16px) 或 `gap-6` (24px)
   - 卡片内 padding：`p-4` (16px)
4. 统一状态 badge：
   - Success：绿色，不闪烁
   - Error：红色，不闪烁
   - Warning：琥珀色
   - Info：蓝色
   - 统一大小：`text-xs px-2 py-0.5 rounded-full`
5. 统一页面标题区：
   - 每个页面顶部有统一的标题区域结构
6. 改善空态组件：
   - 增加行动引导按钮
   - 图标从 emoji 改为 Lucide icon
7. 改善错误态组件：
   - 技术详情默认折叠
   - 增加"重试"按钮
   - 语气温和（"遇到了问题" 而非 "ERROR"）

**禁止**：
- 不改页面布局
- 不改数据流
- 不改 API
- 不改 store
- 不引入新依赖

**验收标准**：
- `npx next build` pass
- 所有页面字号 ≥ 12px（无 `text-[10px]`）
- 按钮有清晰的 Primary / Secondary / Ghost 层级
- 空态有行动引导
- 错误态技术详情默认折叠
- 深色主题视觉不变差

**预计文件**：
- `frontend-react/src/styles/globals.css`
- `frontend-react/src/components/ui/button.tsx`
- `frontend-react/src/components/ui/card.tsx`
- `frontend-react/src/components/ui/empty-state.tsx`
- `frontend-react/src/components/ui/error-boundary.tsx`
- `frontend-react/src/components/ui/error-fallback.tsx`
- `frontend-react/src/components/ui/status-badge.tsx`

---

#### M4-8.2 Home + Navigation Clarity

**目标**：首页一屏传达产品价值，sidebar 品牌清晰。

**改动清单**：
1. 首页 Hero 区：
   - 文案改为具体（"用自然语言分析你的数据"）
   - 增加产品截图或图标插图
2. 首页 CTA：
   - 合并 Quick Start 和 Demo Flow，去重
   - 两个主 CTA：上传数据 / 开始分析
   - 下方 3 步快速引导（不重复 CTA）
3. 首页空态：
   - 无数据时显示"上传 CSV 开始分析"引导
4. Sidebar 品牌：
   - "EAI" → "Enterprise AI" 或更清晰的品牌名
   - 增加简短描述

**禁止**：
- 不改数据流
- 不改 API
- 不改其他页面

**验收标准**：
- 首屏 3 秒内知道产品用途
- 主 CTA 按钮明确（不是两个看起来一样的按钮）
- Sidebar 品牌可理解
- `npx next build` pass

**预计文件**：
- `frontend-react/src/app/(shell)/page.tsx`
- `frontend-react/src/layout/sidebar.tsx`

---

#### M4-8.3 Analysis Workspace UX Polish

**目标**：分析工作台工具栏分组，AI 入口统一。

**改动清单**：
1. SQL Workspace 工具栏分组：
   - 执行组：执行 / 取消 / Explain
   - AI 组：AI 生成 SQL（始终可见，不受 feature flag 影响）
   - 格式化组：格式化
   - 保存组：保存查询 / Saved Queries
   - 导出组：Export Dropdown
   - 溢出用 "..." 菜单
2. AI 入口统一：
   - 移除 `showAiSqlInputInWorkspace` flag 对 AI 入口的控制
   - AI 生成 SQL 始终可见
3. Example Questions 关联数据表：
   - 根据当前表的列名生成示例问题
   - 或至少标注"基于 {tableName} 表"
4. Tab 切换优化：
   - 增加过渡动画
   - Tab 内容区统一 padding

**禁止**：
- 不改 AI 逻辑
- 不改 SQL 执行
- 不改 store
- 不恢复 feature-flag 隐藏的 AI 按钮（Explain / Insights / Charts / Anomalies）

**验收标准**：
- SQL Workspace 工具栏按钮 ≤ 8 个可见（溢出用 More）
- AI 生成 SQL 入口始终可见
- Example questions 与当前表相关
- `npx next build` pass

**预计文件**：
- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `frontend-react/src/panels/sql-workspace-panel.tsx`
- `frontend-react/src/components/sql-workspace/query-tabs-bar.tsx`（如需调整）

---

#### M4-8.4 Analysis Detail Report Layout

**目标**：分析详情页像报告，不像调试页面。

**改动清单**：
1. 布局调整：
   - 主区（2/3）：报告正文（Summary → 章节 → 步骤详情）
   - 侧边栏（1/3）：评估摘要 → 关联分析 → Trace（折叠）
2. Trace 默认折叠：
   - 不在主区展开
   - 侧边栏中用 `<details>` 折叠
3. Evaluation 简化：
   - 色块 badge → 自然语言描述
   - "High completeness" → "分析较完整"
   - 增加简短解释
4. 导出按钮显眼化：
   - "导出 Markdown" 升级为 Primary Button
   - 增加快捷键提示
5. 步骤详情默认折叠：
   - 用 `<details>` 折叠 SQL 执行步骤

**禁止**：
- 不改分析逻辑
- 不改 store
- 不恢复 Trace 全展开
- 不增加新功能

**验收标准**：
- 详情页第一眼看到的是报告内容，不是 Trace
- 导出 Markdown 是最显眼的按钮之一
- Trace 默认折叠
- Evaluation 用自然语言
- `npx next build` pass

**预计文件**：
- `frontend-react/src/app/(shell)/analyze/[runId]/page.tsx`
- `frontend-react/src/components/investigation/run-header.tsx`
- `frontend-react/src/components/investigation/run-trace.tsx`
- `frontend-react/src/components/investigation/run-evaluation.tsx`
- `frontend-react/src/components/investigation/run-sections.tsx`

---

#### M4-8.5 History UX Polish

**目标**：历史页像工作流入口，不是日志列表。

**改动清单**：
1. 操作按钮简化：
   - 默认只显示 2 个核心操作（AI: 打开详情 / 导出；SQL: 加载到工作台 / 导出）
   - 其余操作移到 "..." More 菜单
2. 信息密度降低：
   - 记录卡片间距增加
   - 元数据行简化（去掉 runtimeMs，保留 rows + 时间）
3. 导出入口显眼化：
   - "导出全部" 从 header 小按钮升级为可见按钮
4. 分组视图（可选）：
   - 按数据表分组
   - 或按时间分组（今天 / 本周 / 更早）

**禁止**：
- 不改 history store
- 不改导出逻辑
- 不增加新功能

**验收标准**：
- 每条记录默认 ≤ 2 个操作按钮
- 导出全部按钮显眼
- 信息密度降低（间距增加）
- `npx next build` pass

**预计文件**：
- `frontend-react/src/panels/sql-history-panel.tsx`

---

#### M4-8.6 Data Page Polish

**目标**：数据页上传引导清晰，AI 入口明确。

**改动清单**：
1. 上传引导：
   - 空态文案改为"拖拽 CSV / Excel 文件到此处开始"
   - 增加示例文件下载链接（可选）
2. AI 入口加大：
   - "AI" 按钮从 10px 加大到 12px
   - 文案从 "AI" 改为 "AI 分析" 或 "智能分析"
3. 上传成功后引导：
   - 上传成功后自动选中新表
   - 显示"开始分析此表" CTA
4. 数据预览空态：
   - 无数据时显示"选择左侧数据表预览"

**禁止**：
- 不改上传逻辑
- 不改表管理
- 不恢复实验功能

**验收标准**：
- 空态有明确引导
- AI 入口按钮可点击且文案明确
- 上传后有下一步引导
- `npx next build` pass

**预计文件**：
- `frontend-react/src/app/(shell)/data/page.tsx`
- `frontend-react/src/panels/file-upload-panel.tsx`
- `frontend-react/src/panels/data-preview-panel.tsx`

---

#### M4-8.7 Settings + i18n Copy Polish

**目标**：文案自然，API 状态可见。

**改动清单**：
1. i18n 文案优化：
   - "Expert SQL" → "SQL 编辑器"（中文）
   - "Autonomous" → "智能分析"（中文）
   - "Full Analysis" → "全面分析"（中文）
   - 其他生硬翻译改为自然中文
2. 设置页增加 API 状态：
   - 显示后端连接状态
   - 显示 DuckDB 连接状态
3. 设置页结构优化：
   - 分组：显示设置 / 连接状态 / 关于

**禁止**：
- 不改设置逻辑
- 不增加新设置项
- 不改 API

**验收标准**：
- 中文文案自然可读
- API 状态在设置页可见
- `npx next build` pass

**预计文件**：
- `frontend-react/src/app/(shell)/settings/page.tsx`
- `frontend-react/src/i18n/en.ts`
- `frontend-react/src/i18n/zh.ts`

---

#### M4-8.8 Final Frontend Regression

**目标**：全站回归测试，确保无视觉回归。

**改动清单**：
1. 运行 `npx next build` 确认通过
2. 手动走通 4 条核心用户路径
3. 检查所有页面空态
4. 检查所有页面错误态
5. 检查深色 / 浅色主题
6. 检查中英双语
7. 检查移动端（不崩即可）

**禁止**：
- 不改功能
- 不改逻辑
- 不增加新功能

**验收标准**：
- `npx next build` pass
- 4 条核心路径可走通
- 无视觉回归
- 无功能回归

---

## 7. M4-8.1 Scope

### 下一轮最小可执行范围

M4-8.1 只做基础视觉底座，不改业务逻辑。

#### 7.1 字号层级统一

**Before → After**：

| 元素 | Before | After |
|------|--------|-------|
| 页面标题 | `text-lg` (18px) | `text-xl` (20px) |
| 区域标题 | `text-sm` (14px) | `text-base` (16px) |
| 正文 | `text-xs` (12px) | `text-sm` (14px) |
| 辅助信息 | `text-[10px]` | `text-xs` (12px) 最小 |

**改动**：
- `globals.css`：更新 `--font-size-*` variables
- 各页面组件：将 `text-[10px]` 改为 `text-xs`

#### 7.2 按钮层级统一

**定义**：

| 层级 | 样式 | 用途 |
|------|------|------|
| Primary | 实心 accent 色 | 主操作（执行、导出、提交） |
| Secondary | 边框 + 文字色 | 次要操作（取消、重试） |
| Ghost | 纯文字 | 弱操作（关闭、折叠） |

**改动**：
- `button.tsx`：确保三种 variant 的 padding / 字号统一
- 各页面：将手动写的 `<button>` 替换为 `<Button>` 组件

#### 7.3 卡片间距统一

**定义**：
- 卡片间距：`gap-4` (16px) 或 `gap-6` (24px)
- 卡片内 padding：`p-4` (16px)
- 区域间距：`space-y-6` (24px)

**改动**：
- `card.tsx`：统一 padding
- 各页面：统一 gap 和 space-y

#### 7.4 状态 badge 统一

**定义**：
- 大小：`text-xs px-2 py-0.5 rounded-full`
- 颜色：Success 绿 / Error 红 / Warning 琥珀 / Info 蓝
- 不闪烁（去掉 animate-pulse）

**改动**：
- `status-badge.tsx`：统一大小和颜色
- 各页面：使用统一的 StatusBadge 组件

#### 7.5 页面标题区统一

**定义**：
```tsx
<div className="space-y-1">
  <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
  <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
</div>
```

**改动**：
- 各页面：统一标题区结构

#### 7.6 空态改善

**改动**：
- `empty-state.tsx`：增加 `action` prop 支持引导按钮
- 图标从 emoji 改为 Lucide icon
- 增加默认行动文案

#### 7.7 错误态改善

**改动**：
- `error-boundary.tsx` / `error-fallback.tsx`：
  - 技术详情默认折叠（`<details>`）
  - 增加"重试"按钮
  - 语气温和

#### 7.8 禁止事项

- ❌ 不改页面布局
- ❌ 不改数据流
- ❌ 不改 API
- ❌ 不改 store
- ❌ 不引入新依赖
- ❌ 不改业务逻辑
- ❌ 不恢复已删除功能

#### 7.9 验收标准

1. `npx next build` pass
2. 所有页面字号 ≥ 12px（grep 无 `text-\[10px\]`）
3. 按钮有清晰的 Primary / Secondary / Ghost 层级
4. 空态有行动引导（action prop 被使用）
5. 错误态技术详情默认折叠
6. 深色主题视觉不变差
7. 浅色主题视觉不变差
8. 每个改动文件有对应的 `git diff` 可审查

#### 7.10 预计文件

| 文件 | 改动类型 | 改动量 |
|------|---------|--------|
| `globals.css` | 更新 CSS variables | 中 |
| `button.tsx` | 统一 padding / 字号 | 小 |
| `card.tsx` | 统一 padding | 小 |
| `empty-state.tsx` | 增加 action prop + Lucide icon | 中 |
| `error-boundary.tsx` | 改善错误展示 | 小 |
| `error-fallback.tsx` | 改善错误展示 | 小 |
| `status-badge.tsx` | 统一大小和颜色 | 小 |
| 各页面组件 | 替换 `text-[10px]` + 统一间距 | 小（批量） |

---

## 8. Risks

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| UI 改动破坏主链路 | 用户无法完成核心操作 | 每轮必须 `npx next build` + 手动走通主链路 |
| 字号增大导致布局溢出 | 文字截断或换行 | 逐步增大，每轮检查溢出 |
| 按钮层级改动影响功能 | 点击区域变小或变大 | 只改样式不改 onClick |
| 空态改动过于复杂 | 用户被引导干扰 | 保持简洁，只增加 1 个行动按钮 |
| 错误态折叠后用户看不到详情 | 调试困难 | 用 `<details>` 可展开 |
| 引入过多视觉复杂度 | 页面变慢 | 不引入新依赖，只用现有 Tailwind |
| 恢复已删除实验功能 | 功能不稳定 | 每轮检查 feature flags，不改 flags |
| 每轮改动过多 | 难以回滚 | 每轮只改 1-2 个核心区域 |
| i18n 文案改动遗漏 | 中英文不一致 | 每轮同时更新 en.ts 和 zh.ts |

---

## 9. Next Step

等待用户确认后，进入 M4-8.1。

**暂不进入 M5 Agent。**
**暂不打 tag。**

M4-8.1 的执行流程：
1. 创建 `m4-8-1-design-tokens-cleanup` 分支
2. 按上述清单逐文件改动
3. 每改一个文件运行 `npx next build`
4. 全部改完后手动走通 4 条核心路径
5. 提交 + push
6. 输出测试报告

---

## 附录：当前 Design Tokens 快照

```css
/* 深色主题 */
--bg-primary: #0E1117;
--bg-secondary: #161B22;
--bg-tertiary: #21262D;
--border-default: #30363D;
--text-primary: #E6EDF3;
--text-secondary: #C9D1D9;
--text-muted: #8B949E;
--accent: #00D4AA;
--accent-hover: #00B894;
```

```css
/* 字号 */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.8125rem;  /* 13px */
--font-size-base: 0.875rem; /* 14px */
--font-size-lg: 1rem;       /* 16px */
--font-size-xl: 1.125rem;   /* 18px */
--font-size-2xl: 1.5rem;    /* 24px */
```

```css
/* 间距 */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

```css
/* 圆角 */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-full: 9999px;
```
