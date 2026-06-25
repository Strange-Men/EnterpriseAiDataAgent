# M4-8.6.5 Data Page Regression

## 1. Goal

确认 M4-8.6.1 到 M4-8.6.4 的 Data Page UX 改造没有破坏数据页主链路。

## 2. Regression Scope

- Header + Upload Guidance
- Current Table + Table List
- Preview + Data Quality
- Delete / Empty / Error States
- Disabled experimental features

## 3. Findings

### 3.1 Header + Upload Guidance ✅
- Data 页面标题存在（data.title + data.description）
- 页面说明表达"上传 CSV/Excel、选择数据表、开始 AI 分析"
- 上传区说明支持 CSV / Excel（upload.formats）
- 上传流程清楚：上传文件 → 选择数据表 → 开始分析（upload.flow）
- 没有误导性拖拽上传文案（dropzone 改为"点击选择文件"）
- 上传入口仍可用

### 3.2 Current Table + Table List ✅
- Current Table Card 存在
- 有当前表时显示表名、行数、列数、分析次数、质量评分
- 无当前表时显示友好空态（📋 icon + 引导文案）
- Table List 当前选中表高亮（accent 边框 + 背景）
- 表列表项显示表名 / 行数 / 列数
- 开始分析入口存在
- 选择表 / 删除表功能没回归

### 3.3 Preview + Data Quality ✅
- Preview Header 存在（preview.title + preview.description）
- Preview 说明清楚
- 行数 / 列数 / 预览行数清楚（badge 展示）
- Data Quality 标题和说明用户友好（quality.title + quality.description）
- 质量就绪状态展示（quality.ready / quality.needs-attention）
- 缺失值 / 字段类型清楚（quality.missing-values / quality.field-types）
- Start Analysis 入口存在（preview.start-analysis）
- 预览数据加载没回归

### 3.4 Delete / Empty / Error States ✅
- 删除按钮仍存在
- 删除按钮不抢主视觉（hover-only, × 图标）
- 删除 confirm 文案说明影响历史记录（table.confirm-delete）
- 删除 handler 仍被调用
- 无数据表空态友好（📊 icon + i18n 描述）
- 无预览数据空态友好（📋 icon + i18n 描述）
- 上传失败文案友好（upload.error-hint）
- 数据加载失败文案友好（upload.load-error-hint）
- 上传 / 选表 / 删除逻辑没回归

### 3.5 Regression Safety ✅
- 不改 Store
- 不改 API
- 不改后端
- 不改上传逻辑
- 不改表选择逻辑
- 不改删除逻辑
- 不改 Data Quality 计算逻辑
- 不恢复 Templates / Schedule / Diff / Timeline
- 不恢复 `/performance`、`/virtual-table`
- 不恢复 Command Palette / Global Search / Keyboard Shortcuts

## 4. Fixes

**No code fix required.**

所有 M4-8.6.1 到 M4-8.6.4 的改动都稳定集成，没有发现需要修复的问题。

## 5. Remaining Risks

- **删除当前表后的 active table 行为仍需线上人工确认**：删除当前表后，系统会自动选择下一个表或清空选择。这个行为在测试中验证通过，但线上场景可能更复杂。
- **上传失败原因是否足够细分，可能需要后端错误码支持**：当前上传失败提示是通用的"检查文件格式和大小"，如果后端能提供更具体的错误码（如文件过大、格式不支持、服务器错误），可以进一步优化提示。
- **Data Quality 指标口径如需更强解释，可后续单独处理**：当前质量分数（completeness、consistency、validity、uniqueness）有简单说明，但如果需要更详细的指标解释（如每个分数的计算方式、行业基准），可以单独开阶段处理。
- **大表预览性能暂不在本轮处理**：预览区显示前 100 行数据，对于超大表（百万行以上）的预览性能暂不在本轮优化。

## 6. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改上传逻辑
- 未改表选择逻辑
- 未改删除逻辑
- 未改 Data Quality 计算逻辑
- 未开始 M4-8.7
- 未开始 M5 Agent

## 7. Tests

### 新增测试

**文件**：`frontend-react/src/app/(shell)/__tests__/data-page-regression.test.tsx`

**测试覆盖**（43 个测试）：

**1. Header + Upload Guidance（5 个测试）**
- data page title exists
- data page description mentions upload/choose/start
- upload formats mentions CSV/Excel support
- upload flow shows 3 steps
- dropzone uses click, not drag

**2. Current Table + Table List（7 个测试）**
- current table card title exists
- current table card description mentions default data source
- current empty state is friendly
- selected badge exists
- rows/cols labels exist
- start analysis entry exists
- table management key preserved

**3. Preview + Data Quality（11 个测试）**
- preview title exists
- preview description is user-friendly
- preview rows summary uses interpolation
- preview rows count uses interpolation
- quality title is user-friendly
- quality description is user-friendly
- quality ready/needs-attention labels exist
- missing values label exists
- field types label exists
- start analysis entry exists
- analysis hint is friendly

**4. Delete / Empty / Error States（10 个测试）**
- delete-aria mentions delete
- confirm-delete mentions history impact
- delete-success uses interpolation
- delete-failed is friendly
- no-tables is user-friendly
- no-tables-desc guides next step
- no-table-selected is friendly
- no-table-selected-desc guides selection
- error-hint is friendly
- load-error-hint is friendly

**5. No-table empty state（2 个测试）**
- no-files empty state is friendly
- no-files-desc mentions CSV/Excel

**6. Disabled experimental features（4 个测试）**
- no Templates key in data page scope
- no Schedule key in data page scope
- no Diff key in data page scope
- no Timeline key in data page scope

**7. Regression safety（4 个测试）**
- upload logic not changed
- table selection logic not changed
- delete logic not changed
- quality calculation not changed

### 测试结果

- **测试文件**：42 passed
- **测试用例**：952 passed（新增 43 个）

## 8. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 952/952 passed (42 files, +43 new) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 9. Online Manual Check List

- [ ] Data 页第一眼是否像数据准备工作台 — PageHeader 标题 + 说明
- [ ] 上传区文案是否清楚 — upload.formats + upload.flow
- [ ] 当前表是否突出 — CurrentTableCard 显示表名 + 行列 + 分析入口
- [ ] 表列表是否易读 — accent 边框 + 背景高亮 +「当前选中」badge
- [ ] Preview / Data Quality 是否易懂 — 标题 + 说明 + 质量就绪状态
- [ ] 删除 / 空态 / 错误态是否友好 — i18n 文案 + 友好提示
- [ ] 上传 / 选表 / 删除是否没回归 — 未改相关逻辑
- [ ] 已删除实验路由仍然不存在 — 无 /performance、/virtual-table

## 10. Next Step

通过后再进入 M4-8.7 Settings + i18n Copy Polish。
暂不进入 M5 Agent。
暂不打 tag。
