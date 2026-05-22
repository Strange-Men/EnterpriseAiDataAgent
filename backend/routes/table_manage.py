"""Table management endpoints — rename, export."""

import io
import csv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.data_service import _db, list_tables

router = APIRouter()


class RenameRequest(BaseModel):
    new_name: str


@router.put("/table/{table_name}/rename")
async def rename_table(table_name: str, req: RenameRequest):
    new_name = req.new_name.strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="New name cannot be empty")

    try:
        _db.rename_table(table_name, new_name)
        return {"status": "renamed", "old_name": table_name, "new_name": new_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/table/{table_name}/export")
async def export_table(table_name: str):
    try:
        df = _db.get_sample_data(table_name, limit=500000)
        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow(df.columns)
        for _, row in df.iterrows():
            writer.writerow(row.tolist())
        stream.seek(0)

        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{table_name}.csv"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
