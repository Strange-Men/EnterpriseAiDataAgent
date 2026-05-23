# Documentation Lifecycle — Enterprise AI Data Agent

> Defines the lifecycle states for all project documentation.

## Lifecycle States

| State | Description | Action Required |
|-------|-------------|-----------------|
| **active** | Currently in use, referenced by code or workflows | Keep up-to-date, review every version |
| **stable** | Completed and unlikely to change | Archive after 2 versions without changes |
| **archived** | Historical reference only | Move to `docs/archive/`, keep for reference |
| **deprecated** | No longer valid, should not be referenced | Move to `docs/archive/deprecated/` or delete |

## State Transitions

```
active → stable → archived
active → deprecated → archived (or deleted)
```

## Rules

### Active Documents
- Must be reviewed at every major version
- Must be listed in `docs/README.md`
- Must be kept in their category directory

### Stable Documents
- No changes needed unless requirements shift
- Listed in `docs/README.md` under "Stable Documents"
- May be moved to `docs/archive/` after 2 versions

### Archived Documents
- Moved to `docs/archive/`
- Listed in `docs/README.md` under "Archived"
- Not referenced by active code or workflows

### Deprecated Documents
- Marked with `> DEPRECATED` header
- Reason for deprecation must be documented
- Moved to `docs/archive/` within 1 version

## Version Check Schedule

Claude must check documentation lifecycle at:
- Every major version bump
- Every `v0.x.0` release
- When adding new features that supersede old docs

## Current Document States

| Document | State | Directory |
|----------|-------|-----------|
| CLAUDE.md | active | root |
| PROJECT_RULES.md | active | root |
| KNOWN_ISSUES.md | active | root |
| SESSION_SUMMARY_TEMPLATE.md | active | root |
| README.md | active | root |
| docs/architecture/* | active | docs/architecture/ |
| docs/governance/* | active | docs/governance/ |
| docs/testing/* | active | docs/testing/ |
| docs/skills/* | active | docs/skills/ |
| docs/frontend_rules/* | active | docs/frontend_rules/ |
