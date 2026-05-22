# Enterprise AI Data Agent

企业级 AI 数据分析智能体平台 — DuckDB 数据管理控制台。

## 项目简介

EnterpriseAiDataAgent 是一个面向企业场景的 AI 数据分析平台，集成以下核心能力：

- **SQL Workspace**：类 DataGrip 的 SQL 编辑器，支持语法高亮、快捷执行、结果表格
- **DuckDB 管理**：表列表、删除、重命名、导出 CSV
- **Query Runtime Monitor**：实时查询耗时监控、历史记录
- **数据质量分析**：自动检测缺失值、异常值、重复行，生成质量评分
- **数据可视化**：React 前端 + FastAPI 后端 + 可调整面板布局
- **多 Agent 协作**（规划中）：基于 LangGraph 的多智能体编排
- **RAG 检索增强**（规划中）：结合 ChromaDB 的知识库增强生成

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 15, React 19, TypeScript, TailwindCSS v3 |
| 后端 API | FastAPI, Uvicorn |
| 数据库 | DuckDB |
| 数据处理 | Pandas, NumPy |
| 状态管理 | Zustand (3 stores) |
| 表格组件 | TanStack Table |
| 布局 | react-resizable-panels |
| 国际化 | react-i18next (en/zh) |

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
| GET | `/api/status` | 系统状态 (API/DB/版本/运行时间) |
| POST | `/api/upload` | 上传 CSV/Excel 文件 |
| POST | `/api/query` | 执行 SQL 查询 |
| GET | `/api/query/history` | 查询历史记录 |
| GET | `/api/tables` | 列出所有数据库表 |
| GET | `/api/tables/{name}?limit=N` | 获取表数据预览 |
| GET | `/api/tables/{name}/schema` | 获取表结构 |
| DELETE | `/api/tables/{name}` | 删除表 |
| PUT | `/api/table/{name}/rename` | 重命名表 |
| GET | `/api/table/{name}/export` | 导出表为 CSV |
| GET | `/api/quality/{name}` | 获取数据质量报告 |

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (3000)                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Left     │  │   Center     │  │   Right          │   │
│  │  Panel    │  │   Panel      │  │   Panel          │   │
│  │           │  │              │  │                  │   │
│  │ Tables    │  │ SQL Editor   │  │ Data Preview     │   │
│  │ Upload    │  │ Execute Btn  │  │ Schema View      │   │
│  │ Status    │  │ Results Tab  │  │ Quality Report   │   │
│  │           │  │ Runtime Mon. │  │ Query History    │   │
│  └──────────┘  └──────────────┘  └──────────────────┘   │
│                     │ /api/* proxy                       │
└─────────────────────┼───────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────┐
│              FastAPI Backend (8000)                       │
│  ┌─────────┐ ┌──────┐ ┌────────┐ ┌───────┐ ┌────────┐  │
│  │ /upload │ │/query│ │/tables │ │/table │ │/quality│  │
│  └────┬────┘ └──┬───┘ └───┬────┘ └───┬───┘ └───┬────┘  │
│       │         │         │          │          │        │
│  ┌────▼─────────▼─────────▼──────────▼──────────▼────┐  │
│  │            Data Service Layer                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │ Query    │ │ Query    │ │ Data Quality     │   │  │
│  │  │ Executor │ │ History  │ │ Analyzer         │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
│                      │                                    │
│  ┌───────────────────▼────────────────────────────────┐  │
│  │           DuckDB (data/enterprise.duckdb)           │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 项目结构

```
EnterpriseAiDataAgent/
├── backend/                    # FastAPI 后端 API
│   ├── main.py                 # FastAPI 应用入口 (v0.3.4)
│   ├── routes/                 # API 路由
│   │   ├── upload.py           # 文件上传
│   │   ├── tables.py           # 表 CRUD
│   │   ├── query.py            # SQL 执行 + 历史
│   │   ├── quality.py          # 数据质量
│   │   └── table_manage.py     # 表重命名 + 导出
│   ├── models/                 # Pydantic 响应模型
│   └── services/               # 业务逻辑层
│       ├── data_service.py     # 数据服务 (DuckDB 封装)
│       └── query_history.py    # 查询历史 (内存存储)
├── frontend-react/             # React 前端 (Next.js 15)
│   ├── src/app/                # 页面与布局
│   │   ├── page.tsx            # 主工作区 (3-panel)
│   │   └── layout.tsx          # 根布局
│   ├── src/panels/             # 工作区面板
│   │   ├── sql-workspace-panel.tsx    # SQL 编辑器 + 执行
│   │   ├── table-management-panel.tsx # 表管理 (CRUD)
│   │   ├── file-upload-panel.tsx      # 文件上传
│   │   ├── data-preview-panel.tsx     # 数据预览
│   │   ├── sql-history-panel.tsx      # 查询历史
│   │   ├── status-panel.tsx           # 系统状态
│   │   └── chat-panel.tsx             # AI 助手 (待集成)
│   ├── src/components/         # 通用 UI 组件
│   │   └── ui/                 # data-table, tooltip, tab-group, status-badge
│   ├── src/stores/             # Zustand 状态管理
│   │   ├── data-store.ts       # 全局数据状态
│   │   ├── workspace-store.ts  # 布局/语言状态
│   │   ├── sql-workspace-store.ts     # SQL 编辑器状态
│   │   └── sql-history-store.ts       # 查询历史状态
│   ├── src/services/           # API 服务层
│   ├── src/i18n/               # 国际化 (en/zh)
│   ├── src/types/              # TypeScript 类型定义
│   ├── src/hooks/              # React hooks
│   └── src/styles/             # CSS (dark theme)
├── database/                   # 数据库核心模块
│   ├── db_manager.py           # DuckDB 连接管理 (singleton)
│   ├── file_loader.py          # CSV/Excel 文件加载
│   ├── schema_detector.py      # 模式检测与类型映射
│   ├── data_quality.py         # 数据质量分析引擎
│   └── query_executor.py       # SQL 查询执行
├── testExcel/                  # 测试数据集
├── requirements.txt            # Python 依赖
└── README.md
```

## 许可证

待定
