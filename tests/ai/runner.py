"""Evaluation Runner — 运行 golden questions 并汇总评估结果。"""

import time
from dataclasses import dataclass

from tests.ai.golden_questions import GoldenQuestion, GOLDEN_QUESTIONS
from tests.ai.eval_sql import EvalResult, evaluate_sql


@dataclass
class EvalSummary:
    total: int
    passed: int
    failed: int
    pass_rate: float
    hallucination_count: int
    avg_latency_ms: float
    results: list[EvalResult]
    by_category: dict[str, dict]


def run_evaluation(
    generate_fn,
    execute_fn,
    questions: list[GoldenQuestion] | None = None,
) -> EvalSummary:
    """运行所有 golden questions，返回汇总指标。

    Args:
        generate_fn: (question, table) -> {"sql": str, "status": str, "error": str}
        execute_fn: (sql) -> {"columns": list, "data": list, "row_count": int, "status": str, "error": str}
        questions: 要评估的问题列表，默认使用全部 GOLDEN_QUESTIONS
    """
    if questions is None:
        questions = GOLDEN_QUESTIONS

    results: list[EvalResult] = []

    for golden in questions:
        start = time.time()
        try:
            gen_result = generate_fn(golden.question, golden.table)
            sql = gen_result.get("sql", "")
            elapsed = (time.time() - start) * 1000

            if gen_result.get("status") == "error":
                results.append(EvalResult(
                    question_id=golden.id,
                    passed=False,
                    sql_generated=sql,
                    pattern_matches={},
                    pattern_failures={},
                    column_check=False,
                    row_count_check=False,
                    hallucination_detected=False,
                    execution_error=gen_result.get("error", "Generation failed"),
                    latency_ms=elapsed,
                    notes="SQL generation failed",
                ))
                continue

            # 执行 SQL（如果生成成功且不是 CANNOT_ANSWER）
            if sql and not sql.startswith("-- CANNOT_ANSWER"):
                exec_result = execute_fn(sql)
                exec_result["elapsed_ms"] = elapsed
            else:
                exec_result = {
                    "columns": [],
                    "data": [],
                    "row_count": 0,
                    "status": "success",
                    "elapsed_ms": elapsed,
                }

            result = evaluate_sql(golden, sql, exec_result)
            results.append(result)

        except Exception as e:
            elapsed = (time.time() - start) * 1000
            results.append(EvalResult(
                question_id=golden.id,
                passed=False,
                sql_generated="",
                pattern_matches={},
                pattern_failures={},
                column_check=False,
                row_count_check=False,
                hallucination_detected=False,
                execution_error=str(e),
                latency_ms=elapsed,
                notes=f"Exception: {str(e)[:200]}",
            ))

    # 汇总
    passed = sum(1 for r in results if r.passed)
    failed = len(results) - passed
    hallucination_count = sum(1 for r in results if r.hallucination_detected)
    avg_latency = sum(r.latency_ms for r in results) / max(len(results), 1)

    # 按类别汇总
    by_category: dict[str, dict] = {}
    for golden, result in zip(questions, results):
        cat = golden.category
        if cat not in by_category:
            by_category[cat] = {"total": 0, "passed": 0, "failed": 0}
        by_category[cat]["total"] += 1
        if result.passed:
            by_category[cat]["passed"] += 1
        else:
            by_category[cat]["failed"] += 1

    return EvalSummary(
        total=len(results),
        passed=passed,
        failed=failed,
        pass_rate=round(passed / max(len(results), 1), 2),
        hallucination_count=hallucination_count,
        avg_latency_ms=round(avg_latency, 2),
        results=results,
        by_category=by_category,
    )


def format_report(summary: EvalSummary) -> str:
    """格式化评估报告为人类可读文本。"""
    lines = [
        "=" * 60,
        "AI SQL Evaluation Report",
        "=" * 60,
        f"Total: {summary.total}  |  Passed: {summary.passed}  |  Failed: {summary.failed}",
        f"Pass Rate: {summary.pass_rate * 100:.0f}%",
        f"Hallucinations: {summary.hallucination_count}",
        f"Avg Latency: {summary.avg_latency_ms:.0f}ms",
        "",
        "By Category:",
    ]
    for cat, stats in sorted(summary.by_category.items()):
        lines.append(f"  {cat}: {stats['passed']}/{stats['total']} passed")
    lines.append("")

    failed_results = [r for r in summary.results if not r.passed]
    if failed_results:
        lines.append("Failed Questions:")
        for r in failed_results:
            lines.append(f"  [{r.question_id}] {r.notes}")
            if r.sql_generated:
                lines.append(f"    SQL: {r.sql_generated[:100]}")

    lines.append("=" * 60)
    return "\n".join(lines)


def format_markdown_report(summary: EvalSummary) -> str:
    """Format evaluation summary as a Markdown report for release artifacts."""
    lines = [
        "# AI SQL Golden Evaluation Report",
        "",
        "## Summary",
        "",
        f"- Total: {summary.total}",
        f"- Passed: {summary.passed}",
        f"- Failed: {summary.failed}",
        f"- Pass rate: {summary.pass_rate * 100:.0f}%",
        f"- Hallucinations: {summary.hallucination_count}",
        f"- Average latency: {summary.avg_latency_ms:.0f}ms",
        "",
        "## By Category",
        "",
        "| Category | Passed | Total | Pass Rate |",
        "|---|---:|---:|---:|",
    ]
    for category, stats in sorted(summary.by_category.items()):
        total = max(stats["total"], 1)
        lines.append(
            f"| {category} | {stats['passed']} | {stats['total']} | {stats['passed'] / total * 100:.0f}% |"
        )

    lines.extend([
        "",
        "## Questions",
        "",
        "| Question ID | Status | Latency | Notes |",
        "|---|---|---:|---|",
    ])
    for result in summary.results:
        status = "PASS" if result.passed else "FAIL"
        notes = (result.notes or "").replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {result.question_id} | {status} | {result.latency_ms:.0f}ms | {notes} |")

    failed_results = [r for r in summary.results if not r.passed]
    if failed_results:
        lines.extend(["", "## Failed SQL", ""])
        for result in failed_results:
            lines.extend([
                f"### {result.question_id}",
                "",
                f"- Notes: {result.notes}",
                f"- Execution error: {result.execution_error or 'None'}",
                "",
                "```sql",
                result.sql_generated or "-- No SQL generated",
                "```",
                "",
            ])

    return "\n".join(lines)
