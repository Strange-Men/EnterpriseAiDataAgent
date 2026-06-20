# M3-3 Basic CI — EnterpriseAiDataAgent

## 1. Summary

- CI 状态：✅ 已新增 GitHub Actions workflow
- 是否新增 workflow：是 → `.github/workflows/ci.yml`
- 是否阻塞 M3：否
- 是否需要后续修复：否

## 2. CI Scope

### 本轮 CI 覆盖

- backend import check（验证 `backend.main` 可导入）
- backend pytest（420 tests，排除 `tests/ai` 目录）
- frontend type-check（`tsc --noEmit`）
- frontend vitest（113 tests，10 test files）
- frontend production build（`next build`）

### 本轮不覆盖

- Docker build（Docker 本机不可用，需 external validation）
- live AI tests（需 `RUN_AI_EVAL=1` + 有效 `ANTHROPIC_API_KEY`）
- Playwright E2E（需浏览器环境）
- deployment（需配置部署环境）

## 3. Workflow File

- 路径：`.github/workflows/ci.yml`
- 触发条件：`push` + `pull_request`（所有分支）
- Jobs：
  - `backend`：Python 3.11，pytest，import check
  - `frontend`：Node 20，type-check，vitest，build
- 环境变量：
  - `DUCKDB_PATH: ":memory:"`（CI 专用内存数据库）
  - `ANTHROPIC_API_KEY: ""`（空值，AI 测试自动跳过）
  - `API_KEY: ""`（空值，非阻塞）

## 4. Local Validation

### Backend

```bash
$ python -c "from backend.main import app; print('backend import OK')"
backend import OK

$ python -m pytest tests/ -x -q --ignore=tests/ai
420 passed in 7.23s
```

### Frontend

```bash
$ npx tsc --noEmit
（无输出，类型检查通过）

$ npm run test
Test Files  10 passed (10)
Tests       113 passed (113)
Duration    3.46s

$ npm run build
✓ Compiled successfully in 4.3s
✓ Generating static pages (11/11)
```

## 5. Known Limitations

- CI 不验证 Docker（需 external validation）
- CI 不验证 AI Key（`ANTHROPIC_API_KEY` 为空）
- CI 不跑 live LLM tests（`tests/ai` 目录已排除）
- CI 不代表生产部署可用
- CI 运行环境为 ubuntu-latest，与 Windows 开发环境可能存在差异

## 6. Next Step

建议进入：M3-4 i18n Hardcoded Text Cleanup
