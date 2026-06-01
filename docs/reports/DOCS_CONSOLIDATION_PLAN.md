# Documentation Consolidation Plan

> Generated: 2026-06-01 | Scope: Product Readiness Consolidation (Phase A)
> Goal: Eliminate documentation sprawl, enforce FILE_SYSTEM_RULES.md, prepare for external reviewers

---

## 1. Current State

| Metric | Count |
|--------|-------|
| Total project-owned .md files | 75 |
| Root-level files | 8 (6 allowed, **2 violations**) |
| docs/ subdirectory files (proper) | 34 |
| docs/ top-level misplaced files | **20 violations** (+ 1 valid README.md) |
| skills/ files | 11 |
| Other locations | 3 |
| **Total violations** | **22** |

---

## 2. Violation Inventory

### 2a. Root-Level Violations (2 files)

These files violate the "only 6 allowed root .md files" rule.

| File | Action | Destination |
|------|--------|-------------|
| `PHASE4_READINESS.md` | **MOVE** | `docs/reports/PHASE4_READINESS.md` |
| `P4_RECHECK.md` | **MOVE** | `docs/reports/P4_RECHECK.md` |

### 2b. docs/ Top-Level Misplaced Files (20 files)

All files below sit directly in `docs/` instead of an approved subdirectory.

#### Reports → `docs/reports/`

| File | Size | Rationale |
|------|------|-----------|
| `CLEANUP_REPORT.md` | 10 KB | Completed cleanup report |
| `FULL_RUNTIME_VALIDATION_REPORT.md` | 3 KB | Validation report |
| `MVP_READINESS_REPORT.md` | 11 KB | Readiness report |
| `ROOT_CAUSE_ANALYSIS.md` | 11 KB | Bug analysis report |
| `STABILIZATION_REPORT.md` | 4 KB | Stabilization report |
| `TEST_COVERAGE_GAPS.md` | 10 KB | Testing gap analysis |

#### Architecture → `docs/architecture/`

| File | Size | Rationale |
|------|------|-----------|
| `COMPONENT_SPLIT_PLAN.md` | 3 KB | Architecture plan |
| `INVESTIGATION_WORKSPACE_PLAN.md` | 3 KB | Workspace architecture plan |
| `OWNERSHIP_FIX_PLAN.md` | 5 KB | State ownership architecture |
| `PHASE2_MIGRATION.md` | 3 KB | Migration architecture plan |
| `RERENDER_ANALYSIS.md` | 3 KB | Performance analysis |
| `SYSTEM_ARCHITECTURE_STATE.md` | 15 KB | Architecture state doc |
| `UI_FLOW_MAP.md` | 3 KB | UI architecture flow |

#### Version Reports → `docs/reports/v0.8/`

| File | Size | Rationale |
|------|------|-----------|
| `V08_ARCHITECTURE_STATE.md` | 13 KB | v0.8 architecture audit |
| `V08_MIGRATION_INTEGRITY.md` | 9 KB | v0.8 migration audit |
| `V08_RUNTIME_RISKS.md` | 11 KB | v0.8 risk assessment |
| `V08_STATE_OWNERSHIP_AUDIT.md` | 8 KB | v0.8 state audit |
| `V08_TECH_DEBT_AFTER_PHASE3.md` | 8 KB | v0.8 tech debt audit |
| `V08_UX_SYSTEM_CONSISTENCY.md` | 11 KB | v0.8 UX audit |

#### Risk Docs → `docs/reports/`

| File | Size | Rationale |
|------|------|-----------|
| `KNOWN_RUNTIME_RISKS.md` | 12 KB | Superseded by V08_RUNTIME_RISKS.md → archive |

### 2c. Naming Convention Violation (1 file)

| File | Issue | Fix |
|------|-------|-----|
| `docs/governance/claude-workflow.md` | lowercase, should be UPPER-KEBAB-CASE | Rename to `CLAUDE_WORKFLOW.md` |

### 2d. Missing Directories

