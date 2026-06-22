"""M4-7.1.1 Online Regression Tests.

Covers the backend fixes for:
- Empty SQL handling (skipped_generation_error)
- CANNOT_ANSWER handling (skipped_no_data)
- Skipped steps in executive summary
- Overall status determination with skipped steps
"""

import pytest
from unittest.mock import MagicMock, patch
from backend.services.ai_pipeline import (
    _make_step_result,
    _build_diagnostics,
    _build_executive_summary,
    _determine_overall_status,
)


class TestMakeStepResult:
    """Test _make_step_result with various status types."""

    def test_success_step(self):
        result = _make_step_result(1, "Test purpose", sql="SELECT 1",
                                   columns=["col"], data=[{"col": 1}],
                                   row_count=1, status="success")
        assert result["step"] == 1
        assert result["status"] == "success"
        assert "error" not in result  # No error field when not provided

    def test_skipped_no_data_step(self):
        result = _make_step_result(1, "Test purpose", sql="-- CANNOT_ANSWER: missing field",
                                   error="当前数据缺少所需字段", status="skipped_no_data")
        assert result["step"] == 1
        assert result["status"] == "skipped_no_data"
        assert result["error"] == "当前数据缺少所需字段"

    def test_skipped_generation_error_step(self):
        result = _make_step_result(1, "Test purpose",
                                   error="AI 未能生成有效 SQL",
                                   status="skipped_generation_error")
        assert result["step"] == 1
        assert result["status"] == "skipped_generation_error"
        assert result["error"] == "AI 未能生成有效 SQL"

    def test_error_step(self):
        result = _make_step_result(1, "Test purpose",
                                   error="Database connection failed",
                                   status="error")
        assert result["step"] == 1
        assert result["status"] == "error"
        assert result["error"] == "Database connection failed"


class TestBuildDiagnostics:
    """Test _build_diagnostics with mixed step outcomes."""

    def test_all_success_returns_none(self):
        steps = [
            _make_step_result(1, "Step 1", data=[{"col": 1}], row_count=1, status="success"),
            _make_step_result(2, "Step 2", data=[{"col": 2}], row_count=1, status="success"),
        ]
        assert _build_diagnostics(steps) is None

    def test_all_failed_returns_diagnostics(self):
        steps = [
            _make_step_result(1, "Step 1", error="fail", status="error"),
            _make_step_result(2, "Step 2", error="fail", status="error"),
        ]
        diag = _build_diagnostics(steps)
        assert diag is not None
        assert "2 steps failed" in diag["message"]

    def test_mixed_success_and_skipped_returns_none(self):
        steps = [
            _make_step_result(1, "Step 1", data=[{"col": 1}], row_count=1, status="success"),
            _make_step_result(2, "Step 2", error="data not available", status="skipped_no_data"),
        ]
        # Has a success step, so not all failed
        assert _build_diagnostics(steps) is None

    def test_all_skipped_returns_diagnostics(self):
        steps = [
            _make_step_result(1, "Step 1", error="missing field", status="skipped_no_data"),
            _make_step_result(2, "Step 2", error="AI 未能生成有效 SQL", status="skipped_generation_error"),
        ]
        diag = _build_diagnostics(steps)
        assert diag is not None
        assert "2 steps failed" in diag["message"]


class TestDetermineOverallStatus:
    """Test _determine_overall_status with various step combinations."""

    def test_all_success(self):
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}]},
            {"step": 2, "status": "success", "data": [{"col": 2}]},
        ]
        assert _determine_overall_status(steps, []) == "success"

    def test_with_skipped_steps_returns_partial(self):
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}]},
            {"step": 2, "status": "skipped_no_data", "error": "missing field"},
        ]
        assert _determine_overall_status(steps, []) == "partial"

    def test_with_error_steps_returns_partial(self):
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}]},
            {"step": 2, "status": "error", "error": "db error"},
        ]
        assert _determine_overall_status(steps, []) == "partial"

    def test_all_failed_no_success_returns_error(self):
        steps = [
            {"step": 1, "status": "error", "error": "fail"},
            {"step": 2, "status": "error", "error": "fail2"},
        ]
        assert _determine_overall_status(steps, []) == "error"

    def test_all_skipped_no_success_returns_error(self):
        steps = [
            {"step": 1, "status": "skipped_no_data", "error": "missing"},
            {"step": 2, "status": "skipped_generation_error", "error": "no sql"},
        ]
        # All steps have no successful data, so status should be "error"
        assert _determine_overall_status(steps, []) == "error"

    def test_guardrail_violations_make_partial(self):
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}]},
        ]
        violations = ["MAX_ROWS: exceeded"]
        assert _determine_overall_status(steps, violations) == "partial"


