# M6 Demo Dataset Redesign Spec

> Date: 2026-07-06
> Scope: planning only. This document does not generate demoExcel, CSV, XLSX, or code.

## 1. Dataset Goal

M6 需要一个企业经营销售数据集，用来验证 Business Analyst Agent 是否具备“像数据分析师一样工作”的能力。

目标：

- 覆盖经营健康度、复盘总结、风险排查、增长机会、地区 / 商品 / 渠道 / 客户分析、发货效率、数据质量、反胡编、多轮追问等压力测试。
- 数据要有真实业务规律，但不能把答案写死到 Agent。
- 字段要足够完整，使 Agent 能计算核心指标并识别字段缺失边界。
- M6.2 实装时使用 faker + 条件逻辑生成，不手搓 50k 行。

## 2. File Names

建议文件：

- `demo_sales_business_50k.csv`
- `demo_sales_business_50k.xlsx`

建议位置：

- `testExcel/` 或后续由用户指定的数据样例目录。

本轮不生成文件。

## 3. Field Schema

| Field | Type | Meaning | Generation notes |
| --- | --- | --- | --- |
| `order_id` | string | 订单 ID | 唯一值，例如 `ORD-2026-000001`。 |
| `order_date` | date | 下单日期 | 覆盖 12-18 个月，保留周/月季节性。 |
| `ship_date` | date | 发货日期 | 正常为下单后 0-12 天，少量异常早于下单。 |
| `shipping_days` | int | 发货周期 | `ship_date - order_date`，少量异常可为负数。 |
| `region` | string | 大区 | 华东、华南、华北、华中、西南、西北、东北。 |
| `province` | string | 省份 | 与 region 绑定。 |
| `city` | string | 城市 | 与 province / city_level 绑定。 |
| `city_level` | string | 城市等级 | 一线、新一线、二线、三线、四线及以下。 |
| `customer_id` | string | 客户 ID | 可复购，同一客户多笔订单。 |
| `customer_segment` | string | 客户分层 | 新客、活跃老客、高价值客户、价格敏感客户、沉睡唤醒客户。 |
| `customer_age` | int | 客户年龄 | 18-65，按分层和品类有偏好。 |
| `customer_gender` | string | 客户性别 | female / male / unknown。 |
| `ad_channel` | string | 获客渠道 | 搜索、信息流、直播、达人、自然流量、私域、线下。 |
| `category` | string | 一级品类 | 家电、数码、服饰、美妆、食品、家居、运动。 |
| `subcategory` | string | 二级品类 | 与 category 绑定。 |
| `product` | string | 商品名 | 与 category / subcategory 绑定。 |
| `sales_amount` | decimal | 销售额 | `quantity * unit_price * (1 - discount)` 后加噪声，少量异常小于等于 0。 |
| `quantity` | int | 数量 | 1-8 为主，少量异常小于等于 0。 |
| `unit_price` | decimal | 单价 | 按品类分布。 |
| `discount` | decimal | 折扣率 | 0-0.6 为主，少量异常小于 0 或大于 1。 |
| `cost_amount` | decimal | 成本金额 | 按品类毛利结构生成。 |
| `profit_amount` | decimal | 利润金额 | `sales_amount - cost_amount - refund_amount` 或一致口径。 |
| `refund_amount` | decimal | 退款金额 | 与退货、品类、地区、渠道、满意度相关。 |
| `is_returned` | bool | 是否退货 | 与 refund_amount / return_reason 对齐。 |
| `return_reason` | string | 退货原因 | 质量问题、尺码不合适、物流慢、描述不符、无理由、其他。 |
| `satisfaction_score` | decimal | 满意度 | 1-5，受发货、退款、投诉、渠道影响。 |
| `complaint_count` | int | 投诉次数 | 0 为主，风险订单可为 1-3。 |
| `payment_method` | string | 支付方式 | 支付宝、微信、银行卡、信用支付、企业转账。 |

## 4. Business Patterns

内置隐性业务规律，但不直接给答案：

- 华南销售高，但退款率和投诉率偏高，形成“高收入高风险”。
- 华东销售稳定、毛利较好、退款低，形成“稳健区域”。
- 某些高销量品类存在高折扣依赖，例如服饰或美妆活动款。
- 某些渠道订单多但满意度低，例如直播或信息流的冲动购买退货更高。
- 西北 / 东北部分地区发货慢，带来履约体验风险。
- 年轻客户偏好数码、美妆、运动；高价值客户偏好家电和高客单商品。
- 三四线城市订单多但客单价低，适合测试规模和利润的差异。
- 少数商品利润低但销量高，适合测试“销量不等于健康增长”。
- 部分商品退款原因集中在质量、物流慢或描述不符，适合 root cause hypothesis。

规律控制：

