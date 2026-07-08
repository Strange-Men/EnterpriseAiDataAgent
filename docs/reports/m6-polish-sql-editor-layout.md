# M6 Polish SQL Editor Layout Hotfix

## 1. 本轮名称

M6 Polish SQL Editor Layout Hotfix。

## 2. 是否先合并 `m6-agent-output-strategy-plan-docs` 到 master

是。已先将 `origin/m6-agent-output-strategy-plan-docs` 以 no-ff merge 合并到 `master`，并推送 `master`。

## 3. 是否从最新 master 创建分支

是。文档分支合并并推送后，从最新 `master` 创建实现分支：

- `m6-polish-sql-editor-layout`

## 4. 是否严格只做 SQL UI Layout Hotfix

是。本轮只修改高级 SQL 工具前端布局、AI 生成 SQL 写入 active Query 的稳定性，以及对应前端回归测试。

## 5. 是否未进入 BusinessReportViewModel / locale / export

是。未实现 BusinessReportViewModel，未做 locale 透传，未改 Markdown / HTML 导出逻辑。

## 6. 是否未进入 Intent Router / data_table

是。未改 Agent 输出策略，未实现 Intent Router，未增加 `data_table` 输出模式。

## 7. 是否未接入 LangGraph

是。未接入 LangGraph，未做 Multi-Agent，未做 RAG。

## 8. 是否未新增 M6.9

是。本文档和实现均属于 M6 手测后的 SQL UI polish hotfix，不是 M6.9。

## 9. 是否未打 tag

是。未创建任何 tag。

## 10. SQL 编辑器被挤压 / 覆盖的根因

高级 SQL 工具的结果表格原先直接作为同一列布局中的 `flex-1 min-h-[200px]` 区块渲染，结果表内部又依赖父容器高度进行 `h-full` / scroll 布局。执行结果较大时，结果区会和 SQL editor 争夺垂直空间，导致编辑器区域视觉上被挤压、顶走或不够稳定。

同时，feature-flagged AI 分析面板中的 `onSqlGenerated` 回调仍使用 render 时捕获的 `activeTab`，在快速切换 Query 后存在写入旧 tab 的风险。

## 11. SQL 编辑器布局修复方案

修改 `frontend-react/src/panels/sql-workspace-panel.tsx`：

- SQL workspace 根容器增加稳定高度边界和 overflow 边界。
- SQL editor shell 固定为 `360px` 高度，并设置 `min-height` / `max-height` / `shrink-0` / `overflow-hidden`。
- SQL editor shell 增加稳定 `data-testid="sql-editor-shell"`，便于回归测试确认编辑器不会被结果区替代。

## 12. result table 独立滚动说明

结果表格现在渲染在独立结果容器中：

- `data-testid="query-result-container"`
- `data-testid="query-result-scroll-area"`

结果容器设置 `min-height`、`max-height`、`shrink-0` 和 `overflow-hidden`，表格本体放在内部 scroll area。底部 query summary 固定在结果容器底部，不再让结果表直接撑开父布局或覆盖 SQL editor。

## 13. AI 生成 SQL 写入 active Query 的修复说明

新增 `writeSqlToCurrentActiveTab()` helper，每次写入 SQL 时都从 `useSqlEditorStore.getState().getActiveTab()` 读取最新 active Query。

已统一用于：

- Standalone AI SQL generation。
- Workflow AI SQL generation。
- Feature-flagged AIAnalysisPanel `onSqlGenerated`。
- SQL editor `onChange`。

这样 AI 生成 SQL 不再依赖旧 render 快照中的 `activeTab`。

## 14. Query 切换不丢内容说明

本轮未改 Query tab 数据模型和 store normalize 规则，只修复写入路径和布局。新增测试覆盖：

- Query 1 / Query 2 各自保存 SQL。
- 切换 Query 后 editor 显示当前 Query SQL。
- AI 生成 SQL 只写入当前 active Query。
- 删除 Query 后剩余 SQL 内容不乱串。

## 15. Query normalize 是否保持

是。继续保持：

- 首次打开为 `Query 1`。
- 新增 Query 连续编号。
- 删除 Query 后重新编号。
- 旧 persisted state 中唯一 `Query 2` normalize 为 `Query 1`，且 SQL 内容保留。

## 16. readonly SQL guard 是否保持

是。本轮未改 SQL 执行 API、readonly guard、unsafe SQL guard、`sql_or_cannot_answer` 相关后端或前端安全逻辑。

## 17. 前端测试结果

已执行：

```bash
npm run test -- --run src/panels/__tests__/sql-workspace-panel-regression.test.tsx
npm ci
npx tsc --noEmit
npm run test
```

结果：

- SQL workspace polish regression：`6 passed`
- TypeScript：通过
- Full Vitest：`52 passed` test files，`1209 passed` tests

## 18. frontend build 结果

已执行：

```bash
npm run build
```

结果：通过。Next.js build 成功；仅保留既有 lint warnings，本轮未引入新的 build failure。

## 19. backend import 结果

已执行：

```bash
python -c "from backend.main import app; print('backend import OK')"
```

结果：`backend import OK`。

## 20. CI workflow 是否检查 / 修改

已检查 `.github/workflows/ci.yml`。

当前 frontend job 已覆盖：

- `npm ci`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build`

新增/更新的前端测试会被 `npm run test` 自动发现，因此本轮未修改 CI workflow。

## 21. safety search 结果

已执行：

```bash
findstr /s /i /n "sk- api_key API_KEY secret SECRET bearer Bearer authorization Authorization 面试 简历 包装 手撕 复习 个人学习 mystudy .agents 手机号 电话 身份证 邮箱" frontend-react\src\* docs\* CURRENT_SESSION.md docs\DEV_STATUS.md docs\PROJECT_CONTEXT.md
```

结果：未发现真实 key、`.env` 或私人内容。本次输出包含既有 TypeScript `??` 空值合并语法、既有测试占位 `API_KEY` 字符串、历史文档和代码字段名等误报；本轮未新增真实凭据。

## 22. 剩余风险

- jsdom 结构性测试不能真实判断像素级覆盖；已通过 editor/result container 同时存在、结果区独立 scroll area 和 build 测试降低风险。
- 真实浏览器中不同窗口高度仍建议用户手测确认 result table scroll 的视觉体验。

## 23. 是否建议进入下一轮 `m6-output-viewmodel-locale-export`

建议在用户重新手测 SQL editor 布局通过后，再进入下一轮 `m6-output-viewmodel-locale-export`。不要在本轮继续扩展输出策略。
