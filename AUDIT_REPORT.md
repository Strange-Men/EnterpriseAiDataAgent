# 项目审查报告 — Enterprise AI Data Agent

> 审查日期：2026-06-03
> 当前版本：v1.0.1
> 审查范围：全栈代码、构建、测试、文档、安全

---

## 优先级说明

| 优先级 | 含义 | 处理方式 |
|--------|------|----------|
| P0 | 致命 — 不修不能上线 | 立即修复 |
| P1 | 严重 — 影响稳定性/安全 | 本版本必须修 |
| P2 | 中等 — 影响体验/维护 | 尽快修 |
| P3 | 低 — 代码质量/清理 | 有空就修 |

---

## P0 — 致命问题（不修就别想上线）

### P0-1: 零认证、零鉴权 [FIXED]

**位置**: 所有 API 端点
**问题**: 没有任何认证机制。任何人能执行 SQL、删除表、上传文件、触发 AI 分析、创建调度任务。
**修复方案**: 添加 API Key 中间件。在 `backend/main.py` 添加 middleware，检查 `Authorization: Bearer <api_key>` header。`.env` 中配置 `API_KEY`。公开端点（`/api/health`）白名单放行。

### P0-2: AI 管道使用读写执行器执行 LLM 生成的 SQL [FIXED]

**位置**: `backend/services/ai_pipeline.py:278`, `ai_pipeline.py:304`
**问题**: `get_executor()` 返回的是读写执行器。如果 `validate_generated_sql` 漏掉危险 SQL（DELETE/DROP/INSERT 等），AI 就能修改或删除数据。
**修复方案**: 将 `get_executor()` 改为 `get_readonly_executor()`。确保 LLM 生成的 SQL 只读执行。

### P0-3: 文件上传无大小限制 [FIXED]

**位置**: `backend/routes/upload.py:15`
**问题**: `await file.read()` 把整个文件读进内存。一个几 GB 的文件就能 OOM 崩溃服务器。
**修复方案**: 在路由层添加文件大小检查（如 50MB 限制），超限返回 413。或在 FastAPI 的 `UploadFile` 层限制。

### P0-4: CLAUDE.md 与代码严重脱节 [FIXED]

**位置**: `CLAUDE.md`, `AGENTS.md`, `README.md`
**问题**:
- 版本号写的 v1.0.0，实际是 v1.0.1
- 记录 14 个 AI 端点，实际有 25+ 个
- Zustand store 文档写 6 个名字，实际 10 个，且名字对不上（`sql-workspace-store.ts` → 实际是 `sql-editor-store.ts`，`query-tabs-store.ts` → 实际是 `investigation-store.ts`）
- 架构图写的"8 个 prompt 模块"实际 15 个
- 服务列表只写了 4 个，实际 15 个
**修复方案**: 全面更新 CLAUDE.md 的端点列表、store 列表、架构图、版本号。同步更新 AGENTS.md 和 README.md。

---

## P1 — 严重问题（影响稳定性和安全）

### P1-1: Query ID 碰撞 [FIXED]

**位置**: `backend/routes/query.py:50`, `backend/services/query_history.py:95`
**问题**: 使用 `int(time.time() * 1000)` 作为 ID。并发请求在同毫秒内会撞 ID，导致查询不可取消、历史条目丢失。
**修复方案**: 使用 `uuid.uuid4()` 或 `uuid.uuid4().hex[:12]` 替代时间戳。

### P1-2: 调度器文件并发写入损坏 [FIXED]

**位置**: `backend/services/scheduler.py:154`
**问题**: `save()` 直接写 JSON 文件，无文件锁。并发写入会损坏文件。
**修复方案**: 使用原子写入（写临时文件 → rename）。或使用 `filelock` 库。

### P1-3: 质量报告加载 10 万行进内存 [FIXED]

**位置**: `backend/services/data_service.py:228`
**问题**: `get_quality_report` 加载最多 100,000 行到内存，无大小检查。宽表可能占用数百 MB。
**修复方案**: 降低默认采样行数（如 10,000），或添加内存大小检查。

### P1-4: 无线程池限制，LLM 请求可耗尽线程 [FIXED]

**位置**: `backend/routes/ai.py` 中的 `run_in_executor` 模式
**问题**: 默认线程池 `min(32, cpu+4)`。每个 AI 请求占用一个线程 30+ 秒。12 个并发请求就能耗尽 8 核机器的线程池。
**修复方案**: 创建专用的有限线程池（如 `ThreadPoolExecutor(max_workers=4)`）给 AI 调用使用。

### P1-5: 无速率限制 [FIXED]

**位置**: 所有端点
**问题**: 无任何速率限制。单客户端可无限触发 LLM API 调用，产生不可控费用。
**修复方案**: 添加 `slowapi` 或自定义 middleware，限制每 IP 每分钟请求数。

### P1-6: `getDatasetMeta` 返回错误表的质量分 [FIXED]

**位置**: `frontend-react/src/stores/data-store.ts:83`
**问题**: `getDatasetMeta(table)` 返回的是 `qualityReport`（当前活跃表的质量分），不是传入参数 `table` 的质量分。应该用 `qualityReports` map。
**修复方案**: 改为 `get().qualityReports[table]?.overallScore ?? null`。

