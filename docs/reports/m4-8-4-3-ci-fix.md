# M4-8.4.3 CI Frontend Type Fix

## 1. CI Failure

GitHub Actions `CI` workflow on branch `m4-8-4-3-sql-trace-appendix-folding` failed at the frontend job.

**Error**:

```text
src/app/(shell)/__tests__/analysis-detail-sql-trace-appendix.test.tsx(77,7): error TS2739:
Type '{ phase: string; operation: string; status: "success"; latency_ms: number; input_tokens: number; output_tokens: number; }'
is missing the following properties from type 'TraceEvent': timestamp, prompt_name

src/app/(shell)/__tests__/analysis-detail-sql-trace-appendix.test.tsx(85,7): error TS2739:
(same)
```

## 2. Root Cause

Test file `analysis-detail-sql-trace-appendix.test.tsx` 中 `makeTrace()` 函数的两个 mock `TraceEvent` 对象缺少 `timestamp` 和 `prompt_name` 字段。

`TraceEvent` 接口定义在 `frontend-react/src/stores/analysis-store.ts`：

```ts
export interface TraceEvent {
  timestamp: string;      // ← missing in mock
  operation: string;
  phase: string;
  prompt_name: string;    // ← missing in mock
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: "success" | "error";
  error?: string;
  sql?: string;
  step?: number;
}
```

## 3. Fix

补齐两个 mock 对象的必填字段：

```ts
// Before (line 77)
{ phase: "planning", operation: "generate_plan", status: "success", latency_ms: 500, input_tokens: 80, output_tokens: 30 }

// After
{ timestamp: "2026-06-24T10:00:01Z", phase: "planning", operation: "generate_plan", prompt_name: "analysis_plan", status: "success", latency_ms: 500, input_tokens: 80, output_tokens: 30 }
```

同理修复 line 85 的第二个 mock。

## 4. Changed Files

| File | Change |
|------|--------|
| `frontend-react/src/app/(shell)/__tests__/analysis-detail-sql-trace-appendix.test.tsx` | 补齐 2 个 mock TraceEvent 的 `timestamp` 和 `prompt_name` |
| `docs/reports/m4-8-4-3-sql-trace-appendix-folding.md` | 新增 CI Fix 章节 |
| `docs/reports/m4-8-4-3-ci-fix.md` | 本报告 |

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass (0 errors) |
| vitest run | ✅ 29 files, 541 tests passed |
| next build | ✅ compiled successfully |
| next lint | ✅ 3 warnings (pre-existing only) |
| backend import | ✅ OK |

## 6. What Was NOT Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改 Markdown export
- 未改 Trace data source
- 未改类型定义（未将字段改为 optional）
- 未用 `as any` / `@ts-ignore`
- 未改 CI 配置

## 7. Status

修复完成，可重新 push 验证 CI。
