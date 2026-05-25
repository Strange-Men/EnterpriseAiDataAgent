# Current Session — Enterprise AI Data Agent

> Last updated: 2026-05-25

## Current Version

- **Version**: v0.7.1
- **Phase**: v0.7.x AI Analyst Intelligence Layer
- **Status**: Multi-Turn Analysis Continuity — 增强上下文传递 + 结构化压缩 + drill-down 流 + key findings 积累

## Session Goals

1. 多轮分析连续性 — 增强 follow-up 上下文，结构化会话记忆
2. AI 会话质量 — 自评估增强，误报过滤，质量评分
3. 系统精简清理 — 提取共享逻辑，移除死码，文档更新

## System Health

- Frontend build: PASS
- Backend import: PASS
- Frontend tests: 160/160 PASS
- Backend tests: 149/149 PASS (core) + 26 PASS (AI endpoints/pipeline)
- TypeScript: PASS
- Prompts: 11 registered

## Key Changes (v0.7.1)

### 后端
- `backend/routes/ai.py`: FollowUpContext 新增 prior_key_findings + investigation_summary 字段
- `backend/routes/ai.py`: InsightsRequest 新增 prior_context 字段
- `backend/routes/ai.py`: AnalysisPlanRequest 新增 prior_findings 字段
- `backend/routes/ai.py`: MultiAnalyzeRequest 新增 prior_findings 字段
- `backend/services/ai_analyst.py`: build_follow_up_context() 增强 — 支持 prior_key_findings 编号列表 + investigation_summary + 智能截断
- `backend/services/ai_analyst.py`: generate_insights() / generate_insights_stream() 新增 prior_context 参数
- `backend/services/ai_analyst.py`: generate_analysis_plan() 新增 prior_findings 参数
- `backend/prompts/insights.py`: 新增 prior_context optional var，system prompt 增加 prior context 引导
- `backend/prompts/analysis_plan.py`: 新增 prior_findings optional var，system prompt 增加 prior findings 引导
- `backend/runtime/token_budget.py`: insights max_history_turns 0→4
- `backend/services/ai_pipeline.py`: run_autonomous_analysis/stream 新增 prior_findings 透传

### 前端
- `stores/ai-session-store.ts`: 结构化压缩（120 字符问题 + 完整 SQL + 首句提取）
- `stores/ai-session-store.ts`: 新增 keyFindings[] + investigationSummary + addKeyFinding + setInvestigationSummary
- `stores/ai-session-store.ts`: 新增 getContextForInsights() / getContextForPlan() 上下文助手
- `stores/analysis-store.ts`: AnalysisRun 新增 drillDownFrom 字段 + drillDownRun() 方法
- `services/api.ts`: FollowUpContext 新增 prior_key_findings + investigation_summary
- `services/api.ts`: aiInsights() 新增 priorContext 参数
- `services/api.ts`: streamAiInsights() 新增 priorContext 参数
- `services/api.ts`: streamAiAnalyzeMulti() 新增 priorFindings 参数
- `panels/ai-analysis-panel.tsx`: 自动积累 key findings（explain/insights/anomalies/full-analysis）
- `panels/ai-analysis-panel.tsx`: insights 模式传递 priorContext
- `panels/ai-analysis-panel.tsx`: autonomous 模式传递 priorFindings
- `panels/ai-analysis-panel.tsx`: drill-down 按钮（高严重性洞察）
- `components/ai/follow-up-input.tsx`: FollowUpContext 富化（keyFindings + investigationSummary）
- i18n: 新增 4 个键 (drill-down, drill-down-hint, prior-context, key-findings)

### 测试
- `tests/test_follow_up_context.py`: 12 个测试（向后兼容、findings 渲染、截断、token 预算等）
- `stores/__tests__/ai-session-store.test.ts`: 更新 + 新增 keyFindings/investigation/compression 测试
- `stores/__tests__/analysis-store.test.ts`: 新增 drillDownRun 测试

## Next Steps

- v0.7.2: AI session quality improvements
- v0.7.3: system simplification and cleanup
