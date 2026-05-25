# PROJECT_RULES.md — Enterprise AI Data Agent Platform

---

## 一、项目最终目标

本项目不是普通 AI Demo，而是 **Enterprise AI Data Agent Platform**。

最终目标：打造 **AI Native Enterprise Data Workspace**，涵盖：

- 企业级数据分析
- SQL Workspace
- DuckDB 数据平台
- AI Agent
- RAG
- LangGraph
- Auto Analysis / Auto Report
- 企业级 Workspace

最终用途：AI 数据分析师、AI 工程化、企业 AI 平台、简历项目、求职。

---

## 二、Claude 必须遵守的开发规则

### 2.1 每个版本必须 commit

- 开发完成后立即 `git add .` + `git commit -m "version-name"`
- 禁止开发完成后不 commit

### 2.2 每个版本必须先测试

开发完成后，Claude 必须自动执行：

- build
- run
- lint
- type-check
- test API
- test frontend

禁止未测试直接结束开发。

### 2.3 Claude 必须主动 Debug

- 查看报错、分析日志、修复 bug、重试运行
- 直到系统可运行为止

### 2.4 Claude 必须输出测试报告

每次开发完成，必须输出：

- 功能完成列表
- 测试结果
- build 状态
- 性能结果
- 未解决问题
- 下一阶段建议

### 2.5 Claude 必须检查 Git 状态

开发结束前执行 `git status`，确认没有遗漏文件。

### 2.6 Claude 必须维护 README

每个大版本必须更新 README，包括：技术栈、架构图、新功能、性能优化、Workspace 功能。

### 2.7 Claude 必须遵循 frontend_rules

每次开发前必须读取 `docs/frontend_rules/` 中的：

- `agents-capability-guide.md`
- `agents-config-raw.md`
- `agents-structure-blueprint.md`

严格遵循：模块化、分层、可扩展、唯一源、Workspace 架构。

### 2.8 Claude 必须优先企业级方案

- 禁止 Demo 级实现、临时方案、mock 实现、糊代码
- 优先：企业级架构、可扩展性、性能、长期维护

### 2.9 Claude 必须主动做性能测试

对 Virtual Table、Query、大数据、API 主动测：FPS、DOM、runtime、memory、virtualization。

### 2.10 Claude 必须保持版本路线

当前版本路线：

| 版本 | 内容 | 状态 |
|------|------|------|
| v0.3.x | Enterprise Data Platform | Done |
| v0.5.x | AI Data Analyst MVP — AI System Engineering | Done |
| v0.6.x | Meta Governance & Autonomous QA | In Progress |
| v0.7.x | Anomaly Detection, Multi-turn UX | Next |

禁止跳版本乱开发。

### 2.11 语言治理规则 (v0.6.0+)

- 人类沟通（注释、文档、commit 描述）：**中文**
- 代码标识符、commit message、API 名称、架构术语：**英文**
- AI 输出：跟随当前 UI 语言
- 默认语言：`zh`（中文），通过 UI 切换到英文

---

## 三、当前项目阶段

- **已完成**: v0.3.x Enterprise Data Platform + v0.5.x AI Data Analyst MVP
- **当前版本**: v0.6.0
- **当前重点**: 语言治理、文档清理、后端单元测试、AI 可靠性、E2E 测试

---

## 四、后续开发原则

必须优先：Anomaly Detection、Multi-turn UX、E2E Tests、Performance、Product Engineering。

---

## 五、开发结束后流程

1. 输出完整开发报告
2. 输出测试报告
3. 输出 Git 状态
4. 确认 commit 成功
5. 确认版本号正确
