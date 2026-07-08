"""LLM provider runtime with safe mock fallback."""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import asdict, dataclass
import json
import re
import time
from urllib.parse import urlparse
from typing import Callable, Iterator, TypeVar

import httpx

from backend.config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
    DOUBAO_API_KEY,
    DOUBAO_BASE_URL,
    DOUBAO_MODEL,
    LLM_ALLOWED_PROVIDERS,
    LLM_CONNECT_TIMEOUT_SECONDS,
    LLM_DEFAULT_PROVIDER,
    LLM_FALLBACK_ON_ERROR,
    LLM_FALLBACK_PROVIDER,
    LLM_MAX_RETRIES,
    LLM_MODE,
    LLM_REQUEST_TIMEOUT_SECONDS,
    MIMO_API_KEY,
    MIMO_BASE_URL,
    MIMO_MODEL,
)

SUPPORTED_LLM_PROVIDERS = ["mock", "deepseek", "doubao", "mimo"]

_current_provider: ContextVar[str | None] = ContextVar("llm_provider", default=None)
_current_events: ContextVar[list[dict] | None] = ContextVar("llm_events", default=None)

T = TypeVar("T")


class LLMProviderSelectionError(ValueError):
    """Raised when a requested provider is not supported or allowed."""


class LLMProviderRequestError(RuntimeError):
    """Raised for provider HTTP errors with a product-readable fallback reason."""

    def __init__(self, reason: str, *, retryable: bool = False) -> None:
        super().__init__(reason)
        self.reason = reason
        self.retryable = retryable


@dataclass(frozen=True)
class LLMProviderConfig:
    provider: str
    api_key: str
    base_url: str
    model: str


@dataclass(frozen=True)
class LLMCallMetadata:
    mode: str
    provider_requested: str
    provider_used: str
    fallback_triggered: bool = False
    fallback_reason: str | None = None


def allowed_providers() -> list[str]:
    configured = [p.strip().lower() for p in LLM_ALLOWED_PROVIDERS.split(",") if p.strip()]
    return [p for p in configured if p in SUPPORTED_LLM_PROVIDERS] or ["mock"]


def _default_provider() -> str:
    if LLM_MODE == "mock":
        return "mock"
    return LLM_DEFAULT_PROVIDER or "mock"


def normalize_provider(provider: str | None) -> str:
    requested = (provider or _current_provider.get() or _default_provider()).strip().lower()
    if requested not in SUPPORTED_LLM_PROVIDERS:
        raise LLMProviderSelectionError("Unsupported LLM provider.")
    if requested not in allowed_providers():
        raise LLMProviderSelectionError("LLM provider is not allowed by runtime configuration.")
    return requested


def get_provider_config(provider: str) -> LLMProviderConfig:
    if provider == "deepseek":
        return LLMProviderConfig(provider, DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL)
    if provider == "doubao":
        return LLMProviderConfig(provider, DOUBAO_API_KEY, DOUBAO_BASE_URL, DOUBAO_MODEL)
    if provider == "mimo":
        return LLMProviderConfig(provider, MIMO_API_KEY, MIMO_BASE_URL, MIMO_MODEL)
    return LLMProviderConfig("mock", "", "", "mock-llm")


def provider_config_status(provider: str) -> dict[str, object]:
    """Return provider diagnostics without exposing secrets."""

    normalized = provider.strip().lower()
    config = get_provider_config(normalized)
    parsed = urlparse(config.base_url or "")
    return {
        "provider": config.provider,
        "api_key_present": bool(config.api_key),
        "base_url_present": bool(config.base_url),
        "base_url_host": parsed.netloc,
        "model_present": bool(config.model),
        "model": config.model,
        "connect_timeout_seconds": float(LLM_CONNECT_TIMEOUT_SECONDS),
        "request_timeout_seconds": float(LLM_REQUEST_TIMEOUT_SECONDS),
        "max_retries": int(LLM_MAX_RETRIES),
        "allowed": config.provider in allowed_providers(),
    }


