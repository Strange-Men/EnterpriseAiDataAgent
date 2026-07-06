# M6 Business Analyst Agent Architecture

> Date: 2026-07-06
> Scope: M6.1 architecture planning only. No frontend implementation, backend implementation, demoExcel generation, tag, or master merge.

## 1. Background

M5 已经把 EnterpriseAiDataAgent 推进到可运行的单页数据分析工作台：

- 单页数据分析工作台。
- 左侧 Sidebar 删除。
- 五分页导航删除。
- Astryx dark UI。
- 真实 Doubao provider 可用。
- SQL / trace / tool_calls 默认折叠。
- Agent 主链路可跑。

但当前 Agent 仍偏向：

```text
自然语言 -> API / SQL -> 查询结果
```

M6 的目标是升级为：

```text
高级数据分析师型 Business Analyst Agent
```

一句话目标：

```text
让非技术人员上传表格后，Agent 能像数据分析师一样完成：
理解问题 -> 拆指标 -> 查证据 -> 判风险 -> 找机会 -> 给建议 -> 支持追问。
```

注意：历史 M5/M6 roadmap 曾把 M6 定义为 Multi-Agent Expansion。本轮按用户目标进行 M6 方向校准：M6.1 只固化 Business Analyst Agent 架构，不启动多 Agent、LangGraph、RAG 或任何代码实现。后续如果要恢复 Multi-Agent Expansion，必须另行审批。

## 2. Research Summary

详细调研见：

- `docs/reports/m6-business-capability-research.md`

调研结论：

- Amazon BIE / Business Analyst / Data Analyst 岗位强调 SQL、指标、自动化、业务洞察、stakeholder reporting。
- 阿里公开来源能验证数据分析 / 数据技术 / 业务数据化方向；未找到稳定可公开引用的阿里社招商业分析师 JD，因此不编造。
- 字节、美团等公开岗位信息支持同一结论：数据分析师需要指标体系、经营分析、实验评估和业务落地能力。
- IBM、Power BI、Tableau、Amplitude、Mixpanel、Optimizely、dbt / metrics layer 资料说明成熟分析闭环必须包含描述、诊断、指标、归因、实验、故事表达和决策建议。
- WrenAI、Dataherald、Vanna、SQLCoder 等开源产品证明 Text-to-SQL / semantic context 很重要，但也暴露其边界：SQL 不是业务判断，数据库聊天不是完整经营分析。

对 M6 的影响：

- 需要 Business Semantic Layer。
- 需要 Question Understanding Layer。
- 需要 business tools，而不是只保留 SQL tools。
- 需要 Business Reasoning Layer 固化计算和判断分工。
- 需要 Business Report Layer 面向业务人员输出。
- 需要 Memory 支持追问，但不暴露技术细节。

## 3. What Business Capability Means

高级数据分析师型 Agent 不是“会写 SQL 的聊天框”，而是一个具备业务分析闭环的执行者：

```text
理解业务问题
  -> 拆解指标和维度
  -> 验证字段和口径
  -> 调用多个工具收集证据
  -> 计算和比较指标
  -> 判断风险、机会和优先级
  -> 提出可能根因
  -> 输出可执行建议
  -> 支持基于证据的多轮追问
```

## 4. Senior / Advanced Data Analyst Capability Model

M6 至少包含十项能力：

