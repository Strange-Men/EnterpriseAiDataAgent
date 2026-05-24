# Skill: Token Budget Control

## 概述

AI Runtime Token Budget System — 控制每个 LLM 调用的输入输出 token，防止 context explosion。

## 核心组件

### TokenBudget

```python
@dataclass(frozen=True)
class TokenBudget:
    max_input_tokens: int     # 用户消息 token 上限
    max_output_tokens: int    # API max_tokens
    max_schema_tokens: int    # schema 上下文上限
    max_sample_rows: int      # 样本行数上限
    max_history_turns: int    # 对话历史轮数
    max_workflow_total: int   # 多步骤总预算
```

### 估算函数

```python
estimate_tokens(text) = len(text) // 3  # ~3 字符/token，偏保守
```

禁止引入 tiktoken、anthropic tokenizer SDK 等第三方 tokenizer。

### WorkflowTokenTracker

用于 autonomous analysis 等多步骤场景:
- 追踪累计 token 消耗
- `can_proceed()` 检查剩余预算
- `record()` 记录每次调用
- `to_dict()` 导出用于 API 响应

## Per-Operation 预算表

| Operation | Input | Output | Schema | Rows | History |
|-----------|-------|--------|--------|------|---------|
| sql_generation | 3000 | 512 | 2000 | 5 | 0 |
| explanation | 6000 | 1024 | 500 | 30 | 6 |
| insights | 5000 | 1024 | 500 | 30 | 0 |
| chart_suggest | 3000 | 512 | 200 | 10 | 0 |
| semantics | 3000 | 1024 | 2000 | 5 | 0 |
| suggest_questions | 2000 | 512 | 1500 | 0 | 0 |
| analysis_plan | 3000 | 1024 | 2000 | 5 | 0 |
| summarizer | 3000 | 512 | 0 | 3 | 0 |
| **autonomous total** | **25000** | ~5500 | - | - | - |

## 集成方式

### LLM 调用层 (`_call_llm`)

```python
def _call_llm(system, user_message, max_tokens, language,
              tracker=None, operation="unknown"):
    # 1. 检查预算
    if tracker and not tracker.can_proceed(input_tokens, max_tokens):
        tracker.record_budget_exceeded(operation)
        raise RuntimeError("Token budget exceeded")

    # 2. 输入截断
    if input_tokens > budget.max_input_tokens:
        user_message = truncate_text(user_message, budget.max_input_tokens)

    # 3. 调用 API
    text = call_api(...)

    # 4. 记录消耗
    if tracker:
        tracker.record(operation, input_tokens, output_tokens)
```

### Pipeline 层

```python
tracker = WorkflowTokenTracker(total_budget=25000)

for step in plan:
    if not tracker.can_proceed(...):
        step["status"] = "skipped_budget"
        continue
    sql_result = generate_sql(..., tracker=tracker)
```

## 关键约束

- 禁止在 service 文件中硬编码 max_tokens，必须从 budget 读取
- 禁止在 service 文件中硬编码行数限制（如 `results[:50]`），必须从 budget 读取
- 新增 operation 必须在 `OPERATION_BUDGETS` 中定义预算
- Workflow 总预算默认 25K input tokens
