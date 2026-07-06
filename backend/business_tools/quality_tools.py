"""Data quality check tool."""

from __future__ import annotations

import pandas as pd
from database.db_manager import DatabaseManager

from backend.business_tools.models import DataQualityInput
from backend.business_tools.query_utils import load_table_frame, success_result


def data_quality_check(input_data: DataQualityInput, *, db_manager: DatabaseManager | None = None):
    df = load_table_frame(input_data.table_name, db_manager)
    order_date = pd.to_datetime(df["order_date"], errors="coerce") if "order_date" in df else pd.Series([], dtype="datetime64[ns]")
    ship_date = pd.to_datetime(df["ship_date"], errors="coerce") if "ship_date" in df else pd.Series([], dtype="datetime64[ns]")
    checks = {
        "sales_amount_non_positive": int((pd.to_numeric(df.get("sales_amount"), errors="coerce") <= 0).sum()) if "sales_amount" in df else None,
        "quantity_non_positive": int((pd.to_numeric(df.get("quantity"), errors="coerce") <= 0).sum()) if "quantity" in df else None,
        "discount_out_of_range": int(((pd.to_numeric(df.get("discount"), errors="coerce") < 0) | (pd.to_numeric(df.get("discount"), errors="coerce") > 1)).sum()) if "discount" in df else None,
        "ship_before_order": int((ship_date < order_date).sum()) if "ship_date" in df and "order_date" in df else None,
        "refund_exceeds_sales": int((pd.to_numeric(df.get("refund_amount"), errors="coerce") > pd.to_numeric(df.get("sales_amount"), errors="coerce")).sum()) if "refund_amount" in df and "sales_amount" in df else None,
        "missing_satisfaction_score": int(df["satisfaction_score"].isna().sum()) if "satisfaction_score" in df else None,
        "missing_ad_channel": int(df["ad_channel"].isna().sum() + (df["ad_channel"].astype(str).str.strip() == "").sum()) if "ad_channel" in df else None,
    }
    total_issues = sum(value for value in checks.values() if isinstance(value, int))
    summary = "数据质量存在少量可控异常。" if total_issues else "未发现预设质量异常。"
    return success_result("data_quality_check", summary, data={"row_count": len(df), "quality_checks": checks, "total_issue_count": total_issues})
