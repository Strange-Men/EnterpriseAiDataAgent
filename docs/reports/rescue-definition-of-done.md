# Rescue Definition of Done — EnterpriseAiDataAgent

> 项目救援完成标准 · 2026-06-20

---

## 1. Rescue Goal

本项目救援目标不是做成企业级系统，而是救成一个：

- 能本地启动
- 能真实跑通核心功能
- 能解释架构
- 能保留清晰边界
- 能继续迭代
- 不靠虚假包装撑起来的 AI 数据分析工作台

---

## 2. Must-Have Completion Criteria

必须全部满足：

### 安全

- [x] `.env` 未进入 git 历史
- [x] `.env.example` 不含真实 key
- [x] 不在 README / docs / logs 中泄露真实 key

### 基线

- [x] backend import PASS
- [x] pytest PASS
- [x] frontend type-check PASS
- [x] vitest PASS
- [x] next build PASS

### 非 AI 主链路

- [x] 后端可启动
- [x] 前端可启动
- [x] demo_sales 可加载（50,000 行）
- [x] SQL 查询可执行（4-8ms）
- [x] 聚合查询可执行（5 个地区）
- [x] 结果表格可展示
- [x] 查询历史可记录（50 条）
- [x] EXPLAIN 可用
- [x] CSV/JSON/Excel 导出可用
- [x] 数据质量报告可用（99.3/100）
- [x] 上传 CSV/Excel 可用

### AI 链路

二选一：

- [ ] 有有效 API Key：NL→SQL / explain / insights / report / SSE 至少基础验收通过
- [x] 无有效 API Key：AI 降级路径正常，系统不崩溃，并在报告中标注 AI 功能待凭证恢复后复验

**当前状态**: AI Key 无效（401），走降级路径验收。

### 文档

- [x] README 中文主文档与真实能力一致
- [x] 审计报告存在（`docs/reports/security-audit.md`）
- [x] baseline validation 报告存在（`docs/reports/baseline-validation.md`）
- [x] demo validation 报告存在（`docs/reports/demo-validation.md`）
- [x] rescue definition of done 存在（本文件）

---

## 3. Explicit Non-Goals

当前阶段不做：

- 不做企业级多租户
- 不做 RBAC
- 不做完整生产部署
- 不做 LangGraph / RAG / 多 Agent 重构
- 不重构 ai_analyst.py
- 不拆 SQL Workspace 大组件
- 不补完整 CI/CD
- 不继续扩大功能范围
- 不做简历包装

---

## 4. Remaining Known Limitations

| 项目 | 状态 | 影响 |
|------|------|------|
| Docker build | 未在本机验证 | 不影响本地开发 |
| AI Key | 401 Invalid | AI 路径不可用 |
| scheduler worker | 仍需单独验证 | 定时任务未验证 |
| i18n | 少量英文硬编码 | 不影响核心功能 |
| 单用户 | 本地优先 | 不适合多用户并发 |
| DuckDB | 单文件 | 不适合多用户并发写入 |

---

## 5. Go / No-Go

### 当前判断: **PARTIAL GO**

| 条件 | 判断 |
|------|------|
| AI Key 仍不可用 | **PARTIAL GO** |
| AI Key 可用且 AI 验收通过 | GO |
| 非 AI 主链路出现阻塞 | NO-GO |

**理由**:

- 非 AI 主链路 100% 通过
- AI 降级路径正常，系统不崩溃
- 唯一阻塞是凭证问题，非代码问题
- 可以继续迭代，不需要修代码

---

## 6. Next Engineering Step

只允许给工程步骤，不要写简历包装：

### 优先级

1. **提交 M1/M2 文档**（当前待提交）
2. **如果有有效 API Key，跑 AI 全链路复验**
   - NL→SQL：`按地区统计销售额最高的前 5 个地区`
   - AI explain
   - AI insights
   - Markdown report generation
   - SSE streaming
3. **若 AI 复验通过，打 tag**: `v1.0.3-rescue-complete`
4. **若 AI Key 暂不可用，打 tag**: `v1.0.3-non-ai-demo-stable`
5. **后续单独开 M3 修复**: scheduler / Docker / i18n / CI

---

## Appendix: Verification Commands

```bash
# 基线验证
cd frontend-react && npx next build
cd frontend-react && npx tsc --noEmit
python -c "from backend.main import app"

# 非 AI 主链路验证
curl http://localhost:8000/api/health
curl http://localhost:8000/api/tables
curl http://localhost:8000/api/tables/demo_sales/data
curl -X POST http://localhost:8000/api/query -H "Content-Type: application/json" -d '{"sql":"SELECT COUNT(*) FROM demo_sales"}'
curl -X POST http://localhost:8000/api/query -H "Content-Type: application/json" -d '{"sql":"SELECT customer_region, SUM(sales_amount) as total_sales FROM demo_sales GROUP BY customer_region ORDER BY total_sales DESC"}'
curl http://localhost:8000/api/quality/demo_sales
curl http://localhost:8000/api/query/history

# AI 链路验证（需要有效 Key）
curl http://localhost:8000/api/ai/status
curl -X POST http://localhost:8000/api/ai/query -H "Content-Type: application/json" -d '{"question":"按地区统计销售额最高的前5个地区","table_name":"demo_sales"}'
```
