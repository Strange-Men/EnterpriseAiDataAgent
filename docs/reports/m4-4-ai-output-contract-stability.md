# M4-4 AI Output Contract & Runtime Stability Fix

**版本**: v1.0.4
**日期**: 2026-06-21
**分支**: m4-4-ai-output-contract-stability

---

## 1. Problems Found

| # | Problem | Severity | Layer |
|---|---------|----------|-------|
| 1 | ThinkingBlock / signature 泄漏到用户可见摘要 | High | Backend |
| 2 | SQL 后面混入中文解释/映射文本，导致 DuckDB parser error | High | Backend |
| 3 | `Failed to parse LLM response as JSON` 无 fallback | Medium | Backend |
| 4 | React error #185 / #31 — object 作为 React child 渲染 | High | Frontend |
| 5 | "问数"文案不自然 | Low | Frontend i18n |
| 6 | 版本显示 v1.0.2 过旧 | Low | Config |

---

## 2. Root Causes

### Backend

- **ThinkingBlock 泄漏**: `_call_llm` 使用 `hasattr(block, "text")` 检查，未按 `block.type` 过滤。ThinkingBlock 有 `.text` 属性（可能为 None 或非空），被拼入结果。fallback `str(response.content[0])` 会生成 `ThinkingBlock(...)` repr。

- **SQL 混入解释文本**: `_trim_to_first_statement` 只在分号处截断。LLM 返回 SQL 后跟中文解释（无分号），整段被送入 DuckDB。

- **JSON parse failure**: `parse_llm_json` 在所有策略失败后 raise `JSONDecodeError`，部分调用方 catch 后返回空结构，用户看到的是技术性错误。

### Frontend

- **React crash**: `AnalysisSectionView` 将 `section.content` 直接传给 ReactMarkdown，若 content 是 object（非 string）会触发 React error #185。`StepResults` 直接渲染 `step.error`，evaluation 的 `diagnostics`/`suggested_improvements` 未做 array guard。

---

## 3. Backend Fixes

### 3.1 Visible Text Extraction (`ai_analyst.py`)

新增 `_extract_visible_text(blocks)`:
- 只提取 `block.type == "text"` 且 `block.text` 为非空 string 的 block
- 忽略 thinking / signature / unknown 类型
- 移除 `str(response.content[0])` fallback（不再生成 block repr）

```python
def _extract_visible_text(blocks) -> str:
    parts = []
    for block in blocks or []:
        block_type = getattr(block, "type", None)
        text = getattr(block, "text", None)
        if block_type == "text" and isinstance(text, str) and text.strip():
            parts.append(text)
    return "\n".join(parts).strip()
```

### 3.2 SQL Extraction (`llm_sql.py`)

增强 `_trim_to_first_statement`:
- 分号后截断（原有逻辑）
- 无分号时逐行检测，遇到 prose 行（中文解释、映射说明）则停止
- 新增 `_is_prose_line` 检测：非 ASCII 开头且不含 SQL 关键词的行视为 prose

### 3.3 JSON Parse (`llm_json.py`)

- 改善错误消息，截断 raw 文本避免过长
- 空输入直接 raise（避免无意义解析）

---

## 4. Frontend Fixes

### 4.1 Safe Render Utility (`utils/safe-render.ts`)

新增工具函数：
- `renderSafeText(value, fallback)`: 任意值 → 安全 string
- `safeMarkdownContent(value, fallback)`: 确保 ReactMarkdown 输入为 string
- `safeArray(value)`: 确保 map/forEach 目标为 array
- `safeErrorText(value)`: Error/string/object → 安全错误文案

### 4.2 Component Guards

| Component | Fix |
|-----------|-----|
| `analysis-section.tsx` | `safeMarkdownContent(section.content)` 替代直接传入 |
| `step-results.tsx` | `renderSafeText(step.error)` 替代直接渲染 |
| `ai-analysis-panel.tsx` | `safeArray(evaluation.diagnostics)` + `renderSafeText` |
| `error-boundary.tsx` | `safeErrorText(error)` 替代 `error.message` |
| `error-fallback.tsx` | `safeErrorText(error)` 一致性 |

