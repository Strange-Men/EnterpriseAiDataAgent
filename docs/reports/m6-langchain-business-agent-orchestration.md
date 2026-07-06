# M6 LangChain Business Agent Orchestration

> Date: 2026-07-06
> Stage: M6.5 LangChain Agent orchestration enhancement

## 1. Stage Scope

本轮严格是 M6.5：LangChain Agent 编排增强。

已完成：

- 将 M6.4 Business Analysis Tools 合并到 `master`，验证后推送。
- 从最新 `master` 创建 `m6-langchain-business-agent-orchestration` 分支。
- 新增业务问题分类、分析计划、Business Report 拼装和 memory 摘要 helper。
- 将 M6.4 business tools 包装为 LangChain `StructuredTool` 可调用工具。
- 在现有 LangChain Single Agent 后端循环中接入业务编排分支。
- 保留旧 `answer` / `sql` / `evidence` / `warnings` / `trace` / `tool_calls` 字段。
- 新增 `business_report` 后端响应字段。
- 增强 follow-up 场景的 memory summary 读取和写入。
- 增加 M6.5 focused tests。

未进入：

- M6.6 Business Report 前端适配。
- M6.7 综合能力压力测试正式评分。
- M6.8 Final QA。
- 前端 UI / Astryx UI。
- 真实 Doubao Render 压测。
- Multi-Agent / LangGraph / RAG。
- tag。

## 2. Markdown Basis

本轮已读取并对齐：

- `docs/reports/m6-business-analyst-agent-architecture.md`
- `docs/reports/m6-business-capability-research.md`
- `docs/reports/m6-demo-dataset-redesign-spec.md`
- `docs/reports/m6-pressure-test-plan.md`
- `docs/reports/m6-demo-business-dataset-redesign.md`
- `docs/reports/m6-business-semantic-layer.md`
- `docs/reports/m6-business-analysis-tools.md`
- `docs/reports/m6-demo-sales-business-schema-manifest.json`
- `docs/reports/m6-demo-sales-business-profile-summary.md`
- `backend/semantic/`
- `backend/business_tools/`

## 3. Changed File Paths

| Artifact | Path |
| --- | --- |
| Business orchestration helper | `backend/agent/business_orchestration.py` |
| Agent response contract | `backend/agent/contracts.py` |
| LangChain Single Agent orchestration | `backend/agent/langchain_single_agent.py` |
| M6.5 tests | `tests/test_m6_langchain_business_agent_orchestration.py` |
| M6.5 report | `docs/reports/m6-langchain-business-agent-orchestration.md` |
| Session status | `CURRENT_SESSION.md` |
| Development status | `docs/DEV_STATUS.md` |
| Project context | `docs/PROJECT_CONTEXT.md` |

## 4. Question Classification

规则优先的问题类型：

- `business_health_check`
- `business_review_summary`
- `risk_diagnosis`
- `growth_opportunity`
- `region_analysis`
- `category_product_analysis`
- `customer_profile_analysis`
- `channel_analysis`
- `trend_analysis`
- `shipping_efficiency_analysis`
- `data_quality_check`
- `anti_hallucination_field_check`
- `follow_up_drilldown`
- `recommendation_request`

设计原则：

- 字段缺失 / 反胡编问题优先进入 `validate_fields`。
- 包含“刚才 / 上一轮 / 继续看 / 基于上”的问题进入 follow-up，并尝试读取上一轮 memory summary。
- 普通旧问题如果不命中业务分类，继续走原有 SQL 工具链。

## 5. Analysis Plan

每个业务问题都会生成结构化计划：

- `question_type`
- `required_fields`
- `optional_fields`
- `metrics`
- `dimensions`
- `business_tools_to_call`
- `expected_evidence`
- `report_sections`
- `missing_field_strategy`

复杂问题至少编排 3 个业务工具：

- 经营健康度：KPI、维度对比、退款风险、折扣风险、履约风险、数据质量、风险排序、建议。
- 风险排查：字段校验、退款风险、折扣风险、利润质量、数据质量、风险排序、候选原因、建议。
- 增长机会：KPI、维度对比、机会识别、建议。

## 6. Registered / Wrapped Business Tools

M6.5 已包装并注册为 LangChain `StructuredTool`：

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

所有 wrapper：

- 使用 M6.4 typed input / output。
- 输出转换为现有 Agent `ToolResult`。
- tool output 只作为 backend evidence，不进入 `business_report` 的技术字段。
- 不注册 Multi-Agent，不引入 LangGraph / RAG。

