"""Scheduler Worker — 后台线程定时检查并执行调度任务。

简单 daemon 线程，每 60s 检查到期任务，调用 run_autonomous_analysis 执行。
"""

import threading
import time


_worker_thread: threading.Thread | None = None
_stop_event: threading.Event | None = None


def _run_due_tasks():
    """检查并执行到期任务。"""
    from backend.services.scheduler import get_manager
    from backend.services.ai_pipeline import run_autonomous_analysis

    manager = get_manager()
    due = manager.check_due_tasks()

    for task in due:
        try:
            result = run_autonomous_analysis(
                question=task.question,
                table=task.table,
                columns=task.columns,
                sample_rows=task.sample_rows,
                language=task.language,
            )
            summary = result.get("summary", "")
            manager.mark_executed(task.id, success=True, summary=summary)
        except Exception as e:
            manager.mark_executed(task.id, success=False, error=str(e))


def _worker_loop():
    """后台线程主循环。"""
    global _stop_event
    while _stop_event and not _stop_event.is_set():
        try:
            _run_due_tasks()
        except Exception:
            pass  # Don't let errors kill the worker
        _stop_event.wait(60)


def start_worker():
    """启动调度器后台线程。"""
    global _worker_thread, _stop_event
    if _worker_thread and _worker_thread.is_alive():
        return
    _stop_event = threading.Event()
    _worker_thread = threading.Thread(target=_worker_loop, daemon=True, name="scheduler-worker")
    _worker_thread.start()


def stop_worker():
    """停止调度器后台线程。"""
    global _worker_thread, _stop_event
    if _stop_event:
        _stop_event.set()
    if _worker_thread:
        _worker_thread.join(timeout=5)
        _worker_thread = None
        _stop_event = None
