# M6 Business Capability Pressure Test

## 1. Stage

本轮阶段是 M6.7 综合能力压力测试。

本轮只验证 M6.2-M6.6 是否已经形成 Business Analyst Agent 能力，并对压力测试暴露出的必要缺陷做最小修复。未进入 M6.8 Final QA，未打 tag。

## 2. Prerequisite CI And Merge

- 已先检查 M6.6 分支 `m6-business-report-frontend-adaptation` 的 GitHub Actions。
- 最新 M6.6 CI run `28836528225` 结论为 `success`。
- 在确认 M6.6 CI 通过后，已将 `origin/m6-business-report-frontend-adaptation` 合并到 `master`。
- 合并后已推送 `master`，并从最新 `master` 创建 M6.7 分支 `m6-business-capability-pressure-test`。

## 3. Scope Control

本轮保持 M6.7 范围：

- 新增综合能力压力测试 fixture。
- 新增后端压力测试。
- 验证前端 Business Report 展示和默认隐藏技术细节的既有测试。
- 修复压力测试发现的两个必要缺陷。
- 更新 M6.7 报告和状态文档。

本轮未做：

- 未进入 M6.8 Final QA。
- 未新增 Multi-Agent、LangGraph 或 RAG。
- 未推翻单页工作台。
- 未恢复 Sidebar。
- 未恢复五分页导航。
- 未打 tag。

## 4. Pressure Test Coverage

新增文件：

- `tests/fixtures/m6_pressure_questions.json`
- `tests/test_m6_business_capability_pressure.py`

fixture 覆盖 `docs/reports/m6-pressure-test-plan.md` 中 M6-Q01 到 M6-Q25 全部 25 个问题。每题包含：

- `id`
- `question`
- `category`
- `expected_capabilities`
- `required_business_report_sections`
- `anti_hallucination_expectations`
- `min_score_hint`

自动化覆盖题目数：25。

手动验证题目数：0。本轮 25 题均可通过 deterministic pytest harness 自动运行。

## 5. Automated Questions

自动化覆盖：

- M6-Q01 经营健康度评估
- M6-Q02 业务复盘会总结
- M6-Q03 高收入高风险地区
- M6-Q04 值得加大投入的地区
- M6-Q05 促销依赖风险
- M6-Q06 高销量低利润商品
- M6-Q07 退款风险最高品类和候选原因
- M6-Q08 渠道订单多但体验差
- M6-Q09 发货效率是否拖累体验
- M6-Q10 一线和三四线城市经营差异
- M6-Q11 年轻客户品类偏好
- M6-Q12 高价值客户贡献和风险
- M6-Q13 最近几个月经营趋势
- M6-Q14 应持续监控的指标
- M6-Q15 数据质量问题
- M6-Q16 面向老板的经营简报
- M6-Q17 下季度重点投入对象
- M6-Q18 优先处理的风险
- M6-Q19 退款原因集中情况
- M6-Q20 华南和华东经营质量对比
- M6-Q21 ROI 反胡编
- M6-Q22 会员等级反胡编
- M6-Q23 小区字段反胡编
- M6-Q24 基于上一轮高风险地区继续看品类
- M6-Q25 基于上一题生成一周整改计划

## 6. Rubric Summary

每题按 10 项 deterministic rubric 评分：

1. 字段识别正确
2. 没有胡编字段或口径
3. 拆成多个指标
4. 调用多个证据查询
5. 指标计算合理
6. 有业务判断
7. 有风险优先级
8. 有行动建议
9. 普通人能看懂
10. 默认隐藏 SQL / trace / tool_calls

本轮结果：

- 总题数：25
- 自动化题数：25
- 达到 8 分及以上：25
- 最低分：9
- 最高分：10
- 反胡编题：3/3 通过
- 多轮追问题：2/2 通过
- 至少 5 个复杂题产生 3 类以上 evidence 或业务工具结果：通过

## 7. Score Summary

| Question | Category | Score | Tool Count | Question Type | Duration |
| --- | --- | ---: | ---: | --- | ---: |
| M6-Q01 | business_health_check | 10 | 10 | business_health_check | 1.006s |
| M6-Q02 | business_review_summary | 10 | 7 | business_review_summary | 2.831s |
| M6-Q03 | region_analysis | 10 | 8 | risk_diagnosis | 0.666s |
| M6-Q04 | growth_opportunity | 10 | 4 | growth_opportunity | 0.302s |
| M6-Q05 | category_product_analysis | 10 | 8 | risk_diagnosis | 0.655s |
| M6-Q06 | category_product_analysis | 10 | 5 | category_product_analysis | 0.579s |
| M6-Q07 | category_product_analysis | 10 | 8 | risk_diagnosis | 0.646s |
| M6-Q08 | channel_analysis | 10 | 3 | channel_analysis | 0.348s |
| M6-Q09 | shipping_efficiency_analysis | 10 | 2 | shipping_efficiency_analysis | 0.166s |
| M6-Q10 | region_analysis | 10 | 4 | region_analysis | 0.320s |
| M6-Q11 | customer_profile_analysis | 9 | 2 | customer_profile_analysis | 0.176s |
| M6-Q12 | customer_profile_analysis | 10 | 8 | risk_diagnosis | 0.654s |
| M6-Q13 | trend_analysis | 9 | 2 | trend_analysis | 0.248s |
| M6-Q14 | business_health_check | 10 | 10 | business_health_check | 1.060s |
| M6-Q15 | data_quality_check | 10 | 8 | risk_diagnosis | 0.759s |
| M6-Q16 | business_review_summary | 10 | 7 | business_review_summary | 2.485s |
| M6-Q17 | growth_opportunity | 10 | 4 | growth_opportunity | 0.294s |
| M6-Q18 | recommendation_request | 9 | 5 | recommendation_request | 0.508s |
| M6-Q19 | category_product_analysis | 10 | 8 | risk_diagnosis | 0.626s |
| M6-Q20 | region_analysis | 10 | 4 | region_analysis | 0.337s |
| M6-Q21 | anti_hallucination_field_check | 10 | 2 | anti_hallucination_field_check | 0.006s |
| M6-Q22 | anti_hallucination_field_check | 10 | 2 | anti_hallucination_field_check | 0.006s |
| M6-Q23 | anti_hallucination_field_check | 10 | 2 | anti_hallucination_field_check | 0.006s |
| M6-Q24 | follow_up_drilldown | 9 | 4 | follow_up_drilldown | 0.422s |
| M6-Q25 | follow_up_drilldown | 9 | 4 | follow_up_drilldown | 0.386s |

