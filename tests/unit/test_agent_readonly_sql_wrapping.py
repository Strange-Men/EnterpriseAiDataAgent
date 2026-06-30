from pathlib import Path

from backend.agent.contracts import AgentStatus, ToolResultStatus
from backend.agent.langchain_adapter import run_langchain_mock_agent
from backend.agent.mock_runner import run_mock_agent
from backend.agent.pipeline_adapter import execute_readonly_sql_with_existing_executor
from backend.agent.tools import execute_readonly_sql_real_path, get_default_tool_registry


PIPELINE_ADAPTER_PATH = Path("backend/agent/pipeline_adapter.py")
TOOLS_PATH = Path("backend/agent/tools.py")


class FakeReadonlyExecutor:
    def execute(self, sql: str, row_limit: int = 50) -> dict:
        return {
            "sql": sql,
            "columns": ["channel", "revenue"],
            "rows": [{"channel": "organic", "revenue": 100}],
            "row_count": 1,
            "status": "success",
            "error": None,
        }


class ExistingShapeExecutor:
    def execute(self, sql: str) -> dict:
        return {
            "sql": sql,
            "columns": ["channel", "revenue"],
            "data": [
                {"channel": "organic", "revenue": 100},
                {"channel": "paid", "revenue": 90},
            ],
            "row_count": 2,
            "status": "success",
            "error": None,
        }


class FailingExecutor:
    def execute(self, sql: str, row_limit: int = 50) -> dict:
        raise RuntimeError("boom")


def test_mock_path_stays_default_for_registry() -> None:
    registry = get_default_tool_registry()
    result = registry.call_tool("execute_readonly_sql", {"sql": "SELECT * FROM mock_sales"})

    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is True
    assert result.output["row_count"] > 0


def test_real_path_with_fake_executor_returns_tool_result() -> None:
    result = execute_readonly_sql_with_existing_executor(
        sql="SELECT channel, revenue FROM sales",
        table_name="sales",
        row_limit=10,
        executor=FakeReadonlyExecutor(),
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is False
    assert result.output["row_count"] == 1
    assert result.output["columns"] == ["channel", "revenue"]
    assert result.output["rows"] == [{"channel": "organic", "revenue": 100}]
    assert result.evidence_refs


def test_real_path_normalizes_existing_executor_shape_and_row_limit() -> None:
    result = execute_readonly_sql_with_existing_executor(
        sql="SELECT channel, revenue FROM sales",
        row_limit=1,
        executor=ExistingShapeExecutor(),
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is False
    assert result.output["row_count"] == 2
    assert len(result.output["rows"]) == 1
    assert result.output["columns"] == ["channel", "revenue"]


def test_real_path_tools_helper_is_explicit_and_not_default() -> None:
    result = execute_readonly_sql_real_path(
        {"sql": "SELECT channel, revenue FROM sales", "row_limit": 1},
        executor=FakeReadonlyExecutor(),
        table_name="sales",
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.is_simulated is False
    assert result.output["row_count"] == 1


def test_real_path_requires_explicit_executor_by_default() -> None:
    result = execute_readonly_sql_with_existing_executor(sql="SELECT * FROM sales")

    assert result.status == ToolResultStatus.FAILED
    assert result.is_simulated is False
    assert "Executor is required" in (result.error or "")


def test_real_path_rejects_invalid_row_limit() -> None:
    result = execute_readonly_sql_with_existing_executor(
        sql="SELECT * FROM sales",
        row_limit=0,
        executor=FakeReadonlyExecutor(),
    )

    assert result.status == ToolResultStatus.REJECTED
    assert result.is_simulated is False
    assert result.error


def test_real_path_rejects_unsafe_sql() -> None:
    unsafe_sql = [
        "DROP TABLE sales",
        "DELETE FROM sales",
        "UPDATE sales SET revenue = 0",
        "INSERT INTO sales VALUES (1)",
        "ALTER TABLE sales ADD COLUMN x INTEGER",
        "CREATE TABLE x AS SELECT 1",
        "TRUNCATE TABLE sales",
        "MERGE INTO sales USING other ON sales.id = other.id",
        "REPLACE INTO sales VALUES (1)",
        "ATTACH 'x.db'",
        "DETACH x",
        "COPY sales TO 'x.csv'",
        "PRAGMA table_info(sales)",
        "SELECT * FROM sales; DROP TABLE sales",
    ]

    for sql in unsafe_sql:
        result = execute_readonly_sql_with_existing_executor(sql=sql, executor=FakeReadonlyExecutor())
        assert result.status == ToolResultStatus.REJECTED, sql
        assert result.is_simulated is False
        assert result.error


def test_real_path_execution_failure_is_normalized() -> None:
    result = execute_readonly_sql_with_existing_executor(
        sql="SELECT * FROM sales",
        executor=FailingExecutor(),
    )

    assert result.status == ToolResultStatus.FAILED
    assert result.is_simulated is False
    assert "boom" in (result.error or "")


def test_existing_mock_runners_still_use_simulated_mock_path() -> None:
    native_run = run_mock_agent("请深入分析销售趋势并给出证据")
    adapter_run = run_langchain_mock_agent("请深入分析销售趋势并给出证据")

    assert native_run.status == AgentStatus.COMPLETED
    assert native_run.is_simulated is True
    assert native_run.tool_calls
    assert all(call.is_simulated for call in native_run.tool_calls)

    assert adapter_run.status == AgentStatus.COMPLETED
    assert adapter_run.is_simulated is True
    assert adapter_run.tool_calls
    assert all(call.is_simulated for call in adapter_run.tool_calls)


def test_no_forbidden_dependency_or_behavior_leakage() -> None:
    adapter_source = PIPELINE_ADAPTER_PATH.read_text(encoding="utf-8").lower()
    tools_source = TOOLS_PATH.read_text(encoding="utf-8").lower()

    for term in [
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
        "lang" + "graph",
        "lang" + "smith",
    ]:
        assert term not in adapter_source

    for term in ["ai_" + "pipeline", "ai_" + "analyst"]:
        assert term not in tools_source
