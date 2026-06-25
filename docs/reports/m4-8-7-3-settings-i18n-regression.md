# M4-8.7.3 Settings + i18n Regression

## 1. Goal

确认 M4-8.7.1 到 M4-8.7.2 的 Settings 和 i18n 收口没有破坏页面、语言切换、主题切换、Toast 和关键工作流文案。

## 2. Regression Scope

- Settings page copy and grouping
- Language / theme settings
- status-panel i18n
- workflow-banner i18n
- analysis-section Toast i18n
- terminology consistency for touched files
- disabled experimental features

## 3. Findings

### 3.1 Settings Page Structure ✅

- Settings 标题存在（`nav.settings`）
- Settings 描述存在（`settings.description`）
- "界面偏好 / Interface Preferences" 分组存在
- "系统信息 / System Information" 分组存在
- 分组标题和描述均使用 i18n

### 3.2 Language / Theme Settings ✅

- 语言名 `settings.lang-zh` / `settings.lang-en` 使用 i18n
- 主题标签 `settings.dark` / `settings.light` 使用 i18n
- 切换按钮 `settings.switch-language` / `settings.switch-to` 使用 i18n
- 品牌名 `settings.brand-name` 使用 i18n
- 版本 fallback `settings.version-fallback` 存在
- 未新增设置项（无 `settings.api-*`、`settings.user-*`）

### 3.3 Status Panel i18n ✅

- `status-panel.tsx` 所有可见 UI 文案使用 `t()` 函数
- 10 个 `status.ai-*` key 在 zh/en 中均存在
- 中文模式显示中文，英文模式显示英文
- 无硬编码文案残留

### 3.4 Workflow Banner i18n ✅

- `workflow-banner.tsx` 所有 stage label 使用 `t()` 函数
- 9 个 `workflow.*` key 在 zh/en 中均存在
- `{{table}}` 插值正常
- Generate SQL / Dismiss 按钮使用 i18n
- 无硬编码文案残留

### 3.5 Analysis Section Toast i18n ✅

- `analysis-section.tsx` Toast 使用 `ai.copied` / `ai.copy-failed`
- Fallback 使用 `analysis.no-content` / `analysis.section-fallback`
- Tooltip 使用 `ai.copy-section`
- 无硬编码文案残留

### 3.6 zh/en Key Symmetry ✅

- zh 和 en 总 key 数一致
- 每个 zh key 都有对应的 en key
- Settings key 完全对称

### 3.7 Terminology Consistency ✅

- Table / Dataset：`workflow.table-ready` 使用 "Table ready" / "数据表就绪" ✅
- Export / Download：`ai.export-md` 使用 "Export Markdown" / "导出 Markdown" ✅
- History / Records：`history.title` 使用 "History" / "历史记录" ✅

### 3.8 Disabled Experimental Features ✅

- 无 `/performance` 路由 key
- 无 `/virtual-table` 路由 key
- Settings 作用域内无 template/schedule key

## 4. Fixes

**No code fix required.**

所有 M4-8.7.1 到 M4-8.7.2 的改动都稳定集成，没有发现需要修复的问题。

## 5. Remaining Risks

1. **`export-markdown.ts` 硬编码中文**：60+ 处中文文案未迁移，英文界面下导出的 Markdown 报告仍为中文。安全迁移需要修改函数签名和调用链，且 `METRIC_REQUIREMENTS.keyword` 依赖中文关键词匹配（业务逻辑）。建议作为独立阶段处理。
2. **边缘硬编码 copy**：可能仍有少量边缘组件的硬编码文案未被审计覆盖，M4-8.8 Final Frontend Regression 应能捕获明显 UI 层面的问题。
3. **术语一致性范围有限**：本轮只在触达文件中统一术语，全站术语一致性需要更全面的审计。

## 6. What Was Not Changed

- 未改业务逻辑
- 未改 Store
- 未改 API
- 未改后端
- 未改设置逻辑
- 未改主题切换逻辑
- 未改语言切换逻辑
- 未改 AI query 逻辑
- 未改 SQL execution
- 未改导出逻辑
- 未处理 export-markdown.ts
- 未开始 M4-8.8
- 未开始 M5 Agent

## 7. Tests

### 新增测试

**文件**：`frontend-react/src/app/(shell)/__tests__/settings-i18n-regression.test.tsx`

**测试覆盖**（39 个测试，10 个 describe 块）：

1. **Settings page structure**（4 个测试）— header、description、两个分组
2. **Language and theme settings**（6 个测试）— 语言名、主题标签、切换按钮、品牌名、无新设置项
3. **Status panel i18n**（3 个测试）— key 存在、zh 值、en 值
4. **Workflow banner i18n**（4 个测试）— key 存在、插值、zh 值、en 值
5. **Analysis section Toast i18n**（5 个测试）— no-content、section-fallback、copied/failed、zh 值、en 值
6. **zh/en key symmetry**（4 个测试）— 总数一致、双向对称、settings 对称
7. **Terminology consistency**（4 个测试）— Table/Dataset、Export/Download、History
8. **Export markdown remaining risk**（1 个测试）— 记录未迁移
9. **No regression in business logic**（5 个测试）— status/ai/sql/table/upload key 保留
10. **Disabled experimental features**（3 个测试）— 无 performance/virtual-table/template/schedule

### 测试结果

| 项目 | 结果 |
|------|------|
| 测试文件 | 45 passed（+1 新增） |
| 测试用例 | 1049 passed（+39 新增） |

## 8. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 1049/1049 passed (45 files, +39 new) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 9. Online Manual Check List

- [ ] Settings 页面显示正常 — 标题 + 描述 + 两个分组
- [ ] 中文/英文切换正常 — 新增 key 在两种语言下都有值
- [ ] 主题切换正常 — Theme 卡片不变
- [ ] Status panel 文案正常 — AI Settings 区域显示中文/英文
- [ ] Workflow banner 文案正常 — 各阶段标签显示中文/英文
- [ ] Analysis toast 正常 — 复制成功/失败提示显示中文/英文
- [ ] Data / History / Analysis 页面未回归 — 未修改这些页面逻辑
- [ ] 已删除实验路由仍然不存在 — 无 /performance、/virtual-table

## 10. Next Step

通过后进入 M4-8.8 Final Frontend Regression。
暂不进入 M5 Agent。
暂不打 tag。
