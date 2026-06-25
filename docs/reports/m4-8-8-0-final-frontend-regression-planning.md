# M4-8.8.0 Final Frontend Regression Planning

## 1. Goal

在 M4 UI/UX 封板前，规划最终前端回归范围，确保所有核心页面、主链路、i18n、空态、错误态和禁用实验功能状态稳定。

## 2. Why This Stage Exists

M4-8.1 到 M4-8.7 已完成主要前端 UI/UX 重设计和逐页打磨：

| 阶段 | 内容 | 状态 |
|------|------|------|
| M4-8.1 | Design Tokens + Base UI Cleanup | ✅ Done |
| M4-8.2 | Home + Navigation Clarity | ✅ Done |
| M4-8.3 | Analysis Workspace UX Polish | ✅ Done |
| M4-8.4 | Analysis Detail Report Layout | ✅ Done |
| M4-8.5 | History UX Polish | ✅ Done |
| M4-8.6 | Data Page Polish | ✅ Done |
| M4-8.7 | Settings + i18n Copy Polish | ✅ Done |

M4-8.8 不是重新设计前端，而是封板前最后的前端质量闸门。

## 3. Final Regression Scope

### 3.1 实际路由（来自 `next build`）

| Route | Type | Size |
|---|---|---|
| `/` | Static | 3.77 kB / 126 kB |
| `/analyze` | Static | 1.82 kB / 104 kB |
| `/analyze/[runId]` | Dynamic | 5.99 kB / 121 kB |
| `/data` | Static | 434 kB / 572 kB |
| `/history` | Static | 11.6 kB / 138 kB |
| `/query` | Static | 784 B / 106 kB |
| `/settings` | Static | 2.7 kB / 120 kB |

### 3.2 页面覆盖

| 页面 | 路由 | M4-8 阶段 | 回归状态 |
|------|------|-----------|---------|
| Home | `/` | M4-8.2 | 需验证 |
| Data Page | `/data` | M4-8.6 | 需验证 |
| Analysis Workspace | `/analyze` | M4-8.3 | 需验证 |
| Analysis Detail | `/analyze/[runId]` | M4-8.4 | 需验证 |
| History | `/history` | M4-8.5 | 需验证 |
| Settings | `/settings` | M4-8.7 | 需验证 |
| Query | `/query` | — | 需验证 |

## 4. Audit Table

| 区域 | 检查内容 | 当前风险 | M4-8.8 是否覆盖 | 最小验证方式 |
|------|---------|---------|-----------|---------|
| Home | 页面标题、CTA 按钮、快速入口、最近活动、空态引导 | 低 | ✅ | 路由存在性测试 + i18n key 测试 |
| Data Page | 上传引导、表列表、预览、质量报告、删除/空态/错误态 | 低 | ✅ | 回归测试已存在 (43 tests) |
| Analysis Workspace | Tab 切换、NL Query、SQL Editor、工具栏分组、结果状态 | 低 | ✅ | 回归测试已存在 (81 tests) |
| Analysis Detail | 报告头部、Summary、Findings、SQL/Trace 折叠、导出 | 低 | ✅ | 回归测试已存在 (43 tests) |
| History | 搜索筛选、记录卡片、操作按钮、导出语义、stale guard | 低 | ✅ | 回归测试已存在 (11 tests) |
| Settings | 页面结构、语言切换、主题切换、系统信息 | 低 | ✅ | 回归测试已存在 (39 tests) |
| i18n | zh/en key 对称、术语一致性、无硬编码残留 | 低 | ✅ | key symmetry 测试 |
| Disabled Experimental Features | /performance、/virtual-table、Templates、Scheduler、Charts、Anomalies、Diff、Timeline、Command Palette、Global Search、Keyboard Shortcuts | 低 | ✅ | 路由不存在测试 + sidebar 无引用测试 |
| Mobile / Responsive | 移动端布局、sidebar 折叠、内容区适配 | 中 | ✅ | 需人工检查 |
| Build / CI | tsc、test、build、lint、backend import | 低 | ✅ | 自动化验证 |

### 4.1 禁用实验功能确认

| 功能 | 路由/入口 | 确认状态 |
|------|----------|---------|
| /performance | 路由不存在 | ✅ 已确认 |
| /virtual-table | 路由不存在 | ✅ 已确认 |
| Templates | feature flag 控制，sidebar 无入口 | ✅ 已确认 |
| Scheduler | feature flag 控制，sidebar 无入口 | ✅ 已确认 |
| Charts | feature flag 控制 | ✅ 已确认 |
| Anomalies | feature flag 控制 | ✅ 已确认 |
| Diff | feature flag 控制 | ✅ 已确认 |
| Timeline | feature flag 控制 | ✅ 已确认 |
| Command Palette | 无入口 | ✅ 已确认 |
| Global Search | 无入口 | ✅ 已确认 |
| Keyboard Shortcuts | 无入口 | ✅ 已确认 |

