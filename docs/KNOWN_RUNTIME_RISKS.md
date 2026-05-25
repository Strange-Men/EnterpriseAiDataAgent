# Known Runtime Risks — v0.7.6

> Last updated: 2026-05-25

## 已缓解的风险

| 风险 | 严重度 | 缓解措施 |
|------|--------|----------|
| numpy.bool_ 序列化 500 | Critical | ✅ normalize_for_response 全覆盖 |
| numpy.int64/float64 泄漏 | High | ✅ normalize_for_response 全覆盖 |
| datetime/Decimal 序列化 | High | ✅ normalize_for_response 全覆盖 |
| SSE 事件 numpy 类型 | High | ✅ json_safe_encoder |
| NaN/Inf 响应 | Medium | ✅ 转为 null |

## 残余风险

### 1. Tables CSV 导出 NaN 处理 (Low)

**路径**: `GET /api/table/{table_name}/export`
**问题**: CSV 导出使用 `df.iterrows()` + `row.tolist()`，numpy NaN 会写为字符串 "nan" 而非空值
**影响**: CSV 数据质量
**建议**: 在 `tables.py:116` 使用 `df.fillna('').to_csv()` 替代手动迭代

### 2. 测试隔离 — DuckDB 持久化 (Low)

**路径**: `tests/test_query_history.py::test_get_all`
**问题**: QueryHistory 使用 DuckDB 持久化，测试间共享数据导致断言失败
**影响**: 测试可靠性
**建议**: 测试中使用独立的内存 DB 或 mock

### 3. AI Golden Question 测试不稳定 (Low)

**路径**: `tests/ai/test_golden_questions.py`
**问题**: LLM 生成的 SQL 不稳定，偶发生成无效 SQL（缺少 FROM 子句等）
**影响**: CI 测试可靠性
**建议**: 增加重试机制或降低断言严格度

### 4. DuckDB 单例竞争 (Medium)

**路径**: `database/db_manager.py::DatabaseManager.__new__`
**问题**: 单例模式 + `--reload` 可能导致旧进程持有连接
**影响**: 文件锁定，新进程无法启动
**当前缓解**: `reset_instance()` 方法存在但未自动调用
**建议**: lifespan 启动时自动调用 `reset_instance()`

### 5. 并发查询无连接池 (Low)

**路径**: `database/db_manager.py::connect()`
**问题**: 单一 DuckDB 连接，无连接池
**影响**: 高并发下可能有锁竞争
**当前缓解**: DuckDB 本身支持多读单写，当前负载下无问题
**建议**: 未来高负载时考虑连接池

### 6. 全局异常处理器与 Starlette 冲突 (Informational)

**路径**: `backend/main.py::global_exception_handler`
**问题**: Starlette 的错误中间件会先捕获异常，全局 handler 作为 fallback
**影响**: 某些边缘情况下全局 handler 可能不触发
**当前缓解**: 序列化错误在路由层已全部处理，全局 handler 仅作安全网

## 监控建议

- 启动后检查 `/api/health/system` 的 `db.connected` 状态
- 监控 observability 日志中的 5xx 错误率
- 定期检查 `query_history.errors` 计数
- DuckDB 文件大小增长监控
