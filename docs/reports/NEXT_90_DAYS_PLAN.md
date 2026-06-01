# NEXT 90 DAYS PLAN — Enterprise AI Data Agent

> 规划日期：2026-06-01
> 规划版本：v0.8.3 → v1.0
> 原则：**ROI优先、避免膨胀、shipping > purity**

---

## 核心原则

1. **只做用户能感知到的事情**——架构重构、审计报告、状态争论全部停止
2. **每天结束时产品都比昨天更可用**——不允许"中间状态"持续超过1天
3. **删除比添加更有价值**——每加一个功能必须删一个等量的东西
4. **3个空壳页面是最紧急的事**——比任何AI功能都紧急

---

## Phase 1：产品急救（第1-2周）— 目标：产品"看起来做完"

### 优先级排序（按ROI从高到低）

| # | 任务 | 时间 | ROI | 说明 |
|---|------|------|-----|------|
| 1 | **填充 /data 页面** | 4h | ★★★★★ | 复用现有file-upload-panel + table-management-panel，加上传入口 |
| 2 | **填充 /query 页面** | 3h | ★★★★★ | 复用现有sql-workspace-panel，独立SQL编辑体验 |
| 3 | **填充 /history 页面** | 3h | ★★★★★ | 复用现有sql-history-panel，独立历史查看 |
| 4 | **修复Onboarding CTA** | 30min | ★★★★★ | 指向正确页面，而不是dead link |
| 5 | **添加"试用样本数据"按钮** | 2h | ★★★★☆ | 新用户5秒体验核心价值 |
| 6 | **修复错误静默吞没** | 2h | ★★★★☆ | 4个组件加toast/error反馈 |
| 7 | **Mode selector tooltips** | 30min | ★★★☆☆ | 低投入，提升可发现性 |

**Phase 1 总投入：约15小时（2个工作日）**
**Phase 1 产出：产品完成度 5→7，面试时不再有"没做完"的感觉**

---

## Phase 2：可交付性（第3-4周）— 目标：任何人5分钟跑起来

| # | 任务 | 时间 | ROI | 说明 |
|---|------|------|-----|------|
| 1 | **Dockerfile + docker-compose** | 4h | ★★★★★ | "能跑起来"和"不能跑起来"的分界线 |
| 2 | **README快速开始指南** | 2h | ★★★★★ | 3步跑起来：clone → env → docker-compose up |
| 3 | **样本数据集** | 2h | ★★★★☆ | 准备2-3个有趣的真实数据集（电商/人口/金融） |
| 4 | **前端CI（GitHub Actions）** | 3h | ★★★★☆ | build + test + lint，每次push自动跑 |
| 5 | **后端CI（GitHub Actions）** | 2h | ★★★★☆ | pytest + import check，每次push自动跑 |
| 6 | **删除legacy workspace** | 2h | ★★★☆☆ | 移除workspace-legacy/page.tsx + 相关panels |
| 7 | **清理docs/散落文件** | 1h | ★★★☆☆ | 归档16个违反FILE_SYSTEM_RULES.md的文件 |

**Phase 2 总投入：约16小时（2个工作日）**
**Phase 2 产出：可部署、可展示、可fork**

---

## Phase 3：质量补全（第5-6周）— 目标：面试时能说"500+测试"

| # | 任务 | 时间 | ROI | 说明 |
|---|------|------|-----|------|
| 1 | **ai_analyst.py 核心函数测试** | 6h | ★★★★★ | mock LLM response，覆盖sql_gen/explain/insights/chart |
| 2 | **ai_pipeline.py 流程测试** | 4h | ★★★★☆ | mock整个NL→SQL→Execute→Explain流程 |
| 3 | **组件测试（核心5个）** | 6h | ★★★★☆ | investigation-workspace, question-input, streaming-output, sql-editor, data-preview |
| 4 | **SSE streaming测试** | 3h | ★★★☆☆ | mock SSE事件流，验证前端解析 |
| 5 | **错误传播链测试** | 2h | ★★★☆☆ | 验证后端错误→前端toast的完整链路 |
| 6 | **修复DuckDB测试隔离** | 2h | ★★☆☆☆ | ISSUE-014，每个测试用独立DB |

**Phase 3 总投入：约23小时（3个工作日）**
**Phase 3 产出：测试覆盖从160→400+，核心AI逻辑有保护**

---

## Phase 4：产品打磨（第7-8周）— 目标：用户体验顺滑

