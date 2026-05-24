"""Runtime Guardrails — enforce limits on autonomous analysis.

防止 unbounded execution: max steps, max SQL queries, timeout, recursion, consecutive failures.
"""

import time
from dataclasses import dataclass, field


@dataclass
class AnalysisGuardrails:
    max_steps: int = 6
    max_sql_queries: int = 8
    max_consecutive_failures: int = 2
    max_total_time_seconds: int = 120
    max_step_time_seconds: int = 30
    max_recursion_depth: int = 2
    require_minimum_success: int = 1


DEFAULT_GUARDRAILS = AnalysisGuardrails()

STRICT_GUARDRAILS = AnalysisGuardrails(
    max_steps=4,
    max_sql_queries=5,
    max_consecutive_failures=1,
    max_total_time_seconds=60,
    max_step_time_seconds=15,
)


class GuardrailViolation(Exception):
    def __init__(self, rule: str, message: str, context: dict | None = None):
        self.rule = rule
        self.message = message
        self.context = context or {}
        super().__init__(f"Guardrail [{rule}]: {message}")


class AnalysisGuard:
    def __init__(self, config: AnalysisGuardrails | None = None):
        self.config = config or DEFAULT_GUARDRAILS
        self.start_time = time.time()
        self.steps_executed = 0
        self.sql_queries = 0
        self.consecutive_failures = 0
        self.step_start_time: float | None = None

    def check_before_step(self, step_def: dict, executed_steps: list[dict]):
        """在执行每一步之前检查 guardrail。"""
        if self.steps_executed >= self.config.max_steps:
            raise GuardrailViolation("max_steps", f"已达到最大步数 {self.config.max_steps}")

        if self.sql_queries >= self.config.max_sql_queries:
            raise GuardrailViolation("max_sql_queries", f"已达到最大 SQL 查询数 {self.config.max_sql_queries}")

        elapsed = time.time() - self.start_time
        if elapsed > self.config.max_total_time_seconds:
            raise GuardrailViolation("total_timeout", f"分析超时 {self.config.max_total_time_seconds}s")

        # Per-step timeout: check how long the PREVIOUS step took
        if self.step_start_time is not None:
            step_elapsed = time.time() - self.step_start_time
            if step_elapsed > self.config.max_step_time_seconds:
                raise GuardrailViolation(
                    "step_timeout",
                    f"步骤超时 {step_elapsed:.1f}s (限制: {self.config.max_step_time_seconds}s)"
                )

        # Record start of this step
        self.step_start_time = time.time()

        depth = self._chain_depth(step_def, executed_steps)
        if depth > self.config.max_recursion_depth:
            raise GuardrailViolation("recursion_depth", f"依赖链深度 {depth} 超过限制 {self.config.max_recursion_depth}")

        if self.consecutive_failures >= self.config.max_consecutive_failures:
            raise GuardrailViolation("consecutive_failures", f"连续失败 {self.config.max_consecutive_failures} 次")

    def record_step_result(self, success: bool):
        """记录每步执行结果。"""
        self.steps_executed += 1
        self.sql_queries += 1
        if success:
            self.consecutive_failures = 0
        else:
            self.consecutive_failures += 1

    def check_after_all(self, executed_steps: list[dict]):
        """所有步骤执行后检查最低成功数。"""
        successful = sum(1 for s in executed_steps if s.get("status") == "success")
        if successful < self.config.require_minimum_success:
            raise GuardrailViolation(
                "minimum_success",
                f"仅 {successful} 步成功（最低要求: {self.config.require_minimum_success}）"
            )

    def to_dict(self) -> dict:
        """导出 guardrail 状态用于 API 响应。"""
        return {
            "config": {
                "max_steps": self.config.max_steps,
                "max_sql_queries": self.config.max_sql_queries,
                "max_consecutive_failures": self.config.max_consecutive_failures,
                "max_total_time_seconds": self.config.max_total_time_seconds,
                "max_step_time_seconds": self.config.max_step_time_seconds,
                "max_recursion_depth": self.config.max_recursion_depth,
                "require_minimum_success": self.config.require_minimum_success,
            },
            "steps_executed": self.steps_executed,
            "sql_queries": self.sql_queries,
            "consecutive_failures": self.consecutive_failures,
            "elapsed_seconds": round(time.time() - self.start_time, 2),
        }

    def _chain_depth(self, step_def: dict, executed_steps: list[dict]) -> int:
        """计算依赖链深度，检测循环依赖。"""
        depth = 0
        current = step_def
        visited: set = set()
        while current.get("depends_on") is not None:
            dep = current["depends_on"]
            if dep in visited:
                return 999  # 循环依赖
            visited.add(dep)
            depth += 1
            prev = next((s for s in executed_steps if s.get("step") == dep), None)
            if prev is None:
                break
            current = prev
        return depth