### P1-7: `performance/page.tsx` 双重包裹 ClientProviders [FIXED]

**位置**: `frontend-react/src/app/performance/page.tsx:338`
**问题**: 该页面已在 `(shell)` layout 中被 `ClientProviders` 包裹，又自己包了一层。导致 duplicate QueryClient，React Query 缓存不共享。
**修复方案**: 移除外层 `<ClientProviders>` 包裹。

### P1-8: SSE 流 timeout 后 onError/onDone 竞态 [FIXED]

**位置**: `frontend-react/src/services/api/streams.ts:37-39`
**问题**: timeout 触发 `controller.abort()` 后，可能同时触发 `onError` 和 `onDone`。
**修复方案**: 在 abort 后设置标志位，阻止后续回调触发。

### P1-9: SSE retry 定时器 unmount 时不清理 [FIXED]

**位置**: `frontend-react/src/services/api/streams.ts:107`
**问题**: `setTimeout(tryConnect, ...)` 创建的定时器不被任何 cleanup 机制追踪。组件卸载后仍会触发回调。
**修复方案**: 追踪 retry timer ID，在 cleanup 时 clearTimeout。

### P1-10: 未使用的 `xlsx` 包有 CVE 漏洞 [FIXED]

**位置**: `frontend-react/package.json:42`
**问题**: `xlsx: ^0.18.5` 有已知安全漏洞（CVE-2023-30533），且代码中从未 import。
**修复方案**: `npm uninstall xlsx`。

---

## P2 — 中等问题（影响体验和维护）

### P2-1: 15 个 useState 导致渲染风暴 [FIXED]

**位置**: `frontend-react/src/panels/ai-analysis-panel.tsx:52-73`
**问题**: 15 个独立 `useState`，状态重置时触发 15 次顺序重渲染。
**修复方案**: 合并为 `useReducer` 或单个 state 对象。

### P2-2: `keyFindings` 依赖导致不必要的重渲染 [FIXED]

**位置**: `frontend-react/src/components/investigation/investigation-workspace.tsx:204`
**问题**: `keyFindings` 从 store 订阅，数组引用每次 store 更新都变，导致 `handleStart` 回调每次重建。
**修复方案**: 用 `useRef` 或在回调内通过 `getState()` 读取。

### P2-3: `Date.now()` 做 ID 必碰撞 [FIXED]

**位置**: `frontend-react/src/panels/sql-workspace-panel.tsx:164`
**问题**: SQL 历史条目用 `Date.now()` 做 ID，同毫秒执行两条查询会撞。
**修复方案**: 改用 `crypto.randomUUID()` 或自增计数器。

### P2-4: schedule-store 存了数据但没有执行机制 [FIXED]

**位置**: `frontend-react/src/stores/schedule-store.ts`
**问题**: 持久化了调度任务和结果，但没有 timer、service worker 或轮询机制来实际执行调度。
**修复方案**: 补全调度执行逻辑，或标记为实验性功能并禁用 UI 入口。

### P2-5: CSV 解析器在引号字段上必坏 [FIXED]

**位置**: `frontend-react/src/components/VirtualDataTable.tsx:240-265`
**问题**: 用 `line.split(",")` 解析 CSV。含逗号的引号字段（如 `"New York, NY"`）会产生错位数据。
**修复方案**: 使用 Papa Parse 库或实现正确的 CSV 状态机解析器。

### P2-6: 50MB 查询结果存进 localStorage [FIXED]

**位置**: `frontend-react/src/stores/sql-editor-store.ts:198-206`
**问题**: `setQueryResult` 对超 50MB 结果只打 warning 但仍然存储，会冻结浏览器。
**修复方案**: 超过阈值时截断或拒绝存储，提示用户导出。

### P2-7: 后端测试 33 个因 DuckDB 文件锁失败 [FIXED]

**位置**: `tests/test_upload_quality_routes.py`, `tests/test_error_sanitization.py`
**问题**: 测试连接真实 DuckDB 文件而非 `:memory:`，当后端运行时全部报错。
**修复方案**: 测试 fixture 改用 `:memory:` 数据库。

### P2-8: 无移动端导航 [FIXED]

**位置**: `frontend-react/src/layout/app-shell.tsx:77`
**问题**: 侧边栏在小屏幕隐藏，但没有汉堡菜单或抽屉导航。移动端完全不可用。
**修复方案**: 添加响应式汉堡菜单 + 侧边栏抽屉。

### P2-9: 缺少 Next.js 错误/加载页面 [FIXED]

**位置**: `frontend-react/src/app/`
**问题**: 没有 `not-found.tsx`、`error.tsx`、`loading.tsx`。404 和错误显示 Next.js 默认丑页面。
**修复方案**: 创建这三个文件。

### P2-10: Pydantic schema 定义了但从不使用 [FIXED]

