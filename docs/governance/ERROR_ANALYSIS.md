# Error Analysis — Enterprise AI Data Agent

## Error Categories

### 1. Build Errors
| Category | Frequency | Impact | Resolution |
|----------|-----------|--------|------------|
| TypeScript type errors | Medium | Build fails | Fix types, add explicit annotations |
| Missing imports | Low | Build fails | Check import paths |
| Monaco type issues | Low | Build fails | Use `any` for complex Monaco types |

### 2. Runtime Errors
| Category | Frequency | Impact | Resolution |
|----------|-----------|--------|------------|
| DuckDB connection lost | Low | Queries fail | Restart backend |
| Invalid SQL syntax | High (user) | Query error | Show error in UI |
| File upload too large | Low | Upload fails | Add file size limit |

### 3. API Errors
| Category | Frequency | Impact | Resolution |
|----------|-----------|--------|------------|
| CORS issues | Low | API calls fail | Check FastAPI CORS config |
| Timeout on large queries | Medium | UX degradation | Add query timeout |
| Export memory pressure | Low | Slow exports | Stream results |

### 4. Frontend Errors
| Category | Frequency | Impact | Resolution |
|----------|-----------|--------|------------|
| Monaco Editor worker load | Low | Slow initial load | Acceptable for enterprise |
| Zustand persist conflict | Low | State corruption | Clear localStorage |
| React hydration mismatch | Low | Brief flicker | Use `useEffect` for client-only state |

### 5. AI Pipeline Errors (v0.5.x+)
| Category | Frequency | Impact | Resolution |
|----------|-----------|--------|------------|
| LLM API timeout | Medium | AI feature fails | Add timeout + retry with backoff |
| LLM rate limit | Low | AI feature delayed | Respect Retry-After header |
| Malformed LLM JSON response | Medium | Partial results | JSON parse fallback, return partial status |
| SSE stream interruption | Low | Streaming stops mid-response | Timeout mechanism (120s), drain buffer |
| Token budget overflow | Low | Steps skipped | Budget tracking, skip gracefully |
| Guardrail violation | Low | Steps aborted | Record violation, continue or break per severity |
| Follow-up context corruption | Low | Wrong follow-up results | Explicit type handling before JSON serialization |
| Type inference failure (all-null) | Low | Wrong SQL type functions | Scan 50 rows, VARCHAR fallback |
| Empty AI result | Low | Blank UI | Diagnostic event with failure summary |

## Known Patterns

### Pattern: TypeScript implicit `any` in Monaco
**Cause**: Monaco Editor types are complex and not always importable
**Fix**: Use explicit `any` with eslint-disable comment
**Seen in**: `monaco-sql-editor.tsx:98`

### Pattern: LF/CRLF git warnings
**Cause**: Windows line endings vs Unix line endings
**Fix**: Configure `.gitattributes` or accept warnings (cosmetic only)

## How to Report New Errors

1. Save error output to `error_logs/reports/YYYY-MM-DD_<category>.md`
2. Include: error message, file path, line number, reproduction steps
3. Add to `KNOWN_ISSUES.md` if not already tracked
4. Fix and verify with a test if possible
