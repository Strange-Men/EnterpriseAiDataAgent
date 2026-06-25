# M4-8.5.0 History UX Planning

> 规划日期：2026-06-25
> 基于 master commit: 259431f
> 范围：仅规划，不改代码，不改 UI，不进入 M5 Agent

---

## 1. Problem

历史页当前更像查询日志，不像可回查、可复用、可继续工作的历史工作台。

用户进入 History 页后，应该能快速理解：
- 我之前做过哪些 AI 分析 / SQL 查询
- 每条记录基于哪张表
- 哪些记录还能继续使用
- 哪些记录的数据表已经失效
- 我能查看详情、重新运行、加载到工作台、导出结果

当前实现中，`sql-history-panel.tsx` 是一个扁平列表，每条记录显示 4 个操作按钮，没有区分主次。标题区只有 "查询历史" + 计数 + 导出/清空小按钮，用户无法一屏理解这个页面的定位。

---

## 2. Audit

### 2.1 当前代码结构

- 页面：`frontend-react/src/app/(shell)/history/page.tsx` — 极简，只有 PageHeader + SqlHistoryPanel
- 面板：`frontend-react/src/panels/sql-history-panel.tsx` — 所有逻辑集中在一个文件（390 行）
- Store：`frontend-react/src/stores/sql-history-store.ts` — 持久化到 localStorage + 后端合并
- i18n：`history.*` keys 在 `zh.ts` 和 `en.ts` 中完整

### 2.2 审计表

| 区域 | 当前问题 | 用户影响 | 是否 M4-8.5 处理 | 最小改法 |
|---|---|---|---|---|
| **页面首屏** | 标题 "查询历史" + 副标题过于通用，用户不知道这里能做什么 | 无法一屏理解页面定位 | M4-8.5.1 | 改标题为"历史工作台"或"分析与查询历史"，副标题说明用途 |
| **页面首屏** | 没有区分 AI 分析历史 / 专家 SQL 历史的视觉入口 | 用户需要靠 type badge 区分 | M4-8.5.1 | 将 type filter 从 `<select>` 改为可见的 filter chips |
| **AI 历史** | "查看详情" 和 "重新运行" 按钮视觉层级相同 | 用户不清楚哪个是主操作 | M4-8.5.3 | "查看详情" 改为 primary，其余放入 More 菜单 |
| **AI 历史** | "复制问题" 按钮始终显示，占用空间 | 4 个按钮堆叠，信息过载 | M4-8.5.3 | 移入 More 菜单 |
| **AI 历史** | 导出 Markdown 按钮不够显眼 | 用户找不到成果出口 | M4-8.5.3 | 保留为 secondary action |
| **SQL 历史** | "加载到工作台" 和 "重新执行" 按钮视觉层级相同 | 用户不清楚哪个是主操作 | M4-8.5.3 | "加载到工作台" 改为 primary，"重新执行" 放入 More |
| **SQL 历史** | "导出 CSV" 导出的是查询元数据，不是查询结果 | 用户期望导出的是数据 | M4-8.5.3 | 保留当前行为，但文案改为"导出查询"更准确 |
| **SQL 历史** | "复制 SQL" 按钮始终显示 | 4 个按钮堆叠 | M4-8.5.3 | 移入 More 菜单 |
| **历史卡片** | `runtimeMs` 以毫秒显示（如 "1234ms"），过于技术化 | 普通用户看不懂 | M4-8.5.2 | 改为人类可读格式（如 "1.2s"） |
| **历史卡片** | AI 记录的 summary 用 `line-clamp-2` 但没有展开入口 | 长摘要被截断后无法查看 | M4-8.5.2 | 增加 hover 展开或点击展开 |
| **历史卡片** | 记录间距 `space-y-2`（8px），太紧凑 | 信息密度高，视觉疲劳 | M4-8.5.2 | 改为 `space-y-3`（12px） |
| **操作按钮** | 所有按钮始终显示，无主次之分 | 视觉噪音，用户不知道点哪个 | M4-8.5.3 | 默认只显示 1-2 个主操作，其余放 More |
| **操作按钮** | 删除按钮用 `opacity-0 group-hover:opacity-100` 隐藏 | 用户可能找不到删除功能 | M4-8.5.3 | 保留 hover 显示，但移到 More 菜单更一致 |
| **旧记录 / 失效表** | `isTableValid` 检查存在于 handler 中，但卡片上无视觉提示 | 用户点击后才知道表已失效 | M4-8.5.4 | 卡片上显示 "数据表已失效" badge |
| **旧记录 / 失效表** | 失效记录的 "重新执行" / "加载到工作台" 仍可点击（会 toast 报错） | 用户操作被打断 | M4-8.5.4 | 对失效记录禁用执行类操作，保留复制类操作 |
| **筛选 / 搜索** | type filter 和 status filter 用原生 `<select>` | 视觉不一致，不够产品化 | M4-8.5.1 | 改为 filter chips 或 styled select |
| **筛选 / 搜索** | 搜索框 placeholder "搜索问题或 SQL..." 不够明确 | 用户不确定能搜什么 | M4-8.5.1 | 改为 "搜索问题、SQL 或表名..." |
| **空态** | 有搜索结果时显示 "未找到匹配的记录"，无搜索时显示 "暂无历史记录" | 文案足够但无行动引导 | M4-8.5.1 | 增加 "开始分析" 或 "上传数据" 引导按钮 |
| **空态** | 不区分 "没有 AI 历史" 和 "没有 SQL 历史" | 用户筛选后空态无针对性 | M4-8.5.1 | 空态文案根据当前 filter 显示不同引导 |

