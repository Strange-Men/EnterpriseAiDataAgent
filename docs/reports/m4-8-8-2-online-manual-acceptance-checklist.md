# M4-8.8.2 Online Manual Acceptance Checklist

## 1. Goal

在 Vercel 线上环境中人工确认 M4 UI/UX 重设计后的核心页面、主链路、空态、错误态、i18n、移动端和禁用实验功能状态稳定。

## 2. Acceptance Environment

- Production / Preview URL: _______________
- Browser: _______________
- Screen size: _______________
- Tester: _______________
- Date: _______________
- Backend API environment: _______________
- Real API enabled: _______________
- Test dataset: _______________

## 3. Before Testing

检查：

- [ ] Vercel deployment is latest master (commit `c9eb554`)
- [ ] GitHub master CI passed (frontend ✅ / backend ✅)
- [ ] Backend service is reachable
- [ ] No `.env` or secrets exposed
- [ ] Browser cache cleared or hard refresh done

## 4. Home Page Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| 首页只保留一组主入口 | 上传数据 + 开始分析，不再重复出现下方三块 | ⬜ Pass / ⬜ Fail | |
| 上传数据入口可点击 | 跳转 Data 页面 | ⬜ Pass / ⬜ Fail | |
| 开始分析入口可点击 | 跳转 Analyze 页面 | ⬜ Pass / ⬜ Fail | |
| 禁用实验入口未出现 | Templates / Scheduler / Charts 等不显示 | ⬜ Pass / ⬜ Fail | |

## 5. Data Page Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| 上传区文案清楚 | 支持 CSV / Excel，不误导拖拽上传 | ⬜ Pass / ⬜ Fail | |
| 上传真实 CSV 成功 | 表出现在表列表 | ⬜ Pass / ⬜ Fail | |
| 当前数据表卡片正常 | 显示表名、行数、列数、开始分析入口 | ⬜ Pass / ⬜ Fail | |
| query_history 说明清楚 | 显示历史记录表 badge 和风险说明 | ⬜ Pass / ⬜ Fail | |
| query_history 不易误删 | 删除风险提示足够明显 | ⬜ Pass / ⬜ Fail | |
| 普通表删除不回归 | 普通表仍可按原逻辑删除 | ⬜ Pass / ⬜ Fail | |
| 预览区域正常 | 样例行、行列摘要、数据质量正常 | ⬜ Pass / ⬜ Fail | |
| 空态友好 | 无表 / 无预览时有清楚引导 | ⬜ Pass / ⬜ Fail | |

## 6. Analyze Page Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| 初始状态不显示旧结果 | 未点击生成分析前不显示历史摘要 | ⬜ Pass / ⬜ Fail | |
| 切换表后旧结果清空 | 不残留旧表分析结果 | ⬜ Pass / ⬜ Fail | |
| 自然语言分析可用 | 输入问题后能生成本次结果 | ⬜ Pass / ⬜ Fail | |
| 专家 SQL tab 可用 | 能查看 / 编辑 / 执行 SQL | ⬜ Pass / ⬜ Fail | |
| 分析完成后可查看详情 | 查看详情按钮正常 | ⬜ Pass / ⬜ Fail | |
| Toast 文案正常 | 中英文环境下都正常 | ⬜ Pass / ⬜ Fail | |

## 7. History Page Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| 历史记录显示正常 | AI / SQL 记录可识别 | ⬜ Pass / ⬜ Fail | |
| 筛选功能正常 | 类型 / 状态筛选正常 | ⬜ Pass / ⬜ Fail | |
| 查看详情正常 | 能进入详情页 | ⬜ Pass / ⬜ Fail | |
| stale table 提示正常 | 原表不存在时有说明 | ⬜ Pass / ⬜ Fail | |
| 导出文案不误导 | SQL 记录显示"导出记录 CSV" | ⬜ Pass / ⬜ Fail | |

