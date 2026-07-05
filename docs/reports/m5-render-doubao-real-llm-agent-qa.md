# M5 Render Doubao Real LLM Agent QA

## 1. Goal

Validate whether the Render backend can read the real Doubao provider environment and whether the M5 LangChain Single Agent can run real-provider data-analysis scenarios without leaking secrets.

Render backend:

- `https://enterpriseaidataagent.onrender.com`

No API key was printed, logged, committed, or included in this report.

## 2. Environment Variable Audit

Project code reads these Doubao variables:

- `DOUBAO_API_KEY`
- `DOUBAO_BASE_URL`
- `DOUBAO_MODEL`

Provider runtime also reads:

- `LLM_MODE`
- `LLM_DEFAULT_PROVIDER`
- `LLM_ALLOWED_PROVIDERS`
- `LLM_FALLBACK_PROVIDER`
- `LLM_FALLBACK_ON_ERROR`

The code does not currently read `ARK_API_KEY`.

Conclusion:

- Render's expected `DOUBAO_API_KEY`, `DOUBAO_BASE_URL`, and `DOUBAO_MODEL` names match the project code.
- `ARK_API_KEY` compatibility is not required if Render has `DOUBAO_API_KEY` configured.
- If Render only has an Ark alias and no `DOUBAO_API_KEY`, then compatibility would be needed.

## 3. Render Status

`GET /api/status`:

```json
{
  "api": "ok",
  "db": "ok",
  "version": "1.4.1"
}
```

`GET /api/ai/status`:

```json
{
  "configured": true,
  "connection": "ok",
  "model": "mock-llm",
  "default_provider": "mock",
  "supported_providers": ["mock", "deepseek", "doubao", "mimo"],
  "allowed_providers": ["mock", "deepseek", "doubao", "mimo"]
}
```

Note:

- `/api/ai/status` reports the default provider, which is still `mock`.
- This endpoint alone does not prove whether `doubao` is configured.

## 4. Doubao Provider Proof

A direct real-provider check through `/api/ai/insights` with `llm_provider=doubao` returned:

```json
{
  "llm": {
    "mode": "real",
    "provider_requested": "doubao",
    "provider_used": "doubao",
    "fallback_triggered": false,
    "fallback_reason": null,
    "calls": 1
  }
}
```

Conclusion:

- Render can read the Doubao provider environment.
- Doubao authentication, base URL, and model are working for the provider runtime.

## 5. Test Data

A public synthetic CSV was uploaded to Render.

Fields:

- `order_id`
- `region`
- `product`
- `sales_amount`
- `refund_amount`
- `order_date`
- `customer_id`
- `quantity`

Upload result:

- table: `m5_render_sales_public`
- rows: 24
- schema endpoint: passed
- preview endpoint: passed

No real business data was used.

## 6. Agent Scenario Results

All Agent scenarios used:

- endpoint: `POST /api/agent/runs`
- `provider_requested=doubao`
- table: `m5_render_sales_public`

### 6.1 Basic Understanding

Question:

```text
这个表有多少行？有哪些字段？
```

Result:

- HTTP status: `200`
- answer: readable
- SQL: present
- evidence: present
- warnings: present and empty
- trace / tool_calls: present
- 500: no
- provider metadata from deployed Agent route: `provider_used=mock`, `fallback_triggered=true`

The answer quality indicated real model behavior, but deployed Agent metadata did not preserve real provider usage.

### 6.2 Regional Sales

Question:

```text
按地区统计销售额，并按销售额从高到低排序。
```

Result:

- HTTP status: `200`
- SQL includes `region`
- SQL includes `SUM(sales_amount)`
- SQL includes `GROUP BY`
- SQL includes `ORDER BY`
- answer gives sorted regional conclusion
- evidence: present
- 500: no

### 6.3 Top N Products

Question:

```text
找出销售额最高的前 5 个商品。
```

Result:

- HTTP status: `200`
- SQL includes `product`
- SQL includes `SUM(sales_amount)`
- SQL includes `ORDER BY`
- SQL includes `LIMIT 5`
- answer gives Top product conclusions
- evidence: present
- 500: no

### 6.4 Refund Risk

Question:

```text
哪些地区退款金额比较高？
```

Result:

- HTTP status: `200`
- SQL uses `refund_amount`
- SQL groups by `region`
- answer explains refund-risk regions
- did not incorrectly use `sales_amount`
- evidence: present
- 500: no

