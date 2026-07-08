# M6 Agent Output Strategy Refactor Plan｜问什么答什么与多形态业务报告方案

## 1. Background

M6 已经过多轮 Manual Fix / Polish Hotfix。当前 `master` 已基本稳定了以下能力：

- 默认展示 `demo_sales_business_50k`。
- 异步上传与 session 当前表状态。
- Business Report 基础结构。
- `provider_status` / fallback 透明度。
- Markdown / HTML 导出。
- 高级 SQL Query 编号 normalize。
- 英文模式部分修复。
- backend / frontend CI 已重新修绿。

最新手动测试继续暴露出 Agent 输出策略的架构级缺陷。问题不是某个模板文案不好，而是 Agent 还没有稳定做到“按问题类型回答”。它仍然倾向把不同问题塞进经营健康度诊断模板，导致排序、统计、列表类问题也被包装成风险、机会和行动建议。

本文只固化后续技术方案，不做开发。本轮不是 M6.9，不是新路线，而是 M6 手测后的输出策略重构计划。

## 2. Latest User Feedback

最新手测反馈集中在 6 个问题：

1. SQL 工具执行结果会挤压或覆盖 SQL 编辑器区域，导致上方 SQL 编辑区看不清。
2. Mock 输出中的“增长机会”仍暴露 `object_type` / `object_name` / `score` / `evidence` dict 等半技术对象，业务人员看不懂。
3. 用户问“按地区统计销售额并排序”，Agent 却强行套用经营健康度模板，输出退款风险、增长机会和行动建议，没有围绕“排序结果”作答。
4. “表面增长不错但有隐患”这类问题回答较好，主要因为命中特定模板，说明 Agent 不是完全不会分析，而是输出策略太依赖固定模板。
5. 英文页面下 Agent 回答仍可能中英混杂，英文模式必须纯英文。
6. 需要检查当前 LangChain 是否合规，并设计未来如果加 LangGraph 时的最小风险接入方案。

## 3. Core Diagnosis

当前核心问题是：

```text
Agent 没有做到“问什么答什么”，而是倾向把不同问题都套进经营健康度诊断模板。
```

具体表现：

- 排序 / 统计 / 列表类问题，本应输出数据表和简短解读。
- 当前却容易强行输出风险、机会和行动建议。
- 诊断类问题表现较好，是因为命中了现有模板。
- 增长机会输出仍偏技术对象，不是业务语言。
- 英文 locale 没有全链路控制，导致中英混杂。
- 导出层和 UI 层仍可能各自拼模板，缺少统一 ViewModel。

后续优化重点不是继续堆更多固定模板，而是先建立统一输出中间层，再让后端根据 intent 选择不同报告形态。

## 4. Optimized Development Order

### Round 1：SQL UI Layout Hotfix

只修高级 SQL 工具前端布局。

目标：

- SQL 编辑器固定可见。
- 执行结果表格不能挤压或覆盖编辑器。
- AI 生成 SQL 后写入当前 Query 并可见。
- Query 新增 / 删除 / 切换不丢内容。
- 继续保持 Query 编号 normalize。

本轮不涉及 Agent 输出策略。

### Round 2：BusinessReportViewModel + Locale + Export Infrastructure

先搭统一输出基础设施，再改 Agent 策略。

目标：

- 增加统一 `BusinessReportViewModel`。
- 前端 `/api/agent/runs` 必须传 `locale`：`zh-CN` 或 `en-US`。
- 后端 Prompt / Mock 模板 / fallback 文案 / report label / export label 都必须根据 locale 输出。
- Markdown / HTML 导出必须从同一个 ViewModel 生成。
- 导出层不再直接读 raw `business_report` / evidence dict。
- 增长机会、风险、证据都要先转成人话 ViewModel，再展示或导出。

### Round 3：Backend Intent Router + Intent-aware Business Report

在后端 Agent orchestration 层实现 Intent Router。

目标：

