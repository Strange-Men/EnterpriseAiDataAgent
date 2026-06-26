# M4-8.8.2.y Online UI Bug + LLM Selector Hotfix

## 1. Goal

修复线上人工验收发现的 Home CTA 默认高亮、Analyze 旧结果残留、LLM provider selector 不可见问题，并审计相关 UI / 状态同步 / provider 传递问题。

## 2. User-reported Issues

1. 首页"上传数据"卡片鼠标未 hover 就高亮，看起来像已选中
2. Analyze 页面还没开始新分析就显示旧历史结果
3. LLM provider selector 不可见，用户只能看到默认 mock
4. 可能存在相关状态同步问题

## 3. Root Cause

| 问题 | 根因 |
|------|------|
| 首页上传数据默认高亮 | `page.tsx:68` 中"上传数据"按钮默认使用 `border-[var(--accent)] bg-[var(--accent)]/5`，而"开始分析"使用 neutral border。两个 CTA 默认状态不一致，上传数据看起来已被选中 |
| Analyze 旧结果残留 | `analysis-store` 持久化 `activeRunId` 到 localStorage。`investigation-workspace.tsx:299-312` 存在一个 useEffect 在 mount 时检查 persisted `activeRunId` 并加载旧 run 结果，绕过了 L65 的 `setActiveRun(null)` 清空 |
| LLM selector 不可见 | LLM provider selector 仅存在于 `AnalysisHeader` 组件（分析结果 header 中），Analyze 页面主工作区没有 selector 入口。用户在发起分析前无法看到或切换 provider |
| provider 传递 | 已正确传递。`streamAiAnalyzeMulti` 和 `aiQuery` 均从 workspace store 读取 `llmProvider` 并传给后端，无需修复 |
| fallback notice | streaming `onDone` 回调中 `data.llm` 包含 fallback metadata，但 UI 没有读取和展示 |

## 4. Changes

### 4.1 首页 CTA 默认高亮修复
- **文件**: `frontend-react/src/app/(shell)/page.tsx`
- "上传数据"按钮默认样式从 `border-[var(--accent)] bg-[var(--accent)]/5` 改为 `border-[var(--border-default)] bg-[var(--bg-secondary)]`
- Icon 从 `text-[var(--accent)]` 改为 `text-[var(--text-muted)]`
- 添加 `group-hover` 状态：hover 时 border 变 accent、bg 变 accent/5、icon 变 accent
- 两个 CTA 现在默认状态统一为 neutral，仅 hover/focus 时才有 accent 反馈

### 4.2 Analyze 旧结果残留修复
- **文件**: `frontend-react/src/components/investigation/investigation-workspace.tsx`
- 删除 `useEffect` 中"Load existing run if activeRunId is set from navigation"逻辑（原 L299-312）
- Analyze 页面现在永远只显示当前 session 的 transient 结果
- 历史结果仍可通过 History / Detail 页面访问
- 添加空态引导文案（中/英文）

### 4.3 LLM Provider Selector 添加
- **文件**: `frontend-react/src/components/investigation/investigation-workspace.tsx`
- 在 table selector 和 question input 之间添加 provider selector
- 支持 Mock LLM / DeepSeek / Doubao / Mimo 四个选项
- 默认选中 Mock LLM（来自 workspace store 的持久化值）
- 添加 i18n 文案：`ai.llm-provider-hint`（中/英文）
- Selector 禁用状态跟随 loading

### 4.4 Fallback Notice 显示
- **文件**: `frontend-react/src/components/investigation/investigation-workspace.tsx`
- 添加 `fallbackNotice` state
- 在 streaming `onDone` 回调中检测 `data.llm.fallback_triggered`
- 如触发 fallback，在结果区域上方显示温和黄色提示
- 切换表 / 发起新分析时清空 fallback notice

### 4.5 空态引导
- **文件**: `frontend-react/src/components/investigation/investigation-workspace.tsx`
- 无结果、无 loading、无 error 时显示空态引导
- 中文：等待分析 / 输入你想了解的问题，点击生成分析后，这里会显示本次分析结果。
- 英文：Waiting for analysis / Enter a question and run analysis. Results from the current run will appear here.

### 4.6 i18n 新增
- **文件**: `frontend-react/src/i18n/zh.ts`, `frontend-react/src/i18n/en.ts`
- 新增 key：`ai.llm-provider-hint`, `ai.waiting-title`, `ai.waiting-hint`

## 5. LLM Provider UX

- Selector 位置：Analyze 页面，table selector 下方、question input 上方
- 用户在发起分析前即可看到并切换 provider
- 选择持久化到 localStorage（via workspace store persist）
- 发起分析时自动携带 `llm_provider` 参数
- 真实 provider 不可用时后端 fallback mock，前端显示温和提示
- 不出现 API key 输入框，不暴露 secret

## 6. What Was Not Changed

- 未重新设计前端
- 未改数据库结构
- 未改上传逻辑
- 未改表选择逻辑
- 未改普通表删除逻辑
- 未改 History 数据持久化逻辑
- 未改 Detail 数据逻辑
- 未改 SQL execution 核心逻辑
- 未提交真实 env / secret
- 未恢复禁用实验功能（Templates / Scheduler / Charts / Anomalies / Diff / Timeline）
- 未恢复 /performance、/virtual-table
- 未恢复 Command Palette / Global Search / Keyboard Shortcuts
- 未开始 M5 Agent
- 未打 tag

## 7. Validation

| 检查项 | 结果 |
|--------|------|
| TypeScript (`tsc --noEmit`) | ✅ 通过 |
| Frontend build (`next build`) | ✅ 通过 |
| Frontend tests (vitest) | ✅ 1153 passed |
| Backend import | ✅ 通过 |
| Backend pytest | ✅ 559 passed, 31 skipped |
| Ruff lint | ✅ All checks passed |
| 安全搜索 | ✅ 前端源码无暴露 key |
| .env 提交检查 | ✅ 未提交 .env |

## 8. Remaining Risks

- 真实 provider 仍需部署平台配置 env（DEEPSEEK_API_KEY / DOUBAO_API_KEY / MIMO_API_KEY）
- 如果真实 key 过期或额度耗尽，会自动 fallback mock
- 线上仍需用户手动 smoke provider selector
- 不在本轮打 tag

## 9. Files Changed

| 文件 | 改动 |
|------|------|
| `frontend-react/src/app/(shell)/page.tsx` | CTA 默认样式修复 |
| `frontend-react/src/components/investigation/investigation-workspace.tsx` | 删除旧结果恢复、添加 provider selector、fallback notice、空态 |
| `frontend-react/src/i18n/zh.ts` | 新增 3 个 i18n key |
| `frontend-react/src/i18n/en.ts` | 新增 3 个 i18n key |

## 10. Next Step

通过后重新进行 M4-8.8.2 Online Manual Acceptance。
若通过，进入 M4-8.8.3 Final Release Candidate Report。
暂不进入 M5 Agent。
暂不打 tag。
