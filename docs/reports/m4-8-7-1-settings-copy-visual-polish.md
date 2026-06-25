# M4-8.7.1 Settings Page Copy + Visual Polish

## 1. Goal

让 Settings 页面在 M4 UI/UX 封板前完成小范围文案和视觉层级收口。

## 2. Changes

### Settings Header

- 优化 `settings.description`：
  - 中文："管理语言、外观和基础偏好，让工作台更符合你的使用习惯。"
  - 英文："Manage language, appearance, and basic preferences for your workspace."

### Settings Section Grouping

- 新增 "界面偏好 / Interface Preferences" 分组标题和说明，包含 Language 和 Theme 卡片
- 新增 "系统信息 / System Information" 分组标题和说明，包含 Version 卡片
- 分组标题使用 `text-sm font-medium`，说明使用 `text-2xs text-muted`

### Language Copy i18n Migration

- 迁移硬编码 `"中文"/"English"` 到 i18n keys：`settings.lang-zh` / `settings.lang-en`
- 中文界面：`settings.lang-zh` = "中文"，`settings.lang-en` = "英文"
- 英文界面：`settings.lang-zh` = "Chinese"，`settings.lang-en` = "English"

### Brand / Version Fallback

- 品牌名迁移到 i18n key：`settings.brand-name` = "Enterprise AI Data Agent"
- 版本显示逻辑：有版本号时显示 `{brand-name} v{version}`，无版本号时显示 fallback
- 版本 fallback：
  - 中文："版本信息暂不可用"
  - 英文："Version information unavailable"

### i18n Copy

新增 8 个 i18n keys（zh.ts / en.ts 对称）：

| Key | 中文 | 英文 |
|-----|------|------|
| `settings.description` | 管理语言、外观和基础偏好，让工作台更符合你的使用习惯。 | Manage language, appearance, and basic preferences for your workspace. |
| `settings.section-preferences` | 界面偏好 | Interface Preferences |
| `settings.section-preferences-desc` | 调整主题和显示方式。 | Adjust theme and display preferences. |
| `settings.section-system` | 系统信息 | System Information |
| `settings.section-system-desc` | 查看当前版本和运行状态。 | Review the current version and runtime status. |
| `settings.lang-zh` | 中文 | Chinese |
| `settings.lang-en` | 英文 | English |
| `settings.brand-name` | Enterprise AI Data Agent | Enterprise AI Data Agent |
| `settings.version-fallback` | 版本信息暂不可用 | Version information unavailable |

### Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/settings-copy-visual-polish.test.tsx`

21 个测试覆盖：

**1. Settings Header（2 个）**
- settings page title exists via nav.settings
- settings description mentions language/appearance/preferences

**2. Settings Section Grouping（4 个）**
- interface preferences section header exists
- interface preferences section description exists
- system information section header exists
- system information section description exists

**3. Language Copy i18n Migration（3 个）**
- language name zh is via i18n key
- language name en is via i18n key
- switch-language button text is i18n

**4. Theme Copy (unchanged, still i18n)（4 个）**
- theme label exists
- dark/light labels exist
- current label exists
- switch-to label exists

**5. Brand / Version Fallback（3 个）**
- brand name is i18n key
- version fallback exists for missing version
- version label exists

**6. No Hardcoded Language Names in Page（1 个）**
- settings keys are symmetric between zh and en

**7. Regression Safety（4 个）**
- language toggle handler key preserved
- theme toggle handler keys preserved
- no new setting items added (no settings.api-*, settings.user-*)
- no restored experimental features in settings scope

## 3. What Was Not Changed

- 未改设置逻辑
- 未改主题切换逻辑
- 未改语言切换逻辑
- 未改 API Key 逻辑
- 未改 Store
- 未改 API
- 未改后端
- 未处理全站 i18n 硬编码
- 未开始 M4-8.7.2
- 未开始 M5 Agent

## 4. Tests

| 项目 | 结果 |
|------|------|
| 测试文件 | 43 passed（+1 新增） |
| 测试用例 | 973 passed（+21 新增） |

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 973/973 passed (43 files, +21 new) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 6. Remaining i18n Work

以下留到 M4-8.7.2 Global i18n Copy Consistency：

- status-panel.tsx 整面板硬编码英文（"AI Settings", "Model", "Temperature", "Base URL", "Status", "Connected", "API key not set", "Connection error"）
- workflow-banner.tsx 硬编码英文（"Uploading...", "Table ready:", "Analyzing", "Analysis complete:", "Executing...", "Generate SQL", "Dismiss"）
- export-markdown.ts 硬编码中文（整个 runToMarkdown() 函数 150 行全部中文硬编码）
- analysis-section.tsx Toast 硬编码（"No content available.", "Copied", "Copy failed", "Copy section"）
- Table / Dataset 术语不统一（table.* 用 "数据表/Table"，inv.* 用 "数据集/Dataset"）
- Export / Download 术语不统一（report.download 用 "下载/Download"，其他用 "导出/Export"）
- History / Records 术语不统一（"历史" vs "记录" vs "历史记录" 三种写法混用）

## 7. Online Check List

- [ ] Settings 页面标题是否清楚 — "设置" + 新描述文案
- [ ] Settings 分组是否清楚 — "界面偏好" / "系统信息" 两组
- [ ] 语言显示是否正常 — 当前语言名通过 i18n 显示
- [ ] 主题切换是否没回归 — Theme 卡片不变
- [ ] 语言切换是否没回归 — toggleLanguage handler 不变
- [ ] 版本 fallback 是否友好 — 无版本时显示 "版本信息暂不可用"

## 8. Next Step

通过后进入 M4-8.7.2 Global i18n Copy Consistency。
暂不进入 M5 Agent。
暂不打 tag。