def classify_provider_failure(reason: str | None) -> str:
    """Classify a provider failure for QA reports and user-facing fallback states."""

    text = str(reason or "").strip().lower()
    if not text or "provider_unavailable" in text:
        return "env"
    if "auth" in text or "401" in text or "403" in text or "unauthorized" in text or "forbidden" in text:
        return "auth"
    if "model" in text or "base_url" in text or "404" in text or "not found" in text:
        return "model"
    if "timeout" in text or "timed out" in text:
        return "timeout"
    if "rate" in text or "429" in text:
        return "provider"
    if "server" in text or "5xx" in text or "500" in text or "502" in text or "503" in text:
        return "provider"
    if "network" in text or "connection" in text or "connect" in text or "dns" in text or "ssl" in text or "eof" in text:
        return "network"
    return "unknown"


@contextmanager
def llm_context(provider: str | None) -> Iterator[None]:
    normalized = normalize_provider(provider)
    provider_token = _current_provider.set(normalized)
    events_token = _current_events.set([])
    try:
        yield
    finally:
        _current_provider.reset(provider_token)
        _current_events.reset(events_token)


def run_with_llm_context(provider: str | None, fn: Callable[[], T]) -> T:
    with llm_context(provider):
        result = fn()
        if isinstance(result, dict):
            result.setdefault("llm", summarize_llm_events())
        return result


def summarize_llm_events() -> dict:
    events = _current_events.get() or []
    if not events:
        requested = normalize_provider(None)
        return {
            "mode": "mock" if requested == "mock" else "real",
            "provider_requested": requested,
            "provider_used": requested,
            "fallback_triggered": False,
            "fallback_reason": None,
        }
    first = events[0]
    fallback = next((e for e in events if e.get("fallback_triggered")), None)
    last = events[-1]
    return {
        "mode": "mock" if last.get("provider_used") == "mock" else "real",
        "provider_requested": first.get("provider_requested", "mock"),
        "provider_used": last.get("provider_used", "mock"),
        "fallback_triggered": fallback is not None,
        "fallback_reason": fallback.get("fallback_reason") if fallback else None,
        "calls": len(events),
    }


def _record_metadata(metadata: LLMCallMetadata) -> None:
    events = _current_events.get()
    if events is not None:
        events.append(asdict(metadata))


def call_llm_text(
    system: str,
    user_message: str,
    *,
    max_tokens: int,
    temperature: float,
    language: str,
    operation: str,
) -> tuple[str, LLMCallMetadata]:
    requested = normalize_provider(None)
    if requested == "mock":
        return _mock_response(operation, user_message, language), _recorded(
            LLMCallMetadata("mock", requested, "mock")
        )

    provider_config = get_provider_config(requested)
    if not provider_config.api_key or not provider_config.base_url or not provider_config.model:
        return _fallback_mock(requested, "provider_unavailable", operation, user_message, language)

    try:
        text = _call_openai_compatible(provider_config, system, user_message, max_tokens, temperature)
        if not text.strip():
            raise RuntimeError("empty_provider_response")
        return text, _recorded(LLMCallMetadata("real", requested, requested))
    except LLMProviderRequestError as exc:
        if LLM_FALLBACK_ON_ERROR and LLM_FALLBACK_PROVIDER == "mock":
            return _fallback_mock(requested, exc.reason, operation, user_message, language)
        raise RuntimeError("LLM provider request failed")
    except Exception:
        if LLM_FALLBACK_ON_ERROR and LLM_FALLBACK_PROVIDER == "mock":
            return _fallback_mock(requested, "provider_request_failed", operation, user_message, language)
        raise RuntimeError("LLM provider request failed")


def _recorded(metadata: LLMCallMetadata) -> LLMCallMetadata:
    _record_metadata(metadata)
    return metadata


def _fallback_mock(
    requested: str,
    reason: str,
    operation: str,
    user_message: str,
    language: str,
) -> tuple[str, LLMCallMetadata]:
    metadata = LLMCallMetadata("mock", requested, "mock", True, readable_fallback_reason(reason))
    return _mock_response(operation, user_message, language), _recorded(metadata)