---

## 3. History 最大问题 Top 5

### 1. History 更像日志列表，不像继续工作的入口

当前页面标题是 "查询历史"，副标题是 "查看和管理您的查询历史"。这定位为"查看"，而不是"继续工作"。用户看到的是一堆记录，不知道哪些可以继续用、哪些已经失效。

**改法**：标题区明确页面用途，增加 "回查、复用和导出之前的分析与查询" 的定位说明。

### 2. AI 历史和 SQL 历史虽有区分，但工作流主次还不够清楚

AI 记录有 type badge "AI 分析"（紫色），SQL 记录有 "专家 SQL"（蓝色），但操作按钮的主次没有区分。AI 记录的主操作应该是"查看详情"，SQL 记录的主操作应该是"加载到工作台"。

**改法**：不同类型记录的主操作按钮用 primary 样式，其余用 secondary 或放入 More。

### 3. 卡片信息密度和按钮层级需要优化

每条记录 4 个操作按钮始终显示，加上元数据行（status dot + table + runtime + rows + time），信息密度很高。`runtimeMs` 用毫秒显示过于技术化。

**改法**：减少默认可见按钮数量，优化元数据展示格式。

### 4. 旧表 / 旧 SQL / 旧记录失效时需要更明确提示

`isTableValid` 检查只在用户点击操作时触发 toast 报错，卡片本身没有任何视觉提示。用户可能花时间阅读一条已经无法使用的记录。

**改法**：对失效记录在卡片上显示明确的状态提示，并禁用执行类操作。

### 5. 空态和筛选状态需要更产品化

空态只有文字说明，没有行动引导。筛选用原生 `<select>`，视觉不一致。搜索框 placeholder 不够明确。

**改法**：空态增加引导按钮，筛选改为 filter chips。

---

## 4. AI 历史主要问题

| 检查项 | 当前状态 | 问题 | 建议 |
|---|---|---|---|
| 查看详情 | 按钮存在，purple 样式 | 不够突出（与 re-run 同级） | 改为 primary action |
| 重新运行 | 按钮存在，secondary 样式 | 对失效表会 toast 报错 | 失效时禁用 |
| 复制问题 | 按钮始终显示 | 占用空间，低频操作 | 移入 More 菜单 |
| 导出 Markdown | 按钮存在，secondary 样式 | 不够显眼 | 保留为 secondary |
| 关联表 | 显示 tableName + accent 色 | 正常 | 保留 |
| 状态 | status dot（绿/琥珀/红） | 正常 | 保留 |
| 时间 | 显示完整时间戳 | 正常 | 保留 |
| 问题摘要 | 100 字符截断 + summary 2 行截断 | 长摘要无法展开 | 增加展开入口 |

AI 历史的主路径应该是：**查看详情 → 阅读报告 → 导出 Markdown**。当前 "查看详情" 按钮样式不够突出，应该成为卡片上最显眼的操作。

---

## 5. SQL 历史主要问题

