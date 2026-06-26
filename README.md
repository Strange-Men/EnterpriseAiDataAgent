# EnterpriseAiDataAgent | AI 数据分析工作台

English version: [README.en.md](README.en.md)

面向 CSV / Excel 数据的 AI 数据分析工作台 Demo。支持数据上传、表格预览、SQL 工作台、自然语言分析、异常检测、报告生成，以及可配置的多 LLM Provider（Mock / DeepSeek / Doubao / Mimo）。Mock 默认可用，无真实 API Key 也能跑。

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![DuckDB](https://img.shields.io/badge/DuckDB-OLAP-FFC800?logo=duckdb)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-UI-06B6D4?logo=tailwindcss)
![Mock](https://img.shields.io/badge/Mock-Default-orange)
![Docker](https://img.shields.io/badge/Docker-Local%20Demo-2496ED?logo=docker)

---

## 1. 项目亮点

- CSV / Excel 上传与数据表管理
- DuckDB 本地 OLAP 分析引擎，零配置
- 自然语言生成 SQL 并执行
- 专家 SQL 工作台（Monaco Editor、自动补全、多标签页）
- 查询历史与报告详情页
- Mock / DeepSeek / Doubao / Mimo 多 LLM Provider
- Mock LLM 默认兜底，无真实 key 也能跑
- 真实 provider 不可用时自动 fallback 到 Mock
- Docker Compose 一键本地 Demo
- 前后端分离：FastAPI + Next.js

---

## 2. 当前版本

- M4 已封板
- tag: `v1.4.0-m4-uiux-llm-fallback`
- 当前阶段：M4.9 Engineering Completeness

---

## 3. 技术栈

| 层级 | 技术 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| SQL 编辑器 | Monaco Editor, sql-formatter |
| 状态管理 | React Query（服务端状态）, Zustand（客户端状态） |
| Backend | FastAPI, Pydantic, Uvicorn |
| 数据库 | DuckDB（嵌入式 OLAP） |
| 数据处理 | Pandas, NumPy, openpyxl |
| LLM Providers | Mock, DeepSeek, Doubao, Mimo（OpenAI-compatible） |
| 图表 | Recharts |
| 测试 | pytest（后端）, Vitest（前端） |
| 部署 | Docker Compose（本地 demo） |

---

## 4. 核心功能

### 数据管理

- CSV / Excel 文件上传（`.csv`、`.xlsx`）
- 自动类型推断，导入 DuckDB
- 表预览、重命名、删除、导出
- 内置 demo_sales 示例数据集

### SQL 工作台

- Monaco Editor，关键字 / 表名 / 列名自动补全
- 多标签页 SQL 编辑器
- 查询执行、EXPLAIN 计划、取消运行中的查询
- 查询历史（搜索、过滤、重跑）
- 保存 / 收藏常用查询
- 结果导出为 CSV / JSON / Excel

### AI 数据分析

- 自然语言转 SQL（NL→SQL 管线）
- 查询结果实时解释（SSE 流式输出）
- 结构化洞察生成（带置信度和严重程度）
- 图表类型建议
- 智能分析问题推荐（基于数据集特征）
- LLM Provider 选择器（前端可切换）

### 异常检测与报告

- 数据质量报告：缺失值、重复值、异常值、质量评分
- 统计异常检测：Z-score、IQR 方法
- LLM 解释异常的业务含义
- 多步分析：AI 生成计划 → 分步执行 → 结果汇总
- 生成 Markdown 格式分析报告

---

## 5. 快速启动：Docker Compose

Docker Compose 是本地 Demo 模式，默认使用 Mock LLM，不需要真实 API Key。

```bash
docker compose build
docker compose up
```

启动后访问：

- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status

停止：

```bash
docker compose down --remove-orphans
```

如需使用真实 LLM Provider，复制 `.env.docker.example` 为 `.env.docker`，填写对应 API Key，然后取消 `docker-compose.yml` 中 `env_file` 的注释。

---

## 6. 本地开发启动

### 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Python | 3.11+ | 后端运行 |
| Node.js | 20+ | 前端构建 |
| npm | 10+ | 前端依赖 |

### Backend

```bash
# 创建虚拟环境
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS

# 安装依赖
pip install -r requirements.txt

# 启动后端（默认端口 8000）
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend-react
npm install
npm run dev
```

### 访问地址

- Frontend: http://localhost:3000
- Backend Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status

---

## 7. 环境变量

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

## 8. LLM Provider 配置

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

## 9. Docker / 部署说明

当前 Docker Compose 是**本地 Demo**，不宣称生产级部署能力。

- `Dockerfile`：Backend（Python 3.11-slim + FastAPI + DuckDB）
- `Dockerfile.frontend`：Frontend（Node.js 20 Alpine + Next.js standalone）
- `docker-compose.yml`：编排 backend + frontend，默认 Mock LLM

后续部署文档将在 M4.9.4 补充。

---

## 10. 项目边界

- **不是**生产级 BI 系统
- **不连接**真实企业数据库
- **不内置**真实 API Key
- **不承诺**真实 LLM 永久在线
- 默认 Mock 可跑，真实 provider 需要用户自行配置后端 env
- 单用户本地优先，没有多租户
- 面向 CSV / Excel 结构化表格数据

---

## 11. 验证状态

最近一次 M4.9.2 验证结果：

| 维度 | 结果 |
|------|------|
| pytest | 559 passed, 31 skipped |
| backend import | OK |
| ruff | All checks passed |
| frontend tsc | passed |
| frontend test | 1171 passed (48 files) |
| frontend build | passed |
| frontend lint | 3 warnings (pre-existing) |
| Docker Compose build | passed |
| Docker Compose up | passed |
| no real key committed | confirmed |

---

## 12. 目录结构

```text
EnterpriseAiDataAgent/
├── backend/              # FastAPI backend, LLM providers, prompt contracts
├── frontend-react/       # Next.js 15 / React 19 / TypeScript frontend
├── database/             # DuckDB schema and seed scripts
├── docs/                 # Architecture, reports, governance docs
├── tests/                # Backend tests
├── Dockerfile            # Backend container
├── Dockerfile.frontend   # Frontend container
├── docker-compose.yml    # Local demo orchestration
├── .env.example          # Full env reference
├── .env.docker.example   # Docker env example
├── requirements.txt      # Python dependencies
└── README.md
```

---

## 13. 后续计划

- M4.9.3 README / README.en（本轮）
- M4.9.4 Deployment + Env Docs
- M4.9.5 Engineering Regression
- M4.9.6 Engineering Tag

---

## License

MIT License
