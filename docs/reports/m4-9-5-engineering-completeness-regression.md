# M4.9.5 Engineering Completeness Regression

## 1. Goal

Run final engineering completeness regression for M4.9, covering README, deployment docs, env docs, Docker Compose, test/build/lint, CI readiness, and security checks.

## 2. Scope

This regression covers:

- README.md
- README.en.md
- docs/ENVIRONMENT.md
- docs/DEPLOYMENT.md
- docs/DOCKER_DEMO.md
- docs/LLM_PROVIDER_CONFIG.md
- env examples (`.env.example`, `backend/.env.example`, `frontend-react/.env.example`, `.env.docker.example`)
- Docker Compose local demo
- frontend/backend validation
- security check

## 3. Documentation Check

### README.md

- Links to `docs/LLM_PROVIDER_CONFIG.md` ✓
- Links to `docs/ENVIRONMENT.md` ✓
- Links to `docs/DEPLOYMENT.md` ✓
- Links to `docs/DOCKER_DEMO.md` ✓
- Lists all 4 providers (mock / deepseek / doubao / mimo) ✓
- Mock default described ✓
- Fallback behavior described ✓
- Project boundaries clear ✓
- No Anthropic single-provider legacy description ✓

### README.en.md

- Links to same 4 docs ✓
- Content consistent with README.md ✓
- English and Chinese information aligned ✓

### docs/ENVIRONMENT.md

- Backend variables documented with correct names ✓
- Frontend variables documented ✓
- `NEXT_PUBLIC_API_BASE_URL` recommended, `NEXT_PUBLIC_API_URL` noted as legacy ✓
- Provider keys only in backend section ✓
- Fallback behavior documented ✓
- Security rules section present ✓

### docs/DEPLOYMENT.md

- Local dev instructions correct ✓
- Docker Compose quick start matches `docker-compose.yml` ✓
- Render backend deployment documented ✓
- Vercel frontend deployment documented ✓
- `NEXT_PUBLIC_API_BASE_URL` recommended for Vercel ✓
- Common Issues table present ✓
- Project boundaries stated ✓

### docs/DOCKER_DEMO.md

- Prerequisites listed ✓
- Start/stop commands match `docker-compose.yml` ✓
- URLs table present ✓
- Mock LLM default described ✓
- Real provider instructions reference `.env.docker.example` ✓
- Troubleshooting section present ✓

### docs/LLM_PROVIDER_CONFIG.md

- All 4 providers listed ✓
- Backend-only env variables documented ✓
- Frontend public variables documented ✓
- Frontend selection sends provider name only ✓
- Fallback metadata example present ✓
- Security boundary section present ✓

## 4. Env Consistency Check

| Variable | `.env.example` | `backend/.env.example` | `.env.docker.example` | `docker-compose.yml` | `Dockerfile` | `Dockerfile.frontend` | docs | Consistent? |
|----------|---------------|----------------------|---------------------|---------------------|-------------|---------------------|------|-------------|
| `LLM_MODE` | mock | mock | (commented) | mock | mock | — | ✓ | ✓ |
| `LLM_DEFAULT_PROVIDER` | mock | mock | (commented) | mock | mock | — | ✓ | ✓ |
| `LLM_ALLOWED_PROVIDERS` | mock,deepseek,doubao,mimo | mock,deepseek,doubao,mimo | — | — | — | — | ✓ | ✓ |
| `LLM_FALLBACK_PROVIDER` | mock | mock | (commented) | mock | mock | — | ✓ | ✓ |
| `LLM_FALLBACK_ON_ERROR` | true | true | — | true | true | — | ✓ | ✓ |
| `LLM_REQUEST_TIMEOUT_SECONDS` | 30 | 30 | — | — | — | — | ✓ | ✓ |
| `LLM_MAX_RETRIES` | 1 | 1 | — | — | — | — | ✓ | ✓ |
| `DEEPSEEK_API_KEY` | (empty) | (empty) | (commented) | — | — | — | ✓ | ✓ |
| `DEEPSEEK_BASE_URL` | url | url | (commented) | — | — | — | ✓ | ✓ |
| `DEEPSEEK_MODEL` | deepseek-chat | deepseek-chat | (commented) | — | — | — | ✓ | ✓ |
| `DOUBAO_API_KEY` | (empty) | (empty) | (commented) | — | — | — | ✓ | ✓ |
| `DOUBAO_BASE_URL` | url | url | (commented) | — | — | — | ✓ | ✓ |
| `DOUBAO_MODEL` | (empty) | (empty) | (commented) | — | — | — | ✓ | ✓ |
| `MIMO_API_KEY` | (empty) | (empty) | (commented) | — | — | — | ✓ | ✓ |
| `MIMO_BASE_URL` | (empty) | (empty) | (commented) | — | — | — | ✓ | ✓ |
| `MIMO_MODEL` | (empty) | (empty) | (commented) | — | — | — | ✓ | ✓ |
| `NEXT_PUBLIC_API_BASE_URL` | localhost:8000 | — | — | — | — | — | ✓ | ✓ |
| `NEXT_PUBLIC_API_URL` | localhost:8000 (legacy) | — | — | build arg | ARG/ENV | — | ✓ | ✓ |

### Notes

- `NEXT_PUBLIC_API_BASE_URL` is the recommended variable in docs.
- `NEXT_PUBLIC_API_URL` is kept for backward compatibility; used by `Dockerfile.frontend` and `docker-compose.yml` build arg.
- `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` remain in `.env.example` and `backend/.env.example` as legacy optional. Not referenced in README or provider docs.
- Provider API keys only appear in backend env files and docs. Frontend env contains no keys.

