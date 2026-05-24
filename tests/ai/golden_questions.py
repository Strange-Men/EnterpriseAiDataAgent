"""Golden Questions — AI SQL 评估测试集。

每个 GoldenQuestion 定义自然语言问题、期望的 SQL 模式、不应出现的模式、
期望的列名、行数范围等，用于回归测试和质量评估。
"""

from dataclasses import dataclass, field


@dataclass
class GoldenQuestion:
    id: str
    question: str
    table: str
    expected_patterns: list[str]           # SQL 中应该出现的模式
    not_expected_patterns: list[str]       # SQL 中不应出现的模式
    expected_columns: list[str]            # 结果应包含的列名（小写匹配）
    min_rows: int = 1
    max_rows: int = 10000
    category: str = "general"
    description: str = ""
    hallucination_check: str | None = None  # SQL 中不应出现的表/列名


# ── 基础查询 ──────────────────────────────────────────────────────

BASIC_COUNT = GoldenQuestion(
    id="basic-count",
    question="How many rows are in the table?",
    table="sales_data",
    expected_patterns=["COUNT"],
    not_expected_patterns=["GROUP BY", "ORDER BY"],
    expected_columns=["count", "cnt", "total"],
    min_rows=1,
    max_rows=1,
    category="basic",
    description="Simple row count",
)

BASIC_SELECT = GoldenQuestion(
    id="basic-select",
    question="Show me all columns from the first 10 rows",
    table="sales_data",
    expected_patterns=["SELECT", "LIMIT"],
    not_expected_patterns=[],
    expected_columns=[],
    min_rows=1,
    max_rows=10,
    category="basic",
    description="Basic SELECT with LIMIT",
)

# ── 聚合查询 ──────────────────────────────────────────────────────

GROUP_BY_SUM = GoldenQuestion(
    id="group-by-sum",
    question="Show total sales by region",
    table="sales_data",
    expected_patterns=["GROUP BY", "SUM", "region"],
    not_expected_patterns=[],
    expected_columns=["region", "total", "sum"],
    min_rows=1,
    category="aggregation",
    description="GROUP BY with SUM",
)

GROUP_BY_COUNT = GoldenQuestion(
    id="group-by-count",
    question="How many records are there per category?",
    table="sales_data",
    expected_patterns=["GROUP BY", "COUNT", "category"],
    not_expected_patterns=[],
    expected_columns=["category", "count", "cnt"],
    min_rows=1,
    category="aggregation",
    description="GROUP BY with COUNT",
)

AVG_BY_GROUP = GoldenQuestion(
    id="avg-by-group",
    question="What is the average amount by product?",
    table="sales_data",
    expected_patterns=["GROUP BY", "AVG", "product"],
    not_expected_patterns=[],
    expected_columns=["product", "avg", "average"],
    min_rows=1,
    category="aggregation",
    description="GROUP BY with AVG",
)

# ── 排序查询 ──────────────────────────────────────────────────────

TOP_N = GoldenQuestion(
    id="top-n",
    question="Show the top 5 products by total sales",
    table="sales_data",
    expected_patterns=["ORDER BY", "DESC", "LIMIT", "5", "SUM"],
    not_expected_patterns=[],
    expected_columns=["product", "total", "sum"],
    min_rows=1,
    max_rows=5,
    category="sorting",
    description="Top N with ORDER BY DESC LIMIT",
)

BOTTOM_N = GoldenQuestion(
    id="bottom-n",
    question="Show the 3 smallest orders by amount",
    table="sales_data",
    expected_patterns=["ORDER BY", "ASC", "LIMIT", "3"],
    not_expected_patterns=[],
    expected_columns=["amount", "order"],
    min_rows=1,
    max_rows=3,
    category="sorting",
    description="Bottom N with ORDER BY ASC LIMIT",
)

# ── 过滤查询 ──────────────────────────────────────────────────────

