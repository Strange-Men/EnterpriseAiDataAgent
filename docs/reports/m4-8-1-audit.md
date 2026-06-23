# M4-8.1 Visual Foundation Audit

## 1. Font Size Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `components/ai/analysis-header.tsx` | `text-[10px]` | Too small for metadata | Hard to read |
| `components/ai/apply-template-dialog.tsx` | `text-[10px]` | Labels too small | Poor accessibility |
| `components/ai/quality-gates.tsx` | `text-[10px]` | Badge text too small | Hard to scan |
| `components/ai/step-results.tsx` | `text-[10px]` | Table data too small | Reading fatigue |
| `components/ai/trace-timeline.tsx` | `text-[10px]` | Timeline metadata | Hard to read |
| `components/investigation/drill-down-chain.tsx` | `text-[9px]` | Extremely small | Unreadable |
| `components/investigation/run-header.tsx` | `text-[10px]` | Status badges | Hard to scan |
| `components/schedule-dialog.tsx` | `text-[9px]` | Schedule info | Unreadable |
| `components/ai/analysis-section.tsx` | `text-xs` | Section headers | Acceptable but tight |
| `app/(shell)/page.tsx` | `text-xs` | Home page hints | Acceptable |
| `app/error.tsx` | `text-xs` | Error messages | Acceptable |
| `components/ui/card.tsx` | `text-xs`, `text-2xs` | Card titles/descriptions | Too small for titles |

## 2. Button Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `components/ui/button.tsx` | `text-2xs` (sm) | Small button text | Hard to read |
| `components/ui/button.tsx` | `text-xs` (md) | Medium button text | Acceptable |
| Various components | Inline styles | Inconsistent button styling | Visual inconsistency |

## 3. Card Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `components/ui/card.tsx` | `rounded-lg` | Inconsistent with other components | Visual inconsistency |
| `components/ui/card.tsx` | No hover state | Missing interaction feedback | Poor UX |
| `components/ui/card.tsx` | `text-2xs` description | Too small | Hard to read |

## 4. Badge Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `components/ui/status-badge.tsx` | `text-sm` | Badge text size | Acceptable |
| `components/ai/quality-gates.tsx` | `text-[10px]` | Quality badge | Too small |
| `components/investigation/run-header.tsx` | `text-[10px]` | Status badges | Too small |

## 5. Page Header Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `app/(shell)/settings/page.tsx` | `text-lg` | Settings title | Acceptable |
| `app/(shell)/page.tsx` | No clear header | Home page lacks structure | Poor hierarchy |
| `app/(shell)/history/page.tsx` | No header | History page lacks context | Poor UX |

## 6. Empty State Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `components/ui/empty-state.tsx` | `text-sm` title | Title size | Acceptable |
| `components/ui/empty-state.tsx` | `text-xs` description | Description size | Acceptable |

## 7. Error State Issues

| Location | Current | Issue | Impact |
|----------|---------|-------|--------|
| `components/ui/error-fallback.tsx` | `text-sm` title | Error title | Acceptable |
| `components/ui/error-fallback.tsx` | `text-xs` message | Error message | Acceptable |
| `app/error.tsx` | `text-xs` | Error page | Acceptable |

## 8. Summary

### Critical Issues (Must Fix)
1. **9px font sizes** - Unreadable, must be at least 10px
2. **10px font sizes in interactive elements** - Too small for labels/badges
3. **Card title using text-xs** - Should be text-sm or text-base

### Moderate Issues (Should Fix)
1. **Button small size using text-2xs** - Should be text-xs
2. **Missing page headers** - History, Home pages
3. **Inconsistent badge styling** - Different sizes/colors

### Minor Issues (Nice to Have)
1. **Card hover states** - Missing interaction feedback
2. **Card description size** - Could be slightly larger

---

**Audit Date**: 2026-06-23
**Audited By**: Claude Code
