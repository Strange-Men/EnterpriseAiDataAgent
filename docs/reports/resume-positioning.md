# Resume Positioning — EnterpriseAiDataAgent

> Generated: 2026-06-20
> Purpose: Honest resume positioning and interview preparation

---

## 1. Recommended Project Name

**AI Data Analysis Workbench**

Alternative names (acceptable):
- AI-Powered SQL Analytics Platform
- AI Data Analyst with NL→SQL Pipeline
- CSV/Excel AI Analysis Tool

Do NOT use:
- Enterprise AI Data Agent Platform (overclaims)
- Enterprise-Grade AI System (overclaims)

---

## 2. Recommended Project Positioning

### One-line description:
> Full-stack AI data analysis workbench for CSV/Excel files — SQL workspace + natural language analytics + anomaly detection.

### Detailed description:
> A single-user data analysis tool built with Next.js 15, FastAPI, and DuckDB. Users upload CSV/Excel files, explore data with a Monaco-based SQL workspace, and leverage LLM-powered features: natural language → SQL generation, result explanation, structured insight extraction, statistical anomaly detection with LLM interpretation, and multi-step autonomous analysis with guardrails and token budget control. The AI subsystem features a prompt contract architecture with 11 prompt modules, per-operation token budgets, execution guardrails, and full LLM call tracing.

---

## 3. Resume Bullet Points

### Option A: Concise (3-4 bullets)

- Built a full-stack AI data analysis workbench (Next.js 15 + FastAPI + DuckDB) with SQL workspace, natural language → SQL pipeline, and streaming AI analytics
- Designed prompt architecture with contract pattern (11 modules), token budget system, execution guardrails, and LLM call tracing for cost/safety control
- Implemented statistical anomaly detection engine (Z-score, IQR) with LLM interpretation, multi-step autonomous analysis with step-level retry and quality gates
- Achieved 420+ backend tests, 113 frontend tests, Docker containerization, and SSE streaming for real-time AI responses

### Option B: Detailed (5-6 bullets)

- Developed a full-stack data analysis platform (TypeScript + Python) enabling CSV/Excel upload, DuckDB-powered SQL execution, and AI-driven natural language analytics
- Built SQL workspace with Monaco Editor featuring autocomplete, multi-tab editing, query history, save/favorite, EXPLAIN visualization, and CSV/JSON/Excel export
- Engineered NL→SQL pipeline: schema-aware prompt construction → Anthropic Claude API → SQL extraction → read-only validation → execution → explanation, with streaming SSE output
- Designed AI runtime system: per-operation token budgets (10 operation types), execution guardrails (max steps, timeouts, failure limits), and full LLM call tracing for debugging
- Implemented anomaly detection combining statistical methods (Z-score, IQR, adaptive thresholds) with LLM interpretation for business-context insights
- Built multi-step autonomous analysis engine with planning → step execution → summarization, dependency chaining, step-level retry, and quality gate evaluation

### Option C: Short (2 bullets)

- Full-stack AI data analysis workbench (Next.js + FastAPI + DuckDB): SQL workspace, NL→SQL pipeline, anomaly detection, multi-step analysis with guardrails and token budget
- Prompt contract architecture (11 modules), streaming SSE, execution trace, 420+ backend tests, Docker deployment

---

## 4. Safe Technical Points to Write

| Technology | How to describe | Confidence |
|------------|----------------|------------|
| Next.js 15 + React 19 | Frontend framework | High — real, working |
| TypeScript | Frontend language | High — strict mode |
| FastAPI + Uvicorn | Backend API framework | High — real, working |
| DuckDB | Embedded OLAP database | High — real integration |
| Monaco Editor | SQL editor component | High — working with autocomplete |
| Anthropic Claude API | LLM provider | High — real API calls |
| SSE (Server-Sent Events) | Streaming AI responses | High — working implementation |
| Zustand | Client state management | High — 10 stores, persisted |
| React Query | Server state management | High — used for API polling |
| TailwindCSS | Styling | High — working |
| Pandas + NumPy | Data processing | High — real usage |
| Docker + docker-compose | Containerization | High — multi-stage builds |
| Pydantic | API validation | High — request/response models |
| Vitest + Pytest | Testing | High — 533+ tests passing |

---

## 5. Technical Points to Describe Carefully

| Technology | How NOT to describe | Why |
|------------|-------------------|-----|
| Guardrails | "Production-grade safety system" | It's a Python class with configurable limits, not a security framework |
| Token Budget | "Cost optimization system" | It estimates tokens heuristically, not with a real tokenizer |
| Trace | "Observability platform" | It records to memory/dict, not to a monitoring system |
| Scheduler | "Automated analysis scheduling" | Tasks persist but background execution needs verification |
| Prompt Architecture | "AI orchestration framework" | It's a well-organized prompt library, not a framework |
| Quality Gates | "Automated quality assurance" | Simple threshold checks on LLM evaluation output |
| i18n | "Full internationalization" | Core UI translated, but some labels still English |

---

## 6. Interview Q&A Preparation

### Q: "Is this a production system?"
**A**: No. It's a portfolio project that demonstrates AI application architecture. It runs locally on a single machine with DuckDB as the embedded database. The architecture is designed to be extensible — the prompt contract pattern, guardrails, and token budget system would apply to a production system — but this specific deployment is for demonstration purposes.

### Q: "How much did AI help you build this?"
**A**: I used Claude Code as a development tool throughout the project. My role was architect and product owner: I defined the system architecture (prompt contracts, guardrails, token budget), designed the feature set, validated every change through build/test cycles, and made all design decisions. Claude Code helped with implementation speed, but the architecture decisions — why we need a prompt contract pattern, how guardrails prevent runaway costs, how trace enables debugging — those came from understanding AI application engineering principles.

