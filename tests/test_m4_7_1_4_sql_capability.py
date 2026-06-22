"""M4-7.1.4 测试 — AI SQL Capability + History Recall UX Hardening。

覆盖:
1. 中文词字段映射 (schema_semantics)
2. demo_sales 复杂问题不应 CANNOT_ANSWER
3. fallback template 生成合法 DuckDB SQL
4. 缺字段时明确 missing field
5. JSON fenced block 可 parse
6. 非 JSON response 可 fallback
7. SQL-only generation 不执行 SQL
8. 生成 SQL 不含解释文本
9. 生成 SQL 只读
"""

import pytest

# ── Schema Semantics Tests ──────────────────────────────────────

from backend.services.schema_semantics import (
    build_semantic_aliases,
    build_semantic_context,
    get_missing_fields,
    resolve_field,
)


class TestSemanticMapping:
    """中文业务词 → 真实字段映射。"""

    DEMO_COLUMNS = [
        "order_id", "order_date", "customer_region", "category",
        "subcategory", "product_name", "sales_amount", "quantity",
        "discount", "is_returned", "ship_date",
    ]

    def test_region_mapping(self):
        """地区/区域/客户地区 → customer_region"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        assert aliases.get("地区") == "customer_region"
        assert aliases.get("区域") == "customer_region"
        assert aliases.get("客户地区") == "customer_region"

    def test_category_mapping(self):
        """品类/类别 → category"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        assert aliases.get("品类") == "category"
        assert aliases.get("类别") == "category"

    def test_sales_mapping(self):
        """销售额/金额 → sales_amount"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        assert aliases.get("销售额") == "sales_amount"
        assert aliases.get("金额") == "sales_amount"

    def test_date_mapping(self):
        """日期/下单日期 → order_date"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        assert aliases.get("日期") == "order_date"
        assert aliases.get("下单日期") == "order_date"

    def test_return_mapping(self):
        """退货/退货率 → is_returned"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        assert aliases.get("退货") == "is_returned"

    def test_discount_mapping(self):
        """折扣 → discount"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        assert aliases.get("折扣") == "discount"

    def test_nonexistent_field_not_mapped(self):
        """不存在的字段不应出现在映射中"""
        aliases = build_semantic_aliases(self.DEMO_COLUMNS)
        # profit 不在 demo_sales 中
        assert "利润" not in aliases

    def test_semantic_context_output(self):
        """语义上下文应包含映射信息"""
        ctx = build_semantic_context(self.DEMO_COLUMNS)
        assert "地区" in ctx
        assert "customer_region" in ctx
        assert "品类" in ctx
        assert "category" in ctx

    def test_missing_fields_detection(self):
        """缺失字段检测"""
        # demo_sales 没有 profit
        missing = get_missing_fields(self.DEMO_COLUMNS, ["profit"])
        assert "profit" in missing

        # demo_sales 有 region
        missing = get_missing_fields(self.DEMO_COLUMNS, ["region"])
        assert "region" not in missing

    def test_resolve_single_term(self):
        """单个中文词解析"""
        col = resolve_field("地区", self.DEMO_COLUMNS)
        assert col == "customer_region"

        col = resolve_field("不存在的词", self.DEMO_COLUMNS)
        assert col is None


# ── SQL Template Tests ──────────────────────────────────────────

from backend.services.sql_templates import try_generate_sql


