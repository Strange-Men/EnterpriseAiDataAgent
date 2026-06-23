# M4-8.2 Home + Navigation Clarity Planning

## 1. Problem

首页价值表达不够聚焦。用户第一眼看到的是"AI 数据分析工作台"，但接下来的内容（4步 demo flow、deploy notice、系统状态）没有清晰回答"我能用这个做什么"和"下一步点哪里"。导航结构合理，但"分析工作台"作为核心入口的突出程度不够。

## 2. User Goals

- 首次用户知道这个产品能做什么（一句话）
- 用户知道下一步点哪里（上传数据 or 开始分析）
- 用户知道当前数据表是什么
- 用户知道"分析工作台"是核心入口
- 用户知道可以用自然语言提问

## 3. Home Audit

| 区域 | 当前问题 | 用户影响 | M4-8.2 是否处理 | 最小改法 |
| ---- | ---- | ---- | ----------- | ---- |
| Hero 标题 | "AI 数据分析工作台" 清晰 | 低 | ✅ 微调 | 增加副标题强调 NL→SQL 能力 |
| Hero 副标题 | "上传 CSV/Excel 数据，用 SQL 和 AI 快速完成数据探索、质量检查与分析报告" 太长，信息密度过高 | 中 | ✅ 精简 | 拆为一句核心价值 + 三个关键词 |
| 两个主按钮 | "上传数据" 和 "分析工作台" 是对的，但"分析工作台"文案不直观 | 中 | ✅ 改文案 | 改为"开始分析"，hint 改为"用自然语言提问" |
| 4步 Demo Flow | "如何开始"卡片占空间大，步骤文字太小，且第一步和第二步都指向 /data | 中 | ✅ 精简 | 改为3个清晰入口卡片（上传 / 查询 / 分析） |
| Deploy Notice | 首页显示"Render 免费实例唤醒"提醒 | 低 | ❌ 保留 | 这是技术细节，不影响产品理解 |
| 系统状态 | API/DB/tables count 显示正常 | 低 | ❌ 不改 | 功能正常 |
| Recent Analyses | 只在有数据时显示，首次用户看不到 | 低 | ❌ 不改 | 逻辑正确 |
| Recent Queries | 只在有数据时显示，首次用户看不到 | 低 | ❌ 不改 | 逻辑正确 |
| 无导出/报告入口 | 首页没有提及 Markdown 报告导出能力 | 中 | ❌ 不在范围 | M4-8.2 只处理首页结构 |
| CTA 按钮无视觉焦点 | 两个按钮同等权重，没有主次之分 | 中 | ✅ 调整 | "开始分析"设为 primary 样式 |

## 4. Navigation Audit

| 区域 | 当前问题 | 用户影响 | M4-8.2 是否处理 | 最小改法 |
| ---- | ---- | ---- | ----------- | ---- |
| Sidebar 品牌区 | "EAI / Data Agent" 文案偏技术 | 低 | ✅ 改文案 | 改为产品全称或更易理解的缩写 |
| 当前页面高亮 | 使用 accent color + 背景色，足够明显 | 低 | ❌ 不改 | 已经清晰 |
| 导航顺序 | 首页/数据/分析工作台/历史/设置 合理 | 低 | ❌ 不改 | 顺序正确 |
| 分析工作台入口 | "分析工作台"是核心但文案不够突出 | 中 | ✅ 考虑加标签 | 可加"核心"或高亮标记 |
| 低频入口 | 无过多低频入口（5个刚好） | 低 | ❌ 不改 | 数量合理 |
| 当前数据表状态 | Header 没有显示当前选中的数据表名 | 中 | ✅ 加状态 | Header 右侧或左侧显示当前表名 |
| 移动端 | 有 drawer 实现，不崩 | 低 | ❌ 不改 | 功能正常 |
| 顶部页面标题 | 只显示 nav key 翻译，没有额外上下文 | 低 | ❌ 不改 | 当前实现可接受 |

## 5. M4-8.2 Scope

