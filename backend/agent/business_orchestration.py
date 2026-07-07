"""Business Analyst Agent orchestration helpers for M6.5.

This module is deterministic and local-only. It classifies business questions,
builds analysis plans, renders business reports from tool evidence, and creates
compact memory summaries. It does not call providers, register routes, touch
frontend code, or implement Multi-Agent / LangGraph / RAG behavior.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any

from backend.semantic import ANALYSIS_TEMPLATES, HIDDEN_TECHNICAL_FIELDS


BUSINESS_QUESTION_TYPES: tuple[str, ...] = (
    "business_health_check",
    "business_review_summary",
    "risk_diagnosis",
    "growth_opportunity",
    "region_analysis",
    "category_product_analysis",
    "customer_profile_analysis",
    "channel_analysis",
    "trend_analysis",
    "shipping_efficiency_analysis",
    "data_quality_check",
    "anti_hallucination_field_check",
    "follow_up_drilldown",
    "recommendation_request",
)


QUESTION_TYPE_TO_TEMPLATE: dict[str, str] = {
    "business_health_check": "business_health_assessment",
    "business_review_summary": "business_review_summary",
    "risk_diagnosis": "risk_diagnosis",
    "growth_opportunity": "growth_opportunity",
    "region_analysis": "region_performance",
    "category_product_analysis": "product_category_analysis",
    "customer_profile_analysis": "customer_profile",
    "channel_analysis": "channel_effectiveness",
    "trend_analysis": "time_trend",
    "shipping_efficiency_analysis": "shipping_efficiency",
    "data_quality_check": "data_quality_check",
    "anti_hallucination_field_check": "anti_hallucination_field_check",
}


COMPLEX_QUESTION_TYPES: set[str] = {
    "business_health_check",
    "business_review_summary",
    "risk_diagnosis",
    "growth_opportunity",
}


TECHNICAL_DETAIL_KEYS: set[str] = set(HIDDEN_TECHNICAL_FIELDS).union(
    {"provider_used", "provider_requested", "fallback_reason", "tool_call", "tool_calls"}
)


@dataclass(frozen=True)
class UnsupportedFieldRule:
    fields: tuple[str, ...]
    patterns: tuple[str, ...]
    limitation: str
    alternative: str


UNSUPPORTED_FIELD_RULES: tuple[UnsupportedFieldRule, ...] = (
    UnsupportedFieldRule(
        fields=("ad_spend", "campaign_cost"),
        patterns=("roi", "ROI", "广告花费", "投放成本", "campaign_cost", "ad_spend"),
        limitation="缺少 ad_spend / campaign_cost 字段，不能直接计算广告 ROI。",
        alternative="可替代查看渠道销售额、退款率、满意度和投诉率，评估渠道质量而不是 ROI。",
    ),
    UnsupportedFieldRule(
        fields=("membership_level",),
        patterns=("会员等级", "membership_level", "会员级别"),
        limitation="缺少 membership_level 字段，不能按会员等级分析。",
        alternative="可替代用 customer_id + order_date 粗略观察复购频次，或改看 customer_segment。",
    ),
    UnsupportedFieldRule(
        fields=("neighborhood", "address", "latitude", "longitude"),
        patterns=("小区", "地址", "门店", "经纬度", "neighborhood", "address", "latitude", "longitude"),
        limitation="缺少 neighborhood / address / latitude / longitude 字段，不能分析小区、门店或经纬度。",
        alternative="可替代查看 region / province / city / city_level 的区域层级表现。",
    ),
    UnsupportedFieldRule(
        fields=("campaign_creative",),
        patterns=("广告创意", "campaign_creative", "创意素材"),
        limitation="缺少 campaign_creative 字段，不能比较广告创意效果。",
        alternative="可替代查看 ad_channel 的渠道销售、退款率和客户体验指标。",
    ),
    UnsupportedFieldRule(
        fields=("service_ticket_text",),
        patterns=("客服工单", "投诉原文", "工单文本", "客服文本"),
        limitation="缺少客服工单文本字段，不能总结具体投诉原文。",
        alternative="可替代查看 complaint_count、return_reason、refund_amount 等结构化售后信号。",
    ),
)


def classify_business_question(question: str, *, has_prior_memory: bool = False) -> dict[str, Any]:
    """Classify a user question into the M6 business question taxonomy."""

    text = (question or "").strip()
    lowered = text.lower()
    requested_missing_fields = requested_unsupported_fields(text)

    if requested_missing_fields:
        return {
            "question_type": "anti_hallucination_field_check",
            "confidence": 0.98,
            "reason": "question requests fields that are absent from the M6 demo schema",
            "requested_missing_fields": requested_missing_fields,
        }

    if _contains_any(text, ("刚才", "上一轮", "上次", "基于上", "继续看", "换成看", "刚刚")):
        return {
            "question_type": "follow_up_drilldown",
            "confidence": 0.9 if has_prior_memory else 0.76,
            "reason": "question references previous evidence or asks for drill-down",
            "requested_missing_fields": [],
        }

    if _contains_any(text, ("建议", "整改", "行动计划", "怎么做", "优先处理", "一周内", "运营经理")):
        return _classification("recommendation_request", 0.86, "question asks for actions or priority handling")

    if _contains_any(text, ("指标", "监控", "持续监控", "KPI", "kpi")):
        return _classification("business_health_check", 0.84, "question asks which business metrics need monitoring")

    ordered_rules: tuple[tuple[str, float, str, tuple[str, ...]], ...] = (
        ("business_health_check", 0.92, "question asks for overall business health", ("经营健康", "健康度", "整体经营", "总体表现", "怎么样")),
        ("business_review_summary", 0.9, "question asks for review or executive brief", ("复盘", "汇报", "简报", "老板", "经营简报")),
        ("risk_diagnosis", 0.9, "question asks for risks or anomalies", ("风险", "异常", "问题", "排查", "最该先处理")),
        ("growth_opportunity", 0.88, "question asks for growth or investment opportunities", ("机会", "增长", "加大投入", "下季度", "值得投入")),
        ("shipping_efficiency_analysis", 0.88, "question asks about shipping or fulfillment", ("发货", "物流", "履约", "配送", "发货慢")),
        ("data_quality_check", 0.9, "question asks for data quality or dirty data", ("数据质量", "脏数据", "缺失", "异常值", "质量问题")),
        ("channel_analysis", 0.87, "question asks about channel or acquisition", ("渠道", "广告", "投放", "流量", "直播", "信息流")),
        ("customer_profile_analysis", 0.86, "question asks about customer profile", ("客户", "用户", "人群", "年龄", "性别", "高价值客户")),
        ("category_product_analysis", 0.86, "question asks about category or product", ("商品", "品类", "产品", "SKU", "销量", "退款原因")),
        ("region_analysis", 0.86, "question asks about regional performance", ("地区", "区域", "省份", "城市", "华南", "华东")),
        ("trend_analysis", 0.84, "question asks about time trend", ("趋势", "最近", "月份", "环比", "变好", "变差")),
    )
    for question_type, confidence, reason, keywords in ordered_rules:
        if _contains_any(text, keywords) or _contains_any(lowered, keywords):
            return _classification(question_type, confidence, reason)

    return {
        "question_type": "legacy_sql",
        "confidence": 0.4,
        "reason": "no business orchestration trigger matched",
        "requested_missing_fields": [],
    }


def build_analysis_plan(question_type: str, question: str, available_fields: list[str], *, prior_memory: dict[str, Any] | None = None) -> dict[str, Any]:
    """Build a structured plan for M6.5 business orchestration."""

    template_key = QUESTION_TYPE_TO_TEMPLATE.get(question_type)
    template = ANALYSIS_TEMPLATES.get(template_key or "")
    requested_missing_fields = requested_unsupported_fields(question)

    required_fields = list(template.required_fields) if template else []
    optional_fields = list(template.optional_fields) if template else []
    metrics = list(template.metrics) if template else []
    dimensions = list(template.suggested_dimensions) if template else []
    report_sections = list(template.report_sections) if template else [
        "executive_summary",
        "key_findings",
        "evidence_summary",
        "risk_priorities",
        "recommendations",
        "next_questions",
        "limitations",
    ]

    tool_plan = _tool_plan_for_question_type(question_type)
    if question_type == "anti_hallucination_field_check":
        required_fields = requested_missing_fields
        optional_fields = [field for field in ("ad_channel", "region", "category", "customer_id", "order_date") if field in available_fields]
        metrics = []
        dimensions = ["schema"]
    elif question_type == "follow_up_drilldown" and prior_memory:
        focus_dimensions = prior_memory.get("focus_dimensions") or []
        if focus_dimensions:
            dimensions = list(dict.fromkeys([*focus_dimensions, *dimensions]))
        prior_question_type = str(prior_memory.get("question_type") or "")
        if prior_question_type and prior_question_type in BUSINESS_QUESTION_TYPES:
            tool_plan = _tool_plan_for_question_type(prior_question_type)
            if "memory_read" not in tool_plan:
                tool_plan.insert(0, "memory_read")

    return {
        "question_type": question_type,
        "required_fields": required_fields,
        "optional_fields": optional_fields,
        "metrics": metrics,
        "dimensions": dimensions,
        "business_tools_to_call": tool_plan,
        "expected_evidence": list(template.expected_evidence) if template else [],
        "report_sections": report_sections,
        "missing_field_strategy": _missing_field_strategy(required_fields, available_fields),
    }


def requested_unsupported_fields(question: str) -> list[str]:
    fields: list[str] = []
    for rule in UNSUPPORTED_FIELD_RULES:
        if _contains_any(question, rule.patterns):
            fields.extend(rule.fields)
    return list(dict.fromkeys(fields))


def unsupported_field_limitations(missing_fields: list[str]) -> list[str]:
    limitations: list[str] = []
    missing = set(missing_fields)
    for rule in UNSUPPORTED_FIELD_RULES:
        if missing.intersection(rule.fields):
            limitations.append(f"{rule.limitation} {rule.alternative}")
    return limitations


def build_business_report(
    *,
    question: str,
    question_type: str,
    evidence_results: list[dict[str, Any]],
    prior_memory: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a user-facing business report from deterministic evidence."""

    risks = _collect_items(evidence_results, "risks")
    opportunities = _collect_items(evidence_results, "opportunities")
    recommendations = _collect_items(evidence_results, "recommendations")
    limitations = _collect_limitations(evidence_results)
    evidence_summary = _collect_evidence_summary(evidence_results)
    key_findings = _build_key_findings(question_type, evidence_results, risks, opportunities, limitations)
    risk_priorities = _rank_risks(risks)
    if not recommendations and question_type != "anti_hallucination_field_check":
        recommendations = _fallback_recommendations(question_type, evidence_summary, limitations)

    if question_type == "anti_hallucination_field_check":
        executive_summary = _anti_hallucination_summary(evidence_results, limitations)
    elif question_type == "growth_opportunity" and opportunities:
        executive_summary = "当前数据中存在可加大投入的候选对象，但需要同时设置退款率、毛利率和满意度护栏。"
    elif question_type in {"risk_diagnosis", "recommendation_request"} and risk_priorities:
        executive_summary = f"当前最需要优先处理的是 {risk_priorities[0].get('risk_name')}，它同时具备影响面和风险强度。"
    elif question_type == "data_quality_check":
        executive_summary = "这张表存在少量可控数据质量问题，适合继续分析，但关键异常需要在正式决策前清洗。"
    elif question_type == "follow_up_drilldown" and prior_memory:
        executive_summary = "已基于上一轮摘要继续下钻，本轮结论优先复用上一轮关注对象和证据口径。"
    else:
        executive_summary = "整体经营具备收入规模，但退款、折扣、履约、体验和数据质量需要结合证据持续监控。"

    report = {
        "executive_summary": executive_summary,
        "key_findings": key_findings[:5],
        "evidence_summary": evidence_summary[:10],
        "risk_priorities": risk_priorities[:5],
        "opportunities": opportunities[:5],
        "recommendations": recommendations[:6],
        "next_questions": _next_questions(question_type),
        "limitations": limitations,
    }
    return sanitize_business_report(report)