| Capability | M6 definition |
| --- | --- |
| 业务问题理解 | 识别经营诊断、风险排查、增长机会、复盘总结、客户画像、渠道效果、数据质量或字段缺失测试，而不是看到关键词就生成 SQL。 |
| 指标拆解能力 | 把复杂问题拆成指标、维度、对象、时间范围、风险和优先级。经营健康度需拆成销售额、订单数、利润、退款、折扣、发货周期、满意度、投诉、异常数据等。 |
| 业务语义理解 | 理解字段背后的业务含义，例如 `refund_amount` 是退款金额，`discount` 是折扣率，`shipping_days` 是发货周期，`satisfaction_score` 是满意度。 |
| 指标体系能力 | 定义和计算销售额、订单量、客单价、退款率、退货率、毛利率、平均折扣、平均发货周期、投诉率、满意度、渠道表现、地区贡献、品类贡献。 |
| 证据收集能力 | 复杂问题不能只跑一条 SQL；经营诊断要查整体 KPI、地区表现、品类表现、退款风险、折扣风险、发货效率和异常数据。 |
| 业务判断能力 | 判断好坏、风险、机会，例如销售高 + 退款高 = 高收入高风险。 |
| 根因分析能力 | 从价格、折扣、品类、地区、渠道、发货、质量、服务等方向提出候选原因。 |
| 行动建议能力 | 说明优先排查哪些地区、哪些商品谨慎推广、哪些渠道优化、哪些指标持续监控、下一步补什么数据。 |
| 数据限制识别能力 | 字段不存在时明确说明不能分析，给替代方案，不能编造客户年龄、城市、广告渠道或满意度。 |
| 数据故事表达能力 | 输出像业务报告，先结论，再证据，再风险，再建议，面向非技术人员。 |

## 5. M6 Product Positioning

M6 不是：

- 继续美化 UI。
- 继续做普通 text-to-SQL。
- 继续堆 API 调用。
- 做 Multi-Agent。
- 做 LangGraph。
- 暴露 tool_calls / trace / memory 给用户。

M6 是：

- Business Analyst Agent。
- 业务分析闭环。
- 语义层 + 指标层 + 工具层 + 推理层 + 报告层。
- 让 Agent 像初级 / 进阶数据分析师。
- 输出给业务人员看的经营分析报告。

边界：

- SQL / DuckDB 是 evidence engine。
- LangChain 是工具编排 harness，不拥有业务结论。
- LLM 负责语言组织、解释和报告表达，不负责凭空猜结论。
- 技术细节默认折叠。

## 6. Architecture Overview

```text
User Question
  -> Question Understanding Layer
  -> Business Semantic Layer
  -> LangChain Tool Layer
  -> Business Reasoning Layer
  -> Evidence Memory
  -> Business Report Layer
  -> Follow-up Context
```

核心分工：

- Business Semantic Layer: 字段、术语、指标、阈值、模板、兜底规则。
- Question Understanding Layer: 判断问题类型、字段需求、工具路径、输出结构。
- LangChain Tool Layer: 调用 schema、profile、metric、risk、root cause、recommendation、report 工具。
- Business Reasoning Layer: 计算与规则判断，限制 LLM 自由发挥。
- Memory Design: 支持多轮追问和业务口径沉淀，但不暴露给用户。
- Business Report Layer: 固定业务报告契约。

## 7. Business Semantic Layer

内容：

- 字段字典。
- 业务术语映射。
- 指标定义。
- 指标公式。
- 风险阈值。
- 动态阈值策略。
- 分析模板。
- 字段缺失兜底规则。

指标示例：

| Metric | Formula |
| --- | --- |
| `refund_rate` | `refund_amount / sales_amount` |
| `return_rate` | `returned_orders / total_orders` |
| `avg_order_value` | `sales_amount / order_count` |
| `gross_margin_rate` | `profit_amount / sales_amount` |
| `avg_discount` | `AVG(discount)` |
| `avg_shipping_days` | `AVG(shipping_days)` |
| `complaint_rate` | `complaint_orders / total_orders` |
| `satisfaction_score` | `AVG(satisfaction_score)` |

默认业务阈值：

| Rule | Meaning |
| --- | --- |
| `refund_rate > 10%` | 高退款风险 |
| `avg_discount > 0.35` | 高折扣依赖 |
| `gross_margin_rate < 10%` | 利润风险 |
| `avg_shipping_days > 7` | 发货效率风险 |
| `satisfaction_score < 3.5` | 客户体验风险 |

数据分布动态阈值：

- top 10% `refund_rate` = 相对高退款风险。
- bottom 10% `gross_margin_rate` = 相对低利润风险。
- top 10% `avg_discount` = 相对高折扣依赖。
- top 10% `shipping_days` = 相对发货慢。
- z-score / IQR 可作为异常检测候选。

策略：

- 固定阈值适合 demo 和默认业务规则。
- 动态阈值适合不同行业、不同数据集。
- M6.3 实装时优先支持简单分位数策略，例如 P90 / P10。

