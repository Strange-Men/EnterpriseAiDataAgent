# Skill Lifecycle — Enterprise AI Data Agent

> Defines lifecycle states and governance for reusable engineering skills.

## What Is a Skill

A skill is a reusable workflow, pattern, or process that can be applied across sessions. Skills are documented in `docs/skills/` and registered in `docs/skills/skill-registry.md`.

## Lifecycle States

| State | Description | Location | Action Required |
|-------|-------------|----------|-----------------|
| **active** | Currently used in development workflows | `docs/skills/` | Review every version |
| **stable** | Mature, unlikely to change | `docs/skills/` | Review every 2 versions |
| **archived** | Historical reference, no longer used | `docs/archive/skills/` | Keep for reference |
| **deprecated** | Superseded by better approach | `docs/archive/skills/` | Mark `> DEPRECATED` |

## State Transitions

```
active → stable → archived
active → deprecated → archived
```

## Promotion Rules

### active → stable
- Skill has been used successfully for 2+ consecutive versions
- No open issues related to the skill
- Documentation is complete and accurate

### stable → archived
- Skill has not been referenced in 3+ consecutive versions
- A newer skill or approach has fully superseded it
- Move to `docs/archive/skills/` with original filename

### active → deprecated
- A clearly better approach has been identified
- Document the reason for deprecation
- Move to `docs/archive/skills/` within 1 version

## Skill Registry

All skills must be registered in `docs/skills/skill-registry.md` with:

| Field | Description |
|-------|-------------|
| Name | Short descriptive name |
| Category | workflow / debugging / testing / optimization / governance |
| State | active / stable / archived / deprecated |
| Description | One-line summary |
| Last Used | Version when last used |
| Location | Path to skill doc |

## Skill Categories

| Category | Description | Examples |
|----------|-------------|---------|
| **workflow** | Development process patterns | Session restore, version bump |
| **debugging** | Debug and diagnostic patterns | SQL execution debug, DuckDB lock resolution |
| **testing** | Test strategy and execution | E2E test setup, performance audit |
| **optimization** | Performance improvement patterns | Virtual table optimization, bundle analysis |
| **governance** | Repository and process governance | File system audit, documentation lifecycle |

## Creating a New Skill

1. Identify a reusable pattern (used 2+ times or likely to repeat)
2. Create `docs/skills/{skill-name}.md` with:
   - **Purpose**: What this skill solves
   - **When to use**: Trigger conditions
   - **Steps**: Detailed workflow
   - **Verification**: How to confirm success
3. Register in `docs/skills/skill-registry.md`
4. Link from related governance docs

## Skill Documentation Template

```markdown
# {Skill Name}

> Category: {category} | State: {active/stable}

## Purpose
{One paragraph — what this skill solves}

## When to Use
- {Trigger condition 1}
- {Trigger condition 2}

## Steps
1. {Step 1}
2. {Step 2}
3. {Step 3}

## Verification
- {How to confirm success}

## Related
- {Links to related skills or governance docs}
```

## Current Skills

| Name | Category | State | Description |
|------|----------|-------|-------------|
| Session Restore | workflow | active | Restore development session from CURRENT_SESSION.md |
| SQL Debug | debugging | active | Debug SQL execution failures (DuckDB lock, proxy, query flow) |
| E2E Testing | testing | active | Run and maintain Playwright E2E test suite |
| Repository Audit | governance | active | Scan and validate repository structure against FILE_SYSTEM_RULES.md |

## Enforcement

Claude must:
1. Check for existing skills before creating new workflows from scratch
2. Register new skills in the registry
3. Review skill lifecycle at every major version bump
4. Archive deprecated skills promptly
