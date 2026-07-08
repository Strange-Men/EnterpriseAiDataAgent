from __future__ import annotations

import httpx
import pytest

from backend.services import llm_runtime


def _response(status_code: int, payload: dict) -> httpx.Response:
    return httpx.Response(status_code, json=payload, request=httpx.Request("POST", "https://example.test/v1/chat/completions"))


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


def _configure_real_provider(monkeypatch, provider: str = "doubao") -> None:
    monkeypatch.setattr(llm_runtime, "LLM_MODE", "real")
    monkeypatch.setattr(llm_runtime, "LLM_DEFAULT_PROVIDER", provider)
    monkeypatch.setattr(llm_runtime, "LLM_ALLOWED_PROVIDERS", "mock,deepseek,doubao,mimo")
    monkeypatch.setattr(llm_runtime, "LLM_FALLBACK_ON_ERROR", True)
    monkeypatch.setattr(llm_runtime, "LLM_FALLBACK_PROVIDER", "mock")
    monkeypatch.setattr(llm_runtime, "LLM_MAX_RETRIES", 1)
    monkeypatch.setattr(llm_runtime, "LLM_REQUEST_TIMEOUT_SECONDS", 60.0)
    monkeypatch.setattr(llm_runtime, "LLM_CONNECT_TIMEOUT_SECONDS", 10.0)
    monkeypatch.setattr(llm_runtime, "DOUBAO_API_KEY", "placeholder")
    monkeypatch.setattr(llm_runtime, "DOUBAO_BASE_URL", "https://example.test/v1")
    monkeypatch.setattr(llm_runtime, "DOUBAO_MODEL", "doubao-test")
    monkeypatch.setattr(llm_runtime.time, "sleep", lambda _seconds: None)


def _call_text() -> tuple[str, llm_runtime.LLMCallMetadata]:
    with llm_runtime.llm_context("doubao"):
        return llm_runtime.call_llm_text(
            "System",
            "User",
            max_tokens=64,
            temperature=0.1,
            language="zh",
            operation="summary",
        )


def test_provider_timeout_returns_readable_fallback(monkeypatch) -> None:
    _configure_real_provider(monkeypatch)

    calls = {"count": 0}

    def handler(_url, headers=None, json=None):
        calls["count"] += 1
        raise httpx.ReadTimeout("read timed out")

    monkeypatch.setattr(llm_runtime.httpx, "Client", lambda timeout=None: _FakeClient(handler, timeout=timeout))

    _text, metadata = _call_text()

    assert calls["count"] == 2
    assert metadata.provider_requested == "doubao"
    assert metadata.provider_used == "mock"
    assert metadata.fallback_triggered is True
    assert metadata.fallback_reason == "真实模型服务响应超时，已切换为模拟分析结果。"
    assert "Traceback" not in str(metadata.fallback_reason)


def test_5xx_retries_once_then_uses_live_success(monkeypatch) -> None:
    _configure_real_provider(monkeypatch)

    calls = {"count": 0}

    def handler(_url, headers=None, json=None):
        calls["count"] += 1
        if calls["count"] == 1:
            return _response(500, {"error": "temporary"})
        return _response(200, {"choices": [{"message": {"content": "live summary"}}]})

    monkeypatch.setattr(llm_runtime.httpx, "Client", lambda timeout=None: _FakeClient(handler, timeout=timeout))

    text, metadata = _call_text()

    assert calls["count"] == 2
    assert text == "live summary"
    assert metadata.provider_used == "doubao"
    assert metadata.fallback_triggered is False
    assert metadata.fallback_reason is None


def test_401_does_not_retry_and_fallback_reason_is_readable(monkeypatch) -> None:
    _configure_real_provider(monkeypatch)

    calls = {"count": 0}

    def handler(_url, headers=None, json=None):
        calls["count"] += 1
        return _response(401, {"error": "invalid key"})

    monkeypatch.setattr(llm_runtime.httpx, "Client", lambda timeout=None: _FakeClient(handler, timeout=timeout))

    _text, metadata = _call_text()

    assert calls["count"] == 1
    assert metadata.provider_used == "mock"
    assert metadata.fallback_triggered is True
    assert metadata.fallback_reason == "真实模型鉴权失败，请检查 provider 配置。"


def test_provider_timeout_configuration_uses_connect_and_request_timeout(monkeypatch) -> None:
    _configure_real_provider(monkeypatch)

    captured = {}

    def handler(_url, headers=None, json=None):
        return _response(200, {"choices": [{"message": {"content": "ok"}}]})

    def fake_client(timeout=None):
        captured["timeout"] = timeout
        return _FakeClient(handler, timeout=timeout)

    monkeypatch.setattr(llm_runtime.httpx, "Client", fake_client)

    _text, metadata = _call_text()

    assert metadata.provider_used == "doubao"
    assert captured["timeout"].connect == 10.0
    assert captured["timeout"].read == 60.0
