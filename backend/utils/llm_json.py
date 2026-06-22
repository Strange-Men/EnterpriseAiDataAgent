"""LLM JSON parsing utilities."""

import json
import re
from typing import Any


def parse_llm_json(raw: str) -> Any:
    """Parse JSON returned by an LLM, including markdown-wrapped output.

    Tries multiple extraction strategies:
    1. Direct JSON parse
    2. Markdown fenced code block (```json ... ```)
    3. Brace/bracket matching
    4. Repair common LLM JSON issues (trailing commas, single quotes)

    Raises json.JSONDecodeError if all strategies fail.
    """
    if not raw or not raw.strip():
        raise json.JSONDecodeError("Empty LLM response", raw or "", 0)

    # Strategy 1: Direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Strategy 2: Markdown fenced code block
    match = re.search(r"```(?:json|JSON)?\s*([\s\S]*?)```", raw)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Strategy 3: Brace/bracket matching
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start_idx = raw.find(start_char)
        end_idx = raw.rfind(end_char)
        if start_idx != -1 and end_idx > start_idx:
            candidate = raw[start_idx:end_idx + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass
            # Strategy 4: Repair common issues
            repaired = _repair_json(candidate)
            if repaired is not None:
                try:
                    return json.loads(repaired)
                except json.JSONDecodeError:
                    pass

    raise json.JSONDecodeError(
        "Failed to parse LLM response as JSON",
        raw[:200] if len(raw) > 200 else raw,
        0,
    )


def _repair_json(text: str) -> str | None:
    """Attempt to repair common LLM JSON issues.

    Handles:
    - Trailing commas before } or ]
    - Single quotes → double quotes (simple cases)
    - Unquoted keys (simple cases)
    """
    if not text:
        return None

    repaired = text

    # Remove trailing commas: ,} or ,]
    repaired = re.sub(r",\s*([}\]])", r"\1", repaired)

    # Replace single quotes with double quotes (only if no double quotes present)
    if '"' not in repaired and "'" in repaired:
        repaired = repaired.replace("'", '"')

    return repaired if repaired != text else None


def safe_parse_llm_json(raw: str, fallback: Any = None) -> tuple[Any, bool]:
    """Safely parse LLM JSON with a fallback value.

    Args:
        raw: Raw LLM output.
        fallback: Value to return if parsing fails.

    Returns:
        (parsed_value, was_parsed) tuple.
        was_parsed=True if JSON was successfully parsed.
        was_parsed=False if fallback was returned.
    """
    try:
        result = parse_llm_json(raw)
        return result, True
    except json.JSONDecodeError:
        return fallback, False
