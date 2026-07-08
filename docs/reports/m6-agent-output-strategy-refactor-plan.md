# M6 Agent Output Strategy Refactor Plan｜问什么答什么与多形态业务报告方案

## 1. Background

M6 已完成多轮 Manual Fix / Polish Hotfix，并已稳定以下能力：

- 默认 `demo_sales_business_50k` 表展示。
- 异步上传与 session 当前表状态。
- Business Report 基础结构。
- `provider_status` / fallback 透明度。
- Markdown / HTML 报告导出。
- 高级 SQL Query 编号 normalize。
- 英文模式业务报告基础对齐。
- backend / frontend CI 修复。
- 第 1 轮 SQL UI 修复：高级 SQL 编辑器固定可见，结果表格独立滚动，AI 生成 SQL 写入当前 Query。

最新手动测试继续暴露 Agent 输出策略的架构级缺陷。问题不只是某个模板文案不好，而是 Agent 仍未稳定做到“问什么答什么”。排序、统计、列表类问题容易被强行套入经营健康度诊断模板；增长机会仍可能暴露半技术对象；英文 locale 和导出层也需要统一中间层约束。

本文固化最新五轮技术路线。本轮文档不进行前端功能代码、后端功能代码、测试或 CI 修改；本轮不是 M6.9，不创建 tag。

## 2. Latest User Feedback

最新 6 个问题：

1. SQL 工具执行结果挤压 / 覆盖 SQL 编辑器区域。
2. “增长机会”输出仍暴露 `object_type` / `object_name` / `score` / `evidence` dict，业务人员看不懂。
3. “按地区统计销售额并排序”被错误套用经营诊断模板。
4. “表面增长不错但有隐患”回答较好，是因为命中特定模板，说明 Agent 不是不会分析，而是输出策略太依赖固定模板。
5. 英文模式下仍可能中英混杂，英文页面必须纯英文。
6. 需要审计当前 LangChain 合规性，并给出 LangGraph 接入方案。

## 3. Core Diagnosis

核心问题：

```text
Agent 没有稳定做到“问什么答什么”，而是倾向把不同问题套进经营健康度诊断模板。
```

具体表现：

- 排序 / 统计 / 列表类问题，本应输出数据表 + 简短解读。
- 当前容易输出不相关的退款风险、增长机会和行动建议。
- 诊断类问题表现较好，是因为命中已有模板。
- 增长机会输出仍偏技术对象，不是业务语言。
- 英文 locale 没有全链路控制，导致中英混杂。
- UI、导出、英文模式可能各自拼模板，缺少统一 BusinessReportViewModel。

## 4. Confirmed Five-Round Technical Route

最新五轮顺序固定为：

1. **SQL UI 修复**
   - 修复高级 SQL 编辑器布局。
   - SQL 编辑器固定可见。
   - 结果表格进入独立滚动区域。
   - AI 生成 SQL 写入当前 active Query。
   - Query 新增 / 删除 / 切换不丢 SQL 内容。

2. **LangChain 合规审计 + LangGraph 接入方案文档 + README 一步到位修改**
   - 只做 LangChain 合规审计。
   - 只做 LangGraph Multi-Agent Orchestration 架构文档。
   - 只改 README 文本和状态文档。
   - 不写前端 / 后端功能代码。
   - README 直接呈现 `LangChain Single Agent + LangGraph Multi-Agent Orchestration`。

3. **BusinessReportViewModel + locale 透传 + Export 清洗统一**
   - 建立统一 BusinessReportViewModel。
   - 前端 `/api/agent/runs` 透传 `locale`。
   - 后端 Prompt、Mock 模板、fallback 文案、report label、export label 按 locale 输出。
   - Markdown / HTML 导出从同一个 ViewModel 生成。
   - 增长机会、风险、证据先转成人话 view model，再展示 / 导出。

