"""AI Analyst Service — Single-Agent SQL Intelligence.

所有 prompt 已迁移至 backend/prompts/。
本文件只保留 LLM 调用和业务逻辑。
"""

import json
import time

import anthropic
import httpx

from backend.config import (
    ANTHROPIC_API_KEY,
    ANTHROPIC_BASE_URL,
    DEFAULT_LLM_MODEL,
    DEFAULT_TEMPERATURE,
)

# Prompt 层导入
from backend.prompts.locale import apply_language
from backend.prompts.sql_generation import (
    CONTRACT as SQL_GEN_CONTRACT,
    SYSTEM_PROMPT as SQL_GEN_SYSTEM,
    build_user_message as build_sql_user_message,
)
from backend.prompts.explanation import (
    CONTRACT as EXPLAIN_CONTRACT,
    SYSTEM_PROMPT as EXPLAIN_SYSTEM,
    build_user_message as build_explain_user_message,
)
from backend.prompts.insights import (
    CONTRACT as INSIGHTS_CONTRACT,
    SYSTEM_PROMPT as INSIGHTS_SYSTEM,
    build_user_message as build_insights_user_message,
)
from backend.prompts.chart_suggest import (
    CONTRACT as CHART_CONTRACT,
    SYSTEM_PROMPT as CHART_SYSTEM,
    build_user_message as build_chart_user_message,
)
from backend.prompts.semantics import (
    CONTRACT as SEMANTICS_CONTRACT,
    SYSTEM_PROMPT as SEMANTICS_SYSTEM,
    build_user_message as build_semantics_user_message,
)
from backend.prompts.suggest_questions import (
    CONTRACT as QUESTIONS_CONTRACT,
    SYSTEM_PROMPT as QUESTIONS_SYSTEM,
    build_user_message as build_questions_user_message,
    build_profile_summary,
    build_semantics_summary,
)
from backend.prompts.analysis_plan import (
    CONTRACT as PLAN_CONTRACT,
    SYSTEM_PROMPT as PLAN_SYSTEM,
    build_user_message as build_plan_user_message,
)
from backend.prompts.anomaly_interpretation import (
    CONTRACT as ANOMALY_CONTRACT,
    SYSTEM_PROMPT as ANOMALY_SYSTEM,
    build_user_message as build_anomaly_user_message,
)

# Token Budget 导入
from backend.runtime.token_budget import (
    get_budget,
    estimate_tokens,
    truncate_text,
    WorkflowTokenTracker,
)

# Trace 导入
from backend.services.trace import TraceRecorder
from backend.utils.llm_json import parse_llm_json, safe_parse_llm_json
from backend.utils.llm_sql import (
    build_sql_quality_gates,
    extract_sql_from_llm_output,
    validate_generated_sql,
)
from backend.services.schema_semantics import build_semantic_context


# ── JSON Parsing Helper ──────────────────────────────────────────

def _parse_llm_json(raw: str) -> dict:
    """Backward-compatible wrapper for the shared LLM JSON parser."""
    return parse_llm_json(raw)


# ── Anomaly Detection ──────────────────────────────────────────

def detect_and_interpret_anomalies(
    question: str,
    results: list[dict],
    columns: list[str] | None = None,
    method: str = "auto",
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    min_deviation_score: float = 1.5,
    adaptive: bool = True,
) -> dict:
    """检测数据异常并用 LLM 解读业务意义。

    流程: 统计检测 → LLM 解读 → 合并结果。
    """
    from backend.services.anomaly_detector import detect_anomalies

    start = time.time()

    # Step 1: 纯统计检测（无 LLM 依赖）
    detection = detect_anomalies(
        results, columns=columns, method=method,
        min_deviation_score=min_deviation_score, adaptive=adaptive,
    )

    if not detection["anomalies"]:
        return {
            "anomalies": [],
            "summary": detection["summary"],
            "column_stats": detection["column_stats"],
            "interpretations": [],
            "interpretation_summary": "No anomalies detected.",
            "recommended_actions": [],
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }

    # Step 2: LLM 解读异常的业务意义
    budget = get_budget("anomaly_interpretation")
    data_context = f"Table with {len(results)} rows, columns: {', '.join(results[0].keys()) if results else 'none'}"
    user_msg = build_anomaly_user_message(
        question=question,
        anomalies=detection["anomalies"],
        data_context=data_context,
    )

    try:
        raw = _call_llm(
            ANOMALY_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="anomaly_interpretation",
            trace=trace, phase="anomaly_interpretation", prompt_name="anomaly_interpretation",
        )
        parsed = _parse_llm_json(raw)
    except json.JSONDecodeError:
        parsed = {
            "interpretations": [],
            "summary": "Failed to parse anomaly interpretation.",
            "recommended_actions": [],
        }
    except Exception:
        parsed = {
            "interpretations": [],
            "summary": "Anomaly interpretation failed.",
            "recommended_actions": [],
        }

    return {
        "anomalies": detection["anomalies"],
        "summary": detection["summary"],
        "column_stats": detection["column_stats"],
        "interpretations": parsed.get("interpretations", []),
        "interpretation_summary": parsed.get("summary", ""),
        "recommended_actions": parsed.get("recommended_actions", []),
        "status": "success",
        "elapsed_ms": round((time.time() - start) * 1000, 2),
    }


