"""Generate a live AI SQL golden evaluation report.

Usage:
    RUN_AI_EVAL=1 python -m tests.ai.generate_golden_report
"""

from __future__ import annotations

import os
from pathlib import Path

from backend.config import ANTHROPIC_API_KEY
from backend.services.ai_analyst import build_schema_context, generate_sql
from backend.services.data_service import get_executor, list_tables
from tests.ai.runner import format_markdown_report, run_evaluation


DEFAULT_REPORT_PATH = Path("docs/reports/ai-golden-evaluation-report.md")


def main() -> int:
    if os.getenv("RUN_AI_EVAL") != "1":
        print("Set RUN_AI_EVAL=1 to run live AI golden evaluation.")
        return 2
    if not ANTHROPIC_API_KEY:
        print("ANTHROPIC_API_KEY is not configured.")
        return 2

    summary = run_evaluation(_generate_sql, _execute_sql)
    report = format_markdown_report(summary)

    DEFAULT_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    DEFAULT_REPORT_PATH.write_text(report, encoding="utf-8")
    print(f"Wrote {DEFAULT_REPORT_PATH}")
    print(f"Pass rate: {summary.pass_rate * 100:.0f}%")
    return 0 if summary.pass_rate >= 0.6 and summary.hallucination_count == 0 else 1


def _generate_sql(question: str, _table: str) -> dict:
    tables = list_tables()
    schema_context = build_schema_context(tables)
    return generate_sql(question, schema_context)


def _execute_sql(sql: str) -> dict:
    result = get_executor().execute(sql)
    return {
        "columns": result.get("columns", []),
        "data": result.get("data", [])[:100],
        "row_count": result.get("row_count", 0),
        "status": result.get("status", "error"),
        "error": result.get("error"),
    }


if __name__ == "__main__":
    raise SystemExit(main())
