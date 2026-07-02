from pathlib import Path

from backend.agent.contracts import AgentStatus, ToolResultStatus
from backend.agent.langchain_adapter import run_langchain_mock_agent
from backend.agent.mock_runner import run_mock_agent
from backend.agent.pipeline_adapter import (
    PipelineCapabilityName,
    build_report_with_existing_pipeline,
    execute_readonly_sql_with_existing_executor,
    generate_sql_with_existing_pipeline,
    get_pipeline_adapter_boundary,
    summarize_findings_with_existing_pipeline,
)
from backend.agent.tools import (
    build_report_real_path,
    execute_readonly_sql_real_path,
    generate_sql_real_path,
    get_default_tool_registry,
    summarize_findings_real_path,
)


PIPELINE_ADAPTER_PATH = Path("backend/agent/pipeline_adapter.py")
TOOLS_PATH = Path("backend/agent/tools.py")
TEST_PATH = Path("tests/unit/test_agent_pipeline_tool_regression.py")


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


class FailingExecutor:
    def execute(self, sql: str, row_limit: int = 50) -> dict:
        raise RuntimeError("executor boom")


def fake_generator(**kwargs) -> str:
    return "SELECT channel, SUM(revenue) AS total_revenue FROM sales GROUP BY channel"


def unsafe_generator(**kwargs) -> str:
    return "DROP TABLE sales"


def fake_summarizer(**kwargs) -> dict:
    return {
        "summary": "Organic channel leads revenue.",
        "findings": [
            {
                "title": "Organic channel leads revenue",
                "evidence": "organic total_revenue = 100",
            }
        ],
    }


def fake_report_builder(**kwargs) -> dict:
    return {
        "title": "Sales Analysis Report",
        "sections": [
            {
                "heading": "Summary",
                "content": "Organic channel leads revenue.",
            }
        ],
    }


def failing_summarizer(**kwargs) -> dict:
    raise RuntimeError("summary boom")


def failing_report_builder(**kwargs) -> dict:
    raise RuntimeError("report boom")


def test_full_simulated_pipeline_chain() -> None:
    requested = "deep" + "seek"
    user_goal = "Analyze revenue by channel"

    sql_result = generate_sql_with_existing_pipeline(
        user_goal=user_goal,
        table_name="sales",
        provider_requested=requested,
        generator=fake_generator,
    )
    assert sql_result.status == ToolResultStatus.COMPLETED
    assert sql_result.output["sql"]
    assert sql_result.is_simulated is True
    assert sql_result.output["provider_requested"] == requested
    assert sql_result.output["provider_used"] == "mock"
    assert sql_result.output["fallback_triggered"] is True

    execution_result = execute_readonly_sql_with_existing_executor(
        sql=sql_result.output["sql"],
        table_name="sales",
        executor=FakeReadonlyExecutor(),
    )
    assert execution_result.status == ToolResultStatus.COMPLETED
    assert execution_result.output["rows"]
    assert execution_result.is_simulated is False

    execution_evidence = [
        {
            "summary": execution_result.output["summary"],
            "rows": execution_result.output["rows"],
            "columns": execution_result.output["columns"],
        }
    ]
    summary_result = summarize_findings_with_existing_pipeline(
        user_goal=user_goal,
        sql=sql_result.output["sql"],
        rows=execution_result.output["rows"],
        evidence=execution_evidence,
        provider_requested=requested,
        summarizer=fake_summarizer,
    )
    assert summary_result.status == ToolResultStatus.COMPLETED
    assert summary_result.output["summary"]
    assert summary_result.is_simulated is True
    assert summary_result.output["provider_used"] == "mock"
    assert summary_result.output["fallback_triggered"] is True

    report_result = build_report_with_existing_pipeline(
        user_goal=user_goal,
        summary=summary_result.output["summary"],
        findings=summary_result.output["findings"],
        evidence=summary_result.output["evidence"],
        provider_requested=requested,
        report_builder=fake_report_builder,
    )
    assert report_result.status == ToolResultStatus.COMPLETED
    assert report_result.output["report"]
    assert report_result.is_simulated is True
    assert report_result.output["provider_used"] == "mock"
    assert report_result.output["fallback_triggered"] is True


