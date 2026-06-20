# EnterpriseAiDataAgent｜AI 数据分析工作台

这是一个面向 CSV / Excel 数据文件的 AI 数据分析工作台。用户可以上传数据集，使用内置的 SQL 工作台进行查询分析，也可以通过自然语言让 AI 生成 SQL、解释查询结果、检测数据异常、生成分析报告。这是一个个人作品集项目（MVP），用于展示 AI 应用工程能力，不是企业级生产系统，也不试图替代 Tableau 或 Power BI。

## 在线演示

- 前端 Demo：https://enterprise-ai-data-agent.vercel.app/
- 后端 API：https://enterpriseaidataagent.onrender.com

> 说明：Render 免费实例可能会休眠，首次访问后端时可能需要等待几十秒唤醒。

## 1. 项目简介

### 解决什么问题

数据分析工具（如 Tableau、Power BI）以可视化为主，学习成本高，适合固定看板场景。当数据分析师拿到一份 CSV 或 Excel 文件，想快速提问题、找异常、做多角度分析时，传统工具的门槛较高。

本项目提供另一种思路：**用自然语言提问，AI 自动生成 SQL 并执行，再对结果进行解读**。适合以下场景：

- 拿到一份 CSV/Excel 数据，想快速了解数据概况
- 想用自然语言提问，而不是手写 SQL
- 需要 AI 帮忙做多步骤分析（如"为什么 Q4 销量下降？"）
- 需要自动检测数据中的异常值
- 需要将分析结果整理成报告

### 与普通数据看板的区别

| 维度 | 传统 BI 看板 | 本项目 |
|------|------------|--------|
| 交互方式 | 拖拽式可视化 | 自然语言 + SQL |
| 分析方式 | 手动构建图表 | AI 规划多步分析 |
| 异常检测 | 需要手动配置规则 | 统计方法 + LLM 解释 |
| 分析输出 | 图表仪表盘 | 查询结果 + 洞察报告 |

### 项目边界

- **单用户**：本地运行，没有用户管理或多租户
- **本地优先**：数据存在本地 DuckDB 文件中
- **CSV/Excel 导入**：面向结构化表格数据
- **作品集项目**：用于演示 AI 应用工程能力，非商业产品

## 2. 核心功能

### 数据接入与管理

- CSV / Excel 文件上传（支持 `.csv`、`.xlsx`）
- 自动类型推断，导入 DuckDB
- 表预览、重命名、删除、导出
- 内置 5 万行 demo_sales 示例数据集

### SQL 工作台

- Monaco Editor，支持关键字、表名、列名自动补全
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

### 异常检测与质量分析

- 数据质量报告：缺失值、重复值、异常值、质量评分
- 统计异常检测：Z-score、IQR 方法
- LLM 解释异常的业务含义
- 数据采样分析（大表自动采样）

### 多步分析与报告

- AI 生成分析计划（3-5 个步骤）
- 分步执行 SQL 查询
- Token budget 控制 LLM 成本
- Guardrails 防止分析失控（最大步数、超时、失败限制）
- 生成 Markdown 格式分析报告

### 实验性能力（待进一步验证）

- 定时分析任务：任务持久化已实现，后台自动执行仍需验证
- 分析模板保存与复用
- 分析对比（两次分析结果的 diff）

## 3. 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 15, React 19, TypeScript, TailwindCSS |
| SQL 编辑器 | Monaco Editor, sql-formatter |
| 状态管理 | React Query（服务端状态）, Zustand（客户端状态） |
| 后端 | FastAPI, Pydantic, Uvicorn |
| 数据库 | DuckDB（嵌入式 OLAP） |
| 数据处理 | Pandas, NumPy, openpyxl |
| AI | Anthropic Claude API, SSE Streaming |
| 图表 | Recharts |
| 测试 | Pytest（后端）, Vitest（前端） |
| 部署 | Docker, docker-compose |

## 4. 系统架构

```
用户上传 CSV / Excel
  → FastAPI 后端接收文件
  → Pandas / openpyxl 解析
  → DuckDB 入库

SQL Workspace 查询
  → Monaco Editor 编辑 SQL
  → QueryExecutor 执行
  → 结果展示 / 导出

AI 分析管线
  → 读取表结构和样本数据
  → 构造 schema-aware prompt
  → 调用 Claude API 生成 SQL / 解释 / 洞察
  → 只读执行器运行 SQL
  → 前端流式展示结果
```

**前端**：Next.js 15 App Router，负责交互、SQL 编辑器、结果展示、状态管理（React Query + Zustand）

**后端**：FastAPI，负责文件上传、SQL 执行、数据质量分析、AI 管线（prompt contracts、token budget、guardrails、trace）

**数据库**：DuckDB，嵌入式列式数据库，适合本地 CSV/Excel 的 OLAP 分析查询

**AI 层**：11 个 prompt 模块，每个包含 CONTRACT（名称、token 上限）、SYSTEM_PROMPT、build_user_message()，统一注册在 registry 中

## 5. AI 分析流程

### NL→SQL 管线

1. 读取目标表的 schema（列名、类型）和样本数据
2. 构造 schema-aware prompt，包含表结构和用户问题
3. 调用 Anthropic Claude API 生成 SQL
4. 提取 SQL 并进行格式校验
5. 使用只读 SQL 执行器运行（阻止非 SELECT 语句）
6. 返回查询结果
7. 对结果进行解释、洞察生成或报告生成

### 安全控制

