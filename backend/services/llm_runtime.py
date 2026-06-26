"""LLM provider runtime with safe mock fallback."""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import asdict, dataclass
import json
import re
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
    metadata = LLMCallMetadata("mock", requested, "mock", True, reason)
    return _mock_response(operation, user_message, language), _recorded(metadata)


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
    timeout = httpx.Timeout(float(LLM_REQUEST_TIMEOUT_SECONDS))
    headers = {"Authorization": f"Bearer {config.api_key}", "Content-Type": "application/json"}
    last_error: Exception | None = None
    for _attempt in range(max(0, LLM_MAX_RETRIES) + 1):
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return str(data["choices"][0]["message"]["content"])
        except Exception as exc:
            last_error = exc
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
