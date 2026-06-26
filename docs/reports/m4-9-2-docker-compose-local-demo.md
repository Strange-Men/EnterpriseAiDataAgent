# M4.9.2 Docker Compose Local Demo

## 1. Goal

验证 EnterpriseAiDataAgent 本地 Docker Compose 一键启动能力，覆盖 backend + frontend + mock LLM 默认模式。

## 2. Scope

本轮只处理 Docker Compose 本地 demo，不处理 README 大改，不进入 M5 Agent。

## 3. Docker Runtime

- docker version: 29.5.3
- docker compose version: v5.1.4
- docker ps result: 可用，无运行中容器

## 4. Compose Audit

| 文件 | 当前状态 | 问题 | 本轮修改 |
|------|---------|------|---------|
| docker-compose.yml | 有问题 | `env_file: .env` 要求 .env 存在；frontend URL 指向容器内部 hostname | 是 |
| Dockerfile | OK | Mock 默认值已设置 | 否 |
| Dockerfile.frontend | 有问题 | 缺少 `NEXT_PUBLIC_API_URL` build arg；缺少 public 目录处理 | 是 |
| .dockerignore | OK | 覆盖全面 | 否 |
| .env.example | OK | 变量齐全 | 否 |
| backend/.env.example | OK | Mock 默认值 | 否 |
| frontend-react/.env.example | OK | 两个 API URL 变量都有 | 否 |

## 5. Changes

### docker-compose.yml

- 移除 `env_file: .env`（Docker 场景下 .env 不一定存在）
- 改为显式 `environment` 设置 mock LLM 变量
- 注释说明如何通过 `.env.docker` 加载真实 provider key
- frontend build args 添加 `NEXT_PUBLIC_API_URL: http://localhost:8000`
- 移除 frontend 的 `NEXT_PUBLIC_API_URL=http://backend:8000`（浏览器无法访问容器内部 hostname）

### Dockerfile.frontend

- 添加 `ARG NEXT_PUBLIC_API_URL=http://localhost:8000`
- 添加 `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL`
- 确保 Next.js 在构建时嵌入正确的 API URL

### frontend-react/public/

- 创建最小 `public/.gitkeep` 目录（Next.js standalone 构建需要）

### .env.docker.example（新增）

- 提供 Docker Compose 环境变量示例
- 只包含变量名和占位符，不含真实 key
- 所有 provider key 默认注释掉

## 6. Build Result

- docker compose build: 成功
- backend image: enterpriseaidataagent-backend（python:3.11-slim）
- frontend image: enterpriseaidataagent-frontend（node:20-alpine standalone）

## 7. Runtime Smoke

- docker compose up: 成功，两个容器启动
- backend container: healthy
- frontend container: running
- backend `/docs`: 200 OK
- backend `/api/ai/status`: `{"default_provider":"mock","supported_providers":["mock","deepseek","doubao","mimo"]}`
- backend `/api/status`: `{"api":"ok","db":"ok","version":"1.0.4"}`
- backend `/api/health`: `{"status":"ok","db_connected":true}`
- frontend localhost:3000: 200 OK
- 前端到后端通信: 浏览器通过 `http://localhost:8000` 直接调用后端（`apiUrl()` 构建绝对 URL）
- mock provider default: 确认，无需真实 key
- Docker logs: 无 secret 泄露
- compose down: 正常清理

## 8. Local Non-Docker Validation

- pytest: 559 passed, 31 skipped
- backend import: OK
- ruff: All checks passed
- tsc: OK（无错误）
- frontend test: 1171 passed（48 test files）
- frontend build: 成功
- lint: 4 个已知 warnings（非本轮引入）

## 9. Security Check

- no .env committed: 确认
- no real key found: 确认（`.env.docker.example` 中只有占位符）
- frontend has no API key: 确认
- compose does not hardcode secrets: 确认

## 10. What Was Not Changed

- 未大改 README
- 未改前端 UI / 源码
- 未改后端业务逻辑
- 未改 API 契约
- 未改数据库结构
- 未开始 M5 Agent
- 未打 tag

## 11. Remaining Risks

- README / README.en 尚未更新
- Render / Vercel 部署文档尚未补齐
- Docker Compose 仍只是本地 demo，不宣称生产级
- 真实 provider 仍依赖后端环境变量
- Next.js standalone 模式下 rewrite 代理不可用（前端使用绝对 URL 直连后端，非阻塞）

## 12. Next Step

进入 M4.9.3 README / README.en Rewrite。