| 检查项 | 当前状态 | 问题 | 建议 |
|---|---|---|---|
| 加载到工作台 | 按钮存在，blue 样式 | 不够突出（与 re-execute 同级） | 改为 primary action |
| 重新执行 | 按钮存在，secondary 样式 | 可能误导用户执行失效 SQL | 失效时禁用 |
| 复制 SQL | 按钮始终显示 | 占用空间 | 移入 More 菜单 |
| 导出 CSV | 按钮存在，secondary 样式 | 导出的是查询元数据不是结果 | 文案改为"导出查询" |
| 表名 | 显示 tableName + mono 字体 | 正常 | 保留 |
| 行数 | 显示 rowCount | 正常 | 保留 |
| 耗时 | 显示 `runtimeMs`（毫秒） | 过于技术化 | 改为人类可读格式 |
| SQL 摘要 | 100 字符截断 | 长 SQL 无法预览 | 增加 hover 展开 |

SQL 历史的主路径应该是：**加载到工作台 → 修改 SQL → 执行**。当前 "加载到工作台" 按钮样式应该成为 primary action。

---

## 6. 旧记录 / 失效表主要问题

这是 History UX 中最需要谨慎处理的问题。

### 6.1 问题描述

历史记录可能关联已不存在的数据表。这种情况在以下场景中出现：
- 用户上传了 CSV，做了分析，后来删除了该表
- 用户上传了 CSV，做了 SQL 查询，后来上传了同名但不同结构的表
- 后端数据库重建，旧表丢失

### 6.2 当前行为

- `isTableValid` 函数检查 `tableName` 是否存在于 `tables` 数组中
- 当用户点击 "重新运行" 或 "加载到工作台" 时，如果表不存在，显示 toast 错误："该历史记录关联的数据表「xxx」已不存在，请重新选择数据表。"
- **卡片本身没有任何视觉提示**，用户需要点击操作后才知道表已失效

### 6.3 风险

- 用户可能花时间阅读一条已经无法使用的分析记录
- 用户可能复制一条失效的 SQL 去执行
- 用户可能对失效记录反复尝试操作，每次都被 toast 打断

### 6.4 M4-8.5.4 处理方案

- 在卡片上对失效记录显示 "数据表已失效" badge
- 禁用执行类操作（重新运行、加载到工作台、重新执行）
- 保留复制类操作（复制问题、复制 SQL）
- 保留查看详情（AI 记录的报告内容不依赖表存在）
- 保留导出操作（Markdown / CSV 导出不依赖表存在）

### 6.5 注意

- 这是 M4-8.5.4 的重点，不要在 M4-8.5.1 直接处理
- 不改 store 结构
- 不改后端
- 只在 UI 层增加视觉提示和操作禁用

---

## 7. 操作按钮主要问题

### 7.1 当前按钮清单

**AI 记录**（4 个按钮）：
1. 查看详情（purple）— 主操作
2. 重新运行（secondary）— 次操作
3. 导出 Markdown（secondary）— 次操作
4. 复制问题（secondary）— 低频操作

**SQL 记录**（4 个按钮）：
1. 加载到工作台（blue）— 主操作
2. 重新执行（secondary）— 次操作
3. 导出 CSV（secondary）— 次操作
4. 复制 SQL（secondary）— 低频操作

**通用**（1 个按钮）：
5. 删除（hover 显示）— 低频操作

### 7.2 问题

- 所有按钮始终显示，无主次之分
- 4 个按钮堆叠在同一行，视觉噪音大
- 用户不清楚哪个是核心操作

### 7.3 建议方案

**默认显示**：
- AI 记录：查看详情（primary）+ More 菜单
- SQL 记录：加载到工作台（primary）+ More 菜单

**More 菜单包含**：
- AI 记录：重新运行、导出 Markdown、复制问题、删除
- SQL 记录：重新执行、导出 CSV、复制 SQL、删除

### 7.4 禁止

- 不恢复 Save / Template 混乱语义
- 不引入新的保存/收藏功能
- AI 导出必须是 Markdown，SQL 导出必须是 CSV/查询元数据

---

## 8. 推荐 History 页面结构

