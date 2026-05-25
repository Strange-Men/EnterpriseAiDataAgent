# Current Session — Enterprise AI Data Agent

> Last updated: 2026-05-25

## Current Version

- **Version**: v0.7.4
- **Phase**: v0.7.x AI Analyst Intelligence Layer
- **Status**: Runtime Stability & Resource Lifecycle — 消除 import 时副作用、lazy init、FastAPI lifespan

## Session Goals

1. ~~多轮分析连续性~~ — v0.7.1 完成
2. ~~AI 会话质量~~ — v0.7.2 完成
3. ~~系统精简清理~~ — v0.7.3 完成
4. 运行时稳定性 — 消除 import 时副作用，集中资源生命周期管理

## System Health

- Frontend build: PASS
- Backend import: PASS
- Frontend tests: 160/160 PASS
- Backend tests: 338 PASS (排除预存失败: test_query_select, test_history_after_query, test_observability, test_query_history.test_get_all)
- TypeScript: PASS
- Prompts: 11 registered

## Key Changes (v0.7.4)

### 后端
- `query_history.py`: `__init__()` 改为 lazy init，首次使用时才连接 DuckDB
- `data_service.py`: `_db` / `_executor` 改为 `get_db()` / `get_executor()` lazy getter
- `main.py`: 新增 FastAPI lifespan 上下文管理器（启动预热 + 关闭清理）
- `db_manager.py`: `close()` 增加异常防护
- 所有引用链更新：`routes/query.py`, `routes/tables.py`, `routes/analyze.py`, `ai_pipeline.py`, 测试文件

### 根因分析
- `uvicorn --reload` 下 DuckDB 文件锁定：import 时 `QueryHistory()` 构造函数直接调用 `duckdb.connect()`
- 第一个 worker 持有文件锁，reload 后新 worker 无法连接
- 修复：所有 DuckDB 连接延迟到首次请求时创建

### 测试
- 后端 338 pass / 4 pre-existing fail（与 v0.7.3 一致）
- 前端 160/160 pass

## Next Steps

- v0.7.5: 待定
