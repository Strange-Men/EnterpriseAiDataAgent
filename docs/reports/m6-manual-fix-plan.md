# M6 Manual Fix Plan｜非技术用户体验修复与业务报告可用性优化

## 1. Background

M6.8 Final QA / Manual Test Ready 已完成并合并到 `master`，项目进入用户手动测试阶段。

本轮手动测试暴露出一组真实产品可用性问题，集中在产品默认状态、上传链路、业务报告表达、provider 透明度和继续追问交互体验上。

本文只固化修复方案，不做代码实现。本轮不是 M6.9，不是新路线，也不是新功能扩张，而是 M6 手动测试后对既有 Business Analyst Agent 体验的修复计划。

本文明确后续开发应拆成三个独立 Fix：

1. Manual Fix 1：默认状态 / 异步上传 / Session 表状态
2. Manual Fix 2：业务报告输出契约 / 建议校验 / 报告重排
3. Manual Fix 3：Provider 透明度 / 下一步提问交互 / 最终回归

后续每个 Fix 必须由单独 prompt 启动，不要一次性实现三个 Fix。

## 2. User Manual Test Problems

### A. 产品默认状态问题

1. 浅色模式没删，用户只要暗黑风。
2. 默认 demo 表不是 `demo_sales_business_50k`，HR 没有业务 Excel，默认表必须适合演示。
3. 每次打开网页不应该自动展示历史记录，首页应该干净；需要看历史时再点“历史”。
4. 上传文件显示 `signal timed out`，但实际又上传成功，存在“假失败”。

### B. 真实运行问题

5. 选择 Doubao 后出现兜底回答，需要查 provider 状态和 fallback 透明度。

### C. 业务报告表达问题

6. 当前“核心结论 / 数据来源”不像给非技术人员看的，报告顺序需要重排。
7. 当前“业务建议”太薄，`reason` / `monitoring metric` / `expected action window` 不适合非技术人员。
8. “下一步可以提问”不能点击回填，不方便继续问。
9. “相关数据”太技术化，不适合默认展示给非技术人员。

## 3. Fix Strategy Overview

### Manual Fix 1：默认状态 / 异步上传 / Session 表状态

先止血产品默认状态和上传链路：

- 删除浅色模式入口并强制 dark theme。
- 默认演示表切换为 `demo_sales_business_50k`。
- 首页首次打开不自动展示旧历史答案。
- 上传改为异步任务，避免 50k Excel 出现“前端失败但后端成功”的假失败。
- 明确 `app_default_table` 与 `user_active_table` 的边界。

### Manual Fix 2：业务报告输出契约 / 建议校验 / 报告重排

再修业务报告内容质量：

- 升级 recommendations 输出契约。
- 后端生成真正面向业务人员的“做什么、为什么、怎么做、看什么指标、多久完成”。
- 增加 Recommendation Schema Validator。
- 前端报告顺序改为先结论和行动，再展示证据。
- “相关数据”默认改为折叠的“技术细节 / 数据证据”。

### Manual Fix 3：Provider 透明度 / 下一步提问交互 / 最终回归

最后修 provider 透明度和继续提问交互：

- 后端返回明确 provider 状态。
- 前端展示 live / mock / fallback / error。
- Doubao 失败不能伪装成真实模型输出。
- 下一步问题 chip 可点击回填输入框，但不自动提交。
- 做最终回归，确保 Manual Fix 1 / 2 / 3 没有互相破坏。

每个 Fix 都要包含前端、后端、状态边界和验收标准。不要一次性全修。

## 4. Manual Fix 1｜默认状态 / 异步上传 / Session 表状态

### 4.1 Problems

- 浅色模式没删。
- 默认表应为 `demo_sales_business_50k`。
- 上传 50k Excel 显示 timeout 但实际成功。
- 首页不应自动展示历史答案。
- 前端清空不等于后端 memory 清空。

### 4.2 Frontend Scope

前端范围：

- 删除浅色模式入口。
- 强制 dark theme。
- 清理 light mode localStorage，避免旧浏览器状态把 UI 拉回浅色。
- 默认展示 `demo_sales_business_50k`。
- 页面首次打开不自动展示旧业务答案。
- 历史记录只在用户点击“历史”后展示。
- 上传 UI 改为任务状态：
  - 上传中
  - 解析中
  - 入库中
  - 成功
  - 失败

前端不得只把 timeout 调大，因为这不能解决“后端已成功但前端以为失败”的状态不一致。