| Directory | Expected By | Action |
|-----------|-------------|--------|
| `skills/stable/` | FILE_SYSTEM_RULES.md | Create with `.gitkeep` |
| `skills/archived/` | FILE_SYSTEM_RULES.md | Create with `.gitkeep` |
| `error_logs/reports/` | FILE_SYSTEM_RULES.md | Create with `.gitkeep` |

---

## 3. Content Overlap Analysis

These file clusters cover overlapping topics. After relocation, evaluate whether the older file should be archived.

| Cluster | Files | Recommendation |
|---------|-------|----------------|
| Runtime risks | `KNOWN_RUNTIME_RISKS.md` + `V08_RUNTIME_RISKS.md` | Archive `KNOWN_RUNTIME_RISKS.md` (superseded) |
| Architecture state | `SYSTEM_ARCHITECTURE_STATE.md` + `V08_ARCHITECTURE_STATE.md` | Archive `SYSTEM_ARCHITECTURE_STATE.md` (superseded) |
| Root cause analysis | `ROOT_CAUSE_ANALYSIS.md` + `RERENDER_ANALYSIS.md` | Keep both (different topics) |
| Cleanup/stabilization | `CLEANUP_REPORT.md` + `STABILIZATION_REPORT.md` | Both → `docs/reports/` (historical value) |

---

## 4. Execution Plan

### Step 1: Create Missing Directories

```bash
mkdir -p skills/stable skills/archived error_logs/reports
touch skills/stable/.gitkeep skills/archived/.gitkeep error_logs/reports/.gitkeep
```

### Step 2: Move Root Violations

```bash
git mv PHASE4_READINESS.md docs/reports/PHASE4_READINESS.md
git mv P4_RECHECK.md docs/reports/P4_RECHECK.md
```

### Step 3: Move docs/ Top-Level Files

```bash
# Reports
git mv docs/CLEANUP_REPORT.md docs/reports/
git mv docs/FULL_RUNTIME_VALIDATION_REPORT.md docs/reports/
git mv docs/MVP_READINESS_REPORT.md docs/reports/
git mv docs/ROOT_CAUSE_ANALYSIS.md docs/reports/
git mv docs/STABILIZATION_REPORT.md docs/reports/
git mv docs/TEST_COVERAGE_GAPS.md docs/reports/
git mv docs/KNOWN_RUNTIME_RISKS.md docs/reports/

# Architecture
git mv docs/COMPONENT_SPLIT_PLAN.md docs/architecture/
git mv docs/INVESTIGATION_WORKSPACE_PLAN.md docs/architecture/
git mv docs/OWNERSHIP_FIX_PLAN.md docs/architecture/
git mv docs/PHASE2_MIGRATION.md docs/architecture/
git mv docs/RERENDER_ANALYSIS.md docs/architecture/
git mv docs/SYSTEM_ARCHITECTURE_STATE.md docs/architecture/
git mv docs/UI_FLOW_MAP.md docs/architecture/

# V08 version reports
mkdir -p docs/reports/v0.8
git mv docs/V08_ARCHITECTURE_STATE.md docs/reports/v0.8/
git mv docs/V08_MIGRATION_INTEGRITY.md docs/reports/v0.8/
git mv docs/V08_RUNTIME_RISKS.md docs/reports/v0.8/
git mv docs/V08_STATE_OWNERSHIP_AUDIT.md docs/reports/v0.8/
git mv docs/V08_TECH_DEBT_AFTER_PHASE3.md docs/reports/v0.8/
git mv docs/V08_UX_SYSTEM_CONSISTENCY.md docs/reports/v0.8/
```

### Step 4: Rename Governance File

```bash
git mv docs/governance/claude-workflow.md docs/governance/CLAUDE_WORKFLOW.md
```

### Step 5: Update Internal References

After moves, update all cross-references in:
- `docs/README.md` — update all links
- `CLAUDE.md` — no changes needed (no direct links to moved files)
- `CURRENT_SESSION.md` — no changes needed
- Any files that reference moved docs by path

### Step 6: Update docs/README.md

Rewrite the index to reflect the new structure and add v0.7.x/v0.8.x entries.

