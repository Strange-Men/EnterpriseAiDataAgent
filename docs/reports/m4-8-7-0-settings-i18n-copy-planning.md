# M4-8.7.0 Settings + i18n Copy Polish Planning

> 规划日期：2026-06-25
> 基于 master commit: `9a91252`
> 范围：仅规划，不改代码，不改 UI，不进入 M5 Agent

---

## 1. Goal

在 M4 UI/UX 封板前，对 Settings 页面和全站 i18n 文案做小范围收口，确保页面表达一致、没有明显硬编码文案、没有误导性文案。

## 2. Why This Stage Exists

M4-8.1 到 M4-8.6 已经完成主要页面改造：
- M4-8.1 Design Tokens + Base UI Cleanup ✅
- M4-8.2 Home + Navigation Clarity ✅
- M4-8.3 Analysis Workspace UX Polish ✅
- M4-8.4 Analysis Detail Report Layout ✅
- M4-8.5 History UX Polish ✅
- M4-8.6 Data Page Polish ✅

M4-8.7 不做新功能，只负责全站封板前的 Settings 和文案一致性收尾。

---

## 3. Settings Audit

### 3.1 页面结构

Settings 页面（`settings/page.tsx`）只有 76 行，包含 3 个平铺卡片：

| 卡片 | 内容 | 问题 |
|---|---|---|
| Language | 语言切换按钮 | 语言显示名 `"中文"/"English"` 硬编码（line 36） |
| Theme | 主题切换按钮 | 无问题，使用 i18n |
| Version | 系统版本 | 品牌名 `"Enterprise AI Data Agent v{version}"` 硬编码（line 68） |

### 3.2 结构问题

1. **无分组**：Language / Theme / Version 三个卡片平铺，没有 "偏好设置" vs "关于" 分组
2. **无 API 状态**：M4-8.0 规划中提到的 API 连接状态未集成到 Settings 页面
3. **版本号无 fallback**：如果 `systemStatus.version` 为 undefined，会显示 "vundefined"
4. **无空态/禁用态**：所有设置始终可用，不需要

### 3.3 Settings 审计表

| 区域 | 当前问题 | 用户影响 | M4-8.7 处理 | 最小改法 |
|---|---|---|---|---|
| Settings Header | 标题和描述使用 i18n，无问题 | 无 | 否 | — |
| Settings Sections | 无分组，三个卡片平铺 | 视觉层级弱 | 是 | 添加 "偏好设置" / "关于" 分组标题 |
| Language Copy | `"中文"/"English"` 硬编码 | 语言切换时显示名不走 i18n | 是 | 改为 i18n key |
| Theme Copy | 使用 i18n，无问题 | 无 | 否 | — |
| Version Copy | 品牌名 + "v" 前缀硬编码 | 始终显示英文品牌名 | 低优先级 | 可保留（品牌名不翻译） |
| API / Model Copy | Settings 页面无 API 状态 | 用户看不到连接状态 | 超出范围 | M4-8.7 不做（需要新组件） |
| Hardcoded Copy | 2 处硬编码（语言名 + 品牌名） | 中文界面下语言名正常，英文界面下也正常 | 是 | 迁移语言名到 i18n |
| Button Labels | 按钮文案使用 i18n，无问题 | 无 | 否 | — |
| Empty / Disabled States | 不需要（所有设置始终可用） | 无 | 否 | — |

---

## 4. i18n Copy Audit

### 4.1 Key 一致性

- **zh.ts / en.ts key 完全对应**：~380 个 key，零缺失
- **默认语言**：`zh`（中文），fallback `en`（英文）

### 4.2 翻译一致性问题