def render_business_answer(report: dict[str, Any]) -> str:
    """Render a compact natural-language answer for existing frontend fields."""

    lines = [str(report.get("executive_summary") or "已生成业务分析报告。")]
    findings = report.get("key_findings") or []
    if findings:
        lines.append("")
        lines.append("核心结论：")
        lines.extend(f"- {item}" for item in findings[:5])
    risks = report.get("risk_priorities") or []
    if risks:
        lines.append("")
        lines.append("风险优先级：")
        for risk in risks[:3]:
            lines.append(f"- {risk.get('risk_level', 'medium')}: {risk.get('risk_name')}（{risk.get('reason')}）")
    recommendations = report.get("recommendations") or []
    if recommendations:
        lines.append("")
        lines.append("建议动作：")
        for rec in recommendations[:3]:
            lines.append(f"- {rec.get('priority', 'P1')} {rec.get('target_object')}: {rec.get('action')}")
    limitations = report.get("limitations") or []
    if limitations:
        lines.append("")
        lines.append("限制说明：")
        lines.extend(f"- {item}" for item in limitations[:3])
    return "\n".join(lines)


def build_memory_summary(
    *,
    table_name: str | None,
    question_type: str,
    plan: dict[str, Any],
    report: dict[str, Any],
    evidence_results: list[dict[str, Any]],
) -> dict[str, Any]:
    """Create compact non-user-facing memory for follow-up questions."""

    return {
        "current_table": table_name,
        "question_type": question_type,
        "focus_dimensions": list(plan.get("dimensions") or [])[:5],
        "key_findings": list(report.get("key_findings") or [])[:5],
        "risk_priorities": [
            {
                "risk_name": risk.get("risk_name"),
                "risk_level": risk.get("risk_level"),
                "priority_score": risk.get("priority_score"),
            }
            for risk in list(report.get("risk_priorities") or [])[:5]
        ],
        "recommendations": [
            {
                "priority": rec.get("priority"),
                "target_object": rec.get("target_object"),
                "monitoring_metric": rec.get("monitoring_metric"),
            }
            for rec in list(report.get("recommendations") or [])[:5]
        ],
        "evidence_summary": [
            {"tool_name": item.get("tool_name"), "summary": item.get("evidence_summary")}
            for item in evidence_results[:8]
        ],
    }


