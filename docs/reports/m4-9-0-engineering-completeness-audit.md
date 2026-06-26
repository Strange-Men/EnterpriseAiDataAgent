# M4.9.0 Engineering Completeness Audit + Plan

## 1. Goal

M4 已封板，本阶段开始工程完整性收口，重点审计 Docker、README、env docs、部署说明和一键启动体验。

**不实现任何代码改动，不修改 README，不新增 Docker，不开始 M5。**

## 2. M4 Close Confirmation

| 检查项 | 状态 |
|--------|------|
| tag | `v1.4.0-m4-uiux-llm-fallback` → commit `44dce39` |
| master status | clean, ahead of origin 0 commits |
| CI | GitHub Actions `ci.yml` (backend pytest + frontend tsc/vitest/build) |
| current scope | Frontend UI/UX polish + LLM provider config + Mock fallback |
| backend version | `1.0.4` (backend/VERSION) |
| frontend version | `1.0.4` (package.json) |

**结论：M4 已封板，可进入 M4.9。**

## 3. Current Project Structure Audit

| 区域 | 当前文件 | 当前状态 | 问题 | M4.9 需要处理 |
|------|---------|---------|------|--------------|
| Root README | `README.md` (290行) | 存在，中文，质量较好 | 未提到新 LLM provider 系统；未提到 Mock fallback 默认可用；未提到 Docker Compose 使用方式 | 是 (M4.9.3) |
| English README | `README.en.md` | **不存在** | 完全缺失 | 是 (M4.9.3) |
| Backend env | `.env.example` + `backend/.env.example` | 存在，结构清晰 | mock 默认；前后端分离；但变量名 `NEXT_PUBLIC_API_URL` 和 `NEXT_PUBLIC_API_BASE_URL` 并存可能混淆 | 小调整 (M4.9.4) |
| Frontend env | `frontend-react/.env.example` | 存在 | 明确禁止 API keys；`NEXT_PUBLIC_` 前缀正确 | 无需改动 |
| Docker | `Dockerfile` (根目录) | 存在，构建 backend | 未验证能否实际构建；不在 `backend/` 目录 | 需验证 (M4.9.1) |
| Docker Compose | `docker-compose.yml` (根目录) | 存在，backend + frontend | 引用根目录 Dockerfile；frontend 用 `Dockerfile.frontend`；env_file 指向 `.env` | 需验证 (M4.9.2) |
| Docker 前端 | `Dockerfile.frontend` (根目录) | 存在，Node 20 standalone | 未验证构建 | 需验证 (M4.9.2) |
| `.dockerignore` | `.dockerignore` | 存在，覆盖 node_modules/.env/data 等 | 基本完整 | 无需改动 |
| Backend startup | `scripts/start-dev.sh` | 存在 | bash only，无 Windows 说明；无 `docker compose up` 说明 | 是 (M4.9.4) |
| Frontend startup | `npm run dev` | 标准 Next.js | 无问题 | 否 |
| Deployment docs | **不存在** | 缺失 | 无 Render/Vercel 部署说明；无 Docker 部署说明 | 是 (M4.9.4) |
| LLM provider docs | `docs/LLM_PROVIDER_CONFIG.md` | 存在，完整 | 未在 README 中引用；README 仍只提 Anthropic | 是 (M4.9.3/4) |
| Demo data | `data/enterprise.duckdb` (150MB) | 存在 | README 未说明 mock 模式下无需 API key 即可体验 AI 功能 | 是 (M4.9.3) |
| CI | `.github/workflows/ci.yml` | 存在，backend + frontend | 无 Docker build 验证 | 可选 (M4.9.5) |
| Scripts | `scripts/start-dev.sh`, `scripts/run-all-tests.sh` | 存在 | 仅 bash；无 Docker 启动脚本 | 可选 (M4.9.4) |

## 4. README Audit

### README.md (中文)