def detect_and_interpret_anomalies_stream(
    question: str,
    results: list[dict],
    columns: list[str] | None = None,
    method: str = "auto",
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    min_deviation_score: float = 1.5,
    adaptive: bool = True,
):
    """流式异常检测: 先返回统计结果，再流式输出 LLM 解读。"""
    from backend.services.anomaly_detector import detect_anomalies

    # Step 1: 统计检测
    detection = detect_anomalies(
        results, columns=columns, method=method,
        min_deviation_score=min_deviation_score, adaptive=adaptive,
    )

    # 先 yield 统计结果
    yield json.dumps({"type": "detection", "data": detection}, ensure_ascii=False)

    if not detection["anomalies"]:
        yield json.dumps({"type": "done", "data": {"status": "success", "message": "No anomalies detected."}}, ensure_ascii=False)
        return

    # Step 2: 流式 LLM 解读
    budget = get_budget("anomaly_interpretation")
    data_context = f"Table with {len(results)} rows, columns: {', '.join(results[0].keys()) if results else 'none'}"
    user_msg = build_anomaly_user_message(
        question=question,
        anomalies=detection["anomalies"],
        data_context=data_context,
    )

    try:
        for chunk in _call_llm_stream(
            ANOMALY_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="anomaly_interpretation",
            trace=trace, phase="anomaly_interpretation", prompt_name="anomaly_interpretation",
        ):
            yield json.dumps({"type": "text", "content": chunk}, ensure_ascii=False)
    except Exception as e:
        yield json.dumps({"type": "error", "error": str(e)}, ensure_ascii=False)

    yield json.dumps({"type": "done"}, ensure_ascii=False)


# ── Configuration ────────────────────────────────────────────────

_client: anthropic.Anthropic | None = None
_client_api_key: str | None = None


def _get_client() -> anthropic.Anthropic:
    """Lazy-init Anthropic client (singleton, rebuilds on API key change)."""
    global _client, _client_api_key
    if _client is None or _client_api_key != ANTHROPIC_API_KEY:
        _client = anthropic.Anthropic(
            api_key=ANTHROPIC_API_KEY,
            base_url=ANTHROPIC_BASE_URL,
            timeout=30.0,
        )
        _client_api_key = ANTHROPIC_API_KEY
    return _client


MODEL = DEFAULT_LLM_MODEL
TEMPERATURE = DEFAULT_TEMPERATURE


# ── Schema Context Builder ──────────────────────────────────────

def build_schema_context(tables: list[dict], include_semantics: bool = False) -> str:
    """构建可用表和列的文本描述，供 LLM 使用。

    Args:
        tables: 表信息列表。
        include_semantics: 是否在 schema 中附加语义映射。
    """
    if not tables:
        return "No tables available in the database."

    lines = ["Available tables and columns:\n"]
    for table in tables:
        name = table["name"]
        cols = table.get("columns", [])
        col_descriptions = []
        col_names = []
        for col in cols:
            col_type = col.get("type", col.get("dtype", "VARCHAR"))
            col_descriptions.append(f"  - {col['name']} ({col_type})")
            col_names.append(col["name"])
        lines.append(f"Table: {name}")
        lines.extend(col_descriptions)

        # 附加语义映射
        if include_semantics and col_names:
            sem_ctx = build_semantic_context(col_names)
            if sem_ctx:
                lines.append("")
                lines.append(sem_ctx)

        lines.append("")

    return "\n".join(lines)