class TestBuildExecutiveSummary:
    """Test _build_executive_summary includes skipped step info.

    _build_executive_summary calls _call_llm internally, so we mock it to test
    the step-processing logic that builds the prompt input.
    """

    def _make_tracker_and_trace(self):
        """Create mock tracker and trace for _build_executive_summary."""
        tracker = MagicMock()
        tracker.max_sample_rows = 3
        trace = MagicMock()
        return tracker, trace

    @patch("backend.services.ai_pipeline._call_llm")
    def test_success_steps_show_checkmark(self, mock_llm):
        mock_llm.return_value = "Test summary"
        tracker, trace = self._make_tracker_and_trace()
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}], "purpose": "Analyze", "row_count": 1},
        ]
        summary = _build_executive_summary("Test question", steps, "zh", tracker, trace)
        # Verify _call_llm was called (summary was generated)
        mock_llm.assert_called_once()
        # Verify the prompt input contains the checkmark
        call_args = mock_llm.call_args
        user_msg = call_args[0][1] if len(call_args[0]) > 1 else call_args[1].get("user_message", "")
        assert "✓" in str(user_msg)

    @patch("backend.services.ai_pipeline._call_llm")
    def test_error_steps_show_x(self, mock_llm):
        mock_llm.return_value = "Test summary"
        tracker, trace = self._make_tracker_and_trace()
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}], "purpose": "Query", "row_count": 1},
            {"step": 2, "status": "error", "error": "db fail", "purpose": "Query"},
        ]
        summary = _build_executive_summary("Test question", steps, "zh", tracker, trace)
        call_args = mock_llm.call_args
        user_msg = str(call_args[0][1] if len(call_args[0]) > 1 else "")
        assert "✗" in user_msg

    @patch("backend.services.ai_pipeline._call_llm")
    def test_skipped_steps_show_skip_symbol(self, mock_llm):
        mock_llm.return_value = "Test summary"
        tracker, trace = self._make_tracker_and_trace()
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}], "purpose": "Query", "row_count": 1},
            {"step": 2, "status": "skipped_no_data", "error": "missing field", "purpose": "Analyze"},
        ]
        summary = _build_executive_summary("Test question", steps, "zh", tracker, trace)
        call_args = mock_llm.call_args
        user_msg = str(call_args[0][1] if len(call_args[0]) > 1 else "")
        assert "⊘" in user_msg

    @patch("backend.services.ai_pipeline._call_llm")
    def test_skipped_steps_include_reason(self, mock_llm):
        mock_llm.return_value = "Test summary"
        tracker, trace = self._make_tracker_and_trace()
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}], "purpose": "Query", "row_count": 1},
            {"step": 2, "status": "skipped_no_data", "error": "当前数据缺少所需字段", "purpose": "Analyze revenue"},
        ]
        summary = _build_executive_summary("Test question", steps, "zh", tracker, trace)
        call_args = mock_llm.call_args
        user_msg = str(call_args[0][1] if len(call_args[0]) > 1 else "")
        assert "Skipped" in user_msg
        assert "当前数据缺少所需字段" in user_msg

    @patch("backend.services.ai_pipeline._call_llm")
    def test_mixed_steps_in_summary(self, mock_llm):
        mock_llm.return_value = "Test summary"
        tracker, trace = self._make_tracker_and_trace()
        steps = [
            {"step": 1, "status": "success", "data": [{"col": 1}], "purpose": "Query data", "row_count": 1},
            {"step": 2, "status": "skipped_no_data", "error": "missing field", "purpose": "Analyze trend"},
            {"step": 3, "status": "error", "error": "timeout", "purpose": "Generate chart"},
        ]
        summary = _build_executive_summary("Test question", steps, "zh", tracker, trace)
        call_args = mock_llm.call_args
        user_msg = str(call_args[0][1] if len(call_args[0]) > 1 else "")
        assert "✓" in user_msg
        assert "⊘" in user_msg
        assert "✗" in user_msg

    @patch("backend.services.ai_pipeline._call_llm")
    def test_all_failed_returns_empty(self, mock_llm):
        tracker, trace = self._make_tracker_and_trace()
        steps = [
            {"step": 1, "status": "error", "error": "fail", "purpose": "Query"},
        ]
        summary = _build_executive_summary("Test question", steps, "zh", tracker, trace)
        # Should return empty when no successful steps
        assert summary == ""
        # LLM should not be called
        mock_llm.assert_not_called()