| # | 问题 | 严重程度 | 建议处理阶段 |
|---|------|---------|------------|
| 1 | 技术栈表写 "Anthropic Claude API"，实际已支持 DeepSeek/Doubao/Mimo + Mock fallback | 高 | M4.9.3 |
| 2 | 环境变量部分只提到 `ANTHROPIC_API_KEY`，未说明新 LLM provider 配置系统 | 高 | M4.9.3 |
| 3 | 未提到 Mock 模式默认可用，无 API key 时 AI 功能也可体验 | 高 | M4.9.3 |
| 4 | 未提到 LLM provider selector UI（前端可选 provider） | 中 | M4.9.3 |
| 5 | 未提到 Docker Compose 使用方式 | 中 | M4.9.3 |
| 6 | "Docker 构建此前报告通过，但本次审计未重新验证" — 需要实际验证 | 中 | M4.9.1/2 |
| 7 | 缺少部署说明（Render/Vercel） | 中 | M4.9.4 |
| 8 | 缺少 `docs/LLM_PROVIDER_CONFIG.md` 的引用 | 低 | M4.9.3 |
| 9 | 无英文 README | 中 | M4.9.3 |
| 10 | Demo 演示路径 A 说"有 API Key 的完整演示"，但 mock 模式下无需 key | 中 | M4.9.3 |

### README.en.md

**完全不存在。** 需要在 M4.9.3 创建。

## 5. Env Configuration Audit

### Root `.env.example`

| 变量 | 是否 secret | 前端可见 | 当前状态 | 问题 | 建议 |
|------|-----------|---------|---------|------|------|
| `LLM_MODE` | 否 | 否 | `mock` 默认 | ✅ 正确 | 无 |
| `LLM_DEFAULT_PROVIDER` | 否 | 否 | `mock` 默认 | ✅ 正确 | 无 |
| `LLM_ALLOWED_PROVIDERS` | 否 | 否 | `mock,deepseek,doubao,mimo` | ✅ 正确 | 无 |
| `LLM_FALLBACK_PROVIDER` | 否 | 否 | `mock` | ✅ 正确 | 无 |
| `LLM_FALLBACK_ON_ERROR` | 否 | 否 | `true` | ✅ 正确 | 无 |
| `DEEPSEEK_API_KEY` | **是** | 否 | 空 | ✅ 正确 | 无 |
| `DOUBAO_API_KEY` | **是** | 否 | 空 | ✅ 正确 | 无 |
| `MIMO_API_KEY` | **是** | 否 | 空 | ✅ 正确 | 无 |
| `ANTHROPIC_API_KEY` | **是** | 否 | 空 | ✅ 正确 | 无 |
| `DUCKDB_PATH` | 否 | 否 | `data/enterprise.duckdb` | ✅ 正确 | 无 |
| `NEXT_PUBLIC_API_URL` | 否 | **是** | `http://localhost:8000` | ⚠️ 和 `NEXT_PUBLIC_API_BASE_URL` 并存 | M4.9.4 统一 |
| `NEXT_PUBLIC_API_BASE_URL` | 否 | **是** | `http://localhost:8000` | ⚠️ 和 `NEXT_PUBLIC_API_URL` 并存 | M4.9.4 统一 |
| `NEXT_PUBLIC_LLM_PROVIDER_SELECTOR_ENABLED` | 否 | **是** | `true` | ✅ 正确 | 无 |
| `NEXT_PUBLIC_DEFAULT_LLM_PROVIDER` | 否 | **是** | `mock` | ✅ 正确 | 无 |
| `NEXT_PUBLIC_ALLOWED_LLM_PROVIDERS` | 否 | **是** | `mock,deepseek,doubao,mimo` | ✅ 正确 | 无 |
| `SEED_DEMO_DATA` | 否 | 否 | 注释状态 | ⚠️ Docker 场景需明确 | M4.9.4 |

### `backend/.env.example`

与 root `.env.example` 基本一致，backend-only 变量。无新问题。

### `frontend-react/.env.example`

明确禁止添加 API keys，`NEXT_PUBLIC_` 前缀正确。无问题。

### `docs/LLM_PROVIDER_CONFIG.md`

完整、准确，覆盖了所有 provider、fallback 行为、安全边界。**但 README.md 中未引用此文档。**

### 安全检查

