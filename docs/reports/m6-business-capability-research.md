# M6 Business Capability Research

> Date: 2026-07-06
> Scope: research and architecture input only. No frontend, backend, dataset generation, tag, or merge work.

## 1. Research Method

本轮使用公开网页调研，并按三类来源交叉验证：

- JD / role sources: 观察高级数据分析师、Business Intelligence Engineer、Business Analyst、数据分析、经营分析岗位对 SQL、指标、业务问题、stakeholder、报告、实验、自动化的要求。
- Industry sources: 观察 Business Analytics、BI、Data Storytelling、KPI framework、Root Cause Analysis、Funnel / Cohort / Retention / A/B Testing 等方法论如何定义分析闭环。
- Open-source product sources: 观察 Text-to-SQL / AI BI Agent 产品的能力边界，识别它们擅长的 SQL 问答，以及 EAI M6 需要补足的业务判断、证据链和报告层。

原则：

- 只记录标题、链接、核心观点和对 M6 的影响，不复制长原文。
- Amazon / Alibaba 类来源优先使用官方页面；公开官方 JD 缺失时明确说明。
- 第三方招聘页只作为低权重辅助，不作为唯一设计依据。

## 2. JD Sources

| Source | Link | Core point | M6 architecture impact |
| --- | --- | --- | --- |
| Amazon Jobs - Business Intelligence Engineer roles | https://www.amazon.jobs/en/search?base_query=Business+Intelligence+Engineer | Amazon BIE 岗位普遍强调 SQL、数据建模、dashboard、metrics、automation、stakeholder-facing insights。 | M6 不能停在自然语言转 SQL，需要有指标层、维度对比、可解释证据和业务汇报。 |
| Amazon Jobs - Business Analyst roles | https://www.amazon.jobs/en/search?base_query=Business+Analyst | Amazon BA 岗位强调业务问题拆解、运营指标、reporting、过程改进和与业务团队协作。 | Question Understanding Layer 必须先判断用户是在做复盘、诊断、风险排查还是增长机会识别。 |
| Amazon Jobs - Data Analyst roles | https://www.amazon.jobs/en/search?base_query=Data+Analyst | Amazon 数据分析岗位通常要求 SQL / Excel / BI 工具、数据质量、异常发现、行动建议。 | Business Report Layer 应输出结论、证据、风险和下一步动作，而不是 SQL 日志。 |
| Alibaba Campus - 数据分析 / 数据技术公开岗位入口 | https://campus-talent.alibaba.com/ | 阿里公开校招入口可检索数据分析、数据技术、数据产品相关岗位，强调数据驱动业务、指标分析、业务协作。 | M6 字段语义、指标体系、经营诊断模板应成为一等能力。 |
| Alibaba Careers / Talent public search | https://talent.alibaba.com/ | 本轮未找到稳定可公开访问的阿里社招商业分析师 JD 页面；仅使用官方人才站作为检索入口。 | 文档中不编造阿里商业分析师 JD；对 Alibaba 只采用“数据分析 / 数据技术 / 业务数据化”低风险归纳。 |
| ByteDance Jobs - Data Analyst public search | https://jobs.bytedance.com/en/position?keywords=data%20analyst | 字节数据分析类岗位通常强调指标体系、经营分析、实验分析、策略评估、跨团队沟通。 | M6 需要支持 A/B Testing、渠道效果、增长机会、问题归因等分析模板。 |
| Meituan Jobs - 数据分析 public search | https://zhaopin.meituan.com/ | 美团数据分析岗位公开信息常见要求包括业务监控、指标建设、专题分析、策略落地。 | M6 的 Agent 应能把“经营健康度”拆成多个指标，并将建议转为业务动作。 |
| Tencent Careers - data analysis public search | https://careers.tencent.com/ | 腾讯公开岗位入口可检索数据分析相关岗位；本轮未找到稳定可引用的具体商业分析 JD。 | 对腾讯不做强引用，只作为“大厂数据岗位普遍重视 SQL + 指标 + 业务解释”的辅助背景。 |

