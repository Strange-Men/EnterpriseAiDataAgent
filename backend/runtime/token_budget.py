"""Token Budget System — AI Runtime 预算控制。

提供:
- 启发式 token 估算（无第三方 tokenizer 依赖）
- 文本/行截断
- Per-operation 预算配置
- Workflow 级 token 追踪
"""

import json
import time
from dataclasses import dataclass


# ── 启发式 Token 估算 ──────────────────────────────────────────

def _cjk_ratio(text: str) -> float:
    """Estimate the ratio of CJK characters in text."""
    if not text:
        return 0.0
    cjk_count = sum(1 for c in text if '一' <= c <= '鿿' or '㐀' <= c <= '䶿')
    return cjk_count / len(text)


def estimate_tokens(text: str) -> int:
    """启发式 token 估算: CJK ~1.5 char/token, English ~3 char/token, 混合按比例加权。"""
    if not text:
        return 1
    ratio = _cjk_ratio(text)
    # CJK: ~1.5 chars per token; English: ~3 chars per token
    chars_per_token = 1.5 * ratio + 3.0 * (1 - ratio)
    return max(1, int(len(text) / chars_per_token))


# ── 截断工具 ──────────────────────────────────────────────────

def truncate_text(text: str, max_tokens: int) -> str:
    """截断文本至 token 上限。保留前部，截断后部。"""
    tokens = estimate_tokens(text)
    if tokens <= max_tokens:
        return text
    char_limit = max_tokens * 3
    return text[:char_limit] + "\n...[truncated]"


def truncate_rows(rows: list[dict], max_rows: int, max_tokens: int) -> tuple[list[dict], bool]:
    """截断行列表以满足行数和 token 双重限制。

    使用二分搜索替代逐行删除，O(n log n) 替代 O(n²)。
    返回: (截断后行列表, 是否被截断)
    """
    if not rows:
        return rows, False

    truncated = rows[:max_rows]
    was_truncated = len(rows) > max_rows

    # 检查 token 限制
    text = json.dumps(truncated, default=str, ensure_ascii=False)
    if estimate_tokens(text) <= max_tokens:
        return truncated, was_truncated

    # 二分搜索找到合适的行数
    lo, hi = 1, len(truncated)
    best = 1
    while lo <= hi:
        mid = (lo + hi) // 2
        candidate = truncated[:mid]
        text = json.dumps(candidate, default=str, ensure_ascii=False)
        if estimate_tokens(text) <= max_tokens:
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1

    return truncated[:best], True


# ── Per-Operation Budget 配置 ──────────────────────────────────

@dataclass(frozen=True)
class TokenBudget:
    """单个 operation 的 token 预算。"""

    max_input_tokens: int         # 用户消息 token 上限
    max_output_tokens: int        # API max_tokens 参数
    max_schema_tokens: int        # schema 上下文 token 上限
    max_sample_rows: int          # 样本数据最大行数
    max_history_turns: int        # 对话历史最大轮数
    max_workflow_total: int       # 多步骤 workflow 总预算（仅 autonomous 使用）


