# Environment Variables

## 1. Overview

This project uses three categories of environment variables:

1. **Backend secrets and runtime config** — LLM provider keys, database path, rate limiting, CORS.
2. **Frontend public config** — API base URL, provider selector UI flags. No secrets.
3. **Docker demo config** — Pre-configured for Mock LLM; real keys are optional.

Key rules:

- Real LLM API keys **only** go in backend environment variables.
- Frontend only exposes `NEXT_PUBLIC_*` public config.
- Mock provider works by default with no keys.
- Real providers fall back to Mock when unavailable.
- **Never commit `.env` files.**

---

## 2. Files

| File | Purpose | Commit? |
|------|---------|---------|
| `.env.example` | Root full config reference | Yes |
| `backend/.env.example` | Backend LLM runtime config | Yes |
| `frontend-react/.env.example` | Frontend public env (no secrets) | Yes |
| `.env.docker.example` | Docker Compose env example | Yes |
| `.env` | Local secret config | **No** |
| `.env.docker` | Local Docker secret config | **No** |

---

## 3. Backend Variables

These variables are configured in the backend environment (local `.env`, Render env, or Docker `environment` / `env_file`).

### LLM Runtime

| Variable | Required | Default | Secret | Description |
|----------|----------|---------|--------|-------------|
| `LLM_MODE` | No | `mock` | No | Runtime mode: `mock` or `live` |
| `LLM_DEFAULT_PROVIDER` | No | `mock` | No | Default provider when request omits one |
| `LLM_ALLOWED_PROVIDERS` | No | `mock,deepseek,doubao,mimo` | No | Comma-separated provider allowlist |
| `LLM_FALLBACK_PROVIDER` | No | `mock` | No | Fallback provider (keep `mock` for safe demo) |
| `LLM_FALLBACK_ON_ERROR` | No | `true` | No | Fall back to mock on real provider failure |
| `LLM_REQUEST_TIMEOUT_SECONDS` | No | `30` | No | Real provider request timeout |
| `LLM_MAX_RETRIES` | No | `1` | No | Retries before fallback |

### DeepSeek Provider

| Variable | Required | Default | Secret | Description |
|----------|----------|---------|--------|-------------|
| `DEEPSEEK_API_KEY` | For DeepSeek | (empty) | **Yes** | DeepSeek API key |
| `DEEPSEEK_BASE_URL` | No | `https://api.deepseek.com/v1` | No | DeepSeek API base URL |
| `DEEPSEEK_MODEL` | No | `deepseek-chat` | No | DeepSeek model name |

### Doubao / Volcano Ark Provider

| Variable | Required | Default | Secret | Description |
|----------|----------|---------|--------|-------------|
| `DOUBAO_API_KEY` | For Doubao | (empty) | **Yes** | Doubao / Volcano Ark API key |
| `DOUBAO_BASE_URL` | No | `https://ark.cn-beijing.volces.com/api/v3` | No | Doubao API base URL |
| `DOUBAO_MODEL` | No | (empty) | No | Doubao model endpoint ID |

### Mimo Provider

| Variable | Required | Default | Secret | Description |
|----------|----------|---------|--------|-------------|
| `MIMO_API_KEY` | For Mimo | (empty) | **Yes** | Mimo API key |
| `MIMO_BASE_URL` | No | (empty) | No | Mimo API base URL |
| `MIMO_MODEL` | No | (empty) | No | Mimo model name |

### App Settings