## 3. Industry Sources

| Source | Link | Core point | M6 architecture impact |
| --- | --- | --- | --- |
| IBM - Business Analytics | https://www.ibm.com/topics/business-analytics | Business Analytics 通常覆盖 descriptive、diagnostic、predictive、prescriptive 方向，目标是支持决策。 | M6 默认报告应包含“发生了什么、为什么可能发生、下一步做什么”。 |
| Microsoft Power BI - Decomposition tree visual | https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-decomposition-tree | Decomposition Tree 用 AI / drill-down 帮助按维度拆解指标贡献。 | M6 需要 compare_by_dimension、top_bottom_analysis、root_cause_hypothesis。 |
| Tableau - Data storytelling | https://www.tableau.com/learn/articles/data-storytelling | Data storytelling 强调用数据、叙事和可视表达支持受众理解。 | Business Report Layer 要面向业务人员，先结论后证据，避免技术流水账。 |
| Amplitude - Funnel analysis | https://amplitude.com/blog/funnel-analysis | Funnel analysis 关注用户在路径中的转化和流失位置。 | 当 demo 数据包含渠道或行为阶段时，M6 应能扩展 funnel template；当前销售 demo 先支持渠道表现和转化代理指标。 |
| Amplitude - Cohort analysis | https://amplitude.com/blog/cohort-analysis | Cohort analysis 用分组方式比较用户随时间的表现差异。 | M6 客户画像和复购/留存类问题要具备 cohort-ready 设计，即使 M6.1 只写规划。 |
| Mixpanel - Retention analysis | https://mixpanel.com/blog/retention-analysis/ | Retention analysis 关注用户是否持续回访或复购。 | demo 数据可为后续 retention 预留 customer_id、order_date、customer_segment。 |
| Optimizely - A/B testing | https://www.optimizely.com/optimization-glossary/ab-testing/ | A/B Testing 通过对照实验比较方案效果。 | M6 文档应把实验分析列为能力边界，但 demo 数据不硬造实验结论。 |
| Kyligence - Metrics layer / semantic layer | https://kyligence.io/blog/what-is-a-metrics-layer/ | Metrics layer 将指标定义和口径集中管理，避免每次分析重复解释。 | Business Semantic Layer 必须存字段字典、指标公式、阈值和分析模板。 |
| dbt - Semantic Layer concepts | https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl | Semantic Layer 将业务指标和维度统一定义，供不同消费端复用。 | EAI M6 不一定引入 dbt，但需要类似“业务语义层”的本地实现思路。 |

## 4. Open-source Product Sources

| Source | Link | Core point | M6 architecture impact |
| --- | --- | --- | --- |
| WrenAI GitHub | https://github.com/Canner/WrenAI | WrenAI 聚焦 Text-to-SQL、语义建模和 AI data assistant。 | 证明 semantic modeling 对数据库问答很关键；EAI M6 需要本地字段语义和指标层。 |
| Dataherald GitHub | https://github.com/Dataherald/dataherald | Dataherald 是自然语言到 SQL 的开源框架，重视 database connection、prompting、schema context。 | 说明 Text-to-SQL 生态成熟，但 M6 要在 SQL 之后补足风险判断和行动建议。 |
| Vanna documentation | https://vanna.ai/docs/ | Vanna 通过训练 schema / documentation / SQL 示例提升数据库问答效果。 | EAI 可借鉴“越用越懂业务口径”的 Business Memory，但不在 M6.1 实装。 |
| Vanna GitHub | https://github.com/vanna-ai/vanna | Vanna 开源项目强调 RAG-assisted SQL generation。 | M6 明确不做 RAG；只保留字段别名、指标偏好等轻量 memory。 |
| SQLCoder GitHub | https://github.com/defog-ai/sqlcoder | SQLCoder 聚焦自然语言到 SQL 模型能力。 | SQL 模型不是完整业务分析师；EAI M6 应把 SQL 作为 evidence tool，而不是最终产品。 |
| Chat with CSV / DB product pattern | Multiple product docs and examples | 同类产品常见能力是上传表格后聊天、生成 SQL、生成图表。 | M6 差异点应是 Business Analyst Agent: 问题理解、指标拆解、多证据查询、风险判断、建议。 |

