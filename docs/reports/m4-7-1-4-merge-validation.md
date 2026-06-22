# M4-7.1.4 Merge Validation

## Merge Info

- **Merge commit**: `f3fbeae` (fast-forward, no merge commit created)
- **M4-7.1.4 feature commit**: `f3fbeae fix: harden AI SQL generation and history recall UX`
- **Base commit**: `9afa353 docs: validate M4-7.1.3 merge`
- **Merge type**: Fast-forward

## Changes Merged

13 files changed, 1342 insertions, 172 deletions:

- `backend/prompts/sql_generation.py` — SQL generation prompt hardening
- `backend/runtime/token_budget.py` — token budget adjustments
- `backend/services/ai_analyst.py` — AI analyst service updates
- `backend/services/ai_pipeline.py` — AI pipeline improvements
- `backend/services/schema_semantics.py` — new: schema semantics mapping
- `backend/services/sql_templates.py` — new: SQL templates
- `backend/utils/llm_json.py` — JSON parse fallback
- `frontend-react/src/i18n/en.ts` — English translations
- `frontend-react/src/i18n/zh.ts` — Chinese translations
- `frontend-react/src/panels/sql-history-panel.tsx` — History Recall UX
- `tests/test_m4_7_1_4_sql_capability.py` — new: SQL capability tests
- `tests/test_token_budget.py` — token budget test fix
- `docs/reports/m4-7-1-4-ai-sql-history-hardening.md` — report

## Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `vitest run` | ✅ Pass (201/201) |
| `next build` | ✅ Pass |
| `python -c "from backend.main import app"` | ✅ Pass |
| `pytest tests/` | ✅ Pass (523/523) |

## Conclusion

M4-7.1.4 合并验证全部通过，可以继续 M4-7.1.5。
