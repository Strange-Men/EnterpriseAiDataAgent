# M4-7.2 Merge Validation

## 1. Source Branch
`m4-7-2-state-boundary-cleanup`

## 2. CI Failure Root Cause

**失败测试**: `tests/test_m4_7_2_table_boundary.py::TestTableBoundaryValidation::test_normal_select_works`

**错误信息**: `Catalog Error: Table with name test_select does not exist!`

**根因**: `DatabaseManager.reset_instance()` 在多个测试文件中被调用（`test_error_sanitization.py`, `test_query_executor.py`, `test_m4_7_1_7_sql_safety_error_semantics.py` 等），该方法将 `DatabaseManager._instance` 设为 `None` 并关闭连接。但 `data_service.py` 中的 `_db` 仍持有旧实例引用，而 `_readonly_executor` 也持有旧实例引用。

当后续测试运行时：
1. `get_db()` 发现 `_db is not None`，返回旧实例
2. 但 `test_error_sanitization.py` 的 fixture 将 `_db = None`，下次 `get_db()` 创建新实例
3. `_readonly_executor` 未被重置，仍持有旧 `DatabaseManager` 实例
4. Upload 使用新实例创建表，Query 使用旧实例查询 → 表不存在

**是否 CI-only**: 否，本地完整测试套件也复现

## 3. Fix

**文件**: `backend/services/data_service.py`

**修改**: `get_executor()` 和 `get_readonly_executor()` 增加 stale reference 检查。当 `_executor.db` 或 `_readonly_executor.db` 与当前 `get_db()` 返回的实例不一致时，重新创建 executor。

```python
def get_readonly_executor() -> QueryExecutor:
    global _readonly_executor
    current_db = get_db()
    if _readonly_executor is None or _readonly_executor.db is not current_db:
        with _init_lock:
            if _readonly_executor is None or _readonly_executor.db is not current_db:
                _readonly_executor = QueryExecutor(current_db, readonly=True)
    return _readonly_executor
```

## 4. M4-7.2 Summary
- `activeTable` / `selectedTable` / `currentDataset` 状态边界统一
- 数据页、自然语言查询、专家 SQL、History Recall table 参数统一
- table 不存在返回 400
- 上传/删除/历史表不存在/localStorage 过期等边界处理
- 新增 6 个后端边界测试 + 前端 investigation store 测试

## 5. Local Validation

| 项目 | 结果 |
|------|------|
| backend import | ✅ OK |
| pytest (558 tests) | ✅ 全部通过 |
| frontend tsc | ✅ 无错误 |
| frontend tests (271) | ✅ 全部通过 |
| frontend build | ✅ 成功 |
| frontend lint | ✅ 仅 warning，无 error |

## 6. CI Validation

| 项目 | 结果 |
|------|------|
| branch backend | ✅ 通过 |
| branch frontend | ✅ 通过 |

## 7. Next Step
线上快速验证表选择和历史回查。
通过后再进入 M4-8 UI/UX Redesign。
M4-8 必须严格按用户的"前端工作流"和"九准备五关键"小步迭代，不得直接大改 UI。
暂不进入 M5 Agent。
暂不打 tag。
