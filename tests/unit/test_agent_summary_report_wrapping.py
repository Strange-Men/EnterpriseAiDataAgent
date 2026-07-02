from pathlib import Path

from backend.agent.contracts import AgentStatus, ToolResultStatus
from backend.agent.langchain_adapter import run_langchain_mock_agent
from backend.agent.mock_runner import run_mock_agent
from backend.agent.pipeline_adapter import (
    build_report_with_existing_pipeline,
    execute_readonly_sql_with_existing_executor,
    generate_sql_with_existing_pipeline,
    summarize_findings_with_existing_pipeline,
)
from backend.agent.tools import build_report_real_path, summarize_findings_real_path


PIPELINE_ADAPTER_PATH = Path("backend/agent/pipeline_adapter.py")
TOOLS_PATH = Path("backend/agent/tools.py")

EVIDENCE = [{"summary": "organic revenue = 100", "source": "test_fixture"}]


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


def fake_generator(**kwargs) -> str:
    return "SELECT channel, SUM(revenue) AS total_revenue FROM sales GROUP BY channel"


def fake_summarizer(**kwargs) -> dict:
    return {
        "summary": "Revenue is concentrated in organic channel.",
        "findings": [
            {
                "title": "Organic channel leads revenue",
                "evidence": "organic revenue = 100",
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


def test_fake_summarizer_success_returns_completed_tool_result() -> None:
    result = summarize_findings_with_existing_pipeline(
        user_goal="Summarize sales result",
        sql="SELECT channel, revenue FROM sales",
        rows=[{"channel": "organic", "revenue": 100}],
        evidence=EVIDENCE,
        summarizer=fake_summarizer,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.tool_name == "summarize_findings"
    assert result.output["summary"]
    assert result.output["findings"]
    assert result.is_simulated is True
    assert result.output["provider_used"] == "mock"
    assert result.evidence_refs


def test_fake_report_builder_success_returns_completed_tool_result() -> None:
    result = build_report_with_existing_pipeline(
        user_goal="Build sales report",
        summary="Revenue is concentrated in organic channel.",
        findings=[{"title": "Organic leads", "evidence": "organic revenue = 100"}],
        evidence=EVIDENCE,
        report_builder=fake_report_builder,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.tool_name == "build_report"
    assert result.output["report"]
    assert result.output["title"] == "Sales Analysis Report"
    assert result.is_simulated is True
    assert result.output["provider_used"] == "mock"


def test_missing_evidence_is_rejected_for_summary_and_report() -> None:
    summary_result = summarize_findings_with_existing_pipeline(
        user_goal="Summarize result",
        evidence=[],
        summarizer=fake_summarizer,
    )
    report_result = build_report_with_existing_pipeline(
        user_goal="Build report",
        summary="Summary exists",
        evidence=[],
        report_builder=fake_report_builder,
    )

    assert summary_result.status == ToolResultStatus.REJECTED
    assert summary_result.error
    assert summary_result.is_simulated is True

    assert report_result.status == ToolResultStatus.REJECTED
    assert report_result.error
    assert report_result.is_simulated is True


def test_callable_errors_are_failed_tool_results() -> None:
    summary_result = summarize_findings_with_existing_pipeline(
        user_goal="Summarize result",
        evidence=EVIDENCE,
        summarizer=failing_summarizer,
    )
    report_result = build_report_with_existing_pipeline(
        user_goal="Build report",
        summary="Summary exists",
        evidence=EVIDENCE,
        report_builder=failing_report_builder,
    )

    assert summary_result.status == ToolResultStatus.FAILED
    assert "summary boom" in (summary_result.error or "")

    assert report_result.status == ToolResultStatus.FAILED
    assert "report boom" in (report_result.error or "")


def test_no_callable_and_live_provider_disabled_is_rejected() -> None:
    summary_result = summarize_findings_with_existing_pipeline(
        user_goal="Summarize result",
        evidence=EVIDENCE,
        allow_real_provider=False,
    )
    report_result = build_report_with_existing_pipeline(
        user_goal="Build report",
        summary="Summary exists",
        evidence=EVIDENCE,
        allow_real_provider=False,
    )

    assert summary_result.status == ToolResultStatus.REJECTED
    assert "Injected summarizer is required" in (summary_result.error or "")
    assert summary_result.is_simulated is True

    assert report_result.status == ToolResultStatus.REJECTED
    assert "Injected report builder is required" in (report_result.error or "")
    assert report_result.is_simulated is True


def test_provider_fallback_simulated_metadata() -> None:
    requested = "deep" + "seek"
    result = summarize_findings_with_existing_pipeline(
        user_goal="Summarize result",
        evidence=EVIDENCE,
        provider_requested=requested,
        summarizer=fake_summarizer,
    )

    assert result.status == ToolResultStatus.COMPLETED
    assert result.output["provider_requested"] == requested
    assert result.output["provider_used"] == "mock"
    assert result.output["fallback_triggered"] is True
    assert result.output["fallback_reason"]
    assert result.is_simulated is True


def test_tools_helpers_require_injected_callables() -> None:
    summary_result = summarize_findings_real_path(
        {"user_goal": "Summarize result", "evidence": EVIDENCE},
        summarizer=fake_summarizer,
    )
    report_result = build_report_real_path(
        {
            "user_goal": "Build report",
            "summary": "Revenue is concentrated in organic channel.",
            "evidence": EVIDENCE,
        },
        report_builder=fake_report_builder,
    )

    assert summary_result.status == ToolResultStatus.COMPLETED
    assert summary_result.tool_name == "summarize_findings"
    assert summary_result.is_simulated is True

    assert report_result.status == ToolResultStatus.COMPLETED
    assert report_result.tool_name == "build_report"
    assert report_result.is_simulated is True


def test_existing_paths_still_work() -> None:
    native_run = run_mock_agent("Please investigate sales trend with evidence")
    adapter_run = run_langchain_mock_agent("Please investigate sales trend with evidence")
    sql_result = generate_sql_with_existing_pipeline(
        user_goal="Revenue by channel",
        table_name="sales",
        generator=fake_generator,
    )
    readonly_result = execute_readonly_sql_with_existing_executor(
        sql="SELECT channel, revenue FROM sales",
        executor=FakeReadonlyExecutor(),
    )

    assert native_run.status == AgentStatus.COMPLETED
    assert native_run.is_simulated is True
    assert all(call.is_simulated for call in native_run.tool_calls)

    assert adapter_run.status == AgentStatus.COMPLETED
    assert adapter_run.is_simulated is True
    assert all(call.is_simulated for call in adapter_run.tool_calls)

    assert sql_result.status == ToolResultStatus.COMPLETED
    assert sql_result.is_simulated is True

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
