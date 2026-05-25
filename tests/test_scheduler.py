"""Tests for scheduler.py — scheduled task management."""

import json
import os
import pytest
from backend.services.scheduler import SchedulerManager, ScheduledTask, TASKS_FILE


@pytest.fixture(autouse=True)
def cleanup_tasks_file():
    """Clean up the tasks file before and after each test."""
    if os.path.exists(TASKS_FILE):
        os.remove(TASKS_FILE)
    yield
    if os.path.exists(TASKS_FILE):
        os.remove(TASKS_FILE)


class TestScheduledTask:
    def test_create_task(self):
        task = ScheduledTask(
            id="test1", name="Test", question="q", table="t",
            columns=[], sample_rows=[], interval="daily",
        )
        assert task.enabled is True
        assert task.next_run_at is not None
        assert task.created_at != ""

    def test_is_due_false_for_future(self):
        task = ScheduledTask(
            id="test1", name="Test", question="q", table="t",
            columns=[], sample_rows=[], interval="daily",
        )
        assert task.is_due() is False

    def test_is_due_true_for_past(self):
        task = ScheduledTask(
            id="test1", name="Test", question="q", table="t",
            columns=[], sample_rows=[], interval="daily",
        )
        task.next_run_at = "2020-01-01T00:00:00"
        assert task.is_due() is True

    def test_is_due_false_when_disabled(self):
        task = ScheduledTask(
            id="test1", name="Test", question="q", table="t",
            columns=[], sample_rows=[], interval="daily",
            enabled=False, next_run_at="2020-01-01T00:00:00",
        )
        assert task.is_due() is False

    def test_to_dict(self):
        task = ScheduledTask(
            id="test1", name="Test", question="q", table="t",
            columns=[], sample_rows=[], interval="hourly",
        )
        d = task.to_dict()
        assert d["id"] == "test1"
        assert d["interval"] == "hourly"


class TestSchedulerManager:
    def test_add_and_list(self):
        mgr = SchedulerManager()
        tid = mgr.add_task("T1", "q", "t", [], [], "daily")
        assert len(mgr.list_tasks()) == 1
        assert mgr.list_tasks()[0].id == tid

    def test_remove(self):
        mgr = SchedulerManager()
        tid = mgr.add_task("T1", "q", "t", [], [], "daily")
        assert mgr.remove_task(tid) is True
        assert len(mgr.list_tasks()) == 0

    def test_remove_nonexistent(self):
        mgr = SchedulerManager()
        assert mgr.remove_task("nonexistent") is False

    def test_toggle_enabled(self):
        mgr = SchedulerManager()
        tid = mgr.add_task("T1", "q", "t", [], [], "daily")
        assert mgr.set_enabled(tid, False) is True
        assert mgr.list_tasks()[0].enabled is False
        assert mgr.list_tasks()[0].next_run_at is None

    def test_mark_executed(self):
        mgr = SchedulerManager()
        tid = mgr.add_task("T1", "q", "t", [], [], "daily")
        mgr.mark_executed(tid, success=True, summary="done")
        task = mgr.list_tasks()[0]
        assert task.last_run_at is not None
        results = mgr.get_results(tid)
        assert len(results) == 1
        assert results[0]["status"] == "success"

    def test_persistence(self):
        mgr1 = SchedulerManager()
        mgr1.add_task("T1", "q", "t", [], [], "weekly")
        mgr1.save()

        mgr2 = SchedulerManager()
        assert len(mgr2.list_tasks()) == 1
        assert mgr2.list_tasks()[0].interval == "weekly"

    def test_check_due_tasks(self):
        mgr = SchedulerManager()
        tid = mgr.add_task("T1", "q", "t", [], [], "daily")
        # Force next_run_at to past
        mgr._tasks[tid].next_run_at = "2020-01-01T00:00:00"
        due = mgr.check_due_tasks()
        assert len(due) == 1
