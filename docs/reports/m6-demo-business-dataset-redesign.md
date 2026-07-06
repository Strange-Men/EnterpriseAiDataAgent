# M6 Demo Business Dataset Redesign

> Date: 2026-07-06
> Stage: M6.2 demoExcel redesign

## 1. Stage Scope

本轮严格是 M6.2：demoExcel 重做。

已完成：

- 使用 faker + 条件逻辑生成 `demo_sales_business_50k`。
- 输出 50,000 行 CSV。
- 输出 50,000 行 XLSX。
- 输出 schema manifest。
- 输出 profile summary。
- 输出生成脚本。
- 增加轻量脚本级测试。

未进入：

- M6.3 Business Semantic Layer。
- M6.4 Business Analysis Tools。
- M6.5 LangChain Agent 编排增强。
- 前端 UI / Astryx UI。
- Multi-Agent / LangGraph / RAG。
- tag / master merge。

## 2. Markdown Basis

本轮先读取并对齐以下 M6 文档。由于当前 `master` 尚未包含 M6.1 文档，读取来源为已推送的 `origin/m6-business-analyst-agent-architecture-docs` 分支；读取后未把这些 M6.1 文档作为本轮产物提交。

- `docs/reports/m6-business-analyst-agent-architecture.md`
- `docs/reports/m6-demo-dataset-redesign-spec.md`
- `docs/reports/m6-pressure-test-plan.md`
- `docs/reports/m6-business-capability-research.md`

## 3. Output Paths

| Artifact | Path |
| --- | --- |
| Generation script | `scripts/generate_demo_sales_business_dataset.py` |
| CSV | `testExcel/demo_sales_business_50k.csv` |
| XLSX | `testExcel/demo_sales_business_50k.xlsx` |
| Schema manifest | `docs/reports/m6-demo-sales-business-schema-manifest.json` |
| Profile summary | `docs/reports/m6-demo-sales-business-profile-summary.md` |
| M6.2 report | `docs/reports/m6-demo-business-dataset-redesign.md` |
| Test | `tests/test_m6_demo_business_dataset.py` |

Final placement uses `testExcel/` because the project already stores demo/test datasets there.

## 4. Dataset Shape

- Row count: `50000`
- Column count: `28`
- Faker seed: `20260706`
- Random seed: `20260706`
- Numpy seed: `20260706`
- Faker locale: `en_US`
- Date coverage: `2025-01-01` to `2026-06-30`
- CSV/XLSX consistency: PASS
- `order_id` uniqueness: PASS

## 5. Field List

| Field | Type summary |
| --- | --- |
| `order_id` | string identifier |
| `order_date` | ISO date |
| `ship_date` | ISO date |
| `shipping_days` | integer |
| `region` | string dimension |
| `province` | string dimension |
| `city` | string dimension |
| `city_level` | string dimension |
| `customer_id` | synthetic repeatable customer identifier |
| `customer_segment` | string dimension |
| `customer_age` | integer |
| `customer_gender` | string dimension |
| `ad_channel` | string dimension with controlled missing values |
| `category` | string dimension |
| `subcategory` | string dimension |
| `product` | string dimension |
| `sales_amount` | numeric amount, 2 decimals |
| `quantity` | integer |
| `unit_price` | numeric amount, 2 decimals |
| `discount` | numeric rate, 4 decimals |
| `cost_amount` | numeric amount, 2 decimals |
| `profit_amount` | numeric amount, 2 decimals |
| `refund_amount` | numeric amount, 2 decimals |
| `is_returned` | boolean |
| `return_reason` | string dimension |
| `satisfaction_score` | numeric score, controlled missing values |
| `complaint_count` | integer |
| `payment_method` | string dimension |

## 6. Anomaly Ratio Statistics

| Check | Count | Rate | Expected range | Result |
| --- | ---: | ---: | ---: | --- |
| `sales_amount_non_positive` | 175 | 0.3500% | 0.2%-0.5% | PASS |
| `quantity_non_positive` | 90 | 0.1800% | 0.1%-0.3% | PASS |
| `discount_out_of_range` | 175 | 0.3500% | 0.2%-0.5% | PASS |
| `ship_before_order` | 100 | 0.2000% | 0.1%-0.3% | PASS |
| `refund_exceeds_sales` | 100 | 0.2000% | 0.1%-0.3% | PASS |
| `missing_satisfaction_score` | 1000 | 2.0000% | 1%-3% | PASS |
| `missing_ad_channel` | 500 | 1.0000% | 0.5%-2% | PASS |

## 7. Business Pattern Profile

The dataset includes hidden business patterns with noise. No answer column, hidden field, or hardcoded Agent rule was added.

- South China has the largest sales contribution and elevated refund / complaint pressure.
- East China is stable, with stronger margin and lower refund pressure.
- Apparel and Beauty include promotion-heavy products with margin pressure.
- Livestream and Feed Ads have high order volume but lower satisfaction and higher return pressure.
- Northwest and Northeast include slower shipping pressure.
- Younger customers skew toward Digital, Beauty, and Sports.
- High Value customers skew toward Home Appliances and higher-ticket products.
- Tier 3 / Tier 4 cities have more orders and lower average order value.
- Several high-volume products have weaker profit quality.
- Return reasons are sufficiently concentrated for root-cause-style follow-up.

