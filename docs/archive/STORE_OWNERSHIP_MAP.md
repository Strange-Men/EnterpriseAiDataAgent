# STORE_OWNERSHIP_MAP.md — v0.8.0 状态所有权映射

> 每个状态字段只有唯一 owner。跨 store 访问通过 ID 引用，不复制数据。

## 所有权矩阵

### investigation-store（新）
**职责**: 分析生命周期 + AI 上下文

| 字段 | 类型 | 来源 | 备注 |
|------|------|------|------|
| `stage` | InvestigationStage | workflow-store | 唯一 owner |
| `source` | "upload"\|"manual"\|null | workflow-store | 唯一 owner |
| `startedAt` | string\|null | workflow-store | 唯一 owner |
| `turns` | AiTurn[] | ai-session-store | 唯一 owner |
| `compressedSummary` | string\|null | ai-session-store | 唯一 owner |
| `keyFindings` | string[] | ai-session-store | 唯一 owner |
| `investigationSummary` | string\|null | ai-session-store | 唯一 owner |
| `lastSql` | string\|null | ai-session-store | 唯一 owner，替代 aiSql |
| `lastColumns` | string[]\|null | ai-session-store | 唯一 owner |
| `lastRowCount` | number\|null | ai-session-store | 唯一 owner |
| `lastInsightSummary` | string\|null | ai-session-store | 唯一 owner |
| `activeTable` | string\|null | 合并 | 当前分析的数据集引用 |
| `activeRunId` | string\|null | **新增** | 引用 analysis-store.run |
| `drillChain` | string[] | **新增** | drill-down 链路 (runIds) |

### sql-editor-store（新）
**职责**: SQL 查询生命周期

| 字段 | 类型 | 来源 | 备注 |
|------|------|------|------|
| `tabs` | QueryTab[] | query-tabs-store | 唯一 owner |
| `activeTabId` | string | query-tabs-store | 唯一 owner |
| `currentSql` | string | sql-workspace-store | 唯一 owner，synced with active tab |
| `isExecuting` | boolean | sql-workspace-store | 唯一 owner |
| `queryResult` | QueryResult\|null | sql-workspace-store | 唯一 owner |
| `offset/limit/totalRows/hasMore` | number/bool | sql-workspace-store | 唯一 owner |
| `selectedTable` | string\|null | sql-workspace-store | SQL 编辑器选中的表 |
| `activePanelTab` | "editor"\|"history" | sql-workspace-store | 面板标签页 |

### data-store（保留）
**职责**: 数据和表管理

| 字段 | 类型 | 备注 |
|------|------|------|
| `currentTable` | string\|null | **唯一 owner** — 不要在其它 store 存 activeTable |
| `currentData` | Record[]\|null | 数据预览 |
| `tables` | TableInfo[] | 表列表 |
| `qualityReport` | QualityReport\|null | 数据质量 |
| `uploadedFiles` | UploadedFile[] | 上传文件 |
| `systemStatus` | SystemStatus | 系统状态 |

### analysis-store（保留）
**职责**: 分析运行历史

| 字段 | 类型 | 备注 |
|------|------|------|
| `runs` | AnalysisRun[] | 唯一 owner |
| `activeRunId` | string\|null | 被 investigation-store 引用 |

### 独立 store（保留不变）
| Store | 职责 |
|-------|------|
| `sql-history-store` | 查询执行历史（不可变日志） |
| `saved-queries-store` | 用户保存的查询 |
| `workspace-store` | UI 布局/语言 |
| `template-store` | 可复用分析模板 |
| `schedule-store` | 定时任务 |

## 禁止的重复（已消除）

| 旧重复状态 | 旧位置 | 新 owner |
|-----------|--------|---------|
| `activeTable` | workflow-store, ai-session-store | investigation-store (引用) |
| `currentSql` / `aiSql` / `lastSql` | sql-workspace, workflow, ai-session | sql-editor-store / investigation-store |
| `selectedTable` vs `currentTable` | sql-workspace, data-store | 各自保留（语义不同） |

## 跨 store 访问规则

```
investigation-store.activeTable  →  引用 data-store.currentTable (约定，非强制)
investigation-store.activeRunId  →  引用 analysis-store.runs[N].id
investigation-store.drillChain   →  引用 analysis-store.runs[N].id (有序)
sql-editor-store.selectedTable   →  独立字段（SQL 上下文，非数据预览）
```
