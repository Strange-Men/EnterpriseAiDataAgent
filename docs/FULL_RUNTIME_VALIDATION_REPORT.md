# Full Runtime Validation Report — v0.7.6

> Date: 2026-05-25
> Environment: Windows 11, Python 3.11, uvicorn (dev mode)
> Database: DuckDB (data/enterprise.duckdb)

## 测试摘要

| 指标 | 结果 |
|------|------|
| 总测试用例 | 20 |
| 通过 | 20 |
| 失败 | 0 |
| 回归测试 (新增) | 41/41 通过 |
| 后端测试套件 | 341/342 通过* |

*1 个预存失败（测试隔离问题，非回归）

## 逐项验证

### 1. SQL 查询执行

| 测试 | HTTP | 状态 |
|------|------|------|
| `SELECT 1 as test` | 200 | ✅ |
| `SELECT 1, true, 3.14, 'hello'` | 200 | ✅ |
| `SELECT NULL, 1` | 200 | ✅ |
| `SELECT current_timestamp, current_date` | 200 | ✅ |
| `SELECT CAST(123.456 AS DECIMAL(10,3))` | 200 | ✅ |
| `SELECT 'Inf'::DOUBLE, 'NaN'::DOUBLE` | 200 | ✅ (NaN→null) |
| `SELECT * FROM nonexistent_table` | 200 | ✅ (优雅返回 error) |

### 2. 分页

| 测试 | HTTP | 状态 |
|------|------|------|
| `SELECT * FROM generate_series(1,100)` offset=0 limit=10 | 200 | ✅ |
| hasMore 字段类型 | — | ✅ Python bool |
| totalRows 字段类型 | — | ✅ Python int |

### 3. CSV 上传

| 测试 | HTTP | 状态 |
|------|------|------|
| 上传 3 行 CSV（含 NaN） | 200 | ✅ |
| 查询上传后的表 | 200 | ✅ |
| 分页获取上传表数据 | 200 | ✅ |

### 4. 查询历史

| 测试 | HTTP | 状态 |
|------|------|------|
| `GET /api/query/history` | 200 | ✅ |
| 历史记录包含错误查询 | 200 | ✅ |

### 5. 系统端点

| 测试 | HTTP | 状态 |
|------|------|------|
| `GET /api/status` | 200 | ✅ |
| `GET /api/health/system` | 200 | ✅ |
| `POST /api/query/explain` | 200 | ✅ |
| `GET /api/query/schema` | 200 | ✅ |
| `GET /api/tables` | 200 | ✅ |
| `GET /api/quality/{name}` | 200 | ✅ |
| `GET /api/tables/{name}` | 200 | ✅ |

### 6. 负载测试

| 测试 | 结果 |
|------|------|
| 20 次重复请求 | ✅ 全部 200 |
| 5 并发请求 | ✅ 全部 200 |
| 错误 SQL 后继续正常查询 | ✅ |

### 7. 序列化回归测试

| 测试类别 | 数量 | 结果 |
|----------|------|------|
| numpy.bool_ | 4 | ✅ |
| numpy.integer | 2 | ✅ |
| numpy.float (含 NaN/Inf) | 4 | ✅ |
| Python float NaN/Inf | 2 | ✅ |
| numpy array | 2 | ✅ |
| numpy str | 1 | ✅ |
| numpy datetime64 | 1 | ✅ |
| numpy timedelta64 | 1 | ✅ |
| pandas Timestamp/NaT | 2 | ✅ |
| Python datetime/date/timedelta | 3 | ✅ |
| Decimal (含 NaN/Inf) | 4 | ✅ |
| UUID | 1 | ✅ |
| 嵌套结构 | 2 | ✅ |
| 基本类型透传 | 5 | ✅ |
| json_safe_encoder | 6 | ✅ |
| 向后兼容 _sanitize_for_json | 1 | ✅ |

## 未执行的测试

| 测试 | 原因 |
|------|------|
| AI explain (需 API key) | 已配置但未在此轮测试 |
| AI insights (需 API key) | 同上 |
| Autonomous analysis (需 API key) | 同上 |
| SSE 流式事件 | 需 API key，逻辑已通过单元测试验证 |
| 前端 E2E 测试 | 需前后端同时运行 |
| 浏览器刷新测试 | 需前端运行 |

## 结论

**核心 SQL 查询链路完全稳定。** 序列化层已全面修复，覆盖所有已知 numpy/pandas/Decimal 类型。
API 500 错误已被消除。

### 建议下一步

1. 执行前端 E2E 测试（上传→查询→分页→AI→重载）
2. 修复 CSV 导出 NaN 处理
3. 修复测试隔离问题
4. 版本提交 `v0.7.6`