---

## 5. Post-Consolidation Structure

```
docs/
├── README.md                          (index — updated)
├── architecture/
│   ├── COMPONENT_SPLIT_PLAN.md        (moved)
│   ├── INVESTIGATION_MODEL.md         (existing)
│   ├── INVESTIGATION_WORKSPACE_PLAN.md (moved)
│   ├── MIGRATION_NOTES.md             (existing)
│   ├── OWNERSHIP_FIX_PLAN.md          (moved)
│   ├── PHASE2_MIGRATION.md            (moved)
│   ├── RERENDER_ANALYSIS.md           (moved)
│   ├── STATE_REFACTOR_PLAN.md         (existing)
│   ├── STORE_OWNERSHIP_MAP.md         (existing)
│   ├── SYSTEM_ARCHITECTURE_STATE.md   (moved)
│   ├── UI_FLOW_MAP.md                 (moved)
│   ├── 版本记录.md                     (existing)
│   ├── 开发路线图.md                   (existing)
│   └── 项目架构说明.md                 (existing)
├── design/
│   ├── DESIGN_SYSTEM_V2.md            (existing)
│   ├── INTERACTION_PATTERNS.md        (existing)
│   ├── PHASE3_CHANGELOG.md            (existing)
│   └── PRODUCT_UX_GUIDELINES.md       (existing)
├── governance/
│   ├── AB_TESTING.md                  (existing)
│   ├── CLAUDE_WORKFLOW.md             (renamed)
│   ├── DOCUMENTATION_LIFECYCLE.md     (existing)
│   ├── DOCUMENTATION_NAMING.md        (existing)
│   ├── ERROR_ANALYSIS.md              (existing)
│   ├── FILE_SYSTEM_RULES.md           (existing)
│   ├── REPOSITORY_HEALTH.md           (existing)
│   └── SKILL_LIFECYCLE.md             (existing)
├── reports/
│   ├── CLEANUP_REPORT.md              (moved)
│   ├── FULL_RUNTIME_VALIDATION_REPORT.md (moved)
│   ├── KNOWN_RUNTIME_RISKS.md         (moved, archived)
│   ├── MVP_READINESS_REPORT.md        (moved)
│   ├── NEXT_90_DAYS_PLAN.md           (existing)
│   ├── P4_RECHECK.md                  (moved from root)
│   ├── PHASE4_READINESS.md            (moved from root)
│   ├── P4_PRODUCTIZATION_ROADMAP.md   (existing)
│   ├── PRODUCTIZATION_GAP_REPORT.md   (existing)
│   ├── PROJECT_MATURITY_REPORT.md     (existing)
│   ├── ROOT_CAUSE_ANALYSIS.md         (moved)
│   ├── STABILIZATION_REPORT.md        (moved)
│   ├── TEST_COVERAGE_GAPS.md          (moved)
│   └── v0.8/
│       ├── V08_ARCHITECTURE_STATE.md
│       ├── V08_MIGRATION_INTEGRITY.md
│       ├── V08_RUNTIME_RISKS.md
│       ├── V08_STATE_OWNERSHIP_AUDIT.md
│       ├── V08_TECH_DEBT_AFTER_PHASE3.md
│       └── V08_UX_SYSTEM_CONSISTENCY.md
├── testing/
│   └── TESTING_STRATEGY.md            (existing)
└── archive/
    ├── frontend_rules/                (existing)
    ├── legacy_frontend/               (existing)
    ├── performance-baseline.md        (existing)
    ├── reports/                       (existing)
    ├── v0.5.1-plan.md                 (existing)
    └── v0.5.4-plan.md                 (existing)
```

---

## 6. Validation Checklist

After executing all moves:

- [ ] `git status` shows only renames, no content changes
- [ ] `npx next build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `python -c "from backend.main import app"` passes
- [ ] All internal doc links resolve (manual spot-check)
- [ ] `docs/README.md` index is accurate
- [ ] No files remain in `docs/` root except `README.md`
- [ ] No `.md` files remain in project root except the 6 allowed
