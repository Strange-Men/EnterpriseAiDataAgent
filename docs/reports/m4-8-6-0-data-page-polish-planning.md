# M4-8.6.0 Data Page Polish Planning

> 规划日期：2026-06-25
> 基于 master commit: 81d112e
> 范围：仅规划，不改代码，不改 UI，不进入 M5 Agent

---

## 1. Problem

数据页当前更像上传与表格管理页面，不够像"准备分析数据"的工作流入口。

用户进入 Data Page 后，应该能快速理解：

- 我可以上传什么数据
- 当前有哪些数据表
- 哪张表正在被分析
- 数据质量是否基本可用
- 下一步如何进入 AI 分析或专家 SQL

当前 Data Page 存在的问题：

- 没有页面标题或说明，用户不知道这个页面是干什么的
- 上传区、表列表、预览区之间的工作流关系不清晰
- 当前选中的表没有视觉突出
- 上传成功后的下一步引导不够明显
- Data Quality 指标偏技术化，普通用户难以理解
- 空态、删除确认、错误态需要更产品化

---

## 2. Audit

### Data Page UX 审计表

| 区域 | 当前问题 | 用户影响 | 是否 M4-8.6 处理 | 最小改法 |
|---|---|---|---|---|
| **页面首屏** | 无页面标题、无说明文案、无引导 | 用户不知道这个页面是干什么的 | ✅ M4-8.6.1 | 添加标题 + 一句话说明 |
| **Upload 区域** | 空态 icon 为空字符串（渲染为空白圆圈）；硬编码英文描述；拖拽提示无实际 drag 事件；上传后无下一步引导 | 用户不知道能上传什么、上传后做什么 | ✅ M4-8.6.1 | 修复空态 icon；i18n 化描述；明确上传后流程 |
| **Table List** | 选中表无高亮；操作按钮仅 hover 可见（触屏不可用）；表名/行数/列数信息密度适中但缺少时间 | 用户不知道当前选中了哪张表 | ✅ M4-8.6.2 | 添加选中高亮；优化信息展示 |
| **Current Table 状态** | 无专门的当前表卡片；当前表信息分散在预览区 header | 用户不清楚哪张表正在被分析 | ✅ M4-8.6.2 | 添加 Current Table Card |
| **Preview** | 预览区空态用空格字符 icon；硬编码英文描述；`preview.showing` i18n key 存在但未使用；无行数指示 | 用户不知道有多少行数据 | ✅ M4-8.6.3 | 修复空态；使用已有 i18n key；添加行数提示 |
| **Data Quality** | 质量分数无解释（72 分意味着什么？）；无 tooltip；偏技术化 | 普通用户不理解质量指标含义 | ✅ M4-8.6.3 | 添加分数说明；优化布局 |
| **Empty State** | 多处空态 icon 为空字符串或空格；描述硬编码英文；无行动引导 | 用户不知道下一步该干什么 | ✅ M4-8.6.4 | 修复 icon；i18n 化；添加行动按钮 |
| **Delete / Error State** | 删除用原生 `confirm()`；错误态用红色技术信息 | 删除不安全；错误吓人 | ✅ M4-8.6.4 | 使用自定义确认对话框；友好错误提示 |
| **Cross-page Flow** | 选中表不突出，用户不知道当前表会被带到分析工作台；删除当前表后无清楚反馈 | 从 Data Page 到分析工作台的过渡不顺畅 | ⚠️ 部分在 M4-8.6.2/4 处理 | 当前表状态更突出；删除后引导 |

### 其他审计发现

| 问题 | 影响 | 处理建议 |
|---|---|---|
| 15+ 硬编码英文字符串绕过 i18n | 中文用户看到英文空态/提示 | M4-8.6.1 优先处理上传区 i18n |
| StatusPanel "AI Settings" 等 6+ 字符串硬编码 | AI 配置区全英文 | M4-8.6.1 或后续阶段 |
| 上传 toast 消息硬编码英文 | 上传反馈全英文 | M4-8.6.1 |
| 表重复出现在 FileUploadPanel 和 TableManagementPanel | 用户困惑 | 不在 M4-8.6 处理（涉及结构改动） |
| `uploadTime` 始终为 null | 数据生命周期指标缺失 | 不在 M4-8.6 处理（需改 store） |
| QualityGates 组件在 Data Page 未使用 | 质量展示碎片化 | M4-8.6.3 考虑 |

---

## 3. Data Page 最大问题 Top 5

### 问题 1：上传、表选择、预览、分析入口之间的工作流关系不够清楚

当前 Data Page 是四个独立面板的拼接：FileUploadPanel、TableManagementPanel、StatusPanel、DataPreviewPanel。用户不知道应该先做什么、再做什么。

