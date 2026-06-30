from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.contracts import AgentStatus, AgentStepState, FallbackType, IntentCategory, SelectedMode
from backend.agent.mock_runner import build_mock_run_summary, run_mock_agent
from backend.agent.tools import validate_readonly_sql


def _tool_names(run) -> list[str]:
    return [tool_call.tool_name for tool_call in run.tool_calls]


def test_data_preview_run_builds_schema_and_profile_transcript() -> None:
    run = run_mock_agent("这张表有哪些字段和行数？")

    assert run.status == AgentStatus.COMPLETED
    assert run.intent == IntentCategory.DATA_PREVIEW
    assert run.provider_used == "mock"
    assert run.is_simulated is True
    assert len(run.steps) >= 2
    assert _tool_names(run) == ["inspect_schema", "profile_table"]
    assert run.trace_id
    assert all(call.is_simulated for call in run.tool_calls)
    assert all(call.evidence_json for call in run.tool_calls)


def test_agent_analysis_run_calls_three_mock_tools() -> None:
    run = run_mock_agent("请深入分析销售趋势并给出证据")

    assert run.status == AgentStatus.COMPLETED
    assert run.selected_mode == SelectedMode.AGENT_RUN
    assert run.steps[0].output_json is not None
    assert run.steps[0].output_json["requires_agent"] is True
    assert _tool_names(run) == ["inspect_schema", "profile_table", "execute_readonly_sql"]
    assert all(call.is_simulated for call in run.tool_calls)


def test_sql_question_run_uses_readonly_sql_tool() -> None:
    run = run_mock_agent("统计每个渠道的订单数")

    assert run.intent == IntentCategory.SQL_QUESTION
    assert _tool_names(run) == ["execute_readonly_sql"]
    sql = run.tool_calls[0].input_json["sql"]
    assert sql == "SELECT * FROM mock_sales LIMIT 3"
    validate_readonly_sql(sql)


def test_simple_summary_run_uses_schema_and_profile_tools() -> None:
    run = run_mock_agent("总结这份数据")

    assert run.status == AgentStatus.COMPLETED
    assert run.intent == IntentCategory.SIMPLE_SUMMARY
    assert run.selected_mode == SelectedMode.NATURAL_LANGUAGE
    assert _tool_names(run) == ["inspect_schema", "profile_table"]


def test_ambiguous_run_requests_clarification_without_tools() -> None:
    run = run_mock_agent("分析一下")

    assert run.status == AgentStatus.CLARIFICATION_REQUIRED
    assert run.intent == IntentCategory.AMBIGUOUS
    assert run.tool_calls == []
    assert [step.state for step in run.steps] == [AgentStepState.MODE_ROUTING]


def test_unsupported_run_stops_before_tools_and_records_safety_flags() -> None:
    run = run_mock_agent("请删除这张表")

    assert run.status == AgentStatus.UNSUPPORTED
    assert run.intent == IntentCategory.UNSUPPORTED
    assert run.tool_calls == []
    assert run.steps[0].output_json is not None
    assert "unsafe_write_or_destructive_action" in run.steps[0].output_json["safety_flags"]


def test_provider_fallback_is_marked_simulated() -> None:
    run = run_mock_agent("请深入分析销售趋势并给出证据", provider_requested="deepseek")

    assert run.provider_requested == "deepseek"
    assert run.provider_used == "mock"
    assert run.fallback_triggered is True
    assert run.fallback_type == FallbackType.PROVIDER
    assert run.fallback_reason == "deterministic mock runner fallback"
    assert run.is_simulated is True


def test_agent_run_and_summary_are_serializable() -> None:
    run = run_mock_agent("请深入分析销售趋势并给出证据")
    summary = build_mock_run_summary(run, findings_count=2)

    dumped = run.model_dump(mode="json")
    json_text = run.model_dump_json()
    summary_dumped = summary.model_dump(mode="json")
    summary_json = summary.model_dump_json()

    assert dumped["run_id"] == run.run_id
    assert dumped["steps"][0]["started_at"]
    assert "tool_calls" in json_text
    assert summary_dumped["tool_call_count"] == 3
    assert summary_dumped["findings_count"] == 2
    assert run.trace_id in summary_json


def test_completed_runs_have_step_and_tool_evidence() -> None:
    run = run_mock_agent("请深入分析销售趋势并给出证据")

    tool_steps = [step for step in run.steps if step.tool_name]

    assert tool_steps
    assert all(step.evidence_json for step in tool_steps)
    assert all(call.evidence_json for call in run.tool_calls)


def test_mock_runner_source_has_no_forbidden_dependency_imports() -> None:
    source = (ROOT / "backend" / "agent" / "mock_runner.py").read_text(encoding="utf-8")
    forbidden = [
        "ai_pipeline",
        "ai_analyst",
        "backend.routes",
        "duckdb",
        "pandas",
        "requests",
        "httpx",
        "openai",
        "lang" + "chain",
        "lang" + "graph",
    ]

    for name in forbidden:
        assert name not in source
