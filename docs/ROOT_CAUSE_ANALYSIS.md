# Root Cause Analysis — SQL API 500 (v0.7.5)

> Date: 2026-05-25
> Severity: Critical
> Status: Fixed in v0.7.6

## 摘要

SQL 查询 API 返回 HTTP 500 错误，FastAPI 响应序列化阶段崩溃。

## 根因

**`numpy.bool_` 类型无法被 FastAPI `jsonable_encoder` 序列化。**

### 错误链

```
POST /api/query
  → execute_query() 返回 dict，包含 numpy 类型
    → FastAPI serialize_response()
      → jsonable_encoder(response_content)
        → 遇到 numpy.bool_ 值
          → dict(obj) 失败 (TypeError: not iterable)
            → vars(obj) 失败 (no __dict__)
              → ValueError 抛出 → 500
```

### 具体原因

`QueryExecutor.execute_paginated()` 返回 `has_more` 字段，计算逻辑：
```python
has_more = (offset + len(df)) < total_rows
```

当 `offset + len(df)` 运算涉及 numpy int64 时，比较结果为 `numpy.bool_` 而非 Python `bool`。
FastAPI 的 `jsonable_encoder` 不识别 numpy 类型，导致序列化失败。

### 旧的 `_sanitize_for_json` 问题

原函数只处理 `data` 列表中的行数据，不处理响应 dict 的标量字段（如 `hasMore`、`totalRows`）。
此外缺少以下类型处理：
- `datetime.datetime` / `datetime.date`
- `decimal.Decimal`
- `numpy.datetime64` / `numpy.timedelta64`
- `pandas.Timestamp` / `pd.NaT`
- `UUID`
- Python `float('nan')` / `float('inf')`

## 修复方案

### 1. 新建 `backend/utils/json_safe.py`

统一序列化工具模块：
- `normalize_for_response(obj)` — 递归转换整棵树为 JSON 安全的 Python 原生类型
- `json_safe_encoder(obj)` — `json.dumps` 的 `default` 处理器

覆盖类型：
| 类型 | 转换结果 |
|------|----------|
| `numpy.bool_` | `bool` |
| `numpy.integer` (所有子类) | `int` |
| `numpy.floating` | `float` (NaN/Inf → `None`) |
| `numpy.datetime64` | ISO 8601 字符串 |
| `numpy.timedelta64` | 字符串 |
| `numpy.str_` | `str` |
| `numpy.ndarray` | `list` |
| `pandas.Timestamp` | ISO 8601 字符串 |
| `pd.NaT` | `None` |
| `datetime/date/time/timedelta` | ISO 8601 / 字符串 |
| `Decimal` | `int` 或 `float` (NaN/Inf → `None`) |
| `UUID` | 字符串 |
| Python `float('nan')`/`inf` | `None` |

### 2. 修改 `data_service.py`

`_sanitize_for_json` 重写为调用 `normalize_for_response` 的代理函数，保持向后兼容。

### 3. 修改路由返回点

- `routes/query.py` — 所有响应 dict 包裹 `normalize_for_response()`
- `routes/tables.py` — 表列表和分页数据包裹 `normalize_for_response()`
- `routes/analyze.py` — 分析结果包裹 `normalize_for_response()`
- `routes/ai.py` — SSE 事件使用 `json_safe_encoder` 作为 `json.dumps` 的 `default`

### 4. 添加全局异常处理器

`main.py` 新增 `@app.exception_handler(Exception)` 捕获所有未处理异常，返回结构化 JSON 错误。

## 验证结果

| 测试 | 结果 |
|------|------|
| `SELECT 1 as test` | ✅ 200 |
| `SELECT NULL` | ✅ 200 |
| `SELECT current_timestamp` | ✅ 200 |
| DECIMAL 类型 | ✅ 200 |
| NaN/Inf 值 | ✅ 200, 正确转为 null |
| CSV 上传 + 查询 | ✅ 200 |
| 分页查询 | ✅ 200 |
| 20 次重复请求 | ✅ 全部 200 |
| 5 并发请求 | ✅ 全部 200 |
| 错误 SQL (优雅降级) | ✅ 200, 返回 error 状态 |
| 后端测试套件 | ✅ 341/342 通过 |
| 序列化回归测试 | ✅ 41/41 通过 |

## 经验教训

1. **numpy 类型层次陷阱** — `np.timedelta64` 是 `np.integer` 的子类，isinstance 检查顺序至关重要
2. **标量字段也需序列化** — `_sanitize_for_json` 只处理 data 行不够，响应 dict 中所有字段都可能含 numpy 类型
3. **json.dumps 的类型转换** — `json.dumps` 在调用 `default` 前会把部分 numpy 类型转为 Python 类型，需要双重保护
4. **全局安全网** — 单靠路由层不够，需要中间件/异常处理器兜底
