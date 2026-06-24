# M4-8.2 Home + Navigation Clarity

## 1. Goal
让用户一屏知道产品用途、下一步点哪里、当前数据表是什么。

## 2. Changes

### 2.1 Home Hero Copy
- **中文标题**: AI 数据分析工作台
- **中文副标题**: 上传 CSV/Excel 数据，用自然语言提问，AI 自动生成 SQL、执行查询，并导出可阅读的分析报告。
- **英文标题**: AI Data Analysis Workspace
- **英文副标题**: Upload CSV/Excel data, ask questions in natural language, generate SQL, run analysis, and export readable reports.

### 2.2 Home CTA Hierarchy
- **Primary CTA**: 上传数据 / Upload Data
  - 强调色边框，视觉突出
  - 提示: 导入 CSV/Excel，预览字段和数据质量
- **Secondary CTA**: 开始分析 / Start Analysis
  - 默认边框，次级视觉
  - 提示: 自然语言提问或专家 SQL

### 2.3 Three Entry Cards
替换原来的 4 步 flow，改为 3 个入口卡片：

| 卡片 | 中文标题 | 中文描述 | 英文标题 | 英文描述 |
|------|----------|----------|----------|----------|
| 上传数据 | 上传数据 | 导入 CSV/Excel，预览字段和数据质量。 | Upload Data | Import CSV/Excel files, preview fields, and inspect data quality. |
| 自然语言分析 | 自然语言分析 | 直接提问，AI 生成 SQL 并输出分析结果。 | Natural Language Analysis | Ask questions directly; AI generates SQL and returns analysis results. |
| 专家 SQL | 专家 SQL | 查看、编辑、执行 SQL，并导出 CSV。 | Expert SQL | Review, edit, and run SQL, then export CSV results. |

### 2.4 Sidebar Brand Copy
- **中文**: EAI / AI 数据分析
- **英文**: EAI / Data Analysis

### 2.5 Header Current Table Status
- **有表时**: 显示表名和行数
  - 中文: `表名 (行数 行)`
  - 英文: `tablename (rows rows)`
- **无表时**: 友好提示
  - 中文: 未选择数据表
  - 英文: No table selected

## 3. What Was Not Changed
- 未改分析工作台内部
- 未改 SQL editor
- 未改 History 卡片
- 未改 API
- 未改 Store
- 未改后端
- 未开始 M5 Agent

## 4. Tests

### 新增测试文件
`frontend-react/src/app/(shell)/__tests__/home-navigation-clarity.test.tsx`

### 测试覆盖
1. ✅ 首页 Hero 中文文案存在
2. ✅ 首页 Hero 英文文案存在
3. ✅ 首页存在上传数据 / 开始分析两个主 CTA
4. ✅ 首页存在三个入口卡片
5. ✅ Sidebar 品牌副标题中文是 AI 数据分析
6. ✅ Sidebar 品牌副标题英文是 Data Analysis
7. ✅ Header 当前表文案包含 Current table / 当前数据表
8. ✅ 无表状态文案友好
9. ✅ 不恢复 Templates feature flag
10. ✅ 不恢复 `/performance`、`/virtual-table`

### 测试结果
- 22 test files passed
- 298 tests passed (27 new tests)

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ Pass (no errors) |
| npm run test | ✅ Pass (298 tests, 22 files) |
| npm run build | ✅ Pass (9 pages generated) |
| npm run lint | ✅ Pass (warnings only, no errors from new code) |
| backend import | ✅ Pass |

### Build Output
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    4.17 kB         125 kB
├ ○ /_not-found                            128 B         103 kB
├ ○ /analyze                             1.82 kB         104 kB
├ ƒ /analyze/[runId]                     6.16 kB         121 kB
├ ○ /data                                 433 kB         568 kB
├ ○ /history                             9.25 kB         135 kB
├ ○ /query                                1.4 kB         106 kB
└ ○ /settings                            3.24 kB         120 kB
```

## 6. Online Check List
- [ ] 首页一屏是否知道产品用途
- [ ] 上传数据 / 开始分析按钮是否清楚
- [ ] 三个入口卡片是否清楚
- [ ] Sidebar 品牌是否更直观
- [ ] Header 当前表是否清楚
- [ ] 主链路是否没回归

## 7. Next Step
合并后进入 M4-8.3 Analysis Workspace UX Polish。
暂不进入 M5 Agent。
暂不打 tag。
