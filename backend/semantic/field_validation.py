"""Field validation and missing-field fallback definitions."""

from __future__ import annotations

from dataclasses import dataclass

from backend.semantic.business_fields import FIELD_DICTIONARY


@dataclass(frozen=True)
class MissingFieldFallback:
    missing_fields: tuple[str, ...]
    limitation: str
    alternative: str


MISSING_FIELD_FALLBACKS: dict[str, MissingFieldFallback] = {
    "profitability": MissingFieldFallback(
        ("profit_amount", "cost_amount"),
        "缺 profit_amount / cost_amount 时不能计算毛利率。",
        "可替代看销售额、退款率和平均折扣，判断收入规模、售后损失和促销依赖。",
    ),
    "channel_effectiveness": MissingFieldFallback(
        ("ad_channel",),
        "缺 ad_channel 时不能分析渠道效果。",
        "可替代看地区 / 品类表现，并说明无法比较渠道质量。",
    ),
    "satisfaction": MissingFieldFallback(
        ("satisfaction_score",),
        "缺 satisfaction_score 时不能判断满意度。",
        "可替代看投诉率和退款率，作为客户体验风险的间接证据。",
    ),
    "age_profile": MissingFieldFallback(
        ("customer_age",),
        "缺 customer_age 时不能做人群年龄画像。",
        "可替代看客户分层或城市等级，避免编造年龄偏好。",
    ),
    "membership_profile": MissingFieldFallback(
        ("membership_level",),
        "缺 membership_level 时不能按会员等级分析。",
        "可替代用 customer_id + order_date 粗略看复购频次。",
    ),
    "roi": MissingFieldFallback(
        ("ad_spend", "campaign_cost"),
        "缺 ad_spend / campaign_cost 时不能计算 ROI。",
        "可替代看渠道销售额、退款率和满意度，评估渠道质量而非 ROI。",
    ),
    "fine_location": MissingFieldFallback(
        ("address", "neighborhood", "latitude", "longitude"),
        "缺 address / neighborhood / latitude / longitude 时不能分析小区、门店或经纬度。",
        "可替代看 region / province / city / city_level 的区域层级表现。",
    ),
}


def validate_fields(requested_fields: list[str] | tuple[str, ...], available_fields: set[str] | list[str] | tuple[str, ...]) -> dict[str, list[str]]:
    available = set(available_fields)
    valid = [field for field in requested_fields if field in available]
    missing = [field for field in requested_fields if field not in available]
    known_semantic_fields = [field for field in requested_fields if field in FIELD_DICTIONARY]
    return {"valid": valid, "missing": missing, "known_semantic_fields": known_semantic_fields}


def get_fallbacks_for_missing_fields(missing_fields: set[str] | list[str] | tuple[str, ...]) -> list[MissingFieldFallback]:
    missing = set(missing_fields)
    fallbacks: list[MissingFieldFallback] = []
    for fallback in MISSING_FIELD_FALLBACKS.values():
        if missing.intersection(fallback.missing_fields):
            fallbacks.append(fallback)
    return fallbacks
