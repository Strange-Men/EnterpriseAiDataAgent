# EnterpriseAiDataAgent | AI Data Analysis Workspace

中文版: [README.md](README.md)

An AI data analysis workspace demo for CSV / Excel datasets. It supports data upload, table preview, SQL workspace, natural language analysis, anomaly detection, report generation, and configurable multi-provider LLM integration (Mock / DeepSeek / Doubao / Mimo). Mock mode is the default — the platform runs without a real API key.

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![DuckDB](https://img.shields.io/badge/DuckDB-OLAP-FFC800?logo=duckdb)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-UI-06B6D4?logo=tailwindcss)
![Mock](https://img.shields.io/badge/Mock-Default-orange)
![Docker](https://img.shields.io/badge/Docker-Local%20Demo-2496ED?logo=docker)

---

## 1. Highlights

- CSV / Excel upload and table management
- DuckDB local OLAP engine, zero configuration
- Natural language to SQL generation and execution
- Expert SQL workspace (Monaco Editor, autocomplete, multi-tab)
- Query history and report detail pages
- Mock / DeepSeek / Doubao / Mimo multi-provider LLM support
- Mock LLM as default fallback — runs without a real API key
- Automatic fallback to Mock when real provider is unavailable
- Docker Compose one-command local demo
- Frontend-backend separation: FastAPI + Next.js

---

## 2. Current Version

- M4 is finalized
- Tag: `v1.4.0-m4-uiux-llm-fallback`
- Current phase: M4.9 Engineering Completeness

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| SQL Editor | Monaco Editor, sql-formatter |
| State Management | React Query (server state), Zustand (client state) |
| Backend | FastAPI, Pydantic, Uvicorn |
| Database | DuckDB (embedded OLAP) |
| Data Processing | Pandas, NumPy, openpyxl |
| LLM Providers | Mock, DeepSeek, Doubao, Mimo (OpenAI-compatible) |
| Charts | Recharts |
| Testing | pytest (backend), Vitest (frontend) |
| Deployment | Docker Compose (local demo) |

---

## 4. Features

### Data Management

- CSV / Excel file upload (`.csv`, `.xlsx`)
- Automatic type inference, import to DuckDB
- Table preview, rename, delete, export
- Built-in demo_sales sample dataset

### SQL Workspace

- Monaco Editor with keyword / table / column autocomplete
- Multi-tab SQL editor
- Query execution, EXPLAIN plan, cancel running queries
- Query history with search and filter
- Save / favorite queries
- Export results to CSV / JSON / Excel

### AI Data Analysis

- Natural language to SQL (NL→SQL pipeline)
- Real-time query result explanation (SSE streaming)
- Structured insight generation with confidence and severity
- Chart type suggestions
- Smart analysis question recommendations based on dataset characteristics
- LLM provider selector (frontend switchable)

### Anomaly Detection and Reports

- Data quality report: missing values, duplicates, outliers, quality score
- Statistical anomaly detection: Z-score, IQR methods
- LLM explanation of anomaly business significance
- Multi-step analysis: AI generates plan → step-by-step execution → result summary
- Markdown analysis report generation

---

## 5. Quick Start with Docker Compose

Docker Compose runs a local demo with Mock LLM by default — no real API key required.

```bash
docker compose build
docker compose up
```

After startup:

- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status

Stop:

```bash
docker compose down --remove-orphans
```

To use a real LLM provider, copy `.env.docker.example` to `.env.docker`, fill in the API key, and uncomment the `env_file` line in `docker-compose.yml`.

---

## 6. Local Development

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

### Access URLs

- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status

---

## 7. Environment Variables

The project provides multiple env example files:

| File | Purpose |
|------|---------|
| `.env.example` | Full local development config reference |
| `backend/.env.example` | Backend LLM runtime config |
| `frontend-react/.env.example` | Frontend public variables (no secrets) |
| `.env.docker.example` | Docker Compose environment example |

Key points:

- API keys are configured only in backend environment variables
- Frontend never contains real keys
- Mock is the default safe mode — runs without any key
- Automatic fallback to Mock when real provider is unavailable

---

## 8. LLM Provider Configuration

Supported providers:

| Provider | Description |
|----------|-------------|
| `mock` | Default, local mock, no API key needed |
| `deepseek` | DeepSeek OpenAI-compatible API |
| `doubao` | Doubao / Volcano Ark OpenAI-compatible API |
| `mimo` | Mimo OpenAI-compatible API |

Switching providers:

- Frontend: provider selector in the Analyze panel header
- Backend: environment variable `LLM_DEFAULT_PROVIDER`

See [docs/LLM_PROVIDER_CONFIG.md](docs/LLM_PROVIDER_CONFIG.md) for detailed configuration.

---

## 9. Docker and Deployment Notes

The current Docker Compose setup is a **local demo** — not production-grade.

- `Dockerfile`: Backend (Python 3.11-slim + FastAPI + DuckDB)
- `Dockerfile.frontend`: Frontend (Node.js 20 Alpine + Next.js standalone)
- `docker-compose.yml`: Orchestrates backend + frontend with Mock LLM default

---

## 10. Documentation

- [LLM Provider Configuration](docs/LLM_PROVIDER_CONFIG.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Docker Compose Local Demo](docs/DOCKER_DEMO.md)

---

## 11. Project Boundaries

- **Not** a production-grade BI system
- **Does not connect** to real enterprise databases
- **Does not include** real API keys
- **Does not guarantee** real LLM uptime
- Mock mode runs by default; real providers require user-configured backend env
- Single-user local-first, no multi-tenancy
- Targets CSV / Excel structured tabular data

---

## 12. Validation Status

Most recent M4.9.2 validation results:

| Dimension | Result |
|-----------|--------|
| pytest | 559 passed, 31 skipped |
| backend import | OK |
| ruff | All checks passed |
| frontend tsc | passed |
| frontend test | 1171 passed (48 files) |
| frontend build | passed |
| frontend lint | 3 warnings (pre-existing) |
| Docker Compose build | passed |
| Docker Compose up | passed |
| no real key committed | confirmed |

---

## 13. Project Structure

```text
EnterpriseAiDataAgent/
├── backend/              # FastAPI backend, LLM providers, prompt contracts
├── frontend-react/       # Next.js 15 / React 19 / TypeScript frontend
├── database/             # DuckDB schema and seed scripts
├── docs/                 # Architecture, reports, governance docs
├── tests/                # Backend tests
├── Dockerfile            # Backend container
├── Dockerfile.frontend   # Frontend container
├── docker-compose.yml    # Local demo orchestration
├── .env.example          # Full env reference
├── .env.docker.example   # Docker env example
├── requirements.txt      # Python dependencies
└── README.md
```

---

## 14. Roadmap

- M4.9.3 README / README.en ✅
- M4.9.4 Deployment + Env Docs ✅
- M4.9.5 Engineering Regression
- M4.9.6 Engineering Tag

---

## License

MIT License
