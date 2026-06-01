# System Architecture State — Enterprise AI Data Agent

> Audit date: 2026-05-25 | Version: v0.7.6 | Phase: AI Analyst Intelligence Layer

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│  frontend-react/ (Next.js 15 + React 19 + TS)      │
│    3-panel workspace: Left | Center | Right         │
│    12 Zustand stores, 40+ components                │
│    api.ts (1054 lines) — all API + SSE streaming    │
│    Port 3000                                         │
└──────────────────────┬──────────────────────────────┘
                       │ /api/* proxy (next.config.ts)
┌──────────────────────▼──────────────────────────────┐
│  backend/ (FastAPI + Uvicorn)                        │
│    6 routes, 11 services, 11 prompts                │
│    Token budget, guardrails, trace, scheduler        │
│    json_safe serialization layer                     │
│    Port 8000                                         │
└──────────────────────┬──────────────────────────────┘
                       │ duckdb.connect()
┌──────────────────────▼──────────────────────────────┐
│  database/ (DuckDB)                                  │
│    db_manager (singleton), query_executor             │
│    file_loader, schema_detector, data_quality        │
│    enterprise.duckdb file                            │
└─────────────────────────────────────────────────────┘
```

## 2. Backend Module Map (45 .py files)

### Entry Point
- `main.py` — FastAPI app, lifespan (DB warmup + scheduler start), CORS, middleware, route mounting, global exception handler

### Routes (6 files, thin controllers)
| File | Lines | Endpoints |
|------|-------|-----------|
| `routes/ai.py` | 552 | 20+ AI endpoints (query, explain, insights, charts, anomalies, plan, analyze-multi, schedule, evaluate, bundle, report, compare, template-adaptation) |
| `routes/query.py` | 156 | POST /query, explain, cancel, export, schema, history |
| `routes/tables.py` | 126 | GET/DELETE /tables, rename, paginated data |
| `routes/analyze.py` | 99 | POST/GET /analyze/{table} |
| `routes/upload.py` | 22 | POST /upload |
| `routes/quality.py` | 14 | GET /quality/{table} |

### Services (11 files)
| File | Lines | Role |
|------|-------|------|
| `ai_analyst.py` | 1020 | Core LLM layer: SQL gen, explain, insights, charts, semantics, anomaly interp, self-eval |
| `ai_pipeline.py` | 626 | Orchestrator: NL->SQL->Execute->Explain, multi-step autonomous analysis |
| `data_service.py` | 242 | Lazy-init DB singletons, CRUD wrappers, system health |
| `anomaly_detector.py` | 286 | Pure-Python statistical anomaly detection (Z-score, IQR, auto) |
| `token_budget.py` | 234 | Token estimation, 10 per-op budgets, workflow tracker (25K cap) |
| `scheduler.py` | 179 | Scheduled task CRUD, JSON persistence |
| `report_builder.py` | 180 | Pure-Python Markdown report builder |
| `trace.py` | 141 | Analysis trace recorder (LLM calls, tokens) |
| `diff_engine.py` | 145 | Pure-Python structured diff between runs |
| `guardrails.py` | 131 | Runtime limits: steps, timeouts, failures |
| `query_history.py` | 135 | In-memory + DuckDB-persisted query history |
| `profiler.py` | 63 | DataFrame statistical profiler |
| `export_service.py` | 43 | CSV/JSON/Excel export |
| `shared_utils.py` | 8 | Single `truncate()` utility |

### Prompts (11 modules + 3 infra)
- `contracts.py` — PromptContract frozen dataclass
- `registry.py` — Central registry (11 prompts)
- `locale.py` — Language injection (zh/en)
- 11 prompt modules: sql_generation, explanation, insights, chart_suggest, semantics, suggest_questions, analysis_plan, summarizer, template_adaptation, self_evaluation, anomaly_interpretation

### Database (5 modules)
- `db_manager.py` — DuckDB singleton via `__new__`, table CRUD
- `query_executor.py` — SQL execution, pagination, EXPLAIN
- `file_loader.py` — CSV/Excel with multi-encoding
- `schema_detector.py` — Pandas->DuckDB type mapping, DDL
- `data_quality.py` — Enterprise quality analyzer (6-step)

## 3. Frontend Module Map

### Entry Point
- `app/layout.tsx` — HTML shell, theme FOUC prevention script
- `app/page.tsx` — 3-panel workspace composition (86 lines)

### Panels (11 files)
| File | Lines | Panel |
|------|-------|-------|
| `ai-analysis-panel.tsx` | 835 | AI analysis runner (explain/insights/charts/autonomous/anomalies) |
| `sql-workspace-panel.tsx` | 705 | Center: SQL editor, tabs, execute, explain, AI buttons |
| `analysis-workspace-panel.tsx` | 535 | Right: analysis history, templates, diff, schedule |
| `file-upload-panel.tsx` | 262 | Left: file upload + table list |
| `table-management-panel.tsx` | 216 | Left: table CRUD |
| `sql-history-panel.tsx` | 205 | Right: SQL history search/filter |
| `data-preview-panel.tsx` | 192 | Right: data preview (preview/schema/quality) |
| `diff-panel.tsx` | 181 | Inline diff/compare |
| `status-panel.tsx` | 150 | Left: system status + AI settings |

### Stores (12 Zustand stores)
| Store | Persist Key | Lines | Role |
|-------|-------------|-------|------|
| `analysis-store.ts` | "analysis-history" | 453 | Analysis runs, history, comparison, evolution |
| `ai-session-store.ts` | "ai-session" | 230 | Multi-turn AI conversation + compression |
| `sql-workspace-store.ts` | NONE | 118 | SQL execution state, query results |
| `sql-history-store.ts` | "sql-history" | 127 | Query history with search/filter |
| `schedule-store.ts` | "schedule-tasks" | 112 | Scheduled analysis tasks |
| `query-tabs-store.ts` | "query-tabs" | 100 | Multi-tab SQL editor |
| `template-store.ts` | "analysis-templates" | 99 | Analysis template CRUD |
| `saved-queries-store.ts` | "saved-queries" | 83 | Saved/favorite queries |
| `data-store.ts` | NONE | 81 | DB status, tables, quality |
| `workflow-store.ts` | NONE | 59 | Pipeline stage tracking |
| `workspace-store.ts` | "workspace-settings" | 48 | Language, layout, panels |
| `use-theme.ts` | "workspace-theme" | 29 | Dark/light theme |

### Service Layer
- `api.ts` (1054 lines) — 35+ API functions + 2 SSE consumers
- `logger.ts` (93 lines) — In-memory structured logger

## 4. Data Flow

### Query Execution Flow
```
User SQL -> SqlWorkspacePanel
  -> api.ts executeQuery(sql, offset, limit)
  -> POST /api/query
  -> routes/query.py -> get_executor().execute(sql)
  -> query_executor.py -> db_manager.execute_query()
  -> DuckDB -> result DataFrame -> normalize_for_response()
  -> JSON response -> sql-workspace-store.setQueryResult()
  -> DataTable renders with virtual scroll + load-more
```

### AI Analysis Flow (Autonomous Multi-Step)
```
User question -> AIAnalysisPanel
  -> api.ts streamAiAnalyzeMulti(question, table, ...)
  -> POST /api/ai/analyze-multi/stream (SSE)
  -> routes/ai.py -> run_autonomous_analysis_stream()
  -> ai_pipeline.py:
    1. generate_analysis_plan() -> LLM -> plan steps
    2. For each step:
       a. guardrail check (max_steps, timeout, failures)
       b. generate_sql() -> LLM -> SQL
       c. executor.execute(sql) -> DuckDB -> results
       d. explain_results() -> LLM -> explanation
    3. _build_executive_summary() -> LLM -> summary
  -> SSE events: plan -> step_start -> step_result -> summary -> done
  -> Frontend: progressive rendering, analysis-store.addRun()
```

### File Upload Flow
```
File -> FileUploadPanel -> api.ts uploadFile(file)
  -> POST /api/upload
  -> routes/upload.py -> data_service.upload_file()
  -> file_loader.load_file() -> DataFrame
  -> schema_detector.detect_schema() -> DDL
  -> db_manager.import_dataframe() -> DuckDB table
  -> Response: {tableName, rowCount, columnCount}
```

## 5. Store Relationships

### Cross-Store Dependencies
```
data-store.getDatasetMeta()
  +-- reads analysis-store.getState().runs

sql-workspace-panel.tsx
  +-- reads: query-tabs-store (active tab SQL)
  +-- reads: sql-workspace-store (isExecuting, queryResult)
  +-- writes: sql-history-store (addEntry after query)
  +-- writes: analysis-store (addRun after AI analysis)

table-management-panel.tsx
  +-- writes: sql-workspace-store.currentSql (BUG: dead state, never read)
```

### Persist Chain (localStorage, 9 keys)
| Key | Store | Size Limit | Compression |
|-----|-------|-----------|-------------|
| "workspace-settings" | workspace-store | None | None |
| "workspace-theme" | use-theme | None | None |
| "query-tabs" | query-tabs-store | None | Tab validation |
| "saved-queries" | saved-queries-store | None | None |
| "sql-history" | sql-history-store | 2MB | SQL truncation (1000ch) |
| "analysis-history" | analysis-store | 4MB | Section/chart/step/trace capping |
| "ai-session" | ai-session-store | None | Turn compression (15->8) |
| "analysis-templates" | template-store | None | FIFO cap (20) |
| "schedule-tasks" | schedule-store | None | Result cap (50) |

### Reload Lifecycle
```
Page load -> all persist stores rehydrate from localStorage
  -> analysis-store.onRehydrateStorage -> recoverInterruptedRuns()
  -> ai-session-store rehydrates (turns, keyFindings, compressedSummary)
  -> sql-workspace-panel useEffect -> fetchHistory()
  -> sql-history-panel useEffect -> fetchQueryHistory() [DUPLICATE CALL]
  -> data-store: empty, re-fetched by useTables() hook
```

## 6. AI Workflow Chain

### Prompt Registry (11 prompts)
```
sql_generation      -> NL->SQL conversion
explanation         -> Result interpretation (streaming)
insights            -> Structured insights with confidence (streaming)
chart_suggest       -> Chart type recommendation
semantics           -> Column role detection
suggest_questions   -> Smart question generation
analysis_plan       -> Multi-step plan decomposition
summarizer          -> Executive summary
template_adaptation -> Cross-dataset template adaptation
self_evaluation     -> Quality audit (completeness/accuracy/actionability)
anomaly_interpretation -> Business meaning of anomalies (streaming)
```

### Token Budget Chain
```
WorkflowTokenTracker (25K total)
  +-- sql_generation:     3K in / 512 out
  +-- explanation:        6K in / 1024 out
  +-- insights:           5K in / 1024 out
  +-- chart_suggest:      3K in / 512 out
  +-- semantics:          3K in / 1024 out
  +-- suggest_questions:  2K in / 512 out
  +-- analysis_plan:      3K in / 1024 out
  +-- summarizer:         3K in / 512 out
  +-- anomaly_interp:     4K in / 1024 out
  +-- self_evaluation:    3K in / 1024 out
```

### Guardrails Chain
```
AnalysisGuard (default: 6 steps, 8 SQL, 2 consecutive fails, 120s total, 30s/step)
  +-- STRICT preset: 4 steps, 5 SQL, 1 consecutive fail, 60s total, 15s/step
```

## 7. Persistence Chain

### Backend Persistence
- DuckDB: `enterprise.duckdb` — tables, query_history table
- JSON file: `data/scheduled_tasks.json` — scheduler tasks
- In-memory: `_UPLOAD_TIMESTAMPS` dict, `_active_queries` dict, `QueryHistory` deque

### Frontend Persistence (9 localStorage keys — see section 5 table)

## 8. SSE Streaming Architecture

### Backend (4 streaming endpoints)
| Endpoint | Generator | Media |
|----------|-----------|-------|
| `/ai/explain/stream` | `explain_results_stream()` | text chunks |
| `/ai/insights/stream` | `generate_insights_stream()` | text chunks |
| `/ai/anomalies/stream` | `detect_and_interpret_anomalies_stream()` | JSON events |
| `/ai/analyze-multi/stream` | `run_autonomous_analysis_stream()` | structured events |

All use: `StreamingResponse`, `text/event-stream`, `Cache-Control: no-cache`, `json_safe_encoder`

### Frontend (2 SSE consumers)
| Function | Timeout | Retry | Used By |
|----------|---------|-------|---------|
| `consumeSseStream` | 60s | 2x (1s, 2s) | streamAiExplain, streamAiInsights |
| `consumeSseStreamGeneric` | 120s | 2x (1s, 2s) | streamAiAnalyzeMulti, streamAiDetectAnomalies |

Both: ReadableStream + TextDecoder, buffer drain, AbortController cancellation

## 9. Dependency Graph

```
main.py
  +-- config.py
  +-- middleware/observability.py
  +-- routes/upload.py -----> data_service -> database/*
  +-- routes/tables.py -----> data_service -> database/*
  +-- routes/quality.py ----> data_service -> database/*
  +-- routes/query.py ------> data_service, query_history, export_service
  +-- routes/analyze.py ----> data_service, profiler, ai_analyst
  +-- routes/ai.py ---------> ai_analyst, ai_pipeline, guardrails
  |     [lazy] scheduler, report_builder, diff_engine, locale
  +-- runtime/scheduler_worker -> scheduler -> ai_pipeline
  +-- utils/json_safe

ai_pipeline.py
  +-- ai_analyst (generate_sql, explain_results, build_schema_context)
  +-- data_service (get_executor, list_tables)
  +-- guardrails, trace, token_budget
  +-- prompts.summarizer

ai_analyst.py
  +-- anthropic SDK
  +-- config, token_budget, trace
  +-- prompts.* (10 modules)
  +-- [lazy] anomaly_detector, prompts.self_evaluation
```

**No circular dependencies.** DAG is clean. Lazy imports used defensively.

## 10. Serialization Layer (v0.7.6)

```
API Response
    -> Route Handler returns dict/list
    -> normalize_for_response() <- backend/utils/json_safe.py
    -> FastAPI jsonable_encoder
    -> JSON Response
```

### Safety Layers
1. **Route layer** — every route return calls `normalize_for_response()`
2. **Service layer** — `_sanitize_for_json()` proxies to `normalize_for_response()`
3. **SSE layer** — `json.dumps(default=json_safe_encoder)`
4. **Global layer** — `@app.exception_handler(Exception)` fallback

## 11. Key Architectural Observations

### Strengths
- Clean DAG dependency graph — no circular dependencies
- Lazy initialization prevents import-time DuckDB locking
- Well-structured prompt architecture with contracts and registry
- Comprehensive token budget and guardrail systems
- 9 persisted stores with merge functions for resilience
- 4-layer serialization defense

### Weaknesses
- `routes/ai.py` is a 552-line monolith with 20+ handlers
- `ai_analyst.py` is 1020 lines — the largest single file
- `api.ts` is 1054 lines — frontend monolith
- Dual-layer singleton pattern (DatabaseManager.__new__ + data_service.get_db())
- State duplication: `sql-workspace-store.currentSql` vs `query-tabs-store.tabs[].sql`
- `models/schemas.py` is dead code — never imported
- `schema_detector.get_data_quality_report()` duplicates `data_quality.analyze_dataframe()`
- `_safe_serialize()` in ai_analyst duplicates `json_safe_encoder()`
- `_truncate()` in self_evaluation duplicates `shared_utils.truncate()`
