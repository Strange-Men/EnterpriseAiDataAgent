# M6 Demo Sales Business Profile Summary

- Dataset: `demo_sales_business_50k`
- Seed: `20260706`
- Rows: `50000`
- Columns: `28`
- Order ID unique: `True`
- Synthetic only: no contact or precise-location columns are generated.

## Overall KPI

- `total_sales`: `79543906.74`
- `order_count`: `50000`
- `avg_order_value`: `1590.88`
- `gross_margin_rate`: `0.1438`
- `refund_rate`: `0.0581`
- `avg_discount`: `0.3248`
- `avg_shipping_days`: `3.2202`
- `avg_satisfaction`: `4.1874`
- `complaint_rate`: `0.0541`
- `return_rate`: `0.1137`

## Data Quality Anomaly Profile

- `sales_amount_non_positive`: `175` rows, `0.3500%`
- `quantity_non_positive`: `90` rows, `0.1800%`
- `discount_out_of_range`: `175` rows, `0.3500%`
- `ship_before_order`: `100` rows, `0.2000%`
- `refund_exceeds_sales`: `100` rows, `0.2000%`
- `missing_satisfaction_score`: `1000` rows, `2.0000%`
- `missing_ad_channel`: `500` rows, `1.0000%`

## Region Profile

| region | orders | sales_amount | profit_amount | refund_amount | avg_discount | avg_shipping_days | avg_satisfaction | complaint_orders | refund_rate | gross_margin_rate | complaint_rate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| South China | 12402 | 22846695.96 | 2509903.02 | 1700062.23 | 0.3291 | 3.0684 | 4.0298 | 1117 | 0.0744 | 0.1099 | 0.0901 |
| East China | 11089 | 18563137.15 | 3636433.46 | 643151.07 | 0.3236 | 2.0024 | 4.4066 | 220 | 0.0346 | 0.1959 | 0.0198 |
| North China | 6552 | 10182241.24 | 1413555.4 | 562566.83 | 0.3225 | 2.9722 | 4.2213 | 244 | 0.0552 | 0.1388 | 0.0372 |
| Central China | 6439 | 9653226.3 | 1323662.11 | 587072.47 | 0.3234 | 2.9897 | 4.2038 | 279 | 0.0608 | 0.1371 | 0.0433 |
| Southwest | 5505 | 7901649.54 | 1224419.37 | 441843.93 | 0.3228 | 4.0111 | 4.2382 | 223 | 0.0559 | 0.155 | 0.0405 |
| Northwest | 4033 | 5300799.46 | 729705.37 | 320018 | 0.3231 | 4.9472 | 4.0618 | 314 | 0.0604 | 0.1377 | 0.0779 |
| Northeast | 3980 | 5096157.09 | 597851.07 | 365832.59 | 0.325 | 5.0229 | 4.0426 | 308 | 0.0718 | 0.1173 | 0.0774 |

## Category Profile

| category | orders | sales_amount | profit_amount | refund_amount | avg_discount | avg_shipping_days | avg_satisfaction | complaint_orders | refund_rate | gross_margin_rate | complaint_rate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Digital | 8519 | 35944425.26 | 5192710.51 | 1806404.86 | 0.236 | 3.2266 | 4.2407 | 455 | 0.0503 | 0.1445 | 0.0534 |
| Home Appliances | 5540 | 21096854.42 | 4758338.93 | 958644.07 | 0.1741 | 3.1832 | 4.2488 | 282 | 0.0454 | 0.2255 | 0.0509 |
| Apparel | 9738 | 8835927.06 | -210952.66 | 829018 | 0.4798 | 3.224 | 4.0753 | 560 | 0.0938 | -0.0239 | 0.0575 |
| Beauty | 8961 | 5036255.13 | 251481.98 | 553141.7 | 0.4371 | 3.2376 | 4.1069 | 504 | 0.1098 | 0.0499 | 0.0562 |
| Sports | 5318 | 3632882.81 | 615343.26 | 193377.58 | 0.2792 | 3.2048 | 4.2444 | 266 | 0.0532 | 0.1694 | 0.05 |
| Home | 5370 | 3155957.12 | 522880.45 | 195508.64 | 0.2774 | 3.2188 | 4.2431 | 286 | 0.0619 | 0.1657 | 0.0533 |
| Food | 6554 | 1841604.94 | 305727.33 | 84452.27 | 0.2595 | 3.2272 | 4.2512 | 352 | 0.0459 | 0.166 | 0.0537 |

## Channel Profile

| ad_channel | orders | sales_amount | profit_amount | refund_amount | avg_discount | avg_shipping_days | avg_satisfaction | complaint_orders | refund_rate | gross_margin_rate | complaint_rate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Livestream | 11235 | 16510448.03 | 1888129.34 | 1362482.16 | 0.375 | 3.971 | 3.9404 | 980 | 0.0825 | 0.1144 | 0.0872 |
| Feed Ads | 9830 | 15528018.5 | 2103582.13 | 1005872.46 | 0.3437 | 2.9896 | 4.0519 | 666 | 0.0648 | 0.1355 | 0.0678 |
| Search | 8052 | 13329123.18 | 2049115.26 | 676426.45 | 0.294 | 3.0315 | 4.3401 | 259 | 0.0507 | 0.1537 | 0.0322 |
| Organic | 6570 | 11118572.08 | 1871932.54 | 373350.16 | 0.2838 | 2.9772 | 4.4472 | 137 | 0.0336 | 0.1684 | 0.0209 |
| Influencer | 5670 | 8790856.87 | 1208686.4 | 570086.52 | 0.3358 | 3.0125 | 4.1416 | 351 | 0.0648 | 0.1375 | 0.0619 |
| Private Domain | 5232 | 8660832.35 | 1405755.48 | 400382.41 | 0.2945 | 2.9488 | 4.3972 | 172 | 0.0462 | 0.1623 | 0.0329 |
| Offline | 2911 | 4930990.82 | 822526.32 | 184688.4 | 0.2779 | 3.0557 | 4.307 | 111 | 0.0375 | 0.1668 | 0.0381 |
|  | 500 | 675064.91 | 85802.33 | 47258.56 | 0.3261 | 3.264 | 4.1728 | 29 | 0.07 | 0.1271 | 0.058 |

