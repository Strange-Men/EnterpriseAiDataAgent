# M6 LangChain Compliance + LangGraph Architecture + README Finalization Plan

## 1. Purpose

本轮是最新五轮技术路线中的第 2 轮，范围为：

- LangChain 合规审计。
- LangGraph 接入方案文档。
- README 一步到位修改。

本轮只做文档和 README，不写前端功能代码、不写后端功能代码、不改测试、不改 CI、不实现 LangGraph MVP、不新增 M6.9、不创建 tag。

## 2. Confirmed Five-Round Technical Route

最新五轮技术路线：

1. SQL UI 修复。
2. LangChain 合规审计 + LangGraph 接入方案文档 + README 一步到位修改。
3. BusinessReportViewModel + locale 透传 + Export 清洗统一。
4. 后端 Intent Router + `data_table` 输出模式。
5. LangGraph MVP。

## 3. LangChain Compliance Audit

### 3.1 Current LangChain Entry

当前 LangChain Single Agent 入口集中在：

- `backend/agent/langchain_single_agent.py`
- `backend/agent/business_orchestration.py`
- `/api/agent/runs` 对应后端 Agent Run 路径

M6.5 已在现有 LangChain Single Agent 后端循环中接入 Business Analyst Agent 编排分支，并保留旧 `answer`、`sql`、`evidence`、`warnings`、`trace`、`tool_calls` 字段兼容。

### 3.2 StructuredTool Usage

M6.5 已将 M6.4 Business Analysis Tools 包装为 LangChain `StructuredTool` 可调用工具。注册 / 包装工具包括：

- `validate_fields`
- `map_business_terms`
- `compute_overall_kpis`
- `compare_by_dimension`
- `trend_analysis`
- `top_bottom_analysis`
- `refund_risk_analysis`
- `discount_risk_analysis`
- `profitability_analysis`
- `shipping_efficiency_analysis`
- `customer_profile_analysis`
- `channel_effectiveness_analysis`
- `data_quality_check`
- `risk_priority_scoring`
- `opportunity_finder`
- `root_cause_hypothesis`
- `recommendation_builder`

这些工具复用 `backend/business_tools/` 的 typed input / output，并把工具结果作为 backend evidence，而不是直接暴露给主业务报告。

### 3.3 business_tools Input / Output Clarity

`backend/business_tools/` 已包含 typed models，例如：

- `ToolResult`
- `EvidenceTable`
- `EvidenceRow`
- `MetricValue`
- `RiskItem`
- `OpportunityItem`
- `RecommendationItem`

输出要求包括 JSON-safe、evidence summary、missing_fields、fallback_message 和可追溯指标证据。合规性总体成立。

### 3.4 Evidence-based business_report

M6.5 `business_report` 来自多工具证据、风险 / 机会聚合和 recommendation builder，而不是让 LLM 单独猜结论。M6.6 以后前端默认展示 `business_report`，并把 SQL / trace / tool_calls / provider / run_id / memory 放入折叠技术细节。

当前短板是输出策略仍偏模板化：

- 排序 / 统计类问题会被套入经营健康诊断结构。
- 增长机会仍可能暴露技术对象字段。
- 英文 locale 与导出清洗需要统一 ViewModel。

这些短板属于 Agent 输出策略和报告组合层问题，不是否定 LangChain tool integration 的合规性。

### 3.5 Memory Boundary

当前 memory 用于 follow-up：

- 当前表。
- 问题类型。
- 关注维度。
- key findings summary。
- risk priorities summary。
- recommendations summary。
- compact evidence summary。

Memory 只存摘要，不存大 JSON，不默认展示给用户，也不存 API Key 或私人内容。合规性成立。

### 3.6 Provider Fallback Transparency

Manual Fix 3 已增加：

- `requested_provider`
- `provider_used`
- `provider_status`
- `fallback_reason`
- `is_simulated`

状态包括：

- `live_success`
- `mock`
- `fallback`
- `error`

fallback 不伪装成真实模型输出，前端展示 Mock / fallback / error 状态。合规性成立。

### 3.7 Hidden Technical Details

M6.6 / Manual Fix 2 / Manual Fix 3 / Polish Hotfix 已要求主业务报告不包含：

- SQL。
- trace。
- tool_calls。
- provider。
- run_id。
- memory。
- raw JSON。

技术细节默认折叠，导出报告默认排除技术日志式证据。合规性成立。

### 3.8 Value of Keeping LangChain Path

当前 LangChain 路径保留价值：

