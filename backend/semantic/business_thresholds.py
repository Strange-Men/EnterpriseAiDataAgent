"""Default and dynamic threshold rules for business risk interpretation."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class DefaultThresholdRule:
    metric_name: str
    operator: Literal[">", "<"]
    threshold: float
    label: str
    business_meaning: str


@dataclass(frozen=True)
class DynamicThresholdRule:
    metric_name: str
    quantile: float
    direction: Literal["top", "bottom"]
    label: str
    business_meaning: str


DEFAULT_THRESHOLDS: dict[str, DefaultThresholdRule] = {
    "refund_rate": DefaultThresholdRule("refund_rate", ">", 0.10, "高退款风险", "退款率超过默认业务阈值。"),
    "avg_discount": DefaultThresholdRule("avg_discount", ">", 0.35, "高折扣依赖", "平均折扣超过默认业务阈值。"),
    "gross_margin_rate": DefaultThresholdRule("gross_margin_rate", "<", 0.10, "利润风险", "毛利率低于默认业务阈值。"),
    "avg_shipping_days": DefaultThresholdRule("avg_shipping_days", ">", 7.0, "发货效率风险", "平均发货周期超过默认业务阈值。"),
    "satisfaction_score": DefaultThresholdRule("satisfaction_score", "<", 3.5, "客户体验风险", "满意度低于默认业务阈值。"),
}


DYNAMIC_THRESHOLD_RULES: dict[str, DynamicThresholdRule] = {
    "refund_rate": DynamicThresholdRule("refund_rate", 0.90, "top", "相对高退款风险", "退款率位于样本最高 10%。"),
    "gross_margin_rate": DynamicThresholdRule(
        "gross_margin_rate", 0.10, "bottom", "相对低利润风险", "毛利率位于样本最低 10%。"
    ),
    "avg_discount": DynamicThresholdRule("avg_discount", 0.90, "top", "相对高折扣依赖", "平均折扣位于样本最高 10%。"),
    "shipping_days": DynamicThresholdRule("shipping_days", 0.90, "top", "相对发货慢", "发货周期位于样本最高 10%。"),
    "satisfaction_score": DynamicThresholdRule(
        "satisfaction_score", 0.10, "bottom", "相对体验风险", "满意度位于样本最低 10%。"
    ),
}
