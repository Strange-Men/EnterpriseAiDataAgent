"""Analysis Diff Engine — 比较两个分析运行的结构化差异。

纯 Python 函数，不调用 LLM。比较 sections、SQL、metrics。
"""

from backend.services.shared_utils import truncate as _truncate


def diff_runs(run_a: dict, run_b: dict) -> dict:
    """比较两个分析运行，返回结构化 diff。

    Args:
        run_a: AnalysisRun 字典（旧版本）
        run_b: AnalysisRun 字典（新版本）

    Returns:
        结构化 diff 字典
    """
    sections_a = run_a.get("sections", [])
    sections_b = run_b.get("sections", [])
    sections_diff = _diff_sections(sections_a, sections_b)

    sql_diff = _diff_sql(run_a, run_b)
    metrics_diff = _diff_metrics(run_a, run_b)

    sections_added = sum(1 for s in sections_diff if s["change"] == "added")
    sections_removed = sum(1 for s in sections_diff if s["change"] == "removed")
    sections_changed = sum(1 for s in sections_diff if s["change"] == "changed")

    return {
        "run_a_id": run_a.get("id", "?"),
        "run_b_id": run_b.get("id", "?"),
        "summary": {
            "sections_added": sections_added,
            "sections_removed": sections_removed,
            "sections_changed": sections_changed,
            "sections_unchanged": sum(1 for s in sections_diff if s["change"] == "unchanged"),
            "sql_changed": sql_diff["changed"],
            "has_metrics_delta": any(
                v.get("delta", 0) != 0 for v in metrics_diff.values() if isinstance(v, dict)
            ),
        },
        "sections_diff": sections_diff,
        "sql_diff": sql_diff,
        "metrics_diff": metrics_diff,
    }


def _diff_sections(sections_a: list[dict], sections_b: list[dict]) -> list[dict]:
    """逐 section 对比。"""
    titles_a = {s.get("title", ""): s for s in sections_a}
    titles_b = {s.get("title", ""): s for s in sections_b}
    all_titles = list(dict.fromkeys(list(titles_a.keys()) + list(titles_b.keys())))

    result = []
    for title in all_titles:
        in_a = title in titles_a
        in_b = title in titles_b

        if in_a and not in_b:
            result.append({
                "title": title,
                "change": "removed",
                "old_content": _truncate(titles_a[title].get("content", ""), 500),
                "new_content": None,
            })
        elif not in_a and in_b:
            result.append({
                "title": title,
                "change": "added",
                "old_content": None,
                "new_content": _truncate(titles_b[title].get("content", ""), 500),
            })
        else:
            old_c = _truncate(titles_a[title].get("content", ""), 500)
            new_c = _truncate(titles_b[title].get("content", ""), 500)
            change = "unchanged" if old_c == new_c else "changed"
            result.append({
                "title": title,
                "change": change,
                "old_content": old_c if change != "unchanged" else None,
                "new_content": new_c if change != "unchanged" else None,
            })

    return result


def _diff_sql(run_a: dict, run_b: dict) -> dict:
    """对比 SQL（从 multiResult steps 或 sections 中提取）。"""
    sql_a = _extract_sql(run_a)
    sql_b = _extract_sql(run_b)
    return {
        "old": sql_a,
        "new": sql_b,
        "changed": sql_a != sql_b,
    }


def _extract_sql(run: dict) -> str | None:
    """从 run 中提取 SQL。优先 multiResult steps，其次 sections。"""
    multi = run.get("multiResult")
    if multi and isinstance(multi, dict):
        steps = multi.get("steps", [])
        sqls = [s.get("sql") for s in steps if s.get("sql")]
        if sqls:
            return "\n---\n".join(sqls)

    for sec in run.get("sections", []):
        if sec.get("type") == "sql":
            return sec.get("content", "")

    return None


def _diff_metrics(run_a: dict, run_b: dict) -> dict:
    """对比关键 metrics。"""
    trace_a = run_a.get("trace") or {}
    trace_b = run_b.get("trace") or {}

    tokens_a = trace_a.get("total_output_tokens", 0)
    tokens_b = trace_b.get("total_output_tokens", 0)

    calls_a = trace_a.get("total_llm_calls", 0)
    calls_b = trace_b.get("total_llm_calls", 0)

    # Row count from multiResult or sections
    rows_a = _estimate_row_count(run_a)
    rows_b = _estimate_row_count(run_b)

    return {
        "tokens": {"old": tokens_a, "new": tokens_b, "delta": tokens_b - tokens_a},
        "llm_calls": {"old": calls_a, "new": calls_b, "delta": calls_b - calls_a},
        "row_count": {"old": rows_a, "new": rows_b, "delta": rows_b - rows_a},
    }


def _estimate_row_count(run: dict) -> int:
    """从 multiResult steps 估算总行数。"""
    multi = run.get("multiResult")
    if multi and isinstance(multi, dict):
        steps = multi.get("steps", [])
        return sum(s.get("row_count", 0) for s in steps if isinstance(s, dict))
    return 0


