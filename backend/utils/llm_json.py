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

    Raises json.JSONDecodeError if all strategies fail.
    """
    if not raw or not raw.strip():
        raise json.JSONDecodeError("Empty LLM response", raw or "", 0)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start_idx = raw.find(start_char)
        end_idx = raw.rfind(end_char)
        if start_idx != -1 and end_idx > start_idx:
            try:
                return json.loads(raw[start_idx:end_idx + 1])
            except json.JSONDecodeError:
                pass

    raise json.JSONDecodeError(
        "Failed to parse LLM response as JSON",
        raw[:200] if len(raw) > 200 else raw,
        0,
    )
