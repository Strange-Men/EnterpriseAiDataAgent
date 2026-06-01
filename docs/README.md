# Documentation Index — Enterprise AI Data Agent

> Last updated: 2026-06-01 (v0.9.2)

## Recommended Reading Order (for new sessions)

1. `../CURRENT_SESSION.md` — Session restore (read FIRST)
2. `../CLAUDE.md` — Long-term development rules (includes former PROJECT_RULES)
3. `governance/FILE_SYSTEM_RULES.md` — File placement rules (mandatory)
4. `../KNOWN_ISSUES.md` — Current open issues
5. `governance/CLAUDE_WORKFLOW.md` — Development workflow
6. This file — Documentation map

## Root-Level Governance (mandatory reads)

| File | Description |
|------|-------------|
| [CURRENT_SESSION.md](../CURRENT_SESSION.md) | Session persistence — read FIRST |
| [CLAUDE.md](../CLAUDE.md) | Long-term Claude co-development rules |
| [KNOWN_ISSUES.md](../KNOWN_ISSUES.md) | Open issues tracker |
| [README.md](../README.md) | Project overview |

## Deployment (root)

| File | Description |
|------|-------------|
| [Dockerfile](../Dockerfile) | Backend Docker image (Python 3.11-slim) |
| [Dockerfile.frontend](../Dockerfile.frontend) | Frontend Docker image (Node 20-alpine, standalone) |
| [docker-compose.yml](../docker-compose.yml) | Docker Compose orchestration (backend + frontend) |
| [.dockerignore](../.dockerignore) | Docker build exclusions |

## Architecture (`docs/architecture/`)

| File | Description |
|------|-------------|
| [项目架构说明.md](architecture/项目架构说明.md) | System architecture (React/FastAPI/DuckDB/AI) |
| [开发路线图.md](architecture/开发路线图.md) | Version roadmap (v0.3.x — v0.9.x) |
| [版本记录.md](architecture/版本记录.md) | Complete version history |
| [INVESTIGATION_MODEL.md](architecture/INVESTIGATION_MODEL.md) | Investigation model design |
| [UI_FLOW_MAP.md](architecture/UI_FLOW_MAP.md) | UI flow architecture |

## Governance (`docs/governance/`)

| File | Description |
|------|-------------|
| [FILE_SYSTEM_RULES.md](governance/FILE_SYSTEM_RULES.md) | File placement rules and repository structure |
| [SKILL_LIFECYCLE.md](governance/SKILL_LIFECYCLE.md) | Skill lifecycle states and governance |
| [DOCUMENTATION_LIFECYCLE.md](governance/DOCUMENTATION_LIFECYCLE.md) | Doc lifecycle states (active/stable/archived/deprecated) |
| [DOCUMENTATION_NAMING.md](governance/DOCUMENTATION_NAMING.md) | File naming conventions |
| [CLAUDE_WORKFLOW.md](governance/CLAUDE_WORKFLOW.md) | Claude development workflow rules |
| [ERROR_ANALYSIS.md](governance/ERROR_ANALYSIS.md) | Error categorization and patterns |

## Design (`docs/design/`)

| File | Description |
|------|-------------|
| [DESIGN_SYSTEM_V2.md](design/DESIGN_SYSTEM_V2.md) | Design token reference, component catalog |
| [PRODUCT_UX_GUIDELINES.md](design/PRODUCT_UX_GUIDELINES.md) | Navigation, shortcuts, workflow UX |
| [INTERACTION_PATTERNS.md](design/INTERACTION_PATTERNS.md) | Command palette, search, shortcuts |

## Testing (`docs/testing/`)

| File | Description |
|------|-------------|
| [testing-strategy.md](testing/testing-strategy.md) | Testing pyramid strategy |

## Skills (`skills/active/`)

