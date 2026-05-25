"""Tests for Guardrails module."""

import time
from unittest.mock import patch

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.guardrails import (
    AnalysisGuardrails,
    AnalysisGuard,
    GuardrailViolation,
    DEFAULT_GUARDRAILS,
    STRICT_GUARDRAILS,
)


class TestAnalysisGuardrailsDefaults:
    def test_default_values(self):
        g = AnalysisGuardrails()
        assert g.max_steps == 6
        assert g.max_sql_queries == 8
        assert g.max_consecutive_failures == 2
        assert g.max_total_time_seconds == 120
        assert g.max_step_time_seconds == 30
        assert g.max_recursion_depth == 2
        assert g.require_minimum_success == 1

    def test_strict_values(self):
        assert STRICT_GUARDRAILS.max_steps == 4
        assert STRICT_GUARDRAILS.max_sql_queries == 5
        assert STRICT_GUARDRAILS.max_consecutive_failures == 1
        assert STRICT_GUARDRAILS.max_total_time_seconds == 60

    def test_custom_values(self):
        g = AnalysisGuardrails(max_steps=10, max_sql_queries=20)
        assert g.max_steps == 10
        assert g.max_sql_queries == 20
        assert g.max_consecutive_failures == 2  # default


class TestAnalysisGuard:
    def test_initial_state(self):
        guard = AnalysisGuard()
        assert guard.steps_executed == 0
        assert guard.sql_queries == 0
        assert guard.consecutive_failures == 0
        assert guard.step_start_time is None

    def test_check_before_step_passes(self):
        guard = AnalysisGuard()
        guard.check_before_step({}, [])
        # Should not raise

    def test_max_steps_violation(self):
        guard = AnalysisGuard(AnalysisGuardrails(max_steps=2))
        guard.steps_executed = 2
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_before_step({}, [])
        assert exc_info.value.rule == "max_steps"

    def test_max_sql_queries_violation(self):
        guard = AnalysisGuard(AnalysisGuardrails(max_sql_queries=3))
        guard.sql_queries = 3
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_before_step({}, [])
        assert exc_info.value.rule == "max_sql_queries"

    def test_total_timeout_violation(self):
        guard = AnalysisGuard(AnalysisGuardrails(max_total_time_seconds=1))
        guard.start_time = time.time() - 2  # 2 seconds ago
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_before_step({}, [])
        assert exc_info.value.rule == "total_timeout"

    def test_step_timeout_violation(self):
        guard = AnalysisGuard(AnalysisGuardrails(max_step_time_seconds=1))
        guard.step_start_time = time.time() - 2  # previous step took 2s
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_before_step({}, [])
        assert exc_info.value.rule == "step_timeout"

    def test_consecutive_failures_violation(self):
        guard = AnalysisGuard(AnalysisGuardrails(max_consecutive_failures=2))
        guard.consecutive_failures = 2
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_before_step({}, [])
        assert exc_info.value.rule == "consecutive_failures"

    def test_recursion_depth_violation(self):
        guard = AnalysisGuard(AnalysisGuardrails(max_recursion_depth=1))
        executed = [
            {"step": 1, "depends_on": None},
            {"step": 2, "depends_on": 1},
        ]
        step_def = {"step": 3, "depends_on": 2}  # depth = 2
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_before_step(step_def, executed)
        assert exc_info.value.rule == "recursion_depth"

    def test_record_step_result_success(self):
        guard = AnalysisGuard()
        guard.record_step_result(True)
        assert guard.steps_executed == 1
        assert guard.sql_queries == 1
        assert guard.consecutive_failures == 0

    def test_record_step_result_failure(self):
        guard = AnalysisGuard()
        guard.record_step_result(False)
        assert guard.steps_executed == 1
        assert guard.sql_queries == 1
        assert guard.consecutive_failures == 1

    def test_record_success_resets_consecutive_failures(self):
        guard = AnalysisGuard()
        guard.record_step_result(False)
        guard.record_step_result(False)
        assert guard.consecutive_failures == 2
        guard.record_step_result(True)
        assert guard.consecutive_failures == 0

    def test_check_after_all_passes(self):
        guard = AnalysisGuard()
        steps = [{"status": "success"}, {"status": "error"}]
        guard.check_after_all(steps)  # should not raise

    def test_check_after_all_fails(self):
        guard = AnalysisGuard(AnalysisGuardrails(require_minimum_success=2))
        steps = [{"status": "success"}, {"status": "error"}]
        with pytest.raises(GuardrailViolation) as exc_info:
            guard.check_after_all(steps)
        assert exc_info.value.rule == "minimum_success"

    def test_to_dict(self):
        guard = AnalysisGuard()
        guard.record_step_result(True)
        d = guard.to_dict()
        assert d["steps_executed"] == 1
        assert d["sql_queries"] == 1
        assert d["consecutive_failures"] == 0
        assert "config" in d
        assert "elapsed_seconds" in d


class TestChainDepth:
    def test_no_dependency(self):
        guard = AnalysisGuard()
        assert guard._chain_depth({}, []) == 0

    def test_linear_chain(self):
        guard = AnalysisGuard()
        executed = [
            {"step": 1, "depends_on": None},
            {"step": 2, "depends_on": 1},
            {"step": 3, "depends_on": 2},
        ]
        assert guard._chain_depth({"step": 4, "depends_on": 3}, executed) == 3

    def test_circular_dependency(self):
        guard = AnalysisGuard()
        executed = [
            {"step": 1, "depends_on": 2},
            {"step": 2, "depends_on": 1},
        ]
        depth = guard._chain_depth({"step": 3, "depends_on": 1}, executed)
        assert depth == 999  # circular


class TestGuardrailViolation:
    def test_exception_attributes(self):
        exc = GuardrailViolation("max_steps", "too many steps", {"step": 7})
        assert exc.rule == "max_steps"
        assert exc.message == "too many steps"
        assert exc.context == {"step": 7}
        assert "max_steps" in str(exc)
