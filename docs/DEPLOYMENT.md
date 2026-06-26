# Deployment Guide

## 1. Deployment Modes

This project supports three deployment modes:

1. **Local development** — Run backend and frontend separately on localhost.
2. **Docker Compose local demo** — One-command local demo with Mock LLM.
3. **Hosted demo** — Render backend + Vercel frontend for portfolio/demo purposes.

**Important:** This is a demo / portfolio-grade deployment. It is **not** production-grade:

- No real enterprise database connection.
- No built-in API keys.
- No production auth or multi-tenancy.

---

## 2. Local Development

### Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 20+ | Frontend build |
| npm | 10+ | Frontend dependencies |

### Backend

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Start backend (default port 8000)
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend-react
npm install
npm run dev
```

### Default Behavior

- Mock LLM is active by default — no API key needed.
- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status

---

## 3. Docker Compose Local Demo

See [DOCKER_DEMO.md](DOCKER_DEMO.md) for full instructions.

Quick start:

```bash
docker compose build
docker compose up
```

- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status
- Default Mock LLM — no real key required.
- Verified in M4.9.2.

---

## 4. Render Backend Deployment

### Service Type

**Web Service** on [Render](https://render.com).

### Build and Start

**Recommended: Docker**

Render can build directly from the project's `Dockerfile`:

- **Dockerfile Path**: `Dockerfile` (root)
- **Docker Context**: `.` (root)

The Dockerfile uses `python:3.11-slim`, installs `requirements.txt`, and runs:

```
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**Alternative: Python Runtime**

If not using Docker, configure on Render:

- **Runtime**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

### Environment Variables

Set these in Render's Environment tab:

| Variable | Value |
|----------|-------|
| `LLM_MODE` | `mock` (or `live` for real providers) |
| `LLM_DEFAULT_PROVIDER` | `mock` |
| `LLM_FALLBACK_PROVIDER` | `mock` |
| `LLM_FALLBACK_ON_ERROR` | `true` |

Optional — for real provider testing:

| Variable | Value |
|----------|-------|
| `DEEPSEEK_API_KEY` | Your DeepSeek key |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com/v1` |
| `DEEPSEEK_MODEL` | `deepseek-chat` |

### Health / Smoke

After deployment, verify:

- `https://<your-service>.onrender.com/docs` — FastAPI Swagger UI
- `https://<your-service>.onrender.com/api/ai/status` — AI service status, should show `"default_provider": "mock"`
- `https://<your-service>.onrender.com/api/status` — System status

### Notes

- **Cold start**: Free tier instances may take 30-60 seconds to start on first request.
- **Disk**: File uploads and DuckDB data are stored on the container filesystem. Free tier instances may lose data on restart. For persistent demo data, consider Render persistent disks (paid).
- **CORS**: Add your Vercel frontend URL to `BACKEND_CORS_ORIGINS` or `CORS_ORIGINS` env var.
- This is demo-grade — not production data persistence.

---

## 5. Vercel Frontend Deployment

### Project Root

```
frontend-react
```

Set this as the **Root Directory** in Vercel project settings.

### Build Command

```bash
npm run build
```

This runs `next build` (defined in `frontend-react/package.json`).

### Output / Framework

- **Framework Preset**: Next.js
- **Output**: `.next` (Next.js standalone, auto-detected by Vercel)

### Environment Variables

Set in Vercel project settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://<your-render-service>.onrender.com` |

If your project also uses `NEXT_PUBLIC_API_URL`, set it to the same value for backward compatibility.

### Smoke

After deployment:

1. Open Vercel URL — should load the home page.
2. Navigate to **Data** page — should show empty state or demo data.
3. Navigate to **Analyze** page — should load with Mock LLM.
4. Check provider selector — should show Mock / DeepSeek / Doubao / Mimo.
5. Run an AI analysis — should work with Mock provider.
6. If real provider is configured, verify fallback to Mock when key is missing.

---

## 6. Real LLM Provider Setup

To use real LLM providers (DeepSeek / Doubao / Mimo):

1. **Get an API key** from the provider.
2. **Set the key in backend env only** — Render env vars or local `.env`.
3. **Never put the key in frontend env** — Vercel `NEXT_PUBLIC_*` variables are public.
4. **Switch provider** via the frontend Analyze panel selector or set `LLM_DEFAULT_PROVIDER` in backend env.
5. **Backend calls the provider** — the frontend sends only the provider name.
6. **Fallback to Mock** if the provider is unavailable (missing key, timeout, auth error, rate limit).

---

## 7. Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Frontend cannot call backend | Wrong `NEXT_PUBLIC_API_BASE_URL` or CORS | Check env var matches backend URL; add frontend origin to `BACKEND_CORS_ORIGINS` |
| Real provider falls back to mock | Missing API key, timeout, or quota exceeded | Check backend env for correct key and model |
| Docker frontend cannot reach backend | Frontend uses wrong API URL | Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000` for browser access |
| Upload data lost after restart | Container filesystem is ephemeral | Mount a volume for `data/` directory; see `docker-compose.yml` |
| Render cold start | Free tier spins down after inactivity | Wait 30-60 seconds; first request triggers wake-up |
| CORS error | Backend origin not configured | Add frontend URL to `BACKEND_CORS_ORIGINS` env var |
| Vercel build fails | Missing root directory config | Set root directory to `frontend-react` in Vercel settings |
| `NEXT_PUBLIC_API_URL` not working | Variable name mismatch | Use `NEXT_PUBLIC_API_BASE_URL` (recommended) |

---

## 8. Boundaries

- **Demo deployment only** — not production-grade.
- **No production auth** — optional `API_KEY` bearer token for basic protection.
- **No production database** — DuckDB local file, no enterprise DB.
- **No multi-tenancy** — single-user local-first.
- **No committed secrets** — all `.env` files are gitignored.
- **No guaranteed uptime** — real LLM providers may be unavailable; Mock fallback ensures demo remains functional.
