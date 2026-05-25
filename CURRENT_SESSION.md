# Current Session — Enterprise AI Data Agent

> Last updated: 2026-05-25

## Current Version

- **Version**: v0.7.2
- **Phase**: v0.7.x AI Analyst Intelligence Layer
- **Status**: AI Session Quality Layer — 异常精度评分 + 洞察证据评分 + 自评估接入 + 质量门控

## Session Goals

1. ~~多轮分析连续性~~ — v0.7.1 完成
2. AI 会话质量 — 异常误报过滤、洞察证据评分、自评估可视化、质量门控
3. 系统精简清理 — 提取共享逻辑，移除死码，文档更新

## System Health

- Frontend build: PASS
- Backend import: PASS
- Frontend tests: 160/160 PASS
- Backend tests: 311/312 PASS (1 pre-existing: test_query_history state)
- TypeScript: PASS
- Prompts: 11 registered

## Key Changes (v0.7.2)

### 后端
- `backend/services/anomaly_detector.py`: _detect_numeric_columns() 多行扫描修复
- `backend/services/anomaly_detector.py`: detect_anomalies() 新增 min_deviation_score + adaptive + precision_score + cap 50
- `backend/services/anomaly_detector.py`: 新增 _apply_adaptive_threshold() P25 自适应过滤
- `backend/services/ai_analyst.py`: 新增 _score_and_filter_insights() 洞察证据评分
- `backend/services/ai_analyst.py`: 新增 _filter_trends() 趋势过滤
- `backend/services/ai_analyst.py`: generate_insights() 集成评分/过滤/排序
- `backend/services/ai_analyst.py`: 新增 evaluate_analysis() 自评估服务函数
- `backend/services/ai_analyst.py`: 新增 _apply_quality_gates() 质量门控
- `backend/routes/ai.py`: AnomalyDetectRequest 新增 min_deviation_score + adaptive
- `backend/routes/ai.py`: ai_evaluate 重构为委托到 evaluate_analysis()
- `backend/runtime/token_budget.py`: 新增 self_evaluation 预算
- `backend/prompts/self_evaluation.py`: 空 sections 保护 + trace 包含
- `backend/prompts/anomaly_interpretation.py`: 增加 precision_score 引导

### 前端
- `services/api.ts`: EvaluationResult 新增 quality_gates 字段
- `services/api.ts`: aiInsights 返回类型新增 evidence_score + filtered_insights_count
- `stores/analysis-store.ts`: updateRun 类型新增 evaluation
- `panels/ai-analysis-panel.tsx`: insights 低置信度标签 + filtered_insights_count 提示
- `panels/ai-analysis-panel.tsx`: 新增 evaluation 状态 + aiEvaluate() 自动调用
- `panels/ai-analysis-panel.tsx`: 质量评估面板（置信度条/维度标签/警告/诊断/改进）
- i18n: 新增 11 个键 (low-confidence, evidence-score, insights-filtered, quality-assessment, confidence-score, completeness, accuracy, actionability, diagnostics, improvements, quality-warnings)

### 测试
- `tests/test_anomaly_detector.py`: 31 tests (+7 new: 多行扫描、min_deviation、adaptive、precision_score、cap、排序)
- `tests/test_self_evaluation.py`: 8 tests (全部 PASS)
- `tests/test_token_budget.py`: 21 tests (全部 PASS)

## Next Steps

- v0.7.3: system simplification and cleanup