- 不要让单一字段完全决定结论，使用多因素加权。
- 给每个规律加入 10%-30% 噪声，避免 Agent 依赖简单关键词。
- 同一问题至少需要 2-4 类指标才能判断，例如销售额 + 毛利 + 退款 + 满意度。

## 5. Anomaly Patterns

数据质量异常建议比例：

| Anomaly | Suggested ratio | Purpose |
| --- | ---: | --- |
| `sales_amount <= 0` | 0.2%-0.5% | 测试销售额异常识别。 |
| `quantity <= 0` | 0.1%-0.3% | 测试数量异常识别。 |
| `discount < 0 or discount > 1` | 0.2%-0.5% | 测试折扣范围检查。 |
| `ship_date < order_date` | 0.1%-0.3% | 测试日期逻辑异常。 |
| `refund_amount > sales_amount` | 0.1%-0.3% | 测试金额一致性。 |
| missing `satisfaction_score` | 1%-3% | 测试缺失值和替代分析。 |
| missing `ad_channel` | 0.5%-2% | 测试渠道分析边界。 |

## 6. Faker + Conditional Generation Strategy

M6.2 实装建议：

1. 固定随机种子，例如 `seed = 20260706`。
2. 使用 faker 生成基础实体：客户、城市、日期、订单 ID。
3. 使用配置表定义 region / province / city / city_level 权重。
4. 使用品类配置定义单价区间、毛利率区间、折扣倾向和退货倾向。
5. 使用渠道配置定义订单量权重、满意度偏移、退款偏移。
6. 使用客户分层配置定义年龄、客单价、复购和品类偏好。
7. 用条件逻辑叠加业务规律，例如华南 + 直播 + 美妆时退款概率上调，华东 + 自然流量时退款概率下调，折扣高 + 毛利低时利润风险上调。
8. 最后注入少量质量异常，并记录异常比例。

不要：

- 不要人工写 50k 行。
- 不要把“正确答案”写进字段名或隐藏列。
- 不要生成只有一个明显规律的玩具数据。

## 7. Reproducibility

可复现策略：

- 固定 faker seed、numpy / random seed。
- 生成脚本输出 schema manifest，记录字段类型、取值范围、异常比例。
- 生成后自动做 profile，确认行数、列数、缺失率、异常率在预期范围内。
- 同一 seed 下 CSV 和 XLSX 内容一致。
- 允许通过配置调整 seed、行数、异常比例和业务规律强度。

字段类型控制：

- 日期字段输出 ISO date。
- 金额字段保留 2 位小数。
- 率字段保留 4 位或 2 位，具体口径在 manifest 中声明。
- bool 字段统一输出 `true/false` 或 0/1，上传解析后保持一致。

## 8. Coverage Matrix

| Test capability | Required fields | Dataset pattern |
| --- | --- | --- |
| 经营健康度 | sales, orders, profit, refund, discount, shipping, satisfaction, complaint | 多指标综合。 |
| 业务复盘 | order_date, region, category, sales, profit | 月度 / 季度趋势和贡献。 |
| 风险排查 | refund_amount, is_returned, discount, profit, complaint | 高收入高风险、促销依赖。 |
| 增长机会 | region, category, channel, profit, refund | 中等销售 + 高毛利 + 低退款对象。 |
| 地区分析 | region, province, city_level | 区域贡献与风险分层。 |
| 商品 / 品类分析 | category, subcategory, product | 高销量低利润、退款原因集中。 |
| 渠道分析 | ad_channel, satisfaction, refund, sales | 订单多但体验差的渠道。 |
| 客户画像 | customer_id, segment, age, gender, city_level | 客户群体差异。 |
| 发货效率 | ship_date, shipping_days, complaint_count | 履约慢与投诉关系。 |
| 数据质量 | negative values, missing values, impossible dates | 异常识别与替代分析。 |
| 反胡编 | 不含会员等级、广告花费等字段 | Agent 必须拒绝不存在字段。 |
| 多轮追问 | customer_id, region, category, evidence summary | 基于上一轮结果继续缩小范围。 |

## 9. Acceptance Criteria

M6.2 才允许生成数据集。验收标准：

- 生成 50k 行 CSV 和 XLSX。
- 字段完整，类型稳定，上传后 schema/profile 正常。
- 至少覆盖 10 类压力测试。
- 异常比例在设计范围内。
- 隐性业务规律存在但不显眼。
- Agent 不能通过硬编码题目答案通过测试。
- demo 数据生成脚本可复现，并能输出 profile 摘要。

## 10. Risks

- 规律太明显会导致测试失真。
- 规律太弱会导致 Agent 难以稳定发现结论。
- 随机异常比例过高会污染正常分析。
- CSV / XLSX 类型推断不一致可能影响 schema。
- 客户画像字段必须是 faker 生成的合成数据。
- 数据集不要包含真实客户、真实订单、真实联系方式或外部业务凭证。
