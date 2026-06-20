# M3-1 Scheduler Worker Verification — EnterpriseAiDataAgent

## 1. Summary

- **Scheduler 最终状态**: `BLOCKED_BY_CREDENTIAL`
- **是否阻塞主链路**: NO
- **是否需要立即修代码**: NO
- **是否应该作为核心功能展示**: NO — 应标注为 experimental

Scheduler 的 task 管理层（创建、保存、查询、删除、启用/禁用）完全可用，12 个单元测试全部通过。Worker 后台线程已启动且存活。但由于 AI API Key 返回 401，无法验证到期任务的真实执行和结果保存。

---

## 2. Static Code Review

### Task Model

- `ScheduledTask` dataclass（`backend/services/scheduler.py:21`）
- 字段：id, name, question, table, columns, sample_rows, interval (hourly/daily/weekly), language, enabled, created_at, last_run_at, next_run_at
- `is_due()` 方法：比较 `next_run_at` 与当前时间

### Storage Mechanism

- JSON 文件：`data/scheduled_tasks.json`
- 原子写入：tempfile + `os.replace()`
- 结果上限：50 条（`_results = self._results[-50:]`）
- 线程安全：`threading.RLock()`

### API Routes（`backend/routes/ai.py:536-588`）

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/api/ai/schedule` | 创建任务 |
| GET | `/api/ai/schedule` | 列出所有任务 |
| DELETE | `/api/ai/schedule/{task_id}` | 删除任务 |
| PATCH | `/api/ai/schedule/{task_id}` | 启用/禁用任务 |
| GET | `/api/ai/schedule/{task_id}/results` | 获取执行结果 |

### Worker Startup（`backend/main.py:77-84`）

- `lifespan()` 函数在 FastAPI 启动时调用 `start_worker()`
- 关闭时调用 `stop_worker()`
- 异常不阻塞应用启动（`non-fatal`）

### Worker Loop（`backend/runtime/scheduler_worker.py:37-45`）

- Daemon 线程，每 60 秒检查一次
- `_run_due_tasks()` 获取到期任务并执行
- 异常不杀死 worker（`pass`）

### Execution Path

- Worker 调用 `run_autonomous_analysis()`（`backend/services/ai_pipeline.py:397`）
- 该函数执行：plan → execute steps → summary
- 依赖 LLM API 调用

### Result Persistence

- `mark_executed()` 保存结果到 `_results` 列表
- 包含：task_id, run_id, status, timestamp, error, summary
- 自动保存到 JSON 文件

### Error Handling

- 执行失败捕获异常，记录到 results
- Worker 循环异常不中断

---

## 3. Test Results

```
tests/test_scheduler.py::TestScheduledTask::test_create_task PASSED
tests/test_scheduler.py::TestScheduledTask::test_is_due_false_for_future PASSED
tests/test_scheduler.py::TestScheduledTask::test_is_due_true_for_past PASSED
tests/test_scheduler.py::TestScheduledTask::test_is_due_false_when_disabled PASSED
tests/test_scheduler.py::TestScheduledTask::test_to_dict PASSED
tests/test_scheduler.py::TestSchedulerManager::test_add_and_list PASSED
tests/test_scheduler.py::TestSchedulerManager::test_remove PASSED
tests/test_scheduler.py::TestSchedulerManager::test_remove_nonexistent PASSED
tests/test_scheduler.py::TestSchedulerManager::test_toggle_enabled PASSED
tests/test_scheduler.py::TestSchedulerManager::test_mark_executed PASSED
tests/test_scheduler.py::TestSchedulerManager::test_persistence PASSED
tests/test_scheduler.py::TestSchedulerManager::test_check_due_tasks PASSED

12 passed, 439 deselected
```

- **测试覆盖**: Task 创建、due 检测、增删改查、持久化、执行标记
- **缺失**: Worker 执行路径测试（需要 mock AI 调用）

---

## 4. API Verification

| Action | Method | Endpoint | Result | Notes |
|--------|--------|----------|--------|-------|
| Create task | POST | `/api/ai/schedule` | 200 | 返回 task_id |
| List tasks | GET | `/api/ai/schedule` | 200 | 返回 tasks 数组 |
| Get results | GET | `/api/ai/schedule/{id}/results` | 200 | 返回 results 数组 |
| Toggle enabled | PATCH | `/api/ai/schedule/{id}` | 200 | 成功切换 |
| Delete task | DELETE | `/api/ai/schedule/{id}` | 200 | 成功删除 |

---

## 5. Execution Verification

- **Worker 是否存活**: YES（`/api/health/system` 显示 `worker_alive: true`）
- **是否真实触发后台执行**: 未验证（需要等待 60 秒检查周期 + 有效 API Key）
- **是否调用 AI 分析**: 代码路径确认调用 `run_autonomous_analysis()`
- **是否保存结果**: 代码路径确认调用 `mark_executed()`
- **是否受 API Key 影响**: YES — `run_autonomous_analysis()` 调用 LLM，需要有效 Key
- **API Key 状态**: 返回 401 Invalid API Key

**结论**: 执行层被凭证阻塞（`BLOCKED_BY_CREDENTIAL`）

---

## 6. Final Decision

- **Can be described as core feature?**: NO
- **Should be marked experimental?**: YES
- **Blocks M3?**: NO
- **Needs code fix now?**: NO

---

## 7. Next Action

Scheduler task 管理层完整可用，但执行层依赖有效 API Key。建议：

1. **进入 M3-2 Docker Validation** — scheduler 不阻塞主链路
2. **等待有效 API Key 后复验执行层** — 需要验证：
   - Worker 是否在 60 秒内检测到到期任务
   - `run_autonomous_analysis()` 是否成功执行
   - 结果是否正确保存到 JSON
3. **README 中继续标注为 experimental** — 不能作为核心功能展示