def summarize_prior_record(record: Any | None) -> dict[str, Any] | None:
    if record is None:
        return None
    try:
        trace = getattr(record.run, "trace", {}) or {}
        summary = trace.get("business_memory_summary")
        if isinstance(summary, dict):
            return summary
        report = getattr(record.run, "business_report", None)
        if isinstance(report, dict):
            return {
                "current_table": getattr(record.run, "table_name", None),
                "question_type": trace.get("business_question_type"),
                "key_findings": report.get("key_findings", [])[:5],
                "risk_priorities": report.get("risk_priorities", [])[:5],
                "recommendations": report.get("recommendations", [])[:5],
            }
    except Exception:
        return None
    return None


def sanitize_business_report(report: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in report.items() if key not in TECHNICAL_DETAIL_KEYS}


def should_use_business_orchestration(question_type: str) -> bool:
    return question_type in BUSINESS_QUESTION_TYPES


def _classification(question_type: str, confidence: float, reason: str) -> dict[str, Any]:
    return {
        "question_type": question_type,
        "confidence": confidence,
        "reason": reason,
        "requested_missing_fields": [],
    }


def _contains_any(text: str, patterns: tuple[str, ...]) -> bool:
    return any(pattern and pattern in text for pattern in patterns)


def _tool_plan_for_question_type(question_type: str) -> list[str]:
    plans = {
        "business_health_check": [
            "memory_read",
            "validate_fields",
            "map_business_terms",
            "compute_overall_kpis",
            "compare_by_dimension",
            "refund_risk_analysis",
            "discount_risk_analysis",
            "shipping_efficiency_analysis",
            "data_quality_check",
            "risk_priority_scoring",
            "recommendation_builder",
            "memory_write",
        ],
        "business_review_summary": [
            "memory_read",
            "map_business_terms",
            "trend_analysis",
            "compare_by_dimension",
            "top_bottom_analysis",
            "refund_risk_analysis",
            "risk_priority_scoring",
            "recommendation_builder",
            "memory_write",
        ],
        "risk_diagnosis": [
            "memory_read",
            "validate_fields",
            "refund_risk_analysis",
            "discount_risk_analysis",
            "profitability_analysis",
            "data_quality_check",
            "risk_priority_scoring",
            "root_cause_hypothesis",
            "recommendation_builder",
            "memory_write",
        ],
        "growth_opportunity": [
            "memory_read",
            "compute_overall_kpis",
            "compare_by_dimension",
            "opportunity_finder",
            "recommendation_builder",
            "memory_write",
        ],
        "region_analysis": ["memory_read", "compare_by_dimension", "refund_risk_analysis", "opportunity_finder", "recommendation_builder", "memory_write"],
        "category_product_analysis": ["memory_read", "top_bottom_analysis", "profitability_analysis", "refund_risk_analysis", "root_cause_hypothesis", "recommendation_builder", "memory_write"],
        "customer_profile_analysis": ["memory_read", "customer_profile_analysis", "recommendation_builder", "memory_write"],
        "channel_analysis": ["memory_read", "channel_effectiveness_analysis", "refund_risk_analysis", "recommendation_builder", "memory_write"],
        "trend_analysis": ["memory_read", "trend_analysis", "recommendation_builder", "memory_write"],
        "shipping_efficiency_analysis": ["memory_read", "shipping_efficiency_analysis", "recommendation_builder", "memory_write"],
        "data_quality_check": ["memory_read", "data_quality_check", "recommendation_builder", "memory_write"],
        "anti_hallucination_field_check": ["memory_read", "validate_fields", "map_business_terms", "memory_write"],
        "follow_up_drilldown": ["memory_read", "refund_risk_analysis", "profitability_analysis", "root_cause_hypothesis", "recommendation_builder", "memory_write"],
        "recommendation_request": ["memory_read", "refund_risk_analysis", "discount_risk_analysis", "shipping_efficiency_analysis", "risk_priority_scoring", "recommendation_builder", "memory_write"],
    }
    return list(plans.get(question_type, []))


