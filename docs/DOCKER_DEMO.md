# Docker Compose Local Demo

## 1. Goal

Docker Compose provides a one-command local demo that runs both backend and frontend with Mock LLM by default. No real API key is required.

---

## 2. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Docker Compose (included with Docker Desktop)
- Ports `3000` and `8000` available

---

## 3. Start

```bash
# Build images
docker compose build

# Start containers (foreground)
docker compose up
```

Or run in background:

```bash
docker compose up -d
```

---

## 4. URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API Docs | http://localhost:8000/docs |
| AI Status | http://localhost:8000/api/ai/status |
| System Status | http://localhost:8000/api/status |
| Health Check | http://localhost:8000/api/health |

---

## 5. Default LLM Mode

- **Mock LLM by default** — no real API key required.
- The backend container starts with `LLM_MODE=mock`, `LLM_DEFAULT_PROVIDER=mock`.
- AI features (NL→SQL, insights, anomaly detection) work immediately with mock responses.
- Real provider keys are optional backend environment variables.

---

## 6. Stop

```bash
# Stop and clean up containers
docker compose down --remove-orphans
```

---

## 7. Rebuild

If you change source code or dependencies:

```bash
# Rebuild without cache
docker compose build --no-cache

# Restart
docker compose up
```

---

## 8. Logs

```bash
# View backend logs
docker compose logs backend --tail=100

# View frontend logs
docker compose logs frontend --tail=100

# Follow logs in real time
docker compose logs -f
```

---

## 9. Real Provider (Optional)

To test with a real LLM provider in Docker:

```bash
# Copy the example env file
cp .env.docker.example .env.docker

# Edit .env.docker — fill in your API key
# Uncomment env_file line in docker-compose.yml

# Rebuild and start
docker compose build
docker compose up
```

See [ENVIRONMENT.md](ENVIRONMENT.md) for variable details.

---

## 10. Troubleshooting

### Port already in use

```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Fix:** Stop the process using port 3000 or 8000, or change the port mapping in `docker-compose.yml`.

### Docker Desktop not running

```
error during connect: Post http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine
```

**Fix:** Start Docker Desktop and wait for it to initialize.

### Frontend cannot reach backend

The frontend in Docker uses `NEXT_PUBLIC_API_URL=http://localhost:8000` for browser-side requests. The browser accesses the backend directly via the host-mapped port.

**Fix:** Ensure the backend container is healthy: `docker compose ps` should show `healthy` status.

### Backend health check failed

```
container is unhealthy
```

**Fix:** Check backend logs: `docker compose logs backend`. Common causes:

- Python dependency installation failed during build.
- Port conflict on 8000.
- Missing system dependency.

### API provider falls back to mock

This is expected behavior when no real API key is configured. The AI features still work with mock responses.

**Fix:** To use a real provider, configure the API key in `.env.docker` and uncomment `env_file` in `docker-compose.yml`.

### Stale image cache

If the build uses outdated cached layers:

```bash
docker compose build --no-cache
docker compose up
```

### Data lost after restart

Docker Compose mounts `./data` as a volume for DuckDB persistence. If data is lost:

1. Check that the `./data` directory exists on the host.
2. Check volume mount in `docker-compose.yml`: `volumes: - ./data:/app/data`.
