# M3 Engineering Hardening Plan — EnterpriseAiDataAgent

> Created: 2026-06-20
> Branch: `m3-engineering-hardening`
> Baseline: `v1.0.3-non-ai-demo-stable`

---

## 1. Current Stable Baseline

| 项目 | 状态 |
|------|------|
| **Tag** | `v1.0.3-non-ai-demo-stable` |
| **非 AI 主链路** | ✅ PASS — 后端启动、前端启动、SQL 查询、数据质量、导出、上传全链路通过 |
| **AI 链路** | ❌ BLOCKED — API Key 401 Invalid，走降级路径验收 |
| **基线验证** | ✅ backend import / pytest / frontend tsc / vitest / next build 全部通过 |
| **Demo 数据** | ✅ demo_sales 50,000 行，5 个地区，真实聚合结果 |
| **项目边界** | 单用户本地 AI 数据分析工作台，不做企业级多租户、RBAC、LangGraph |

---

## 2. M3 Goal

M3 是工程补强阶段，目标是：

1. **验证未验功能** — scheduler worker 是否真实可用
2. **补基础 CI** — GitHub Actions 跑 backend pytest + frontend type-check/build
3. **清理小范围体验问题** — i18n 硬编码
4. **保持可回滚** — 每个任务单独 commit，可随时回退
5. **保持项目定位克制** — 不扩张功能，不改架构，不包装简历

---

## 3. M3 Non-Goals

明确不做：

- ❌ 简历包装、截图、营销文案
- ❌ 新功能扩张（不加 LangGraph / RAG / 多 Agent）
- ❌ 大重构（不拆 ai_analyst.py，不重构 SQL Workspace 大组件）
- ❌ 企业级多租户、RBAC、复杂部署体系
- ❌ 为了好看虚构功能
- ❌ 把 API key 写入任何文件

---

## 4. Task Priority

| Priority | Task | Type | Why | Files likely involved | Acceptance Criteria | Tool |
| -------- | ---- | ---- | --- | --------------------- | ------------------- | ---- |
| **M3-1** | Scheduler Worker Verification | 验证 | rescue-next-actions P1-4；rescue-definition-of-done 标记"仍需单独验证" | `backend/runtime/scheduler_worker.py`, `backend/services/scheduler.py` | 如果真实可用：记录验证命令和结果；如果不可用：标记 experimental，不大修 | Claude |
| **M3-2** | Docker Validation | 验证 | demo-validation 标记"未安装，未验证" | `docker-compose.yml`, `Dockerfile` | 如果本机无 Docker：记录 `external validation required`；如果 Docker 可用：build 通过或记录失败原因 | Claude |
| **M3-3** | Basic CI | 新增 | rescue-next-actions P3-2；shows engineering maturity | `.github/workflows/ci.yml` (new) | backend import + pytest + frontend type-check + build 通过；先不跑 AI live tests | Claude |
| **M3-4** | i18n Hardcoded Text Cleanup | 修复 | KNOWN_ISSUES ISSUE-017；rescue-next-actions P2-1 | `frontend-react/src/i18n/zh.ts`, `frontend-react/src/i18n/en.ts`, command palette component | 不影响主链路；type-check / build 通过 | Claude |
| **M3-5** | AI Full Chain Revalidation | 验证 | demo-validation 标记 AI 路径 401；需要有效 API Key 后复验 | 全链路 | NL→SQL PASS, explain PASS, insights PASS, report PASS, SSE PASS | Claude (需要用户提供有效 key) |

---

## 5. Recommended Execution Order

每个任务都能单独 commit：

### Step 1: M3-1 Scheduler Worker Verification

**目标**: 确认 scheduled analysis 是否真实执行

**验证步骤**:
1. 阅读 `backend/runtime/scheduler_worker.py` 理解执行路径
2. 阅读 `backend/services/scheduler.py` 理解任务持久化
3. 创建 scheduled task via API: `POST /api/ai/schedule`
4. 检查 task 状态: `GET /api/ai/schedule/{task_id}`
5. 检查执行结果: `GET /api/ai/schedule/{task_id}/results`

**验收标准**:
- 如果真实可用：记录验证命令和结果，commit 验证报告
- 如果不可用：在 README 中标记 "experimental"，commit 标记

---

### Step 2: M3-2 Docker Validation Report

**目标**: 验证 docker-compose config/build

