"""Query endpoints — POST /api/query, GET /api/query/history."""

import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.data_service import _executor, _sanitize_for_json
from backend.services.query_history import query_history

router = APIRouter()


class QueryRequest(BaseModel):
    sql: str
    limit: int = 500


@router.post("/query")
async def execute_query(req: QueryRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    start = time.time()
    try:
        result = _executor.execute(sql)
        runtime_ms = int((time.time() - start) * 1000)

        if result["status"] == "error":
            query_history.add(sql, "error", runtime_ms, 0, result["error"])
            return {
                "sql": sql,
                "columns": [],
                "data": [],
                "rowCount": 0,
                "runtimeMs": runtime_ms,
                "status": "error",
                "error": result["error"],
            }

        data = _sanitize_for_json(result["data"][:req.limit])
        query_history.add(sql, "success", runtime_ms, result["row_count"])

        return {
            "sql": sql,
            "columns": result["columns"],
            "data": data,
            "rowCount": result["row_count"],
            "runtimeMs": runtime_ms,
            "status": "success",
            "error": None,
        }
    except Exception as e:
        runtime_ms = int((time.time() - start) * 1000)
        query_history.add(sql, "error", runtime_ms, 0, str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/query/history")
async def get_history(limit: int = 50):
    return query_history.get_all(limit)
