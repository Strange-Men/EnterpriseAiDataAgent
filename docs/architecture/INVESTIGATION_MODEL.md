# INVESTIGATION_MODEL.md — Investigation-Centric State Model

> v0.8.0 Phase 1 — State Architecture Refactor

## 设计目标

将分散在 4 个 store 中的分析生命周期状态统一到一个 **Investigation** 抽象下。

## Investigation 定义

一次 Investigation = 用户对一个数据集的完整分析过程，从数据加载到最终结论。

```
Investigation
├── Lifecycle      (stage, source, startedAt)
├── Context        (activeTable, activeRunId)
├── Conversation   (turns, compressedSummary)
├── Findings       (keyFindings, investigationSummary)
├── Drill-down     (drillChain: parentRunId → childRunId)
├── Metadata       (lastSql, lastColumns, lastRowCount)
└── Orchestration  (pendingSteps, currentStepIndex)
```

## 状态生命周期

```
idle → uploading → profiling → analyzing → sql-ready → executing → done
                                                      ↑            ↓
                                                      └── follow-up ←── (new question)
```

### Stage 转换规则

| Stage | 触发条件 | 后续 stage |
|-------|---------|-----------|
| `idle` | 初始状态 | `uploading` |
| `uploading` | 用户上传文件 | `profiling` |
| `profiling` | 上传完成 | `analyzing`, `sql-ready` |
| `analyzing` | AI 分析中 | `done` |
| `sql-ready` | SQL 已生成 | `executing` |
| `executing` | 查询执行中 | `done` |
| `done` | 分析完成 | `analyzing` (follow-up) |

## 与其它 Store 的关系

```
investigation-store (new)     — 分析生命周期 + AI 上下文
    ├── 引用 → data-store.currentTable
    ├── 引用 → analysis-store.activeRunId
    └── 引用 → sql-editor-store.currentSql (read-only)

sql-editor-store (new)        — SQL 编辑 + 执行 + 结果
sql-history-store             — 查询历史 (独立)
saved-queries-store           — 保存的查询 (独立)
analysis-store                — 分析运行历史 (独立)
data-store                    — 数据 + 表 (独立)
workspace-store               — UI 布局/语言 (独立)
```

## 禁止重复状态

以下状态 **只能存在于一个 store**：

| 状态 | Owner | 消费者通过...访问 |
|------|-------|------------------|
| `activeTable` | data-store | `useDataStore().currentTable` |
| `currentSql` | sql-editor-store | `useSqlEditorStore().currentSql` |
| `lastSql` | investigation-store | `useInvestigationStore().lastSql` |
| `stage` | investigation-store | `useInvestigationStore().stage` |

## Drill-down Chain

```
Run A (parentRunId=null)
  └── Run B (parentRunId=A.id, drillDownFrom={runId: A.id, findingIndex: 2})
       └── Run C (parentRunId=B.id, drillDownFrom={runId: B.id, findingIndex: 0})
```

`investigation-store.drillChain` 维护完整链路，支持回溯。