- Intent Router 位于后端 `business_orchestration` 入口。
- 在调用任何业务工具之前执行。
- Router 输出 `intent_type`。
- 后续 Prompt、Tool 选择、Business Report 结构必须依赖 `intent_type`。
- 前端只传 question / locale / table，不负责判断 intent。

必须支持 intent 类型：

- `ranking_summary`：排序 / 统计 / 汇总 / top / by region / by category。
- `business_diagnosis`：经营健康度 / 综合诊断 / 老板视角。
- `risk_opportunity`：隐患 / 高增长高风险 / 增长机会 / 风险机会平衡。
- `action_plan`：第一周怎么做 / 负责人分工 / 行动清单。
- `unsupported_metric`：ROI / 会员等级 / 小区 / 广告创意等缺字段问题。
- `follow_up`：基于上文继续追问。

### Round 4：LangChain Compliance Audit + LangGraph Integration Plan

只写架构审计文档，不接入 LangGraph。

目标：

- 审计当前 LangChain 是否合规。
- 判断当前是不是只是 LangChain 套壳。
- 给出未来 LangGraph 接入方式。
- 设计为可选 orchestration 层替换，不推翻现有工具、前端和数据层。

## 5. Intent Router Backend Placement

Intent Router 必须放在后端，不允许放前端。

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

## 6. data_table Output Mode

排序 / 统计 / 列表类问题需要 `data_table`，不能硬塞 recommendations。

建议在 `BusinessReport` 或 ViewModel 中增加可选字段：

```json
{
  "data_table": {
    "title": "地区销售额排名",
    "columns": ["地区", "销售额", "订单数", "销售占比"],
    "rows": [
      ["South China", 22846695.96, 12402, "28.7%"],
      ["East China", 18563137.15, 11089, "23.3%"]
    ],
    "summary": "South China 销售额最高，但也需要关注退款和售后压力。"
  }
}
```

规则：

- `ranking_summary` 必须优先输出 `data_table`。
- 不强制生成 `recommendations`。
- 可附带简短业务解读。
- 不输出完整经营健康诊断。
- 导出 Markdown / HTML 时也要渲染这个表格。
- 前端 UI 应把 `data_table` 放在主答案区域。

## 7. Intent-specific Output Rules

### 7.1 ranking_summary

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

### 7.2 business_diagnosis

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

### 7.3 risk_opportunity

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

### 7.4 action_plan

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

### 7.5 unsupported_metric

用于：

- ROI 但没有 `ad_spend` / `campaign_cost`。
- 会员等级但没有 `membership_level`。
- 小区分析但没有 `address` / `neighborhood`。
- 广告创意但没有 `campaign_creative`。

输出：

- 明确不能直接分析。
- 缺少哪些字段。
- 不能编造结果。
- 给替代分析建议。
- 可继续问什么。

### 7.6 follow_up

用于：

- 刚才那个对象继续拆解。
- 进一步下钻。
- 第一周动作清单。

输出：

- 必须引用上一轮上下文。
- 不要重新跑偏。
- 如果上下文不足，要说明需要先选择对象。

## 8. Locale and Pure-English Requirements

前端调用 `/api/agent/runs` 时必须传：

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

后端必须用 locale 控制：

- Prompt 模板语言。
- Mock 模板语言。
- `fallback_reason` 文案语言。
- `provider_status` 展示文案语言。
- `BusinessReportViewModel` labels。
- Markdown / HTML export labels。
- `next_questions` 语言。

英文模式要求：

- 回答必须纯英文。
- 不允许中英混杂。
- 不允许出现“退款率 / 建议负责人 / 具体怎么做 / 暂无”等中文。
- 不允许裸露 `unsupported`。
- 如果无法回答，应输出英文解释：
  - "The current data does not support this analysis directly."
  - "Missing required fields: ..."
  - "You can use these alternative analyses instead: ..."

中文模式要求：

- 回答必须自然中文。
- 不要混入 `object_type` / evidence dict / raw JSON。

## 9. BusinessReportViewModel Design

