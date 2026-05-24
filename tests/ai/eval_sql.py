"""SQL Evaluation — 评估生成的 SQL 是否符合 golden question 预期。"""

from dataclasses import dataclass
from tests.ai.golden_questions import GoldenQuestion


@dataclass
class EvalResult:
    question_id: str
    passed: bool
    sql_generated: str
    pattern_matches: dict[str, bool]        # pattern -> found?
    pattern_failures: dict[str, bool]        # not_expected -> found? (should be False)
    column_check: bool                       # expected columns present in results?
    row_count_check: bool                    # row count in expected range?
    hallucination_detected: bool             # hallucinated column/table found?
    execution_error: str | None
    latency_ms: float
    notes: str = ""


def evaluate_sql(golden: GoldenQuestion, actual_sql: str, actual_result: dict) -> EvalResult:
    """评估生成的 SQL 是否符合 golden question 的预期。"""
    sql_upper = actual_sql.upper()
    result_columns = [c.lower() for c in actual_result.get("columns", [])]
    row_count = len(actual_result.get("data", []))
    exec_error = actual_result.get("error")
    latency_ms = actual_result.get("elapsed_ms", 0)

    # 1. 检查期望的 SQL 模式
    pattern_matches = {}
    for pattern in golden.expected_patterns:
        pattern_matches[pattern] = pattern.upper() in sql_upper

    # 2. 检查不应出现的模式
    pattern_failures = {}
    for pattern in golden.not_expected_patterns:
        found = pattern.upper() in sql_upper
        pattern_failures[pattern] = found  # True = 找到了不该出现的 = 问题

    # 3. 检查结果列
    column_check = True
    if golden.expected_columns:
        column_check = any(
            any(ec.lower() in rc for rc in result_columns)
            for ec in golden.expected_columns
        )

    # 4. 检查行数范围
    row_count_check = golden.min_rows <= row_count <= golden.max_rows

    # 5. 幻觉检测
    hallucination_detected = False
    if golden.hallucination_check:
        hallucination_detected = golden.hallucination_check.upper() in sql_upper

    # 6. 综合判断
    all_patterns_found = all(pattern_matches.values())
    no_bad_patterns = not any(pattern_failures.values())

    passed = (
        all_patterns_found
        and no_bad_patterns
        and column_check
        and row_count_check
        and not hallucination_detected
        and exec_error is None
    )

    notes_parts = []
    if not all_patterns_found:
        missing = [k for k, v in pattern_matches.items() if not v]
        notes_parts.append(f"Missing patterns: {missing}")
    if not no_bad_patterns:
        bad = [k for k, v in pattern_failures.items() if v]
        notes_parts.append(f"Found unwanted patterns: {bad}")
    if not column_check:
        notes_parts.append(f"Expected columns {golden.expected_columns} not in {result_columns}")
    if not row_count_check:
        notes_parts.append(f"Row count {row_count} not in [{golden.min_rows}, {golden.max_rows}]")
    if hallucination_detected:
        notes_parts.append(f"Hallucination: {golden.hallucination_check} found in SQL")
    if exec_error:
        notes_parts.append(f"Execution error: {exec_error[:200]}")

    return EvalResult(
        question_id=golden.id,
        passed=passed,
        sql_generated=actual_sql,
        pattern_matches=pattern_matches,
        pattern_failures=pattern_failures,
        column_check=column_check,
        row_count_check=row_count_check,
        hallucination_detected=hallucination_detected,
        execution_error=exec_error,
        latency_ms=latency_ms,
        notes="; ".join(notes_parts),
    )