字段缺失兜底：

- 缺 `profit_amount` / `cost_amount`：不能计算毛利率，可替代看销售、退款和折扣。
- 缺 `ad_channel`：不能分析渠道效果，可替代看地区 / 品类。
- 缺 `satisfaction_score`：不能判断满意度，可替代看投诉和退款。
- 缺 `customer_age`：不能做人群年龄画像，可替代看客户分层或城市等级。

## 8. Question Understanding Layer

| Type | Trigger examples | Required fields | Metrics | Tools | Output |
| --- | --- | --- | --- | --- | --- |
| 经营健康度评估 | 健康度、整体经营、怎么样 | sales, orders, profit/refund/discount/shipping/satisfaction | KPI suite | compute_overall_kpis, compare_by_dimension, risk_priority_scoring | 总判断、核心结论、风险、建议 |
| 业务复盘总结 | 复盘、汇报、简报、老板 | order_date, region/category/channel | trend, contribution | trend_analysis, top_bottom_analysis, business_report_builder | 复盘结构化摘要 |
| 风险排查 | 风险、异常、问题、排查 | refund, discount, profit, complaint | risk metrics | refund_risk_analysis, discount_risk_analysis, data_quality_check | 风险优先级 |
| 增长机会识别 | 机会、增长、加大投入 | sales, profit, refund, dimension | opportunity score | opportunity_finder, compare_by_dimension | 机会清单 |
| 地区表现分析 | 地区、省份、城市 | region/province/city | contribution, risk | compare_by_dimension | 地区表现表 + 建议 |
| 商品 / 品类分析 | 商品、品类、SKU | category/product | sales, margin, refund | top_bottom_analysis, profitability_analysis | 商品策略 |
| 客户画像分析 | 客户、人群、年龄、性别 | customer fields | segment metrics | customer_profile_analysis | 画像与限制 |
| 广告渠道分析 | 渠道、投放、流量 | ad_channel | channel performance | channel_effectiveness_analysis | 渠道质量 |
| 时间趋势分析 | 趋势、最近、同比、环比 | order_date | monthly KPIs | trend_analysis | 趋势判断 |
| 发货效率分析 | 发货、物流、履约 | shipping_days/ship_date | shipping risk | shipping_efficiency_analysis | 履约风险 |
| 数据质量检查 | 数据质量、异常值、缺失 | all schema | quality metrics | data_quality_check | 质量报告 |
| 反胡编字段检查 | ROI、会员等级、小区等不存在字段 | validate target fields | N/A | validate_fields | 缺字段说明 + 替代方案 |

## 9. LangChain Tool Layer

现有工具保留：

| Tool | Input | Output | Purpose | User visible |
| --- | --- | --- | --- | --- |
| `inspect_schema` | table_name | fields, types | 表结构检查 | 折叠技术细节 |
| `profile_table` | table_name | profile summary | 基础 profile | 摘要可见，原始细节折叠 |
| `generate_sql` | goal, schema | readonly SQL | SQL 生成 | 默认隐藏 |
| `execute_readonly_sql` | SQL | rows, row_count, evidence | 查询执行 | 证据摘要可见，SQL 折叠 |
| `summarize_findings` | evidence | finding summary | 发现摘要 | 通过报告层可见 |
| `memory_read` | scope | memory summary | 追问上下文 | 不默认展示 |
| `memory_write` | summary | stored summary | 保存摘要 | 不默认展示 |

M6 建议新增业务工具：

