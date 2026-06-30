from pathlib import Path
import sys

import pytest
from pydantic import ValidationError

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.agent.contracts import (
    AgentRole,
    AgentRun,
    AgentRunSummary,
    AgentStatus,
    AgentStep,
    AgentStepState,
    EvidenceRef,
    FallbackType,
    IntentCategory,
    IntentRoute,
    SelectedMode,
    ToolCall,
    ToolCallStatus,
    ToolResult,
    ToolResultStatus,
)


def test_agent_run_can_be_created_with_minimal_fields():
    run = AgentRun(user_goal="Analyze revenue quality")

    assert run.run_id
    assert run.root_run_id == run.run_id
    assert run.agent_role == AgentRole.DATA_ANALYST
    assert run.status == AgentStatus.CREATED
    assert run.trace_id
    assert run.steps == []
    assert run.tool_calls == []
    assert run.is_simulated is True
    assert run.provider_used == "mock"


def test_agent_run_requires_non_empty_goal_and_trace_id():
    with pytest.raises(ValidationError):
        AgentRun(user_goal="")

    with pytest.raises(ValidationError):
        AgentRun(user_goal="Analyze revenue", trace_id=" ")


def test_multi_agent_ready_fields_are_serializable():
    run = AgentRun(
        user_goal="Review regional performance",
        parent_run_id="parent-1",
        root_run_id="root-1",
        orchestrator_run_id="orchestrator-1",
        agent_role=AgentRole.PLANNER,
        agent_name="Planner Agent",
    )
    step = AgentStep(
        run_id=run.run_id,
        root_run_id=run.root_run_id,
        agent_role=AgentRole.SQL,
        agent_name="SQL Agent",
        step_index=0,
        state=AgentStepState.TOOL_EXECUTION,
        handoff_from="Planner Agent",
        handoff_to="SQL Agent",
    )

    dumped_run = run.model_dump(mode="json")
    dumped_step = step.model_dump(mode="json")

    assert dumped_run["parent_run_id"] == "parent-1"
    assert dumped_run["root_run_id"] == "root-1"
    assert dumped_run["orchestrator_run_id"] == "orchestrator-1"
    assert dumped_run["agent_role"] == "planner"
    assert dumped_run["agent_name"] == "Planner Agent"
    assert dumped_step["handoff_from"] == "Planner Agent"
    assert dumped_step["handoff_to"] == "SQL Agent"


@pytest.mark.parametrize("intent", list(IntentCategory))
@pytest.mark.parametrize("selected_mode", list(SelectedMode))
def test_intent_route_accepts_all_intents_and_modes(intent, selected_mode):
    route = IntentRoute(
        intent=intent,
        confidence=0.75,
        selected_mode=selected_mode,
        route_reason="deterministic test route",
        requires_agent=selected_mode == SelectedMode.AGENT_RUN,
        safety_flags=[],
    )

    assert route.intent == intent
    assert route.selected_mode == selected_mode


@pytest.mark.parametrize("confidence", [0.0, 1.0])
def test_intent_route_confidence_boundaries_are_valid(confidence):
    route = IntentRoute(
        intent=IntentCategory.AGENT_ANALYSIS,
        confidence=confidence,
        selected_mode=SelectedMode.AGENT_RUN,
        route_reason="boundary check",
        requires_agent=True,
    )

    assert route.confidence == confidence


@pytest.mark.parametrize("confidence", [-0.1, 1.1])
def test_intent_route_rejects_invalid_confidence(confidence):
    with pytest.raises(ValidationError):
        IntentRoute(
            intent=IntentCategory.AGENT_ANALYSIS,
            confidence=confidence,
            selected_mode=SelectedMode.AGENT_RUN,
            route_reason="invalid confidence",
            requires_agent=True,
        )


def test_provider_fallback_and_simulated_metadata_are_explicit():
    run = AgentRun(
        user_goal="Find revenue drivers",
        provider_requested="deepseek",
        provider_used="mock",
        is_simulated=True,
        fallback_triggered=True,
        fallback_type=FallbackType.PROVIDER,
        fallback_reason="provider unavailable",
    )

    assert run.provider_requested == "deepseek"
    assert run.provider_used == "mock"
    assert run.is_simulated is True
    assert run.fallback_triggered is True
    assert run.fallback_type == FallbackType.PROVIDER
    assert run.fallback_reason == "provider unavailable"


def test_evidence_can_attach_to_tool_result_tool_call_and_step():
    evidence = EvidenceRef(
        run_id="run-1",
        step_id="step-1",
        tool_call_id="call-1",
        source_type="sql_result",
        source_name="sales",
        summary="row count evidence",
        data_ref={"row_count": 3},
    )
    tool_result = ToolResult(
        tool_name="execute_readonly_sql",
        status=ToolResultStatus.COMPLETED,
        output={"row_count": 3},
        evidence_refs=[evidence],
    )
    tool_call = ToolCall(
        call_id="call-1",
        run_id="run-1",
        step_id="step-1",
        tool_name="execute_readonly_sql",
        input_json={"sql": "select * from sales"},
        output_json={"row_count": 3},
        evidence_json=[evidence.model_dump(mode="json")],
        status=ToolCallStatus.COMPLETED,
    )
    step = AgentStep(
        step_id="step-1",
        run_id="run-1",
        root_run_id="run-1",
        step_index=0,
        state=AgentStepState.TOOL_EXECUTION,
        tool_name="execute_readonly_sql",
        evidence_json=[evidence.model_dump(mode="json")],
    )

    assert tool_result.evidence_refs[0].summary == "row count evidence"
    assert tool_call.evidence_json[0]["evidence_id"] == evidence.evidence_id
    assert step.evidence_json[0]["tool_call_id"] == "call-1"


def test_agent_run_and_summary_serialization_are_stable():
    run = AgentRun(
        run_id="run-serialization",
        user_goal="Summarize table",
        intent=IntentCategory.SIMPLE_SUMMARY,
        selected_mode=SelectedMode.NATURAL_LANGUAGE,
        status=AgentStatus.COMPLETED,
    )
    summary = run.to_summary(findings_count=2)

    dumped_run = run.model_dump(mode="json")
    dumped_summary = summary.model_dump(mode="json")
    json_run = run.model_dump_json()
    json_summary = summary.model_dump_json()

    assert dumped_run["intent"] == "simple_summary"
    assert dumped_run["selected_mode"] == "natural_language"
    assert dumped_run["agent_role"] == "data_analyst"
    assert isinstance(dumped_run["created_at"], str)
    assert dumped_summary["run_id"] == "run-serialization"
    assert dumped_summary["findings_count"] == 2
    assert '"status":"completed"' in json_run
    assert '"findings_count":2' in json_summary
    assert isinstance(summary, AgentRunSummary)


def test_contracts_do_not_import_runtime_or_framework_dependencies():
    content = Path("backend/agent/contracts.py").read_text(encoding="utf-8").lower()
    forbidden_fragments = [
        "backend.services.ai_" + "pipeline",
        "backend.services.ai_" + "analyst",
        "lang" + "chain",
        "lang" + "graph",
        "duckdb",
        "sqlite",
    ]

    for fragment in forbidden_fragments:
        assert fragment not in content
