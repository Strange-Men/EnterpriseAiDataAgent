from pathlib import Path

from backend.agent.contracts import AgentStatus
from backend.agent.memory_store import AgentRunRecord, InMemoryAgentRunStore
from backend.agent.runtime import (
    AgentRuntimeInjectedTools,
    AgentRuntimeRequest,
    run_agent_runtime_simulated_chain,
    run_agent_runtime_skeleton,
)


STORE_PATH = Path("backend/agent/memory_store.py")


class FakeExecutor:
    def execute(self, sql: str, row_limit: int = 50) -> dict:
        return {
            "columns": ["channel", "revenue"],
            "rows": [{"channel": "organic", "revenue": 100}],
            "row_count": 1,
        }


def fake_generator(**kwargs) -> str:
    return "SELECT channel, SUM(revenue) AS total_revenue FROM sales GROUP BY channel"


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


def fake_tools() -> AgentRuntimeInjectedTools:
    return AgentRuntimeInjectedTools(
        generator=fake_generator,
        executor=FakeExecutor(),
        summarizer=fake_summarizer,
        report_builder=fake_report_builder,
    )


def test_save_and_get_skeleton_agent_run() -> None:
    store = InMemoryAgentRunStore()
    result = run_agent_runtime_skeleton(
        AgentRuntimeRequest(user_input="Please summarize this sales dataset", table_name="sales")
    )
    saved = store.save_run(AgentRunRecord(run=result.run, warnings=result.warnings))
    loaded = store.get_run(result.run.run_id)

    assert saved.run.run_id == result.run.run_id
    assert loaded is not None
    assert loaded.run.run_id == result.run.run_id
    assert loaded.run.status == result.run.status
    assert loaded.run.is_simulated is result.run.is_simulated
    assert loaded.run.provider_used == "mock"
    assert loaded.steps
    assert loaded.warnings == result.warnings


def test_save_and_get_simulated_chain_agent_run() -> None:
    store = InMemoryAgentRunStore()
    result = run_agent_runtime_simulated_chain(
        AgentRuntimeRequest(
            user_input="sum revenue by channel",
            table_name="sales",
            provider_requested="deepseek",
        ),
        tools=fake_tools(),
    )
    loaded = store.save_run(AgentRunRecord(run=result.run, warnings=result.warnings, metadata={"runtime": "simulated"}))

    assert result.run.status == AgentStatus.COMPLETED
    assert len(result.run.tool_calls) >= 4
    assert len(loaded.tool_calls) == len(result.run.tool_calls)
    assert loaded.run.provider_requested == "deepseek"
    assert loaded.run.provider_used == "mock"
    assert loaded.run.fallback_triggered is True
    assert loaded.run.fallback_reason
    assert loaded.run.is_simulated is True
    assert loaded.metadata["runtime"] == "simulated"


def test_missing_run_returns_none() -> None:
    store = InMemoryAgentRunStore()

    assert store.get_run("missing") is None
    assert store.get_run("   ") is None


def test_same_run_id_replace_is_controlled() -> None:
    store = InMemoryAgentRunStore()
    result = run_agent_runtime_skeleton(AgentRuntimeRequest(user_input="Please summarize sales", table_name="sales"))

    first = store.save_run(AgentRunRecord(run=result.run, warnings=["first"]))
    second = store.save_run(AgentRunRecord(run=result.run, warnings=["second"]))
    loaded = store.get_run(result.run.run_id)

    assert first.run.run_id == second.run.run_id
    assert loaded is not None
    assert loaded.warnings == ["second"]


def test_clear_store_removes_records() -> None:
    store = InMemoryAgentRunStore()
    result = run_agent_runtime_skeleton(AgentRuntimeRequest(user_input="Please summarize sales", table_name="sales"))
    store.save_run(AgentRunRecord(run=result.run))

    store.clear()

    assert store.get_run(result.run.run_id) is None


def test_store_returns_deep_copies() -> None:
    store = InMemoryAgentRunStore()
    result = run_agent_runtime_skeleton(AgentRuntimeRequest(user_input="Please summarize sales", table_name="sales"))
    saved = store.save_run(AgentRunRecord(run=result.run, warnings=["saved"]))
    saved.warnings.append("local-only")

    loaded = store.get_run(result.run.run_id)

    assert loaded is not None
    assert loaded.warnings == ["saved"]


def test_memory_store_source_has_no_db_or_provider_terms() -> None:
    source = STORE_PATH.read_text(encoding="utf-8").lower()
    forbidden = [
        "sql" + "ite",
        "duck" + "db",
        "sess" + "ion",
        "mig" + "ration",
        "ale" + "mbic",
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
        "provider_" + "runtime",
        "_run_with_" + "provider",
        "api_" + "key",
    ]

    for term in forbidden:
        assert term not in source
