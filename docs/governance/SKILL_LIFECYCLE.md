# Skill Lifecycle — Enterprise AI Data Agent

> Defines lifecycle states and governance for reusable engineering skills.

## What Is a Skill

A skill is a reusable workflow, pattern, or process that can be applied across sessions. Skills are documented in `skills/active/` and registered in `skills/SKILL_REGISTRY.md`.

## Lifecycle States

| State | Description | Location | Action Required |
|-------|-------------|----------|-----------------|
| **active** | Currently used in development workflows | `skills/active/` | Review every version |
| **stable** | Mature, unlikely to change | `skills/stable/` | Review every 2 versions |
| **archived** | Historical reference, no longer used | `skills/archived/` | Keep for reference |
| **deprecated** | Superseded by better approach | `skills/deprecated/` | Mark `> DEPRECATED` |

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
- Move to `skills/archived/` with original filename

### active → deprecated
- A clearly better approach has been identified
- Document the reason for deprecation
- Move to `skills/deprecated/` within 1 version

## Skill Registry

All skills must be registered in `skills/SKILL_REGISTRY.md` with:

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
2. Create `skills/active/{skill-name}.md` with:
   - **Purpose**: What this skill solves
   - **When to use**: Trigger conditions
   - **Steps**: Detailed workflow
   - **Verification**: How to confirm success
3. Register in `skills/SKILL_REGISTRY.md`
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

See `skills/SKILL_REGISTRY.md` for the authoritative skill list.

| Name | Category | State | Location |
|------|----------|-------|----------|
| Virtual Scroll Debugging | debugging | active | `skills/active/virtual-scroll-debugging.md` |
| Performance Audit | optimization | active | `skills/active/performance-audit.md` |
| AI SQL Analysis | workflow | active | `skills/active/ai-sql-analysis.md` |
| Auto Analysis Pipeline | workflow | active | `skills/active/auto-analysis-pipeline.md` |
| Prompt Architecture | governance | active | `skills/active/prompt-architecture.md` |
| Token Budget Control | optimization | active | `skills/active/token-budget-control.md` |
| Runtime Guardrails | governance | active | `skills/active/runtime-guardrails.md` |
| Analysis Trace | debugging | active | `skills/active/analysis-trace.md` |
| AI Evaluation Harness | testing | active | `skills/active/ai-evaluation-harness.md` |
| Analysis Workspace | frontend | active | `skills/active/analysis-workspace.md` |

## Enforcement

Claude must:
1. Check for existing skills before creating new workflows from scratch
2. Register new skills in the registry
3. Review skill lifecycle at every major version bump
4. Archive deprecated skills promptly
