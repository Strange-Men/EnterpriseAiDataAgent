# Skill: Runtime Guardrails

## 概述

Autonomous Analysis Runtime Guardrails — 限制 AI 分析流程的执行边界，防止 unbounded execution。

## 核心组件

### AnalysisGuardrails

```python
@dataclass
class AnalysisGuardrails:
    max_steps: int = 6                    # 最大计划步数
    max_sql_queries: int = 8              # 最大 SQL 执行次数（含重试）
    max_consecutive_failures: int = 2     # 连续失败 N 次后停止
    max_total_time_seconds: int = 120     # 整个分析的硬超时
    max_step_time_seconds: int = 30       # 单步超时
    max_recursion_depth: int = 2          # 最大 depends_on 链长度
    require_minimum_success: int = 1      # 至少 N 步成功
```

### 预设配置

| 配置 | max_steps | max_sql | consecutive_fail | timeout | step_timeout |
|------|-----------|---------|------------------|---------|--------------|
| DEFAULT | 6 | 8 | 2 | 120s | 30s |
| STRICT | 4 | 5 | 1 | 60s | 15s |

### AnalysisGuard

```python
class AnalysisGuard:
    def check_before_step(step_def, executed_steps): ...
    def record_step_result(success: bool): ...
    def check_after_all(executed_steps): ...
    def to_dict() -> dict: ...
```

## 违规行为

| 规则 | 违规后行为 |
|------|-----------|
| max_steps | 跳过剩余步骤 |
| max_sql_queries | **停止执行** |
| consecutive_failures | **停止执行** |
| total_timeout | **停止执行** |
| recursion_depth | 跳过该步骤，断开依赖链 |
| minimum_success | 记录违规，仍生成报告 |

## 集成方式

### Pipeline 层

```python
guard = AnalysisGuard(guardrails or DEFAULT_GUARDRAILS)

for step_def in plan:
    try:
        guard.check_before_step(step_def, executed_steps)
    except GuardrailViolation as v:
        # 记录违规，跳过或停止
        ...

    # ... 执行步骤 ...

    guard.record_step_result(success=is_success)

guard.check_after_all(executed_steps)
```

### API 请求

```json
{
  "question": "...",
  "table": "...",
  "guardrails": {
    "max_steps": 4,
    "max_consecutive_failures": 1
  }
}
```

### API 响应

```json
{
  "guardrails": {
    "config": { "max_steps": 6, ... },
    "steps_executed": 4,
    "sql_queries": 5,
    "consecutive_failures": 0,
    "elapsed_seconds": 45.2
  },
  "guardrail_violations": []
}
```

## 关键约束

- guardrails 配置可选，默认使用 DEFAULT_GUARDRAILS
- STRICT 模式适合快速反馈场景
- GuardrailViolation 不会中断整个 workflow，只跳过或停止当前分析
- 循环依赖通过 `_chain_depth()` 检测，返回 999 表示循环
