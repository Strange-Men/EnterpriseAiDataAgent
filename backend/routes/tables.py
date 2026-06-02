"""Table endpoints — CRUD, rename, export, paginated data."""

import io
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.data_service import get_db, list_tables, get_table_preview, get_table_schema, delete_table
from backend.utils.json_safe import normalize_for_response
from backend.utils.validation import validate_table_name

logger = logging.getLogger("enterprise_ai.tables")

router = APIRouter()


# ── List / Preview / Schema / Delete ─────────────────────────────

@router.get("/tables")
async def get_tables():
    try:
        tables = list_tables()
        result = []
        for tbl in tables:
            cols = [
                {"name": c["name"], "dtype": c["type"], "nullable": c["nullable"] == "YES", "uniqueCount": 0}
                for c in tbl.get("columns", [])
            ]
            result.append({
                "name": tbl["name"],
                "rowCount": tbl["row_count"],
                "columnCount": tbl["column_count"],
                "columns": cols,
                "uploadTime": tbl.get("uploadTime"),
            })
        return normalize_for_response(result)
    except Exception as e:
        logger.error(f"List tables error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list tables")


@router.get("/tables/{table_name}")
async def get_table_data(table_name: str, limit: int = 100):
    try:
        validate_table_name(table_name)
        return get_table_preview(table_name, max(1, min(limit, 10000)))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Get table data error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch table data")


@router.get("/tables/{table_name}/schema")
async def get_schema(table_name: str):
    try:
        validate_table_name(table_name)
        return get_table_schema(table_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Get schema error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch table schema")


@router.delete("/tables/{table_name}")
async def remove_table(table_name: str):
    try:
        validate_table_name(table_name)
        delete_table(table_name)
        return {"status": "deleted"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Delete table error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete table")


@router.get("/tables/{table_name}/data")
async def get_table_data_paginated(
    table_name: str,
    page: int = 0,
    page_size: int = 100,
):
    """Paginated data fetch with server-side OFFSET for virtual scrolling."""
    try:
        validate_table_name(table_name)
        conn = get_db().connect()
        page = max(0, page)
        page_size = max(1, min(page_size, 10000))
        offset = page * page_size
        count_row = conn.execute(f'SELECT COUNT(*) FROM "{table_name}"').fetchone()
        total_rows = count_row[0] if count_row else 0
        rows = conn.execute(f'SELECT * FROM "{table_name}" LIMIT {page_size} OFFSET {offset}').fetchdf()
        columns = list(rows.columns)
        data = normalize_for_response(rows.to_dict(orient="records"))
        return normalize_for_response({
            "columns": columns,
            "data": data,
            "page": page,
            "pageSize": page_size,
            "totalRows": total_rows,
            "hasMore": offset + page_size < total_rows,
        })
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Get paginated data error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch table data")


# ── Rename ───────────────────────────────────────────────────────

class RenameRequest(BaseModel):
    new_name: str


@router.put("/tables/{table_name}/rename")
@router.put("/table/{table_name}/rename")  # deprecated alias
async def rename_table(table_name: str, req: RenameRequest):
    new_name = req.new_name.strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="New name cannot be empty")
    try:
        validate_table_name(table_name)
        validate_table_name(new_name)
        get_db().rename_table(table_name, new_name)
        return {"status": "renamed", "old_name": table_name, "new_name": new_name}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Rename table error: {e}")
        raise HTTPException(status_code=500, detail="Failed to rename table")


# ── Export ────────────────────────────────────────────────────────

@router.get("/tables/{table_name}/export")
@router.get("/table/{table_name}/export")  # deprecated alias
async def export_table(table_name: str):
    try:
        validate_table_name(table_name)
        df = get_db().get_sample_data(table_name, limit=500000)
        # Use pandas to_csv instead of iterrows for better performance
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        stream.seek(0)
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{table_name}.csv"'},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Export table error: {e}")
        raise HTTPException(status_code=500, detail="Failed to export table")