def _safe_serialize(obj):
    """安全序列化: datetime→ISO, Decimal→float, bytes→base64。"""
    import decimal
    import datetime
    import base64
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    if isinstance(obj, bytes):
        return base64.b64encode(obj).decode("ascii")
    return str(obj)


def build_follow_up_context(ctx: dict) -> str:
    """构建结构化的前序分析上下文，用于追问查询。

    Token 预算: ~220-600 tokens。
    支持 enhanced fields: prior_key_findings, investigation_summary。
    """
    parts = ["=== PREVIOUS ANALYSIS CONTEXT ===\n"]

    if ctx.get("previous_sql"):
        parts.append(f"Previous SQL:\n{ctx['previous_sql']}\n")

    schema = ctx.get("previous_result_schema", [])
    if schema:
        parts.append("Previous Result Schema:")
        for col in schema:
            parts.append(f"  - {col['name']} ({col['dtype']})")
        parts.append("")

    samples = ctx.get("previous_sample_rows", [])[:5]
    if samples:
        parts.append(
            f"Previous Result Sample (first {len(samples)} rows):\n"
            f"{json.dumps(samples, default=_safe_serialize, ensure_ascii=False)}\n"
        )

    # Enhanced: prior key findings (structured list)
    findings = ctx.get("prior_key_findings", [])
    if findings:
        parts.append("Prior Key Findings:")
        for i, f in enumerate(findings[:5], 1):
            parts.append(f"  {i}. {f}")
        parts.append("")

    # Enhanced: investigation thread summary
    inv_summary = ctx.get("investigation_summary", "")
    if inv_summary:
        parts.append(f"Investigation Thread Summary:\n{inv_summary}\n")
        # If we have thread summary, truncate previous insight summary more aggressively
        summary = ctx.get("previous_insight_summary", "")
        if summary:
            if len(summary) > 200:
                summary = summary[:200] + "..."
            parts.append(f"Previous Insight Summary:\n{summary}\n")
    else:
        summary = ctx.get("previous_insight_summary", "")
        if summary:
            if len(summary) > 500:
                summary = summary[:500] + "..."
            parts.append(f"Previous Insight Summary:\n{summary}\n")

    return "\n".join(parts)


# ── LLM Text Extraction ───────────────────────────────────────


def _extract_visible_text(blocks) -> str:
    """Extract only user-visible text from LLM response content blocks.

    Filters out ThinkingBlock, signature, and other internal blocks.
    Only extracts from blocks where type == "text" and text is a non-empty string.
    """
    parts = []
    for block in blocks or []:
        block_type = getattr(block, "type", None)
        text = getattr(block, "text", None)
        # Only include blocks explicitly typed as "text" with valid string content
        if block_type == "text" and isinstance(text, str) and text.strip():
            parts.append(text)
    return "\n".join(parts).strip()


# ── LLM Call ────────────────────────────────────────────────────

_TRANSIENT_ERRORS = (
    anthropic.RateLimitError,
    anthropic.APITimeoutError,
    anthropic.APIConnectionError,
    anthropic.InternalServerError,
)

MAX_RETRIES = 2
RETRY_DELAYS = [1, 3]  # exponential backoff in seconds


