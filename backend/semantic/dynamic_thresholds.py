"""Simple quantile helpers for M6 dynamic business thresholds."""

from __future__ import annotations

from collections.abc import Iterable

from backend.semantic.business_thresholds import DYNAMIC_THRESHOLD_RULES, DynamicThresholdRule


def _clean_values(values: Iterable[float | int | None]) -> list[float]:
    cleaned: list[float] = []
    for value in values:
        if value is None:
            continue
        number = float(value)
        if number == number:
            cleaned.append(number)
    return sorted(cleaned)


def quantile(values: Iterable[float | int | None], q: float) -> float:
    if not 0 <= q <= 1:
        raise ValueError("q must be between 0 and 1")
    sorted_values = _clean_values(values)
    if not sorted_values:
        raise ValueError("values must contain at least one numeric value")
    if len(sorted_values) == 1:
        return sorted_values[0]

    position = (len(sorted_values) - 1) * q
    lower_index = int(position)
    upper_index = min(lower_index + 1, len(sorted_values) - 1)
    weight = position - lower_index
    return sorted_values[lower_index] * (1 - weight) + sorted_values[upper_index] * weight


def threshold_for_rule(values: Iterable[float | int | None], rule: DynamicThresholdRule) -> float:
    return quantile(values, rule.quantile)


def calculate_dynamic_thresholds(metric_values: dict[str, Iterable[float | int | None]]) -> dict[str, dict[str, float | str]]:
    thresholds: dict[str, dict[str, float | str]] = {}
    for metric_name, rule in DYNAMIC_THRESHOLD_RULES.items():
        if metric_name not in metric_values:
            continue
        thresholds[metric_name] = {
            "threshold": threshold_for_rule(metric_values[metric_name], rule),
            "direction": rule.direction,
            "label": rule.label,
            "quantile": rule.quantile,
        }
    return thresholds