### 4.3 Backend Scope

上传必须改成异步任务模式：

```text
POST /api/upload
  -> 立即返回 task_id

GET /api/tasks/{task_id}/status
  -> 返回 pending / running / success / failed / progress / table_name / error_message
```

后台任务流程：

```text
保存文件
  -> 解析 CSV / Excel
  -> 建表 / 入库
  -> profile
  -> 更新 user_active_table
  -> 写入 session current_table
```

后端要求：

- 上传 API 的同步阶段只负责接收文件并创建任务。
- 文件解析、入库、profile 不阻塞前端请求。
- 任务失败时返回明确 `error_message`。
- 任务成功时返回 `table_name`，供前端切换当前表。
- 不要因为前端请求超时而让后端任务失联。

### 4.4 Default Table vs User Active Table

必须区分：

- `app_default_table = demo_sales_business_50k`
- `user_active_table = 用户当前正在分析的表`

加载页面逻辑：

1. 优先读取后端 session `current_table`。
2. 如果有 `current_table`，则恢复用户上次正在操作的表。
3. 如果没有 `current_table`，则加载 `app_default_table`，也就是 `demo_sales_business_50k`。

上传成功后：

1. 后端写入 session `current_table`。
2. 前端切换到上传后的表。
3. 刷新后仍恢复用户上传表。

重置会话时：

1. 清空 session memory。
2. 清空 `current_table`。
3. 回到 `demo_sales_business_50k`。
4. 不展示旧业务答案。

### 4.5 Async Task Timeout Fallback

任务状态建议存 SQLite，不只放内存。

原因：

- 只放内存会在进程重启后丢失任务状态。
- 多 worker 或后端重载时容易出现前端还在轮询但后端找不到任务。
- SQLite 便于后续定位上传任务历史和失败原因。

超时兜底规则：

```text
if task.status == "running"
and now - task.started_at > 300 seconds:
    task.status = "failed"
    task.error_message = "文件处理超时，请重试或改用 CSV 格式上传。"
```

前端轮询逻辑：

- `success`：切换当前表，停止 loading。
- `failed`：停止 loading，显示明确失败原因。
- `running`：继续轮询。
- `pending`：继续轮询，可展示排队状态。
- timeout：必须落到 `failed`，不要出现“失败提示但实际成功”的假失败。

边缘场景兜底：

1. 后端任务成功但前端最后一次轮询失败：前端重新进入页面时应通过 `current_table` 恢复成功后的用户表。
2. 后端任务超过 300 秒仍 running：自动标记 failed，不能无限转圈。
3. 上传成功后用户刷新页面：应恢复上传后的表，而不是回默认 demo 表。
4. 用户点击重置会话：必须同时清空前端展示状态和后端 session memory / `current_table`。

### 4.6 Fix 1 Acceptance Criteria

- 页面只有暗黑模式。
- 默认表是 `demo_sales_business_50k`。
- 上传后刷新能恢复用户上传表。
- 重置会话后回到默认 demo 表。
- 50k Excel 上传不再出现假失败。
- 任务 running 超时会变 failed，不会无限转圈。
- 首页不自动展示旧答案。
- 新会话不带旧 memory。

## 5. Manual Fix 2｜业务报告输出契约 / 建议校验 / 报告重排

### 5.1 Problems

- 报告顺序不适合非技术人员。
- 业务建议太薄。
- `reason` / `monitoring metric` / `expected action window` 太技术。
- 核心结论和数据依据太像系统输出。
- 相关数据默认暴露，非技术人员看不懂。

### 5.2 Backend Output Contract Upgrade

`recommendations` 必须升级为结构化业务建议。

目标结构示例：

```json
{
  "priority": "high",
  "action": "优先排查直播渠道的售后问题",
  "why": "直播渠道订单量较高，但退款和投诉压力更高，说明该渠道可能带来了一部分低质量订单。",
  "how": "先抽取直播渠道近 7 天的退款订单，按品类、商品和退货原因分组，找出最集中的问题来源。",
  "metrics": ["退款率", "投诉率", "满意度", "退货原因 Top 3"],
  "deadline": "建议 1 周内完成初查",
  "owner_hint": "运营 / 售后 / 商品负责人"
}
```

要求：

- 后端 report builder / prompt / contract 必须支持该结构。
- 前端只是渲染，不能靠前端硬编内容。
- 建议必须包含：
  - 做什么
  - 为什么
  - 怎么做
  - 看什么指标
  - 多久完成