def _call_llm(
    system: str,
    user_message: str,
    max_tokens: int = 1024,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    operation: str = "unknown",
    trace: TraceRecorder | None = None,
    phase: str = "unknown",
    prompt_name: str = "unknown",
    step: int | None = None,
) -> str:
    """调用 LLM（同步）。支持 budget enforcement、token tracking 和 trace。"""
    input_tokens = estimate_tokens(user_message)

    # Budget enforcement: 如果 tracker 存在且预算不足，拒绝调用
    if tracker and not tracker.can_proceed(input_tokens, max_tokens):
        tracker.record_budget_exceeded(operation)
        raise RuntimeError(f"Token budget exceeded for {operation} (need ~{input_tokens + max_tokens}, have {tracker.remaining})")

    # 输入 token 上限检查
    budget = get_budget(operation)
    if input_tokens > budget.max_input_tokens:
        user_message = truncate_text(user_message, budget.max_input_tokens)

    start = time.time()
    client = _get_client()
    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=max_tokens,
                temperature=TEMPERATURE,
                system=apply_language(system, language),
                messages=[{"role": "user", "content": user_message}],
                timeout=30.0,
            )

            # 提取输出文本 — 只提取 type=="text" 的 block
            # 过滤 ThinkingBlock / signature / internal blocks
            text = _extract_visible_text(response.content)

            elapsed = (time.time() - start) * 1000

            # 记录到 tracker
            if tracker:
                output_tokens = estimate_tokens(text)
                tracker.record(operation, input_tokens, output_tokens)

            # 记录到 trace
            if trace:
                trace.record_llm_call(
                    operation=operation,
                    phase=phase,
                    prompt_name=prompt_name,
                    input_text=user_message,
                    output_text=text,
                    latency_ms=elapsed,
                    status="success",
                    sql=text if operation == "sql_generation" else None,
                    step=step,
                )

            return text
        except _TRANSIENT_ERRORS as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAYS[attempt])
                continue
            break
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            if trace:
                trace.record_llm_call(
                    operation=operation,
                    phase=phase,
                    prompt_name=prompt_name,
                    input_text=user_message,
                    output_text="",
                    latency_ms=elapsed,
                    status="error",
                    error=str(e),
                    step=step,
                )
            raise

    # All retries exhausted
    elapsed = (time.time() - start) * 1000
    if trace:
        trace.record_llm_call(
            operation=operation,
            phase=phase,
            prompt_name=prompt_name,
            input_text=user_message,
            output_text="",
            latency_ms=elapsed,
            status="error",
            error=f"Retried {MAX_RETRIES}x: {last_error}",
            step=step,
        )
    if last_error is not None:
        raise last_error
    raise RuntimeError(f"All {MAX_RETRIES} retries exhausted with no error captured for {operation}")


def _call_llm_stream(
    system: str,
    user_message: str,
    max_tokens: int = 1024,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    operation: str = "unknown",
    trace: TraceRecorder | None = None,
    phase: str = "unknown",
    prompt_name: str = "unknown",
    step: int | None = None,
):
    """流式调用 LLM，yield 文本块。支持 budget enforcement、token tracking 和 trace。"""
    input_tokens = estimate_tokens(user_message)

    # Budget enforcement
    if tracker and not tracker.can_proceed(input_tokens, max_tokens):
        tracker.record_budget_exceeded(operation)
        raise RuntimeError(f"Token budget exceeded for {operation}")

    budget = get_budget(operation)
    if input_tokens > budget.max_input_tokens:
        user_message = truncate_text(user_message, budget.max_input_tokens)

    start = time.time()
    client = _get_client()
    output_text = ""
    last_error = None

    # Retry only on stream establishment (before any chunks yielded)
    # Use explicit read timeout to prevent hanging when proxy stops sending data
    stream_timeout = httpx.Timeout(timeout=180.0, connect=15.0, read=45.0, write=15.0, pool=15.0)
    for attempt in range(MAX_RETRIES + 1):
        try:
            with client.messages.stream(
                model=MODEL,
                max_tokens=max_tokens,
                temperature=TEMPERATURE,
                system=apply_language(system, language),
                messages=[{"role": "user", "content": user_message}],
                timeout=stream_timeout,
            ) as stream:
                for chunk in stream.text_stream:
                    output_text += chunk
                    yield chunk
            break  # success — exit retry loop
        except _TRANSIENT_ERRORS as e:
            last_error = e
            if output_text:
                # Already yielded chunks — can't retry mid-stream
                raise
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAYS[attempt])
                continue
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            if trace:
                trace.record_llm_call(
                    operation=operation,
                    phase=phase,
                    prompt_name=prompt_name,
                    input_text=user_message,
                    output_text=output_text,
                    latency_ms=elapsed,
                    status="error",
                    error=str(e),
                    step=step,
                )
            raise
    else:
        # All retries exhausted without success
        elapsed = (time.time() - start) * 1000
        if trace:
            trace.record_llm_call(
                operation=operation,
                phase=phase,
                prompt_name=prompt_name,
                input_text=user_message,
                output_text="",
                latency_ms=elapsed,
                status="error",
                error=f"Retried {MAX_RETRIES}x: {last_error}",
                step=step,
            )
        if last_error is not None:
            raise last_error
        raise RuntimeError(f"All {MAX_RETRIES} retries exhausted with no error captured for {operation}")

    elapsed = (time.time() - start) * 1000

    # 流式完成后记录
    if tracker:
        output_tokens = estimate_tokens(output_text)
        tracker.record(operation, input_tokens, output_tokens)

    # 记录到 trace
    if trace:
        trace.record_llm_call(
            operation=operation,
            phase=phase,
            prompt_name=prompt_name,
            input_text=user_message,
            output_text=output_text,
            latency_ms=elapsed,
            status="success",
            step=step,
        )


