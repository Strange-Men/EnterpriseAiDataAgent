"""Tests for report_builder service."""

import pytest
from backend.services.report_builder import build_report, _truncate, _escape_md, _format_table


class TestBuildReport:
    def test_empty_runs(self):
        md = build_report([])
        assert "*No analysis runs selected.*" in md

    def test_title_included(self):
        md = build_report([], {"title": "My Custom Report"})
        assert "# My Custom Report" in md

    def test_single_run(self):
        runs = [{
            "question": "What is total revenue?",
            "mode": "explain",
            "table": "sales",
            "status": "success",
            "timestamp": "2026-05-25T10:00:00",
            "version": 1,
            "sections": [
                {"title": "Result", "content": "Revenue is $1M", "type": "markdown"}
            ],
        }]
        md = build_report(runs)
        assert "# Analysis Report" in md
        assert "run-1" in md
        assert "What is total revenue?" in md
        assert "explain" in md
        assert "sales" in md
        assert "Revenue is $1M" in md

    def test_table_of_contents(self):
        runs = [
            {"question": "Q1", "mode": "explain", "status": "success"},
            {"question": "Q2", "mode": "insights", "status": "success"},
        ]
        md = build_report(runs)
        assert "Table of Contents" in md
        assert "run-1" in md
        assert "run-2" in md

    def test_multi_step_results(self):
        runs = [{
            "question": "Analyze trends",
            "mode": "autonomous",
            "status": "success",
            "multiResult": {
                "plan": [
                    {"step": 1, "purpose": "Overview", "sql_goal": "COUNT rows"},
                    {"step": 2, "purpose": "Trend", "sql_goal": "GROUP BY month"},
                ],
                "steps": [
                    {"step": 1, "purpose": "Overview", "sql": "SELECT COUNT(*)", "columns": ["cnt"], "data": [{"cnt": 100}], "row_count": 1, "status": "success"},
                ],
                "summary": "Data shows growth trend",
            },
        }]
        md = build_report(runs)
        assert "Analysis Plan" in md
        assert "Overview" in md
        assert "Step Results" in md
        assert "Executive Summary" in md
        assert "growth trend" in md

    def test_error_runs(self):
        runs = [{
            "question": "Bad query",
            "mode": "explain",
            "status": "error",
            "error": "SQL syntax error",
        }]
        md = build_report(runs)
        assert "SQL syntax error" in md

    def test_include_trace(self):
        runs = [{
            "question": "Q",
            "mode": "explain",
            "status": "success",
            "trace": {
                "trace_id": "trace-123",
                "total_llm_calls": 3,
                "total_input_tokens": 1500,
                "total_output_tokens": 500,
                "guardrail_violations": ["max_steps exceeded"],
            },
        }]
        md = build_report(runs, {"include_trace": True})
        assert "trace-123" in md
        assert "3" in md  # total_llm_calls
        assert "max_steps exceeded" in md

    def test_exclude_trace_by_default(self):
        runs = [{
            "question": "Q",
            "mode": "explain",
            "status": "success",
            "trace": {"trace_id": "trace-123", "total_llm_calls": 1, "total_input_tokens": 100, "total_output_tokens": 50, "guardrail_violations": []},
        }]
        md = build_report(runs)
        assert "trace-123" not in md

    def test_notes_included(self):
        runs = [{
            "question": "Q",
            "mode": "explain",
            "status": "success",
            "notes": "Important finding",
        }]
        md = build_report(runs)
        assert "Important finding" in md

    def test_data_samples_included(self):
        runs = [{
            "question": "Q",
            "mode": "autonomous",
            "status": "success",
            "multiResult": {
                "plan": [],
                "steps": [
                    {"step": 1, "purpose": "test", "columns": ["a", "b"], "data": [{"a": 1, "b": 2}], "row_count": 1, "status": "success"},
                ],
                "summary": "",
            },
        }]
        md = build_report(runs, {"include_data_samples": True})
        assert "| a | b |" in md
        assert "| 1 | 2 |" in md

    def test_data_samples_excluded(self):
        runs = [{
            "question": "Q",
            "mode": "autonomous",
            "status": "success",
            "multiResult": {
                "plan": [],
                "steps": [
                    {"step": 1, "purpose": "test", "columns": ["a"], "data": [{"a": 1}], "row_count": 1, "status": "success"},
                ],
                "summary": "",
            },
        }]
        md = build_report(runs, {"include_data_samples": False})
        assert "| a |" not in md


class TestHelpers:
    def test_truncate_short(self):
        assert _truncate("hello", 10) == "hello"

    def test_truncate_long(self):
        assert _truncate("hello world", 8) == "hello..."

    def test_escape_md(self):
        assert _escape_md("a|b#c") == "a\\|b\\#c"

    def test_format_table(self):
        result = _format_table(["a", "b"], [{"a": "1", "b": "2"}, {"a": "3", "b": "4"}])
        assert "| a | b |" in result
        assert "| 1 | 2 |" in result
        assert "| 3 | 4 |" in result

    def test_format_table_empty(self):
        assert _format_table([], []) == ""
        assert _format_table(["a"], []) == ""
