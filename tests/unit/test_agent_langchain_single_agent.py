from pathlib import Path
import sys

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.langchain_single_agent import LANGCHAIN_SINGLE_AGENT_AVAILABLE, run_langchain_single_agent  # noqa: E402
from backend.agent.runtime import AgentRuntimeRequest  # noqa: E402
from backend.main import app  # noqa: E402


SERVICE_PATH = ROOT / "backend" / "agent" / "langchain_single_agent.py"


def test_langchain_single_agent_returns_answer_sql_evidence_trace_and_tools() -> None:
    result = run_langchain_single_agent(
        AgentRuntimeRequest(user_input="Analyze sales data", table_name="sales", provider_requested="mock")
    )

    run = result.run

    assert LANGCHAIN_SINGLE_AGENT_AVAILABLE is True
    assert run.status == "completed"
    assert run.answer
    assert run.sql
    assert run.evidence
    assert run.result_preview is not None
    assert run.trace["agent"] == "langchain_single_agent"
    assert len(run.tool_calls) >= 7
    assert {call.tool_name for call in run.tool_calls} >= {
        "inspect_schema",
        "profile_table",
        "generate_sql",
        "execute_readonly_sql",
        "summarize_findings",
        "memory_read",
        "memory_write",
    }


def test_langchain_single_agent_provider_fallback_metadata() -> None:
    result = run_langchain_single_agent(
        AgentRuntimeRequest(user_input="Analyze sales data", table_name="sales", provider_requested="deepseek")
    )
    run = result.run

    assert run.provider_requested == "deepseek"
    assert run.provider_used == "mock"
    assert run.fallback_triggered is True
    assert run.fallback_reason
    assert run.is_simulated is True


def test_agent_route_response_keeps_frontend_compatibility_fields() -> None:
    response = TestClient(app).post(
        "/api/agent/runs",
        json={"user_input": "Analyze sales data", "table_name": "sales", "provider_requested": "mock"},
    )

    assert response.status_code == 200
    data = response.json()
    run = data["run"]

    for field in [
        "run_id",
        "status",
        "intent",
        "provider_requested",
        "provider_used",
        "fallback_triggered",
        "is_simulated",
        "answer",
        "sql",
        "evidence",
        "warnings",
        "trace",
        "tool_calls",
        "memory_used",
    ]:
        assert field in run


def test_agent_route_fallback_for_unavailable_provider() -> None:
    response = TestClient(app).post(
        "/api/agent/runs",
        json={"user_input": "Analyze sales data", "table_name": "sales", "provider_requested": "deepseek"},
    )

    assert response.status_code == 200
    run = response.json()["run"]
    assert run["provider_requested"] == "deepseek"
    assert run["provider_used"] == "mock"
    assert run["fallback_triggered"] is True
    assert run["fallback_reason"]


def test_agent_route_empty_input_remains_controlled_validation_error() -> None:
    response = TestClient(app).post("/api/agent/runs", json={"user_input": ""})

    assert response.status_code == 422


def test_langchain_single_agent_source_excludes_disallowed_architecture() -> None:
    source = SERVICE_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "lang" + "graph",
        "lang" + "smith",
        "chromadb",
        "faiss",
    ]

    for term in forbidden:
        assert term not in source