**位置**: `backend/models/schemas.py`, `backend/models/envelope.py`
**问题**: 定义了类型安全的 schema，但所有路由返回 raw dict，绕过了类型验证。
**修复方案**: 要么在路由中使用这些 schema，要么删除死代码。

### P2-11: `analysis-store.ts` O(n²) 序列化 [FIXED]

**位置**: `frontend-react/src/stores/analysis-store.ts:446-453`
**问题**: `partialize` 中 while 循环每次迭代都 `JSON.stringify` 整个 state。大 state 下阻塞主线程。
**修复方案**: 预先计算大小或使用增量大小追踪。

### P2-12: 无焦点管理和无障碍标签 [FIXED]

**位置**: 全局
**问题**: 弹窗无焦点捕获、无 `role="dialog"`、图标按钮无 `aria-label`、无跳过链接。
**修复方案**: 逐步添加 ARIA 属性和焦点管理。

---

## P3 — 低优先级（代码质量/清理）

### P3-1: 死代码清理 [FIXED]

| 文件 | 问题 |
|------|------|
| `frontend-react/src/layout/header.tsx` | 从未导入，功能在 `app-shell.tsx` 中重复 |
| `frontend-react/src/layout/workspace-layout.tsx` | 从未导入，已被页面路由替代 |
| `frontend-react/src/services/api/envelope.ts` | 类型和函数从未使用 |
| `backend/prompts/self_evaluation.py` 的 `_truncate` | 与 `shared_utils.truncate` 重复 |

### P3-2: 依赖问题 [FIXED]

| 问题 | 位置 |
|------|------|
| `autoprefixer`, `tailwindcss`, `postcss` 在 dependencies 应在 devDependencies | `package.json:24,39,40` |
| `@next/swc-win32-x64-msvc` 平台特定包不应在 dependencies | `package.json:18` |
| Python `requirements.txt` 无版本锁定（只有 `>=`） | `requirements.txt` |
| `chromadb` 在 `.env` 中配置但不在 `requirements.txt` | `requirements.txt` |

### P3-3: 文档问题 [FIXED]

| 问题 | 位置 |
|------|------|
| `AGENTS.md` 是 `CLAUDE.md` 近似副本，版本已漂移 | `AGENTS.md` |
| `KNOWN_ISSUES.md` 积压项与已关闭项自相矛盾 | `KNOWN_ISSUES.md` |
| `docs/README.md` 索引停在 v0.9.2 | `docs/README.md` |
| `CURRENT_SESSION.md` 的 Open Follow-ups 列了已完成的项 | `CURRENT_SESSION.md` |
| `docs/archive/frontend_rules/` 放的是 Agent 文档不是前端规则 | `docs/archive/frontend_rules/` |
| `FILE_SYSTEM_RULES.md` 被自身违反（AGENTS.md 在根目录、duckdb 路径） | `docs/governance/FILE_SYSTEM_RULES.md` |

### P3-4: 虚拟表格页硬编码暗色主题 [FIXED]

**位置**: `frontend-react/src/app/virtual-table/page.tsx:15-17`
**问题**: 使用 `bg-[#0E1117]` 硬编码暗色，亮色模式下显示异常。
**修复方案**: 使用主题变量 `bg-background` 等。

### P3-5: `performance/page.tsx` 硬编码英文 [FIXED]

**位置**: `frontend-react/src/app/performance/page.tsx:29`
**问题**: `statusLabel` 中 `warn: "Warning"` 硬编码英文，其他都用 `t()`。
**修复方案**: 改为 `t('status.warning')`。

### P3-6: CORS 默认 `*` + `credentials=True` 无效 [FIXED]

**位置**: `backend/main.py:154`
**问题**: 生产环境未设置 `CORS_ORIGINS` 时，`allow_origins=["*"]` + `allow_credentials=True` 违反 CORS 规范，浏览器会拒绝。
**修复方案**: 生产环境必须设置具体域名，或在未设置时禁用 credentials。

### P3-7: FPS/DOM 监控在生产环境运行 [FIXED]

**位置**: `frontend-react/src/components/VirtualDataTable.tsx:49-91`
**问题**: `useFpsMonitor` 和 `useDomCount` 是开发工具但在生产环境持续运行，浪费 CPU。
**修复方案**: 用 `process.env.NODE_ENV === 'development'` 守卫。

---

## 修复建议顺序

```
第一批（P0，1-2天）：
  P0-4 → 更新 CLAUDE.md / AGENTS.md / README.md（先修文档，让后续 AI 辅助准确）
  P0-2 → ai_pipeline.py 改用 readonly executor（一行代码）
  P0-3 → upload 路由加文件大小限制（几行代码）
  P0-1 → 添加 API Key 中间件

第二批（P1，2-3天）：
  P1-1 → UUID 替代时间戳 ID
  P1-6 → 修复 getDatasetMeta
  P1-7 → 移除 performance 页面双重 Provider
  P1-8 + P1-9 → 修复 SSE 流竞态和清理
  P1-2 → 调度器原子写入
  P1-10 → 卸载 xlsx

第三批（P2，3-5天）：
  按影响面逐个修复

第四批（P3，空闲时）：
  清理死代码、修文档、修依赖
```
