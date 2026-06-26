# EnterpriseAiDataAgent

English version: [README.en.md](README.en.md)

面向 CSV / Excel 数据的 AI 数据分析工作台 Demo：通过 DuckDB、本地表格预览、自然语言分析、专家 SQL、历史报告和多 LLM Provider + Mock fallback，帮助用户在无真实 API Key 的情况下快速验证 AI 数据分析流程。

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![DuckDB](https://img.shields.io/badge/DuckDB-OLAP-FFC800?logo=duckdb)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Local%20Demo-2496ED?logo=docker)

---

## 核心价值

- **零配置可运行**：默认 Mock LLM，本地 Docker Compose 可直接启动。
- **多模型可切换**：支持 Mock / DeepSeek / Doubao / Mimo，真实模型不可用时自动 fallback。
- **分析链路完整**：数据上传 → 表格预览 → 自然语言分析 / 专家 SQL → 历史记录 → 报告详情。

---

## 目录

- [项目背景](#项目背景)
- [项目目标](#项目目标)
- [解决方案](#解决方案)
- [当前验证结果](#当前验证结果)
- [核心能力](#核心能力)
- [快速体验](#快速体验)
- [技术栈](#技术栈)
- [LLM Provider](#llm-provider)
- [环境变量](#环境变量)
- [文档](#文档)
- [FAQ](#faq)
- [项目边界](#项目边界)
- [贡献](#贡献)
- [Roadmap](#roadmap)

---

## 项目背景

很多非技术用户拿到 CSV / Excel 数据后，常见痛点是：

- 想分析数据但不会写 SQL。
- 想用 AI 辅助分析，但真实 LLM Key 配置和调用成本较高。
- 想在本地快速验证 AI 分析链路，但传统表格工具缺少自然语言分析能力。
- 想保留历史分析结果和可追溯报告，而不是只得到一次性聊天回复。

---

## 项目目标

EnterpriseAiDataAgent 的目标是提供一个可本地运行的 AI 数据分析工作台 Demo：

- 让用户上传 CSV / Excel 后，用自然语言提出分析问题。
- 用 DuckDB 承载本地结构化数据查询。
- 提供专家 SQL 工作台给进阶用户使用。
- 支持多 LLM Provider，同时保留 Mock LLM 兜底。
- 在无 API Key、无外部模型可用时，也能完整演示核心流程。

---

## 解决方案

| 用户痛点 | 项目行动 |
|---|---|
| 不会写 SQL | 提供自然语言分析入口，并保留专家 SQL 工作台 |
| LLM 配置成本高 | 支持 Mock / DeepSeek / Doubao / Mimo，多 provider 可切换 |
| 没有 API Key 也想体验 | 默认 Mock LLM，可零配置启动 |
| 分析结果难以追溯 | 提供 History 和 Analysis Detail 报告页 |
| 本地启动复杂 | 提供 Docker Compose 本地 Demo |

---

## 当前验证结果

最近一次 M4.9.5 工程完整性回归结果：

- Docker Compose 本地 Demo 已验证：backend + frontend 可同时启动。
- Backend `/docs` 和 `/api/ai/status` 返回 200。
- Frontend localhost 返回 200。
- Mock LLM 默认可用，无需真实 API Key。
- Backend tests: 559 passed, 31 skipped。
- Frontend tests: 1171 passed。
- master CI passed。
- 未提交 `.env`，未发现真实 API Key。

---

## 核心能力

### 1. 上传数据

CSV / Excel 上传，自动生成 DuckDB 可查询数据表。支持 `.csv` 和 `.xlsx` 格式，自动推断列类型。

### 2. 预览与选择数据表

查看字段、行数、预览数据，区分普通上传表和系统历史表。支持重命名、删除和导出操作。

### 3. 自然语言分析

输入问题，选择 LLM Provider，系统自动转 SQL 并执行，生成分析结果。支持 SSE 流式输出。

### 4. 专家 SQL

面向进阶用户的 SQL 查询工作台，提供 Monaco Editor、关键字/表名/列名自动补全、多标签页编辑器。

### 5. 历史记录

保留历史问题、SQL、导出、重新运行入口。支持搜索和过滤。

### 6. 报告详情

以 Summary / Findings / Result / SQL Appendix 的形式查看分析报告。

### 7. 数据质量报告

查看缺失值、重复值、异常值统计和质量评分。

---

## 快速体验

```bash
# 1. 启动 Docker Compose
docker compose build
docker compose up

# 2. 打开浏览器
#    Frontend: http://localhost:3000
#    Backend Docs: http://localhost:8000/docs

# 3. 上传一个 CSV 或 Excel 文件（仓库自带 testExcel/ 目录下有示例数据）

# 4. 在 Data 页面选择数据表并查看预览

# 5. 进入 Analyze 页面，选择 Mock LLM

# 6. 输入一个自然语言问题，例如："请总结这份数据的主要字段和可分析方向。"

# 7. 查看分析结果，并在 History 中回溯记录

# 8. 停止
docker compose down --remove-orphans
```

---

## 技术栈

- **前端**：Next.js 15 / React 19 / TypeScript / Tailwind CSS / Monaco Editor / Recharts
- **后端**：FastAPI / Pydantic / Uvicorn
- **数据分析**：DuckDB / Pandas / openpyxl
- **LLM Runtime**：Mock / DeepSeek / Doubao / Mimo provider adapter
- **状态管理**：React Query（服务端）/ Zustand（客户端）
- **测试**：pytest（后端）/ Vitest（前端）
- **工程化**：Docker / Docker Compose / GitHub Actions

---

## LLM Provider

支持以下 LLM Provider：

| Provider | 说明 |
|----------|------|
| `mock` | 默认，本地 Mock，无需 API Key |
| `deepseek` | DeepSeek OpenAI-compatible API |
| `doubao` | 豆包 / 火山方舟 OpenAI-compatible API |
| `mimo` | Mimo OpenAI-compatible API |

切换方式：

- 前端 Analyze 面板顶部的 Provider 选择器
- 后端环境变量 `LLM_DEFAULT_PROVIDER`

详细配置说明见：[docs/LLM_PROVIDER_CONFIG.md](docs/LLM_PROVIDER_CONFIG.md)

---

## 环境变量

项目提供多个 env 示例文件：

| 文件 | 用途 |
|------|------|
| `.env.example` | 本地开发完整配置参考 |
| `backend/.env.example` | 后端 LLM 运行时配置 |
| `frontend-react/.env.example` | 前端公开变量（不含密钥） |
| `.env.docker.example` | Docker Compose 环境变量示例 |

关键说明：

- API Key 只配置在后端环境变量中
- 前端不配置任何真实 Key
- Mock 是默认安全模式，无需任何 Key 即可运行
- 真实 provider 不可用时自动 fallback 到 Mock

---

## 文档

- [LLM Provider 配置](docs/LLM_PROVIDER_CONFIG.md)
- [环境变量说明](docs/ENVIRONMENT.md)
- [部署说明](docs/DEPLOYMENT.md)
- [Docker Compose 本地 Demo](docs/DOCKER_DEMO.md)

---

## FAQ

### 没有真实 LLM API Key 能运行吗？

可以。默认使用 Mock LLM，不需要任何 API Key。

### DeepSeek / Doubao / Mimo 配置后仍然 fallback 到 Mock 怎么办？

检查后端环境变量是否配置正确，包括 API Key、Base URL、Model 名称和 provider allowlist。查看后端日志中的 fallback 原因。

### Docker 启动失败怎么办？

检查 Docker Desktop 是否启动，3000 / 8000 端口是否被占用，然后查看 `docker compose logs backend` 和 `docker compose logs frontend`。

### 前端无法连接后端怎么办？

检查 `NEXT_PUBLIC_API_BASE_URL` 是否指向后端地址。Docker Compose 模式下默认已配置，本地开发模式下需要确认 `.env` 中的地址正确。

### 这是生产级 BI 系统吗？

不是。本项目是 AI 数据分析工作台 Demo，不包含生产级权限、多租户、企业数据库接入和生产级数据持久化。

---

## 项目边界

- 非生产级 BI 系统。
- 不包含企业级权限、多租户和审计系统。
- 不内置真实 LLM API Key。
- 默认面向 CSV / Excel 文件分析。
- Docker Compose 主要用于本地 Demo。

---

## 贡献

欢迎提交 Issue 或 PR。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## Roadmap

| Stage | Focus | Status |
|---|---|---|
| M4 | UI/UX polish + LLM fallback | Done |
| M4.9 | Docker / README / deployment docs | Done |
| M5 | Agent workflow enhancement | Planned |
| Future | More file formats, stronger data profiling, richer report export | Planned |

---

## License

MIT License