## City Level Profile

| city_level | orders | sales_amount | profit_amount | refund_amount | avg_discount | avg_shipping_days | avg_satisfaction | complaint_orders | refund_rate | gross_margin_rate | complaint_rate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tier 3 | 17999 | 27461101.92 | 3655663.05 | 1803964.64 | 0.327 | 3.143 | 4.1746 | 981 | 0.0657 | 0.1331 | 0.0545 |
| Tier 2 | 14315 | 23824346.04 | 3580473.59 | 1249709.22 | 0.325 | 3.0184 | 4.2004 | 752 | 0.0525 | 0.1503 | 0.0525 |
| New Tier 1 | 6874 | 11182363.1 | 1883375.24 | 505774.97 | 0.3224 | 2.9945 | 4.2785 | 256 | 0.0452 | 0.1684 | 0.0372 |
| Tier 1 | 4766 | 8910711.61 | 1202990.14 | 556035.87 | 0.3247 | 2.8282 | 4.1534 | 317 | 0.0624 | 0.135 | 0.0665 |
| Tier 4 | 6046 | 8165384.07 | 1113027.78 | 505062.42 | 0.3205 | 4.4932 | 4.1184 | 399 | 0.0619 | 0.1363 | 0.066 |

## High Volume / Lower Profit Product Candidates

| product | orders | sales_amount | profit_amount | refund_amount | avg_discount | avg_shipping_days | avg_satisfaction | complaint_orders | refund_rate | gross_margin_rate | complaint_rate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Promo Jacket | 2462 | 2172844.06 | -140862.71 | 215867.47 | 0.53 | 3.2071 | 4.0385 | 152 | 0.0993 | -0.0648 | 0.0617 |
| Trail Running Shoes | 2457 | 2812686.55 | 25133.15 | 261603.22 | 0.4319 | 3.2409 | 4.1147 | 135 | 0.093 | 0.0089 | 0.0549 |
| Budget Sneakers | 2419 | 1573382.15 | -90360.06 | 151764.86 | 0.5079 | 3.2112 | 4.0523 | 129 | 0.0965 | -0.0574 | 0.0533 |
| Urban Windbreaker | 2400 | 2277014.3 | -4863.04 | 199782.45 | 0.4488 | 3.2367 | 4.096 | 144 | 0.0877 | -0.0021 | 0.06 |
| Sensitive Skin Cream | 2279 | 1101612.57 | 121424.56 | 111174.27 | 0.3766 | 3.2878 | 4.1754 | 121 | 0.1009 | 0.1102 | 0.0531 |
| Live Sale Lipstick Kit | 2259 | 1085874.11 | -24552.02 | 130142.52 | 0.5264 | 3.1948 | 4.019 | 116 | 0.1199 | -0.0226 | 0.0514 |
| Longwear Foundation | 2226 | 1229904.13 | 61006.64 | 144848.68 | 0.4089 | 3.2066 | 4.1381 | 122 | 0.1178 | 0.0496 | 0.0548 |
| Hydrating Serum Set | 2197 | 1618864.32 | 93602.8 | 166976.23 | 0.4368 | 3.2608 | 4.0951 | 145 | 0.1031 | 0.0578 | 0.066 |

## Return Reason Concentration

- `Quality Issue`: `1410`
- `Description Mismatch`: `1080`
- `Size Mismatch`: `1053`
- `No Reason`: `914`
- `Slow Logistics`: `862`
- `Other`: `367`

## Recent Monthly Trend

| month | orders | sales_amount | profit_amount | refund_amount | refund_rate |
| --- | --- | --- | --- | --- | --- |
| 2026-01 | 2857 | 4336414.62 | 586106.46 | 269877.94 | 0.06 |
| 2026-02 | 2554 | 4152592.17 | 622022.03 | 213929.68 | 0.05 |
| 2026-03 | 2912 | 4761336.87 | 688975.74 | 288285.79 | 0.06 |
| 2026-04 | 2709 | 4000974.18 | 540513.24 | 253478.99 | 0.06 |
| 2026-05 | 2872 | 4277431.95 | 595398.31 | 276476.77 | 0.06 |
| 2026-06 | 2749 | 4524885.68 | 640444.92 | 279453.07 | 0.06 |

## Business Pattern Check

- South China is designed to be high-volume with elevated refund and complaint pressure, but only when combined with channel, category, discount, and service evidence.
- East China is designed to be steadier with better margin and lower refund pressure.
- Apparel and Beauty include promotion-heavy products with margin pressure.
- Livestream and Feed Ads include higher order volume but lower satisfaction and higher return pressure.
- Northwest and Northeast include slower shipping pressure.
- Young customers have higher Digital, Beauty, and Sports affinity.
- High Value customers skew toward Home Appliances and higher-ticket products.
- Lower-tier cities have more orders and lower average order value.
- Several products combine high volume with lower profit quality.
- Return reasons are concentrated enough for root-cause-style follow-up, but no answer field is embedded.

## Pressure Test Coverage

- Supports business health, review summary, risk diagnosis, growth opportunity, region/category/channel/customer analysis, shipping efficiency, data quality, anti-hallucination, and follow-up context tests.
- Anti-hallucination validation is supported by intentionally omitting the eight non-supported analytical fields from the dataset schema.
