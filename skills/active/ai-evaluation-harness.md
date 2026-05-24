# Skill: AI Evaluation Harness

## 概述

Golden Questions 回归测试框架 — 定义期望结果，自动评估 AI SQL 生成质量，检测回归和幻觉。

## 核心组件

### GoldenQuestion

```python
@dataclass
class GoldenQuestion:
    id: str                         # 唯一标识
    question: str                   # 自然语言问题
    table: str                      # 目标表
    expected_patterns: list[str]    # SQL 中应出现的模式
    not_expected_patterns: list[str]  # SQL 中不应出现的模式
    expected_columns: list[str]     # 结果应包含的列
    min_rows / max_rows: int        # 行数范围
    category: str                   # 分组类别
    hallucination_check: str | None  # 幻觉检测目标
```

### EvalResult

```python
@dataclass
class EvalResult:
    question_id: str
    passed: bool
    sql_generated: str
    pattern_matches: dict[str, bool]
    pattern_failures: dict[str, bool]
    column_check: bool
    row_count_check: bool
    hallucination_detected: bool
    execution_error: str | None
    latency_ms: float
```

### Evaluation Runner

```python
def run_evaluation(generate_fn, execute_fn, questions=None) -> EvalSummary:
    # 对每个 golden question:
    #   1. generate_fn(question, table) -> sql
    #   2. execute_fn(sql) -> result
    #   3. evaluate_sql(golden, sql, result) -> EvalResult
    # 汇总: pass_rate, hallucination_count, avg_latency, by_category
```

## Golden Questions 覆盖范围

| 类别 | 数量 | 覆盖内容 |
|------|------|---------|
| basic | 2 | COUNT, SELECT+LIMIT |
| aggregation | 3 | GROUP BY + SUM/COUNT/AVG |
| sorting | 2 | TOP N, BOTTOM N |
| filtering | 2 | WHERE, DATE filter |
| window | 1 | RANK OVER |
| subquery | 1 | HAVING + AVG 比较 |
| hallucination | 2 | 虚假列名/表名检测 |
| edge_case | 2 | 空结果, DISTINCT |

## 运行方式

```bash
# 运行全部 golden questions
pytest tests/ai/test_golden_questions.py -v

# 运行单个测试
pytest tests/ai/test_golden_questions.py::test_golden_question[basic-count] -v

# 运行汇总评估
pytest tests/ai/test_golden_questions.py::test_evaluation_summary -v -s
```

## 添加新 Question

1. 在 `tests/ai/golden_questions.py` 定义新的 `GoldenQuestion`
2. 添加到 `GOLDEN_QUESTIONS` 列表
3. 运行 `pytest tests/ai/test_golden_questions.py -v` 验证

## 关键约束

- 测试需要有效的 ANTHROPIC_API_KEY（无 key 时 skip）
- 评估使用真实 API 调用（非 mock），因此有延迟和成本
- pass_rate 阈值: 60%（初期），应逐步提高
- hallucination_count 必须为 0
