"""Deterministic SQL Templates — 常见分析模式的 SQL fallback。

当 LLM 生成 CANNOT_ANSWER 或失败时，尝试用模板生成 SQL。
模板基于 schema 语义映射，不硬编码表名。
"""

from __future__ import annotations

import re

from backend.services.schema_semantics import build_semantic_aliases


def _find_col(aliases: dict[str, str], *terms: str) -> str | None:
    """从别名映射中查找第一个匹配的字段。"""
    for term in terms:
        if term in aliases:
            return aliases[term]
    return None


def try_generate_sql(question: str, table: str, columns: list[str]) -> str | None:
    """尝试用确定性模板生成 SQL。

    识别问题中的关键词模式，如果 schema 匹配则生成 SQL。

    Args:
        question: 自然语言问题。
        table: 表名。
        columns: 实际列名列表。

    Returns:
        生成的 SQL 字符串，或 None（无法匹配模板）。
    """
    aliases = build_semantic_aliases(columns)
    q = question.lower()

    # Template 1: Top category by year + region (复杂排名分析)
    sql = _try_top_category_by_region_year(q, table, aliases, columns)
    if sql:
        return sql

    # Template 2: 区域销售排名
    sql = _try_region_sales_ranking(q, table, aliases, columns)
    if sql:
        return sql

    # Template 3: 品类销售排名
    sql = _try_category_sales_ranking(q, table, aliases, columns)
    if sql:
        return sql

    # Template 4: 异常订单筛选
    sql = _try_anomaly_orders(q, table, aliases, columns)
    if sql:
        return sql

    return None


# ── Template 1: Top category by year + region ──────────────────────

def _try_top_category_by_region_year(
    q: str, table: str, aliases: dict[str, str], columns: list[str]
) -> str | None:
    """匹配: 每个地区每年销售额最高的前 N 个品类。"""
    # 检查关键词
    has_year = any(w in q for w in ["年", "year", "2021", "2022", "2023", "2024"])
    has_region = any(w in q for w in ["地区", "区域", "region"])
    has_category = any(w in q for w in ["品类", "类别", "category"])
    has_sales = any(w in q for w in ["销售", "金额", "营收", "sales", "revenue"])
    has_ranking = any(w in q for w in ["前", "top", "排名", "最高", "rank"])

    if not (has_year and has_region and has_category and has_sales and has_ranking):
        return None

    # 检查字段
    date_col = _find_col(aliases, "日期", "下单日期", "order_date", "日期")
    region_col = _find_col(aliases, "地区", "区域", "客户地区", "customer_region")
    category_col = _find_col(aliases, "品类", "类别", "商品类别", "category")
    sales_col = _find_col(aliases, "销售额", "金额", "营收", "sales_amount")

    if not all([date_col, region_col, category_col, sales_col]):
        return None

    # 提取 top N
    top_n = 3
    top_match = re.search(r"前\s*(\d+)", q)
    if top_match:
        top_n = int(top_match.group(1))

    # 提取年份范围
    years = re.findall(r"20\d{2}", q)
    year_filter = ""
    if len(years) >= 2:
        year_filter = f"WHERE EXTRACT(YEAR FROM {date_col}) BETWEEN {min(years)} AND {max(years)}"
    elif len(years) == 1:
        year_filter = f"WHERE EXTRACT(YEAR FROM {date_col}) = {years[0]}"

    # 检查可选字段
    discount_col = _find_col(aliases, "折扣", "优惠", "平均折扣", "discount")
    return_col = _find_col(aliases, "退货", "是否退货", "退货率", "is_returned")

    # 构建聚合列
    agg_cols = [f"SUM({sales_col}) AS total_sales", "COUNT(*) AS order_count"]
    if discount_col:
        agg_cols.append(f"AVG({discount_col}) AS avg_discount")
    if return_col:
        agg_cols.append(f"AVG(CAST({return_col} AS DOUBLE)) AS return_rate")

    agg_str = ",\n    ".join(agg_cols)

    # 构建 SELECT 列
    select_cols = [
        "year", "customer_region", "category", "total_sales", "order_count",
    ]
    if discount_col:
        select_cols.append("avg_discount")
    if return_col:
        select_cols.append("return_rate")
    select_cols.extend(["sales_share", "sales_rank"])

    select_str = ",\n  ".join(select_cols)

    # 检查是否有"占比"关键词
    has_share = any(w in q for w in ["占比", "比例", "份额", "share", "proportion"])
    share_filter = ""
    if has_share:
        # 提取占比阈值
        pct_match = re.search(r"(\d+)\s*%", q)
        pct = int(pct_match.group(1)) / 100 if pct_match else 0.10
        share_filter = f"\n  AND sales_share > {pct}"

    sql = f"""WITH base AS (
  SELECT
    EXTRACT(YEAR FROM {date_col}) AS year,
    {region_col} AS customer_region,
    {category_col} AS category,
    {agg_str}
  FROM {table}
  {year_filter}
  GROUP BY 1, 2, 3
),
with_share AS (
  SELECT
    *,
    total_sales / SUM(total_sales) OVER (PARTITION BY year, customer_region) AS sales_share,
    ROW_NUMBER() OVER (
      PARTITION BY year, customer_region
      ORDER BY total_sales DESC
    ) AS sales_rank
  FROM base
)
SELECT
  {select_str}
FROM with_share
WHERE sales_rank <= {top_n}{share_filter}
ORDER BY year, customer_region, sales_rank;"""

    return sql


