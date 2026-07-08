"""Business-report view model normalization for UI and exports.

This module is intentionally presentation-focused. It does not route intent,
plan tools, execute SQL, or generate ranking data tables.
"""

from __future__ import annotations

import re
from typing import Any


SUPPORTED_LOCALES = {"zh-CN", "en-US"}
CJK_RE = re.compile(r"[\u4e00-\u9fff]")


def normalize_locale(value: Any) -> str:
    text = str(value or "").strip().lower().replace("_", "-")
    if text in {"en", "en-us", "enus"}:
        return "en-US"
    if text in {"zh", "zh-cn", "zhcn", "cn"}:
        return "zh-CN"
    return "zh-CN"


def build_business_report_view_model(
    report: dict[str, Any] | None,
    *,
    locale: str = "zh-CN",
    provider_status: Any = None,
    is_simulated: bool = False,
    fallback_reason: str | None = None,
) -> dict[str, Any]:
    """Build a localized, business-facing view model from business_report."""

    normalized_locale = normalize_locale(locale)
    english = normalized_locale == "en-US"
    source = report if isinstance(report, dict) else {}
    labels = _labels(english)

    actions = _priority_actions(source.get("recommendations"), english)
    risks = _business_lines(
        _as_list(source.get("risk_priorities"))
        + _as_list(source.get("opportunities"))
        + _as_list(source.get("key_findings")),
        english,
        max_items=5,
        prefer_opportunity=True,
    )
    evidence = _business_lines(source.get("evidence_summary"), english, max_items=5)
    limitations = _business_lines(source.get("limitations"), english, max_items=5, fallback_for_empty=False)
    next_questions = _business_lines(source.get("next_questions"), english, max_items=3, fallback_for_empty=False)

    provider_status_text = str(getattr(provider_status, "value", provider_status) or "")
    provider_notice = _provider_notice(
        status=provider_status_text,
        is_simulated=is_simulated,
        fallback_reason=fallback_reason,
        english=english,
    )
    sections = [
        {"id": "overall_assessment", "title": labels["overall"]},
        {"id": "priority_actions", "title": labels["actions"]},
        {"id": "risks_and_opportunities", "title": labels["risks"]},
        {"id": "key_evidence", "title": labels["evidence"]},
        {"id": "limitations", "title": labels["limitations"]},
        {"id": "next_questions", "title": labels["next"]},
        {"id": "technical_note", "title": labels["technical"]},
    ]

    return {
        "title": labels["title"],
        "locale": normalized_locale,
        "provider_badge": _provider_badge(provider_status_text, english),
        "provider_notice": provider_notice,
        "is_simulated": bool(is_simulated),
        "sections": sections,
        "overall_assessment": _overall_assessment(source.get("executive_summary"), english),
        "priority_actions": actions,
        "risks_and_opportunities": risks,
        "key_evidence": evidence,
        "limitations": limitations,
        "next_questions": next_questions,
        "technical_note": labels["technical_note"],
        "data_table": None,
    }


