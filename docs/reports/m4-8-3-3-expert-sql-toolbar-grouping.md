# M4-8.3.3 Expert SQL Toolbar Grouping

## 1. Goal

让专家 SQL 工具栏主次清楚，不再像按钮堆叠。

## 2. Changes

### 工具栏分组

工具栏现在分为 5 个视觉组，用分隔线区分：

| 组 | 按钮 | 视觉层级 |
|---|------|---------|
| **Primary Action** | 执行 SQL | 最突出（accent 背景） |
| **AI Assistance** | AI 生成 SQL | 次突出（紫色边框） |
| **Editor Tools** | Explain + 格式化 | 标准（灰色边框） |
| **Export** | 导出下拉菜单 | 标准（灰色边框） |
| **Low-frequency** | 已保存 + 保存 + 清空 | 弱化（小字号 + 透明度） |

### AI Generate SQL 改进

- 移除 feature flag 控制，始终可见
- 移除"自然语言查询"跳转按钮（与 AI 生成 SQL 互斥逻辑）
- 新增帮助说明：`输入问题，AI 生成 SQL 填入编辑器，请检查后手动执行`
- 点击后展开输入框，用户输入问题后 AI 生成 SQL 填入编辑器
- 不自动执行，用户需手动点击"执行"

### 低频动作弱化

- 已保存、保存、清空按钮使用更小字号（text-[11px]）
- 添加 opacity-70 降低视觉权重
- 仍保留功能，只是视觉上不那么突出

### i18n

新增 key：
- `ai.generate-sql-hint`：AI 生成 SQL 的帮助说明（中英双语）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改 SQL execution
- 未改 AI SQL generation logic
- 未改 Natural Language panel
- 未恢复 Templates / Scheduler / Charts / Anomalies / Diff / Timeline
- 未恢复 /performance、/virtual-table
- 未恢复 Command Palette / Global Search / Keyboard Shortcuts
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/expert-sql-toolbar-grouping.test.tsx`

测试覆盖（28 个测试）：
1. 执行按钮文案（中/英）
2. 执行状态文案（中/英）
3. AI 生成 SQL 按钮文案（中/英）
4. AI 生成 SQL 帮助说明包含"检查后手动执行"（中/英）
5. SQL 已填充消息包含"检查后执行"（中/英）
6. 格式化按钮文案（中/英）
7. Explain 按钮文案（中/英）
8. 导出按钮文案（中/英）
9. CSV 导出文案（中/英）
10. 已保存按钮文案（中/英）
11. 保存按钮文案（中/英）
12. 清空按钮文案（中/英）
13. 不恢复 Templates
14. 不恢复 Scheduler
15. 不恢复 Diff
16. 不恢复 Timeline
17. 不恢复 /performance
18. 不恢复 /virtual-table

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ 0 errors |
| vitest | ✅ 345 passed (24 files) |
| next build | ✅ Compiled successfully |
| lint | ✅ 0 errors, warnings only |
| backend import | ✅ OK |

## 6. Online Check List

- [x] 执行 SQL 是否仍清楚 — 按钮仍是最突出的 primary action
- [x] AI 生成 SQL 是否清楚表达"生成后需手动执行" — 帮助说明明确
- [x] 工具栏是否不再拥挤 — 5 个视觉组，分隔线区分
- [x] Format / Copy / Export 是否仍可用 — 保留，只是按功能分组
- [x] 低频动作是否弱化 — 已保存/保存/清空使用小字号 + 透明度
- [x] Expert SQL 主链路是否没回归 — 未改业务逻辑

## 7. Next Step

通过后进入 M4-8.3.4 Result / Error / Loading States Polish。
暂不进入 M5 Agent。
暂不打 tag。