WHERE_FILTER = GoldenQuestion(
    id="where-filter",
    question="Show all records where amount is greater than 1000",
    table="sales_data",
    expected_patterns=["WHERE", "amount", ">", "1000"],
    not_expected_patterns=[],
    expected_columns=["amount"],
    min_rows=0,
    category="filtering",
    description="WHERE clause with numeric filter",
)

DATE_FILTER = GoldenQuestion(
    id="date-filter",
    question="Show sales from 2024",
    table="sales_data",
    expected_patterns=["WHERE", "2024"],
    not_expected_patterns=[],
    expected_columns=[],
    min_rows=0,
    category="filtering",
    description="Date-based filtering",
)

# ── 窗口函数 ──────────────────────────────────────────────────────

RANK_QUERY = GoldenQuestion(
    id="rank-query",
    question="Rank products by their total sales",
    table="sales_data",
    expected_patterns=["RANK", "OVER", "ORDER BY", "SUM"],
    not_expected_patterns=[],
    expected_columns=["product", "rank", "total"],
    min_rows=1,
    category="window",
    description="RANK window function",
)

# ── 子查询 ────────────────────────────────────────────────────────

SUBQUERY_AGG = GoldenQuestion(
    id="subquery-agg",
    question="Show categories whose average amount is above the overall average",
    table="sales_data",
    expected_patterns=["GROUP BY", "HAVING", "AVG"],
    not_expected_patterns=[],
    expected_columns=["category", "avg"],
    min_rows=0,
    category="subquery",
    description="HAVING with subquery comparison",
)

# ── 幻觉检测 ──────────────────────────────────────────────────────

HALLUCINATION_FAKE_COLUMN = GoldenQuestion(
    id="hallucination-fake-column",
    question="Show the unicorn_score by customer",
    table="sales_data",
    expected_patterns=["CANNOT_ANSWER"],
    not_expected_patterns=["unicorn_score"],
    expected_columns=[],
    min_rows=0,
    max_rows=0,
    category="hallucination",
    description="Should refuse non-existent column",
    hallucination_check="unicorn_score",
)

HALLUCINATION_FAKE_TABLE = GoldenQuestion(
    id="hallucination-fake-table",
    question="Query the magic_metrics table for top performers",
    table="sales_data",
    expected_patterns=["CANNOT_ANSWER"],
    not_expected_patterns=["magic_metrics"],
    expected_columns=[],
    min_rows=0,
    max_rows=0,
    category="hallucination",
    description="Should refuse non-existent table",
    hallucination_check="magic_metrics",
)

# ── 边界情况 ──────────────────────────────────────────────────────

EMPTY_RESULT = GoldenQuestion(
    id="empty-result",
    question="Show records where amount is greater than 999999999",
    table="sales_data",
    expected_patterns=["WHERE", "amount"],
    not_expected_patterns=[],
    expected_columns=[],
    min_rows=0,
    max_rows=0,
    category="edge_case",
    description="Query that returns zero rows is still valid SQL",
)

DISTINCT_QUERY = GoldenQuestion(
    id="distinct-query",
    question="What are the unique regions?",
    table="sales_data",
    expected_patterns=["DISTINCT", "region"],
    not_expected_patterns=[],
    expected_columns=["region"],
    min_rows=1,
    category="edge_case",
    description="DISTINCT query",
)

# ── 汇总 ──────────────────────────────────────────────────────────

GOLDEN_QUESTIONS: list[GoldenQuestion] = [
    BASIC_COUNT,
    BASIC_SELECT,
    GROUP_BY_SUM,
    GROUP_BY_COUNT,
    AVG_BY_GROUP,
    TOP_N,
    BOTTOM_N,
    WHERE_FILTER,
    DATE_FILTER,
    RANK_QUERY,
    SUBQUERY_AGG,
    HALLUCINATION_FAKE_COLUMN,
    HALLUCINATION_FAKE_TABLE,
    EMPTY_RESULT,
    DISTINCT_QUERY,
]

GOLDEN_QUESTIONS_BY_ID: dict[str, GoldenQuestion] = {q.id: q for q in GOLDEN_QUESTIONS}
