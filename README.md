# Enterprise AI Data Agent｜Business Analyst Agent for Data-Driven Operations

English version: [README.en.md](README.en.md)

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![DuckDB](https://img.shields.io/badge/DuckDB-OLAP-FFC800?logo=duckdb)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![LangChain](https://img.shields.io/badge/LangChain-Single%20Agent-3178C6?logo=langchain)
![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent%20Orchestration-1F6FEB)
![Docker](https://img.shields.io/badge/Docker-Local%20Demo-2496ED?logo=docker)

## 目录

- [项目简介](#项目简介)
- [背景与问题](#背景与问题)
- [核心能力](#核心能力)
- [技术架构](#技术架构)
- [核心工作流](#核心工作流)
- [量化结果](#量化结果)
- [快速上手](#快速上手)
- [API 示例](#api-示例)
- [项目边界](#项目边界)
- [常见问题](#常见问题)
- [术语表](#术语表)
- [Contributing](#contributing)
- [License](#license)

## 项目简介

Enterprise AI Data Agent 是一个面向业务人员的数据分析与经营诊断 Agent。系统支持 Excel / CSV 数据上传、DuckDB 本地分析、自然语言业务分析、业务语义层、经营健康度诊断、风险与增长机会识别、高级 SQL 工作区、Markdown / HTML 报告导出，以及 Mock / Doubao Provider 透明 fallback。LangChain Single Agent 与 LangGraph Multi-Agent 共同构成编排层，负责问题理解、证据规划、工具执行、报告组织、结果校验和连续追问。

它不是只把自然语言翻译成 SQL 的工具。它围绕“上传数据 -> 理解字段 -> 识别业务问题 -> 规划证据 -> 调用业务工具 -> 生成业务报告 -> 支持追问 -> 导出复盘材料”构建完整的数据分析闭环。业务用户可以直接问经营健康度、地区排名、渠道质量、退款风险、增长机会和缺字段问题；高级用户可以进入 SQL 工作区手写或生成只读查询。

## 背景与问题

- **业务人员不写 SQL**：Excel / CSV 数据已经在手里，但传统 BI 和数据库工具的上手成本高。
- **字段名不等于业务含义**：`refund_amount`、`shipping_days`、`satisfaction_score` 这类字段需要业务语义、指标口径和风险阈值共同解释。
- **单条 SQL 不等于经营分析**：经营诊断需要收入、利润、退款、发货、投诉、满意度、渠道和地区表现的多证据判断。
- **AI 结果必须可追溯**：结论需要来自工具证据，SQL、trace、tool calls、provider、run id 和 memory 默认折叠。
- **手动复盘需要稳定报告**：业务报告需要可以保存为 Markdown / HTML，便于复盘、转发和审查。

## 核心能力

| 能力 | 解决的问题 | 实现方式 |
| --- | --- | --- |
| Excel / CSV 上传与 DuckDB 本地分析 | 把本地表格快速变成可查询数据表 | 异步上传任务、CSV / XLSX 解析、DuckDB 建表、默认 `demo_sales_business_50k` 演示表 |
| 自然语言业务分析 | 非技术人员直接提业务问题 | `/api/agent/runs` 接收问题、表名、provider 和上下文 |
| Business Semantic Layer | 稳定解释字段、术语、指标和阈值 | 字段字典、业务术语映射、指标公式、固定阈值、分位数阈值、缺字段兜底 |
| Business Tools | 用确定性工具计算证据 | KPI、维度对比、趋势、风险、机会、数据质量、建议生成工具 |
| LangChain Single Agent + LangGraph Multi-Agent Orchestration | 统一问题理解、证据规划、工具执行和报告校验 | Single Agent 路径保留已有兼容能力，LangGraph 节点负责多步骤业务编排 |
| Question Router Node | 路由问题类型 | 识别 ranking_summary、business_diagnosis、risk_opportunity、action_plan、unsupported_metric、follow_up |
| Evidence Planner Node | 规划证据收集 | 根据问题类型选择指标、维度和工具调用顺序 |
| Tool Execution Node | 执行业务工具 | 复用现有 Business Tools，不让 LLM 直接猜结论 |
| Report Composer Node | 组织业务报告 | 生成经营诊断、风险机会、行动建议、缺字段解释和表格结果 |
| Validator Node | 校验输出质量 | 检查答非所问、字段幻觉、语言混杂、技术细节泄露和 fallback 透明度 |
| Follow-up Memory Node | 支持连续追问 | 只保存摘要上下文，不默认展示 memory 原文 |
| BusinessReportViewModel | 统一 UI 和导出表达 | 清洗 raw evidence，生成中英文标签、Top 3 建议、data_table 和导出内容 |
| 经营健康度诊断 | 让老板视角快速看清业务状态 | 综合收入、利润、退款、投诉、满意度、物流效率、渠道质量和地区表现 |
| 风险与增长机会识别 | 找出高收入高风险、促销依赖、低利润高销量和潜力对象 | 固定阈值 + 动态分位数 + 多维证据 |
| data_table 排序 / 统计类输出 | 排名、汇总、Top N 问题不被硬塞进诊断模板 | `data_table` 用于地区销售额排名、品类退款率、渠道利润汇总等问题 |
| 中英文业务报告 | 根据界面语言输出一致报告 | zh-CN / en-US 控制报告、fallback 文案、导出标签和 next questions |
| Markdown / HTML 导出 | 保存和分享业务分析结果 | 固定模板，排除 SQL、trace、tool calls、raw JSON 和系统日志式证据 |
| Mock / Doubao Provider 透明 fallback | 用户知道结果来自真实模型、Mock 还是 fallback | `provider_status`、`is_simulated`、可读 fallback reason 和前端提示 |
| 高级 SQL 工作区 | 高级用户直接查询数据 | Monaco SQL 编辑器、多 Query、AI 生成 SQL、只读 guard、结果表格独立滚动 |
| 反幻觉字段校验 | 缺字段时不编造 ROI、会员等级、小区、广告创意 | validate_fields 与 unsupported_metric 报告路径 |
| 连续追问上下文 | “基于刚才继续看品类”可接续分析 | Follow-up Memory Node 读取上一轮关注对象和证据摘要 |

## 技术架构

```text
Frontend Workbench
  ↓
FastAPI Backend
  ↓
LangChain Single Agent + LangGraph Multi-Agent Orchestration
  ├─ Question Router Node
  ├─ Evidence Planner Node
  ├─ Tool Execution Node
  ├─ Report Composer Node
  ├─ Validator Node
  └─ Follow-up Memory Node
  ↓
Business Semantic Layer + Business Tools
  ↓
DuckDB / Excel / CSV
  ↓
BusinessReportViewModel
  ↓
UI / Markdown Export / HTML Export
```

- **Frontend Workbench**：Next.js 15 + React 19，提供单页业务数据分析工作台、高级 SQL 工作区、业务报告展示、历史记录、Markdown / HTML 导出和 provider 状态提示。
- **FastAPI Backend**：提供上传、表管理、只读查询、Agent Run、session、任务状态和业务分析接口。
- **LangChain Single Agent + LangGraph Multi-Agent Orchestration**：共同承担 Agent 编排层。LangChain Single Agent 保留现有工具调用兼容路径；LangGraph Multi-Agent Orchestration 通过节点化流程组织业务问题路由、证据规划、工具执行、报告生成、结果校验和连续追问。
- **Question Router Node** 负责路由问题，区分排序统计、经营诊断、风险机会、行动方案、缺字段问题和追问。
- **Evidence Planner Node** 负责规划证据收集，选择指标、维度和业务工具调用顺序。
- **Tool Execution Node** 负责调用业务工具，复用 Business Tools 和只读 DuckDB 能力。
- **Report Composer Node** 负责生成业务报告，组织 `data_table`、经营诊断、风险机会、行动方案和缺字段解释。
- **Validator Node** 负责校验报告质量，检查答非所问、字段幻觉、语言混杂、技术细节泄露和 provider fallback 透明度。
- **Follow-up Memory Node** 负责连续追问上下文，复用上一轮摘要而不污染新问题。
- **Business Semantic Layer + Business Tools**：统一字段语义、指标公式、风险阈值、工具证据和缺字段兜底。
- **DuckDB / Excel / CSV**：以本地 DuckDB 作为分析执行引擎，支持上传文件和默认演示数据集。
- **BusinessReportViewModel**：统一 UI、Markdown 和 HTML 的业务表达，清洗技术字段和系统日志式证据。

## 核心工作流

1. **打开工作台**：默认加载 `demo_sales_business_50k`，用户可直接提问或上传自己的 Excel / CSV。
2. **选择数据表**：系统区分 app default table 和 user active table，上传成功后自动切换到用户表。
3. **提出业务问题**：用户用中文或英文询问经营健康度、地区排名、风险机会、行动建议或缺字段分析。
4. **路由问题类型**：Question Router Node 识别问题意图，避免把排序统计问题强行套入经营诊断模板。
5. **规划证据路径**：Evidence Planner Node 选择指标、维度、工具和输出形态。
6. **执行工具和查询**：Tool Execution Node 调用 Business Tools、DuckDB 只读 SQL 和语义层 helper。
7. **生成报告或表格**：Report Composer Node 输出经营诊断、`data_table`、风险机会、行动方案或缺字段解释。
8. **校验输出质量**：Validator Node 检查字段幻觉、技术细节泄露、语言一致性和 provider 透明度。
9. **展示和导出**：BusinessReportViewModel 生成业务用户可读的 UI、Markdown 和 HTML。
10. **连续追问**：Follow-up Memory Node 使用摘要上下文支持下钻问题。

## 量化结果

| 指标 | 结果 | 数据来源 |
| --- | --- | --- |
| 后端完整 CI | `904 passed` | `python -m pytest tests/ -x -q --ignore=tests/ai` |
| 前端测试 | `52 files`, `1209 tests passed` | `npm run test` |
| 前端构建 | PASS | `npm run build` |
| TypeScript | PASS | `npx tsc --noEmit` |
| 后端导入 | PASS | `python -c "from backend.main import app"` |
| 默认演示数据 | `demo_sales_business_50k` | 50,000 行，28 字段 |
| M6 压力题覆盖 | 25 / 25 | `tests/fixtures/m6_pressure_questions.json` |
| Provider 状态 | Mock / Doubao / fallback / error | `provider_status` 契约 |

> 量化结果来自本地工程验证和 M6 报告记录；实际运行速度会受机器、网络、provider 服务和上传文件大小影响。

## 快速上手

### 环境要求

- Python 3.11+
- Node.js 20+
- Docker Desktop + Docker Compose（使用容器方式时）

### Docker Compose 启动（推荐）

```bash
git clone https://github.com/Strange-Men/EnterpriseAiDataAgent.git
cd EnterpriseAiDataAgent
docker compose up --build
```

启动后访问：

- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
- AI Status: http://localhost:8000/api/ai/status

停止：

```bash
docker compose down --remove-orphans
```

Docker Compose 默认使用 Mock LLM，零配置即可体验业务报告、SQL 工作区和报告导出。真实 provider 的 API Key 只放在后端环境变量中，前端不保存真实 key。

### 本地开发启动

后端：

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

前端：

```bash
cd frontend-react
npm install
npm run dev -- --port 3000
```

### 环境变量

核心配置项（完整列表见 `.env.example`）：

| 配置项 | 说明 | 默认值 |
| --- | --- | --- |
| `LLM_MODE` | LLM 运行模式 | `mock` |
| `LLM_DEFAULT_PROVIDER` | 默认 LLM Provider | `mock` |
| `LLM_FALLBACK_ON_ERROR` | Provider 失败时自动 fallback | `true` |
| `LLM_REQUEST_TIMEOUT_SECONDS` | provider 请求超时秒数 | `60` |
| `LLM_CONNECT_TIMEOUT_SECONDS` | provider 连接超时秒数 | `10` |
| `LLM_MAX_RETRIES` | provider 有限重试次数 | `1` |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（可选） | 空 |
| `DOUBAO_API_KEY` | Doubao API Key（可选） | 空 |
| `DOUBAO_BASE_URL` | Doubao Base URL（可选） | 空 |
| `DOUBAO_MODEL` | Doubao Model（可选） | 空 |
| `MIMO_API_KEY` | Mimo API Key（可选） | 空 |
| `NEXT_PUBLIC_API_URL` | 前端连接的后端地址 | `http://localhost:8000` |

安全提示：API Key 只配置在后端环境变量中，不提交 `.env`，不写入前端代码，不进入导出报告。

## API 示例

### 上传数据

```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@sales_data.csv"
```

异步上传会返回 `task_id`，前端通过任务状态接口轮询直到成功或失败。

### 查看上传任务状态

```bash
curl http://localhost:8000/api/tasks/{task_id}/status
```

### 自然语言业务分析

```bash
curl -X POST http://localhost:8000/api/agent/runs \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "请按地区统计销售额并排序。",
    "table_name": "demo_sales_business_50k",
    "provider": "mock",
    "locale": "zh-CN"
  }'
```

### SQL 直接查询（高级 SQL）

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT region, SUM(sales_amount) AS total_sales FROM demo_sales_business_50k GROUP BY region ORDER BY total_sales DESC"
  }'
```

### 清空会话并回到默认演示表

```bash
curl -X POST http://localhost:8000/api/session/clear
```

### 查看系统状态

```bash
curl http://localhost:8000/api/status
curl http://localhost:8000/api/ai/status
```

完整 API 文档：启动后端后访问 http://localhost:8000/docs

## 项目边界

### 已覆盖能力

- CSV / Excel 上传、异步任务状态和 DuckDB 自动建表。
- 默认 `demo_sales_business_50k` 演示表。
- 表结构识别、数据预览和数据质量检查。
- 自然语言业务分析、经营健康度诊断、风险与增长机会识别。
- Business Semantic Layer 与 Business Tools。
- LangChain Single Agent + LangGraph Multi-Agent Orchestration。
- BusinessReportViewModel 统一 UI / Markdown / HTML 表达。
- `data_table` 排序 / 统计类输出。
- Provider 状态透明：`live_success`、`mock`、`fallback`、`error`。
- 高级 SQL 工作区：多 Query、AI 生成 SQL、只读 guard、结果表格独立滚动。
- 反幻觉字段校验：ROI、会员等级、小区、广告创意等缺字段问题不编造。

### 运行边界

- 本项目面向本地优先的数据分析工作台和演示型业务诊断场景。
- 默认数据存储使用本地 DuckDB 文件。
- Mock provider 可零配置运行；真实 provider 依赖用户自己的后端环境变量。
- 技术细节可在系统内展开查看，但不会进入主业务报告或导出报告主体。
- 本项目不是 Tableau / Power BI / Metabase 的替代品，也不承诺商业 BI 平台级权限、租户、调度和治理能力。

## 常见问题

### 没有 API Key 能运行吗？

可以。默认使用 Mock LLM，零配置即可体验默认演示表、业务报告、SQL 工作区和报告导出。

### 支持哪些 LLM Provider？

支持 Mock、Doubao、DeepSeek、Mimo 等 provider 路径。真实 provider 需要后端环境变量配置；provider 不可用时会通过 `provider_status` 和 fallback 提示透明展示。

### 为什么选择 LangChain Single Agent + LangGraph Multi-Agent Orchestration？

LangChain Single Agent 保留已有工具调用兼容路径，适合单次 Agent Run 的工具链执行；LangGraph Multi-Agent Orchestration 把业务问题路由、证据规划、工具执行、报告组织、结果校验和连续追问拆成稳定节点，让不同问题得到不同形态的回答。

### SQL / trace / tool_calls 会展示给业务用户吗？

默认不会。主报告只展示业务结论、行动建议、风险机会、关键证据、数据局限和追问方向。SQL、trace、tool_calls、provider、run id、memory 和 raw JSON 只在技术细节中折叠展示。

### 为什么有时显示 Mock 或 fallback？

Mock 表示用户主动使用演示模式。fallback 表示真实模型服务超时、网络不可用、配置缺失或 provider 返回错误，系统切换为模拟分析结果。前端会展示明确提示，不会把 fallback 伪装成真实模型输出。

### ROI、会员等级、小区、广告创意这类问题如何处理？

如果当前表缺少 `ad_spend`、`campaign_cost`、`membership_level`、`neighborhood`、`campaign_creative` 等字段，系统会明确说明不能直接分析，不会编造字段或排名，并给出可用字段下的替代分析建议。

### 高级 SQL 和业务 Agent 有什么区别？

高级 SQL 面向会写 SQL 的用户，提供 Monaco 编辑器、多 Query、AI 生成 SQL 和只读执行。业务 Agent 面向非技术用户，用自然语言输出业务报告、排序表格、风险机会和行动建议。两者共用 DuckDB 数据表。

## 术语表

| 术语 | 说明 |
| --- | --- |
| LangChain Single Agent | 单 Agent 工具调用路径，保留现有 Agent Run、StructuredTool、trace、memory 和 provider 兼容能力。 |
| LangGraph Multi-Agent Orchestration | 节点化业务编排层，由 Question Router、Evidence Planner、Tool Execution、Report Composer、Validator 和 Follow-up Memory 组成。 |
| Question Router Node | 负责识别用户问题类型，并把问题路由到排序统计、经营诊断、风险机会、行动方案、缺字段或追问路径。 |
| Evidence Planner Node | 根据 intent 规划指标、维度、证据和工具调用顺序。 |
| Tool Execution Node | 调用 Business Tools 和 DuckDB 只读查询，收集可追溯证据。 |
| Report Composer Node | 组织 business_report、data_table、行动建议、风险机会和数据局限。 |
| Validator Node | 校验答非所问、字段幻觉、语言一致性、技术细节泄露和 fallback 透明度。 |
| Follow-up Memory Node | 使用上一轮摘要支持连续追问，不默认暴露 memory 原文。 |
| Business Semantic Layer | 字段字典、业务术语、指标公式、风险阈值和缺字段兜底规则。 |
| Business Tools | 确定性 KPI、维度对比、趋势、风险、机会、质量和建议工具。 |
| BusinessReportViewModel | UI、Markdown 和 HTML 共享的业务报告中间层，用于清洗技术字段、生成标签、去重建议和渲染表格。 |
| data_table | 排序、统计、Top N、按地区/品类/渠道汇总等问题的表格输出模式。 |
| Provider Fallback | 真实模型不可用时切换到模拟结果，并通过 provider 状态和可读原因提示用户。 |
| Expert SQL | 面向高级用户的 SQL 工作区，支持 AI 生成 SQL、手写查询、多 Query 和只读执行。 |

## Contributing

欢迎提交 Issue 或 PR。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，并确保不提交 `.env`、真实 API Key、`node_modules/` 或本地数据文件。

## License

MIT License
