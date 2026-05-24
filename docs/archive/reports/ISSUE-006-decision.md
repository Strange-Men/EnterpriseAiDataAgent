# ISSUE-006 Decision: SQL API Pagination

> Generated: 2026-05-23 | Version: v0.3.12

## 1. Current API Analysis

**Endpoint**: `POST /api/query` (backend/routes/query.py)

**Current behavior:**
```python
class QueryRequest(BaseModel):
    sql: str
    limit: int = 10000

# Applied as:
data = _sanitize_for_json(result["data"][:req.limit])
```

**Findings:**
- There IS a `limit` parameter (default 10,000, client-configurable up to 50,000 for export)
- There is NO `offset` parameter
- There is NO cursor-based pagination
- There is NO pagination metadata in response (total count, hasMore, nextCursor)
- The entire result set up to `limit` is returned in one response

**Verdict**: The API has a **server-side LIMIT** but **no pagination**. This is a half-measure.

## 2. What a True Pagination Fix Would Require

### Backend changes:
1. Add `offset: int = 0` or `cursor: str` parameter to `QueryRequest`
2. Modify `query_executor.execute()` to support `LIMIT x OFFSET y`
3. Return pagination metadata: `{ total, hasMore, nextOffset/cursor }`
4. For cursor-based: track stable sort order (needs ORDER BY enforcement)

### Frontend changes:
1. Infinite scroll or "Load More" in `sql-workspace-panel.tsx`
2. Accumulate results across pages in `sql-workspace-store.ts`
3. Update `data-table.tsx` to handle growing dataset
4. Add pagination state to Zustand store

### Files affected:
- `backend/routes/query.py` — request model + response
- `database/query_executor.py` — execute with offset
- `frontend-react/src/services/api.ts` — pagination params
- `frontend-react/src/stores/sql-workspace-store.ts` — pagination state
- `frontend-react/src/panels/sql-workspace-panel.tsx` — load more UI
- `frontend-react/src/components/ui/data-table.tsx` — infinite scroll

**Estimated effort**: 4-6 hours (full implementation + testing)

## 3. v0.3.x Compatibility Assessment

### Does this violate "禁止新增功能" (no new features)?

**Yes, partially.** Adding full server-side pagination with infinite scroll is a **new feature**:
- New API parameters
- New UI components (load more / infinite scroll)
- New state management logic
- New user interaction pattern

This goes beyond a bug fix or stability improvement.

### However, the current LIMIT-only approach IS a stability issue:
- 10,000 rows in one JSON response = large memory allocation
- No way to handle datasets > 10K rows properly
- Risk of OOM on very large queries

## 4. Recommendation

### v0.3.x (allowed): Transition Solutions

These are **stability/maintainability** improvements, not new features:

| Approach | Description | Effort | v0.3.x OK? |
|----------|-------------|--------|------------|
| **A. Lower default limit** | Change default from 10,000 to 5,000 + show count | 10 min | Yes |
| **B. Frontend lazy render** | Only render first 500 rows, virtualize the rest | 30 min | Yes |
| **C. Server-side LIMIT enforcement** | Hard cap at 10,000, return `hasMore: true` flag | 30 min | Yes |
| **D. Export-first pattern** | For large results, prompt user to export instead | 1h | Yes |

### v0.4.x (future): Full Pagination

| Approach | Description | Effort |
|----------|-------------|--------|
| **E. Offset pagination** | Classic LIMIT/OFFSET with page controls | 3h |
| **F. Cursor pagination** | Stable cursor for real-time data | 4h |
| **G. Infinite scroll** | Auto-load on scroll with cursor | 6h |

## 5. Recommended v0.3.x Action

**Apply Approach C** — Add `hasMore` flag to response:

```python
# In backend/routes/query.py
return {
    ...
    "hasMore": result["row_count"] > req.limit,
    "truncated": result["row_count"] > req.limit,
    "totalRows": result["row_count"],
}
```

This is a **stability fix** (prevents silent data truncation), not a new feature.
The frontend can show "Showing 10,000 of 50,000 rows — use EXPORT for full data."

**Effort**: ~30 minutes
**Risk**: Low (response field addition only, no breaking changes)
**Classification**: Stability improvement — ALLOWED in v0.3.x

## 6. Decision

| Question | Answer |
|----------|--------|
| Is the API truly without pagination? | Has LIMIT, no OFFSET/cursor |
| What files need changing for full fix? | 6 files (backend + frontend) |
| Is full pagination allowed in v0.3.x? | No — it's a new feature |
| What transition solution is allowed? | Add `hasMore`/`totalRows` to response |
| Should ISSUE-006 stay open? | Yes — move full pagination to v0.4.x backlog |
