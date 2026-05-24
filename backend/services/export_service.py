"""Export service — converts query results to various formats."""

import io
import json
import csv


def export_as_csv(data: list[dict], columns: list[str]) -> tuple[bytes, str, str]:
    """Export data as CSV. Returns (content_bytes, media_type, filename)."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=columns)
    writer.writeheader()
    writer.writerows(data)
    return (
        output.getvalue().encode("utf-8"),
        "text/csv",
        "query_result.csv",
    )


def export_as_json(data: list[dict]) -> tuple[bytes, str, str]:
    """Export data as JSON. Returns (content_bytes, media_type, filename)."""
    content = json.dumps(data, ensure_ascii=False, default=str)
    return (
        content.encode("utf-8"),
        "application/json",
        "query_result.json",
    )


def export_as_excel(data: list[dict]) -> tuple[bytes, str, str]:
    """Export data as Excel. Returns (content_bytes, media_type, filename)."""
    import pandas as pd

    df = pd.DataFrame(data)
    buf = io.BytesIO()
    df.to_excel(buf, index=False, engine="openpyxl")
    buf.seek(0)
    return (
        buf.read(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "query_result.xlsx",
    )
