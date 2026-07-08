from __future__ import annotations

import httpx

from backend.agent.business_orchestration import (
    build_business_report,
    classify_business_question,
    requested_unsupported_fields,
    render_business_answer,
)
from backend.agent.contracts import IntentCategory
from backend.agent.router import route_intent
from backend.services import llm_runtime


def _response(status_code: int, payload: dict) -> httpx.Response:
    return httpx.Response(
        status_code,
        json=payload,
        request=httpx.Request("POST", "https://ark.example.test/api/v3/chat/completions"),
    )


class _FakeClient:
    def __init__(self, handler, timeout=None):
        self.handler = handler
        self.timeout = timeout

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url, headers=None, json=None):
        return self.handler(url, headers=headers, json=json)


def _configure_doubao(monkeypatch) -> None:
    monkeypatch.setattr(llm_runtime, "LLM_MODE", "real")
    monkeypatch.setattr(llm_runtime, "LLM_ALLOWED_PROVIDERS", "mock,doubao")
    monkeypatch.setattr(llm_runtime, "LLM_FALLBACK_ON_ERROR", True)
    monkeypatch.setattr(llm_runtime, "LLM_FALLBACK_PROVIDER", "mock")
    monkeypatch.setattr(llm_runtime, "LLM_MAX_RETRIES", 1)
    monkeypatch.setattr(llm_runtime, "DOUBAO_API_KEY", "placeholder-secret")
    monkeypatch.setattr(llm_runtime, "DOUBAO_BASE_URL", "https://ark.example.test/api/v3")
    monkeypatch.setattr(llm_runtime, "DOUBAO_MODEL", "doubao-test")
    monkeypatch.setattr(llm_runtime.time, "sleep", lambda _seconds: None)


def test_english_business_question_uses_new_business_report_path() -> None:
    classification = classify_business_question(
        "Please create a business executive-level operational diagnosis report using the current data."
    )

    assert classification["question_type"] == "business_health_check"

    report = build_business_report(
        question="Please create a business executive-level operational diagnosis report using the current data.",
        question_type=classification["question_type"],
        evidence_results=[
            {
                "tool_name": "compute_overall_kpis",
                "evidence_summary": "Overall KPI calculated using sales_amount, refund_rate and gross_margin_rate.",
            }
        ],
        language="en",
    )
    answer = render_business_answer(report, language="en")

    assert "unsupported" not in answer.lower()
    assert report["recommendations"]
    assert {"action", "why", "how", "metrics", "deadline", "owner_hint"}.issubset(report["recommendations"][0])
    assert "Priority action suggestions" in answer


def test_router_does_not_treat_business_report_creation_as_destructive_sql() -> None:
    route = route_intent(
        "Please create a business executive-level operational diagnosis report using the current data.",
        table_name="demo_sales_business_50k",
    )

    assert route.intent == IntentCategory.AGENT_ANALYSIS
    assert "unsafe_write_or_destructive_action" not in route.safety_flags


def test_router_routes_roi_creative_request_to_agent_for_field_gap_handling() -> None:
    route = route_intent(
        "\u8bf7\u8ba1\u7b97\u6bcf\u4e2a\u5e7f\u544a\u521b\u610f\u7684 ROI\uff0c\u5e76\u5224\u65ad\u54ea\u4e2a\u521b\u610f\u6700\u503c\u5f97\u52a0\u9884\u7b97\u3002",
        table_name="demo_sales_business_50k",
    )

    assert route.intent == IntentCategory.AGENT_ANALYSIS


def test_english_roi_and_ad_creative_are_anti_hallucination_fields() -> None:
    fields = requested_unsupported_fields("Please calculate ROI by advertising creative and rank the best creative.")

    assert "ad_spend" in fields
    assert "campaign_cost" in fields
    assert "campaign_creative" in fields

    classification = classify_business_question("Please calculate ROI by advertising creative.")
    assert classification["question_type"] == "anti_hallucination_field_check"


def test_english_anti_hallucination_report_is_readable() -> None:
    report = build_business_report(
        question="Analyze membership level repeat purchase.",
        question_type="anti_hallucination_field_check",
        evidence_results=[
            {
                "tool_name": "validate_fields",
                "missing_fields": ["membership_level"],
                "fallback_message": "missing membership_level",
            }
        ],
        language="en",
    )

    text = "\n".join([report["executive_summary"], *report["key_findings"], *report["limitations"]])
    assert "unsupported" not in text.lower()
    assert "membership_level" in text
    assert "does not support" in text
    assert "customer segment" in " ".join(report["recommendations"][0]["metrics"])


def test_doubao_config_status_does_not_expose_key(monkeypatch) -> None:
    _configure_doubao(monkeypatch)

    status = llm_runtime.provider_config_status("doubao")

    assert status["api_key_present"] is True
    assert status["base_url_host"] == "ark.example.test"
    assert status["model"] == "doubao-test"
    assert "placeholder-secret" not in str(status)


def test_doubao_model_or_base_url_error_is_classified_and_readable(monkeypatch) -> None:
    _configure_doubao(monkeypatch)

    def handler(_url, headers=None, json=None):
        return _response(404, {"error": "model not found"})

    monkeypatch.setattr(llm_runtime.httpx, "Client", lambda timeout=None: _FakeClient(handler, timeout=timeout))

    with llm_runtime.llm_context("doubao"):
        _text, metadata = llm_runtime.call_llm_text(
            "System",
            "ping",
            max_tokens=8,
            temperature=0,
            language="zh",
            operation="summary",
        )

    assert metadata.provider_used == "mock"
    assert metadata.fallback_triggered is True
    assert llm_runtime.classify_provider_failure("provider_model_or_base_url_error") == "model"
    assert "DOUBAO_BASE_URL" in str(metadata.fallback_reason)
    assert "Traceback" not in str(metadata.fallback_reason)


def test_doubao_network_error_is_classified_and_readable(monkeypatch) -> None:
    _configure_doubao(monkeypatch)

    def handler(_url, headers=None, json=None):
        raise httpx.ConnectError("[SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol")

    monkeypatch.setattr(llm_runtime.httpx, "Client", lambda timeout=None: _FakeClient(handler, timeout=timeout))

    with llm_runtime.llm_context("doubao"):
        _text, metadata = llm_runtime.call_llm_text(
            "System",
            "ping",
            max_tokens=8,
            temperature=0,
            language="zh",
            operation="summary",
        )

    assert metadata.provider_used == "mock"
    assert metadata.fallback_triggered is True
    assert llm_runtime.classify_provider_failure("provider_network_error") == "network"
    assert "网络连接失败" in str(metadata.fallback_reason)
