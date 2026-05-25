"""Analysis Trace System — 记录每次 LLM 调用和分析步骤。

支持 replay、debugging、performance 分析。
"""

import json
import os
import time
import uuid
from dataclasses import dataclass, field

from backend.runtime.token_budget import estimate_tokens


@dataclass
class TraceEvent:
    timestamp: float
    operation: str          # "sql_generation" | "explanation" | "insights" | ...
    phase: str              # "planning" | "step_N" | "summary"
    prompt_name: str        # 使用的 prompt 名称
    input_tokens: int       # 估算输入 token
    output_tokens: int      # 估算输出 token
    latency_ms: float       # LLM 调用延迟
    status: str             # "success" | "error" | "partial"
    error: str | None = None
    sql: str | None = None
    step: int | None = None
    metadata: dict = field(default_factory=dict)


@dataclass
class AnalysisTrace:
    trace_id: str
    question: str
    table: str
    mode: str               # "query" | "autonomous"
    language: str
    start_time: float
    end_time: float | None = None
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_llm_calls: int = 0
    events: list[TraceEvent] = field(default_factory=list)
    plan: list[dict] = field(default_factory=list)
    guardrail_violations: list[str] = field(default_factory=list)
    status: str = "in_progress"


class TraceRecorder:
    """每个分析实例一个 recorder，记录所有 LLM 调用。"""

    def __init__(self, question: str, table: str = "", mode: str = "query", language: str = "zh"):
        self.trace = AnalysisTrace(
            trace_id=str(uuid.uuid4())[:8],
            question=question,
            table=table,
            mode=mode,
            language=language,
            start_time=time.time(),
        )

    def record_llm_call(
        self,
        operation: str,
        phase: str,
        prompt_name: str,
        input_text: str,
        output_text: str,
        latency_ms: float,
        status: str,
        error: str | None = None,
        sql: str | None = None,
        step: int | None = None,
    ):
        input_tokens = estimate_tokens(input_text)
        output_tokens = estimate_tokens(output_text)
        event = TraceEvent(
            timestamp=time.time(),
            operation=operation,
            phase=phase,
            prompt_name=prompt_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            status=status,
            error=error,
            sql=sql,
            step=step,
        )
        self.trace.events.append(event)
        self.trace.total_input_tokens += input_tokens
        self.trace.total_output_tokens += output_tokens
        self.trace.total_llm_calls += 1

    def record_guardrail_violation(self, rule: str, message: str):
        self.trace.guardrail_violations.append(f"{rule}: {message}")

    def set_plan(self, plan: list[dict]):
        self.trace.plan = plan

    def finish(self, status: str = "success") -> AnalysisTrace:
        self.trace.end_time = time.time()
        self.trace.status = status
        return self.trace

    def to_dict(self) -> dict:
        """序列化为 JSON 可用的 dict。"""
        t = self.trace
        elapsed = None
        if t.end_time:
            elapsed = round((t.end_time - t.start_time) * 1000, 2)
        return {
            "schema_version": "1.0",
            "trace_id": t.trace_id,
            "question": t.question,
            "table": t.table,
            "mode": t.mode,
            "language": t.language,
            "status": t.status,
            "elapsed_ms": elapsed,
            "total_input_tokens": t.total_input_tokens,
            "total_output_tokens": t.total_output_tokens,
            "total_llm_calls": t.total_llm_calls,
            "events": [
                {
                    "timestamp": e.timestamp,
                    "operation": e.operation,
                    "phase": e.phase,
                    "prompt_name": e.prompt_name,
                    "input_tokens": e.input_tokens,
                    "output_tokens": e.output_tokens,
                    "latency_ms": round(e.latency_ms, 2),
                    "status": e.status,
                    "error": e.error,
                    "sql": e.sql,
                    "step": e.step,
                }
                for e in t.events
            ],
            "plan": t.plan,
            "guardrail_violations": t.guardrail_violations,
        }

    def save_to_file(self, directory: str = "logs/traces"):
        """持久化 trace 到 JSON 文件。"""
        os.makedirs(directory, exist_ok=True)
        filename = f"{self.trace.trace_id}_{int(time.time())}.json"
        filepath = os.path.join(directory, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
        return filepath