## 5. LLM Provider Check

| Check | Status | Notes |
|-------|--------|-------|
| mock default available | ✓ | `LLM_MODE=mock`, `LLM_DEFAULT_PROVIDER=mock` in all config |
| deepseek documented | ✓ | In README, ENVIRONMENT, LLM_PROVIDER_CONFIG, env examples |
| doubao documented | ✓ | In README, ENVIRONMENT, LLM_PROVIDER_CONFIG, env examples |
| mimo documented | ✓ | In README, ENVIRONMENT, LLM_PROVIDER_CONFIG, env examples |
| Real keys only in backend | ✓ | Frontend env has no provider keys |
| Fallback behavior documented | ✓ | ENVIRONMENT, LLM_PROVIDER_CONFIG, DEPLOYMENT all describe fallback |
| Frontend sends provider name only | ✓ | LLM_PROVIDER_CONFIG states frontend sends `llm_provider` name |
| Frontend fallback notice | ✓ | ENVIRONMENT and LLM_PROVIDER_CONFIG mention frontend displays fallback notice |

## 6. Docker Compose Regression

| Step | Result | Notes |
|------|--------|-------|
| `docker compose config` | ✓ | Valid config, backend + frontend services |
| `docker compose build` | ✓ | Both images built (cached layers) |
| `docker compose up -d` | ✓ | Both containers started |
| `docker compose ps` | ✓ | backend: healthy, frontend: running |
| backend `/docs` | 200 | FastAPI Swagger UI |
| backend `/api/ai/status` | 200 | `default_provider: "mock"`, `supported_providers: ["mock","deepseek","doubao","mimo"]` |
| backend `/api/health` | 200 | `{"status":"ok","db_connected":true}` |
| backend `/api/status` | 200 | `{"api":"ok","db":"ok","version":"1.0.4"}` |
| frontend localhost:3000 | 200 | Next.js page loads |
| Mock default working | ✓ | No real key configured, mock LLM active |
| Logs clean | ✓ | No secrets or sensitive data in logs |
| `docker compose down` | ✓ | Clean shutdown |

## 7. Non-Docker Validation

```
pytest:              559 passed, 31 skipped
backend import:      OK
ruff:                All checks passed!
frontend tsc:        passed (no errors)
frontend test:       1171 passed (48 files)
frontend build:      passed
frontend lint:       4 warnings (pre-existing, non-blocking)
```

### Lint Warnings (pre-existing)

1. `analyze/[runId]/page.tsx:95` — unnecessary `runs` dependency in useMemo
2. `history-stale-table-invalid-record.test.tsx:92` — unused variable `entry`
3. `drill-down-chain.tsx:24` — unnecessary `runs` dependency in useMemo
4. `sql-history-panel.tsx:101` — unnecessary `t` dependency in useCallback

These are pre-existing and non-blocking.

## 8. Security Check

| Check | Result |
|-------|--------|
| `.env` committed | No — not in git tracking |
| `.env.docker` committed | No — not in git tracking |
| Real API key in docs/config | No — all `sk-` search returned empty |
| Frontend contains provider key | No — `frontend-react/.env.example` has no keys |
| No `mystudy/` content committed | Confirmed — directory not tracked |
| No `.agents/` content committed | Confirmed — directory not tracked |
| `docs/archive/` contains `.agents` references | Yes — archived frontend_rules docs reference `.agents` config system (project documentation, not private study content) |
| `docs/reports/` contains 面试/简历 references | Yes — legacy project planning docs (NEXT_90_DAYS_PLAN, PROJECT_MATURITY_REPORT) contain portfolio/interview language. These are pre-existing project governance docs, not resume packaging content. |

### Security Notes

- The legacy `docs/reports/` files with 面试/简历 language are pre-existing project governance documents. They describe project positioning decisions, not resume packaging. Not blocking for this regression.
- The `docs/archive/frontend_rules/` `.agents` references describe a configuration system architecture. Not private study content.
- No real API keys found anywhere in tracked files.

## 9. What Was Not Changed

- 未修改前端源码
- 未修改后端业务逻辑
- 未修改 API 契约
- 未修改数据库
- 未修改 Dockerfile
- 未修改 docker-compose.yml
- 未提交 .env
- 未提交 .env.docker
- 未提交 secret
- 未开始 M5 Agent
- 未打新 tag

## 10. Issues Found

No blocking issues found.

### Non-blocking observations

| Issue | Severity | Fixed in this round? | Notes |
|-------|----------|---------------------|-------|
| `Dockerfile.frontend` uses `NEXT_PUBLIC_API_URL` (legacy var) | Info | No | Correctly documented as backward-compatible in ENVIRONMENT.md. Docker build arg matches compose config. |
| `ANTHROPIC_API_KEY` in env examples | Info | No | Marked as legacy optional. Not referenced in README or provider docs. |
| Legacy 面试/简历 language in `docs/reports/` | Info | No | Pre-existing project governance docs. Not resume packaging. |
| 4 pre-existing lint warnings | Info | No | Non-blocking, pre-existing since earlier versions. |

## 11. Release Decision

M4.9 engineering completeness is ready for final engineering tag.

## 12. Next Step

进入：

```text
M4.9.6 Final Engineering Completeness Tag
```

暂不开始 M5 Agent。