### 6.5 Even Rows

Question:

```text
取偶数行。
```

Result:

- HTTP status: `200`
- SQL used `ROW_NUMBER()`
- SQL used `row_num % 2 = 0`
- one run used `ROW_NUMBER() OVER ()`
- another run used `ROW_NUMBER() OVER (ORDER BY order_id)`, which is deterministic and DuckDB-compatible
- did not degrade to a plain generic `SELECT * FROM table LIMIT 100`
- evidence: present
- 500: no

### 6.6 Invalid Field

Question:

```text
用不存在的字段 abc_xyz 分析销售额。
```

Result:

- HTTP status: `200`
- no 500
- did not hallucinate `abc_xyz` as a real column
- returned controlled SQL message
- warning included `requested_field_not_found: abc_xyz`
- answer explained the field was missing

### 6.7 Memory

Questions:

```text
按地区统计销售额。
基于刚才结果，总结销售额最高的地区。
```

Result:

- both calls returned `200`
- second call returned readable answer about the top region
- `memory_used=true`
- trace / tool_calls present

### 6.8 Bad Provider Fallback

Request:

- `provider_requested=bad_provider`

Result:

- HTTP status: `200`
- `provider_requested=bad_provider`
- `provider_used=mock`
- `fallback_triggered=true`
- `fallback_reason=unsupported_provider`
- answer remained readable

### 6.9 Empty Input

Result:

- HTTP status: `422`
- controlled validation error

## 7. Light Stress Test

Stress plan:

- 3 regional sales calls
- 2 Top N calls
- 2 refund-risk calls
- 1 even-row call
- 1 invalid-field call
- 1 memory-style follow-up call

Results:

- total calls: 10
- success count: 10
- failure count: 0
- fallback metadata count from deployed Agent route: 10
- `provider_used=doubao` count from deployed Agent route: 0
- 500 count: 0
- empty answer count: 0
- empty evidence count: 0
- average response time: 24.760 seconds
- slowest response time: 32.052 seconds

Interpretation:

- Real model quality was visible in the generated answers and SQL.
- The deployed Agent route still reports fallback metadata incorrectly.
- This branch fixes that metadata propagation issue locally.

## 8. Issue Classification

### Env Status

Render env is effective for the provider runtime, proven by `/api/ai/insights` returning:

- `provider_used=doubao`
- `fallback_triggered=false`

### Agent Metadata Issue

Deployed `/api/agent/runs` still returns:

- `provider_used=mock`
- `fallback_triggered=true`
- `fallback_reason=provider_unavailable_or_mock_fallback`

even when the Agent answer and SQL are clearly generated by the real provider.

Root cause:

- `LangChainSingleAgentService._resolve_provider()` initially marks supported non-mock providers as mock fallback.
- The final AgentRun did not reliably let successful tool-level LLM metadata override that initial marker.

Fix in this branch:

- Merge provider metadata from `generate_sql` and `summarize_findings` into the final run context.
- Finalize `provider_used`, `fallback_triggered`, `fallback_reason`, and `is_simulated` from actual provider tool output.
- Add regression coverage ensuring a successful real provider output overrides the initial mock fallback marker.

## 8.1 Speed + Output QA Continuation

After the first Render QA pass, the branch was extended with a minimal speed and stability polish.

Online baseline before deploying this branch:

- Previous Render Agent stress average: `24.760s`
- Previous Render Agent slowest request: `32.052s`
- A later Render `/api/agent/runs provider=doubao` regional-sales call returned `500` after `39.697s`
- Render `/api/agent/runs provider=mock` still returned `200` in `2.665s`

Root cause for the 500 was reproduced locally:

- A real SQL-generation response can return a non-executable `-- CANNOT_ANSWER...` SQL marker.
- `execute_readonly_sql` then fell back to the mock registry with the same invalid SQL.
- The mock registry validation exception escaped the tool boundary and became route-level `500`.

Fixes added in this continuation:

- Preserve the real-provider metadata fix from the first QA pass.
- Add run-scope profile cache for `profile_table`.
- Limit SQL result evidence passed into summarization to at most `20` rows.
- Reduce the execute preview row limit from `50` to `20`.
- Add schema-aware SQL fast paths for common questions:
  - row count / fields
  - even rows
  - odd rows
  - first 10 rows
  - regional sales aggregation
  - Top N product sales
  - refund amount risk
  - missing requested field
