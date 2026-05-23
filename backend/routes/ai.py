"""AI Analysis Routes — Natural language to SQL intelligence.

Endpoints:
- GET  /api/ai/status — AI service health check
- POST /api/ai/query — Generate SQL from natural language, execute, explain
- POST /api/ai/explain — Explain existing query results
- POST /api/ai/insights — Generate insights from results
- POST /api/ai/chart-suggest — Suggest chart types
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.ai_analyst import (
    generate_sql,
    explain_results,
    generate_insights,
    suggest_charts,
    build_schema_context,
    MODEL,
    TEMPERATURE,
)
from backend.services.data_service import _executor, _sanitize_for_json, list_tables

router = APIRouter()


@router.get("/ai/status")
async def ai_status():
    """Check AI service configuration and health."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    base_url = os.getenv("ANTHROPIC_BASE_URL", "")

    has_key = bool(api_key and api_key != "")
    masked_key = f"...{api_key[-4:]}" if len(api_key) > 8 else "(not set)" if not api_key else "***"

    # Quick connectivity test
    connection_ok = False
    try:
        from backend.services.ai_analyst import _get_client
        client = _get_client()
        if has_key:
            connection_ok = True
    except Exception:
        pass

    return {
        "configured": has_key,
        "connection": "ok" if connection_ok else ("not_configured" if not has_key else "error"),
        "model": MODEL,
        "temperature": TEMPERATURE,
        "base_url": base_url or "default",
        "api_key_preview": masked_key,
    }


class AIQueryRequest(BaseModel):
    question: str
    execute: bool = True
    explain: bool = True
    max_rows: int = 1000


class ExplainRequest(BaseModel):
    question: str
    sql: str
    results: list[dict]


class InsightsRequest(BaseModel):
    question: str
    results: list[dict]


class ChartSuggestRequest(BaseModel):
    results: list[dict]
    question: str = ""


@router.post("/ai/query")
async def ai_query(req: AIQueryRequest):
    """Natural language → SQL → Execute → Explain pipeline."""
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Empty question")

    # 1. Build schema context
    tables = list_tables()
    schema_context = build_schema_context(tables)

    # 2. Generate SQL
    sql_result = generate_sql(question, schema_context)
    if sql_result["status"] == "error":
        return {
            "question": question,
            "sql": "",
            "error": sql_result.get("error", "Failed to generate SQL"),
            "status": "error",
            "generation_ms": sql_result.get("elapsed_ms", 0),
        }

    sql = sql_result["sql"]

    # Check if the model determined the question can't be answered
    if sql.startswith("-- CANNOT_ANSWER"):
        return {
            "question": question,
            "sql": sql,
            "error": sql.replace("-- CANNOT_ANSWER:", "").strip(),
            "status": "cannot_answer",
            "generation_ms": sql_result["elapsed_ms"],
        }

    response = {
        "question": question,
        "sql": sql,
        "status": "success",
        "generation_ms": sql_result["elapsed_ms"],
    }

    # 3. Execute SQL (if requested)
    if req.execute:
        exec_result = _executor.execute(sql)
        if exec_result["status"] == "error":
            response["execution_error"] = exec_result["error"]
            response["status"] = "sql_error"
            return response

        data = _sanitize_for_json(exec_result["data"][:req.max_rows])
        response["columns"] = exec_result["columns"]
        response["data"] = data
        response["rowCount"] = exec_result["row_count"]
        response["truncated"] = exec_result["row_count"] > req.max_rows

        # 4. Explain results (if requested and we have data)
        if req.explain and data:
            explanation = explain_results(question, sql, data)
            response["explanation"] = explanation.get("explanation", "")
            response["explanation_ms"] = explanation.get("elapsed_ms", 0)

    return response


@router.post("/ai/explain")
async def ai_explain(req: ExplainRequest):
    """Explain existing query results."""
    result = explain_results(req.question, req.sql, req.results)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Explanation failed"))
    return result


@router.post("/ai/insights")
async def ai_insights(req: InsightsRequest):
    """Generate structured insights from results."""
    result = generate_insights(req.question, req.results)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Insights generation failed"))
    return result


@router.post("/ai/chart-suggest")
async def ai_chart_suggest(req: ChartSuggestRequest):
    """Suggest chart types for data."""
    result = suggest_charts(req.results, req.question)
    return result
