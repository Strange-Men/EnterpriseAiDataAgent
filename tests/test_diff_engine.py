"""Tests for diff_engine.py — analysis comparison logic."""

import pytest
from backend.services.diff_engine import diff_runs, _diff_sections, _diff_sql, _diff_metrics, _extract_sql, _estimate_row_count


def _make_run(
    id: str = "r1",
    sections: list[dict] | None = None,
    multi_result: dict | None = None,
    trace: dict | None = None,
) -> dict:
    return {
        "id": id,
        "mode": "autonomous",
        "question": "test question",
        "sections": sections or [],
        "multiResult": multi_result,
        "trace": trace,
    }


class TestDiffRuns:
    def test_identical_runs_no_diff(self):
        run = _make_run(
            sections=[{"title": "Summary", "content": "Hello", "type": "markdown"}],
            trace={"total_output_tokens": 100, "total_llm_calls": 2},
        )
        result = diff_runs(run, run)
        assert result["summary"]["sections_changed"] == 0
        assert result["summary"]["sections_added"] == 0
        assert result["summary"]["sections_removed"] == 0
        assert result["summary"]["sql_changed"] is False
        assert result["summary"]["has_metrics_delta"] is False

    def test_section_added(self):
        a = _make_run(sections=[])
        b = _make_run(sections=[{"title": "New", "content": "data", "type": "markdown"}])
        result = diff_runs(a, b)
        assert result["summary"]["sections_added"] == 1
        assert result["sections_diff"][0]["change"] == "added"

    def test_section_removed(self):
        a = _make_run(sections=[{"title": "Old", "content": "data", "type": "markdown"}])
        b = _make_run(sections=[])
        result = diff_runs(a, b)
        assert result["summary"]["sections_removed"] == 1
        assert result["sections_diff"][0]["change"] == "removed"

    def test_section_changed(self):
        a = _make_run(sections=[{"title": "S", "content": "old", "type": "markdown"}])
        b = _make_run(sections=[{"title": "S", "content": "new", "type": "markdown"}])
        result = diff_runs(a, b)
        assert result["summary"]["sections_changed"] == 1
        assert result["sections_diff"][0]["change"] == "changed"

    def test_section_unchanged(self):
        a = _make_run(sections=[{"title": "S", "content": "same", "type": "markdown"}])
        b = _make_run(sections=[{"title": "S", "content": "same", "type": "markdown"}])
        result = diff_runs(a, b)
        assert result["summary"]["sections_unchanged"] == 1

    def test_metrics_delta(self):
        a = _make_run(trace={"total_output_tokens": 100, "total_llm_calls": 2})
        b = _make_run(trace={"total_output_tokens": 200, "total_llm_calls": 3})
        result = diff_runs(a, b)
        assert result["metrics_diff"]["tokens"]["delta"] == 100
        assert result["metrics_diff"]["llm_calls"]["delta"] == 1

    def test_row_count_delta(self):
        a = _make_run(multi_result={"steps": [{"row_count": 10}]})
        b = _make_run(multi_result={"steps": [{"row_count": 25}]})
        result = diff_runs(a, b)
        assert result["metrics_diff"]["row_count"]["delta"] == 15


class TestDiffSections:
    def test_empty_both(self):
        assert _diff_sections([], []) == []

    def test_multiple_changes(self):
        a = [
            {"title": "A", "content": "a", "type": "markdown"},
            {"title": "B", "content": "b", "type": "markdown"},
        ]
        b = [
            {"title": "A", "content": "a_mod", "type": "markdown"},
            {"title": "C", "content": "c", "type": "markdown"},
        ]
        result = _diff_sections(a, b)
        changes = {s["title"]: s["change"] for s in result}
        assert changes["A"] == "changed"
        assert changes["B"] == "removed"
        assert changes["C"] == "added"


class TestDiffSql:
    def test_no_sql(self):
        a = _make_run()
        b = _make_run()
        result = _diff_sql(a, b)
        assert result["changed"] is False

    def test_sql_from_multi_result(self):
        a = _make_run(multi_result={"steps": [{"sql": "SELECT 1"}]})
        b = _make_run(multi_result={"steps": [{"sql": "SELECT 2"}]})
        result = _diff_sql(a, b)
        assert result["changed"] is True
        assert result["old"] == "SELECT 1"
        assert result["new"] == "SELECT 2"


class TestExtractSql:
    def test_from_multi_result(self):
        run = _make_run(multi_result={"steps": [{"sql": "SELECT *"}, {"sql": "SELECT COUNT(*)"}]})
        assert _extract_sql(run) == "SELECT *\n---\nSELECT COUNT(*)"

    def test_from_sections(self):
        run = _make_run(sections=[{"title": "SQL", "content": "SELECT 1", "type": "sql"}])
        assert _extract_sql(run) == "SELECT 1"

    def test_none(self):
        assert _extract_sql(_make_run()) is None


class TestEstimateRowCount:
    def test_from_multi_result(self):
        run = _make_run(multi_result={"steps": [{"row_count": 10}, {"row_count": 20}]})
        assert _estimate_row_count(run) == 30

    def test_no_multi_result(self):
        assert _estimate_row_count(_make_run()) == 0
