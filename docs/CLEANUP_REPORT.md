# Cleanup Report — Enterprise AI Data Agent

> Audit date: 2026-05-25 | Version: v0.7.6

## 1. Dead Code

### Backend

| File | Lines | Issue | Recommendation |
|------|-------|-------|----------------|
| `backend/models/schemas.py` | 65 | **Never imported** by any backend code. All routes define Pydantic models inline. | Delete |
| `database/schema_detector.py::get_data_quality_report()` | 25 | Duplicate of `data_quality.analyze_dataframe()`. Not used by any service. | Remove function |
| `backend/services/ai_analyst.py::_safe_serialize()` | 10 | Duplicates `json_safe.json_safe_encoder()`. Only used in one place (`build_follow_up_context`). | Replace with `json_safe_encoder` |
| `backend/prompts/self_evaluation.py::_truncate()` | 5 | Identical to `shared_utils.truncate()`. Defined locally instead of importing. | Import from shared_utils |
| `backend/prompts/contracts.py::PromptContract.validate_vars()` | 8 | Defined but **never called** anywhere in the codebase. | Either integrate or remove |
| `backend/prompts/registry.py::list_prompts()` | 4 | Exported but never called by any service or route. Only useful for introspection. | Keep for debugging, or remove |
| `backend/prompts/registry.py::get_system_prompt()` | 4 | Same as above. | Keep for debugging, or remove |

### Frontend

| File | Lines | Issue | Recommendation |
|------|-------|-------|----------------|
| `components/VirtualDataTable.tsx` | 529 | **Only imported by orphaned demo page** (`app/virtual-table/page.tsx`). Never used in main workspace. | Archive or delete |
| `app/performance/page.tsx` | 336 | **Orphaned page** — not linked from main navigation. Standalone benchmark. | Archive or delete |
| `app/virtual-table/page.tsx` | 35 | **Orphaned page** — separate demo, not integrated. Linked from Header via `<a>`. | Archive or delete |
| `stores/sql-workspace-store.ts::currentSql` | field | **Dead state** — written by `table-management-panel.tsx` but never read. Editor reads from `query-tabs-store`. | Remove field, fix table-management-panel |
| `stores/sql-workspace-store.ts::activeTab` | field | **Dead state** — "editor"|"history" toggle never called from any component. Panel uses `query-tabs-store.activeTabId`. | Remove field |
| `hooks/use-tables.ts` | 25 | Minor: used by 2 panels. Not dead, but could be inlined. | Keep (not dead, just small) |

---

## 2. Stale Documentation

### Critical Staleness

| File | Issue | Current | Should Be |
|------|-------|---------|-----------|
| `SESSION_SUMMARY_TEMPLATE.md` | Completely outdated | v0.3.12 | v0.7.6 |
| `PROJECT_RULES.md` section 3 | Version mismatch | "v0.6.0" | v0.7.6 |
| `CLAUDE.md` line 9 | Version mismatch | "v0.7.5" | v0.7.6 |
| `README.md` | Version mismatch | "v0.7.5" | v0.7.6 |
| `docs/architecture/版本记录.md` | Missing v0.7.6 entry | Latest: v0.7.5 | v0.7.6 |
| `docs/architecture/开发路线图.md` | Missing v0.7.6 entry | Latest: v0.7.5 | v0.7.6 |

### Moderate Staleness

| File | Issue |
|------|-------|
| `docs/README.md` | Says "v0.6.0", references non-existent `docs/performance/performance-baseline.md` |
| `docs/governance/REPOSITORY_HEALTH.md` | Says "v0.6.1", test counts outdated (239 BE vs 341+) |
| `docs/governance/DOCUMENTATION_LIFECYCLE.md` | Lists `docs/frontend_rules/` and `docs/performance/` as "active" — both archived |
| `docs/governance/AB_TESTING.md` | References decided A/B tests, may be stale |

### Minor Staleness

| File | Issue |
|------|-------|
| `PROJECT_RULES.md` section 2.7 | References `docs/frontend_rules/` — archived since v0.6.0 |
| `PROJECT_RULES.md` section 3 | "当前重点" reflects v0.6.0 priorities, not v0.7.x |
| `docs/governance/AB_TESTING.md` | Zustand and Tailwind A/B tests closed, but doc may still have open questions |

---

## 3. Stale Skills

| Skill | Last Updated | Issue |
|-------|-------------|-------|
| `ai-sql-analysis.md` | v0.5.1 | Does not mention anomaly detection, multi-step analysis, self-evaluation |
| `auto-analysis-pipeline.md` | v0.5.1 | References old `/api/analyze/{table_name}` endpoint; canonical flow now uses `/ai/analyze-multi` |
| `prompt-architecture.md` | v0.5.4 | Lists 8 modules but registry now has 11 (missing anomaly_interpretation, self_evaluation, template_adaptation) |
| `token-budget-control.md` | v0.5.4 | Budget table has 8 operations but now has 10 (missing anomaly_interpretation, self_evaluation) |

---

## 4. File System Rule Violations

### Placement Violations

| File | Current Location | Should Be | Rule Violated |
|------|-----------------|-----------|---------------|
| `docs/ROOT_CAUSE_ANALYSIS.md` | `docs/` root | `docs/reports/` | Reports go in `docs/reports/` |
| `docs/SYSTEM_ARCHITECTURE_STATE.md` | `docs/` root | `docs/architecture/` | Architecture docs go in `docs/architecture/` |
| `docs/KNOWN_RUNTIME_RISKS.md` | `docs/` root | `docs/governance/` or `docs/architecture/` | Not loose in `docs/` |
| `docs/FULL_RUNTIME_VALIDATION_REPORT.md` | `docs/` root | `docs/reports/` | Reports go in `docs/reports/` |
| `docs/MVP_READINESS_REPORT.md` | `docs/` root | `docs/reports/` | Reports go in `docs/reports/` |
| `docs/TEST_COVERAGE_GAPS.md` | `docs/` root | `docs/testing/` or `docs/reports/` | Not loose in `docs/` |
| `docs/CLEANUP_REPORT.md` | `docs/` root | `docs/reports/` | Reports go in `docs/reports/` |

