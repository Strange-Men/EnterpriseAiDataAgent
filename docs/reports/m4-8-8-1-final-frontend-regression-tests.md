# M4-8.8.1 Final Frontend Regression Tests

## 1. Goal

为 M4 UI/UX 封板前建立最终前端回归测试，覆盖核心页面、主链路、i18n、Settings、禁用实验功能和 pre-final hotfix。

## 2. Regression Scope

- Home
- Data
- Analyze
- Analysis Detail
- History
- Settings
- Main workflow
- i18n / Settings
- Disabled experimental features
- Pre-final UI polish fixes

## 3. Tests Added / Updated

**新增测试文件**：`frontend-react/src/app/(shell)/__tests__/final-frontend-regression.test.tsx`

**测试覆盖**（83 个测试，10 个 describe 块）：

| # | 测试分类 | 测试数 | 说明 |
|---|---------|--------|------|
| 1 | Page existence | 18 | Home, Data, Analyze, Analysis Detail, History, Settings 核心 key 存在 |
| 2 | Main workflow UI | 8 | Upload → Select → Preview → Analyze → History → Detail → Export 链路 key |
| 3 | Pre-final hotfix regression | 10 | 首页去重、query_history 说明/误删保护、分析工作台旧结果清理 |
| 4 | i18n / Settings regression | 8 | 语言名、主题、status-panel、workflow-banner、analysis-section Toast |
| 5 | Disabled experimental features | 12 | /performance, /virtual-table, Templates, Scheduler, Charts, Anomalies, Diff, Timeline, Command Palette, Global Search, Keyboard Shortcuts |
| 6 | Security boundary | 9 | Store/API/Upload/Delete/History/Detail key 保留确认 |
| 7 | Cross-language key symmetry | 3 | zh/en key 双向对称、总数一致 |
| 8 | Data quality and preview keys | 3 | Quality report、ready/needs-attention、interpolation |
| 9 | SQL workspace toolbar keys | 4 | Execute/format/save/export、AI hint、error friendly、empty result |
| 10 | History stale guard and export semantics | 4 | Stale badge/description/guard、export CSV tooltip/label |

**总计**：47 个测试文件，1151 个测试用例全部通过（原 1068 + 新增 83）。

## 4. Findings

**No issues found.** 所有核心页面、主链路、i18n、Settings、禁用实验功能和 pre-final hotfix 均稳定。

## 5. Fixes

**No code fix required.**

本轮仅新增测试文件和报告，未修改任何业务代码。

## 6. Remaining Risks

- **`export-markdown.ts` 硬编码中文**：仍包含 60+ 处中文文案和中文关键词匹配。安全迁移需要修改函数签名和调用链。建议作为独立阶段处理，不纳入 M4-8.8.1。
- **线上移动端 / 响应式验收仍需人工 Vercel 检查**：自动化测试无法覆盖所有移动端布局细节。
- **真实 API / 环境变量仍需线上验证**：AI 功能需要实际 API Key 和后端服务。
- **最终封板 tag 不应在 M4-8.8.2 和 M4-8.8.3 完成前创建**。

## 7. What Was Not Changed

- 未重新设计前端
- 未改后端
- 未改 API
- 未改数据库
- 未改 Store
- 未改业务逻辑
- 未改上传逻辑
- 未改表选择逻辑
- 未改普通表删除逻辑
- 未改 History / Detail 数据逻辑
- 未改 AI API
- 未改 SQL execution
- 未处理 export-markdown.ts
- 未开始 M5 Agent
- 未打 tag

## 8. Validation

| 检查项 | 结果 |
|--------|------|
| tsc --noEmit | ✅ 通过 |
| tests | ✅ 1151 passed (47 files, +83 new) |
| build | ✅ 通过 |
| lint | ✅ 通过 (3 pre-existing warnings, 0 errors) |
| backend import | ✅ 通过 |

## 9. Online Manual Check List Preview

下一阶段 M4-8.8.2 需要用户在线检查：

- [ ] Home 入口不重复（只有一组 CTA）
- [ ] Data 页面主链路清楚（上传 → 选表 → 预览 → 分析）
- [ ] query_history 说明清楚（badge + 说明 + 误删保护）
- [ ] Analysis 页面不残留旧结果（初始/切表后显示等待分析）
- [ ] History / Detail 正常
- [ ] Settings 中英文切换正常
- [ ] Vercel 在线构建正常
- [ ] 移动端无明显炸版

## 10. Next Step

通过后进入 M4-8.8.2 Online Manual Acceptance Checklist。
暂不进入 M5 Agent。
暂不打 tag。
