"""Deterministic intent router for the native EAI Agent path."""

from __future__ import annotations

import re
from collections.abc import Iterable

from backend.agent.contracts import IntentCategory, IntentRoute, SelectedMode


_UNSUPPORTED_PATTERNS = (
    "delete",
    "drop",
    "update",
    "insert",
    "alter",
    "create",
    "truncate",
    "remove table",
    "write back",
    "api key",
    "token",
    "credential",
    "connect production",
    "external database",
    "send email",
    "call external",
    "删除",
    "删表",
    "修改",
    "写入",
    "插入",
    "建表",
    "删掉",
    "密钥",
    "生产数据库",
    "外部数据库",
    "发送邮件",
    "调用外部",
)

_AMBIGUOUS_EXACT = {
    "",
    "分析一下",
    "看看",
    "看一下",
    "分析",
    "帮我看看",
    "帮我分析",
    "analyze",
    "check",
    "look",
}

_REPORT_LOOKUP_PATTERNS = (
    "history",
    "previous",
    "past analysis",
    "last report",
    "report",
    "detail",
    "历史",
    "之前",
    "上次",
    "报告",
    "详情",
)

_DATA_PREVIEW_PATTERNS = (
    "schema",
    "columns",
    "column",
    "row count",
    "missing",
    "null",
    "preview",
    "field",
    "字段",
    "列",
    "行数",
    "缺失值",
    "空值",
    "预览",
    "数据结构",
)

_SQL_PATTERNS = (
    "sql",
    "select",
    "where",
    "group by",
    "order by",
    "count",
    "sum",
    "average",
    "avg",
    "top",
    "rank",
    "filter",
    "query",
    "查询",
    "筛选",
    "过滤",
    "统计",
    "排名",
    "订单数",
    "大于",
    "小于",
)

_AGENT_ANALYSIS_PATTERNS = (
    "investigate",
    "compare",
    "trend",
    "why",
    "evidence",
    "multi-step",
    "root cause",
    "analysis plan",
    "deep analysis",
    "深入分析",
    "多步",
    "调查",
    "为什么",
    "原因",
    "趋势",
    "对比",
    "比较",
    "异常原因",
    "给出证据",
    "证据",
    "完整报告",
    "制定分析计划",
)

_SIMPLE_SUMMARY_PATTERNS = (
    "summary",
    "overview",
    "describe",
    "summarize",
    "总结",
    "概览",
    "这份数据讲了什么",
)


def normalize_goal(user_goal: str) -> str:
    """Normalize user input for deterministic keyword matching."""

    return re.sub(r"\s+", " ", (user_goal or "").strip().lower())


def route_intent(user_goal: str, *, table_name: str | None = None) -> IntentRoute:
    """Route a user goal into the lowest-sufficient EAI mode.

    This function is intentionally deterministic. It does not call a model,
    query a database, access the network, or execute tools.
    """

    normalized_goal = normalize_goal(user_goal)
    normalized_table = normalize_goal(table_name or "")

    unsupported_flags = _unsupported_flags(normalized_goal)
    if unsupported_flags:
        return IntentRoute(
            intent=IntentCategory.UNSUPPORTED,
            confidence=0.95,
            selected_mode=SelectedMode.UNSUPPORTED,
            route_reason="Request includes unsupported or unsafe action.",
            requires_agent=False,
            safety_flags=unsupported_flags,
        )

    if _is_ambiguous(normalized_goal, normalized_table):
        return IntentRoute(
            intent=IntentCategory.AMBIGUOUS,
            confidence=0.55,
            selected_mode=SelectedMode.CLARIFICATION,
            route_reason="Request is too broad or lacks enough table/task context.",
            requires_agent=False,
            safety_flags=["clarification_required"],
        )

    if _is_report_lookup(normalized_goal):
        return IntentRoute(
            intent=IntentCategory.REPORT_LOOKUP,
            confidence=0.88,
            selected_mode=SelectedMode.NATURAL_LANGUAGE,
            route_reason="Request asks for existing history, report, or detail.",
            requires_agent=False,
            safety_flags=[],
        )

    if _contains_any(normalized_goal, _DATA_PREVIEW_PATTERNS):
        return IntentRoute(
            intent=IntentCategory.DATA_PREVIEW,
            confidence=0.86,
            selected_mode=SelectedMode.NATURAL_LANGUAGE,
            route_reason="Request asks for schema, preview, row count, or missing-value information.",
            requires_agent=False,
            safety_flags=[],
        )

    if _contains_any(normalized_goal, _SQL_PATTERNS):
        return IntentRoute(
            intent=IntentCategory.SQL_QUESTION,
            confidence=0.84,
            selected_mode=SelectedMode.EXPERT_SQL,
            route_reason="Request maps to a focused SQL-style query.",
            requires_agent=False,
            safety_flags=[],
        )

    if _contains_any(normalized_goal, _AGENT_ANALYSIS_PATTERNS):
        return IntentRoute(
            intent=IntentCategory.AGENT_ANALYSIS,
            confidence=0.82,
            selected_mode=SelectedMode.AGENT_RUN,
            route_reason="Request needs multi-step analysis or evidence-based investigation.",
            requires_agent=True,
            safety_flags=[],
        )

    if _contains_any(normalized_goal, _SIMPLE_SUMMARY_PATTERNS):
        return IntentRoute(
            intent=IntentCategory.SIMPLE_SUMMARY,
            confidence=0.78,
            selected_mode=SelectedMode.NATURAL_LANGUAGE,
            route_reason="Request asks for a simple summary or overview.",
            requires_agent=False,
            safety_flags=[],
        )

    return IntentRoute(
        intent=IntentCategory.AMBIGUOUS,
        confidence=0.5,
        selected_mode=SelectedMode.CLARIFICATION,
        route_reason="No deterministic route matched; clarification is required.",
        requires_agent=False,
        safety_flags=["clarification_required"],
    )


def _contains_any(value: str, patterns: Iterable[str]) -> bool:
    return any(pattern in value for pattern in patterns)


def _is_report_lookup(value: str) -> bool:
    if _contains_any(value, _REPORT_LOOKUP_PATTERNS):
        return True
    return "记录" in value and _contains_any(value, ("历史", "之前", "上次", "报告", "详情"))


def _unsupported_flags(value: str) -> list[str]:
    flags: list[str] = []

    destructive_sql = ("drop", "delete", "update", "insert", "alter", "create", "truncate")
    credential_terms = ("api key", "token", "credential", "密钥")
    external_terms = ("external database", "connect production", "生产数据库", "外部数据库")
    external_action_terms = ("send email", "call external", "发送邮件", "调用外部")
    data_write_terms = ("删除", "删表", "修改", "写入", "插入", "建表", "删掉")

    if _contains_any(value, destructive_sql) or _contains_any(value, data_write_terms):
        flags.append("unsafe_write_or_destructive_action")
    if _contains_any(value, credential_terms):
        flags.append("credential_exposure_request")
    if _contains_any(value, external_terms):
        flags.append("external_database_request")
    if _contains_any(value, external_action_terms):
        flags.append("external_service_request")

    if not flags and _contains_any(value, _UNSUPPORTED_PATTERNS):
        flags.append("unsupported_action")

    return flags


def _is_ambiguous(normalized_goal: str, normalized_table: str) -> bool:
    if normalized_goal in _AMBIGUOUS_EXACT:
        return True
    if len(normalized_goal) < 4:
        return True
    if not normalized_table and normalized_goal in {"analyze it", "check data", "look at data"}:
        return True
    return False
