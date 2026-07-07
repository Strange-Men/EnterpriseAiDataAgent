"""Root-cause hypothesis and recommendation builder tools."""

from __future__ import annotations

from database.db_manager import DatabaseManager

from backend.business_tools.models import RecommendationInput, RecommendationItem, RootCauseInput, ToolResult
from backend.business_tools.query_utils import success_result


def root_cause_hypothesis(input_data: RootCauseInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    candidates = []
    for risk in input_data.risks:
        evidence = risk.evidence
        causes = []
        if float(evidence.get("avg_discount") or 0) > 0.35:
            causes.append({"cause": "可能与高折扣促销依赖有关", "confidence": 0.72, "supporting_evidence": {"avg_discount": evidence.get("avg_discount")}})
        if float(evidence.get("avg_shipping_days") or 0) > 4.5 or int(evidence.get("delayed_order_count") or 0) > 0:
            causes.append({"cause": "候选原因：履约时效偏慢影响体验", "confidence": 0.68, "supporting_evidence": {"avg_shipping_days": evidence.get("avg_shipping_days"), "delayed_order_count": evidence.get("delayed_order_count")}})
        if float(evidence.get("complaint_rate") or 0) > 0.06 or float(evidence.get("avg_satisfaction_score") or 5) < 4.1:
            causes.append({"cause": "可能与客户体验或服务问题有关", "confidence": 0.66, "supporting_evidence": {"complaint_rate": evidence.get("complaint_rate"), "avg_satisfaction_score": evidence.get("avg_satisfaction_score")}})
        if float(evidence.get("refund_rate") or 0) > 0.08:
            causes.append({"cause": "候选原因：售后或质量问题导致退款偏高", "confidence": 0.7, "supporting_evidence": {"refund_rate": evidence.get("refund_rate"), "refund_amount": evidence.get("total_refund_amount")}})
        if not causes:
            causes.append({"cause": "可能由价格、品类、渠道或服务因素共同造成，需要继续下钻验证", "confidence": 0.45, "supporting_evidence": evidence})
        candidates.append({"risk_name": risk.risk_name, "candidate_causes": causes})
    return success_result("root_cause_hypothesis", "已生成候选原因；所有结论均使用“可能 / 候选原因”表述，未输出确定性根因。", data={"candidate_causes": candidates})


def recommendation_builder(input_data: RecommendationInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    recommendations: list[RecommendationItem] = []
    for risk in input_data.risks[:5]:
        target = risk.risk_name.split(":", 1)[-1].strip()
        metric = "refund_rate"
        metrics = ["退款率", "投诉率", "满意度", "退货原因 Top 3"]
        action = f"优先排查 {target} 的退款和售后问题"
        why = risk.reason or f"{target} 已被识别为风险对象，说明收入、退款、投诉或体验指标之间可能存在不健康组合。"
        how = f"先抽取 {target} 近 7 天相关订单，按品类、商品和退货原因分组，找出退款和投诉最集中的问题来源。"
        deadline = "建议 1 周内完成初查"
        owner_hint = "运营 / 售后 / 商品负责人"
        if "促销" in risk.risk_name:
            metric = "avg_discount + gross_margin_rate"
            metrics = ["平均折扣", "毛利率", "销售额", "退款率"]
            action = f"暂停对 {target} 追加大额促销预算"
            how = f"先复核 {target} 的折扣门槛、毛利底线和活动商品组合，把低毛利高折扣对象从主推清单中单独标记。"
            owner_hint = "运营 / 财务 / 商品负责人"
        elif "履约" in risk.risk_name:
            metric = "avg_shipping_days + complaint_rate"
            metrics = ["平均发货周期", "超 7 天订单数", "投诉率", "满意度"]
            action = f"优先排查 {target} 的仓配履约链路"
            how = f"列出 {target} 超过 7 天发货的订单，按仓库、地区和商品分组，设定每日清零目标并同步客服安抚话术。"
            owner_hint = "仓配 / 物流 / 客服负责人"
        recommendations.append(
            RecommendationItem(
                priority="high" if risk.risk_level == "high" else "medium",
                target_object=target,
                action=action,
                why=why,
                how=how,
                metrics=metrics,
                deadline=deadline,
                owner_hint=owner_hint,
                monitoring_metric=metric,
                expected_action_window="within 7 days",
                reason=risk.reason,
            )
        )
    for opportunity in input_data.opportunities[:3]:
        recommendations.append(
            RecommendationItem(
                priority="medium",
                target_object=opportunity.object_name,
                action=f"对 {opportunity.object_name} 做小流量加投或资源倾斜试点",
                why=opportunity.reason or f"{opportunity.object_name} 在销售、利润或体验指标上具备增长候选价值。",
                how=f"先选择 {opportunity.object_name} 的 1-2 个代表商品或地区做两周试点，同时设置退款率、折扣率和满意度护栏。",
                metrics=["销售额", "毛利率", "退款率", "满意度"],
                deadline="建议 2-4 周内完成试点复盘",
                owner_hint="运营 / 商品 / 增长负责人",
                monitoring_metric="sales_amount + gross_margin_rate + refund_rate + avg_satisfaction_score",
                expected_action_window="next 2-4 weeks",
                reason=opportunity.reason,
            )
        )
    return ToolResult(
        tool_name="recommendation_builder",
        status="success",
        evidence_summary=f"已生成 {len(recommendations)} 条可执行建议，包含优先级、对象、监控指标和行动窗口。",
        recommendations=recommendations,
        data={"recommendations": [item.model_dump(mode="json") for item in recommendations]},
    )
