# M4-7.1.1 Online Validation

> 验证时间：2026-06-22
> 验证人：Claude Code
> 触发原因：M4-7.1.1 datetime CI hotfix 合并后，验证线上部署是否稳定

---

## 1. Validation Scope

本次验证范围：

- GitHub Actions CI 是否全绿（backend + frontend）
- Render 后端是否部署最新版本 (v1.0.4)
- AI 自然语言查询主链路是否正常
- 多步分析 skipped step 是否降级而非报错
- Vercel 前端是否可访问

**不包含**：代码修改、tag 打标、M4-7.2 或 M5 启动。

---

## 2. GitHub Actions

| Job      | Status    | Duration |
| -------- | --------- | -------- |
| backend  | ✅ pass   | 23s      |
| frontend | ✅ pass   | 1m33s    |

最新 run: `merge: fix frontend local time formatting` (27934500450)

结论：CI 全绿，datetime 修复已生效。

---

## 3. Render Backend

| Endpoint | 结果 |
| --- | --- |
| `/api/health` | `status: ok`, `db_connected: true` |
| `/api/status` | `api: ok`, `db: ok`, **version: 1.0.4** |
| `/api/ai/status` | `configured: true`, `connection: ok`, model: mimo-v2.5-pro |
| `/api/tables` | `demo_sales` — 50000 rows, 9 columns |

结论：Render 已自动部署到 v1.0.4，所有基础端点正常。

---

## 4. AI Chain

### 4.1 自然语言查询（`/api/ai/query`）

**请求**：`不同地区的销售额排名如何？` + `demo_sales`

| 检查项 | 结果 |
| --- | --- |
| SQL 生成 | ✅ 正确，仅查询 demo_sales |
| SQL 执行 | ✅ 成功返回 5 行 |
| 解释摘要 | ✅ 中文，包含排名和关键发现 |
| ThinkingBlock 泄漏 | ✅ 无 |
| Parser Error 暴露 | ✅ 无 |
| quality_gates | ✅ sql_or_cannot_answer + readonly_sql 均通过 |

### 4.2 多步分析（`/api/ai/analyze-multi`）

6 步分析计划，其中 5 步成功，1 步 skipped：

| Step | Purpose | Status |
| --- | --- | --- |
| 1 | 整体基准 | ✅ success |
| 2 | 销售额时间趋势 | ✅ success |
| 3 | 退货率时间趋势 | ✅ success |
| 4 | 产品维度分析 | ✅ success |
| 5 | 区域维度分析 | ✅ success |
| 6 | 折扣与退货关系 | ⚠️ skipped_no_data |

**Step 6 降级表现**：
- status 为 `skipped_no_data`（非红色 Parser Error）
- error 字段：`Model returned an empty SQL response.`
- summary 未暴露技术错误，仅总结了成功步骤的发现

结论：AI 主链路正常，skipped step 正确降级。error 字段的技术性描述可接受，建议后续优化为更友好的文案。

---

## 5. Vercel Frontend

当前环境 curl 访问 Vercel 超时（网络原因），无法自动化验证。

**需要用户在浏览器中手动验证**（见下方清单）。

---

## 6. 用户手动验证清单

请在浏览器中逐一确认：

- [ ] 1. 首页打开正常，分析工作台卡片无突兀白边
- [ ] 2. 数据页可以上传 / 预览表
- [ ] 3. 分析工作台默认是"自然语言查询"
- [ ] 4. 输入：`不同地区的销售额排名如何？`
- [ ] 5. AI 能生成 SQL、执行、输出摘要
- [ ] 6. step 失败不再显示 Parser Error；缺字段显示为跳过或友好说明
- [ ] 7. 点击"调查详情"不白屏；如果入口已隐藏，也说明正常
- [ ] 8. 专家 SQL 点击 `+` 新建 Query 不白屏
- [ ] 9. 专家 SQL 工具栏没有"分析工作台"这种重复命名
- [ ] 10. 历史页能看到 AI 分析记录和专家 SQL 记录
- [ ] 11. 刷新页面后 AI 历史仍在
- [ ] 12. 历史时间显示为用户本地 24 小时制（如 22:30），不是 14:30 或 10:30 AM
- [ ] 13. `/performance` 和 `/virtual-table` 是 404（预期行为）
- [ ] 14. 顶栏没有命令面板 / 搜索 / 快捷键入口

---

## 7. Known Expected Behavior

以下行为属于预期，非 bug：

- `/performance` 返回 404 — 该页面在 M4 scope pruning 中移除
- `/virtual-table` 返回 404 — 同上
- Scheduler worker 不自动启动 — Render free tier 限制
- 暂不打 tag — 等待用户浏览器验证通过后再决定
- Step 6 skipped_no_data — 数据缺少折扣-退货关联字段时的正常降级

---

## 8. Decision

**PARTIAL_PASS_NEEDS_USER_BROWSER_CHECK**

理由：
- CI 全绿 ✅
- Render 后端正常 ✅
- AI 主链路正常 ✅
- Vercel 前端无法从当前环境自动验证 ⚠️
- 用户浏览器验证清单待完成 ⚠️

---

## 9. Next Step

1. 等待用户完成浏览器验证清单（Step 6）
2. 如全部通过 → 确认 PASS，可进入 M4-7.2 State Boundary Cleanup
3. 暂不进入 M5 Agent
4. 暂不打 tag
