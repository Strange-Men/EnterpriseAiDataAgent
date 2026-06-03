"""LLM JSON parsing utilities."""

import json
import re
from typing import Any


def parse_llm_json(raw: str) -> Any:
    """Parse JSON returned by an LLM, including markdown-wrapped output."""
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

    raise json.JSONDecodeError("Failed to parse LLM response as JSON", raw, 0)
