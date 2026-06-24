# M4-8.3.1 Analyze Shell + Current Table Strip

## 1. Goal

让分析工作台的当前数据表状态和用户路径更清楚。

## 2. Changes

### 2.1 Tab Bar 视觉层级

- 自然语言查询 tab 增加"推荐"标签（小圆角 badge）
- 专家 SQL tab 增加"高级"标签（小圆角 badge）
- Active tab 标签使用 accent 色背景，inactive 使用 tertiary 背景
- Tab 切换逻辑不变（状态由 `useState<WorkspaceTab>` 管理）

### 2.2 Current Table Strip

从 tab bar 右侧的 badge 独立为一个专用条带：

**有表时**：
- Database 图标 + "当前数据表" + 表名 + 行数 + 列数
- 右侧描述："自然语言查询和专家 SQL 都将基于这张表执行。"

**无表时**：
- Database 图标 + "未选择数据表" + 描述
- 右侧"上传数据"按钮，跳转到 /data 页面

### 2.3 No Table Empty State

- AI Query tab 中的表选择器：无表时从 italic 文字改为"上传数据"按钮
- 按钮跳转到 /data 页面，用户可直接上传

### 2.4 i18n

新增以下 key：

| Key | 中文 | 英文 |
|-----|------|------|
| `workspace.tab.recommended` | 推荐 | Recommended |
| `workspace.tab.advanced` | 高级 | Advanced |
| `workspace.table-strip.label` | 当前数据表 | Current table |
| `workspace.table-strip.rows` | {{count}} 行 | {{count}} rows |
| `workspace.table-strip.cols` | {{count}} 列 | {{count}} cols |
| `workspace.table-strip.description` | 自然语言查询和专家 SQL 都将基于这张表执行。 | Natural language analysis and Expert SQL will run against this table. |
| `workspace.table-strip.no-table` | 未选择数据表 | No table selected |
| `workspace.table-strip.no-table-desc` | 请先上传或选择数据表，然后开始分析。 | Upload or select a table before running analysis. |
| `workspace.table-strip.upload` | 上传数据 | Upload Data |

英文 tab 名称调整：
- "AI Query" → "Natural Language"（更清晰描述功能）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改 SQL editor 执行逻辑
- 未改 AI SQL generation
- 未改 History Recall
- 未改 SQL editor 内部
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/analysis-workspace-shell.test.tsx`

29 个测试覆盖：

1. Tab labels（中英文）
2. Tab badges（推荐/高级，中英文）
3. Current Table Strip 有表状态（标签、行数模板、列数模板、描述）
4. Current Table Strip 无表状态（标题、描述、上传按钮）
5. Legacy key 兼容性
6. 负面检查（不恢复 Templates/Performance/Virtual Table）

## 5. Validation

| Check              | Result  |
|--------------------|---------|
| tsc --noEmit       | ✅ pass |
| vitest run         | ✅ 23 files, 327 tests passed |
| next build         | ✅ compiled, 9 routes generated |
| next lint          | ✅ pass (6 warnings, 0 errors — same as before) |
| backend import     | ✅ OK   |

## 6. Online Check List

- [ ] 当前数据表状态是否明显（独立条带）
- [ ] 无表状态是否友好（图标 + 描述 + 上传按钮）
- [ ] 自然语言查询是否看起来是推荐入口（推荐标签）
- [ ] 专家 SQL 是否仍可访问（高级标签）
- [ ] Tab 切换是否正常
- [ ] 自然语言分析主链路是否没回归
- [ ] 专家 SQL 执行是否没回归
- [ ] 中英双语是否正常切换

## 7. Next Step

通过后进入 M4-8.3.2 Natural Language Query Panel Polish。
暂不进入 M5 Agent。
暂不打 tag。
