# Current Session — Enterprise AI Data Agent

> Last updated: 2026-06-02

## Current Version

- **Version**: v0.9.4
- **Phase**: v0.9.4 Security Hardening, Bug Fixes & Code Quality
- **Status**: Complete — build, lint, backend import all passing

## Session Goals

1. ✅ P0-1: SQL 注入防护 — DuckDB 只读模式
2. ✅ P0-2: 全局异常处理器修复
3. ✅ P0-3: Query 取消机制真正生效
4. ✅ P0-4: Anthropic Client 单例缓存
5. ✅ P0-5: ai_analyze_multi 阻塞事件循环
6. ✅ P0-6: Streaming 静默挂起修复
7. ✅ P0-7: SSE 直连 URL 环境变量化
8. ✅ P0-8: Guardrail 超时逻辑修复
9. ✅ P1-1: Token 预估 CJK 修正
10. ✅ P1-2: Token truncation O(n²) 优化
11. ✅ P1-3: `raise last_error` 防御性修复
12. ✅ P1-4: Anomaly Detection JSON 解析 fallback
13. ✅ P1-5: Streaming 复用 retry helper
14. ✅ P1-6: Observability middleware header 时序修复
15. ✅ P1-7: Monaco Editor Schema Cache 失效
16. ✅ P1-8: Monaco Completion Provider 清理
17. ✅ P1-9: Keyboard Listener 去抖
18. ✅ P2-1: Dashboard i18n 补全
19. ✅ P2-3: Settings Page i18n
20. ✅ P2-4: Dashboard 重复 selector 清理
21. ✅ P2-6: Error Boundary 全局覆盖
22. ✅ P3-1: Table Name SQL 注入防护
23. ✅ P3-2: Thread-safe Singleton
24. ✅ P3-3: Export 内存优化 (iterrows → to_csv)
25. ✅ P3-4: Route Prefix 统一
26. ✅ P3-5: Error Detail Sanitization
27. ✅ P3-6: Config 健壮性
28. ✅ P3-7: Unique Count 优化 (DuckDB COUNT DISTINCT)
29. ✅ P4-1: Data Store per-table quality report
30. ✅ P4-4: saved-queries-store 添加 MAX_QUERIES
31. ✅ P4-5: sql-history-store partialize 清理

## v0.9.4 执行结果

### ✅ P0: 安全漏洞与关键 Bug

#### SQL 注入防护 (P0-1)
- 新增：`backend/services/sql_validator.py` — SQL 语句验证模块
- 修改：`database/query_executor.py` — 添加 readonly 模式，执行前验证 SQL
- 修改：`backend/services/data_service.py` — 新增 `get_readonly_executor()` 单例
- 修改：`backend/routes/query.py` — 所有用户查询使用只读执行器

#### 全局异常处理器 (P0-2)
- 修改：`backend/main.py` — 分离处理 StarletteHTTPException、RequestValidationError、通用 Exception
- HTTPException 保持原始 status code，通用 Exception 返回 "Internal server error"
- 使用 `traceback.format_exception()` 替代 `format_exc()`

#### Query 取消机制 (P0-3)
- 修改：`backend/routes/query.py` — 使用 `threading.Event` 替代 `dict[bool]`
- 修改：`database/query_executor.py` — `execute_paginated` 接受 `cancel_event` 参数
- 执行前和 count 查询前检查取消标志

#### Anthropic Client 单例 (P0-4)
- 修改：`backend/services/ai_analyst.py` — 模块级 `_client` 单例，API key 变更时重建

#### ai_analyze_multi 事件循环 (P0-5)
- 修改：`backend/routes/ai.py` — 用 `run_in_executor` 包装，添加 180s 超时

#### Streaming 静默挂起 (P0-6)
- 修改：`frontend-react/src/services/api.ts` — stream 结束无 "done" 事件时调用 `onDone()` 或 `onError()`

#### SSE URL 环境变量化 (P0-7)
- 修改：`frontend-react/src/services/api.ts` — `DIRECT_BACKEND` 读取 `NEXT_PUBLIC_API_URL`
- 修改：`.env.example` — 添加 `NEXT_PUBLIC_API_URL` 说明

#### Guardrail 超时 (P0-8)
- 修改：`backend/services/guardrails.py` — 新增 `check_during_step()` 方法

### ✅ P1: 重要 Bug 修复

#### Token 预估 CJK 修正 (P1-1)
- 修改：`backend/runtime/token_budget.py` — CJK 字符 ~1.5 char/token，英文 ~3 char/token

#### Token truncation O(n²) (P1-2)
- 修改：`backend/runtime/token_budget.py` — 二分搜索替代逐行删除

#### raise last_error 防御 (P1-3)
- 修改：`backend/services/ai_analyst.py` — 检查 `last_error is not None`

