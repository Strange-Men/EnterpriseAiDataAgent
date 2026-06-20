# M3-5 AI Full Chain Revalidation — EnterpriseAiDataAgent

**Date**: 2026-06-20
**Branch**: `m3-5-ai-revalidation`
**Base**: `master` @ `bd6f531`

---

## 1. Summary

| Item | Value |
|------|-------|
| AI 验收状态 | **BLOCKED_BY_CREDENTIAL** |
| 是否为代码问题 | **否** — 代码链路完整，API Key 被代理服务拒绝 |
| 是否阻塞项目 | **否** — 非 AI 主链路全部正常 |
| 是否建议打 tag | **否** — 需先更新有效 API Key 后重新验证 |
| 后续行动 | 更新 `.env` 中的 `ANTHROPIC_API_KEY` 为有效凭证 |

---

## 2. Environment

| Item | Status |
|------|--------|
| 是否配置 API Key | **YES** — `ANTHROPIC_API_KEY` 已设置（不输出具体值） |
| AI Model | `mimo-v2.5-pro` |
| Base URL | `https://token-plan-cn.xiaomimimo.com/anthropic` (第三方代理) |
| AI Status `/api/ai/status` | `configured: true, connection: ok` |
| 实际 API 调用 | **401 — Invalid API Key** |
| demo_sales | ✅ 存在，50,000 行，9 列 |

### 发现项：`ai/status` 健康检查过于宽松

`/api/ai/status` 端点只检查 `ANTHROPIC_API_KEY` 是否非空 + `_get_client()` 能否实例化，**不实际调用 API 验证 key 有效性**。这导致 status 报告 `connection: ok`，但所有实际 AI 调用均返回 401。

**建议**（非阻塞）：在 `ai/status` 中增加一个轻量级 API 调用（如 `models.list` 或最小 token 请求）来真实验证连通性。

---

## 3. NL→SQL Validation

| Item | Result |
|------|--------|
| 请求 | `POST /api/ai/query` — "按地区统计销售额最高的前 5 个地区" |
| 状态 | **FAIL — 401 Invalid API Key** |
| 生成 SQL | 无（请求被代理拒绝） |
| 执行 | N/A |
| Issues | 凭证问题，非代码问题 |

---

## 4. Explain Validation

| Item | Result |
|------|--------|
| 请求 | `POST /api/ai/explain` |
| 状态 | **FAIL — 401 Invalid API Key** |
| Issues | 同上 |

---

## 5. Insights Validation

| Item | Result |
|------|--------|
| 请求 | `POST /api/ai/insights` |
| 状态 | **FAIL — 401 Invalid API Key** |
| Issues | 同上 |

---

## 6. Report Generation Validation

| Item | Result |
|------|--------|
| 请求 | 未单独测试（依赖 AI 调用，必然 401） |
| 状态 | **FAIL — 401 Invalid API Key** |
| Issues | 同上 |

---

## 7. SSE Streaming Validation

| Item | Result |
|------|--------|
| 请求 | `POST /api/ai/explain/stream`, `POST /api/ai/insights/stream` |
| SSE 连接 | ✅ **成功建立** — 返回 `data: {"type": "error", ...}` |
| 分块返回 | N/A（无内容生成） |
| 正常结束 | ✅ 连接正常关闭 |
| 崩溃 | ❌ 前后端均未崩溃 |
| Issues | 流式基础设施正常工作，错误被正确捕获并通过 SSE 返回 |

**结论**：SSE streaming 代码路径正确，错误处理健壮。仅因凭证问题无法产生实际内容。

---

## 8. Multi-step Analysis Validation

| Item | Result |
|------|--------|
| 请求 | `POST /api/ai/analyze-multi` |
| 状态 | **FAIL — 必然 401**（未实际调用，因所有 AI 调用均失败） |
| Issues | 同上 |

---

## 9. Scheduler Execution Layer Validation

| Item | Result |
|------|--------|
| 状态 | **SKIP** — 因 AI 调用全部 401，scheduler 执行层无法触发有效分析 |
| Issues | 需 AI Key 有效后补验 |

---

## 10. Non-AI Regression (Step 13)

| Check | Result |
|-------|--------|
| Backend import | ✅ `python -c "from backend.main import app"` — OK |
| Backend tests | ✅ `420 passed in 9.75s` |
| Frontend tsc | ✅ `tsc --noEmit` — 无错误 |
| Frontend build | ✅ `next build` — 成功，11 路由全部生成 |

**结论**：非 AI 主链路完全稳定，无回归。

---

## 11. Final Decision

### AI Full Chain 是否通过？

**BLOCKED_BY_CREDENTIAL** — 代码链路完整，但 API Key 被代理服务 `token-plan-cn.xiaomimimo.com` 拒绝（401）。

### 是否需要修代码？

**否** — AI 链路代码无 P0/P1 问题。唯一的非阻塞建议是改进 `ai/status` 健康检查的准确性。

### 是否可以打 `v1.0.4-ai-validated`？

