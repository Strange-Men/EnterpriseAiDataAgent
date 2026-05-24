# Skill: Analysis Trace System

## 概述

每次 LLM 调用可追踪 — 记录 operation、latency、token、SQL、status、error。支持 replay 和 debugging。

## 核心组件

### TraceEvent

```python
@dataclass
class TraceEvent:
    timestamp: float           # time.time()
    operation: str             # "sql_generation" | "explanation" | ...
    phase: str                 # "planning" | "step_N" | "summary"
    prompt_name: str           # 使用的 prompt 名称
    input_tokens: int          # 估算输入 token
    output_tokens: int         # 估算输出 token
    latency_ms: float          # LLM 调用延迟
    status: str                # "success" | "error" | "partial"
    error: str | None
    sql: str | None
    step: int | None
```

### TraceRecorder

```python
class TraceRecorder:
    def __init__(self, question, table="", mode="query", language="en")
    def record_llm_call(operation, phase, prompt_name, input_text, output_text, latency_ms, status, ...)
    def record_guardrail_violation(rule, message)
    def set_plan(plan)
    def finish(status="success") -> AnalysisTrace
    def to_dict() -> dict
    def save_to_file(directory="logs/traces") -> str
```

## 集成方式

### LLM 调用层

`_call_llm` 和 `_call_llm_stream` 接受可选 trace 参数：

```python
def _call_llm(
    system, user_message, max_tokens, language,
    tracker=None, operation="unknown",
    trace=None, phase="unknown", prompt_name="unknown", step=None,
) -> str:
    # ... 调用 API ...
    if trace:
        trace.record_llm_call(
            operation=operation, phase=phase, prompt_name=prompt_name,
            input_text=user_message, output_text=text,
            latency_ms=elapsed, status="success",
        )
```

### Pipeline 层

```python
trace = TraceRecorder(question, table=table, mode="autonomous", language=language)
trace.set_plan(plan)

# 每次 LLM 调用自动记录
generate_sql(..., trace=trace, phase=f"step_{step_num}", step=step_num)

# guardrail 违规记录
trace.record_guardrail_violation(v.rule, v.message)

trace.finish("success")
return {..., "trace": trace.to_dict()}
```

### API 响应

```json
{
  "trace": {
    "trace_id": "a1b2c3d4",
    "status": "success",
    "elapsed_ms": 12345,
    "total_input_tokens": 8500,
    "total_output_tokens": 1200,
    "total_llm_calls": 9,
    "events": [
      {"operation": "analysis_plan", "phase": "planning", "latency_ms": 2100, ...},
      {"operation": "sql_generation", "phase": "step_1", "latency_ms": 1800, ...}
    ],
    "guardrail_violations": []
  }
}
```

## 关键约束

- trace 参数全部可选，trace=None 时不记录（零开销）
- input/output token 用 `len(text) // 3` 估算
- `save_to_file()` 写入 `logs/traces/` 目录（默认不自动保存）
- TraceEvent 不包含完整 prompt 文本，只包含 token 估算