| Tool | Input | Output | Purpose | User visible |
| --- | --- | --- | --- | --- |
| `validate_fields` | requested_fields, schema | valid/missing fields | 反胡编与字段兜底 | 缺字段说明可见 |
| `map_business_terms` | question, schema | term-field mapping | 术语映射 | 摘要可见 |
| `inspect_business_schema` | table_name | semantic schema | 字段业务语义 | 摘要可见 |
| `profile_business_metrics` | table_name, metric_set | metric availability | 指标可计算性 | 摘要可见 |
| `compute_overall_kpis` | table_name, metric_set | KPI values | 整体经营指标 | 可见 |
| `compare_by_dimension` | table_name, dimension, metrics | grouped metrics | 地区/品类/渠道对比 | 可见 |
| `trend_analysis` | table_name, date_field, metrics | time series summary | 趋势分析 | 可见 |
| `top_bottom_analysis` | dimension, metric | top/bottom rows | 排名和贡献 | 可见 |
| `refund_risk_analysis` | dimensions | refund risk evidence | 退款风险 | 可见 |
| `discount_risk_analysis` | dimensions | discount risk evidence | 促销依赖 | 可见 |
| `profitability_analysis` | dimensions | margin evidence | 利润质量 | 可见 |
| `shipping_efficiency_analysis` | dimensions | shipping evidence | 履约效率 | 可见 |
| `customer_profile_analysis` | fields | segment evidence | 客户画像 | 可见 |
| `channel_effectiveness_analysis` | channel field | channel evidence | 渠道质量 | 可见 |
| `data_quality_check` | table_name | anomaly summary | 数据质量 | 可见 |
| `risk_priority_scoring` | risk evidence | scored risks | 风险排序 | 可见 |
| `opportunity_finder` | KPI evidence | opportunities | 增长机会 | 可见 |
| `root_cause_hypothesis` | risk evidence | cause candidates | 根因候选 | 可见，标注“可能” |
| `recommendation_builder` | risks, opportunities | actions | 行动建议 | 可见 |
| `business_report_builder` | evidence, findings | report | 业务报告 | 可见 |

规则：

- 所有 tool_calls 只允许在技术细节里折叠展示，不能默认暴露给用户。
- 每个工具必须有 typed input / output。
- 工具输出必须带 evidence summary。
- 高风险结论必须能追溯到指标证据。

## 10. Business Reasoning Layer

分工：

- SQL / DuckDB 负责计算。
- 规则层负责判断。
- LLM 负责组织业务语言和解释。

禁止：

- 让 LLM 随便猜业务结论。
- 让 LLM 直接发明字段。
- 没有证据就输出确定性判断。

业务规则示例：

| Rule | Interpretation |
| --- | --- |
| refund_rate 高 + sales_amount 高 | 高收入高风险 |
| sales_amount 中等 + gross_margin_rate 高 + refund_rate 低 | 潜力增长对象 |
| avg_discount 高 + gross_margin_rate 低 | 促销依赖风险 |
| satisfaction_score 低 + complaint_count 高 | 客户体验风险 |
| avg_shipping_days 高 + complaint_count 高 | 履约体验风险 |

根因候选框架：

- 价格：unit_price、客单价、价格段。
- 折扣：discount、促销依赖。
- 品类：category / subcategory / product。
- 地区：region / province / city_level。
- 渠道：ad_channel。
- 发货：shipping_days、ship_date。
- 质量：return_reason、refund_amount。
- 服务：satisfaction_score、complaint_count。

## 11. Memory Design

Memory 不暴露给用户，只用于追问、口径复用和结果恢复。

### Session Memory

存：

- 当前表名。
- 当前字段。
- 当前问题。
- 上一次结果摘要。
- 上一次关注的维度。
- 用户追问上下文。

用于：

- 支持“基于刚才结果继续分析”。
- 支持多轮追问。

### Business Memory

存：

- 字段别名。
- 用户常用指标偏好。
- 业务术语映射。
- 用户关注的维度。
- 表级字段映射。

用于：

- 越用越懂业务口径。

### Evidence Memory

存：

- 本次分析查过哪些指标。
- 关键 Top N 证据。
- 风险判断结果。
- 最终建议摘要。

用于：

- 历史结果恢复。
- 结果追溯。
- 后续追问。

约束：

- 只存摘要，不存大 JSON。
- 不保存模型凭证。
- 不保存私人学习、求职或个人履历内容。
- 内容不默认展示给用户。

## 12. Business Report Output Contract

默认给用户：

1. 一句话总判断。
2. 3-5 条核心结论。
3. 关键数据依据。
4. 风险优先级。
5. 业务建议。
6. 下一步可以继续问什么。

默认隐藏：

- SQL。
- tool_calls。
- trace。
- provider。
- run_id。
- memory。
- raw JSON。
- fallback_reason。

