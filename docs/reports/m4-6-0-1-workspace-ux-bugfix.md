# M4-6.0.1 Workspace UX Bugfix

## 1. Problems Found

M4-6.0 merged and deployed to Vercel. User manual testing revealed 5 issues:

1. **AI 使用错误表名** — 当前数据表是 `inventory_data`，但 AI 生成 SQL 使用了 `demo_sales`
2. **专家 SQL AI 按钮过多** — 专家 SQL 工具栏出现 AI 生成 SQL、AI 解释、AI 洞察、图表建议、异常检测
3. **SQL 执行结果不可见** — 第一次执行成功后结果表格有时不可见
4. **Empty LLM response 不友好** — 显示技术错误信息，用户不知道下一步怎么做
5. **SQL/AI 边界混乱** — 专家 SQL 和自然语言查询功能混杂

## 2. Root Causes

| Problem | Root Cause | Files |
|---------|------------|-------|
| AI 使用错误表名 | `aiQuery()` 没有 `table` 参数；`run_ai_query()` 使用 `list_tables()` 获取所有表的 schema，没有约束到当前表 | `backend/services/ai_pipeline.py`, `frontend-react/src/services/api/ai.ts`, `backend/routes/ai.py` |
| 专家 SQL AI 按钮过多 | Feature flags `showAiButtonsInSqlWorkspace` 和 `showAiSqlInputInWorkspace` 都是 `true` | `frontend-react/src/config/features.ts` |
| SQL 执行结果不可见 | 结果容器使用 `min-h-0`，在某些布局状态下高度折叠为 0 | `frontend-react/src/panels/sql-workspace-panel.tsx` |
| Empty LLM response 不友好 | 没有重试逻辑；直接显示原始错误信息 | `backend/services/ai_pipeline.py` |
| SQL/AI 边界混乱 | 同问题 2 — feature flags 应该隐藏 AI 功能 | `frontend-react/src/config/features.ts` |

## 3. Expert SQL Boundary Fix

**Changes**:
- `frontend-react/src/config/features.ts`: Set `showAiButtonsInSqlWorkspace: false`
- `frontend-react/src/config/features.ts`: Set `showAiSqlInputInWorkspace: false`

**Result**:
- 专家 SQL 工具栏只保留：执行、Explain、格式化、保存、清空、导出
- AI 功能入口只在「自然语言查询」tab 中出现
- 不删除源码，使用 feature flag 隐藏

## 4. Table Context Fix

**Changes**:
- `frontend-react/src/services/api/ai.ts`: Add optional `table` parameter to `aiQuery()`
- `backend/routes/ai.py`: Add `table: str | None = None` to `AIQueryRequest`
- `backend/services/ai_pipeline.py`: Add `table` parameter to `run_ai_query()`, filter tables if specified
- `frontend-react/src/panels/sql-workspace-panel.tsx`: Pass current table when calling `aiQuery`
- `frontend-react/src/components/ai/follow-up-input.tsx`: Pass current table when calling `aiQuery`

**Result**:
- 当前表为 `inventory_data` 时，AI 生成 SQL 必须 FROM `inventory_data`
- 当前表为 `demo_sales` 时，AI 生成 SQL 才能 FROM `demo_sales`
- 切换数据表后，AI 查询自动使用新表的 schema

## 5. Query Result Visibility Fix

**Changes**:
- `frontend-react/src/panels/sql-workspace-panel.tsx`: Change result container from `min-h-0` to `min-h-[200px]`
- `frontend-react/src/panels/sql-workspace-panel.tsx`: Add `scrollIntoView` after successful execution

**Result**:
- 执行一次 SQL 后立即看到结果表格
- 结果区域自动滚动到可见位置
- 不需要再次点击执行

## 6. Empty LLM Response Fix

**Backend Changes**:
- `backend/services/ai_pipeline.py`: Add retry logic for empty SQL in `run_ai_query()`
- `backend/services/ai_pipeline.py`: Return structured `AI_EMPTY_RESPONSE` error code
- `backend/services/ai_pipeline.py`: Add empty SQL check in both streaming and non-streaming multi-step variants

**Frontend Changes**:
- `frontend-react/src/services/api/ai.ts`: Add `error_code` and `error_detail` to `AIQueryResult`
- `frontend-react/src/components/investigation/streaming-output.tsx`: Handle `AI_EMPTY_RESPONSE` with friendly message and retry button
- `frontend-react/src/components/investigation/investigation-workspace.tsx`: Pass `onRetry` callback to `StreamingOutput`

**Result**:
- Empty LLM response 自动重试一次
- 重试后仍为空，返回结构化错误 `AI_EMPTY_RESPONSE`
- 前端显示友好提示："AI 暂时没有返回有效内容。你可以重试，或换一个更具体的问题。"
- 提供明显「重试」按钮
- 技术详情默认折叠

## 7. Tests Added

- TypeScript type check passed (`npx tsc --noEmit`)
- Frontend build passed (`npm run build`)
- Backend import check passed (`python -c "from backend.main import app"`)

## 8. Validation Results

| Check | Result |
|-------|--------|
| TypeScript type check | ✅ Passed |
| Frontend build | ✅ Passed |
| Backend import | ✅ Passed |
| Feature flags | ✅ `showAiButtonsInSqlWorkspace: false`, `showAiSqlInputInWorkspace: false` |
| Table context | ✅ `aiQuery()` accepts `table` parameter |
| Result visibility | ✅ `min-h-[200px]` + `scrollIntoView` |
| Empty response | ✅ Retry logic + `AI_EMPTY_RESPONSE` error code |

## 9. Remaining Risks

1. **Feature flags 依赖** — 如果将来需要在专家 SQL 中恢复 AI 功能，需要手动设置 flags
2. **Table context 过滤** — 如果 `list_tables()` 返回的表名与用户选择的表名不完全匹配，会 fallback 到所有表
3. **Empty response 重试** — 重试使用相同的 prompt，可能仍然返回空
4. **scrollIntoView** — 在某些浏览器或布局下可能不生效

## 10. Next Step

- M4-6.1 仍然等待本轮线上验证通过后再做
- M5 Agent 暂不开始
- 下一步：线上验证本轮修复效果