## 7. Multi-evidence Orchestration

业务编排流程：

```text
question classification
  -> inspect_schema
  -> analysis plan
  -> validate_fields / map_business_terms
  -> multiple business tools
  -> risk / opportunity / recommendation aggregation
  -> business_report
  -> compact memory summary
```

关键策略：

- 复杂问题不再只跑一条 SQL。
- `anti_hallucination_field_check` 快速返回缺字段、不能得出的结论和替代分析。
- follow-up 使用上一轮 `business_memory_summary` 的关注维度、风险对象和证据摘要。
- 旧 Text-to-SQL 路径保留，避免破坏现有基础问题。

## 8. Business Report Output

新增 `run.business_report`：

```json
{
  "executive_summary": "...",
  "key_findings": [],
  "evidence_summary": [],
  "risk_priorities": [],
  "opportunities": [],
  "recommendations": [],
  "next_questions": [],
  "limitations": []
}
```

`business_report` 不包含：

- `sql`
- `tool_calls`
- `trace`
- `provider`
- `run_id`
- `memory`
- raw provider metadata

兼容策略：

- `answer` 由 `business_report` 渲染成自然语言，供现有前端继续展示。
- `trace` 和 `tool_calls` 仍保留技术细节，默认折叠由现有前端控制。
- `sql` 字段保留；业务编排路径默认不依赖生成 SQL。

## 9. Memory Read / Write Enhancement

新增 compact memory summary：

- `current_table`
- `question_type`
- `focus_dimensions`
- `key_findings`
- `risk_priorities`
- `recommendations`
- `evidence_summary`

约束：

- 只存摘要，不存大 JSON。
- 不存 API Key。
- 不存私人学习 / 面试 / 简历内容。
- 不默认展示 memory 原文。

follow-up 支持：

- 基于刚才高风险地区继续看品类。
- 基于上一轮建议继续生成整改计划。
- 复用上一轮关注维度和风险对象。

## 10. Anti-hallucination Field Handling

已覆盖：

- 缺 `ad_spend` / `campaign_cost` 时不计算 ROI。
- 缺 `membership_level` 时不按会员等级分析。
- 缺 `neighborhood` / `address` / `latitude` / `longitude` 时不分析小区、门店或经纬度。
- 缺 `campaign_creative` 时不比较广告创意。
- 缺客服工单文本时不总结投诉原文。

输出要求：

- 明确缺哪些字段。
- 明确不能直接得出哪些结论。
- 给替代分析方案。
- 不编造字段。

## 11. Boundary Confirmation

- 未改前端 UI。
- 未改 Astryx UI。
- 未做 M6.6 前端适配。
- 未做 M6.7 正式 25 题评分。
- 未做真实 Doubao Render 压测。
- 未做 Multi-Agent / LangGraph / RAG。
- 未打 tag。

## 12. Test Results

Backend import:

```bash
python -c "from backend.main import app; print('backend import OK')"
```

Result: PASS.

M6.5 tests:

```bash
python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q
```

Result: PASS, `13 passed`.

M6.4 tools tests:

```bash
python -m pytest tests/test_m6_business_analysis_tools.py -q
```

Result: PASS, `17 passed`.

M6.3 semantic tests:

```bash
python -m pytest tests/test_m6_business_semantic_layer.py -q
```

Result: PASS, `9 passed`.

M6.2 dataset tests:

```bash
python -m pytest tests/test_m6_demo_business_dataset.py -q
```

Result: PASS, `2 passed`.

Existing LangChain Single Agent regression:

```bash
python -m pytest tests/unit/test_agent_langchain_single_agent.py -q
```

Result: PASS, `10 passed`.

## 13. Safety Search Result

Safety search result: PASS, no real credential, `.env`, private learning material, job/interview material, resume/package content, or personal contact data was added by M6.5.

## 14. Remaining Risks

- M6.5 后端已返回 `business_report`，但前端尚未做专门展示；M6.6 才处理前端适配。
- 当前编排以 deterministic rules 为主，真实 provider 可在 M6.7 做正式压力测试和语气校准。
- 业务工具仍以 50k demo 数据的 Pandas 聚合为主，真实大表后续可进一步 SQL 下推和缓存。
- 25 题综合评分尚未实现；M6.7 再执行正式压力测试。

## 15. Next Stage Recommendation

建议等待用户审查 M6.5。审查通过后，下一阶段才进入 M6.6 Business Report frontend adaptation。
