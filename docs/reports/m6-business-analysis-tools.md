# M6 Business Analysis Tools

> Date: 2026-07-06
> Stage: M6.4 Business Analysis Tools

## 1. Stage Scope

本轮严格是 M6.4：Business Analysis Tools。

已完成：

- 将 M6.3 Business Semantic Layer 合并到 `master`，验证后推送。
- 从最新 `master` 创建 `m6-business-analysis-tools` 分支。
- 新增 backend business tools 目录。
- 实现 typed input / output。
- 实现 deterministic DuckDB read-only load + Pandas aggregation / scoring。
- 实现 KPI、维度对比、趋势、风险、机会、根因候选、建议和数据质量工具。
- 新增 focused tool tests。

未进入：

- M6.5 LangChain Agent 编排增强。
- M6.6 Business Report 前端适配。
- M6.7 综合能力压力测试正式评分。
- M6.8 Final QA。
- LangChain tool registration。
- `/api/agent/runs` 主流程修改。
- 前端 UI / Astryx UI。
- Doubao provider 测试。
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
- `docs/reports/m6-demo-sales-business-schema-manifest.json`
- `docs/reports/m6-demo-sales-business-profile-summary.md`
- `backend/semantic/`

## 3. New File Paths

| Artifact | Path |
| --- | --- |
| Business tools package | `backend/business_tools/` |
| Models | `backend/business_tools/models.py` |
| Query helpers | `backend/business_tools/query_utils.py` |
| KPI tools | `backend/business_tools/kpi_tools.py` |
| Dimension tools | `backend/business_tools/dimension_tools.py` |
| Trend tools | `backend/business_tools/trend_tools.py` |
| Risk tools | `backend/business_tools/risk_tools.py` |
| Opportunity tools | `backend/business_tools/opportunity_tools.py` |
| Quality tools | `backend/business_tools/quality_tools.py` |
| Recommendation tools | `backend/business_tools/recommendation_tools.py` |
| Tests | `tests/test_m6_business_analysis_tools.py` |
| Report | `docs/reports/m6-business-analysis-tools.md` |

目录选择说明：`backend/business_tools/` 是 M6.4 的业务工具层，位于 semantic layer 与未来 Agent orchestration 之间。本轮未放入 `backend/agent/`，避免误接入 Agent 主流程。

## 4. Tool List

| Tool | Input | Output | Purpose |
| --- | --- | --- | --- |
| `validate_fields` | requested fields, table schema | valid fields, missing fields, fallback, can_continue | 反胡编和字段兜底 |
| `map_business_terms` | question / terms, available fields | term-to-field, term-to-metric, unmapped terms | 中文业务词映射 |
| `compute_overall_kpis` | table_name, metric_set | total sales, order count, refund, margin, discount, shipping, satisfaction, complaint | 整体经营 KPI |
| `compare_by_dimension` | table_name, dimension, metrics | grouped metrics, top rows, bottom rows | 地区 / 品类 / 渠道 / 城市等级对比 |
| `trend_analysis` | table_name, date_field, granularity, metrics | monthly series, latest comparison, trend direction | 趋势和复盘 |
| `top_bottom_analysis` | table_name, dimension, metric, n | top n, bottom n, contribution | 排名和贡献分析 |
| `refund_risk_analysis` | table_name, dimensions | refund amount, refund rate, return rate, risk objects | 退款风险 |
| `discount_risk_analysis` | table_name, dimensions | avg discount, margin, sales, discount dependency risk | 促销依赖风险 |
| `profitability_analysis` | table_name, dimensions | sales, profit, margin, high sales low profit objects | 利润质量 |
| `shipping_efficiency_analysis` | table_name, dimensions | shipping days, delayed orders, complaint, satisfaction | 履约体验风险 |
| `customer_profile_analysis` | table_name, fields | segment metrics, category preference, missing fields | 客户画像 |
| `channel_effectiveness_analysis` | table_name, channel field | orders, sales, refund, satisfaction, complaint | 渠道质量 |
| `data_quality_check` | table_name | anomaly counts and quality summary | 数据质量 |
| `risk_priority_scoring` | risk evidence list | high / medium / low risks, priority score | 风险排序 |
| `opportunity_finder` | KPI evidence rows | opportunity objects, reason, risk reminder | 机会识别 |
| `root_cause_hypothesis` | risk evidence | candidate causes, confidence, support | 根因候选 |
| `recommendation_builder` | risks, opportunities | actions, priority, target, monitor metric, window | 可执行建议 |

