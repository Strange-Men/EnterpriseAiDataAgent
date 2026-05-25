# System Architecture State — v0.7.6

> Last updated: 2026-05-25
> Version: v0.7.6 (pending commit)

## 架构概览

```
frontend-react/ (Next.js 15 + React 19 + TypeScript)
    ↓ /api/* proxy
backend/ (FastAPI + Uvicorn)
    ↓
database/ (DuckDB)
```

## 序列化层架构 (v0.7.6 新增)

```
API Response
    ↓
Route Handler returns dict/list
    ↓
normalize_for_response() ←── backend/utils/json_safe.py
    ↓
FastAPI jsonable_encoder
    ↓
JSON Response
```

### 安全层级

1. **路由层** — 每个路由返回值调用 `normalize_for_response()`
2. **服务层** — `_sanitize_for_json()` 代理到 `normalize_for_response()`
3. **SSE 层** — `json.dumps(default=json_safe_encoder)`
4. **全局层** — `@app.exception_handler(Exception)` 兜底

## 已修复的关键路径

| 路径 | 修复 |
|------|------|
| `POST /api/query` | 响应 dict 整体 normalize |
| `GET /api/tables` | 表列表 normalize |
| `GET /api/tables/{name}/data` | 分页数据 normalize |
| `POST /api/analyze/{name}` | 分析结果 normalize |
| `POST /api/ai/*` SSE 事件 | json_safe_encoder |
| `GET /api/query/history` | 历史记录 normalize |
| `POST /api/query/explain` | 解释结果 normalize |
| `GET /api/query/schema` | schema normalize |

## 模块清单

### 新增模块

- `backend/utils/__init__.py` — 包初始化
- `backend/utils/json_safe.py` — 统一序列化工具
  - `normalize_for_response()` — 递归类型转换
  - `json_safe_encoder()` — json.dumps default handler

### 修改模块

- `backend/services/data_service.py` — `_sanitize_for_json` 重写
- `backend/routes/query.py` — 响应 normalize
- `backend/routes/tables.py` — 响应 normalize
- `backend/routes/analyze.py` — 响应 normalize
- `backend/routes/ai.py` — SSE encoder + import
- `backend/main.py` — 全局异常处理器 + logging

### 测试

- `tests/test_json_safe.py` — 41 个序列化回归测试

## 端点清单 (28 个)

| 分类 | 端点 | 状态 |
|------|------|------|
| Data | POST /api/query | ✅ Fixed |
| Data | GET /api/query/history | ✅ Fixed |
| Data | POST /api/query/explain | ✅ Fixed |
| Data | POST /api/query/cancel | ✅ Safe |
| Data | POST /api/query/export | ✅ Safe |
| Data | GET /api/query/schema | ✅ Fixed |
| Tables | GET /api/tables | ✅ Fixed |
| Tables | GET /api/tables/{name} | ✅ Safe |
| Tables | GET /api/tables/{name}/schema | ✅ Safe |
| Tables | DELETE /api/tables/{name} | ✅ Safe |
| Tables | GET /api/tables/{name}/data | ✅ Fixed |
| Tables | PUT /api/table/{name}/rename | ✅ Safe |
| Tables | GET /api/table/{name}/export | ⚠️ CSV NaN handling |
| Upload | POST /api/upload | ✅ Safe |
| Quality | GET /api/quality/{name} | ✅ Safe |
| Analyze | POST /api/analyze/{name} | ✅ Fixed |
| Analyze | GET /api/analyze/{name}/profile | ✅ Fixed |
| AI | GET /api/ai/status | ✅ Safe |
| AI | POST /api/ai/query | ✅ Safe |
| AI | POST /api/ai/explain | ✅ Safe |
| AI | POST /api/ai/explain/stream | ✅ Fixed (SSE) |
| AI | POST /api/ai/insights | ✅ Safe |
| AI | POST /api/ai/insights/stream | ✅ Fixed (SSE) |
| AI | POST /api/ai/chart-suggest | ✅ Safe |
| AI | POST /api/ai/anomalies | ✅ Safe |
| AI | POST /api/ai/anomalies/stream | ✅ Fixed (SSE) |
| AI | POST /api/ai/semantics | ✅ Safe |
| AI | POST /api/ai/suggest-questions | ✅ Safe |
| AI | POST /api/ai/plan | ✅ Safe |
| AI | POST /api/ai/analyze-multi | ✅ Safe |
| AI | POST /api/ai/analyze-multi/stream | ✅ Fixed (SSE) |
| System | GET /api/health | ✅ Safe |
| System | GET /api/status | ✅ Safe |
| System | GET /api/health/system | ✅ Safe |
