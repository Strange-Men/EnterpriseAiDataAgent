# M6 Business Semantic Layer

> Date: 2026-07-06
> Stage: M6.3 Business Semantic Layer

## 1. Stage Scope

本轮严格是 M6.3：Business Semantic Layer。

已完成：

- 新增 backend 业务语义层目录。
- 定义 M6.2 demo dataset 28 个字段的字段字典。
- 定义中文业务术语到字段 / 指标的映射。
- 定义核心业务指标公式、必需字段、聚合层级和缺字段兜底。
- 定义默认业务阈值。
- 定义动态分位数阈值规则和 helper。
- 定义字段缺失兜底规则。
- 定义 12 类分析模板。
- 增加 focused semantic layer 测试。

未进入：

- M6.4 Business Analysis Tools。
- M6.5 LangChain Agent 编排增强。
- M6.6 Business Report 前端适配。
- M6.7 综合能力压力测试。
- M6.8 Final QA。
- 前端 UI / Astryx UI。
- LangChain tool registration。
- Doubao provider 测试。
- Multi-Agent / LangGraph / RAG。
- tag。

## 2. Markdown Basis

本轮已读取并对齐以下文档：

- `docs/reports/m6-business-analyst-agent-architecture.md`
- `docs/reports/m6-business-capability-research.md`
- `docs/reports/m6-demo-dataset-redesign-spec.md`
- `docs/reports/m6-pressure-test-plan.md`
- `docs/reports/m6-demo-business-dataset-redesign.md`
- `docs/reports/m6-demo-sales-business-schema-manifest.json`
- `docs/reports/m6-demo-sales-business-profile-summary.md`

## 3. New File Paths

| Artifact | Path |
| --- | --- |
| Semantic package | `backend/semantic/` |
| Field dictionary | `backend/semantic/business_fields.py` |
| Metric definitions | `backend/semantic/business_metrics.py` |
| Threshold rules | `backend/semantic/business_thresholds.py` |
| Dynamic threshold helper | `backend/semantic/dynamic_thresholds.py` |
| Analysis templates | `backend/semantic/business_templates.py` |
| Field validation and fallback | `backend/semantic/field_validation.py` |
| Test | `tests/test_m6_business_semantic_layer.py` |
| Report | `docs/reports/m6-business-semantic-layer.md` |

目录选择说明：语义层属于 backend 内部能力，但本轮不接入 Agent runtime / tools / routes，因此放在 `backend/semantic/`，与 `backend/agent/` 和 `backend/services/` 保持边界。

## 4. Field Dictionary Coverage

字段字典覆盖 M6.2 demo dataset 全部 28 个字段：

- `order_id`
- `order_date`
- `ship_date`
- `shipping_days`
- `region`
- `province`
- `city`
- `city_level`
- `customer_id`
- `customer_segment`
- `customer_age`
- `customer_gender`
- `ad_channel`
- `category`
- `subcategory`
- `product`
- `sales_amount`
- `quantity`
- `unit_price`
- `discount`
- `cost_amount`
- `profit_amount`
- `refund_amount`
- `is_returned`
- `return_reason`
- `satisfaction_score`
- `complaint_count`
- `payment_method`

每个字段包含：

- field name
- business meaning
- type
- semantic category
- whether required for core analysis
- common aliases
- example values
- data quality rules

## 5. Business Term Mapping

已定义中文业务术语映射：

| Term | Fields | Metric |
| --- | --- | --- |
| 销售额 | `sales_amount` | `total_sales` |
| 订单数 | `order_id` | `order_count` |
| 客单价 | `sales_amount`, `order_id` | `avg_order_value` |
| 退款金额 | `refund_amount` | `refund_amount` |
| 退款率 | `refund_amount`, `sales_amount` | `refund_rate` |
| 退货率 | `is_returned`, `order_id` | `return_rate` |
| 毛利率 | `profit_amount`, `sales_amount` | `gross_margin_rate` |
| 折扣 | `discount` | `avg_discount` |
| 发货周期 | `shipping_days` | `avg_shipping_days` |
| 满意度 | `satisfaction_score` | `avg_satisfaction_score` |
| 投诉 | `complaint_count`, `order_id` | `complaint_rate` |
| 渠道 | `ad_channel` | N/A |
| 地区 | `region`, `province`, `city` | N/A |
| 城市等级 | `city_level` | N/A |
| 品类 | `category`, `subcategory` | N/A |
| 商品 | `product` | N/A |
| 客户分层 | `customer_segment` | N/A |

不存在的业务词不会强行映射。

## 6. Metric Definitions

已定义指标：

- `total_sales`
- `order_count`
- `avg_order_value`
- `refund_amount`
- `refund_rate`
- `return_rate`
- `gross_margin_rate`
- `avg_discount`
- `avg_shipping_days`
- `complaint_rate`
- `avg_satisfaction_score`
- `sales_contribution`
- `profit_contribution`

