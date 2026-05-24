# File System Rules — Enterprise AI Data Agent

> Mandatory repository architecture governance. All development must follow these rules.

## 1. Repository Layer Definition

| Layer | Directory | Purpose |
|-------|-----------|---------|
| **Frontend** | `frontend-react/` | Next.js 15 + React 19 + TypeScript |
| **Backend** | `backend/` | FastAPI + Uvicorn |
| **Database** | `database/` | DuckDB schema, queries, migrations |
| **Testing** | `tests/`, `frontend-react/e2e/`, `frontend-react/src/**/__tests__/` | Unit, integration, E2E |
| **Governance** | `docs/governance/` | Rules, workflows, standards |
| **Architecture** | `docs/architecture/` | System design, roadmaps, version history |
| **Reports** | `docs/reports/` | Version deliverable reports |
| **Skills** | `skills/active/`, `skills/stable/`, `skills/archived/` | Reusable skill documentation |
| **Scripts** | `scripts/` | Automation scripts (create if needed) |
| **Logs** | `error_logs/` | Error reports and debug logs |
| **Test Data** | `testExcel/` | Test datasets (CSV, XLSX) |
| **Temp** | `temp/` | Temporary files only (git-ignored) |

## 2. File Placement Rules

### Root Level (STRICT — only these files allowed)

| File | Required | Description |
|------|----------|-------------|
| `CLAUDE.md` | Yes | Long-term Claude rules |
| `PROJECT_RULES.md` | Yes | Mandatory development rules |
| `KNOWN_ISSUES.md` | Yes | Open issues tracker |
| `CURRENT_SESSION.md` | Yes | Session persistence |
| `SESSION_SUMMARY_TEMPLATE.md` | Yes | Session restore template |
| `README.md` | Yes | Project overview |
| `.gitignore` | Yes | Git ignore rules |
| `.env.example` | Yes | Environment template |
| `requirements.txt` | Yes | Python dependencies |
| `requirements.lock` | Yes | Python dependency lock |

**NO** `.md` files in root other than the above. **NO** debug artifacts. **NO** temp scripts.

### Frontend Layer (`frontend-react/src/`)

| Type | Directory | Pattern | Example |
|------|-----------|---------|---------|
| Pages/Routes | `src/app/` | `page.tsx`, `layout.tsx` | `src/app/page.tsx` |
| Components | `src/components/` | `kebab-case.tsx` | `monaco-sql-editor.tsx` |
| UI Primitives | `src/components/ui/` | `kebab-case.tsx` | `data-table.tsx` |
| Panels | `src/panels/` | `kebab-case-panel.tsx` | `sql-workspace-panel.tsx` |
| Hooks | `src/hooks/` | `use-kebab-case.ts` | `use-theme.ts` |
| Services | `src/services/` | `kebab-case.ts` | `api.ts`, `logger.ts` |
| Stores | `src/stores/` | `kebab-case-store.ts` | `data-store.ts` |
| Types | `src/types/` | `index.ts`, `*.d.ts` | `index.ts` |
| Utils | `src/utils/` | `kebab-case.ts` | `cn.ts` |
| Styles | `src/styles/` | `kebab-case.css` | `globals.css` |
| i18n | `src/i18n/` | `lang-code.ts` | `en.ts`, `zh.ts` |
| Unit Tests | `src/**/__tests__/` | `*.test.ts` | `query-tabs-store.test.ts` |

### Backend Layer (`backend/`)

| Type | Directory | Pattern | Example |
|------|-----------|---------|---------|
| Routes | `backend/routes/` | `kebab-case.py` | `query.py`, `tables.py` |
| Services | `backend/services/` | `kebab-case.py` | `data_service.py` |
| Models | `backend/models/` | `kebab-case.py` | `schemas.py` |
| Middleware | `backend/middleware/` | `kebab-case.py` | (future) |
| Entry | `backend/` | `main.py` | `main.py` |

### Database Layer (`database/`)

| Type | Directory | Pattern | Example |
|------|-----------|---------|---------|
| Core | `database/` | `snake_case.py` | `db_manager.py`, `query_executor.py` |
| Schemas | `database/schemas/` | `version-name.sql` | (future) |
| Migrations | `database/migrations/` | `version-name.sql` | (future) |

### Testing Layer

| Type | Directory | Pattern | Example |
|------|-----------|---------|---------|
| Backend Unit | `tests/` | `test_*.py` | `test_query_executor.py` |
| Frontend Unit | `frontend-react/src/**/__tests__/` | `*.test.ts` | `data-store.test.ts` |
| E2E | `frontend-react/e2e/` | `*.spec.ts` | `sql-workspace.spec.ts` |
| Test Data | `testExcel/` | `*.xlsx`, `*.csv` | `sales_data.xlsx` |