def _missing_field_strategy(required_fields: list[str], available_fields: list[str]) -> dict[str, Any]:
    available = set(available_fields)
    missing = [field for field in required_fields if field not in available]
    return {
        "missing_fields": missing,
        "can_continue": not missing,
        "fallback": unsupported_field_limitations(missing),
    }


def _collect_items(evidence_results: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for result in evidence_results:
        raw = result.get(key) or []
        if isinstance(raw, list):
            items.extend(item for item in raw if isinstance(item, dict))
    return items


def _collect_limitations(evidence_results: list[dict[str, Any]]) -> list[str]:
    limitations: list[str] = []
    missing_fields: list[str] = []
    for result in evidence_results:
        missing_fields.extend(str(field) for field in result.get("missing_fields") or [])
        fallback = str(result.get("fallback_message") or "").strip()
        if fallback:
            limitations.append(fallback)
    limitations.extend(unsupported_field_limitations(list(dict.fromkeys(missing_fields))))
    return list(dict.fromkeys(limitations))


def _collect_evidence_summary(evidence_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    evidence: list[dict[str, Any]] = []
    for result in evidence_results:
        item = {
            "tool_name": result.get("tool_name"),
            "summary": result.get("evidence_summary") or "",
        }
        tables = result.get("evidence_tables") or []
        if tables:
            first_table = tables[0]
            if isinstance(first_table, dict):
                item["table_title"] = first_table.get("title")
                item["top_rows"] = list(first_table.get("rows") or [])[:3]
        metrics = result.get("metrics") or []
        if metrics:
            item["metrics"] = list(metrics)[:5]
        evidence.append(item)
    return evidence


def _build_key_findings(
    question_type: str,
    evidence_results: list[dict[str, Any]],
    risks: list[dict[str, Any]],
    opportunities: list[dict[str, Any]],
    limitations: list[str],
) -> list[str]:
    findings: list[str] = []
    kpi_result = _find_result(evidence_results, "compute_overall_kpis")
    if kpi_result:
        metrics = {metric.get("name"): metric.get("value") for metric in kpi_result.get("metrics", []) if isinstance(metric, dict)}
        if metrics:
            findings.append(
                "整体 KPI 已计算：销售额 {sales}，订单数 {orders}，退款率 {refund}，毛利率 {margin}。".format(
                    sales=metrics.get("total_sales", "N/A"),
                    orders=metrics.get("order_count", "N/A"),
                    refund=metrics.get("refund_rate", "N/A"),
                    margin=metrics.get("gross_margin_rate", "N/A"),
                )
            )
    for result in evidence_results:
        summary = str(result.get("evidence_summary") or "").strip()
        tool_name = str(result.get("tool_name") or "")
        if summary and tool_name not in {"memory_read", "memory_write", "validate_fields"}:
            findings.append(summary)
    if risks:
        findings.append(f"已识别 {len(risks)} 个风险候选，其中最高优先级为 {risks[0].get('risk_name')}。")
    if opportunities:
        findings.append(f"已识别 {len(opportunities)} 个增长机会候选，需配合风险护栏推进。")
    if limitations and question_type == "anti_hallucination_field_check":
        findings.append("请求中包含当前表不存在的字段，不能直接给出该维度结论。")
    return list(dict.fromkeys(findings))[:5]


def _rank_risks(risks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(risks, key=lambda item: float(item.get("priority_score") or 0), reverse=True)


def _anti_hallucination_summary(evidence_results: list[dict[str, Any]], limitations: list[str]) -> str:
    missing: list[str] = []
    for result in evidence_results:
        missing.extend(str(field) for field in result.get("missing_fields") or [])
    missing = list(dict.fromkeys(missing))
    if missing:
        return f"当前数据缺少 {', '.join(missing)}，不能直接完成该字段口径的分析。"
    if limitations:
        return "当前数据字段不足，不能直接完成该分析，但可以使用替代口径继续。"
    return "当前请求已通过字段校验，可以继续做业务分析。"


def _next_questions(question_type: str) -> list[str]:
    common = [
        "需要我继续下钻最高风险对象的品类或渠道吗？",
        "要不要把本轮建议整理成一周行动计划？",
    ]
    typed = {
        "business_health_check": ["哪些地区是高收入高风险？", "哪些指标最需要持续监控？"],
        "risk_diagnosis": ["如果只能先处理一个风险，应该处理什么？", "这些风险可能来自哪些候选原因？"],
        "growth_opportunity": ["下季度最值得投入的 3 个对象是谁？", "这些机会需要设置哪些风险护栏？"],
        "anti_hallucination_field_check": ["是否改用渠道销售、退款率和满意度做替代分析？"],
        "follow_up_drilldown": ["是否继续按商品或渠道拆解上一轮对象？"],
    }
    return (typed.get(question_type) or []) + common


def _fallback_recommendations(
    question_type: str,
    evidence_summary: list[dict[str, Any]],
    limitations: list[str],
) -> list[dict[str, Any]]:
    """Build conservative action suggestions when evidence exists but no risk/opportunity item was emitted."""

    if not evidence_summary:
        return []
    first_summary = str(evidence_summary[0].get("summary") or "").strip()
    reason = first_summary or "The recommendation is based on the current deterministic evidence summary."
    defaults: dict[str, dict[str, str]] = {
        "customer_profile_analysis": {
            "target_object": "customer segments",
            "action": "Compare the top customer segment by sales and satisfaction, then run a small controlled promotion before expanding budget.",
            "monitoring_metric": "sales_amount + avg_order_value + refund_rate + avg_satisfaction_score",
            "expected_action_window": "next 2 weeks",
        },
        "trend_analysis": {
            "target_object": "latest trend period",
            "action": "Review the latest month against the prior month and set weekly monitoring for sales, refund rate, and gross margin.",
            "monitoring_metric": "monthly_sales + refund_rate + gross_margin_rate",
            "expected_action_window": "within 7 days",
        },
        "data_quality_check": {
            "target_object": "quality anomalies",
            "action": "Clean invalid sales, quantity, discount, shipping date, refund, satisfaction, and channel records before executive decisions.",
            "monitoring_metric": "anomaly_count + missing_rate",
            "expected_action_window": "within 3 days",
        },
        "business_review_summary": {
            "target_object": "review focus areas",
            "action": "Use the evidence summary to align revenue, risk, fulfillment, and customer experience owners before the review meeting.",
            "monitoring_metric": "total_sales + refund_rate + avg_shipping_days + avg_satisfaction_score",
            "expected_action_window": "before next business review",
        },
    }
    selected = defaults.get(
        question_type,
        {
            "target_object": "business evidence",
            "action": "Pick the top evidence item, assign an owner, and track sales, profit, refund, satisfaction, and fulfillment metrics together.",
            "monitoring_metric": "sales_amount + gross_margin_rate + refund_rate + avg_satisfaction_score + avg_shipping_days",
            "expected_action_window": "within 7 days",
        },
    )
    if limitations:
        reason = f"{reason} Data limitations should be checked before final decisions."
    return [
        {
            "priority": "P1",
            "target_object": selected["target_object"],
            "action": selected["action"],
            "monitoring_metric": selected["monitoring_metric"],
            "expected_action_window": selected["expected_action_window"],
            "reason": reason,
        }
    ]


def _find_result(evidence_results: list[dict[str, Any]], tool_name: str) -> dict[str, Any] | None:
    for result in evidence_results:
        if result.get("tool_name") == tool_name:
            return result
    return None
