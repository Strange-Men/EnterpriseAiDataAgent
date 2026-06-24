# M4-8.3.0 Analysis Workspace UX Planning

> 规划日期：2026-06-24
> 基于 master commit: 38e3d07
> 范围：仅规划，不改代码，不改 UI，不进入 M5 Agent

---

## 1. Problem

分析工作台是核心页面，目前功能能用，但视觉和路径仍像功能堆叠：

- 普通用户不知道该先用"自然语言查询"还是"专家 SQL"
- 专家 SQL 工具栏按钮过多（10+），无分组，视觉层级扁平
- 当前数据表状态在 Tab bar 右侧，不够突出
- 示例问题通用，不与当前数据表关联
- AI 生成 SQL 入口被 feature flag 控制，体验不一致
- 无表时的空态引导不够直接

---

## 2. Audit

### 2.1 分析工作台 UX 审计表

| 区域 | 当前问题 | 用户影响 | 严重程度 | 是否 M4-8.3 处理 | 最小改法 |
|------|---------|---------|---------|----------------|---------|
| **Tab Bar** | 自然语言查询 / 专家 SQL 两个 tab 视觉层级相同，普通用户不知道先用哪个 | 新用户困惑 | Medium | M4-8.3.1 | 默认选中"自然语言查询"，tab 文案更友好 |
| **Tab Bar** | tab 切换无视觉过渡，切换后布局跳动 | 体验不流畅 | Low | M4-8.3.1 | 增加 transition |
| **Tab Bar** | 当前表名和行数在 tab bar 右侧，不够突出 | 用户忽略当前数据表状态 | Medium | M4-8.3.1 | 独立为 Current Table Strip |
| **AI Query** | 输入框不够突出，placeholder 不够引导 | 用户不知道该输入什么 | Medium | M4-8.3.2 | 增大输入框，改善 placeholder |
| **AI Query** | 示例问题通用，不与当前数据表关联 | 用户觉得是 demo | Medium | M4-8.3.2 | 根据表列名生成示例 |
| **AI Query** | "生成 SQL 并分析" 按钮文案技术化 | 普通用户不理解 | Low | M4-8.3.2 | 改为"开始分析" |
| **AI Query** | 结果区"查看详情 →" 链接不够明显 | 用户找不到详情入口 | Medium | M4-8.3.4 | 升级为按钮 |
| **Expert SQL** | 工具栏 10+ 按钮无分组，视觉层级扁平 | 高级功能淹没基础操作 | High | M4-8.3.3 | 按功能分组 |
| **Expert SQL** | AI 生成 SQL 入口被 feature flag 控制 | 部分用户看不到 | Medium | M4-8.3.3 | 始终可见 |
| **Expert SQL** | WorkflowBanner 在 SQL Tab 中显示 | 与当前 tab 无关，视觉噪音 | Low | M4-8.3.3 | 仅在 AI Query Tab 显示 |
| **Expert SQL** | AI 按钮（Explain / Insights / Charts / Anomalies）被 feature flag 隐藏 | 体验不一致 | Medium | M4-8.3.3 | 统一入口 |
| **Current Table** | 无表时提示"请先在数据页面上传文件"，无直接跳转 | 用户需要手动导航 | Medium | M4-8.3.1 | 增加"上传数据"按钮 |
| **Current Table** | 表不存在时无友好提示 | 用户困惑 | Low | M4-8.3.1 | 增加友好提示 |
| **Loading** | Streaming 状态指示器不够突出 | 用户不确定是否在运行 | Low | M4-8.3.4 | 改善指示器样式 |
| **Error** | 错误信息用红色块显示，技术性强 | 用户恐慌 | Medium | M4-8.3.4 | 语气温和，技术详情折叠 |
| **Trace** | 分析工作台内无 Trace 显示 | 无问题 | ✅ | — | Trace 在详情页显示 |

### 2.2 Top 5 核心问题

1. **SQL 工具栏过载**：10+ 按钮无分组，AI 功能入口不统一
2. **当前数据表状态不突出**：用户忽略当前正在分析哪张表
3. **示例问题不关联数据表**：用户觉得是 demo 不是真实功能
4. **普通用户路径不清晰**：不知道先用自然语言还是专家 SQL
5. **AI 入口不一致**：feature flag 控制导致部分用户看不到