需要先做 ViewModel，是因为当前 UI、导出、英文模式可能各自拼模板，导致输出不一致。

建议增加统一中间层：

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

## 10. Export Quality Rules

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

## 11. SQL UI Layout Rules

SQL 工具修复规则：

- 编辑器区域必须固定可见。
- 结果表格必须在独立 scroll container。
- 执行结果不能覆盖或挤压编辑器。
- AI 生成 SQL 后必须写入 active Query editor。
- Query 切换不丢 SQL。
- 删除 Query 后编号 normalize，但内容不乱串。
- 只修 SQL 工具内部布局，不恢复 Sidebar / 五分页导航。

## 12. LangChain Compliance Audit Scope

后续文档要审计：

- 当前是否真正使用 LangChain Tool / StructuredTool。
- Tool 输入输出是否清晰。
- Agent 是否基于工具证据生成回答。
- Prompt 是否过度模板化。
- Router / Tool / Composer / Validator 是否职责清晰。
- Memory 是否只服务 follow-up，不污染新问题。
- provider fallback 是否透明。
- `business_report` 是否可验证。
- 是否存在“LangChain 只是套壳”的风险。

初步判断：

当前项目工程上已使用 LangChain Single Agent / StructuredTool，但输出策略仍偏模板化。后续优化重点不是堆更多框架，而是让 Router、Tool Evidence、Report Composer、Validator 的职责更清晰。

## 13. LangGraph Future Integration Plan

现在不接入 LangGraph，只设计未来方案。

未来最优方式是保留：

- 现有 FastAPI API。
- 现有 `business_tools`。
- 现有 semantic layer。
- 现有 BusinessReport contract / ViewModel。
- 现有 frontend workbench。

LangGraph 只替换 orchestration 层。

推荐节点：

```text
Question Router Node
  -> Evidence Planner Node
  -> Tool Execution Node
  -> Report Composer Node
  -> Validator Node
  -> Follow-up Memory Node
```

不要：

- 推翻现有前端。
- 重写数据层。
- 重写全部 tools。
- 同时引入 Multi-Agent 和 LangGraph。
- 在 M6 未封板前贸然实装。

## 14. Proposed Implementation Prompts

后续建议分轮：

1. `m6-polish-sql-editor-layout`
   - 修 SQL 编辑器布局和结果区滚动。
2. `m6-output-viewmodel-locale-export`
   - 建 `BusinessReportViewModel`。
   - locale 全链路透传。
   - export 走统一 ViewModel。
   - 增长机会 / evidence 清洗。
3. `m6-intent-router-data-table-output`
   - 后端 Intent Router。
   - `data_table` 输出模式。
   - intent-specific report composition。
   - 排序 / 统计类问题不再套经营诊断模板。
4. `m6-langchain-compliance-langgraph-plan`
   - 只写审计文档。
   - 不接入 LangGraph。

以上只是后续分轮建议，不是本轮开发 prompt。

## 15. Non-goals

- 本文档不进行开发。
- 不新增 M6.9。
- 不打 tag。
- 不接入 LangGraph。
- 不做 Multi-Agent。
- 不重写前端。
- 不重写数据层。
- 不恢复 Sidebar。
- 不恢复五分页导航。
- 不提交 API Key。
- 不提交 `.env`。
- 不提交私人学习 / 面试 / 简历 / 包装内容。

## 16. Acceptance Criteria for This Documentation Round

文档完成后应满足：

- 清楚记录最新 6 个问题。
- 明确核心诊断：Agent 没有问什么答什么。
- 明确新的执行顺序。
- 明确 Intent Router 在后端 orchestration 层。
- 明确 `data_table` 输出模式。
- 明确 locale 前端传后端。
- 明确 `BusinessReportViewModel` 作用。
- 明确 export 清洗规则。
- 明确 SQL UI 修复边界。
- 明确 LangChain 审计范围。
- 明确 LangGraph 未来接入方式。
- 明确本轮不开发。