def readable_fallback_reason(reason: str | None) -> str:
    text = str(reason or "").strip()
    if text == "provider_model_or_base_url_error":
        return "豆包模型地址或模型名不可用，请检查 DOUBAO_BASE_URL / DOUBAO_MODEL 配置。"
    if text == "provider_network_error":
        return "真实模型网络连接失败，已切换为模拟分析结果。"
    mapping = {
        "provider_unavailable": "未检测到真实模型配置，当前使用演示模式。",
        "provider_timeout": "真实模型服务响应超时，已切换为模拟分析结果。",
        "provider_rate_limited": "真实模型服务限流或繁忙，已切换为模拟分析结果。",
        "provider_server_error": "真实模型服务暂时不可用，已切换为模拟分析结果。",
        "provider_auth_failed": "真实模型鉴权失败，请检查 provider 配置。",
        "provider_request_failed": "真实模型请求失败，已切换为模拟分析结果。",
        "provider_unavailable_or_mock_fallback": "真实模型未成功返回，已切换为模拟分析结果。",
        "provider_fallback_to_mock": "真实模型未成功返回，已切换为模拟分析结果。",
        "unsupported_provider": "当前选择的模型 provider 不受支持，已切换为模拟分析结果。",
        "requested_field_not_found": "当前数据表缺少请求字段，已返回可用字段范围内的替代分析。",
    }
    if text in mapping:
        return mapping[text]
    lower = text.lower()
    if "timeout" in lower or "timed out" in lower:
        return mapping["provider_timeout"]
    if "401" in text or "403" in text or "unauthorized" in lower or "forbidden" in lower:
        return mapping["provider_auth_failed"]
    if "404" in text or "model" in lower or "base_url" in lower or "not found" in lower:
        return readable_fallback_reason("provider_model_or_base_url_error")
    if "429" in text or "rate" in lower:
        return mapping["provider_rate_limited"]
    if "ssl" in lower or "eof" in lower or "connect" in lower or "network" in lower:
        return readable_fallback_reason("provider_network_error")
    if len(text) > 180:
        return text[:177].rstrip() + "..."
    return text or mapping["provider_request_failed"]


def _call_openai_compatible(
    config: LLMProviderConfig,
    system: str,
    user_message: str,
    max_tokens: int,
    temperature: float,
) -> str:
    url = f"{config.base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": config.model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    timeout = httpx.Timeout(
        timeout=float(LLM_REQUEST_TIMEOUT_SECONDS),
        connect=float(LLM_CONNECT_TIMEOUT_SECONDS),
    )
    headers = {"Authorization": f"Bearer {config.api_key}", "Content-Type": "application/json"}
    last_error: LLMProviderRequestError | None = None
    for _attempt in range(max(0, LLM_MAX_RETRIES) + 1):
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(url, headers=headers, json=payload)
            if response.status_code in {401, 403}:
                raise LLMProviderRequestError("provider_auth_failed", retryable=False)
            if response.status_code == 404:
                raise LLMProviderRequestError("provider_model_or_base_url_error", retryable=False)
            if response.status_code == 429:
                raise LLMProviderRequestError("provider_rate_limited", retryable=True)
            if 500 <= response.status_code < 600:
                raise LLMProviderRequestError("provider_server_error", retryable=True)
            response.raise_for_status()
            data = response.json()
            return str(data["choices"][0]["message"]["content"])
        except (httpx.TimeoutException, TimeoutError):
            last_error = LLMProviderRequestError("provider_timeout", retryable=True)
        except LLMProviderRequestError as exc:
            last_error = exc
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code if exc.response is not None else 0
            if status in {401, 403}:
                last_error = LLMProviderRequestError("provider_auth_failed", retryable=False)
            elif status == 404:
                last_error = LLMProviderRequestError("provider_model_or_base_url_error", retryable=False)
            elif status == 429:
                last_error = LLMProviderRequestError("provider_rate_limited", retryable=True)
            elif status >= 500:
                last_error = LLMProviderRequestError("provider_server_error", retryable=True)
            else:
                last_error = LLMProviderRequestError("provider_request_failed", retryable=False)
        except httpx.RequestError as exc:
            reason = "provider_timeout" if isinstance(exc, httpx.TimeoutException) else "provider_network_error"
            last_error = LLMProviderRequestError(reason, retryable=True)
        except Exception:
            last_error = LLMProviderRequestError("provider_request_failed", retryable=False)
        if not last_error.retryable or _attempt >= max(0, LLM_MAX_RETRIES):
            break
        time.sleep(1.0)
    if last_error is not None:
        raise last_error
    raise RuntimeError("LLM provider request failed")