| 问题 | 涉及 key | 当前状态 | 影响 | M4-8.7 处理 |
|---|---|---|---|---|
| "Table" vs "Dataset" | `table.*` 用 "数据表/Table"，`inv.*` 用 "数据集/Dataset" | 同一概念两种翻译 | 用户困惑 | 是（统一为 "数据表/Table"） |
| "Export" vs "Download" | `report.download` 用 "下载/Download"，其他用 "导出/Export" | 一处不一致 | 轻微 | 是（统一为 "导出/Export"） |
| "历史" vs "记录" vs "历史记录" | `history.title` = "历史记录"，`history.delete` = "删除记录"，`history.clear` = "清空历史" | 三种写法混用 | 轻微 | 是（统一为 "历史记录"） |
| "Current Table" vs "Selected" | `table.current-selected-badge` = "Selected"，其他用 "Current" | badge 与其他不一致 | 轻微 | 是（统一为 "当前选中"） |

### 4.3 硬编码文案统计

| 类型 | 数量 | 涉及文件 | 严重程度 |
|---|---|---|---|
| 硬编码英文（.tsx） | ~25 处 | 7 个文件 | 高 |
| 硬编码中文（.ts） | ~30+ 处 | 1 个文件（export-markdown.ts） | 高 |
| Settings 硬编码 | 2 处 | 1 个文件（settings/page.tsx） | 中 |

### 4.4 硬编码文案详情（按严重程度排序）

**高严重度 — 用户可见的硬编码英文：**

| 文件 | 硬编码内容 | 影响 |
|---|---|---|
| `status-panel.tsx` | "AI Settings", "Model", "Temperature", "Base URL", "Status", "Connected", "API key not set", "Connection error" | 整个 AI 状态面板始终英文 |
| `workflow-banner.tsx` | "Uploading...", "Table ready:", "Analyzing", "Analysis complete:", "Executing...", "Generate SQL", "Dismiss" | 工作流横幅始终英文 |
| `analysis-section.tsx` | "No content available.", "Copied", "Copy failed", "Copy section" | Toast 和 tooltip 始终英文 |
| `report-dialog.tsx` | "Analysis Report", "Report generation failed" | 报告对话框始终英文 |
| `data-table.tsx` | placeholder="Filter..." | 筛选框始终英文 |

**高严重度 — 导出报告硬编码中文：**

| 文件 | 硬编码内容 | 影响 |
|---|---|---|
| `export-markdown.ts` | 整个 `runToMarkdown()` 函数（150 行）：所有 section header、metric label、status text 全部硬编码中文 | 英文界面下导出的 Markdown 报告仍是中文 |

**中严重度 — 分析组件硬编码：**

| 文件 | 硬编码内容 | 影响 |
|---|---|---|
| `run-sections.tsx` | `"关键发现"` / `"Key Findings"` 字符串匹配 | 匹配逻辑依赖硬编码文案 |
| `run-header.tsx` | `"摘要"` 字符串匹配 | 同上 |
| `drill-down-chain.tsx` | `"Analysis"` fallback | 空态显示英文 |
| `run-timeline.tsx` | `"Analysis"` fallback | 空态显示英文 |

---

## 5. Top Issues

1. **`status-panel.tsx` 整个 AI 状态面板硬编码英文**：6+ 个标签和状态文本不走 i18n，中英文界面都显示英文
2. **`workflow-banner.tsx` 工作流横幅硬编码英文**：7 个阶段标签和按钮文本不走 i18n
3. **`export-markdown.ts` 导出报告硬编码中文**：150 行函数全部中文硬编码，英文界面下导出仍是中文
4. **"数据表" vs "数据集" 术语不统一**：`table.*` 和 `inv.*` 两个命名空间使用不同翻译
5. **`analysis-section.tsx` Toast/tooltip 硬编码英文**：复制成功/失败提示不走 i18n

---

## 6. What M4-8.7 Will Do

- Settings 页面 copy polish（分组标题、语言名 i18n）
- Settings 视觉层级小调（分组）
- i18n key 一致性（Table/Dataset、Export/Download、History/Records 统一）
- 硬编码 UI copy 清理（status-panel、workflow-banner、analysis-section、report-dialog、data-table）
- export-markdown.ts i18n 迁移（或至少标记为后续处理）
- Copy regression 测试

## 7. What M4-8.7 Will Not Do