#### JSON 解析 fallback (P1-4)
- 修改：`backend/services/ai_analyst.py` — 新增 `_parse_llm_json()` 工具函数

#### Streaming retry helper (P1-5)
- 修改：`backend/services/ai_pipeline.py` — `_generate_step_sql_with_retry` 添加 `on_retry` 回调

#### Middleware header 时序 (P1-6)
- 修改：`backend/middleware/observability.py` — headers 在 `return response` 前设置

#### Monaco Schema Cache (P1-7)
- 修改：`frontend-react/src/components/monaco-sql-editor.tsx` — 5 分钟 TTL + `invalidateSchemaCache()` 导出

#### Monaco Completion Provider (P1-8)
- 修改：`frontend-react/src/components/monaco-sql-editor.tsx` — 只注册一次，unmount 清理

#### Keyboard Listener 去抖 (P1-9)
- 修改：`frontend-react/src/panels/sql-workspace-panel.tsx` — useRef 存储 currentSql/activeTab

### ✅ P2: 前端代码质量

#### Dashboard i18n (P2-1)
- 修改：`frontend-react/src/i18n/zh.ts`、`en.ts` — 添加 20+ dashboard key
- 修改：`frontend-react/src/app/(shell)/page.tsx` — 所有硬编码字符串改用 t()

#### Settings i18n (P2-3)
- 修改：`frontend-react/src/i18n/zh.ts`、`en.ts` — 添加 settings key
- 修改：`frontend-react/src/app/(shell)/settings/page.tsx` — i18n 所有字符串

#### Dashboard selector 清理 (P2-4)
- 修改：`frontend-react/src/app/(shell)/page.tsx` — 移除重复的 `allRuns` selector

#### Error Boundary (P2-6)
- 修改：`frontend-react/src/app/(shell)/layout.tsx` — 顶层 ErrorBoundary 包裹

### ✅ P3: 后端健壮性

#### Table Name 注入防护 (P3-1)
- 新增：`backend/utils/validation.py` — `validate_table_name()` + `sanitize_error()`
- 修改：`backend/routes/tables.py` — 所有端点调用 validate_table_name

#### Thread-safe Singleton (P3-2)
- 修改：`backend/services/data_service.py` — `threading.Lock` 保护 lazy init

#### Export 内存优化 (P3-3)
- 修改：`backend/routes/tables.py` — `df.to_csv()` 替代 `iterrows()`

#### Route Prefix 统一 (P3-4)
- 修改：`backend/routes/tables.py` — 添加 `/tables/{name}/rename` 和 `/tables/{name}/export` 路由

#### Error Sanitization (P3-5)
- 修改：`backend/routes/ai.py`、`backend/routes/query.py`、`backend/routes/tables.py` — log 完整错误，返回 sanitized 消息

#### Config 健壮性 (P3-6)
- 修改：`backend/config.py` — VERSION 文件 fallback、temperature 验证、API key 警告

#### Unique Count 优化 (P3-7)
- 修改：`backend/services/data_service.py` — DuckDB COUNT(DISTINCT) 替代 pandas nunique

### ✅ P4: 开发体验

#### per-table quality report (P4-1)
- 修改：`frontend-react/src/stores/data-store.ts` — `qualityReports` Record 替代全局单例

#### saved-queries MAX_QUERIES (P4-4)
- 修改：`frontend-react/src/stores/saved-queries-store.ts` — MAX_QUERIES = 100

#### sql-history-store partialize (P4-5)
- 修改：`frontend-react/src/stores/sql-history-store.ts` — 只持久化 history 数组

### ESLint 修复
- `virtual-table/page.tsx` — `<a>` → `<Link>`
- `investigation-workspace.tsx` — `let` → `const`
- `global-search.tsx` — 转义 `"` 实体

## System Health

- Frontend build: PASS (Next.js 15.5.18, standalone output)
- Backend import: PASS
- TypeScript: PASS
- ESLint: PASS (0 errors, warnings only)

## Key Changes (v0.9.4)

### Security
- SQL 注入防护：只读执行器 + SQL 语句验证
- Table name 注入防护：正则验证
- Error 消息 sanitized：不泄露内部信息
- 全局异常处理器：正确处理 HTTPException/ValidationError

### Stability
- Query 取消真正生效（threading.Event）
- Anthropic Client 单例缓存
- ai_analyze_multi 不再阻塞事件循环
- Streaming 不再静默挂起
- Guardrail 支持步骤级超时检查

### Code Quality
- Token 预估 CJK 修正
- Token truncation O(n²) → O(n log n)
- Monaco Schema Cache TTL + 失效
- Keyboard Listener 去抖
- Dashboard/Settings i18n 补全
- Error Boundary 全局覆盖
