"""M6 Business Analysis Tools.

These functions are deterministic backend helpers for M6.4. They are not
registered as LangChain tools in this stage.
"""

from backend.business_tools.dimension_tools import compare_by_dimension, top_bottom_analysis
from backend.business_tools.kpi_tools import compute_overall_kpis, map_business_terms, validate_fields
from backend.business_tools.opportunity_tools import opportunity_finder
from backend.business_tools.quality_tools import data_quality_check
from backend.business_tools.recommendation_tools import recommendation_builder, root_cause_hypothesis
from backend.business_tools.risk_tools import (
    channel_effectiveness_analysis,
    customer_profile_analysis,
    discount_risk_analysis,
    profitability_analysis,
    refund_risk_analysis,
    risk_priority_scoring,
    shipping_efficiency_analysis,
)
from backend.business_tools.trend_tools import trend_analysis

__all__ = [
    "channel_effectiveness_analysis",
    "compare_by_dimension",
    "compute_overall_kpis",
    "customer_profile_analysis",
    "data_quality_check",
    "discount_risk_analysis",
    "map_business_terms",
    "opportunity_finder",
    "profitability_analysis",
    "recommendation_builder",
    "refund_risk_analysis",
    "risk_priority_scoring",
    "root_cause_hypothesis",
    "shipping_efficiency_analysis",
    "top_bottom_analysis",
    "trend_analysis",
    "validate_fields",
]