def test_evidence_propagation_and_missing_evidence_rejection() -> None:
    sql_result = generate_sql_with_existing_pipeline(
        user_goal="Analyze revenue by channel",
        table_name="sales",
        generator=fake_generator,
    )
    execution_result = execute_readonly_sql_with_existing_executor(
        sql=sql_result.output["sql"],
        executor=FakeReadonlyExecutor(),
    )
    evidence = [{"summary": "Readonly SQL returned rows.", "rows": execution_result.output["rows"]}]

    rejected_summary = summarize_findings_with_existing_pipeline(
        user_goal="Analyze revenue by channel",
        evidence=[],
        summarizer=fake_summarizer,
    )
    rejected_report = build_report_with_existing_pipeline(
        user_goal="Build report",
        summary="Summary exists",
        evidence=[],
        report_builder=fake_report_builder,
    )
    completed_summary = summarize_findings_with_existing_pipeline(
        user_goal="Analyze revenue by channel",
        rows=execution_result.output["rows"],
        evidence=evidence,
        summarizer=fake_summarizer,
    )
    completed_report = build_report_with_existing_pipeline(
        user_goal="Build report",
        summary=completed_summary.output["summary"],
        findings=completed_summary.output["findings"],
        evidence=completed_summary.output["evidence"],
        report_builder=fake_report_builder,
    )

    assert rejected_summary.status == ToolResultStatus.REJECTED
    assert rejected_report.status == ToolResultStatus.REJECTED
    assert completed_summary.status == ToolResultStatus.COMPLETED
    assert completed_report.status == ToolResultStatus.COMPLETED


def test_unsafe_sql_generation_stops_downstream_chain() -> None:
    called = {"executor": False, "summarizer": False, "report_builder": False}

    class TrackingExecutor:
        def execute(self, sql: str, row_limit: int = 50) -> dict:
            called["executor"] = True
            return {}

    def tracking_summarizer(**kwargs) -> dict:
        called["summarizer"] = True
        return fake_summarizer(**kwargs)

    def tracking_report_builder(**kwargs) -> dict:
        called["report_builder"] = True
        return fake_report_builder(**kwargs)

    sql_result = generate_sql_with_existing_pipeline(
        user_goal="Analyze revenue by channel",
        table_name="sales",
        generator=unsafe_generator,
    )
    if sql_result.status == ToolResultStatus.COMPLETED:
        execute_readonly_sql_with_existing_executor(sql=sql_result.output["sql"], executor=TrackingExecutor())
        summarize_findings_with_existing_pipeline(
            user_goal="Analyze revenue by channel",
            evidence=[{"summary": "should not run"}],
            summarizer=tracking_summarizer,
        )
        build_report_with_existing_pipeline(
            user_goal="Build report",
            summary="should not run",
            evidence=[{"summary": "should not run"}],
            report_builder=tracking_report_builder,
        )

    assert sql_result.status == ToolResultStatus.REJECTED
    assert called == {"executor": False, "summarizer": False, "report_builder": False}


def test_failure_normalization_for_pipeline_chain() -> None:
    execution_result = execute_readonly_sql_with_existing_executor(
        sql="SELECT channel FROM sales",
        executor=FailingExecutor(),
    )
    summary_result = summarize_findings_with_existing_pipeline(
        user_goal="Summarize result",
        evidence=[{"summary": "has evidence"}],
        summarizer=failing_summarizer,
    )
    report_result = build_report_with_existing_pipeline(
        user_goal="Build report",
        summary="Summary exists",
        evidence=[{"summary": "has evidence"}],
        report_builder=failing_report_builder,
    )

    assert execution_result.status == ToolResultStatus.FAILED
    assert "executor boom" in (execution_result.error or "")
    assert summary_result.status == ToolResultStatus.FAILED
    assert "summary boom" in (summary_result.error or "")
    assert report_result.status == ToolResultStatus.FAILED
    assert "report boom" in (report_result.error or "")


