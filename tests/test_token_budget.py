"""Tests for Token Budget module."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.runtime.token_budget import (
    estimate_tokens,
    truncate_text,
    truncate_rows,
    get_budget,
    OPERATION_BUDGETS,
    WorkflowTokenTracker,
    TokenBudget,
)


class TestEstimateTokens:
    def test_empty_string(self):
        assert estimate_tokens("") == 1  # max(1, 0)

    def test_ascii(self):
        # "hello" = 5 chars => 5 // 3 = 1
        assert estimate_tokens("hello") == 1

    def test_long_ascii(self):
        text = "a" * 300
        assert estimate_tokens(text) == 100

    def test_cjk_characters(self):
        # CJK ~1.5 chars/token (v0.9.4 heuristic)
        text = "你好世界"  # 4 CJK chars / 1.5 ≈ 2 tokens
        assert estimate_tokens(text) == 2


class TestTruncateText:
    def test_under_limit(self):
        text = "short"
        result = truncate_text(text, max_tokens=100)
        assert result == text

    def test_over_limit(self):
        text = "a" * 1000
        result = truncate_text(text, max_tokens=10)
        assert result.endswith("...[truncated]")
        assert len(result) < len(text) + 20


class TestTruncateRows:
    def test_empty_list(self):
        rows, truncated = truncate_rows([], 10, 1000)
        assert rows == []
        assert truncated is False

    def test_under_both_limits(self):
        rows = [{"a": 1}, {"a": 2}]
        result, truncated = truncate_rows(rows, 10, 1000)
        assert len(result) == 2
        assert truncated is False

    def test_exceeds_max_rows(self):
        rows = [{"a": i} for i in range(20)]
        result, truncated = truncate_rows(rows, 5, 10000)
        assert len(result) == 5
        assert truncated is True

    def test_exceeds_max_tokens(self):
        rows = [{"data": "x" * 500} for _ in range(50)]
        result, truncated = truncate_rows(rows, 100, 10)
        assert len(result) < 50
        assert truncated is True


class TestGetBudget:
    def test_known_operation(self):
        budget = get_budget("sql_generation")
        assert budget.max_input_tokens == 3000
        assert budget.max_output_tokens == 512

    def test_unknown_operation(self):
        budget = get_budget("nonexistent")
        assert budget.max_input_tokens == 2000
        assert budget.max_output_tokens == 512

    def test_all_operations_have_budgets(self):
        for op in OPERATION_BUDGETS:
            budget = get_budget(op)
            assert budget.max_input_tokens > 0
            assert budget.max_output_tokens > 0


class TestWorkflowTokenTracker:
    def test_initial_state(self):
        tracker = WorkflowTokenTracker()
        assert tracker.consumed == 0
        assert tracker.remaining == 25000
        assert len(tracker.calls) == 0

    def test_custom_budget(self):
        tracker = WorkflowTokenTracker(total_budget=1000)
        assert tracker.total_budget == 1000
        assert tracker.remaining == 1000

    def test_record(self):
        tracker = WorkflowTokenTracker()
        tracker.record("sql_generation", 100, 50)
        assert tracker.total_input == 100
        assert tracker.total_output == 50
        assert tracker.consumed == 150
        assert tracker.remaining == 24850
        assert len(tracker.calls) == 1

    def test_record_multiple(self):
        tracker = WorkflowTokenTracker()
        tracker.record("sql_generation", 100, 50)
        tracker.record("explanation", 200, 100)
        assert tracker.consumed == 450
        assert len(tracker.calls) == 2

    def test_can_proceed_true(self):
        tracker = WorkflowTokenTracker(total_budget=1000)
        assert tracker.can_proceed(500, 400) is True

    def test_can_proceed_false(self):
        tracker = WorkflowTokenTracker(total_budget=1000)
        tracker.record("op", 600, 300)
        assert tracker.can_proceed(200, 0) is False

    def test_record_budget_exceeded(self):
        tracker = WorkflowTokenTracker()
        tracker.record_budget_exceeded("explanation")
        assert len(tracker.calls) == 1
        assert tracker.calls[0]["status"] == "skipped_budget"
        assert tracker.consumed == 0  # no tokens consumed

    def test_to_dict(self):
        tracker = WorkflowTokenTracker(total_budget=5000)
        tracker.record("op", 100, 50)
        d = tracker.to_dict()
        assert d["total_budget"] == 5000
        assert d["total_input_tokens"] == 100
        assert d["total_output_tokens"] == 50
        assert d["total_tokens"] == 150
        assert d["remaining"] == 4850
        assert d["total_llm_calls"] == 1
        assert d["utilization_pct"] == 3.0
        assert "elapsed_ms" in d
        assert "calls" in d
