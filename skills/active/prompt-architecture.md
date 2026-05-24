# Skill: Prompt Architecture Layer

## 概述

所有 AI prompt 必须集中管理在 `backend/prompts/` 目录下，禁止散落在 service/route 文件中。

## 核心原则

### 1. Prompt Contract

每个 prompt 必须定义 `PromptContract`:

```python
@dataclass(frozen=True)
class PromptContract:
    name: str                        # 唯一标识符
    purpose: str                     # 用途
    required_vars: list[str]         # 必需变量
    optional_vars: list[str]         # 可选变量
    response_format: str             # "text" | "json"
    max_output_tokens: int           # API max_tokens
    supports_streaming: bool         # 是否支持流式
    default_temperature: float = 0.0
```

### 2. 文件结构

每个 prompt 模块导出 3 个内容：
- `CONTRACT` — PromptContract 实例
- `SYSTEM_PROMPT` — system prompt 文本
- `build_user_message()` — 结构化构建用户消息

### 3. 禁止模式

- ❌ prompt 文本定义在 service 文件中
- ❌ 用户消息用 string 拼接构建
- ❌ 多处复制相同 prompt
- ❌ 没有 max_output_tokens 定义

### 4. 必须模式

- ✅ `from backend.prompts.xxx import CONTRACT, SYSTEM_PROMPT, build_user_message`
- ✅ 使用 contract 的 `max_output_tokens` 而非硬编码
- ✅ 语言处理通过 `apply_language(system, language)` 注入
- ✅ builder 函数接受明确参数，返回完整字符串

## 目录结构

```
backend/prompts/
    __init__.py          — 统一导出
    contracts.py         — PromptContract 定义
    registry.py          — 集中注册表
    locale.py            — 语言处理
    sql_generation.py    — SQL 生成
    explanation.py       — 结果解释
    insights.py          — 洞察生成
    chart_suggest.py     — 图表建议
    semantics.py         — 语义理解
    suggest_questions.py — 问题推荐
    analysis_plan.py     — 分析计划
    summarizer.py        — 执行摘要
```

## 添加新 Prompt 的流程

1. 在 `backend/prompts/` 创建新文件
2. 定义 `CONTRACT`（PromptContract 实例）
3. 定义 `SYSTEM_PROMPT`（文本）
4. 定义 `build_user_message()`（builder 函数）
5. 在 `registry.py` 注册合约
6. 在 `__init__.py` 添加导出（可选）
7. 在 service 文件中 import 使用

## Token 预算

每个 prompt 的 `max_output_tokens` 应参考：

| 操作类型 | 建议值 | 说明 |
|----------|--------|------|
| SQL 生成 | 512 | SQL 文本较短 |
| 结果解释 | 1024 | 需要段落描述 |
| 洞察生成 | 1024 | JSON 结构化输出 |
| 图表建议 | 512 | JSON 结构化输出 |
| 语义理解 | 1024 | JSON 多字段输出 |
| 问题推荐 | 512 | JSON 简短输出 |
| 分析计划 | 1024 | JSON 多步骤输出 |
| 执行摘要 | 512 | 文本摘要 |