| 检查项 | 状态 |
|--------|------|
| `.env` 是否被 gitignore | ✅ 是 |
| `.env` 是否被 git track | ✅ 否 |
| `.env.example` 是否有真实 key | ✅ 无 |
| `backend/.env.example` 是否有真实 key | ✅ 无 |
| `frontend-react/.env.example` 是否有真实 key | ✅ 无 |
| 前端代码是否读取 secret key | ✅ 否，只有 `NEXT_PUBLIC_` 变量 |

## 6. Docker Readiness Audit

### 当前 Docker 文件

| 文件 | 位置 | 状态 | 问题 |
|------|------|------|------|
| `Dockerfile` | 根目录 | 存在 | 构建 backend；未验证实际构建；引用根目录 `requirements.txt` |
| `Dockerfile.frontend` | 根目录 | 存在 | 构建 frontend standalone；未验证实际构建 |
| `docker-compose.yml` | 根目录 | 存在 | backend + frontend 双服务；env_file: `.env`；未验证 |
| `.dockerignore` | 根目录 | 存在 | 覆盖完整 |

### Docker 规划需要考虑的问题

| # | 问题 | 风险 | 建议下一步 |
|---|------|------|-----------|
| 1 | Dockerfile 在根目录而非 `backend/`，目录结构不够标准 | 低 | M4.9.1 考虑移至 `backend/Dockerfile` 或保持根目录 |
| 2 | `docker-compose.yml` 的 frontend `NEXT_PUBLIC_API_URL=http://backend:8000` 指向 Docker 内部网络 | 中 | M4.9.2 需验证前端 standalone 模式下 API 代理是否正确 |
| 3 | `SEED_DEMO_DATA` 在 Docker 场景中未明确 | 中 | M4.9.2 需在 docker-compose 中设置默认值 |
| 4 | DuckDB 数据文件 `data/enterprise.duckdb` 需要 volume 持久化 | 中 | M4.9.2 已有 volume 配置，需验证 |
| 5 | 无 `.env.docker` 或 Docker 专用 env 示例 | 低 | M4.9.2 可选添加 |
| 6 | 后端 healthcheck 使用 `curl`，需确认镜像中已安装 | 低 | Dockerfile 已安装 curl |
| 7 | 前端 standalone 模式不包含 node_modules，需确认所有依赖已打包 | 中 | M4.9.2 需实际构建验证 |

### Docker 构建验证清单（M4.9.1/2 执行）

```
[ ] docker build -f Dockerfile -t eaia-backend .
[ ] docker build -f Dockerfile.frontend -t eaia-frontend .
[ ] docker compose up -d
[ ] docker compose ps (both healthy)
[ ] curl http://localhost:8000/api/status
[ ] curl http://localhost:3000
[ ] docker compose down
```

## 7. Deployment Docs Audit

| 平台 | 当前文档 | 状态 | M4.9 需要 |
|------|---------|------|----------|
| 本地开发 | README.md 第 7 节 | 存在，但缺少 mock 模式说明 | M4.9.3 更新 |
| Docker 本地 | README.md 提到但未详细说明 | 不完整 | M4.9.2/4 |
| Vercel (前端) | 无专门文档 | 缺失 | M4.9.4 |
| Render (后端) | 无专门文档 | 缺失 | M4.9.4 |
| 环境变量配置 | `.env.example` 有注释 | 基本可用 | M4.9.4 完善 |
| LLM Provider 配置 | `docs/LLM_PROVIDER_CONFIG.md` | 完整但未被 README 引用 | M4.9.3 引用 |

## 8. Risks

| # | 风险 | 严重程度 | 缓解措施 |
|---|------|---------|---------|
| 1 | Docker 构建可能因 Python/Node 版本或依赖问题失败 | 中 | M4.9.1 实际构建验证 |
| 2 | 前端 Docker standalone 模式下 API 代理可能不工作 | 中 | M4.9.2 验证 rewrites 配置 |
| 3 | DuckDB 数据文件在容器重启后可能丢失 | 中 | docker-compose.yml 已配置 volume，需验证 |
| 4 | 真实 LLM key 只能在后端环境变量配置，不能通过前端传递 | 低 | 已正确实现，文档需说明 |
| 5 | README 可能夸大为生产级系统 | 低 | 当前 README 已声明是作品集项目 |
| 6 | `.env` 中有真实 API key（本地），需确保不被提交 | 低 | 已 gitignore，未被 track |
| 7 | `NEXT_PUBLIC_API_URL` 和 `NEXT_PUBLIC_API_BASE_URL` 两个变量并存 | 低 | M4.9.4 统一或说明关系 |
| 8 | M4.9 范围膨胀为新功能阶段 | 中 | 严格遵守分阶段计划，每阶段只做小步 |