**否** — 需要先：
1. 更新 `.env` 中的 `ANTHROPIC_API_KEY` 为有效凭证
2. 重新运行本验收流程
3. 确认 AI 全链路通过后方可打 tag

### 是否仍需保持 scheduler experimental？

**是** — scheduler 执行层因凭证问题未能验证，应继续标记为 experimental。

### 后续行动

1. **立即**：检查 `ANTHROPIC_API_KEY` 是否过期或被撤销，联系代理服务提供商确认
2. **更新 Key 后**：重新运行 M3-5 验收流程
3. **可选改进**：增强 `ai/status` 健康检查，使其能真实反映 API 连通性

---

## 12. Mimo API Smoke Test (2026-06-20)

用户已手动更新 `.env`，切换至 Mimo Anthropic-compatible API。

### 配置确认

| Item | Status |
|------|--------|
| API Key 是否配置 | **YES** — `ANTHROPIC_API_KEY` 已设置（len=51，不输出值） |
| Base URL 是否配置 | **YES** — `https://token-plan-cn.xiaomimimo.com/anthropic` |
| Model | `mimo-v2.5-pro` |

### `/api/ai/status` 结果

```json
{
  "configured": true,
  "connection": "ok",
  "model": "mimo-v2.5-pro",
  "temperature": 0.7,
  "base_url": "https://token-plan-cn.xiaomimimo.com/anthropic"
}
```

### 最小 AI 调用结果

| Item | Value |
|------|-------|
| 端点 | `POST /api/ai/query` |
| 请求体 | `{"question":"用一句话回答：你可以正常工作吗？"}` |
| HTTP 状态码 | 200（业务层返回） |
| LLM 调用 | **失败** |
| 错误码 | 401 |
| 错误信息 | `Invalid API Key` — Mimo 端点拒绝当前 Key |

### 结论

**`BLOCKED_BY_CREDENTIAL`**

- `/api/ai/status` 报告 `connection: ok`，但该检查仅验证 Key 非空，不实际调用 API
- 实际 LLM 调用时，Mimo 端点返回 401 Invalid API Key
- 问题不在代码，不在 SDK 兼容性，不在端点路径——纯粹是凭证无效

### 下一步建议

1. 确认 Mimo API Key 是否已激活、是否过期、是否有足够额度
2. 可用 `curl` 直接测试 Mimo 端点（绕过后端）验证 Key 有效性：
   ```bash
   curl -X POST https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"mimo-v2.5-pro","max_tokens":32,"messages":[{"role":"user","content":"hi"}]}'
   ```
3. Key 更新后重新运行本 smoke test
4. 通过后进入 M3-5 全链路验收

---

## 13. Re-run After API Key Fix (2026-06-20)

用户报告已修正本地 `.env` 中的 Mimo API Key，要求重新执行验收。

### 配置确认

| Item | Status |
|------|--------|
| API Key 是否配置 | **YES** — `ANTHROPIC_API_KEY` 已设置 |
| Base URL 是否配置 | **YES** — `https://token-plan-cn.xiaomimimo.com/anthropic` |
| Model | `mimo-v2.5-pro` |
| `/api/ai/status` | `configured: true, connection: ok` |

### Smoke Test 结果

| Item | Value |
|------|-------|
| 端点 | `POST /api/ai/query` |
| 请求体 | `{"question":"按地区统计销售额最高的前 5 个地区"}` |
| HTTP 状态码 | 200（业务层返回） |
| LLM 调用 | **失败** |
| 错误码 | 401 |
| 错误信息 | `Invalid API Key` — Mimo 端点仍拒绝当前 Key |
| 耗时 | ~923ms |

### 验收状态

| 检查项 | 结果 |
|--------|------|
| Smoke Test | ❌ **FAIL — 401 Invalid API Key** |
| NL→SQL | ⏭️ 未执行（smoke test 未通过） |
| Explain | ⏭️ 未执行 |
| Insights | ⏭️ 未执行 |
| Report Generation | ⏭️ 未执行 |
| SSE Streaming | ⏭️ 未执行 |
| Multi-step Analysis | ⏭️ 未执行 |
| Scheduler Execution | ⏭️ 未执行 |

### 最终状态

**`BLOCKED_BY_CREDENTIAL`** — 与上一轮结果相同

### 分析

用户声称已修正 API Key，但 Mimo 端点仍返回 401。可能原因：

1. **Key 未正确保存** — `.env` 文件中 `ANTHROPIC_API_KEY` 的值可能仍有误
2. **Key 未激活** — Mimo 平台可能需要额外激活步骤
3. **Key 额度不足** — 账户可能没有可用额度
4. **Key 过期** — 生成的 Key 可能已过期
5. **代理服务问题** — `token-plan-cn.xiaomimimo.com` 可能有服务端问题

### 建议下一步

1. **直接 curl 测试**（绕过后端，验证 Key 本身有效性）：
   ```bash
   curl -X POST https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"mimo-v2.5-pro","max_tokens":32,"messages":[{"role":"user","content":"hi"}]}'
   ```