### Naming Violations

| File | Issue | Rule |
|------|-------|------|
| `docs/testing/TESTING_STRATEGY.md` | UPPER-KEBAB-CASE | Testing docs should use `kebab-case.md` |

### Missing Directories

| Directory | Referenced By | Status |
|-----------|--------------|--------|
| `docs/reports/` | FILE_SYSTEM_RULES.md | **Does not exist** |
| `skills/stable/` | SKILL_LIFECYCLE.md | Does not exist |
| `skills/archived/` | SKILL_LIFECYCLE.md | Does not exist |
| `skills/deprecated/` | SKILL_LIFECYCLE.md | Does not exist |

---

## 5. Duplicate Systems

| System | Location 1 | Location 2 | Resolution |
|--------|-----------|-----------|------------|
| Quality report | `schema_detector.get_data_quality_report()` | `data_quality.analyze_dataframe()` | Remove from schema_detector |
| JSON serialization | `ai_analyst._safe_serialize()` | `json_safe.json_safe_encoder()` | Remove _safe_serialize |
| Text truncation | `self_evaluation._truncate()` | `shared_utils.truncate()` | Import shared_utils |
| SQL state | `sql-workspace-store.currentSql` | `query-tabs-store.tabs[].sql` | Remove from sql-workspace-store |
| History fetching | `sql-workspace-panel.tsx` fetchHistory() | `sql-history-panel.tsx` fetchQueryHistory() | Remove from sql-history-panel |
| API endpoint lists | CLAUDE.md + README.md + SYSTEM_ARCHITECTURE_STATE.md | 3 copies | Single source of truth |
| Version roadmap | PROJECT_RULES.md + README.md + 开发路线图.md | 3 copies | Single source of truth |

---

## 6. Orphan Files

| File | Status | Recommendation |
|------|--------|----------------|
| `app/performance/page.tsx` | Not reachable from main navigation | Archive to `docs/archive/` or delete |
| `app/virtual-table/page.tsx` | Separate demo page, not integrated | Archive or delete |
| `components/VirtualDataTable.tsx` | Only used by orphaned page | Archive or delete |
| `docs/archive/performance-baseline.md` | Broken link from docs/README.md | Fix docs/README.md link |

---

## 7. .gitignore Gaps

| Entry | Status |
|-------|--------|
| `frontend-react/.next/` | **Missing** — Next.js build cache not gitignored at root level |
| `error_logs/` | Tracked by git — consider whether error logs should be gitignored |

---

## 8. Cleanup Action Plan

### Quick Wins (< 30 min each)
1. Delete `backend/models/schemas.py` (dead code, 65 lines)
2. Remove `_safe_serialize()` from `ai_analyst.py`, use `json_safe_encoder()`
3. Remove `_truncate()` from `self_evaluation.py`, import from `shared_utils`
4. Remove `get_data_quality_report()` from `schema_detector.py`
5. Fix state duplication: `table-management-panel.tsx` -> `query-tabs-store.updateTabSql()`
6. Remove `currentSql` and `activeTab` from `sql-workspace-store.ts`
7. Remove duplicate history fetch from `sql-history-panel.tsx`
8. Delete orphaned pages (`performance/`, `virtual-table/`, `VirtualDataTable.tsx`)
9. Add `frontend-react/.next/` to `.gitignore`
10. Create `docs/reports/` directory

### Medium Effort (1-2 hours each)
11. Fix all version references to v0.7.6 (CLAUDE.md, README.md, PROJECT_RULES.md, 版本记录.md, 开发路线图.md)
12. Update 4 stale skills (ai-sql-analysis, auto-analysis-pipeline, prompt-architecture, token-budget-control)
13. Fix docs/README.md (remove broken links, update version)
14. Fix DOCUMENTATION_LIFECYCLE.md (remove archived references)
15. Move 6 loose docs from `docs/` root to `docs/reports/` or `docs/architecture/`
16. Rename `TESTING_STRATEGY.md` to `testing-strategy.md`
17. Rewrite `SESSION_SUMMARY_TEMPLATE.md` for v0.7.6

### Larger Effort (half day each)
18. Add AI pipeline integration tests (mocked LLM)
19. Fix DuckDB lock in test fixtures (use `:memory:`)
20. Split `routes/ai.py` into sub-modules
21. Split `ai_analyst.py` into sub-modules
22. Add schema versioning to persisted stores

---

## 9. Documentation Duplication Map

```
Version number: CLAUDE.md, CURRENT_SESSION.md, PROJECT_RULES.md, README.md, 版本记录.md
API endpoints:  CLAUDE.md, README.md, SYSTEM_ARCHITECTURE_STATE.md
Roadmap:        PROJECT_RULES.md, README.md, 开发路线图.md
Architecture:   CLAUDE.md, README.md, SYSTEM_ARCHITECTURE_STATE.md, 项目架构说明.md
```

**Recommendation**: Designate single sources of truth:
- Version: `CURRENT_SESSION.md` (always current) + `版本记录.md` (canonical history)
- API endpoints: Auto-generate from route files, or keep only in README.md
- Roadmap: `开发路线图.md` only, reference from other docs
- Architecture: `SYSTEM_ARCHITECTURE_STATE.md` only, reference from other docs