4. **后端 Intent Router + data_table 输出模式**
   - Intent Router 位于后端 `business_orchestration` 入口。
   - Router 输出 `intent_type`。
   - Prompt、Tool 选择、BusinessReport 结构依赖 `intent_type`。
   - 排序 / 统计类问题优先输出 `data_table`，不套经营健康度诊断模板。

5. **LangGraph MVP**
   - LangGraph Multi-Agent Orchestration 进入可运行的最小闭环。
   - 节点包括 Question Router Node、Evidence Planner Node、Tool Execution Node、Report Composer Node、Validator Node、Follow-up Memory Node。
   - 保留现有 FastAPI、Business Tools、Semantic Layer、BusinessReport contract、ViewModel 和前端工作台。

## 5. Round 2 Documentation Scope

第 2 轮就是本轮：

- LangChain 合规审计。
- LangGraph 接入方案文档。
- README 一步到位修改。
- 更新旧固化方案为五轮路线。
- 更新状态文档。

第 2 轮不写：

- BusinessReportViewModel 功能代码。
- locale 透传功能代码。
- Export 清洗功能代码。
- Intent Router 功能代码。
- `data_table` 功能代码。
- LangGraph MVP 功能代码。
- 前端 / 后端业务功能代码。
- 测试或 CI。

## 6. LangGraph Architecture Expression

LangChain Single Agent 与 LangGraph Multi-Agent 共同构成编排层：

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

节点职责：

- Question Router Node 负责识别用户问题类型，包括 `ranking_summary`、`business_diagnosis`、`risk_opportunity`、`action_plan`、`unsupported_metric`、`follow_up`。
- Evidence Planner Node 负责根据 intent 规划证据收集路径、指标维度和工具调用顺序。
- Tool Execution Node 负责调用现有 Business Tools，不重写数据分析工具。
- Report Composer Node 负责组织 `data_table`、经营诊断、风险机会、行动方案和缺字段解释。
- Validator Node 负责检查答非所问、字段幻觉、语言混杂、技术细节泄露和 provider fallback 透明度。
- Follow-up Memory Node 负责处理连续追问上下文，不污染新问题。

## 7. Intent Router Backend Placement

Intent Router 必须放在后端，不放前端。

推荐位置：

- `backend/agent/business_orchestration.py`
- 或当前 Business Analyst Agent orchestration 入口。

执行顺序：

```text
question + locale + current_table
  -> Intent Router
  -> intent_type
  -> evidence/tool plan
  -> tool execution
  -> intent-aware report composition
  -> validator
  -> BusinessReportViewModel
```

禁止：

- 前端根据关键词决定报告结构。
- 只改前端展示文案来伪装 intent-aware。
- 所有问题继续强行生成经营健康报告。

## 8. data_table Output Mode

排序 / 统计 / 列表类问题需要 `data_table`，不能硬塞 recommendations。

建议合约：

```json
{
  "data_table": {
    "title": "地区销售额排名",
    "columns": ["地区", "销售额", "订单数", "销售占比"],
    "rows": [
      ["South China", 22846695.96, 12402, "28.7%"],
      ["East China", 18563137.15, 11089, "23.3%"]
    ],
    "summary": "South China 销售额最高，同时需要关注退款和售后压力。"
  }
}
```

规则：

- `ranking_summary` 优先输出 `data_table`。
- 不强制生成 `recommendations`。
- 可附带 1-3 条简短业务解读。
- 不输出完整经营健康诊断。
- Markdown / HTML 导出渲染这个表格。
- 前端 UI 把 `data_table` 放在主答案区域。

## 9. Intent-specific Output Rules

### 9.1 ranking_summary

用于：

- 按地区统计销售额并排序。
- 按品类统计退款率。
- 找 Top 5 商品。
- 按渠道汇总利润。

输出：

- 总体一句话。
- `data_table`。
- 1-3 条简短解读。
- `next_questions`。

禁止：

- 强制输出 3 条行动建议。
- 强制输出经营健康度报告。
- 输出不相关风险建议。