| # | 任务 | 时间 | ROI | 说明 |
|---|------|------|-----|------|
| 1 | **统一导航体验** | 4h | ★★★★☆ | 去掉shell vs legacy的分裂感，统一侧边栏 |
| 2 | **Upload集成到/data** | 3h | ★★★★☆ | 不再需要去legacy workspace上传 |
| 3 | **分析结果可分享** | 3h | ★★★☆☆ | 基于已有的bundle功能，加share link |
| 4 | **Monaco Editor懒加载** | 2h | ★★★☆☆ | ISSUE-001，首屏加载减2MB |
| 5 | **Dark mode完善** | 2h | ★★☆☆☆ | Design System V2已有tokens，补完切换逻辑 |
| 6 | **响应式断点优化** | 2h | ★★☆☆☆ | 1280px以下体验优化 |

**Phase 4 总投入：约16小时（2个工作日）**
**Phase 4 产出：产品体验从"能用"到"好用"**

---

## Phase 5：v1.0 准备（第9-12周）— 目标：可以写在简历上

| # | 任务 | 时间 | ROI | 说明 |
|---|------|------|-----|------|
| 1 | **版本记录更新** | 2h | ★★★★☆ | 补全v0.8.x所有版本记录 |
| 2 | **README完善** | 3h | ★★★★☆ | 加截图、功能列表、技术架构图 |
| 3 | **性能基准测试** | 4h | ★★★☆☆ | 大数据集（100K行）性能报告 |
| 4 | **安全性审计** | 3h | ★★★☆☆ | SQL注入防护、XSS防护、CORS配置 |
| 5 | **部署文档** | 2h | ★★★☆☆ | VPS/Railway/Fly.io 部署指南 |
| 6 | **Demo视频脚本** | 2h | ★★★☆☆ | 3分钟产品演示 |

**Phase 5 总投入：约16小时（2个工作日）**
**Phase 5 产出：v1.0 release，简历可写**

---

## 不应该做的事情（Postpone until v2.0）

| 事项 | 原因 |
|------|------|
| 多用户/认证系统 | portfolio项目不需要 |
| PostgreSQL迁移 | 除非确定要部署多用户 |
| LangGraph/多Agent | CLAUDE.md已禁止，且ROI低 |
| 移动端适配 | 桌面端数据工具不需要 |
| 插件系统 | 过度设计 |
| A/B测试框架 | 还没到那个阶段 |
| 更多的审计报告 | 已经审计6次，够了 |
| 更多的架构重构 | v0.8.0-0.8.3已经足够好 |
| 复杂的权限系统 | 过度工程 |
| 国际化第三语言 | 中英文足够 |

---

## 应该删除的东西

| 文件/功能 | 原因 |
|-----------|------|
| `workspace-legacy/page.tsx` | 两套布局并存是最大的产品混乱来源 |
| legacy workspace相关的panels（如果已被shell替代） | 减少维护负担 |
| `docs/` 下16个散落文件 | 违反自己的FILE_SYSTEM_RULES.md |
| `P4_RECHECK.md`, `PHASE4_READINESS.md` (root) | 完成后归档到docs/reports/ |
| `SESSION_SUMMARY_TEMPLATE.md` (root) | 移到docs/governance/ |
| 4个已废弃的store包装器 | v0.8.3已删除 ✓ |
| `virtual-table/page.tsx` | demo页面，不属于产品 |
| `performance/page.tsx` | 开发工具，移到/dev路由或删除 |

---

## 应该合并的东西

| 合并项 | 说明 |
|--------|------|
| `routes/ai.py` (552行) → 3个子路由 | ai-query, ai-insights, ai-management |
| `ai_analyst.py` (1020行) → 3个service | sql-gen, analysis, evaluation |
| 9个Zustand stores → 5个 | investigation, sql, data, ui, history（合并saved-queries到history） |
| 14个investigation components → 按功能分组 | 3-4个目录而非全部平铺 |

---

## 90天时间线总览

```
Week 1-2:   Phase 1 - 产品急救（填充空壳页面、修复onboarding）
Week 3-4:   Phase 2 - 可交付性（Docker、CI、清理）
Week 5-6:   Phase 3 - 质量补全（AI核心测试、组件测试）
Week 7-8:   Phase 4 - 产品打磨（统一导航、上传集成）
Week 9-12:  Phase 5 - v1.0准备（文档、部署、demo）
```

**总投入：约86小时（约11个工作日）**
**总产出：从"半成品"到"可写在简历上的v1.0"**

---

## 关键里程碑

| 日期 | 里程碑 | 验收标准 |
|------|--------|---------|
| Week 2 末 | "看起来做完" | 无空壳页面，onboarding通畅 |
| Week 4 末 | "能跑起来" | docker-compose up 5分钟出结果 |
| Week 6 末 | "有质量保证" | 400+测试，核心AI逻辑有覆盖 |
| Week 8 末 | "好用" | 统一导航，上传/查询/历史一体化 |
| Week 12 末 | "v1.0" | README完整，可部署，有demo |

---

## 一句话总结

> **停止审计，开始交付。**
> 最紧急的事不是架构重构，而是把3个空壳页面填上、写个Dockerfile、给ai_analyst.py加测试。
