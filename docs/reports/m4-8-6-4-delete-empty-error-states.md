# M4-8.6.4 Delete / Empty / Error State Polish

## 1. Goal

让 Data Page 的危险操作、空态和错误态更清晰、更产品化，同时不改变任何数据行为。

## 2. Changes

### Delete Action Copy
- `table.confirm-delete`：从「确认删除表」改为「确定要删除这张数据表吗？删除后，相关历史记录可能无法直接重新运行。」
- `table.delete-aria`：新增 aria-label，提升可访问性
- `table.delete-success`：使用 i18n 插值 `已删除数据表「{{name}}」`
- `table.delete-failed`：友好提示「删除失败，请刷新后重试。」

### Delete Button
- 添加 `aria-label={t("table.delete-aria")}` 到删除按钮
- 保持 hover-only 显示模式（不改交互模式）
- 保持 × 字符作为图标（不改视觉权重）

### No Table Empty State
- `table.no-tables`：从「数据库中暂无表。」改为「暂无数据表」（更简洁）
- `table.no-tables-desc` 保持不变（已是友好引导文案）

### No Preview Empty State
- `preview.no-table-selected`：新增，「暂无预览数据」
- `preview.no-table-selected-desc`：新增，「选择一张数据表后，可以在这里查看样例数据和基础质量信息。」
- 区分「无选中表」和「有表但无数据」两种空态

### Upload Error State
- `upload.error-hint`：新增，「上传失败，请检查文件格式和大小后重试。」
- 上传失败时显示友好提示（黄色），原始错误信息降级为辅助文本

### Load Error State
- `upload.load-error-hint`：新增，「数据加载失败，请刷新页面或重新选择数据表。」
- 用于 preview 面板无数据时的描述文案

### i18n
新增 key（zh + en）：
| Key | zh | en |
|-----|----|----|
| `table.delete-aria` | 删除数据表 | Delete data table |
| `table.delete-success` | 已删除数据表「{{name}}」 | Deleted table "{{name}}" |
| `table.delete-failed` | 删除失败，请刷新后重试。 | Delete failed. Please refresh and try again. |
| `preview.no-table-selected` | 暂无预览数据 | No preview data yet |
| `preview.no-table-selected-desc` | 选择一张数据表后，可以在这里查看样例数据和基础质量信息。 | Choose a table to review sample rows and basic quality information. |
| `upload.error-hint` | 上传失败，请检查文件格式和大小后重试。 | Upload failed. Check the file format and size, then try again. |
| `upload.load-error-hint` | 数据加载失败，请刷新页面或重新选择数据表。 | Failed to load data. Refresh the page or choose the table again. |

修改 key：
| Key | 旧值 (zh) | 新值 (zh) |
|-----|-----------|-----------|
| `table.confirm-delete` | 确认删除表 | 确定要删除这张数据表吗？删除后，相关历史记录可能无法直接重新运行。 |
| `table.no-tables` | 数据库中暂无表。 | 暂无数据表 |
| `upload.no-files` | 暂无已上传文件。 | 暂无已上传文件 |

## 3. What Was Not Changed

- 未改业务逻辑
- 未改 API
- 未改 Store
- 未改后端
- 未改上传逻辑
- 未改表选择逻辑
- 未改删除逻辑（handler、API 调用、active table 处理）
- 未改预览数据加载逻辑
- 未改 Data Quality 计算逻辑
- 未改原生 confirm 行为（仅调整文案）
- 未新增复杂 modal
- 未开始 M4-8.6.5
- 未开始 M5 Agent

## 4. Tests

新增测试文件：`frontend-react/src/app/(shell)/__tests__/data-delete-empty-error-states.test.tsx`

测试覆盖（26 个测试）：
1. table.delete key 存在（中英文）
2. table.delete-aria key 存在且包含删除/Delete
3. confirm-delete 提及历史记录影响（中英文）
4. confirm-delete 不使用旧的短格式
5. delete-success 使用插值（中英文）
6. delete-failed 友好且提及刷新（中英文）
7. table.no-tables 用户友好，不含技术术语（中英文）
8. table.no-tables-desc 引导下一步操作（中英文）
9. preview.no-table-selected 存在且提及预览（中英文）
10. preview.no-table-selected-desc 引导选择表（中英文）
11. preview.no-data-loaded 保留（向后兼容）
12. upload.error-hint 存在且友好（中英文）
13. upload.load-error-hint 存在且友好（中英文）
14. 现有 table key 保留
15. 现有 preview key 保留
16. 现有 upload key 保留
17. 不恢复 Templates/Schedule/Diff/Timeline 面板
18. 新增 key 均在预期命名空间

更新测试：`data-table-list-current-table.test.tsx`
- 更新 `table.confirm-delete` 断言，从精确匹配改为包含匹配

## 5. Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ pass |
| vitest run | ✅ 909/909 passed (41 files, +26 new) |
| next build | ✅ compiled successfully |
| next lint | ✅ warnings only (pre-existing) |
| backend import | ✅ OK |

## 6. Known Risks

- 删除当前表后的 active table 行为如需进一步优化，应单独开阶段
- 上传失败可能需要后端错误码支持更细粒度提示
- 历史 stale 状态依赖前端 table list 刷新
- 删除按钮 hover-only 在触屏设备仍不可见（不改交互模式，记录为已知限制）

## 7. Online Check List

- [ ] 删除按钮是否不抢主视觉 — × 图标，hover-only
- [ ] 删除确认文案是否清楚 — 提及历史记录影响
- [ ] 无表空态是否友好 — 「暂无数据表」+ 上传引导
- [ ] 无预览空态是否友好 — 「暂无预览数据」+ 选择表引导
- [ ] 上传失败是否友好 — 黄色提示 + 格式/大小建议
- [ ] 上传 / 选表 / 删除是否没回归 — 未改相关逻辑
- [ ] Data Quality 是否没回归 — 未改相关逻辑

## 8. Next Step

通过后进入 M4-8.6.5 Data Page Regression。
暂不进入 M5 Agent。
暂不打 tag。
