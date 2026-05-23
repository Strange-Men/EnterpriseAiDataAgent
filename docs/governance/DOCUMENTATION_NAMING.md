# Documentation Naming Conventions — Enterprise AI Data Agent

> Standard naming for all project documentation.

## General Rules

- **kebab-case** for all filenames: `my-document.md`
- **English** for all new documentation (existing zh docs may remain)
- **No spaces** in filenames
- **`.md` extension** always

## File Categories

### Root Governance Files (read by Claude)
These stay at root and must NOT be renamed:
- `CLAUDE.md`
- `PROJECT_RULES.md`
- `KNOWN_ISSUES.md`
- `SESSION_SUMMARY_TEMPLATE.md`
- `README.md`

### Architecture Docs (`docs/architecture/`)
Pattern: `{topic}.md`
- `system-architecture.md`
- `version-roadmap.md`
- `version-history.md`

### Governance Docs (`docs/governance/`)
Pattern: `{topic}.md`
- `documentation-lifecycle.md`
- `documentation-naming.md`
- `ab-testing.md`
- `error-analysis.md`
- `claude-workflow.md`

### Testing Docs (`docs/testing/`)
Pattern: `{topic}.md`
- `testing-strategy.md`
- `e2e-test-plan.md`
- `test-report-{date}.md`

### Reports (`docs/reports/`)
Pattern: `{type}-{version}.md`
- `bug-report-v0.3.10.md`
- `performance-report-v0.3.10.md`
- `health-check-v0.3.10.md`

### Skills (`docs/skills/`)
Pattern: `{skill-name}.md`
- `skill-registry.md`
- `debug-sql-execution.md`
- `optimize-virtual-table.md`

### Frontend Rules (`docs/frontend_rules/`)
Existing files may keep their names. New files follow:
- `{topic}-guide.md`

### Archive (`docs/archive/`)
Pattern: original filename preserved
- Old versions of documents moved here with original names

## Version-Specific Reports

For version deliverables, use:
```
docs/reports/v{version}-{type}.md
```
Examples:
- `docs/reports/v0.3.10-sql-bug-root-cause.md`
- `docs/reports/v0.3.10-e2e-test-results.md`
- `docs/reports/v0.3.10-system-health.md`