每个指标包含：

- metric name
- business meaning
- formula
- required fields
- fallback behavior when fields missing
- aggregation level
- display format

## 7. Default Thresholds

| Rule | Label |
| --- | --- |
| `refund_rate > 0.10` | 高退款风险 |
| `avg_discount > 0.35` | 高折扣依赖 |
| `gross_margin_rate < 0.10` | 利润风险 |
| `avg_shipping_days > 7.0` | 发货效率风险 |
| `satisfaction_score < 3.5` | 客户体验风险 |

这些是默认阈值，不是唯一判断标准。M6.4 之后的业务判断应结合动态阈值和多指标证据。

## 8. Dynamic Threshold Strategy

本轮实现简单分位数 helper：

| Metric | Quantile | Direction | Label |
| --- | ---: | --- | --- |
| `refund_rate` | P90 | top | 相对高退款风险 |
| `gross_margin_rate` | P10 | bottom | 相对低利润风险 |
| `avg_discount` | P90 | top | 相对高折扣依赖 |
| `shipping_days` | P90 | top | 相对发货慢 |
| `satisfaction_score` | P10 | bottom | 相对体验风险 |

`backend/semantic/dynamic_thresholds.py` 支持：

- `quantile(values, q)`
- `calculate_dynamic_thresholds(metric_values)`

本轮未接入 Agent 编排，也未生成业务 tool。

## 9. Missing Field Fallback Rules

已定义兜底：

- 缺 `profit_amount` / `cost_amount`：不能计算毛利率，可替代看销售额、退款率和平均折扣。
- 缺 `ad_channel`：不能分析渠道效果，可替代看地区 / 品类。
- 缺 `satisfaction_score`：不能判断满意度，可替代看投诉率和退款率。
- 缺 `customer_age`：不能做人群年龄画像，可替代看客户分层或城市等级。
- 缺 `membership_level`：不能按会员等级分析，可替代用 `customer_id` + `order_date` 粗略看复购频次。
- 缺 `ad_spend` / `campaign_cost`：不能计算 ROI，可替代看渠道销售额、退款率和满意度。
- 缺 `address` / `neighborhood` / `latitude` / `longitude`：不能分析小区、门店或经纬度，可替代看地区层级。

## 10. Analysis Templates

已定义 12 类模板：

- 经营健康度评估
- 业务复盘总结
- 风险排查
- 增长机会识别
- 地区表现分析
- 商品 / 品类分析
- 客户画像分析
- 广告渠道分析
- 时间趋势分析
- 发货效率分析
- 数据质量检查
- 反胡编字段检查

每个模板包含：

- question type
- trigger keywords
- required fields
- optional fields
- metrics
- suggested dimensions
- expected evidence
- report sections
- missing field fallback

默认用户输出结构：

- `one_sentence_judgment`
- `core_findings`
- `key_data_evidence`
- `risk_priority`
- `business_recommendations`
- `suggested_follow_up_questions`

默认隐藏：

- `sql`
- `tool_calls`
- `trace`
- `provider`
- `run_id`
- `memory`
- `raw_json`
- `fallback_reason`

## 11. Test Results

Backend import:

```bash
python -c "from backend.main import app; print('backend import OK')"
```

Result: PASS.

Semantic layer tests:

```bash
python -m pytest tests/test_m6_business_semantic_layer.py -q
```

Result: PASS, `9 passed`.

Demo dataset tests:

```bash
python -m pytest tests/test_m6_demo_business_dataset.py -q
```

Result: PASS, `2 passed`.

## 12. Safety Search Result

Safety search command:

```bash
findstr /s /i /n "sk- api_key API_KEY secret SECRET bearer Bearer authorization Authorization 面试 简历 包装 手撕 复习 个人学习 mystudy .agents 手机号 电话 身份证 邮箱" backend tests docs CURRENT_SESSION.md
```

Result: PASS for M6.3 new changes. The command reports existing auth-related source references in older backend/tests, but no real credential, `.env`, private learning material, job/interview material, or personal contact data was added by this stage.

## 13. Remaining Risks

- 语义层目前是静态配置和 helper，尚未接入 LangChain tools；这是 M6.3 边界内的设计结果。
- 动态阈值当前只支持简单分位数，尚未加入 z-score / IQR。
- 缺字段兜底尚未进入用户回答链路，需要 M6.4 / M6.5 才能在 Agent 输出中生效。
- 指标公式尚未由统一 SQL builder 执行，M6.4 需要把这些口径转成可复用工具。

## 14. Next Stage Recommendation

建议等待用户审查 M6.3。审查通过后，下一阶段才进入 M6.4 Business Analysis Tools。
