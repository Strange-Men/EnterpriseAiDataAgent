"""Opportunity finding tools."""

from __future__ import annotations

from typing import Any

from database.db_manager import DatabaseManager

from backend.business_tools.models import OpportunityFinderInput, OpportunityItem, ToolResult
from backend.business_tools.query_utils import round_value, success_result


def opportunity_finder(input_data: OpportunityFinderInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    items: list[OpportunityItem] = []
    for row in input_data.evidence_rows:
        sales = float(row.get("total_sales") or row.get("sales_amount") or 0)
        margin = float(row.get("gross_margin_rate") or 0)
        refund = float(row.get("refund_rate") or 0)
        satisfaction = float(row.get("avg_satisfaction_score") or row.get("satisfaction_score") or 4)
        discount = float(row.get("avg_discount") or 0)
        score = min(100, sales / 500_000 + margin * 90 + max(0, 0.08 - refund) * 180 + max(0, satisfaction - 4) * 18 - max(0, discount - 0.35) * 35)
        object_name = str(row.get("region") or row.get("category") or row.get("ad_channel") or row.get("product") or row.get("object_name") or "unknown")
        if score >= 25:
            items.append(
                OpportunityItem(
                    object_type=input_data.object_type,
                    object_name=object_name,
                    score=round_value(score, 2),
                    reason="销售具备一定规模，同时毛利、退款或满意度指标相对健康，具备加大投入候选价值。",
                    risk_reminder="扩大投入前仍需持续监控退款率、折扣率和满意度，避免规模增长带来体验风险。",
                    evidence=row,
                )
            )
    items.sort(key=lambda item: item.score, reverse=True)
    selected = items[: input_data.n]
    result = success_result(
        "opportunity_finder",
        f"已识别 {len(selected)} 个潜力增长对象，规则为销售规模 + 毛利健康 + 退款低 + 满意度较好。",
        data={"opportunities": [item.model_dump(mode="json") for item in selected]},
    )
    result.opportunities = selected
    return result
