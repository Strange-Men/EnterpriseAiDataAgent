"""Shared read-only data access and aggregation helpers for business tools."""

from __future__ import annotations

import math
import re
from typing import Any

import pandas as pd

from backend.business_tools.models import EvidenceRow, EvidenceTable, MetricValue, ToolResult
from backend.services.data_service import get_db
from backend.utils.json_safe import normalize_for_response
from database.db_manager import DatabaseManager

SAFE_IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


CORE_METRICS = (
    "total_sales",
    "order_count",
    "avg_order_value",
    "total_refund_amount",
    "refund_rate",
    "return_rate",
    "gross_margin_rate",
    "avg_discount",
    "avg_shipping_days",
    "complaint_rate",
    "avg_satisfaction_score",
)


def safe_identifier(name: str) -> str:
    if not SAFE_IDENTIFIER_RE.fullmatch(name or ""):
        raise ValueError(f"Unsafe identifier: {name}")
    return name


def load_table_frame(table_name: str, db_manager: DatabaseManager | None = None) -> pd.DataFrame:
    safe_table = safe_identifier(table_name)
    db = db_manager or get_db()
    return db.execute_query(f'SELECT * FROM "{safe_table}"')


def table_fields(df: pd.DataFrame) -> set[str]:
    return set(str(column) for column in df.columns)


def missing_fields(df: pd.DataFrame, required_fields: list[str] | tuple[str, ...]) -> list[str]:
    fields = table_fields(df)
    return [field for field in required_fields if field not in fields]


def numeric_series(df: pd.DataFrame, field: str) -> pd.Series:
    return pd.to_numeric(df[field], errors="coerce")


def safe_divide(numerator: float, denominator: float) -> float | None:
    if denominator == 0 or denominator is None or math.isnan(float(denominator)):
        return None
    return float(numerator) / float(denominator)


def round_value(value: Any, digits: int = 4) -> Any:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return value
    if math.isnan(number):
        return None
    return round(number, digits)


def metric_value(name: str, value: Any, display_format: str = "number", missing: list[str] | None = None) -> MetricValue:
    missing_list = missing or []
    return MetricValue(
        name=name,
        value=round_value(value),
        display_format=display_format,
        available=not missing_list,
        missing_fields=missing_list,
    )


def compute_metrics_for_frame(df: pd.DataFrame, requested_metrics: list[str] | None = None) -> tuple[list[MetricValue], dict[str, Any]]:
    requested = requested_metrics or list(CORE_METRICS)
    fields = table_fields(df)
    values: dict[str, Any] = {}
    metrics: list[MetricValue] = []

    total_sales = float(numeric_series(df, "sales_amount").sum()) if "sales_amount" in fields else None
    order_count = int(df["order_id"].nunique()) if "order_id" in fields else len(df)
    total_refund = float(numeric_series(df, "refund_amount").sum()) if "refund_amount" in fields else None
    total_profit = float(numeric_series(df, "profit_amount").sum()) if "profit_amount" in fields else None

    calculators = {
        "total_sales": (total_sales, "currency_2", ["sales_amount"]),
        "order_count": (order_count, "integer", ["order_id"]),
        "avg_order_value": (safe_divide(total_sales or 0, order_count), "currency_2", ["sales_amount", "order_id"]),
        "total_refund_amount": (total_refund, "currency_2", ["refund_amount"]),
        "refund_rate": (safe_divide(total_refund or 0, total_sales or 0), "percent_2", ["refund_amount", "sales_amount"]),
        "return_rate": (
            safe_divide(df["is_returned"].fillna(False).astype(bool).sum(), order_count) if "is_returned" in fields else None,
            "percent_2",
            ["is_returned", "order_id"],
        ),
        "gross_margin_rate": (safe_divide(total_profit or 0, total_sales or 0), "percent_2", ["profit_amount", "sales_amount"]),
        "avg_discount": (float(numeric_series(df, "discount").mean()) if "discount" in fields else None, "percent_2", ["discount"]),
        "avg_shipping_days": (
            float(numeric_series(df, "shipping_days").mean()) if "shipping_days" in fields else None,
            "number_2",
            ["shipping_days"],
        ),
        "complaint_rate": (
            safe_divide((numeric_series(df, "complaint_count") > 0).sum(), order_count) if "complaint_count" in fields else None,
            "percent_2",
            ["complaint_count", "order_id"],
        ),
        "avg_satisfaction_score": (
            float(numeric_series(df, "satisfaction_score").mean()) if "satisfaction_score" in fields else None,
            "score_2",
            ["satisfaction_score"],
        ),
        "profit_amount": (total_profit, "currency_2", ["profit_amount"]),
    }

    for metric_name in requested:
        if metric_name not in calculators:
            continue
        value, display_format, required_fields = calculators[metric_name]
        missing = [field for field in required_fields if field not in fields]
        metrics.append(metric_value(metric_name, value, display_format, missing))
        values[metric_name] = round_value(value)

    return metrics, values


def grouped_metrics(df: pd.DataFrame, dimension: str, requested_metrics: list[str] | None = None) -> pd.DataFrame:
    safe_identifier(dimension)
    groups = []
    total_sales = float(numeric_series(df, "sales_amount").sum()) if "sales_amount" in df.columns else 0.0
    total_profit = float(numeric_series(df, "profit_amount").sum()) if "profit_amount" in df.columns else 0.0
    for value, part in df.groupby(dimension, dropna=False, observed=False):
        _, metrics = compute_metrics_for_frame(part, requested_metrics or list(CORE_METRICS) + ["profit_amount"])
        metrics[dimension] = "" if pd.isna(value) else value
        if total_sales:
            metrics["sales_contribution"] = round_value((metrics.get("total_sales") or 0) / total_sales)
        if total_profit:
            metrics["profit_contribution"] = round_value((metrics.get("profit_amount") or 0) / total_profit)
        groups.append(metrics)
    result = pd.DataFrame(groups)
    if "total_sales" in result.columns:
        result = result.sort_values("total_sales", ascending=False)
    return result.reset_index(drop=True)


def evidence_table(title: str, df: pd.DataFrame, limit: int = 10) -> EvidenceTable:
    limited = df.head(limit).copy()
    records = normalize_for_response(limited.to_dict(orient="records"))
    return EvidenceTable(
        title=title,
        columns=[str(column) for column in limited.columns],
        rows=[EvidenceRow(values=row) for row in records],
        row_count=len(limited),
    )


def success_result(
    tool_name: str,
    summary: str,
    *,
    metrics: list[MetricValue] | None = None,
    tables: list[EvidenceTable] | None = None,
    data: dict[str, Any] | None = None,
) -> ToolResult:
    return ToolResult(
        tool_name=tool_name,
        status="success",
        evidence_summary=summary,
        metrics=metrics or [],
        evidence_tables=tables or [],
        data=normalize_for_response(data or {}),
    )


def partial_result(tool_name: str, summary: str, missing: list[str], fallback_message: str) -> ToolResult:
    return ToolResult(
        tool_name=tool_name,
        status="partial",
        evidence_summary=summary,
        missing_fields=missing,
        fallback_message=fallback_message,
        can_continue=True,
    )
