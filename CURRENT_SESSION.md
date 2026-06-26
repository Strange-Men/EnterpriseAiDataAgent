# Current Session — Enterprise AI Data Agent

> Last updated: 2026-06-26

## Current Version

- **Version**: v1.4.0-m4-uiux-llm-fallback (M4 Final RC)
- **Phase**: M4 UI/UX + LLM Fallback — CLOSED
- **Tag**: `v1.4.0-m4-uiux-llm-fallback`
- **Status**: M4 封板完成

## M4 Status

M4 is closed as a frontend UI/UX + LLM fallback release candidate.

Closed scope:
- Home / Data / Analyze / History / Detail / Settings polish
- LLM provider selector (Mock / DeepSeek / Doubao / Mimo)
- Mock fallback when real provider unavailable
- Online smoke hotfixes (7 user-reported issues fixed)
- Final regression tests (559 backend, 1171 frontend)

RC Report: `docs/reports/m4-final-release-candidate-report.md`

## Next Stage

**M4.9 Engineering Completeness**

已完成：
- M4.9.0 Engineering Completeness Audit
- M4.9.1 Merge + Validation
- M4.9.2 Docker Compose Local Demo — merged to master
- M4.9.3 README / README.en Rewrite — merged to master

范围：
- Dockerfile / docker-compose
- README / README.en
- env.example 最终整理
- 本地一键启动说明
- Render / Vercel 部署说明
- 项目边界说明
- Demo 数据说明
- 不做新 Agent 功能
