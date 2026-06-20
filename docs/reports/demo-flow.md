# Demo Flow — EnterpriseAiDataAgent

> Generated: 2026-06-20
> Purpose: Step-by-step demo script for portfolio presentation and interview

---

## 1. Prerequisites

### Required:
- Python 3.11+ with pip
- Node.js 20+ with npm
- Git

### Optional (for AI features):
- Anthropic API key (or compatible proxy key)

### Not required for basic demo:
- Docker (optional, for containerized deployment)
- Database server (DuckDB is embedded)

---

## 2. Local Startup Steps

### Step 1: Clone and configure

```bash
cd D:\Claude_workfile\EnterpriseAiDataAgent

# Verify .env exists and has correct settings
# Key variables:
#   ANTHROPIC_API_KEY=your-key-here  (optional for non-AI demo)
#   DUCKDB_PATH=data/enterprise.duckdb
#   SEED_DEMO_DATA=true
```

### Step 2: Start backend

```bash
# Activate virtual environment
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# Install dependencies (if needed)
pip install -r requirements.txt

# Start backend (port 8000)
uvicorn backend.main:app --reload --port 8000
```

Expected output:
```
INFO:     Application starting — warming up DB connection
INFO:     DB connection warm-up OK
INFO:     Scheduler worker started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

If `SEED_DEMO_DATA=true`, you'll also see:
```
Seeding 'demo_sales' from testExcel/large_sales_data.csv...
Seeded 'demo_sales': 50000 rows, X columns
```

### Step 3: Start frontend

```bash
cd frontend-react
npm install    # if needed
npm run dev
```

Expected: Frontend runs at `http://localhost:3000`

### Step 4: Verify

```bash
# Backend health
curl http://localhost:8000/api/health
# Expected: {"status":"ok","db_connected":true}

# Frontend
# Open http://localhost:3000 in browser
```

---

## 3. Demo Data Preparation

### Built-in demo data:
- `testExcel/large_sales_data.csv` — 50,000 rows of sales data
- Auto-seeded on first startup if `SEED_DEMO_DATA=true`
- Creates `demo_sales` table in DuckDB

### Manual data upload (for demo):
- `testExcel/customer_data.xlsx` — Customer dataset
- `testExcel/finance_data.xlsx` — Finance dataset
- `testExcel/inventory_data.xlsx` — Inventory dataset
- `testExcel/sales_data.xlsx` — Sales dataset (smaller)

### How to prepare demo data:
1. Ensure `SEED_DEMO_DATA=true` in `.env`
2. Start backend — it auto-seeds on first run
3. Or manually upload via the UI: Data page → Upload CSV/Excel

---

## 4. Demo Paths

### Path A: Full Demo (with API key) — 15 minutes

#### Step 1: SQL Workspace (3 min)
1. Open `http://localhost:3000`
2. Navigate to **Query** page (SQL Workspace)
3. Show Monaco Editor with autocomplete
4. Type: `SELECT * FROM demo_sales LIMIT 10`
5. Press **Ctrl+Enter** to execute
6. Show results table with row count, duration, column count
7. Show **Explain** button → DuckDB query plan
8. Show **Export** dropdown → CSV/JSON/Excel
9. Show **Query History** panel — previous queries listed
10. Show **Save Query** (Ctrl+S) — save as favorite

**What to highlight**: Full SQL workspace experience, not a toy editor.

#### Step 2: AI NL→SQL (3 min)
1. In SQL Workspace, find the **AI input** (natural language input)
2. Type: "What are the top 10 products by total sales?"
3. Show AI generating SQL → executing → explaining results
4. Show **quality gates** on generated SQL
5. Show streaming explanation appearing in real-time

**What to highlight**: Real LLM integration, not hardcoded responses. Safety: read-only execution, SQL validation.

#### Step 3: AI Analysis (4 min)
1. Navigate to **Analyze** page
2. Select `demo_sales` table
3. Ask: "Analyze sales trends and find anomalies"
4. Show **multi-step analysis**:
   - Planning phase: AI generates 3-5 step plan
   - Step execution: each step runs SQL, shows results
   - Summary: AI synthesizes findings
5. Show **trace timeline** — each LLM call with latency and tokens
6. Show **token budget** — how much was consumed

**What to highlight**: Multi-step autonomous analysis with guardrails, not just a single query.

