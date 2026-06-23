# M4-8.1 Design Tokens + Base UI Cleanup

## 1. Goal

只做基础视觉底座优化，不改业务逻辑。

## 2. Audit

### 字号问题
- 发现 30+ 处 `text-[10px]` 使用
- 发现 5 处 `text-[9px]` 使用（不可读）
- 卡片标题使用 `text-xs` 太小
- 卡片描述使用 `text-2xs` 太小

### 按钮问题
- Small 按钮使用 `text-2xs` 太小
- 部分按钮使用内联样式不统一

### 卡片问题
- 缺少 hover 状态过渡效果
- 标题字号太小

### Badge 问题
- 不同组件使用不同 badge 样式
- 缺少统一的 Badge 组件

### 页面标题问题
- 设置页缺少描述
- 历史页缺少标题区

### 空态/错误态
- 现有组件基本符合规范

## 3. Design Rules

### 字号规则
- **页面标题**: `text-xl` (1.125rem)
- **区块标题**: `text-base` / `text-lg`
- **正文**: `text-sm` (0.8125rem)
- **辅助说明**: `text-xs` (0.75rem) - 最小允许尺寸
- **禁止**: `text-[9px]`, `text-[10px]`

### 按钮规则
- **Primary**: 主要操作
- **Secondary**: 次要操作
- **Ghost**: 低频操作
- **Danger**: 删除操作
- **Small**: `text-xs` (从 `text-2xs` 改为)
- **Medium**: `text-xs`
- **Large**: `text-sm`

### 卡片规则
- **Title**: `text-sm font-semibold`
- **Description**: `text-xs`
- **Hover**: 添加 `transition-colors`

### Badge 规则
- 创建统一 Badge 组件
- 支持 success/warning/error/info/accent/muted 变体
- 支持 sm/md/lg 尺寸

### 页面标题规则
- 创建 PageHeader 组件
- 支持 title/description/action

## 4. Changes

### 修改的文件
1. `frontend-react/src/components/ui/button.tsx` - 更新 small 按钮字号
2. `frontend-react/src/components/ui/card.tsx` - 更新标题/描述字号，添加 hover 过渡
3. `frontend-react/src/components/ai/analysis-header.tsx` - 修复 10px 字号
4. `frontend-react/src/components/ai/step-results.tsx` - 修复 10px 字号
5. `frontend-react/src/components/ai/trace-timeline.tsx` - 修复 10px 字号
6. `frontend-react/src/components/ai/quality-gates.tsx` - 修复 10px 字号
7. `frontend-react/src/components/ai/suggested-questions.tsx` - 修复 10px 字号
8. `frontend-react/src/components/ai/apply-template-dialog.tsx` - 修复 10px 字号
9. `frontend-react/src/components/ai/report-dialog.tsx` - 修复 10px 字号
10. `frontend-react/src/components/ai/save-template-dialog.tsx` - 修复 10px 字号
11. `frontend-react/src/components/investigation/drill-down-chain.tsx` - 修复 9px/10px 字号
12. `frontend-react/src/components/investigation/run-header.tsx` - 修复 10px 字号
13. `frontend-react/src/components/investigation/run-timeline.tsx` - 修复 10px 字号
14. `frontend-react/src/components/investigation/context-panel.tsx` - 修复 10px 字号
15. `frontend-react/src/components/schedule-dialog.tsx` - 修复 9px/10px 字号
16. `frontend-react/src/components/timeline-evolution.tsx` - 修复 10px 字号
17. `frontend-react/src/panels/diff-panel.tsx` - 修复 9px/10px 字号
18. `frontend-react/src/app/(shell)/settings/page.tsx` - 添加 PageHeader
19. `frontend-react/src/app/(shell)/history/page.tsx` - 添加 PageHeader
20. `frontend-react/src/i18n/en.ts` - 添加翻译键
21. `frontend-react/src/i18n/zh.ts` - 添加翻译键

### 新增的文件
1. `frontend-react/src/components/ui/page-header.tsx` - 页面标题组件
2. `frontend-react/src/components/ui/badge.tsx` - 统一 Badge 组件

## 5. What Was Not Changed

- ✅ 未改业务逻辑
- ✅ 未改 API
- ✅ 未改 store
- ✅ 未改 SQL editor 核心区
- ✅ 未开始 M5 Agent
- ✅ 未引入新 UI 库
- ✅ 未恢复已删除功能

## 6. Tests

### 现有测试
- 所有 271 个测试通过
- 21 个测试文件全部通过

### 新增测试
- 无（本轮只做基础视觉调整，不涉及新功能）

## 7. Validation

| 检查项 | 结果 |
|--------|------|
| TypeScript | ✅ 无错误 |
| Tests | ✅ 271/271 通过 |
| Build | ✅ 成功 |
| Lint | ✅ 仅有警告（无错误） |
| Backend Import | ✅ OK |

## 8. Remaining Risks

1. **视觉底座完成度**: 本轮只处理了部分组件的字号问题，还有其他视觉问题需要后续阶段处理
2. **页面级优化**: 首页、分析工作台、详情页、历史页仍需后续阶段逐步优化
3. **Badge 组件应用**: 新创建的 Badge 组件尚未在所有地方应用
4. **PageHeader 组件应用**: 只在设置页和历史页试点应用

## 9. Next Step

通过后进入 M4-8.2 Home + Navigation Clarity。

暂不进入 M5 Agent。
暂不打 tag。

---

**Report Date**: 2026-06-23
**Reported By**: Claude Code