```
Page Header
├── 标题：历史工作台（或"分析与查询历史"）
├── 说明：回查、复用和导出之前的分析与查询
└── 操作：导出全部 / 清空历史

Quick Filters
├── 全部（默认）
├── AI 分析（紫色 chip）
├── 专家 SQL（蓝色 chip）
└── 搜索框

Record List
├── AI Record Card
│   ├── Type badge（AI 分析）
│   ├── 问题摘要（100 字符）
│   ├── AI summary（2 行，可展开）
│   ├── 元数据：表名 · 状态 · 行数 · 时间
│   └── 操作：查看详情（primary）+ More（重新运行 / 导出 MD / 复制问题 / 删除）
│
└── SQL Record Card
    ├── Type badge（专家 SQL）
    ├── SQL 摘要（100 字符）
    ├── 元数据：表名 · 状态 · 行数 · 耗时 · 时间
    └── 操作：加载到工作台（primary）+ More（重新执行 / 导出 CSV / 复制 SQL / 删除）

Empty State
├── 无历史：引导"上传数据"或"开始分析"
├── 无搜索结果：引导"尝试其他搜索词"
└── 筛选为空：引导"切换筛选条件"

Stale Record State（M4-8.5.4）
├── "数据表已失效" badge
├── 禁用执行类操作
└── 保留复制 / 查看 / 导出
```

---

## 9. Design Principles

- **History is a workflow entry, not a log dump** — 用户来这里是为了继续工作，不是看日志
- **AI history and SQL history should be distinguishable but unified** — 用 type badge 区分，但操作逻辑统一
- **Primary actions must be obvious** — 每种记录只有一个 primary action，其余放入 More
- **Stale table / invalid record must be handled gracefully** — 卡片上明确提示，不要让用户点击后才知道
- **Export actions should match record type** — AI → Markdown，SQL → CSV
- **No template / save confusion** — 不引入新的保存/收藏语义，History 就是 History

---

## 10. M4-8.5 Split Plan

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 |
|---|---|---|---|---|
| **M4-8.5.1** History Page Header + Filters | 优化标题区和筛选入口 | Header / filters / empty copy | 不改动作逻辑 / 不改 store / 不改 API / 不改卡片布局 | 用户知道 History 能做什么，筛选清楚，空态有引导 |
| **M4-8.5.2** History Record Cards Polish | 优化记录卡片信息层级 | record card layout / metadata | 不改重新运行 / 导出逻辑 / 不改按钮 | 卡片能看懂类型、问题、表、状态、时间，间距合理 |
| **M4-8.5.3** History Actions Clarity | 优化按钮主次 | actions area / More menu | 不改执行逻辑 / 不改 store / 不改 API | 主操作和次操作清楚，默认按钮数 ≤ 2 |
| **M4-8.5.4** Stale Table / Invalid Record UX | 处理旧表 / 失效记录体验 | stale state / disabled actions | 不改后端 / 不改 store 结构 / 不改 API | 失效记录不误导用户执行，卡片上有明确提示 |
| **M4-8.5.5** History Regression | 回归测试 | tests / report | 不做新功能 | History 主链路稳定，tsc/test/build/lint 通过 |

### 各阶段详细说明

#### M4-8.5.1 History Page Header + Filters

**目标**：让用户一屏理解 History 页的定位和用途。

**改动清单**：
1. 标题区优化：从 "查询历史" 改为更明确的定位文案
2. 副标题优化：说明 "回查、复用和导出之前的分析与查询"
3. Filter 优化：将 type filter 从原生 `<select>` 改为 filter chips
4. 搜索框优化：placeholder 更明确
5. 空态优化：增加行动引导按钮

**预计文件**：
- `frontend-react/src/panels/sql-history-panel.tsx`（标题区 + filter + 空态）
- `frontend-react/src/i18n/zh.ts`（新增/修改 history keys）
- `frontend-react/src/i18n/en.ts`（新增/修改 history keys）

**验收标准**：
- 用户 3 秒内知道这个页面能做什么
- AI / SQL filter 有明确的视觉区分
- 空态有行动引导
- `npx next build` pass

#### M4-8.5.2 History Record Cards Polish

**目标**：记录卡片信息层级清晰，密度合理。

**改动清单**：
1. 间距优化：`space-y-2` → `space-y-3`
2. runtimeMs 格式化：毫秒 → 人类可读（如 "1.2s"）
3. SQL 摘要增加 hover title 展开
4. AI summary 增加展开入口（可选）

**预计文件**：
- `frontend-react/src/panels/sql-history-panel.tsx`（卡片布局）
- `frontend-react/src/utils/datetime.ts`（如需新增格式化函数）

**验收标准**：
- 卡片间距合理，不挤不空
- 耗时显示人类可读
- 长文本有展开方式
- `npx next build` pass

#### M4-8.5.3 History Actions Clarity

**目标**：操作按钮主次清楚，默认不堆叠。