**影响**：新用户不知道"上传 → 选择表 → 预览 → 分析"的工作流。

**最小改法**：添加页面标题和一句话说明，明确页面目的。

### 问题 2：当前选中表状态不够突出

TableManagementPanel 中选中的表没有高亮样式。FileUploadPanel 和 TableManagementPanel 都能选择表，但都没有视觉反馈。

**影响**：用户不知道当前预览的是哪张表，也不知道这张表会被带到分析工作台。

**最小改法**：在 TableManagementPanel 中为选中表添加高亮样式。

### 问题 3：上传后的下一步引导不够明显

上传成功后只有 toast 消息（硬编码英文），没有明确的"下一步"引导。

**影响**：用户上传完文件后不知道该干什么。

**最小改法**：上传成功后显示引导文案（如"已上传成功，请在左侧选择表格开始分析"）。

### 问题 4：Data Quality 容易偏技术化

质量分数（completeness、consistency、validity、uniquiness）用数字展示，无解释。普通用户不知道 72 分是好还是坏。

**影响**：用户不理解数据质量指标，无法判断数据是否可用。

**最小改法**：为质量分数添加简单说明（如"数据质量良好"、"存在部分缺失"）。

### 问题 5：空态 / 删除 / 失败状态需要更产品化

多处空态 icon 为空字符串（渲染为空白圆圈），描述硬编码英文。删除用原生 `confirm()`，错误用红色技术信息。

**影响**：空态看起来像 bug；删除不安全；错误吓人。

**最小改法**：修复空态 icon；i18n 化描述；使用自定义确认对话框；友好错误提示。

---

## 4. Upload 区域主要问题

### 4.1 上传入口是否明显

- 上传区是一个 dashed-border 拖拽区域，位于左侧 sidebar 顶部
- 有 `upload.dropzone` i18n key 和 "CSV, XLSX, XLS" 提示
- **问题**：空态时整个页面只有一个拖拽区域，没有说明"这里是上传入口"

### 4.2 支持 CSV / Excel 是否清楚

- 拖拽区域下方有 "CSV, XLSX, XLS" 静态提示
- **问题**：提示字号偏小（`text-xs`），不够突出

### 4.3 上传限制是否清楚

- 无文件大小限制提示
- 无文件格式验证反馈
- **问题**：用户不知道能上传多大的文件

### 4.4 上传成功后的下一步是否清楚

- 上传成功后只有 toast 消息（硬编码英文）：`Uploaded X file(s) successfully`
- 自动调用 `loadTables()` 刷新表列表
- **问题**：没有明确的"请选择表格开始分析"引导

### 4.5 上传失败是否友好

- 上传失败有 toast 消息
- **问题**：错误消息可能是技术性的，不够友好

---

## 5. Table List / Current Table 主要问题

### 5.1 当前表是否突出

- TableManagementPanel 中选中的表没有高亮样式
- FileUploadPanel 中的表也没有选中指示
- **问题**：用户不知道当前预览的是哪张表

### 5.2 表名 / 行数 / 列数 / 时间是否易读

- 表名用 Tooltip 截断显示
- 行数和列数显示为 `rows × cols` 格式
- 分析次数 badge（如 "3A"）有 title 但无即时 tooltip
- **问题**：信息密度适中，但缺少上传时间

### 5.3 删除表是否过于危险或过于隐藏

- 删除按钮仅 hover 可见（`opacity-0 group-hover:opacity-100`）
- 删除确认用原生 `confirm()` 对话框
- **问题**：触屏设备无法发现删除按钮；原生对话框与设计风格不一致

### 5.4 表为空时是否有引导

- 无表时显示空态：i18n `table.no-tables` + 硬编码英文描述 `"Upload a file to create your first table"`
- **问题**：空态 icon 为空字符串（空白圆圈），描述硬编码英文

### 5.5 选择表后是否明确影响分析工作台

- 选中表会调用 `investigationStore.setContext({ table })`
- 但 Data Page 没有视觉反馈说明"这张表会被带到分析工作台"
- **问题**：用户不知道选表的全局影响

---

## 6. Preview / Data Quality 主要问题

### 6.1 预览表是否清楚

- 预览区有三个 tab：Preview、Schema、Quality
- Preview tab 显示数据表格
- **问题**：无行数/分页指示（`preview.showing` i18n key 存在但未使用）

### 6.2 是否知道这里只是预览，不是完整表格工具

- 预览区标题为 `preview.title`（"数据预览"）
- **问题**：没有明确说明"这只是预览，完整分析请使用分析工作台"

### 6.3 Data Quality 是否友好

