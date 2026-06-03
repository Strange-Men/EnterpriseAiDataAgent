"""Tests for LLM SQL output normalization."""

from backend.utils.llm_sql import extract_sql_from_llm_output, validate_generated_sql


def test_extracts_sql_from_markdown_fence():
    raw = "```sql\nSELECT COUNT(*) AS total FROM sales;\n```"

    sql = extract_sql_from_llm_output(raw)

    assert sql == "SELECT COUNT(*) AS total FROM sales;"


def test_extracts_first_sql_statement_from_prose():
    raw = "Here is the query:\nSELECT customer_id FROM orders LIMIT 10;\nThis returns customers."

    sql = extract_sql_from_llm_output(raw)

    assert sql == "SELECT customer_id FROM orders LIMIT 10;"


def test_non_sql_text_becomes_cannot_answer():
    raw = "ThinkingBlock(thinking='I need more context')"

    sql = extract_sql_from_llm_output(raw)

    assert sql.startswith("-- CANNOT_ANSWER")


def test_cannot_answer_is_preserved_and_normalized():
    raw = "-- CANNOT_ANSWER: no table contains revenue"

    sql = extract_sql_from_llm_output(raw)

    assert sql == "-- CANNOT_ANSWER: no table contains revenue"


def test_validate_allows_readonly_sql():
    is_valid, error = validate_generated_sql("WITH x AS (SELECT 1 AS n) SELECT n FROM x;")

    assert is_valid is True
    assert error == ""


def test_validate_blocks_unsafe_sql():
    is_valid, error = validate_generated_sql("DROP TABLE sales;")

    assert is_valid is False
    assert "Statement type not allowed" in error
