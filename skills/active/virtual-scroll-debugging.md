# Virtual Scroll Debugging

> Category: debugging | State: active

## Purpose

Diagnose and fix virtual scrolling issues in the data table component, including white screens, dropped frames, incorrect row rendering, and scroll position jumps.

## When to Use

- DataTable shows blank/white rows during scroll
- Scroll FPS drops below 60 with large datasets
- Row count doesn't match expected dataset size
- Scroll position resets after data update
- DOM node count grows unbounded during scroll

## Steps

### 1. Chrome DevTools — Verify DOM Nodes

1. Open DevTools → Elements tab
2. Inspect the table container's `<tbody>` or virtual container
3. Count rendered `<tr>` elements
4. Expected: ~20-50 visible rows (depending on viewport height)
5. If DOM count matches total dataset rows → virtualization is BROKEN

### 2. Check Overscan

1. Open `src/components/ui/data-table.tsx` or `VirtualDataTable.tsx`
2. Find `useVirtualizer` call
3. Verify `overscan` parameter (default: 10, recommended: 10-20)
4. Too low (< 5): flickering during fast scroll
5. Too high (> 50): unnecessary DOM nodes, defeats purpose

### 3. FPS Check

1. Open DevTools → Performance tab
2. Start recording
3. Scroll the table for 5-10 seconds
4. Stop recording
5. Check FPS in the summary bar
6. Target: 60fps sustained
7. Below 30fps: investigate layout thrashing or re-render storms

### 4. White Screen / Blank Rows

**Root causes:**
- `contain: strict` on parent container (fixed in v0.3.9 → use `contain: layout style`)
- `overflow: hidden` clipping virtual rows
- Row height calculation wrong (check `estimateSize` matches actual row height)
- `getItemKey` not returning stable keys

**Diagnostic:**
```javascript
// Add to virtualizer config to debug
onScrollElement: (el) => {
  console.log('scroll offset:', el.scrollTop, 'total:', virtualizer.getTotalSize())
}
```

### 5. Frame Drops

**Root causes:**
- Re-renders triggered by parent state changes
- Expensive cell renderers (formatters, date parsing per render)
- No `React.memo` on row/cell components
- Zustand store updates causing full table re-render

**Diagnostic:**
```javascript
// Add to row component
useEffect(() => {
  console.time(`render-row-${rowIndex}`)
  return () => console.timeEnd(`render-row-${rowIndex}`)
})
```

### 6. Common Query Table Bugs

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Scroll resets on query re-run | `data` reference changes every render | Memoize query results |
| Rows overlap | `estimateSize` too small | Match actual CSS row height |
| Header misaligned | Fixed header not synced with scroll | Use `sticky` positioning |
| Jump to bottom | `scrollToIndex` called on mount | Only call on explicit action |

## Verification

- [ ] DOM node count < 500 during scroll
- [ ] FPS >= 55 sustained during fast scroll
- [ ] No white/blank rows visible
- [ ] Scroll position preserved after data update
- [ ] Memory stays flat during 60s scroll test

## Related

- `skills/active/performance-audit.md` — broader performance testing workflow
- `src/components/ui/data-table.tsx` — main virtual table implementation
- ISSUE-008: DataTable `contain: strict` fix (v0.3.9)