# ── Template 2: 区域销售排名 ──────────────────────────────────────

def _try_region_sales_ranking(
    q: str, table: str, aliases: dict[str, str], columns: list[str]
) -> str | None:
    """匹配: 各地区销售额排名。"""
    has_region = any(w in q for w in ["地区", "区域", "region"])
    has_sales = any(w in q for w in ["销售", "金额", "营收", "sales"])
    has_ranking = any(w in q for w in ["排名", "排行", "rank", "top"])

    if not (has_region and has_sales and has_ranking):
        return None

    region_col = _find_col(aliases, "地区", "区域", "客户地区", "customer_region")
    sales_col = _find_col(aliases, "销售额", "金额", "营收", "sales_amount")

    if not (region_col and sales_col):
        return None

    return f"""SELECT
  {region_col} AS customer_region,
  SUM({sales_col}) AS total_sales,
  COUNT(*) AS order_count,
  RANK() OVER (ORDER BY SUM({sales_col}) DESC) AS sales_rank
FROM {table}
GROUP BY {region_col}
ORDER BY sales_rank;"""


# ── Template 3: 品类销售排名 ──────────────────────────────────────

def _try_category_sales_ranking(
    q: str, table: str, aliases: dict[str, str], columns: list[str]
) -> str | None:
    """匹配: 各品类销售额排名。"""
    has_category = any(w in q for w in ["品类", "类别", "category"])
    has_sales = any(w in q for w in ["销售", "金额", "营收", "sales"])
    has_ranking = any(w in q for w in ["排名", "排行", "rank", "top"])

    if not (has_category and has_sales and has_ranking):
        return None

    category_col = _find_col(aliases, "品类", "类别", "商品类别", "category")
    sales_col = _find_col(aliases, "销售额", "金额", "营收", "sales_amount")

    if not (category_col and sales_col):
        return None

    return f"""SELECT
  {category_col} AS category,
  SUM({sales_col}) AS total_sales,
  COUNT(*) AS order_count,
  RANK() OVER (ORDER BY SUM({sales_col}) DESC) AS sales_rank
FROM {table}
GROUP BY {category_col}
ORDER BY sales_rank;"""


# ── Template 4: 异常订单筛选 ──────────────────────────────────────

def _try_anomaly_orders(
    q: str, table: str, aliases: dict[str, str], columns: list[str]
) -> str | None:
    """匹配: 筛选异常/高额/退货订单。"""
    has_anomaly = any(w in q for w in ["异常", "退货", "高额", "异常订单", "anomaly"])
    if not has_anomaly:
        return None

    sales_col = _find_col(aliases, "销售额", "金额", "sales_amount")
    return_col = _find_col(aliases, "退货", "是否退货", "is_returned")

    if not sales_col:
        return None

    if return_col and any(w in q for w in ["退货", "return"]):
        return f"""SELECT *
FROM {table}
WHERE {return_col} = 1
ORDER BY {sales_col} DESC
LIMIT 100;"""

    # 高额订单
    return f"""SELECT *
FROM {table}
ORDER BY {sales_col} DESC
LIMIT 50;"""
