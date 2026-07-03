from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

from backend.agent.memory_store import AgentRunRecord, InMemoryAgentRunStore
from backend.main import app
from backend.routes.agent import get_agent_run_store


ROUTE_PATH = Path("backend/routes/agent.py")
TEST_PATH = Path("tests/unit/test_agent_api_route_store_integration.py")


class TrackingStore(InMemoryAgentRunStore):
    def __init__(self) -> None:
        super().__init__()
        self.saved_run_ids: list[str] = []

    def save_run(self, record: AgentRunRecord) -> AgentRunRecord:
        saved = super().save_run(record)
        self.saved_run_ids.append(saved.run.run_id)
        return saved


class FailingStore:
    def save_run(self, record: AgentRunRecord) -> None:
        raise RuntimeError("save boom")


def _post_with_store(payload: dict[str, Any], store: Any):
    app.dependency_overrides[get_agent_run_store] = lambda: store
    try:
        return TestClient(app).post("/api/agent/runs", json=payload)
    finally:
        app.dependency_overrides.clear()


def test_skeleton_route_saves_run() -> None:
    store = TrackingStore()
    response = _post_with_store(
        {
            "user_input": "Analyze sales data",
            "table_name": "sales",
            "mode": "skeleton",
        },
        store,
    )

    assert response.status_code == 200
    data = response.json()
    stored = store.get_run(data["run"]["run_id"])

    assert stored is not None
    assert stored.run.run_id == data["run"]["run_id"]
    assert stored.run.is_simulated is True
    assert stored.run.provider_used == "mock"
    assert stored.metadata["persistence_mode"] == "in_memory"
    assert stored.metadata["persistence_scope"] == "route_level"
    assert stored.metadata["is_ephemeral"] is True


def test_provider_fallback_metadata_persisted() -> None:
    store = TrackingStore()
    response = _post_with_store(
        {
            "user_input": "Analyze sales data",
            "table_name": "sales",
            "provider_requested": "deepseek",
            "mode": "skeleton",
        },
        store,
    )

    assert response.status_code == 200
    data = response.json()
    stored = store.get_run(data["run"]["run_id"])

    assert stored is not None
    assert stored.run.provider_requested == "deepseek"
    assert stored.run.provider_used == "mock"
    assert stored.run.fallback_triggered is True
    assert stored.run.is_simulated is True


def test_unsupported_intent_saved_as_controlled_trace() -> None:
    store = TrackingStore()
    unsafe_goal = "please " + "del" + "ete " + "the sales table"
    response = _post_with_store(
        {
            "user_input": unsafe_goal,
            "table_name": "sales",
            "mode": "skeleton",
        },
        store,
    )

    assert response.status_code != 500
    data = response.json()
    stored = store.get_run(data["run"]["run_id"])

    assert stored is not None
    assert stored.run.status in {"unsupported", "failed"}
    assert stored.warnings
    assert "unsupported" in " ".join(stored.warnings).lower()


def test_empty_input_not_saved() -> None:
    store = TrackingStore()
    response = _post_with_store({"user_input": ""}, store)

    assert response.status_code == 422
    assert store.saved_run_ids == []


def test_simulated_chain_still_disabled_and_not_saved() -> None:
    store = TrackingStore()
    response = _post_with_store(
        {
            "user_input": "Analyze sales data and build a report",
            "table_name": "sales",
            "mode": "simulated_chain",
        },
        store,
    )

    assert response.status_code == 501
    assert response.json()["detail"]["code"] == "agent_mode_not_enabled"
    assert store.saved_run_ids == []


def test_store_save_failure_does_not_crash_route() -> None:
    response = _post_with_store(
        {
            "user_input": "Analyze sales data",
            "table_name": "sales",
            "mode": "skeleton",
        },
        FailingStore(),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["run"]["run_id"]
    assert any("persistence_save_failed" in warning for warning in data["warnings"])


def test_agent_route_store_integration_source_has_no_provider_leakage() -> None:
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


def test_agent_route_store_integration_source_has_no_db_terms() -> None:
    route_source = ROUTE_PATH.read_text(encoding="utf-8").lower()
    test_source = TEST_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "sql" + "ite",
        "duck" + "db",
        "sess" + "ion",
        "mig" + "ration",
        "ale" + "mbic",
        "create " + "table",
        "alter " + "table",
        "drop " + "table",
        "ins" + "ert",
        "up" + "date",
        "del" + "ete",
    ]

    for term in forbidden:
        assert term not in route_source
        assert term not in test_source