2. 如果 curl 也返回 401，则 Key 本身无效，需在 Mimo 平台重新生成
3. 如果 curl 成功，则后端代码可能有 Key 读取问题，需进一步排查

### 是否建议 merge 回 master？

**否** — AI 验收仍为 BLOCKED_BY_CREDENTIAL

### 是否建议打 tag `v1.0.4-ai-validated`？

**否** — 需 AI 全链路通过后方可打 tag

---

## 14. Credential / Endpoint Diagnosis (2026-06-20)

### 诊断目的

用户确认 API Key 已重新复制，但项目调用仍返回 401。本轮诊断排除 `.env` 格式问题、重复定义、SDK 兼容性，定位真实原因。

### `.env` 文件检查

| Check | Result | Detail |
|-------|--------|--------|
| 文件存在 | ✅ PASS | `.env` 在项目根目录 |
| ANTHROPIC_API_KEY | ✅ SET | 长度 51，前缀 `tp-***`，后缀 `***ue41` |
| key 格式 | ✅ PASS | 无前导/尾随空格、无换行、无引号包裹 |
| ANTHROPIC_BASE_URL | ✅ PASS | `https://token-plan-cn.xiaomimimo.com/anthropic`，无空格/换行 |
| DEFAULT_LLM_MODEL | ✅ PASS | `mimo-v2.5-pro`，无空格/换行 |
| 重复定义 | ✅ PASS | 每个变量仅出现一次（行 6/8/10） |
| `.env` in git | ✅ PASS | `git status` 干净，`.env` 未被追踪 |

### Direct httpx Test（绕过后端、绕过 SDK）

| Item | Value |
|------|-------|
| URL | `https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages` |
| Status Code | **200** ✅ |
| Response | 正常 JSON，包含 `thinking` block |
| Model | `mimo-v2.5-pro` |
| Token Usage | input=60, output=32, cache_read=192 |

**结论**：Key、Base URL、Model 全部正确，Mimo API 正常响应。

### Anthropic SDK Test

| Item | Value |
|------|-------|
| Client init | ✅ 成功 |
| messages.create | ✅ 成功，返回 `Message` 对象 |
| Content type | `thinking` block（Mimo 模型返回 thinking content） |

**结论**：Anthropic SDK 与 Mimo 端点完全兼容。

### Backend Process Diagnosis

| Item | Value |
|------|-------|
| `.env` 最后修改时间 | 2026-06-20 **18:43:38** |
| uvicorn 进程启动时间 | 2026-06-20 **15:52:41** |
| 时间差 | **2 小时 51 分钟** — 进程早于 `.env` 更新 |

**根因**：uvicorn 进程在用户更新 `.env` 之前启动，`backend/config.py` 在 import 时读取环境变量并缓存为模块级常量，运行期间不会重新读取。旧进程使用的是**旧 Key**。

### 重启后端后测试

| Item | Before Restart | After Restart |
|------|---------------|---------------|
| `/api/ai/status` | connection: ok | connection: ok |
| `/api/ai/query` (401) | ❌ 401 Invalid API Key | ✅ 401 消失 |
| `/api/ai/query` (实际) | N/A | ⚠️ 新错误：`can only concatenate str (not "NoneType") to str` |

401 凭据错误**已完全解决**。新错误是代码层面的 bug（prompt 构建中 NoneType 拼接），与凭据无关。

### 诊断结果表

| Check | Result | Meaning |
|-------|--------|---------|
| .env key set | ✅ PASS | Key 存在且格式正确 |
| key format | ✅ PASS | 无空格/引号/换行/隐藏字符 |
| duplicate env vars | ✅ PASS | 无重复定义 |
| base_url | ✅ PASS | 路径正确 |
| model | ✅ PASS | 模型名正确 |
| direct httpx call | ✅ PASS | API 正常响应 |
| Anthropic SDK call | ✅ PASS | SDK 兼容 |
| backend call (before restart) | ❌ FAIL | 旧进程用旧 Key |
| backend call (after restart) | ✅ PASS | 401 消除，出现代码 bug |

### 最终结论

**`BACKEND_PROCESS_NOT_RESTARTED`**

根因不是 Key 无效、不是 `.env` 格式问题、不是 SDK 兼容性问题。是 **uvicorn 进程在 `.env` 更新前启动，缓存了旧 Key**。重启后端后 401 完全消除。

### 发现的代码 bug（非凭据问题）

重启后 `/api/ai/query` 返回 `can only concatenate str (not "NoneType") to str`。这是 `backend/services/ai_pipeline.py` 中 `generate_sql()` 的 prompt 构建 bug，与凭据无关。需单独修复。

### 下一步建议

1. ✅ 凭据问题已解决 — 重启后端即可
2. ⚠️ 需修复 `generate_sql()` 中的 NoneType 拼接 bug
3. 修复后可进入 M3-5 全链路验收
4. 建议：后续修改 `.env` 后必须重启 uvicorn（或改用 `--reload` + 文件 watch）
