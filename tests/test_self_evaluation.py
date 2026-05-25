"""Tests for self_evaluation.py — prompt contract and message building."""

import pytest
from backend.prompts.self_evaluation import CONTRACT, SYSTEM_PROMPT, build_user_message


class TestContract:
    def test_contract_name(self):
        assert CONTRACT.name == "self_evaluation"

    def test_contract_format(self):
        assert CONTRACT.response_format == "json"

    def test_contract_max_tokens(self):
        assert CONTRACT.max_output_tokens == 1024

    def test_required_vars(self):
        assert "question" in CONTRACT.required_vars
        assert "sections_summary" in CONTRACT.required_vars


class TestBuildUserMessage:
    def test_basic(self):
        msg = build_user_message(
            question="What are the trends?",
            sections=[{"title": "Summary", "content": "Sales increased", "type": "markdown"}],
        )
        assert "What are the trends?" in msg
        assert "Summary" in msg
        assert "Sales increased" in msg

    def test_with_trace(self):
        msg = build_user_message(
            question="q",
            sections=[],
            trace={"total_llm_calls": 3, "total_output_tokens": 500, "guardrail_violations": []},
        )
        assert "LLM calls: 3" in msg
        assert "Output tokens: 500" in msg

    def test_truncation(self):
        long_content = "A" * 500
        msg = build_user_message(
            question="q",
            sections=[{"title": "S", "content": long_content, "type": "markdown"}],
        )
        # Content should be truncated to 300 - 3 + "..." = 300 chars total
        assert "A" * 297 + "..." in msg
        assert "A" * 500 not in msg

    def test_multiple_sections(self):
        msg = build_user_message(
            question="q",
            sections=[
                {"title": "A", "content": "a", "type": "markdown"},
                {"title": "B", "content": "b", "type": "sql"},
            ],
        )
        assert "[markdown] A" in msg
        assert "[sql] B" in msg
