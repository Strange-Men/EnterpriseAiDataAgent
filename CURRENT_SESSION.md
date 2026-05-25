# Current Session — Enterprise AI Data Agent

> Last updated: 2026-05-25

## Current Version

- **Version**: v0.7.0
- **Phase**: v0.7.x AI Analyst Intelligence Layer
- **Status**: Anomaly Detection Engine — 统计异常检测 + LLM 解读 + API 端点 + 前端展示

## Session Goals

1. 异常检测引擎 — 纯 Python 统计检测（z-score/IQR/auto）+ LLM 业务解读
2. 多轮分析连续性 — 增强 follow-up 上下文，结构化会话记忆
3. AI 会话质量 — 自评估增强，误报过滤，质量评分
4. 系统精简清理 — 提取共享逻辑，移除死码，文档更新

## System Health

- Frontend build: PASS
- Backend import: PASS
- Frontend tests: 142/142 PASS
- Backend tests: 24 new (anomaly_detector) + existing PASS
- TypeScript: PASS
- Prompts: 11 registered

## Key Changes (v0.7.0)

### 后端
- `backend/services/anomaly_detector.py`: 新建 — 纯 Python 统计异常检测引擎
  - z-score / IQR / auto 三种检测方法
  - 支持指定列检测或自动检测全部数值列
  - 返回异常列表、摘要、列统计
- `backend/prompts/anomaly_interpretation.py`: 新建 — LLM 异常解读 prompt
  - 评估业务意义、严重性、调查建议
- `backend/prompts/registry.py`: 注册 anomaly_interpretation（10→11 prompts）
- `backend/runtime/token_budget.py`: 新增 anomaly_interpretation 预算（4000/1024）
- `backend/services/ai_analyst.py`: 新增 detect_and_interpret_anomalies() 和流式变体
- `backend/routes/ai.py`: 新增 POST /ai/anomalies 和 POST /ai/anomalies/stream

### 前端
- `types/index.ts`: 新增 AnomalyItem, AnomalyInterpretation, AnomalyResult 类型
- `services/api.ts`: 新增 aiDetectAnomalies() 和 streamAiDetectAnomalies()
- `stores/analysis-store.ts`: AnalysisMode 新增 "anomalies"，AnalysisRun 新增 anomalies 字段
- `panels/ai-analysis-panel.tsx`: 新增 anomalies 模式处理（摘要/详情/解读/建议）
- `panels/sql-workspace-panel.tsx`: 新增异常检测按钮（amber 色）
- `i18n/en.ts` + `zh.ts`: 新增 ~15 个异常检测相关 i18n 键

### 测试
- `tests/test_anomaly_detector.py`: 24 个测试（检测引擎 + 辅助函数）

## Next Steps

- v0.7.1: multi-turn analysis continuity
- v0.7.2: AI session quality improvements
- v0.7.3: system simplification and cleanup
