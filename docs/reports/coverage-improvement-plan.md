# Coverage Improvement Plan — v0.3.12

> Generated: 2026-05-23 | Target: 85%+ line coverage

## Current State

### Frontend (Vitest + v8)

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Statements | 40.55% | 85% | -44.45% |
| Branches | 23.88% | 85% | -61.12% |
| Functions | 42.20% | 85% | -42.80% |
| Lines | 38.25% | 85% | -46.75% |

**21 tests passed, 0 failed.**

### Backend (pytest-cov)

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Total Lines | 47% | 85% | -38% |

**28 tests passed, 0 failed (after DuckDB lock fix).**

## Uncovered Modules — Risk Assessment

### Frontend (HIGH RISK)

| Module | Coverage | Risk | Priority |
|--------|----------|------|----------|
| `services/api.ts` | 0% | **Critical** — all API calls untested | P0 |
| `services/logger.ts` | 0% | Medium — logging untested | P2 |
| `stores/data-store.ts` | 0% | **High** — global data state untested | P0 |
| `stores/workspace-store.ts` | 0% | **High** — layout persistence untested | P0 |
| `stores/sql-workspace-store.ts` | 0% | **High** — query execution state untested | P0 |
| `utils/cn.ts` | 0% | Low — utility function | P3 |
| `utils/index.ts` | 0% | Low — utility exports | P3 |

### Backend (HIGH RISK)

| Module | Coverage | Risk | Priority |
|--------|----------|------|----------|
| `models/schemas.py` | 0% | **Critical** — Pydantic models untested | P0 |
| `database/schema_detector.py` | 17% | **High** — schema inference untested | P0 |
| `database/file_loader.py` | 20% | **High** — file import untested | P0 |
| `database/data_quality.py` | 31% | **High** — quality engine untested | P1 |
| `routes/tables.py` | 39% | Medium — table listing untested | P1 |
| `routes/table_manage.py` | 41% | Medium — CRUD untested | P1 |
| `routes/upload.py` | 38% | Medium — upload untested | P1 |
| `routes/quality.py` | 56% | Low — quality route partially tested | P2 |

## Estimated Work

| Phase | Scope | Tests Needed | Est. Hours |
|-------|-------|-------------|------------|
| Phase 1 | P0: API service + core stores | ~15 tests | 3-4h |
| Phase 2 | P0: schemas + file_loader + schema_detector | ~12 tests | 3-4h |
| Phase 3 | P1: data_quality + routes (tables, upload, quality) | ~15 tests | 3-4h |
| Phase 4 | P2: logger + utils + edge cases | ~8 tests | 1-2h |
| **Total** | | **~50 tests** | **10-14h** |

## Recommendations

1. **Do NOT auto-generate tests** — each test should validate real behavior
2. **Prioritize P0 modules** — these are the highest-risk untested code
3. **Phase 1 first** — API service tests will unblock integration testing
4. **Schedule in v0.3.13 or v0.3.14** — this is too large for a single version

## Constraints

- v0.3.x is frozen for business features — test coverage work is allowed
- Coverage improvement is a **maintainability** task, not a feature task
- Each test must use real data (no mocks per PROJECT_RULES.md)
