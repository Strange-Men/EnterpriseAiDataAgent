# M4-8.1.1 Visual Regression Hotfix

## 1. Problem

### 问题 1：SQL 编辑器视觉挤压

**表现**：
- SQL 编辑器区域看起来很挤
- 行高 / 顶部 padding / 滚动位置 / editor 容器显示不舒服
- SQL 内容像贴在顶部或被压缩
- Monaco editor 区域视觉体验明显下降

**根因**：
- Monaco editor padding 只有 8px（top/bottom），太小
- 编辑器容器 min-height 只有 200px，空间不足
- 缺少显式 lineHeight 配置，使用默认值
- Toolbar 与编辑器间距只有 8px（mb-2）

### 问题 2：History 页面标题太突兀

**表现**：
- History 页标题区域白字太硬
- "历史"和"查询历史"层级割裂
- PageHeader 和暗色页面融合不好
- 标题像贴上去，不像页面自然头部

**根因**：
- M4-8.1 新增的 PageHeader 使用 `text-xl font-bold text-[var(--text-primary)]`
- `text-[var(--text-primary)]` 是 #E6EDF3，在暗色背景上太亮
- `font-bold` 使标题更突兀
- SqlHistoryPanel 内部有重复标题 "查询历史"，造成层级割裂
- PageHeader 的 mb-6 间距过大

---

## 2. Root Cause

### SQL 编辑器挤压

| 因素 | 原值 | 问题 |
|------|------|------|
| Monaco padding | 8px top/bottom | 太小，内容贴顶 |
| lineHeight | 默认 | 行间距不够 |
| 容器 min-height | 200px | 空间不足 |
| Toolbar 间距 | mb-2 (8px) | 与编辑器太近 |

### History 标题突兀

| 因素 | 原值 | 问题 |
|------|------|------|
| 标题颜色 | text-primary (#E6EDF3) | 太亮 |
| 标题字重 | font-bold | 太重 |
| 标题字号 | text-xl (1.125rem) | 太大 |
| 区块标题 | text-sm font-semibold | 与页面标题层级混淆 |
| 间距 | mb-6 (24px) | 太大 |

---

## 3. Fixes

### 3.1 SQL 编辑器修复

**文件**：`frontend-react/src/components/monaco-sql-editor.tsx`

```diff
- padding: { top: 8, bottom: 8 },
+ lineHeight: 20,
+ padding: { top: 12, bottom: 12 },
```

**文件**：`frontend-react/src/panels/sql-workspace-panel.tsx`

```diff
- <div className="flex-1 min-h-[200px] mb-2">
+ <div className="flex-1 min-h-[280px] mb-3">

- <div className="flex items-center flex-wrap gap-2 mb-2">
+ <div className="flex items-center flex-wrap gap-2 mb-3">
```

**效果**：
- Monaco editor padding 从 8px 增加到 12px
- 显式设置 lineHeight 为 20px
- 容器 min-height 从 200px 增加到 280px
- Toolbar 与编辑器间距从 8px 增加到 12px

### 3.2 History PageHeader 修复

**文件**：`frontend-react/src/components/ui/page-header.tsx`

```diff
- <h1 className="text-xl font-bold text-[var(--text-primary)]">
+ <h1 className="text-lg font-semibold text-[var(--text-secondary)]">

- <p className="text-sm text-[var(--text-muted)] mt-1">
+ <p className="text-xs text-[var(--text-muted)] mt-0.5">

- <div className={cn("flex items-start justify-between mb-6", className)}>
+ <div className={cn("flex items-start justify-between mb-4", className)}>
```

**文件**：`frontend-react/src/panels/sql-history-panel.tsx`

```diff
- <h2 className="text-sm font-semibold text-[var(--text-primary)]">
+ <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
```

**文件**：`frontend-react/src/app/(shell)/history/page.tsx`

```diff
- <div className="px-6 pt-6">
+ <div className="px-6 pt-5">

- <div className="flex-1 overflow-hidden">
+ <div className="flex-1 overflow-hidden px-6 pb-4">
```

**效果**：
- PageHeader 标题从 `text-xl font-bold text-primary` 改为 `text-lg font-semibold text-secondary`
- 副标题从 `text-sm` 改为 `text-xs`
- 间距从 mb-6 改为 mb-4
- 区块标题改为 `text-xs font-medium text-muted uppercase tracking-wider`
- 页面 padding 从 pt-6 改为 pt-5

---

## 4. What Was Not Changed

- ✅ 未改 SQL 执行逻辑
- ✅ 未改 AI 生成 SQL 逻辑
- ✅ 未改 SQL tab store
- ✅ 未改 Monaco 核心配置（只改视觉参数）
- ✅ 未改 History Recall 行为
- ✅ 未改导出 Markdown / CSV
- ✅ 未改数据结构
- ✅ 未改 store
- ✅ 未改 API
- ✅ 未改后端
- ✅ 未开始 M4-8.2 implementation
- ✅ 未开始 M5 Agent
- ✅ 未打 tag

---

## 5. Reference Research

详见 `docs/reports/m4-8-uiux-reference-research.md`

**关键启发**：
1. 暗色主题不是"把白色换成黑色"，主文字不用纯白
2. 标题是导航辅助，不是视觉焦点
3. 层级通过字号、字重、颜色三个维度体现
4. SQL 编辑器是核心，周围元素为其服务

---

## 6. Frontend Skeleton Lock

详见 `docs/reports/m4-8-frontend-skeleton-lock.md`

**关键约束**：
1. 每轮最多 1-2 个核心页面
2. 不改后端 / store / 业务逻辑
3. 每轮必须有 tsc/test/build
4. 严格禁止恢复实验功能

---

## 7. Validation

### 前端验证

| 项目 | 结果 |
|------|------|
| tsc --noEmit | ✅ 无错误 |
| npm run test | ✅ 271 tests passed |
| npm run build | ✅ 成功（6 warnings，非本次引入） |
| npm run lint | ✅ 成功（6 warnings，非本次引入） |

### 后端验证

| 项目 | 结果 |
|------|------|
| python -c "from backend.main import app" | ✅ OK |

### 验证清单

- [x] SQL 编辑器能正常输入和执行
- [x] 结果表格能正常显示
- [x] 历史记录能正常查看
- [x] 暗色主题视觉一致
- [x] 无 console 错误
- [x] 无视觉回归

---

## 8. Next Step

1. 通过后合并到 master
2. 线上确认 SQL editor 和 History 页视觉问题已修复
3. 进入 M4-8.2 implementation（Home + Navigation Clarity）
4. 暂不进入 M5 Agent
5. 暂不打 tag

---

## 9. Summary

本轮完成：

1. ✅ 修复 SQL 编辑器视觉挤压问题（padding、lineHeight、min-height、间距）
2. ✅ 修复 History PageHeader 视觉突兀问题（颜色、字重、字号、层级）
3. ✅ 只修视觉，未改业务逻辑
4. ✅ 完成 UI/UX Reference Research 文档
5. ✅ 完成 Frontend Skeleton Lock 文档
6. ✅ 通过 tsc/test/build/lint/backend import 验证
7. ✅ 未开始 M4-8.2 implementation
8. ✅ 未开始 M5 Agent
9. ✅ 未打 tag
