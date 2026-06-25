# M4-8.5.4 CI Fix Report

## CI Failure Root Cause

Frontend CI failed because a dynamic i18n key was inferred as plain `string`, causing TypeScript to reject indexed access into the translation object.

## Failure Details

- **File**: `frontend-react/src/app/(shell)/__tests__/history-actions-clarity.test.tsx`
- **Lines**: 90, 91, 103, 104
- **Error Type**: TypeScript `TS7053` - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type

## Error Pattern

```typescript
const aiKeys = [
  "history.open-detail",
  "history.rerun-analysis",
  "history.export-md",
  "history.copy-question",
];
for (const key of aiKeys) {
  expect(zh.translation[key]).toBeDefined();  // Error: key is `string`
  expect(en.translation[key]).toBeDefined();  // Error: key is `string`
}
```

## Fix Applied

Used `as const` assertion to make TypeScript infer the array as a readonly tuple instead of `string[]`:

```typescript
const aiKeys = [
  "history.open-detail",
  "history.rerun-analysis",
  "history.export-md",
  "history.copy-question",
] as const;  // Now TypeScript knows the exact literal types
```

## Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `npm run test` | ✅ 689 tests passed |
| `npm run build` | ✅ Compiled successfully |
| `npm run lint` | ✅ Pass (only warnings) |
| `python -c "from backend.main import app"` | ✅ backend import OK |

## Impact Assessment

- **Business Logic**: ❌ Not changed
- **API**: ❌ Not changed
- **Store Data Structure**: ❌ Not changed
- **Backend**: ❌ Not changed
- **SQL Execution**: ❌ Not changed
- **AI Query Pipeline**: ❌ Not changed
- **Export Logic**: ❌ Not changed

## Files Modified

1. `frontend-react/src/app/(shell)/__tests__/history-actions-clarity.test.tsx` - Added `as const` assertions to fix TypeScript type inference

## Commit

- **Message**: `fix: type stale history i18n labels`
- **Branch**: `m4-8-5-4-stale-table-invalid-record`

## Recommendation

1. ✅ Safe to merge M4-8.5.4 to master
2. ✅ Safe to proceed to M4-8.5.5
3. ❌ Still prohibited from starting M5 Agent
4. ❌ No tag yet (pending merge)
