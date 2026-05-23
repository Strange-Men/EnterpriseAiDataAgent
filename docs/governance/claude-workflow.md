# Claude Development Workflow — Enterprise AI Data Agent

> Standard workflow for all Claude-assisted development sessions.

## Session Lifecycle

### 1. Session Start (Restore)

```
Read files in order:
1. CURRENT_SESSION.md   — what was happening
2. CLAUDE.md            — long-term rules
3. PROJECT_RULES.md     — mandatory dev rules
4. KNOWN_ISSUES.md      — open bugs
5. docs/README.md       — documentation map
```

**Do NOT:**
- Rescan the entire project
- Repeat completed tasks
- Re-generate existing documentation
- Re-establish governance that already exists

### 2. Task Execution

1. Check `KNOWN_ISSUES.md` for relevant issues
2. Read relevant source files
3. Fix root causes, not symptoms
4. Test every change (build, run, API)
5. Update `KNOWN_ISSUES.md` if issues found/fixed

### 3. Session End (Persist)

```
Update before committing:
1. CURRENT_SESSION.md   — current state for next session
2. KNOWN_ISSUES.md      — any new/resolved issues
3. docs/README.md       — if docs were added/changed
```

**Git rules:**
- Every version MUST be committed: `git add .` + `git commit -m "version-name"`
- Run `git status` before committing to check for missed files
- NEVER commit `.env`, credentials, or `node_modules/`

## Debugging Workflow

### Standard Debug Flow

1. **Reproduce**: Confirm the bug exists with a real user path
2. **Isolate**: Identify the exact component/endpoint causing the issue
3. **Root Cause**: Read the relevant code, trace the execution path
4. **Fix**: Make the minimal change to fix the root cause
5. **Verify**: Test the fix with the same reproduction steps
6. **Regression**: Run build + existing tests to confirm no breakage

### Common Debug Patterns

| Pattern | When to Use | Command |
|---------|-------------|---------|
| Build check | After any frontend change | `cd frontend-react && npx next build` |
| Backend import | After any backend change | `python -c "from backend.main import app"` |
| API test | After endpoint change | `curl -X POST http://localhost:8000/api/query ...` |
| E2E test | After UI/flow change | `cd frontend-react && npx playwright test` |
| DuckDB lock | "另一个程序正在使用此文件" | Kill stale Python process |

## Testing Workflow

### Test Pyramid

1. **Unit Tests** (Vitest for frontend, pytest for backend)
2. **Integration Tests** (API endpoint testing)
3. **E2E Tests** (Playwright for real user paths)

### E2E Test Requirements

Every E2E test must:
- Use real data (no mocks)
- Test a complete user path
- Be independent (no shared state between tests)
- Clean up after itself

## Documentation Governance

### Reusable Patterns

When you discover a reusable pattern, workflow, or fix:

1. **Is it a skill?** → Add to `docs/skills/skill-registry.md`
2. **Is it a rule?** → Add to governance docs
3. **Is it a debug recipe?** → Add to `docs/governance/error-analysis.md`

### Documentation Lifecycle

| State | Action |
|-------|--------|
| active | Review every version, keep up-to-date |
| stable | No changes needed, archive after 2 versions |
| archived | Move to `docs/archive/` |
| deprecated | Mark with `> DEPRECATED`, move within 1 version |