报告要求：

- 面向非技术人员。
- 先结论，后证据。
- 风险和机会分开写。
- 建议必须可执行。
- 数据不足时明确说明限制和替代方案。

## 13. Performance Strategy

目标：

- 普通问题：5-10 秒内尽量返回。
- 复杂综合题：15-25 秒内尽量返回。

策略：

- schema/profile 缓存。
- Business Semantic Layer 缓存。
- 常见指标 deterministic SQL。
- 多指标查询尽量少走 LLM。
- LLM 只看压缩 evidence。
- evidence 限制 Top 5 / Top 10。
- memory 只存摘要。
- tool trace 不进入主输出。
- demo 数据常用聚合可以预计算或缓存。

降级：

- 超时前优先返回 partial report。
- 缺字段先快速返回限制说明。
- provider 不可用时 fallback 必须标注模拟或降级，不伪装真实洞察。

## 14. M6 Development Roadmap

| Stage | Goal | Scope |
| --- | --- | --- |
| M6.1 | 业务能力调研与架构文档 | 输出主文档和 3 个子文档，不写代码。 |
| M6.2 | demoExcel 重做 | 使用 faker + 条件逻辑生成 `demo_sales_business_50k`，验证上传和 schema/profile。 |
| M6.3 | Business Semantic Layer | 字段字典、指标公式、固定阈值、动态分位数阈值、分析模板。 |
| M6.4 | Business Analysis Tools | 新增指标查询、风险判断、建议生成工具。 |
| M6.5 | LangChain Agent 编排增强 | 问题分类、分析计划、多证据查询、business report 输出、memory 读写增强。 |
| M6.6 | Business Report 前端适配 | 单页工作台不变，默认展示业务报告，技术细节默认折叠。 |
| M6.7 | 综合能力压力测试 | 复杂问题、反胡编、速度、Doubao 真实 provider、Mock fallback。 |
| M6.8 | M6 Final QA / Tag Candidate | 全链路回归、报告、CI、是否进入 M6 Final Tag。 |

## 15. Acceptance Criteria

M6.1 文档验收：

- 主文档存在。
- 3 个子文档存在。
- 联网调研来源记录完整。
- 明确定义高级数据分析师业务能力。
- 明确 M6 非目标和业务能力边界。
- 设计 Business Semantic Layer。
- 加入固定阈值和动态分位数阈值。
- 设计 Question Understanding Layer。
- 设计 LangChain Tool Layer。
- 设计 Business Reasoning Layer。
- 设计 Memory。
- 设计 Business Report Output Contract。
- 设计 demoExcel 重做规格。
- 设计压力测试计划。
- 明确性能目标。
- 拆分 M6.1-M6.8。
- 不改前端。
- 不改后端。
- 不生成 demoExcel。
- 不打 tag。
- 不合并 master。

## 16. Non-goals

本轮非目标：

- 不做代码实现。
- 不改前端。
- 不改后端。
- 不生成 CSV / XLSX。
- 不创建 demoExcel。
- 不修改 README。
- 不做 Multi-Agent。
- 不做 LangGraph。
- 不做 RAG。
- 不暴露 tool_calls / trace / memory 给用户。
- 不打 tag。
- 不合并 master。

## 17. Risks

| Risk | Mitigation |
| --- | --- |
| M6 与旧 roadmap 的 Multi-Agent 定位冲突 | 本文明确 M6.1 是 Business Analyst Agent 方向校准；多 Agent 需另行审批。 |
| 指标口径不统一 | Business Semantic Layer 统一指标公式和字段映射。 |
| LLM 胡编字段 | validate_fields、字段缺失兜底和反胡编测试。 |
| 业务判断过度主观 | SQL 计算 + 规则层判断 + evidence 引用。 |
| 报告仍像 SQL 日志 | Business Report Output Contract 固定先结论后证据。 |
| 复杂题速度慢 | 缓存、deterministic SQL、evidence 压缩、Top N 限制。 |
| demo 数据太假 | faker + 条件逻辑 + 噪声 + 隐性规律控制。 |
| Memory 泄露技术细节 | memory 只存摘要，不默认展示。 |