- Quality tab 显示四个分数卡片（completeness、consistency、validity、uniquiness）
- 颜色编码：绿色 ≥ 80，黄色 ≥ 60，红色 < 60
- **问题**：分数无解释，用户不知道 72 分意味着什么

### 6.4 缺失值 / 字段类型 / 行数列数是否容易理解

- Quality tab 有 stats 区域（null cells、duplicates、outliers）和 field health 表
- **问题**：stats 用纯文本 `<p>` 标签展示，不够结构化

### 6.5 是否有开始分析入口

- 预览区没有"开始分析"按钮
- **问题**：用户看完预览后不知道下一步该干什么

---

## 7. Cross-page Flow 主要问题

### 7.1 从 Data Page 到 Analysis Workspace 是否顺畅

- Data Page 选中表 → Analysis Workspace 自动加载该表
- 但 Data Page 没有明确的"前往分析"按钮
- **问题**：用户需要手动切换到 Analysis 页面

### 7.2 当前 active table 是否会被带过去

- 是的，`investigationStore.setContext({ table })` 会设置全局 active table
- **问题**：Data Page 没有视觉反馈说明这个行为

### 7.3 从 History 回来后是否容易理解当前表状态

- History 页面可以打开分析详情，但不会影响 Data Page 的当前表状态
- **问题**：用户从 History 回来后，Data Page 仍显示之前的表，可能造成困惑

### 7.4 删除当前表后是否有清楚反馈

- 删除表后调用 `loadTables()` 刷新列表
- 如果删除的是当前预览的表，预览区会变空
- **问题**：没有明确的"当前表已删除"反馈

---

## 8. 推荐 Data Page 页面结构

### 当前结构

```
Data Page (/data)
├── Left Sidebar (w-72)
│   ├── FileUploadPanel (拖拽上传 + 数据库表列表 + 已上传文件)
│   ├── Divider
│   ├── TableManagementPanel (表列表 + 操作按钮)
│   ├── Divider
│   └── StatusPanel (系统状态 + AI 配置)
└── Main Area (flex-1)
    └── DataPreviewPanel (Preview / Schema / Quality tabs)
```

### 建议结构

```
Data Page (/data)
├── Page Header
│   ├── 标题：数据
│   └── 说明：上传 CSV/Excel，选择数据表，并开始 AI 分析
├── Upload Guidance (优化后的上传区)
│   ├── 支持格式：CSV, XLSX, XLS
│   ├── 上传限制说明
│   └── 上传后流程说明
├── Current Table Card (新增)
│   ├── 当前选中表名
│   ├── 行数 / 列数 / 状态
│   └── 开始分析按钮
├── Table List (优化后的表列表)
│   ├── 表名 / 行数 / 列数 / 更新时间
│   ├── 选中高亮
│   └── 选择 / 删除操作
├── Preview + Data Quality (优化后的预览区)
│   ├── 数据预览（带行数指示）
│   ├── 字段概览
│   └── 基础质量提示（带解释）
└── Empty / Error State (优化后的空态)
    ├── 上传数据引导
    ├── 查看示例数据
    └── 返回首页
```

---

## 9. Design Principles

### 9.1 Data Page is a preparation workspace, not only a file uploader

Data Page 不只是上传文件的地方，而是"准备分析数据"的工作流入口。用户应该能在这里完成：

- 上传数据
- 选择要分析的表
- 预览数据
- 检查数据质量
- 进入 AI 分析

### 9.2 Current table must be obvious

当前选中的表必须在视觉上突出。用户应该能一眼看出：

- 当前选中了哪张表
- 这张表有多少行、多少列
- 这张表的数据质量如何
- 如何开始分析这张表

### 9.3 Upload should lead to analysis

上传不应该是一个孤立的操作。上传成功后，应该有明确的引导告诉用户下一步该干什么。

### 9.4 Data Quality should be understandable, not overly technical

Data Quality 不应该只显示数字。应该用简单的语言解释：

- 数据质量是好是坏
- 有哪些需要注意的问题
- 是否可以开始分析

### 9.5 Delete actions should be safe and clear

删除操作应该：

- 有明确的确认对话框（不是原生 `confirm()`）
- 说明删除后的影响
- 提供撤销机会（如果可能）

### 9.6 No complex BI features

Data Page 不应该做成复杂 BI 工具。保持简单：

- 不做数据清洗
- 不做数据转换
- 不做多表关联
- 不做复杂图表

---