## 9. M4.9 Split Plan

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 |
|------|------|---------|---------|---------|
| **M4.9.0** Engineering Completeness Audit + Plan | 审计 + 计划 | `docs/reports/m4-9-0-*.md` only | 不改代码/README/Docker/env | 审计报告已生成，计划已确认 |
| **M4.9.1** Docker Backend Container | 验证后端 Docker 构建 | `Dockerfile`, `backend/Dockerfile` (如需移动) | 不改前端，不改 README | `docker build` 成功，`docker run` 后 healthcheck 通过 |
| **M4.9.2** Docker Compose Local Demo | 验证 Docker Compose 完整流程 | `docker-compose.yml`, `.env.example` (如需调整) | 不改前端代码，不改 README | `docker compose up` 后前后端均可访问，mock 模式可用 |
| **M4.9.3** README / README.en Rewrite | 更新 README 反映 M4 现状 | `README.md`, `README.en.md` (新建) | 不改代码，不改 Docker | README 准确描述当前能力；英文版存在；引用 LLM_PROVIDER_CONFIG.md |
| **M4.9.4** Deployment + Env Docs | 补充部署和 env 文档 | `docs/deployment.md`, `.env.example` (如需调整) | 不改代码 | 有本地启动、Docker、Vercel、Render 四种部署方式说明 |
| **M4.9.5** Engineering Completeness Regression | 回归验证 | 无代码改动 | 不改代码 | 所有文档描述的流程实际可执行；Docker build 通过；README 无夸大 |
| **M4.9.6** Final Engineering Tag | 打 tag 封板 | tag only | 不改代码 | tag `v1.4.1-m4-engineering-completeness` 存在并 push |

### 阶段依赖关系

```
M4.9.0 (审计) → M4.9.1 (后端 Docker) → M4.9.2 (Compose) → M4.9.3 (README) → M4.9.4 (部署文档) → M4.9.5 (回归) → M4.9.6 (tag)
```

每个阶段完成后提交并 push 分支，确认无问题后再进入下一阶段。

## 10. Recommended Next Step

**进入 M4.9.1 Docker Backend Container**，先只做后端容器化验证：

1. 验证现有 `Dockerfile` 能否成功构建
2. 验证 `docker run` 后 healthcheck 通过
3. 验证 mock 模式下 AI 功能可用
4. 如有问题，修复 Dockerfile
5. 不改 README，不改前端，不改业务代码

## 11. Appendix: Key File Inventory

### 已存在且无需改动

- `.gitignore` — 覆盖 `.env`, `data/`, `node_modules/` 等
- `requirements.txt` — Python 依赖（根目录）
- `requirements.lock` — 锁定版本
- `frontend-react/package.json` — Node 依赖 + 脚本
- `frontend-react/package-lock.json` — 锁定版本
- `.github/workflows/ci.yml` — CI 流水线
- `docs/LLM_PROVIDER_CONFIG.md` — LLM provider 完整文档
- `backend/config.py` — 集中配置管理
- `backend/VERSION` — 版本号 `1.0.4`
- `scripts/start-dev.sh` — 开发启动脚本
- `scripts/run-all-tests.sh` — 全量测试脚本

### 已存在但需要验证/调整

- `Dockerfile` — 后端容器（需 M4.9.1 验证）
- `Dockerfile.frontend` — 前端容器（需 M4.9.2 验证）
- `docker-compose.yml` — 编排配置（需 M4.9.2 验证）
- `.dockerignore` — 排除规则（基本完整）
- `README.md` — 需 M4.9.3 更新

### 需要新建

- `README.en.md` — 英文 README（M4.9.3）
- `docs/deployment.md` — 部署文档（M4.9.4）

---

**Report generated**: 2026-06-26
**Branch**: `m4-9-0-engineering-completeness-audit`
**Author**: Claude Code (audit only, no code changes)
