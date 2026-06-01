# A/B Testing Framework — Enterprise AI Data Agent

## Purpose

Systematic comparison of technical approaches to make data-driven architecture decisions.

## A/B Test Process

1. **Define**: What are we comparing and why?
2. **Implement**: Both approaches with identical scope
3. **Measure**: Quantitative metrics (performance, bundle size, DX)
4. **Decide**: Choose winner based on metrics
5. **Document**: Record results here

## Active / Completed A/B Tests

### AB-001: SQL Editor — Monaco vs CodeMirror

| Metric | Monaco Editor (A) | CodeMirror (B) |
|--------|-------------------|----------------|
| Bundle size | ~2MB (workers) | ~500KB |
| SQL autocomplete | Built-in completion API | Plugin required |
| Theme support | Built-in dark/light | CSS-based |
| Enterprise feel | VS Code-like (familiar) | Minimalist |
| React integration | @monaco-editor/react | @codemirror/react |
| **Decision** | **Winner: Monaco** | — |
| **Reason** | Enterprise-grade UX, built-in SQL support, VS Code familiarity outweighs larger bundle | — |

### AB-002: Data Table — TanStack Virtual vs react-window

| Metric | TanStack Virtual (A) | react-window (B) |
|--------|---------------------|-----------------|
| Bundle size | ~15KB | ~8KB |
| API flexibility | Highly composable | Simple but rigid |
| Column virtualization | Built-in | Manual |
| Dynamic row height | Supported | Limited |
| Maintenance | Active (2024+) | Less active |
| **Decision** | **Winner: TanStack Virtual** | — |
| **Reason** | Better API, column virtualization, active maintenance | — |

### AB-003: Query Caching — In-Memory vs localStorage

| Metric | In-Memory (A) | localStorage (B) |
|--------|--------------|-----------------|
| Speed | Instant | Instant (sync API) |
| Persistence | Lost on refresh | Survives refresh |
| Size limit | RAM | ~5MB |
| Query result storage | Too large | Too large |
| History storage | Lost | Good fit |
| **Decision** | **Winner: Hybrid** | — |
| **Reason** | History in localStorage (small, persistent), query results in memory (large, ephemeral) | — |

## Resolved (no further testing needed)

| Decision | Winner | Version |
|----------|--------|---------|
| State management | Zustand (persist middleware) | v0.3.x |
| CSS approach | TailwindCSS | v0.3.x |

## Future A/B Tests

- [ ] API client: fetch vs axios vs ky
- [ ] Form handling: react-hook-form vs formik
- [ ] Error tracking: Sentry vs custom logging

## Benchmark Template

```markdown
### AB-XXX: [Feature] — [Option A] vs [Option B]

| Metric | Option A | Option B |
|--------|----------|----------|
| Performance | — | — |
| Bundle size | — | — |
| Developer experience | — | — |
| Maintenance | — | — |
| **Decision** | — | — |
| **Reason** | — | — |
```
