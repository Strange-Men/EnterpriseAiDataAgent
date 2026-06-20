# M3-4 i18n Hardcoded Text Cleanup — EnterpriseAiDataAgent

## 1. Summary

本轮修复了前端 UI 中命令面板、快捷键描述、全局搜索和工具栏中的英文硬编码文本，将其替换为 i18n `t()` 调用。所有修改仅涉及前端，不影响业务逻辑或后端。

**修复内容：**
- Keyboard Shortcuts Modal 标题和分组逻辑
- 10 个快捷键描述（Open command palette, Go Home 等）
- Global Search 组件全部用户可见文本（页面标签、占位符、空状态）
- Header 工具栏按钮的 title / aria-label
- Command Palette 中 "Analysis" 回退文本
- SQL Workspace 中 "Save" / "Clear" 按钮文本
- SQL Workspace 中 toast 错误/成功消息

## 2. Scope

**本轮修复：**
- command palette 相关标签和描述
- keyboard shortcuts modal 标题、分组和描述
- global search 页面标签、占位符和状态消息
- header toolbar 按钮 title / aria-label
- SQL workspace 按钮文本和 toast 消息

**本轮不修：**
- Monaco Editor 自动补全文本（column of X, table, DuckDB function）— 开发者面向
- API 路径和变量名
- 测试描述和开发者注释
- 后端返回字段
- error messages 来自后端的动态内容
- 非核心页面（performance page 等）

## 3. Changed Files

| 文件 | 变更类型 |
|------|---------|
| `frontend-react/src/i18n/zh.ts` | 新增 ~40 个 i18n key |
| `frontend-react/src/i18n/en.ts` | 新增 ~40 个 i18n key |
| `frontend-react/src/hooks/use-keyboard-shortcuts.ts` | `Shortcut` 接口新增 `group` 字段 |
| `frontend-react/src/components/ui/keyboard-shortcuts-modal.tsx` | 添加 `useTranslation`，按 `group` 分组 |
| `frontend-react/src/layout/app-shell.tsx` | 快捷键描述 + 按钮 title/aria-label 国际化 |
| `frontend-react/src/components/ui/global-search.tsx` | 添加 `useTranslation`，全部文本国际化 |
| `frontend-react/src/components/ui/command-palette.tsx` | "Analysis" 回退文本国际化 |
| `frontend-react/src/panels/sql-workspace-panel.tsx` | 按钮文本 + toast 消息国际化 |
| `KNOWN_ISSUES.md` | ISSUE-017 移至 Recently Fixed |

## 4. Validation

| 检查项 | 结果 |
|--------|------|
| `tsc --noEmit` | ✅ 通过 |
| `vitest run` (113 tests) | ✅ 全部通过 |
| `next build` | ✅ 通过（无新增 warning） |

## 5. Remaining i18n Limitations

以下英文硬编码仍然存在，但不在本轮范围内：

- **Monaco Editor autocomplete**: `column of X`, `table`, `DuckDB function` — 开发者面向的 IDE 级文本
- **Toast error fallbacks**: 部分 catch 块中的 `err.message` 仍为英文（来自后端/运行时）
- **Dynamic content**: AI 生成的分析结果、错误消息等
- **Non-core pages**: performance page 中的部分文本
- **Aria-labels**: 部分组件中的辅助功能标签可能仍有英文

## 6. Next Step

建议进入 M3-5 AI Full Chain Revalidation（需有效 API Key）或 M3 Close-out（如 API Key 不可用）。
