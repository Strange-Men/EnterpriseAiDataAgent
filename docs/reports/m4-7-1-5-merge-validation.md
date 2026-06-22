# M4-7.1.5 Merge Validation

## 1. Merge Result

- **source branch**: `m4-7-1-5-save-export-semantics`
- **target branch**: `master`
- **merge commit**: `8756ac0` (fast-forward)

## 2. What Changed

- 删除保存为模板语义（不再在分析详情页出现"保存为模板"按钮）
- 删除含义不明的"保存 / 取消保存"按钮
- AI 分析默认导出 Markdown（主按钮为"导出 Markdown"）
- JSON 降级为开发者原始导出（更多菜单 → "原始 JSON / 开发者"）
- History AI 记录支持导出 Markdown
- History SQL 记录支持导出 CSV
- 新增 `export-markdown.ts` 工具函数
- 新增回归测试：`export-semantics-regression.test.ts`、`export-markdown.test.ts`
- i18n 更新：中英文导出/保存相关文案调整

## 3. Validation

| 检查项 | 结果 |
|--------|------|
| tsc --noEmit | ✅ 通过（无错误） |
| vitest | ✅ 通过（19 files, 222 tests） |
| next build | ✅ 通过（compiled successfully） |
| backend import | ✅ 通过 |
| pytest | 本轮无后端改动，跳过 |

## 4. Online Validation Checklist

1. 分析详情页不再出现"保存为模板"
2. 分析详情页不再出现含义不明的"保存 / 取消保存"
3. 分析详情页主按钮是：重新运行 / 导出 Markdown / 更多
4. 点击"导出 Markdown"能下载 `.md` 文件
5. Markdown 内容包含：问题、数据表、执行摘要、分析步骤、生成时间
6. 更多菜单里的 JSON 文案是"原始 JSON / 开发者"
7. History 页 AI 分析记录有：打开详情 / 重新运行 / 导出 Markdown / 复制问题
8. History 页专家 SQL 记录有：加载到工作台 / 重新执行 / 导出 CSV / 复制 SQL
9. 导出 CSV 能正常下载
10. Templates UI 没有恢复
11. 专家 SQL 和自然语言分析主链路仍正常

## 5. Next Step

线上验证通过后，进入 M4-7.2 State Boundary Cleanup。
暂不进入 M5 Agent。
暂不打 tag。