- 兼容已有 Agent Run 测试和旧响应字段。
- 保留 Single Agent 工具调用路径。
- 复用 M6.4 `business_tools`。
- 复用 provider fallback、trace、memory 和 StructuredTool 包装。
- 作为 LangGraph Multi-Agent Orchestration 的工具基础。

## 4. LangGraph Multi-Agent Orchestration Design

```text
Frontend Workbench
  ↓
FastAPI Backend
  ↓
LangChain Single Agent + LangGraph Multi-Agent Orchestration
  ├─ Question Router Node
  ├─ Evidence Planner Node
  ├─ Tool Execution Node
  ├─ Report Composer Node
  ├─ Validator Node
  └─ Follow-up Memory Node
  ↓
Business Semantic Layer + Business Tools
  ↓
DuckDB / Excel / CSV
  ↓
BusinessReportViewModel
  ↓
UI / Markdown Export / HTML Export
```

节点职责：

- **Question Router Node**：负责识别用户问题类型，包括 `ranking_summary`、`business_diagnosis`、`risk_opportunity`、`action_plan`、`unsupported_metric`、`follow_up`。
- **Evidence Planner Node**：负责根据 intent 规划证据收集路径、指标维度和工具调用顺序。
- **Tool Execution Node**：负责调用现有 Business Tools，不重写数据分析工具。
- **Report Composer Node**：负责组织 `data_table`、经营诊断、风险机会、行动方案和缺字段解释。
- **Validator Node**：负责检查答非所问、字段幻觉、语言混杂、技术细节泄露和 provider fallback 透明度。
- **Follow-up Memory Node**：负责处理连续追问上下文，不污染新问题。

LangGraph Multi-Agent Orchestration 保留现有 FastAPI、Business Semantic Layer、Business Tools、DuckDB、BusinessReport contract、BusinessReportViewModel 和前端工作台。LangChain Single Agent 保留已有兼容路径和 StructuredTool 包装能力。

## 5. README Finalization Rules

README 一步到位修改规则：

- 标题固定为：`Enterprise AI Data Agent｜Business Analyst Agent for Data-Driven Operations`
- 描述必须包含：LangChain Single Agent 与 LangGraph Multi-Agent 共同构成编排层。
- README 模板结构保持不变。
- 只替换文本内容、架构说明、功能说明。
- 不改变 README 大标题层级结构，除非原标题本身必须替换。
- 不写弱状态词。
- 不写 `Current Implementation / Future Architecture` 对比。
- 不写 `LangGraph 将作为下一阶段接入`。
- 直接写 `LangGraph Multi-Agent Orchestration`。
- 架构图包含 LangGraph 六个节点。

README 架构图包含：

```text
Frontend Workbench
  ↓
FastAPI Backend
  ↓
LangChain Single Agent + LangGraph Multi-Agent Orchestration
  ├─ Question Router Node
  ├─ Evidence Planner Node
  ├─ Tool Execution Node
  ├─ Report Composer Node
  ├─ Validator Node
  └─ Follow-up Memory Node
  ↓
Business Semantic Layer + Business Tools
  ↓
DuckDB / Excel / CSV
  ↓
BusinessReportViewModel
  ↓
UI / Markdown Export / HTML Export
```

## 6. Relationship with Round 3 / 4 / 5

- 第 3 轮负责 BusinessReportViewModel、locale 和 Export 清洗统一。
- 第 4 轮负责后端 Intent Router 和 `data_table` 输出模式。
- 第 5 轮负责 LangGraph MVP。
- 第 2 轮不写这些功能代码，只统一文档和 README 表达。

## 7. Non-goals

- 不改前端功能代码。
- 不改后端功能代码。
- 不改测试。
- 不改 CI。
- 不实现 LangGraph MVP。
- 不实现 BusinessReportViewModel。
- 不实现 Intent Router。
- 不实现 `data_table`。
- 不新增 M6.9。
- 不打 tag。
- 不提交 API Key。
- 不提交 `.env`。

## 8. Acceptance Criteria

本轮完成后满足：

- 旧固化文件已更新成最新五轮路线。
- README 已按最终展示形态重写。
- README 标题已替换。
- README 包含 LangChain Single Agent + LangGraph Multi-Agent Orchestration。
- README 架构图包含 LangGraph 六个节点。
- README 不出现弱状态词。
- 新增 LangChain 合规审计 + LangGraph 接入方案文档。
- 本轮没有功能代码改动。
- 本轮没有测试改动。
- 本轮没有 CI 改动。
- 未新增 M6.9。
- 未打 tag。