Noise control:

- Pattern logic uses multiple factors: region, channel, category, product, segment, city tier, discount, shipping, and service signals.
- Roughly 20% of pattern paths receive additional random perturbation.
- No single field fully determines any target conclusion.

## 8. M6 Pressure Test Coverage Matrix

| Pressure-test ability | Dataset support |
| --- | --- |
| Business health assessment | KPI fields for sales, order count, profit, refund, discount, shipping, satisfaction, complaint. |
| Business review summary | 18-month date range plus region, category, channel and trend-friendly measures. |
| High-income high-risk region | South China pattern requires sales, refund, satisfaction and complaint evidence. |
| Worth-investing region | East China / selected mid-sales regions provide margin and refund contrast. |
| Promotion dependency risk | Apparel / Beauty discount and margin patterns. |
| High-volume lower-profit products | Product-level volume and margin variation. |
| Refund-risk category and causes | Refund amount, return flag and return reason fields. |
| Channel volume but poor experience | Livestream / Feed Ads volume and experience pressure. |
| Shipping efficiency impact | Shipping days, satisfaction, complaint and refund relationships. |
| City-tier comparison | City-level order density and AOV differences. |
| Young customer category preference | Age and category preference pattern. |
| High-value customer contribution | Customer segment and high-ticket preference. |
| Recent trend | Monthly data coverage through 2026-06. |
| KPI monitoring | All core operating KPI fields available. |
| Data quality issue detection | Controlled anomalies and missingness. |
| Executive business brief | Complete multi-dimension business dataset. |
| Next-quarter investment targets | Region/category/channel opportunity signals. |
| Priority risk | Refund, complaint, satisfaction, margin and shipping risk signals. |
| Return reason concentration | Concentrated return reason distribution. |
| South China vs East China comparison | Intentional regional contrast with noise. |
| ROI anti-hallucination | Unsupported fields are intentionally omitted. |
| Membership-tier anti-hallucination | Unsupported fields are intentionally omitted. |
| Fine-grained location anti-hallucination | Unsupported fields are intentionally omitted. |
| Follow-up by risky region/category | Region/category/product drill-down dimensions are available. |
| One-week action plan | Evidence dimensions support recommendations, but no Agent scoring logic was implemented. |

## 9. Reproducibility

Command:

```bash
python scripts/generate_demo_sales_business_dataset.py --rows 50000 --seed 20260706 --output-dir testExcel
```

The script supports:

- Fixed seed.
- Configurable row count.
- Configurable output directory.
- Configurable reports directory.
- CSV and XLSX output.
- Schema manifest output.
- Profile summary output.
- Console statistics.
- Repeatable generation.

## 10. Validation Results

Script command:

```bash
python scripts/generate_demo_sales_business_dataset.py --rows 50000 --seed 20260706 --output-dir testExcel
```

Result: PASS.

File validation:

- CSV exists: PASS.
- XLSX exists: PASS.
- CSV rows: `50000`.
- XLSX rows: `50000`.
- CSV columns: `28`.
- XLSX columns: `28`.
- Column order consistent: PASS.
- Full CSV/XLSX value consistency: PASS.
- Date fields parseable: PASS.
- Money fields numeric: PASS.
- Boolean field stable: PASS.
- `order_id` unique: PASS.
- Unsupported anti-hallucination fields absent: PASS.
- Real personal contact fields absent: PASS.

Project integration validation:

- CSV upload via current `upload_file`: PASS.
- CSV schema: 28 columns, first fields match expected order.
- CSV quality/profile route: PASS, profile sample rows `10000`.
- XLSX upload via current `upload_file`: PASS.
- XLSX schema: 28 columns, first fields match expected order.
- XLSX quality/profile route: PASS, profile sample rows `10000`.

Backend import:

```bash
python -c "from backend.main import app; print('backend import OK')"
```

Result: PASS.

Tests:

```bash
python -m pytest tests/test_m6_demo_business_dataset.py -q
```

Result: PASS, `2 passed`.

## 11. Safety Search Result

Safety search result: PASS, no output.

No real API key, `.env`, private learning material, job/interview material, contact field, or real personal identifier was added. The dataset uses synthetic IDs only.

## 12. Remaining Risks

- The dataset is synthetic; real enterprise data may have different seasonality, channel economics and return mechanics.
- XLSX is intentionally simple and large-data friendly; no dashboard, formulas or charts were added in M6.2.
- The hidden patterns are designed for M6 pressure tests, but Agent scoring and business reasoning are intentionally deferred.
- Faker is now an explicit project dependency for reproducible dataset generation.

## 13. Next Stage Recommendation

建议等待用户审查本轮数据集。审查通过后，下一阶段才进入 M6.3 Business Semantic Layer。
