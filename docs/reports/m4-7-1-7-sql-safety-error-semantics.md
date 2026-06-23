# M4-7.1.7 SQL Safety Error Semantics

## 1. Problem

M4-7.1.6-B 本地回归审查发现：DROP TABLE 等危险 SQL 被安全拦截了，但 HTTP 状态码返回 500，而不是 400/403。

安全逻辑生效，但 API 错误语义不规范。

## 2. Root Cause

`backend/routes/query.py` 的 `execute_query()` 函数中，所有异常都被同一个 `except Exception as e` 捕获，统一返回 HTTP 500：

```python
except Exception as e:
    runtime_ms = int((time.time() - start) * 1000)
    query_history.add(sql, "error", runtime_ms, 0, str(e))
    logger.error(f"Query execution error: {e}")
    raise HTTPException(status_code=500, detail="Query execution failed")
```

`QueryExecutor._validate_readonly()` 抛出的 `QueryError`（来自 `database/query_executor.py`）被这个通用 `except` 捕获，导致危险 SQL 的验证错误被当作服务器内部错误返回。

同样的问题也存在于 `explain_query()` 和 `export_query()` 端点。

## 3. Fix

在 `backend/routes/query.py` 中，新增 `QueryError` 的专门捕获，返回 HTTP 400：

```python
from database.query_executor import QueryError

# execute_query:
except QueryError as e:
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    # 原有的 500 处理不变

# explain_query:
try:
    result = get_readonly_executor().explain(sql)
except QueryError as e:
    raise HTTPException(status_code=400, detail=str(e))

# export_query:
try:
    result = get_readonly_executor().execute(sql)
except QueryError as e:
    raise HTTPException(status_code=400, detail=str(e))
```

修复原则：
1. 不改变 SQL 安全判断逻辑
2. 只修错误映射和 HTTP status
3. 不让危险 SQL 进入执行层
4. 不让危险 SQL 变成 200
5. 不吞掉其他真实服务器错误（仍返回 500）

## 4. Safety Behavior

| SQL Type | Behavior |
|----------|----------|
| SELECT | ✅ 正常执行，返回 200 |
| WITH (CTE) | ✅ 正常执行，返回 200 |
| EXPLAIN | ✅ 正常执行，返回 200 |
| DROP TABLE | ❌ 被拦截，返回 400 |
| DELETE FROM | ❌ 被拦截，返回 400 |
| UPDATE SET | ❌ 被拦截，返回 400 |
| INSERT INTO | ❌ 被拦截，返回 400 |
| ALTER TABLE | ❌ 被拦截，返回 400 |
| CREATE TABLE | ❌ 被拦截，返回 400 |
| TRUNCATE | ❌ 被拦截，返回 400 |
| MERGE | ❌ 被拦截，返回 400 |
| ATTACH/INSTALL/COPY | ❌ 被拦截，返回 400 |

错误响应格式：
```json
{
  "detail": "Statement type not allowed: DROP. Only SELECT queries are permitted."
}
```

不暴露 traceback，不暴露内部文件路径。

## 5. Validation

| Check | Result |
|-------|--------|
| Backend import | ✅ OK |
| New tests (M4-7.1.7) | ✅ 29 passed |
| Full backend pytest | ✅ 552 passed, 31 skipped |
| Frontend tsc | ✅ OK |
| Frontend test | ✅ 257 passed |
| Frontend build | ✅ OK |

## 6. M4-7.1.6-B Merge

M4-7.1.6-B 已通过 fast-forward 合并到 master（commit `aec658c`）。

详见 `m4-7-1-6-b-merge-validation.md`。

## 7. Next Step

修复通过并线上快速验证后，可以进入 M4-7.2 State Boundary Cleanup。

- 暂不进入 M5 Agent
- 暂不打 tag
