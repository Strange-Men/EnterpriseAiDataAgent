# Enterprise AI Data Agent

企业级 AI 数据分析智能体平台 — DuckDB 数据管理控制台。

## 项目简介

EnterpriseAiDataAgent 是一个面向企业场景的 AI 数据分析平台，集成以下核心能力：

- **Enterprise Query Experience**：企业级 SQL 查询体验（v0.3.7）
- **SQL Auto Complete**：基于 Monaco Editor 的 SQL 自动补全，支持关键字、表名、列名、DuckDB 函数
- **Query Tabs**：多标签页查询系统，支持新建、删除、重命名、切换
- **Saved Queries**：保存、收藏、管理常用 SQL 查询
- **Query Explain**：DuckDB EXPLAIN 可视化，展示执行计划
- **Query Cancel**：AbortController 支持的查询取消
- **Export System**：CSV / JSON / Excel 三种格式导出查询结果
- **SQL Formatting**：sql-formatter 格式化 SQL
- **Keyboard Shortcuts**：Ctrl+Enter 执行、Ctrl+S 保存、Ctrl+L 清空、Ctrl+/ 注释
- **Query Statistics**：行数、耗时、列数等查询统计信息
- **Query History**：增强历史记录，支持搜索、筛选、删除、重新运行
- **Data Quality**：自动检测缺失值、异常值、重复行，生成质量评分
- **DuckDB Management**：表列表、删除、重命名、导出
- **Workspace**：3-panel 可调整布局、暗色/亮色主题、中英文切换

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 15, React 19, TypeScript, TailwindCSS v3 |
| SQL 编辑器 | Monaco Editor (sql-formatter) |
| 后端 API | FastAPI, Uvicorn |
| 数据库 | DuckDB |
| 数据处理 | Pandas, NumPy |
| 状态管理 | Zustand (6 stores, persist) |
| 表格组件 | TanStack Table + Virtual |
| 导出 | csv, json, xlsx (openpyxl) |
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

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Enter | 执行 SQL 查询 |
| Ctrl+S | 保存当前查询 |
| Ctrl+L | 清空当前查询 |
| Ctrl+/ | SQL 注释切换 |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/status` | 系统状态 |
| POST | `/api/upload` | 上传 CSV/Excel 文件 |
| POST | `/api/query` | 执行 SQL 查询 |
| POST | `/api/query/explain` | EXPLAIN 查询计划 |
| POST | `/api/query/cancel` | 取消运行中的查询 |
| POST | `/api/query/export` | 导出查询结果 (CSV/JSON/Excel) |
| GET | `/api/query/schema` | 获取所有表的 schema (用于自动补全) |
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
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (3000)                       │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Left     │  │   Center Panel   │  │   Right Panel    │   │
│  │  Panel    │  │                  │  │                  │   │
│  │           │  │ Query Tabs       │  │ Data Preview     │   │
│  │ Tables    │  │ Monaco Editor    │  │ Schema View      │   │
│  │ Upload    │  │ + Autocomplete   │  │ Quality Report   │   │
│  │ Status    │  │ Explain Plan     │  │ Query History    │   │
│  │           │  │ Export (CSV/     │  │  + Search        │   │
│  │           │  │  JSON/Excel)     │  │  + Filter        │   │
│  │           │  │ Statistics       │  │  + Re-run        │   │
│  │           │  │ Saved Queries    │  │                  │   │
│  └──────────┘  └──────────────────┘  └──────────────────┘   │
│                       │ /api/* proxy                        │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│              FastAPI Backend (8000)                          │
│  ┌──────────┐ ┌───────┐ ┌────────┐ ┌───────┐ ┌────────┐   │
│  │ /upload  │ │/query │ │/tables │ │/table │ │/quality│   │
│  │ /explain │ │       │ │        │ │       │ │        │   │
│  │ /cancel  │ │       │ │        │ │       │ │        │   │
│  │ /export  │ │       │ │        │ │       │ │        │   │
│  │ /schema  │ │       │ │        │ │       │ │        │   │
│  └────┬─────┘ └───┬───┘ └───┬────┘ └───┬───┘ └───┬────┘   │
│       │           │         │          │         │          │
│  ┌────▼───────────▼─────────▼──────────▼─────────▼──────┐  │
│  │              Data Service Layer                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐      │  │
│  │  │ Query    │ │ Query    │ │ Data Quality     │      │  │
│  │  │ Executor │ │ History  │ │ Analyzer         │      │  │
│  │  │ +Explain │ │          │ │                  │      │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                    │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │           DuckDB (data/enterprise.duckdb)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 项目结构

```
EnterpriseAiDataAgent/
├── backend/                    # FastAPI 后端 API
│   ├── main.py                 # FastAPI 应用入口 (v0.3.7)
│   ├── routes/                 # API 路由
│   │   ├── upload.py           # 文件上传
│   │   ├── tables.py           # 表 CRUD
│   │   ├── query.py            # SQL 执行 + 历史 + Explain + Export + Cancel
│   │   ├── quality.py          # 数据质量
│   │   └── table_manage.py     # 表重命名 + 导出
│   ├── models/                 # Pydantic 响应模型
│   └── services/               # 业务逻辑层
│       ├── data_service.py     # 数据服务 (DuckDB 封装)
│       └── query_history.py    # 查询历史 (内存存储)
├── frontend-react/             # React 前端 (Next.js 15)
│   ├── src/app/                # 页面与布局
│   ├── src/panels/             # 工作区面板
│   │   ├── sql-workspace-panel.tsx    # SQL 编辑器 + Tab + Explain + Export
│   │   ├── sql-history-panel.tsx      # 查询历史 + 搜索/筛选/删除
│   │   ├── table-management-panel.tsx # 表管理
│   │   ├── file-upload-panel.tsx      # 文件上传
│   │   ├── data-preview-panel.tsx     # 数据预览
│   │   └── status-panel.tsx           # 系统状态
│   ├── src/components/         # 通用 UI 组件
│   │   ├── monaco-sql-editor.tsx      # Monaco Editor + SQL 自动补全
│   │   ├── query-explain.tsx          # Query Plan 可视化
│   │   ├── export-dropdown.tsx        # 导出下拉菜单
│   │   └── ui/                 # data-table, tooltip, tab-group
│   ├── src/stores/             # Zustand 状态管理
│   │   ├── data-store.ts       # 全局数据状态
│   │   ├── workspace-store.ts  # 布局/语言状态
│   │   ├── sql-workspace-store.ts     # SQL 编辑器状态
│   │   ├── sql-history-store.ts       # 查询历史 (搜索/筛选)
│   │   ├── query-tabs-store.ts        # 多标签页系统
│   │   └── saved-queries-store.ts     # 保存的查询
│   ├── src/services/           # API 服务层
│   ├── src/i18n/               # 国际化 (en/zh)
│   └── src/hooks/              # React hooks
├── database/                   # 数据库核心模块
│   ├── db_manager.py           # DuckDB 连接管理 (singleton)
│   ├── file_loader.py          # CSV/Excel 文件加载
│   ├── schema_detector.py      # 模式检测与类型映射
│   ├── data_quality.py         # 数据质量分析引擎
│   └── query_executor.py       # SQL 查询执行 + EXPLAIN
├── testExcel/                  # 测试数据集
├── requirements.txt            # Python 依赖
├── PROJECT_RULES.md            # 企业级开发规范
└── README.md
```

## 版本路线

| 版本 | 内容 | 状态 |
|------|------|------|
| v0.3.1 | React Workspace Foundation | Done |
| v0.3.2 | Workspace Refactor | Done |
| v0.3.3 | React Workspace + Feature Migration | Done |
| v0.3.4 | DuckDB Management Layer | Done |
| v0.3.5 | Data Quality | Done |
| v0.3.6 | Workspace Polish | Done |
| v0.3.7 | Enterprise Query Experience | Done |
| v0.4.x | AI Analysis Layer | Planned |
| v0.5.x | Multi-Agent + LangGraph | Planned |

## 许可证

待定
