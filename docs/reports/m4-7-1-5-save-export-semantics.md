# M4-7.1.5 Save / Export / Template UX Semantics

## 1. Problem

保存、导出、模板、历史的产品语义混乱：

- 分析详情页有"保存/取消保存"按钮，toast 显示"保存为模板"
- 模板功能已 deprecated/hidden，但详情页仍出现"保存为模板"语义
- 用户误以为"保存"就是"导出"
- 导出藏在更多菜单里，太难找
- 导出 JSON，普通用户/HR 看不懂
- AI 分析结果应默认导出 Markdown 报告
- History 页需要明确"导出 Markdown/导出 CSV"语义

## 2. Product Semantics

| 概念 | 语义 |
|------|------|
| History | 自动保存记录 |
| Export | 给用户拿走结果 |
| Template | deprecated，继续隐藏 |
| AI 分析默认导出 | Markdown |
| 专家 SQL 默认导出 | CSV |
| JSON | 开发者原始数据 |

## 3. Changes

### 3.1 New Files

- `frontend-react/src/utils/export-markdown.ts` — Markdown 报告生成工具
- `frontend-react/src/utils/__tests__/export-markdown.test.ts` — Markdown 导出测试
- `frontend-react/src/config/__tests__/export-semantics-regression.test.ts` — Feature flag 回归测试

### 3.2 Modified Files

#### `frontend-react/src/components/investigation/run-header.tsx`

- 删除 Save/Unsave 按钮及其 handler
- 删除 Duplicate 功能（与 Export 语义冲突）
- "导出 Markdown" 升级为主按钮（primary variant）
- JSON 导出降级到更多菜单，文案改为"导出原始 JSON（开发者）"
- 新增"复制摘要"功能到更多菜单
- 主按钮区：重新运行 | 导出 Markdown | 更多

#### `frontend-react/src/panels/sql-history-panel.tsx`

- AI 记录新增"导出 Markdown"按钮
- SQL 记录新增"导出 CSV"按钮
- 头部"导出历史"改为导出 CSV 格式（原为 JSON）
- 按钮区增加 flex-wrap 适配

#### `frontend-react/src/i18n/zh.ts`

- `analysis.export` → "导出 Markdown"
- 新增 `analysis.export-raw-json` → "导出原始 JSON（开发者）"
- 新增 `analysis.copy-summary` → "复制摘要"
- 新增 `history.export-md` → "导出 Markdown"
- 新增 `history.export-csv` → "导出 CSV"

#### `frontend-react/src/i18n/en.ts`

- `analysis.export` → "Export Markdown"
- 新增 `analysis.export-raw-json` → "Export Raw JSON (Developer)"
- 新增 `analysis.copy-summary` → "Copy Summary"
- 新增 `history.export-md` → "Export Markdown"
- 新增 `history.export-csv` → "Export CSV"

### 3.3 UI Behavior Summary

| 页面 | 之前 | 之后 |
|------|------|------|
| 分析详情页主按钮 | 保存 / 重新运行 / 更多 | 重新运行 / 导出 Markdown / 更多 |
| 分析详情页更多菜单 | 复制 / 导出 JSON / 删除 | 复制摘要 / 导出原始 JSON（开发者）/ 删除 |
| 分析详情页 toast | "保存为模板" | 已删除 |
| History AI 记录 | 查看详情 / 重新运行 / 复制问题 | 查看详情 / 重新运行 / 导出 Markdown / 复制问题 |
| History SQL 记录 | 加载到工作台 / 重新执行 / 复制 SQL | 加载到工作台 / 重新执行 / 导出 CSV / 复制 SQL |
| History 头部导出 | 导出 JSON | 导出 CSV |

## 4. What Was Not Changed

- 未重复修改 AI SQL generation
- 未重复修改 schema_semantics / sql_templates
- 未重复重构 History Recall
- 未恢复 Templates UI
- 未恢复 Scheduler / Diff / Timeline / Charts / Anomalies
- 未开始 M4-7.2
- 未开始 M5 Agent

## 5. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `vitest run` | ✅ Pass (222/222, +21 new) |
| `next build` | ✅ Pass |
| `python -c "from backend.main import app"` | ✅ Pass |

## 6. Next Step

- 合并后线上验证 Save / Export 语义
- 通过后进入 M4-7.2 State Boundary Cleanup
- 暂不打 tag
- 暂不开始 M5 Agent
