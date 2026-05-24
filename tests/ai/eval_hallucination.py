"""Hallucination Detection — 检测 AI 生成的 SQL 中是否包含幻觉内容。"""


def check_hallucination(sql: str, available_tables: list[str], available_columns: dict[str, list[str]]) -> dict:
    """检查 SQL 中是否引用了不存在的表或列。

    Returns:
        {
            "hallucinated": bool,
            "fake_tables": list[str],
            "fake_columns": list[str],
            "details": str,
        }
    """
    sql_upper = sql.upper()
    fake_tables = []
    fake_columns = []

    # 检查表名（简单启发式：SQL 中的大写单词匹配已知表名）
    known_tables_upper = [t.upper() for t in available_tables]
    for table in available_tables:
        # 跳过，只检查 SQL 中是否引用了未知表
        pass

    # 从 SQL 中提取可能的表名（FROM/JOIN 后的词）
    import re
    table_pattern = r'(?:FROM|JOIN)\s+["`]?(\w+)["`]?'
    referenced_tables = re.findall(table_pattern, sql_upper)
    for ref_table in referenced_tables:
        if ref_table not in known_tables_upper and ref_table not in ("SELECT", "WHERE", "GROUP", "ORDER", "LIMIT", "HAVING", "WITH"):
            fake_tables.append(ref_table.lower())

    # 检查列名
    all_known_columns = set()
    for cols in available_columns.values():
        all_known_columns.update(c.upper() for c in cols)

    # 提取 SELECT 和 WHERE 中的列名引用
    col_pattern = r'(?:SELECT|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING)\s+(.*?)(?:FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|$)'
    col_sections = re.findall(col_pattern, sql_upper)
    for section in col_sections:
        # 提取标识符
        tokens = re.findall(r'\b([A-Z_][A-Z0-9_]*)\b', section)
        sql_keywords = {
            "SELECT", "DISTINCT", "AS", "AND", "OR", "NOT", "IN", "IS", "NULL",
            "COUNT", "SUM", "AVG", "MIN", "MAX", "COUNT", "CASE", "WHEN", "THEN",
            "ELSE", "END", "ASC", "DESC", "BETWEEN", "LIKE", "EXISTS", "ALL",
            "ANY", "UNION", "INTERSECT", "EXCEPT", "TRUE", "FALSE", "CAST",
            "COALESCE", "NULLIF", "ABS", "ROUND", "FLOOR", "CEIL", "UPPER",
            "LOWER", "LENGTH", "SUBSTRING", "TRIM", "CONCAT", "YEAR", "MONTH",
            "DAY", "HOUR", "MINUTE", "SECOND", "NOW", "CURRENT_DATE", "VARCHAR",
            "INTEGER", "DOUBLE", "BOOLEAN", "DATE", "TIMESTAMP", "RANK", "DENSE_RANK",
            "ROW_NUMBER", "OVER", "PARTITION", "LEAD", "LAG", "FIRST_VALUE",
            "LAST_VALUE", "NTH_VALUE", "NTILE", "CUME_DIST", "PERCENT_RANK",
            "FROM", "WHERE", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET",
            "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "CROSS", "ON", "USING",
            "NATURAL", "WITH", "RECURSIVE",
        }
        for token in tokens:
            if token not in sql_keywords and token not in all_known_columns:
                # 可能是幻觉列名
                fake_columns.append(token.lower())

    return {
        "hallucinated": bool(fake_tables or fake_columns),
        "fake_tables": fake_tables,
        "fake_columns": fake_columns,
        "details": f"Tables: {fake_tables}, Columns: {fake_columns}" if (fake_tables or fake_columns) else "No hallucination detected",
    }
