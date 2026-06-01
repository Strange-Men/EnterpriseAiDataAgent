# Documentation Index — Enterprise AI Data Agent

> Last updated: 2026-06-01 (v0.8.6)

## Recommended Reading Order (for new sessions)

1. `../CURRENT_SESSION.md` — Session restore (read FIRST)
2. `../CLAUDE.md` — Long-term development rules
3. `../PROJECT_RULES.md` — 10 mandatory rules
4. `governance/FILE_SYSTEM_RULES.md` — File placement rules (mandatory)
5. `../KNOWN_ISSUES.md` — Current open issues
6. `governance/claude-workflow.md` — Development workflow
7. This file — Documentation map

## Root-Level Governance (mandatory reads)

| File | Description |
|------|-------------|
| [CURRENT_SESSION.md](../CURRENT_SESSION.md) | Session persistence — read FIRST |
| [CLAUDE.md](../CLAUDE.md) | Long-term Claude co-development rules |
| [PROJECT_RULES.md](../PROJECT_RULES.md) | 10 mandatory development rules |
| [KNOWN_ISSUES.md](../KNOWN_ISSUES.md) | Open issues tracker |
| [SESSION_SUMMARY_TEMPLATE.md](../SESSION_SUMMARY_TEMPLATE.md) | New session context restore |
| [REPOSITORY_HEALTH.md](governance/REPOSITORY_HEALTH.md) | Repository health audit |
| [README.md](../README.md) | Project overview |

## Architecture (`docs/architecture/`)

| File | Description |
|------|-------------|
| [项目架构说明.md](architecture/项目架构说明.md) | System architecture (React/FastAPI/DuckDB/AI) |
| [开发路线图.md](architecture/开发路线图.md) | Version roadmap (v0.3.x — v0.6.x) |
| [版本记录.md](architecture/版本记录.md) | Complete version history |

## Governance (`docs/governance/`)

| File | Description |
|------|-------------|
| [FILE_SYSTEM_RULES.md](governance/FILE_SYSTEM_RULES.md) | File placement rules and repository structure |
| [SKILL_LIFECYCLE.md](governance/SKILL_LIFECYCLE.md) | Skill lifecycle states and governance |
| [DOCUMENTATION_LIFECYCLE.md](governance/DOCUMENTATION_LIFECYCLE.md) | Doc lifecycle states (active/stable/archived/deprecated) |
| [DOCUMENTATION_NAMING.md](governance/DOCUMENTATION_NAMING.md) | File naming conventions |
| [REPOSITORY_HEALTH.md](governance/REPOSITORY_HEALTH.md) | Repository health audit |
| [claude-workflow.md](governance/claude-workflow.md) | Claude development workflow rules |
| [AB_TESTING.md](governance/AB_TESTING.md) | Technical decision A/B tests |
| [ERROR_ANALYSIS.md](governance/ERROR_ANALYSIS.md) | Error categorization and patterns |

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

## Performance (`docs/performance/`)

| File | Description |
|------|-------------|
| [performance-baseline.md](performance/performance-baseline.md) | Performance baseline metrics (DRAFT) |

## Reports (`docs/reports/`)

Version deliverable reports. Named: `v{version}-{type}.md`

| File | Description |
|------|-------------|
| [DOCS_CONSOLIDATION_PLAN.md](reports/DOCS_CONSOLIDATION_PLAN.md) | Documentation sprawl audit and remediation plan |
| [LEGACY_REMOVAL_PLAN.md](reports/LEGACY_REMOVAL_PLAN.md) | Safe deletion plan for workspace-legacy |
| [DEMO_READINESS_REPORT.md](reports/DEMO_READINESS_REPORT.md) | Demo/deployment/onboarding readiness evaluation |
| [PRODUCTIZATION_GAP_REPORT.md](reports/PRODUCTIZATION_GAP_REPORT.md) | Product feature gap analysis |
| [P4_PRODUCTIZATION_ROADMAP.md](reports/P4_PRODUCTIZATION_ROADMAP.md) | P4 productization roadmap |
| [PROJECT_MATURITY_REPORT.md](reports/PROJECT_MATURITY_REPORT.md) | Project maturity assessment |
| [NEXT_90_DAYS_PLAN.md](reports/NEXT_90_DAYS_PLAN.md) | 90-day execution plan |

## Archive (`docs/archive/`)

Deprecated or superseded documents.
- `docs/archive/reports/` — Archived version reports (v0.3.x, v0.4.0)
- `docs/archive/legacy_frontend/` — Legacy Streamlit frontend
- `docs/archive/frontend_rules/` — Archived Vue/Element Plus reference (wrong project)
- `docs/archive/v0.5.1-plan.md`, `v0.5.4-plan.md` — Completed version plans

## Test Data

| File | Description |
|------|-------------|
| [testExcel/README.md](../testExcel/README.md) | Test dataset documentation |