# 每类 operation 的默认预算
OPERATION_BUDGETS: dict[str, TokenBudget] = {
    "sql_generation": TokenBudget(
        max_input_tokens=4000,
        max_output_tokens=1024,
        max_schema_tokens=2500,
        max_sample_rows=5,
        max_history_turns=0,
        max_workflow_total=4000,
    ),
    "explanation": TokenBudget(
        max_input_tokens=6000,
        max_output_tokens=1024,
        max_schema_tokens=500,
        max_sample_rows=30,
        max_history_turns=6,
        max_workflow_total=6000,
    ),
    "insights": TokenBudget(
        max_input_tokens=5000,
        max_output_tokens=1024,
        max_schema_tokens=500,
        max_sample_rows=30,
        max_history_turns=4,
        max_workflow_total=5000,
    ),
    "chart_suggest": TokenBudget(
        max_input_tokens=3000,
        max_output_tokens=512,
        max_schema_tokens=200,
        max_sample_rows=10,
        max_history_turns=0,
        max_workflow_total=3000,
    ),
    "semantics": TokenBudget(
        max_input_tokens=3000,
        max_output_tokens=1024,
        max_schema_tokens=2000,
        max_sample_rows=5,
        max_history_turns=0,
        max_workflow_total=3000,
    ),
    "suggest_questions": TokenBudget(
        max_input_tokens=2000,
        max_output_tokens=512,
        max_schema_tokens=1500,
        max_sample_rows=0,
        max_history_turns=0,
        max_workflow_total=2000,
    ),
    "analysis_plan": TokenBudget(
        max_input_tokens=3000,
        max_output_tokens=1024,
        max_schema_tokens=2000,
        max_sample_rows=5,
        max_history_turns=0,
        max_workflow_total=3000,
    ),
    "summarizer": TokenBudget(
        max_input_tokens=3000,
        max_output_tokens=512,
        max_schema_tokens=0,
        max_sample_rows=3,
        max_history_turns=0,
        max_workflow_total=3000,
    ),
    "anomaly_interpretation": TokenBudget(
        max_input_tokens=4000,
        max_output_tokens=1024,
        max_schema_tokens=500,
        max_sample_rows=20,
        max_history_turns=0,
        max_workflow_total=4000,
    ),
    "self_evaluation": TokenBudget(
        max_input_tokens=3000,
        max_output_tokens=1024,
        max_schema_tokens=0,
        max_sample_rows=0,
        max_history_turns=0,
        max_workflow_total=3000,
    ),
}


def get_budget(operation: str) -> TokenBudget:
    """获取指定 operation 的预算配置。未知 operation 返回保守默认值。"""
    return OPERATION_BUDGETS.get(operation, TokenBudget(
        max_input_tokens=2000,
        max_output_tokens=512,
        max_schema_tokens=1000,
        max_sample_rows=5,
        max_history_turns=0,
        max_workflow_total=2000,
    ))


# ── Workflow Token Tracker ─────────────────────────────────────

class WorkflowTokenTracker:
    """多步骤 workflow 的 token 追踪器。

    用于 autonomous analysis 等多步骤场景，
    追踪累计 token 消耗并在超预算时阻止后续调用。
    """

    def __init__(self, total_budget: int = 25000):
        self.total_budget = total_budget
        self.total_input = 0
        self.total_output = 0
        self.calls: list[dict] = []
        self.start_time = time.time()

    @property
    def consumed(self) -> int:
        """已消耗的总 token 数（输入+输出）。"""
        return self.total_input + self.total_output

    @property
    def remaining(self) -> int:
        """剩余可用 token 数。"""
        return max(0, self.total_budget - self.consumed)

    def can_proceed(self, estimated_input: int, estimated_output: int = 0) -> bool:
        """检查是否有足够预算继续。"""
        return (self.consumed + estimated_input + estimated_output) <= self.total_budget

    def record(self, operation: str, input_tokens: int, output_tokens: int,
               status: str = "success", error: str | None = None):
        """记录一次 LLM 调用的 token 消耗。"""
        self.total_input += input_tokens
        self.total_output += output_tokens
        self.calls.append({
            "operation": operation,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "status": status,
            "error": error,
        })

    def record_budget_exceeded(self, operation: str):
        """记录一次因预算不足而跳过的调用。"""
        self.calls.append({
            "operation": operation,
            "input_tokens": 0,
            "output_tokens": 0,
            "status": "skipped_budget",
        })

    def to_dict(self) -> dict:
        """导出为字典，用于 API 响应和 trace。"""
        return {
            "total_budget": self.total_budget,
            "total_input_tokens": self.total_input,
            "total_output_tokens": self.total_output,
            "total_tokens": self.consumed,
            "remaining": self.remaining,
            "total_llm_calls": len(self.calls),
            "elapsed_ms": round((time.time() - self.start_time) * 1000, 2),
            "utilization_pct": round(self.consumed / self.total_budget * 100, 1) if self.total_budget > 0 else 0,
            "calls": self.calls,
        }