### Q: "What's the difference between this and a BI tool like Tableau/Power BI?"
**A**: BI tools are visualization-first: you build dashboards with drag-and-drop. This is analysis-first: the AI plans multi-step investigations, generates SQL to answer specific questions, interprets results in business context, and detects anomalies. It's closer to having an AI data analyst on staff than building a dashboard. The multi-step autonomous analysis feature, for example, takes a complex question like "why are sales declining?" and breaks it into investigation steps — checking trends, comparing segments, looking for anomalies — then synthesizes findings.

### Q: "How does NL→SQL generation work? How do you ensure safety?"
**A**: The pipeline has multiple safety layers:
1. **Schema context**: The LLM receives table names, column names, and types — it can only query existing tables
2. **Prompt engineering**: System prompt instructs the LLM to generate SELECT-only queries
3. **SQL validation**: `sql_validator.py` checks the generated SQL — blocks DDL (DROP, ALTER, CREATE) and DML (INSERT, UPDATE, DELETE)
4. **Read-only executor**: AI-generated SQL runs through `get_readonly_executor()`, which is a separate executor that only allows SELECT
5. **Quality gates**: The generated SQL is checked for common issues (empty result, syntax errors) before execution
6. **Guardrails**: Max 8 SQL queries per analysis, max 6 steps, 120s total timeout

### Q: "Why DuckDB instead of MySQL/PostgreSQL?"
**A**: Three reasons:
1. **Zero-config**: DuckDB is embedded — no server to install, no connection strings, no user management. Perfect for a single-user data analysis tool.
2. **OLAP performance**: DuckDB is columnar and optimized for analytical queries. Scanning a 50K-row CSV is instant.
3. **File-based**: Data lives in a single `.duckdb` file. Easy to back up, move, or share. No need for a database server running in the background.

For a production multi-user system, I'd use PostgreSQL. For a portfolio project demonstrating data analysis capabilities, DuckDB is the right choice.

### Q: "What's the prompt architecture you designed?"
**A**: Every AI operation follows the same pattern:
- **CONTRACT**: A dataclass defining the operation name and max output tokens
- **SYSTEM_PROMPT**: The instruction to the LLM (always in English, language directive appended)
- **build_user_message()**: Constructs the user message with schema context, data samples, and question

All 11 prompt modules are registered in a central `registry.py`. This makes it easy to adjust token budgets, test prompts independently, and add new operations without touching service code. The `apply_language()` function handles i18n by appending language directives to system prompts.

### Q: "How do you control LLM costs?"
**A**: Three mechanisms:
1. **Per-operation token budgets**: Each operation type has configured max input/output tokens (e.g., SQL generation: 512 output tokens, explanation: 1024)
2. **Workflow-level tracker**: For multi-step analysis, a `WorkflowTokenTracker` monitors cumulative consumption and stops when budget is exceeded (default 25K tokens)
3. **Heuristic token estimation**: We estimate tokens without a real tokenizer (CJK-aware: ~1.5 chars/token for Chinese, ~3 chars/token for English) to make budget decisions before API calls

### Q: "What would you change to make this production-ready?"
**A**: Key changes:
1. **Database**: Migrate from DuckDB to PostgreSQL for multi-user support
2. **Authentication**: Implement proper JWT/OAuth instead of optional API key
3. **Caching**: Add Redis for query result caching and session management
4. **Monitoring**: Integrate with Prometheus/Grafana for metrics and alerting
5. **CI/CD**: GitHub Actions for automated testing and deployment
6. **Load testing**: Verify performance under concurrent users
7. **Error tracking**: Sentry or similar for production error monitoring

### Q: "What was the hardest technical challenge?"
**A**: Designing the multi-step autonomous analysis pipeline. The challenge wasn't calling the LLM — it was making it reliable:
- **Guardrails**: What if the LLM generates the same query twice? What if it goes into a loop? The guardrail system tracks consecutive failures, recursion depth, and total execution time.
- **Dependency chaining**: Later analysis steps may depend on earlier results. The pipeline builds follow-up context from previous step outputs.
- **Error recovery**: If step 3 of 5 fails, the system continues with steps 4 and 5, then generates a partial summary. It doesn't just crash.
- **Token budget**: Each step consumes tokens. The tracker ensures we don't spend $5 on a single analysis.

---

## 7. Red Flags to Avoid in Interview

1. Don't say "enterprise-grade" — say "portfolio project demonstrating enterprise patterns"
2. Don't say "production-ready" — say "designed with production patterns (guardrails, trace, token budget)"
3. Don't claim multi-user support — it's single-user by design
4. Don't claim real-time analytics — it's batch queries on local files
5. Don't say "AI agent" — it's a prompt-chained pipeline, not an autonomous agent
6. Don't overstate the scheduler — it persists tasks but execution needs verification
7. Don't claim "full i18n" — some labels are still English
8. If asked about specific implementation details you don't remember, say "I'd need to check the code" rather than guessing

---

## 8. Project Differentiators (What Makes This Stand Out)

Most vibe-coding portfolio projects are CRUD apps with an AI chat bolted on. This project is different because:

1. **AI-native architecture**: The prompt contract pattern, token budget, guardrails, and trace are not afterthoughts — they're core design
2. **Safety-first AI SQL**: Read-only executor + SQL validation + quality gates = defense in depth
3. **Multi-step analysis**: Not just "ask a question, get an answer" — the system plans, executes, and synthesizes
4. **Statistical + LLM hybrid**: Anomaly detection uses real statistics (Z-score, IQR), then LLM interprets the business meaning
5. **Comprehensive testing**: 533+ tests across frontend and backend, not just happy-path coverage

---

*End of resume positioning guide.*