#### Step 4: Anomaly Detection (2 min)
1. Run a query that returns numerical data
2. Click **Anomaly Detection** on results
3. Show statistical anomalies (Z-score/IQR detection)
4. Show LLM interpretation of anomalies
5. Show recommended actions

**What to highlight**: Real statistical methods + LLM interpretation hybrid.

#### Step 5: Data Quality & Export (2 min)
1. Navigate to **Data** page
2. Show table list with row/column counts
3. Click on `demo_sales` → show quality report
4. Show missing values, outliers, duplicates, quality score
5. Export results as CSV

**What to highlight**: Data quality analysis, not just data display.

#### Step 6: Report Generation (1 min)
1. After analysis, click **Generate Report**
2. Show Markdown report with all findings
3. Show template save/load capability

**What to highlight**: Analysis results are persistent and shareable.

---

### Path B: No API Key Demo — 10 minutes

If you don't have an Anthropic API key, focus on non-AI features:

#### Step 1: SQL Workspace (4 min)
- Monaco Editor with autocomplete
- Multi-tab editing
- Query execution, EXPLAIN, cancel
- Query history with search/filter
- Save/favorite queries
- Export (CSV/JSON/Excel)
- Keyboard shortcuts (Ctrl+Enter, Ctrl+S, Ctrl+L, Ctrl+/)

#### Step 2: Data Management (3 min)
- Upload CSV/Excel files
- Table list with metadata
- Table rename, delete, export
- Data preview with pagination

#### Step 3: Data Quality (3 min)
- Quality report: missing values, outliers, duplicates
- Quality scoring
- Schema detection

**Note**: AI features will show "AI not configured" status. The SQL workspace and data management work fully without an API key.

---

## 5. Key Talking Points During Demo

### Architecture:
- "This is a Next.js 15 frontend with FastAPI backend and DuckDB embedded database"
- "The frontend uses React Query for server state and Zustand for local workspace state"
- "The backend has a clean route/service/prompt separation"

### AI Safety:
- "AI-generated SQL is validated for read-only operations before execution"
- "The guardrail system prevents runaway analysis — max steps, timeouts, failure limits"
- "Token budgets control LLM costs per operation and per workflow"

### Prompt Architecture:
- "Every AI operation follows the same pattern: CONTRACT + SYSTEM_PROMPT + build_user_message()"
- "This makes it easy to test, adjust, and add new operations"
- "Language handling is centralized — all prompts support zh/en"

### Testing:
- "420 backend tests and 113 frontend tests"
- "Tests cover routes, services, middleware, guardrails, trace, and token budget"
- "Frontend tests cover all Zustand stores"

---

## 6. Demo Scenarios & Expected Results

### Scenario 1: Simple query
**Input**: `SELECT COUNT(*) FROM demo_sales`
**Expected**: Single row with count (~50000)

### Scenario 2: Aggregation
**Input**: "What is the total sales by region?"
**Expected**: AI generates `SELECT region, SUM(sales) FROM demo_sales GROUP BY region`, executes, explains results

### Scenario 3: Anomaly detection
**Input**: Query returning numerical data → click Anomaly Detection
**Expected**: Statistical anomalies identified with Z-score/IQR, LLM interprets business meaning

### Scenario 4: Multi-step analysis
**Input**: "Why are Q4 sales lower than Q3?"
**Expected**: AI plans 3-5 steps (compare quarters, check by region, check by product), executes each, generates summary

---

## 7. Troubleshooting

### Backend won't start:
- Check Python version: `python --version` (need 3.11+)
- Check dependencies: `pip install -r requirements.txt`
- Check port: `netstat -ano | findstr :8000`

### Frontend won't start:
- Check Node version: `node --version` (need 20+)
- Check dependencies: `npm install`
- Check port: `netstat -ano | findstr :3000`

### No demo data:
- Run manually: `python scripts/seed-demo-data.py`
- Or set `SEED_DEMO_DATA=true` in `.env` and restart backend

### AI features not working:
- Check API key in `.env`: `ANTHROPIC_API_KEY=your-key`
- Check backend logs for API errors
- Verify key is valid: `curl http://localhost:8000/api/ai/status`

### Build fails:
- Frontend: `cd frontend-react && npx.cmd next build`
- Backend: `python -c "from backend.main import app; print('OK')"`

---

*End of demo flow guide.*
