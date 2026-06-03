"""Tests for resilient LLM JSON parsing."""

import json

from backend.utils.llm_json import parse_llm_json


def test_parse_plain_json_object():
    assert parse_llm_json('{"status": "ok", "items": [1, 2]}') == {
        "status": "ok",
        "items": [1, 2],
    }


def test_parse_markdown_wrapped_json():
    raw = """```json
{"summary": "done", "confidence": 0.9}
```"""
    assert parse_llm_json(raw)["confidence"] == 0.9


def test_parse_embedded_json_object():
    raw = 'Here is the result: {"sql": "SELECT 1", "status": "success"} thanks.'
    assert parse_llm_json(raw)["sql"] == "SELECT 1"


def test_invalid_json_raises_decode_error():
    try:
        parse_llm_json("no structured payload")
    except json.JSONDecodeError:
        return
    raise AssertionError("Expected JSONDecodeError")
