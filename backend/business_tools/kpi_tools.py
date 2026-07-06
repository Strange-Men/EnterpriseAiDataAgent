"""Field, term, and KPI tools for M6 business analysis."""

from __future__ import annotations

import re

from database.db_manager import DatabaseManager

from backend.business_tools.models import BusinessTermMappingInput, FieldValidationInput, TableMetricsInput, ToolResult
from backend.business_tools.query_utils import compute_metrics_for_frame, load_table_frame, success_result
from backend.semantic import BUSINESS_TERM_MAPPINGS
from backend.semantic.field_validation import get_fallbacks_for_missing_fields


def validate_fields(input_data: FieldValidationInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    available = set(input_data.table_schema)
    valid_fields = [field for field in input_data.requested_fields if field in available]
    missing_fields = [field for field in input_data.requested_fields if field not in available]
    fallbacks = get_fallbacks_for_missing_fields(missing_fields)
    fallback_message = "；".join(fallback.alternative for fallback in fallbacks)
    if missing_fields and not fallback_message:
        fallback_message = "缺少请求字段，不能分析这些维度；请改用当前 schema 中可用字段。"
    return ToolResult(
        tool_name="validate_fields",
        status="partial" if missing_fields else "success",
        evidence_summary=f"字段校验完成：{len(valid_fields)} 个可用，{len(missing_fields)} 个缺失。",
        missing_fields=missing_fields,
        fallback_message=fallback_message,
        can_continue=bool(valid_fields) or bool(fallback_message),
        data={"valid_fields": valid_fields, "missing_fields": missing_fields},
    )


def map_business_terms(input_data: BusinessTermMappingInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    terms = list(input_data.terms)
    if input_data.question:
        terms.extend(term for term in BUSINESS_TERM_MAPPINGS if re.search(re.escape(term), input_data.question))
    unique_terms = list(dict.fromkeys(terms))
    available = set(input_data.available_fields)

    term_to_field: dict[str, list[str]] = {}
    term_to_metric: dict[str, str] = {}
    unmapped_terms: list[str] = []
    suggestions: dict[str, str] = {}
    for term in unique_terms:
        mapping = BUSINESS_TERM_MAPPINGS.get(term)
        if not mapping:
            unmapped_terms.append(term)
            continue
        fields = list(mapping["fields"])
        present_fields = [field for field in fields if not available or field in available]
        missing_fields = [field for field in fields if available and field not in available]
        term_to_field[term] = present_fields
        metric = str(mapping.get("metric") or "")
        if metric:
            term_to_metric[term] = metric
        if missing_fields:
            suggestions[term] = f"缺少字段 {', '.join(missing_fields)}，需要使用可用字段做替代分析。"

    return ToolResult(
        tool_name="map_business_terms",
        status="success" if not unmapped_terms else "partial",
        evidence_summary=f"业务术语映射完成：{len(term_to_field)} 个已映射，{len(unmapped_terms)} 个未映射。",
        fallback_message="；".join(suggestions.values()),
        data={
            "term_to_field": term_to_field,
            "term_to_metric": term_to_metric,
            "unmapped_terms": unmapped_terms,
            "fallback_suggestions": suggestions,
        },
    )


def compute_overall_kpis(input_data: TableMetricsInput, *, db_manager: DatabaseManager | None = None) -> ToolResult:
    df = load_table_frame(input_data.table_name, db_manager)
    metrics, values = compute_metrics_for_frame(df, input_data.metric_set or None)
    missing = sorted({field for metric in metrics for field in metric.missing_fields})
    result = success_result(
        "compute_overall_kpis",
        f"已计算 {input_data.table_name} 的整体经营 KPI，共 {len(df)} 行。",
        metrics=metrics,
        data={"kpis": values, "row_count": len(df)},
    )
    if missing:
        result.status = "partial"
        result.missing_fields = missing
        result.fallback_message = "部分指标字段缺失；可继续使用已计算指标做有限分析。"
    return result
