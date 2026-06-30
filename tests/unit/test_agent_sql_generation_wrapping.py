from pathlib import Path

from backend.agent.contracts import AgentStatus, ToolResultStatus
from backend.agent.langchain_adapter import run_langchain_mock_agent
from backend.agent.mock_runner import run_mock_agent
from backend.agent.pipeline_adapter import (
    execute_readonly_sql_with_existing_executor,
    generate_sql_with_existing_pipeline,
)
from backend.agent.tools import generate_sql_real_path


PIPELINE_ADAPTER_PATH = Path("backend/agent/pipeline_adapter.py")
TOOLS_PATH = Path("backend/agent/tools.py")


class FakeReadonlyExecutor:
    def execute(self, sql: str, row_limit: int = 50) -> dict:
        return {
            "sql": sql,
            "columns": ["channel", "total_revenue"],
            "rows": [{"channel": "organic", "total_revenue": 100}],
            "row_count": 1,
            "status": "success",
            "error": None,
        }


def fake_generator(**kwargs) -> str:
    return "SELECT channel, SUM(revenue) AS total_revenue FROM sales GROUP BY channel"


def unsafe_generator(**kwargs) -> str:
    return "DROP TABLE sales"


def failing_generator(**kwargs) -> str:
    raise RuntimeError("generator boom")


def dict_generator(**kwargs) -> dict:
    return {"sql": "SELECT channel FROM sales"}


def test_fake_generator_success_returns_completed_tool_result() -> None:
    result = generate_sql_with_existing_pipeline(
        user_goal="统计每个渠道收入",
        table_name="sales",
        generator=fake_generator,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.tool_name == "generate_sql"
    assert result.is_simulated is True
    assert "SELECT" in result.output["sql"]
    assert result.output["provider_used"] == "mock"
    assert result.output["fallback_triggered"] is False
    assert result.evidence_refs


def test_fake_generator_dict_result_is_supported() -> None:
    result = generate_sql_with_existing_pipeline(
        user_goal="列出渠道",
        table_name="sales",
        generator=dict_generator,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.output["sql"] == "SELECT channel FROM sales"


def test_fake_generator_unsafe_sql_is_rejected() -> None:
    result = generate_sql_with_existing_pipeline(
        user_goal="删除表",
        table_name="sales",
        generator=unsafe_generator,
    )

    assert result.status == ToolResultStatus.REJECTED
    assert result.is_simulated is True
    assert result.error


def test_fake_generator_error_is_failed_tool_result() -> None:
    result = generate_sql_with_existing_pipeline(
        user_goal="统计每个渠道收入",
        table_name="sales",
        generator=failing_generator,
    )

    assert result.status == ToolResultStatus.FAILED
    assert result.is_simulated is True
    assert "generator boom" in (result.error or "")


def test_no_generator_and_live_provider_disabled_is_rejected() -> None:
    result = generate_sql_with_existing_pipeline(
        user_goal="统计每个渠道收入",
        table_name="sales",
        allow_real_provider=False,
    )

    assert result.status == ToolResultStatus.REJECTED
    assert result.is_simulated is True
    assert result.error
    assert "Injected SQL generator is required" in result.error


def test_provider_fallback_simulated_metadata() -> None:
    result = generate_sql_with_existing_pipeline(
        user_goal="统计每个渠道收入",
        table_name="sales",
        provider_requested="external_model",
        generator=fake_generator,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.output["provider_requested"] == "external_model"
    assert result.output["provider_used"] == "mock"
    assert result.output["fallback_triggered"] is True
    assert result.output["fallback_reason"]
    assert result.is_simulated is True


def test_tools_helper_requires_injected_generator() -> None:
    result = generate_sql_real_path(
        {
            "user_goal": "统计每个渠道收入",
            "table_name": "sales",
            "provider_requested": "mock",
        },
        generator=fake_generator,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.tool_name == "generate_sql"
    assert result.is_simulated is True


def test_existing_paths_still_work() -> None:
    native_run = run_mock_agent("请深入分析销售趋势并给出证据")
    adapter_run = run_langchain_mock_agent("请深入分析销售趋势并给出证据")
    readonly_result = execute_readonly_sql_with_existing_executor(
        sql="SELECT channel, total_revenue FROM sales",
        executor=FakeReadonlyExecutor(),
    )

    assert native_run.status == AgentStatus.COMPLETED
    assert native_run.is_simulated is True
    assert all(call.is_simulated for call in native_run.tool_calls)

    assert adapter_run.status == AgentStatus.COMPLETED
    assert adapter_run.is_simulated is True
    assert all(call.is_simulated for call in adapter_run.tool_calls)

    assert readonly_result.status == ToolResultStatus.COMPLETED
    assert readonly_result.is_simulated is False


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
        assert term not in tools_source

    for term in ["ai_" + "pipeline", "ai_" + "analyst"]:
        assert term not in tools_source