---

## 3. Design Principles

```
P1: 普通用户优先
    — 自然语言查询是默认 tab
    — 专家 SQL 是高级入口，不压迫普通用户
    — 示例问题与当前数据表关联

P2: 当前数据表状态必须清楚
    — 独立为 Current Table Strip，始终可见
    — 无表时有明确引导
    — 表名 + 行数 + 列数

P3: 执行、生成、导出动作必须分层
    — 主操作：执行 / 开始分析
    — 次操作：AI 生成 SQL / 格式化
    — 弱操作：保存 / 清空 / 导出

P4: 错误、loading、结果状态要友好
    — 错误信息语气温和
    — Loading 状态明确
    — 结果入口清晰

P5: Trace 不抢主视觉
    — 分析工作台内不显示 Trace
    — Trace 在详情页显示
```

---

## 4. M4-8.3 Split Plan

### 概览

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 | 预计文件 |
|------|------|---------|---------|---------|---------|
| **M4-8.3.1** | Analyze Shell + Current Table Strip | 页面头部 + 数据表状态条 + Tab 视觉层级 | 不改 SQL editor、不改 AI 逻辑、不改 store | Tab 默认选中自然语言、当前表状态突出、无表有引导 | `investigation-workspace.tsx` |
| **M4-8.3.2** | Natural Language Query Panel Polish | AI Query Tab 内部优化 | 不改 AI 逻辑、不改 API、不改 store | 输入框突出、示例问题关联表、按钮文案友好 | `investigation-workspace.tsx` |
| **M4-8.3.3** | Expert SQL Toolbar Grouping | SQL 工具栏分组 + AI 入口统一 | 不改 SQL 执行逻辑、不改 store、不恢复实验功能 | 按钮分组、AI 入口始终可见、WorkflowBanner 仅 AI Tab | `sql-workspace-panel.tsx` |
| **M4-8.3.4** | Result / Error / Loading States Polish | 结果区、错误态、Loading 态优化 | 不改业务逻辑、不改 API、不改 store | 结果入口清晰、错误语气温和、Loading 明确 | `investigation-workspace.tsx`, `sql-workspace-panel.tsx` |
| **M4-8.3.5** | Analysis Workspace Regression | 全面回归测试 | 不改功能、不改逻辑 | tsc/test/build pass、主链路可走通、无视觉回归 | 无新文件，仅测试 |

### 详细说明

#### M4-8.3.1 Analyze Shell + Current Table Strip

**目标**：分析工作台页面头部清晰，当前数据表状态突出。

**改动清单**：
1. Tab Bar 优化：
   - 默认选中"自然语言查询"tab
   - Tab 文案更友好（"自然语言查询" → "AI 问答" 或保持）
   - Tab 切换增加 transition
2. Current Table Strip：
   - 从 Tab bar 右侧独立为一行
   - 显示：表名 + 行数 + 列数
   - 无表时显示"未选择数据表" + "上传数据"按钮
   - 表不存在时显示友好提示
3. Tab 视觉层级：
   - 自然语言查询 tab 更突出（默认选中 + 强调色）
   - 专家 SQL tab 弱化（次级视觉）

**禁止**：
- 不改 SQL editor 内部
- 不改 SQL 执行逻辑
- 不改 AI 生成 SQL 逻辑
- 不改 History
- 不改 Store
- 不改 API
- 不改后端

**验收标准**：
- 默认选中"自然语言查询"tab
- 当前表状态在 tab 下方独立一行显示
- 无表时有"上传数据"按钮
- Tab 切换有过渡动画
- `npx next build` pass

**预计文件**：
- `frontend-react/src/components/investigation/investigation-workspace.tsx`

---

#### M4-8.3.2 Natural Language Query Panel Polish

**目标**：AI Query Tab 输入框突出，示例问题关联数据表。

**改动清单**：
1. 输入框优化：
   - 增大输入框高度（rows 3 → 4）
   - 改善 placeholder 文案
   - 增加输入框边框强调
2. 示例问题优化：
   - 根据当前表列名生成示例问题
   - 或至少标注"基于 {tableName} 表"
   - 示例问题更具体
