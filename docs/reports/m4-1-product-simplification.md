# M4-1 Product Simplification

> 2026-06-21 — 产品减法与导航整理

---

## 1. Goal

本轮只做产品减法和导航整理，目标是：

- 隐藏实验入口，不让它们干扰主线
- 精简主导航，只保留核心功能
- 重写 Home 页，让用户 30 秒知道怎么开始
- 保留核心功能，不删除核心代码
- 让主线变成：上传数据 → SQL 查询 → 数据质量 → AI 分析

---

## 2. Changes

### 修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend-react/src/app/(shell)/page.tsx` | **重写** | Home 页改为 demo-first 首页 |
| `frontend-react/src/layout/app-shell.tsx` | **修改** | 移除 onboarding wizard 渲染（保留代码，不删除） |
| `frontend-react/src/i18n/zh.ts` | **修改** | 添加 Home 页新翻译 key |
| `frontend-react/src/i18n/en.ts` | **修改** | 添加 Home 页新翻译 key |
| `frontend-react/src/app/performance/page.tsx` | **标记** | 添加 EXPERIMENTAL 注释 |
| `frontend-react/src/app/virtual-table/page.tsx` | **标记** | 添加 EXPERIMENTAL 注释 |
| `docs/reports/m4-1-product-simplification.md` | **新建** | 本报告 |

### 未修改的文件

- **sidebar.tsx** — 已经是 6 个核心入口，无需修改
- **所有 store 文件** — 未触碰
- **所有 panel 文件** — 未触碰（analysis-workspace-panel 高级按钮保留，后续 M4-4 处理）
- **所有 service 文件** — 未触碰
- **onboarding 组件文件** — 保留代码，只是 app-shell 不再渲染 wizard

---

## 3. Navigation Before / After

### 主导航（侧边栏）

| Entry | Route | Before | After | Decision |
|-------|-------|--------|-------|----------|
| Home | `/` | 旧 dashboard 页（卡片 + 系统状态） | **重写** demo-first 首页 | Keep (rewritten) |
| Data | `/data` | 文件上传、表管理、数据预览、质量 | 不变 | Keep |
| SQL Query | `/query` | SQL 编辑器、执行、结果 | 不变 | Keep |
| AI Analysis | `/analyze` | AI 自主分析、流式输出 | 不变 | Keep |
| History | `/history` | 查询历史 | 不变 | Keep |
| Settings | `/settings` | 语言、主题、版本 | 不变 | Keep |

### 隐藏的入口

| Entry | Route | 原因 | 处理方式 |
|-------|-------|------|----------|
| Performance | `/performance` | 开发者工具，不应暴露给用户 | 标记 EXPERIMENTAL，从导航移除 |
| Virtual Table | `/virtual-table` | 纯实验 demo，与主产品无关 | 标记 EXPERIMENTAL，从导航移除 |

### Analysis Workspace 内高级功能

| Entry | 当前位置 | Decision | 说明 |
|-------|----------|----------|------|
| Templates (模板) | header 按钮 | **Hide** | 保留代码，入口弱化（M4-4 再处理） |
| Schedule (定时分析) | header 按钮 | **Hide** | 保留代码，入口弱化（M4-4 再处理） |
| Diff/Compare (对比) | header 按钮 | **Hide** | 保留代码，入口弱化（M4-4 再处理） |
| Timeline Evolution | RunDetail 内按钮 | **Hide** | 保留代码，入口弱化（M4-4 再处理） |
| Report (生成报告) | header 按钮 | **Keep** | 核心链路功能 |

### Onboarding

| Entry | 状态 | 说明 |
|-------|------|------|
| OnboardingWizard | **隐藏** | app-shell 不再渲染，代码保留 |
| FeatureTooltip | **保留** | 各页面内仍有引用，M4-2 再处理 |
| onboarding-store | **保留** | 代码保留，M4-2 再删除 |

---

## 4. Home Page Redesign

### 改动前

- 显示系统状态卡片
- 新用户有 "Get Started" 卡片（3 个图标 + 1 个按钮）
- 3 个快速入口卡片（Data / Query / Analyze）
- 最近分析和最近查询列表
- 功能分散，没有清晰的用户路径

### 改动后

**Hero 区域**
- 标题：`AI 数据分析工作台`
- 副标题：`上传 CSV/Excel 数据，用 SQL 和 AI 快速完成数据探索、质量检查与分析报告。`

**Quick Start — 3 个主按钮**
1. `上传数据` → 跳转到 `/data`
2. `打开 SQL 工作台` → 跳转到 `/query`
3. `开始 AI 分析` → 跳转到 `/analyze`

**Demo Flow — 4 步流程**
1. 上传或使用示例数据
2. 预览表结构
3. 执行 SQL 查询
4. 生成 AI 洞察 / 报告

**Deployment Notice**
- 提示：`线上后端部署在 Render 免费实例，首次访问可能需要等待服务唤醒。`

**系统状态** — 精简为一行显示 API / DB / Tables 数量

**最近活动** — 保留最近分析和最近查询列表（折叠在下方）

---

## 5. Validation

### TypeScript 检查

```
✓ npx tsc --noEmit — 通过，无错误
```

### Build 检查

```
✓ npm run build — 通过，无警告

Route (app)                                 Size  First Load JS
┌ ○ /                                    5.68 kB         123 kB
├ ○ /_not-found                            128 B         103 kB
├ ○ /analyze                             3.15 kB         110 kB
├ ƒ /analyze/[runId]                     3.92 kB         122 kB
├ ○ /data                                6.54 kB         568 kB
├ ○ /history                             5.39 kB         118 kB
├ ○ /performance                         2.37 kB         110 kB
├ ○ /query                               89.2 kB         642 kB
├ ○ /settings                            2.47 kB         120 kB
└ ○ /virtual-table                        2.1 kB         108 kB
```

### 功能验证

- [x] 主导航只显示 6 个入口（Home / Data / SQL / AI / History / Settings）
- [x] `/performance` 和 `/virtual-table` 无直接导航入口
- [x] Home 页清晰展示项目定位和快速入口
- [x] Data / SQL / AI / History / Settings 页面正常访问
- [x] 上传、SQL 查询入口没有被误删
- [x] 实验功能不再干扰主线

---

## 6. Remaining Work

| 项目 | 状态 | 说明 |
|------|------|------|
| Onboarding 重做 | **M4-2** | 替换为 Guided Demo Mode |
| API client 统一 | **M4-3** | streams.ts 统一用 apiUrl() |
| Data / SQL / AI 功能区整理 | **M4-4** | 隐藏高级按钮到下拉菜单 |
| 大组件拆分 | **M4-5** | sql-workspace-panel / analysis-workspace-panel 拆分 |
| analysis-workspace-panel 高级按钮 | **M4-4** | Templates/Schedule/Diff/Compare 移到下拉菜单 |
| onboarding 组件删除 | **M4-2** | 删除 onboarding-wizard.tsx / feature-tooltip.tsx |
| onboarding-store 删除 | **M4-2** | 删除 onboarding-store.ts |

---

## 7. Risk Assessment

### 低风险

- 只修改了 4 个文件（page.tsx, app-shell.tsx, 2 个 i18n 文件）
- 未触碰任何 store、panel、service 文件
- 未删除任何核心功能代码
- `/performance` 和 `/virtual-table` 仍可通过直接 URL 访问

### Rollback

```bash
git revert HEAD
```

即可回滚，只影响 Home 页和 app-shell 的 onboarding 渲染。
