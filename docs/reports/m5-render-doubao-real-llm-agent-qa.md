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

## 9. SQL Quality

SQL quality was generally acceptable:

- region sales: passed
- Top N products: passed
- refund risk: passed
- even rows: passed
- invalid field: controlled response

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

Local validation after the metadata fix:

- backend import: passed
- focused tests: `12 passed`
- full pytest: `808 passed, 31 skipped`
- changed-file ruff: passed

## 13. Remaining Non-Blocking Issues

- Render deployment must receive this branch's metadata fix before `/api/agent/runs` can report `provider_used=doubao` and `fallback_triggered=false` correctly.
- `/api/ai/status` only reports the default provider, so it does not directly expose per-provider readiness for Doubao. This is not blocking because `/api/ai/insights` proves Doubao runtime is usable.
- Doubao response latency averaged about 24.760 seconds in this Render test, with the slowest request at 32.052 seconds.

## 14. Recommendation

Do not tag M5 until this metadata fix is merged and deployed.

After merge/deploy, run a short Render Agent re-smoke:

- `provider_requested=doubao`
- one regional sales question
- one even-row question
- one invalid-field question

Expected after deployment:

- `provider_used=doubao`
- `fallback_triggered=false`
- answer / SQL / evidence / trace / tool_calls still present

If that post-deploy smoke passes, M5 can proceed to Final Tag.

M6 has not started. No tag was created.