## 5. Main Workflow To Validate

```text
Upload → Table Select → Data Preview → Analyze → History → Detail → Export
```

### 路径 A：首次使用 Demo 数据

```text
首页 → 点击"开始分析" → 分析工作台 (AI Query Tab)
→ 选择数据表 → 输入问题 → AI 执行多步分析
→ 查看结果 → 点击"查看详情" → 分析详情页
→ 点击"导出 Markdown" → 下载报告
```

### 路径 B：上传自己的 CSV/Excel

```text
首页 → 点击"上传数据" → 数据页
→ 拖拽上传 CSV → 数据预览 → 点击表名
→ 点击 "AI" 分析按钮 → 分析工作台
→ 输入问题 → AI 分析 → 查看结果
```

### 路径 C：专家 SQL 用户

```text
分析工作台 → Expert SQL Tab
→ 输入 SQL 或点击"AI 生成 SQL" → 执行
→ 查看结果表格 → 导出 CSV / 保存查询
```

### 路径 D：回查历史

```text
历史页 → 搜索/筛选
→ 打开详情 / 重新运行 / 加载到工作台 / 导出
```

## 6. Disabled Features To Verify

必须确认这些没有被恢复：

| 功能 | 验证方式 | 预期结果 |
|------|---------|---------|
| /performance | 路由不存在 | 404 |
| /virtual-table | 路由不存在 | 404 |
| Templates | sidebar 无入口 | 不显示 |
| Scheduler | sidebar 无入口 | 不显示 |
| Charts | feature flag 控制 | 不显示 |
| Anomalies | feature flag 控制 | 不显示 |
| Diff | feature flag 控制 | 不显示 |
| Timeline | feature flag 控制 | 不显示 |
| Command Palette | 无入口 | 不显示 |
| Global Search | 无入口 | 不显示 |
| Keyboard Shortcuts | 无入口 | 不显示 |

## 7. M4-8.8 Split Plan

| 阶段 | 目标 | 改动范围 | 禁止事项 | 验收标准 |
|------|------|---------|---------|---------|
| **M4-8.8.1** Final Frontend Regression Tests | 新增最终前端回归测试，覆盖所有核心页面、主链路、禁用功能、i18n | 仅新增测试文件 + 报告 | 不改 UI 代码、不改业务逻辑、不改 Store、不改 API、不改后端 | tsc/test/build/lint 全部通过，回归报告生成 |
| **M4-8.8.2** Online Manual Acceptance Checklist | 生成线上人工验收清单，覆盖主链路、视觉一致性、移动端 | 仅新增报告 | 不改 UI 代码、不改业务逻辑 | 人工验收清单生成，待用户逐项确认 |
| **M4-8.8.3** Final UI/UX Release Candidate Report | 生成 M4 UI/UX 封板报告，确认所有阶段完成 | 仅新增报告 | 不改 UI 代码、不改业务逻辑 | 封板报告生成，M4-8.x 阶段正式收口 |

### 详细说明

#### M4-8.8.1 Final Frontend Regression Tests

**目标**：通过自动化测试确认所有核心页面和主链路在 M4-8.1 到 M4-8.7 改造后仍然稳定。

**改动清单**：
1. 新增最终前端回归测试文件
2. 覆盖所有核心页面路由存在性
3. 覆盖禁用实验路由不存在
4. 覆盖主页面标题 / CTA / i18n
5. 覆盖主链路 UI 不回归
6. 生成回归报告

**允许**：
- 新增最终前端回归测试
- 补充路由存在性测试
- 补充禁用实验路由不存在测试
- 补充主页面标题 / CTA / i18n 测试
- 补充主链路 UI 不回归测试
- 生成回归报告

**禁止**：
- 不改 UI 代码，除非发现明显 typo / test mock 问题
- 不做大视觉改版
- 不改业务逻辑
- 不改 Store
- 不改 API
- 不改后端
- 不开始 M5 Agent
- 不打 tag

**验收标准**：
- tsc --noEmit pass
- npm run test pass（所有测试）
- npm run build pass
- npm run lint pass（仅 warnings）
- backend import OK
- 回归报告生成

#### M4-8.8.2 Online Manual Acceptance Checklist

**目标**：生成线上人工验收清单，供用户在 Vercel 部署后逐项确认。

**改动清单**：
1. 生成人工验收清单报告
2. 覆盖所有核心页面视觉一致性
3. 覆盖主链路可走通性
4. 覆盖中英文切换
5. 覆盖移动端响应式

**允许**：
- 新增验收清单报告

