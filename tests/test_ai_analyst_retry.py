"""Tests for configurable LLM providers and mock fallback."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

from backend.services import llm_runtime
from backend.services.ai_analyst import _call_llm, _call_llm_stream
from backend.services.llm_runtime import llm_context, summarize_llm_events


def test_default_provider_is_mock():
    with llm_context(None):
        result = _call_llm("system", "user message")
        metadata = summarize_llm_events()

    assert "[Mock LLM]" in result
    assert metadata["provider_requested"] == "mock"
    assert metadata["provider_used"] == "mock"
    assert metadata["fallback_triggered"] is False


def test_mock_provider_does_not_require_key():
    with llm_context("mock"):
        result = _call_llm("system", "Available tables and columns:\n\nTable: sales\n  - id (INTEGER)", operation="sql_generation")
        metadata = summarize_llm_events()

    assert result == "SELECT * FROM sales LIMIT 100;"
    assert metadata["provider_used"] == "mock"


@pytest.mark.parametrize("provider", ["deepseek", "doubao", "mimo"])
def test_real_provider_missing_config_falls_back_to_mock(monkeypatch, provider):
    monkeypatch.setattr(llm_runtime, f"{provider.upper()}_API_KEY", "")
    monkeypatch.setattr(llm_runtime, f"{provider.upper()}_BASE_URL", "")
    monkeypatch.setattr(llm_runtime, f"{provider.upper()}_MODEL", "")

    with llm_context(provider):
        result = _call_llm("system", "user message")
        metadata = summarize_llm_events()

    assert "[Mock LLM]" in result
    assert metadata["provider_requested"] == provider
    assert metadata["provider_used"] == "mock"
    assert metadata["fallback_triggered"] is True
    assert metadata["fallback_reason"] == "provider_unavailable"


def test_real_provider_request_failure_falls_back_to_mock(monkeypatch):
    monkeypatch.setattr(llm_runtime, "DEEPSEEK_API_KEY", "placeholder")
    monkeypatch.setattr(llm_runtime, "DEEPSEEK_BASE_URL", "https://example.invalid/v1")
    monkeypatch.setattr(llm_runtime, "DEEPSEEK_MODEL", "deepseek-chat")

    def fail_request(*_args, **_kwargs):
        raise RuntimeError("upstream 401 secret-token")

    monkeypatch.setattr(llm_runtime, "_call_openai_compatible", fail_request)

    with llm_context("deepseek"):
        result = _call_llm("system", "user message")
        metadata = summarize_llm_events()

    assert "[Mock LLM]" in result
    assert metadata["provider_requested"] == "deepseek"
    assert metadata["provider_used"] == "mock"
    assert metadata["fallback_triggered"] is True
    assert metadata["fallback_reason"] == "provider_request_failed"
    assert "secret-token" not in str(metadata)


def test_stream_uses_mock_fallback():
    with llm_context("mock"):
        chunks = list(_call_llm_stream("system", "user message"))
        metadata = summarize_llm_events()

    assert len(chunks) == 1
    assert "[Mock LLM]" in chunks[0]
    assert metadata["provider_used"] == "mock"


def test_invalid_provider_rejected():
    with pytest.raises(llm_runtime.LLMProviderSelectionError):
        with llm_context("not-a-provider"):
            _call_llm("system", "user message")