# ── Public API ──────────────────────────────────────────────────

def generate_sql(
    question: str,
    schema_context: str,
    follow_up_context: str | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    phase: str = "unknown",
    step: int | None = None,
    semantic_context: str | None = None,
) -> dict:
    """从自然语言问题生成 SQL。"""
    start = time.time()
    user_msg = build_sql_user_message(schema_context, question, follow_up_context, semantic_context)
    budget = get_budget("sql_generation")
    try:
        raw_sql = _call_llm(
            SQL_GEN_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="sql_generation",
            trace=trace, phase=phase, prompt_name="sql_generation", step=step,
        )
        # _call_llm 理论上不会返回 None，但防御性处理
        raw_sql = raw_sql or ""
        sql = extract_sql_from_llm_output(raw_sql)
        is_valid, validation_error = validate_generated_sql(sql)
        quality_gates = build_sql_quality_gates(sql, validation_error)
        elapsed = (time.time() - start) * 1000
        if not is_valid:
            return {
                "sql": "",
                "raw_sql": raw_sql.strip(),
                "error": validation_error,
                "model": MODEL,
                "elapsed_ms": round(elapsed, 2),
                "status": "error",
                "quality_gates": quality_gates,
            }
        return {
            "sql": sql.strip(),
            "raw_sql": raw_sql.strip(),
            "model": MODEL,
            "elapsed_ms": round(elapsed, 2),
            "status": "success",
            "quality_gates": quality_gates,
        }
    except Exception as e:
        return {
            "sql": "",
            "error": str(e),
            "status": "error",
            "quality_gates": build_sql_quality_gates("", str(e)),
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


def explain_results(
    question: str, sql: str, results: list[dict],
    conversation_history: list[dict] | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """用业务语言解释查询结果。"""
    start = time.time()
    budget = get_budget("explanation")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_explain_user_message(question, sql, truncated_rows, conversation_history)
    try:
        explanation = _call_llm(
            EXPLAIN_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="explanation",
            trace=trace, phase="explain", prompt_name="explanation",
        )
        return {
            "explanation": explanation,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "explanation": "",
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


def explain_results_stream(
    question: str, sql: str, results: list[dict],
    conversation_history: list[dict] | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
):
    """流式生成解释。"""
    budget = get_budget("explanation")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_explain_user_message(question, sql, truncated_rows, conversation_history)
    yield from _call_llm_stream(
        EXPLAIN_SYSTEM, user_msg,
        max_tokens=budget.max_output_tokens,
        language=language,
        tracker=tracker,
        operation="explanation",
        trace=trace, phase="explain", prompt_name="explanation",
    )


# ── Insight Quality Scoring ────────────────────────────────────

_SEVERITY_WEIGHTS = {"high": 1.0, "medium": 0.6, "low": 0.3}
_MIN_INSIGHT_CONFIDENCE = 0.3
_MIN_TREND_CONFIDENCE = 0.2


def _score_and_filter_insights(insights: list[dict]) -> tuple[list[dict], int]:
    """对洞察进行证据评分、过滤和排序。

    Returns:
        (scored_sorted_insights, filtered_count)
    """
    if not insights:
        return [], 0

    scored = []
    filtered_count = 0
    for item in insights:
        if isinstance(item, str):
            scored.append({"text": item, "confidence": 0.5, "evidence_score": 0.5})
            continue
        conf = item.get("confidence", 0.5)
        if conf < _MIN_INSIGHT_CONFIDENCE:
            filtered_count += 1
            continue
        sev_w = _SEVERITY_WEIGHTS.get(item.get("severity", "low"), 0.3)
        imp_w = _SEVERITY_WEIGHTS.get(item.get("impact", "low"), 0.3)
        evidence_score = round(conf * 0.5 + sev_w * 0.3 + imp_w * 0.2, 3)
        scored.append({**item, "evidence_score": evidence_score})

    scored.sort(key=lambda x: x.get("evidence_score", 0), reverse=True)
    return scored, filtered_count


def _filter_trends(trends: list[dict]) -> list[dict]:
    """过滤低置信度趋势。"""
    return [
        t for t in trends
        if isinstance(t, str) or t.get("confidence", 0.5) >= _MIN_TREND_CONFIDENCE
    ]


def generate_insights(
    question: str, results: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    prior_context: str | None = None,
) -> dict:
    """生成结构化洞察。"""
    start = time.time()
    budget = get_budget("insights")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_insights_user_message(question, truncated_rows, prior_context)
    try:
        raw = _call_llm(
            INSIGHTS_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="insights",
            trace=trace, phase="insights", prompt_name="insights",
        )
        insights = _parse_llm_json(raw)
        # Score and filter insights
        raw_insights = insights.get("insights", [])
        scored_insights, filtered_count = _score_and_filter_insights(raw_insights)
        trends = _filter_trends(insights.get("trends", []))
        return {
            **insights,
            "insights": scored_insights,
            "trends": trends,
            "filtered_insights_count": filtered_count,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except json.JSONDecodeError:
        return {
            "insights": [raw] if 'raw' in locals() else [],
            "trends": [],
            "data_quality_notes": [],
            "suggested_next_steps": [],
            "status": "partial",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


def generate_insights_stream(
    question: str, results: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    prior_context: str | None = None,
):
    """流式生成洞察。"""
    budget = get_budget("insights")
    truncated_rows = results[:budget.max_sample_rows]
    user_msg = build_insights_user_message(question, truncated_rows, prior_context)
    yield from _call_llm_stream(
        INSIGHTS_SYSTEM, user_msg,
        max_tokens=budget.max_output_tokens,
        language=language,
        tracker=tracker,
        operation="insights",
        trace=trace, phase="insights", prompt_name="insights",
    )


def suggest_charts(
    results: list[dict],
    question: str = "",
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """推荐图表类型。"""
    start = time.time()
    if not results:
        return {"recommended_charts": [], "status": "empty"}

    budget = get_budget("chart_suggest")
    columns = list(results[0].keys()) if results else []
    sample = results[:budget.max_sample_rows]
    user_msg = build_chart_user_message(columns, sample, question)
    try:
        raw = _call_llm(
            CHART_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="chart_suggest",
            trace=trace, phase="chart_suggest", prompt_name="chart_suggest",
        )
        charts = _parse_llm_json(raw)
        return {
            **charts,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "recommended_charts": [],
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Semantic Dataset Understanding ────────────────────────────

def generate_semantics(
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """生成数据集的语义理解。"""
    start = time.time()
    budget = get_budget("semantics")
    cols = columns[:20]
    user_msg = build_semantics_user_message(table, cols, sample_rows[:budget.max_sample_rows])
    try:
        raw = _call_llm(
            SEMANTICS_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="semantics",
            trace=trace, phase="semantics", prompt_name="semantics",
        )
        result = _parse_llm_json(raw)
        return {
            **result,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except json.JSONDecodeError:
        return {
            "summary": "",
            "columns": [],
            "detected_metrics": [],
            "detected_dimensions": [],
            "suggested_focus": "",
            "status": "partial",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Smart Suggested Questions ─────────────────────────────────

def suggest_questions(
    table: str,
    profile: dict,
    semantics: dict | None = None,
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
) -> dict:
    """基于数据集概览推荐分析问题。"""
    start = time.time()
    budget = get_budget("suggest_questions")

    profile_summary = build_profile_summary(table, profile)
    semantics_summary = build_semantics_summary(semantics) if semantics else None
    user_msg = build_questions_user_message(profile_summary, semantics_summary)

    try:
        raw = _call_llm(
            QUESTIONS_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="suggest_questions",
            trace=trace, phase="suggest_questions", prompt_name="suggest_questions",
        )
        result = _parse_llm_json(raw)
        return {
            **result,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "questions": [],
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Analysis Planning Engine ──────────────────────────────────

def generate_analysis_plan(
    question: str,
    table: str,
    columns: list[dict],
    sample_rows: list[dict],
    language: str = "zh",
    tracker: WorkflowTokenTracker | None = None,
    trace: TraceRecorder | None = None,
    phase: str = "planning",
    prior_findings: list[str] | None = None,
) -> dict:
    """为复杂问题生成多步骤分析计划。"""
    start = time.time()
    budget = get_budget("analysis_plan")
    cols = columns[:20]
    user_msg = build_plan_user_message(
        question, table, cols, sample_rows[:budget.max_sample_rows], prior_findings
    )
    try:
        raw = _call_llm(
            PLAN_SYSTEM, user_msg,
            max_tokens=budget.max_output_tokens,
            language=language,
            tracker=tracker,
            operation="analysis_plan",
            trace=trace, phase=phase, prompt_name="analysis_plan",
        )
        result, parsed = safe_parse_llm_json(raw, fallback={"plan": []})
        if not parsed:
            # JSON parsing failed — build a simple single-step plan from the question
            result = {
                "plan": [
                    {"step": 1, "purpose": question[:200], "sql_goal": question[:200], "depends_on": None}
                ]
            }
        if "plan" in result:
            result["plan"] = result["plan"][:3]
        return {
            **result,
            "status": "success",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }
    except Exception as e:
        return {
            "plan": [],
            "error": str(e),
            "status": "error",
            "elapsed_ms": round((time.time() - start) * 1000, 2),
        }


# ── Self-Evaluation ────────────────────────────────────────────

def evaluate_analysis(
    question: str,
    sections: list[dict],
    trace: dict | None = None,
    language: str = "zh",
) -> dict:
    """AI 对分析结果做自我评估。"""
    from backend.prompts.self_evaluation import CONTRACT, build_user_message

    user_msg = build_user_message(question, sections, trace)

    try:
        raw = _call_llm(
            system=CONTRACT.SYSTEM_PROMPT,
            user_message=user_msg,
            max_tokens=CONTRACT.max_output_tokens,
            language=language,
            operation="self_evaluation",
            phase="evaluate",
            prompt_name="self_evaluation",
        )
    except Exception as e:
        return {
            "confidence": 0.5,
            "completeness": "unknown",
            "accuracy": "unknown",
            "actionability": "unknown",
            "diagnostics": [f"Evaluation failed: {e}"],
            "suggested_improvements": [],
            "status": "error",
        }

    try:
        parsed = _parse_llm_json(raw)
    except json.JSONDecodeError:
        parsed = {}

    result = {
        "confidence": parsed.get("confidence", 0.5),
        "completeness": parsed.get("completeness", "unknown"),
        "accuracy": parsed.get("accuracy", "unknown"),
        "actionability": parsed.get("actionability", "unknown"),
        "diagnostics": parsed.get("diagnostics", []),
        "suggested_improvements": parsed.get("suggested_improvements", []),
        "status": "success",
    }

    # Apply quality gates
    result["quality_gates"] = _apply_quality_gates(result)

    return result


# ── Quality Gates ───────────────────────────────────────────────

def _apply_quality_gates(evaluation: dict) -> dict:
    """确定性质量门控: 基于评估结果和分析数据生成警告。"""
    warnings = []
    checks_run = []

    conf = evaluation.get("confidence", 0.5)
    checks_run.append("confidence")
    if conf < 0.4:
        warnings.append("Low overall confidence — results may be unreliable")

    for dim in ("completeness", "accuracy", "actionability"):
        checks_run.append(dim)
        val = evaluation.get(dim, "unknown")
        if val == "low":
            label = dim.capitalize()
            warnings.append(f"Low {dim} — analysis quality may be insufficient")

    return {
        "passed": len(warnings) == 0,
        "warnings": warnings[:3],  # Cap at 3
        "checks_run": checks_run,
    }