## 5. Typed Input / Output

`backend/business_tools/models.py` 定义：

- `ToolResult`
- `EvidenceTable`
- `EvidenceRow`
- `MetricValue`
- `RiskItem`
- `OpportunityItem`
- `RecommendationItem`
- 每个工具对应的 input model。

输出约束：

- JSON-safe。
- 包含 `evidence_summary`。
- 高风险结论可追溯到 `RiskItem.evidence`。
- 默认不包含 SQL、技术追踪、provider、run id、memory。
- 字段缺失时返回 `missing_fields` 和 `fallback_message`，不抛 500。

## 6. Semantic Layer Reuse

M6.4 复用 M6.3：

- `BUSINESS_TERM_MAPPINGS`
- `DEFAULT_THRESHOLDS`
- `dynamic_thresholds.quantile`
- missing field fallback rules

M6.4 不重新定义业务口径，只把语义层口径转成可运行工具。

## 7. Read-only Data Access

工具通过 `DatabaseManager.execute_query()` 执行只读 `SELECT * FROM "<table_name>"` 取数，再用 Pandas 做聚合和规则判断。

约束：

- 输入以 `table_name` 为主。
- table name 使用安全 identifier 校验。
- 不执行 DDL / DML。
- 不写回 DuckDB。
- 测试通过临时 DuckDB 导入 M6.2 CSV，未硬编码 demo 文件路径到工具函数。
- 输出限制 Top 5 / Top 10，不返回 50k 行原始数据。

## 8. Risk Rules

风险判断使用 deterministic rules：

- 退款风险：`refund_rate` 超过默认阈值或动态 P90，并结合销售贡献。
- 促销依赖：高 `avg_discount` + 低 `gross_margin_rate`。
- 利润质量：高销售 + 低毛利。
- 履约体验：`avg_shipping_days` 动态偏高，并结合投诉率 / 满意度。
- 渠道体验：订单量高但满意度低、投诉率或退款率偏高。
- 风险优先级：结合 impact、severity、confidence 和已有 priority score。

## 9. Opportunity Rules

机会识别规则：

- 销售具备一定规模。
- `gross_margin_rate` 较健康。
- `refund_rate` 相对低。
- `avg_satisfaction_score` 较好。
- `avg_discount` 过高时扣分。

输出包含：

- opportunity object
- score
- reason
- risk reminder
- metric evidence

## 10. Recommendation Rules

建议生成规则：

- 风险类建议必须包含目标对象、行动、监控指标和行动窗口。
- 机会类建议必须包含小流量加投 / 资源倾斜试点和风险护栏。
- 不输出空泛的“建议优化”。
- 根因工具只输出“可能 / 候选原因”，不输出确定性根因。

## 11. Test Results

Backend import:

```bash
python -c "from backend.main import app; print('backend import OK')"
```

Result: PASS.

Business tools tests:

```bash
python -m pytest tests/test_m6_business_analysis_tools.py -q
```

Result: PASS, `17 passed`.

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

Safety search result: PASS, no output.

No real credential, `.env`, private learning material, job/interview material, or personal contact data was added.

## 13. Remaining Risks

- 工具当前是 backend helper，尚未包装成 LangChain tools；这是 M6.4 的边界。
- 当前取数策略是整表读入 Pandas，50k demo 数据可接受；真实大表后续应在 M6.5/M6.6 前加入 SQL 下推或聚合缓存。
- 根因仍是候选假设，需要 M6.5 把 evidence 链路组织进业务报告。
- 风险和机会阈值是基础规则，M6.7 压测后可继续校准。

## 14. Next Stage Recommendation

建议等待用户审查 M6.4。审查通过后，下一阶段才进入 M6.5 LangChain Agent 编排增强。
