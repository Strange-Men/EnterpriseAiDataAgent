"""Tests for NoneType handling in AI pipeline.

Covers: M3-5 bug — `can only concatenate str (not "NoneType") to str`
"""

import pytest
from unittest.mock import patch, MagicMock


class TestCallLlmNoneTextBlock:
    """_call_llm should handle content blocks where .text is None."""

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.get_budget")
    def test_thinking_block_with_none_text(self, mock_budget, mock_get_client):
        """Mimo API returns thinking blocks where block.text is None."""
        from backend.services.ai_analyst import _call_llm

        # Setup mock budget
        mock_b = MagicMock()
        mock_b.max_input_tokens = 10000
        mock_b.max_output_tokens = 1024
        mock_budget.return_value = mock_b

        # Setup mock response with a thinking block (text=None) + text block
        thinking_block = MagicMock()
        thinking_block.text = None
        thinking_block.type = "thinking"

        text_block = MagicMock()
        text_block.text = "SELECT * FROM sales"
        text_block.type = "text"

        mock_response = MagicMock()
        mock_response.content = [thinking_block, text_block]

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        result = _call_llm("system prompt", "user message", max_tokens=1024)
        assert result == "SELECT * FROM sales"

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.get_budget")
    def test_all_blocks_have_none_text(self, mock_budget, mock_get_client):
        """All content blocks have text=None — returns empty string."""
        from backend.services.ai_analyst import _call_llm

        mock_b = MagicMock()
        mock_b.max_input_tokens = 10000
        mock_b.max_output_tokens = 1024
        mock_budget.return_value = mock_b

        block = MagicMock()
        block.text = None
        block.type = "thinking"

        mock_response = MagicMock()
        mock_response.content = [block]

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        result = _call_llm("system prompt", "user message", max_tokens=1024)
        # No text blocks with content → returns empty string
        assert result == ""


class TestGenerateSqlNoneHandling:
    """generate_sql should handle None returns from _call_llm gracefully."""

    @patch("backend.services.ai_analyst._call_llm")
    def test_call_llm_returns_none(self, mock_call_llm):
        """If _call_llm somehow returns None, generate_sql should not crash."""
        from backend.services.ai_analyst import generate_sql

        mock_call_llm.return_value = None

        result = generate_sql("test question", "schema context", None, "zh")
        # Should return a structured result, not crash with TypeError
        assert "status" in result
        assert result["status"] in ("error", "success")
        assert isinstance(result.get("sql", ""), str)

    @patch("backend.services.ai_analyst._call_llm")
    def test_call_llm_returns_empty_string(self, mock_call_llm):
        """If _call_llm returns empty string, generate_sql should handle it."""
        from backend.services.ai_analyst import generate_sql

        mock_call_llm.return_value = ""

        result = generate_sql("test question", "schema context", None, "zh")
        assert "status" in result
        assert isinstance(result.get("sql", ""), str)


class TestPipelineNoneSqlHandling:
    """ai_pipeline should handle None SQL field in generate_sql result."""

    @patch("backend.services.ai_pipeline.generate_sql")
    @patch("backend.services.ai_pipeline.build_schema_context")
    @patch("backend.services.ai_pipeline.list_tables")
    def test_generate_sql_returns_none_sql(self, mock_tables, mock_schema, mock_gen):
        """If generate_sql returns sql=None, pipeline should not crash."""
        from backend.services.ai_pipeline import run_ai_query

        mock_tables.return_value = []
        mock_schema.return_value = "schema"
        mock_gen.return_value = {
            "sql": None,
            "status": "success",
            "elapsed_ms": 100,
            "quality_gates": [],
        }

        # Should not raise TypeError — should handle gracefully
        result = run_ai_query("test question", execute=False, explain=False)
        assert "status" in result
        assert isinstance(result.get("sql", ""), str)

    @patch("backend.services.ai_pipeline.generate_sql")
    @patch("backend.services.ai_pipeline.build_schema_context")
    @patch("backend.services.ai_pipeline.list_tables")
    def test_generate_sql_returns_missing_sql_key(self, mock_tables, mock_schema, mock_gen):
        """If generate_sql result has no 'sql' key, pipeline should not crash."""
        from backend.services.ai_pipeline import run_ai_query

        mock_tables.return_value = []
        mock_schema.return_value = "schema"
        mock_gen.return_value = {
            "status": "success",
            "elapsed_ms": 100,
            "quality_gates": [],
        }

        result = run_ai_query("test question", execute=False, explain=False)
        assert "status" in result