3. 按钮文案优化：
   - "生成 SQL 并分析" → "开始分析"
   - 按钮样式更突出

**禁止**：
- 不改 AI 逻辑
- 不改 API
- 不改 Store
- 不改后端

**验收标准**：
- 输入框更突出
- 示例问题与当前表相关
- 按钮文案友好
- `npx next build` pass

**预计文件**：
- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/i18n/en.ts`

---

#### M4-8.3.3 Expert SQL Toolbar Grouping

**目标**：SQL 工具栏按钮分组，AI 入口统一。

**改动清单**：
1. 工具栏分组：
   - 执行组：执行 / 取消 / Explain
   - AI 组：AI 生成 SQL（始终可见）
   - 格式化组：格式化
   - 保存组：保存查询 / Saved Queries
   - 导出组：Export Dropdown
   - 溢出用 "..." 菜单
2. AI 入口统一：
   - 移除 `showAiSqlInputInWorkspace` flag 对 AI 入口的控制
   - AI 生成 SQL 始终可见
3. WorkflowBanner 优化：
   - 仅在 AI Query Tab 显示
   - SQL Tab 中隐藏

**禁止**：
- 不改 SQL 执行逻辑
- 不改 Store
- 不恢复 feature-flag 隐藏的 AI 按钮（Explain / Insights / Charts / Anomalies）

**验收标准**：
- SQL 工具栏按钮 ≤ 8 个可见（溢出用 More）
- AI 生成 SQL 入口始终可见
- WorkflowBanner 仅 AI Tab 显示
- `npx next build` pass

**预计文件**：
- `frontend-react/src/panels/sql-workspace-panel.tsx`

---

#### M4-8.3.4 Result / Error / Loading States Polish

**目标**：结果区、错误态、Loading 态优化。

**改动清单**：
1. 结果区优化：
   - "查看详情 →" 链接升级为按钮
   - 结果统计更突出（行数、耗时）
2. 错误态优化：
   - 错误信息语气温和
   - 技术详情默认折叠
   - 增加"重试"按钮
3. Loading 态优化：
   - Streaming 指示器更突出
   - 增加进度信息

**禁止**：
- 不改业务逻辑
- 不改 API
- 不改 Store
- 不改后端

**验收标准**：
- 结果入口清晰
- 错误语气温和
- Loading 状态明确
- `npx next build` pass

**预计文件**：
- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `frontend-react/src/panels/sql-workspace-panel.tsx`

---

#### M4-8.3.5 Analysis Workspace Regression

**目标**：全面回归测试，确保无视觉回归。

**改动清单**：
1. 运行 `npx next build` 确认通过
2. 运行 `npm run test` 确认通过
3. 手动走通核心用户路径：
   - 自然语言查询 → 查看结果 → 查看详情
   - 专家 SQL → 执行 → 查看结果
   - 无表时引导 → 上传数据
4. 检查所有状态（空态、Loading、错误态）
5. 检查深色 / 浅色主题
6. 检查中英双语

**禁止**：
- 不改功能
- 不改逻辑
- 不增加新功能

**验收标准**：
- `npx next build` pass
- `npm run test` pass
- 核心路径可走通
- 无视觉回归
- 无功能回归

---

## 5. M4-8.3.1 Scope

### 下一轮最小可执行范围

M4-8.3.1 只做分析工作台 Shell 和 Current Table Strip，不改业务逻辑。

#### 5.1 Tab Bar 优化

**Before → After**：

| 元素 | Before | After |
|------|--------|-------|
| 默认 Tab | 无明确默认（代码中默认 ai-query） | 明确默认"自然语言查询" |
| Tab 文案 | "自然语言查询" / "专家 SQL" | 保持，但增加图标区分 |
| Tab 切换 | 无过渡 | 增加 transition |
| Tab 视觉层级 | 两个 tab 相同 | 自然语言查询更突出 |

**改动**：
- `investigation-workspace.tsx`：确保默认 tab 是 "ai-query"
- 增加 tab 切换 transition

#### 5.2 Current Table Strip

**Before → After**：

| 元素 | Before | After |
|------|--------|-------|
| 当前表状态 | Tab bar 右侧小字 | 独立一行，更突出 |
| 无表提示 | "请先在数据页面上传文件" | "未选择数据表" + "上传数据"按钮 |
| 表信息 | 表名 + 行数 | 表名 + 行数 + 列数 |

**改动**：
- `investigation-workspace.tsx`：在 Tab bar 下方增加 Current Table Strip
- 显示：表名 + 行数 + 列数
- 无表时显示"未选择数据表" + "上传数据"按钮
- 表不存在时显示友好提示

#### 5.3 禁止事项

- ❌ 不改 SQL editor 内部
- ❌ 不改 SQL 执行逻辑
- ❌ 不改 AI 生成 SQL 逻辑
- ❌ 不改 History
- ❌ 不改 Store
- ❌ 不改 API
- ❌ 不改后端
- ❌ 不改示例问题
- ❌ 不改按钮文案

#### 5.4 验收标准

1. `npx next build` pass
2. `npm run test` pass
3. 默认选中"自然语言查询"tab
4. 当前表状态在 tab 下方独立一行显示
5. 无表时有"上传数据"按钮
6. Tab 切换有过渡动画
7. 深色主题视觉不变差
8. 浅色主题视觉不变差

#### 5.5 预计文件

| 文件 | 改动类型 | 改动量 |
|------|---------|--------|
| `investigation-workspace.tsx` | Tab Bar + Current Table Strip | 中 |

---

## 6. Risks

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 分析工作台是核心页面，UI 改动可能影响主链路 | 用户无法完成核心操作 | 每轮必须 `npx next build` + 手动走通主链路 |
| SQL editor 不能再次被挤压 | 编辑器体验变差 | 不改 SQL editor 内部，只改外部容器 |
| 不能改状态流 | 功能异常 | 不改 Store，不改 API |
| 不能改 AI 逻辑 | AI 功能异常 | 不改 AI 生成 SQL 逻辑，不改 AI 分析逻辑 |
| Current Table Strip 增加页面高度 | 可视区域减少 | Strip 高度控制在 40px 以内 |
| Tab 切换 transition 可能导致布局跳动 | 体验不流畅 | 使用 CSS transition，不使用 JS 动画 |

---

## 7. Next Step

等待用户确认后，进入 M4-8.3.1 implementation。

**暂不进入 M5 Agent。**
**暂不打 tag。**

M4-8.3.1 的执行流程：
1. 在 `m4-8-3-0-analysis-workspace-planning` 分支上创建 `m4-8-3-1-analyze-shell` 分支
2. 按上述清单逐文件改动
3. 每改一个文件运行 `npx next build`
4. 全部改完后手动走通核心路径
5. 提交 + push
6. 输出测试报告

---

## 附录：当前分析工作台结构

```tsx
// investigation-workspace.tsx 结构
<div className="flex flex-col h-full">
  {/* Tab Bar */}
  <div className="flex items-center border-b ...">
    <button>自然语言查询</button>
    <button>专家 SQL</button>
    {/* Table info badge — 当前在右侧 */}
    {currentTableName && (
      <div className="ml-auto ...">
        当前数据表: {currentTableName} ({rowCount} rows)
      </div>
    )}
  </div>

  {/* Tab Content */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    {activeTab === "ai-query" ? (
      {/* AI Query Tab */}
    ) : (
      {/* Expert SQL Tab */}
    )}
  </div>
</div>
```

### 改动后结构

```tsx
// investigation-workspace.tsx 结构
<div className="flex flex-col h-full">
  {/* Tab Bar */}
  <div className="flex items-center border-b ...">
    <button>自然语言查询</button>
    <button>专家 SQL</button>
  </div>

  {/* Current Table Strip — 新增 */}
  <div className="flex items-center gap-2 px-4 py-2 border-b ...">
    {currentTableName ? (
      <>
        <span>当前数据表:</span>
        <span>{currentTableName}</span>
        <span>({rowCount} rows, {colCount} cols)</span>
      </>
    ) : (
      <>
        <span>未选择数据表</span>
        <button>上传数据</button>
      </>
    )}
  </div>

  {/* Tab Content */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    {activeTab === "ai-query" ? (
      {/* AI Query Tab */}
    ) : (
      {/* Expert SQL Tab */}
    )}
  </div>
</div>
```