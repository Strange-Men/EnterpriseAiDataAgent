"""Query endpoints — thin shell delegating to services."""

import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.data_service import get_executor, _sanitize_for_json
from backend.services.query_history import query_history
from backend.services.export_service import export_as_csv, export_as_json, export_as_excel
from backend.utils.json_safe import normalize_for_response

router = APIRouter()


class QueryRequest(BaseModel):
    sql: str
    offset: int = 0
    limit: int = 10000
    timeout_ms: int = 300000


class ExplainRequest(BaseModel):
    sql: str


class CancelRequest(BaseModel):
    query_id: int


class ExportRequest(BaseModel):
    sql: str
    format: str = "csv"  # csv | json | excel
    limit: int = 50000


# Track running queries for cancellation
_active_queries: dict[int, bool] = {}


@router.post("/query")
async def execute_query(req: QueryRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    query_id = int(time.time() * 1000)
    _active_queries[query_id] = True

    start = time.time()
    try:
        result = get_executor().execute_paginated(sql, offset=req.offset, limit=req.limit, timeout_ms=req.timeout_ms)
        runtime_ms = int((time.time() - start) * 1000)

        if result["status"] == "error":
            query_history.add(sql, "error", runtime_ms, 0, result["error"])
            return normalize_for_response({
                "queryId": query_id,
                "sql": sql,
                "columns": [],
                "data": [],
                "rowCount": 0,
                "totalRows": 0,
                "offset": req.offset,
                "hasMore": False,
                "runtimeMs": runtime_ms,
                "status": "error",
                "error": result["error"],
            })

        data = _sanitize_for_json(result["data"])
        query_history.add(sql, "success", runtime_ms, result["total_rows"])

        return normalize_for_response({
            "queryId": query_id,
            "sql": sql,
            "columns": result["columns"],
            "data": data,
            "rowCount": len(data),
            "totalRows": result["total_rows"],
            "offset": result["offset"],
            "hasMore": result["has_more"],
            "runtimeMs": runtime_ms,
            "status": "success",
            "error": None,
        })
    except Exception as e:
        runtime_ms = int((time.time() - start) * 1000)
        query_history.add(sql, "error", runtime_ms, 0, str(e))
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        _active_queries.pop(query_id, None)


@router.get("/query/history")
async def get_history(limit: int = 50):
    return normalize_for_response(query_history.get_all(limit))


@router.post("/query/explain")
async def explain_query(req: ExplainRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    result = get_executor().explain(sql)
    if result["status"] == "error":
        return normalize_for_response({"sql": sql, "plan": [], "status": "error", "error": result["error"]})
    return normalize_for_response({"sql": sql, "plan": result["plan"], "status": "success", "error": None})


@router.post("/query/cancel")
async def cancel_query(req: CancelRequest):
    _active_queries.pop(req.query_id, None)
    return {"cancelled": True, "queryId": req.query_id}


@router.post("/query/export")
async def export_query(req: ExportRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    start = time.time()
    result = get_executor().execute(sql)
    runtime_ms = int((time.time() - start) * 1000)

    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["error"])

    data = _sanitize_for_json(result["data"][:req.limit])
    columns = result["columns"]

    exporters = {
        "json": lambda: export_as_json(data),
        "excel": lambda: export_as_excel(data),
    }
    content, media_type, filename = exporters.get(req.format, lambda: export_as_csv(data, columns))()

    return StreamingResponse(
        iter([content]),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/query/schema")
async def get_all_schemas():
    """Return all table names and column names for autocomplete."""
    from backend.services.data_service import list_tables
    tables = list_tables()
    result = {}
    for table in tables:
        name = table["name"]
        cols = [c["name"] for c in table.get("columns", [])]
        result[name] = cols
    return normalize_for_response(result)
