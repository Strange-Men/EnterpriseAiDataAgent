# M4-8.5.5 History Regression

## 1. Goal

确认 M4-8.5.1 到 M4-8.5.4 的 History UX 改造没有破坏历史页主链路。

## 2. Regression Scope

- Header + Filters
- Record Cards
- Actions
- Stale / Invalid Record UX
- Disabled experimental features

## 3. Findings

### Header + Filters

| 检查项 | 结果 |
|--------|------|
| History header 是否清楚 | ✅ 标题"历史记录"，说明"回查、复用和导出之前的 AI 分析与 SQL 查询" |
| type filters 是否正常 | ✅ 全部 / AI 分析 / 专家 SQL filter chips 存在 |
| status filters 是否正常 | ✅ 全部 / 成功 / 失败·失效 filter chips 存在 |
| empty state 是否包含上传数据 / 开始分析入口 | ✅ 有"上传数据"和"开始分析"按钮 |

### Record Cards

| 检查项 | 结果 |
|--------|------|
| AI record badge 是否正常 | ✅ 紫色 badge "AI 分析" |
| SQL record badge 是否正常 | ✅ 蓝色 badge "专家 SQL" |
| status badge 是否正常 | ✅ 成功(绿) / 部分成功(琥珀) / 失败(红) |
| table metadata 是否正常 | ✅ 表名 + 行数 + 耗时 |
| time display 是否正常 | ✅ 相对时间 + hover 显示绝对时间 |
| runtime format 是否正常 | ✅ 人类可读格式 (1.2s, 1m 5s) |

### Actions

| 检查项 | 结果 |
|--------|------|
| AI primary action 是否是查看详情 | ✅ 紫色 primary button |
| SQL primary action 是否是加载到工作台 | ✅ 蓝色 primary button |
| AI secondary actions 是否仍存在 | ✅ 重新运行 / 导出 Markdown / 复制问题 (在 More 菜单) |
| SQL secondary actions 是否仍存在 | ✅ 重新执行 / 导出 CSV / 复制 SQL (在 More 菜单) |
| delete action 是否在 More 菜单 | ✅ danger 样式，与次操作用 separator 分隔 |

### Stale / Invalid Record UX

| 检查项 | 结果 |
|--------|------|
| stale record 是否显示数据表已失效 | ✅ amber badge + AlertTriangle 图标 |
| stale table name 是否显示删除线 | ✅ amber 色 + line-through |
| stale description 是否显示 | ✅ "原始数据表不存在，请重新上传数据或选择新的数据表。" |
| stale AI 重新运行是否被 guard | ✅ disabled + toast error |
| stale SQL 加载到工作台是否被 guard | ✅ disabled + toast error |
| stale SQL 重新执行是否被 guard | ✅ disabled + toast error |
| stale AI 查看详情是否仍可用 | ✅ 允许 |
| stale AI 复制问题是否仍可用 | ✅ 允许 |
| stale AI 导出 Markdown 是否仍可用 | ✅ 允许 |
| stale SQL 复制 SQL 是否仍可用 | ✅ 允许 |
| stale SQL 导出 CSV 是否仍可用 | ✅ 允许 |
| missing table field 是否显示未记录数据表 | ✅ italic 样式 |
| normal record primary action 是否不受影响 | ✅ 正常 |

### Disabled Experimental Features

| 检查项 | 结果 |
|--------|------|
| Templates 是否未恢复 | ✅ 未恢复 |
| Schedule 是否未恢复 | ✅ 未恢复 |
| Diff 是否未恢复 | ✅ 未恢复 |
| Timeline 是否未恢复 | ✅ 未恢复 |
| /performance 是否未恢复 | ✅ 未恢复 |
| /virtual-table 是否未恢复 | ✅ 未恢复 |
| Command Palette 是否未恢复 | ✅ 未恢复 |
| Global Search 是否未恢复 | ✅ 未恢复 |

## 4. Fixes

No production code fix required. This round only added regression coverage and report.

## 5. Remaining Risks

