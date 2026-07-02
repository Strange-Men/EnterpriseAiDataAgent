# M5.4.0 Agent Runtime / API / Persistence Plan

## 1. Goal

Plan how M5.3 Agent pipeline tool wrappers will become a safe backend Agent Runtime with future API and persistence support.

## 2. Files Changed

- docs/architecture/m5-4-agent-runtime-api-persistence-plan.md
- docs/reports/m5-4-0-agent-runtime-api-persistence-plan.md
- CURRENT_SESSION.md

## 3. Existing Backend Audit

Routes reviewed:

- `backend/main.py`
- `backend/routes/upload.py`
- `backend/routes/tables.py`
- `backend/routes/query.py`
- `backend/routes/ai.py`
- `backend/routes/analyze.py`

Services reviewed:

- `backend/services/data_service.py`
- `backend/services/query_history.py`
- `backend/services/ai_pipeline.py`
- `backend/services/ai_analyst.py`
- `backend/services/report_builder.py`
- `backend/services/llm_runtime.py`
- `backend/services/sql_validator.py`
- `backend/services/trace.py`

Database reviewed:

- `database/db_manager.py`
- `database/query_executor.py`
- `database/file_loader.py`
- `database/data_quality.py`
- `database/schema_detector.py`

Tests reviewed:

- `tests/unit/test_agent_*`
- backend route/service tests under `tests/`

Frontend placement inspected:

- `frontend-react/src/app/(shell)/analyze/page.tsx`
- `frontend-react/src/app/(shell)/analyze/[runId]/page.tsx`
- `frontend-react/src/app/(shell)/history/page.tsx`
- `frontend-react/src/stores/analysis-store.ts`
- `frontend-react/src/stores/sql-history-store.ts`

## 4. Key Design Decisions

- Agent Runtime boundary: keep a backend runtime module separate from existing AI and query routes.
- API boundary: plan future `/api/agent/runs` endpoints without implementing them in M5.4.0.
- Persistence boundary: prefer Agent-specific persistence over mutating query history, pending user review.
- Frontend placement: defer Analyze / History / Detail UI integration until backend runtime/API/persistence are stable.
- Mock / simulated default: simulated execution remains the default until explicitly changed.
- Real provider disabled by default: no live provider call is enabled in M5.4.0.

## 5. M5.4 Proposed Micro-steps

- M5.4.1 Agent Runtime Skeleton
- M5.4.2 Agent Runtime Simulated Chain
- M5.4.3 Agent API Contract Plan or API Skeleton
- M5.4.4 Agent Persistence Plan / Schema Draft
- M5.4.5 Agent Runtime Regression
- M5.4 Final Merge Validation

## 6. What Was Not Changed

- 未实现 Agent Runtime
- 未新增 FastAPI route
- 未实现 persistence
- 未新增 migration
- 未接 frontend
- 未接真实 LLM
- 未访问网络/provider
- 未修改 backend services
- 未修改 backend routes
- 未修改 database/query_executor
- 未安装新依赖
- 未修改 requirements.txt
- 未打 tag

## 7. Validation

- backend import: backend import OK
- focused Agent tests: 190 passed
- full pytest: 749 passed, 31 skipped
- safety search: no matches
- forbidden dependency search: no matches

## 8. Next Step

等待用户审查。通过后再决定进入：

```text
M5.4.1 Agent Runtime Skeleton
```

Do not start M5.4.1 in this round.
