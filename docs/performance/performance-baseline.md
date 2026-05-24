# Performance Baseline — Enterprise AI Data Agent

> Generated: 2026-05-23 | Version: v0.5.4

## Overview

Automated performance regression testing using Playwright.
Baseline established from production build on dev machine.

## How to Run

```bash
# Run performance tests
cd frontend-react && npx playwright test e2e/performance.spec.ts

# View report
cat test-results/performance-report.json
```

## Baseline Metrics

### Page Load

| Metric | Baseline | Threshold | Unit | Status |
|--------|----------|-----------|------|--------|
| Page Load Time | TBD | 5000 | ms | — |
| DOM Node Count | TBD | 3000 | nodes | — |
| First Contentful Paint | TBD | 3000 | ms | — |
| Time to First Byte | TBD | 2000 | ms | — |

### Memory

| Metric | Baseline | Threshold | Unit | Status |
|--------|----------|-----------|------|--------|
| JS Heap Used (after load) | TBD | 100 | MB | — |
| Heap Growth (3 reloads) | TBD | 50 | MB | — |

### Query Performance

| Metric | Baseline | Threshold | Unit | Status |
|--------|----------|-----------|------|--------|
| Simple SELECT query | TBD | 3000 | ms | — |

### DOM Stability

| Metric | Baseline | Threshold | Unit | Status |
|--------|----------|-----------|------|--------|
| DOM growth after 5 interactions | TBD | 500 | nodes | — |

## Regression Detection

Performance regression is detected when any metric exceeds its threshold.
The test suite will fail with a detailed report showing which metrics regressed.

### CI Integration (Future)

```yaml
# Add to CI pipeline
- name: Performance Regression Check
  run: |
    cd frontend-react
    npx playwright test e2e/performance.spec.ts
```

## Monitoring Strategy

1. **Before every release**: Run full performance suite
2. **After new features**: Run and compare to baseline
3. **Weekly**: Automated run to catch gradual regressions

## Threshold Guidelines

| Severity | Action |
|----------|--------|
| Within 10% of threshold | OK — monitor |
| Within 20% of threshold | Warning — investigate |
| Exceeds threshold | Block — must fix |

## Historical Baselines

| Date | Version | Page Load | DOM Nodes | Heap (MB) | Query (ms) |
|------|---------|-----------|-----------|-----------|------------|
| 2026-05-23 | v0.5.4 | TBD | TBD | TBD | TBD |