- Add controlled handling for invalid / non-executable SQL execution so Agent route returns warnings instead of `500`.
- Add trace fields:
  - `trace.sql_fast_path`
  - `trace.llm_calls`

Post-fix local true-provider validation used the same Doubao provider runtime without printing keys.

Representative smoke after optimization:

- regional sales: `200`, `19.373s`, `provider_used=doubao`, `fallback_triggered=false`, `sql_fast_path=true`, `llm_calls=1`
- row count / fields: `200`, `21.079s`, `provider_used=doubao`, `fallback_triggered=false`, `sql_fast_path=true`, `llm_calls=1`

Post-fix local scenario results:

| Scenario | Status | Provider | Fallback | Fast Path | LLM Calls | Elapsed |
|---|---:|---|---:|---:|---:|---:|
| basic row count / fields | 200 | doubao | false | false before final row-count patch, now covered by fast path | 2 before patch, now 1 in smoke | 36.919s before patch, 21.079s after patch |
| regional sales | 200 | doubao | false | true | 1 | 20.850s |
| Top N products | 200 | doubao | false | true | 1 | 18.023s |
| refund risk | 200 | doubao | false | true | 1 | 22.938s |
| even rows | 200 | doubao | false | true | 1 | 67.686s outlier |
| invalid field | 200 | doubao | false | false | 1 | 16.986s |
| memory first | 200 | doubao | false | true | 1 | 16.104s |
| memory second | 200 | doubao | false | true | 1 | 16.674s |
| bad provider fallback | 200 | mock | true | true | 0 | 0.041s |
| empty input | 422 | n/a | n/a | n/a | n/a | controlled |

Post-fix local 10-call light stress:

- total calls: `10`
- success count: `10`
- fallback count: `0`
- `provider_used=doubao` count: `10`
- 500 count: `0`
- empty answer count: `0`
- average response time: `17.054s`
- slowest response time: `22.320s`
- fast-path count: `9`

Interpretation:

- The common analytical path now usually avoids the SQL-generation LLM call and uses one real LLM call for grounded explanation.
- Average response time improved from `24.760s` to `17.054s` in local true-provider validation.
- The `500` path is fixed locally by returning controlled warnings for invalid SQL execution.
- Render must be redeployed from this branch or from merged master before online `/api/agent/runs` can show the fixed metadata and speed behavior.

## 9. SQL Quality

SQL quality was generally acceptable:

- region sales: passed
- Top N products: passed
- refund risk: passed
- even rows: passed
- invalid field: controlled response
- common deterministic fast paths avoid generic `SELECT * LIMIT 100` for analytical questions

No uncontrolled 500 or crash occurred.

## 10. Answer Quality

Answers were readable and business-oriented:

- field explanations were clear
- sorted regional conclusions were readable
- Top N conclusions were readable
- refund-risk conclusion used refund data
- invalid field answer explained the missing field

No empty answers were observed.

## 11. Memory Result

Memory scenario returned `memory_used=true` and produced a coherent follow-up answer. The current memory is still in-memory and route-level, consistent with M5 scope.

## 12. Validation

Local validation after the metadata, speed, and controlled-failure fixes:

- backend import: passed
- focused Agent tests: `15 passed`
- full pytest: `808 passed, 31 skipped`
- changed-file ruff: passed

## 13. Remaining Non-Blocking Issues

- Render deployment must receive this branch's metadata and speed fixes before `/api/agent/runs` can report `provider_used=doubao`, `fallback_triggered=false`, `sql_fast_path=true`, and reduced LLM calls online.
- `/api/ai/status` only reports the default provider, so it does not directly expose per-provider readiness for Doubao. This is not blocking because `/api/ai/insights` proves Doubao runtime is usable.
- Doubao latency remains variable. The optimized local stress average was `17.054s`, but one scenario outlier reached `67.686s`.

## 14. Recommendation

Do not tag M5 until this metadata and speed fix is merged, deployed, and re-smoked on Render.

After merge/deploy, run a short Render Agent re-smoke:

- `provider_requested=doubao`
- one regional sales question
- one even-row question
- one invalid-field question

Expected after deployment:

- `provider_used=doubao`
- `fallback_triggered=false`
- `trace.sql_fast_path=true` for common deterministic SQL questions
- `trace.llm_calls=1` for common fast-path questions
- answer / SQL / evidence / trace / tool_calls still present

If that post-deploy smoke passes, M5 can proceed to Final Tag.

M6 has not started. No tag was created.
