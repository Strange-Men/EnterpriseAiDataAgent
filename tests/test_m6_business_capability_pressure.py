from __future__ import annotations

import json
from pathlib import Path
import sys
from time import perf_counter
from typing import Any

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.agent.langchain_single_agent import run_langchain_single_agent  # noqa: E402
from backend.agent.memory_store import AgentRunRecord, InMemoryAgentRunStore  # noqa: E402
from backend.agent.runtime import AgentRuntimeRequest  # noqa: E402
from database.db_manager import DatabaseManager  # noqa: E402


TABLE_NAME = "m6_demo_business"
PRESSURE_FIXTURE = ROOT / "tests" / "fixtures" / "m6_pressure_questions.json"
HIDDEN_TECHNICAL_TERMS = {"tool_calls", "trace", "provider", "run_id", "memory", "raw json"}
BUSINESS_TOOL_EXCLUSIONS = {"inspect_schema", "memory_read", "memory_write"}
ANTI_HALLUCINATION_IDS = {"M6-Q21", "M6-Q22", "M6-Q23"}
FOLLOW_UP_IDS = {"M6-Q24", "M6-Q25"}
COMPLEX_IDS = {"M6-Q01", "M6-Q02", "M6-Q03", "M6-Q05", "M6-Q07", "M6-Q16", "M6-Q17", "M6-Q18", "M6-Q20"}
FORBIDDEN_FABRICATIONS = {
    "ad_spend",
    "campaign_cost",
    "membership_level",
    "neighborhood",
    "address",
    "latitude",
    "longitude",
    "campaign_creative",
    "钻石会员",
    "黄金会员",
    "小区A",
}


@pytest.fixture(scope="module")
def pressure_cases() -> list[dict[str, Any]]:
    return json.loads(PRESSURE_FIXTURE.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def m6_pressure_db(tmp_path_factory: pytest.TempPathFactory) -> DatabaseManager:
    DatabaseManager.reset_instance()
    db_path = tmp_path_factory.mktemp("m6_pressure") / "business_pressure.duckdb"
    db = DatabaseManager(str(db_path))
    df = pd.read_csv(ROOT / "testExcel" / "demo_sales_business_50k.csv")
    db.import_dataframe(df, table_name=TABLE_NAME)
    yield db
    db.close()
    DatabaseManager.reset_instance()


def _run_question(
    question: str,
    db: DatabaseManager,
    *,
    provider: str = "mock",
    memory_store: InMemoryAgentRunStore | None = None,
    previous_run_id: str | None = None,
) -> tuple[Any, float]:
    started = perf_counter()
    result = run_langchain_single_agent(
        AgentRuntimeRequest(
            user_input=question,
            table_name=TABLE_NAME,
            provider_requested=provider,
            metadata={"previous_run_id": previous_run_id} if previous_run_id else {},
        ),
        memory_store=memory_store,
        db_manager=db,
    )
    return result, perf_counter() - started


def _json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)


def _business_tool_names(result: Any) -> set[str]:
    return {call.tool_name for call in result.run.tool_calls if call.tool_name not in BUSINESS_TOOL_EXCLUSIONS}


def _report_sections_present(report: dict[str, Any], required_sections: list[str]) -> bool:
    for section in required_sections:
        value = report.get(section)
        if section == "risk_priorities" and not value:
            continue
        if value is None:
            return False
        if isinstance(value, list) and not value:
            return False
        if isinstance(value, str) and not value.strip():
            return False
    return True


def _has_no_technical_leak(result: Any) -> bool:
    visible_text = f"{result.run.answer or ''}\n{_json_text(result.run.business_report or {})}".lower()
    return all(term not in visible_text for term in HIDDEN_TECHNICAL_TERMS) and "select *" not in visible_text


def _has_no_fabricated_fields(case: dict[str, Any], result: Any) -> bool:
    text = f"{result.run.answer or ''}\n{_json_text(result.run.business_report or {})}"
    allowed = set(case.get("anti_hallucination_expectations") or [])
    for field in FORBIDDEN_FABRICATIONS:
        if field in allowed:
            continue
        if field in text:
            return False
    return True


def _has_expected_missing_fields(case: dict[str, Any], result: Any) -> bool:
    expected = set(case.get("anti_hallucination_expectations") or [])
    if not expected:
        return True
    report = result.run.business_report or {}
    text = _json_text(report)
    return all(field in text for field in expected)