| Variable | Required | Default | Secret | Description |
|----------|----------|---------|--------|-------------|
| `DUCKDB_PATH` | No | `data/enterprise.duckdb` | No | DuckDB database file path |
| `API_KEY` | No | (empty) | **Yes** | Optional bearer token for deployed environments |
| `MAX_UPLOAD_BYTES` | No | `52428800` (50MB) | No | Max upload file size |
| `RATE_LIMIT_ENABLED` | No | `true` | No | Enable rate limiting |
| `RATE_LIMIT_REQUESTS` | No | `600` | No | Requests per window |
| `RATE_LIMIT_WINDOW_SECONDS` | No | `60` | No | Rate limit window duration |
| `BACKEND_CORS_ORIGINS` | No | `http://localhost:3000,http://localhost:5173` | No | CORS allowed origins |
| `APP_DEBUG` | No | `true` | No | Debug mode |
| `LOG_LEVEL` | No | `INFO` | No | Logging level |

---

## 4. Frontend Variables

Frontend variables must start with `NEXT_PUBLIC_` to be available in the browser. They are embedded at build time by Next.js.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:8000` | Backend API base URL for all requests |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Legacy backend URL (backward compatibility) |
| `NEXT_PUBLIC_LLM_PROVIDER_SELECTOR_ENABLED` | No | `true` | Show provider selector UI |
| `NEXT_PUBLIC_DEFAULT_LLM_PROVIDER` | No | `mock` | Frontend default provider name |
| `NEXT_PUBLIC_ALLOWED_LLM_PROVIDERS` | No | `mock,deepseek,doubao,mimo` | Providers shown in selector |

**Important:**

- Frontend **cannot** configure real provider API keys.
- Frontend only knows the backend API address and public UI flags.
- `NEXT_PUBLIC_API_BASE_URL` is the recommended variable. `NEXT_PUBLIC_API_URL` is kept for backward compatibility.
- For Vercel deployment, set `NEXT_PUBLIC_API_BASE_URL` to the Render backend URL.

---

## 5. Docker Variables

The `.env.docker.example` file provides a template for Docker Compose environment variables.

Usage:

```bash
# Copy the example file
cp .env.docker.example .env.docker

# Edit .env.docker with your values (optional — only needed for real providers)

# Uncomment env_file in docker-compose.yml
# Then run:
docker compose up
```

Key points:

- Docker Compose defaults to Mock LLM mode — no real keys needed.
- Real provider keys are optional and only injected into the backend service.
- Never commit `.env.docker`.

---

## 6. Provider Selection

| Provider | Requires API Key | Recommended Use |
|----------|-----------------|-----------------|
| `mock` | No | Local demo, CI, fallback |
| `deepseek` | Yes | Real LLM testing |
| `doubao` | Yes | Real LLM testing |
| `mimo` | Yes | Real LLM testing |

Switching providers:

- **Frontend**: Provider selector in the Analyze panel header sends `llm_provider` name to backend.
- **Backend**: Set `LLM_DEFAULT_PROVIDER` env var for server-side default.
- The frontend **never** sends API keys — only the provider name.

---

## 7. Fallback Behavior

When a real provider is selected but unavailable:

1. **Missing key/base URL/model** — Backend falls back to Mock LLM automatically.
2. **Request timeout** — After `LLM_REQUEST_TIMEOUT_SECONDS`, falls back to Mock.
3. **HTTP 401/403/429 errors** — Auth failure, forbidden, or rate limit triggers fallback.
4. **Provider outage** — Connection errors trigger fallback.

The response metadata indicates fallback was triggered:

```json
{
  "llm": {
    "mode": "mock",
    "provider_requested": "deepseek",
    "provider_used": "mock",
    "fallback_triggered": true,
    "fallback_reason": "provider_unavailable"
  }
}
```

The frontend displays a fallback notice when this occurs. The demo remains functional.

---

## 8. Security Rules

- **Never commit `.env`** — it contains secrets.
- **Never put provider keys in frontend env** — `NEXT_PUBLIC_*` variables are exposed in the browser.
- **Never hardcode `Authorization: Bearer` tokens** in source code.
- **Use deployment platform env settings** (Render env vars, Vercel env vars) for production-like demos.
- `.env.example` files contain only placeholder values — no real keys.
- The optional `API_KEY` variable enables bearer token auth when set; local dev remains open when empty.