def test_mock_runner_and_langchain_adapter_remain_mock_only() -> None:
    native_run = run_mock_agent("Please investigate sales trend with evidence")
    adapter_run = run_langchain_mock_agent("Please investigate sales trend with evidence")

    assert native_run.status == AgentStatus.COMPLETED
    assert native_run.provider_used == "mock"
    assert native_run.is_simulated is True
    assert native_run.tool_calls
    assert all(call.is_simulated for call in native_run.tool_calls)

    assert adapter_run.status == AgentStatus.COMPLETED
    assert adapter_run.provider_used == "mock"
    assert adapter_run.is_simulated is True
    assert adapter_run.tool_calls
    assert all(call.is_simulated for call in adapter_run.tool_calls)


def test_tool_registry_boundary_and_explicit_helpers() -> None:
    registry = get_default_tool_registry()
    tool_names = {tool.name for tool in registry.list_tools()}

    assert tool_names == {"inspect_schema", "profile_table", "execute_readonly_sql"}
    assert registry.call_tool("inspect_schema", {"table_name": "sales"}).is_simulated is True
    assert registry.call_tool("profile_table", {"table_name": "sales"}).is_simulated is True
    assert registry.call_tool("execute_readonly_sql", {"sql": "SELECT * FROM mock_sales"}).is_simulated is True

    assert execute_readonly_sql_real_path(
        {"sql": "SELECT channel FROM sales"},
        executor=FakeReadonlyExecutor(),
    ).status == ToolResultStatus.COMPLETED
    assert generate_sql_real_path(
        {"user_goal": "Analyze revenue", "table_name": "sales"},
        generator=fake_generator,
    ).status == ToolResultStatus.COMPLETED
    assert summarize_findings_real_path(
        {"user_goal": "Summarize result", "evidence": [{"summary": "has evidence"}]},
        summarizer=fake_summarizer,
    ).status == ToolResultStatus.COMPLETED
    assert build_report_real_path(
        {
            "user_goal": "Build report",
            "summary": "Summary exists",
            "evidence": [{"summary": "has evidence"}],
        },
        report_builder=fake_report_builder,
    ).status == ToolResultStatus.COMPLETED


def test_pipeline_adapter_boundary_flags_and_capability_map() -> None:
    boundary = get_pipeline_adapter_boundary()
    capability_names = {capability.name for capability in boundary.capabilities}

    assert boundary.mock_path_supported is True
    assert boundary.real_path_supported is False
    assert {
        PipelineCapabilityName.GENERATE_SQL,
        PipelineCapabilityName.VALIDATE_READONLY_SQL,
        PipelineCapabilityName.EXECUTE_READONLY_SQL,
        PipelineCapabilityName.SUMMARIZE_FINDINGS,
        PipelineCapabilityName.BUILD_REPORT,
        PipelineCapabilityName.PROVIDER_FALLBACK,
    }.issubset(capability_names)


def test_no_forbidden_dependency_or_behavior_leakage() -> None:
    sources = [
        PIPELINE_ADAPTER_PATH.read_text(encoding="utf-8").lower(),
        TOOLS_PATH.read_text(encoding="utf-8").lower(),
        TEST_PATH.read_text(encoding="utf-8").lower(),
    ]

    for source in sources:
        for term in [
            "open" + "ai",
            "req" + "uests",
            "htt" + "px",
            "lang" + "graph",
            "lang" + "smith",
            "_run_with_" + "provider(",
            "provider_" + "runtime(",
            "api_" + "key",
        ]:
            assert term not in source

    tools_source = TOOLS_PATH.read_text(encoding="utf-8").lower()
    for term in ["ai_" + "pipeline", "ai_" + "analyst"]:
        assert term not in tools_source