| File | Description |
|------|-------------|
| [ai-evaluation-harness.md](../skills/active/ai-evaluation-harness.md) | Golden question evaluation framework |
| [ai-sql-analysis.md](../skills/active/ai-sql-analysis.md) | NL → SQL analysis workflow |
| [analysis-trace.md](../skills/active/analysis-trace.md) | LLM call tracing and audit |
| [auto-analysis-pipeline.md](../skills/active/auto-analysis-pipeline.md) | Data profiling pipeline |
| [performance-audit.md](../skills/active/performance-audit.md) | Performance regression testing |
| [prompt-architecture.md](../skills/active/prompt-architecture.md) | Prompt module governance |
| [runtime-guardrails.md](../skills/active/runtime-guardrails.md) | Execution limits and safety |
| [token-budget-control.md](../skills/active/token-budget-control.md) | Token budget management |
| [virtual-scroll-debugging.md](../skills/active/virtual-scroll-debugging.md) | Virtual table debugging |
| [analysis-workspace.md](../skills/active/analysis-workspace.md) | Analysis workspace panel |
| [SKILL_REGISTRY.md](../skills/SKILL_REGISTRY.md) | Master skill registry |

## Reports (`docs/reports/`)

Version deliverable reports. Named: `v{version}-{type}.md`

| File | Description |
|------|-------------|
| [DOCS_CONSOLIDATION_PLAN.md](reports/DOCS_CONSOLIDATION_PLAN.md) | Documentation sprawl audit and remediation plan |
| [LEGACY_REMOVAL_PLAN.md](reports/LEGACY_REMOVAL_PLAN.md) | Safe deletion plan for workspace-legacy |
| [DEMO_READINESS_REPORT.md](reports/DEMO_READINESS_REPORT.md) | Demo/deployment/onboarding readiness evaluation |
| [PROJECT_MATURITY_REPORT.md](reports/PROJECT_MATURITY_REPORT.md) | Project maturity assessment |
| [NEXT_90_DAYS_PLAN.md](reports/NEXT_90_DAYS_PLAN.md) | 90-day execution plan |
| [ROOT_CAUSE_ANALYSIS.md](reports/ROOT_CAUSE_ANALYSIS.md) | Root cause analysis |

### v0.8.x Reports (`docs/reports/v0.8/`)

| File | Description |
|------|-------------|
| [V08_ARCHITECTURE_STATE.md](reports/v0.8/V08_ARCHITECTURE_STATE.md) | v0.8 architecture audit |
| [V08_MIGRATION_INTEGRITY.md](reports/v0.8/V08_MIGRATION_INTEGRITY.md) | v0.8 migration audit |
| [V08_RUNTIME_RISKS.md](reports/v0.8/V08_RUNTIME_RISKS.md) | v0.8 risk assessment |
| [V08_STATE_OWNERSHIP_AUDIT.md](reports/v0.8/V08_STATE_OWNERSHIP_AUDIT.md) | v0.8 state audit |
| [V08_TECH_DEBT_AFTER_PHASE3.md](reports/v0.8/V08_TECH_DEBT_AFTER_PHASE3.md) | v0.8 tech debt audit |
| [V08_UX_SYSTEM_CONSISTENCY.md](reports/v0.8/V08_UX_SYSTEM_CONSISTENCY.md) | v0.8 UX consistency audit |

## Archive (`docs/archive/`)

Deprecated or superseded documents.
- `docs/archive/reports/` — Archived version reports (v0.3.x, v0.4.0)
- `docs/archive/legacy_frontend/` — Legacy Streamlit frontend
- `docs/archive/frontend_rules/` — Archived Vue/Element Plus reference (wrong project)
- `docs/archive/v0.5.1-plan.md`, `v0.5.4-plan.md` — Completed version plans
- Archived architecture plans: COMPONENT_SPLIT_PLAN, INVESTIGATION_WORKSPACE_PLAN, OWNERSHIP_FIX_PLAN, PHASE2_MIGRATION, STATE_REFACTOR_PLAN, STORE_OWNERSHIP_MAP, MIGRATION_NOTES
- Archived reports: STABILIZATION_REPORT, FULL_RUNTIME_VALIDATION_REPORT, P4_RECHECK, P4_PRODUCTIZATION_ROADMAP, PRODUCTIZATION_GAP_REPORT
- Archived governance: AB_TESTING
- Archived design: PHASE3_CHANGELOG

## Test Data

| File | Description |
|------|-------------|
| [testExcel/README.md](../testExcel/README.md) | Test dataset documentation |