- 主报告尽量少裸露字段名，例如 `ad_channel` / `refund_rate`。
- 字段名、tool 原始输出和 SQL 放入技术细节，不放主报告。

### 5.3 Recommendation Schema Validator

必须写入防御策略：

```text
LLM / report builder 输出
  -> Recommendation Schema Validator
  -> 校验通过：返回结构化建议
  -> 校验失败：返回防御性默认建议
```

建议使用 Pydantic 或项目现有 contract 模型校验。

校验失败时不能 500，不能让前端白屏。返回默认结构：

```json
{
  "priority": "medium",
  "action": "优先排查退款和投诉较高的业务对象",
  "why": "当前数据提示部分渠道、地区或品类可能存在退款和体验压力，需要进一步确认。",
  "how": "先导出相关订单明细，按渠道、地区、品类和退货原因分组，找出问题最集中的对象。",
  "metrics": ["退款率", "投诉率", "满意度", "退货原因"],
  "deadline": "建议 1 周内完成初步排查",
  "owner_hint": "运营 / 售后 / 商品负责人"
}
```

边缘场景兜底：

1. LLM 返回空 recommendations：用防御性默认建议兜底。
2. LLM 返回字符串而不是对象：validator 转换失败后走默认建议。
3. LLM 返回字段名但缺少人话解释：后端补足 `why` / `how`，否则降级默认建议。
4. LLM 返回超长建议：后端截断到可展示长度，保留行动、原因、方法和指标。

### 5.4 Frontend Report Order

前端报告顺序改为：

1. 总体判断
2. 优先行动建议
3. 主要风险与机会
4. 关键原因解释
5. 关键数据依据
6. 下一步可以继续问
7. 技术细节 / 原始数据证据

要求：

- 第一屏能看到结论和行动建议。
- 业务建议优先级高于原始数据。
- 技术细节和相关数据默认折叠。
- 不把 SQL、tool_calls、trace 或 raw JSON 放在主报告中。

### 5.5 Related Data Handling

当前“相关数据”不适合默认展示。

要求：

- 默认隐藏。
- 改名为：技术细节 / 数据证据。
- 展开后才显示 schema / columns / business_tool 原始输出。
- 主报告只展示人话版证据。
- 非技术人员不展开也能理解结论、风险和建议。

### 5.6 Fix 2 Acceptance Criteria

- 第一屏能看到结论和优先行动。
- 建议包含做什么、为什么、怎么做、看什么指标、多久完成。
- LLM 格式异常不会导致前端崩溃。
- 字段名不会大量裸露在主报告。
- 相关数据默认折叠。
- 非技术人员不展开技术细节也能理解。

## 6. Manual Fix 3｜Provider 透明度 / 下一步提问交互 / 最终回归

### 6.1 Problems

- 选择 Doubao 却触发兜底。
- fallback 可能伪装成真实模型输出。
- 下一步提问不能点击回填。
- 点击交互可能和输入状态冲突。

### 6.2 Backend Provider Status Contract

后端必须返回明确 provider 状态：

```json
{
  "requested_provider": "doubao",
  "provider_used": "mock",
  "provider_status": "fallback",
  "fallback_reason": "Doubao request timed out after 30s",
  "is_simulated": true
}
```

状态枚举：

- `live_success`：真实模型成功
- `mock`：用户主动选择 Mock
- `fallback`：真实模型失败后降级
- `error`：失败且没有可用兜底

要求：

- `provider_status` 是面向产品状态的字段。
- `provider_used` 是实际执行结果字段。
- `fallback_reason` 必须可读，不能只给异常栈。
- `is_simulated` 为 true 时，前端必须提示用户当前结果不是真实模型输出。

### 6.3 Frontend Provider Display Rules

前端展示规则：

- `live_success`：正常展示。
- `mock`：显示“演示模式”。
- `fallback`：黄色 Banner，说明这是模拟分析结果。
- `error`：明确失败，不伪装成功。

禁止：

- 隐藏 fallback。
- 把 mock 内容伪装成 Doubao 输出。
- 只去掉“演示兜底”标签。
- 在主报告中展示技术堆栈。

### 6.4 Doubao Investigation Checklist

Fix 3 开发时必须检查：

- `DOUBAO_API_KEY` 是否存在
- `DOUBAO_BASE_URL` 是否正确
- `DOUBAO_MODEL` 是否正确
- 请求是否超时
- Agent 总超时是否小于 Doubao 响应时间
- fallback 是否被业务编排提前触发
- 前端 provider 下拉值和后端 provider 参数是否一致