## 5. Capability Synthesis

高级数据分析师 / 商业分析师能力可综合为十类：

1. 业务问题理解：先判断问题类型，再决定分析路径。
2. 指标拆解：把复杂问题拆为指标、维度、对象、时间、优先级。
3. 业务语义理解：知道字段代表的业务动作和结果。
4. 指标体系：统一口径计算销售额、订单量、客单价、退款率、毛利率、投诉率等。
5. 证据收集：复杂问题需要多次聚合、分组、趋势和异常检查。
6. 业务判断：判断好坏、风险、机会，而不是只输出数字。
7. 根因分析：沿价格、折扣、品类、地区、渠道、履约、质量、服务方向提出候选原因。
8. 行动建议：输出可执行动作、优先级和后续监控指标。
9. 数据限制识别：字段不存在时明确拒绝分析该维度，并给替代路径。
10. 数据故事表达：面向业务人员输出结论、证据、风险和建议。

## 6. Implications for M6 Architecture

对 M6 的直接影响：

- Business Semantic Layer 是必要层，不是装饰层。没有字段字典、指标公式和阈值，Agent 只能“看字段猜含义”。
- Question Understanding Layer 必须先分类问题，避免看到关键词就生成 SQL。
- LangChain Tool Layer 应围绕 business tools，而不是只保留 inspect_schema / generate_sql / execute_sql。
- Business Reasoning Layer 必须分工清楚：DuckDB 计算，规则层判断，LLM 组织语言。
- Business Report Layer 必须默认隐藏 SQL、trace、tool_calls 和 provider metadata，把主输出变成业务报告。
- Memory 只存摘要、字段映射、指标偏好和 evidence 摘要，不存大 JSON 或凭证。
- M6 不应把旧 roadmap 中的 Multi-Agent 作为第一目标；本轮 M6.1 将方向校准为 Business Analyst Agent 规划，后续是否恢复多 Agent 需单独审批。

## 7. Source List

本轮记录来源数量：22。

- Amazon Jobs - Business Intelligence Engineer search: https://www.amazon.jobs/en/search?base_query=Business+Intelligence+Engineer
- Amazon Jobs - Business Analyst search: https://www.amazon.jobs/en/search?base_query=Business+Analyst
- Amazon Jobs - Data Analyst search: https://www.amazon.jobs/en/search?base_query=Data+Analyst
- Alibaba Campus Talent: https://campus-talent.alibaba.com/
- Alibaba Talent: https://talent.alibaba.com/
- ByteDance Jobs: https://jobs.bytedance.com/
- Meituan Jobs: https://zhaopin.meituan.com/
- Tencent Careers: https://careers.tencent.com/
- IBM Business Analytics: https://www.ibm.com/topics/business-analytics
- Microsoft Power BI Decomposition Tree: https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-decomposition-tree
- Tableau Data Storytelling: https://www.tableau.com/learn/articles/data-storytelling
- Amplitude Funnel Analysis: https://amplitude.com/blog/funnel-analysis
- Amplitude Cohort Analysis: https://amplitude.com/blog/cohort-analysis
- Mixpanel Retention Analysis: https://mixpanel.com/blog/retention-analysis/
- Optimizely A/B Testing: https://www.optimizely.com/optimization-glossary/ab-testing/
- Kyligence Metrics Layer: https://kyligence.io/blog/what-is-a-metrics-layer/
- dbt Semantic Layer: https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl
- WrenAI GitHub: https://github.com/Canner/WrenAI
- Dataherald GitHub: https://github.com/Dataherald/dataherald
- Vanna Docs: https://vanna.ai/docs/
- Vanna GitHub: https://github.com/vanna-ai/vanna
- SQLCoder GitHub: https://github.com/defog-ai/sqlcoder
