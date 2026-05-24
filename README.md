# Enterprise AI Data Agent

Enterprise-grade AI Data Analysis Platform — SQL Workspace + AI Analyst + DuckDB.

## Project Overview

EnterpriseAiDataAgent is an enterprise-grade AI data analysis platform with integrated capabilities:

### Enterprise Query Experience (v0.3.x)
- **SQL Auto Complete**: Monaco Editor with keywords, table names, column names, DuckDB functions
- **Query Tabs**: Multi-tab system (new, delete, rename, switch)
- **Saved Queries**: Save, favorite, manage SQL queries
- **Query Explain**: DuckDB EXPLAIN visualization
- **Query Cancel**: AbortController-based query cancellation
- **Export System**: CSV / JSON / Excel
- **SQL Formatting**: sql-formatter
- **Keyboard Shortcuts**: Ctrl+Enter/S/L//
- **Query Statistics**: Row count, duration, column count
- **Query History**: Search, filter, delete, re-run
- **Data Quality**: Missing values, outliers, duplicates, quality scoring
- **DuckDB Management**: Table list, delete, rename, export

### AI Data Analyst (v0.5.x)
- **AI SQL Generation**: Natural language → SQL → execute → explain
- **AI Explain**: Streaming SSE explanation of query results
- **AI Insights**: Structured insight generation with confidence/severity
- **AI Chart Suggest**: AI-driven chart type recommendation
- **AI Semantics**: Automatic column role detection (metric/dimension/KPI)
- **Smart Questions**: AI-suggested analytical questions per dataset
- **Multi-step Analysis**: Autonomous analysis with planning engine
- **Progressive Streaming**: Real-time SSE (plan → steps → summary)
- **Prompt Architecture**: 8 prompt modules with contracts and registry
- **Token Budget**: Per-operation token budgets with workflow tracking
- **Runtime Guardrails**: Step limits, timeouts, loop detection
- **Analysis Trace**: LLM call recording for debugging and audit
- **AI Evaluation**: Golden question harness with hallucination detection

### Workspace
- 3-panel resizable layout, dark/light theme, i18n (en/zh)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS v3 |
| SQL Editor | Monaco Editor (sql-formatter) |
| Backend API | FastAPI, Uvicorn |
| Database | DuckDB |
| Data Processing | Pandas, NumPy |
| State Management | Zustand (6 stores, persist) |
| Table Components | TanStack Table + Virtual |
| Export | csv, json, xlsx (openpyxl) |
| Layout | react-resizable-panels |
| i18n | react-i18next (en/zh) |
| AI | Anthropic SDK (Claude API, streaming, tool use) |
| Charts | Recharts (bar/line/pie/scatter) |

## Quick Start

### Backend (FastAPI)

```bash
# 1. Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start backend API
uvicorn backend.main:app --reload --port 8000
```

### Frontend (React)

```bash
# 1. Enter frontend directory
cd frontend-react

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`, proxies `/api/*` to backend `http://localhost:8000`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Enter | Execute SQL query |
| Ctrl+S | Save current query |
| Ctrl+L | Clear current query |
| Ctrl+/ | Toggle SQL comment |

## API Endpoints

### Data API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | System status |
| POST | `/api/upload` | Upload CSV/Excel |
| POST | `/api/query` | Execute SQL |
| POST | `/api/query/explain` | EXPLAIN query plan |
| POST | `/api/query/cancel` | Cancel running query |
| POST | `/api/query/export` | Export results (CSV/JSON/Excel) |
| GET | `/api/query/schema` | All table schemas (autocomplete) |
| GET | `/api/query/history` | Query history |
| GET | `/api/tables` | List all tables |
| GET | `/api/tables/{name}` | Table data preview |
| DELETE | `/api/tables/{name}` | Delete table |
| GET | `/api/quality/{name}` | Data quality report |

### AI API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ai/status` | AI service config & health |
| POST | `/api/ai/query` | NL → SQL → execute → explain |
| POST | `/api/ai/explain` | Explain existing results |
| POST | `/api/ai/explain/stream` | Streaming explain (SSE) |
| POST | `/api/ai/insights` | Generate structured insights |
| POST | `/api/ai/insights/stream` | Streaming insights (SSE) |
| POST | `/api/ai/chart-suggest` | Suggest chart types |
| POST | `/api/ai/semantics` | Semantic dataset analysis |
| POST | `/api/ai/suggest-questions` | Smart question suggestions |
| POST | `/api/ai/plan` | Generate analysis plan |
| POST | `/api/ai/analyze-multi` | Multi-step autonomous analysis |
| POST | `/api/ai/analyze-multi/stream` | Streaming multi-step analysis (SSE) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (3000)                       │
│  Monaco Editor | Query Tabs | AI Analysis | Charts (Recharts)│
│                       │ /api/* proxy                        │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│              FastAPI Backend (8000)                          │
│                                                              │
│  Data API:  /query /tables /upload /quality                 │
│  AI API:    /ai/query /ai/explain /ai/insights /ai/plan     │
│             /ai/analyze-multi /ai/semantics /ai/status      │
│                                                              │
│  AI System: prompts/ (8 modules) | runtime/ (token budget)  │
│             services/ (ai_analyst, ai_pipeline, guardrails,  │
│                        trace)                                │
│                                                              │
│  Data:      QueryExecutor | QueryHistory | DataQuality       │
│                        │                                    │
│             DuckDB (data/enterprise.duckdb)                 │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
EnterpriseAiDataAgent/
├── backend/
│   ├── main.py                  # FastAPI entry
│   ├── routes/                  # API routes (query, tables, upload, quality, ai, analyze)
│   ├── services/                # Business logic (ai_analyst, ai_pipeline, guardrails, trace)
│   ├── prompts/                 # Prompt architecture (8 modules + registry + locale)
│   ├── runtime/                 # Token budget system
│   └── models/                  # Pydantic models
├── frontend-react/
│   ├── src/panels/              # Workspace panels (SQL, AI Analysis, History, etc.)
│   ├── src/components/          # UI components (Monaco, DataTable, AI Charts)
│   ├── src/stores/              # Zustand stores (6 + ai-session-store)
│   ├── src/services/            # API layer (incl. SSE streaming)
│   └── src/i18n/                # i18n (en/zh)
├── database/                    # DuckDB core (db_manager, query_executor, data_quality)
├── tests/                       # Backend tests + AI evaluation harness
├── skills/                      # Reusable skill documentation (active/stable/archived)
├── docs/                        # Architecture, governance, reports, testing
└── testExcel/                   # Test datasets
```

## Version Roadmap

| Version | Content | Status |
|---------|---------|--------|
| v0.3.x | Enterprise Data Platform (SQL Workspace, DuckDB, Quality) | Done |
| v0.5.x | AI Data Analyst MVP (Streaming, Semantics, Planning, Guardrails) | Done |
| v0.6.x | Anomaly Detection, Multi-turn UX, E2E Tests | Next |

## License

TBD