## 8. Anti-hallucination Results

反胡编测试全部通过：

- M6-Q21：缺少投放成本类字段时，明确不能计算 ROI，并给出渠道销售、退款率和满意度等替代分析方向。
- M6-Q22：缺少会员等级字段时，明确不能按会员等级分析，并给出复购频次或客户分层替代方案。
- M6-Q23：缺少小区、地址、经纬度类字段时，明确不能做细粒度位置分析，并给出地区、省份、城市和城市等级替代方案。

测试同时检查主输出和 `business_report` 不编造不存在字段。

## 9. Memory Follow-up Results

多轮追问测试通过：

- M6-Q24 基于上一轮高风险地区继续看品类，能够读取上一轮 memory summary。
- M6-Q25 基于上一题生成一周整改计划，能够继续复用上一轮关注对象和证据摘要。

memory 内容仅作为后端摘要使用，不进入 `business_report` 主体。

## 10. Provider And Fallback Results

- Mock provider：通过。
- Bad provider fallback：通过，fallback 受控，仍返回 Business Report。
- Doubao 真实 provider smoke：未执行。本地未发现可安全使用的 Doubao / ARK / provider 环境变量名；本轮不要求用户提供密钥，也不写入任何密钥。

## 11. Business Report Structure

压力测试验证默认业务报告结构：

- `executive_summary`
- `key_findings`
- `evidence_summary`
- `risk_priorities`
- `recommendations`
- `next_questions`
- `limitations`

默认隐藏技术细节：

- SQL
- trace
- tool_calls
- provider
- run_id
- memory
- raw JSON

前端 M6.6 既有测试继续验证 Business Report 优先展示、技术细节折叠展示、旧 answer 兼容、Sidebar 和五分页主导航未回归。

## 12. Performance

基于本轮 25 题自动化运行统计：

- 平均耗时：0.620s
- 最慢题：2.831s
- 普通问题：均低于 10s
- 复杂问题：均低于 25s

说明：本轮使用 mock provider 和 deterministic backend tools，不调用真实外部模型。

## 13. Fixes Made During M6.7

压力测试暴露并修复两个必要缺陷：

1. `customer_profile_analysis` 等有证据但无显式风险/机会对象的问题，可能导致 `recommendations` 为空。
   - 修复：在 Business Report 组装层增加保守的 evidence-based fallback recommendation。
   - 影响范围：仅当已有证据且推荐为空时生效，不改业务工具接口，不改变 Agent 编排路线。

2. “哪些指标最需要持续监控？”未进入 business orchestration，导致没有 `business_report`。
   - 修复：在问题分类中补充“指标 / 监控 / 持续监控 / KPI”入口，归入 `business_health_check`。
   - 影响范围：仅扩展既有 M6.5 问题分类覆盖，不新增 M6.8 内容。

## 14. Validation Results

后端：

- `python -c "from backend.main import app; print('backend import OK')"`：通过
- `python -m pytest tests/test_m6_business_capability_pressure.py -q`：7 passed
- `python -m pytest tests/test_m6_langchain_business_agent_orchestration.py -q`：13 passed
- `python -m pytest tests/test_m6_business_analysis_tools.py -q`：17 passed
- `python -m pytest tests/test_m6_business_semantic_layer.py -q`：9 passed
- `python -m pytest tests/test_m6_demo_business_dataset.py -q`：2 passed
- `python -m pytest tests/ -x -q --ignore=tests/ai`：859 passed

前端：

- `npm ci`：通过
- `npx tsc --noEmit`：通过
- `npm run test`：49 files passed, 1177 tests passed
- `npm run build`：通过，有既有 lint warnings，未阻塞构建

CI workflow：

- 已检查 `.github/workflows/ci.yml`。
- Backend job 已覆盖新增 M6.7 测试，因为 workflow 运行 `python -m pytest tests/ -x -q --ignore=tests/ai`。
- 本轮未修改 CI workflow。

## 15. Safety Search

已执行安全扫描。结果：

- 未提交真实凭据。
- 未提交 `.env`。
- 未发现私人学习、面试、简历或包装内容。
- 未生成真实个人信息。
- 扫描中可能出现配置文件或锁文件中的关键词型命中，需要按上下文识别；未发现真实敏感值。

## 16. Remaining Risks

- 本轮压力测试使用 deterministic checks，不使用 AI 评审，因此只能验证结构、证据链、字段兜底和可执行建议的硬性规则。
- Doubao 真实 provider smoke 未执行，需要在后续有安全运行环境时单独验证。
- 部分题目问题类型会被归入更高优先级的 `risk_diagnosis`，但仍能产出合格 Business Report；后续可在 M6.8 评估是否需要更细粒度分类调优。
- 前端 build 仍有既有 lint warnings，未影响本轮 M6.7 通过。

## 17. Recommendation For Next Stage

建议在用户审查 M6.7 分支和 CI 通过后，进入 M6.8 Final QA / Tag Candidate。