class TestSqlTemplates:
    """Deterministic SQL fallback 模板。"""

    DEMO_COLUMNS = [
        "order_id", "order_date", "customer_region", "category",
        "subcategory", "product_name", "sales_amount", "quantity",
        "discount", "is_returned", "ship_date",
    ]

    def test_top_category_template(self):
        """复杂排名分析应生成 SQL"""
        question = "请分析 2021 年到 2024 年之间，每个地区每年销售额最高的前 3 个品类"
        sql = try_generate_sql(question, "demo_sales", self.DEMO_COLUMNS)
        assert sql is not None
        assert "SELECT" in sql.upper()
        assert "demo_sales" in sql
        assert "customer_region" in sql
        assert "category" in sql
        assert "sales_amount" in sql

    def test_top_category_no_chinese_in_sql(self):
        """生成的 SQL 不应包含中文"""
        question = "请分析 2021 年到 2024 年之间，每个地区每年销售额最高的前 3 个品类"
        sql = try_generate_sql(question, "demo_sales", self.DEMO_COLUMNS)
        assert sql is not None
        # 检查 SQL 不包含中文字符
        for char in sql:
            assert ord(char) < 128 or char in ("\n", "\r", "\t"), f"Chinese char found in SQL: {char}"

    def test_top_category_readonly(self):
        """生成的 SQL 应该是只读的"""
        question = "请分析 2021 年到 2024 年之间，每个地区每年销售额最高的前 3 个品类"
        sql = try_generate_sql(question, "demo_sales", self.DEMO_COLUMNS)
        assert sql is not None
        upper = sql.upper()
        for keyword in ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE"]:
            assert keyword not in upper

    def test_region_ranking_template(self):
        """区域销售排名应生成 SQL"""
        question = "各地区销售额排名"
        sql = try_generate_sql(question, "demo_sales", self.DEMO_COLUMNS)
        assert sql is not None
        assert "customer_region" in sql
        assert "RANK" in sql.upper()

    def test_category_ranking_template(self):
        """品类销售排名应生成 SQL"""
        question = "各品类销售额排名"
        sql = try_generate_sql(question, "demo_sales", self.DEMO_COLUMNS)
        assert sql is not None
        assert "category" in sql

    def test_missing_fields_no_template(self):
        """缺少核心字段时不应生成 SQL"""
        # 没有 sales_amount 的表
        question = "各地区销售额排名"
        sql = try_generate_sql(question, "other_table", ["id", "name", "date"])
        assert sql is None

    def test_table_name_from_param(self):
        """SQL 中的表名应来自参数，不硬编码"""
        question = "请分析 2021 年到 2024 年之间，每个地区每年销售额最高的前 3 个品类"
        sql = try_generate_sql(question, "my_custom_table", self.DEMO_COLUMNS)
        assert sql is not None
        assert "my_custom_table" in sql

    def test_share_filter(self):
        """占比过滤"""
        question = "每个地区每年销售额最高的前 3 个品类，占比超过 10%"
        sql = try_generate_sql(question, "demo_sales", self.DEMO_COLUMNS)
        assert sql is not None
        assert "sales_share" in sql
        assert "0.1" in sql


# ── JSON Parsing Tests ──────────────────────────────────────────

from backend.utils.llm_json import parse_llm_json, safe_parse_llm_json
import json


class TestJsonParsing:
    """LLM JSON 解析增强。"""

    def test_direct_json(self):
        """直接 JSON 解析"""
        result = parse_llm_json('{"key": "value"}')
        assert result == {"key": "value"}

    def test_markdown_fenced_json(self):
        """Markdown code fence 中的 JSON"""
        raw = '```json\n{"key": "value"}\n```'
        result = parse_llm_json(raw)
        assert result == {"key": "value"}

    def test_markdown_fenced_uppercase(self):
        """大写 JSON 标记"""
        raw = '```JSON\n{"key": "value"}\n```'
        result = parse_llm_json(raw)
        assert result == {"key": "value"}

    def test_json_with_prose(self):
        """JSON 混在文本中"""
        raw = 'Here is the result:\n{"key": "value"}\nHope this helps!'
        result = parse_llm_json(raw)
        assert result == {"key": "value"}

    def test_trailing_comma_repair(self):
        """尾逗号修复"""
        raw = '{"key": "value",}'
        result = parse_llm_json(raw)
        assert result == {"key": "value"}

    def test_array_json(self):
        """数组 JSON"""
        raw = '[1, 2, 3]'
        result = parse_llm_json(raw)
        assert result == [1, 2, 3]

    def test_empty_raises(self):
        """空字符串应抛异常"""
        with pytest.raises(json.JSONDecodeError):
            parse_llm_json("")

    def test_safe_parse_with_fallback(self):
        """safe_parse_llm_json 在解析失败时返回 fallback"""
        result, parsed = safe_parse_llm_json("not json at all", fallback={"default": True})
        assert parsed is False
        assert result == {"default": True}

    def test_safe_parse_success(self):
        """safe_parse_llm_json 成功解析"""
        result, parsed = safe_parse_llm_json('{"key": "value"}', fallback={})
        assert parsed is True
        assert result == {"key": "value"}

    def test_plan_json_fenced(self):
        """分析计划 JSON (带 markdown fence)"""
        raw = '''```json
{
  "plan": [
    {"step": 1, "purpose": "Test", "sql_goal": "SELECT 1", "depends_on": null}
  ]
}
```'''
        result = parse_llm_json(raw)
        assert "plan" in result
        assert len(result["plan"]) == 1