def _mock_response(operation: str, user_message: str, language: str) -> str:
    zh = language.startswith("zh")
    marker = "[Mock LLM]"
    table = _extract_table_name(user_message)
    if operation == "sql_generation":
        return f"SELECT * FROM {table} LIMIT 100;"
    if operation == "insights":
        return json.dumps({
            "insights": [
                {
                    "text": f"{marker} 这是基于样例数据生成的模拟洞察。" if zh else f"{marker} This is a simulated insight based on sample data.",
                    "confidence": 0.5,
                    "severity": "low",
                    "impact": "low",
                    "category": "mock",
                }
            ],
            "trends": [f"{marker} 模拟趋势：请配置真实模型以获得生产级解释。" if zh else f"{marker} Simulated trend: configure a real provider for production-grade analysis."],
            "data_quality_notes": [],
            "suggested_next_steps": [
                "配置后端 LLM provider key 后重新运行。" if zh else "Configure a backend LLM provider key and run again."
            ],
        }, ensure_ascii=False)
    if operation == "chart_suggest":
        return json.dumps({"recommended_charts": []}, ensure_ascii=False)
    if operation == "semantics":
        return json.dumps({
            "summary": f"{marker} 模拟语义摘要。" if zh else f"{marker} Simulated semantic summary.",
            "columns": [],
            "detected_kpis": [],
            "detected_measures": [],
            "detected_time_columns": [],
            "detected_entities": [],
            "detected_metrics": [],
            "detected_dimensions": [],
            "suggested_focus": f"{marker} Configure a real provider for semantic interpretation.",
        }, ensure_ascii=False)
    if operation == "suggest_questions":
        return json.dumps({
            "questions": [
                {
                    "question": "这张表的总体趋势是什么？" if zh else "What is the overall trend in this table?",
                    "category": "overview",
                    "reason": f"{marker} mock suggestion",
                }
            ]
        }, ensure_ascii=False)
    if operation == "analysis_plan":
        return json.dumps({
            "plan": [
                {
                    "step": 1,
                    "purpose": f"{marker} 生成基础数据概览" if zh else f"{marker} Generate a basic data overview",
                    "sql_goal": f"Preview rows from {table}",
                    "depends_on": None,
                }
            ]
        }, ensure_ascii=False)
    if operation == "anomaly_interpretation":
        return json.dumps({
            "interpretations": [],
            "summary": f"{marker} 模拟异常解释。" if zh else f"{marker} Simulated anomaly interpretation.",
            "recommended_actions": [],
        }, ensure_ascii=False)
    if operation == "self_evaluation":
        return json.dumps({
            "confidence": 0.5,
            "completeness": "mock",
            "accuracy": "mock",
            "actionability": "mock",
            "diagnostics": [f"{marker} simulated evaluation"],
            "suggested_improvements": [],
        }, ensure_ascii=False)
    if operation == "template_adaptation":
        return json.dumps({"adapted_questions": []}, ensure_ascii=False)
    return (
        f"{marker} 这是 Mock LLM 生成的演示结果。配置真实 provider 后可获得真实模型输出。"
        if zh else
        f"{marker} This demo result was generated by Mock LLM. Configure a real provider for model output."
    )


def _extract_table_name(user_message: str) -> str:
    match = re.search(r"Table:\s*([A-Za-z_][A-Za-z0-9_]*)", user_message)
    if match:
        return match.group(1)
    match = re.search(r"table\s+['`\"]?([A-Za-z_][A-Za-z0-9_]*)", user_message, re.IGNORECASE)
    if match:
        return match.group(1)
    return "demo_sales"
