"""Report Builder — 将多个分析运行编译为 Markdown 报告。

纯 Python 函数，不调用 LLM。将 AnalysisRun 数据格式化为结构化 Markdown。
"""

from datetime import datetime
from backend.services.shared_utils import truncate as _truncate


def build_report(runs: list[dict], options: dict | None = None) -> str:
    """将多个分析运行编译为 Markdown 报告。

    Args:
        runs: AnalysisRun 字典列表（前端 JSON 格式）
        options: {title, include_trace, include_data_samples, language}

    Returns:
        Markdown 字符串
    """
    opts = options or {}
    title = opts.get("title", "Analysis Report")
    include_trace = opts.get("include_trace", False)
    include_data_samples = opts.get("include_data_samples", True)
    language = opts.get("language", "zh")

    lines: list[str] = []

    # Header
    lines.append(f"# {title}")
    lines.append("")
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines.append(f"Generated: {ts}")
    lines.append("")

    if not runs:
        lines.append("*No analysis runs selected.*")
        return "\n".join(lines)

    # Table of contents
    lines.append("## Table of Contents")
    lines.append("")
    for i, run in enumerate(runs, 1):
        q = run.get("question", run.get("mode", "unknown"))
        anchor = f"run-{i}"
        lines.append(f"- [{i}. {_truncate(q, 60)}](#{anchor})")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Per-run sections
    for i, run in enumerate(runs, 1):
        q = run.get("question", run.get("mode", "unknown"))
        mode = run.get("mode", "unknown")
        table = run.get("table", "-")
        status = run.get("status", "unknown")
        ts = run.get("timestamp", "")
        version = run.get("version", 1)

        lines.append(f"## {i}. {_escape_md(q)} {{#run-{i}}}")
        lines.append("")
        lines.append(f"**Mode**: {mode} | **Table**: {table} | **Status**: {status} | **Version**: v{version}")
        if ts:
            lines.append(f"**Time**: {ts}")
        lines.append("")

        # Notes
        notes = run.get("notes")
        if notes:
            lines.append(f"> {_escape_md(notes)}")
            lines.append("")

        # Sections
        sections = run.get("sections", [])
        if sections:
            lines.append("### Analysis")
            lines.append("")
            for sec in sections:
                sec_title = sec.get("title", "")
                sec_content = sec.get("content", "")
                if sec_title:
                    lines.append(f"#### {_escape_md(sec_title)}")
                    lines.append("")
                lines.append(sec_content)
                lines.append("")

        # Multi-step results
        multi = run.get("multiResult")
        if multi:
            plan = multi.get("plan", [])
            steps = multi.get("steps", [])
            summary = multi.get("summary", "")

            if plan:
                lines.append("### Analysis Plan")
                lines.append("")
                for step in plan:
                    step_num = step.get("step", "?")
                    purpose = step.get("purpose", "")
                    lines.append(f"{step_num}. {_escape_md(purpose)}")
                lines.append("")

            if steps:
                lines.append("### Step Results")
                lines.append("")
                for step in steps:
                    step_num = step.get("step", "?")
                    purpose = step.get("purpose", "")
                    row_count = step.get("row_count", 0)
                    step_status = step.get("status", "unknown")
                    step_error = step.get("error")

                    lines.append(f"**Step {step_num}**: {_escape_md(purpose)} ({row_count} rows, {step_status})")
                    if step_error:
                        lines.append(f"  - Error: {_escape_md(str(step_error))}")

                    # Data sample
                    if include_data_samples:
                        data = step.get("data", [])
                        columns = step.get("columns", [])
                        if data and columns:
                            lines.append("")
                            lines.append(_format_table(columns, data[:5]))
                    lines.append("")
                lines.append("")

            if summary:
                lines.append("### Executive Summary")
                lines.append("")
                lines.append(_escape_md(summary))
                lines.append("")

        # Error
        error = run.get("error")
        if error:
            lines.append(f"**Error**: {_escape_md(str(error))}")
            lines.append("")

        # Trace (optional)
        if include_trace:
            trace = run.get("trace")
            if trace:
                lines.append("<details>")
                lines.append("<summary>Trace Details</summary>")
                lines.append("")
                lines.append(f"- **Trace ID**: {trace.get('trace_id', '-')}")
                lines.append(f"- **Total LLM Calls**: {trace.get('total_llm_calls', 0)}")
                lines.append(f"- **Input Tokens**: {trace.get('total_input_tokens', 0)}")
                lines.append(f"- **Output Tokens**: {trace.get('total_output_tokens', 0)}")
                violations = trace.get("guardrail_violations", [])
                if violations:
                    lines.append(f"- **Guardrail Violations**: {len(violations)}")
                    for v in violations:
                        lines.append(f"  - {_escape_md(str(v))}")
                lines.append("")
                lines.append("</details>")
                lines.append("")

        lines.append("---")
        lines.append("")

    return "\n".join(lines)



def _escape_md(text: str) -> str:
    """Escape Markdown special characters in plain text."""
    return text.replace("|", "\\|").replace("#", "\\#").replace("*", "\\*")


def _format_table(columns: list[str], rows: list[dict]) -> str:
    """Format data rows as a Markdown table."""
    if not columns or not rows:
        return ""
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join(["---"] * len(columns)) + " |"
    data_lines = []
    for row in rows:
        vals = [str(row.get(c, "")) for c in columns]
        data_lines.append("| " + " | ".join(vals) + " |")
    return "\n".join([header, sep] + data_lines)
