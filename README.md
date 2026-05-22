# Enterprise AI Data Agent

企业级 AI 数据分析智能体平台 — 基于 LangGraph + RAG + 多 Agent 协作架构。

## 项目简介

EnterpriseAiDataAgent 是一个面向企业场景的 AI 数据分析平台，集成以下核心能力：

- **多 Agent 协作**：基于 LangGraph 的多智能体编排
- **RAG 检索增强**：结合 ChromaDB 的知识库增强生成
- **数据可视化**：React 前端 + FastAPI 后端
- **数据质量分析**：自动检测缺失值、异常值、重复行，生成质量评分
- **灵活数据库**：DuckDB 高性能列式存储

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 15, React 19, TypeScript, TailwindCSS |
| 后端 API | FastAPI, Uvicorn |
| Agent 框架 | LangGraph, LangChain |
| LLM | OpenAI, Anthropic Claude |
| 向量数据库 | ChromaDB |
| 关系数据库 | DuckDB |
| 数据处理 | Pandas, NumPy |
| 状态管理 | Zustand |
| 表格组件 | TanStack Table |
| 国际化 | react-i18next |

## 快速开始

### 后端 (FastAPI)

```bash
# 1. 创建虚拟环境
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# 2. 安装依赖
pip install fastapi uvicorn python-multipart duckdb pandas openpyxl

# 3. 启动后端 API
uvicorn backend.main:app --reload --port 8000
```

### 前端 (React)

```bash
# 1. 进入前端目录
cd frontend-react

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

前端默认运行在 `http://localhost:3000`，通过 Next.js rewrite 代理 `/api/*` 请求到后端 `http://localhost:8000`。

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/status` | 系统状态 |
| POST | `/api/upload` | 上传 CSV/Excel 文件 |
| GET | `/api/tables` | 列出所有数据库表 |
| GET | `/api/tables/{name}?limit=N` | 获取表数据预览 |
| GET | `/api/tables/{name}/schema` | 获取表结构 |
| DELETE | `/api/tables/{name}` | 删除表 |
| GET | `/api/quality/{name}` | 获取数据质量报告 |

## 项目结构

```
EnterpriseAiDataAgent/
├── backend/               # FastAPI 后端 API
│   ├── main.py            # FastAPI 应用入口
│   ├── routes/            # API 路由 (upload, tables, quality)
│   ├── models/            # Pydantic 响应模型
│   └── services/          # 业务逻辑层
├── frontend-react/        # React 前端 (Next.js 15)
│   ├── src/app/           # 页面与布局
│   ├── src/panels/        # 工作区面板组件
│   ├── src/components/    # 通用 UI 组件
│   ├── src/stores/        # Zustand 状态管理
│   ├── src/services/      # API 服务层
│   ├── src/i18n/          # 国际化 (en/zh)
│   └── src/types/         # TypeScript 类型定义
├── database/              # 数据库核心模块
│   ├── db_manager.py      # DuckDB 连接管理
│   ├── file_loader.py     # CSV/Excel 文件加载
│   ├── schema_detector.py # 模式检测与类型映射
│   ├── data_quality.py    # 数据质量分析引擎
│   └── query_executor.py  # SQL 查询执行
├── agents/                # AI Agent 定义与编排
├── rag/                   # RAG 检索增强模块
├── frontend/              # 旧版 Streamlit 前端 (已废弃)
├── testExcel/             # 测试数据集
├── requirements.txt       # Python 依赖
└── README.md
```

## 许可证

待定