# ── SQL Generation Validation Tests ─────────────────────────────

from backend.utils.llm_sql import extract_sql_from_llm_output


class TestSqlExtraction:
    """SQL 提取和验证。"""

    def test_cannot_answer_preserved(self):
        """CANNOT_ANSWER 标记应被保留"""
        result = extract_sql_from_llm_output("-- CANNOT_ANSWER: 缺少字段")
        assert result.startswith("-- CANNOT_ANSWER")

    def test_sql_from_fence(self):
        """从 markdown fence 提取 SQL"""
        raw = '```sql\nSELECT * FROM demo_sales LIMIT 10;\n```'
        result = extract_sql_from_llm_output(raw)
        assert "SELECT" in result
        assert "demo_sales" in result

    def test_sql_with_prose_stripped(self):
        """SQL 后面的中文解释应被去除"""
        raw = "SELECT COUNT(*) FROM demo_sales;\n这是一个统计查询。"
        result = extract_sql_from_llm_output(raw)
        assert "统计查询" not in result
        assert "SELECT" in result

    def test_empty_returns_cannot_answer(self):
        """空响应应返回 CANNOT_ANSWER"""
        result = extract_sql_from_llm_output("")
        assert "CANNOT_ANSWER" in result

    def test_no_chinese_in_extracted_sql(self):
        """提取的 SQL 不应包含中文"""
        raw = """WITH base AS (
  SELECT
    EXTRACT(YEAR FROM order_date) AS year,
    customer_region,
    SUM(sales_amount) AS total_sales
  FROM demo_sales
  GROUP BY 1, 2
)
SELECT * FROM base LIMIT 10;"""
        result = extract_sql_from_llm_output(raw)
        for char in result:
            assert ord(char) < 128 or char in ("\n", "\r", "\t"), f"Chinese char in SQL: {char}"


# ── Semantic Context Integration Tests ──────────────────────────

class TestSemanticIntegration:
    """语义映射集成到 schema context。"""

    def test_schema_context_with_semantics(self):
        """build_schema_context 应包含语义映射"""
        from backend.services.ai_analyst import build_schema_context

        tables = [{
            "name": "demo_sales",
            "columns": [
                {"name": "order_date", "type": "DATE"},
                {"name": "customer_region", "type": "VARCHAR"},
                {"name": "category", "type": "VARCHAR"},
                {"name": "sales_amount", "type": "DOUBLE"},
                {"name": "discount", "type": "DOUBLE"},
                {"name": "is_returned", "type": "INTEGER"},
            ],
        }]
        ctx = build_schema_context(tables, include_semantics=True)
        assert "Semantic field mapping" in ctx
        assert "地区" in ctx
        assert "customer_region" in ctx

    def test_schema_context_without_semantics(self):
        """不启用语义映射时不应包含"""
        from backend.services.ai_analyst import build_schema_context

        tables = [{
            "name": "demo_sales",
            "columns": [{"name": "order_date", "type": "DATE"}],
        }]
        ctx = build_schema_context(tables, include_semantics=False)
        assert "Semantic field mapping" not in ctx
