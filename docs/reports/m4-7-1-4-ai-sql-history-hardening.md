# M4-7.1.4 AI SQL Capability + History Recall UX Hardening

## 1. Problems

### Problem A: AI SQL 能力不足
- 简单问题可以回答，但中高难度自然语言 SQL 失败
- 测试问题："请分析 2021 年到 2024 年之间，每个地区每年销售额最高的前 3 个品类..."
- 专家 SQL 返回 `CANNOT_ANSWER`，自然语言分析页返回 `Failed to parse LLM response as JSON`
- demo_sales 实际具备相关字段 (order_date, category, sales_amount, discount, customer_region, is_returned)

### Problem B: 历史记录只能看，不能回查/复用
- 点击历史记录没有明确动作
- 用户无法把历史 SQL 加载回专家 SQL 工作台
- 用户无法打开 AI 分析历史详情
- 历史列表 UI 太小，信息层级不清楚

## 2. Root Cause

| 问题 | 根因 |
|------|------|
| CANNOT_ANSWER 误判 | SQL generation prompt 没有中文→字段映射，LLM 不认识"地区/品类/销售额"等中文业务词 |
| schema 信息不足 | `build_schema_context` 只输出列名+类型，无业务语义 |
| 无 deterministic fallback | 缺少 SQL 模板，CANNOT_ANSWER 后无后续尝试 |
| JSON parse 失败 | `llm_json.py` 抛异常后无 fallback，直接红屏 |
| History 不能回查 | `handleLoad` 只做 `updateTabSql`，无 AI 历史详情跳转 |
| History UI 太小 | 全部 text-xs 字号，hover 才出现小图标 |

## 3. AI SQL Fixes

### 3.1 新增 Schema Semantic Mapping (`backend/services/schema_semantics.py`)
- 中文业务词 → 真实字段名映射 (地区→customer_region, 品类→category, 销售额→sales_amount 等)
- `build_semantic_aliases()`: 基于实际列名构建映射
- `build_semantic_context()`: 生成 prompt 注入文本
- `get_missing_fields()`: 检测缺失字段
- 只映射真实存在的字段，不存在的字段返回 unavailable

### 3.2 强化 SQL Generation Prompt (`backend/prompts/sql_generation.py`)
- 新增 `semantic_context` 可选参数
- prompt 增加中文→字段映射指导规则
- 明确"年份"使用 `EXTRACT(YEAR FROM order_date)`
- 明确"占比"使用 CTE + window function
- 明确"前N"使用 RANK/ROW_NUMBER
- 明确"退货率"使用 `AVG(CAST(is_returned AS DOUBLE))`
- max_output_tokens 从 512 提升到 1024

### 3.3 新增 Deterministic SQL Fallback (`backend/services/sql_templates.py`)
- Top category by year + region 模板
- 区域销售排名模板
- 品类销售排名模板
- 异常订单筛选模板
- 模板基于 schema 语义映射，不硬编码表名

### 3.4 集成语义映射到 Pipeline (`backend/services/ai_pipeline.py`)
- `run_ai_query`: 构建语义上下文并传入 SQL generation
- CANNOT_ANSWER 后尝试 deterministic fallback
- `run_autonomous_analysis`: 每个 step 同样集成语义映射和 fallback
- 流式变体同样支持

### 3.5 Token Budget 增加 (`backend/runtime/token_budget.py`)
- sql_generation: max_input_tokens 3000→4000, max_output_tokens 512→1024

## 4. JSON Parsing Fallback

### 4.1 增强 `llm_json.py`
- 新增 `_repair_json()`: 修复尾逗号、单引号等常见 LLM JSON 问题
- 新增 `safe_parse_llm_json()`: 安全解析，失败时返回 fallback 值
- 支持大写 JSON fence: ` ```JSON ``` `

### 4.2 分析计划 JSON fallback (`ai_analyst.py`)
- `generate_analysis_plan`: JSON 解析失败时，构建单步 plan (question → sql_goal)
- 不再因 JSON parse 失败直接返回错误

## 5. History Recall UX

### 5.1 卡片放大和信息清晰化
- 字号从 text-xs 提升到 text-sm
- 卡片增加 padding (px-4 py-3)
- 增加 hover shadow 效果
- 状态指示点从 1.5x1.5 放大到 2x2
- 表名使用 monospace + 背景色标签

### 5.2 AI 分析历史操作
- `查看详情` → 跳转 `/analyze/<runId>`
- `重新运行` → 跳转分析工作台，question + table 填回
- `复制问题` → 复制 question 到剪贴板

### 5.3 专家 SQL 历史操作
- `加载到工作台` → 创建新 tab，填入 SQL，跳转分析工作台
- `重新执行` → 创建新 tab，填入 SQL，跳转并自动执行
- `复制 SQL` → 复制 SQL 到剪贴板

### 5.4 操作按钮始终可见
- 移除 hover 才显示的逻辑
- 按钮使用文字标签，不再只放小图标
- 按钮使用 bg-tertiary + border 样式，视觉清晰

### 5.5 空态文案更新
- "暂无历史记录。完成一次自然语言分析或专家 SQL 查询后会出现在这里。"

## 6. Trace Clarification

PLANNING / STEP / SUMMARY 是调用追踪 (Trace)，不是完整 Agent。
- 当前版本是 SQL generation + deterministic fallback
- Agent 需要 tool registry、state、persistence、verifier、step retry、run lifecycle
- Trace 文案保持"调用追踪 / Trace"

## 7. Validation Results

| 验证项 | 结果 |
|--------|------|
| `python -c "from backend.main import app"` | OK |
| `python -m pytest tests/ -x -q --ignore=tests/ai` | 523 passed |
| `npx tsc --noEmit` | OK (no errors) |
| `npm run test` | 201 passed |
| `npx next build` | Compiled successfully |

### 新增测试覆盖
- `tests/test_m4_7_1_4_sql_capability.py`: 35 tests
  - 中文词字段映射 (10 tests)
  - SQL 模板生成 (8 tests)
  - JSON 解析增强 (10 tests)
  - SQL 提取验证 (5 tests)
  - 语义集成 (2 tests)

## 8. Remaining Risks

- **M5 Agent 仍未开始**: 当前只是增强 SQL generation 和历史复用
- **Agent 需要**: tool registry、state、persistence、verifier、step retry、run lifecycle
- **activeTable/workspace state**: 仍需 M4-7.2 继续治理
- **复杂 SQL 的 LLM 生成质量**: deterministic fallback 只覆盖常见模式，边缘情况仍依赖 LLM

## 9. Next Step

- 合并后线上验证 complex SQL 和 History recall
- 通过后进入 M4-7.2 State Boundary Cleanup
- 暂不打 tag
- 暂不开始 M5 Agent
