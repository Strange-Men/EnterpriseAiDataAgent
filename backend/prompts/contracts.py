"""Prompt Contracts — 结构化 Prompt 定义。

每个 prompt 必须有明确的 contract，定义：
- 变量需求
- 输出格式
- token 上限
- 用途说明
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class PromptContract:
    """Prompt 合约：定义一个 prompt 的结构化约束。"""

    name: str                        # 唯一标识符
    purpose: str                     # 这个 prompt 的用途
    required_vars: list[str]         # 必需的用户消息变量
    optional_vars: list[str]         # 可选变量
    response_format: str             # "text" | "json"
    max_output_tokens: int           # API max_tokens 参数
    supports_streaming: bool         # 是否支持流式输出
    default_temperature: float = 0.0  # 默认温度（0 = 使用全局设置）

    def validate_vars(self, provided: dict[str, str]) -> list[str]:
        """验证提供的变量是否满足需求。返回缺失变量列表。"""
        missing = [v for v in self.required_vars if v not in provided or not provided[v]]
        return missing