---

## 5. Naming / Version Fixes

### 5.1 文案修改

| Key | Before | After |
|-----|--------|-------|
| `workspace.tab.ai-query` | AI 问数 | 自然语言查询 |
| `workspace.ai-query-title` | 自然语言问数 | AI 数据分析 |
| `workspace.ai-query-subtitle` | AI 会根据当前数据表生成 SQL... | 用自然语言描述问题，AI 会生成 SQL... |
| `ai.error-json-parse` (zh) | ...后续将在 M4-4 修复输出契约。 | AI 返回格式不符合预期，已保留原始响应。 |
| `ai.error-json-parse` (en) | ...This will be fixed in M4-4. | AI returned an unexpected format. |

### 5.2 版本更新

| File | Before | After |
|------|--------|-------|
| `backend/VERSION` | 1.0.2 | 1.0.4 |
| `frontend-react/package.json` | 1.0.2 | 1.0.4 |

### 5.3 Tag 策略

- 当前不打 tag
- AI 输出契约和线上稳定通过后，可考虑 `v1.0.5-ui-ai-stability`
- 真正 Agent 做到后再进入 `v1.1.0`

---

## 6. Tests Added

### Backend (`tests/test_m4_4_output_contract.py`)

| Test Class | Coverage |
|------------|----------|
| `TestExtractVisibleText` (8 tests) | text block 提取、thinking block 忽略、None/empty text、signature block、多 block 拼接 |
| `TestSqlExtractionMixedContent` (8 tests) | SQL+中文解释、fenced block、mapping text、non-SQL、dangerous SQL、INSERT/DELETE 拒绝 |
| `TestJsonParseFallback` (6 tests) | valid JSON、fenced JSON、surrounding text、empty string、non-JSON |

### Updated Tests

| File | Change |
|------|--------|
| `test_ai_analyst_retry.py` | Mock blocks 添加 `type="text"` |
| `test_ai_nonetype_fix.py` | Mock blocks 添加 `type="thinking"/"text"` |

### Frontend (`src/utils/__tests__/safe-render.test.ts`)

| Test Suite | Coverage |
|------------|----------|
| `renderSafeText` (7 tests) | string/number/boolean/null/undefined/object/array |
| `safeMarkdownContent` (5 tests) | normal string/empty/non-string/fallback |
| `safeArray` (5 tests) | array/null/undefined/non-array/empty |
| `safeErrorText` (5 tests) | Error/string/object/null/default |

---

## 7. Validation Results

| Check | Result |
|-------|--------|
| `python -c "from backend.main import app"` | ✅ OK |
| `python -m pytest tests/ -x -q --ignore=tests/ai` | ✅ 449 passed |
| `npx tsc --noEmit` | ✅ OK |
| `npm run test` | ✅ 135 passed (11 files) |
| `npx next build` | ✅ Compiled successfully |

---

## 8. Remaining Risks

1. **Mimo 输出不稳定性**: 模型仍可能返回非标准格式，但系统现在能降级处理
2. **ThinkingBlock 类型检查**: 依赖 Anthropic SDK 的 block type 属性，若 SDK 变更需同步更新
3. **SQL prose 检测**: 基于启发式规则，极端情况可能误判
4. **非 Agent 架构**: 本次修复是输出契约和稳定性，不是 Agent 架构升级

---

## 9. Next Step

1. 合并 `m4-4-ai-output-contract-stability` 到 `master`
2. 线上验证 AI 分析链路稳定性
3. 观察 ThinkingBlock / SQL parser error / React crash 是否消失
4. 如稳定，可考虑 M4-5 组件拆分或直接进入 M5 Agent
5. 真正 Agent 能力放到 M5 再做
