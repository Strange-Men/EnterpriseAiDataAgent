# Documentation Index — Enterprise AI Data Agent

> Last updated: 2026-05-24 (v0.5.5)

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
| [REPOSITORY_HEALTH.md](../REPOSITORY_HEALTH.md) | Repository health audit (auto-generated) |
| [README.md](../README.md) | Project overview |

## Architecture (`docs/architecture/`)

| File | Description |
|------|-------------|
| [项目架构说明.md](architecture/项目架构说明.md) | System architecture (React/FastAPI/DuckDB/AI) |
| [开发路线图.md](architecture/开发路线图.md) | Version roadmap (v0.3.x — v0.5.x) |
| [版本记录.md](architecture/版本记录.md) | Complete version history |
| [v0.5.1-plan.md](architecture/v0.5.1-plan.md) | v0.5.1 implementation plan |
| [v0.5.4-plan.md](architecture/v0.5.4-plan.md) | v0.5.4 implementation plan |

## Governance (`docs/governance/`)

| File | Description |
|------|-------------|
| [FILE_SYSTEM_RULES.md](governance/FILE_SYSTEM_RULES.md) | File placement rules and repository structure |
| [SKILL_LIFECYCLE.md](governance/SKILL_LIFECYCLE.md) | Skill lifecycle states and governance |
| [DOCUMENTATION_LIFECYCLE.md](governance/DOCUMENTATION_LIFECYCLE.md) | Doc lifecycle states (active/stable/archived/deprecated) |
| [DOCUMENTATION_NAMING.md](governance/DOCUMENTATION_NAMING.md) | File naming conventions |
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
| [SKILL_REGISTRY.md](../skills/SKILL_REGISTRY.md) | Master skill registry |

## Frontend Rules (`docs/frontend_rules/`)

| File | Description |
|------|-------------|
| [agents-capability-guide.md](frontend_rules/agents-capability-guide.md) | .agents capability reference |
| [agents-config-raw.md](frontend_rules/agents-config-raw.md) | .agents config reference |
| [agents-structure-blueprint.md](frontend_rules/agents-structure-blueprint.md) | .agents structure reference |

## Performance (`docs/performance/`)

| File | Description |
|------|-------------|
| [performance-baseline.md](performance/performance-baseline.md) | Performance baseline metrics |

## Reports (`docs/reports/`)

Version deliverable reports. Named: `v{version}-{type}.md`

## Archive (`docs/archive/`)

Deprecated or superseded documents.
- `docs/archive/reports/` — Archived version reports (v0.3.x, v0.4.0)
- `docs/archive/legacy_frontend/` — Legacy Streamlit frontend

## Test Data

| File | Description |
|------|-------------|
| [testExcel/README.md](../testExcel/README.md) | Test dataset documentation |
