"""Table endpoints — GET /api/tables, GET/DELETE /api/tables/{name}."""

from fastapi import APIRouter, HTTPException
from backend.services.data_service import list_tables, get_table_preview, get_table_schema, delete_table

router = APIRouter()


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
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/{table_name}")
async def get_table_data(table_name: str, limit: int = 100):
    try:
        return get_table_preview(table_name, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/{table_name}/schema")
async def get_schema(table_name: str):
    try:
        columns = get_table_schema(table_name)
        return columns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tables/{table_name}")
async def remove_table(table_name: str):
    try:
        delete_table(table_name)
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