def business_report_from_view_model(view_model: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert the view model into the legacy business_report shape."""

    if not isinstance(view_model, dict):
        return None
    return {
        "executive_summary": view_model.get("overall_assessment"),
        "key_findings": list(view_model.get("risks_and_opportunities") or [])[:5],
        "evidence_summary": [{"summary": item} for item in list(view_model.get("key_evidence") or [])[:5]],
        "risk_priorities": list(view_model.get("risks_and_opportunities") or [])[:5],
        "opportunities": [],
        "recommendations": list(view_model.get("priority_actions") or [])[:3],
        "next_questions": list(view_model.get("next_questions") or [])[:3],
        "limitations": list(view_model.get("limitations") or [])[:5],
    }


TECHNICAL_PATTERNS = [
    r"字段校验完成",
    r"业务术语映射完成",
    r"动态\s*p90",
    r"dynamic\s*p90",
    r"top\s*/\s*bottom evidence",
    r"\btop\b.*\bbottom\b.*\bevidence\b",
    r"\btool_calls?\b",
    r"\btrace\b",
    r"\braw[_\s-]*json\b",
    r"\bsql\b",
    r"\bobject_type\b",
    r"\bobject_name\b",
    r"\bscore\b",
    r"\bevidence dict\b",
    r"\bimpact\b",
    r"\bseverity\b",
    r"\bconfidence\b",
    r"\bvalidate_fields\b",
    r"\bmap_business_terms\b",
    r"\bbusiness_tool\b",
    r"已按.*返回",
]

FIELD_LABELS_ZH = {
    "sales_amount": "销售额",
    "total_sales": "销售额",
    "order_count": "订单数",
    "refund_amount": "退款金额",
    "refund_rate": "退款率",
    "return_rate": "退货率",
    "gross_margin_rate": "毛利率",
    "avg_discount": "平均折扣",
    "avg_shipping_days": "平均发货周期",
    "shipping_days": "发货周期",
    "complaint_rate": "投诉率",
    "complaint_count": "投诉量",
    "avg_satisfaction_score": "满意度",
    "satisfaction_score": "满意度",
    "ad_channel": "渠道",
    "city_level": "城市等级",
    "customer_segment": "客户分层",
}

FIELD_LABELS_EN = {
    "sales_amount": "sales",
    "total_sales": "sales",
    "order_count": "order count",
    "refund_amount": "refund amount",
    "refund_rate": "refund rate",
    "return_rate": "return rate",
    "gross_margin_rate": "gross margin rate",
    "avg_discount": "average discount",
    "avg_shipping_days": "average shipping days",
    "shipping_days": "shipping days",
    "complaint_rate": "complaint rate",
    "complaint_count": "complaints",
    "avg_satisfaction_score": "satisfaction",
    "satisfaction_score": "satisfaction",
    "ad_channel": "channel",
    "city_level": "city tier",
    "customer_segment": "customer segment",
}


def _labels(english: bool) -> dict[str, str]:
    if english:
        return {
            "title": "Business Diagnosis Report",
            "overall": "Overall Assessment",
            "actions": "Priority Actions",
            "risks": "Main Risks and Opportunities",
            "evidence": "Key Evidence",
            "limitations": "Data Limitations",
            "next": "Follow-up Questions",
            "technical": "Technical Note",
            "technical_note": "This report hides SQL, trace, tool calls, and raw JSON.",
        }
    return {
        "title": "业务健康度诊断报告",
        "overall": "总体判断",
        "actions": "最优先的 3 条行动建议",
        "risks": "主要风险与机会",
        "evidence": "关键数据依据",
        "limitations": "数据局限",
        "next": "下一步可以继续问",
        "technical": "技术说明",
        "technical_note": "本报告已隐藏 SQL、trace、tool calls 和原始 JSON。",
    }


def _provider_badge(status: str, english: bool) -> dict[str, str]:
    normalized = status.strip().lower() or "mock"
    labels_en = {
        "live_success": "Live model",
        "mock": "Demo mode",
        "fallback": "Model fallback result",
        "error": "Model error",
    }
    labels_zh = {
        "live_success": "真实模型",
        "mock": "演示模式",
        "fallback": "模拟分析结果",
        "error": "模型失败",
    }
    labels = labels_en if english else labels_zh
    return {"status": normalized, "label": labels.get(normalized, labels["mock"])}


def _provider_notice(
    *,
    status: str,
    is_simulated: bool,
    fallback_reason: str | None,
    english: bool,
) -> dict[str, str] | None:
    normalized = status.strip().lower()
    if normalized == "live_success" and not is_simulated:
        return None
    if normalized == "error":
        return {
            "type": "error",
            "title": "Model call failed" if english else "模型调用失败",
            "message": "Model call failed. Please check the configuration or try again later."
            if english
            else "模型调用失败，请检查配置或稍后重试。",
        }
    if normalized == "fallback":
        reason = _clean_text(fallback_reason, english) or (
            "The live model did not return successfully."
            if english
            else "真实模型未成功返回。"
        )
        return {
            "type": "fallback",
            "title": "Model fallback result" if english else "模拟分析结果",
            "message": (
                f"Model fallback result. The live model did not return successfully, so the system switched to a simulated analysis result. Reason: {reason}"
                if english
                else f"当前为模拟分析结果，仅供参考。原因：真实模型未成功返回，已切换为模拟分析结果。{reason}"
            ),
        }
    if normalized == "mock" or is_simulated:
        return {
            "type": "mock",
            "title": "Demo mode" if english else "演示模式",
            "message": (
                "Demo mode. This result is generated by the mock analysis path and is suitable for product demonstration."
                if english
                else "当前为演示模式结果，适合产品演示，不代表真实模型回答。"
            ),
        }
    return None


def _overall_assessment(value: Any, english: bool) -> str:
    clean = _clean_text(value, english)
    if clean:
        return clean
    return (
        "The report summarizes the current business condition using available operating evidence."
        if english
        else "本报告基于当前可用经营证据汇总业务状态。"
    )


def _priority_actions(value: Any, english: bool) -> list[dict[str, Any]]:
    raw_items = _as_list(value)
    actions: list[dict[str, Any]] = []
    for item in raw_items:
        action = _recommendation(item, english)
        if action["action"]:
            actions.append(action)
    if not actions:
        actions.append(_default_action(english))
    return _dedupe_dicts(actions, "action")[:3]


def _recommendation(item: Any, english: bool) -> dict[str, Any]:
    if not isinstance(item, dict):
        action = _clean_text(item, english)
        if not action:
            return _default_action(english)
        default = _default_action(english)
        default["action"] = action
        return default
    default = _default_action(english)
    return {
        "priority": _clean_text(item.get("priority"), english) or default["priority"],
        "action": _clean_text(item.get("action") or item.get("recommendation") or item.get("title"), english) or default["action"],
        "why": _clean_text(item.get("why") or item.get("reason"), english) or default["why"],
        "how": _clean_text(item.get("how"), english) or default["how"],
        "metrics": _text_list(item.get("metrics") or item.get("monitoring_metric"), english) or default["metrics"],
        "deadline": _clean_text(item.get("deadline") or item.get("expected_action_window"), english) or default["deadline"],
        "owner_hint": _clean_text(item.get("owner_hint") or item.get("owner"), english) or default["owner_hint"],
    }


def _default_action(english: bool) -> dict[str, Any]:
    if english:
        return {
            "priority": "medium",
            "action": "Review the highest-priority business risk.",
            "why": "The current evidence points to operating signals that need focused follow-up.",
            "how": "Break the issue down by region, channel, category, and return reason, then assign one owner for the first review.",
            "metrics": ["sales", "refund rate", "gross margin", "satisfaction"],
            "deadline": "Complete the first review within 1 week.",
            "owner_hint": "Operations / After-sales / Product owner",
        }
    return {
        "priority": "medium",
        "action": "优先排查退款和投诉较高的业务对象",
        "why": "当前数据提示部分渠道、地区或品类可能存在退款和体验压力，需要进一步确认。",
        "how": "先导出相关订单明细，按渠道、地区、品类和退货原因分组，找出问题最集中的对象。",
        "metrics": ["退款率", "投诉率", "满意度", "退货原因"],
        "deadline": "建议 1 周内完成初步排查",
        "owner_hint": "运营 / 售后 / 商品负责人",
    }


def _business_lines(
    value: Any,
    english: bool,
    *,
    max_items: int,
    fallback_for_empty: bool = True,
    prefer_opportunity: bool = False,
) -> list[str]:
    lines: list[str] = []
    for item in _as_list(value):
        text = _opportunity_text(item, english) if prefer_opportunity and isinstance(item, dict) else _clean_text(item, english)
        if text:
            lines.append(text)
    lines = _dedupe_text(lines)[:max_items]
    if lines or not fallback_for_empty:
        return lines
    return [
        "The analysis uses sales, orders, refunds, margin, fulfillment, and customer-experience signals where available."
        if english
        else "本次分析使用了销售额、订单量、退款、利润、物流和客户体验等关键字段。"
    ]


def _opportunity_text(item: dict[str, Any], english: bool) -> str:
    title = _clean_text(
        item.get("opportunity")
        or item.get("risk_name")
        or item.get("title")
        or item.get("summary")
        or item.get("object_name")
        or item.get("name"),
        english,
    )
    if not title:
        return ""
    if item.get("object_name") or item.get("object_type") or item.get("score") is not None:
        obj = _clean_text(item.get("object_name") or title, english) or title
        if english:
            return (
                f"Opportunity: {obj}. Why it matters: it has meaningful business volume and should be evaluated with refund, margin, and satisfaction guardrails. "
                "Suggested action: run a small controlled test before scaling investment."
            )
        return (
            f"机会对象：{obj}。为什么是机会：该对象具备一定业务规模，需要结合退款率、毛利率和满意度设置护栏。"
            "建议动作：先选择代表商品或渠道做小流量试点。"
        )
    reason = _clean_text(item.get("reason") or item.get("why"), english)
    return f"{title}。{reason}" if reason and not english else f"{title}. {reason}" if reason else title


def _clean_text(value: Any, english: bool) -> str:
    text = _stringify(value).replace("\r", " ").replace("\n", " ").strip()
    if not text:
        return ""
    for pattern in TECHNICAL_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            return ""
    labels = FIELD_LABELS_EN if english else FIELD_LABELS_ZH
    for raw, label in labels.items():
        text = re.sub(rf"\b{re.escape(raw)}\b", label, text, flags=re.IGNORECASE)
    text = re.sub(r"\bunsupported\b", "The current data does not support this analysis directly." if english else "当前数据不支持直接分析该问题。", text, flags=re.IGNORECASE)
    if english:
        text = _replace_chinese_business_terms(text)
        if CJK_RE.search(text):
            return ""
    return " ".join(text.split()).strip()


def _replace_chinese_business_terms(text: str) -> str:
    replacements = {
        "退款率": "refund rate",
        "建议负责人": "suggested owner",
        "具体怎么做": "how to do it",
        "看什么指标": "metrics to watch",
        "建议周期": "suggested timeline",
        "暂无": "Not available",
        "数据局限": "Data limitations",
        "下一步可以继续问": "Follow-up questions",
        "当前为模拟分析结果": "This is a simulated analysis result",
        "真实模型未成功返回": "The live model did not return successfully",
    }
    result = text
    for zh, en in replacements.items():
        result = result.replace(zh, en)
    return result


def _text_list(value: Any, english: bool) -> list[str]:
    if isinstance(value, list):
        raw = value
    elif isinstance(value, str):
        raw = re.split(r"[,/、，+]", value)
    else:
        raw = [value]
    return _dedupe_text([_clean_text(item, english) for item in raw if _clean_text(item, english)])


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _stringify(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float, bool)):
        return str(value)
    if isinstance(value, dict):
        for key in ("summary", "title", "finding", "risk_name", "opportunity", "action", "question", "limitation", "name"):
            text = _stringify(value.get(key)).strip()
            if text:
                return text
        return ""
    if isinstance(value, list):
        return ", ".join(_stringify(item) for item in value if _stringify(item))
    return str(value)


def _dedupe_text(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        key = item.lower().strip()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item)
    return result


def _dedupe_dicts(items: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    seen: set[str] = set()
    result: list[dict[str, Any]] = []
    for item in items:
        marker = str(item.get(key) or "").lower().strip()
        if not marker or marker in seen:
            continue
        seen.add(marker)
        result.append(item)
    return result