### 9.2 business_diagnosis

用于：

- 经营健康度诊断。
- 老板视角风险简报。
- 增长与风险平衡。

输出：

- 总体判断。
- 优先行动建议。
- 主要风险与机会。
- 关键数据依据。
- 数据局限。
- `next_questions`。

### 9.3 risk_opportunity

用于：

- 表面增长不错但有隐患。
- 高销售低利润。
- 增长机会。
- 风险与机会并存对象。

输出：

- 表面表现。
- 隐含风险。
- 具体对象。
- 为什么是机会 / 为什么有风险。
- 第一周处理动作。
- 监控指标。

增长机会必须使用业务语言，禁止直接暴露：

- `object_type`
- `object_name`
- `score`
- raw `evidence` dict
- `impact` / `severity` / `confidence`

### 9.4 action_plan

用于：

- 第一周怎么做。
- 分配运营 / 售后 / 供应链。
- 行动清单。

输出：

- 角色 / 负责人。
- 第一周动作。
- 验收指标。
- 优先级。
- 风险提醒。

### 9.5 unsupported_metric

用于：

- ROI 但没有 `ad_spend` / `campaign_cost`。
- 会员等级但没有 `membership_level`。
- 小区分析但没有 `address` / `neighborhood`。
- 广告创意但没有 `campaign_creative`。

输出：

- 明确不能直接分析。
- 缺少哪些字段。
- 不编造结果。
- 给替代分析建议。
- 可继续问什么。

### 9.6 follow_up

用于：

- 刚才那个对象继续拆解。
- 进一步下钻。
- 第一周动作清单。

输出：

- 引用上一轮上下文。
- 不重新跑偏。
- 上下文不足时说明需要先选择对象。

## 10. Locale and Pure-English Requirements

前端调用 `/api/agent/runs` 时传：

```json
{
  "locale": "zh-CN"
}
```

或：

```json
{
  "locale": "en-US"
}
```

后端用 locale 控制：

- Prompt 模板语言。
- Mock 模板语言。
- `fallback_reason` 文案语言。
- `provider_status` 展示文案语言。
- `BusinessReportViewModel` labels。
- Markdown / HTML export labels。
- `next_questions` 语言。

英文模式要求：

- 回答纯英文。
- 不出现中文标签。
- 不裸露 `unsupported`。
- 无法回答时输出英文解释：
  - "The current data does not support this analysis directly."
  - "Missing required fields: ..."
  - "You can use these alternative analyses instead: ..."

中文模式要求：

- 回答自然中文。
- 不混入 `object_type` / evidence dict / raw JSON。

## 11. BusinessReportViewModel Design

统一中间层：

```text
BusinessReport / Tool Evidence
  -> BusinessReportViewModel
  -> UI render
  -> Markdown export
  -> HTML export
```

ViewModel 负责：

- 去除 raw JSON / SQL / trace / tool_calls。
- 把系统日志式 evidence 转成业务语言。
- 根据 locale 生成标题和字段标签。
- 对建议去重。
- 筛选 Top 3 建议。
- 生成 `data_table` 渲染结构。
- fallback / mock 提示只出现一次。
- `unsupported_metric` 输出清晰替代建议。

## 12. Export Quality Rules

Markdown / HTML 导出必须遵守：

- 不包含 SQL。
- 不包含 trace。
- 不包含 raw JSON。
- 不包含 tool_calls。
- 不包含 `object_type` / `score` / evidence dict。
- 不包含“字段校验完成 / 业务术语映射完成 / 动态 P90 / Top Bottom evidence / impact / severity / confidence”。
- 建议默认 Top 3。
- 风险和机会去重。
- `data_table` 支持 Markdown 表格。
- mock / fallback 提示只出现一次。
- 中文页面导出中文模板。
- 英文页面导出英文模板。

## 13. SQL UI Layout Rules

SQL 工具规则：

