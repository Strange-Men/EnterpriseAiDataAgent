# M4-4.1 Online UX Stability Hotfix

**版本**: v1.0.4
**日期**: 2026-06-21
**分支**: m4-4-1-online-ux-stability-hotfix

---

## 1. Problems Found

| # | Problem | Severity | Layer |
|---|---------|----------|-------|
| 1 | AI 分析不进历史记录 | High | Frontend |
| 2 | 历史页只显示 SQL 查询 | Medium | Frontend |
| 3 | Empty LLM response 用户不可读 | Medium | Frontend |
| 4 | AI 输出像工程日志 | Low | Frontend |
| 5 | 图表建议入口半成品 | Low | Frontend (已隐藏) |
| 6 | HR/新用户看不懂页面 | Low | Frontend i18n |

---

## 2. UX Decisions

1. **统一历史记录**: AI 分析和专家 SQL 共享同一个历史记录系统，用户可以在历史页看到所有操作记录
2. **类型标签**: 历史记录用紫色 "AI 分析" 和蓝色 "专家 SQL" 标签区分
3. **图表建议**: 已通过 feature flag `showChartsMode: false` 隐藏，不删除代码
4. **错误提示**: Empty LLM response 等技术错误改为用户友好文案，技术详情折叠显示
5. **结果展示**: AI 分析结果先显示摘要结论，再折叠显示执行步骤

---

## 3. History Unification

### 修改文件

| File | Change |
|------|--------|
| `stores/sql-history-store.ts` | 扩展 `SqlHistoryEntry` 接口，添加 `type`、`question`、`tableName`、`summary` 字段；添加 `filterType` 状态 |
| `components/investigation/investigation-workspace.tsx` | AI 分析完成后写入 `sql-history-store` |
| `panels/sql-workspace-panel.tsx` | 专家 SQL 执行时写入 `type: "sql"` |
| `panels/sql-history-panel.tsx` | 添加类型标签、类型筛选、显示 question/summary |

### 数据结构

```typescript
interface SqlHistoryEntry {
  id: string;
  type?: "sql" | "ai";  // 可选，兼容后端返回
  sql: string;
  question?: string;
  tableName?: string;
  summary?: string;
  status: "success" | "error" | "partial";
  runtimeMs: number;
  rowCount: number;
  error: string | null;
  timestamp: string;
}
```

---

## 4. Hidden Experimental Features

| Feature | Flag | Status |
|---------|------|--------|
| 图表建议 | `showChartsMode` | `false` — 已隐藏 |
| AI 按钮 (SQL 工作区) | `showAiButtonsInSqlWorkspace` | `false` — 已隐藏 |
| 自主分析模式 | `showAutonomousMode` | `false` — 已隐藏 |

**结论**: 图表建议入口已通过 feature flag 隐藏，数据页面和表管理面板均无图表建议入口。无需额外修改。

---

## 5. AI Error Message Improvements

### Empty LLM Response

**Before**: `Empty LLM response: line 1 column 1 (char 0)`

**After**:
- 主提示: `AI 暂时没有返回有效内容，请稍后重试，或换一个更具体的问题。`
- 提示: `提示：检查当前数据表是否选择正确，或尝试更具体的描述。`
- 技术详情: 默认折叠

### JSON Parse Error

**Before**: 直接显示 JSON 错误

**After**: `AI 返回格式不符合预期，已保留原始响应。` + 折叠技术详情

---

## 6. AI Result Presentation Improvements

### Before (工程日志式)

1. 分析计划
2. 步骤结果
3. 分析段落
4. 图表
5. 摘要

### After (分析报告式)

1. **执行摘要** — 用户能看懂的结论（最前面）
2. **分析段落** — 关键发现
3. **图表** — 可视化
4. **执行过程** — 折叠显示分析计划和步骤详情

---

## 7. Tests Added

### Updated Tests

| File | Change |
|------|--------|
| `stores/__tests__/sql-history-store.test.ts` | 添加 `makeAiEntry` helper；新增 AI 分析写入、类型筛选、question 搜索测试 |

### New Test Cases

| Test | Coverage |
|------|----------|
| `should add AI analysis entry` | AI 分析成功后写入历史 |
| `should filter by type` | 按 AI/SQL 类型筛选 |
| `should search by question field` | 搜索 question 字段 |

---

## 8. Validation Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ OK |
| `npm run test` | ✅ 138 passed (11 files) |
| `npx next build` | ✅ Compiled successfully |

---

## 9. Remaining Risks

1. **后端历史持久化**: 当前 AI 分析历史只在前端 localStorage，刷新后仍在但不同设备不共享
2. **后端 QueryHistoryItem**: 后端返回的历史记录没有 `type` 字段，前端通过 `type || "sql"` 兼容
3. **图表建议**: 功能代码保留，仅通过 feature flag 隐藏，后续可作为 M5+ 功能

---

## 10. Next Step

1. 合并 `m4-4-1-online-ux-stability-hotfix` 到 `master`
2. 线上验证历史记录统一和错误提示
3. 如稳定，可考虑 M4 Close-out
4. 图表功能后续可用 LLM 输出 chart spec + Recharts 实现，不需要多模态 API
5. 当前目标是让线上 demo 对普通用户清晰、稳定、可演示

---

## 11. What This Is NOT

- ❌ 不是 M5 Agent
- ❌ 不是图表功能实现
- ❌ 不是多模态 API 集成
- ❌ 不是后端大重构
- ✅ 是线上 UX 稳定性修复
- ✅ 是让 demo 对普通用户可用