**验证步骤**:
1. 检查本机是否有 Docker: `docker --version`
2. 如果有：运行 `docker-compose config` + `docker-compose build`
3. 如果没有：记录为 `external validation required`

**验收标准**:
- 如果 Docker 可用：build 通过或记录失败原因
- 如果 Docker 不可用：在报告中标注，commit 验证报告

---

### Step 3: M3-3 Basic CI

**目标**: 新增 GitHub Actions 基础 CI

**实现步骤**:
1. 创建 `.github/workflows/ci.yml`
2. 配置 backend job: Python 3.11, pip install, import check, pytest
3. 配置 frontend job: Node 20, npm install, type-check, build
4. 触发条件: push to main/m3 branches, PR

**验收标准**:
- CI 配置文件存在
- 本地验证 import / pytest / tsc / build 通过
- 先不跑 AI live tests（需要 API Key）

---

### Step 4: M3-4 i18n Hardcoded Text Cleanup

**目标**: 清理小范围英文硬编码

**实现步骤**:
1. 找到 command palette 组件
2. 提取硬编码英文字符串
3. 添加 i18n keys 到 `zh.ts` 和 `en.ts`
4. 替换为 `t('key')` 调用

**验收标准**:
- 切换语言后 command palette 标签跟随切换
- type-check / build 通过
- 不影响主链路

---

### Step 5: M3-5 AI Full Chain Revalidation

**目标**: 拿到有效 API Key 后复验 AI

**前提**: 用户提供有效 API Key（更新 `.env` 中的 `ANTHROPIC_API_KEY`）

**验证步骤**:
1. NL→SQL: `按地区统计销售额最高的前5个地区`
2. AI explain: 对查询结果生成解释
3. AI insights: 生成结构化洞察
4. Markdown report: 生成分析报告
5. SSE streaming: 验证流式输出

**验收标准**:
- 5 个端点全部 PASS
- 记录验证结果，commit 验证报告
- 全部通过后可考虑打 tag

---

## 6. Commit / Push Rule

- 每完成一个 M3 小任务，单独 commit
- commit 后可以 push 当前分支
- 不要直接 tag
- 全部 M3 通过后再考虑合并/打 tag

**Commit 命名规范**:
- M3-1: `docs: verify scheduler worker status`
- M3-2: `docs: docker validation report`
- M3-3: `ci: add basic GitHub Actions workflow`
- M3-4: `fix(i18n): clean up hardcoded English in command palette`
- M3-5: `docs: AI full chain revalidation report`

---

## 7. Risk Assessment

| Task | Risk | Mitigation |
|------|------|------------|
| M3-1 Scheduler | Medium — 如果 broken，修复复杂 | 只验证，不大修；broken 就标记 experimental |
| M3-2 Docker | Low — 本机可能无 Docker | 记录为 external validation |
| M3-3 CI | Low — 配置文件新增 | 可随时删除 |
| M3-4 i18n | Low — 隔离 UI 改动 | type-check 验证 |
| M3-5 AI | Medium — 依赖有效 API Key | 等用户提供 key 再做 |

---

## 8. M3 Completion Criteria

M3 完成条件：

- [ ] M3-1: Scheduler worker 状态已确认（working 或 experimental）
- [ ] M3-2: Docker validation 报告已生成
- [ ] M3-3: GitHub Actions CI 配置已提交
- [ ] M3-4: i18n 硬编码已清理
- [ ] M3-5: AI 全链路已复验（需要有效 key）

全部完成后：
- 考虑合并到 master
- 考虑打 tag: `v1.0.4-m3-hardening`

---

---

## 9. Status Update (2026-06-20)

| Task | Status | Notes |
|------|--------|-------|
| M3-1 Scheduler Verification | ✅ DONE | Task management layer fully functional, execution layer BLOCKED_BY_CREDENTIAL |
| M3-2 Docker Validation | ✅ DONE | Static audit passed (no P0/P1), DOCKER_NOT_AVAILABLE on local machine |
| M3-3 Basic CI | ✅ DONE | Remote CI passes (backend + frontend), fixed pytest dependency |
| M3-4 i18n Cleanup | ✅ DONE | ~40 keys localized, remote CI passes |
| M3-5 AI Full Chain | ❌ BLOCKED | Requires valid API Key (401 Invalid) |

**M3 Status**: `COMPLETE_WITH_EXTERNAL_BLOCKERS`

See `docs/reports/m3-close-out.md` for full close-out report.

---

*End of M3 Engineering Hardening Plan*