- **SQL 验证**：`sql_validator.py` 阻止 DROP / DELETE / UPDATE / INSERT 等 DDL/DML 语句
- **只读执行器**：AI 生成的 SQL 通过 `get_readonly_executor()` 执行，只能执行 SELECT
- **Guardrails**：最大 6 步分析、最多 8 次 SQL 查询、连续失败 2 次停止、总超时 120 秒、单步超时 30 秒
- **Token Budget**：每种操作有独立的 token 上限（如 SQL 生成 512 tokens，解释 1024 tokens），多步分析有 workflow 级别的总预算
- **Trace**：记录每次 LLM 调用的输入输出 token、延迟、状态，便于调试

## 6. 项目亮点

1. **完整链路**：不是简单的聊天框，而是"数据上传 → SQL 查询 → AI 分析 → 异常检测 → 报告生成"的完整分析链路
2. **DuckDB 选型**：嵌入式列式数据库，零配置，适合本地 CSV/Excel 的 OLAP 分析，50K 行数据查询瞬间完成
3. **Prompt Contract 架构**：11 个 prompt 模块使用统一的 CONTRACT + SYSTEM_PROMPT + build_user_message() 模式，便于管理、测试和扩展
4. **SSE 流式响应**：AI 解释和洞察通过 Server-Sent Events 实时流式输出，提升用户体验
5. **Guardrails 系统**：防止多步分析失控——最大步数、超时、连续失败限制、递归深度控制
6. **Token Budget 成本控制**：每种 AI 操作有独立 token 预算，workflow 级别累计追踪，避免单次分析消耗过多成本
7. **LLM Trace**：记录每次 LLM 调用的完整上下文（prompt 名称、输入输出 token、延迟、状态），便于调试和优化

## 7. 本地运行

### 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Python | 3.11+ | 后端运行 |
| Node.js | 20+ | 前端构建 |
| npm | 10+ | 前端依赖 |

### 后端启动

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

### 前端启动

```bash
cd frontend-react
npm install
npm run dev
```

### 访问地址

- 前端：`http://localhost:3000`
- 后端健康检查：`http://localhost:8000/api/health`
- API 文档（FastAPI 自动生成）：`http://localhost:8000/docs`

### 环境变量

复制 `.env.example` 为 `.env`，按需配置：

```bash
# Anthropic API Key（AI 功能必需）
ANTHROPIC_API_KEY=your-api-key-here

# DuckDB 数据库文件路径
DUCKDB_PATH=data/enterprise.duckdb

# 是否自动加载 demo 数据（首次启动）
SEED_DEMO_DATA=true
```

**说明**：没有配置 API Key 时，SQL 工作台、数据上传、数据质量分析等核心功能仍然可用，AI 相关功能会显示"AI 未配置"。

## 8. Demo 演示路径

### 路径 A：有 API Key 的完整演示（约 15 分钟）

1. 启动后端（自动加载 demo_sales 示例数据，50K 行）
2. 启动前端，进入 SQL Workspace
3. 执行 `SELECT * FROM demo_sales LIMIT 10`，查看结果表格
4. 在 AI 输入框输入"各地区的销售总额排名？"，AI 生成 SQL 并执行
5. 点击"解释"查看 AI 对查询结果的流式解读
6. 进入"分析"页面，提问"分析销售趋势并找出异常"
7. 查看多步分析过程：计划生成 → 分步执行 → 结果汇总
8. 查看异常检测结果和 LLM 对异常的业务解读
9. 生成 Markdown 分析报告

### 路径 B：无 API Key 的基础演示（约 10 分钟）

1. 上传一个 CSV 或 Excel 文件
2. 在数据管理页面预览表数据
3. 在 SQL Workspace 执行查询
4. 查看数据质量报告（缺失值、异常值、质量评分）
5. 将查询结果导出为 CSV / JSON / Excel

## 9. 测试与验证

本项目有较完整的测试覆盖。当前审计记录显示：

- **后端**：420 个 pytest 测试通过（31 个跳过）
- **前端**：113 个 Vitest 测试通过（10 个测试文件）
- **TypeScript**：`tsc --noEmit` 类型检查通过
- **构建**：`next build` 生产构建通过

运行测试命令：

```bash
# 后端测试
python -m pytest tests/ -x -q

# 前端类型检查
cd frontend-react
npx.cmd tsc --noEmit

# 前端单元测试
npx.cmd vitest run

# 前端生产构建
npx.cmd next build
```

## 10. 当前边界与后续计划

### 当前边界（诚实说明）

- 单用户本地优先，不是多用户 / 多租户系统
- 没有完整的 RBAC 权限系统（有可选的 API Key 认证）
- Docker 构建此前报告通过，但本次审计未重新验证
- 定时分析（scheduled analysis）任务持久化已实现，但后台自动执行仍需验证，标记为实验性能力
- i18n 已覆盖核心 UI，但命令面板快捷键描述仍有少量英文硬编码
- 没有 CI/CD 流水线（可后续添加 GitHub Actions）

### 后续计划

- 补充 README 截图（SQL Workspace、AI 分析、异常检测等关键界面）
- 验证 Docker build 完整流程
- 验证 scheduler worker 后台执行
- 完善中文 UI 文案（命令面板等）
- 增加 GitHub Actions CI（pytest + next build）
- 优化 SQL Workspace 大组件拆分（当前 643 行）

## 11. 适合简历的项目描述

> EnterpriseAiDataAgent 是一个面向 CSV/Excel 文件的 AI 数据分析工作台，基于 Next.js 15 + FastAPI + DuckDB 构建，支持数据上传、SQL 查询、数据质量检测、自然语言转 SQL、异常检测与分析报告生成。项目重点展示了 AI 应用中的 prompt contract、token budget、guardrails、SSE 流式响应和 LLM 调用 trace 等工程能力。