**禁止**：
- 不改 UI 代码
- 不改业务逻辑
- 不改 Store
- 不改 API
- 不改后端

**验收标准**：
- 验收清单报告生成
- 覆盖所有核心页面
- 覆盖所有主链路
- 覆盖中英文切换
- 覆盖移动端

#### M4-8.8.3 Final UI/UX Release Candidate Report

**目标**：生成 M4 UI/UX 封板报告，正式确认 M4-8.x 阶段完成。

**改动清单**：
1. 生成封板报告
2. 总结 M4-8.1 到 M4-8.8 所有阶段
3. 记录已知风险和遗留问题
4. 确认 M4 UI/UX 阶段正式收口

**允许**：
- 新增封板报告

**禁止**：
- 不改 UI 代码
- 不改业务逻辑
- 不改 Store
- 不改 API
- 不改后端

**验收标准**：
- 封板报告生成
- M4-8.x 所有阶段确认完成
- 已知风险记录完整
- 遗留问题记录完整

## 8. M4-8.8.1 Scope

下一轮最小范围只做 Final Frontend Regression Tests。

### 8.1 允许

- 新增最终前端回归测试
- 补充路由存在性测试
- 补充禁用实验路由不存在测试
- 补充主页面标题 / CTA / i18n 测试
- 补充主链路 UI 不回归测试
- 生成回归报告

### 8.2 禁止

- 不改 UI 代码，除非发现明显 typo / test mock 问题
- 不做大视觉改版
- 不改业务逻辑
- 不改 Store
- 不改 API
- 不改后端
- 不开始 M5 Agent
- 不打 tag

### 8.3 预计测试覆盖

| 测试分类 | 预计测试数 | 说明 |
|---------|-----------|------|
| 路由存在性 | ~10 | 所有核心页面路由存在 |
| 禁用路由不存在 | ~11 | /performance、/virtual-table 等 |
| 页面标题 / CTA | ~15 | 各页面标题、主 CTA 按钮 |
| i18n 完整性 | ~10 | zh/en key 对称、关键文案 |
| 主链路 UI | ~20 | Upload → Select → Preview → Analyze → History → Detail → Export |
| 空态 / 错误态 | ~10 | 各页面空态和错误态友好 |
| 视觉一致性 | ~10 | 暗黑风、accent、Card/Badge/Button |
| 总计 | ~86 | 新增回归测试 |

### 8.4 预计文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `frontend-react/src/app/(shell)/__tests__/final-frontend-regression.test.tsx` | 新增 | 最终前端回归测试 |
| `docs/reports/m4-8-8-1-final-frontend-regression.md` | 新增 | 回归报告 |

## 9. Known Risks

| 风险 | 影响 | 状态 | 建议 |
|------|------|------|------|
| `export-markdown.ts` 硬编码中文 | 英文界面下导出的 Markdown 报告仍为中文 | ⚠️ 已记录 | 作为独立阶段处理，不纳入 M4-8.8 |
| 线上移动端仍需人工检查 | 移动端布局可能有边缘问题 | ⚠️ 已记录 | M4-8.8.2 人工验收 |
| Vercel 部署后 API URL 需确认 | 环境变量可能影响 AI 功能 | ⚠️ 已记录 | 人工确认 |
| 最终封板前仍需人工点击主链路 | 自动化测试无法覆盖所有视觉细节 | ⚠️ 已记录 | M4-8.8.2 人工验收 |
| 不能用 M4-8.8 引入新功能 | M4-8.8 是质量闸门，不是功能阶段 | ✅ 已确认 | 严格遵守 |

## 10. Current Test Baseline

| 指标 | 值 |
|------|-----|
| 测试文件 | 45 passed |
| 测试用例 | 1049 passed |
| tsc | ✅ pass |
| build | ✅ compiled in 6.3s |
| lint | ✅ warnings only (3 pre-existing) |
| backend import | ✅ OK |
| i18n keys (zh) | 692 |
| i18n keys (en) | 692 |
| i18n symmetry | ✅ symmetric |

## 11. Existing Regression Tests

| 测试文件 | 阶段 | 测试数 |
|---------|------|--------|
| analysis-workspace-regression.test.tsx | M4-8.3.5 | 81 |
| analysis-detail-regression.test.tsx | M4-8.4.5 | 43 |
| history-export-semantics.test.tsx | M4-8.5.6 | 11 |
| data-page-regression.test.tsx | M4-8.6.5 | 43 |
| settings-i18n-regression.test.tsx | M4-8.7.3 | 39 |
| **Total** | | **217** |

M4-8.8.1 将在此基础上新增 ~86 个最终回归测试。

## 12. Next Step

等待用户确认后，进入 M4-8.8.1 Final Frontend Regression Tests。
暂不进入 M5 Agent。
暂不打 tag。
