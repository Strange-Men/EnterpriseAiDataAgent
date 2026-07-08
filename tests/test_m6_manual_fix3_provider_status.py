from pathlib import Path
from contextlib import contextmanager
import sys

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.contracts import AgentRun, AgentStatus, ProviderStatus  # noqa: E402
from backend.agent.langchain_single_agent import run_langchain_single_agent  # noqa: E402
from backend.agent.runtime import AgentRuntimeRequest  # noqa: E402
from database.db_manager import DatabaseManager  # noqa: E402


TABLE_NAME = "m6_demo_business"


@pytest.fixture()
def m6_db(tmp_path):
    DatabaseManager.reset_instance()
    db = DatabaseManager(str(tmp_path / "m6_fix3.duckdb"))
    df = pd.read_csv(ROOT / "testExcel" / "demo_sales_business_50k.csv")
    db.import_dataframe(df, table_name=TABLE_NAME)
    yield db
    db.close()
    DatabaseManager.reset_instance()


def _run(question: str, db: DatabaseManager, *, provider: str = "mock"):
    return run_langchain_single_agent(
        AgentRuntimeRequest(user_input=question, table_name=TABLE_NAME, provider_requested=provider),
        db_manager=db,
    )


def _patch_doubao_fallback(monkeypatch, reason: str = "真实模型服务响应超时，已切换为模拟分析结果。") -> None:
    import backend.agent.langchain_single_agent as single_agent

    @contextmanager
    def fake_llm_context(provider: str):
        assert provider == "doubao"
        yield

    monkeypatch.setattr(single_agent, "llm_context", fake_llm_context)
    monkeypatch.setattr(single_agent, "call_llm_text", lambda *args, **kwargs: ("[Mock LLM] fallback", object()))
    monkeypatch.setattr(
        single_agent,
        "summarize_llm_events",
        lambda: {
            "provider_requested": "doubao",
            "provider_used": "mock",
            "fallback_triggered": True,
            "fallback_reason": reason,
            "calls": 1,
        },
    )


def test_mock_provider_returns_mock_provider_status(m6_db: DatabaseManager) -> None:
    result = _run("Which channels have many orders but poor experience?", m6_db, provider="mock")

    assert result.run.requested_provider == "mock"
    assert result.run.provider_requested == "mock"
    assert result.run.provider_used == "mock"
    assert result.run.provider_status == ProviderStatus.MOCK
    assert result.run.is_simulated is True
    assert result.run.fallback_triggered is False


def test_doubao_success_metadata_returns_live_success_status(monkeypatch, m6_db: DatabaseManager) -> None:
    import backend.agent.langchain_single_agent as single_agent

    @contextmanager
    def fake_llm_context(provider: str):
        assert provider == "doubao"
        yield

    monkeypatch.setattr(single_agent, "llm_context", fake_llm_context)
    monkeypatch.setattr(
        single_agent,
        "summarize_llm_events",
        lambda: {
            "provider_requested": "doubao",
            "provider_used": "doubao",
            "fallback_triggered": False,
            "fallback_reason": None,
            "calls": 1,
        },
    )
    monkeypatch.setattr(
        single_agent.ai_analyst,
        "generate_sql",
        lambda *args, **kwargs: {"sql": f'SELECT COUNT(*) AS row_count FROM "{TABLE_NAME}";'},
    )
    monkeypatch.setattr(
        single_agent.ai_analyst,
        "explain_results",
        lambda *args, **kwargs: {"explanation": "Live Doubao-style summary."},
    )

    result = _run("Give me a concise operational summary.", m6_db, provider="doubao")

    assert result.run.requested_provider == "doubao"
    assert result.run.provider_used == "doubao"
    assert result.run.provider_status == ProviderStatus.LIVE_SUCCESS
    assert result.run.is_simulated is False
    assert result.run.fallback_triggered is False


def test_doubao_business_orchestration_fallback_is_transparent(monkeypatch, m6_db: DatabaseManager) -> None:
    _patch_doubao_fallback(monkeypatch)

    result = _run("帮我评估这张表整体经营健康度，并说明主要风险。", m6_db, provider="doubao")

    assert result.run.requested_provider == "doubao"
    assert result.run.provider_requested == "doubao"
    assert result.run.provider_used == "mock"
    assert result.run.provider_status == ProviderStatus.FALLBACK
    assert result.run.is_simulated is True
    assert result.run.fallback_triggered is True
    assert result.run.fallback_reason
    assert "模拟分析结果" in result.run.fallback_reason
    assert "Traceback" not in result.run.fallback_reason
    assert result.run.business_report


def test_bad_provider_fallback_keeps_legacy_fields_compatible(m6_db: DatabaseManager) -> None:
    result = _run("Does shipping efficiency hurt customer experience?", m6_db, provider="bad-provider")

    assert result.run.requested_provider == "bad-provider"
    assert result.run.provider_requested == "bad-provider"
    assert result.run.provider_used == "mock"
    assert result.run.provider_status == ProviderStatus.FALLBACK
    assert result.run.fallback_triggered is True
    assert result.run.fallback_reason == "当前选择的模型 provider 不受支持，已切换为模拟分析结果。"
    assert result.run.is_simulated is True


def test_error_status_does_not_masquerade_as_success() -> None:
    run = AgentRun(
        user_goal="Provider failed without fallback",
        provider_requested="doubao",
        provider_used="doubao",
        fallback_triggered=False,
        status=AgentStatus.FAILED,
        error="provider failed",
    )
    run.sync_provider_status()

    assert run.provider_status == ProviderStatus.ERROR
    assert run.is_simulated is False
    assert run.provider_used == "doubao"


def test_fallback_reason_is_readable_and_not_exception_stack() -> None:
    run = AgentRun(
        user_goal="Provider failed with traceback",
        provider_requested="doubao",
        provider_used="mock",
        fallback_triggered=True,
        fallback_reason='Traceback (most recent call last): File "backend/service.py", line 1',
        status=AgentStatus.COMPLETED,
    )
    run.sync_provider_status()

    assert run.provider_status == ProviderStatus.FALLBACK
    assert run.fallback_reason == "真实模型请求失败，已切换为模拟分析结果。"
    assert "Traceback" not in str(run.fallback_reason)
    assert "backend/service.py" not in str(run.fallback_reason)


def test_business_report_excludes_provider_status_and_technical_fields(monkeypatch, m6_db: DatabaseManager) -> None:
    _patch_doubao_fallback(monkeypatch)

    result = _run("帮我评估这张表整体经营健康度，并说明主要风险。", m6_db, provider="doubao")
    report = result.run.business_report or {}
    serialized = str(report)

    for forbidden in [
        "provider_status",
        "provider_used",
        "provider_requested",
        "requested_provider",
        "is_simulated",
        "trace",
        "tool_calls",
        "run_id",
        "memory",
    ]:
        assert forbidden not in report
        assert forbidden not in serialized


def test_trace_provider_metadata_matches_top_level_status(monkeypatch, m6_db: DatabaseManager) -> None:
    _patch_doubao_fallback(monkeypatch)

    result = _run("帮我评估这张表整体经营健康度，并说明主要风险。", m6_db, provider="doubao")
    provider_trace = result.run.trace["provider"]

    assert provider_trace["requested_provider"] == result.run.requested_provider
    assert provider_trace["provider_used"] == result.run.provider_used
    assert provider_trace["provider_status"] == result.run.provider_status.value
    assert provider_trace["is_simulated"] == result.run.is_simulated