1. **SQL 导出 CSV 实际是元数据的问题尚未处理**
   - 当前 `handleExportCsv` 导出的是 SQL 查询元数据（sql, table, exported_at），不是查询结果
   - 用户可能期望导出的是查询结果数据
   - 建议后续单独处理，修改文案或实现真正的结果导出

2. **stale 判断依赖前端已有 table list**
   - `isRecordStale` 使用 `useDataStore.tables` 判断
   - 如果 tables 还没加载（为空），不会误判 stale
   - 如果用户在历史页面打开后删除了表，需要刷新页面才能看到 stale 状态

3. **更完整的 stale 判断可能需要后续统一 table metadata source**
   - 当前只检查 tableName 是否存在于 tables 列表
   - 不检查表结构是否变化（如同名但不同结构的表）

4. **History actions 已经更清楚，但 SQL export 语义需要后续单独处理**
   - "导出 CSV" 文案可能误导用户
   - 建议后续改为"导出查询"或实现真正的结果导出

## 6. What Was Not Changed

- ❌ 未改业务逻辑
- ❌ 未改 API
- ❌ 未改 Store 数据结构
- ❌ 未改后端
- ❌ 未改导出逻辑
- ❌ 未改 SQL execution
- ❌ 未改 AI query pipeline
- ❌ 未开始 M4-8.6
- ❌ 未开始 M5 Agent
- ❌ 未打 tag

## 7. Tests

### 新增测试文件

`frontend-react/src/app/(shell)/__tests__/history-regression.test.tsx`

### 测试覆盖

1. ✅ History header 存在 (zh/en)
2. ✅ type filters 存在 (All / AI Analysis / Expert SQL)
3. ✅ status filters 存在 (All / Success / Failed·Invalid)
4. ✅ empty state 有上传数据 / 开始分析入口
5. ✅ AI record badge 存在
6. ✅ SQL record badge 存在
7. ✅ AI primary action 是查看详情
8. ✅ SQL primary action 是加载到工作台
9. ✅ AI secondary actions 仍存在 (rerun-analysis / export-md / copy-question / more-actions)
10. ✅ SQL secondary actions 仍存在 (re-execute / export-csv / copy-sql)
11. ✅ stale record 显示数据表已失效 (stale-badge / stale-description)
12. ✅ stale AI 重新运行被 guard (stale-guard)
13. ✅ stale SQL 加载到工作台被 guard (stale-guard)
14. ✅ missing table field 显示未记录数据表 (table-not-recorded)
15. ✅ normal record primary action 不受影响
16. ✅ 不改 Store 行为
17. ✅ 不改 API 调用
18. ✅ 不改导出逻辑 (export-md / export-csv / export)
19. ✅ 不恢复 Templates / Schedule / Diff / Timeline
20. ✅ 不恢复 /performance、/virtual-table
21. ✅ 额外回归检查：delete / copied / copy-failed / table-not-found / status badges / metadata labels / fallback titles / search placeholder

### 测试结果

```
Test Files  36 passed (36)
Tests  781 passed (781)
```

## 8. Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ Pass |
| `npm run test` | ✅ 781 tests passed |
| `npm run build` | ✅ Compiled successfully |
| `npm run lint` | ✅ Pass (only warnings) |
| `python -c "from backend.main import app"` | ✅ backend import OK |

## 9. Online Manual Check List

- [ ] History 页第一眼是否像历史工作台
- [ ] AI / SQL / 状态筛选是否清楚
- [ ] 历史卡片是否清楚（type badge / status badge / table / time）
- [ ] AI / SQL 主操作是否清楚（查看详情 / 加载到工作台）
- [ ] stale record 是否不误导继续执行（badge + guard）
- [ ] 正常记录操作是否没回归
- [ ] 导出 / 复制 / 查看详情是否正常
- [ ] 已删除实验路由仍然不存在

## 10. Next Step

通过后再进入 M4-8.6 Data Page Polish。
暂不进入 M5 Agent。
暂不打 tag。