- 不做新功能
- 不改设置逻辑（语言切换、主题切换逻辑不变）
- 不改主题逻辑
- 不改语言切换逻辑
- 不改 API Key 逻辑
- 不改 Store
- 不改 API
- 不改后端
- 不加新设置项（不加 API 状态面板到 Settings）
- 不恢复 Templates / Scheduler / Charts / Anomalies / Diff / Timeline
- 不恢复 `/performance`、`/virtual-table`
- 不恢复 Command Palette / Global Search / Keyboard Shortcuts
- 不开始 M5 Agent

---

## 8. M4-8.7 Split Plan

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 |
|---|---|---|---|---|
| M4-8.7.1 Settings Page Copy + Visual Polish | Settings 页面文案优化 + 分组 | `settings/page.tsx` + `zh.ts` + `en.ts` 新增少量 key | 不改设置逻辑、不改主题/语言切换逻辑、不加新设置项 | Settings 页面有分组、语言名 i18n、build pass |
| M4-8.7.2 Global i18n Copy Consistency | 全站硬编码文案清理 + 术语统一 | `status-panel.tsx`、`workflow-banner.tsx`、`analysis-section.tsx`、`report-dialog.tsx`、`data-table.tsx`、`zh.ts`、`en.ts` | 不改业务逻辑、不改 Store、不改 API、不改后端 | 所有用户可见文案走 i18n、术语统一、build pass |
| M4-8.7.3 Settings + i18n Regression | 回归测试 | 新增回归测试文件 | 不改业务逻辑 | 测试覆盖 Settings + i18n 关键路径、952+ tests pass |

**注意**：`export-markdown.ts` 的硬编码中文问题（150 行）可能需要较大改动。如果 M4-8.7.2 范围过大，可以将 `export-markdown.ts` 的 i18n 迁移推迟到 M4-8.7.2 之后单独处理，或在 M4-8.7.2 中只做标记（添加 TODO 注释）而不完整迁移。报告中需要说明理由。

---

## 9. M4-8.7.1 Scope

下一轮最小范围只做 Settings Page Copy + Visual Polish。

### 允许

- 优化 Settings 标题和说明（已是 i18n，无需改动）
- 添加 "偏好设置" / "关于" 分组标题
- 迁移语言显示名 `"中文"/"English"` 到 i18n
- 修 obvious typo（如有）
- 小幅调整视觉层级（分组间距）

### 禁止

- 不改设置逻辑
- 不改主题逻辑
- 不改语言切换逻辑
- 不改 API Key 逻辑
- 不改 Store
- 不改 API
- 不改后端
- 不加新设置项
- 不加新功能

### 预计改动文件

| 文件 | 改动类型 | 改动量 |
|---|---|---|
| `settings/page.tsx` | 添加分组、迁移硬编码 | 小 |
| `zh.ts` | 新增 2-3 个 key | 极小 |
| `en.ts` | 新增 2-3 个 key | 极小 |

### 验收标准

- Settings 页面有 "偏好设置" 和 "关于" 分组
- 语言显示名使用 i18n
- `npx next build` pass
- `npm run test` pass
- 不改设置逻辑

---

## 10. Known Risks

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| 全站 i18n 硬编码文案较多（~55 处） | M4-8.7.2 可能范围过大 | 优先处理用户可见的 .tsx 文件，export-markdown.ts 可推迟 |
| "Table/Dataset" 统一可能影响已有 key | 改 key 值需要同步更新所有引用 | 只改翻译值，不改 key 名 |
| export-markdown.ts 硬编码中文与 prompt 架构耦合 | 部分中文文案可能是 prompt 的一部分 | 仔细区分 UI copy 和 prompt copy |
| Settings 页面如果绑定真实用户偏好 | 改分组可能影响用户习惯 | 只做视觉分组，不改功能 |
| M4-8.7 后还需要 M4-8.8 Final Frontend Regression | 文案改动需要回归验证 | M4-8.7.3 专门做回归 |

---

## 11. Next Step

等待用户确认后，进入 M4-8.7.1 Settings Page Copy + Visual Polish。
暂不进入 M5 Agent。
暂不打 tag。
