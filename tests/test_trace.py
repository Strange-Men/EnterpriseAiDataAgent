"""Tests for Trace module."""

import json
import os
import tempfile

import pytest
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.trace import TraceRecorder, TraceEvent, AnalysisTrace


class TestTraceRecorder:
    def test_init(self):
        recorder = TraceRecorder(question="What is sales?", table="sales", mode="query")
        assert recorder.trace.question == "What is sales?"
        assert recorder.trace.table == "sales"
        assert recorder.trace.mode == "query"
        assert recorder.trace.language == "zh"
        assert recorder.trace.total_llm_calls == 0
        assert len(recorder.trace.events) == 0

    def test_record_llm_call(self):
        recorder = TraceRecorder(question="test")
        recorder.record_llm_call(
            operation="sql_generation",
            phase="planning",
            prompt_name="sql_generation",
            input_text="SELECT * FROM sales",
            output_text="SELECT COUNT(*) FROM sales",
            latency_ms=150.0,
            status="success",
        )
        assert len(recorder.trace.events) == 1
        assert recorder.trace.total_llm_calls == 1
        assert recorder.trace.total_input_tokens > 0
        assert recorder.trace.total_output_tokens > 0

        event = recorder.trace.events[0]
        assert event.operation == "sql_generation"
        assert event.phase == "planning"
        assert event.prompt_name == "sql_generation"
        assert event.status == "success"
        assert event.latency_ms == 150.0

    def test_record_multiple_calls_accumulates(self):
        recorder = TraceRecorder(question="test")
        for i in range(3):
            recorder.record_llm_call(
                operation="explanation",
                phase=f"step_{i}",
                prompt_name="explanation",
                input_text="input",
                output_text="output",
                latency_ms=100.0,
                status="success",
            )
        assert recorder.trace.total_llm_calls == 3
        assert len(recorder.trace.events) == 3

    def test_record_with_error(self):
        recorder = TraceRecorder(question="test")
        recorder.record_llm_call(
            operation="sql_generation",
            phase="planning",
            prompt_name="sql_generation",
            input_text="input",
            output_text="",
            latency_ms=50.0,
            status="error",
            error="API timeout",
            sql="SELECT 1",
            step=1,
        )
        event = recorder.trace.events[0]
        assert event.status == "error"
        assert event.error == "API timeout"
        assert event.sql == "SELECT 1"
        assert event.step == 1

    def test_record_guardrail_violation(self):
        recorder = TraceRecorder(question="test")
        recorder.record_guardrail_violation("max_steps", "too many steps")
        assert len(recorder.trace.guardrail_violations) == 1
        assert "max_steps" in recorder.trace.guardrail_violations[0]

    def test_set_plan(self):
        recorder = TraceRecorder(question="test")
        plan = [{"step": 1, "purpose": "count rows"}]
        recorder.set_plan(plan)
        assert recorder.trace.plan == plan

    def test_finish(self):
        recorder = TraceRecorder(question="test")
        result = recorder.finish(status="partial")
        assert result.status == "partial"
        assert result.end_time is not None

    def test_to_dict_before_finish(self):
        recorder = TraceRecorder(question="test", table="sales", mode="query")
        d = recorder.to_dict()
        assert d["question"] == "test"
        assert d["table"] == "sales"
        assert d["mode"] == "query"
        assert d["status"] == "in_progress"
        assert d["elapsed_ms"] is None
        assert d["total_llm_calls"] == 0
        assert isinstance(d["events"], list)
        assert isinstance(d["plan"], list)
        assert isinstance(d["guardrail_violations"], list)

    def test_to_dict_after_finish(self):
        recorder = TraceRecorder(question="test")
        recorder.finish("success")
        d = recorder.to_dict()
        assert d["status"] == "success"
        assert d["elapsed_ms"] is not None
        assert d["elapsed_ms"] >= 0
