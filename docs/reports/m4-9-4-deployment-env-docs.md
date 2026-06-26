# M4.9.4 Deployment + Env Docs

## 1. Goal

Add deployment, environment, and Docker demo documentation for M4.9 engineering completeness.

## 2. Changes

- Added `docs/ENVIRONMENT.md` — complete environment variable reference
- Added `docs/DEPLOYMENT.md` — deployment guide (local, Docker, Render, Vercel)
- Added `docs/DOCKER_DEMO.md` — Docker Compose local demo guide
- Updated `README.md` — added documentation section (section 10), renumbered sections, updated roadmap
- Updated `README.en.md` — added documentation section (section 10), renumbered sections, updated roadmap

## 3. Environment Docs

`docs/ENVIRONMENT.md` covers:

- Backend env variables: LLM runtime, DeepSeek/Doubao/Mimo provider config, app settings
- Frontend env variables: `NEXT_PUBLIC_API_BASE_URL`, provider selector flags
- Docker env variables: `.env.docker.example` usage
- Provider selection table: mock/deepseek/doubao/mimo with key requirements
- Fallback behavior: automatic mock fallback on missing key, timeout, 401/403/429
- Security rules: no commit .env, no keys in frontend, no hardcoded tokens

## 4. Deployment Docs

`docs/DEPLOYMENT.md` covers:

- Three deployment modes: local dev, Docker Compose, hosted (Render + Vercel)
- Local development: backend + frontend startup commands
- Docker Compose: quick start, URLs, default Mock LLM
- Render backend: Web Service, Docker or Python runtime, env vars, health/smoke, cold start notes
- Vercel frontend: root directory, build command, env vars, smoke test checklist
- Real LLM provider setup: keys in backend only, frontend selector, fallback
- Common issues table: 8 issues with cause and fix

## 5. Docker Demo Docs

`docs/DOCKER_DEMO.md` covers:

- Prerequisites: Docker Desktop, ports 3000/8000
- Start/stop/rebuild commands
- URL table: frontend, backend docs, AI status, system status, health
- Default Mock LLM behavior
- Optional real provider setup
- Logs viewing
- Troubleshooting: port conflict, Docker not running, frontend-backend connectivity, health check failure, provider fallback, stale cache, data persistence

## 6. What Was Not Changed

- 未修改前端源码
- 未修改后端业务逻辑
- 未修改数据库
- 未修改 Dockerfile
- 未修改 Dockerfile.frontend
- 未修改 docker-compose.yml
- 未提交 .env
- 未提交 .env.docker
- 未提交 secret
- 未开始 M5 Agent
- 未打新 tag

## 7. Validation

- markdown link / content check: docs cross-reference correctly ✅
- safety search: no real keys, no prohibited content ✅
- pytest: 559 passed, 31 skipped ✅
- backend import: OK ✅
- ruff: All checks passed ✅
- frontend tsc: passed (no errors) ✅
- frontend test: 1171 passed (48 files) ✅
- frontend build: passed ✅
- frontend lint: 3 warnings (pre-existing) ✅
- docker compose config: valid ✅
- CI: backend + frontend passed ✅

## 8. Next Step

M4.9.5 Engineering Completeness Regression.