def score_pressure_result(case: dict[str, Any], result: Any) -> dict[str, Any]:
    report = result.run.business_report or {}
    plan = result.run.trace.get("analysis_plan") or {}
    business_tools = _business_tool_names(result)
    business_tool_count = int(result.run.trace.get("business_tool_count") or len(business_tools))
    question_id = str(case["id"])
    is_anti = question_id in ANTI_HALLUCINATION_IDS
    is_follow_up = question_id in FOLLOW_UP_IDS

    checks = {
        "field_identification": bool(plan.get("required_fields") or plan.get("dimensions") or is_anti),
        "no_hallucinated_fields": _has_no_fabricated_fields(case, result) and _has_expected_missing_fields(case, result),
        "multi_metric_decomposition": bool(plan.get("metrics")) or len(business_tools) >= 2 or is_anti,
        "multi_evidence_query": business_tool_count >= (3 if question_id in COMPLEX_IDS else 1),
        "reasonable_metric_calculation": bool(report.get("evidence_summary")) or is_anti,
        "business_judgment": bool(report.get("executive_summary") and report.get("key_findings")),
        "risk_priority": bool(report.get("risk_priorities")) or is_anti or "growth_opportunity" in str(case.get("category")),
        "actionable_recommendations": bool(report.get("recommendations")) or bool(report.get("limitations")) if is_anti else bool(report.get("recommendations")),
        "plain_language": bool(result.run.answer) and "```" not in str(result.run.answer) and "SELECT " not in str(result.run.answer).upper(),
        "hidden_technical_details": _has_no_technical_leak(result),
    }
    score = sum(1 for passed in checks.values() if passed)
    return {
        "id": question_id,
        "category": case.get("category"),
        "score": score,
        "checks": checks,
        "tool_count": business_tool_count,
        "tool_names": sorted(business_tools),
        "question_type": result.run.trace.get("business_question_type"),
        "sections_present": _report_sections_present(report, list(case.get("required_business_report_sections") or [])),
        "memory_used": bool(result.run.memory_used),
    }


def test_fixture_covers_all_25_pressure_questions(pressure_cases: list[dict[str, Any]]) -> None:
    ids = [case["id"] for case in pressure_cases]

    assert len(pressure_cases) == 25
    assert ids == [f"M6-Q{index:02d}" for index in range(1, 26)]
    for case in pressure_cases:
        assert case["question"]
        assert case["category"]
        assert case["expected_capabilities"]
        assert case["required_business_report_sections"]
        assert case["min_score_hint"] >= 8


def test_m6_pressure_questions_meet_business_capability_rubric(
    pressure_cases: list[dict[str, Any]],
    m6_pressure_db: DatabaseManager,
) -> None:
    memory_store = InMemoryAgentRunStore()
    score_rows: list[dict[str, Any]] = []
    durations: dict[str, float] = {}
    previous_run_id: str | None = None

    for case in pressure_cases:
        if case["id"] == "M6-Q24" and previous_run_id is None:
            seed_result, _ = _run_question("哪些地区是高收入但高风险？", m6_pressure_db, memory_store=memory_store)
            memory_store.save_run(AgentRunRecord(run=seed_result.run, warnings=seed_result.warnings))
            previous_run_id = seed_result.run.run_id

        result, duration = _run_question(
            case["question"],
            m6_pressure_db,
            memory_store=memory_store,
            previous_run_id=previous_run_id if case["id"] in FOLLOW_UP_IDS else None,
        )
        memory_store.save_run(AgentRunRecord(run=result.run, warnings=result.warnings))
        if case["id"] in FOLLOW_UP_IDS:
            previous_run_id = result.run.run_id

        report = result.run.business_report
        assert result.run.status in {"completed", "partial"}
        assert report is not None, case["id"]
        assert report.get("executive_summary"), case["id"]
        assert report.get("key_findings"), case["id"]
        assert report.get("next_questions"), case["id"]
        assert _report_sections_present(report, case["required_business_report_sections"]), case["id"]
        assert _has_no_technical_leak(result), case["id"]

        score_row = score_pressure_result(case, result)
        score_rows.append(score_row)
        durations[case["id"]] = duration
        assert score_row["score"] >= int(case["min_score_hint"]), score_row

    high_score_count = sum(1 for row in score_rows if row["score"] >= 8)
    complex_multi_evidence_count = sum(1 for row in score_rows if row["id"] in COMPLEX_IDS and row["tool_count"] >= 3)
    ordinary_durations = [duration for qid, duration in durations.items() if qid not in COMPLEX_IDS]
    complex_durations = [duration for qid, duration in durations.items() if qid in COMPLEX_IDS]

    assert high_score_count >= 20
    assert complex_multi_evidence_count >= 5
    assert max(ordinary_durations) < 10
    assert max(complex_durations) < 25


