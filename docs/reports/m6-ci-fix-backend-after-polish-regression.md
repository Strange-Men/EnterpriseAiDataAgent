# M6 CI Fix Backend After Polish Regression

## 1. Round Name

This round is **M6 CI Fix Backend After Polish Regression**.

It is a CI stabilization fix only. It does not add M6.9, does not add product features, and does not create a tag.

## 2. Starting Commit

- Starting `master` commit: `de4e777bd5d6e2acd79f2c7249b1e35e0f5250c4`
- CI fix branch: `m6-ci-fix-backend-after-polish-regression`

## 3. GitHub Actions Failure Job

- Workflow: `CI`
- Run id: `28917188098`
- Commit: `de4e777bd5d6e2acd79f2c7249b1e35e0f5250c4`
- Failed job: `backend`
- Frontend job: passed

The Node 20 deprecation message in the log is only a warning and was not the failure cause.

## 4. Failure Log Summary

GitHub Actions backend failed during:

```bash
python -m pytest tests/ -x -q --ignore=tests/ai
```

Failing test:

```text
tests/test_m6_manual_fix3_provider_status.py::test_doubao_business_orchestration_fallback_is_transparent
```

Failing assertion:

```text
assert '模拟分析结果' in '未检测到真实模型配置，当前使用演示模式。'
```

## 5. Root Cause

The test depended on the runtime environment:

- On the local machine, Doubao environment variables are present, so the test entered the real-provider path and eventually produced a network fallback reason containing simulated-result wording.
- In GitHub Actions, no Doubao key is present, so the same test returned the missing-provider-config fallback reason: `未检测到真实模型配置，当前使用演示模式。`

Both runtime outcomes are valid product behavior, but the test asserted only one local-environment-specific fallback sentence.

## 6. Doubao / Env / Network Relation

- Related to real Doubao provider path: yes, because the test requested `provider="doubao"`.
- Related to CI missing env: yes, CI intentionally has no Doubao key.
- Related to network calls: yes as a risk; the pre-fix test could attempt real-provider code locally when a key was present.

The CI failure itself did not need a real network call to fail. It failed because CI correctly returned the missing-config fallback reason.

## 7. Fix

Updated `tests/test_m6_manual_fix3_provider_status.py` so Doubao fallback tests use a fake provider event path via `monkeypatch`.

The tests now cover:

- `provider_status = fallback`
- `provider_used = mock`
- `is_simulated = true`
- readable `fallback_reason`
- no exception stack leakage
- no provider metadata inside `business_report`
- trace provider metadata matching top-level provider fields

The tests no longer depend on:

- local Doubao key presence
- GitHub Actions env
- external network
- provider latency

## 8. Provider Coverage Preserved

Provider status and fallback coverage remains intact:

- Mock provider status is still tested.
- Fake Doubao live-success metadata is still tested.
- Fake Doubao fallback metadata is still tested.
- Bad provider fallback compatibility is still tested.
- Error status is still tested.
- Fallback reason sanitization is still tested.

## 9. CI Avoids Real Doubao Calls

GitHub CI does not perform real Doubao network calls.

Real Doubao smoke remains a manual/local diagnostic activity from the prior polish regression report. The default CI path uses mock/fake provider behavior only.

## 10. Modified Files

- `tests/test_m6_manual_fix3_provider_status.py`
- `docs/reports/m6-ci-fix-backend-after-polish-regression.md`
- `CURRENT_SESSION.md`
- `docs/DEV_STATUS.md`
- `docs/PROJECT_CONTEXT.md`

No frontend feature code, backend product code, CI workflow, dependency file, or README change was needed.

## 11. Backend Import Result

Passed:

```bash
python -c "from backend.main import app; print('backend import OK')"
```

## 12. Failed Test Reproduction And Fix Result

Target tests passed after the fix:

```bash
python -m pytest tests/test_m6_manual_fix3_provider_status.py -q -vv
```

Result:

```text
8 passed
```

New polish regression test also passed:

```bash
python -m pytest tests/test_m6_manual_polish_regression_sql_i18n_doubao_export.py -q -vv
```

Result:

```text
8 passed
```

## 13. Focused Backend Regression

Passed:

```bash
python -m pytest tests/test_m6_manual_polish_export_query_provider.py -q
```

Result:

```text
4 passed
```

Passed:

```bash
python -m pytest tests/test_m6_manual_fix1_upload_tasks.py tests/test_m6_manual_fix2_business_report_contract.py tests/test_m6_business_capability_pressure.py tests/test_m6_langchain_business_agent_orchestration.py -q
```

Result:

```text
39 passed
```

## 14. Full Backend CI Result

Passed locally:

```bash
python -m pytest tests/ -x -q --ignore=tests/ai
```

Result:

```text
904 passed
```

## 15. Frontend Validation

Frontend test/build was not executed in this CI fix round because:

- GitHub Actions frontend job already passed for the failing commit.
- The fix only modifies backend tests and status/report docs.
- No frontend source, package, or build configuration was changed.

## 16. CI Workflow

Checked `.github/workflows/ci.yml`.

No workflow change was required. The backend job already runs the complete test suite and the fixed test is auto-discovered.

No real key, secret, or real provider smoke environment variable was added to CI.

## 17. Safety Search

Safety search was run against source, tests, docs, CI and dependency manifests. No real API key, `.env`, or private study/interview/resume content was added.

Expected matches are configuration names, auth middleware strings, dependency metadata, and pre-existing historical documentation placeholders.

## 18. Remaining Risk

- GitHub Actions must rerun on the new `master` commit to confirm the remote backend job is green.
- Real Doubao live smoke still belongs to manual/local diagnostics and should not be part of default CI.

## 19. Recommendation

- Wait for GitHub Actions to rerun and confirm backend/frontend are green.
- After CI is green, run renewed manual testing.
- If manual testing passes, the next user-approved step can be the M6 final tag.
