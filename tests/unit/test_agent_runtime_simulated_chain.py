from pathlib import Path

from backend.agent.contracts import AgentStatus, ToolResultStatus
from backend.agent.runtime import (
    AgentRuntimeInjectedTools,
    AgentRuntimeMode,
    AgentRuntimeRequest,
    run_agent_runtime_simulated_chain,
    run_agent_runtime_skeleton,
)


RUNTIME_PATH = Path("backend/agent/runtime.py")
TEST_PATH = Path("tests/unit/test_agent_runtime_simulated_chain.py")


class FakeExecutor:
    def __init__(self) -> None:
        self.called = False

    def execute(self, sql: str, row_limit: int = 50) -> dict:
        self.called = True
        return {
            "columns": ["channel", "revenue"],
            "rows": [{"channel": "organic", "revenue": 100}],
            "row_count": 1,
            "status": "success",
            "error": None,
        }


class FailingExecutor:
    def execute(self, sql: str, row_limit: int = 50) -> dict:
        raise RuntimeError("executor boom")


def fake_generator(**kwargs) -> str:
    return "SELECT channel, SUM(revenue) AS total_revenue FROM sales GROUP BY channel"


def unsafe_generator(**kwargs) -> str:
    return "DROP TABLE sales"


def fake_summarizer(**kwargs) -> dict:
    return {
        "summary": "Revenue is concentrated in organic channel.",
        "findings": [{"title": "Organic channel leads revenue", "evidence": "organic revenue = 100"}],
    }


def fake_report_builder(**kwargs) -> dict:
    return {
        "title": "Sales Analysis Report",
        "sections": [{"heading": "Summary", "content": "Organic channel leads revenue."}],
    }


def failing_summarizer(**kwargs) -> dict:
    raise RuntimeError("summary boom")


def tracking_report_builder(called: dict[str, bool]):
    def _builder(**kwargs) -> dict:
        called["report_builder"] = True
        return fake_report_builder(**kwargs)

    return _builder


def _all_fake_tools(executor=None, summarizer=None, report_builder=None) -> AgentRuntimeInjectedTools:
    return AgentRuntimeInjectedTools(
        generator=fake_generator,
        executor=executor or FakeExecutor(),
        summarizer=summarizer or fake_summarizer,
        report_builder=report_builder or fake_report_builder,
    )


def test_successful_simulated_chain_returns_completed_agent_run() -> None:
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(user_input="sum revenue by channel", table_name="sales"),
        tools=_all_fake_tools(),
    )
    tool_names = [call.tool_name for call in result.run.tool_calls]

    assert result.runtime_mode == AgentRuntimeMode.SIMULATED
    assert result.run.status == AgentStatus.COMPLETED
    assert result.run.is_simulated is True
    assert result.run.provider_used == "mock"
    assert len(result.run.tool_calls) >= 4
    assert tool_names == ["generate_sql", "execute_readonly_sql", "summarize_findings", "build_report"]
    assert all(call.is_simulated is True for call in result.run.tool_calls)
    assert result.summary is not None
    assert result.summary.tool_call_count == 4


def test_provider_fallback_metadata_is_preserved() -> None:
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(
            user_input="sum revenue by channel",
            table_name="sales",
            provider_requested="deepseek",
        ),
        tools=_all_fake_tools(),
    )

    assert result.run.provider_requested == "deepseek"
    assert result.run.provider_used == "mock"
    assert result.run.fallback_triggered is True
    assert result.run.fallback_reason
    assert result.run.is_simulated is True
    assert result.run.tool_calls[0].output_json is not None
    assert result.run.tool_calls[0].output_json["fallback_triggered"] is True


def test_unsafe_sql_generation_stops_chain_before_executor() -> None:
    executor = FakeExecutor()
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(user_input="sum revenue by channel", table_name="sales"),
        tools=AgentRuntimeInjectedTools(
            generator=unsafe_generator,
            executor=executor,
            summarizer=fake_summarizer,
            report_builder=fake_report_builder,
        ),
    )

    assert result.run.status == AgentStatus.FAILED
    assert [call.tool_name for call in result.run.tool_calls] == ["generate_sql"]
    assert result.run.tool_calls[0].status.value == ToolResultStatus.REJECTED.value
    assert executor.called is False


def test_executor_failure_stops_before_summary_and_report() -> None:
    called = {"summarizer": False, "report_builder": False}

    def tracking_summarizer(**kwargs) -> dict:
        called["summarizer"] = True
        return fake_summarizer(**kwargs)

    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(user_input="sum revenue by channel", table_name="sales"),
        tools=AgentRuntimeInjectedTools(
            generator=fake_generator,
            executor=FailingExecutor(),
            summarizer=tracking_summarizer,
            report_builder=tracking_report_builder(called),
        ),
    )

    assert result.run.status == AgentStatus.FAILED
    assert "executor boom" in (result.run.error or "")
    assert [call.tool_name for call in result.run.tool_calls] == ["generate_sql", "execute_readonly_sql"]
    assert called == {"summarizer": False, "report_builder": False}


def test_summary_failure_stops_before_report() -> None:
    called = {"report_builder": False}
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(user_input="sum revenue by channel", table_name="sales"),
        tools=_all_fake_tools(summarizer=failing_summarizer, report_builder=tracking_report_builder(called)),
    )

    assert result.run.status == AgentStatus.FAILED
    assert "summary boom" in (result.run.error or "")
    assert [call.tool_name for call in result.run.tool_calls] == [
        "generate_sql",
        "execute_readonly_sql",
        "summarize_findings",
    ]
    assert called["report_builder"] is False


def test_missing_injected_tools_returns_controlled_failure() -> None:
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(user_input="sum revenue by channel", table_name="sales"),
        tools=AgentRuntimeInjectedTools(),
    )

    assert result.run.status == AgentStatus.FAILED
    assert result.run.tool_calls
    assert result.run.tool_calls[0].tool_name == "generate_sql"
    assert result.run.error


def test_unsupported_intent_does_not_execute_tools() -> None:
    executor = FakeExecutor()
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(user_input="drop database", table_name="sales"),
        tools=_all_fake_tools(executor=executor),
    )

    assert result.run.status == AgentStatus.UNSUPPORTED
    assert result.run.tool_calls == []
    assert executor.called is False
    assert result.routed_intent is not None
    assert result.routed_intent.safety_flags


def test_existing_runtime_skeleton_still_does_not_execute_tool_chain() -> None:
    result = run_agent_runtime_skeleton(AgentRuntimeRequest(user_input="sum revenue by channel", table_name="sales"))

    assert result.runtime_mode == AgentRuntimeMode.SKELETON
    assert result.run.status == AgentStatus.COMPLETED
    assert result.run.tool_calls == []
    assert result.run.steps[0].output_json is not None
    assert result.run.steps[0].output_json["runtime"]["tool_chain_executed"] is False


def test_runtime_source_has_no_route_persistence_or_provider_leakage() -> None:
    sources = [
        RUNTIME_PATH.read_text(encoding="utf-8").lower(),
        TEST_PATH.read_text(encoding="utf-8").lower(),
    ]
    forbidden = [
        "api" + "router",
        "dep" + "ends",
        "sess" + "ion",
        "sql" + "ite",
        "duck" + "db",
        "mig" + "ration",
        "ale" + "mbic",
        "create_" + "table",
        "ins" + "ert",
        "up" + "date",
        "del" + "ete",
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
        "lang" + "graph",
        "lang" + "smith",
        "api_" + "key",
        "_run_with_" + "provider",
        "provider_" + "runtime",
    ]

    for source in sources:
        for term in forbidden:
            assert term not in source