@pytest.mark.parametrize("question_id,expected_fields", [
    ("M6-Q21", {"ad_spend", "campaign_cost"}),
    ("M6-Q22", {"membership_level"}),
    ("M6-Q23", {"neighborhood", "address", "latitude", "longitude"}),
])
def test_anti_hallucination_cases_are_controlled(
    pressure_cases: list[dict[str, Any]],
    m6_pressure_db: DatabaseManager,
    question_id: str,
    expected_fields: set[str],
) -> None:
    case = next(item for item in pressure_cases if item["id"] == question_id)
    result, _ = _run_question(case["question"], m6_pressure_db)
    report_text = _json_text(result.run.business_report or {})

    assert result.run.business_report
    assert expected_fields.issubset(set(case["anti_hallucination_expectations"]))
    assert all(field in report_text for field in expected_fields)
    assert "不能" in report_text or "缺少" in report_text
    assert any(call.tool_name == "validate_fields" for call in result.run.tool_calls)
    assert _has_no_fabricated_fields(case, result)


def test_memory_follow_up_chain_uses_previous_evidence_summary(
    pressure_cases: list[dict[str, Any]],
    m6_pressure_db: DatabaseManager,
) -> None:
    memory_store = InMemoryAgentRunStore()
    seed_case = next(item for item in pressure_cases if item["id"] == "M6-Q03")
    q24 = next(item for item in pressure_cases if item["id"] == "M6-Q24")
    q25 = next(item for item in pressure_cases if item["id"] == "M6-Q25")

    first, _ = _run_question(seed_case["question"], m6_pressure_db, memory_store=memory_store)
    memory_store.save_run(AgentRunRecord(run=first.run, warnings=first.warnings))
    follow_up, _ = _run_question(q24["question"], m6_pressure_db, memory_store=memory_store, previous_run_id=first.run.run_id)
    memory_store.save_run(AgentRunRecord(run=follow_up.run, warnings=follow_up.warnings))
    action_plan, _ = _run_question(q25["question"], m6_pressure_db, memory_store=memory_store, previous_run_id=follow_up.run.run_id)

    assert follow_up.run.memory_used is True
    assert action_plan.run.memory_used is True
    assert follow_up.run.trace["business_classification"]["question_type"] == "follow_up_drilldown"
    assert action_plan.run.trace["business_classification"]["question_type"] in {"follow_up_drilldown", "recommendation_request"}
    assert any(call.tool_name == "memory_read" for call in follow_up.run.tool_calls)
    assert any(call.tool_name == "memory_read" for call in action_plan.run.tool_calls)
    assert follow_up.run.business_report["executive_summary"]
    assert action_plan.run.business_report["recommendations"] or action_plan.run.business_report["limitations"]


def test_mock_provider_and_bad_provider_fallback_are_controlled(m6_pressure_db: DatabaseManager) -> None:
    mock_result, _ = _run_question("哪些渠道带来了订单，但客户体验可能不好？", m6_pressure_db, provider="mock")
    bad_result, _ = _run_question("发货效率有没有拖累客户体验？", m6_pressure_db, provider="bad-provider")

    assert mock_result.run.provider_used == "mock"
    assert mock_result.run.fallback_triggered is False
    assert mock_result.run.trace.get("llm_calls", 0) == 0
    assert mock_result.run.business_report

    assert bad_result.run.provider_requested == "bad-provider"
    assert bad_result.run.provider_used == "mock"
    assert bad_result.run.fallback_triggered is True
    assert bad_result.run.fallback_reason == "unsupported_provider"
    assert bad_result.run.business_report
