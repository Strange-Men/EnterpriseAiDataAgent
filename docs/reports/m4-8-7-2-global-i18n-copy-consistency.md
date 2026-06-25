# M4-8.7.2 Global i18n Copy Consistency

## 1. Goal

清理 M4 UI/UX 封板前已审计出的全站硬编码文案和术语不一致问题，但不改变任何业务逻辑。

## 2. Changes

### status-panel.tsx i18n migration

- AI 状态面板区域（"AI Settings", "Model", "Temperature", "Base URL", "Status", "Connected", "API key not set", "Connection error"）全部迁移到 i18n
- AI 状态标签 "Not Set" 迁移到 i18n
- AI 标签 "AI" 迁移到 i18n
- 新增 10 个 i18n key（`status.ai-*`）

### workflow-banner.tsx i18n migration

- 新增 `useTranslation` 导入
- 所有 stage label（Uploading, Table ready, Analyzing, Analysis complete, Executing）迁移到 i18n
- 按钮文案（Generate SQL, Generating...）迁移到 i18n
- 关闭按钮 tooltip（Dismiss）迁移到 i18n
- Done 状态文案迁移到 i18n
- 新增 9 个 i18n key（`workflow.*`），使用 `{{table}}` 插值

### analysis-section.tsx i18n migration

- 新增 `useTranslation` 导入
- Toast "Copied" / "Copy failed" 改用已有 `ai.copied` / `ai.copy-failed` key
- Fallback "No content available." 迁移到 i18n（`analysis.no-content`）
- Fallback "Section" 迁移到 i18n（`analysis.section-fallback`）
- Tooltip "Copy section" 改用已有 `ai.copy-section` key
- 新增 2 个 i18n key

### i18n key additions

总计新增 21 个 key（zh/en 对称）：

| Key | 中文 | 英文 |
|-----|------|------|
| `status.ai-label` | AI | AI |
| `status.ai-not-set` | 未配置 | Not Set |
| `status.ai-settings` | AI 设置 | AI Settings |
| `status.ai-model` | 模型 | Model |
| `status.ai-temperature` | 温度 | Temperature |
| `status.ai-base-url` | Base URL | Base URL |
| `status.ai-status` | 状态 | Status |
| `status.ai-connected` | 已连接 | Connected |
| `status.ai-not-configured` | 未配置 API Key | API key not set |
| `status.ai-connection-error` | 连接错误 | Connection error |
| `workflow.done` | 完成：{{table}} | Done: {{table}} |
| `workflow.uploading` | 上传中... | Uploading... |
| `workflow.table-ready` | 数据表就绪：{{table}} | Table ready: {{table}} |
| `workflow.analyzing` | 分析 {{table}} 中... | Analyzing {{table}}... |
| `workflow.analysis-complete` | 分析完成：{{table}} | Analysis complete: {{table}} |
| `workflow.executing` | 执行中... | Executing... |
| `workflow.generating` | 生成中... | Generating... |
| `workflow.generate-sql` | 生成 SQL | Generate SQL |
| `workflow.dismiss` | 关闭 | Dismiss |
| `analysis.no-content` | 暂无内容。 | No content available. |
| `analysis.section-fallback` | 分析段落 | Section |

### Tests

新增测试文件：`global-i18n-copy-consistency.test.tsx`

37 个测试覆盖 7 个 describe 块：

1. Status Panel i18n keys（8 个测试）
2. Workflow Banner i18n keys（7 个测试）
3. Analysis Section i18n keys（7 个测试）
4. zh/en key symmetry（5 个测试）
5. Terminology consistency（4 个测试）
6. Export Markdown NOT changed（1 个测试）
7. No business logic regression（5 个测试）

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 Store
- 未改 API
- 未改后端
- 未改 AI query 逻辑
- 未改 SQL execution
- 未改导出数据结构
- 未改导出文件格式
- 未改设置逻辑
- 未改主题切换逻辑
- 未改语言切换逻辑
- 未改上传逻辑
- 未改表选择逻辑
- 未改删除逻辑
- 未开始 M4-8.7.3
- 未开始 M5 Agent
- 未打 tag

## 4. Export Markdown Handling

**未迁移。** 原因：

1. `runToMarkdown()` 函数迁移需要将 60+ 处硬编码中文改为 i18n key，必须修改函数签名（传入 `t` 函数）
2. 修改函数签名会影响所有调用链（至少 3-4 处调用点）
3. `METRIC_REQUIREMENTS` 的 `keyword` 字段用于匹配用户中文问题，属于业务逻辑而非 UI copy
4. 该文件生成的是导出的 Markdown 文档内容（非 UI chrome），迁移复杂度高
5. 强行迁移可能导致导出格式不稳定

**建议：** 将 `export-markdown.ts` 的 i18n 迁移作为独立阶段处理，需要重新设计 metric keyword 匹配逻辑以支持双语。

## 5. Terminology Rules Applied

| 术语 | 规则 | 本轮触达文件中的应用 |
|------|------|---------------------|
| Table / Dataset | 与实际表对象对应时用 "Table"/"数据表" | `workflow.table-ready` 用 "Table ready"/"数据表就绪" ✅ |
| Export / Download | 导出动作用 "Export"/"导出" | 本轮未触达导出相关文案 |
| History / Records | 页面名用 "History"/"历史记录" | 本轮未触达历史相关文案 |

注：`inv.table-label` = "数据集/Dataset" 属于 investigation 命名空间的有意区分，不在本轮统一范围内。

## 6. Tests

| 项目 | 结果 |
|------|------|
| 测试文件 | 44 passed（+1 新增） |
| 测试用例 | 1010 passed（+37 新增） |
| 新增文件 | `global-i18n-copy-consistency.test.tsx` |

## 7. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ 无错误 |
| vitest run | ✅ 1010/1010 passed (44 files, +37 new) |
| next build | ✅ 构建成功 |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 8. Remaining Risks

1. **export-markdown.ts 硬编码中文**：60+ 处中文文案未迁移，英文界面下导出的 Markdown 报告仍为中文。需要后续独立阶段处理。
2. **边缘硬编码 copy**：可能仍有少量边缘组件的硬编码文案未被本轮审计覆盖，需要 M4-8.7.3 regression 兜底。
3. **术语统一范围有限**：本轮只在触达文件中统一术语，全站术语一致性需要更全面的审计。
4. **不能为了术语统一误改业务语义**：`inv.table-label` = "数据集" 是有意设计，不应强制改为 "数据表"。

## 9. Online Check List

- [ ] Status panel 文案是否正常 — AI Settings 区域显示中文/英文
- [ ] Workflow banner 文案是否正常 — 各阶段标签显示中文/英文
- [ ] Analysis toast 是否正常 — 复制成功/失败提示显示中文/英文
- [ ] 导出 Markdown 是否没回归 — 未修改 export-markdown.ts
- [ ] 中英文切换是否正常 — 新增 key 在两种语言下都有值
- [ ] Settings 是否没回归 — 未修改 Settings 页面
- [ ] Data / History / Analysis 页面是否没回归 — 未修改这些页面逻辑

## 10. Next Step

通过后进入 M4-8.7.3 Settings + i18n Regression。
暂不进入 M5 Agent。
暂不打 tag。
