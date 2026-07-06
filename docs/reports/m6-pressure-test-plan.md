# M6 Business Capability Pressure Test Plan

> Date: 2026-07-06
> Scope: planning only. No code, no demo dataset generation, no provider smoke execution.

## 1. Test Goals

M6 压力测试不只看 HTTP 200，也不只看 SQL 是否能跑。它验证 Agent 是否具备高级数据分析师型业务能力：

- 能理解问题类型。
- 能识别字段和数据限制。
- 能拆指标、查多类证据、给业务判断。
- 能避免胡编不存在字段。
- 能输出业务人员能读懂的报告。
- 能默认隐藏 SQL、trace、tool_calls、provider metadata。
- 能在可接受时间内返回。

## 2. Scoring Rubric

每题 10 分：

| Dimension | Points |
| --- | ---: |
| 字段识别正确 | 1 |
| 没有胡编字段或口径 | 1 |
| 拆成多个指标 | 1 |
| 调用多个证据查询 | 1 |
| 指标计算合理 | 1 |
| 有业务判断 | 1 |
| 有风险优先级 | 1 |
| 有行动建议 | 1 |
| 普通人能看懂 | 1 |
| 默认隐藏 SQL / trace / tool_calls | 1 |

性能另计：

- 普通问题：5-10 秒内尽量返回。
- 复杂综合题：15-25 秒内尽量返回。
- 超时或 partial 必须说明原因，不能伪装成功。

## 3. Test Categories

- 经营健康度评估
- 业务复盘会总结
- 经营风险排查
- 增长机会识别
- 地区 / 商品 / 渠道 / 客户综合分析
- 发货效率分析
- 数据质量异常分析
- 反胡编字段测试
- 多轮追问 memory 测试
- 性能与折叠展示测试

## 4. Test Questions

| ID | Question | Expected evidence and acceptance |
| --- | --- | --- |
| M6-Q01 | 帮我评估这张表整体经营健康度，先给结论，再说明主要风险和机会。 | 至少计算销售额、订单量、客单价、毛利率、退款率、平均折扣、发货周期、满意度或投诉；输出 3-5 条结论、风险优先级、建议。 |
| M6-Q02 | 如果我要开业务复盘会，这份数据最该讲哪几个重点？ | 需要按时间、地区、品类或渠道拆解；输出复盘议程式结论，不只是排行榜。 |
| M6-Q03 | 哪些地区是高收入但高风险？ | 需要按 region/province 聚合销售额、退款率、投诉率、满意度；识别“销售高 + 风险高”。 |
| M6-Q04 | 哪些地区虽然销售不是最高，但值得加大投入？ | 需要识别销售中等、毛利率高、退款低或满意度高的对象；输出投入理由。 |
| M6-Q05 | 哪些品类存在促销依赖风险？ | 需要计算平均折扣、毛利率、销售额、订单量；判断高折扣 + 低毛利。 |
| M6-Q06 | 哪些商品销量高但利润质量差？ | 需要 product 维度的销量、销售额、毛利率、退款率；输出谨慎推广清单。 |
| M6-Q07 | 帮我找退款风险最高的品类和可能原因。 | 需要 refund_rate、refund_amount、return_reason、channel/region 交叉证据；输出候选根因。 |
| M6-Q08 | 哪些渠道带来了订单，但客户体验可能不好？ | 需要 ad_channel 维度订单量、退款率、满意度、投诉率；输出渠道优化建议。 |
| M6-Q09 | 发货效率有没有拖累客户体验？ | 需要 shipping_days 与 complaint_count / satisfaction_score / refund_rate 的关系；输出慢发货区域或渠道。 |
| M6-Q10 | 三四线城市和一线城市的经营差异是什么？ | 需要 city_level 对比订单量、客单价、毛利率、退款率；输出不同策略。 |
| M6-Q11 | 年轻客户更偏好哪些品类？这些品类健康吗？ | 需要 customer_age 分层、category 偏好、毛利和退款证据；不能只输出偏好。 |
| M6-Q12 | 高价值客户贡献了多少销售额？风险如何？ | 需要 customer_segment 的销售贡献、订单量、毛利率、退款率和满意度。 |
| M6-Q13 | 最近几个月经营趋势是在变好还是变差？ | 需要 order_date 月度趋势，至少看销售、利润、退款、投诉或满意度变化。 |
| M6-Q14 | 哪些指标最需要持续监控？ | 需要从实际数据中选择 KPI，说明监控理由、阈值或动态分位数策略。 |
| M6-Q15 | 这张表有哪些明显的数据质量问题？ | 需要检查负销售额、负数量、折扣越界、发货早于下单、缺失值；输出影响和处理建议。 |
| M6-Q16 | 帮我输出一份面向老板的经营简报。 | 需要业务语言、先结论、关键数据、风险、建议；默认隐藏技术细节。 |
| M6-Q17 | 找出最适合下季度重点投入的 3 个对象，可以是地区、品类或渠道。 | 需要跨维度比较机会；必须给选择依据和风险提醒。 |
| M6-Q18 | 如果只能先处理一个风险，你建议处理什么？ | 需要风险优先级评分，考虑影响范围、金额、退款、满意度或投诉。 |
| M6-Q19 | 哪些退款原因最集中？应该先排查哪类商品？ | 需要 return_reason + product/category 分布；输出排查清单。 |
| M6-Q20 | 帮我比较华南和华东的经营质量。 | 需要区域对比销售、利润、退款、折扣、发货、满意度；输出差异和建议。 |
| M6-Q21 | 我想知道广告花费 ROI，帮我分析。 | 如果没有 ad_spend 或 campaign_cost 字段，必须说明不能计算 ROI；可替代分析渠道销售、退款、满意度。 |
| M6-Q22 | 按会员等级分析复购率。 | 如果没有 membership_level 或明确复购字段，必须拒绝该维度；可用 customer_id + order_date 粗略分析复购频次。 |
| M6-Q23 | 用户来自哪些小区？ | 如果没有地址或小区字段，必须说明不能分析；不能编造城市以下位置。 |
| M6-Q24 | 刚才说的高风险地区里，继续看具体品类原因。 | 需要读取上一轮关注地区和风险结论，继续 drill-down；不能从头泛泛分析。 |
| M6-Q25 | 基于上一题，给我一个一周内能执行的整改计划。 | 需要使用上一轮 evidence 摘要，输出负责人视角动作、监控指标和优先级。 |

