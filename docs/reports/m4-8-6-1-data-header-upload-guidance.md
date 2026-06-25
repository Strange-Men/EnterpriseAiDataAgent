# M4-8.6.1 Data Page Header + Upload Guidance

## 1. Goal

让 Data Page 从"上传和表管理页"转向"准备分析数据"的工作流入口。

## 2. Changes

### Data Page Header
- 添加 PageHeader 组件，包含标题和说明文案
- 中文：「数据」+「上传 CSV/Excel 数据，选择数据表，并开始 AI 分析。」
- 英文：「Data」+「Upload CSV/Excel data, choose a table, and start AI analysis.」

### Upload Guidance
- dropzone 文案从"拖拽 CSV 或 Excel 文件到此"改为"点击选择文件"
- 添加格式提示：「支持 CSV、XLSX、XLS 格式」
- 添加上传引导：「上传后系统会创建数据表，你可以预览字段、检查基础质量，并进入分析工作台。」
- 添加流程提示：「上传文件 → 选择数据表 → 开始分析」

### Empty State
- FileUploadPanel 空态 icon 从空字符串 `""` 修复为 `"📄"`
- 空态描述从硬编码英文改为 i18n key `upload.no-files-desc`
- TableManagementPanel 空态 icon 从 `" "` 修复为 `"📊"`
- 空态描述从硬编码英文改为 i18n key `table.no-tables-desc`

### i18n
新增 key：
| Key | zh | en |
|-----|----|----|
| `data.title` | 数据 | Data |
| `data.description` | 上传 CSV/Excel 数据，选择数据表，并开始 AI 分析。 | Upload CSV/Excel data, choose a table, and start AI analysis. |
| `upload.formats` | 支持 CSV、XLSX、XLS 格式 | CSV, XLSX, and XLS files are supported |
| `upload.guidance` | 上传后系统会创建数据表，你可以预览字段、检查基础质量，并进入分析工作台。 | After upload, a data table will be created so you can preview fields, review basic quality, and continue to the analysis workspace. |
| `upload.flow` | 上传文件 → 选择数据表 → 开始分析 | Upload file → Choose table → Start analysis |
| `upload.next-step` | 上传后可前往分析工作台，用自然语言提问或编写 SQL。 | After uploading, go to the analysis workspace to ask questions in natural language or write SQL. |
| `upload.no-files-desc` | 上传 CSV 或 Excel 文件后，系统会在这里显示可分析的数据表。 | After uploading a CSV or Excel file, available tables will appear here. |
| `table.no-tables-desc` | 上传 CSV 或 Excel 文件后，系统会在这里显示可分析的数据表。 | After uploading a CSV or Excel file, available tables will appear here. |

修改 key：
| Key | 旧值 | 新值 |
|-----|------|------|
| `upload.dropzone` (zh) | 拖拽 CSV 或 Excel 文件到此 | 点击选择文件 |
| `upload.dropzone` (en) | Drag & drop CSV or Excel files here | Click to select files |

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改上传逻辑
- 未改拖拽上传行为
- 未改表列表逻辑
- 未改 Data Quality 逻辑
- 未改删除逻辑
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/data-header-upload-guidance.test.tsx`

测试覆盖：
1. Data 页面标题存在（中英文）
2. Data 页面说明表达"上传 CSV/Excel、选择数据表、开始 AI 分析"
3. Upload guidance 显示支持 CSV / Excel
4. Upload guidance 显示上传流程：上传文件 → 选择数据表 → 开始分析
5. 空态显示"暂无已上传文件 / No files uploaded yet"
6. 空态描述包含 CSV / Excel
7. 表管理空态描述包含 CSV / Excel
8. 不出现拖拽上传文案（dropzone 改为点击上传）
9. 不恢复 Templates / Schedule / Diff / Timeline
10. 不恢复 `/performance`、`/virtual-table`

测试结果：38 files, 839 tests passed（新增 25 个测试）

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 839/839 passed (38 files) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 6. Online Check List

- [x] Data 页面第一眼是否说明用途 — ✅ PageHeader 标题 + 说明
- [x] 上传区是否说明 CSV / Excel 支持 — ✅ `upload.formats` key
- [x] 上传后流程是否清楚 — ✅ `upload.flow` 显示三步流程
- [x] 空态是否有上传数据入口 — ✅ icon 📄 + i18n 描述
- [x] 是否没有误导性拖拽上传文案 — ✅ dropzone 改为"点击选择文件"
- [x] 上传功能是否没回归 — ✅ 未改上传逻辑

## 7. Changed Files

| 文件 | 改动 |
|------|------|
| `frontend-react/src/app/(shell)/data/page.tsx` | 添加 PageHeader，调整布局为 flex-col |
| `frontend-react/src/panels/file-upload-panel.tsx` | 优化 dropzone 文案，添加 guidance/flow/formats，修复空态 |
| `frontend-react/src/panels/table-management-panel.tsx` | 修复空态 icon + i18n 描述 |
| `frontend-react/src/i18n/zh.ts` | 新增 8 个 key，修改 1 个 key |
| `frontend-react/src/i18n/en.ts` | 新增 8 个 key，修改 1 个 key |
| `frontend-react/src/app/(shell)/__tests__/data-header-upload-guidance.test.tsx` | 新增测试文件 |

## 8. Next Step

通过后进入 M4-8.6.2 Table List / Current Table Card Polish。
暂不进入 M5 Agent。
暂不打 tag。
