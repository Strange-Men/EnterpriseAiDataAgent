# Performance Audit

> Category: optimization | State: active

## Purpose

Systematic performance audit of the Enterprise AI Data Agent frontend, covering Lighthouse scores, runtime performance, memory profiling, and long task detection.

## When to Use

- Before every major version release
- After adding new components or features
- When users report slowness or lag
- After bundle size changes (new dependencies)
- When FPS drops or memory grows unexpectedly

## Steps

### 1. Lighthouse Audit

1. Open Chrome DevTools → Lighthouse tab
2. Select mode: Performance
3. Device: Desktop
4. Click "Analyze page load"
5. Record scores:

| Metric | Target | Red Flag |
|--------|--------|----------|
| Performance | >= 80 | < 60 |
| FCP (First Contentful Paint) | < 2s | > 4s |
| LCP (Largest Contentful Paint) | < 3s | > 6s |
| TBT (Total Blocking Time) | < 300ms | > 600ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |

### 2. Chrome Performance Profile

1. DevTools → Performance tab
2. Check "Screenshots" and "Memory"
3. Click Record (Ctrl+E)
4. Perform key user flows:
   - Page load
   - SQL query execution
   - Table scroll (1000+ rows)
   - File upload
   - Tab switching
5. Stop recording (wait for processing)
6. Analyze:

**Timeline sections:**
- **Network**: API call latency
- **Frames**: FPS stability
- **Main thread**: Long tasks, layout, paint
- **Memory**: Heap growth pattern

### 3. FPS Measurement

For virtual table scroll testing:

1. DevTools → Performance → Record
2. Scroll table continuously for 10 seconds
3. Select the Frames section
4. Check:
   - Average FPS (target: 60)
   - Dropped frames count (target: < 5%)
   - Frame duration consistency

**Manual FPS check (console):**
```javascript
let frames = 0
let last = performance.now()
function tick() {
  frames++
  const now = performance.now()
  if (now - last >= 1000) {
    console.log('FPS:', frames)
    frames = 0
    last = now
  }
  requestAnimationFrame(tick)
}
tick()
```

### 4. Long Task Detection

1. DevTools → Performance → Record
2. Perform user actions for 30 seconds
3. Look for tasks > 50ms (red triangle marker)
4. Common causes:
   - Large JSON.parse on query results
   - Synchronous DOM measurement
   - Zustand store update causing re-render cascade
   - Monaco Editor initialization

**Thresholds:**
| Task Duration | Severity | Action |
|--------------|----------|--------|
| 50-100ms | Warning | Monitor |
| 100-200ms | Medium | Investigate |
| 200ms+ | High | Must fix |

### 5. Memory Leak Detection

1. DevTools → Memory tab
2. Take heap snapshot (baseline)
3. Perform repeated actions (query 10x, upload 5x, tab switch 20x)
4. Take second heap snapshot
5. Compare: Detached DOM nodes, growing arrays

**Red flags:**
- Heap grows > 50MB after repeated same action
- Detached DOM node count increases
- Event listeners accumulate
- Zustand store arrays grow without bounds (e.g., query history)

**Key areas to monitor:**
- Query result storage (large datasets in memory)
- Monaco Editor instances (one per tab)
- Virtual table row measurements cache
- AbortController cleanup

### 6. Bundle Size Check

```bash
cd frontend-react && npx next build
```

Check `.next/static/` for:
- Total JS bundle size (target: < 500KB gzipped)
- Largest chunks (identify heavy dependencies)
- Monaco Editor chunk (~2MB expected, lazy loaded)
- xlsx library chunk (if not lazy loaded)

## Performance Report Template

```markdown
## Performance Audit — v{version}

**Date**: YYYY-MM-DD
**Auditor**: Claude

### Lighthouse Scores
- Performance: XX/100
- FCP: X.Xs
- LCP: X.Xs
- TBT: XXXms

### Runtime
- FPS (scroll): XX average
- Long tasks: X tasks > 50ms
- API response: XXXms average

### Memory
- Baseline heap: XX MB
- After 10 queries: XX MB (growth: XX MB)
- Detached DOM: X nodes

### Issues Found
| Issue | Severity | Root Cause | Fix |
|-------|----------|-----------|-----|
| ... | ... | ... | ... |

### Verdict
- [ ] Ready for release
- [ ] Needs optimization
- [ ] Has blocking issues
```

## Verification

- [ ] Lighthouse performance score >= 80
- [ ] No long tasks > 200ms during normal use
- [ ] FPS >= 55 during table scroll
- [ ] Memory growth < 10MB after 20 query cycles
- [ ] Bundle size within target

## Related

- `docs/skills/virtual-scroll-debugging` — specific to virtual table performance
- `docs/skills/react-virtualization-performance` — virtualization optimization patterns
