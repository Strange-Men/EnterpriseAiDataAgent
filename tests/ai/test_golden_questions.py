"""Golden Question Tests — AI SQL 质量回归测试。

每个 golden question 作为独立的 parametrized test case。
运行方式: pytest tests/ai/test_golden_questions.py -v
"""

import pytest
from tests.ai.golden_questions import GOLDEN_QUESTIONS, GoldenQuestion
from tests.ai.eval_sql import evaluate_sql


@pytest.mark.parametrize("golden", GOLDEN_QUESTIONS, ids=[q.id for q in GOLDEN_QUESTIONS])
def test_golden_question(golden: GoldenQuestion, ai_available, generate_fn, execute_fn):
    """每个 golden question 必须通过其 SQL 模式和结果检查。"""
    gen_result = generate_fn(golden.question, golden.table)
    sql = gen_result.get("sql", "")

    if sql and not sql.startswith("-- CANNOT_ANSWER"):
        exec_result = execute_fn(sql)
        exec_result["elapsed_ms"] = gen_result.get("elapsed_ms", 0)
    else:
        exec_result = {
            "columns": [],
            "data": [],
            "row_count": 0,
            "status": "success",
            "elapsed_ms": gen_result.get("elapsed_ms", 0),
        }

    result = evaluate_sql(golden, sql, exec_result)

    assert result.passed, (
        f"Failed: {golden.id}\n"
        f"Question: {golden.question}\n"
        f"SQL: {result.sql_generated[:200]}\n"
        f"Notes: {result.notes}\n"
        f"Pattern matches: {result.pattern_matches}\n"
        f"Pattern failures: {result.pattern_failures}"
    )


@pytest.mark.parametrize("golden", GOLDEN_QUESTIONS, ids=[q.id for q in GOLDEN_QUESTIONS])
def test_no_hallucination(golden: GoldenQuestion, ai_available, generate_fn):
    """每个 golden question 生成的 SQL 不应包含幻觉内容。"""
    if not golden.hallucination_check:
        pytest.skip("No hallucination check defined")

    gen_result = generate_fn(golden.question, golden.table)
    sql = gen_result.get("sql", "")

    assert golden.hallucination_check.upper() not in sql.upper(), (
        f"Hallucination detected in {golden.id}: '{golden.hallucination_check}' found in SQL\n"
        f"SQL: {sql[:200]}"
    )


def test_evaluation_summary(ai_available, generate_fn, execute_fn):
    """运行完整评估并检查汇总 pass rate。"""
    from tests.ai.runner import run_evaluation, format_report

    summary = run_evaluation(generate_fn, execute_fn)

    report = format_report(summary)
    print(f"\n{report}")

    assert summary.pass_rate >= 0.6, (
        f"Pass rate {summary.pass_rate * 100:.0f}% below threshold 60%\n{report}"
    )
    assert summary.hallucination_count == 0, (
        f"Detected {summary.hallucination_count} hallucinations\n{report}"
    )