### Documentation Layer (`docs/`)

| Type | Directory | Pattern | Example |
|------|-----------|---------|---------|
| Architecture | `docs/architecture/` | `*.md` (zh allowed) | `版本记录.md` |
| Governance | `docs/governance/` | `UPPER-KEBAB-CASE.md` | `FILE_SYSTEM_RULES.md` |
| Testing | `docs/testing/` | `kebab-case.md` | `testing-strategy.md` |
| Reports | `docs/reports/` | `v{ver}-{type}.md` | `v0.3.10-bug-fixes.md` |
| Skills | `skills/active/`, `skills/stable/`, `skills/archived/` | `kebab-case.md` | `ai-sql-analysis.md` |
| Frontend Rules | `docs/frontend_rules/` | `kebab-case.md` | `agents-capability-guide.md` |
| Archive | `docs/archive/` | Original names preserved | — |

### Error Logs (`error_logs/`)

| Type | Directory | Pattern | Example |
|------|-----------|---------|---------|
| Backend | `error_logs/backend/` | `.gitkeep` | — |
| Frontend | `error_logs/frontend/` | `.gitkeep` | — |
| Reports | `error_logs/reports/` | `YYYY-MM-DD_category.md` | `2025-05-23_api-error.md` |

## 3. Forbidden Placement

### Absolutely Forbidden in Root

- Debug artifacts: `debug*.png`, `debug*.py`, `*.screenshot.png`
- Temp scripts: `test_*.py`, `check_*.py`, `fix_*.py`
- Random `.md` files not in the allowed list
- `__pycache__/` directories
- `.pytest_cache/`
- `.idea/` (IDE config)

### Forbidden Anywhere

- Duplicated docs (same content in multiple locations)
- `node_modules/` committed to git
- `.env` files committed to git
- `.duckdb` files in `backend/` (should be in `data/`)
- Orphan files with no clear ownership

### Forbidden Cross-Layer

- Frontend docs in `backend/`
- Backend docs in `frontend-react/`
- Governance docs outside `docs/governance/`
- Reports outside `docs/reports/`
- Skills outside `skills/` directory

## 4. File Naming Convention

### General

- **kebab-case** for all filenames: `my-component.tsx`
- **UPPER-KEBAB-CASE** for governance docs: `FILE_SYSTEM_RULES.md`
- **snake_case** for Python backend files: `data_service.py`
- **English** for all new files (existing zh files in `docs/architecture/` may remain)
- **No spaces** in filenames

### Version Naming

```
v{major}.{minor}.{patch}-{descriptive-slug}
Example: v0.3.10-enterprise-maintenance-system
```

### Report Naming

```
docs/reports/v{version}-{type}.md
Example: v0.3.10-bug-fixes.md
Example: v0.3.11-repository-governance.md
```

### Test Naming

```
Backend:  tests/test_{module}.py
Frontend: {component}.test.ts  (in __tests__/ dir)
E2E:      e2e/{feature}.spec.ts
```

### Skill Naming

```
skills/{state}/{skill-name}.md
Example: skills/active/ai-sql-analysis.md
Example: skills/active/runtime-guardrails.md
```

### Error Log Naming

```
error_logs/reports/YYYY-MM-DD_{category}.md
Example: 2025-05-23_duckdb-lock.md
```

## 5. Lifecycle Rules

### File States

| State | Description | Action |
|-------|-------------|--------|
| **active** | Currently in use, referenced by code | Keep up-to-date |
| **stable** | Completed, unlikely to change | Review every 2 versions |
| **archived** | Historical reference | Move to `docs/archive/` |
| **deprecated** | No longer valid | Mark `> DEPRECATED`, move to archive within 1 version |

### State Transitions

```
active → stable → archived
active → deprecated → archived
```

### Promotion Rules

- **active → stable**: No changes for 2 consecutive versions
- **stable → archived**: No references from active code for 2 versions
- **active → deprecated**: Superseded by newer approach
- **deprecated → archived**: After 1 version with deprecation notice

### Cleanup Schedule

Every major version bump (`v0.x.0`):
1. Check all `active` docs for relevance
2. Promote stale docs to `stable`
3. Archive docs with no references
4. Remove empty directories
5. Clean `__pycache__` and `.pytest_cache`

## 6. Enforcement

### Pre-Commit Checks

Before every commit, verify:
- [ ] No debug artifacts in root
- [ ] No `__pycache__` in tracked files
- [ ] No temp scripts in root
- [ ] All new docs follow naming convention
- [ ] All new files are in correct layer directory

### Claude Must

1. Read this file before every development session
2. Follow placement rules when creating new files
3. Check for violations before committing
4. Fix violations immediately when found
5. Report violations in session summary
