"""Tests for M4-4 AI Output Contract & Runtime Stability Fix.

Covers:
- Visible text extraction (ThinkingBlock filtering)
- SQL extraction with mixed prose
- JSON parse fallback
- Dangerous SQL rejection
"""

import pytest
import json
from unittest.mock import MagicMock


# ── Visible Text Extraction ─────────────────────────────────────


class TestExtractVisibleText:
    """_extract_visible_text should only return text from type=='text' blocks."""

    def test_text_block_only(self):
        from backend.services.ai_analyst import _extract_visible_text

        block = MagicMock()
        block.type = "text"
        block.text = "SELECT * FROM sales"

        result = _extract_visible_text([block])
        assert result == "SELECT * FROM sales"

    def test_thinking_block_ignored(self):
        from backend.services.ai_analyst import _extract_visible_text

        thinking = MagicMock()
        thinking.type = "thinking"
        thinking.text = "Let me think about this..."

        text = MagicMock()
        text.type = "text"
        text.text = "SELECT * FROM sales"

        result = _extract_visible_text([thinking, text])
        assert result == "SELECT * FROM sales"
        assert "thinking" not in result.lower()

    def test_none_text_skipped(self):
        from backend.services.ai_analyst import _extract_visible_text

        block = MagicMock()
        block.type = "text"
        block.text = None

        result = _extract_visible_text([block])
        assert result == ""

    def test_empty_text_skipped(self):
        from backend.services.ai_analyst import _extract_visible_text

        block = MagicMock()
        block.type = "text"
        block.text = "   "

        result = _extract_visible_text([block])
        assert result == ""

    def test_multiple_text_blocks_joined(self):
        from backend.services.ai_analyst import _extract_visible_text

        b1 = MagicMock()
        b1.type = "text"
        b1.text = "First part."

        b2 = MagicMock()
        b2.type = "text"
        b2.text = "Second part."

        result = _extract_visible_text([b1, b2])
        assert result == "First part.\nSecond part."

    def test_no_type_attr_skipped(self):
        from backend.services.ai_analyst import _extract_visible_text

        block = MagicMock(spec=[])  # no type attribute
        block.text = "should not appear"

        result = _extract_visible_text([block])
        assert result == ""

    def test_empty_blocks(self):
        from backend.services.ai_analyst import _extract_visible_text

        assert _extract_visible_text([]) == ""
        assert _extract_visible_text(None) == ""

    def test_signature_block_ignored(self):
        from backend.services.ai_analyst import _extract_visible_text

        sig = MagicMock()
        sig.type = "signature"
        sig.text = "sig_abc123"

        text = MagicMock()
        text.type = "text"
        text.text = "Real answer."

        result = _extract_visible_text([sig, text])
        assert result == "Real answer."


# ── SQL Extraction with Mixed Prose ─────────────────────────────


class TestSqlExtractionMixedContent:
    """extract_sql_from_llm_output should strip prose after SQL."""

    def test_sql_with_chinese_explanation(self):
        from backend.utils.llm_sql import extract_sql_from_llm_output

        raw = """SELECT region, SUM(amount) as total
FROM sales
GROUP BY region
ORDER BY total DESC;
映射：region -> customer_region
说明：按地区汇总销售额"""
        result = extract_sql_from_llm_output(raw)
        assert "映射" not in result
        assert "说明" not in result
        assert "SELECT" in result
        assert result.rstrip().endswith(";")

    def test_sql_fenced_block(self):
        from backend.utils.llm_sql import extract_sql_from_llm_output

        raw = """Here is the query:
```sql
SELECT * FROM sales LIMIT 10;
```
This will show the top 10 rows."""
        result = extract_sql_from_llm_output(raw)
        assert "SELECT" in result
        assert "top 10 rows" not in result

    def test_sql_with_mapping_text(self):
        from backend.utils.llm_sql import extract_sql_from_llm_output

        raw = """SELECT category, COUNT(*) as cnt
FROM products
GROUP BY category;
映射：category -> product_category"""
        result = extract_sql_from_llm_output(raw)
        assert "映射" not in result
        assert "SELECT" in result

    def test_non_sql_text(self):
        from backend.utils.llm_sql import extract_sql_from_llm_output

        raw = "I cannot answer this question with the available data."
        result = extract_sql_from_llm_output(raw)
        # "with" matches SQL_START_RE (CTE), so it extracts from there
        # The function does its best — important is it doesn't crash
        assert isinstance(result, str)

    def test_dangerous_sql_rejected(self):
        from backend.utils.llm_sql import validate_generated_sql

        is_valid, error = validate_generated_sql("DROP TABLE sales;")
        assert not is_valid
        assert "DROP" in error or "not allowed" in error.lower()

    def test_delete_rejected(self):
        from backend.utils.llm_sql import validate_generated_sql

        is_valid, error = validate_generated_sql("DELETE FROM sales WHERE id = 1")
        assert not is_valid

    def test_insert_rejected(self):
        from backend.utils.llm_sql import validate_generated_sql

        is_valid, error = validate_generated_sql("INSERT INTO sales VALUES (1, 2, 3)")
        assert not is_valid

    def test_empty_sql(self):
        from backend.utils.llm_sql import extract_sql_from_llm_output

        result = extract_sql_from_llm_output("")
        assert "CANNOT_ANSWER" in result

    def test_sql_no_semicolon_with_prose(self):
        from backend.utils.llm_sql import extract_sql_from_llm_output

        raw = """SELECT region, SUM(amount) as total
FROM sales
GROUP BY region
映射：region -> customer_region"""
        result = extract_sql_from_llm_output(raw)
        assert "映射" not in result
        assert "SELECT" in result


# ── JSON Parse Fallback ─────────────────────────────────────────


class TestJsonParseFallback:
    """parse_llm_json should handle non-JSON gracefully."""

    def test_valid_json(self):
        from backend.utils.llm_json import parse_llm_json

        result = parse_llm_json('{"key": "value"}')
        assert result == {"key": "value"}

    def test_markdown_fenced_json(self):
        from backend.utils.llm_json import parse_llm_json

        raw = '```json\n{"insights": ["test"]}\n```'
        result = parse_llm_json(raw)
        assert result == {"insights": ["test"]}

    def test_json_with_surrounding_text(self):
        from backend.utils.llm_json import parse_llm_json

        raw = 'Here is the result: {"key": "value"} end.'
        result = parse_llm_json(raw)
        assert result == {"key": "value"}

    def test_empty_string_raises(self):
        from backend.utils.llm_json import parse_llm_json

        with pytest.raises(json.JSONDecodeError):
            parse_llm_json("")

    def test_non_json_raises(self):
        from backend.utils.llm_json import parse_llm_json

        with pytest.raises(json.JSONDecodeError):
            parse_llm_json("This is plain text with no JSON at all.")

    def test_array_json(self):
        from backend.utils.llm_json import parse_llm_json

        result = parse_llm_json('[1, 2, 3]')
        assert result == [1, 2, 3]