## 8. Analysis Detail Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| 报告结构正常 | Summary / Findings / Result / Appendix 清楚 | ⬜ Pass / ⬜ Fail | |
| SQL / Trace 默认折叠 | 不抢主视觉 | ⬜ Pass / ⬜ Fail | |
| 失败 / 空记录友好 | 不白屏 | ⬜ Pass / ⬜ Fail | |
| Markdown 导出可用 | 导出不报错 | ⬜ Pass / ⬜ Fail | |

## 9. Settings + i18n Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| Settings 分组清楚 | 界面偏好 / 系统信息正常 | ⬜ Pass / ⬜ Fail | |
| 语言切换正常 | 中文 / English 正常切换 | ⬜ Pass / ⬜ Fail | |
| 主题切换正常 | Light / Dark 正常 | ⬜ Pass / ⬜ Fail | |
| status-panel 文案正常 | 无硬编码英文污染中文模式 | ⬜ Pass / ⬜ Fail | |
| workflow-banner 文案正常 | 中英文显示正确 | ⬜ Pass / ⬜ Fail | |
| analysis Toast 文案正常 | 中英文显示正确 | ⬜ Pass / ⬜ Fail | |

## 10. Disabled Experimental Features Checklist

确认这些不存在或不可导航：

| Feature | Expected | Result | Notes |
|---------|----------|--------|-------|
| /performance | 404 或不可见 | ⬜ Pass / ⬜ Fail | |
| /virtual-table | 404 或不可见 | ⬜ Pass / ⬜ Fail | |
| Templates | 不显示 | ⬜ Pass / ⬜ Fail | |
| Scheduler | 不显示 | ⬜ Pass / ⬜ Fail | |
| Charts | 不显示 | ⬜ Pass / ⬜ Fail | |
| Anomalies | 不显示 | ⬜ Pass / ⬜ Fail | |
| Diff | 不显示 | ⬜ Pass / ⬜ Fail | |
| Timeline | 不显示 | ⬜ Pass / ⬜ Fail | |
| Command Palette | 不显示 | ⬜ Pass / ⬜ Fail | |
| Global Search | 不显示 | ⬜ Pass / ⬜ Fail | |
| Keyboard Shortcuts | 不显示 | ⬜ Pass / ⬜ Fail | |

## 11. Mobile / Responsive Checklist

| Item | Expected | Result | Notes |
|------|----------|--------|-------|
| Sidebar / navigation usable | 不遮挡主内容 | ⬜ Pass / ⬜ Fail | |
| Data 页面不炸版 | 表卡片和上传区可用 | ⬜ Pass / ⬜ Fail | |
| Analyze 页面可输入 | 输入框和按钮可用 | ⬜ Pass / ⬜ Fail | |
| History 卡片可读 | 不横向溢出严重 | ⬜ Pass / ⬜ Fail | |
| Settings 可读可点 | 设置项不挤压 | ⬜ Pass / ⬜ Fail | |

## 12. Known Risks

- `export-markdown.ts` still contains hardcoded Chinese copy and Chinese keyword matching. It remains intentionally out of scope.
- Real API behavior depends on online environment variables and backend availability.
- Mobile acceptance requires real device or browser responsive mode.
- Final tag should not be created until this checklist is manually completed and M4-8.8.3 release candidate report is done.

## 13. Acceptance Decision

| Decision | Meaning |
|----------|---------|
| Accept | 全部关键项通过，可以进入 M4-8.8.3 |
| Accept with minor notes | 有非阻塞小问题，可以记录到 RC 报告 |
| Block | 有阻塞问题，需要开 hotfix 后重新验收 |

## 14. Next Step

用户完成线上人工验收后：

- 如果全部通过：进入 M4-8.8.3 Final UI/UX Release Candidate Report
- 如果有阻塞问题：开 M4-8.8.2.x online acceptance hotfix
- 暂不进入 M5 Agent
- 暂不打 tag