## 5. Anti-hallucination Tests

必须通过：

- 不存在 `ad_spend` 时不能计算 ROI。
- 不存在 `membership_level` 时不能按会员等级画像。
- 不存在地理细粒度时不能输出小区、门店或经纬度。
- 不存在广告 campaign 时不能比较 campaign creative。
- 不存在客服工单文本时不能总结具体投诉原文。
- 不存在成本字段时不能计算毛利率；若存在 `cost_amount` / `profit_amount` 才可计算。
- 不存在客户真实身份字段时不能描述真实个人画像。

合格输出：

- 明确说明缺少哪些字段。
- 说明不能得出哪些结论。
- 给替代分析方案，例如用渠道销售、退款率和满意度代替 ROI 的初步质量评估。

## 6. Memory Follow-up Tests

| ID | Follow-up | Expected behavior |
| --- | --- | --- |
| M6-M01 | 基于刚才的高风险地区，继续看品类。 | 使用 Session Memory 中的上次地区，不要求用户重复。 |
| M6-M02 | 把刚才的建议改成给运营经理看的版本。 | 使用 Evidence Memory 摘要，不重新胡编证据。 |
| M6-M03 | 上次说的渠道风险，哪个最该先处理？ | 使用上一轮关注维度和风险评分。 |
| M6-M04 | 换成看华东，不看华南。 | 更新当前关注对象，保留同一分析口径。 |
| M6-M05 | 这个表里满意度字段叫什么？ | 从 Business Memory / schema 映射回答，不能暴露内部 memory JSON。 |

Memory 验收：

- 只存摘要、字段映射、关注维度和关键证据。
- 不存大 JSON。
- 不保存模型凭证或私人资料。
- 不默认展示 memory 内容。

## 7. Performance Tests

| Test | Target |
| --- | --- |
| Schema / profile cached ordinary question | 5-10 秒内尽量返回。 |
| Single dimension risk question | 5-10 秒内尽量返回。 |
| Overall business health question | 15-25 秒内尽量返回。 |
| Multi-dimension opportunity question | 15-25 秒内尽量返回。 |
| Anti-hallucination missing field question | 5-10 秒内返回字段缺失说明。 |
| Follow-up question with memory | 5-10 秒内返回，避免重复完整 profile。 |

性能策略：

- schema/profile 缓存。
- Business Semantic Layer 缓存。
- 常见 KPI 使用 deterministic SQL。
- 多指标查询尽量少走 LLM。
- LLM 只看压缩 evidence。
- evidence 限制 Top 5 / Top 10。
- memory 只存摘要。
- tool trace 不进入主输出。
- demo 数据常用聚合可预计算或缓存。

## 8. Acceptance Criteria

M6.7 综合验收建议：

- 25 个测试问题中至少 20 个达到 8 分及以上。
- 反胡编测试 100% 不编造不存在字段。
- 至少 5 个复杂题能调用 3 个以上业务工具或多证据查询。
- 默认报告包含一句话总判断、核心结论、关键数据依据、风险优先级、建议、可继续追问方向。
- 默认不展示 SQL / trace / tool_calls / provider / run_id / memory / raw JSON。
- 普通问题大多数在 10 秒内返回。
- 复杂题大多数在 25 秒内返回。
- Doubao 真实 provider 和 Mock fallback 都要测；fallback 必须明确标记模拟或降级，不伪装。
