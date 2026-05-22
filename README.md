# Enterprise AI Data Agent

企业级 AI 数据分析智能体平台 — 基于 LangGraph + RAG + 多 Agent 协作架构。

## 项目简介

EnterpriseAiDataAgent 是一个面向企业场景的 AI 数据分析平台，集成以下核心能力：

- **多 Agent 协作**：基于 LangGraph 的多智能体编排
- **RAG 检索增强**：结合 ChromaDB 的知识库增强生成
- **数据可视化**：Streamlit 前端 + Plotly/Matplotlib 图表
- **报表自动化**：自动生成数据分析报表
- **灵活数据库**：支持 DuckDB / 多数据源接入

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Streamlit |
| Agent 框架 | LangGraph, LangChain |
| LLM | OpenAI, Anthropic Claude |
| 向量数据库 | ChromaDB |
| 关系数据库 | DuckDB |
| 数据处理 | Pandas |
| 可视化 | Plotly, Matplotlib |
| 配置管理 | python-dotenv |

## 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd EnterpriseAiDataAgent

# 2. 创建虚拟环境
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Keys

# 5. 启动应用
streamlit run frontend/app.py
```

## 项目结构

```
EnterpriseAiDataAgent/
├── frontend/          # Streamlit 前端界面
├── agents/            # AI Agent 定义与编排
├── rag/               # RAG 检索增强模块
├── database/          # 数据库连接与操作
├── reports/           # 报表生成模块
├── workflows/         # 工作流定义
├── prompts/           # Prompt 模板管理
├── utils/             # 工具函数
├── config/            # 配置管理
├── docs/              # 项目文档
├── docker/            # Docker 部署配置
├── requirements.txt   # Python 依赖
├── .env.example       # 环境变量模板
└── README.md          # 项目说明
```

## 许可证

待定