检查时不得打印、截图、提交真实 key。

### 6.5 Next Question Interaction

点击下一步问题 chip 时：

```text
setInputValue(question)
reset editing / submitting / draft state
scrollTo input area
focus textarea
```

要求：

- 点击只是填入问题。
- 不直接开始分析。
- 用户可以修改后再提交。
- 如果用户原本输入了一半，点击 chip 可以覆盖，但状态必须一致。
- 可选增加“复制问题”按钮。

边缘场景兜底：

1. 用户正在提交中点击 chip：应禁止点击或等提交结束后再填入，不能打断请求状态。
2. 用户输入框已有草稿：点击 chip 覆盖前要确保 input state、draft state 和 UI 展示一致。
3. 文本框不在当前视口：点击后滚动到输入区并 focus。
4. chip 文案过长：填入完整问题，但 chip 展示可截断并提供 tooltip。

### 6.6 Fix 3 Acceptance Criteria

- Doubao 成功时不显示 fallback。
- Doubao 失败时明确显示 fallback banner。
- 用户知道当前结果是真实模型还是模拟兜底。
- 下一步问题可点击回填。
- 点击后滚动到输入框并 focus。
- 点击不会自动提交。
- 点击不会造成输入框受控状态错乱。

## 7. Global Non-goals

- 不新增 M6.9。
- 不打 tag。
- 不做 Multi-Agent。
- 不做 LangGraph。
- 不做 RAG。
- 不推翻前端单页工作台。
- 不恢复 Sidebar。
- 不恢复五分页导航。
- 不默认暴露 SQL / trace / tool_calls / provider / run_id / memory。
- 不提交 `.env`。
- 不提交 API Key。
- 不提交私人学习 / 面试 / 简历 / 包装内容。

## 8. Global Acceptance Criteria

- 页面只有暗黑风。
- 默认加载 `demo_sales_business_50k`。
- 上传用户表后刷新仍恢复用户表。
- 重置会话后回默认 demo 表。
- 上传 50k Excel 不出现假失败。
- 任务超时会明确失败，不无限 loading。
- 首页干净，不展示旧历史。
- 新会话不带旧 memory。
- 业务报告先给结论和优先行动。
- 建议讲清楚做什么、为什么、怎么做、看什么指标、多久完成。
- LLM 输出格式异常也不会让前端崩。
- 相关数据默认折叠。
- 技术细节默认折叠。
- 非技术人员能不看 SQL 也理解结果。
- Doubao / Mock / fallback 状态透明。
- fallback 不伪装真实模型。
- 下一步问题可以点击回填。
- 点击不会自动提交。
- 点击不会弄乱输入框状态。

## 9. Proposed Development Order

后续开发顺序：

1. Manual Fix 1：默认状态 / 异步上传 / Session 表状态
2. Manual Fix 2：业务报告输出契约 / 建议校验 / 报告重排
3. Manual Fix 3：Provider 透明度 / 下一步提问交互 / 最终回归

强调：

- 本文档只是计划。
- 后续每个 Fix 必须单独 prompt。
- 不要一次性实现三个 Fix。
- 每个 Fix 完成后都要独立验证、提交、推送并等待用户审查。

## 10. Risks

- 上传异步任务和现有 upload API 兼容风险。
- SQLite task 状态在多 worker 下的 stale running 风险。
- `business_report` contract 变化导致前端旧兼容风险。
- LLM 输出格式不稳定风险。
- `provider_status` 和旧 provider metadata 不一致风险。
- 下一步 chip 点击和输入框受控状态冲突风险。
- 默认表和用户上传表切换逻辑混乱风险。
- 清空前端历史但未清空后端 memory，导致旧上下文泄漏风险。
- 只改前端文案而不改后端 contract，导致建议质量无法稳定复现风险。
- 只增加 timeout 而不做任务状态，导致上传假失败继续出现风险。

## 11. Documentation-only Confirmation

本轮只新增文档。

本轮没有：

- 代码实现。
- 前端改动。
- 后端改动。
- 测试改动。
- CI 改动。
- Fix 1 / Fix 2 / Fix 3 实装。
- tag。
- 合并 master。

当前分支只用于固化 M6 Manual Fix 技术方案，等待用户审查后，再由单独 prompt 启动 Manual Fix 1。
