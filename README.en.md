# EnterpriseAiDataAgent

中文版: [README.md](README.md)

EnterpriseAiDataAgent is an AI data analysis workspace demo for CSV / Excel datasets. It combines DuckDB, table preview, natural language analysis, expert SQL workspace, history records, report details, and configurable LLM providers with Mock fallback — so you can explore the full analysis workflow without a real API key.

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![DuckDB](https://img.shields.io/badge/DuckDB-OLAP-FFC800?logo=duckdb)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Local%20Demo-2496ED?logo=docker)

---

## Core Value

- **Zero-config to run**: Mock LLM by default; Docker Compose starts locally out of the box.
- **Multi-provider switchable**: Mock / DeepSeek / Doubao / Mimo with automatic fallback when a real provider is unavailable.
- **Complete analysis pipeline**: Upload data → table preview → natural language analysis / expert SQL → history → report detail.

---

## Table of Contents

- [Why It Exists](#why-it-exists)
- [Goals](#goals)
- [Solution](#solution)
- [Current Validation](#current-validation)
- [Core Capabilities](#core-capabilities)
- [Quick Start](#quick-start)
- [Quick Demo](#quick-demo)
- [Tech Stack](#tech-stack)
- [LLM Providers](#llm-providers)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [FAQ](#faq)
- [Project Boundaries](#project-boundaries)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

---

## Why It Exists

Working with CSV / Excel data often hits a few practical walls:

- You want to analyze data but don't write SQL fluently.
- You want AI-assisted analysis, but setting up a real LLM key and paying per call feels like overhead for exploration.
- You want a local, quick way to validate an AI analysis workflow, but spreadsheet tools lack natural language analysis.
- You want to keep history and traceable reports — not just one-off chat replies.

---

## Goals

EnterpriseAiDataAgent aims to provide a locally-runnable AI data analysis workspace demo:

- Let users upload CSV / Excel and ask analysis questions in natural language.
- Use DuckDB to handle local structured data queries.
- Provide an expert SQL workspace for advanced users.
- Support multiple LLM providers while keeping Mock LLM as a fallback.
- Deliver the full core workflow even with no API key and no external model available.

---

## Solution

| User Pain Point | What the Project Does |
|---|---|
| Can't write SQL | Natural language analysis entry + expert SQL workspace for advanced users |
| LLM setup is costly | Supports Mock / DeepSeek / Doubao / Mimo — switchable providers |
| No API key to try it | Mock LLM by default, zero-config startup |
| Analysis results are hard to trace | History page and Analysis Detail report page |
| Local setup is complex | Docker Compose local demo |

---

## Current Validation

Latest M4.9.5 engineering completeness regression results:

- Docker Compose local demo verified: backend + frontend start together.
- Backend `/docs` and `/api/ai/status` return 200.
- Frontend localhost returns 200.
- Mock LLM works by default, no real API key required.
- Backend tests: 559 passed, 31 skipped.
- Frontend tests: 1171 passed.
- master CI passed.
- No `.env` committed, no real API keys found.

---

## Core Capabilities

### 1. Upload Data

Upload CSV / Excel files to create queryable DuckDB tables. Supports `.csv` and `.xlsx` formats with automatic column type inference.

### 2. Preview and Select Tables

View fields, row counts, and data preview. Distinguish between user-uploaded tables and system history tables. Supports rename, delete, and export.

### 3. Natural Language Analysis

Type a question, choose an LLM provider, and the system generates SQL, executes it, and returns analysis results. Supports SSE streaming output.

### 4. Expert SQL

SQL workspace for advanced users with Monaco Editor, keyword/table/column autocomplete, and multi-tab editing.

### 5. History

Retains past questions, SQL, export options, and re-run entries. Supports search and filter.

### 6. Report Detail

View analysis reports as Summary / Findings / Result / SQL Appendix.

### 7. Data Quality Report

View missing values, duplicates, outliers, and quality scores for any table.

---

## Quick Start

### Docker Compose (Recommended)

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

### Local Development

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full instructions.

---

## Quick Demo

```bash
# 1. Start Docker Compose
docker compose build && docker compose up

# 2. Open http://localhost:3000

# 3. Upload a CSV or Excel file
#    (sample data available in the testExcel/ directory)

# 4. Go to Data page, select a table, and preview it

# 5. Go to Analyze page, select Mock LLM

# 6. Type a question, e.g.: "Summarize the main fields and analysis directions of this dataset."

# 7. Review the results, and find past analyses in History

# 8. Stop
docker compose down --remove-orphans
```

---

## Tech Stack

- **Frontend**: Next.js 15 / React 19 / TypeScript / Tailwind CSS / Monaco Editor / Recharts
- **Backend**: FastAPI / Pydantic / Uvicorn
- **Data Analysis**: DuckDB / Pandas / openpyxl
- **LLM Runtime**: Mock / DeepSeek / Doubao / Mimo provider adapter
- **State Management**: React Query (server) / Zustand (client)
- **Testing**: pytest (backend) / Vitest (frontend)
- **Infrastructure**: Docker / Docker Compose / GitHub Actions

---

## LLM Providers

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

## Environment Variables

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

## Documentation

- [LLM Provider Configuration](docs/LLM_PROVIDER_CONFIG.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Docker Compose Local Demo](docs/DOCKER_DEMO.md)

---

## FAQ

### Can I run it without a real LLM API key?

Yes. Mock LLM is the default — no API key required.

### I configured DeepSeek / Doubao / Mimo but it still falls back to Mock. What's wrong?

Check that the backend environment variables are set correctly: API Key, Base URL, Model name, and provider allowlist. Check the backend logs for the fallback reason.

### Docker startup fails. What should I check?

Make sure Docker Desktop is running and ports 3000 / 8000 are not occupied. Then check `docker compose logs backend` and `docker compose logs frontend`.

### The frontend can't connect to the backend. What's wrong?

Check that `NEXT_PUBLIC_API_BASE_URL` points to the backend address. In Docker Compose mode this is pre-configured; in local dev mode, verify your `.env`.

### Is this a production-grade BI system?

No. This is an AI data analysis workspace demo. It does not include production-grade auth, multi-tenancy, enterprise database connections, or production data persistence.

---

## Project Boundaries

- Not a production-grade BI system.
- No enterprise-grade auth, multi-tenancy, or audit systems.
- No real LLM API keys built in.
- Targets CSV / Excel file analysis by default.
- Docker Compose is for local demo use.

---

## Contributing

Interested in contributing? Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting issues or PRs.

---

## Roadmap

| Stage | Focus | Status |
|---|---|---|
| M4 | UI/UX polish + LLM fallback | Done |
| M4.9 | Docker / README / deployment docs | Done |
| M5 | Agent workflow enhancement | Planned |
| Future | More file formats, stronger data profiling, richer report export | Planned |

---

## License

MIT License