- 编辑器区域固定可见。
- 结果表格在独立 scroll container。
- 执行结果不覆盖或挤压编辑器。
- AI 生成 SQL 后写入 active Query editor。
- Query 切换不丢 SQL。
- 删除 Query 后编号 normalize，但内容不乱串。
- 只修 SQL 工具内部布局，不恢复 Sidebar / 五分页导航。

## 14. LangChain Compliance Audit Scope

合规审计检查：

- 当前 LangChain Single Agent 入口。
- 是否使用 LangChain Tool / StructuredTool。
- Tool 输入输出是否清晰。
- Agent 是否基于工具证据生成回答。
- Prompt 是否过度模板化。
- Router / Tool / Composer / Validator 职责是否清晰。
- Memory 是否只服务 follow-up，不污染新问题。
- provider fallback 是否透明。
- `business_report` 是否可验证。
- 是否存在“LangChain 只是套壳”的风险。

初步判断：

当前项目工程上已使用 LangChain Single Agent / StructuredTool，M6.5 已把 M6.4 business tools 包装进现有 Single Agent 后端循环。现有短板集中在输出策略、intent 路由、ViewModel 清洗和多节点职责分离，不是继续堆模板。

## 15. LangGraph Multi-Agent Orchestration Scope

LangGraph Multi-Agent Orchestration 保留：

- 现有 FastAPI API。
- 现有 `business_tools`。
- 现有 semantic layer。
- 现有 BusinessReport contract / ViewModel。
- 现有 frontend workbench。

LangGraph 负责 orchestration 层节点化：

```text
Question Router Node
  -> Evidence Planner Node
  -> Tool Execution Node
  -> Report Composer Node
  -> Validator Node
  -> Follow-up Memory Node
```

不做：

- 推翻现有前端。
- 重写数据层。
- 重写全部 tools。
- 同时引入额外 RAG 路线。

## 16. Proposed Implementation Branches

1. `m6-polish-sql-editor-layout`
   - 修 SQL 编辑器布局和结果区滚动。

2. `m6-langgraph-readme-architecture-docs`
   - LangChain 合规审计。
   - LangGraph 接入方案文档。
   - README 一步到位修改。

3. `m6-output-viewmodel-locale-export`
   - 建 `BusinessReportViewModel`。
   - locale 全链路透传。
   - export 走统一 ViewModel。
   - 增长机会 / evidence 清洗。

4. `m6-intent-router-data-table-output`
   - 后端 Intent Router。
   - `data_table` 输出模式。
   - intent-specific report composition。
   - 排序 / 统计类问题不再套经营诊断模板。

5. `m6-langgraph-mvp`
   - LangGraph Multi-Agent Orchestration 最小闭环。
   - 六个节点串联现有 semantic layer、business tools、BusinessReportViewModel 和 memory summary。

## 17. Non-goals

- 本文档不进行功能开发。
- 不新增 M6.9。
- 不打 tag。
- 不写前端功能代码。
- 不写后端功能代码。
- 不改测试。
- 不改 CI。
- 不做 RAG。
- 不重写前端。
- 不重写数据层。
- 不恢复 Sidebar。
- 不恢复五分页导航。
- 不提交 API Key。
- 不提交 `.env`。
- 不提交私人学习 / 面试 / 简历 / 包装内容。

## 18. Acceptance Criteria for This Documentation Round

- 清楚记录最新 6 个问题。
- 明确核心诊断：Agent 没有问什么答什么。
- 明确最新五轮路线。
- 明确第 2 轮只做 LangChain 合规审计、LangGraph 文档和 README。
- 明确 Intent Router 在后端 orchestration 层。
- 明确 `data_table` 输出模式。
- 明确 locale 前端传后端。
- 明确 `BusinessReportViewModel` 作用。
- 明确 export 清洗规则。
- 明确 SQL UI 修复边界。
- 明确 LangChain 审计范围。
- 明确 LangGraph Multi-Agent Orchestration 节点与职责。
- 明确本轮不开发功能代码。
