from pathlib import Path
import sys

from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from backend.main import app  # noqa: E402


ROUTE_PATH = Path("backend/routes/agent.py")
TEST_PATH = Path("tests/unit/test_agent_api_route_skeleton.py")


def _client() -> TestClient:
    return TestClient(app)


def test_agent_run_route_registered_for_skeleton_mode() -> None:
    response = _client().post(
        "/api/agent/runs",
        json={"user_input": "Analyze sales data", "table_name": "sales"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["runtime_mode"] == "skeleton"
    assert data["run"]["run_id"]
    assert data["run"]["is_simulated"] is True
    assert data["run"]["provider_used"] == "mock"
    assert data["run"]["answer"]
    assert data["run"]["sql"]
    assert data["run"]["tool_calls"]
    assert data["run"]["trace"]


def test_agent_run_route_preserves_provider_fallback_metadata() -> None:
    response = _client().post(
        "/api/agent/runs",
        json={
            "user_input": "Analyze sales data",
            "table_name": "sales",
            "provider_requested": "deepseek",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["run"]["provider_requested"] == "deepseek"
    assert data["run"]["provider_used"] == "mock"
    assert data["run"]["fallback_triggered"] is True
    assert data["run"]["fallback_reason"]
    assert data["run"]["is_simulated"] is True


def test_agent_run_route_handles_unsafe_intent_without_500() -> None:
    response = _client().post(
        "/api/agent/runs",
        json={"user_input": "帮我删除数据库", "table_name": "sales"},
    )

    assert response.status_code != 500
    data = response.json()
    if response.status_code == 200:
        assert data["warnings"] or data["routed_intent"]
        assert data["run"]["tool_calls"] == []


def test_agent_run_route_rejects_empty_input() -> None:
    response = _client().post("/api/agent/runs", json={"user_input": ""})

    assert response.status_code == 422


def test_agent_run_route_rejects_simulated_chain_mode() -> None:
    response = _client().post(
        "/api/agent/runs",
        json={
            "user_input": "Analyze sales data and build a report",
            "table_name": "sales",
            "mode": "simulated_chain",
        },
    )

    assert response.status_code == 501
    data = response.json()
    assert data["detail"]["code"] == "agent_mode_not_enabled"
    assert "simulated_chain route execution is not enabled in M5.4.4" in data["detail"]["error"]


def test_agent_route_source_has_no_provider_leakage() -> None:
    route_source = ROUTE_PATH.read_text(encoding="utf-8").lower()
    test_source = TEST_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
        "lang" + "graph",
        "lang" + "smith",
        "_run_with_" + "provider",
        "provider_" + "runtime",
        "api_" + "key",
    ]

    for term in forbidden:
        assert term not in route_source
        assert term not in test_source


def test_agent_route_source_has_no_storage_or_db_leakage() -> None:
    route_source = ROUTE_PATH.read_text(encoding="utf-8").lower()
    test_source = TEST_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "sql" + "ite",
        "duck" + "db",
        "sess" + "ion",
        "mig" + "ration",
        "ale" + "mbic",
        "create_" + "table",
        "ins" + "ert",
        "up" + "date",
        "del" + "ete",
    ]

    for term in forbidden:
        assert term not in route_source
        assert term not in test_source
