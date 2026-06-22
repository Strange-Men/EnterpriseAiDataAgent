# M4-7.1.6-A Markdown Report Quality

## 1. Problem
Markdown 导出能下载，但内容像执行日志，不像分析报告。用户看不到最终结论、结果表、指标完成情况。Trace 权重过高，SQL 内联在步骤中导致报告过长。

## 2. Root Cause
- 缺少执行摘要：只从 sections 中查找，找不到则不显示
- 缺少关键发现：同上，无法从 steps 中提取
- 缺少最终结果表：没有展示查询结果 rows
- 缺少指标完成情况检查：没有分析用户问题中要求的指标是否被 SQL 覆盖
- 缺少字段缺失说明：用户要求平均折扣但 SQL 没有 discount 时静默省略
- Trace 权重过高：Trace 在主报告中显示，不是附录
- SQL 内联在步骤中：每个步骤都显示完整 SQL，报告过长

## 3. Fixes

### 3.1 export-markdown.ts 重写
- 拆分为小函数：`extractRequestedMetrics`, `evaluateMetricCoverage`, `formatMarkdownTable`, `buildExecutiveSummary`, `buildKeyFindings`
- 报告结构按 11 个章节组织
- Trace 移到附录（第 10 节）
- SQL 移到附录（第 9 节）
- 步骤只显示状态、行数、错误，不显示 SQL

### 3.2 新增指标完成情况检查
- 基于用户问题关键词提取要求（总销售额、平均折扣、退货率等 18 个关键词）
- 检查最终 SQL 中是否包含相关字段或计算逻辑
- 如果 SQL 未包含，标记为未完成并说明

### 3.3 最终结果表
- 优先从 run/step data 中取结果 rows，展示前 20 行
- 长文本单元格截断到 50 字符
- 如果没有 rows，明确说明"当前记录未保存完整结果行"

### 3.4 测试更新
- 新增 `export-markdown.test.ts`：35 个测试
- 更新 `__tests__/export-markdown.test.ts`：适配新格式（✓/✗ 状态、LLM 调用次数）

## 4. Markdown Report Contract

```markdown
# AI 数据分析报告

## 1. 用户问题
原始问题

## 2. 数据表
表名

## 3. 执行摘要
用 3-5 句话总结结果。如果没有足够数据生成业务结论，也要明确说明。

## 4. 关键发现
- 发现 1
- 发现 2

## 5. 最终结果
展示最终成功步骤的结果表，至少前 20 行。

## 6. 指标完成情况
| 用户要求 | 是否完成 | 对应字段 / 计算方式 | 说明 |

## 7. 未满足项 / 缺失字段说明
- 未满足项 1

## 8. 分析步骤
每一步：Step 名称、状态（✓/✗）、行数、错误

## 9. SQL 附录
集中放完整 SQL

## 10. 调用追踪 Trace
- LLM 调用次数
- Token
- 耗时

## 11. 生成时间
本地 24 小时时间
```

## 5. Validation

| 检查项 | 结果 |
|---|---|
| tsc --noEmit | ✅ 通过 |
| export-markdown tests | ✅ 50 passed |
| full frontend tests | ✅ 257 passed |
| frontend build | ✅ 通过 |
| backend import | ✅ OK |

## 6. Remaining Risks
- 如果 run/history 当前没有持久化完整 rows，Markdown 只能说明"当前记录未保存完整结果行"
- 更强的自然语言指标覆盖检查后续可以继续增强（当前基于关键词匹配）
- 这不是 M4-7.2
- 这不是 M5 Agent

## 7. Next Step
合并后用户线上重新导出 Markdown 验证。
通过后再跑 M4-7.1.6-B Local Full Regression Audit。
暂不打 tag。
暂不开始 M5 Agent。
