# Skill: AI SQL Analysis

**When to use**: User asks natural language questions about their data, or requests data analysis.

**Steps**:
1. Receive natural language question from user
2. Build schema context from available tables (use `list_tables()`)
3. Call `generate_sql()` to create SQL from question
4. Execute SQL via `QueryExecutor`
5. Call `explain_results()` to generate natural language explanation
6. Call `suggest_charts()` for visualization recommendations
7. Return structured response with SQL, data, explanation, and charts

**Key files**:
- `backend/services/ai_analyst.py` — LLM integration
- `backend/routes/ai.py` — API endpoints
- `frontend-react/src/panels/chat-panel.tsx` — UI
- `frontend-react/src/services/api.ts` — Frontend API calls

**API Endpoints**:
- `POST /api/ai/query` — Full pipeline: question → SQL → execute → explain
- `POST /api/ai/explain` — Explain existing results
- `POST /api/ai/insights` — Generate structured insights
- `POST /api/ai/chart-suggest` — Suggest chart types

**Location**: `skills/active/ai-sql-analysis.md`
