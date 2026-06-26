"""Scheduled Analysis — 管理定时分析任务。

持久化到 data/scheduled_tasks.json，支持增删改查。
"""

import json
import os
import uuid
import tempfile
import threading
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta

DATA_DIR = "data"
TASKS_FILE = os.path.join(DATA_DIR, "scheduled_tasks.json")
RESULTS_FILE = os.path.join(DATA_DIR, "scheduled_results.json")


@dataclass
class ScheduledTask:
    id: str
    name: str
    question: str
    table: str
    columns: list[dict]
    sample_rows: list[dict]
    interval: str  # "hourly" | "daily" | "weekly"
    language: str = "zh"
    enabled: bool = True
    created_at: str = ""
    last_run_at: str | None = None
    next_run_at: str | None = None

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.next_run_at:
            self.next_run_at = self._compute_next_run()

    def _compute_next_run(self) -> str:
        now = datetime.now()
        if self.interval == "hourly":
            return (now + timedelta(hours=1)).isoformat()
        elif self.interval == "daily":
            return (now + timedelta(days=1)).isoformat()
        elif self.interval == "weekly":
            return (now + timedelta(weeks=1)).isoformat()
        return (now + timedelta(days=1)).isoformat()

    def to_dict(self) -> dict:
        return asdict(self)

    def is_due(self) -> bool:
        if not self.enabled or not self.next_run_at:
            return False
        try:
            return datetime.fromisoformat(self.next_run_at) <= datetime.now()
        except ValueError:
            return False


@dataclass
class ScheduleResult:
    task_id: str
    run_id: str
    status: str  # "success" | "error"
    timestamp: str = ""
    error: str | None = None
    summary: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


class SchedulerManager:
    """管理定时分析任务。"""

    def __init__(self):
        self._tasks: dict[str, ScheduledTask] = {}
        self._results: list[ScheduleResult] = []
        self._lock = threading.RLock()
        self.load()

    def add_task(self, name: str, question: str, table: str,
                 columns: list[dict], sample_rows: list[dict],
                 interval: str, language: str = "zh") -> str:
        task_id = str(uuid.uuid4())[:8]
        task = ScheduledTask(
            id=task_id,
            name=name,
            question=question,
            table=table,
            columns=columns,
            sample_rows=sample_rows,
            interval=interval,
            language=language,
        )
        self._tasks[task_id] = task
        self.save()
        return task_id

    def remove_task(self, task_id: str) -> bool:
        if task_id not in self._tasks:
            return False
        del self._tasks[task_id]
        self.save()
        return True

    def set_enabled(self, task_id: str, enabled: bool) -> bool:
        task = self._tasks.get(task_id)
        if not task:
            return False
        task.enabled = enabled
        if enabled:
            task.next_run_at = task._compute_next_run()
        else:
            task.next_run_at = None
        self.save()
        return True

    def list_tasks(self) -> list[ScheduledTask]:
        return list(self._tasks.values())

    def check_due_tasks(self) -> list[ScheduledTask]:
        return [t for t in self._tasks.values() if t.is_due()]

    def mark_executed(self, task_id: str, success: bool, error: str | None = None, summary: str | None = None):
        task = self._tasks.get(task_id)
        if not task:
            return
        now = datetime.now().isoformat()
        task.last_run_at = now
        task.next_run_at = task._compute_next_run()
        result = ScheduleResult(
            task_id=task_id,
            run_id=str(uuid.uuid4())[:8],
            status="success" if success else "error",
            timestamp=now,
            error=error,
            summary=summary,
        )
        self._results.append(result)
        # Keep only last 50 results
        self._results = self._results[-50:]
        self.save()

    def get_results(self, task_id: str) -> list[dict]:
        return [r.to_dict() for r in self._results if r.task_id == task_id]

    def save(self):
        with self._lock:
            os.makedirs(DATA_DIR, exist_ok=True)
            data = {
                "tasks": {tid: t.to_dict() for tid, t in self._tasks.items()},
                "results": [r.to_dict() for r in self._results],
            }
            tmp_name = ""
            try:
                with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=DATA_DIR, delete=False) as f:
                    tmp_name = f.name
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp_name, TASKS_FILE)
            finally:
                if tmp_name and os.path.exists(tmp_name):
                    os.unlink(tmp_name)

    def load(self):
        if not os.path.exists(TASKS_FILE):
            return
        try:
            with open(TASKS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            for tid, tdata in data.get("tasks", {}).items():
                self._tasks[tid] = ScheduledTask(**tdata)
            for rdata in data.get("results", []):
                self._results.append(ScheduleResult(**rdata))
        except (json.JSONDecodeError, KeyError, TypeError):
            pass


# Singleton
_manager: SchedulerManager | None = None


def get_manager() -> SchedulerManager:
    global _manager
    if _manager is None:
        _manager = SchedulerManager()
    return _manager
