"""Query endpoints — thin shell delegating to services."""

import time
import threading
import logging
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.data_service import get_readonly_executor
from backend.services.query_history import query_history
from backend.services.export_service import export_as_csv, export_as_json, export_as_excel
from backend.utils.json_safe import normalize_for_response

logger = logging.getLogger("enterprise_ai.query")

router = APIRouter()


class QueryRequest(BaseModel):
    sql: str
    offset: int = 0
    limit: int = 10000
    timeout_ms: int = 300000


class ExplainRequest(BaseModel):
    sql: str


class CancelRequest(BaseModel):
    query_id: str


class ExportRequest(BaseModel):
    sql: str
    format: str = "csv"  # csv | json | excel
    limit: int = 50000


class QueryResponse(BaseModel):
    queryId: str
    sql: str
    columns: list[str]
    data: list[dict]
    rowCount: int
    totalRows: int
    offset: int
    hasMore: bool
    runtimeMs: int
    status: str
    error: str | None = None


class QueryHistoryItem(BaseModel):
    id: str
    sql: str
    status: str
    runtimeMs: int
    rowCount: int
    error: str | None = None
    timestamp: str


class ExplainResponse(BaseModel):
    sql: str
    plan: list
    status: str
    error: str | None = None


# Track running queries for cancellation using threading.Event
_active_queries: dict[str, threading.Event] = {}


@router.post("/query", response_model=QueryResponse)
async def execute_query(req: QueryRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    query_id = str(uuid.uuid4())
    cancel_event = threading.Event()
    _active_queries[query_id] = cancel_event

    start = time.time()
    try:
        result = get_readonly_executor().execute_paginated(
            sql, offset=req.offset, limit=req.limit,
            timeout_ms=req.timeout_ms, cancel_event=cancel_event,
        )
        runtime_ms = int((time.time() - start) * 1000)

        if cancel_event.is_set():
            query_history.add(sql, "error", runtime_ms, 0, "Query cancelled")
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
                "status": "cancelled",
                "error": "Query cancelled by user",
            })

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

        data = normalize_for_response(result["data"])
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
        logger.error(f"Query execution error: {e}")
        raise HTTPException(status_code=500, detail="Query execution failed")
    finally:
        _active_queries.pop(query_id, None)


@router.get("/query/history", response_model=list[QueryHistoryItem])
async def get_history(limit: int = 50):
    return normalize_for_response(query_history.get_all(limit))


@router.post("/query/explain", response_model=ExplainResponse)
async def explain_query(req: ExplainRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    result = get_readonly_executor().explain(sql)
    if result["status"] == "error":
        return normalize_for_response({"sql": sql, "plan": [], "status": "error", "error": result["error"]})
    return normalize_for_response({"sql": sql, "plan": result["plan"], "status": "success", "error": None})


@router.post("/query/cancel")
async def cancel_query(req: CancelRequest):
    cancel_event = _active_queries.get(req.query_id)
    if cancel_event:
        cancel_event.set()
    else:
        _active_queries.pop(req.query_id, None)
    return {"cancelled": True, "queryId": req.query_id}


@router.post("/query/export")
async def export_query(req: ExportRequest):
    sql = req.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="Empty SQL query")

    start = time.time()
    result = get_readonly_executor().execute(sql)
    runtime_ms = int((time.time() - start) * 1000)

    if result["status"] == "error":
        logger.error(f"Export query error: {result['error']}")
        raise HTTPException(status_code=400, detail="Export query failed")

    data = normalize_for_response(result["data"][:req.limit])
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
