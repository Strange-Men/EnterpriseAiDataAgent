# Legacy Removal Plan

> Generated: 2026-06-01 | Scope: Product Readiness Consolidation (Phase B)
> Goal: Safe deletion plan for workspace-legacy — NO deletion without proof

---

## 1. Executive Summary

The `/workspace-legacy` route is **NOT fully migrated**. The data/store layer migration is complete, but the route, UI entry points, and associated dead code remain. The migration plan (`PHASE2_MIGRATION.md`) targets deletion in v0.9.0.

**Migration status: ~60% complete**

| Layer | Status |
|-------|--------|
| Store/data migration | ✅ Complete (`migrateFromLegacy()` in 2 stores) |
| Shell routes (`/data`, `/query`, `/history`) | ✅ Migrated (v0.8.5) |
| `/workspace-legacy` route | ❌ Still exists and is functional |
| Sidebar link | ❌ Still active |
| Settings page link | ❌ Still active |
| i18n keys | ❌ Still active |
| Dead test files | ❌ 4 orphaned test files |
| Documentation references | ❌ 20+ files reference legacy |

---

## 2. Deletion Inventory

### 2a. SAFE TO DELETE NOW (dead code, no dependencies)

| Item | Path | Reason |
|------|------|--------|
| Dead test: workflow-store | `frontend-react/src/stores/__tests__/workflow-store.test.ts` | Source file `workflow-store.ts` deleted |
| Dead test: ai-session-store | `frontend-react/src/stores/__tests__/ai-session-store.test.ts` | Source file `ai-session-store.ts` deleted |
| Dead test: query-tabs-store | `frontend-react/src/stores/__tests__/query-tabs-store.test.ts` | Source file `query-tabs-store.ts` deleted |
| Dead test: sql-workspace-store | `frontend-react/src/stores/__tests__/sql-workspace-store.test.ts` | Source file `sql-workspace-store.ts` deleted |

**Risk: ZERO** — These test files import from deleted store modules. They cannot pass.

### 2b. DELETE WITH ROUTE REMOVAL (v0.9.0 or earlier)

| Item | Path | Dependencies |
|------|------|-------------|
| Legacy page component | `frontend-react/src/app/workspace-legacy/page.tsx` | None (standalone page) |
| Sidebar legacy link | `frontend-react/src/layout/sidebar.tsx` (line ~72) | i18n key `nav.legacy-workspace` |
| Settings legacy link | `frontend-react/src/app/(shell)/settings/page.tsx` (line ~62) | None |
| i18n key (en) | `frontend-react/src/i18n/en.ts` line 397 | `nav.legacy-workspace` |
| i18n key (zh) | `frontend-react/src/i18n/zh.ts` line 397 | `nav.legacy-workspace` |

### 2c. KEEP (active migration bridges)

| Item | Path | Reason |
|------|------|--------|
| `migrateFromLegacy()` | `frontend-react/src/stores/investigation-store.ts` | Migrates user localStorage from `"ai-session"` → `"investigation"` |
| `migrateFromLegacy()` | `frontend-react/src/stores/sql-editor-store.ts` | Migrates user localStorage from `"query-tabs"` → `"sql-editor"` |
| `LEGACY_KEY` constants | Both stores above | Required by migration functions |

**Note:** These migration functions should be kept for at least 2 more versions after route removal to handle returning users with old localStorage data.

### 2d. KEEP (shared components)

| Item | Path | Reason |
|------|------|--------|
| 9 panel components | `frontend-react/src/panels/*.tsx` | Shared with new shell pages (`/query`, `/history`, `/data`) |

Removing `workspace-legacy` will NOT make these panels dead code.

---

## 3. Execution Plan

### Phase 1: Immediate (v0.8.6) — Delete Dead Code

```bash
# Delete 4 orphaned test files
git rm frontend-react/src/stores/__tests__/workflow-store.test.ts
git rm frontend-react/src/stores/__tests__/ai-session-store.test.ts
git rm frontend-react/src/stores/__tests__/query-tabs-store.test.ts
git rm frontend-react/src/stores/__tests__/sql-workspace-store.test.ts
```

**Validation:**
- `npx vitest run` — should pass (these tests were already failing)
- `npx tsc --noEmit` — should pass
- `npx next build` — should pass

### Phase 2: Route Removal (v0.9.0 or earlier)

```bash
# 1. Delete legacy page
git rm frontend-react/src/app/workspace-legacy/page.tsx

# 2. Remove sidebar link (edit sidebar.tsx)
# Remove the <a href="/workspace-legacy"> block and surrounding code

# 3. Remove settings link (edit settings/page.tsx)
# Remove the <a href="/workspace-legacy"> block and surrounding code

# 4. Remove i18n keys
# Remove "nav.legacy-workspace" from en.ts and zh.ts

# 5. Clean build artifacts
cd frontend-react && rm -rf .next
```

**Validation:**
- `npx next build` — must pass, `/workspace-legacy` should return 404
- `npx tsc --noEmit` — must pass
- Manual: visit `http://localhost:3000/workspace-legacy` → should 404
- Manual: sidebar should have no legacy link
- Manual: settings page should have no legacy link

### Phase 3: Migration Bridge Sunset (v0.10.0+)

After 2+ versions with no legacy route:
- Remove `migrateFromLegacy()` from `investigation-store.ts`
- Remove `migrateFromLegacy()` from `sql-editor-store.ts`
- Remove `LEGACY_KEY` constants
- Remove migration comments

---

## 4. Documentation Cleanup

After route removal, update these files:

| File | Action |
|------|--------|
| `docs/PHASE2_MIGRATION.md` | Mark Step 4 as complete |
| `docs/V08_ARCHITECTURE_STATE.md` | Remove workspace-legacy from architecture diagram |
| `docs/UI_FLOW_MAP.md` | Remove legacy workspace flow |
| `docs/V08_UX_SYSTEM_CONSISTENCY.md` | Remove legacy references |
| `docs/reports/NEXT_90_DAYS_PLAN.md` | Mark Task 6 as complete |
| `docs/reports/PRODUCTIZATION_GAP_REPORT.md` | Update legacy-related items |
| `README.md` | Remove any legacy workspace mentions |

---

## 5. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Returning users lose localStorage data | LOW | `migrateFromLegacy()` kept in stores |
| Broken import from deleted test files | ZERO | Tests already fail (source deleted) |
| Panels become dead code | ZERO | Panels shared with new shell pages |
| Build breaks after route deletion | LOW | Next.js handles missing routes gracefully |
| Documentation references break | LOW | Update docs in same commit |

---

## 6. Verification Checklist

After Phase 1 (dead test deletion):
- [ ] `npx vitest run` passes (or fails only on pre-existing issues)
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next build` passes

After Phase 2 (route removal):
- [ ] `npx next build` passes
- [ ] `/workspace-legacy` returns 404
- [ ] Sidebar has no legacy link
- [ ] Settings page has no legacy link
- [ ] i18n builds without unused key warnings
- [ ] All new shell routes still work (`/data`, `/query`, `/history`)
- [ ] `migrateFromLegacy()` still functional in stores
