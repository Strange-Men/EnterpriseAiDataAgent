# Skill: Automated Analysis Pipeline

**When to use**: A new CSV/Excel file is uploaded, or user requests data profiling.

**Steps**:
1. Upload triggers `POST /api/analyze/{table_name}`
2. Pipeline runs: profile → quality → anomalies → AI summary → chart suggestions
3. Returns structured report with statistics, quality scores, insights, and chart recommendations

**Key files**:
- `backend/routes/analyze.py` — Analysis endpoints
- `database/data_quality.py` — Quality analysis engine
- `database/schema_detector.py` — Schema detection
- `backend/services/ai_analyst.py` — AI insights

**API Endpoints**:
- `POST /api/analyze/{table_name}` — Full analysis pipeline
- `GET /api/analyze/{table_name}/profile` — Data profile only (fast, no AI)

**Analysis Steps**:
1. **Profile**: Column types, nulls, unique counts, numeric stats, top values
2. **Quality**: Missing values, duplicates, outliers, type anomalies
3. **AI Summary**: Natural language summary of key characteristics
4. **Chart Suggestions**: Recommended visualizations based on data types

**Location**: `skills/active/auto-analysis-pipeline.md`
