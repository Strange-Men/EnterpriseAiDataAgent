# M4.9.1 Docker Backend Container

## 1. Goal

验证并最小修复 EnterpriseAiDataAgent 后端 Docker 容器构建与运行能力。

## 2. Scope

本轮只处理后端 Docker，不处理前端 Docker、不处理 docker-compose、不大改 README。

## 3. Docker File Audit

| 文件 | 是否存在 | 当前用途 | 问题 | 本轮是否修改 |
|------|----------|----------|------|--------------|
| Dockerfile | ✅ | 后端 Dockerfile | 缺少 LLM 默认环境变量 | ✅ 最小补充 |
| backend/Dockerfile | ❌ | N/A | N/A | N/A |
| .dockerignore | ✅ | 排除构建上下文 | 缺少部分排除项 | ✅ 补充 |
| backend/.dockerignore | ❌ | N/A | N/A | N/A |
| requirements.txt | ✅ | Python 依赖 | 位于 root 级别 | ❌ 不修改 |
| .env.example | ✅ | 环境变量示例 | 已有完整配置 | ❌ 不修改 |
| backend/.env.example | ✅ | 后端环境变量示例 | 已有完整配置 | ❌ 不修改 |

## 4. Changes

### 4.1 Dockerfile 更新

添加 LLM 默认环境变量，确保容器默认使用 mock 模式：

```dockerfile
# LLM defaults — safe mock mode; override at runtime with real provider keys
ENV LLM_MODE=mock
ENV LLM_DEFAULT_PROVIDER=mock
ENV LLM_FALLBACK_PROVIDER=mock
ENV LLM_FALLBACK_ON_ERROR=true
```

### 4.2 .dockerignore 更新

补充缺失的排除项：
- `.github/` — GitHub Actions 配置
- `frontend-react/dist/` — 前端构建产物
- `frontend-react/.npm-cache/` — npm 缓存
- `dist/` — 通用构建产物
- `.ruff_cache/` — Ruff 缓存
- `.mypy_cache/` — MyPy 缓存
- `.coverage` — 测试覆盖率
- `*.key` / `*.pem` — 安全密钥
- `mystudy/` — 非生产目录
- `.agents/` — Agent 配置

## 5. Backend Docker Build

**Build Command:**
```bash
docker build -t enterprise-ai-data-agent-backend:m4-9-1 .
```

**Dockerfile Location:** root `Dockerfile`

**Image Name:** `enterprise-ai-data-agent-backend:m4-9-1`

**Result:** ⚠️ Docker runtime not available locally

## 6. Backend Docker Runtime Smoke

**Run Command:**
```bash
docker run --name eai-backend-smoke -p 8000:8000 \
  -e LLM_MODE=mock \
  -e LLM_DEFAULT_PROVIDER=mock \
  -e LLM_FALLBACK_PROVIDER=mock \
  -e LLM_FALLBACK_ON_ERROR=true \
  enterprise-ai-data-agent-backend:m4-9-1
```

**Expected Endpoints:**
- `http://localhost:8000/docs` — FastAPI Swagger UI
- `http://localhost:8000/api/status` — System status
- `http://localhost:8000/api/ai/status` — AI provider status

**Mock Default:** 应无需真实 key 即可运行

**Result:** ⚠️ Docker runtime not available locally

## 7. Local Validation

### 7.1 Backend Validation

| 测试 | 结果 |
|------|------|
| `python -c "from backend.main import app"` | ✅ OK |
| `ruff check backend` | ✅ OK |
| pytest | ⚠️ 部分测试需要数据库 |

### 7.2 Frontend Validation (防回归)

| 测试 | 结果 |
|------|------|
| `npx tsc --noEmit` | ✅ OK |
| `npm run test` | ✅ OK |
| `npm run build` | ✅ OK |
| `npm run lint` | ✅ OK |

## 8. Security Check

- ✅ 未提交 `.env`
- ✅ 未发现真实 API key
- ✅ Dockerfile 包含 `ENV LLM_MODE=mock` 安全默认值
- ✅ `.env.example` 仅包含变量名，无真实密钥
- ✅ `.dockerignore` 排除 `.env` 和密钥文件

## 9. What Was Not Changed

- 未处理前端 Docker
- 未处理 docker-compose
- 未大改 README
- 未改业务逻辑
- 未改 API
- 未改数据库
- 未开始 M5 Agent
- 未打 tag

## 10. Remaining Risks

- Docker runtime 未在本地验证，需要 CI 或远程环境验证
- docker-compose 尚未验证
- 前端 standalone / API base URL 尚未验证
- 后端数据目录 / DuckDB 持久化将在 M4.9.2 继续验证
- README / deployment docs 尚未更新

## 11. Next Step

进入 M4.9.2 Docker Compose Local Demo。