## 10. M4-8.6 Split Plan

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 |
|---|---|---|---|---|
| **M4-8.6.1** Data Page Header + Upload Guidance | 优化标题区和上传引导 | Header / upload copy / upload guidance / empty copy | 不改上传逻辑 / 不改 store / 不改 API / 不改后端 | 用户知道能上传什么、上传后做什么 |
| **M4-8.6.2** Table List / Current Table Card Polish | 突出当前表和表列表信息层级 | Current table card / table list | 不改选择表逻辑 / 不改删除逻辑 / 不改 store | 当前表明确，表信息易读 |
| **M4-8.6.3** Preview + Data Quality Polish | 优化预览和数据质量表达 | Preview / quality panel | 不改质量计算逻辑 / 不改 store | 用户能理解数据是否可分析 |
| **M4-8.6.4** Delete / Empty / Error State Polish | 优化删除、空态、错误态 | Delete confirmation / empty / error | 不改删除逻辑 / 不改 store | 危险操作清楚，失败不吓人 |
| **M4-8.6.5** Data Page Regression | 回归测试 | tests / report | 不做新功能 | Data Page 主链路稳定 |

### 每阶段共同禁止事项

- 不改后端
- 不改 API
- 不改 Store 数据结构
- 不改上传处理逻辑
- 不改表删除逻辑
- 不改 Data Quality 计算逻辑
- 不恢复已删除实验功能
- 每阶段必须 tsc/test/build/lint 通过

---

## 11. M4-8.6.1 Scope

### 下一轮最小范围只做

```text
Data Page Header + Upload Guidance
```

### 允许

- 优化数据页标题区（添加标题 + 说明文案）
- 明确数据页作用（"上传 CSV/Excel，选择数据表，并开始 AI 分析"）
- 优化上传区文案（支持格式、上传限制、上传后流程）
- 明确 CSV / Excel 支持
- 明确上传后下一步：选择表 → 开始分析
- 优化空态引导（修复空态 icon、i18n 化描述）
- 修复硬编码英文字符串（至少上传区相关的）

### 禁止

- 不改上传逻辑
- 不改表列表逻辑
- 不改 Data Quality 逻辑
- 不改 Store
- 不改 API
- 不改后端
- 不改删除逻辑
- 不改 StatusPanel（后续阶段处理）

### 预计改动文件

| 文件 | 改动类型 | 改动量 |
|---|---|---|
| `frontend-react/src/app/(shell)/data/page.tsx` | 添加页面标题区 | 小 |
| `frontend-react/src/panels/file-upload-panel.tsx` | 优化上传区文案、修复空态、i18n 化 | 中 |
| `frontend-react/src/i18n/zh.ts` | 添加/更新 data page 相关 key | 小 |
| `frontend-react/src/i18n/en.ts` | 添加/更新 data page 相关 key | 小 |

### 验收标准

1. `tsc --noEmit` 通过
2. `vitest run` 通过
3. `next build` 通过
4. 页面有标题和说明文案
5. 上传区支持格式清楚
6. 上传后有下一步引导
7. 空态 icon 不为空白圆圈
8. 空态描述使用 i18n（中英文）
9. 深色主题视觉不变差

---

## 12. Known Risks

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| 上传失败 / 文件格式错误时仍需清晰提示 | 用户不知道为什么上传失败 | 保持现有错误 toast，后续阶段优化错误态 |
| 删除当前表可能影响分析工作台和历史记录 | 用户删除表后分析工作台可能显示异常 | M4-8.6.4 处理删除确认和反馈 |
| Data Quality 可能需要后续统一指标口径 | 不同页面的质量指标可能不一致 | M4-8.6.3 考虑 QualityGates 组件整合 |
| 不能把 Data Page 做成复杂 BI 工具 | 增加认知负担，偏离产品定位 | 严格遵守不做清单 |
| 如果 active table 和用户当前看到的表不一致 | 影响后续分析体验 | M4-8.6.2 处理当前表状态突出 |
| 15+ 硬编码英文字符串 | 中文用户体验差 | M4-8.6.1 优先处理上传区 i18n |
| 表重复出现在两个面板 | 用户困惑 | 不在 M4-8.6 处理（涉及结构改动） |
| `uploadTime` 始终为 null | 数据生命周期指标缺失 | 不在 M4-8.6 处理（需改 store） |

---

## 13. Next Step

等待用户确认后，进入 M4-8.6.1 implementation。

**暂不进入 M5 Agent。**
**暂不打 tag。**

M4-8.6.1 的执行流程：

1. 在 `m4-8-6-0-data-page-polish-planning` 分支上创建 `m4-8-6-1-data-page-header-upload-guidance` 分支
2. 按上述清单逐文件改动
3. 每改一个文件运行 `npx next build`
4. 全部改完后手动走通 Data Page 主链路
5. 提交 + push
6. 输出测试报告