**只改：**
1. 首页 Hero 文案（中英文）
2. 首页快速开始路径（按钮文案 + 主次）
3. 首页 3 个入口卡片（替换当前 4 步 demo flow）
4. Sidebar 品牌文案优化
5. 顶部 Header 当前数据表状态文案

**不改：**
- 不改分析工作台内部
- 不改 SQL editor
- 不改 History 页面
- 不改 Settings 页面
- 不改详情页 Trace
- 不改后端
- 不改 Store
- 不改 API

## 6. Proposed Copy

### Hero 标题
- **ZH**: "AI 数据分析工作台" → 保持不变
- **EN**: "AI Data Analysis Workbench" → 保持不变

### Hero 副标题
- **ZH**: "上传数据，用自然语言提问，AI 自动生成 SQL 并给出洞察。"
- **EN**: "Upload data, ask in natural language. AI generates SQL and delivers insights."

### 两个主按钮
- **上传数据**（保持不变）：
  - ZH hint: "CSV 或 Excel 文件" → 保持
  - EN hint: "CSV or Excel files" → 保持
- **分析工作台** → **开始分析**：
  - ZH: "开始分析" / "用自然语言提问，AI 生成 SQL"
  - EN: "Start Analysis" / "Ask in natural language, AI generates SQL"

### 三个入口卡片（替换 4 步 Demo Flow）
1. **上传数据**
   - ZH: "上传 CSV / Excel 文件，或加载示例数据"
   - EN: "Upload CSV/Excel files, or load sample data"
2. **SQL 查询**
   - ZH: "在 SQL 工作台中编写和执行查询"
   - EN: "Write and execute queries in the SQL workspace"
3. **AI 分析**
   - ZH: "用自然语言提问，AI 自动生成 SQL 并分析"
   - EN: "Ask in natural language, AI generates SQL and analyzes"

### Sidebar 品牌
- **当前**: "EAI / Data Agent"
- **改为**: "EAI Data Agent"（合并为一行，更紧凑）

### Header 当前表状态
- 在 header 页面标题旁，显示当前选中的表名（如果有的话）
- ZH: "当前表: sales_data"
- EN: "Table: sales_data"

## 7. Proposed Layout

```
┌─────────────────────────────────────────────────┐
│  [EAI Data Agent]           [当前表: xxx]  [🌙] [中/EN] │
├─────────────────────────────────────────────────┤
│                                                 │
│         AI 数据分析工作台                          │
│   上传数据，用自然语言提问，AI 自动生成 SQL 并给出洞察  │
│                                                 │
│   ┌──────────────┐  ┌──────────────┐            │
│   │  📤 上传数据   │  │  🚀 开始分析  │ (primary)  │
│   │  CSV 或 Excel │  │  用自然语言提问│            │
│   └──────────────┘  └──────────────┘            │
│                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│   │ 上传数据  │ │ SQL 查询  │ │ AI 分析   │       │
│   │ CSV/Excel│ │ SQL工作台 │ │ 自然语言  │       │
│   └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│   [部署提醒]                                      │
│   [系统状态: API ✅ DB ✅ 3张表]                    │
│                                                 │
│   [最近分析] (如果有)                              │
│   [最近查询] (如果有)                              │
└─────────────────────────────────────────────────┘
```

## 8. Acceptance Criteria

- [ ] 首页一屏说明产品用途（用户 5 秒内理解）
- [ ] 三个主入口清楚（上传 / 查询 / 分析）
- [ ] "开始分析"按钮有 primary 视觉权重
- [ ] 导航当前页高亮清晰（已有）
- [ ] Header 显示当前数据表名（如果有选中表）
- [ ] 中英文文案同步更新
- [ ] `tsc --noEmit` 通过
- [ ] `vitest run` 通过
- [ ] `next build` 通过
- [ ] 不改业务逻辑、API、Store

## 9. Next Step

等待用户确认后，进入 M4-8.2 implementation。
暂不进入 M5 Agent。
暂不打 tag。
