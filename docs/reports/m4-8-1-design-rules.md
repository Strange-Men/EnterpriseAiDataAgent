# M4-8.1 Design Rules

## 1. Font Size Rules

### Hierarchy
- **Page Title**: `text-xl` (1.125rem) or `text-2xl` (1.5rem)
- **Section Title**: `text-base` (0.875rem) or `text-lg` (1rem)
- **Body Text**: `text-sm` (0.8125rem)
- **Helper Text**: `text-xs` (0.75rem)
- **Metadata/Caption**: `text-xs` (0.75rem) - minimum allowed size
- **禁止**: `text-[9px]`, `text-[10px]` - 太小，影响可读性

### Implementation
- 所有 `text-[9px]` 必须改为 `text-xs`
- 所有 `text-[10px]` 必须改为 `text-xs`
- 卡片标题从 `text-xs` 改为 `text-sm`
- 卡片描述从 `text-2xs` 改为 `text-xs`

## 2. Button Rules

### Variants
- **Primary**: 主要操作（生成分析、执行、导出）
- **Secondary**: 次要操作（复制、格式化、重新运行）
- **Ghost**: 低频操作
- **Danger**: 删除操作
- **Danger-Ghost**: 删除操作（低优先级）

### Sizes
- **Small (sm)**: `text-xs` (0.75rem) - 从 `text-2xs` 改为 `text-xs`
- **Medium (md)**: `text-xs` (0.75rem) - 保持不变
- **Large (lg)**: `text-sm` (0.8125rem) - 保持不变

### Implementation
- 更新 `button.tsx` 中的 sizeClasses
- 不改变按钮行为，只统一视觉层级

## 3. Card Rules

### Structure
- **Padding**: `px-4 py-3` (header/content), `px-4 py-2` (footer)
- **Border**: `border border-[var(--border-default)]`
- **Radius**: `rounded-lg`
- **Hover**: 添加 `hover:border-[var(--border-hover)]` 过渡效果
- **Section Spacing**: 使用 `space-y-4` 或 `gap-4`

### Typography
- **Title**: `text-sm font-semibold` (从 `text-xs` 改为 `text-sm`)
- **Description**: `text-xs` (从 `text-2xs` 改为 `text-xs`)

### Implementation
- 更新 `card.tsx` 中的 CardTitle 和 CardDescription
- 添加 hover 状态过渡效果

## 4. Badge Rules

### Variants
- **Success**: `text-[var(--success)] bg-[var(--success-subtle)]`
- **Warning**: `text-[var(--warning)] bg-[var(--warning-subtle)]`
- **Error**: `text-[var(--error)] bg-[var(--danger-subtle)]`
- **Info**: `text-[var(--info)] bg-[var(--info-subtle)]`
- **AI Analysis**: `text-[var(--accent)] bg-[var(--accent-subtle)]`
- **Expert SQL**: `text-[var(--accent)] bg-[var(--accent-subtle)]`
- **Table Name**: `text-[var(--text-muted)] bg-[var(--bg-tertiary)]`

### Sizes
- **Small**: `text-xs px-1.5 py-0.5`
- **Medium**: `text-xs px-2 py-1`
- **Large**: `text-sm px-2.5 py-1`

### Implementation
- 创建统一的 Badge 组件
- 更新所有 badge 使用统一的样式

## 5. Page Header Rules

### Structure
每个主页面应有：
- **Title**: `text-xl font-bold text-[var(--text-primary)]`
- **Description**: `text-sm text-[var(--text-muted)]`
- **Primary Action**: 可选，使用 Button 组件

### Implementation
- 创建 PageHeader 组件
- 在设置页、历史页试点应用

## 6. Empty State Rules

### Structure
- **Icon**: `w-14 h-14 rounded-full bg-[var(--bg-tertiary)]`
- **Title**: `text-sm font-medium text-[var(--text-primary)]`
- **Description**: `text-xs text-[var(--text-muted)]`
- **Action**: 使用 Button 组件

### Implementation
- 保持现有 EmptyState 组件不变
- 确保所有空态使用统一组件

## 7. Error State Rules

### Structure
- **Icon**: `w-12 h-12 rounded-full bg-[var(--danger-subtle)]`
- **Title**: `text-sm font-semibold text-[var(--text-primary)]`
- **Message**: `text-xs text-[var(--text-muted)]`
- **Action**: 使用 Button 组件

### Implementation
- 保持现有 ErrorFallback 组件不变
- 确保所有错误态使用统一组件

---

**Rules Version**: M4-8.1
**Created Date**: 2026-06-23
**Created By**: Claude Code