**改动清单**：
1. AI 记录：查看详情（primary）+ More 菜单
2. SQL 记录：加载到工作台（primary）+ More 菜单
3. More 菜单包含次操作和低频操作
4. 删除移入 More 菜单

**预计文件**：
- `frontend-react/src/panels/sql-history-panel.tsx`（按钮区域）

**验收标准**：
- 每条记录默认 ≤ 2 个可见按钮
- More 菜单包含所有次操作
- 操作功能不变
- `npx next build` pass

#### M4-8.5.4 Stale Table / Invalid Record UX

**目标**：失效记录不误导用户。

**改动清单**：
1. 卡片上对失效记录显示 "数据表已失效" badge
2. 禁用执行类操作（重新运行、加载到工作台、重新执行）
3. 保留复制类操作（复制问题、复制 SQL）
4. 保留查看详情和导出

**预计文件**：
- `frontend-react/src/panels/sql-history-panel.tsx`（stale state 样式）

**验收标准**：
- 失效记录卡片上有明确提示
- 执行类操作被禁用（按钮 disabled + tooltip 说明）
- 复制 / 查看 / 导出仍然可用
- `npx next build` pass

#### M4-8.5.5 History Regression

**目标**：确认 M4-8.5.1 ~ M4-8.5.4 没有破坏 History 主链路。

**改动清单**：
1. 新增回归测试文件
2. 覆盖：标题区、filter、卡片、按钮、空态、stale state
3. 生成回归报告

**预计文件**：
- `frontend-react/src/app/(shell)/__tests__/history-regression.test.tsx`
- `docs/reports/m4-8-5-5-history-regression.md`

**验收标准**：
- tsc / test / build / lint 全部通过
- History 主链路稳定
- 无视觉回归

---

## 11. M4-8.5.1 Scope

下一轮最小范围只做：

```text
History Page Header + Filters
```

### 允许

- 优化历史页标题区文案
- 明确 History 页作用（副标题）
- 优化 AI / SQL 类型筛选视觉（filter chips）
- 优化搜索框 placeholder
- 优化空态入口文案（增加行动引导）
- 修改 i18n 文案

### 禁止

- 不改历史记录动作逻辑
- 不改重新运行 / 加载到工作台
- 不改导出
- 不改 Store
- 不改 API
- 不改后端
- 不改卡片布局（M4-8.5.2 处理）
- 不改按钮主次（M4-8.5.3 处理）
- 不处理 stale table 逻辑（M4-8.5.4 处理）

### 预计文件

| 文件 | 改动类型 | 改动量 |
|---|---|---|
| `sql-history-panel.tsx` | 标题区 + filter + 空态 | 中 |
| `zh.ts` | 新增/修改 history keys | 小 |
| `en.ts` | 新增/修改 history keys | 小 |

### 验收标准

- 用户 3 秒内知道 History 页能做什么
- AI / SQL filter 有明确的视觉区分
- 空态有行动引导
- tsc / test / build / lint 全部通过

---

## 12. Known Risks

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| 旧历史记录关联已不存在的数据表 | 用户操作被打断 | M4-8.5.4 增加 stale state 提示 |
| 旧 SQL 引用已失效表名或字段 | 重新执行失败 | M4-8.5.4 禁用执行类操作 |
| 重新运行 / 加载到工作台误导用户 | 用户期望失败 | M4-8.5.4 对失效记录禁用 |
| History 又做成按钮堆叠页 | 视觉噪音 | M4-8.5.3 用 More 菜单收起次操作 |
| 恢复 Save / Template 混乱语义 | 用户困惑 | 严格禁止，不引入保存/收藏 |
| Filter chips 改动影响现有筛选逻辑 | 功能回归 | 只改视觉，不改 getFiltered 逻辑 |
| 空态改动过于复杂 | 用户被引导干扰 | 保持简洁，只增加 1 个行动按钮 |

---

## 13. Next Step

等待用户确认后，进入 M4-8.5.1 implementation。

**暂不进入 M5 Agent。**
**暂不打 tag。**

M4-8.5.1 的执行流程：
1. 在 `m4-8-5-0-history-ux-planning` 分支上工作（或新建 `m4-8-5-1-history-header-filters`）
2. 按上述清单改动标题区、filter、空态
3. 每改一个文件运行 `npx next build`
4. 全部改完后手动验证 History 页
5. 提交 + push
6. 输出测试报告
