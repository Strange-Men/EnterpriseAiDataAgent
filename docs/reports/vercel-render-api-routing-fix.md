# Vercel-Render API Routing Fix

## 1. Problem

Vercel 前端（https://enterprise-ai-data-agent.vercel.app/）上传 Excel 失败，报错：

```
API 404: The page could not be found
DNS_HOSTNAME_RESOLVED_PRIVATE ...
```

用户无法上传文件、查看表列表、执行 SQL 查询。所有后端 API 请求均失败。

## 2. Root Cause

**三个问题叠加：**

### 2.1 `next.config.ts` rewrites 硬编码 localhost

```ts
// next.config.ts (修复前)
async rewrites() {
  return [{
    source: "/api/:path*",
    destination: "http://localhost:8000/api/:path*",  // ← 硬编码
  }];
}
```

Vercel 的 rewrites 在服务端执行。`localhost:8000` 指向 Vercel serverless 函数自身，而非 Render 后端。Vercel 检测到 hostname 解析到私有 IP，返回 `DNS_HOSTNAME_RESOLVED_PRIVATE` 错误。

### 2.2 `http-client.ts` 使用相对路径依赖 rewrites

```ts
// http-client.ts (修复前)
const API_BASE = "/api";  // ← 相对路径，依赖 rewrites 代理
const res = await fetch(`${API_BASE}${path}`, ...);
```

`apiFetch` 使用相对路径 `/api/...`，浏览器发起请求到 `https://enterprise-ai-data-agent.vercel.app/api/...`，依赖 Next.js rewrites 代理到后端。但 rewrites 目标是 localhost，导致 404。

### 2.3 CORS 未配置 Vercel 域名

Render 后端 `CORS_ORIGINS` 环境变量默认值为 `http://localhost:3000,http://127.0.0.1:3000`，不包含 `https://enterprise-ai-data-agent.vercel.app`。即使修复了前端请求路径，跨域请求也会被浏览器拦截。

## 3. Fix

### 3.1 `frontend-react/src/services/api/http-client.ts`

- `apiFetch` 改用 `apiUrl()` 生成绝对 URL，不再依赖 rewrites
- `apiUrl()` 自动拼接 `DIRECT_BACKEND`（来自 `NEXT_PUBLIC_API_URL` 环境变量）
- 保持 `API_BASE = "/api"` 仅作向后兼容，不再用于实际请求

```ts
const DIRECT_BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullPath = normalizedPath.startsWith("/api/") ? normalizedPath : `/api${normalizedPath}`;
  return `${DIRECT_BACKEND}${fullPath}`;
}
```

### 3.2 `frontend-react/next.config.ts`

- rewrites destination 改为读取 `NEXT_PUBLIC_API_URL` 环境变量
- 本地开发默认 `http://localhost:8000`，Vercel 上通过环境变量指向 Render

```ts
const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
```

### 3.3 `frontend-react/src/services/api/query.ts`

- `exportQueryResult` 从使用 `API_BASE` 改为 `apiUrl()`

### 3.4 `frontend-react/src/components/VirtualDataTable.tsx`

- 直接 fetch 调用改为使用 `apiUrl()` 替代 `DIRECT_BACKEND` 字符串拼接

### 3.5 测试更新

- `api.test.ts` 期望 URL 更新为绝对路径格式（`http://localhost:8000/api/...`）

### 3.6 需要在 Render 手动操作

在 Render Dashboard 的环境变量中添加：

```
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://enterprise-ai-data-agent.vercel.app
```

### 3.7 需要在 Vercel 手动操作

在 Vercel 项目 Settings → Environment Variables 中确认：

```
NEXT_PUBLIC_API_URL=https://enterpriseaidataagent.onrender.com
```

## 4. Validation

| 检查项 | 结果 |
|--------|------|
| Render /api/health | ✅ `{"status":"ok","db_connected":true}` |
| Render /api/tables | ✅ 返回 1 个表（demo_sales） |
| Render /api/status | ✅ `{"api":"ok","db":"ok","version":"1.0.2"}` |
| TypeScript 类型检查 | ✅ `tsc --noEmit` 通过 |
| 单元测试 | ✅ 113/113 通过 |
| Next.js 生产构建 | ✅ build 成功 |
| 后端 import | ✅ `from backend.main import app` 通过 |
| CORS preflight | ⚠️ 当前 Render 未配置 Vercel 域名，需手动添加 |

## 5. Remaining Risk

1. **Render 免费实例休眠**：免费 plan 下 15 分钟无请求后实例休眠，首次访问需 30-60 秒冷启动
2. **DuckDB 数据非持久化**：Render 免费实例文件系统是临时的，部署/重启后上传数据丢失
3. **CORS 需手动配置**：Render 环境变量需在 Dashboard 手动添加 Vercel 域名
4. **Vercel 环境变量需确认**：需确认 `NEXT_PUBLIC_API_URL` 已在 Vercel 项目设置中配置

## 6. Files Changed

- `frontend-react/src/services/api/http-client.ts` — 核心修复：apiFetch 使用绝对 URL
- `frontend-react/next.config.ts` — rewrites 使用环境变量
- `frontend-react/src/services/api/query.ts` — exportQueryResult 使用 apiUrl
- `frontend-react/src/components/VirtualDataTable.tsx` — 直接 fetch 使用 apiUrl
- `frontend-react/src/services/api.ts` — 导出 apiUrl
- `frontend-react/src/services/__tests__/api.test.ts` — 测试期望更新
- `.env.example` — 添加 Vercel 部署说明
