# .agents 配置文件聚合

> 生成时间: 2026-05-06 12:18:22
> 源目录: d:/work-project/learn/.agents

## 目录结构

```
README.md
agents/README.md
agents/api-designer.md
agents/code-reviewer.md
agents/frontend-dev.md
agents/spec-analyst.md
handbook/README.md
handbook/ai-engineering/README.md
handbook/ai-engineering/agents-platform-integration.md
handbook/ai-engineering/ai-engineering.md
handbook/ai-engineering/composite-engineering-practices.md
handbook/ai-engineering/developer-ai-capability-levels.md
handbook/ai-engineering/how-to-write-rules.md
handbook/ai-engineering/how-to-write-skills.md
handbook/ai-engineering/mastergo-mcp-usage.md
handbook/ai-engineering/mcp-implementation-guide.md
handbook/ai-engineering/rules-vs-skills-guide.md
handbook/ai-engineering/skill-rule-creation-checklist.md
handbook/skills/README.md
handbook/skills/skill-doc-template.md
mcp/README.md
mcp/mcp.json
rules/README.md
rules/project-rules/01-project-overview.mdc
rules/project-rules/02-coding-style.mdc
rules/project-rules/03-project-structure.mdc
rules/project-rules/04-component-guide.mdc
rules/project-rules/05-api-guide.mdc
rules/project-rules/06-routing-guide.mdc
rules/project-rules/07-state-management.mdc
rules/project-rules/08-common-constraints.mdc
rules/project-rules/09-styling-guide.mdc
rules/project-rules/10-documentation.mdc
rules/project-rules/11-testing-guide.mdc
rules/project-rules/12-skill-doc-sync.mdc
rules/project-rules/README.md
rules/project-rules/skill-project-tasks.mdc
rules/shared-rules/README.md
rules/shared-rules/language-chinese.mdc
skills/README.md
skills/project-skills/README.md
skills/project-skills/complex-task-runbook/SKILL.md
skills/project-skills/create-api/SKILL.md
skills/project-skills/create-component/SKILL.md
skills/project-skills/create-route/SKILL.md
skills/project-skills/create-store/SKILL.md
skills/project-skills/create-vue-app/SKILL.md
skills/shared-skills/README.md
skills/shared-skills/canvas-design/.openskills.json
skills/shared-skills/canvas-design/LICENSE.txt
skills/shared-skills/canvas-design/SKILL.md
skills/shared-skills/canvas-design/canvas-fonts/ArsenalSC-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/ArsenalSC-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/BigShoulders-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/BigShoulders-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/BigShoulders-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Boldonse-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Boldonse-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/BricolageGrotesque-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/BricolageGrotesque-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/BricolageGrotesque-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/CrimsonPro-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/CrimsonPro-Italic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/CrimsonPro-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/CrimsonPro-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/DMMono-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/DMMono-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/EricaOne-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/EricaOne-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/GeistMono-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/GeistMono-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/GeistMono-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Gloock-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Gloock-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexMono-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexMono-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexMono-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexSerif-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexSerif-BoldItalic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexSerif-Italic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/IBMPlexSerif-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-BoldItalic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-Italic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSerif-Italic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/InstrumentSerif-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Italiana-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Italiana-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/JetBrainsMono-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/JetBrainsMono-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Jura-Light.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Jura-Medium.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Jura-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/LibreBaskerville-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/LibreBaskerville-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Lora-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Lora-BoldItalic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Lora-Italic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Lora-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Lora-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/NationalPark-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/NationalPark-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/NationalPark-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/NothingYouCouldDo-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/NothingYouCouldDo-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Outfit-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Outfit-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Outfit-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/PixelifySans-Medium.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/PixelifySans-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/PoiretOne-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/PoiretOne-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/RedHatMono-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/RedHatMono-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/RedHatMono-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Silkscreen-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Silkscreen-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/SmoochSans-Medium.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/SmoochSans-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Tektur-Medium.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/Tektur-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/Tektur-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/WorkSans-Bold.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/WorkSans-BoldItalic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/WorkSans-Italic.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/WorkSans-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/WorkSans-Regular.ttf (binary, skipped)
skills/shared-skills/canvas-design/canvas-fonts/YoungSerif-OFL.txt
skills/shared-skills/canvas-design/canvas-fonts/YoungSerif-Regular.ttf (binary, skipped)
skills/shared-skills/document-to-pptx/SKILL.md
skills/shared-skills/document-to-pptx/reference.md
skills/shared-skills/document-to-pptx/scripts/doc_to_pptx.py
skills/shared-skills/frontend-code-review/SKILL.md
skills/shared-skills/frontend-code-review/references/composition-api.md
skills/shared-skills/frontend-code-review/references/performance.md
skills/shared-skills/frontend-code-review/references/pinia.md
skills/shared-skills/frontend-code-review/references/security-a11y.md
skills/shared-skills/frontend-code-review/references/security.md
skills/shared-skills/frontend-code-review/references/typescript.md
skills/shared-skills/frontend-code-review/references/vue-component.md
skills/shared-skills/frontend-code-review/references/vue-core.md
skills/shared-skills/frontend-code-review/references/vue-router.md
skills/shared-skills/frontend-design/.openskills.json
skills/shared-skills/frontend-design/LICENSE.txt
skills/shared-skills/frontend-design/SKILL.md
skills/shared-skills/git-commit-helper/SKILL.md
skills/shared-skills/gitlab-mr-create/SKILL.md
skills/shared-skills/gitlab-mr-create/scripts/.env.example
skills/shared-skills/gitlab-mr-create/scripts/.gitignore
skills/shared-skills/gitlab-mr-create/scripts/create_merge_request.py
skills/shared-skills/mastergo-design-restore/SKILL.md
skills/shared-skills/mcp-builder/.openskills.json
skills/shared-skills/mcp-builder/LICENSE.txt
skills/shared-skills/mcp-builder/SKILL.md
skills/shared-skills/mcp-builder/reference/evaluation.md
skills/shared-skills/mcp-builder/reference/mcp_best_practices.md
skills/shared-skills/mcp-builder/reference/node_mcp_server.md
skills/shared-skills/mcp-builder/reference/python_mcp_server.md
skills/shared-skills/mcp-builder/scripts/connections.py
skills/shared-skills/mcp-builder/scripts/evaluation.py
skills/shared-skills/mcp-builder/scripts/example_evaluation.xml
skills/shared-skills/mcp-builder/scripts/requirements.txt
skills/shared-skills/rule-creator/SKILL.md
skills/shared-skills/senior-prompt-engineer/SKILL.md
skills/shared-skills/skill-creator/.openskills.json
skills/shared-skills/skill-creator/LICENSE.txt
skills/shared-skills/skill-creator/SKILL.md
skills/shared-skills/skill-creator/references/output-patterns.md
skills/shared-skills/skill-creator/references/workflows.md
skills/shared-skills/skill-creator/scripts/init_skill.py
skills/shared-skills/skill-creator/scripts/package_skill.py
skills/shared-skills/skill-creator/scripts/quick_validate.py
skills/shared-skills/skill-doc-generator/SKILL.md
skills/shared-skills/skill-doc-generator/reference.md
skills/shared-skills/smart-commit/SKILL.md
templates/PRD-runbook.md
```

---

## README.md

`README.md`

```markdown
# .agents — 规范与技能统一目录（唯一起源）

本目录为 **Rules、Skills 与 MCP 配置的唯一维护源**，与具体 IDE/平台解耦。Cursor、Claude 等通过各自目录下的**符号链接**引用本目录，实现「一处维护、多端识别」。

## 目录说明

| 目录 | 说明 |
|------|------|
| `rules/project-rules/` | 项目级规则（01–11 .mdc），仅本仓 apps 开发 |
| `rules/shared-rules/` | 共享级规则（.mdc 等） |
| `skills/project-skills/` | 与规则配套的**项目技能**：create-api、create-component、create-route、create-store |
| `skills/shared-skills/` | **公共技能**（设计、MCP、提交、审查、文档转 PPT 等） |
| `mcp/` | **MCP 配置**（mcp.json）；不含敏感信息，Cursor/Claude 通过链接引用 |

## 多平台接入（符号链接）

`.cursor` 与 `.claude` 下**不存在实现，只保留映射路径**；规则、技能与 MCP 配置均来自本目录。

| 平台 | 本仓路径 | 链接目标 |
|------|----------|----------|
| **Cursor** | `.cursor/rules` | → `.agents/rules` |
| **Cursor** | `.cursor/skills` | → `.agents/skills` |
| **Cursor** | `.cursor/mcp.json` | → `.agents/mcp/mcp.json` |
| **Claude** | `.claude/rules` | → `.agents/rules` |
| **Claude** | `.claude/skills` | → `.agents/skills` |
| **Claude** | `.claude/mcp.json` | → `.agents/mcp/mcp.json` |

新增平台时：在对应平台目录下建立指向 `.agents` 内相应子目录的符号链接，并在 **.agents/handbook/ai-engineering/agents-platform-integration.md** 中登记。详见该文档。

## 项目结构（本仓）

```
项目根/
├── .agents/              # 规范、技能与 MCP 配置唯一起源
│   ├── rules/            # project-rules/（项目级）+ shared-rules/（共享级）
│   ├── skills/
│   │   ├── project-skills/
│   │   └── shared-skills/
│   └── mcp/              # MCP 配置（mcp.json）
├── .cursor/              # 仅映射路径：rules、skills、mcp.json → .agents 对应项
├── .claude/              # 仅映射路径：rules、skills、mcp.json → .agents 对应项
├── apps/               # 应用
│   ├── app-admin/
│   ├── app-ai-copilot/
│   ├── app-membership-system/
│   └── app-version/
├── packages/           # 共享包
│   └── sdk/
│       ├── speediance-request/
│       └── speediance-i18n/
├── handbook/           # AI 流程说明文档（原 docs 依赖已收敛至此）
└── templates/          # AI 流程模板
```

## 使用说明

1. **规则**：按需查阅 `rules/README.md` 索引，或根据任务类型打开对应编号的规则文件。
2. **项目技能**：在创建组件、路由、Store、API 等场景下，使用 `skills/project-skills/` 下对应技能（见 `skills/project-skills/README.md`）。
3. 技能编写方法见 **.agents/handbook/ai-engineering/how-to-write-skills.md**；**AI 工程化总览** 见 **.agents/handbook/ai-engineering/ai-engineering.md**；**多平台接入说明** 见 **.agents/handbook/ai-engineering/agents-platform-integration.md**。

```

---

## agents/README.md

`agents/README.md`

```markdown
# .agents/agents — 子 Agent 目录

本目录为 **子 Agent 定义唯一起源**，与 `.agents/rules/`、`.agents/skills/` 并列，供 Claude Code 等平台通过子 Agent 分工协作，突破单次上下文窗口限制。

`.claude/agents/` 通过符号链接指向本目录，不在各平台目录内复制内容（与 rules/skills 的唯一源原则一致）。

---

## 子 Agent 列表

| Agent 文件 | 职责 | 对应 Skill |
|---|---|---|
| [spec-analyst.md](spec-analyst.md) | 需求拆解、考古现有代码、产出任务清单 | — |
| [api-designer.md](api-designer.md) | 接口设计、封装函数、类型定义 | create-api |
| [frontend-dev.md](frontend-dev.md) | Vue 3 组件/页面实现、路由注册、样式 | create-component、create-route |
| [code-reviewer.md](code-reviewer.md) | 增量 CR、规范检查、生成提交信息 | frontend-code-review、smart-commit |

---

## 设计原则

每个子 Agent 遵循「高信号、职责边界清晰」的设计：

- **职责单一**：每个 Agent 只做一类事，不跨界做决策
- **引用规则**：在 Agent 定义中显式引用需要遵守的 Rules，不复制规范正文
- **完成标准**：每个 Agent 明确「做完」的定义，减少歧义
- **按需加载**：description 描述清晰，让 Claude 能准确判断何时启用

---

## 使用方式

在 Claude Code 中，复杂任务可按以下分工依次调用：

1. `spec-analyst`：先读代码、拆解任务、产出任务清单
2. `api-designer`：按清单设计接口封装
3. `frontend-dev`：按清单实现 UI 与路由
4. `code-reviewer`：审查全部改动、生成提交信息

---

## 相关文档

- [.agents/handbook/ai-engineering/composite-engineering-practices.md](../handbook/ai-engineering/composite-engineering-practices.md) — 复合工程实践方案（含本目录设计背景）
- [.agents/handbook/ai-engineering/agents-platform-integration.md](../handbook/ai-engineering/agents-platform-integration.md) — 多平台接入说明
- [AGENTS.md](../../AGENTS.md) — AI 使用入口与技能登记

```

---

## agents/api-designer.md

`agents/api-designer.md`

```markdown
---
name: api-designer
description: 接口封装专家。负责按项目规范设计和编写 HTTP 接口封装函数与类型定义。在需要新增或修改 API 模块时使用。
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

# api-designer — 接口设计与封装

## 职责边界

- **只做**：接口函数封装、类型定义、模块目录组织
- **不做**：UI 实现、路由注册、Store 设计（除非明确要求）
- 接口类型从需求或已有 `types.ts` 读取，**不自行假设**后端字段

## 必须遵守的规则

- [`.agents/rules/project-rules/05-api-guide.mdc`](../rules/project-rules/05-api-guide.mdc)
- [`.agents/rules/project-rules/02-coding-style.mdc`](../rules/project-rules/02-coding-style.mdc)

## 执行步骤

参考 `.agents/skills/project-skills/create-api/SKILL.md` 中的完整步骤执行。

关键约定：

1. 按业务模块放置：`src/api/modules/<模块名>/<资源>.ts`
2. 函数命名：`getXxxList`、`getXxxPage`、`getXxxDetail`、`createXxx`、`updateXxx`、`deleteXxx`
3. 类型定义放在同模块 `types.ts` 或对应 `views/.../types.ts`
4. 使用项目现有 `http` 封装实例，不引入新的请求库

## 完成标准（缺一不可）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error
- [ ] 无裸 `any` 类型
- [ ] 函数命名符合 `05-api-guide` 规范
- [ ] 接口错误由拦截器统一处理，无重复 `message.error`
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

```

---

## agents/code-reviewer.md

`agents/code-reviewer.md`

```markdown
---
name: code-reviewer
description: 代码审查与提交专家。负责对本次改动的 Vue/TS 文件进行增量代码审查，检查规范符合度，并生成符合 Conventional Commits 的提交信息。在准备提交代码前使用。
tools: Read, Glob, Grep, Bash
model: sonnet
---

# code-reviewer — 增量代码审查与提交

## 职责边界

- **只做**：审查已改动文件、生成提交信息、运行 lint/type-check
- **不做**：重写业务逻辑、修改接口设计；发现问题时**列出清单**并等待确认，而非直接大范围修改

## 执行步骤

### Step 1：获取改动范围

```bash
git diff --name-only HEAD   # 查看改动文件列表
git status                  # 查看暂存区状态
```

### Step 2：增量审查

对每个 `.vue` / `.ts` 文件，检查：

**规范符合度**（参考 `.agents/rules/project-rules/`）：
- [ ] 是否使用 `<script setup lang="ts">`（02-coding-style）
- [ ] 命名是否符合规范（文件夹 kebab-case，组件 PascalCase，函数 camelCase）
- [ ] 样式是否 scoped，是否无魔数硬编码（09-styling-guide）
- [ ] 接口函数命名是否符合约定（05-api-guide）
- [ ] Store 是否符合 `useXxxStore` 命名（07-state-management）

**质量检查**：
- [ ] 是否有裸 `any` 类型（需注释说明）
- [ ] 是否有重复的 `message.error`（应由拦截器统一处理）
- [ ] 注释是否使用中文

### Step 3：运行质量门禁

```bash
pnpm type-check   # TypeScript 类型检查
pnpm lint         # ESLint 检查
```

### Step 4：生成提交信息

参考 `.agents/skills/shared-skills/smart-commit/SKILL.md` 的步骤生成符合 Conventional Commits 的中文提交信息。

格式：`<type>(<scope>): <中文描述>`

常用 type：`feat`、`fix`、`refactor`、`docs`、`style`、`chore`

## 完成标准

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error
- [ ] 审查清单逐项检查完毕，问题已列出或修复
- [ ] 提交信息符合 Conventional Commits 且语义清晰

```

---

## agents/frontend-dev.md

`agents/frontend-dev.md`

```markdown
---
name: frontend-dev
description: 前端组件与页面实现专家。负责 Vue 3 组件开发、页面搭建、路由注册与样式落地。在需要创建或修改 Vue 组件、页面、路由时使用。
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

# frontend-dev — 前端组件与页面实现

## 职责边界

- **只做**：Vue 3 组件实现、页面搭建、路由注册、样式
- **不做**：接口设计决策；接口类型从已有 `types.ts` 读取，**不自行创造**
- 如发现类型缺失，停下并告知用户，而非自行假设

## 必须遵守的规则

- [`.agents/rules/project-rules/02-coding-style.mdc`](../rules/project-rules/02-coding-style.mdc) — TS 与命名规范
- [`.agents/rules/project-rules/03-project-structure.mdc`](../rules/project-rules/03-project-structure.mdc) — 目录结构
- [`.agents/rules/project-rules/04-component-guide.mdc`](../rules/project-rules/04-component-guide.mdc) — 组件规范
- [`.agents/rules/project-rules/06-routing-guide.mdc`](../rules/project-rules/06-routing-guide.mdc) — 路由规范
- [`.agents/rules/project-rules/09-styling-guide.mdc`](../rules/project-rules/09-styling-guide.mdc) — 样式规范

## 执行步骤

参考以下技能中的完整步骤执行：

- `.agents/skills/project-skills/create-component/SKILL.md`
- `.agents/skills/project-skills/create-route/SKILL.md`

## 完成标准（缺一不可）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error
- [ ] 无裸 `any` 类型（有 `// eslint-disable` 注释说明的除外）
- [ ] 组件使用 `<script setup lang="ts">`，Props/Emits 有类型定义
- [ ] 样式使用 `<style scoped lang="scss">`，无魔数硬编码，使用项目 CSS 变量
- [ ] 路由组件使用懒加载（`() => import('@/views/...')`）
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

```

---

## agents/spec-analyst.md

`agents/spec-analyst.md`

```markdown
---
name: spec-analyst
description: 需求分析与代码考古专家。在复杂任务启动前，负责读取现有代码结构、拆解任务边界、产出可执行任务清单。只做读取与分析，不写业务代码。
tools: Read, Glob, Grep
model: sonnet
---

# spec-analyst — 需求分析与任务拆解

## 职责边界

- **只做**：读取现有代码、分析模块结构、拆解任务、产出任务清单
- **不做**：编写业务代码、修改任何文件、做接口设计或 UI 实现决策

## 任务前必读

- [AGENTS.md](../../AGENTS.md) — 了解本仓规范来源与技能体系
- [.agents/handbook/ai-engineering/ai-engineering.md](../handbook/ai-engineering/ai-engineering.md) — 协作流程

## 工作步骤

### Step 1：考古（上下文先行）

1. 读相关路由模块（`src/router/modules/`），确认已有页面结构
2. 搜索相关 API 模块（`src/api/modules/`），了解现有接口命名与类型
3. 读相关 Store（`src/stores/`），了解已有状态结构
4. 读需求涉及的现有视图（`src/views/`），了解组件层级

### Step 2：识别依赖与未确认项

- 列出「已确认」的设计决策（接口已有 / 类型已定义 / 组件已存在）
- 列出「未确认」的开放问题（后端接口未定 / 设计稿缺失等）
- 未确认项标注 `TODO: 待对接`，**不**按假想契约拆解

### Step 3：产出任务清单

输出格式：

```markdown
## 任务清单：<需求名>

### 已确认决策
- ...

### 开放问题（需对齐后再实施）
- ...

### 子任务（按顺序）
- [ ] 接口封装（create-api）：<具体说明>
- [ ] 状态管理（create-store，如需）：<具体说明>
- [ ] 路由 + 页面骨架（create-route）：<具体说明>
- [ ] 组件实现（create-component）：<逐个列出>
- [ ] 审查 + 提交（frontend-code-review + smart-commit）
```

## 完成标准

- [ ] 已读取所有相关模块（路由 / API / Store / 视图）
- [ ] 已区分「已确认」与「未确认」项
- [ ] 任务清单可直接交给 api-designer / frontend-dev 执行，无歧义

```

---

## handbook/README.md

`handbook/README.md`

```markdown
# .agents/handbook

本目录用于承载原先散落在 `docs/` 下、但仍被 AI 流程依赖的说明文档与模板。

目标：

- 让 `AGENTS.md`、`CLAUDE.md`、Rules、Skills、MCP 说明都统一回到 `.agents/` 体系
- 避免 AI 流程在删除 `docs/` 后失去说明入口或模板来源

## 目录

| 路径 | 说明 |
|------|------|
| `ai-engineering/` | AI 工程化总览、流程、平台接入、MCP 说明 |
| `skills/` | 技能使用说明索引与技能文档模版 |
| `../templates/` | 与技能流程配套的模板文件 |

## 入口

- 总入口：`AGENTS.md`
- 平台与环境约束：`CLAUDE.md`
- 规范与技能唯一源：`.agents/README.md`

```

---

## handbook/ai-engineering/README.md

`handbook/ai-engineering/README.md`

```markdown
# AI 工程化手册

本目录是 AI 流程保留的最小说明集，替代原先 `docs/ai-engineering/` 中被规则、技能和入口文档直接依赖的部分。

## 文档索引

| 文档 | 说明 |
|------|------|
| `ai-engineering.md` | AI 工程化总览 |
| `agents-platform-integration.md` | Cursor / Claude 的接入与映射关系 |
| `composite-engineering-practices.md` | 复杂任务、拆解与多 Agent 协作基线 |
| `rules-vs-skills-guide.md` | Rule / Skill 的职责边界 |
| `how-to-write-rules.md` | 规则编写约定 |
| `how-to-write-skills.md` | 技能编写约定 |
| `skill-rule-creation-checklist.md` | 新增或调整 Rule / Skill 的串联清单 |
| `mcp-implementation-guide.md` | MCP 使用与维护原则 |
| `mastergo-mcp-usage.md` | MasterGo 相关 MCP 说明 |
| `developer-ai-capability-levels.md` | 开发者 AI 使用能力分级 |

## 配套目录

- 技能说明：`../skills/README.md`
- PRD 模版：`../../templates/PRD-runbook.md`

```

---

## handbook/ai-engineering/agents-platform-integration.md

`handbook/ai-engineering/agents-platform-integration.md`

```markdown
# 多平台接入说明

本仓通过符号链接把 `.agents/` 中的规则、技能、子 Agent 与 MCP 配置暴露给不同平台使用。

## Cursor

| 项目路径 | 指向 |
|------|------|
| `.cursor/rules` | `.agents/rules` |
| `.cursor/skills` | `.agents/skills` |
| `.cursor/agents` | `.agents/agents` |
| `.cursor/mcp.json` | `.agents/mcp/mcp.json` |

## Claude

| 项目路径 | 指向 |
|------|------|
| `.claude/rules` | `.agents/rules` |
| `.claude/skills` | `.agents/skills` |
| `.claude/agents` | `.agents/agents` |
| `.claude/mcp.json` | `.agents/mcp/mcp.json` |
| `.claude/commands/` | Claude 专属命令入口，命令实现仍引用 `.agents/skills/**/SKILL.md` |

## 维护原则

- 不在 `.cursor/`、`.claude/` 的链接目录中直接维护实现
- 新增 Rule / Skill / Agent 时，统一在 `.agents/` 中落盘
- 若新增平台，复制同样的“平台目录 -> `.agents` 符号链接”模式即可

## 相关文档

- `ai-engineering.md`
- `../../README.md`
- `../../../AGENTS.md`

```

---

## handbook/ai-engineering/ai-engineering.md

`handbook/ai-engineering/ai-engineering.md`

```markdown
# AI 工程化总览

本仓的 AI 约定遵循一个原则：**Rules、Skills、Agents、MCP 的唯一维护源都在 `.agents/`**。

## 结构分工

- `AGENTS.md`：仓库级 AI 使用入口
- `CLAUDE.md`：Claude/通用开发约束与环境说明
- `.agents/rules/`：规则
- `.agents/skills/`：技能
- `.agents/agents/`：子 Agent 定义
- `.agents/mcp/`：项目级 MCP 配置
- `.agents/handbook/`：供人类与 Agent 查阅的说明文档
- `.agents/templates/`：流程模板

## 核心关系

- **Rules**：定义“怎么才算对”
- **Skills**：定义“怎么一步步做”
- **Agents**：定义“复杂任务如何分工”
- **MCP**：定义“从哪里获取外部能力和真实数据”

## 使用顺序

1. 先读 `AGENTS.md`
2. 按任务类型读取对应 Rule
3. 再读对应 Skill
4. 复杂任务按 `composite-engineering-practices.md` 先考古、再拆解、后实现

## 延伸文档

- 平台接入：`agents-platform-integration.md`
- 复杂任务实践：`composite-engineering-practices.md`
- Skill 说明：`../skills/README.md`
- PRD 模版：`../../templates/PRD-runbook.md`

```

---

## handbook/ai-engineering/composite-engineering-practices.md

`handbook/ai-engineering/composite-engineering-practices.md`

```markdown
# 复合工程实践

本文件给复杂需求提供统一执行基线，供 `complex-task-runbook`、`AGENTS.md` 与子 Agent 分工共同引用。

## 适用场景

- 涉及 3 个以上文件
- 跨模块、跨层级改动
- 需要先考古才能下手
- 预期需要多轮对话或多 Agent 协作

## 推荐流程

1. 任务分类：简单任务直接做，复杂任务先拆解
2. 考古：只读梳理路由、API、Store、同类页面
3. 拆解：形成一次只做一个子任务的清单
4. 实现：按 API -> Store -> 路由 -> 组件 的顺序推进
5. 验证：每一步至少 `pnpm type-check`
6. 审查：必要时做增量 code review
7. 沉淀：把跨会话状态写入 `apps/<app-name>/requirements/<feature>/`

## 非结构化需求处理

如果需求来自 PDF、长文或碎片信息，先用 `../../templates/PRD-runbook.md` 将其整理为：

- `apps/<app-name>/requirements/<feature>/PRD.md`
- `apps/<app-name>/requirements/<feature>/open-questions.md`

在 PRD 被确认前，不进入深度实现拆解。

## 子 Agent 推荐顺序

`spec-analyst -> api-designer -> frontend-dev -> code-reviewer`

```

---

## handbook/ai-engineering/developer-ai-capability-levels.md

`handbook/ai-engineering/developer-ai-capability-levels.md`

```markdown
# 开发者 AI 能力层级

这是一个轻量分级，用于统一团队对 AI 使用成熟度的理解。

| 层级 | 说明 |
|------|------|
| L0 | 几乎不用 AI |
| L1 | 用 AI 做问答和零散辅助 |
| L2 | 能让 AI 完成单点编码任务 |
| L3 | 能按 Rule / Skill 组织 AI 执行 |
| L4 | 能把复杂任务拆解给多个 Agent |
| L5 | 能沉淀 Rule、Skill、模板与流程 |
| L6+ | 能把 AI 流程工程化并持续演进 |

本仓当前重点支持 L3-L5：按规则执行、按技能落地、按多 Agent 分工处理复杂任务。

```

---

## handbook/ai-engineering/how-to-write-rules.md

`handbook/ai-engineering/how-to-write-rules.md`

```markdown
# 如何编写 Rules

## 基本原则

- Rule 只定义约束，不承载冗长教程
- 能放到 Skill 的流程，不放在 Rule 里
- 使用路径、命名、成功标准描述清楚边界

## 新增规则时要做的事

1. 选择放在 `.agents/rules/project-rules/` 还是 `.agents/rules/shared-rules/`
2. 写明适用场景、关键约束、必要示例
3. 更新对应目录的 `README.md`
4. 按 `skill-rule-creation-checklist.md` 完成串联登记

## 参考

- `rules-vs-skills-guide.md`
- `skill-rule-creation-checklist.md`

```

---

## handbook/ai-engineering/how-to-write-skills.md

`handbook/ai-engineering/how-to-write-skills.md`

```markdown
# 如何编写 Skills

## 基本原则

- Skill 负责流程，不重复 Rule 里的规范正文
- `SKILL.md` 保持精简，详细材料放 `references/`、`scripts/`、`assets/`
- 说明“何时使用、如何触发、产出是什么、何时停止”

## 新增技能时要做的事

1. 先区分 `shared-skills` 与 `project-skills`
2. 在 `.agents/skills/` 下创建技能目录与 `SKILL.md`
3. 按 `skill-rule-creation-checklist.md` 更新入口、索引和人类可读说明
4. 若需要人类可读说明，使用 `../skills/skill-doc-template.md`

## 参考

- `rules-vs-skills-guide.md`
- `skill-rule-creation-checklist.md`

```

---

## handbook/ai-engineering/mastergo-mcp-usage.md

`handbook/ai-engineering/mastergo-mcp-usage.md`

```markdown
# MasterGo MCP 使用说明

当任务明确要求“根据 MasterGo 设计稿实现页面”时，优先结合 `mastergo-design-restore` Skill 与项目 MCP 配置使用。

## 使用前提

- 项目级 MCP 已在 `.agents/mcp/mcp.json` 中配置
- 本机鉴权信息在用户级配置或环境变量中补齐

## 使用原则

- 先获取设计节点和结构信息，再生成实现清单
- 未确认的交互、接口、权限一律标记为 `TODO: 待对接`
- 设计稿只提供 UI 与结构依据，不替代业务契约确认

## 相关文件

- `.agents/skills/shared-skills/mastergo-design-restore/SKILL.md`
- `.agents/mcp/README.md`

```

---

## handbook/ai-engineering/mcp-implementation-guide.md

`handbook/ai-engineering/mcp-implementation-guide.md`

```markdown
# MCP 实现指南

本仓的项目级 MCP 配置唯一起源位于 `.agents/mcp/`。

## 原则

- 配置文件统一维护在 `.agents/mcp/mcp.json`
- `.cursor/mcp.json` 与 `.claude/mcp.json` 只保留链接
- 真实 token 不写入仓库
- 需要说明文档时，优先写在 `.agents/handbook/ai-engineering/`

## 使用建议

1. 先确认 MCP 是否真的需要
2. 新增配置时同步更新 `.agents/mcp/README.md`
3. 如果某个 MCP 对某个 Skill 是必需输入，在对应 `SKILL.md` 中写清楚读取方式

## 相关文档

- `mastergo-mcp-usage.md`
- `agents-platform-integration.md`

```

---

## handbook/ai-engineering/rules-vs-skills-guide.md

`handbook/ai-engineering/rules-vs-skills-guide.md`

```markdown
# Rules vs Skills

## 什么时候用 Rule

- 需要长期约束
- 需要定义“必须/禁止”
- 需要被多个任务复用

## 什么时候用 Skill

- 需要指导一段具体流程
- 需要说明输入、步骤、产出、验证
- 需要在特定任务下被显式读取执行

## 经验法则

- “怎么才算对” -> Rule
- “怎么一步步做” -> Skill
- “谁来做、如何拆工” -> Agent
- “去哪里拿外部数据和能力” -> MCP

```

---

## handbook/ai-engineering/skill-rule-creation-checklist.md

`handbook/ai-engineering/skill-rule-creation-checklist.md`

```markdown
# Skill / Rule 创建串联清单

## 新增或调整 Shared Skill

1. 更新 `.agents/skills/shared-skills/<skill>/SKILL.md`
2. 更新 `AGENTS.md` 中的技能登记
3. 更新 `.agents/skills/shared-skills/README.md`
4. 如保留人类可读说明，更新 `.agents/handbook/skills/README.md`

## 新增或调整 Project Skill

1. 更新 `.agents/skills/project-skills/<skill>/SKILL.md`
2. 更新 `.agents/skills/project-skills/README.md`
3. 如涉及语义触发，更新 `.agents/rules/project-rules/skill-project-tasks.mdc`
4. 如保留人类可读说明，更新 `.agents/handbook/skills/README.md`

## 新增或调整 Rule

1. 更新对应 `.agents/rules/**`
2. 更新对应目录的 `README.md`
3. 如影响入口或协作方式，补充 `AGENTS.md` 或 `CLAUDE.md`

```

---

## handbook/skills/README.md

`handbook/skills/README.md`

```markdown
# 技能使用说明

本目录承载供人类查阅的技能说明，替代原先 `docs/skills/` 的 AI 流程依赖。

## 入口原则

- 技能实现仍以 `.agents/skills/**/SKILL.md` 为唯一来源
- 本目录只保留人类可读索引与模版，不再要求每个 Skill 都在仓库内维护一份镜像说明

## 常用入口

- 公共技能索引：`../../skills/shared-skills/README.md`
- 项目技能索引：`../../skills/project-skills/README.md`
- 技能文档模版：`skill-doc-template.md`
- 总入口：`../../../AGENTS.md`

## 维护建议

- Shared Skill 有明显对外说明价值时，可在本目录补充文档
- Project Skill 以 `README.md + SKILL.md` 为主，避免重复维护镜像文档

```

---

## handbook/skills/skill-doc-template.md

`handbook/skills/skill-doc-template.md`

```markdown
# 技能说明文档模版

使用本模版为某个 Skill 生成面向人类的说明文档时，请按需裁剪，不要机械复制 `SKILL.md`。

---

# [技能名称]

**实现路径**：`.agents/skills/[shared-skills|project-skills]/[技能名]/`
**用途**：[一句话说明作用]

## 何时使用

- [场景 1]
- [场景 2]

## 如何触发

- 直接描述需求
- 明确提及技能名
- 或直接读取对应 `SKILL.md`

## 产出

- [输出 1]
- [输出 2]

## 使用步骤

1. 读取 `SKILL.md`
2. 按其中流程执行
3. 如有验证步骤，附上验证命令

## 参考

- `.agents/skills/.../SKILL.md`

```

---

## mcp/README.md

`mcp/README.md`

```markdown
# .agents/mcp — MCP 配置唯一起源

本目录为仓库内 **MCP（Model Context Protocol）配置的唯一起源**。Cursor、Claude 等通过各自目录下的 **符号链接** 引用此处配置，实现「一处维护、多端生效」。

## 目录说明

| 文件 | 说明 |
|------|------|
| `mcp.json` | 项目级 MCP 服务器配置（与 Cursor/Claude 通用格式）；**不含真实 token/密钥**，仅占位符或示例 |
| `README.md` | 本说明 |

## 平台链接关系

| 平台 | 项目内路径 | 链接目标 | 说明 |
|------|------------|----------|------|
| **Cursor** | `.cursor/mcp.json` | `../.agents/mcp/mcp.json` | Cursor 会读取项目级 `.cursor/mcp.json`，与用户级 `~/.cursor/mcp.json` 合并（同名时以平台文档为准） |
| **Claude** | `.claude/mcp.json` | `../.agents/mcp/mcp.json` | 若 Claude 支持项目级 MCP 配置，则由此文件提供；否则可从此处复制到 Claude 约定路径 |

配置修改后需 **完全重启 Cursor / Claude** 方能生效。

## 敏感信息（Token / 密钥）

- **禁止**将真实 token、密钥写入本目录下任何可提交文件。
- **推荐**：
  - 在 **用户级** 配置（如 `~/.cursor/mcp.json`）中为同名 MCP 填写真实 token，与项目级配置合并使用；或
  - 在 `mcp.json` 的 `env` 中引用环境变量，由各人在本机设置该环境变量。

## 新增或修改 MCP

1. 编辑 `.agents/mcp/mcp.json`，按平台要求添加或修改 `mcpServers` 条目。
2. 保持 `.cursor/mcp.json`、`.claude/mcp.json` 为指向 `.agents/mcp/mcp.json` 的符号链接（勿改为实体文件）。
3. 在 [.agents/handbook/ai-engineering/mastergo-mcp-usage.md](../handbook/ai-engineering/mastergo-mcp-usage.md) 或 [.agents/handbook/ai-engineering/mcp-implementation-guide.md](../handbook/ai-engineering/mcp-implementation-guide.md) 中登记/更新使用说明。

## 相关文档

- [MCP 在本项目的实现](../handbook/ai-engineering/mcp-implementation-guide.md)
- [MasterGo MCP 使用指南](../handbook/ai-engineering/mastergo-mcp-usage.md)
- [多平台接入说明](../handbook/ai-engineering/agents-platform-integration.md)

```

---

## mcp/mcp.json

`mcp/mcp.json`

```json
{
  "mcpServers": {
    "mastergo-magic-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@mastergo/magic-mcp",
        "--token=mg_eed2e5b3501a4637bf1d4b84f54ab758",
        "--url=https://mastergo.com"
      ],
      "env": {}
    }
  }
}

```

---

## rules/README.md

`rules/README.md`

```markdown
# .agents/rules — 规则目录

本目录统一存放两类规则，与 `.agents/skills/` 配合使用。

| 子目录 | 说明 |
|--------|------|
| **project-rules/** | 项目级规则：01–11 编号的项目规范（概述、编码、结构、组件、API、路由、状态、样式、文档、测试、通用约束），仅适用于本仓 apps 开发。索引见 [project-rules/README.md](project-rules/README.md)。 |
| **shared-rules/** | 共享级规则：跨项目或跨平台共用，不按平台区分；`.cursor/rules`（符号链接）指向上级 `.agents/rules/` 目录，Cursor 从中读取本子目录下的规则。 |

使用说明与快速查找见 **project-rules/README.md**；多平台接入见 **.agents/handbook/ai-engineering/agents-platform-integration.md**。**新增规则后**需在对应 README 中登记，完整串联清单见 [.agents/handbook/ai-engineering/skill-rule-creation-checklist.md](../handbook/ai-engineering/skill-rule-creation-checklist.md)。

```

---

## rules/project-rules/01-project-overview.mdc

`rules/project-rules/01-project-overview.mdc`

```markdown
---
alwaysApply: false
description: 项目定位与技术栈概览。当需要了解项目背景、使用的技术栈时读取此规则。
globs:
  - "package.json"
  - "pnpm-workspace.yaml"
  - "turbo.json"
  - "README.md"
---

# 项目概述

## 项目定位

Speediance 前端 monorepo：多应用 + 共享包，基于 Vue 3 + TypeScript 的 SPA 应用集合。

## 技术栈（应用层，以 app-admin 为代表）

| 领域 | 技术 | 说明 |
|------|------|------|
| UI 框架 | Vue ^3.4 | 强制使用 Composition API + `<script setup>` |
| 类型系统 | TypeScript 5.x | 强制使用，禁止 JavaScript |
| 构建工具 | Vite 5.x | 各 app 独立 vite 配置 |
| 路由 | Vue Router ^4 | 模块化路由，见各 app 下 `src/router/` |
| 状态管理 | Pinia ^2 | 统一使用，禁止 Vuex 或其他全局状态方案 |
| 组件库 | Element Plus ^2 | 所有交互 UI 基于 Element Plus 二次封装 |
| 样式方案 | SCSS / 局部样式 | 优先 scoped + 按需 SCSS，避免全局污染 |
| HTTP 请求 | @speediance/request（workspace）或各 app 内封装的 http | 见 `packages/sdk/speediance-request` 与各 app `api/` |
| 包管理 / 构建 | pnpm + Turbo | 根目录 pnpm workspace，turbo 编排构建 |

## Monorepo 结构

| 路径 | 说明 |
|------|------|
| `apps/*` | 各独立应用（app-admin、app-ai-copilot、app-membership-system、app-version 等） |
| `packages/sdk/*` | 共享 SDK（如 speediance-request、speediance-i18n） |
| `packages/tools/*` | 工具库（如 speediance-native-bridge） |

单应用内技术选型以该应用 `package.json` 为准；新应用建议与 app-admin 对齐（Vue 3 + Pinia + Vue Router + Element Plus + Vite）。

```

---

## rules/project-rules/02-coding-style.mdc

`rules/project-rules/02-coding-style.mdc`

```markdown
---
alwaysApply: false
description: 项目的编码规范，包括 TypeScript 使用要求、命名约定（变量、常量、接口、组件等）、业务函数命名规则。当编写或审查代码时读取此规则。
globs:
  # TS/TSX: 只覆盖各应用 src 的核心目录，避免无关注入
  - "apps/**/src/api/**/*.ts"
  - "apps/**/src/api/**/*.tsx"
  - "apps/**/src/router/**/*.ts"
  - "apps/**/src/router/**/*.tsx"
  - "apps/**/src/stores/**/*.ts"
  - "apps/**/src/stores/**/*.tsx"
  - "apps/**/src/components/**/*.ts"
  - "apps/**/src/components/**/*.tsx"
  - "apps/**/src/views/**/*.ts"
  - "apps/**/src/views/**/*.tsx"
  - "apps/**/src/hooks/**/*.ts"
  - "apps/**/src/hooks/**/*.tsx"
  - "apps/**/src/utils/**/*.ts"
  - "apps/**/src/utils/**/*.tsx"
  - "apps/**/src/types/**/*.ts"
  - "apps/**/src/types/**/*.tsx"
  - "apps/**/src/constant/**/*.ts"
  - "apps/**/src/constant/**/*.tsx"
  - "apps/**/src/locale/**/*.ts"
  - "apps/**/src/locale/**/*.tsx"
  - "apps/**/src/main.ts"
  # Vue SFC：只覆盖 components/views（以及根 App.vue）
  - "apps/**/src/components/**/*.vue"
  - "apps/**/src/views/**/*.vue"
  - "apps/**/src/App.vue"
---

# 编码规范

## TypeScript 规范

- 所有代码必须使用 TypeScript，禁止使用 JavaScript（历史遗留可逐步迁移）
- 所有 `.ts`、`.vue` 中的逻辑必须包含完整类型定义
- 禁止使用 `any` 类型（除非有明确理由并添加注释说明）
- 接口、类型定义使用 PascalCase
- 组件 Props、Emits 必须定义清晰 TypeScript 类型

## 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 文件夹/路由路径 | kebab-case | `user-profile`、`operation-manage` |
| 变量/函数 | camelCase | `userList`、`onSubmit` |
| 常量 | UPPER_SNAKE_CASE | `API_TIMEOUT` |
| 枚举及属性 | PascalCase / UPPER_SNAKE_CASE | `ApiMethod.GET` |
| 接口/类型/类 | PascalCase | `UserInfo`、`BaseResponse` |
| Vue 组件文件/组件名 | PascalCase | `UserProfile.vue`、`BannerAddOrUpdate.vue` |
| 组合式函数 / composable（目录：hooks） | use 开头 | `useViewModule`、`useUserStore` |

## 业务函数命名

- **事件处理函数**：`onXxx`（如 `onBannerClick`、`onFormSubmit`）
- **内部处理函数**：`handleXxx`（如 `handleDelete`、`handleSubmit`）

## Vue 约定

- 使用 Composition API + `<script setup lang="ts">`，避免 Options API 新代码
- 组件名与文件名一致（PascalCase），多词组件名（如 `UserAddOrUpdate`）

```

---

## rules/project-rules/03-project-structure.mdc

`rules/project-rules/03-project-structure.mdc`

```markdown
---
alwaysApply: false
description: 单应用内目录结构规范，定义 src 下各目录用途与约束（禁止新建非标准目录）。当需要确定代码应放在哪个目录时读取此规则。以 app-admin 为参考，其他 app 可类比。
globs:
  - "apps/**/src/components/**/*.{ts,tsx,vue}"
  - "apps/**/src/hooks/**/*.{ts,tsx}"
  - "apps/**/src/constant/**/*.{ts,tsx}"
  - "apps/**/src/locale/**/*.{ts,tsx}"
  - "apps/**/src/types/**/*.{ts,tsx}"
  - "apps/**/src/utils/**/*.{ts,tsx}"
  - "apps/**/src/views/**/*.{ts,tsx,vue}"
  - "apps/**/src/App.vue"
  - "apps/**/src/main.ts"
---

# 项目结构（单应用 src，NON-NEGOTIABLE）

## 目录结构（以 apps/app-admin/src 为例）

```
src/
├── api/           # 接口请求封装，按业务模块划分
├── assets/        # 字体、图标、静态图片等资源
├── components/    # 可复用 UI 组件
├── hooks/         # 组合式函数（composable）
├── constant/      # 业务常量、枚举
├── locale/        # 国际化
├── router/        # 路由配置与模块
├── stores/        # Pinia store，按业务拆分
├── types/         # 全局类型、vue 扩展等
├── utils/         # 通用工具函数
├── views/         # 按业务模块划分的页面（与路由对应）
├── App.vue
└── main.ts
```

## 结构约束（禁止在 src 下新建非标准目录）

| 类型 | 目录 | 规范 |
|------|------|------|
| 接口 | `src/api/` | 按模块划分，见 `api/README.md`；类型放模块内 `types.ts` 或 `views/.../types.ts` |
| 状态 | `src/stores/` | 按业务模块，Pinia defineStore，命名清晰 |
| 工具 | `src/utils/` | 按功能划分，通过 `index.ts` 统一导出 |
| 组件 | `src/components/` | 通用组件；单页专用组件放对应 `views/xxx/` 下 |
| 路由 | `src/router/` | 模块化，`router/modules/` 下按业务拆分 |
| 页面 | `src/views/` | 与路由对应，按业务模块分目录（如 userManage、operationManage） |

## 页面与组件放置规则

- **通用组件**：多处复用、业务无关 → `src/components/`
- **页面级组件**：仅单页使用 → 放在该页所在 `views/<module>/<feature>/` 下的组件或同目录子组件中

**约束**：`src/components/` 只存放通用组件，禁止将仅单页使用的组件放入。

## Monorepo 应用间差异

- 各 app 的 `src` 结构可能略有差异（如是否有 `locale`、`hooks`），但核心目录（api、router、stores、views、components、utils）保持一致。
- 共享逻辑优先放在 `packages/`，应用内仅保留业务相关代码。

```

---

## rules/project-rules/04-component-guide.mdc

`rules/project-rules/04-component-guide.mdc`

```markdown
---
alwaysApply: false
description: 项目的组件规范，包括组件目录结构、样式使用、组件层级规划（通用 vs 页面级）。当创建或拆分组件时读取此规则。
globs:
  - "apps/**/src/components/**/*.vue"
  - "apps/**/src/components/**/index.ts"
  - "apps/**/src/components/**/types.ts"
  - "apps/**/src/views/**/*.vue"
---

# 组件规范

## 组件结构

- 通用组件放在 `src/components/` 下，单文件组件可直接 `Xxx.vue`，复杂组件可建目录并配 `index.vue` + 样式
- 必须使用 TypeScript，Props/Emits 定义清晰类型
- 交互类 UI 基于 Element Plus 二次封装，禁止引入其他 UI 库（除已批准的）
- 样式：优先 `<style scoped>` + SCSS，或按项目已有的 SCSS 规范（如 `assets/styles/`）

如需创建组件的完整步骤与示例，请使用技能：

- `.agents/skills/project-skills/create-component/SKILL.md`

## 组件层级规划

- 单文件建议不超过约 400 行（作为拆分参考）
- 单一职责：每个组件职责明确
- **页面级组件**：仅当前页面使用 → 放在对应 `views/<module>/<feature>/` 下或同目录子组件
- **通用组件**：跨页面复用 → `src/components/`

## 组件放置决策树

```
组件需要在多个页面使用吗？
├─ YES → 通用组件 → src/components/<Name>/
└─ NO  → 仅单页使用 → views/<module>/<feature>/ 下或子目录
```

**约束**：`src/components/` 中只放真正通用、业务无耦合的组件。

```

---

## rules/project-rules/05-api-guide.mdc

`rules/project-rules/05-api-guide.mdc`

```markdown
---
alwaysApply: false
description: 项目的 API 规范，包括接口请求封装、函数命名约定、错误处理原则。当新增或修改接口时读取此规则。
globs:
  - "apps/**/src/api/**/*.ts"
  - "apps/**/src/api/**/*.tsx"
  - "packages/sdk/speediance-request/src/**/*.ts"
---

# API 规范

## 接口请求规范

- 接口请求使用各应用 `src/api/` 下封装的请求实例（如 app-admin 的 `http` 来自主应用或 mock）
- 共享请求能力可使用 `packages/sdk/speediance-request`
- 按业务模块组织：`api/modules/<模块>/`，每模块可有 `index.ts`、`types.ts` 及按资源拆分的 ts 文件
- 所有接口需有 TS 类型定义（Params/Body/Response），类型可放在模块内 `types.ts` 或对应 `views/.../types.ts`

如需完整示例与步骤，请使用技能：

- `.agents/skills/project-skills/create-api/SKILL.md`

## 接口函数命名（推荐，NON-NEGOTIABLE  for 新代码）

| 操作 | 命名规则 | 示例 |
|------|----------|------|
| 获取列表/分页 | getXxxList / getXxxPage | `getBannerList`、`getBannerPage` |
| 获取详情 | getXxxDetail | `getBannerDetail` |
| 创建 | createXxx | `createBanner` |
| 更新 | updateXxx | `updateBanner` |
| 删除 | deleteXxx | `deleteBanner` |

- 禁止使用 `fetch` 前缀或匈牙利命名；现有代码若为 `apiXxx` 形式，新接口建议统一为上述命名，旧代码可逐步迁移。

## 接口错误处理

- 由各应用 HTTP 封装/拦截器统一处理错误与提示，业务代码中**禁止**在接口失败时重复弹出 `message.error` 等
- 业务层可保留：表单校验错误提示、业务逻辑校验提示、操作成功反馈

```

---

## rules/project-rules/06-routing-guide.mdc

`rules/project-rules/06-routing-guide.mdc`

```markdown
---
alwaysApply: false
description: 路由结构规范、路由与菜单约定。当新增或修改路由时读取此规则。
globs:
  - "apps/**/src/router/**/*.ts"
  - "apps/**/src/router/**/*.tsx"
---

# 路由规范

## 路由结构

- 路由集中在 `src/router/`，采用模块化：`router/modules/` 下按业务模块拆分（如 userManage、operationManage）
- 每个模块导出路由数组，在 `router/index.ts` 中合并
- 路由常量、path/name 建议在 `router/constants.ts` 或模块内统一管理，避免硬编码

## 路由与视图对应

- 每个路由对应 `src/views/` 下路径，使用懒加载：`component: () => import('@/views/...')`
- meta 中可包含 title、module、权限等，供菜单与面包屑使用

## 约定

- path 使用 kebab-case，name 使用 camelCase 或与 path 一致
- 新增业务模块时：在 `router/modules/` 新增文件并在 `router/index.ts` 中导入合并

如需完整步骤，请使用技能：

- `.agents/skills/project-skills/create-route/SKILL.md`

```

---

## rules/project-rules/07-state-management.mdc

`rules/project-rules/07-state-management.mdc`

```markdown
---
alwaysApply: false
description: Pinia 使用规范、Store 组织方式。当新增或修改全局状态时读取此规则。
globs:
  - "apps/**/src/stores/**/*.ts"
  - "apps/**/src/stores/**/*.tsx"
---

# 状态管理

## 技术选型

- 统一使用 **Pinia**，禁止 Vuex 或其它全局状态方案

## Store 组织

- Store 放在 `src/stores/`，按业务模块拆分文件
- 使用 Composition 风格（`defineStore` + setup 写法）或 Options 风格，与项目现有风格一致
- 命名：`useXxxStore`（如 `useUserStore`、`useCounterStore`）

## 原则

- 仅跨组件/跨页面共享状态放入 Store；纯页面内状态用 `ref`/`reactive` 即可
- 避免在 Store 中写复杂业务逻辑，可抽到 hooks（composable）或 utils

如需创建 Store 的步骤与示例，请使用技能：

- `.agents/skills/project-skills/create-store/SKILL.md`

```

---

## rules/project-rules/08-common-constraints.mdc

`rules/project-rules/08-common-constraints.mdc`

```markdown
---
alwaysApply: false
description: 通用约束：中文注释、可观测性与兜底、占位元素使用。当需要确认通用约束时读取此规则。
globs:
  - "apps/**/src/components/**/*.{ts,tsx,vue}"
  - "apps/**/src/hooks/**/*.{ts,tsx}"
  - "apps/**/src/utils/**/*.{ts,tsx}"
  - "apps/**/src/views/**/*.{ts,tsx,vue}"
  - "apps/**/src/App.vue"
  - "apps/**/src/main.ts"
  - "apps/**/src/api/**/*.{ts,tsx}"
  - "apps/**/src/router/**/*.{ts,tsx}"
  - "apps/**/src/stores/**/*.{ts,tsx}"
  - "apps/**/src/constant/**/*.{ts,tsx}"
  - "apps/**/src/types/**/*.{ts,tsx}"
  - "apps/**/src/locale/**/*.{ts,tsx}"
---

# 通用约束

## 语言规范（NON-NEGOTIABLE）

- 所有文档和代码注释使用**中文**
- 代码变量、函数、类型命名仍使用英文（遵循 02-coding-style）

## 可观测性与兜底

- 涉及 AI 或异步任务时，需有可追踪的上下文（如任务 ID、引用）
- 失败时提供明确提示与可选的重试/恢复方式

## 占位元素使用

- 图标/图片资源未定时：使用占位元素并加 TODO 注释标记替换点
- 禁止使用临时 SVG 或外部 placeholder 图床代替未定稿资源

## 约束汇总

| 约束 | 来源 |
|------|------|
| TypeScript 强制使用 | 02-coding-style |
| 禁止新建非标准 src 目录 | 03-project-structure |
| 命名规范一致性 | 02-coding-style |
| 路由模块化集中管理 | 06-routing-guide |
| API 函数命名规范 | 05-api-guide |
| 主题/样式变量按项目约定 | 09-styling-guide |

```

---

## rules/project-rules/09-styling-guide.mdc

`rules/project-rules/09-styling-guide.mdc`

```markdown
---
alwaysApply: false
description: 样式与主题规范。当编写或修改样式、使用主题变量时读取此规则。
globs:
  - "apps/**/src/components/**/*.vue"
  - "apps/**/src/views/**/*.vue"
  - "apps/**/src/components/**/*.{scss,css}"
  - "apps/**/src/views/**/*.{scss,css}"
  - "apps/**/src/assets/**/*.{scss,css}"
  - "apps/**/src/styles/**/*.{scss,css}"
---

# 样式规范

## 基本约定

- 优先使用 **scoped** 样式，避免全局污染
- 使用 SCSS 时与项目现有结构一致（如 `assets/styles/`、element-plus 覆盖等）
- 主题色、间距等优先使用项目已定义的 CSS 变量或 Element Plus 主题变量，禁止魔数硬编码

## 与组件库的关系

- 使用 Element Plus 时，按项目现有方式引入与覆盖（如 `assets/styles/element-plus.scss`），保持命名空间与变量一致

## 注意

- 各 app 可能有自己的主题/变量文件，修改前先查看该应用下 `assets/`、`styles/` 结构

```

---

## rules/project-rules/10-documentation.mdc

`rules/project-rules/10-documentation.mdc`

```markdown
---
alwaysApply: false
description: 注释与文档规范。当需要写注释或文档时读取此规则。
globs:
  - "apps/**/src/**/README.md"
  - "apps/**/README.md"
  - ".agents/**/*.md"
---

# 文档规范

## 注释

- 公共函数、复杂逻辑、接口类型需有中文注释
- 关键业务逻辑使用 JSDoc 或行内注释说明意图

## 文档位置

- 各模块的 README（如 `api/README.md`、`router/README.md`）描述该目录约定与使用方式
- 技能与规则文档统一放在 `.agents/` 体系内并保持更新；如需人类可读说明，优先落在 `.agents/handbook/`

```

---

## rules/project-rules/11-testing-guide.mdc

`rules/project-rules/11-testing-guide.mdc`

```markdown
---
alwaysApply: false
description: 测试覆盖与质量门禁。当编写或运行测试时读取此规则。
globs:
  - "apps/**/src/**/*.test.ts"
  - "apps/**/src/**/*.spec.ts"
  - "apps/**/src/**/*.test.tsx"
  - "apps/**/src/**/*.spec.tsx"
  - "packages/**/src/**/*.test.ts"
  - "packages/**/src/**/*.spec.ts"
  - "packages/**/src/**/*.test.tsx"
  - "packages/**/src/**/*.spec.tsx"
---

# 测试规范

## 测试框架

- 仓库使用 **Vitest**（根目录配置），各 app 可按需配置自己的测试脚本

## 原则

 - 核心工具函数、hooks（composable）、关键业务逻辑建议有单测
- 新增或修改逻辑时，视需求补充或更新测试，保证 CI 通过

## 质量门禁

- 提交前运行 `pnpm lint`（及各 app 的 type-check/lint）确保通过

```

---

## rules/project-rules/12-skill-doc-sync.mdc

`rules/project-rules/12-skill-doc-sync.mdc`

```markdown
---
alwaysApply: false
description: 技能文档同步规则：当新增/更新/重命名/删除 `.agents/skills/**` 下的 Skill 时，必须同步创建或更新 `.agents/handbook/skills/` 下的人类可读说明或索引，确保团队可发现、可复用。
globs:
  - ".agents/skills/**/*.md"
  - ".agents/handbook/skills/**/*.md"
---

# 技能说明文档同步规则

## 适用范围

当你对以下内容进行**任何变更**时适用：

- `.agents/skills/project-skills/**/SKILL.md`
- `.agents/skills/shared-skills/**/SKILL.md`

> 目标：让 Skill 不只“AI 看得懂”，也让**人类能快速查到、快速理解、快速触发**。

---

## 必须做（硬性要求）

### 1）新增 Skill

在 `.agents/skills/**/<skill-name>/SKILL.md` 新增一个 Skill 时，**必须同时**：

- 在 `.agents/handbook/skills/` 下新增一份说明文档，或确认该技能只需索引说明：
  - `.agents/handbook/skills/<skill-name>.md`
- 在 `.agents/handbook/skills/README.md` 的对应索引中补充入口或维护说明

说明文档建议基于模版：

- `.agents/handbook/skills/skill-doc-template.md`

### 2）更新 Skill（内容/行为有变化）

当修改任意 Skill 的 `SKILL.md`（流程、产物、触发方式、成功标准等变化）时，**必须同步**更新：

- `.agents/handbook/skills/<skill-name>.md`（如果该技能维护了独立说明）
- 如触发场景/定位变化明显，需同步更新 `.agents/handbook/skills/README.md` 的描述或索引策略

### 3）重命名 Skill

当变更 Skill 名称（目录名或 frontmatter 的 `name`）时，**必须同步**：

- `.agents/handbook/skills/<old>.md` → `.agents/handbook/skills/<new>.md`
- 更新 `.agents/handbook/skills/README.md` 中的链接与描述
- 检查并修复仓库内对旧文档路径的引用（如有）

### 4）删除 Skill

当删除 `.agents/skills/**/<skill-name>/` 时，**必须同步**：

- 删除 `.agents/handbook/skills/<skill-name>.md`（如存在）
- 从 `.agents/handbook/skills/README.md` 移除对应条目或说明

---

## 推荐做（提升可用性）

- 说明文档应包含：
  - **何时使用**
  - **如何触发（最简示例）**
  - **输出/产物是什么**
  - **验证命令/验收标准**（如果是工程类 Skill）
- 说明文档保持“人类可读”，不要把 SKILL.md 原样复制一遍


```

---

## rules/project-rules/README.md

`rules/project-rules/README.md`

```markdown
# 项目规则索引（项目级）

本目录为 **项目级规则**（project-rules），仅适用于本仓库 apps 开发；与 `.agents/skills/project-skills/` 配合使用。共享级规则在 `.agents/rules/shared-rules/`。

## 规范模块列表

### 📋 [01 项目概述](./01-project-overview.mdc)
- 项目定位、Monorepo 结构
- 技术栈（Vue 3、Pinia、Vue Router、Element Plus、Vite 等）

### 💻 [02 编码规范](./02-coding-style.mdc)
- TypeScript 规范
- 命名规范（文件夹、变量、常量、接口、组件、composable/hook）
- 业务函数命名（onXxx / handleXxx）

### 📁 [03 项目结构](./03-project-structure.mdc)
- 单应用 src 目录结构
- 各目录用途与约束（禁止新建非标准目录）
- 通用组件 vs 页面级组件

### 🧩 [04 组件规范](./04-component-guide.mdc)
- 组件结构、样式、层级规划
- 通用 vs 页面级组件放置

### 🌐 [05 API 规范](./05-api-guide.mdc)
- 接口请求封装、模块划分
- 接口函数命名、错误处理

### 🛣️ [06 路由规范](./06-routing-guide.mdc)
- 模块化路由、与 views 对应

### 🗄️ [07 状态管理](./07-state-management.mdc)
- Pinia 使用与 Store 组织

### ⚙️ [08 通用约束](./08-common-constraints.mdc)
- 中文注释、可观测性与兜底、占位元素

### 🎨 [09 样式规范](./09-styling-guide.mdc)
- scoped、SCSS、主题变量

### 📝 [10 文档规范](./10-documentation.mdc)
- 注释与 README

### ✅ [11 测试规范](./11-testing-guide.mdc)
- Vitest、质量门禁

### 📚 [12 技能文档同步](./12-skill-doc-sync.mdc)
- 新增/更新/重命名/删除 Skill 时，同步维护 `.agents/handbook/skills/` 说明与索引

## Skills 语义触发规则（Cursor Agent Requested）

以下规则不设 `globs`，Cursor AI 根据对话语义自动决定是否注入，无需显式 `@` 调用。**统一由一条规则覆盖**，根据用户意图匹配后加载对应 project-skill：

| 规则文件 | 覆盖的 Skill 与触发场景 |
|----------|--------------------------|
| [skill-project-tasks.mdc](./skill-project-tasks.mdc) | create-api（新增接口/对接 API/写请求）、create-component（创建/拆分组件）、create-route（新增路由/添加页面）、create-store（新建 Store/全局状态）、create-vue-app（新建子应用/脚手架/create-app） |

## 使用说明

1. 根据任务类型打开对应编号的规则文件
2. Skill 规则（`skill-*.mdc`）由 Cursor AI 自动触发；Claude Code 通过 CLAUDE.md 的 `@` 导入加载所有规则
3. **新增项目规则或 skill-*.mdc 时**：在本 README 的「规范模块列表」或「Skills 语义触发规则」中登记；完整串联清单见 [.agents/handbook/ai-engineering/skill-rule-creation-checklist.md](../../handbook/ai-engineering/skill-rule-creation-checklist.md)
4. **新增项目技能（project-skills）时**：在本 README 的「Skills 语义触发规则」中登记触发场景；若需 Cursor 语义自动注入，在 [skill-project-tasks.mdc](./skill-project-tasks.mdc) 的表格中新增一行（用户意图、技能路径、同步遵守规范）；**无需**为单个项目技能新建独立 `skill-xxx.mdc`

## 快速查找

| 需求 | 规范文件 |
|------|----------|
| 项目背景与技术栈？ | 01-project-overview |
| 命名、TS 规范？ | 02-coding-style |
| 代码放哪个目录？ | 03-project-structure |
| 如何创建/拆分组件？ | 04-component-guide |
| 如何写接口？ | 05-api-guide |
| 如何配路由？ | 06-routing-guide |
| 如何用 Pinia？ | 07-state-management |
| 通用约束？ | 08-common-constraints |
| 样式与主题？ | 09-styling-guide |
| 注释与文档？ | 10-documentation |
| 测试要求？ | 11-testing-guide |

```

---

## rules/project-rules/skill-project-tasks.mdc

`rules/project-rules/skill-project-tasks.mdc`

```markdown
---
alwaysApply: false
description: 在当前 Vue 应用中执行「新增接口 / 创建组件 / 新增路由 / 新建 Store」或「新建子应用 / 脚手架」等与 project-skills 相关的任务时使用。触发场景：用户提到「新增接口」「对接 API」「写请求」「创建组件」「新建组件」「拆分组件」「新增路由」「添加页面」「配置路由」「新建 store」「添加全局状态」「创建 pinia store」「新建应用」「新建子应用」「脚手架」「create-vue-app」「create-app」等。根据用户意图选择下方对应技能并同步遵守所列规范。
---

## 根据用户意图选择其一并加载对应技能

**仅加载与当前用户意图匹配的那一项对应的 SKILL.md，勿同时加载多项。**

| 用户意图（关键词） | 技能路径 | 同步遵守规范 |
|--------------------|----------|--------------|
| 新增接口、对接 API、写请求、新建 api 文件、新业务模块接口 | @.agents/skills/project-skills/create-api/SKILL.md | 05-api-guide.mdc |
| 创建组件、新建组件、拆分组件、新增 Vue 文件、页面太大需要拆分 | @.agents/skills/project-skills/create-component/SKILL.md | 03-project-structure.mdc、04-component-guide.mdc |
| 新增路由、添加页面、新建页面、配置路由、新建业务模块 | @.agents/skills/project-skills/create-route/SKILL.md | 06-routing-guide.mdc |
| 新建 store、添加全局状态、创建 pinia store、跨组件共享状态、新增 useXxxStore | @.agents/skills/project-skills/create-store/SKILL.md | 07-state-management.mdc |
| 新建子应用、新 app、脚手架、初始化 Vue 应用、create-vue-app、pnpm create-app、monorepo 增加应用 | @.agents/skills/project-skills/create-vue-app/SKILL.md | 01-project-overview.mdc、02-coding-style.mdc、03-project-structure.mdc（生成后业务开发配合 04–11） |

执行时：先根据当前用户表述匹配上表「用户意图」一列，再加载该行「技能路径」所指的 SKILL.md，并按该行「同步遵守规范」中的规则执行。

**create-vue-app**：加载该技能后须遵守其中「对 AI / Agent 的约束」——脚手架完成后**禁止**自动执行 `pnpm install`，仅提示用户在本地终端手动安装。

```

---

## rules/shared-rules/README.md

`rules/shared-rules/README.md`

```markdown
# 共享规则（shared-rules）

本目录为 **共享级规则**，跨项目或跨平台共用，不按平台分子目录；与 **项目级规则**（`.agents/rules/project-rules/`）区分。

`.cursor/rules` 指向 `.agents/rules`（上级规则目录，含本 shared-rules 子目录）；Cursor 会读取本目录下的 `.mdc` 规则文件。

新增共享规则时直接在本目录下新建文件，并在本文档「已注册规则」表中登记。完整登记与串联清单见 [.agents/handbook/ai-engineering/skill-rule-creation-checklist.md](../../handbook/ai-engineering/skill-rule-creation-checklist.md)。

## 已注册规则

| 文件 | 说明 |
|------|------|
| `language-chinese.mdc` | 强制所有回答使用简体中文输出 |

```

---

## rules/shared-rules/language-chinese.mdc

`rules/shared-rules/language-chinese.mdc`

```markdown
---
description: 强制 AI 助手所有回答使用中文
alwaysApply: true
---

# 回答语言规范

无论用户使用何种语言提问，所有回答、解释、注释建议、代码说明均必须使用**简体中文**输出。

代码本身（变量名、函数名、类型名等）仍遵循英文命名规范，仅自然语言表达部分使用中文。

```

---

## skills/README.md

`skills/README.md`

```markdown
# .agents/skills — 技能目录

本目录统一存放两类技能，与 `.agents/rules/project-rules/`（项目级）及 `.agents/rules/shared-rules/`（共享级）配合使用。

| 子目录 | 说明 |
|--------|------|
| **project-skills/** | 项目技能：与规则配套，仅 apps 开发时使用（create-api、create-component、create-route、create-store）。索引见 [project-skills/README.md](project-skills/README.md)。 |
| **shared-skills/** | 公共技能：设计、MCP、提交、审查、文档转 PPT 等；`.cursor/skills` 与 `.claude/skills` 为指向本目录的符号链接。索引见 [shared-skills/README.md](shared-skills/README.md)。 |

使用说明与触发场景见 [.agents/handbook/skills/README.md](../handbook/skills/README.md)；入口与登记见 [AGENTS.md](../../AGENTS.md)。

```

---

## skills/project-skills/README.md

`skills/project-skills/README.md`

```markdown
---
name: project-skills-index
description: 项目本地技能索引，帮助代理在具体开发场景下选择合适的技能。
---

# 项目技能索引

`.agents/skills/project-skills` 下是与规则配套的项目技能，用于**具体步骤与示例**，避免在规则中塞入过多细节。

## 自封装技能列表

| 技能 | 说明 | 配合规则 |
|------|------|----------|
| `create-api` | 创建与维护 HTTP 接口封装 | 05-api-guide |
| `create-component` | 创建与拆分 Vue 通用/页面级组件 | 03-project-structure、04-component-guide；如需人类可读说明，可在 `.agents/handbook/skills/` 中补充 |
| `create-route` | 创建与维护路由及对应视图 | 06-routing-guide；如需人类可读说明，可在 `.agents/handbook/skills/` 中补充 |
| `create-store` | 使用 Pinia 创建与维护全局状态 | 07-state-management |
| `complex-task-runbook` | 通用复杂需求“一键输出清单”：提供 app 与需求描述，按 `composite-engineering-practices.md` 输出 5 段式可执行清单；**可选前置**按 `.agents/templates/PRD-runbook.md` 将非结构化需求转为 `apps/<app-name>/requirements/<feature>/PRD.md` 并经确认后再考古（含 §2.4 速查对齐、可选 MasterGo、审查/提交、沉淀与跨会话） | 02–07、09-styling-guide、11-testing-guide（按需）；全文基准见 composite-engineering-practices |
| `create-vue-app` | 使用 `scripts/create-vue-app.js`（`pnpm create-app`）在 `apps/` 下脚手架新 Vue 3 子应用；**Agent 勿自动 `pnpm install`**，由开发者本地手动安装 | 01-project-overview、02-coding-style、03-project-structure（后续配合 04–11） |

## 公共技能（.agents/skills/shared-skills）

以下技能位于 **.agents/skills/shared-skills/**（`.cursor/skills` 与 `.claude/skills` 为该目录的符号链接），通过 AGENTS.md 登记，与本仓通用流程配合使用：

- **frontend-code-review**：Vue 3 + TypeScript 增量代码审查
- **smart-commit**：符合 Conventional Commits 的提交信息
- **document-to-pptx**：Markdown/文档转 PPT
- **senior-prompt-engineer**：提示词与系统提示设计
- **skill-doc-generator**：为技能生成使用文档
- 以及 canvas-design、frontend-design、git-commit-helper、mcp-builder、skill-creator 等，见 **.agents/skills/shared-skills/README.md**。

新增**项目**实践场景（如 UI 验收、设计稿分析、测试用例模板等）可在本目录（.agents/skills/project-skills）下新增并更新本索引；新增**公共**技能请在 **.agents/skills/shared-skills/** 下新增并更新其 README。

```

---

## skills/project-skills/complex-task-runbook/SKILL.md

`skills/project-skills/complex-task-runbook/SKILL.md`

```markdown
---
name: complex-task-runbook
description: 通用复杂需求“一键输出清单”技能。提供所属 app（apps/*）与需求文档或描述后，按 `.agents/handbook/ai-engineering/composite-engineering-practices.md` 输出可执行步骤；可选前置「PRD 模版化与确认」（按 `.agents/templates/PRD-runbook.md` 将 PDF/碎片需求转为 `apps/<app-name>/requirements/<feature>/PRD.md` 并经确认后再拆解）。主流程：任务分类→（可选 PRD 确认）→考古→拆解→API→Store→路由→组件（含可选 MasterGo 设计稿分支）→逐步验证→审查→（按需）提交与知识沉淀；适用于 3+ 文件、跨模块、完整流程的复杂需求。
---

# 通用复杂需求一键执行清单（Runbook）

> 你只要给两样输入：**所属 app** + **需求内容（文档引用或文字描述）**。  
> 我将输出：**可直接在 IDE 里照做的步骤清单**，并保证“可控”（一次只做一小步、每步可验证）。

本技能是 `.agents/handbook/ai-engineering/composite-engineering-practices.md`（复合工程实践）的**落地 Runbook**：Rules（约束）→ Skills（流程）→ Agents（分工）三层关系与完整流程以该文档为准；下文给出**最小可执行口径**，避免与原文重复时仍以原文为优先。

请遵守：

- `.agents/handbook/ai-engineering/composite-engineering-practices.md`（全文，尤其 §2、§2.4、§3–§5）
- `AGENTS.md`（复杂任务启动协议）、`CLAUDE.md`（上下文与 Git 约束）
- `.agents/rules/project-rules/02-coding-style.mdc`
- `.agents/rules/project-rules/03-project-structure.mdc`
- `.agents/rules/project-rules/04-component-guide.mdc`
- `.agents/rules/project-rules/05-api-guide.mdc`（如涉及 API）
- `.agents/rules/project-rules/06-routing-guide.mdc`（如涉及路由）
- `.agents/rules/project-rules/07-state-management.mdc`（如涉及 store）
- `.agents/rules/project-rules/09-styling-guide.mdc`（如涉及样式与组件实现）
- `.agents/rules/project-rules/11-testing-guide.mdc`（对齐验证/测试约定，按需）

---

## 任务入场与分类（必须先做）

对齐实践文档 **§2.1**：

| 类型 | 判断标准 | 我的行为 |
|------|-----------|----------|
| **简单任务** | 单文件或已知改法、涉及 **&lt; 3** 个文件 | **不展开本 Runbook 全文**：直接建议用户选用对应 project-skill（`create-api` / `create-route` / `create-component` / `create-store`）单次完成即可 |
| **复杂任务** | 跨模块、完整页面流程、**3+ 文件** | 按下方「输出要求」与「固定拆解」输出清单；并判断是否建议拆子 Agent |

> 若用户需求明显是简单任务，仍要先**一句话**说明分类结论，再给出最短路径（避免刷长清单）。

---

## 上下文使用原则（执行清单时必须遵守）

对齐实践文档 **§2.3** / `CLAUDE.md`（输出子任务或考古说明时应体现）：

1. 阅读顺序：`AGENTS.md` → 任务对应 Rule → 对应 Skill → 相关源码（按需，不全量读）。
2. 复杂任务**先考古**再写实现描述；考古只读不写。
3. **禁止一次性投喂全库**；以文件路径指针代替大段粘贴。
4. **跨会话**：将「已完成 + 待办 + 关键决策」写入 `apps/<app-name>/requirements/<feature>/` 或 PR 描述后再续（见下文「沉淀与跨会话」）。
5. 工具调用保持精简；MCP **非必选**，仅在 MasterGo 设计稿场景使用。

---

## 触发方式（最简单、最稳定）

你不需要 `@` 任何文件。只要在对话框发下面两行输入即可触发本技能的输出方式：

```text
目标 app：apps/<your-app>
需求内容：<粘贴需求描述要点，或 @ 需求文档；未确认处写“待确认”>
```

> 说明：`@需求文档.pdf` 能提高准确性，但不是必选；本技能默认按“缺信息就列 TODO”处理，禁止猜契约。

---

## PRD 确认与模版转化（可选分支 B，推荐用于非结构化需求）

> 目的：产品侧 PRD 常为 **PDF、飞书长文、口头纪要或多文档碎片**，与 Runbook 需要的「范围、验收、开放问题、依赖」字段**不对齐**，直接考古容易漏项或误读。增加一轮**按统一模版转写并停顿确认**，可显著提高后续 **Step 1–2** 与 `create-*` 清单的准确率。

### 何时建议走分支 B（满足任一即可）

- 需求主材料为 **PDF/图片/扫描件**，或结构松散、缺少 **范围 In/Out、验收、开放问题** 等 P0 章节
- 用户**明确要求**先整理成可评审 PRD 再开发
- 复杂任务且**首次**将需求接入本仓库、尚未有 `apps/<app-name>/requirements/<feature>/PRD.md`

### 何时可跳过分支 B

- 已有按 `.agents/templates/PRD-runbook.md` 撰写的 **`apps/<app-name>/requirements/<feature>/PRD.md`**（至少 P0 章节齐备），且用户声明已评审可用
- 需求为**简短明确**的文字 + 已确认接口契约，无需产品向结构化文档

### 分支 B 的产出（不写业务代码）

1. **按模版转写**：以 `.agents/templates/PRD-runbook.md` 的骨架为基础（可按 L1–L3 档位裁剪），将原始材料整理为：  
   `apps/<app-name>/requirements/<feature>/PRD.md`  
   - **特征名** `<feature>` 由用户指定或与需求编号对齐（如 `B019-xxx`）
2. **未确认项单列**：与 PRD「开放问题」同步维护：  
   `apps/<app-name>/requirements/<feature>/open-questions.md`  
   （避免在正文里含糊带过）
3. **禁止**：在分支 B 中**假想**接口字段、权限码、具体路由 path；一律写入开放问题或标注「待后端/产品确认」

### 确认门禁（必须）

- 分支 B 结束后，**先停顿**，请用户或产品明确一句再继续，例如：「PRD 已确认，请从考古开始」或「按 PRD 输出 Runbook」。  
- **未确认前**，不进入下文「5 段」中的 **第 2 段起**（不把未转写的 PDF 当最终需求源做深度拆解承诺）。若用户坚持跳过确认，须在输出中**显式声明**风险：可能遗漏范围与验收项。

### 与固定拆解的衔接

- 完成并确认后：**Step 1 考古、Step 2 拆解** 以 **`apps/<app-name>/requirements/<feature>/PRD.md` 为主输入**（可辅以原始 PDF）；附录 **B** 仍由研发后续补齐或与 `brief.md` 分工。

### 可复制触发话术（专用于先转 PRD）

```text
目标 app：apps/<your-app>
需求材料：@原始文档.pdf（或粘贴/链接）
请先按 `.agents/templates/PRD-runbook.md` 将需求转化为 `apps/<app-name>/requirements/<feature>/PRD.md`，并同步同目录 `open-questions.md`；我回复「PRD 已确认」后，再输出 Runbook 五段清单（从考古开始）。
```

---

## 输出要求（我必须按这个格式输出清单）

**若已执行上文「分支 B」且用户尚未确认**：本轮只输出 **PRD 转化成果说明**（已写入/待写入路径、`open-questions` 摘要、待产品填空项），**不输出**下方完整 5 段 Runbook，直至用户确认。

**在确认后（或未触发分支 B）**，输出必须包含以下 **5 段**（标题固定），且每段都要落到“能执行”的粒度：

1. **范围与不做项**（含简单/复杂分类结论）
2. **考古清单（只读）**
3. **可执行子任务清单（按顺序，一次只做 1 个）**  
   - 须与下文「固定拆解」的顺序一致；可标注「本需求跳过 Step X」
4. **每步验收与验证命令**（每步至少 `pnpm type-check`；必要时 `pnpm lint`，对齐 **§2.4 步骤 8**、**§4**）
5. **沉淀与跨会话（按需）**  
   - 是否建议建立 `apps/<app-name>/requirements/<feature>/brief.md` 与 `apps/<app-name>/requirements/<feature>/open-questions.md`；跨会话续做时的首条话术  
   - 任务结束时的**沉淀自检**（对齐 **§5.1**）：反复错误→Rule；工具链坑→`.agents/handbook/`；新通用步骤→Skill；业务决策→PR 或 `brief.md`

通用约束（保证可控）：

- 一次只交付一个子任务（不允许一口气写完整功能）
- 考古阶段只读不写；接口/字段/UI 未确认必须 `TODO: 待对接`，禁止按假设生成契约
- 子 Agent 分工是**可选分支（A）**：我必须先判断“本次是否建议拆子 Agent（是/否 + 理由）”；若建议拆，必须给出推荐链路与可复制话术（见下文「子 Agent 分工」）
- 每完成一步，必须在目标 app 目录下执行并通过（命令固定输出）：

```bash
cd apps/<your-app>
pnpm type-check
```

必要时补充：

```bash
pnpm lint
```

---

## 与落地速查表（§2.4）的对应关系

输出子任务清单时，应能映射到实践文档 **§2.4** 各行（便于对照「产物」列）：

| 速查步骤 | 含义 |
|----------|------|
| 0 | 任务入场 & 分类 |
| 0.5 | **PRD 模版化与确认（可选，分支 B）**：按 `.agents/templates/PRD-runbook.md` 产出 `apps/<app-name>/requirements/<feature>/PRD.md` + `open-questions.md`，确认后再进入 Step 1 |
| 1 | 考古（只读不写） |
| 2 | 拆解（控制粒度，产出有序子任务） |
| 3 | `create-api` |
| 4 | `create-store`（可选） |
| 5 | `create-route` |
| 6 | `create-component` |
| 7 | **设计稿还原（可选）**：`mastergo-design-restore` + MasterGo MCP |
| 8 | 逐步验证（type-check / 必要时 lint） |
| 9 | `frontend-code-review` |
| 10 | `smart-commit` / 提交（**仅用户明确要求**） |
| 11 | 文档与沉淀（Rule / `.agents/handbook/` / Skill / `apps/<app-name>/requirements/`） |

---

## 设计稿还原（可选分支）

当需求明确 **UI 以 MasterGo 为准** 时，在「组件实现」阶段**之前或并入**该阶段增加一步：

- Skill：`.agents/skills/shared-skills/mastergo-design-restore/SKILL.md`
- MCP：`.agents/handbook/ai-engineering/mastergo-mcp-usage.md`（按项目配置启用 MasterGo Magic MCP）
- 产出：组件层级、关键尺寸/布局依据（来自设计数据）；未拉通的标注 `TODO: 待对接`

可复制增强（嵌入 `frontend-dev` 轮次或单独一轮）：

```text
@.agents/skills/shared-skills/mastergo-design-restore/SKILL.md
应用：apps/<your-app>
基于设计稿链接/节点：仅做设计→实现映射与实现清单；未确认处 `TODO: 待对接`。
```

---

## 与 Spec / SDD 的协同（按需）

对齐实践文档 **§7**：若仓库或需求侧已有 Spec-Kit 产物（如 `tasks.md`），**可直接作为 Step 2「拆解」的输入**，无需重复拆解；执行阶段仍按本 Runbook 与各 `create-*` Skill 推进。

---

## 子 Agent 分工（可选但推荐）

> 目的：当任务复杂度较高时，用“分工”降低上下文压力，提高稳定性；不拆也能做，但容易在单会话中跑偏或一次改太多文件。  
> 职责边界全文：**实践文档 §3**、`.agents/handbook/ai-engineering/composite-engineering-practices.md`。

### 判定例子（帮你快速写“是否建议拆子 Agent”的理由）

- **需求材料非结构化**（PDF/多文档碎片、缺范围与验收）→ **优先建议先走「分支 B：PRD 模版化」**（见上文）；确认后再拆 `spec-analyst` 考古，而不是直接长清单硬拆
- **改动面广**：同一需求要同时动 `router/`、`api/`、`views/`、`components/`、`stores/` 任意三类以上 → 建议拆
- **依赖未确认多**：接口字段/分页参数/路由入口权限/设计稿关键交互未确定，需要先列 `TODO: 待对接` 再推进 → 建议先开 `spec-analyst` 把未确认项收敛
- **需要对齐范式**：必须先找“同类页面怎么写”（列表页/详情页/表单页）才能不跑偏 → 建议先 `spec-analyst`
- **任务很长**：预期需要多轮对话才能完成（例如先封装 API 再接页面）→ 建议拆，避免在一个上下文里堆太多实现细节

不建议拆的典型情况：

- **单点修改**：只改一个组件/一个函数/一处样式，且改法明确 → 不拆
- **纯搬运**：只是把已明确的文案/字段补到既有页面，不涉及新路由/新 API/新 store → 不拆

### 什么时候建议拆子 Agent

满足任一条件就建议拆（典型复杂任务）：

- 涉及 **3+ 文件**、跨模块、或完整页面流程
- 需要先大范围考古才能下手（路由/API/store/views/同类页面范式）
- 预期会话很长、上下文容易超窗

### 推荐链路（固定顺序）

`spec-analyst → api-designer → frontend-dev → code-reviewer`

### 子 Agent 与固定拆解 Step 的映射（帮助你把分工落到 runbook）

- Step 0（任务入场与分类）→ `spec-analyst`（或主会话）：分类结论、范围/不做项/依赖清单
- Step 0.5（PRD 模版化，可选）→ **主会话**（或产品协作）：按 `.agents/templates/PRD-runbook.md` 写 `apps/<app-name>/requirements/<feature>/PRD.md`；**非** `spec-analyst` 默认职责（该 Agent 只读不写实现）；若需只读梳理「原始材料→P0 章节要点」，可由 `spec-analyst` 辅助摘要，**转写落盘**仍以主会话执行
- Step 1（考古）→ `spec-analyst`
- Step 2（拆解清单）→ `spec-analyst`（只读产出有序子任务；不写实现）
- Step 3（接口封装）→ `api-designer`（若本步需要且契约已确认）
- Step 4（Store，可选）→ `frontend-dev` + `create-store`（仅跨页/跨组件状态）
- Step 5（路由 + 页面骨架）→ `frontend-dev`
- Step 6（组件/页面实现，可拆多步）→ `frontend-dev`
- 设计稿分支（可选）→ `frontend-dev` 或专轮，**并** `@mastergo-design-restore`（见上节）
- Step 7（逐步验证）→ 实现者执行；每一步回传 `type-check`（必要时 `lint`）
- Step 8（提交前增量审查）→ `code-reviewer`（`frontend-code-review`）
- Step 9（提交信息/提交）→ **仅当用户明确说提交/commit/写 commit message** → `code-reviewer` + `smart-commit`
- Step 10（沉淀，按需）→ 主会话或收尾轮：按 **§5** 自检，更新 Rule / `.agents/handbook/` / Skill / `apps/<app-name>/requirements/`

### 每个子 Agent 的输入 / 产出（最小可执行口径）

- `spec-analyst`：只读考古笔记（路由/API/store/views/同类页面范式）+ 未确认项清单 + 可执行子任务拆解（不写实现代码）
- `api-designer`：API 封装 + types（字段/契约未确认必须 `TODO: 待对接`，禁止自行假设）
- `frontend-dev`：路由/页面骨架 + 组件实现 + 可选 store（不做接口设计；发现类型缺失要停下标注待补）
- `code-reviewer`：增量问题清单 + 规范对齐建议 +（用户**明确**要求提交时）提交信息草案

### 交付物 / 完成标准 checklist（用于验收每个子 Agent 的输出）

- `spec-analyst`
  - [ ] 给出“任务类型结论（简单/复杂）”与“建议拆/不拆子 Agent（是/否 + 理由）”
  - [ ] 考古笔记包含：路由文件定位、API 模块定位、store 现状、views/同类页面范式
  - [ ] 未确认项清单完整，并明确标注 `TODO: 待对接`（不猜任何字段/权限/交互）
  - [ ] 子任务清单按顺序、一次只做 1 个，且每步都有最小验收点
- `api-designer`
  - [ ] 只改 API 与 types；不改 UI/路由
  - [ ] 接口/字段未确认明确 `TODO: 待对接`，不按假设补字段
  - [ ] 输出“下一步页面最小调用示例”（方法名、入参、返回结构引用）
- `frontend-dev`
  - [ ] 路由 path kebab-case、name camelCase、组件懒加载（如有路由改动）
  - [ ] 每步完成后给出验证点：`pnpm type-check`（必要时 `pnpm lint`）
  - [ ] 发现接口/类型缺失不硬编，回写 `TODO: 待对接` 并停在可运行状态
- `code-reviewer`
  - [ ] 仅做增量审查，输出问题清单（不大范围重写）
  - [ ] 仅在用户明确要求提交时：给出符合 commitlint 的 Conventional Commits 提交信息草案

### 常见坑与反例（避免拆了反而更乱）

- **坑 1：子 Agent 直接越权**：`frontend-dev` 自己造接口字段、`api-designer` 改 UI → 解决：首条消息必须 `@.agents/agents/<name>.md` 并强调“不做/只做”
- **坑 2：把 A–D 四个 Agent 一次性全开并同时写代码** → 解决：仍按 runbook“一次只交付一个子任务”，按顺序推进
- **坑 3：未确认项被默认补齐**（例如分页字段、权限码、表格列）→ 解决：所有未确认项必须 `TODO: 待对接`，并在 checklist 里验收

### 可复制话术（每个子 Agent 的首条消息模板）

> 说明：在首条消息中 `@` 对应 Agent 定义文件，用它来“锁定职责边界”。

**A. spec-analyst（只读考古 + 清单）**

```text
@.agents/agents/spec-analyst.md
应用：apps/<your-app>
需求：<粘贴需求要点或 @ 需求文档；未确认处写“待确认”>

严格按 spec-analyst 的职责边界执行：本步只读不写代码。
输出：考古笔记（路由/API/store/views/同类页面范式）+ 未确认项清单（禁止猜）+ 可执行子任务清单（按顺序，一次只做 1 个）。
```

**B. api-designer（仅接口封装）**

```text
@.agents/agents/api-designer.md
应用：apps/<your-app>
基于上一步的清单，仅做接口封装与 types。
要求：接口/字段未确认必须 `TODO: 待对接`，禁止按假设生成契约；业务层不要重复处理统一错误弹窗。
输出：新增/修改的 API 文件路径清单 + 关键类型定义位置 + 下一步对接页面需要的最小调用示例。
```

**C. frontend-dev（路由/页面/组件实现）**

```text
@.agents/agents/frontend-dev.md
应用：apps/<your-app>
基于已存在的 API 封装，实现路由 + 页面骨架 + 组件（按需拆多步）。
要求：不做接口设计；每步改动后给出 `pnpm type-check` 验证点；未确认的 UI/交互用 `TODO: 待对接` 标注，不猜。
```

**D. code-reviewer（增量审查 + 提交信息）**

```text
@.agents/agents/code-reviewer.md
请对本次改动做增量规范审查，输出问题清单与修改建议（不要大范围重写业务逻辑）。
如果我明确说“需要提交/写 commit message”，再生成符合 commitlint 的 Conventional Commits 提交信息草案。
```

---

## 我输出清单时的固定拆解（你不需要背）

> 我会根据你的需求自动裁剪/跳过不需要的步骤；**推荐顺序与 §2.2 / §2.4 一致**（接口 → Store → 路由 → 组件 → 可选设计稿 → 验证 → 审查 → 按需提交 → 按需沉淀）。

- **Step 0**：任务入场与分类（0 代码）
- **Step 0.5（可选，分支 B）**：PRD 模版化与确认 → 产出 `apps/<app-name>/requirements/<feature>/PRD.md`、`open-questions.md`；**用户/产品确认后再进入 Step 1**（见上文「PRD 确认与模版转化」）
- **Step 1**：考古（只读不写：路由/API/store/views/同类页面范式；**优先以已确认的 PRD.md 为输入**）
- **Step 2**：拆解（产出有序子任务与依赖；不写实现）
- **Step 3**：接口封装（如需，且契约已确认）→ `create-api`
- **Step 4**：状态管理（可选，仅跨页面/跨组件状态）→ `create-store`
- **Step 5**：路由 + 页面骨架（如需）→ `create-route`
- **Step 6**：组件/页面实现（可拆多步）→ `create-component`
- **（可选）设计稿还原**：MasterGo → `mastergo-design-restore` + MCP（通常在 Step 6 前或并入 Step 6）
- **Step 7**：逐步验证（每步 `type-check`，必要时 `lint`；对齐 **§4**、**§11-testing-guide** 按需）
- **Step 8**：收尾审查 → `frontend-code-review`
- **Step 9**：提交信息与 `git commit`（**仅用户明确要求**；`smart-commit`）
- **Step 10**：知识沉淀（按需；**§5**、`apps/<app-name>/requirements/`、Rule/Skill/handbook）

---

## 成功标准（门禁）

### 通用标准（对齐实践文档 §4.1）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error（warning 需知悉但可存在）
- [ ] 无裸 `any` 类型（有 `// eslint-disable` 等充分说明的例外除外）
- [ ] 文件路径与命名符合规范（`02-coding-style`、`03-project-structure`）
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

### 各 project-skill 补充标准（对齐实践文档 §4.2）

在输出「每步验收」时，对涉及步骤追加勾选：

| Skill | 额外验收 |
|-------|----------|
| `create-api` | 接口错误由拦截器统一处理；业务代码无重复 `message.error` |
| `create-component` | 样式无魔数硬编码，优先项目 CSS 变量；`<style scoped>` |
| `create-route` | 组件懒加载（`() => import('@/views/...')`） |
| `create-store` | 仅跨组件/跨页面状态入 Store；页面内状态用 `ref` / `reactive` |

---

## `apps/<app-name>/requirements/` 轻量演进目录（跨会话时推荐）

对齐实践文档 **§5.2**（非每个需求强制）。**`<app-name>` 与「目标 app」一致**（如 `app-membership-system`）；PRD / brief / open-questions 均落在该 app 目录下，**不放在仓库根目录**。

```
apps/<app-name>/requirements/
└── <feature-name>/
    ├── PRD.md              # 按 PRD-runbook 附录 A（可选 Step 0）
    ├── brief.md            # 已确认范围与设计决策（3–5 句可扩展）
    └── open-questions.md   # 未确认项，避免按假想契约实现
```

跨会话续做首条话术示例：

```text
续做需求：先读 @apps/<app-name>/requirements/<feature>/brief.md 与 @apps/<app-name>/requirements/<feature>/open-questions.md，从子任务第 X 项继续，仍遵守 @AGENTS.md 复杂任务协议。
```

---

## 相关文档索引（人类跳转）

| 文档 | 说明 |
|------|------|
| `.agents/handbook/ai-engineering/composite-engineering-practices.md` | 复合工程实践全文（本文档的规范来源） |
| `AGENTS.md` | 任务启动协议与技能入口 |
| `CLAUDE.md` | 上下文与 Git 操作约束 |
| `.agents/agents/README.md` | 子 Agent 索引 |
| `.agents/handbook/ai-engineering/mastergo-mcp-usage.md` | MasterGo MCP |
| `.agents/templates/PRD-runbook.md` | 通用产品 PRD 模版；供研发与 Runbook 对接（`apps/<app-name>/requirements/` 跨会话） |

```

---

## skills/project-skills/create-api/SKILL.md

`skills/project-skills/create-api/SKILL.md`

```markdown
---
name: create-api
description: 指导在应用中按模块化方式新增或修改 HTTP 接口封装。当需要对接新接口、新业务模块 API 时使用本技能。
---

# 创建与维护 API

## 使用场景

- 新增一个业务资源的 CRUD 接口
- 在已有模块下新增接口文件或方法
- 为新模块建立 api 目录与类型

请同时遵守 `.agents/rules/project-rules/05-api-guide.mdc`。

---

## API 放在哪里？

- 按业务模块：`src/api/modules/<模块名>/`，其下可按资源再分子目录（如 point、member、advertisement）
- 每个资源一个 ts 文件（如 `banner.ts`、`userPoint.ts`），类型放在同模块 `types.ts` 或对应 `views/.../types.ts`
- 请求实例：使用应用内封装的 `http`（如 `@/api` 或 `@/api/api`），或 `@speediance/request`（若为共享包）

---

## 步骤 1：确定模块与类型

- 属已有模块则在对应目录下新建或修改 ts 文件；新模块则在 `api/modules/` 下新建目录，并配 `index.ts`、`types.ts`（如需要）

---

## 步骤 2：定义类型（若尚未存在）

```ts
// 在 api/modules/xxx/types.ts 或 views/xxx/types.ts
export interface BannerItem {
  id: number
  title: string
  // ...
}
export interface BannerQueryParams {
  page: number
  size: number
  // ...
}
```

---

## 步骤 3：编写接口函数

命名遵循：getXxxList/getXxxPage、getXxxDetail、createXxx、updateXxx、deleteXxx。

```ts
// src/api/modules/operationManage/advertisement/banner.ts
import { http } from '@/api'  // 或当前项目的 http 入口
import type { BannerItem, BannerQueryParams } from './types'

export function getBannerPage(params: BannerQueryParams) {
  return http({
    url: http.adornUrl('/manage/indexBanner/page'),
    method: 'get',
    params: http.adornParams(params)
  })
}

export function getBannerDetail(id: number) {
  return http({
    url: http.adornUrl(`/manage/indexBanner/${id}`),
    method: 'get'
  })
}

export function createBanner(data: Omit<BannerItem, 'id'>) {
  return http({
    url: http.adornUrl('/manage/indexBanner'),
    method: 'post',
    data: http.adornData(data)
  })
}
```

- 使用项目现有的 `http` 封装（如 adornUrl、adornParams、adornData），若项目无则用普通 axios/fetch 封装。

---

## 步骤 4：导出

在模块的 `index.ts` 中导出新接口（若有统一导出习惯），便于其他地方 `import { getBannerPage } from '@/api/modules/...'`。

---

## 快速检查清单

- [ ] 接口是否放在正确模块/资源目录下？
- [ ] 函数命名是否符合 getXxxList/getXxxDetail/createXxx/updateXxx/deleteXxx？
- [ ] 请求参数与响应是否有类型定义？
- [ ] 是否未在业务层重复写接口错误提示（由拦截器统一处理）？

---

## 完成后：沉淀知识（复利步骤）

执行完本技能后，检查以下内容是否需要落回仓库：

| 发现的内容类型 | 沉淀位置 |
|---|---|
| 反复出现的错误模式、命名冲突 | → 更新对应 `.agents/rules/project-rules/` 的 Rule |
| 环境 / 配置 / 工具链坑点 | → 写入 `.agents/handbook/ai-engineering/` 或对应业务目录文档 |
| 新的通用步骤或检查清单 | → 更新或新建 Skill（按 how-to-write-skills.md） |
| 业务决策原因（为什么这样设计） | → PR 描述 或 `apps/<app-name>/requirements/<feature>/brief.md` |

---

## 成功标准（缺一不可）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error（warning 需知悉但可存在）
- [ ] 无裸 `any` 类型（有 `// eslint-disable` 注释说明的除外）
- [ ] 文件路径与命名符合 `03-project-structure`、`02-coding-style` 规范
- [ ] 接口错误由拦截器统一处理，业务代码无重复 `message.error`
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

```

---

## skills/project-skills/create-component/SKILL.md

`skills/project-skills/create-component/SKILL.md`

```markdown
---
name: create-component
description: 指导在前端项目中按团队规范创建和拆分 Vue 3 组件，包括目录结构、文件命名、样式与主题变量。当需要新增或重构 Vue 组件时使用本技能。
---

# 创建与拆分 Vue 组件

## 使用场景

当你需要：

- 新增一个**可复用通用组件**
- 为某个页面新增**页面级组件**
- 拆分过大的页面/组件文件

请使用本技能，并同时遵守 `.agents/rules/project-rules/03-project-structure.mdc` 与 `.agents/rules/project-rules/04-component-guide.mdc`。

---

## 组件放在哪里？

详见 `.agents/rules/project-rules/04-component-guide.mdc` 中的「组件放置决策树」。

- **通用组件**（跨页面复用）：`src/components/<Name>/` 或 `src/components/<Name>.vue`
- **页面级组件**（只在单页使用）：对应 `src/views/<module>/<feature>/` 下或同目录子组件（允许在 `views/<module>/<feature>/components/` 放置仅本页使用的拆分子组件）

命名：目录/文件名 PascalCase 或 kebab-case 与项目一致（如 `UserAddOrUpdate.vue`）。

---

## 标准结构

通用组件示例（单文件）：

```text
src/components/common/SingleUpload.vue
```

通用组件示例（目录）：

```text
src/components/coupon/
  ├─ index.vue
  └─ index.scss（或内联 scoped）
```

页面级组件：放在该页所在 `views/<module>/<feature>/` 下，或同目录子文件夹。

---

## 步骤 1：组件骨架（Vue 3 + script setup）

```vue
<!-- src/components/common/ExampleButton.vue -->
<template>
  <el-button type="primary" :disabled="disabled" @click="onClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'click'): void }>()
const onClick = () => emit('click')
</script>

<style scoped lang="scss">
/* 使用项目主题变量，避免硬编码色值 */
</style>
```

- 必须使用 `<script setup lang="ts">`，Props/Emits 用 TypeScript 定义。

---

## 步骤 2：样式与主题

- 使用 `<style scoped lang="scss">` 或项目已有的 SCSS 组织方式
- 颜色、间距等优先使用项目已定义的 CSS 变量或 Element Plus 变量，禁止硬编码主色

---

## 步骤 3：职责与拆分

- 单文件建议不超过约 **400 行**，超过时拆分为子组件
- **页面级** → 放在当前 views 下；**通用** → 提到 `src/components/`
- 一个组件只负责一个明确 UI 或交互单元

---

## 步骤 4：与 Element Plus 协同

交互类 UI 基于 Element Plus 二次封装，例如：

```vue
<template>
  <el-dialog v-bind="$attrs" :title="title" @close="handleClose">
    <slot />
  </el-dialog>
</template>
<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const handleClose = () => emit('close')
</script>
```

---

## 快速检查清单

- [ ] 组件位置是否正确（通用 vs 页面级）？
- [ ] 是否使用 `<script setup lang="ts">` 且 Props/Emits 有类型？
- [ ] 样式是否 scoped，是否使用主题/变量而非硬编码？
- [ ] 是否需要拆分子组件（文件过长、职责过多）？

---

## 完成后：沉淀知识（复利步骤）

执行完本技能后，检查以下内容是否需要落回仓库：

| 发现的内容类型 | 沉淀位置 |
|---|---|
| 反复出现的错误模式、命名冲突 | → 更新对应 `.agents/rules/project-rules/` 的 Rule |
| 环境 / 配置 / 工具链坑点 | → 写入 `.agents/handbook/ai-engineering/` 或对应业务目录文档 |
| 新的通用步骤或检查清单 | → 更新或新建 Skill（按 how-to-write-skills.md） |
| 业务决策原因（为什么这样设计） | → PR 描述 或 `apps/<app-name>/requirements/<feature>/brief.md` |

---

## 成功标准（缺一不可）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error（warning 需知悉但可存在）
- [ ] 无裸 `any` 类型（有 `// eslint-disable` 注释说明的除外）
- [ ] 文件路径与命名符合 `03-project-structure`、`04-component-guide` 规范
- [ ] 样式无魔数硬编码，使用项目 CSS 变量
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

```

---

## skills/project-skills/create-route/SKILL.md

`skills/project-skills/create-route/SKILL.md`

```markdown
---
name: create-route
description: 指导在 Vue 应用中按模块化方式新增或修改路由与对应视图。当需要新增页面、新业务模块路由时使用本技能。
---

# 创建与维护路由

## 使用场景

- 新增一个页面并配置路由
- 新增一个业务模块的多条路由
- 修改现有路由或懒加载路径

请同时遵守 `.agents/rules/project-rules/06-routing-guide.mdc`。

---

## 路由放在哪里？

- 模块路由：`src/router/modules/<moduleName>.ts` 或 `src/router/modules/<moduleName>/index.ts`
- 入口合并：在 `src/router/index.ts` 中导入并合并到 `moduleRoutes`（或当前项目等价方式）
- 脚手架扁平路由：部分新建 app 可能使用 `src/router/routers.ts` 作为唯一路由入口（导出 `routes` 数组），此时新增路由只需追加到该文件的 `routes` 中，并确保 `component` 指向真实 `src/views/` 组件

---

## 步骤 1：确定模块

- 若属已有模块（如 userManage、operationManage），在该模块文件中追加路由
- 若为新模块，在 `router/modules/` 下新建文件，并在 `router/index.ts` 中引入

---

## 步骤 2：编写路由配置

```ts
// src/router/modules/exampleModule.ts（或 index.ts）
import type { RouteRecordRaw } from 'vue-router'

export const exampleModuleRoutes: RouteRecordRaw[] = [
  {
    path: '/example/list',
    name: 'example-list',
    component: () => import('@/views/example/list/index.vue'),
    meta: { title: '示例列表', module: 'example' }
  }
]
```

- path 使用 kebab-case，component 使用懒加载指向 `views/` 下对应组件

---

## 步骤 3：在 router/index.ts 中合并

```ts
import { exampleModuleRoutes } from './modules/exampleModule'
const moduleRoutes: RouteRecordRaw[][] = [
  userManageRoutes,
  operationManageRoutes,
  exampleModuleRoutes  // 新增
]
export const routes: RouteRecordRaw[] = moduleRoutes.flat()
```

> 若当前 app 使用的是 `src/router/routers.ts`（扁平路由），则跳过该合并步骤：直接在 `routers.ts` 的 `routes` 数组中追加 RouteRecordRaw 即可。

---

## 步骤 4：创建视图文件

在 `src/views/` 下创建与路由对应的目录和页面组件（如 `views/example/list/index.vue`），确保路径与 `import()` 一致。

---

## 快速检查清单

- [ ] 路由是否在正确模块文件或新模块中？
- [ ] 是否在 `router/index.ts` 中完成合并？
- [ ] path/name 是否符合命名规范？
- [ ] 视图文件是否已创建且懒加载路径正确？

---

## 完成后：沉淀知识（复利步骤）

执行完本技能后，检查以下内容是否需要落回仓库：

| 发现的内容类型 | 沉淀位置 |
|---|---|
| 反复出现的错误模式、命名冲突 | → 更新对应 `.agents/rules/project-rules/` 的 Rule |
| 环境 / 配置 / 工具链坑点 | → 写入 `.agents/handbook/ai-engineering/` 或对应业务目录文档 |
| 新的通用步骤或检查清单 | → 更新或新建 Skill（按 how-to-write-skills.md） |
| 业务决策原因（为什么这样设计） | → PR 描述 或 `apps/<app-name>/requirements/<feature>/brief.md` |

---

## 成功标准（缺一不可）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error（warning 需知悉但可存在）
- [ ] 无裸 `any` 类型（有 `// eslint-disable` 注释说明的除外）
- [ ] 文件路径与命名符合 `03-project-structure`、`06-routing-guide` 规范
- [ ] 组件使用懒加载（`() => import('@/views/...')`）
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

```

---

## skills/project-skills/create-store/SKILL.md

`skills/project-skills/create-store/SKILL.md`

```markdown
---
name: create-store
description: 指导使用 Pinia 在 Vue 应用中创建或修改全局状态 Store。当需要新增或修改跨组件/跨页面状态时使用本技能。
---

# 创建与维护 Pinia Store

## 使用场景

- 新增一个与业务相关的全局状态（如用户信息、应用配置）
- 修改现有 Store 的 state/action/getter

请同时遵守 `.agents/rules/project-rules/07-state-management.mdc`。

---

## Store 放在哪里？

- 路径：`src/stores/<name>.ts`（或按业务拆分为多个文件，如 `stores/user.ts`、`stores/app.ts`）
- 命名：Store id 与文件名一致，使用 `useXxxStore` 形式（如 `useUserStore`、`useCounterStore`）

---

## 步骤 1：定义 Store

```ts
// src/stores/example.ts
import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', {
  state: () => ({
    list: [] as Item[],
    loading: false
  }),
  getters: {
    hasItems: (state) => state.list.length > 0
  },
  actions: {
    async fetchList() {
      this.loading = true
      try {
        // 调用 api，赋值 state
      } finally {
        this.loading = false
      }
    }
  }
})
```

或使用 Composition 风格（setup）：

```ts
export const useExampleStore = defineStore('example', () => {
  const list = ref<Item[]>([])
  const loading = ref(false)
  const hasItems = computed(() => list.value.length > 0)
  async function fetchList() {
    loading.value = true
    try {
      // ...
    } finally {
      loading.value = false
    }
  }
  return { list, loading, hasItems, fetchList }
})
```

与项目现有 Store 风格保持一致。

---

## 步骤 2：在组件中使用

```vue
<script setup lang="ts">
import { useExampleStore } from '@/stores/example'
const store = useExampleStore()
// store.list, store.fetchList() 等
</script>
```

---

## 原则

- 仅跨组件/跨页面共享的状态放入 Store；页面内状态用 `ref`/`reactive` 即可
- 避免在 Store 中写过长业务逻辑，可抽到 composable 或 api 层

---

## 快速检查清单

- [ ] Store 是否放在 `src/stores/` 且命名符合 `useXxxStore`？
- [ ] state 是否有类型定义？
- [ ] 是否与现有 Store 风格（Options vs Setup）一致？

---

## 完成后：沉淀知识（复利步骤）

执行完本技能后，检查以下内容是否需要落回仓库：

| 发现的内容类型 | 沉淀位置 |
|---|---|
| 反复出现的错误模式、命名冲突 | → 更新对应 `.agents/rules/project-rules/` 的 Rule |
| 环境 / 配置 / 工具链坑点 | → 写入 `.agents/handbook/ai-engineering/` 或对应业务目录文档 |
| 新的通用步骤或检查清单 | → 更新或新建 Skill（按 how-to-write-skills.md） |
| 业务决策原因（为什么这样设计） | → PR 描述 或 `apps/<app-name>/requirements/<feature>/brief.md` |

---

## 成功标准（缺一不可）

- [ ] `pnpm type-check` 零错误
- [ ] `pnpm lint` 零 error（warning 需知悉但可存在）
- [ ] 无裸 `any` 类型（有 `// eslint-disable` 注释说明的除外）
- [ ] Store 文件路径与命名符合 `07-state-management` 规范
- [ ] 仅跨组件/跨页面状态放入 Store，页面内状态用 `ref`/`reactive`
- [ ] 代码注释使用中文，变量/函数/类型名使用英文

```

---

## skills/project-skills/create-vue-app/SKILL.md

`skills/project-skills/create-vue-app/SKILL.md`

```markdown
---
name: create-vue-app
description: 使用仓库脚本在 monorepo 的 apps/ 下生成新的 Vue 3 + Vite 子应用（含 Pinia、Vue Router、@speediance/request）。当用户要新建子应用、脚手架、初始化 app、或提到 create-vue-app / create-app 时使用；脚手架完成后禁止自动执行 pnpm install，须提示用户本地手动安装。
---

# 使用脚本创建 Vue 子应用

## 前置条件

- 在**仓库根目录**执行（`speediance-web-monorepo`）
- Node.js ≥ 20、pnpm ≥ 8.6.12（与仓库要求一致）

---

## 执行命令

优先使用根目录已注册的脚本：

```bash
pnpm create-app
```

等价于：

```bash
node scripts/create-vue-app.js
```

脚本为**交互式**：需在本机终端运行以便回答提示（应用名、端口、Tailwind、是否移动端等）。自动化可用 `node scripts/create-vue-app.js --help` 查看 `--name`、`--pc`、`--mobile` 等非交互参数。

---

## 对 AI / Agent 的约束（必读）

执行本技能、完成子应用脚手架后：

- **禁止**自动运行 `pnpm install`（或等价的全仓库安装命令）。依赖安装耗时长、可能触发大范围 lockfile/解析，应由**用户在本地终端按需手动执行**。
- 结束时**仅口头提示**下一步：在仓库根（或按团队惯例）执行 `pnpm install` 以解析 workspace 与新应用的 `package.json`，**不要**在对话流程中代跑该命令。
- **`speediance-apps.code-workspace`**：脚本会尝试追加新 app 文件夹项；若因权限或环境未写入成功，**不要**在回复中复述「沙箱权限」「须手动加入工作区」等说明（用户本地正常执行脚本一般会成功）。仅当用户**主动问**多根工作区如何配置时，再说明可自行编辑该文件。

---

## 交互项说明

| 提示 | 约束与说明 |
|------|------------|
| 应用名称 | 仅小写字母、数字、连字符；不能以 `-` 开头或结尾；对应目录 `apps/<name>/` |
| 开发端口 | 脚本会扫描现有 `apps/*/vite.config.ts` 中已占用端口并给出建议；可直接回车采用建议 |
| Tailwind CSS | 默认「是」；选否则生成更精简的 `main.css` / PostCSS |
| 移动端 | 默认「是」会生成 REM、`postcss-pxtorem`、`env.config.ts` 等移动端样板，生产构建与 `app-membership-system` 一致为 `vite build --config vite.production.config.ts`；PC 端为导航 + 基础页面结构 |

若 `apps/<name>` 已存在，脚本会询问是否覆盖（`y` 确认后删除重建）。

---

## 脚本自动完成的仓库级改动

创建成功后，脚本通常会：

- 在**根目录** `package.json` 的 `scripts` 中追加 `dev:<name>`、`build:<name>`（turbo filter）
- 写入 `speediance-apps.code-workspace`：若文件不存在则根据当前 `apps/` 子目录生成；若已存在则合并追加 `apps/<name>`（写入采用临时文件再复制，减少损坏风险）

生成应用内已含：`@speediance/request`、`pinia`、`vue-router`、示例 `api/`、`router/`、`stores/`、`views/` 等，与现有 app 技术栈对齐。

---

## 创建后必做（面向开发者；安装须手动）

1. `cd apps/<name>`（可选，便于查看文件）
2. **手动**在仓库根执行 `pnpm install`（或子应用目录执行亦可），以解析 workspace 与新应用依赖；**勿由 Agent 自动执行**（见上文约束）
3. 开发：`pnpm dev:<name>`（根目录）或 `cd apps/<name> && pnpm dev`
4. 构建：`pnpm build:<name>`（根目录）
5. 按需替换 `public/favicon.ico`（脚本为占位说明文件）
6. 按需修正 `src/api/request.ts` 的 `baseURL`、环境变量键名，与真实后端及 `env.config.ts`（移动端）一致

---

## 规范对齐

新应用生成后，后续开发与目录组织须遵守 `.agents/rules/project-rules/` 下 **01～11**（尤其 02 编码、03 结构、05 API、06 路由、07 状态）。生成代码中的示例（如 `userApi`、`router/lifecycle.ts` 中的 `any`）应在落地业务时按规范收敛。

---

## 常见问题

- **不要在子应用目录内运行本脚本**：工作目录应为 monorepo 根，否则 `apps/` 路径会错误。
- **端口冲突**：若手动输入的端口已被其他 app 使用，脚本会回退到建议端口。
- **与手工复制 app 的区别**：本脚本能统一端口探测、根脚本与 workspace；手工复制易漏改 `package.json` name、`vite.production.config.ts` 的 `base` 等。

---

## 参考

- 如需人类可读说明，可在 `.agents/handbook/skills/` 中补充对应文档

```

---

## skills/shared-skills/README.md

`skills/shared-skills/README.md`

```markdown
# shared-skills — 公共技能

本目录为 **公共技能** 的唯一维护位置，与 **项目技能**（`.agents/skills/project-skills`）区分。

## 职责

- **公共技能**：跨项目或与 IDE/OpenSkills 共用的技能（设计、MCP、提示词、提交、代码审查、文档转 PPT、技能文档生成等）。
- **项目技能**：与项目规范配套、仅在 apps 开发时使用的技能（create-api、create-component、create-route、create-store），位于 [.agents/skills/project-skills](../project-skills)。

## 与各端的对接

| 使用方 | 访问方式 |
|--------|----------|
| **Cursor** | `.cursor/skills` 为指向本目录（`.agents/skills/shared-skills`）的符号链接，Cursor 通过 AGENTS.md 与规则加载本目录下技能 |
| **OpenSkills / Claude** | `.claude/skills` 为指向本目录的符号链接，`npx openskills read <name>` 解析到本目录 |

**请勿** 在 `.cursor/skills` 或 `.claude/skills` 下直接新增文件，所有公共技能统一在本目录（`.agents/skills/shared-skills/`）下新增或修改。

## 技能列表

| 技能 | 说明 |
|------|------|
| canvas-design | 视觉设计（.png/.pdf） |
| document-to-pptx | Markdown/文档转 PPT |
| frontend-code-review | Vue 3 + TypeScript 代码审查 |
| frontend-design | 前端界面与组件设计 |
| git-commit-helper | 提交信息与 diff 分析 |
| gitlab-mr-create | 使用 glab 或 Python3 API 脚本创建 MR（前置审查与目标分支；优先 glab 认证；无法 glab 时用脚本 + GITLAB_TOKEN） |
| mastergo-design-restore | 通过 MasterGo Magic MCP 还原设计稿为前端实现 |
| mcp-builder | MCP 服务端设计与实现 |
| rule-creator | 创建/更新规则（.mdc），区分 project-rule 与 shared-rule 并登记 |
| senior-prompt-engineer | 提示词与系统提示设计 |
| skill-creator | 技能创建与维护 |
| skill-doc-generator | 技能使用文档生成 |
| smart-commit | Conventional Commits 中文提交信息 |

完整说明与触发场景见 [.agents/handbook/skills/README.md](../../handbook/skills/README.md)；入口与登记见 [AGENTS.md](../../../AGENTS.md)。

```

---

## skills/shared-skills/canvas-design/.openskills.json

`skills/shared-skills/canvas-design/.openskills.json`

```json
{
  "source": "anthropics/skills",
  "sourceType": "git",
  "repoUrl": "https://github.com/anthropics/skills",
  "subpath": "skills/canvas-design",
  "installedAt": "2026-02-10T08:42:51.426Z"
}
```

---

## skills/shared-skills/canvas-design/LICENSE.txt

`skills/shared-skills/canvas-design/LICENSE.txt`

```

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

---

## skills/shared-skills/canvas-design/SKILL.md

`skills/shared-skills/canvas-design/SKILL.md`

```markdown
---
name: canvas-design
description: 运用设计哲学在 .png 与 .pdf 中创作高质量视觉作品。当用户要求制作海报、艺术作品、设计或其它静态视觉时使用本技能。创作原创视觉设计，不抄袭现有艺术家作品以避免版权问题。
license: Complete terms in LICENSE.txt
---

以下说明用于创建「设计哲学」——一种美学运动，并**通过视觉**表达。仅输出 .md、.pdf 和 .png 文件。

分两步完成：
1. 设计哲学撰写（.md 文件）
2. 在画布上实现该哲学（.pdf 或 .png 文件）

首先执行：

## 设计哲学撰写

先创建一个**视觉哲学**（不是版式或模板），将通过以下方式被诠释：
- 形态、空间、色彩、构图
- 图像、图形、形状、图案
- 极少量文字作为视觉点缀

### 核心理解
- **输入**：用户给出的微妙提示或要求，应作为基础考虑，但不限制创作自由。
- **产出**：一种设计哲学 / 美学运动。
- **下一步**：同一版本将接收该哲学并**用视觉表达**——产出约 90% 视觉设计、10% 必要文字的成果。

可参考流程：
- 为一场艺术运动写一份宣言
- 下一阶段是制作具体作品

哲学须强调：视觉表达、空间传达、艺术诠释、文字极简。

### 如何生成视觉哲学

**为运动命名**（1–2 个词）：如「Brutalist Joy」/「Chromatic Silence」/「Metabolist Dreams」

**阐述哲学**（4–6 段，简洁但完整）：

为抓住**视觉**本质，说明该哲学如何通过以下方面呈现：
- 空间与形态
- 色彩与材质
- 尺度与节奏
- 构图与平衡
- 视觉层级

**关键原则：**
- **避免重复**：每个设计维度只提一次。除非带来新深度，否则不要重复色彩理论、空间关系或字体原则。
- **反复强调工艺**：哲学必须多次强调——最终作品应看起来像经过无数小时打磨、由顶尖领域专家精心完成。措辞很重要，可重复使用「精心雕琢」「深厚专业的产物」「一丝不苟」「大师级执行」等表述。
- **留出创作空间**：在美学方向上具体，但足够简洁，让下一阶段在极高工艺水平上仍有诠释空间。

哲学必须引导下一阶段**用视觉**表达想法，而不是用文字。信息存在于设计中，而非段落里。

### 哲学示例

**「Concrete Poetry」**
哲学：通过纪念碑式的形态与大胆几何进行沟通。
视觉表达：大块色彩、雕塑感字体（巨大单词、细小标签）、粗野主义空间划分，波兰海报能量与勒·柯布西耶相遇。用视觉重量与空间张力表达想法，而非解释。文字作为稀少而有力的 gesture——从不用段落，只有必要词汇融入视觉结构。每个元素都像大师工匠般精准放置。

**「Chromatic Language」**
哲学：色彩作为主要信息系统。
视觉表达：色彩区域创造意义的几何精确。字体极简——小号无衬线标签，让色彩场域说话。类似 Josef Albers 的互动与数据可视化的结合。信息在空间与色彩上编码。文字仅用于锚定色彩已展示的内容。精心色彩校准的产物。

**「Analog Meditation」**
哲学：通过质感与呼吸空间实现安静的视觉沉思。
视觉表达：纸纹、墨迹、大量负空间。摄影与插画为主。字体低语（小、克制、服务视觉）。日式摄影书美学。图像在页面间呼吸。文字极少——短语，从无说明块。每幅构图都像冥想练习般平衡。

**「Organic Systems」**
哲学：自然聚类与模块化生长模式。
视觉表达：圆润形态、有机排布、从自然到建筑的色彩。通过视觉图表、空间关系、图标传达信息。文字仅作漂浮在空间中的关键标签。构图通过专业空间编排讲故事。

**「Geometric Silence」**
哲学：纯粹秩序与克制。
视觉表达：网格化精确、大胆摄影或 stark 图形、戏剧性负空间。字体精确但极简——小号必要文字、大块安静区域。瑞士形式主义与粗野主义材质诚实相遇。结构在沟通，不是文字。每一处对齐都是无数次打磨的结果。

*以上为浓缩示例。实际设计哲学应为 4–6 个充实段落。*

### 基本原则
- **视觉哲学**：创造一个通过设计表达的美学世界观
- **极简文字**：始终强调文字稀少、仅必要、作为视觉元素融入——从不过长
- **空间表达**：想法通过空间、形态、色彩、构图传达——而非段落
- **艺术自由**：下一阶段以视觉诠释哲学——需留出创作空间
- **纯粹设计**：这是在做**艺术对象**，不是带装饰的文档
- **专家工艺**：反复强调最终作品必须看起来精心雕琢、一丝不苟，由领域顶尖者投入无数小时完成

**设计哲学篇幅应为 4–6 段。** 用诗意的设计哲学填满核心愿景。避免重复同一观点。保持哲学通用，不点明作品具体意图，仿佛可随处运用。将设计哲学输出为 .md 文件。

---

## 推断微妙参照

**关键步骤**：在创建画布前，从原始请求中识别微妙的观念线索。

**核心原则**：
主题是**嵌入作品本身的微妙、小众参照**——不总是字面，但总是考究。熟悉该主题的人能直觉感受到，其他人则体验到一幅出色的抽象构图。设计哲学提供美学语言，推断出的主题提供灵魂——悄然织入形态、色彩与构图的观念 DNA。

**非常重要**：参照须提炼到能增加作品深度却不自我宣告。像爵士乐手引用另一首歌——只有懂的人能听出，但所有人都欣赏音乐。

---

## 画布创作

在哲学与观念框架都确立后，在画布上表达。花一点时间整理思路、清空杂念。运用已创建的设计哲学与以下说明，以专家级工艺完成一件作品，体现哲学的各个方面。

**重要**：无论用户请求的是何种内容（电影/游戏/书籍等），手法仍须考究。始终记住这是艺术，不是卡通或业余风格。

为达到博物馆或杂志级质量，以设计哲学为基础。通常制作单页、强视觉、设计导向的 PDF 或 PNG（除非要求多页）。可多用重复图案与完美几何形。将抽象哲学设计当作某种「科学圣经」的视觉语言——密集的笔触、重复元素或分层图案，通过耐心重复构建意义，值得长时间观看。加入稀疏、冷静的字体与系统性参照标记，暗示这可能是某门虚构学科的图表，以通常用于记录可观测现象的那种严谨对待不可见主题。用简单短语或细节微妙锚定画面，使用有限但意图明确、统一的配色。拥抱用分析性视觉语言表达人类经验这一悖论：结果应像一件证明某种转瞬即逝之物可被研究、绘制与理解的「物证」。这才是真正的艺术。

**文字作为情境元素**：文字始终极简且视觉优先，但由情境决定是低语式标签还是大胆字体 gesture。朋克场地海报可以比极简陶艺工作室标识更大、更张扬。大多数情况下字体应偏细。所有字体使用都须设计导向并优先视觉传达。无论字号大小，元素都不应溢出画布或重叠。所有文字、图形与视觉元素都须有呼吸空间与清晰分隔。这对专业执行是不可妥协的。**重要：若使用文字，请使用不同字体。在 `./canvas-fonts` 目录中查找。无论采用何种风格，考究度不可妥协。**

按需下载并使用字体以实现效果。让字体真正成为艺术的一部分——若作品偏抽象，把字体带上画布，而不是数字排版。

在遵循哲学的前提下，凭设计直觉推进边界。拥抱最大设计自由与选择。把美学与设计推到前沿。

**关键**：为达到「人工打磨」质感（而非 AI 生成感），让作品看起来像经过无数小时。像领域顶尖者在一丝不苟地打磨每个细节。确保构图、间距、色彩、字体——一切都在传达专家级工艺。再次检查无重叠、版式完美、每个细节到位。做出可以拿给人看、证明专业并令人信服的作品。

将最终结果输出为单份可下载的 .pdf 或 .png，并附上所用设计哲学的 .md 文件。

---

## 最后一步

**重要**：用户已经表示「还不够完美。必须一尘不染，像工艺杰作，仿佛即将在博物馆展出。」

**关键**：精修时避免增加更多图形；而是精炼已有内容，使其极其清晰，完全尊重设计哲学与极简原则。与其加滤镜或换字体，不如思考如何让现有构图更统一。若本能是调用新函数或画新形状，先停下来问：「如何让已有内容更像一件艺术品？」

做第二轮。回到代码进一步精修打磨，使其成为哲学驱动的杰作。

## 多页选项

当被要求增加页面时，按同一设计哲学创作更多有创意且各有差异的页面，打包进同一 .pdf 或多张 .png。将第一页视为整本画册中的一页。后续页面是对原作的独特变奏与记忆，以得体方式近乎讲故事。充分运用创作自由。

```

---

## skills/shared-skills/canvas-design/canvas-fonts/ArsenalSC-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/ArsenalSC-OFL.txt`

```
Copyright 2012 The Arsenal Project Authors (andrij.design@gmail.com)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/BigShoulders-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/BigShoulders-OFL.txt`

```
Copyright 2019 The Big Shoulders Project Authors (https://github.com/xotypeco/big_shoulders)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Boldonse-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Boldonse-OFL.txt`

```
Copyright 2024 The Boldonse Project Authors (https://github.com/googlefonts/boldonse)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/BricolageGrotesque-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/BricolageGrotesque-OFL.txt`

```
Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/CrimsonPro-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/CrimsonPro-OFL.txt`

```
Copyright 2018 The Crimson Pro Project Authors (https://github.com/Fonthausen/CrimsonPro)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/DMMono-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/DMMono-OFL.txt`

```
Copyright 2020 The DM Mono Project Authors (https://www.github.com/googlefonts/dm-mono)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/EricaOne-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/EricaOne-OFL.txt`

```
Copyright (c) 2011 by LatinoType Limitada (luciano@latinotype.com), 
with Reserved Font Names "Erica One"

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/GeistMono-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/GeistMono-OFL.txt`

```
Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font.git)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Gloock-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Gloock-OFL.txt`

```
Copyright 2022 The Gloock Project Authors (https://github.com/duartp/gloock)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/IBMPlexMono-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/IBMPlexMono-OFL.txt`

```
Copyright © 2017 IBM Corp. with Reserved Font Name "Plex"

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/InstrumentSans-OFL.txt`

```
Copyright 2022 The Instrument Sans Project Authors (https://github.com/Instrument/instrument-sans)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Italiana-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Italiana-OFL.txt`

```
Copyright (c) 2011, Santiago Orozco (hi@typemade.mx), with Reserved Font Name "Italiana".

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/JetBrainsMono-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/JetBrainsMono-OFL.txt`

```
Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Jura-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Jura-OFL.txt`

```
Copyright 2019 The Jura Project Authors (https://github.com/ossobuffo/jura)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/LibreBaskerville-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/LibreBaskerville-OFL.txt`

```
Copyright 2012 The Libre Baskerville Project Authors (https://github.com/impallari/Libre-Baskerville) with Reserved Font Name Libre Baskerville.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Lora-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Lora-OFL.txt`

```
Copyright 2011 The Lora Project Authors (https://github.com/cyrealtype/Lora-Cyrillic), with Reserved Font Name "Lora".

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/NationalPark-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/NationalPark-OFL.txt`

```
Copyright 2025 The National Park Project Authors (https://github.com/benhoepner/National-Park)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/NothingYouCouldDo-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/NothingYouCouldDo-OFL.txt`

```
Copyright (c) 2010, Kimberly Geswein (kimberlygeswein.com)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Outfit-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Outfit-OFL.txt`

```
Copyright 2021 The Outfit Project Authors (https://github.com/Outfitio/Outfit-Fonts)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/PixelifySans-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/PixelifySans-OFL.txt`

```
Copyright 2021 The Pixelify Sans Project Authors (https://github.com/eifetx/Pixelify-Sans)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/PoiretOne-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/PoiretOne-OFL.txt`

```
Copyright (c) 2011, Denis Masharov (denis.masharov@gmail.com)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/RedHatMono-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/RedHatMono-OFL.txt`

```
Copyright 2024 The Red Hat Project Authors (https://github.com/RedHatOfficial/RedHatFont)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Silkscreen-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Silkscreen-OFL.txt`

```
Copyright 2001 The Silkscreen Project Authors (https://github.com/googlefonts/silkscreen)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/SmoochSans-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/SmoochSans-OFL.txt`

```
Copyright 2016 The Smooch Sans Project Authors (https://github.com/googlefonts/smooch-sans)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/Tektur-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/Tektur-OFL.txt`

```
Copyright 2023 The Tektur Project Authors (https://www.github.com/hyvyys/Tektur)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/WorkSans-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/WorkSans-OFL.txt`

```
Copyright 2019 The Work Sans Project Authors (https://github.com/weiweihuanghuang/Work-Sans)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/canvas-design/canvas-fonts/YoungSerif-OFL.txt

`skills/shared-skills/canvas-design/canvas-fonts/YoungSerif-OFL.txt`

```
Copyright 2023 The Young Serif Project Authors (https://github.com/noirblancrouge/YoungSerif)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

```

---

## skills/shared-skills/document-to-pptx/SKILL.md

`skills/shared-skills/document-to-pptx/SKILL.md`

```markdown
---
name: document-to-pptx
description: 将 Markdown 或结构化文档转化为 PowerPoint 演示文稿。当用户要求将文档转成 PPT、制作演示文稿、从 outline/md 生成 .pptx、或需要「文档→幻灯片」转换时使用。
---

# 文档转 PPT

将 Markdown 或结构化 outline 文档转化为 `.pptx` 演示文稿。支持标准 Markdown 与「标题→开篇→要点/表格→本质」的 outline 格式。

## 快速决策

| 文档格式 | 工具 | 命令 |
|----------|------|------|
| 标准 Markdown（# 标题、## 幻灯片、无表格） | md2ppt | `md2ppt input.md output.pptx` |
| Outline 格式（含 **开篇**、表格、**本质**） | 转换脚本 | `python scripts/doc_to_pptx.py input.md output.pptx` |

## 标准 Markdown 格式（md2ppt）

适用于简单幻灯片，无表格。

**安装**：`pip install md2ppt`

**约定**：
- `# Title` 或 `# Title: Subtitle` → 封面
- `## Heading` → 内容页标题
- `- item` → 无序列表
- `1. item` → 有序列表
- 普通段落 → 正文

**示例**：
```markdown
# 我的演讲: 副标题

## 第一页

- 要点一
- 要点二

## 第二页

1. 第一步
2. 第二步
```

**执行**：`md2ppt input.md output.pptx`

## Outline 格式（含表格）

适用于「标题→开篇→要点/表格→本质」结构，如 `*-ppt-outline.md` 文档。

**结构约定**：
- `## 封面` → 封面页；`**标题**`、`**副标题**`
- `## 第 N 页：标题` 或 `## 标题` → 内容页
- `**开篇**` → 开篇陈述
- `**典型场景**` / `**核心特征**` → 要点或表格
- `**本质**` → 总结句
- `---` → 幻灯片分隔符（可选）

**执行**：使用 `scripts/doc_to_pptx.py`（见下方）。

## 转换脚本用法

```bash
# 从项目根目录
# 指定输出路径
python .cursor/skills/document-to-pptx/scripts/doc_to_pptx.py handbook/xxx-ppt-outline.md output.pptx

# 输出路径可选：未指定时，输入目录名为 handbook 时 → handbook/ppt/ 输出；否则同目录
python .cursor/skills/document-to-pptx/scripts/doc_to_pptx.py handbook/xxx-ppt-outline.md
# → 生成 handbook/ppt/xxx.pptx（ppt 文件夹不存在时会自动创建）
```

脚本自动识别 outline 格式，解析封面、开篇、表格、本质，生成 `.pptx`。

**输出风格**：简洁风格——纯文字排版，无装饰线；封面标题黑、正文深灰、表头蓝底白字；突出内容本身。参考「开发者使用 AI 的能力层级」PPT。

**通用样式**（字体、字号、间距、表格规格）见 [reference.md 通用样式规范](reference.md#通用样式规范)。

**依赖**：`pip install python-pptx`

## 工作流

1. **确认格式**：标准 Markdown 用 md2ppt；含表格/开篇/本质用脚本。
2. **生成或整理文档**：若需从长文档提炼，可先让 AI 按 outline 格式输出，再转换。
3. **执行转换**：运行对应命令。
4. **检查输出**：用 PowerPoint/Keynote 打开 `.pptx` 检查版式与表格。

## 从长文档提炼 Outline

若用户提供长文档（如 `developer-ai-capability-levels.md`），先提炼为 outline 再转换：

1. 提取核心结构：封面、各页标题、开篇、要点/表格、本质。
2. 按 outline 格式输出到 `*-ppt-outline.md`。
3. 用脚本转换为 `.pptx`。

**Outline 模板**（每页）：
```markdown
## 第 N 页：页面标题

**开篇**：一句话开篇。

**核心特征**（或典型场景）：
| 维度 | 说明 |
|------|------|
| 项一 | 说明一 |
| 项二 | 说明二 |

**本质**：一句话总结。
```

## 附加资源

- 格式与 API 详情见 [reference.md](reference.md)
- 示例文档可放在任意工作目录的 `*-ppt-outline.md`

```

---

## skills/shared-skills/document-to-pptx/reference.md

`skills/shared-skills/document-to-pptx/reference.md`

```markdown
# 文档转 PPT 参考

## 通用样式规范

参考「开发者使用 AI 的能力层级」PPT，适用于 Outline 转换脚本的简洁风格。以下数值可直接用于 `doc_to_pptx.py` 的 `THEME` 及布局常量。

### 幻灯片与布局

| 项 | 值 | 说明 |
|----|----|------|
| 尺寸 | 16:9 | 13.333" × 7.5" |
| 页边距 | 0.75" | 左右对称 |
| 内容区顶部 | 0.5" | 内容页首行起算 |
| 底部留白 | 0.6" | 内容区下边界 |
| 标题与正文间距 | 0.2" | GAP_TITLE_BODY |
| 区块间间距 | 0.25" | 开篇/表格/要点之间 |
| 主体与本质间距 | 0.2" | 表格或要点到本质 |
| 文本框内边距 | 0.05" | text_frame margin |

### 字体与字号

| 元素 | 字号 | 颜色 | 粗细 | 行距 |
|------|------|------|------|------|
| 封面标题 | 48pt | #000000 | 粗体 | 1.2 |
| 封面副标题 | 20pt | #666666 | 常规 | 1.35 |
| 内容页标题 | 22pt | #333333 | 粗体 | 1.2 |
| 开篇 / 正文 | 15pt | #333333 | 常规 | 1.35 |
| 要点列表 | 13pt | #333333 | 常规 | 1.3 |
| 本质总结 | 12pt | #666666 | 常规+斜体 | 1.35 |
| 段后间距 | 8pt | — | — | — |

**中文字体**：Microsoft YaHei（西文）+ 宋体（东亚备选）

### 表格

| 项 | 值 | 说明 |
|----|----|------|
| 表头背景 | #1E6FFF | 蓝色 |
| 表头字体 | #FFFFFF 12pt 粗体 | 白字 |
| 表身字体 | #333333 11pt | 深灰 |
| 表头行高 | 0.45" | 约 411531 EMU |
| 表身行高 | 0.33" | 约 304838 EMU |
| 单元格左右内边距 | 0.06" | 54864 EMU |
| 单元格上下内边距 | 0.05" | 45720 EMU |
| 表格行距 | 1.25 | 或 PPT 中的 2.0（视排版需求） |
| 表格段后 | 2pt | 单元格内段落 |

### 颜色速查

| 用途 | 色值 | RGB |
|------|------|-----|
| 纯黑（封面标题） | #000000 | (0, 0, 0) |
| 深灰（内容标题/正文） | #333333 | (51, 51, 51) |
| 中灰（副标题/本质） | #666666 | (102, 102, 102) |
| 表头背景 | #1E6FFF | (30, 111, 255) |
| 表头字体 | #FFFFFF | (255, 255, 255) |

---

## 格式规范

### Outline 格式解析规则

| 模式 | 正则/匹配 | 含义 |
|------|-----------|------|
| 封面 | `## 封面` | 封面页开始 |
| 标题 | `**标题**：xxx` | 封面主标题 |
| 副标题 | `**副标题**：xxx` | 封面副标题 |
| 内容页 | `## 第 N 页：xxx` 或 `## xxx` | 内容页标题 |
| 开篇 | `**开篇**：xxx` | 开篇陈述段落 |
| 要点区块 | `**典型场景**` / `**核心特征**` 等 | 后接列表或表格 |
| 本质 | `**本质**：xxx` | 总结句 |
| 分隔 | `---` | 幻灯片分隔（可选） |

### Markdown 表格解析

标准 GFM 表格：
```
| 列1 | 列2 |
|-----|-----|
| A   | B   |
```

脚本按行解析，首行为表头，`|-----|` 为分隔行（跳过），后续为数据行。

## python-pptx API 速查

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.add_slide(prs.slide_layouts[6])  # 空白布局

# 标题
title = slide.shapes.title
title.text = "标题"

# 正文（需用 add_textbox）
txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(9), Inches(1))
tf = txBox.text_frame
tf.text = "段落一"
p = tf.add_paragraph()
p.text = "段落二"

# 表格 rows x cols
table = slide.shapes.add_table(rows=3, cols=2, left=Inches(0.5), top=Inches(2), width=Inches(9), height=Inches(2)).table
table.cell(0, 0).text = "表头1"
table.cell(0, 1).text = "表头2"

prs.save("output.pptx")
```

## md2ppt 约定（标准 Markdown）

- 不支持表格、粗体、链接、代码块
- 仅支持：`#`、`##`、`-`、`1.`、普通段落
- 详见：https://github.com/haasr/md2ppt

```

---

## skills/shared-skills/document-to-pptx/scripts/doc_to_pptx.py

`skills/shared-skills/document-to-pptx/scripts/doc_to_pptx.py`

```python
#!/usr/bin/env python3
"""
将 Outline 格式的 Markdown 文档转换为 .pptx 演示文稿。
支持：封面、开篇、要点列表、Markdown 表格、本质总结。

用法: python doc_to_pptx.py input.md [output.pptx]
       output 可选，未指定时输出到输入文件同目录，扩展名改为 .pptx
依赖: pip install python-pptx
"""

import re
import sys
from pathlib import Path

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
except ImportError:
    print("请先安装: pip install python-pptx")
    sys.exit(1)

# 排版主题：简洁风格，标题字号与颜色分层
# 层级：封面标题(最大最深) > 内容页标题(次之) > 副标题/表头(再次) > 正文
THEME = {
    "cover_title": RGBColor(0, 0, 0),           # 封面标题：纯黑 #000，最醒目
    "cover_subtitle": RGBColor(102, 102, 102),  # 封面副标题：中灰 #666
    "content_title": RGBColor(51, 51, 51),     # 内容页标题：深灰 #333，明显浅于封面纯黑
    "text": RGBColor(51, 51, 51),              # 正文：深灰 #333
    "text_light": RGBColor(102, 102, 102),     # 次要文字/本质：中灰 #666
    "table_header_bg": RGBColor(30, 111, 255),  # 表头背景 #1e6fff
    "table_header_font": RGBColor(255, 255, 255),  # 表头白色字体
    "font_cjk": "Microsoft YaHei",
    "cover_title_size": 48,    # 封面标题：最大（与参考 PPT 一致）
    "cover_subtitle_size": 20, # 封面副标题
    "content_title_size": 22,  # 内容页标题：小于封面，与正文区分
}

# 16:9 标准尺寸（英寸）
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)
MARGIN = Inches(0.75)
CONTENT_WIDTH = SLIDE_WIDTH - MARGIN * 2

# 内容页排版
CONTENT_TOP = Inches(0.5)       # 内容区顶部
BOTTOM_MARGIN = Inches(0.6)    # 底部留白
CONTENT_BOTTOM = SLIDE_HEIGHT - BOTTOM_MARGIN
GAP_TITLE_BODY = Inches(0.2)   # 标题与正文间距
GAP_SECTION = Inches(0.25)     # 区块间间距（开篇/表格/要点 与下一区块）
GAP_BODY_ESSENCE = Inches(0.2) # 主体与本质间距
TF_MARGIN = Inches(0.05)       # 文本框内边距

# 行距：1.0=单倍 1.25=1.25倍 1.5=1.5倍，提升可读性
LINE_SPACING_TITLE = 1.2    # 标题行距
LINE_SPACING_BODY = 1.35    # 正文/开篇行距
LINE_SPACING_ITEM = 1.3     # 要点列表行距
LINE_SPACING_TABLE = 1.25   # 表格单元格行距
PARA_SPACING_AFTER = Pt(8)  # 段后间距

# Outline 格式配置（可扩展，支持多语言/多变体）
# 结构：**key**：content → 按 key 映射到 opening / essence / items
# 任意 **key**： 未在 opening/essence 中 → 自动归入 items，无需预定义
FORMAT = {
    "cover": "封面",                    # ## 封面 区块标识
    "title": "标题",                    # 封面 **标题**：
    "subtitle": "副标题",               # 封面 **副标题**：
    "opening_keys": ("开篇", "一句话"),  # 任一匹配 → opening，可扩展
    "essence_keys": ("本质", "总结", "结论"),  # 任一匹配 → essence，可扩展
    "essence_label": "本质",            # 渲染前缀，空串则不加前缀
}

# 英文预设：切换时用 FORMAT = FORMAT_EN 替换上方 FORMAT
FORMAT_EN = {
    "cover": "Cover",
    "title": "Title",
    "subtitle": "Subtitle",
    "opening_keys": ("Opening", "Summary", "One-liner"),
    "essence_keys": ("Essence", "Takeaway", "Conclusion", "Key Point"),
    "essence_label": "Essence",
}


def parse_outline(md_text: str) -> list[dict]:
    """解析 outline 格式，返回幻灯片列表。"""
    slides = []
    blocks = re.split(r'\n---+\n', md_text)
    current_slide = None

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # 封面
        if block.startswith(f"## {FORMAT['cover']}"):
            current_slide = {"type": "cover", "title": "", "subtitle": ""}
            for line in block.split("\n"):
                if m := re.match(rf"\*\*{re.escape(FORMAT['title'])}\*\*[：:]\s*(.+)", line):
                    current_slide["title"] = m.group(1).strip()
                elif m := re.match(rf"\*\*{re.escape(FORMAT['subtitle'])}\*\*[：:]\s*(.+)", line):
                    current_slide["subtitle"] = m.group(1).strip()
            slides.append(current_slide)
            current_slide = None
            continue

        # 内容页：## 第 N 页：标题 或 ## 标题
        if m := re.match(r"##\s+(?:第\s*\d+\s*页[：:]\s*)?(.+)", block):
            if current_slide:
                slides.append(current_slide)
            title = m.group(1).strip()
            rest = block[m.end() :].strip()
            current_slide = {"type": "content", "title": title, "opening": "", "items": [], "table": None, "essence": ""}

            # 解析 **key**：content → 按 key 映射到 opening / essence / items（通用）
            section = None
            lines = rest.split("\n")
            i = 0
            _opening_keys = set(FORMAT["opening_keys"])
            _essence_keys = set(FORMAT["essence_keys"])
            _special_keys = _opening_keys | _essence_keys

            while i < len(lines):
                line = lines[i]
                # **key**：content（有内容）
                if m := re.match(r"\*\*([^*]+)\*\*[：:]\s*(.+)", line):
                    key, content = m.group(1).strip(), m.group(2).strip()
                    if key in _opening_keys:
                        current_slide["opening"] = content
                        section = None
                    elif key in _essence_keys:
                        current_slide["essence"] = content
                        section = None
                    else:
                        current_slide["items"].append(f"{key}：{content}")
                        section = "items"
                # **key**： 或 **key**（无内容，开启 items 区块以接收后续 - 列表）
                elif m := re.match(r"\*\*([^*]+)\*\*[：:]?\s*$", line):
                    key = m.group(1).strip()
                    if key not in _special_keys:
                        section = "items"
                elif line.strip().startswith("|") and "|" in line:
                    # Markdown 表格
                    if not current_slide.get("table"):
                        current_slide["table"] = []
                    row = [c.strip() for c in line.split("|")[1:-1]]
                    if row and not all(re.match(r"^[-:]+$", c) for c in row):
                        current_slide["table"].append(row)
                    section = None
                elif section == "items" and line.strip().startswith("-"):
                    current_slide["items"].append(line.strip()[1:].strip())
                elif section == "items" and re.match(r"^\d+\.", line.strip()):
                    current_slide["items"].append(re.sub(r"^\d+\.\s*", "", line.strip()))
                i += 1

            if current_slide:
                slides.append(current_slide)
            current_slide = None

    return slides


def strip_md_bold(text: str) -> str:
    """移除 **bold** 标记，保留文本。"""
    return re.sub(r"\*\*(.+?)\*\*", r"\1", text)


def apply_font(p, size: int, bold: bool = False, color=None, line_spacing=None, space_after=None):
    """统一应用字体样式（支持中文）。line_spacing: 1.0=单倍 1.25=1.25倍。"""
    p.font.name = THEME["font_cjk"]
    p.font.size = Pt(size)
    p.font.bold = bold
    if color:
        p.font.color.rgb = color
    p.space_after = space_after if space_after is not None else PARA_SPACING_AFTER
    if line_spacing is not None:
        p.line_spacing = line_spacing


def add_slide_content(prs, slide_data: dict):
    """根据 slide_data 添加一页幻灯片（优化排版）。"""
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    left, top = MARGIN, Inches(0.6)
    width = CONTENT_WIDTH

    if slide_data["type"] == "cover":
        # 封面：垂直居中、大标题、副标题（无装饰）
        title_h, subtitle_h = Inches(1.2), Inches(0.8)
        block_h = title_h + (subtitle_h if slide_data["subtitle"] else 0) + Inches(0.2)
        start_y = (SLIDE_HEIGHT - block_h) / 2 - Inches(0.2)  # 垂直居中略偏上
        tb = slide.shapes.add_textbox(left, start_y, width, title_h)
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = strip_md_bold(slide_data["title"])
        p.alignment = 1  # PP_ALIGN.CENTER
        apply_font(p, THEME["cover_title_size"], bold=True, color=THEME["cover_title"], line_spacing=LINE_SPACING_TITLE)
        if slide_data["subtitle"]:
            sub_y = start_y + title_h + Inches(0.15)
            tb2 = slide.shapes.add_textbox(left, sub_y, width, subtitle_h)
            tf2 = tb2.text_frame
            tf2.word_wrap = True
            p2 = tf2.paragraphs[0]
            p2.text = strip_md_bold(slide_data["subtitle"])
            p2.alignment = 1
            apply_font(p2, THEME["cover_subtitle_size"], bold=False, color=THEME["cover_subtitle"], line_spacing=LINE_SPACING_BODY)
        return

    # 内容页：使用布局常量
    y = CONTENT_TOP
    # 标题
    tb = slide.shapes.add_textbox(left, y, width, Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = TF_MARGIN
    p = tf.paragraphs[0]
    p.text = strip_md_bold(slide_data["title"])
    apply_font(p, THEME["content_title_size"], bold=True, color=THEME["content_title"], line_spacing=LINE_SPACING_TITLE)
    y += Inches(0.75) + GAP_TITLE_BODY

    # 开篇
    if slide_data.get("opening"):
        tb = slide.shapes.add_textbox(left, y, width, Inches(1.0))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = TF_MARGIN
        p = tf.paragraphs[0]
        p.text = strip_md_bold(slide_data["opening"])
        apply_font(p, 15, bold=False, color=THEME["text"], line_spacing=LINE_SPACING_BODY)
        y += Inches(1.05) + GAP_SECTION

    # 表格：表头蓝底 #1e6fff 白字，内容行统一深灰无颜色区分
    if slide_data.get("table") and len(slide_data["table"]) > 0:
        rows, cols = len(slide_data["table"]), len(slide_data["table"][0])
        row_h = Inches(0.4)
        table_h = min(row_h * rows, Inches(3.0))
        table_shape = slide.shapes.add_table(rows, cols, left, y, width, table_h)
        table = table_shape.table
        for r, row in enumerate(slide_data["table"]):
            for c, cell_text in enumerate(row[:cols]):
                cell = table.cell(r, c)
                cell.text = strip_md_bold(cell_text)
                para = cell.text_frame.paragraphs[0]
                apply_font(para, 11 if r > 0 else 12, bold=(r == 0),
                          color=THEME["table_header_font"] if r == 0 else THEME["text"],
                          line_spacing=LINE_SPACING_TABLE, space_after=Pt(2))
                cell.text_frame.margin_left = Inches(0.06)
                cell.text_frame.margin_right = Inches(0.06)
                cell.text_frame.margin_top = Inches(0.05)
                cell.text_frame.margin_bottom = Inches(0.05)
                if r == 0:
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = THEME["table_header_bg"]
        table.rows[0].height = Inches(0.45)
        y += table_h + GAP_BODY_ESSENCE
    # 要点列表
    elif slide_data.get("items"):
        items_h = min(Inches(0.35) * len(slide_data["items"]), CONTENT_BOTTOM - y - Inches(0.9))
        items_h = max(items_h, Inches(0.8))
        tb = slide.shapes.add_textbox(left, y, width, items_h)
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = TF_MARGIN
        for i, item in enumerate(slide_data["items"]):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.text = f"• {strip_md_bold(item)}"
            apply_font(p, 13, bold=False, color=THEME["text"], line_spacing=LINE_SPACING_ITEM)
        y += items_h + GAP_BODY_ESSENCE

    # 本质：纯文字，无背景框
    if slide_data.get("essence"):
        tb = slide.shapes.add_textbox(left, y, width, Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = TF_MARGIN
        p = tf.paragraphs[0]
        p.text = f"{FORMAT['essence_label']}：{strip_md_bold(slide_data['essence'])}"
        apply_font(p, 12, bold=False, color=THEME["text_light"], line_spacing=LINE_SPACING_BODY)
        p.font.italic = True


def main():
    if len(sys.argv) < 2:
        print("用法: python doc_to_pptx.py input.md [output.pptx]")
        sys.exit(1)
    input_path = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        # 未指定输出时：handbook 下输入 → handbook/ppt/ 输出；否则同目录
        stem = input_path.stem
        if stem.endswith("-ppt-outline"):
            stem = stem.removesuffix("-ppt-outline")
        out_dir = (input_path.parent / "ppt") if input_path.parent.name == "handbook" else input_path.parent
        output_path = out_dir / f"{stem}.pptx"
    if not input_path.exists():
        print(f"文件不存在: {input_path}")
        sys.exit(1)

    md_text = input_path.read_text(encoding="utf-8")
    slides = parse_outline(md_text)
    if not slides:
        print("未解析到任何幻灯片，请检查文档格式。")
        sys.exit(1)

    prs = Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT
    for s in slides:
        add_slide_content(prs, s)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(output_path))
    print(f"已生成: {output_path} ({len(slides)} 页)")


if __name__ == "__main__":
    main()

```

---

## skills/shared-skills/frontend-code-review/SKILL.md

`skills/shared-skills/frontend-code-review/SKILL.md`

```markdown
---
name: frontend-code-review
description: "用于审查本仓 Vue 3 + TypeScript 前端代码（含组件、API、路由、Pinia、composable）是否符合当前项目规范与编码流程。适用于增量变更审查、指定文件审查、提交前风险检查，并重点检查组件拆分、目录职责、命名约定与可维护性问题。"
---

# Frontend Code Review（项目规范版）

## 核心目标

执行前端代码审查时，优先发现：

- 会导致线上故障或功能回归的缺陷
- 与项目既有规范冲突的实现
- 组件拆分不合理导致的可维护性问题
- API、路由、Store、页面分层职责错位问题
- 缺少必要测试/验证步骤带来的发布风险

## 适用场景

当用户提出以下需求时使用本技能：

- “代码审查 / review / 提交前检查 / 评审这个 PR”
- “帮我看组件拆分是否合理”
- “这个页面要不要拆组件 / 抽 composable / 下沉 store”
- “检查是否符合项目规范”

支持模式：

1. **增量审查**：基于 `git diff --cached` / `git diff` 审查变更
2. **指定文件审查**：仅审查用户给定文件
3. **专项审查**：只做组件拆分、命名规范、路由组织等单项检查

## 审查前置（必须执行）

开始审查前，先读取并对齐项目规则（以 `.agents/rules/project-rules` 为准）：

- `01-project-overview.mdc`（项目与技术栈背景）
- `02-coding-style.mdc`（TypeScript、命名、函数命名）
- `03-project-structure.mdc`（目录职责）
- `04-component-guide.mdc`（组件拆分与放置）
- `05-api-guide.mdc`（API 封装与命名）
- `06-routing-guide.mdc`（路由模块化）
- `07-state-management.mdc`（Pinia 组织）
- `08-common-constraints.mdc`（通用约束）
- `09-styling-guide.mdc`（样式规范）
- `11-testing-guide.mdc`（测试要求）

如用户未指定仓库规范，默认按以上规则审查，不使用“通用前端最佳实践”替代项目规范。

## 审查流程（按编码链路）

### 步骤 1：确认审查范围

- 增量审查：获取变更文件列表（`ACMR`）
- 指定文件审查：仅分析用户传入路径
- 排除无关产物文件（如时间戳构建产物、生成文件）

### 步骤 2：按“业务流程链路”分组审查

优先从“数据流和职责链路”判断问题，而不是逐文件孤立检查：

1. 视图/组件（`views`、`components`）
2. 组合函数（`composable`/`hooks`）
3. 状态管理（`stores`）
4. 接口层（`api`）
5. 路由层（`router`）
6. 类型与常量（`types`、`constant`）

### 步骤 3：执行分层检查清单

#### A. 通用必检（所有前端文件）

- TypeScript 类型是否完整，是否引入不必要 `any`
- 命名是否符合约定（`onXxx`/`handleXxx`、`useXxx`、PascalCase 等）
- 是否出现重复错误处理（如业务层重复弹错误）
- 是否有明显性能/安全/可访问性隐患

#### B. 组件拆分专项（重点）

组件审查必须覆盖以下维度：

- **职责单一**：组件是否承担过多业务流程、请求编排、状态聚合
- **放置正确**：页面私有组件是否错误放入 `src/components`
- **拆分阈值**：大体量页面/组件是否应拆为子组件与 composable
- **接口边界**：Props/Emits 是否清晰，是否存在“透传过深/双向耦合”
- **状态边界**：页面临时状态是否被错误提升到 Store，或跨页状态未进 Store
- **可复用性**：通用逻辑是否沉淀到 composable / 通用组件

可直接使用以下判断信号提出问题：

- 单个组件出现“列表 + 弹窗 + 表单 + API 请求 + 权限判断 + 路由跳转”全包
- 页面内部独占组件被抽成全局组件
- 组件 Props 超过合理规模且语义不清晰
- 多处复制粘贴逻辑未抽离
- 同一业务状态在组件、Store、URL 查询中多点维护

#### C. API / 路由 / Store 流程检查

- API：命名是否为 `get/create/update/deleteXxx` 体系，是否有类型声明
- 路由：是否模块化组织、懒加载、path/name 命名规范
- Store：是否仅承载跨组件/跨页面状态，避免塞入页面局部状态
- 目录：代码放置是否符合 `src` 结构职责，是否有“错层”

### 步骤 4：分级与输出

## 严重级别定义

- **Critical（阻塞）**
  - 可导致功能错误、数据错误、严重回归
  - 明确违反项目硬性规范（NON-NEGOTIABLE）
- **Warning（重要）**
  - 当前可运行，但存在中高概率维护风险或规范偏差
- **Suggestion（建议）**
  - 可优化项，不影响当前正确性

## 输出格式（必须遵循）

### A. 有问题时

```markdown
# 前端代码审查报告（项目规范版）

审查范围：<N> 个文件
问题统计：Critical <n> | Warning <n> | Suggestion <n>

## 关键结论
- <1-3 条最重要结论，优先阻塞问题>

## Findings（按严重级别排序）

### [Critical] <一句话问题标题>
- 文件：`<path>`
- 规则依据：`<project-rule 或 reference>`
- 问题说明：<为什么这是问题 + 可能影响>
- 建议修复：<可执行修复方向>

### [Warning] <一句话问题标题>
- 文件：`<path>`
- 规则依据：`<project-rule 或 reference>`
- 问题说明：<说明>
- 建议修复：<修复方向>

### [Suggestion] <一句话建议标题>
- 文件：`<path>`
- 规则依据：`<project-rule 或 reference>`
- 优化建议：<建议>

## 测试与验证建议
- <应补充的测试、手工回归点或验证命令>
```

要求：

- 先给 Findings，再给总结
- 一条问题只表达一个核心缺陷
- 优先指出“组件拆分与职责边界”问题
- 问题超过 15 条时，保留最关键 15 条并汇总剩余项

### B. 无问题时

```markdown
# 前端代码审查报告（项目规范版）

审查范围：<N> 个文件

未发现阻塞或重要规范问题，当前实现与项目规则基本一致。

仍建议关注：
- <可选的 1-2 条后续优化建议；若无可写“暂无”>
```

## 交互与追问策略

若发现组件拆分问题但上下文不足，必须补充追问后再下结论：

- “该组件是否仅在当前页面使用？若是，建议回收至页面目录。”
- “这段状态是否需要跨页面共享？若不需要建议下沉为页面局部状态。”
- “是否希望我给出拆分方案（子组件清单 + composable 拆分建议）？”

在审查结束时可追加：

1. 全部修复  
2. 仅修复 Critical  
3. 仅修复组件拆分相关问题  
4. 先给拆分方案，不直接改代码

## 参考清单（按需读取）

- `references/vue-component.md`
- `references/typescript.md`
- `references/composition-api.md`
- `references/pinia.md`
- `references/vue-router.md`
- `references/performance.md`
- `references/security-a11y.md`

```

---

## skills/shared-skills/frontend-code-review/references/composition-api.md

`skills/shared-skills/frontend-code-review/references/composition-api.md`

```markdown
# 规则目录 — Composition API 最佳实践（项目规范版）

本文件用于审查 composable 设计是否符合本仓编码流程，重点关注“逻辑抽离边界”和“与组件/Store/API 的职责分层”。

---

## reactive 不能用于原始值

IsUrgent: Critical
Category: Composition API

### 描述

`reactive()` 只能用于对象类型（对象、数组、Map、Set），不能用于原始值（字符串、数字、布尔值）。对于原始值必须使用 `ref()`。

### 错误示例

```vue
<script setup lang="ts">
import { reactive } from 'vue'

// 错误：reactive 不能用于原始值
const count = reactive(0)
const name = reactive('hello')
const isActive = reactive(true)
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

// 正确：原始值使用 ref
const count = ref(0)
const name = ref('hello')
const isActive = ref(true)

// 正确：对象使用 reactive
const state = reactive({
  count: 0,
  name: 'hello',
  isActive: true
})
</script>
```

---

## 禁止解构 reactive 对象

IsUrgent: Critical
Category: Composition API

### 描述

直接解构 `reactive` 对象会导致响应性丢失。如果需要解构，必须使用 `toRefs()` 或 `toRef()` 将属性转换为 ref。

### 错误示例

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue'
})

// 错误：解构会丢失响应性
const { count, name } = state

// 错误：赋值给局部变量也会丢失响应性
let localCount = state.count
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { reactive, toRefs, toRef } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue'
})

// 正确：使用 toRefs 解构
const { count, name } = toRefs(state)

// 正确：使用 toRef 获取单个属性
const count = toRef(state, 'count')

// 正确：直接使用 state.count
console.log(state.count)
</script>
```

---

## Props 传递必须保持响应性

IsUrgent: Critical
Category: Composition API

### 描述

将 props 传递给 composable 或函数时，不能直接传递解构后的值，否则会丢失响应性。应该传递整个 props 对象、使用 `toRef()`、或传递 getter 函数。

### 错误示例

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '@/composables/useUser'

const props = defineProps<{
  userId: number
}>()

// 错误：解构的 userId 会丢失响应性
const { userId } = props
const user = useUser(userId) // userId 变化时不会更新

// 错误：直接传递 props 属性
const user = useUser(props.userId) // 同样丢失响应性
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { toRef, computed } from 'vue'
import { useUser } from '@/composables/useUser'

const props = defineProps<{
  userId: number
}>()

// 正确方案 1：使用 toRef
const userId = toRef(props, 'userId')
const user = useUser(userId)

// 正确方案 2：传递 getter 函数
const user = useUser(() => props.userId)

// 正确方案 3：传递整个 props 对象
const user = useUser(props)
</script>
```

---

## Composable 命名必须以 use 开头

IsUrgent: Warning
Category: Composition API

### 描述

Composable 函数必须以 `use` 前缀命名（如 `useUser`、`useFetch`）。这是 Vue 生态系统的约定，有助于识别哪些函数是 composable。

### 错误示例

```typescript
// 错误：没有 use 前缀
export function fetchUser(id: number) {
  const user = ref(null)
  // ...
  return { user }
}

export function userState() {
  // ...
}
```

### 正确示例

```typescript
// 正确：以 use 开头
export function useUser(id: Ref<number>) {
  const user = ref(null)
  // ...
  return { user }
}

export function useFetch<T>(url: string) {
  // ...
}
```

---

## 页面可复用业务逻辑应优先抽离到 composable

IsUrgent: Warning
Category: Composition API

### 描述

当同类业务逻辑在多个页面/组件出现，或单页面组件逻辑过重时，应优先抽离到 `src/composable/`（或项目约定目录）：

- 状态组织
- 请求编排
- 表单/筛选流程
- 监听与副作用管理

避免把可复用流程长期留在页面 SFC 内部。

### 典型风险信号

- 两个页面复制了同一段请求与状态逻辑
- 组件 `setup` 过长且混合展示逻辑与业务流程
- 同一逻辑改动时需要多处同步修改

---

## Composable 不应直接承担页面路由跳转决策

IsUrgent: Warning
Category: Composition API

### 描述

Composable 可接收路由参数或返回状态，但不应隐式承担页面级导航策略（例如内部直接 `router.push('/xxx')` 作为默认行为），除非其职责就是导航封装。

推荐：

- composable 返回业务结果和状态
- 页面容器决定是否跳转、跳去哪里

这样可降低隐式副作用和复用成本。

---

## Composable 与 Store 的职责边界必须清晰

IsUrgent: Warning
Category: Composition API

### 描述

Composable 负责业务流程编排，Store 负责跨组件/跨页面共享状态。审查时需避免：

- composable 内部大量直接改写多个 Store，形成隐藏耦合
- 将页面私有状态提前提升到 Store，导致全局污染
- 既放在 composable 又放在 Store 的重复状态源

优先保证单一真实来源（single source of truth）。

---

## Composable 必须返回响应式状态

IsUrgent: Warning
Category: Composition API

### 描述

Composable 应该返回一个包含 ref 的对象，而不是返回 reactive 对象。这样调用者可以按需解构，并且保持与其他 composable 的一致性。

### 错误示例

```typescript
// 错误：返回 reactive 对象
export function useUser(id: Ref<number>) {
  const state = reactive({
    user: null,
    loading: false,
    error: null
  })
  
  return state // 调用者解构会丢失响应性
}
```

### 正确示例

```typescript
// 正确：返回包含 ref 的对象
export function useUser(id: Ref<number>) {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  // ...
  
  return {
    user,
    loading,
    error
  }
}

// 调用者可以安全解构
const { user, loading, error } = useUser(userId)
```

---

## Composable 中的副作用必须清理

IsUrgent: Warning
Category: Composition API

### 描述

Composable 中注册的事件监听器、定时器、订阅等副作用必须在 `onUnmounted` 或 `onScopeDispose` 中清理，防止内存泄漏。

### 错误示例

```typescript
// 错误：没有清理副作用
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  
  // 事件监听器没有被移除
  window.addEventListener('resize', () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  })
  
  return { width, height }
}
```

### 正确示例

```typescript
import { ref, onUnmounted, onScopeDispose } from 'vue'

// 正确：清理副作用
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  
  const handleResize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }
  
  window.addEventListener('resize', handleResize)
  
  // 组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
  
  // 或使用 onScopeDispose（在 effectScope 中也能正确清理）
  onScopeDispose(() => {
    window.removeEventListener('resize', handleResize)
  })
  
  return { width, height }
}
```

---

## 避免在 Composable 中直接修改全局状态

IsUrgent: Warning
Category: Composition API

### 描述

Composable 应该是可复用且可测试的。避免在 composable 内部直接修改 Pinia store 或其他全局状态，这会创建隐藏的依赖关系，降低可复用性。

### 错误示例

```typescript
import { useUserStore } from '@/stores/user'

// 错误：直接修改全局状态
export function useLogin() {
  const userStore = useUserStore()
  
  async function login(credentials: Credentials) {
    const user = await api.login(credentials)
    // 隐藏的副作用：直接修改全局 store
    userStore.setUser(user)
    userStore.setToken(user.token)
  }
  
  return { login }
}
```

### 正确示例

```typescript
// 正确方案 1：返回数据让调用者决定如何处理
export function useLogin() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  async function login(credentials: Credentials) {
    loading.value = true
    error.value = null
    try {
      const user = await api.login(credentials)
      return user // 返回数据，不直接修改 store
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }
  
  return { login, loading, error }
}

// 调用者自行处理 store 更新
const { login, loading, error } = useLogin()
const userStore = useUserStore()

async function handleLogin() {
  const user = await login(credentials)
  if (user) {
    userStore.setUser(user)
  }
}
```

---

## computed 必须是纯函数

IsUrgent: Warning
Category: Composition API

### 描述

`computed` 属性必须是纯函数，只根据响应式依赖进行计算，不应该产生任何副作用（如修改其他状态、发起 API 请求、操作 DOM）。

### 错误示例

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const log = ref<string[]>([])

// 错误：computed 中有副作用
const doubleCount = computed(() => {
  log.value.push(`计算了 doubleCount`) // 副作用：修改其他状态
  console.log('computing...') // 副作用：console.log
  return count.value * 2
})
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const count = ref(0)
const log = ref<string[]>([])

// 正确：computed 是纯函数
const doubleCount = computed(() => count.value * 2)

// 副作用应该放在 watch 中
watch(doubleCount, (newValue) => {
  log.value.push(`doubleCount 变为 ${newValue}`)
  console.log('doubleCount changed:', newValue)
})
</script>
```

---

## watch 必须指定依赖源

IsUrgent: Warning
Category: Composition API

### 描述

使用 `watch` 时，应该明确指定要监听的响应式源，而不是使用 `watchEffect`（除非确实需要自动收集依赖）。明确的依赖声明更易于理解和调试。

### 错误示例

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const userName = ref('')

// 不推荐：依赖不明确
watchEffect(async () => {
  const user = await fetchUser(userId.value)
  userName.value = user.name
})
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const userId = ref(1)
const userName = ref('')

// 正确：明确声明依赖
watch(userId, async (newId) => {
  const user = await fetchUser(newId)
  userName.value = user.name
}, { immediate: true })

// 监听多个源
watch(
  [userId, userName],
  ([newId, newName], [oldId, oldName]) => {
    console.log(`从 ${oldId}:${oldName} 变为 ${newId}:${newName}`)
  }
)
</script>
```

---

## 避免在 setup 外部使用 Composition API

IsUrgent: Critical
Category: Composition API

### 描述

Composition API（如 `ref`、`computed`、`watch`）只能在 `setup()` 函数、`<script setup>` 或 composable 中使用。在其他地方使用可能导致响应性丢失或运行时错误。

### 错误示例

```typescript
// 错误：在模块顶层使用
import { ref, computed } from 'vue'

// 这些在模块加载时就执行了，不在组件上下文中
const globalCount = ref(0)
const globalDouble = computed(() => globalCount.value * 2)

export default {
  setup() {
    return { globalCount, globalDouble }
  }
}
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 正确：在 setup 上下文中使用
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>
```

```typescript
// 正确：在 composable 中封装
export function useCounter() {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  return { count, doubleCount }
}
```

---

## 使用 shallowRef 优化大型对象

IsUrgent: Suggestion
Category: Composition API

### 描述

对于大型对象或不需要深度响应性的数据，使用 `shallowRef` 替代 `ref` 可以提高性能。`shallowRef` 只追踪 `.value` 的变化，不会深度转换内部属性。

### 正确示例

```vue
<script setup lang="ts">
import { shallowRef, triggerRef } from 'vue'

// 对于大型数据结构，使用 shallowRef
const largeList = shallowRef<Item[]>([])

// 整体替换会触发更新
largeList.value = newLargeList

// 如果直接修改内部属性，需要手动触发更新
largeList.value[0].name = 'new name'
triggerRef(largeList) // 手动触发
</script>
```

```

---

## skills/shared-skills/frontend-code-review/references/performance.md

`skills/shared-skills/frontend-code-review/references/performance.md`

```markdown
# 规则目录 — 性能优化（项目流程版）

本文件用于审查性能问题是否与组件拆分、状态边界和请求流程设计相关，避免只做局部微优化。

---

## v-for 必须使用唯一且稳定的 key

IsUrgent: Critical
Category: Performance

### 描述

在 `v-for` 循环中，`key` 必须是唯一且稳定的标识符。使用数组索引作为 key 会导致不必要的 DOM 更新和潜在的状态混乱，特别是在列表会发生排序、插入、删除时。

### 错误示例

```vue
<template>
  <!-- 错误：使用索引作为 key -->
  <li v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </li>
  
  <!-- 错误：使用可能重复的值 -->
  <li v-for="item in items" :key="item.name">
    {{ item.name }}
  </li>
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用唯一标识符 -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

---

## 大型页面应通过组件拆分降低无效重渲染

IsUrgent: Warning
Category: Performance

### 描述

当页面容器承担过多渲染逻辑时，局部状态变化会触发整页重渲染。应通过子组件拆分和 composable 抽离，缩小响应式影响范围。

### 典型风险信号

- 单页面组件管理大量列表、弹窗、表单、统计卡片
- 任意一个输入变更导致多个不相关区域一起更新
- 为了性能不得不增加大量“临时缓存变量”

---

## 请求编排应避免在多个组件重复触发

IsUrgent: Warning
Category: Performance

### 描述

同一业务数据不应在父子组件或平级组件重复请求。应统一在页面容器或 composable 编排请求，再按需下发数据，避免重复网络开销与状态抖动。

### 错误示例

```text
UserPage.vue 请求用户详情
UserHeader.vue 再请求一次用户详情
UserStats.vue 再请求一次用户详情
```

### 正确示例

```text
useUserPageData.ts 统一请求与缓存
UserHeader.vue / UserStats.vue 仅消费 props
```

---

## Store 不应承载高频临时 UI 状态

IsUrgent: Suggestion
Category: Performance

### 描述

将高频临时状态（输入草稿、鼠标悬浮、短周期 UI 开关）放到 Store 会扩大订阅范围并增加渲染开销。应优先保留在组件局部状态中。

---

## 大列表必须使用虚拟滚动

IsUrgent: Critical
Category: Performance

### 描述

当渲染超过 100 条数据的列表时，应该使用虚拟滚动技术（如 `vue-virtual-scroller`）只渲染可视区域内的元素，避免大量 DOM 节点导致的性能问题。

### 错误示例

```vue
<template>
  <!-- 错误：直接渲染大量数据 -->
  <ul>
    <li v-for="item in largeList" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>

<script setup lang="ts">
// largeList 可能有几千条数据
const largeList = ref<Item[]>([])
</script>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用虚拟滚动 -->
  <RecycleScroller
    class="scroller"
    :items="largeList"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <div class="item">{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const largeList = ref<Item[]>([])
</script>
```

---

## 复杂计算必须使用 computed 缓存

IsUrgent: Warning
Category: Performance

### 描述

涉及复杂计算或数据处理的逻辑应该使用 `computed` 而不是在模板中直接调用方法。`computed` 会缓存计算结果，只在依赖变化时重新计算。

### 错误示例

```vue
<template>
  <!-- 错误：在模板中直接调用方法，每次渲染都会执行 -->
  <div>{{ getFilteredItems() }}</div>
  <div>{{ items.filter(x => x.active).map(x => x.name).join(', ') }}</div>
</template>

<script setup lang="ts">
function getFilteredItems() {
  // 复杂的过滤和转换逻辑
  return items.value
    .filter(item => item.active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 10)
}
</script>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用 computed 缓存结果 -->
  <div>{{ filteredItems }}</div>
  <div>{{ activeItemNames }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const filteredItems = computed(() => {
  return items.value
    .filter(item => item.active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 10)
})

const activeItemNames = computed(() => {
  return items.value
    .filter(x => x.active)
    .map(x => x.name)
    .join(', ')
})
</script>
```

---

## 组件 Props 传递对象时必须缓存

IsUrgent: Warning
Category: Performance

### 描述

向子组件传递对象或数组类型的 props 时，如果该值是在父组件中动态创建的，必须使用 `computed` 或 `useMemo` 进行缓存，避免每次渲染都创建新引用导致子组件不必要的更新。

### 错误示例

```vue
<template>
  <!-- 错误：每次渲染都创建新对象 -->
  <ChildComponent
    :config="{ theme: theme, locale: locale }"
    :options="options.filter(o => o.active)"
  />
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用缓存的值 -->
  <ChildComponent
    :config="config"
    :options="activeOptions"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = computed(() => ({
  theme: theme.value,
  locale: locale.value
}))

const activeOptions = computed(() => 
  options.value.filter(o => o.active)
)
</script>
```

---

## 事件处理函数避免内联定义

IsUrgent: Warning
Category: Performance

### 描述

模板中的事件处理函数应该引用预定义的方法，而不是使用内联箭头函数。内联函数在每次渲染时都会创建新的函数实例，可能导致子组件的不必要更新。

### 错误示例

```vue
<template>
  <!-- 错误：内联箭头函数 -->
  <button @click="() => handleClick(item.id)">点击</button>
  <ChildComponent @update="(val) => updateValue(item.id, val)" />
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：引用预定义方法 -->
  <button @click="handleItemClick">点击</button>
  <ChildComponent @update="handleUpdate" />
</template>

<script setup lang="ts">
function handleItemClick() {
  handleClick(item.id)
}

function handleUpdate(val: string) {
  updateValue(item.id, val)
}
</script>
```

---

## 使用 v-show 代替频繁切换的 v-if

IsUrgent: Suggestion
Category: Performance

### 描述

对于频繁切换显示状态的元素，使用 `v-show` 代替 `v-if`。`v-show` 只是切换 CSS 的 `display` 属性，而 `v-if` 会销毁和重建 DOM 元素。

### 错误示例

```vue
<template>
  <!-- 错误：频繁切换使用 v-if -->
  <div v-if="isVisible">频繁显示/隐藏的内容</div>
  <Modal v-if="showModal" />
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：频繁切换使用 v-show -->
  <div v-show="isVisible">频繁显示/隐藏的内容</div>
  
  <!-- v-if 适用于不常切换或初始不渲染的场景 -->
  <HeavyComponent v-if="shouldLoad" />
</template>
```

---

## 异步组件必须使用 defineAsyncComponent

IsUrgent: Suggestion
Category: Performance

### 描述

对于不需要立即渲染的大型组件，使用 `defineAsyncComponent` 进行懒加载，可以减少初始包大小并提高首屏加载速度。

### 正确示例

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 懒加载重型组件
const HeavyChart = defineAsyncComponent(() => 
  import('./components/HeavyChart.vue')
)

// 带加载和错误状态的异步组件
const AsyncModal = defineAsyncComponent({
  loader: () => import('./components/Modal.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200, // 延迟显示 loading
  timeout: 10000 // 超时时间
})
</script>
```

---

## watch 必须避免深度监听大型对象

IsUrgent: Warning
Category: Performance

### 描述

使用 `watch` 的 `deep: true` 选项监听大型对象会产生性能开销，因为需要递归遍历所有嵌套属性。应该尽量监听具体的属性路径或使用 `shallowRef`。

### 错误示例

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const largeState = ref({
  users: [], // 大量用户数据
  settings: {},
  cache: {}
})

// 错误：深度监听大型对象
watch(largeState, (newValue) => {
  console.log('state changed')
}, { deep: true })
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const users = ref<User[]>([])
const settings = ref<Settings>({})

// 正确：分别监听需要的属性
watch(users, (newUsers) => {
  console.log('users changed')
})

// 正确：监听特定的深层路径
watch(
  () => settings.value.theme,
  (newTheme) => {
    console.log('theme changed:', newTheme)
  }
)
</script>
```

---

## 避免在模板中访问 $refs

IsUrgent: Suggestion
Category: Performance

### 描述

在 Vue 3 中，应该使用 `ref` 函数创建模板引用，而不是通过 `$refs` 访问。这提供了更好的类型安全和响应性。

### 错误示例

```vue
<template>
  <input ref="inputEl" />
  <button @click="$refs.inputEl.focus()">聚焦</button>
</template>
```

### 正确示例

```vue
<template>
  <input ref="inputEl" />
  <button @click="focusInput">聚焦</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputEl = ref<HTMLInputElement | null>(null)

function focusInput() {
  inputEl.value?.focus()
}
</script>
```

---

## 使用 KeepAlive 缓存频繁切换的组件

IsUrgent: Suggestion
Category: Performance

### 描述

对于通过 `v-if` 或动态组件切换且需要保持状态的组件，使用 `<KeepAlive>` 进行缓存，避免重复的组件初始化开销。

### 正确示例

```vue
<template>
  <!-- 缓存动态组件 -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
  
  <!-- 缓存路由组件 -->
  <RouterView v-slot="{ Component }">
    <KeepAlive :include="['Dashboard', 'Profile']">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
  
  <!-- 设置最大缓存数量 -->
  <KeepAlive :max="10">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

---

## 图片必须使用懒加载

IsUrgent: Suggestion
Category: Performance

### 描述

对于非首屏可见的图片，应该使用原生的 `loading="lazy"` 属性或懒加载库来延迟加载，减少初始页面加载时间和带宽消耗。

### 正确示例

```vue
<template>
  <!-- 原生懒加载 -->
  <img 
    :src="imageUrl" 
    loading="lazy"
    alt="描述"
  />
  
  <!-- 使用占位符和懒加载 -->
  <img
    :src="isInView ? imageUrl : placeholder"
    loading="lazy"
    alt="描述"
  />
</template>
```

```

---

## skills/shared-skills/frontend-code-review/references/pinia.md

`skills/shared-skills/frontend-code-review/references/pinia.md`

```markdown
# 规则目录 — Pinia 状态管理（项目规范版）

本文件用于审查 Store 是否符合本仓“仅承载跨组件/跨页面共享状态”的约束，并保证状态边界清晰、可维护。

---

## Store 必须使用 Setup 语法定义

IsUrgent: Warning
Category: Pinia

### 描述

推荐使用 Setup 语法（Composition API 风格）定义 store，而不是 Options 语法。Setup 语法更灵活，与 Composition API 保持一致，且支持更复杂的场景。

### 错误示例

```typescript
// 不推荐：Options 语法
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async login(credentials) {
      // ...
    }
  }
})
```

### 正确示例

```typescript
// 推荐：Setup 语法
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // state
  const user = ref<User | null>(null)
  const token = ref('')
  
  // getters
  const isLoggedIn = computed(() => !!user.value)
  
  // actions
  async function login(credentials: Credentials) {
    const response = await api.login(credentials)
    user.value = response.user
    token.value = response.token
  }
  
  function logout() {
    user.value = null
    token.value = ''
  }
  
  return {
    user,
    token,
    isLoggedIn,
    login,
    logout
  }
})
```

---

## Store 命名必须以 use 开头并以 Store 结尾

IsUrgent: Warning
Category: Pinia

### 描述

Store 的导出名称必须遵循 `useXxxStore` 的命名约定。这与 composable 命名保持一致，便于识别。

### 错误示例

```typescript
// 错误：命名不规范
export const userStore = defineStore('user', () => { /* ... */ })
export const useUser = defineStore('user', () => { /* ... */ })
export const UserStore = defineStore('user', () => { /* ... */ })
```

### 正确示例

```typescript
// 正确：useXxxStore 命名
export const useUserStore = defineStore('user', () => { /* ... */ })
export const useCartStore = defineStore('cart', () => { /* ... */ })
export const useSettingsStore = defineStore('settings', () => { /* ... */ })
```

---

## 页面局部状态禁止滥用 Store

IsUrgent: Critical
Category: Pinia

### 描述

仅在“跨组件或跨页面共享”时才进入 Store。纯页面局部状态（弹窗开关、输入草稿、临时筛选面板显隐等）应留在页面或 composable 中。

将局部状态放入 Store 会引入：

- 全局状态污染
- 无意义订阅与更新
- 页面间意外状态串扰

### 错误示例

```typescript
// 错误：把页面局部弹窗状态放进全局 Store
export const useUserStore = defineStore('user', () => {
  const editModalVisible = ref(false)
  return { editModalVisible }
})
```

### 正确示例

```typescript
// 正确：页面 composable 管理局部状态
export function useUserEditModal() {
  const editModalVisible = ref(false)
  return { editModalVisible }
}
```

---

## Store 结构应围绕业务域，不围绕页面名称

IsUrgent: Warning
Category: Pinia

### 描述

Store 划分应按业务域组织（如用户、订单、权限），避免按页面文件名临时建立碎片化 store（如 `useListPageStore`、`useDialogStore`）导致长期维护困难。

如状态仅服务单页，优先不建 Store。

---

## Store ID 必须唯一且具有描述性

IsUrgent: Critical
Category: Pinia

### 描述

每个 store 的 ID（`defineStore` 的第一个参数）必须是唯一的字符串，且应该具有描述性。重复的 ID 会导致状态覆盖问题。

### 错误示例

```typescript
// 错误：ID 不唯一
// stores/user.ts
export const useUserStore = defineStore('data', () => { /* ... */ })

// stores/product.ts
export const useProductStore = defineStore('data', () => { /* ... */ }) // 冲突！

// 错误：ID 不具描述性
export const useUserStore = defineStore('a', () => { /* ... */ })
```

### 正确示例

```typescript
// 正确：唯一且具描述性的 ID
// stores/user.ts
export const useUserStore = defineStore('user', () => { /* ... */ })

// stores/product.ts
export const useProductStore = defineStore('product', () => { /* ... */ })

// stores/cart.ts
export const useCartStore = defineStore('cart', () => { /* ... */ })
```

---

## 避免在 Store 外部直接修改 State

IsUrgent: Critical
Category: Pinia

### 描述

虽然 Pinia 允许直接修改 state，但为了保持代码的可追踪性和可维护性，状态修改应该通过 store 内部定义的 action 进行。

### 错误示例

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 错误：在 store 外部直接修改 state
function handleLogin(user: User) {
  userStore.user = user
  userStore.token = user.token
  userStore.isLoggedIn = true
}
</script>
```

### 正确示例

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref('')
  
  // 通过 action 修改 state
  function setUser(newUser: User) {
    user.value = newUser
    token.value = newUser.token
  }
  
  function clearUser() {
    user.value = null
    token.value = ''
  }
  
  return { user, token, setUser, clearUser }
})
```

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 正确：通过 action 修改
function handleLogin(user: User) {
  userStore.setUser(user)
}
</script>
```

---

## 异步操作必须有错误处理

IsUrgent: Critical
Category: Pinia

### 描述

Store 中的异步 action 必须包含适当的错误处理，并提供 loading 和 error 状态供组件使用。

### 错误示例

```typescript
// 错误：没有错误处理和 loading 状态
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  
  async function fetchUser(id: number) {
    const response = await api.getUser(id)
    user.value = response.data
  }
  
  return { user, fetchUser }
})
```

### 正确示例

```typescript
// 正确：完整的错误处理和状态管理
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  async function fetchUser(id: number) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getUser(id)
      user.value = response.data
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('获取用户失败')
      user.value = null
    } finally {
      loading.value = false
    }
  }
  
  return { user, loading, error, fetchUser }
})
```

---

## Store 之间的依赖必须明确

IsUrgent: Warning
Category: Pinia

### 描述

当一个 store 需要访问另一个 store 时，必须在 action 内部调用 `useXxxStore()`，而不是在 setup 函数顶层。这避免了循环依赖问题。

### 错误示例

```typescript
// 错误：在 setup 顶层调用其他 store
export const useCartStore = defineStore('cart', () => {
  // 可能导致循环依赖
  const userStore = useUserStore()
  
  const items = ref<CartItem[]>([])
  
  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    // ...
  }
  
  return { items, checkout }
})
```

### 正确示例

```typescript
// 正确：在 action 内部调用其他 store
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  
  async function checkout() {
    // 在 action 内部获取其他 store
    const userStore = useUserStore()
    
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    // ...
  }
  
  return { items, checkout }
})
```

---

## 使用 storeToRefs 解构 Store

IsUrgent: Warning
Category: Pinia

### 描述

从 store 中解构响应式状态时，必须使用 `storeToRefs()`，否则会丢失响应性。注意 action（方法）不需要包装，可以直接解构。

### 错误示例

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 错误：直接解构会丢失响应性
const { user, isLoggedIn, login } = userStore

// user 和 isLoggedIn 不再是响应式的
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 正确：使用 storeToRefs 解构状态和 getters
const { user, isLoggedIn } = storeToRefs(userStore)

// actions 可以直接解构
const { login, logout } = userStore
</script>
```

---

## Store 必须支持 SSR（如适用）

IsUrgent: Suggestion
Category: Pinia

### 描述

如果应用需要支持服务端渲染（SSR），store 中不能在 setup 阶段使用浏览器专有的 API（如 `window`、`localStorage`）。这些操作应该放在 action 中并进行环境检查。

### 错误示例

```typescript
// 错误：在 setup 阶段使用浏览器 API
export const useSettingsStore = defineStore('settings', () => {
  // 在 SSR 环境会报错
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  return { theme }
})
```

### 正确示例

```typescript
// 正确：在 action 中进行环境检查
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('light')
  
  function initTheme() {
    if (typeof window !== 'undefined') {
      theme.value = localStorage.getItem('theme') || 'light'
    }
  }
  
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }
  
  return { theme, initTheme, setTheme }
})
```

---

## 避免在 Store 中存储非序列化数据

IsUrgent: Suggestion
Category: Pinia

### 描述

如果使用了 Pinia 的持久化插件或需要支持 SSR hydration，store 中的 state 应该只包含可序列化的数据。避免存储函数、类实例、Symbol 等。

### 错误示例

```typescript
// 错误：存储非序列化数据
export const useAppStore = defineStore('app', () => {
  // 函数不可序列化
  const callback = ref(() => console.log('hello'))
  
  // 类实例不可序列化
  const dateObj = ref(new Date())
  
  // Map/Set 需要特殊处理
  const cache = ref(new Map())
  
  return { callback, dateObj, cache }
})
```

### 正确示例

```typescript
// 正确：只存储可序列化数据
export const useAppStore = defineStore('app', () => {
  // 使用时间戳代替 Date 对象
  const timestamp = ref(Date.now())
  
  // 使用普通对象代替 Map
  const cache = ref<Record<string, unknown>>({})
  
  // computed 可以返回派生的非序列化数据
  const dateObj = computed(() => new Date(timestamp.value))
  
  return { timestamp, cache, dateObj }
})
```

```

---

## skills/shared-skills/frontend-code-review/references/security-a11y.md

`skills/shared-skills/frontend-code-review/references/security-a11y.md`

```markdown
# 规则目录 — 安全与可访问性（项目流程版）

本文件用于审查安全与可访问性问题在“页面 -> 组件 -> composable -> API”链路中的边界是否清晰，避免重复校验和职责错位。

---

## 禁止使用 v-html 渲染用户输入

IsUrgent: Critical
Category: Security

### 描述

`v-html` 指令会将字符串作为原始 HTML 插入，如果内容来自用户输入，可能导致 XSS（跨站脚本）攻击。必须对用户输入进行清理或使用安全的替代方案。

### 错误示例

```vue
<template>
  <!-- 错误：直接渲染用户输入 -->
  <div v-html="userComment"></div>
  <div v-html="articleContent"></div>
</template>

<script setup lang="ts">
// userComment 和 articleContent 可能包含恶意脚本
const userComment = ref('')
</script>
```

### 正确示例

```vue
<template>
  <!-- 正确方案 1：使用文本插值 -->
  <div>{{ userComment }}</div>
  
  <!-- 正确方案 2：使用 DOMPurify 清理 HTML -->
  <div v-html="sanitizedContent"></div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed } from 'vue'

const userComment = ref('')
const articleContent = ref('')

// 清理 HTML 内容
const sanitizedContent = computed(() => 
  DOMPurify.sanitize(articleContent.value)
)
</script>
```

---

## 输入校验应在边界层统一处理，避免多层重复

IsUrgent: Warning
Category: Security

### 描述

参数校验应遵循边界原则：

- 路由参数：在路由或页面入口处校验
- 表单输入：在表单提交前统一校验
- API 入参：在 API 封装调用前完成规范化

避免在组件、composable、store 多层重复做同类校验，导致逻辑分散和行为不一致。

---

## 接口错误提示不得在业务层重复弹出

IsUrgent: Warning
Category: Security

### 描述

项目约定由请求拦截器统一处理通用错误提示。审查时应识别并指出业务层重复弹错（如 `message.error`）的问题，防止同一错误多次提示影响用户体验。

---

## 权限控制应以路由与页面入口为主，组件内只做兜底

IsUrgent: Suggestion
Category: Security

### 描述

权限判断建议分层：

- 路由层控制页面可达性
- 页面层控制核心操作可见性
- 子组件层仅做安全兜底，不做主权限编排

若权限逻辑分散在大量子组件中，应在审查报告中标记为维护风险。

---

## URL 参数必须进行验证

IsUrgent: Critical
Category: Security

### 描述

从 URL 参数、query 参数获取的值必须在使用前进行验证和清理，防止注入攻击。特别是用于 API 请求、动态路由或 DOM 操作的参数。

### 错误示例

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 错误：直接使用未验证的 URL 参数
const userId = route.params.id
await fetch(`/api/users/${userId}`)

// 错误：用于动态链接
const redirectUrl = route.query.redirect as string
window.location.href = redirectUrl
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 正确：验证并转换参数类型
const userId = computed(() => {
  const id = Number(route.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return null
  }
  return id
})

// 正确：验证重定向 URL
const redirectUrl = computed(() => {
  const url = route.query.redirect as string
  // 只允许相对路径或同域 URL
  if (url?.startsWith('/') && !url.startsWith('//')) {
    return url
  }
  return '/'
})

function handleRedirect() {
  // 使用 router.push 而不是 window.location
  router.push(redirectUrl.value)
}
</script>
```

---

## 敏感数据禁止存储在前端

IsUrgent: Critical
Category: Security

### 描述

敏感数据（如密码、完整的支付信息、私钥等）不应该存储在前端的任何位置，包括 localStorage、sessionStorage、cookie 或 Pinia store。

### 错误示例

```typescript
// 错误：在前端存储敏感数据
const userStore = defineStore('user', () => {
  const password = ref('') // 存储密码
  const creditCard = ref('') // 存储信用卡号
  
  function saveCredentials(pwd: string, card: string) {
    password.value = pwd
    creditCard.value = card
    localStorage.setItem('password', pwd) // 更危险
  }
  
  return { password, creditCard, saveCredentials }
})
```

### 正确示例

```typescript
// 正确：只存储必要的非敏感数据
const userStore = defineStore('user', () => {
  const token = ref('') // JWT token（有过期时间）
  const userId = ref<number | null>(null)
  
  async function login(credentials: { email: string; password: string }) {
    // 密码只用于发送请求，不存储
    const response = await api.login(credentials)
    token.value = response.token
    userId.value = response.userId
  }
  
  return { token, userId, login }
})
```

---

## 表单必须有关联的 label

IsUrgent: Warning
Category: Accessibility

### 描述

每个表单控件（input、select、textarea）都必须有关联的 `<label>` 元素，以便屏幕阅读器用户能够理解控件的用途。使用 `for` 属性或将控件包裹在 label 内。

### 错误示例

```vue
<template>
  <!-- 错误：没有 label -->
  <input type="text" v-model="username" placeholder="用户名" />
  
  <!-- 错误：label 没有关联 -->
  <label>用户名</label>
  <input type="text" v-model="username" />
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确方案 1：使用 for 属性 -->
  <label for="username">用户名</label>
  <input id="username" type="text" v-model="username" />
  
  <!-- 正确方案 2：包裹式 label -->
  <label>
    用户名
    <input type="text" v-model="username" />
  </label>
  
  <!-- 正确方案 3：视觉隐藏但可访问的 label -->
  <label for="search" class="sr-only">搜索</label>
  <input id="search" type="search" v-model="searchQuery" placeholder="搜索..." />
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
```

---

## 交互元素必须可键盘访问

IsUrgent: Warning
Category: Accessibility

### 描述

所有可交互的元素都必须能够通过键盘访问。使用原生的交互元素（button、a、input）而不是 div 或 span 配合点击事件。如果必须使用非交互元素，需要添加 `tabindex`、`role` 和键盘事件处理。

### 错误示例

```vue
<template>
  <!-- 错误：使用 div 作为按钮 -->
  <div class="btn" @click="handleClick">点击我</div>
  
  <!-- 错误：使用 span 作为链接 -->
  <span @click="navigate">跳转</span>
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用原生 button -->
  <button type="button" @click="handleClick">点击我</button>
  
  <!-- 正确：使用原生 a 标签 -->
  <RouterLink to="/page">跳转</RouterLink>
  
  <!-- 如果必须使用 div，添加可访问性属性 -->
  <div
    class="custom-btn"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    点击我
  </div>
</template>
```

---

## 图片必须有 alt 属性

IsUrgent: Warning
Category: Accessibility

### 描述

所有 `<img>` 元素都必须有 `alt` 属性。对于有意义的图片，`alt` 应该描述图片内容；对于装饰性图片，使用空字符串 `alt=""`。

### 错误示例

```vue
<template>
  <!-- 错误：没有 alt -->
  <img :src="userAvatar" />
  
  <!-- 错误：无意义的 alt -->
  <img :src="productImage" alt="图片" />
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：有意义的描述 -->
  <img :src="userAvatar" :alt="`${userName} 的头像`" />
  
  <!-- 正确：产品图片的描述 -->
  <img :src="productImage" :alt="productName" />
  
  <!-- 正确：装饰性图片使用空 alt -->
  <img :src="decorativePattern" alt="" />
</template>
```

---

## 颜色对比度必须符合 WCAG 标准

IsUrgent: Suggestion
Category: Accessibility

### 描述

文本与背景的颜色对比度必须符合 WCAG 2.1 AA 标准：普通文本至少 4.5:1，大文本（18px 以上或 14px 加粗）至少 3:1。

### 错误示例

```vue
<style scoped>
/* 错误：对比度不足 */
.light-text {
  color: #999999; /* 浅灰色文字 */
  background-color: #ffffff; /* 白色背景 */
  /* 对比度约 2.85:1，不符合标准 */
}
</style>
```

### 正确示例

```vue
<style scoped>
/* 正确：足够的对比度 */
.text {
  color: #595959; /* 深灰色文字 */
  background-color: #ffffff; /* 白色背景 */
  /* 对比度约 7:1，符合 AAA 标准 */
}

/* 使用 CSS 变量便于统一管理 */
.text-secondary {
  color: var(--color-text-secondary); /* 应确保对比度 ≥ 4.5:1 */
}
</style>
```

---

## 动态内容变化必须通知屏幕阅读器

IsUrgent: Suggestion
Category: Accessibility

### 描述

当页面内容动态变化时（如加载状态、表单验证错误、通知消息），应该使用 ARIA live regions 通知屏幕阅读器用户。

### 正确示例

```vue
<template>
  <!-- 加载状态通知 -->
  <div aria-live="polite" aria-busy="true" v-if="loading">
    正在加载...
  </div>
  
  <!-- 表单错误通知 -->
  <div
    v-if="error"
    role="alert"
    aria-live="assertive"
  >
    {{ error }}
  </div>
  
  <!-- 成功消息通知 -->
  <div
    v-if="successMessage"
    role="status"
    aria-live="polite"
  >
    {{ successMessage }}
  </div>
</template>
```

---

## 模态框必须正确管理焦点

IsUrgent: Warning
Category: Accessibility

### 描述

模态框打开时，焦点应该移动到模态框内的第一个可聚焦元素；关闭时，焦点应该返回到触发模态框的元素。同时应该限制焦点在模态框内循环（焦点陷阱）。

### 正确示例

```vue
<template>
  <button ref="triggerBtn" @click="openModal">打开模态框</button>
  
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay"
      @keydown.esc="closeModal"
    >
      <div
        ref="modalEl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        class="modal"
      >
        <h2 id="modal-title">模态框标题</h2>
        <div class="modal-content">
          <!-- 内容 -->
        </div>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const isOpen = ref(false)
const triggerBtn = ref<HTMLButtonElement | null>(null)
const modalEl = ref<HTMLElement | null>(null)

// 使用 VueUse 的焦点陷阱
const { activate, deactivate } = useFocusTrap(modalEl, {
  immediate: false
})

async function openModal() {
  isOpen.value = true
  await nextTick()
  activate()
}

function closeModal() {
  deactivate()
  isOpen.value = false
  // 焦点返回触发按钮
  triggerBtn.value?.focus()
}
</script>
```

---

## API 请求必须使用 HTTPS

IsUrgent: Critical
Category: Security

### 描述

所有 API 请求必须使用 HTTPS 协议，避免数据在传输过程中被窃听或篡改。配置文件中的 API 地址必须以 `https://` 开头。

### 错误示例

```typescript
// 错误：使用 HTTP
const API_BASE_URL = 'http://api.example.com'

// 错误：协议不明确
const API_BASE_URL = '//api.example.com'
```

### 正确示例

```typescript
// 正确：使用 HTTPS
const API_BASE_URL = 'https://api.example.com'

// 从环境变量读取（环境变量中应配置 HTTPS 地址）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
```

---

## 禁止在前端暴露敏感配置

IsUrgent: Critical
Category: Security

### 描述

敏感的配置信息（如 API 密钥、数据库连接字符串、第三方服务的 secret）不应该出现在前端代码中，即使是环境变量也会被打包到客户端代码中。

### 错误示例

```typescript
// 错误：在前端代码中暴露 API 密钥
const STRIPE_SECRET_KEY = 'sk_live_xxxx'
const DATABASE_URL = 'mongodb://user:pass@host:port/db'

// 错误：即使使用环境变量，也会被打包到前端
const API_SECRET = import.meta.env.VITE_API_SECRET
```

### 正确示例

```typescript
// 正确：只使用公开的配置
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY // 以 pk_ 开头

// 敏感操作通过后端 API 代理
async function processPayment(paymentData: PaymentData) {
  // 调用后端 API，后端持有 secret key
  return await api.post('/payments/process', paymentData)
}
```

```

---

## skills/shared-skills/frontend-code-review/references/security.md

`skills/shared-skills/frontend-code-review/references/security.md`

```markdown
# 规则目录 — 安全

本文件包含前端安全相关的代码审查规则，防止常见的安全漏洞。

---

## 禁止使用 v-html 渲染用户输入

Priority: P0
Category: Security

### 描述

`v-html` 会直接渲染 HTML 字符串，如果内容来自用户输入，可能导致 XSS（跨站脚本）攻击。应使用文本插值或对内容进行消毒处理。

### 错误示例

```vue
<template>
  <!-- 错误：直接渲染用户输入 -->
  <div v-html="userComment" />
  <div v-html="articleContent" />
</template>

<script setup lang="ts">
// userComment 和 articleContent 来自 API 或用户输入
</script>
```

### 正确示例

```vue
<template>
  <!-- 方案1：使用文本插值（自动转义） -->
  <div>{{ userComment }}</div>
  
  <!-- 方案2：使用专门的消毒库处理 -->
  <div v-html="sanitizedContent" />
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed } from 'vue'

// 使用 DOMPurify 消毒 HTML
const sanitizedContent = computed(() => 
  DOMPurify.sanitize(articleContent.value, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'li'],
    ALLOWED_ATTR: []
  })
)
</script>
```

---

## 禁止在模板中使用 eval 或 Function 构造函数

Priority: P0
Category: Security

### 描述

避免使用 `eval()`、`new Function()` 或类似的动态代码执行方法，这些是 XSS 攻击的主要入口。

### 错误示例

```vue
<script setup lang="ts">
// 错误：动态执行代码
const executeUserCode = (code: string) => {
  eval(code)
}

const createFunction = (body: string) => {
  return new Function(body)
}

// 错误：动态导入用户提供的路径
const loadModule = async (path: string) => {
  return import(path) // 不安全
}
</script>
```

### 正确示例

```vue
<script setup lang="ts">
// 正确：使用白名单方式处理用户选择
const handlers: Record<string, () => void> = {
  save: () => saveData(),
  delete: () => deleteData(),
  export: () => exportData()
}

const executeAction = (action: string) => {
  const handler = handlers[action]
  if (handler) {
    handler()
  } else {
    console.warn(`未知操作: ${action}`)
  }
}

// 正确：动态导入使用白名单
const moduleMap = {
  chart: () => import('./Chart.vue'),
  table: () => import('./Table.vue')
}

const loadComponent = async (name: keyof typeof moduleMap) => {
  return moduleMap[name]?.()
}
</script>
```

---

## 敏感数据不应存储在前端

Priority: P0
Category: Security

### 描述

密码、API 密钥、access token 等敏感数据不应存储在 localStorage、sessionStorage 或明文 cookie 中。应使用 httpOnly cookie 或内存存储。

### 错误示例

```typescript
// 错误：在 localStorage 存储敏感数据
localStorage.setItem('accessToken', token)
localStorage.setItem('apiKey', 'sk-xxxxx')
localStorage.setItem('password', userPassword)

// 错误：在 Pinia 中持久化敏感数据
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const refreshToken = ref('')
  
  return { accessToken, refreshToken }
}, {
  persist: true // 会存储到 localStorage
})
```

### 正确示例

```typescript
// 正确：敏感 token 只存在内存中
export const useAuthStore = defineStore('auth', () => {
  // 内存存储，页面刷新会丢失
  const accessToken = ref<string | null>(null)
  
  // 使用 httpOnly cookie 存储 refresh token（由后端设置）
  const refreshAccessToken = async () => {
    // 发送请求，后端从 httpOnly cookie 读取 refresh token
    const response = await api.post('/auth/refresh')
    accessToken.value = response.data.accessToken
  }
  
  return { accessToken, refreshAccessToken }
})

// 不持久化敏感数据
// 只持久化非敏感的用户偏好
export const useUserStore = defineStore('user', () => {
  const preferences = ref({ theme: 'light', language: 'zh' })
  return { preferences }
}, {
  persist: {
    paths: ['preferences'] // 只持久化偏好设置
  }
})
```

---

## URL 参数必须验证和编码

Priority: P1
Category: Security

### 描述

使用用户输入构建 URL 时，必须进行验证和正确编码，防止开放重定向和注入攻击。

### 错误示例

```typescript
// 错误：直接使用用户输入构建 URL
const redirectUrl = route.query.redirect as string
router.push(redirectUrl) // 可能重定向到恶意网站

// 错误：拼接未编码的参数
const searchUrl = `/search?q=${userInput}`
```

### 正确示例

```typescript
// 正确：验证重定向 URL
const safeRedirect = (url: string): string => {
  // 只允许相对路径或同源 URL
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url
  }
  
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin === window.location.origin) {
      return url
    }
  } catch {
    // URL 解析失败
  }
  
  return '/' // 默认重定向到首页
}

const redirectUrl = route.query.redirect as string
router.push(safeRedirect(redirectUrl))

// 正确：编码 URL 参数
const searchUrl = `/search?q=${encodeURIComponent(userInput)}`

// 正确：使用 URLSearchParams
const params = new URLSearchParams({ q: userInput, page: '1' })
const searchUrl = `/search?${params.toString()}`
```

---

## API 请求必须包含 CSRF 保护

Priority: P0
Category: Security

### 描述

所有修改数据的 API 请求（POST、PUT、DELETE）必须包含 CSRF token，防止跨站请求伪造攻击。

### 正确示例

```typescript
// api/request.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true // 发送 cookie
})

// 从 cookie 或 meta 标签获取 CSRF token
const getCsrfToken = (): string => {
  // 方式1：从 cookie 读取
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  if (match) return match[1]
  
  // 方式2：从 meta 标签读取
  const meta = document.querySelector('meta[name="csrf-token"]')
  return meta?.getAttribute('content') || ''
}

// 请求拦截器添加 CSRF token
api.interceptors.request.use((config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method || '')) {
    config.headers['X-CSRF-Token'] = getCsrfToken()
  }
  return config
})

export default api
```

---

## 禁止在前端硬编码敏感配置

Priority: P0
Category: Security

### 描述

API 密钥、数据库连接字符串、第三方服务凭证等不应硬编码在前端代码中。应通过环境变量或后端 API 获取。

### 错误示例

```typescript
// 错误：硬编码 API 密钥
const GOOGLE_API_KEY = 'AIzaSyDxxxxxxxxxxxxxxx'
const STRIPE_SECRET_KEY = 'sk_live_xxxxxxxxx'
const DATABASE_URL = 'mongodb://user:pass@host:27017/db'

// 错误：即使是环境变量，也不应在前端暴露敏感密钥
const apiKey = import.meta.env.VITE_SECRET_API_KEY
```

### 正确示例

```typescript
// 正确：只使用公开的配置
const config = {
  // 公开的配置可以放在环境变量
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  googleMapsId: import.meta.env.VITE_GOOGLE_MAPS_ID, // 公开的 ID，不是密钥
}

// 正确：敏感操作通过后端代理
const processPayment = async (paymentData: PaymentData) => {
  // 支付密钥在后端，前端只发送支付数据
  const response = await api.post('/payments', paymentData)
  return response.data
}
```

---

## 文件上传必须验证

Priority: P0
Category: Security

### 描述

文件上传功能必须在前端进行初步验证（类型、大小），最终验证由后端完成。避免上传恶意文件。

### 正确示例

```vue
<script setup lang="ts">
interface UploadConfig {
  maxSize: number // bytes
  allowedTypes: string[]
  allowedExtensions: string[]
}

const config: UploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
}

const validateFile = (file: File): { valid: boolean; error?: string } => {
  // 检查文件大小
  if (file.size > config.maxSize) {
    return { valid: false, error: '文件大小超过限制' }
  }
  
  // 检查 MIME 类型
  if (!config.allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' }
  }
  
  // 检查扩展名
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!config.allowedExtensions.includes(ext)) {
    return { valid: false, error: '不支持的文件扩展名' }
  }
  
  return { valid: true }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  const validation = validateFile(file)
  if (!validation.valid) {
    alert(validation.error)
    input.value = '' // 清除选择
    return
  }
  
  // 上传文件
  const formData = new FormData()
  formData.append('file', file)
  
  await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
</script>

<template>
  <input 
    type="file" 
    :accept="config.allowedTypes.join(',')"
    @change="handleFileSelect"
  />
</template>
```

---

## 避免信息泄露

Priority: P1
Category: Security

### 描述

错误信息、日志输出、控制台调试信息不应在生产环境中暴露敏感信息。

### 错误示例

```typescript
// 错误：暴露详细错误信息
catch (error) {
  console.error('数据库连接失败:', error)
  alert(`错误: ${error.message}\n堆栈: ${error.stack}`)
}

// 错误：在模板中显示调试信息
<template>
  <pre>{{ JSON.stringify(user, null, 2) }}</pre>
  <div>Token: {{ accessToken }}</div>
</template>
```

### 正确示例

```typescript
// 正确：生产环境隐藏详细错误
const handleError = (error: Error, context: string) => {
  // 记录到监控服务
  if (import.meta.env.PROD) {
    errorReportingService.capture(error, { context })
    // 给用户显示友好消息
    showToast('操作失败，请稍后重试')
  } else {
    // 开发环境可以显示详细信息
    console.error(`[${context}]`, error)
  }
}

// 正确：生产环境移除调试代码
<template>
  <!-- 只在开发环境显示调试信息 -->
  <pre v-if="isDev">{{ debugInfo }}</pre>
</template>

<script setup lang="ts">
const isDev = import.meta.env.DEV
const debugInfo = computed(() => 
  isDev ? JSON.stringify(state, null, 2) : ''
)
</script>
```

---

## 第三方依赖安全

Priority: P1
Category: Security

### 描述

使用第三方库时应检查其安全性，定期更新依赖，避免使用已知有漏洞的版本。

### 正确做法

```bash
# 定期检查依赖安全漏洞
pnpm audit

# 更新有漏洞的依赖
pnpm audit --fix

# 检查过时的依赖
pnpm outdated
```

```typescript
// 使用知名、维护活跃的库
// 检查 npm 下载量、最近更新时间、issue 处理情况

// 锁定依赖版本，使用 lockfile
// pnpm-lock.yaml / package-lock.json / yarn.lock

// 审查新依赖的代码和权限
// 避免安装请求过多权限的包
```

---

## 点击劫持防护

Priority: P2
Category: Security

### 描述

敏感操作页面应防止被嵌入 iframe 中，避免点击劫持攻击。

### 正确示例

```typescript
// main.ts 或路由守卫中
const preventClickjacking = () => {
  // 检查是否被嵌入 iframe
  if (window.self !== window.top) {
    // 敏感页面不允许被嵌入
    window.top?.location.replace(window.self.location.href)
  }
}

// 在敏感页面调用
// 最好配合后端设置 X-Frame-Options 和 CSP 头
```

```

---

## skills/shared-skills/frontend-code-review/references/typescript.md

`skills/shared-skills/frontend-code-review/references/typescript.md`

```markdown
# 规则目录 — TypeScript 类型安全（项目规范版）

本文件用于审查本仓 TypeScript 实现是否符合项目命名约定、目录职责与类型安全要求。

---

## Props 必须使用类型声明

IsUrgent: Critical
Category: TypeScript

### 描述

在 `<script setup>` 中使用 `defineProps` 时，必须使用基于类型的声明方式而非运行时声明。类型声明提供更好的类型推断和 IDE 支持。

### 错误示例

```vue
<script setup lang="ts">
// 错误：运行时声明，缺少类型信息
const props = defineProps({
  title: String,
  count: Number,
  items: Array
})
</script>
```

### 正确示例

```vue
<script setup lang="ts">
// 正确：基于类型的声明
interface Props {
  title: string
  count: number
  items: string[]
}

const props = defineProps<Props>()

// 或者内联类型
const props = defineProps<{
  title: string
  count: number
  items: string[]
}>()
</script>
```

---

## 业务函数命名必须符合 onXxx / handleXxx 约定

IsUrgent: Warning
Category: TypeScript

### 描述

组件内函数命名需遵循项目编码规范：

- 事件处理函数使用 `onXxx`
- 内部处理逻辑使用 `handleXxx`

命名不一致会增加理解成本，影响审查和维护效率。

### 错误示例

```typescript
function clickSubmit() {}
function doDelete() {}
function processForm() {}
```

### 正确示例

```typescript
function onSubmitClick() {}
function handleDelete() {}
function handleFormValidate() {}
```

---

## Composable 和 Store 命名必须与目录职责一致

IsUrgent: Warning
Category: TypeScript

### 描述

命名应体现文件职责：

- composable 导出函数必须为 `useXxx`
- store 导出必须为 `useXxxStore`
- 类型定义应在 `types.ts` 或明确的类型目录，避免散落

此项用于发现“命名像 util，职责却是 store/composable”的结构风险。

---

## 避免使用 any 类型

IsUrgent: Critical
Category: TypeScript

### 描述

禁止使用 `any` 类型，因为它会绕过 TypeScript 的类型检查，导致潜在的运行时错误。应该使用具体类型、泛型或 `unknown` 类型替代。

### 错误示例

```typescript
// 错误：使用 any
function processData(data: any) {
  return data.value
}

const items: any[] = []
```

### 正确示例

```typescript
// 正确：使用具体类型
interface DataItem {
  value: string
  id: number
}

function processData(data: DataItem) {
  return data.value
}

const items: DataItem[] = []

// 当类型不确定时，使用 unknown 并进行类型守卫
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value
  }
  return null
}
```

---

## Emits 必须使用类型声明

IsUrgent: Critical
Category: TypeScript

### 描述

使用 `defineEmits` 时，必须使用基于类型的声明方式，明确指定每个事件的名称和参数类型。

### 错误示例

```vue
<script setup lang="ts">
// 错误：运行时声明
const emit = defineEmits(['update', 'delete', 'select'])

// 错误：缺少参数类型
const emit = defineEmits<{
  (e: 'update'): void
  (e: 'select'): void
}>()
</script>
```

### 正确示例

```vue
<script setup lang="ts">
// 正确：完整的类型声明（Vue 3.3+ 推荐语法）
const emit = defineEmits<{
  update: [id: number, value: string]
  delete: [id: number]
  select: [item: { id: number; name: string }]
}>()

// 或者使用函数签名语法
const emit = defineEmits<{
  (e: 'update', id: number, value: string): void
  (e: 'delete', id: number): void
  (e: 'select', item: { id: number; name: string }): void
}>()
</script>
```

---

## ref 必须指定泛型类型

IsUrgent: Warning
Category: TypeScript

### 描述

当 `ref` 的初始值无法推断出正确的类型时（如初始值为 `null`、`undefined` 或空数组），必须显式指定泛型类型。

### 错误示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 错误：类型被推断为 Ref<null>
const user = ref(null)

// 错误：类型被推断为 Ref<never[]>
const items = ref([])

// 错误：类型被推断为 Ref<undefined>
const selectedId = ref(undefined)
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
}

// 正确：显式指定泛型
const user = ref<User | null>(null)
const items = ref<string[]>([])
const selectedId = ref<number | undefined>(undefined)

// 当初始值能推断类型时，可以省略泛型
const count = ref(0) // Ref<number>
const name = ref('') // Ref<string>
</script>
```

---

## reactive 必须使用 interface 定义类型

IsUrgent: Warning
Category: TypeScript

### 描述

使用 `reactive` 创建响应式对象时，应该通过 `interface` 或 `type` 定义对象的完整类型结构，而不是依赖类型推断。

### 错误示例

```vue
<script setup lang="ts">
import { reactive } from 'vue'

// 错误：缺少类型注解，后续添加属性会报错
const state = reactive({
  loading: false,
  data: null
})

// 之后无法添加新属性
state.error = 'something went wrong' // TypeScript 错误
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { reactive } from 'vue'

interface State {
  loading: boolean
  data: string[] | null
  error: string | null
}

const state: State = reactive({
  loading: false,
  data: null,
  error: null
})
</script>
```

---

## 函数参数和返回值必须有类型注解

IsUrgent: Warning
Category: TypeScript

### 描述

除了简单的箭头函数外，所有函数都应该有明确的参数类型和返回值类型注解。这提高了代码的可读性和可维护性。

### 错误示例

```typescript
// 错误：缺少类型注解
function fetchUser(id) {
  return api.get(`/users/${id}`)
}

// 错误：缺少返回值类型
async function saveUser(user: User) {
  const result = await api.post('/users', user)
  return result.data
}
```

### 正确示例

```typescript
interface User {
  id: number
  name: string
  email: string
}

// 正确：完整的类型注解
function fetchUser(id: number): Promise<User> {
  return api.get<User>(`/users/${id}`)
}

async function saveUser(user: Omit<User, 'id'>): Promise<User> {
  const result = await api.post<User>('/users', user)
  return result.data
}

// 简单箭头函数可以依赖类型推断
const double = (n: number) => n * 2
```

---

## 禁止使用非空断言操作符

IsUrgent: Warning
Category: TypeScript

### 描述

避免使用非空断言操作符 `!`，它会绕过 TypeScript 的空值检查。应该使用可选链 `?.`、空值合并 `??` 或类型守卫来安全地处理可能为空的值。

### 错误示例

```typescript
// 错误：使用非空断言
const userName = user!.name
const firstItem = items![0]
element!.focus()
```

### 正确示例

```typescript
// 正确：使用可选链和空值合并
const userName = user?.name ?? '未知用户'
const firstItem = items?.[0]

// 正确：使用类型守卫
if (element) {
  element.focus()
}

// 正确：使用 early return
function processUser(user: User | null) {
  if (!user) {
    return null
  }
  // 此处 user 的类型已被收窄为 User
  return user.name
}
```

---

## 类型导入必须使用 import type

IsUrgent: Suggestion
Category: TypeScript

### 描述

当导入仅用于类型注解的内容时，应该使用 `import type` 语法。这有助于构建工具更好地进行 tree-shaking，并明确表达导入的意图。

### 错误示例

```typescript
// 错误：类型导入和值导入混在一起
import { User, fetchUser, Role } from '@/types/user'

// 如果 User 和 Role 只用于类型注解
const user: User = await fetchUser(1)
```

### 正确示例

```typescript
// 正确：分离类型导入
import type { User, Role } from '@/types/user'
import { fetchUser } from '@/api/user'

const user: User = await fetchUser(1)

// 或者使用内联 type 标记
import { type User, type Role, fetchUser } from '@/api/user'
```

---

## 使用 const 断言锁定字面量类型

IsUrgent: Suggestion
Category: TypeScript

### 描述

对于不应该被修改的常量对象或数组，使用 `as const` 断言来获得更精确的字面量类型，而不是宽泛的类型推断。

### 错误示例

```typescript
// 错误：类型被推断为 { status: string }
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
}

// 错误：类型被推断为 string[]
const ROLES = ['admin', 'user', 'guest']
```

### 正确示例

```typescript
// 正确：使用 as const
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
} as const

// 类型为 { readonly ACTIVE: 'active', readonly INACTIVE: 'inactive', readonly PENDING: 'pending' }

const ROLES = ['admin', 'user', 'guest'] as const
// 类型为 readonly ['admin', 'user', 'guest']

// 可以从 const 对象推导类型
type Status = typeof STATUS[keyof typeof STATUS] // 'active' | 'inactive' | 'pending'
type Role = typeof ROLES[number] // 'admin' | 'user' | 'guest'
```

---

## 泛型参数必须有描述性名称

IsUrgent: Suggestion
Category: TypeScript

### 描述

泛型参数应该使用描述性名称，而不是单个字母（除非在非常简单的上下文中）。这提高了代码的可读性。

### 错误示例

```typescript
// 错误：泛型参数名称不具描述性
function transform<T, U, V>(
  data: T,
  mapper: (item: T) => U,
  filter: (item: U) => V
): V[] {
  // ...
}
```

### 正确示例

```typescript
// 正确：使用描述性名称
function transform<TInput, TIntermediate, TOutput>(
  data: TInput,
  mapper: (item: TInput) => TIntermediate,
  filter: (item: TIntermediate) => TOutput
): TOutput[] {
  // ...
}

// 简单场景可以使用单字母
function identity<T>(value: T): T {
  return value
}
```

```

---

## skills/shared-skills/frontend-code-review/references/vue-component.md

`skills/shared-skills/frontend-code-review/references/vue-component.md`

```markdown
# 规则目录 — Vue 组件设计（项目规范版）

本文件用于审查 Vue 3 单文件组件（SFC）是否符合本仓规范，重点关注组件拆分、目录放置、职责边界和可维护性。

---

## 组件命名必须使用多词名称

IsUrgent: Critical
Category: Vue Component

### 描述

组件名称必须始终使用多词命名（除了根组件 `App`），以避免与现有或未来的 HTML 元素冲突。HTML 元素都是单词的，多词命名可以确保组件的唯一性。

### 错误示例

```vue
<!-- 错误：单词命名 -->
<script setup lang="ts">
// components/Todo.vue
</script>
```

### 正确示例

```vue
<!-- 正确：多词命名 -->
<script setup lang="ts">
// components/TodoItem.vue
// components/UserProfile.vue
</script>
```

---

## Props 必须使用详细定义

IsUrgent: Critical
Category: Vue Component

### 描述

Props 定义必须尽可能详细，至少指定类型。在生产环境代码中，应始终包含类型、是否必填、默认值和验证器（如适用）。

### 错误示例

```vue
<script setup lang="ts">
// 错误：使用数组定义 props
defineProps(['status', 'title'])
</script>
```

### 正确示例

```vue
<script setup lang="ts">
// 正确：使用 TypeScript 类型定义
interface Props {
  status: 'active' | 'inactive' | 'pending'
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

---

## v-for 必须配合 key 使用

IsUrgent: Critical
Category: Vue Component

### 描述

在组件上使用 `v-for` 时，必须始终配合 `key` 属性，以便 Vue 能够跟踪每个节点的身份，从而重用和重新排序现有元素。`key` 值必须是唯一且稳定的标识符，不要使用数组索引。

### 错误示例

```vue
<template>
  <!-- 错误：没有 key -->
  <li v-for="item in items">{{ item.name }}</li>
  
  <!-- 错误：使用索引作为 key -->
  <li v-for="(item, index) in items" :key="index">{{ item.name }}</li>
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用唯一标识符作为 key -->
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>
</template>
```

---

## v-if 和 v-for 不能同时使用

IsUrgent: Critical
Category: Vue Component

### 描述

永远不要在同一个元素上同时使用 `v-if` 和 `v-for`。当它们同时存在时，`v-if` 的优先级更高，这意味着 `v-if` 无法访问 `v-for` 作用域中的变量。

### 错误示例

```vue
<template>
  <!-- 错误：v-if 和 v-for 在同一元素上 -->
  <li v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确方案 1：使用 computed 过滤 -->
  <li v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </li>
  
  <!-- 正确方案 2：将 v-if 移到外层容器 -->
  <template v-for="user in users" :key="user.id">
    <li v-if="user.isActive">{{ user.name }}</li>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const activeUsers = computed(() => users.value.filter(u => u.isActive))
</script>
```

---

## 组件必须使用 scoped 样式

IsUrgent: Warning
Category: Vue Component

### 描述

对于应用程序内的组件，样式应该使用 `scoped` 属性来确保样式隔离，防止样式泄漏到其他组件。全局样式应该放在单独的样式文件中统一管理。

### 错误示例

```vue
<style>
/* 错误：非 scoped 样式会影响全局 */
.btn {
  padding: 10px;
}
</style>
```

### 正确示例

```vue
<style scoped>
/* 正确：scoped 样式只影响当前组件 */
.btn {
  padding: 10px;
}
</style>
```

---

## 组件文件名必须使用 PascalCase 或 kebab-case

IsUrgent: Warning
Category: Vue Component

### 描述

单文件组件的文件名应该始终使用 PascalCase（推荐）或 kebab-case。PascalCase 在 IDE 中具有更好的自动补全支持，因为它与 JavaScript 中引用组件的方式一致。

### 错误示例

```
// 错误：使用其他命名方式
components/mycomponent.vue
components/myComponent.vue
components/my_component.vue
```

### 正确示例

```
// 正确：PascalCase（推荐）
components/MyComponent.vue
components/UserProfile.vue

// 正确：kebab-case
components/my-component.vue
components/user-profile.vue
```

---

## 组件放置必须符合目录职责

IsUrgent: Critical
Category: Vue Component

### 描述

组件放置必须遵循项目结构规则：

- 跨页面复用、业务无关组件放 `src/components/`
- 仅单页使用组件放对应 `src/views/<module>/<feature>/` 目录

禁止将页面私有组件长期放在 `src/components/`，否则会造成目录污染和误复用。

### 错误示例

```text
src/components/UserDetailFilters.vue
src/components/UserDetailTable.vue
# 上述仅在 views/user-manage/detail 下使用
```

### 正确示例

```text
src/views/user-manage/detail/components/UserDetailFilters.vue
src/views/user-manage/detail/components/UserDetailTable.vue

# 真正通用组件
src/components/ConfirmDialog.vue
```

---

## 页面组件必须保持职责单一

IsUrgent: Warning
Category: Vue Component

### 描述

单个页面组件不应同时承担“列表渲染 + 表单状态 + API 请求编排 + 权限判断 + 路由跳转 + 弹窗控制”等多类职责。出现多职责耦合时，应拆分为：

- 展示子组件（UI）
- `composable`（状态和流程编排）
- `api` 层请求封装

### 典型风险信号

- 组件体量持续膨胀，变更一处容易影响其他流程
- 同一文件中出现大量互不相关的响应式状态
- 业务逻辑无法复用，只能复制粘贴到新页面

---

## Props 和 Emits 必须体现清晰边界

IsUrgent: Warning
Category: Vue Component

### 描述

子组件接口应表达“最小必要输入/输出”，避免以下反模式：

- 通过 Props 传入整个大对象，仅使用其中少数字段
- Emits 事件语义模糊（如 `change`、`update` 无上下文）
- 通过过深层级 Props 透传状态导致耦合

建议按领域语义命名事件，并传递最小字段集合。

---

## 组件拆分建议输出规范（审查专用）

IsUrgent: Suggestion
Category: Vue Component

### 描述

当识别到组件拆分问题时，审查报告应给出可执行拆分建议，至少包含：

1. 建议新增的子组件列表（名称 + 职责）
2. 建议抽离的 `composable` 名称与职责
3. 建议保留在页面容器组件中的最小职责

### 示例输出

```markdown
- 拆分建议：
  - `UserListToolbar.vue`：筛选条件、查询事件
  - `UserListTable.vue`：表格渲染与分页事件
  - `useUserListPage.ts`：列表查询、筛选状态、分页状态编排
  - 页面容器仅保留路由参数处理与子组件编排
```

---

## 基础组件必须使用统一前缀

IsUrgent: Warning
Category: Vue Component

### 描述

无状态的基础组件（如按钮、输入框等）应该使用统一的前缀（如 `Base`、`App` 或 `V`）。这样可以在文件系统中将它们组织在一起，并在使用时一眼识别出它们是基础组件。

### 错误示例

```
// 错误：没有统一前缀
components/Button.vue
components/Input.vue
components/Icon.vue
```

### 正确示例

```
// 正确：使用统一前缀
components/BaseButton.vue
components/BaseInput.vue
components/BaseIcon.vue

// 或者
components/AppButton.vue
components/AppInput.vue
```

---

## 单实例组件必须使用 The 前缀

IsUrgent: Suggestion
Category: Vue Component

### 描述

每个页面只使用一次且不接受任何 props 的组件（如页眉、页脚、侧边栏）应该以 `The` 前缀命名，以表示它们的唯一性。

### 正确示例

```
components/TheHeader.vue
components/TheSidebar.vue
components/TheFooter.vue
```

---

## 紧密耦合的组件名应该反映父子关系

IsUrgent: Suggestion
Category: Vue Component

### 描述

与父组件紧密耦合的子组件应该以父组件名作为前缀。这样在文件系统中它们会按字母顺序排列在一起，便于理解组件之间的关系。

### 错误示例

```
// 错误：没有体现父子关系
components/SearchInput.vue
components/SearchResults.vue
components/ClearButton.vue
```

### 正确示例

```
// 正确：以父组件名作为前缀
components/SearchSidebar.vue
components/SearchSidebarInput.vue
components/SearchSidebarResults.vue
components/SearchSidebarClearButton.vue
```

---

## 组件选项顺序规范

IsUrgent: Suggestion
Category: Vue Component

### 描述

在 `<script setup>` 中，推荐按以下顺序组织代码：

1. 类型导入（`import type`）
2. 第三方库导入
3. 内部模块导入（组件、composables、utils 等）
4. 类型定义（`interface`、`type`）
5. Props 和 Emits 定义
6. 响应式状态（`ref`、`reactive`、`computed`）
7. 生命周期钩子
8. 方法函数
9. 暴露的属性（`defineExpose`）

### 正确示例

```vue
<script setup lang="ts">
// 1. 类型导入
import type { PropType } from 'vue'

// 2. 第三方库导入
import { ref, computed, onMounted } from 'vue'

// 3. 内部模块导入
import BaseButton from '@/components/BaseButton.vue'
import { useUser } from '@/composables/useUser'
import { formatDate } from '@/utils/date'

// 4. 类型定义
interface User {
  id: number
  name: string
}

// 5. Props 和 Emits
const props = defineProps<{
  userId: number
}>()

const emit = defineEmits<{
  update: [user: User]
}>()

// 6. 响应式状态
const { user, loading } = useUser(props.userId)
const isEditing = ref(false)
const displayName = computed(() => user.value?.name ?? '未知用户')

// 7. 生命周期钩子
onMounted(() => {
  console.log('组件已挂载')
})

// 8. 方法函数
function handleSubmit() {
  emit('update', user.value)
}
</script>
```

---

## 模板中组件名必须使用 PascalCase

IsUrgent: Suggestion
Category: Vue Component

### 描述

在模板中引用组件时，推荐使用 PascalCase。这样可以与 JavaScript/TypeScript 中的组件注册方式保持一致，并且更容易与原生 HTML 元素区分。

### 错误示例

```vue
<template>
  <!-- 错误：使用 kebab-case -->
  <my-component />
  <user-profile />
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用 PascalCase -->
  <MyComponent />
  <UserProfile />
</template>
```

```

---

## skills/shared-skills/frontend-code-review/references/vue-core.md

`skills/shared-skills/frontend-code-review/references/vue-core.md`

```markdown
# 规则目录 — Vue 3 核心

本文件包含 Vue 3 核心功能相关的代码审查规则，涵盖响应式系统、生命周期、Composition API 等。

---

## 使用 Composition API 替代 Options API

Priority: P1
Category: Vue Core

### 描述

新代码应优先使用 Composition API 和 `<script setup>` 语法，而非 Options API。Composition API 提供更好的 TypeScript 支持、逻辑复用能力和代码组织。

### 错误示例

```vue
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>
```

---

## 响应式变量必须正确声明

Priority: P0
Category: Vue Core

### 描述

响应式数据必须使用 `ref`、`reactive`、`computed` 等响应式 API 声明。直接使用普通变量会导致视图不更新。

### 错误示例

```vue
<script setup lang="ts">
// 错误：普通变量不会触发视图更新
let count = 0
const increment = () => count++
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>
```

---

## 避免在模板中直接解构 reactive 对象

Priority: P0
Category: Vue Core

### 描述

直接解构 `reactive` 对象会丢失响应性。应使用 `toRefs` 或直接访问对象属性。

### 错误示例

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({ name: 'Vue', version: 3 })
// 错误：解构后 name 和 version 不再是响应式的
const { name, version } = state
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { reactive, toRefs } from 'vue'

const state = reactive({ name: 'Vue', version: 3 })
const { name, version } = toRefs(state)
// 或者直接在模板中使用 state.name
</script>
```

---

## computed 用于派生状态

Priority: P1
Category: Vue Core

### 描述

派生状态应使用 `computed` 而非在方法或 watch 中手动计算。computed 具有缓存特性，只在依赖变化时重新计算。

### 错误示例

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')
const fullName = ref('')

// 错误：手动同步派生状态
watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
}, { immediate: true })
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

---

## watch 必须正确清理副作用

Priority: P0
Category: Vue Core

### 描述

`watch` 和 `watchEffect` 中的副作用（如定时器、事件监听、订阅）必须在清理函数中正确清理，否则会导致内存泄漏。

### 错误示例

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const id = ref(1)

// 错误：没有清理定时器
watchEffect(() => {
  const timer = setInterval(() => {
    console.log('tick', id.value)
  }, 1000)
})
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const id = ref(1)

watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('tick', id.value)
  }, 1000)
  
  onCleanup(() => clearInterval(timer))
})
</script>
```

---

## 避免在 setup 外部使用组合式函数

Priority: P0
Category: Vue Core

### 描述

组合式函数（composables）必须在 `setup()` 或 `<script setup>` 的同步执行上下文中调用，不能在异步回调或条件语句中调用。

### 错误示例

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

// 错误：在异步回调中调用
onMounted(async () => {
  await someAsyncOperation()
  const router = useRouter() // 可能导致警告或错误
})
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

// 正确：在 setup 顶层调用
const router = useRouter()

onMounted(async () => {
  await someAsyncOperation()
  router.push('/target')
})
</script>
```

---

## 生命周期钩子只能在 setup 中注册

Priority: P0
Category: Vue Core

### 描述

生命周期钩子（`onMounted`、`onUnmounted` 等）必须在 setup 的同步执行期间注册，不能在异步操作后注册。

### 错误示例

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

const init = async () => {
  await fetchData()
  // 错误：在异步操作后注册生命周期钩子
  onMounted(() => {
    console.log('mounted')
  })
}

init()
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

// 正确：同步注册生命周期钩子
onMounted(async () => {
  await fetchData()
  console.log('mounted and data fetched')
})
</script>
```

---

## 使用 defineProps 和 defineEmits 的类型声明

Priority: P1
Category: Vue Core

### 描述

在 TypeScript 项目中，应使用类型声明语法定义 props 和 emits，而非运行时声明语法。

### 错误示例

```vue
<script setup lang="ts">
// 运行时声明 - 类型推断较弱
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0
  }
})
</script>
```

### 正确示例

```vue
<script setup lang="ts">
// 类型声明 - 完整的类型支持
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

---

## v-for 必须使用唯一且稳定的 key

Priority: P0
Category: Vue Core

### 描述

`v-for` 指令必须绑定唯一且稳定的 `key` 属性，用于 Vue 的虚拟 DOM diff 算法。避免使用数组索引作为 key（除非列表不会重新排序）。

### 错误示例

```vue
<template>
  <!-- 错误：使用索引作为 key -->
  <li v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </li>
  
  <!-- 错误：没有 key -->
  <li v-for="item in items">
    {{ item.name }}
  </li>
</template>
```

### 正确示例

```vue
<template>
  <!-- 正确：使用唯一标识符 -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

---

## 避免 v-if 和 v-for 同时使用

Priority: P1
Category: Vue Core

### 描述

`v-if` 和 `v-for` 不应同时用在同一元素上。Vue 3 中 `v-if` 优先级高于 `v-for`，可能导致意外行为。

### 错误示例

```vue
<template>
  <!-- 错误：v-if 和 v-for 在同一元素 -->
  <li v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

### 正确示例

```vue
<template>
  <!-- 方案1：使用 computed 过滤 -->
  <li v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </li>
  
  <!-- 方案2：使用 template 包裹 -->
  <template v-for="user in users" :key="user.id">
    <li v-if="user.isActive">
      {{ user.name }}
    </li>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const activeUsers = computed(() => users.value.filter(u => u.isActive))
</script>
```

---

## 组件必须使用 defineExpose 暴露方法

Priority: P1
Category: Vue Core

### 描述

使用 `<script setup>` 时，组件默认不暴露任何属性。如果父组件需要通过 ref 访问子组件方法，必须使用 `defineExpose` 显式暴露。

### 错误示例

```vue
<!-- Child.vue -->
<script setup lang="ts">
const submit = () => {
  // 提交逻辑
}
// 错误：没有暴露 submit 方法
</script>

<!-- Parent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref<InstanceType<typeof Child>>()

// 错误：childRef.value?.submit() 将是 undefined
</script>
```

### 正确示例

```vue
<!-- Child.vue -->
<script setup lang="ts">
const submit = () => {
  // 提交逻辑
}

defineExpose({
  submit
})
</script>

<!-- Parent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref<InstanceType<typeof Child>>()

const handleSubmit = () => {
  childRef.value?.submit()
}
</script>
```

---

## 异步组件使用 defineAsyncComponent

Priority: P2
Category: Vue Core

### 描述

懒加载组件应使用 `defineAsyncComponent` 包装，并提供加载状态和错误处理。

### 错误示例

```vue
<script setup lang="ts">
// 错误：直接使用动态 import
const AsyncModal = () => import('./Modal.vue')
</script>
```

### 正确示例

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const AsyncModal = defineAsyncComponent({
  loader: () => import('./Modal.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 3000
})
</script>
```

```

---

## skills/shared-skills/frontend-code-review/references/vue-router.md

`skills/shared-skills/frontend-code-review/references/vue-router.md`

```markdown
# 规则目录 — Vue Router（项目规范版）

本文件用于审查路由配置是否符合本仓模块化规范，并与 `views` 目录结构保持一致。

---

## 路由路径必须使用 kebab-case

IsUrgent: Warning
Category: Vue Router

### 描述

路由的 `path` 必须使用 kebab-case（短横线分隔）命名，这是 URL 的标准约定。路由名称（`name`）则推荐使用 camelCase 或 kebab-case。

### 错误示例

```typescript
// 错误：使用 camelCase 或 PascalCase 作为路径
const routes = [
  { path: '/userProfile', name: 'userProfile', component: UserProfile },
  { path: '/OrderHistory', name: 'OrderHistory', component: OrderHistory },
  { path: '/my_settings', name: 'my_settings', component: Settings }
]
```

### 正确示例

```typescript
// 正确：路径使用 kebab-case
const routes = [
  { path: '/user-profile', name: 'userProfile', component: UserProfile },
  { path: '/order-history', name: 'orderHistory', component: OrderHistory },
  { path: '/my-settings', name: 'mySettings', component: Settings }
]
```

---

## 路由必须按业务模块拆分管理

IsUrgent: Warning
Category: Vue Router

### 描述

新增路由时应优先放到 `router/modules/` 对应业务模块文件，再在入口统一合并。避免在单一 `index.ts` 持续堆积所有路由。

### 错误示例

```typescript
// 错误：所有路由堆在一个文件
const routes: RouteRecordRaw[] = [
  // ...几百行路由
]
```

### 正确示例

```typescript
// router/modules/user-manage.ts
export const userManageRoutes: RouteRecordRaw[] = [/* ... */]

// router/index.ts
const routes = [
  ...userManageRoutes,
  ...operationManageRoutes
]
```

---

## 路由组件路径必须与 views 业务目录对齐

IsUrgent: Warning
Category: Vue Router

### 描述

路由对应页面应落在 `src/views` 业务目录下，命名与模块语义一致。出现“路由模块 A 指向模块 B 页面”或临时目录堆放时，应标记为结构风险。

---

## 路由组件必须使用懒加载

IsUrgent: Critical
Category: Vue Router

### 描述

除了首屏必须显示的组件外，所有路由组件都应该使用动态 `import()` 实现懒加载，以减少初始包大小并提高首屏加载速度。

### 错误示例

```typescript
// 错误：直接导入所有组件
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import UserProfile from '@/views/UserProfile.vue'
import Settings from '@/views/Settings.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user-profile', component: UserProfile },
  { path: '/settings', component: Settings }
]
```

### 正确示例

```typescript
// 正确：使用懒加载
const routes = [
  // 首屏组件可以直接导入
  { path: '/', component: () => import('@/views/Home.vue') },
  // 其他组件懒加载
  { path: '/about', component: () => import('@/views/About.vue') },
  { path: '/user-profile', component: () => import('@/views/UserProfile.vue') },
  { path: '/settings', component: () => import('@/views/Settings.vue') }
]

// 或者使用 webpackChunkName 进行分组
const routes = [
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue'),
    children: [
      {
        path: 'users',
        component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminUsers.vue')
      }
    ]
  }
]
```

---

## 路由参数必须进行验证

IsUrgent: Critical
Category: Vue Router

### 描述

对于动态路由参数，应该使用 `props: true` 将参数作为组件 props 传递，并在组件中进行类型验证。这比在组件内部直接访问 `$route.params` 更安全、更易测试。

### 错误示例

```typescript
// 错误：没有参数验证
const routes = [
  { path: '/user/:id', component: UserProfile }
]
```

```vue
<!-- 错误：直接访问 $route.params -->
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
// id 的类型是 string | string[]，不安全
const userId = route.params.id
</script>
```

### 正确示例

```typescript
// 正确：使用 props 函数进行转换和验证
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    props: (route) => ({
      id: Number(route.params.id)
    })
  }
]
```

```vue
<!-- 正确：通过 props 接收并验证 -->
<script setup lang="ts">
const props = defineProps<{
  id: number
}>()

// id 是经过验证的 number 类型
</script>
```

---

## 导航守卫必须处理所有情况

IsUrgent: Critical
Category: Vue Router

### 描述

导航守卫（`beforeEach`、`beforeEnter` 等）必须明确处理所有可能的情况，包括允许导航、拒绝导航和重定向。避免出现"悬挂"的守卫导致导航卡住。

### 错误示例

```typescript
// 错误：没有处理所有情况
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      return '/login' // 只处理了未登录的情况
    }
    // 登录状态没有明确 return
  }
  // 不需要认证的路由没有处理
})
```

### 正确示例

```typescript
// 正确：明确处理所有情况
router.beforeEach((to, from) => {
  const userStore = useUserStore()
  
  // 需要认证的路由
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 重定向到登录页，并记录原目标
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
  }
  
  // 已登录用户访问登录页
  if (to.path === '/login' && userStore.isLoggedIn) {
    return '/'
  }
  
  // 允许导航
  return true
})
```

---

## 路由元信息必须有类型定义

IsUrgent: Warning
Category: Vue Router

### 描述

使用 TypeScript 时，应该扩展 Vue Router 的类型定义来声明路由元信息（`meta`）的类型，避免使用 `any`。

### 错误示例

```typescript
// 错误：meta 类型不明确
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  }
]

// 访问 meta 时类型是 any
router.beforeEach((to) => {
  if (to.meta.requiresAuth) { // to.meta 类型是 RouteMeta (可能是 any)
    // ...
  }
})
```

### 正确示例

```typescript
// router/types.ts - 扩展 RouteMeta 类型
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    title?: string
    icon?: string
  }
}
```

```typescript
// router/index.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台'
    }
  }
]

// 现在 meta 有正确的类型提示
router.beforeEach((to) => {
  if (to.meta.requiresAuth) { // 类型安全
    const roles = to.meta.roles // string[] | undefined
  }
})
```

---

## 避免在组件中直接使用 router.push 的字符串参数

IsUrgent: Warning
Category: Vue Router

### 描述

使用 `router.push` 或 `<RouterLink>` 时，推荐使用命名路由（带 `name` 属性的对象）而不是路径字符串。这样在路由路径变更时只需要修改路由配置，不需要修改所有引用的地方。

### 错误示例

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 错误：使用硬编码的路径字符串
function goToUser(id: number) {
  router.push(`/users/${id}/profile`)
}
</script>

<template>
  <!-- 错误：硬编码路径 -->
  <RouterLink to="/users/123/profile">用户资料</RouterLink>
</template>
```

### 正确示例

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 正确：使用命名路由
function goToUser(id: number) {
  router.push({
    name: 'userProfile',
    params: { id }
  })
}
</script>

<template>
  <!-- 正确：使用命名路由 -->
  <RouterLink :to="{ name: 'userProfile', params: { id: 123 } }">
    用户资料
  </RouterLink>
</template>
```

---

## 嵌套路由必须有父组件的 RouterView

IsUrgent: Critical
Category: Vue Router

### 描述

使用嵌套路由时，父路由组件必须包含 `<RouterView>` 来渲染子路由。如果父路由只是用于分组而不需要布局，应该使用空组件或 `<RouterView>` 作为组件。

### 错误示例

```typescript
// 错误：父路由没有 RouterView，子路由无法渲染
const routes = [
  {
    path: '/admin',
    component: AdminLayout, // 如果 AdminLayout 没有 <RouterView>
    children: [
      { path: 'users', component: AdminUsers },
      { path: 'settings', component: AdminSettings }
    ]
  }
]
```

### 正确示例

```typescript
// 正确方案 1：父组件包含 RouterView
const routes = [
  {
    path: '/admin',
    component: AdminLayout, // AdminLayout 内部有 <RouterView />
    children: [
      { path: 'users', component: () => import('@/views/AdminUsers.vue') },
      { path: 'settings', component: () => import('@/views/AdminSettings.vue') }
    ]
  }
]

// 正确方案 2：使用 RouterView 作为父组件
import { RouterView } from 'vue-router'

const routes = [
  {
    path: '/admin',
    component: RouterView, // 直接使用 RouterView
    children: [
      { path: '', component: () => import('@/views/AdminDashboard.vue') },
      { path: 'users', component: () => import('@/views/AdminUsers.vue') }
    ]
  }
]
```

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar />
    <main>
      <!-- 必须有 RouterView 来渲染子路由 -->
      <RouterView />
    </main>
  </div>
</template>
```

---

## 路由跳转后必须处理滚动行为

IsUrgent: Suggestion
Category: Vue Router

### 描述

创建路由实例时应该配置 `scrollBehavior`，确保页面跳转后的滚动位置符合用户预期（如返回上一页时恢复滚动位置，跳转新页面时滚动到顶部）。

### 正确示例

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（如浏览器后退），恢复到该位置
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果有锚点，滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 否则滚动到顶部
    return { top: 0 }
  }
})
```

---

## 404 路由必须放在最后

IsUrgent: Critical
Category: Vue Router

### 描述

捕获所有未匹配路由的 404 页面必须放在路由配置的最后，否则会拦截其后定义的有效路由。

### 错误示例

```typescript
// 错误：404 路由放在了其他路由前面
const routes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: NotFound }, // 会拦截下面的路由
  { path: '/about', component: About } // 永远不会被匹配
]
```

### 正确示例

```typescript
// 正确：404 路由放在最后
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: UserProfile },
  // 404 必须放最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]
```

```

---

## skills/shared-skills/frontend-design/.openskills.json

`skills/shared-skills/frontend-design/.openskills.json`

```json
{
  "source": "anthropics/skills",
  "sourceType": "git",
  "repoUrl": "https://github.com/anthropics/skills",
  "subpath": "skills/frontend-design",
  "installedAt": "2026-02-10T08:42:51.441Z"
}
```

---

## skills/shared-skills/frontend-design/LICENSE.txt

`skills/shared-skills/frontend-design/LICENSE.txt`

```

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

```

---

## skills/shared-skills/frontend-design/SKILL.md

`skills/shared-skills/frontend-design/SKILL.md`

```markdown
---
name: frontend-design
description: 创建具有高设计质量、独特且可用于生产的前端界面。当用户要求构建 Web 组件、页面、作品、海报或应用（如网站、落地页、仪表盘、React 组件、HTML/CSS 布局，或对任意 Web UI 进行样式/美化）时使用本技能。生成有创意、精致且避免通用 AI 审美的代码与 UI 设计。
license: Complete terms in LICENSE.txt
---

本技能指导创建独特、可用于生产的前端界面，避免千篇一律的「AI 风格」审美。用真实可运行的代码实现，并特别关注美学细节与创意选择。

用户会提供前端需求：要构建的组件、页面、应用或界面，可能包含用途、受众或技术约束等上下文。

## 设计思路

在写代码之前，先理解上下文并确定一个**鲜明**的美学方向：

- **目的**：这个界面要解决什么问题？谁在使用？
- **调性**：选一个明确方向——极简、极繁、复古未来、有机/自然、奢华/精致、活泼/玩具感、编辑/杂志、粗野/原始、装饰艺术/几何、柔和/粉彩、工业/实用等。可作灵感，但设计要忠于所选方向。
- **约束**：技术需求（框架、性能、无障碍等）。
- **差异化**：什么让这个界面**令人难忘**？用户会记住的那一点是什么？

**关键**：选定清晰的概念方向并精准执行。大胆的极繁与克制的极简都可行——重点是有意图，而不是强度。

然后实现可运行的代码（HTML/CSS/JS、React、Vue 等），要求：

- 可用于生产且功能完整
- 视觉上有冲击力、易记忆
- 与清晰的美学观点一致
- 在每一处细节上都经过精心打磨

## 前端美学指南

重点关注：

- **字体**：选择美观、独特、有辨识度的字体。避免 Arial、Inter 等通用字体；选用能提升前端美感的、有性格的字体。用有特色的展示字体搭配得体的正文字体。
- **色彩与主题**：坚持统一的美学。用 CSS 变量保证一致性。主色 + 鲜明点缀优于 timid、平均分配的色彩。
- **动效**：用动画做效果与微交互。HTML 优先用纯 CSS。有 React 时可用 Motion 库。聚焦高影响时刻：一次编排好的页面加载与错落出现（animation-delay）比零散的微交互更出彩。善用滚动触发和悬停状态制造惊喜。
- **空间与排版**：非常规布局、不对称、重叠、对角线流向、打破网格的元素、充足的留白或受控的密度。
- **背景与视觉细节**：营造氛围与层次，而不是默认纯色。加入与整体美学匹配的情境化效果与质感。可运用渐变网格、噪点纹理、几何图案、透明叠层、强烈阴影、装饰边框、自定义光标、颗粒叠加等。

**不要**使用常见的 AI 审美：过度使用的字体（Inter、Roboto、Arial、系统字体）、俗套配色（尤其是白底紫渐变）、可预测的布局与组件模式、缺乏情境个性的模板化设计。

根据上下文创造性理解并做出意外但合理的选择。每个设计都应不同。在亮/暗主题、不同字体、不同美学之间变化。**不要**在多次生成中收敛到相同选择（例如 Space Grotesk）。

**重要**：实现复杂度要与美学愿景匹配。极繁设计需要更丰富的代码、大量动效与效果；极简或精致设计需要克制、精准以及对间距、字体和细微细节的用心。优雅来自把愿景执行到位。

记住：Claude 有能力做出出色的创意工作。不要保守，在跳出框架并全力投入一个独特愿景时，展示真正能做出的东西。

```

---

## skills/shared-skills/git-commit-helper/SKILL.md

`skills/shared-skills/git-commit-helper/SKILL.md`

```markdown
---
name: Git Commit Helper
description: 根据 git 变更分析生成描述性提交信息。当用户请求帮助撰写提交信息或审查暂存变更时使用。
hooks:
  PostToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "echo \"[$(date)] Git Commit Helper: Analyzed git diff for commit message\" >> ~/.claude/git-commit-helper.log"
---

# Git Commit Helper

## Quick start

Analyze staged changes and generate commit message:

```bash
# View staged changes
git diff --staged

# Generate commit message based on changes
# (Claude will analyze the diff and suggest a message)
```

## Commit message format

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

**Feature commit:**
```
feat(auth): add JWT authentication

Implement JWT-based authentication system with:
- Login endpoint with token generation
- Token validation middleware
- Refresh token support
```

**Bug fix:**
```
fix(api): handle null values in user profile

Prevent crashes when user profile fields are null.
Add null checks before accessing nested properties.
```

**Refactor:**
```
refactor(database): simplify query builder

Extract common query patterns into reusable functions.
Reduce code duplication in database layer.
```

## Analyzing changes

Review what's being committed:

```bash
# Show files changed
git status

# Show detailed changes
git diff --staged

# Show statistics
git diff --staged --stat

# Show changes for specific file
git diff --staged path/to/file
```

## Commit message guidelines

**DO:**
- Use imperative mood ("add feature" not "added feature")
- Keep first line under 50 characters
- Capitalize first letter
- No period at end of summary
- Explain WHY not just WHAT in body

**DON'T:**
- Use vague messages like "update" or "fix stuff"
- Include technical implementation details in summary
- Write paragraphs in summary line
- Use past tense

## Multi-file commits

When committing multiple related changes:

```
refactor(core): restructure authentication module

- Move auth logic from controllers to service layer
- Extract validation into separate validators
- Update tests to use new structure
- Add integration tests for auth flow

Breaking change: Auth service now requires config object
```

## Scope examples

**Frontend:**
- `feat(ui): add loading spinner to dashboard`
- `fix(form): validate email format`

**Backend:**
- `feat(api): add user profile endpoint`
- `fix(db): resolve connection pool leak`

**Infrastructure:**
- `chore(ci): update Node version to 20`
- `feat(docker): add multi-stage build`

## Breaking changes

Indicate breaking changes clearly:

```
feat(api)!: restructure API response format

BREAKING CHANGE: All API responses now follow JSON:API spec

Previous format:
{ "data": {...}, "status": "ok" }

New format:
{ "data": {...}, "meta": {...} }

Migration guide: Update client code to handle new response structure
```

## Template workflow

1. **Review changes**: `git diff --staged`
2. **Identify type**: Is it feat, fix, refactor, etc.?
3. **Determine scope**: What part of the codebase?
4. **Write summary**: Brief, imperative description
5. **Add body**: Explain why and what impact
6. **Note breaking changes**: If applicable

## Interactive commit helper

Use `git add -p` for selective staging:

```bash
# Stage changes interactively
git add -p

# Review what's staged
git diff --staged

# Commit with message
git commit -m "type(scope): description"
```

## Amending commits

Fix the last commit message:

```bash
# Amend commit message only
git commit --amend

# Amend and add more changes
git add forgotten-file.js
git commit --amend --no-edit
```

## Best practices

1. **Atomic commits** - One logical change per commit
2. **Test before commit** - Ensure code works
3. **Reference issues** - Include issue numbers if applicable
4. **Keep it focused** - Don't mix unrelated changes
5. **Write for humans** - Future you will read this

## Commit message checklist

- [ ] Type is appropriate (feat/fix/docs/etc.)
- [ ] Scope is specific and clear
- [ ] Summary is under 50 characters
- [ ] Summary uses imperative mood
- [ ] Body explains WHY not just WHAT
- [ ] Breaking changes are clearly marked
- [ ] Related issue numbers are included

```

---

## skills/shared-skills/gitlab-mr-create/SKILL.md

`skills/shared-skills/gitlab-mr-create/SKILL.md`

```markdown
---
name: gitlab-mr-create
description: 在本仓库使用 GitLab CLI（glab）或备用 Python3 脚本（GitLab API）创建合并请求（MR）。当用户要求创建 MR、合并请求、提 MR、开 MR、gitlab mr 时使用。前置必须按 frontend-code-review 完成增量审查且无 Critical；须明确合并目标分支；优先自动执行 glab 认证；若无法执行 glab 可使用技能内 scripts/create_merge_request.py（需 GITLAB_TOKEN）。
---

# GitLab 合并请求创建（glab / Python API 备用）

在 **本仓库** 创建指向 **自建 GitLab `gitlab.speediance.com`** 的 Merge Request：**首选 `glab`**；若无法执行 **`glab`**，使用 **`scripts/create_merge_request.py`**（`python3` + `GITLAB_TOKEN`，见 **§4.1**）。执行本技能前须已阅读本文件并按顺序完成各门禁。

## 0. 必选参数：合并目标分支（target branch）

**未获得目标分支前，禁止执行 `glab mr create`。**

1. 询问用户：**合并目标分支**是什么（例如 `master`、`develop`、`main`）。
2. 若用户未说明，**不得猜测或默认静默使用某分支**，须输出引导并等待补充，例如：

```text
创建 MR 前需要确认合并目标分支（将当前分支合并进哪条分支）。
请回复目标分支名称，例如：master
提示：本仓库远程默认分支可执行：git symbolic-ref refs/remotes/origin/HEAD
```

3. 用户明确给出目标分支后，记为 `<target-branch>`，后续命令使用 `-b <target-branch>`。

## 1. 提交前代码审查（必须，且先于 MR 创建）

在创建 MR 前，**必须**按 **`frontend-code-review`** 技能执行增量审查：

- **技能路径**：`.agents/skills/shared-skills/frontend-code-review/SKILL.md`（对话中可写作 `@.agents/skills/shared-skills/frontend-code-review`）。
- **审查范围**（优先顺序）：
  1. 若已暂存：`git diff --cached`
  2. 否则：`git diff`（工作区相对 HEAD）
  3. 若用户希望以「相对目标分支」为准：`git diff origin/<target-branch>...HEAD`（需已 `git fetch`）
- **结论门禁（与 smart-commit 对齐）**：
  - 存在 **Critical**：**禁止创建 MR**，须先修复并重新审查。
  - 仅有 **Warning / Suggestion**：可在 MR 描述中**简要列出**后**继续**创建 MR。
  - **无前端源码**（增量中无 `.vue` / `.ts` / `.tsx` 等待审源码）：仍须执行审查流程；对文档/配置类变更，说明「无前端源码适用项」，**无 Critical 级适用问题**即可进入下一节。

若用户明确要求**跳过审查**，须提示风险（可能带缺陷合入），并仅在用户坚持时记录该例外后再继续；**默认不允许跳过**。

## 2. 远程分支与推送

- 创建 MR 通常要求**源分支已推送到远程**。执行 `git status` / `git branch -vv` 确认当前分支与 `origin` 关系。
- 若远程尚无当前分支或本地有未推送提交：
  - 提示用户先推送，并给出 `git push -u origin <当前分支>`。
  - **推送约束**：仅当用户在本对话中**明确要求推送**（如「推送」「push」）时，代理才可执行 `git push`；否则只给出命令由用户执行（与仓库 `CLAUDE.md` 一致）。

## 3. GitLab 认证（gitlab.speediance.com）

本仓库 `origin` 指向 **`https://gitlab.speediance.com/...`**。使用 `glab` 前须保证该 host 已登录。

### 3.1 检测是否已登录

在仓库根目录执行（**推荐指定 host**，避免仅看到 `gitlab.com` 而误判）：

```bash
glab auth status --hostname gitlab.speediance.com
```

- 若输出表明 **`gitlab.speediance.com` 已认证**（成功、有 token 等），进入 **§4**。
- 若提示 **has not been authenticated**、**401**、**unknown host** 等 → 视为**未登录自建 GitLab**，继续 **§3.2**。

也可执行 `glab auth status` 查看全局配置；若其中**没有**自建实例或自建实例失败，仍须按未登录处理。

### 3.2 未登录时：代理须自动执行认证命令（禁止仅口述）

检测到 **§3.1** 未通过时，代理**必须**在终端**实际执行**登录命令以完成 GitLab 认证，**禁止**只向用户粘贴说明、让用户自行复制执行（除非执行环境明确禁止联网/执行 shell，此时再退化为口述并给 Web 链接）。

**执行顺序**：

1. **优先非交互**：若环境变量 **`GITLAB_TOKEN`** 已设置且非空（团队若使用其它变量名，如 `GITLAB_PRIVATE_TOKEN`，可先检测等价变量再传给 `--token`），在仓库根目录执行：
   ```bash
   glab auth login --hostname gitlab.speediance.com --token "$GITLAB_TOKEN"
   ```
2. **否则执行交互式登录命令**（由 CLI 引导浏览器或终端粘贴 Token）：
   ```bash
   glab auth login --hostname gitlab.speediance.com
   ```
   执行后**告知用户**：若提示打开浏览器或等待输入，须在本机完成授权或按提示粘贴 **Personal Access Token**；代理可等待命令结束后再复核。

3. **无论上一步成功与否**，必须再次执行 **§3.5** 的 `glab auth status --hostname gitlab.speediance.com`。仍失败时：可结合 **§3.3 / §3.4** 排查；仍无法使用 `glab` 时，若环境可执行 **`python3`** 且已设置 **`GITLAB_TOKEN`**，代理**应优先尝试** **§4.1** 的 Python 脚本创建 MR；否则提供 **§4.2** 的 Web 新建 MR 链接。

### 3.3 交互式登录说明（与 §3.2 第 2 步对应）

下列命令通常由 **§3.2** 自动调用；也可由用户手动执行：

```bash
glab auth login --hostname gitlab.speediance.com
```

- 按 CLI 提示在浏览器完成授权，或按提示粘贴 **Personal Access Token**（权限如 `api` / `write_repository` 等以公司规范为准）。
- 纯 CI/无人值守场景应使用 **§3.4** 的 Token 方式，勿依赖浏览器。

### 3.4 非交互式登录（脚本、CI、已持有 Token）

在**已能安全提供 Token** 的前提下（环境变量、密钥管理器、CI 密文变量），可用命令**一次性写入 glab 对本实例的配置**，便于脚本或流水线复用：

```bash
glab auth login --hostname gitlab.speediance.com --token "$GITLAB_TOKEN"
```

**安全约束（必须遵守）**：

- **禁止**在仓库中提交含明文 Token 的脚本、`.env` 或配置文件；技能与文档中**只出现占位符**（如 `"$GITLAB_TOKEN"`）。
- Token 通过 **`export GITLAB_TOKEN=...`**（仅当前 shell）、**direnv**、**1Password CLI**、**CI 变量** 等方式注入；变量名可按团队约定，与示例不一致时在文档中说明即可。
- **CI**：在流水线中设置密文变量（如 `GITLAB_TOKEN`），在需要 `glab` 的步骤中执行上述 `glab auth login ... --token "$GITLAB_TOKEN"`，再执行 `glab mr create`（或仅 `glab` 所需子命令）。

**可复制的一键片段示例**（仍依赖你已在外部设置好 `GITLAB_TOKEN`，**勿**把真实 Token 写入仓库文件）：

```bash
# 前提：已在当前环境安全设置 GITLAB_TOKEN
glab auth login --hostname gitlab.speediance.com --token "$GITLAB_TOKEN"
glab auth status --hostname gitlab.speediance.com
```

### 3.5 登录后复核

再次执行：

```bash
glab auth status --hostname gitlab.speediance.com
```

确认自建实例可用；可选：在仓库目录下执行 `glab project view` 验证 API 可达。

- **未完成认证前，不得执行 `glab mr create`。**

## 4. 创建合并请求

在 **§0～§3** 均满足后执行（示例）：

```bash
cd <仓库根目录>
glab mr create -b <target-branch> -t "<中文或英文标题>" -d "<描述，可含审查摘要>" --yes
```

- **源分支**：默认当前分支；若需指定：`--source-branch <branch>`。
- **标题/描述**：应概括改动；若 §1 有 Warning/Suggestion，建议在 `-d` 中注明「审查结论：…」。
- **受理人 / 审核者 / 标记**：`glab mr create` 支持分配审核者等选项，以本机 `glab mr create --help` 为准（如 `--assignee`、`--reviewer` 等，随 glab 版本略有差异）。
- 若需草稿：`--draft`。
- 若 `glab mr create` 仍报 host/认证错误，回到 **§3**。

### 4.1 无法自动执行 glab 时：Python3 脚本（GitLab API）

当 **无法安装/执行 `glab`**、**沙箱禁止交互登录**、或 **`glab auth` 持续失败**，但可设置 **`GITLAB_TOKEN`**（Personal Access Token，需具备创建 MR 所需 `api` 等权限）且可执行 **`python3`** 时，使用本技能附带脚本通过 **GitLab HTTP API** 创建 MR（**仅标准库**，无额外 pip 依赖）。

- **脚本路径**：`.agents/skills/shared-skills/gitlab-mr-create/scripts/create_merge_request.py`
- **前提**：源分支**已推送到远程**；与 `glab mr create` 相同。
- **安全**：Token **禁止**写入仓库或提交到 Git；**禁止**在脚本内硬编码。推荐方式：（1）环境变量或 CI 密文变量；（2）在 `scripts/` 目录复制 **`.env.example` → `.env`** 并填写 `GITLAB_TOKEN`——**`.env` 已由 `scripts/.gitignore` 忽略**，勿将含真实 Token 的 `.env` 加入版本库。

示例（在**仓库根目录**执行，`GITLAB_TOKEN` 已导出）：

```bash
export GITLAB_TOKEN="***"   # 从密钥管理或 CI 注入，勿提交
python3 .agents/skills/shared-skills/gitlab-mr-create/scripts/create_merge_request.py \
  --target-branch <target-branch> \
  -t "<MR 标题>" \
  -d "<MR 描述，可含审查摘要>"
```

或使用脚本目录下的 **`.env`**（勿提交 `.env`）：

```bash
cp .agents/skills/shared-skills/gitlab-mr-create/scripts/.env.example \
   .agents/skills/shared-skills/gitlab-mr-create/scripts/.env
# 编辑 .env 填入 GITLAB_TOKEN 后执行同上 python3 命令；可选 --env-file /其它路径/.env
```

- 默认从 `git rev-parse --abbrev-ref HEAD` 取**源分支**，从 `git remote get-url origin` 解析 **`namespace/repo`**（与本仓 `origin` 一致时无需额外参数）。
- **受理人 / 审核者 / 标记（GitLab API）**：创建时可传 `--assignee-ids`、`--reviewer-ids`、`--labels`；或在 `scripts/.env` 中设置全局 `GITLAB_MR_*`，或**按合并目标分支**设置 `GITLAB_MR_*_<分支后缀>`（后缀规则：分支名大写，`/`、`-` 转为 `_`，例如合并到 `develop` → `GITLAB_MR_REVIEWER_IDS_DEVELOP`）。常见分支示例：`test` → `GITLAB_MR_REVIEWER_IDS_TEST`，`master` → `..._MASTER`。**release 线**：合并到 `release/1.0` 等时，优先 `GITLAB_MR_REVIEWER_IDS_RELEASE_1_0`；若未设置，可回退到 `GITLAB_MR_REVIEWER_IDS_RELEASE`（适用于所有 `release/*`）。**优先级**：命令行参数 > 完整分支后缀变量 >（仅 `release/*`）`GITLAB_MR_*_RELEASE` > 全局 `GITLAB_MR_*`。`--update-iid` 更新已有 MR 时，脚本会先 GET MR 得到 `target_branch`，再按同一规则选变量。
- **标记 `GITLAB_MR_LABELS` 与 apps 目录（仅创建 MR 时）**：若**未**传 `--labels`，则使用 `GITLAB_MR_LABELS` / 分支专属变量；当合并目标**不是** `master`、也不是 `release` 或 `release/*` 时，脚本会根据 `git diff`（相对目标分支的已提交变更 + 当前工作区/暂存区）检测变更路径；若涉及 `apps/<子应用>/`，则将该**子应用目录名**（如 `app-admin`）**追加**为 GitLab Label；若变更不涉及 `apps/` 下任何文件，则不追加应用名。合并到 `master` / `release*` 时**不**做上述自动追加，仅用环境变量中的标签。传 `--labels` 时以命令行为准，不自动追加。`--update-iid` 不启用自动追加，避免 PUT 覆盖 MR 上已有标签集合。
- **补改已存在的 MR**：`--update-iid <IID>`（MR 页面 URL 中的数字），并配合上述审核者/标记参数或 `.env`，脚本会以 `PUT` 更新该 MR（无需再传 `-b`/`-t`）。
- 可选：`--source-branch`、`-p/--project web/your-repo`、`--base-url`（默认 `https://gitlab.speediance.com`，也可在 `.env` 中设 `GITLAB_BASE_URL`）、`--draft`。
- 成功时脚本会打印 MR 的 **`web_url`**，并**立即再 GET 同一 MR**，根据 GitLab 返回的 `merge_status`、`has_conflicts`、**`detailed_merge_status`**（如 `not_approved`、`ci_must_pass`、`discussion_must_be_resolved`、`draft_status` 等）、**`merge_error`**、**`blocking_discussions_resolved`** 在 **stderr** 显式提示「合并可能被阻止」的原因（冲突、审批、流水线、讨论等）；若判定为可合并（如 `detailed_merge_status=mergeable`）则不额外刷屏。字段随 GitLab 版本略有差异，**最终以 MR 网页为准**。

代理在无法跑 `glab mr create` 时，**应尝试**执行上述 `python3 ...create_merge_request.py ...`（需用户环境已有 `GITLAB_TOKEN`）；若无法执行脚本或仍失败，再使用 **§4.2**。

### 4.2 无法使用 glab 且无法用脚本时：浏览器

若环境未安装 `glab`、无 Token、或 API 创建失败，提供浏览器新建 MR 链接（替换分支名与路径）：

```text
https://gitlab.speediance.com/<group>/<repo>/-/merge_requests/new?merge_request[source_branch]=<源分支>
```

并说明需手动选择目标分支 `<target-branch>`。

### 4.3 创建 MR 后发现与目标分支冲突：推荐处理流程

GitLab 提示 **无法合并 / 存在冲突** 时，须在**本地**将源分支与目标分支（如 `develop`）对齐并解决冲突后再 **push**；本技能脚本**不能**替代该步骤。

**推荐顺序（团队无特殊规定时）**

1. **拉取最新目标分支**  
   `git fetch origin <target-branch>`

2. **在源分支上合并或变基（二选一，按团队规范）**  
   - **merge**（安全、历史保留合并点）：`git merge origin/<target-branch>`  
   - **rebase**（历史更线性，推送后常需）：`git rebase origin/<target-branch>`  

3. **按文件解决冲突**  
   编辑标记为冲突的文件，删除 `<<<<<<<` / `=======` / `>>>>>>>` 并保留正确逻辑；对不确定的业务取舍在 MR 中 **@相关负责人** 或先注释占位再评审。

4. **标记已解决并继续**  
   `git add <文件…>` → `git merge --continue` 或 `git rebase --continue`（若 rebase 中途可 `git rebase --abort` 放弃重来）。

5. **推送**  
   - merge 后通常：`git push`  
   - rebase 改写提交后：`git push --force-with-lease`（**禁止**无 lease 的强推误覆盖他人提交）

6. **回到 MR 页面**  
   冲突消除后流水线/可合并状态会更新；可在 MR **评论**简要说明：「已与 `origin/<target-branch>` 同步并解决冲突」，便于评审。

**可选**：若 GitLab 提供 **Resolve conflicts** 网页编辑，仅适合**简单**冲突；复杂逻辑仍建议在本地 IDE 处理并跑 `pnpm type-check` / 相关测试。

**避免**：在目标分支上直接改 MR 源分支内容；多人共用的源分支上慎用会改历史的操作，事先沟通。

**MR 评论话术模板（可直接复制，将占位符替换为实际分支名 / 路径 / 人名）**

```text
【已同步目标分支并解决冲突】
已与 origin/<target-branch> 对齐并在本地解决合并冲突，最新代码已推送。请刷新 MR 后继续评审；本地已执行 type-check / lint（如适用请写明）。
```

```text
【处理中】
正在与 origin/<target-branch> 解决冲突，处理完毕后在此评论并 @ 评审人。预计完成时间：____。
```

```text
【需决策】
文件：<路径> 与目标分支冲突，涉及 <业务点 A> 与 <业务点 B> 的取舍，请 @<负责人> 确认应保留哪一侧逻辑后再由我合并解决。
```

```text
【已 rebase 并强推】
已对源分支执行 rebase，已使用 git push --force-with-lease 更新远程。若本地仍看到旧提交，请重新 fetch；评审请以 MR 页面最新 diff 为准。
```

## 5. 与 smart-commit 的关系

- **提交（commit）** 仍遵循 **`smart-commit`**；本技能负责 **审查通过后的 MR 创建**。
- 典型顺序：改代码 →（用户要求）`smart-commit` 提交 → `git push`（用户明确要求时）→ 本技能创建 MR。**不要在未审查通过时创建 MR。**

## 6. 自检清单（执行前逐项确认）

- [ ] 已确认 **目标分支** `<target-branch>`
- [ ] 已执行 **frontend-code-review**，且无 **Critical**
- [ ] 源分支已推送或用户已知需推送
- [ ] **gitlab.speediance.com** 已通过 **§3.2** 自动执行 `glab auth login`（交互或 `--token "$GITLAB_TOKEN"` 等非交互方式）配置并完成 **§3.5** 复核
- [ ] `glab mr create -b <target-branch> ...` 已成功，或 **§4.1** Python 脚本已输出 MR `web_url`，或已给出 **§4.2** Web 链接
- [ ] 若 MR 显示冲突：已按 **§4.3** 在本地解决并推送，再请评审

```

---

## skills/shared-skills/gitlab-mr-create/scripts/.env.example

`skills/shared-skills/gitlab-mr-create/scripts/.env.example`

```
# 复制本文件为同目录下的 `.env` 并填写真实 Token（`.env` 已被 Git 忽略，不会提交）
# 加载顺序：已存在的环境变量优先，不会被本文件覆盖

# GitLab Personal Access Token（需具备创建 MR 所需 api 等权限）
GITLAB_TOKEN=

# 可选：自建 GitLab 根地址（不设则脚本默认 https://gitlab.speediance.com）
# GITLAB_BASE_URL=https://gitlab.speediance.com

# ---------------------------------------------------------------------------
# 审核者 / 受理人 / 标记（用户 ID 见 GitLab 用户主页 URL；以下为占位，请改成真实 ID）
# ---------------------------------------------------------------------------
# 全局回退：未命中下方「按分支」变量时使用
# GITLAB_MR_ASSIGNEE_IDS=
# GITLAB_MR_REVIEWER_IDS=
# GITLAB_MR_LABELS=

# GITLAB_MR_LABELS / GITLAB_MR_LABELS_* 说明：
# - 合并到 master 或 release/*：仅使用此处配置的标签，不自动附加应用名
# - 合并到 develop、test 等其它分支：在以上标签之外，自动追加「本次变更涉及的 apps/<子应用>/」目录名（如 app-admin）；
#   若变更不涉及 apps/ 下任何文件，则不追加应用名
# - 若命令行传入 --labels，则只使用命令行，不做上述自动追加

# 按合并目标分支（与 -b / MR 的 target_branch 一致）
# GITLAB_MR_REVIEWER_IDS_DEVELOP=101,102
# GITLAB_MR_REVIEWER_IDS_TEST=103,104
# GITLAB_MR_REVIEWER_IDS_MASTER=201,202

# release 线：
# - 合并到任意 release/*（如 release/1.0）时，优先用精确变量 GITLAB_MR_REVIEWER_IDS_RELEASE_1_0
# - 若未配置精确变量，则回退到 GITLAB_MR_REVIEWER_IDS_RELEASE（所有 release/* 共用）
# GITLAB_MR_REVIEWER_IDS_RELEASE=301,302
# GITLAB_MR_REVIEWER_IDS_RELEASE_1_0=303,304

# 可选：按分支的标记
# GITLAB_MR_LABELS_DEVELOP=needs-review,web
# GITLAB_MR_LABELS_TEST=needs-review
# GITLAB_MR_LABELS_MASTER=release-cherry-pick

```

---

## skills/shared-skills/gitlab-mr-create/scripts/.gitignore

`skills/shared-skills/gitlab-mr-create/scripts/.gitignore`

```
# 本地密钥与覆盖配置，勿提交到 Git
.env
.env.local
.env.*.local

```

---

## skills/shared-skills/gitlab-mr-create/scripts/create_merge_request.py

`skills/shared-skills/gitlab-mr-create/scripts/create_merge_request.py`

```python
#!/usr/bin/env python3
"""
通过 GitLab HTTP API 创建 Merge Request（不依赖 glab）。
适用于代理无法执行 glab、或未安装 glab 但可设置 GITLAB_TOKEN 的场景。

前置：
  - 环境变量 GITLAB_TOKEN（Personal Access Token，需 api 等权限），或
  - 在脚本同目录复制 `.env.example` 为 `.env` 并填写 GITLAB_TOKEN（`.env` 已被 Git 忽略）
  - 源分支已推送到远程

用法示例（在仓库根目录）：
  export GITLAB_TOKEN="your_token"
  python3 .agents/skills/shared-skills/gitlab-mr-create/scripts/create_merge_request.py \\
    --target-branch develop \\
    --title "feat: 示例" \\
    --description "审查通过；详见描述"

或使用脚本目录下的 `.env`（勿将 `.env` 提交到仓库）：
  cp .agents/skills/shared-skills/gitlab-mr-create/scripts/.env.example \\
     .agents/skills/shared-skills/gitlab-mr-create/scripts/.env
  # 编辑 .env 填入 GITLAB_TOKEN 后执行同上 python3 命令

可选：
  --env-file        指定其它 .env 路径；默认读取脚本同目录 `.env`（若存在）
  --assignee-ids    受理人用户 ID，逗号分隔（环境变量见下）
  --reviewer-ids    审核者用户 ID，逗号分隔（环境变量见下）
  --labels          MR 标记（指定则仅用该值，不自动附加 apps 名）
  其它 GITLAB_MR_* 按目标分支后缀配置，见下
  创建 MR 且目标非 master/release：在 GITLAB_MR_LABELS* 之外自动追加变更涉及的 apps 子目录名（如 app-admin）
  --source-branch   默认从 git 当前分支读取
  --project         默认从 origin 解析为 namespace/repo（如 web/speediance-web-monorepo）
  --base-url        默认 https://gitlab.speediance.com
  --draft             创建为草稿 MR
  --update-iid        更新已有 MR 时，会按该 MR 的 target_branch 匹配分支专属环境变量

用户 ID 可在 GitLab 用户主页 URL 或 Admin 中查看；未传参时使用 .env 中对应变量（可按目标分支覆盖）。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


def _load_env_file(path: Path) -> None:
    """
    将 .env 中的 KEY=value 写入 os.environ。
    已存在的环境变量不会被覆盖（shell / CI 注入优先）。
    """
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError:
        return
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        if key and key not in os.environ:
            os.environ[key] = value


def _run_git(args: list[str]) -> str | None:
    try:
        out = subprocess.check_output(
            ["git", *args],
            stderr=subprocess.DEVNULL,
            text=True,
            cwd=os.getcwd(),
        )
        return out.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def _parse_user_id_list(value: str) -> list[int]:
    """解析逗号分隔的用户 ID，如 \"12,34\" → [12, 34]。"""
    out: list[int] = []
    for part in value.replace(" ", "").split(","):
        if not part:
            continue
        out.append(int(part))
    return out


def _normalize_labels_csv(value: str) -> str:
    """将逗号分隔的标签名规范为 GitLab `labels` 字段所需格式。"""
    parts = [x.strip() for x in value.split(",") if x.strip()]
    return ",".join(parts)


def _git_ref_exists(ref: str) -> bool:
    try:
        subprocess.check_output(
            ["git", "rev-parse", "-q", "--verify", ref],
            stderr=subprocess.DEVNULL,
            cwd=os.getcwd(),
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def _git_changed_paths_for_auto_labels(target_branch: str) -> list[str]:
    """
    收集相对合并目标分支有改动的路径，并包含当前工作区/暂存区未提交变更。
    用于推断 apps/<子应用>/ 目录名。
    """
    paths: set[str] = set()
    tb = target_branch.strip()
    for ref in (f"origin/{tb}", tb):
        if not _git_ref_exists(ref):
            continue
        try:
            out = subprocess.check_output(
                ["git", "diff", "--name-only", f"{ref}...HEAD"],
                stderr=subprocess.DEVNULL,
                text=True,
                cwd=os.getcwd(),
            )
            for line in out.splitlines():
                line = line.strip()
                if line:
                    paths.add(line)
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
        break
    for extra in (
        ["git", "diff", "--name-only"],
        ["git", "diff", "--name-only", "--cached"],
    ):
        try:
            out = subprocess.check_output(
                extra,
                stderr=subprocess.DEVNULL,
                text=True,
                cwd=os.getcwd(),
            )
            for line in out.splitlines():
                line = line.strip()
                if line:
                    paths.add(line)
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
    return list(paths)


def _apps_names_from_paths(paths: list[str]) -> list[str]:
    """从路径解析 monorepo 中 apps/<子应用>/ 下的应用目录名，去重、排序。"""
    seen: set[str] = set()
    for p in paths:
        normalized = p.replace("\\", "/").strip()
        parts = normalized.split("/")
        if len(parts) >= 2 and parts[0] == "apps":
            name = parts[1].strip()
            if name:
                seen.add(name)
    return sorted(seen)


def _is_master_or_release_target(tb: str) -> bool:
    """合并目标为 master 或 release 线时不自动附加 apps 应用名标签。"""
    s = tb.strip().lower()
    if s == "master":
        return True
    if s == "release" or s.startswith("release/"):
        return True
    return False


def _merge_env_labels_and_apps(env_labels_csv: str, app_names: list[str]) -> str:
    """环境变量中的标签在前，应用名追加在后，去重。"""
    parts: list[str] = []
    seen: set[str] = set()
    if env_labels_csv.strip():
        for x in env_labels_csv.split(","):
            x = x.strip()
            if x and x not in seen:
                seen.add(x)
                parts.append(x)
    for app in app_names:
        if app not in seen:
            seen.add(app)
            parts.append(app)
    return ",".join(parts)


def _resolve_labels_final(
    labels_cli: str,
    target_branch: str,
    *,
    enable_apps_auto: bool,
) -> str:
    """
    解析最终 MR labels。

    - 若命令行传入 ``--labels``：仅使用该值（不自动附加 apps 名）。
    - 否则使用 ``GITLAB_MR_LABELS`` / 分支专属变量。
    - 当 ``enable_apps_auto`` 为真且目标分支**不是** master/release：再追加变更涉及的 ``apps/<name>/`` 目录名；无 apps 变更则不追加。
    - ``--update-iid`` 场景应关闭 ``enable_apps_auto``，避免 PUT 覆盖 MR 上已有标签集合。
    """
    if (labels_cli or "").strip():
        return _normalize_labels_csv(labels_cli.strip())
    env_csv = _resolve_mr_env("GITLAB_MR_LABELS", target_branch)
    if not enable_apps_auto or _is_master_or_release_target(target_branch):
        return _normalize_labels_csv(env_csv) if env_csv else ""
    paths = _git_changed_paths_for_auto_labels(target_branch)
    apps = _apps_names_from_paths(paths)
    return _merge_env_labels_and_apps(env_csv, apps)


def _branch_env_suffix(target_branch: str) -> str:
    """
    将目标分支名转为环境变量后缀，例如 develop → DEVELOP，feature/foo → FEATURE_FOO。
    """
    s = target_branch.strip().replace("/", "_").replace("-", "_")
    s = re.sub(r"[^a-zA-Z0-9_]", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s.upper()


def _resolve_mr_env(base_key: str, target_branch: str) -> str:
    """
    读取 MR 相关环境变量，优先级：

    1. ``{base_key}_{完整分支后缀}``（如合并到 ``release/1.0`` → ``..._RELEASE_1_0``）
    2. 若目标分支为 ``release/*``：``{base_key}_RELEASE``（所有 release 线共用一套审核者时）
    3. ``base_key`` 全局默认值
    """
    if target_branch.strip():
        tb = target_branch.strip()
        specific = f"{base_key}_{_branch_env_suffix(tb)}"
        v = os.environ.get(specific)
        if v is not None and str(v).strip() != "":
            return str(v).strip()
        # release/x.y 未单独配置时，可统一使用 GITLAB_MR_*_RELEASE
        if re.match(r"^release(/|$)", tb, flags=re.IGNORECASE):
            release_fallback = f"{base_key}_RELEASE"
            v2 = os.environ.get(release_fallback)
            if v2 is not None and str(v2).strip() != "":
                return str(v2).strip()
    return (os.environ.get(base_key) or "").strip()


def _resolve_mr_field(cli_value: str, base_key: str, target_branch: str) -> str:
    """命令行非空优先，否则按分支解析环境变量。"""
    if (cli_value or "").strip():
        return cli_value.strip()
    return _resolve_mr_env(base_key, target_branch)


def _parse_project_path_from_remote(url: str) -> str | None:
    """从 origin URL 得到 GitLab project path，如 web/speediance-web-monorepo。"""
    url = url.strip()
    m = re.search(r"gitlab\.speediance\.com[/:]([^/]+/[^/.]+)", url)
    if not m:
        return None
    path = m.group(1).removesuffix(".git")
    return path


def _api_create_mr(
    base_url: str,
    project_path: str,
    token: str,
    source_branch: str,
    target_branch: str,
    title: str,
    description: str,
    draft: bool,
    assignee_ids: list[int],
    reviewer_ids: list[int],
    labels: str,
) -> dict:
    encoded = urllib.parse.quote(project_path, safe="")
    api = f"{base_url.rstrip('/')}/api/v4/projects/{encoded}/merge_requests"
    body: dict[str, Any] = {
        "source_branch": source_branch,
        "target_branch": target_branch,
        "title": title,
        "description": description,
    }
    if draft:
        body["draft"] = True
    if assignee_ids:
        body["assignee_ids"] = assignee_ids
    if reviewer_ids:
        body["reviewer_ids"] = reviewer_ids
    if labels:
        body["labels"] = labels

    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        api,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "PRIVATE-TOKEN": token,
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _api_get_mr(
    base_url: str,
    project_path: str,
    token: str,
    mr_iid: int,
) -> dict:
    """GET 已有 MR，用于读取 target_branch、merge_status 等。"""
    encoded = urllib.parse.quote(project_path, safe="")
    api = f"{base_url.rstrip('/')}/api/v4/projects/{encoded}/merge_requests/{mr_iid}"
    req = urllib.request.Request(
        api,
        method="GET",
        headers={"PRIVATE-TOKEN": token},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


# GitLab detailed_merge_status 常见取值（不同版本略有差异）；值为空表示不单独追加说明
_DETAILED_MERGE_STATUS_HINTS: dict[str, str] = {
    "mergeable": "",
    "unchecked": "",
    "checking": "",
    "preparing": "",
    "conflict": "存在代码冲突：请在本地合并或 rebase 目标分支并解决冲突后推送（技能 §4.3）。",
    "ci_must_pass": "项目要求流水线通过后才能合并；请等待 CI 成功或修复失败任务。",
    "ci_still_running": "CI 仍在运行，合并可能被阻止直至流水线结束。",
    "discussion_must_be_resolved": "存在未解决的讨论（Thread），须先解决后才能合并。",
    "discussions_not_resolved": "存在未解决的讨论，须先解决后才能合并。",
    "draft_status": "当前为草稿 MR，需取消草稿后才可合并。",
    "not_approved": "合并所需审批尚未满足，请等待审批人批准。",
    "not_mergeable": "GitLab 判定当前不可合并，请查看 MR 页面上的阻止原因。",
    "merge_request_blocked": "合并被其他 MR、依赖或项目规则阻塞。",
    "need_rebase": "需要先对源分支变基（rebase）到目标分支再推送。",
    "commits_status": "源分支提交状态异常，请检查分支是否存在有效提交。",
    "not_open": "合并请求未处于开启状态。",
    "requested_changes": "评审要求修改，处理完毕后再尝试合并。",
    "jira_association_missing": "项目要求关联 Jira 等外部单据，请补充后再合并。",
}


def _collect_mr_merge_blockers(mr: dict) -> list[str]:
    """
    根据 GitLab MR API 返回字段收集「合并被阻止 / 暂不可合并」的可读说明。
    优先使用 detailed_merge_status、merge_error；兼容 has_conflicts、merge_status。
    """
    msgs: list[str] = []

    merge_error = mr.get("merge_error")
    if isinstance(merge_error, str) and merge_error.strip():
        msgs.append(f"merge_error：{merge_error.strip()}")

    if mr.get("has_conflicts") is True:
        msgs.append(
            "has_conflicts 为 true：源与目标分支存在合并冲突（或无法干净合并）。"
        )

    merge_status = (mr.get("merge_status") or "").strip()
    if merge_status == "cannot_be_merged":
        msgs.append(
            "merge_status 为 cannot_be_merged：无法直接合并（可能含冲突、保护分支规则、流水线未通过等）。"
        )
    elif merge_status == "cannot_be_merged_recheck":
        msgs.append(
            "merge_status 为 cannot_be_merged_recheck：合并状态正在重新计算，请稍后刷新 MR 页面。"
        )

    detailed_raw = (mr.get("detailed_merge_status") or "").strip()
    if detailed_raw:
        key = detailed_raw.lower()
        hint = _DETAILED_MERGE_STATUS_HINTS.get(key)
        if hint:
            msgs.append(f"detailed_merge_status={detailed_raw!r}：{hint}")
        elif key != "mergeable":
            msgs.append(
                f"detailed_merge_status={detailed_raw!r}：合并未处于可合并状态，请到 MR 页面查看「合并被阻止」的具体条目。"
            )

    if mr.get("blocking_discussions_resolved") is False:
        msgs.append(
            "blocking_discussions_resolved 为 false：存在阻塞合并的讨论，须先解决。"
        )

    seen: set[str] = set()
    out: list[str] = []
    for m in msgs:
        if m not in seen:
            seen.add(m)
            out.append(m)
    return out


def _mr_is_probably_mergeable(mr: dict) -> bool:
    """用于判断是否在终端静默（无阻止信息时尽量不刷屏）。"""
    detailed = (mr.get("detailed_merge_status") or "").strip().lower()
    merge_status = (mr.get("merge_status") or "").strip()
    if detailed == "mergeable":
        return True
    if merge_status == "can_be_merged" and mr.get("has_conflicts") is not True:
        if detailed in ("", "mergeable", "unchecked"):
            return True
    return False


def _print_mr_merge_status_hint(mr: dict, web_url: str) -> None:
    """在创建 MR 后向 stderr 显式输出合并被阻止 / 冲突 / 审批与流水线等提示。"""
    messages = _collect_mr_merge_blockers(mr)
    merge_status = (mr.get("merge_status") or "").strip()
    detailed_raw = (mr.get("detailed_merge_status") or "").strip()
    detailed = detailed_raw.lower()

    if messages:
        print("", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        print("重要：合并可能被阻止或当前不可合并（请对照下方与 MR 网页）", file=sys.stderr)
        for line in messages:
            print(f"  • {line}", file=sys.stderr)
        print(f"  • MR 链接：{web_url}", file=sys.stderr)
        print(
            "  • 冲突类：本地合并/变基目标分支后 push（§4.3）；"
            "审批/流水线/讨论类：在 GitLab MR 页面按提示处理。",
            file=sys.stderr,
        )
        print("=" * 60, file=sys.stderr)
        return

    if _mr_is_probably_mergeable(mr):
        return

    if detailed in ("unchecked", "checking", "preparing"):
        print(
            f"提示：合并状态尚未就绪（detailed_merge_status={detailed_raw!r}），"
            f"请稍后刷新 MR 页面确认是否仍阻止合并。\n  {web_url}",
            file=sys.stderr,
        )
        return

    print(
        "提示：GitLab 未返回明确的可合并状态；若网页显示「合并被阻止」，"
        "请查看页面上的条目（冲突、审批、流水线、讨论等）。"
        f"\n  merge_status={merge_status!r} detailed_merge_status={detailed_raw!r}"
        f"\n  {web_url}",
        file=sys.stderr,
    )


def _api_update_mr(
    base_url: str,
    project_path: str,
    token: str,
    mr_iid: int,
    assignee_ids: list[int],
    reviewer_ids: list[int],
    labels: str,
) -> dict:
    """更新已有 MR 的受理人、审核者、标记（GitLab API PUT）。"""
    encoded = urllib.parse.quote(project_path, safe="")
    api = f"{base_url.rstrip('/')}/api/v4/projects/{encoded}/merge_requests/{mr_iid}"
    body: dict[str, Any] = {}
    if assignee_ids:
        body["assignee_ids"] = assignee_ids
    if reviewer_ids:
        body["reviewer_ids"] = reviewer_ids
    if labels:
        body["labels"] = labels
    if not body:
        raise ValueError("至少需要 assignee_ids、reviewer_ids 或 labels 之一")

    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        api,
        data=data,
        method="PUT",
        headers={
            "Content-Type": "application/json",
            "PRIVATE-TOKEN": token,
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> int:
    # 先于 argparse 全量解析加载 .env，使 GITLAB_BASE_URL 等可参与默认值
    pre = argparse.ArgumentParser(add_help=False)
    pre.add_argument("--env-file", default="", metavar="PATH")
    pre_args, _ = pre.parse_known_args(sys.argv[1:])
    script_dir = Path(__file__).resolve().parent
    if pre_args.env_file.strip():
        _load_env_file(Path(pre_args.env_file).expanduser().resolve())
    elif (script_dir / ".env").is_file():
        _load_env_file(script_dir / ".env")

    parser = argparse.ArgumentParser(
        description="使用 GitLab API 创建 MR（需 GITLAB_TOKEN）",
    )
    parser.add_argument(
        "--target-branch",
        "-b",
        default="",
        help="合并目标分支，如 develop、master（创建 MR 时必填）",
    )
    parser.add_argument(
        "--title",
        "-t",
        default="",
        help="MR 标题（创建 MR 时必填）",
    )
    parser.add_argument(
        "--description",
        "-d",
        default="",
        help="MR 描述（可选）",
    )
    parser.add_argument(
        "--source-branch",
        "-s",
        default="",
        help="源分支；默认从 git 当前分支读取",
    )
    parser.add_argument(
        "--project",
        "-p",
        default="",
        help="项目 path（namespace/repo）；默认从 git remote origin 解析",
    )
    parser.add_argument(
        "--base-url",
        default=os.environ.get("GITLAB_BASE_URL", "https://gitlab.speediance.com"),
        help="GitLab 根 URL，默认 https://gitlab.speediance.com",
    )
    parser.add_argument(
        "--draft",
        action="store_true",
        help="创建为草稿 MR（API draft 字段；极旧实例若报错可去掉本参数）",
    )
    parser.add_argument(
        "--env-file",
        default="",
        metavar="PATH",
        help="从该文件加载 GITLAB_TOKEN 等（KEY=value）；未指定且脚本同目录存在 .env 时也会加载；不覆盖已设置的环境变量",
    )
    parser.add_argument(
        "--assignee-ids",
        default="",
        metavar="IDS",
        help="受理人用户 ID；空则按目标分支读取 GITLAB_MR_ASSIGNEE_IDS_<分支后缀> 或 GITLAB_MR_ASSIGNEE_IDS",
    )
    parser.add_argument(
        "--reviewer-ids",
        default="",
        metavar="IDS",
        help="审核者用户 ID；空则按目标分支读取 GITLAB_MR_REVIEWER_IDS_<分支后缀> 或 GITLAB_MR_REVIEWER_IDS",
    )
    parser.add_argument(
        "--labels",
        default="",
        metavar="NAMES",
        help="MR 标记；若指定则仅使用该值。未指定时读取 GITLAB_MR_LABELS*；"
        "创建 MR 且目标非 master/release 时自动追加 apps/<子应用>/ 变更对应的应用名",
    )
    parser.add_argument(
        "--update-iid",
        type=int,
        default=0,
        metavar="IID",
        help="更新已有 MR：填写 IID（MR 页面 URL 中的数字），仅需配合审核者/受理人/标记；无需 -b/-t",
    )
    args = parser.parse_args()

    token = os.environ.get("GITLAB_TOKEN") or os.environ.get("GITLAB_PRIVATE_TOKEN")
    if not token:
        print(
            "错误：请设置环境变量 GITLAB_TOKEN（或 GITLAB_PRIVATE_TOKEN），"
            "或在 scripts/ 目录复制 .env.example 为 .env 并填写 Token。",
            file=sys.stderr,
        )
        return 1

    source_branch = args.source_branch or _run_git(["rev-parse", "--abbrev-ref", "HEAD"])
    if not source_branch:
        print("错误：无法解析源分支，请传入 --source-branch。", file=sys.stderr)
        return 1

    project_path = args.project
    origin = ""
    if not project_path:
        origin = _run_git(["remote", "get-url", "origin"]) or ""
        if not origin:
            print("错误：无法读取 git remote origin，请传入 --project namespace/repo。", file=sys.stderr)
            return 1
        project_path = _parse_project_path_from_remote(origin) or ""
    if not project_path:
        print(
            "错误：无法从 origin 解析项目 path"
            + (f"（{origin!r}）" if origin else "")
            + "，请传入 --project namespace/repo。",
            file=sys.stderr,
        )
        return 1

    # 目标分支上下文：用于按分支选择 GITLAB_MR_*_<后缀>；update 时从 API 读取
    target_branch_ctx = ""
    if args.update_iid:
        try:
            mr_info = _api_get_mr(
                base_url=args.base_url,
                project_path=project_path,
                token=token,
                mr_iid=args.update_iid,
            )
            target_branch_ctx = (mr_info.get("target_branch") or "").strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            print(f"错误：无法读取 MR !{args.update_iid}：HTTP {e.code}\n{err_body}", file=sys.stderr)
            return 1
        except urllib.error.URLError as e:
            print(f"错误：无法读取 MR：{e}", file=sys.stderr)
            return 1
    else:
        target_branch_ctx = (args.target_branch or "").strip()

    assignee_raw = _resolve_mr_field(args.assignee_ids, "GITLAB_MR_ASSIGNEE_IDS", target_branch_ctx)
    reviewer_raw = _resolve_mr_field(args.reviewer_ids, "GITLAB_MR_REVIEWER_IDS", target_branch_ctx)

    assignee_ids: list[int] = []
    reviewer_ids: list[int] = []
    try:
        if assignee_raw:
            assignee_ids = _parse_user_id_list(assignee_raw)
        if reviewer_raw:
            reviewer_ids = _parse_user_id_list(reviewer_raw)
    except ValueError as e:
        print(f"错误：解析用户 ID 失败（需为整数，逗号分隔）：{e}", file=sys.stderr)
        return 1

    labels = _resolve_labels_final(
        args.labels,
        target_branch_ctx,
        enable_apps_auto=not bool(args.update_iid),
    )

    # 仅更新已有 MR（受理人、审核者、标记）
    if args.update_iid:
        if not assignee_ids and not reviewer_ids and not labels:
            print(
                "错误：--update-iid 时需至少指定 --assignee-ids、--reviewer-ids、--labels 之一"
                "（或在 .env 中设置 GITLAB_MR_* 或按 MR 目标分支的 GITLAB_MR_*_<后缀>）。",
                file=sys.stderr,
            )
            return 1
        try:
            result = _api_update_mr(
                base_url=args.base_url,
                project_path=project_path,
                token=token,
                mr_iid=args.update_iid,
                assignee_ids=assignee_ids,
                reviewer_ids=reviewer_ids,
                labels=labels,
            )
        except ValueError as e:
            print(f"错误：{e}", file=sys.stderr)
            return 1
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            print(f"HTTP {e.code} {e.reason}\n{err_body}", file=sys.stderr)
            return 1
        except urllib.error.URLError as e:
            print(f"请求失败：{e}", file=sys.stderr)
            return 1
        web_url = result.get("web_url", "")
        print(f"MR 已更新：{web_url}")
        return 0

    if not (args.target_branch or "").strip() or not (args.title or "").strip():
        print(
            "错误：创建 MR 时需指定 --target-branch（-b）与 --title（-t）。"
            "若仅补充审核者/标记，请使用 --update-iid <IID>。",
            file=sys.stderr,
        )
        return 1

    try:
        result = _api_create_mr(
            base_url=args.base_url,
            project_path=project_path,
            token=token,
            source_branch=source_branch,
            target_branch=args.target_branch,
            title=args.title,
            description=args.description,
            draft=args.draft,
            assignee_ids=assignee_ids,
            reviewer_ids=reviewer_ids,
            labels=labels,
        )
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        print(f"HTTP {e.code} {e.reason}\n{err_body}", file=sys.stderr)
        return 1
    except urllib.error.URLError as e:
        print(f"请求失败：{e}", file=sys.stderr)
        return 1

    web_url = result.get("web_url", "")
    print(f"MR 已创建：{web_url}")

    mr_for_status: dict[str, Any] = result
    iid = result.get("iid")
    if iid is not None:
        try:
            mr_for_status = _api_get_mr(
                args.base_url,
                project_path,
                token,
                int(iid),
            )
        except (urllib.error.HTTPError, urllib.error.URLError, TypeError, ValueError):
            mr_for_status = result
    _print_mr_merge_status_hint(mr_for_status, web_url or mr_for_status.get("web_url", ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())

```

---

## skills/shared-skills/mastergo-design-restore/SKILL.md

`skills/shared-skills/mastergo-design-restore/SKILL.md`

```markdown
---
name: mastergo-design-restore
description: 通过 MasterGo Magic MCP 获取设计稿信息并还原为前端实现。当用户要求根据 MasterGo 设计稿实现页面、还原设计、设计稿转代码、或根据设计产出 UI 清单并实现时使用。
---

# MasterGo 设计稿还原

本技能指导利用 **MasterGo Magic MCP**（`mastergo-magic-mcp`）从设计稿获取结构与样式信息，并按本仓规范还原为可用的前端页面与组件。工具与工作流参考 [MasterGo Magic MCP](https://github.com/mastergo-design/mastergo-magic-mcp) 官方能力。

## 如何触发（示例话术）

- 「根据这个 MasterGo 设计稿还原页面：<链接>（目标 app：app-admin）」  
- 「把这个图层做成可复用组件：<链接/ fileId+layerId>，并生成 `.mastergo` 工作区」  
- 「先用 MCP 分析设计稿，给我 UI 清单（路由/组件/样式要点），再按清单实现」  

## 前置条件

- **MCP 须在本项目中定义**：本技能依赖 **mastergo-magic-mcp** 服务，必须在项目级 MCP 配置中声明后，AI 才能调用 `mcp__getDsl` 等工具。本仓已在 [.agents/mcp/mcp.json](../../../../.agents/mcp/mcp.json) 中配置该 MCP，Cursor/Claude 通过 `.cursor/mcp.json` 等符号链接读取。若克隆到新环境或接入新平台，需保证该 MCP 条目存在。详见 [.agents/handbook/ai-engineering/mastergo-mcp-usage.md](../../../handbook/ai-engineering/mastergo-mcp-usage.md)。
- **Token**：项目级已在 `.agents/mcp/mcp.json` 中配置可直接使用的 token，无需在用户级再填。若需使用本机其他 token，可在用户级 `~/.cursor/mcp.json` 中覆盖同名 `mastergo-magic-mcp`。配置或修改后需**完全重启** Cursor/Claude 使 MCP 生效。
- **设计稿标识**：用户需提供以下之一：**MasterGo 设计链接**（含短链 `https://mastergo.com/goto/xxx`）、或 **fileId + layerId**（从 URL 中 `file/<fileId>` 与 `?layer_id=<layerId>` 解析）。

---

## MCP 工具一览

| 工具名 | 用途 | 入参 |
|--------|------|------|
| `mcp__getDsl` | 拉取设计结构、组件层级、编码规则与组件文档链接 | `shortLink`（推荐）或 `fileId` + `layerId` |
| `mcp__getMeta` | 拉取站点级配置与规则 | `shortLink` 或 `fileId` + `layerId` |
| `mcp__getComponentGenerator` | 生成组件开发工作区（.mastergo/ 目录、规格 JSON、SVG 资源） | `rootPath`、`fileId`、`layerId` |
| `mcp__getComponentLink` | 根据 DSL 中的链接拉取组件文档 | 由 DSL 返回的链接调用 |

**入参说明**：`shortLink` 可为完整 MasterGo 链接或短链（如 `https://mastergo.com/goto/LhGgBAK`），MCP 会自动解析出 `fileId` 与 `layerId`。若用户只提供 URL，优先使用 `mcp__getDsl` 并传入 `shortLink`。

---

## 选择策略（先定范围再落地）

- **整页/多模块还原**：优先用 `mcp__getDsl`（必要时再 `mcp__getMeta`）→ 产出 UI 清单 → 依规范实现路由/页面/组件。  
- **单组件深度还原**：先 `mcp__getDsl` 明确组件边界与状态 → 再用 `mcp__getComponentGenerator` 生成 `.mastergo/`（规格 + SVG 资源）→ 按工作流与规格实现。  

如果用户只给了一个页面链接但想“直接生成代码”，也应先产出 UI 清单并拆分组件，避免一次性大文件堆砌导致不可维护。

## 推荐工作流（精简版）

1. **拉取设计数据**：优先 `mcp__getDsl`（需要页面级/站点规则再加 `mcp__getMeta`）。  
2. **产出内容（二选一）**：  
   - **整页/多模块**：输出“可执行 UI 清单”（路由 `path/name`、页面模块拆分与组件归属、关键样式、懒加载入口说明）。  
   - **单组件深度**：用 `mcp__getComponentGenerator` 生成 `.mastergo/`（`rootPath` 只传目标 app 目录，如 `apps/app-admin`）。  
3. **按清单落地实现**（仅在必要时触发项目 skills）：  
   - 新增路由/页面入口：`create-route`  
   - 组件拆分落代码：`create-component`  
   - 跨页面状态：`create-store`  
4. **技能使用声明（必写）**：在输出“UI 清单/实现步骤”前，附上一段：  
   - `已使用的 skills`：本技能 `mastergo-design-restore` + 上述实际用到的 `create-route/create-component/create-store/...`。  
5. **自检**：目标 app 页面可访问、路由懒加载入口正确、结构清晰、样式与设计稿一致。

## 输出与自检

- **可运行**：新页面与组件在当前 app 下能正常访问、无报错。
- **结构清晰**：路由与组件划分符合 03/04/06 规则，单文件建议 ≤300 行、接口 ≤10 个。
- **样式一致**：颜色、字号、间距等与设计稿或 UI 清单一致，使用项目主题变量而非魔数。
- **无冗余**：不重复造轮子，能复用现有组件与 API 的尽量复用。

## 建议输出模板（给实现用的清单）

当用户说“先给 UI 清单再实现”时，建议按以下结构输出（便于直接照着做）：

- **目标 app**：`apps/<app-name>`
- **路由**：
  - path：`/...`（kebab-case）
  - name：`...`（camelCase）
  - view：`src/views/...`
- **页面模块拆分**：
  - `<ModuleA>`：职责 / 关键交互 / 对应设计节点
  - `<ModuleB>`：...
- **组件列表**：
  - **通用组件**：`src/components/...`（可复用）
  - **页面组件**：`src/views/...`（仅本页）
- **样式与资源**：
  - 主题变量：色值/字号/间距的来源（优先项目变量）
  - 图标：是否来自 `.mastergo/images/`，如何接入（`?raw` + `currentColor`）

## 错误与约束

- **入参**：`mcp__getDsl` 必须提供 `shortLink` 或同时提供 `fileId` 与 `layerId`，否则会报「请提供 MasterGo 链接或 fileId + layerId」类错误。
- **链接格式**：支持完整设计链接与短链（如 `https://mastergo.com/goto/xxx`），短链会自动解析为 fileId/layerId。
- **getComponentGenerator**：`rootPath` 需为当前 app 或组件的实际工作区根路径（如 `apps/app-admin`），生成的 `.mastergo/` 会写在该路径下。

## 相关文档与技能

| 资源 | 说明 |
|------|------|
| [MasterGo Magic MCP](https://github.com/mastergo-design/mastergo-magic-mcp) | 官方仓库与 MCP 工具说明 |
| [mastergo-mcp-usage.md](../../../handbook/ai-engineering/mastergo-mcp-usage.md) | 本仓 MasterGo MCP 配置与 Token |
| [mcp-implementation-guide.md](../../../handbook/ai-engineering/mcp-implementation-guide.md) | MCP 在本仓的配置与设计稿→实现流程 |
| create-route | 新增/修改路由与视图 |
| create-component | 新增/拆分 Vue 组件 |
| skill-creator | 若需要继续完善/扩展本技能的说明与结构，可用该技能来生成/维护技能文档 |
| frontend-design | 前端界面美学与细节（可选配合） |

```

---

## skills/shared-skills/mcp-builder/.openskills.json

`skills/shared-skills/mcp-builder/.openskills.json`

```json
{
  "source": "anthropics/skills",
  "sourceType": "git",
  "repoUrl": "https://github.com/anthropics/skills",
  "subpath": "skills/mcp-builder",
  "installedAt": "2026-02-10T08:42:51.444Z"
}
```

---

## skills/shared-skills/mcp-builder/LICENSE.txt

`skills/shared-skills/mcp-builder/LICENSE.txt`

```

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

---

## skills/shared-skills/mcp-builder/SKILL.md

`skills/shared-skills/mcp-builder/SKILL.md`

```markdown
---
name: mcp-builder
description: 指导创建高质量的 MCP（Model Context Protocol）服务端，使 LLM 通过设计良好的工具与外部服务交互。在构建 MCP 服务以集成外部 API 或服务时使用（Python FastMCP 或 Node/TypeScript MCP SDK 均可）。
license: Complete terms in LICENSE.txt
---

# MCP 服务端开发指南

## 概述

创建高质量的 MCP（Model Context Protocol）服务端，使 LLM 通过设计良好的工具与外部服务交互。MCP 服务端的质量取决于它能在多大程度上帮助 LLM 完成真实任务。

---

# 流程

## 高层工作流

创建高质量 MCP 服务端包含四个主要阶段：

### 阶段 1：深入调研与规划

#### 1.1 理解现代 MCP 设计

**API 覆盖 vs 工作流工具：**
在全面的 API 端点覆盖与专用工作流工具之间取得平衡。工作流工具对特定任务更便捷，全面覆盖则让智能体能灵活组合操作。不同客户端表现不同——有的适合用代码组合基础工具，有的更适合高层工作流。不确定时优先全面 API 覆盖。

**工具命名与可发现性：**
清晰、描述性的工具名帮助智能体快速找到合适工具。使用一致前缀（如 `github_create_issue`、`github_list_repos`）和面向动作的命名。

**上下文管理：**
智能体受益于简洁的工具描述以及过滤/分页能力。设计返回聚焦、相关数据的工具。部分客户端支持代码执行，可帮助智能体过滤与处理数据。

**可操作的错误信息：**
错误信息应引导智能体解决问题，包含具体建议和下一步。

#### 1.2 研读 MCP 协议文档

**查阅 MCP 规范：**

从站点地图开始：`https://modelcontextprotocol.io/sitemap.xml`

然后以 `.md` 后缀获取具体页面（如 `https://modelcontextprotocol.io/specification/draft.md`）。

建议查阅的页面：
- 规范概述与架构
- 传输机制（streamable HTTP、stdio）
- 工具、资源与 prompt 定义

#### 1.3 研读框架文档

**推荐技术栈：**
- **语言**：TypeScript（SDK 质量高、在多环境中兼容性好，且模型擅长生成 TypeScript，类型与 lint 工具完善）
- **传输**：远程用 Streamable HTTP、无状态 JSON（比有状态会话与流式响应更易扩展与维护）；本地用 stdio。

**加载框架文档：**

- **MCP 最佳实践**：[📋 查看最佳实践](./reference/mcp_best_practices.md) - 核心指南

**TypeScript（推荐）：**
- **TypeScript SDK**：用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ TypeScript 指南](./reference/node_mcp_server.md) - TypeScript 模式与示例

**Python：**
- **Python SDK**：用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Python 指南](./reference/python_mcp_server.md) - Python 模式与示例

#### 1.4 规划实现

**理解 API：**
查阅服务的 API 文档，识别关键端点、认证要求与数据模型。按需使用网页搜索与 WebFetch。

**工具选择：**
优先全面 API 覆盖。列出要实现的端点，从最常用操作开始。

---

### 阶段 2：实现

#### 2.1 搭建项目结构

参见各语言指南中的项目搭建：
- [⚡ TypeScript 指南](./reference/node_mcp_server.md) - 项目结构、package.json、tsconfig.json
- [🐍 Python 指南](./reference/python_mcp_server.md) - 模块组织、依赖

#### 2.2 实现核心基础设施

创建共享工具：
- 带认证的 API 客户端
- 错误处理辅助
- 响应格式化（JSON/Markdown）
- 分页支持

#### 2.3 实现工具

对每个工具：

**输入 Schema：**
- 使用 Zod（TypeScript）或 Pydantic（Python）
- 包含约束与清晰描述
- 在字段描述中提供示例

**输出 Schema：**
- 尽可能定义 `outputSchema` 以返回结构化数据
- 在工具响应中使用 `structuredContent`（TypeScript SDK 特性）
- 帮助客户端理解并处理工具输出

**工具描述：**
- 功能简述
- 参数描述
- 返回类型 schema

**实现：**
- I/O 使用 async/await
- 带可操作信息的正确错误处理
- 适用处支持分页
- 使用现代 SDK 时同时返回文本内容与结构化数据

**注解：**
- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

---

### 阶段 3：评审与测试

#### 3.1 代码质量

检查：
- 无重复代码（DRY）
- 一致的错误处理
- 完整类型覆盖
- 清晰的工具描述

#### 3.2 构建与测试

**TypeScript：**
- 运行 `npm run build` 验证编译
- 用 MCP Inspector 测试：`npx @modelcontextprotocol/inspector`

**Python：**
- 验证语法：`python -m py_compile your_server.py`
- 用 MCP Inspector 测试

详细测试方式与质量清单见各语言指南。

---

### 阶段 4：创建评估

实现 MCP 服务端后，创建全面评估以检验其有效性。

**加载 [✅ 评估指南](./reference/evaluation.md) 获取完整评估说明。**

#### 4.1 理解评估目的

用评估检验 LLM 是否能有效使用你的 MCP 服务端回答真实、复杂问题。

#### 4.2 编写 10 道评估题

按评估指南中的流程编写有效评估：

1. **工具检视**：列出可用工具并理解其能力
2. **内容探索**：用只读操作探索可用数据
3. **题目生成**：编写 10 道复杂、真实的问题
4. **答案验证**：自行解答每题以验证答案

#### 4.3 评估要求

每题须满足：
- **独立**：不依赖其他题目
- **只读**：仅需非破坏性操作
- **复杂**：需多次工具调用与深入探索
- **真实**：基于人类会关心的真实场景
- **可验证**：有单一、清晰答案，可通过字符串比较验证
- **稳定**：答案不随时间变化

#### 4.4 输出格式

创建符合以下结构的 XML 文件：

```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
<!-- 更多 qa_pair... -->
</evaluation>
```

---

# 参考文件

## 文档库

开发过程中按需加载以下资源：

### MCP 核心文档（优先加载）
- **MCP 协议**：从 `https://modelcontextprotocol.io/sitemap.xml` 的 sitemap 开始，再以 `.md` 后缀获取具体页面
- [📋 MCP 最佳实践](./reference/mcp_best_practices.md) - 通用 MCP 指南，包括：
  - 服务端与工具命名约定
  - 响应格式（JSON vs Markdown）
  - 分页最佳实践
  - 传输选择（streamable HTTP vs stdio）
  - 安全与错误处理标准

### SDK 文档（阶段 1/2 中加载）
- **Python SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md` 获取
- **TypeScript SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md` 获取

### 语言专项实现指南（阶段 2 中加载）
- [🐍 Python 实现指南](./reference/python_mcp_server.md) - Python/FastMCP 完整指南：
  - 服务端初始化模式
  - Pydantic 模型示例
  - 使用 `@mcp.tool` 注册工具
  - 完整可运行示例
  - 质量清单

- [⚡ TypeScript 实现指南](./reference/node_mcp_server.md) - TypeScript 完整指南：
  - 项目结构
  - Zod schema 模式
  - 使用 `server.registerTool` 注册工具
  - 完整可运行示例
  - 质量清单

### 评估指南（阶段 4 加载）
- [✅ 评估指南](./reference/evaluation.md) - 评估创建完整指南：
  - 题目编写原则
  - 答案验证策略
  - XML 格式说明
  - 示例题目与答案
  - 使用提供的脚本运行评估

```

---

## skills/shared-skills/mcp-builder/reference/evaluation.md

`skills/shared-skills/mcp-builder/reference/evaluation.md`

```markdown
# MCP Server Evaluation Guide

## Overview

This document provides guidance on creating comprehensive evaluations for MCP servers. Evaluations test whether LLMs can effectively use your MCP server to answer realistic, complex questions using only the tools provided.

---

## Quick Reference

### Evaluation Requirements
- Create 10 human-readable questions
- Questions must be READ-ONLY, INDEPENDENT, NON-DESTRUCTIVE
- Each question requires multiple tool calls (potentially dozens)
- Answers must be single, verifiable values
- Answers must be STABLE (won't change over time)

### Output Format
```xml
<evaluation>
   <qa_pair>
      <question>Your question here</question>
      <answer>Single verifiable answer</answer>
   </qa_pair>
</evaluation>
```

---

## Purpose of Evaluations

The measure of quality of an MCP server is NOT how well or comprehensively the server implements tools, but how well these implementations (input/output schemas, docstrings/descriptions, functionality) enable LLMs with no other context and access ONLY to the MCP servers to answer realistic and difficult questions.

## Evaluation Overview

Create 10 human-readable questions requiring ONLY READ-ONLY, INDEPENDENT, NON-DESTRUCTIVE, and IDEMPOTENT operations to answer. Each question should be:
- Realistic
- Clear and concise
- Unambiguous
- Complex, requiring potentially dozens of tool calls or steps
- Answerable with a single, verifiable value that you identify in advance

## Question Guidelines

### Core Requirements

1. **Questions MUST be independent**
   - Each question should NOT depend on the answer to any other question
   - Should not assume prior write operations from processing another question

2. **Questions MUST require ONLY NON-DESTRUCTIVE AND IDEMPOTENT tool use**
   - Should not instruct or require modifying state to arrive at the correct answer

3. **Questions must be REALISTIC, CLEAR, CONCISE, and COMPLEX**
   - Must require another LLM to use multiple (potentially dozens of) tools or steps to answer

### Complexity and Depth

4. **Questions must require deep exploration**
   - Consider multi-hop questions requiring multiple sub-questions and sequential tool calls
   - Each step should benefit from information found in previous questions

5. **Questions may require extensive paging**
   - May need paging through multiple pages of results
   - May require querying old data (1-2 years out-of-date) to find niche information
   - The questions must be DIFFICULT

6. **Questions must require deep understanding**
   - Rather than surface-level knowledge
   - May pose complex ideas as True/False questions requiring evidence
   - May use multiple-choice format where LLM must search different hypotheses

7. **Questions must not be solvable with straightforward keyword search**
   - Do not include specific keywords from the target content
   - Use synonyms, related concepts, or paraphrases
   - Require multiple searches, analyzing multiple related items, extracting context, then deriving the answer

### Tool Testing

8. **Questions should stress-test tool return values**
   - May elicit tools returning large JSON objects or lists, overwhelming the LLM
   - Should require understanding multiple modalities of data:
     - IDs and names
     - Timestamps and datetimes (months, days, years, seconds)
     - File IDs, names, extensions, and mimetypes
     - URLs, GIDs, etc.
   - Should probe the tool's ability to return all useful forms of data

9. **Questions should MOSTLY reflect real human use cases**
   - The kinds of information retrieval tasks that HUMANS assisted by an LLM would care about

10. **Questions may require dozens of tool calls**
    - This challenges LLMs with limited context
    - Encourages MCP server tools to reduce information returned

11. **Include ambiguous questions**
    - May be ambiguous OR require difficult decisions on which tools to call
    - Force the LLM to potentially make mistakes or misinterpret
    - Ensure that despite AMBIGUITY, there is STILL A SINGLE VERIFIABLE ANSWER

### Stability

12. **Questions must be designed so the answer DOES NOT CHANGE**
    - Do not ask questions that rely on "current state" which is dynamic
    - For example, do not count:
      - Number of reactions to a post
      - Number of replies to a thread
      - Number of members in a channel

13. **DO NOT let the MCP server RESTRICT the kinds of questions you create**
    - Create challenging and complex questions
    - Some may not be solvable with the available MCP server tools
    - Questions may require specific output formats (datetime vs. epoch time, JSON vs. MARKDOWN)
    - Questions may require dozens of tool calls to complete

## Answer Guidelines

### Verification

1. **Answers must be VERIFIABLE via direct string comparison**
   - If the answer can be re-written in many formats, clearly specify the output format in the QUESTION
   - Examples: "Use YYYY/MM/DD.", "Respond True or False.", "Answer A, B, C, or D and nothing else."
   - Answer should be a single VERIFIABLE value such as:
     - User ID, user name, display name, first name, last name
     - Channel ID, channel name
     - Message ID, string
     - URL, title
     - Numerical quantity
     - Timestamp, datetime
     - Boolean (for True/False questions)
     - Email address, phone number
     - File ID, file name, file extension
     - Multiple choice answer
   - Answers must not require special formatting or complex, structured output
   - Answer will be verified using DIRECT STRING COMPARISON

### Readability

2. **Answers should generally prefer HUMAN-READABLE formats**
   - Examples: names, first name, last name, datetime, file name, message string, URL, yes/no, true/false, a/b/c/d
   - Rather than opaque IDs (though IDs are acceptable)
   - The VAST MAJORITY of answers should be human-readable

### Stability

3. **Answers must be STABLE/STATIONARY**
   - Look at old content (e.g., conversations that have ended, projects that have launched, questions answered)
   - Create QUESTIONS based on "closed" concepts that will always return the same answer
   - Questions may ask to consider a fixed time window to insulate from non-stationary answers
   - Rely on context UNLIKELY to change
   - Example: if finding a paper name, be SPECIFIC enough so answer is not confused with papers published later

4. **Answers must be CLEAR and UNAMBIGUOUS**
   - Questions must be designed so there is a single, clear answer
   - Answer can be derived from using the MCP server tools

### Diversity

5. **Answers must be DIVERSE**
   - Answer should be a single VERIFIABLE value in diverse modalities and formats
   - User concept: user ID, user name, display name, first name, last name, email address, phone number
   - Channel concept: channel ID, channel name, channel topic
   - Message concept: message ID, message string, timestamp, month, day, year

6. **Answers must NOT be complex structures**
   - Not a list of values
   - Not a complex object
   - Not a list of IDs or strings
   - Not natural language text
   - UNLESS the answer can be straightforwardly verified using DIRECT STRING COMPARISON
   - And can be realistically reproduced
   - It should be unlikely that an LLM would return the same list in any other order or format

## Evaluation Process

### Step 1: Documentation Inspection

Read the documentation of the target API to understand:
- Available endpoints and functionality
- If ambiguity exists, fetch additional information from the web
- Parallelize this step AS MUCH AS POSSIBLE
- Ensure each subagent is ONLY examining documentation from the file system or on the web

### Step 2: Tool Inspection

List the tools available in the MCP server:
- Inspect the MCP server directly
- Understand input/output schemas, docstrings, and descriptions
- WITHOUT calling the tools themselves at this stage

### Step 3: Developing Understanding

Repeat steps 1 & 2 until you have a good understanding:
- Iterate multiple times
- Think about the kinds of tasks you want to create
- Refine your understanding
- At NO stage should you READ the code of the MCP server implementation itself
- Use your intuition and understanding to create reasonable, realistic, but VERY challenging tasks

### Step 4: Read-Only Content Inspection

After understanding the API and tools, USE the MCP server tools:
- Inspect content using READ-ONLY and NON-DESTRUCTIVE operations ONLY
- Goal: identify specific content (e.g., users, channels, messages, projects, tasks) for creating realistic questions
- Should NOT call any tools that modify state
- Will NOT read the code of the MCP server implementation itself
- Parallelize this step with individual sub-agents pursuing independent explorations
- Ensure each subagent is only performing READ-ONLY, NON-DESTRUCTIVE, and IDEMPOTENT operations
- BE CAREFUL: SOME TOOLS may return LOTS OF DATA which would cause you to run out of CONTEXT
- Make INCREMENTAL, SMALL, AND TARGETED tool calls for exploration
- In all tool call requests, use the `limit` parameter to limit results (<10)
- Use pagination

### Step 5: Task Generation

After inspecting the content, create 10 human-readable questions:
- An LLM should be able to answer these with the MCP server
- Follow all question and answer guidelines above

## Output Format

Each QA pair consists of a question and an answer. The output should be an XML file with this structure:

```xml
<evaluation>
   <qa_pair>
      <question>Find the project created in Q2 2024 with the highest number of completed tasks. What is the project name?</question>
      <answer>Website Redesign</answer>
   </qa_pair>
   <qa_pair>
      <question>Search for issues labeled as "bug" that were closed in March 2024. Which user closed the most issues? Provide their username.</question>
      <answer>sarah_dev</answer>
   </qa_pair>
   <qa_pair>
      <question>Look for pull requests that modified files in the /api directory and were merged between January 1 and January 31, 2024. How many different contributors worked on these PRs?</question>
      <answer>7</answer>
   </qa_pair>
   <qa_pair>
      <question>Find the repository with the most stars that was created before 2023. What is the repository name?</question>
      <answer>data-pipeline</answer>
   </qa_pair>
</evaluation>
```

## Evaluation Examples

### Good Questions

**Example 1: Multi-hop question requiring deep exploration (GitHub MCP)**
```xml
<qa_pair>
   <question>Find the repository that was archived in Q3 2023 and had previously been the most forked project in the organization. What was the primary programming language used in that repository?</question>
   <answer>Python</answer>
</qa_pair>
```

This question is good because:
- Requires multiple searches to find archived repositories
- Needs to identify which had the most forks before archival
- Requires examining repository details for the language
- Answer is a simple, verifiable value
- Based on historical (closed) data that won't change

**Example 2: Requires understanding context without keyword matching (Project Management MCP)**
```xml
<qa_pair>
   <question>Locate the initiative focused on improving customer onboarding that was completed in late 2023. The project lead created a retrospective document after completion. What was the lead's role title at that time?</question>
   <answer>Product Manager</answer>
</qa_pair>
```

This question is good because:
- Doesn't use specific project name ("initiative focused on improving customer onboarding")
- Requires finding completed projects from specific timeframe
- Needs to identify the project lead and their role
- Requires understanding context from retrospective documents
- Answer is human-readable and stable
- Based on completed work (won't change)

**Example 3: Complex aggregation requiring multiple steps (Issue Tracker MCP)**
```xml
<qa_pair>
   <question>Among all bugs reported in January 2024 that were marked as critical priority, which assignee resolved the highest percentage of their assigned bugs within 48 hours? Provide the assignee's username.</question>
   <answer>alex_eng</answer>
</qa_pair>
```

This question is good because:
- Requires filtering bugs by date, priority, and status
- Needs to group by assignee and calculate resolution rates
- Requires understanding timestamps to determine 48-hour windows
- Tests pagination (potentially many bugs to process)
- Answer is a single username
- Based on historical data from specific time period

**Example 4: Requires synthesis across multiple data types (CRM MCP)**
```xml
<qa_pair>
   <question>Find the account that upgraded from the Starter to Enterprise plan in Q4 2023 and had the highest annual contract value. What industry does this account operate in?</question>
   <answer>Healthcare</answer>
</qa_pair>
```

This question is good because:
- Requires understanding subscription tier changes
- Needs to identify upgrade events in specific timeframe
- Requires comparing contract values
- Must access account industry information
- Answer is simple and verifiable
- Based on completed historical transactions

### Poor Questions

**Example 1: Answer changes over time**
```xml
<qa_pair>
   <question>How many open issues are currently assigned to the engineering team?</question>
   <answer>47</answer>
</qa_pair>
```

This question is poor because:
- The answer will change as issues are created, closed, or reassigned
- Not based on stable/stationary data
- Relies on "current state" which is dynamic

**Example 2: Too easy with keyword search**
```xml
<qa_pair>
   <question>Find the pull request with title "Add authentication feature" and tell me who created it.</question>
   <answer>developer123</answer>
</qa_pair>
```

This question is poor because:
- Can be solved with a straightforward keyword search for exact title
- Doesn't require deep exploration or understanding
- No synthesis or analysis needed

**Example 3: Ambiguous answer format**
```xml
<qa_pair>
   <question>List all the repositories that have Python as their primary language.</question>
   <answer>repo1, repo2, repo3, data-pipeline, ml-tools</answer>
</qa_pair>
```

This question is poor because:
- Answer is a list that could be returned in any order
- Difficult to verify with direct string comparison
- LLM might format differently (JSON array, comma-separated, newline-separated)
- Better to ask for a specific aggregate (count) or superlative (most stars)

## Verification Process

After creating evaluations:

1. **Examine the XML file** to understand the schema
2. **Load each task instruction** and in parallel using the MCP server and tools, identify the correct answer by attempting to solve the task YOURSELF
3. **Flag any operations** that require WRITE or DESTRUCTIVE operations
4. **Accumulate all CORRECT answers** and replace any incorrect answers in the document
5. **Remove any `<qa_pair>`** that require WRITE or DESTRUCTIVE operations

Remember to parallelize solving tasks to avoid running out of context, then accumulate all answers and make changes to the file at the end.

## Tips for Creating Quality Evaluations

1. **Think Hard and Plan Ahead** before generating tasks
2. **Parallelize Where Opportunity Arises** to speed up the process and manage context
3. **Focus on Realistic Use Cases** that humans would actually want to accomplish
4. **Create Challenging Questions** that test the limits of the MCP server's capabilities
5. **Ensure Stability** by using historical data and closed concepts
6. **Verify Answers** by solving the questions yourself using the MCP server tools
7. **Iterate and Refine** based on what you learn during the process

---

# Running Evaluations

After creating your evaluation file, you can use the provided evaluation harness to test your MCP server.

## Setup

1. **Install Dependencies**

   ```bash
   pip install -r scripts/requirements.txt
   ```

   Or install manually:
   ```bash
   pip install anthropic mcp
   ```

2. **Set API Key**

   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

## Evaluation File Format

Evaluation files use XML format with `<qa_pair>` elements:

```xml
<evaluation>
   <qa_pair>
      <question>Find the project created in Q2 2024 with the highest number of completed tasks. What is the project name?</question>
      <answer>Website Redesign</answer>
   </qa_pair>
   <qa_pair>
      <question>Search for issues labeled as "bug" that were closed in March 2024. Which user closed the most issues? Provide their username.</question>
      <answer>sarah_dev</answer>
   </qa_pair>
</evaluation>
```

## Running Evaluations

The evaluation script (`scripts/evaluation.py`) supports three transport types:

**Important:**
- **stdio transport**: The evaluation script automatically launches and manages the MCP server process for you. Do not run the server manually.
- **sse/http transports**: You must start the MCP server separately before running the evaluation. The script connects to the already-running server at the specified URL.

### 1. Local STDIO Server

For locally-run MCP servers (script launches the server automatically):

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  evaluation.xml
```

With environment variables:
```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  -e API_KEY=abc123 \
  -e DEBUG=true \
  evaluation.xml
```

### 2. Server-Sent Events (SSE)

For SSE-based MCP servers (you must start the server first):

```bash
python scripts/evaluation.py \
  -t sse \
  -u https://example.com/mcp \
  -H "Authorization: Bearer token123" \
  -H "X-Custom-Header: value" \
  evaluation.xml
```

### 3. HTTP (Streamable HTTP)

For HTTP-based MCP servers (you must start the server first):

```bash
python scripts/evaluation.py \
  -t http \
  -u https://example.com/mcp \
  -H "Authorization: Bearer token123" \
  evaluation.xml
```

## Command-Line Options

```
usage: evaluation.py [-h] [-t {stdio,sse,http}] [-m MODEL] [-c COMMAND]
                     [-a ARGS [ARGS ...]] [-e ENV [ENV ...]] [-u URL]
                     [-H HEADERS [HEADERS ...]] [-o OUTPUT]
                     eval_file

positional arguments:
  eval_file             Path to evaluation XML file

optional arguments:
  -h, --help            Show help message
  -t, --transport       Transport type: stdio, sse, or http (default: stdio)
  -m, --model           Claude model to use (default: claude-3-7-sonnet-20250219)
  -o, --output          Output file for report (default: print to stdout)

stdio options:
  -c, --command         Command to run MCP server (e.g., python, node)
  -a, --args            Arguments for the command (e.g., server.py)
  -e, --env             Environment variables in KEY=VALUE format

sse/http options:
  -u, --url             MCP server URL
  -H, --header          HTTP headers in 'Key: Value' format
```

## Output

The evaluation script generates a detailed report including:

- **Summary Statistics**:
  - Accuracy (correct/total)
  - Average task duration
  - Average tool calls per task
  - Total tool calls

- **Per-Task Results**:
  - Prompt and expected response
  - Actual response from the agent
  - Whether the answer was correct (✅/❌)
  - Duration and tool call details
  - Agent's summary of its approach
  - Agent's feedback on the tools

### Save Report to File

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_server.py \
  -o evaluation_report.md \
  evaluation.xml
```

## Complete Example Workflow

Here's a complete example of creating and running an evaluation:

1. **Create your evaluation file** (`my_evaluation.xml`):

```xml
<evaluation>
   <qa_pair>
      <question>Find the user who created the most issues in January 2024. What is their username?</question>
      <answer>alice_developer</answer>
   </qa_pair>
   <qa_pair>
      <question>Among all pull requests merged in Q1 2024, which repository had the highest number? Provide the repository name.</question>
      <answer>backend-api</answer>
   </qa_pair>
   <qa_pair>
      <question>Find the project that was completed in December 2023 and had the longest duration from start to finish. How many days did it take?</question>
      <answer>127</answer>
   </qa_pair>
</evaluation>
```

2. **Install dependencies**:

```bash
pip install -r scripts/requirements.txt
export ANTHROPIC_API_KEY=your_api_key
```

3. **Run evaluation**:

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a github_mcp_server.py \
  -e GITHUB_TOKEN=ghp_xxx \
  -o github_eval_report.md \
  my_evaluation.xml
```

4. **Review the report** in `github_eval_report.md` to:
   - See which questions passed/failed
   - Read the agent's feedback on your tools
   - Identify areas for improvement
   - Iterate on your MCP server design

## Troubleshooting

### Connection Errors

If you get connection errors:
- **STDIO**: Verify the command and arguments are correct
- **SSE/HTTP**: Check the URL is accessible and headers are correct
- Ensure any required API keys are set in environment variables or headers

### Low Accuracy

If many evaluations fail:
- Review the agent's feedback for each task
- Check if tool descriptions are clear and comprehensive
- Verify input parameters are well-documented
- Consider whether tools return too much or too little data
- Ensure error messages are actionable

### Timeout Issues

If tasks are timing out:
- Use a more capable model (e.g., `claude-3-7-sonnet-20250219`)
- Check if tools are returning too much data
- Verify pagination is working correctly
- Consider simplifying complex questions
```

---

## skills/shared-skills/mcp-builder/reference/mcp_best_practices.md

`skills/shared-skills/mcp-builder/reference/mcp_best_practices.md`

```markdown
# MCP Server Best Practices

## Quick Reference

### Server Naming
- **Python**: `{service}_mcp` (e.g., `slack_mcp`)
- **Node/TypeScript**: `{service}-mcp-server` (e.g., `slack-mcp-server`)

### Tool Naming
- Use snake_case with service prefix
- Format: `{service}_{action}_{resource}`
- Example: `slack_send_message`, `github_create_issue`

### Response Formats
- Support both JSON and Markdown formats
- JSON for programmatic processing
- Markdown for human readability

### Pagination
- Always respect `limit` parameter
- Return `has_more`, `next_offset`, `total_count`
- Default to 20-50 items

### Transport
- **Streamable HTTP**: For remote servers, multi-client scenarios
- **stdio**: For local integrations, command-line tools
- Avoid SSE (deprecated in favor of streamable HTTP)

---

## Server Naming Conventions

Follow these standardized naming patterns:

**Python**: Use format `{service}_mcp` (lowercase with underscores)
- Examples: `slack_mcp`, `github_mcp`, `jira_mcp`

**Node/TypeScript**: Use format `{service}-mcp-server` (lowercase with hyphens)
- Examples: `slack-mcp-server`, `github-mcp-server`, `jira-mcp-server`

The name should be general, descriptive of the service being integrated, easy to infer from the task description, and without version numbers.

---

## Tool Naming and Design

### Tool Naming

1. **Use snake_case**: `search_users`, `create_project`, `get_channel_info`
2. **Include service prefix**: Anticipate that your MCP server may be used alongside other MCP servers
   - Use `slack_send_message` instead of just `send_message`
   - Use `github_create_issue` instead of just `create_issue`
3. **Be action-oriented**: Start with verbs (get, list, search, create, etc.)
4. **Be specific**: Avoid generic names that could conflict with other servers

### Tool Design

- Tool descriptions must narrowly and unambiguously describe functionality
- Descriptions must precisely match actual functionality
- Provide tool annotations (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- Keep tool operations focused and atomic

---

## Response Formats

All tools that return data should support multiple formats:

### JSON Format (`response_format="json"`)
- Machine-readable structured data
- Include all available fields and metadata
- Consistent field names and types
- Use for programmatic processing

### Markdown Format (`response_format="markdown"`, typically default)
- Human-readable formatted text
- Use headers, lists, and formatting for clarity
- Convert timestamps to human-readable format
- Show display names with IDs in parentheses
- Omit verbose metadata

---

## Pagination

For tools that list resources:

- **Always respect the `limit` parameter**
- **Implement pagination**: Use `offset` or cursor-based pagination
- **Return pagination metadata**: Include `has_more`, `next_offset`/`next_cursor`, `total_count`
- **Never load all results into memory**: Especially important for large datasets
- **Default to reasonable limits**: 20-50 items is typical

Example pagination response:
```json
{
  "total": 150,
  "count": 20,
  "offset": 0,
  "items": [...],
  "has_more": true,
  "next_offset": 20
}
```

---

## Transport Options

### Streamable HTTP

**Best for**: Remote servers, web services, multi-client scenarios

**Characteristics**:
- Bidirectional communication over HTTP
- Supports multiple simultaneous clients
- Can be deployed as a web service
- Enables server-to-client notifications

**Use when**:
- Serving multiple clients simultaneously
- Deploying as a cloud service
- Integration with web applications

### stdio

**Best for**: Local integrations, command-line tools

**Characteristics**:
- Standard input/output stream communication
- Simple setup, no network configuration needed
- Runs as a subprocess of the client

**Use when**:
- Building tools for local development environments
- Integrating with desktop applications
- Single-user, single-session scenarios

**Note**: stdio servers should NOT log to stdout (use stderr for logging)

### Transport Selection

| Criterion | stdio | Streamable HTTP |
|-----------|-------|-----------------|
| **Deployment** | Local | Remote |
| **Clients** | Single | Multiple |
| **Complexity** | Low | Medium |
| **Real-time** | No | Yes |

---

## Security Best Practices

### Authentication and Authorization

**OAuth 2.1**:
- Use secure OAuth 2.1 with certificates from recognized authorities
- Validate access tokens before processing requests
- Only accept tokens specifically intended for your server

**API Keys**:
- Store API keys in environment variables, never in code
- Validate keys on server startup
- Provide clear error messages when authentication fails

### Input Validation

- Sanitize file paths to prevent directory traversal
- Validate URLs and external identifiers
- Check parameter sizes and ranges
- Prevent command injection in system calls
- Use schema validation (Pydantic/Zod) for all inputs

### Error Handling

- Don't expose internal errors to clients
- Log security-relevant errors server-side
- Provide helpful but not revealing error messages
- Clean up resources after errors

### DNS Rebinding Protection

For streamable HTTP servers running locally:
- Enable DNS rebinding protection
- Validate the `Origin` header on all incoming connections
- Bind to `127.0.0.1` rather than `0.0.0.0`

---

## Tool Annotations

Provide annotations to help clients understand tool behavior:

| Annotation | Type | Default | Description |
|-----------|------|---------|-------------|
| `readOnlyHint` | boolean | false | Tool does not modify its environment |
| `destructiveHint` | boolean | true | Tool may perform destructive updates |
| `idempotentHint` | boolean | false | Repeated calls with same args have no additional effect |
| `openWorldHint` | boolean | true | Tool interacts with external entities |

**Important**: Annotations are hints, not security guarantees. Clients should not make security-critical decisions based solely on annotations.

---

## Error Handling

- Use standard JSON-RPC error codes
- Report tool errors within result objects (not protocol-level errors)
- Provide helpful, specific error messages with suggested next steps
- Don't expose internal implementation details
- Clean up resources properly on errors

Example error handling:
```typescript
try {
  const result = performOperation();
  return { content: [{ type: "text", text: result }] };
} catch (error) {
  return {
    isError: true,
    content: [{
      type: "text",
      text: `Error: ${error.message}. Try using filter='active_only' to reduce results.`
    }]
  };
}
```

---

## Testing Requirements

Comprehensive testing should cover:

- **Functional testing**: Verify correct execution with valid/invalid inputs
- **Integration testing**: Test interaction with external systems
- **Security testing**: Validate auth, input sanitization, rate limiting
- **Performance testing**: Check behavior under load, timeouts
- **Error handling**: Ensure proper error reporting and cleanup

---

## Documentation Requirements

- Provide clear documentation of all tools and capabilities
- Include working examples (at least 3 per major feature)
- Document security considerations
- Specify required permissions and access levels
- Document rate limits and performance characteristics

```

---

## skills/shared-skills/mcp-builder/reference/node_mcp_server.md

`skills/shared-skills/mcp-builder/reference/node_mcp_server.md`

```markdown
# Node/TypeScript MCP Server Implementation Guide

## Overview

This document provides Node/TypeScript-specific best practices and examples for implementing MCP servers using the MCP TypeScript SDK. It covers project structure, server setup, tool registration patterns, input validation with Zod, error handling, and complete working examples.

---

## Quick Reference

### Key Imports
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { z } from "zod";
```

### Server Initialization
```typescript
const server = new McpServer({
  name: "service-mcp-server",
  version: "1.0.0"
});
```

### Tool Registration Pattern
```typescript
server.registerTool(
  "tool_name",
  {
    title: "Tool Display Name",
    description: "What the tool does",
    inputSchema: { param: z.string() },
    outputSchema: { result: z.string() }
  },
  async ({ param }) => {
    const output = { result: `Processed: ${param}` };
    return {
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output // Modern pattern for structured data
    };
  }
);
```

---

## MCP TypeScript SDK

The official MCP TypeScript SDK provides:
- `McpServer` class for server initialization
- `registerTool` method for tool registration
- Zod schema integration for runtime input validation
- Type-safe tool handler implementations

**IMPORTANT - Use Modern APIs Only:**
- **DO use**: `server.registerTool()`, `server.registerResource()`, `server.registerPrompt()`
- **DO NOT use**: Old deprecated APIs such as `server.tool()`, `server.setRequestHandler(ListToolsRequestSchema, ...)`, or manual handler registration
- The `register*` methods provide better type safety, automatic schema handling, and are the recommended approach

See the MCP SDK documentation in the references for complete details.

## Server Naming Convention

Node/TypeScript MCP servers must follow this naming pattern:
- **Format**: `{service}-mcp-server` (lowercase with hyphens)
- **Examples**: `github-mcp-server`, `jira-mcp-server`, `stripe-mcp-server`

The name should be:
- General (not tied to specific features)
- Descriptive of the service/API being integrated
- Easy to infer from the task description
- Without version numbers or dates

## Project Structure

Create the following structure for Node/TypeScript MCP servers:

```
{service}-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # Main entry point with McpServer initialization
│   ├── types.ts          # TypeScript type definitions and interfaces
│   ├── tools/            # Tool implementations (one file per domain)
│   ├── services/         # API clients and shared utilities
│   ├── schemas/          # Zod validation schemas
│   └── constants.ts      # Shared constants (API_URL, CHARACTER_LIMIT, etc.)
└── dist/                 # Built JavaScript files (entry point: dist/index.js)
```

## Tool Implementation

### Tool Naming

Use snake_case for tool names (e.g., "search_users", "create_project", "get_channel_info") with clear, action-oriented names.

**Avoid Naming Conflicts**: Include the service context to prevent overlaps:
- Use "slack_send_message" instead of just "send_message"
- Use "github_create_issue" instead of just "create_issue"
- Use "asana_list_tasks" instead of just "list_tasks"

### Tool Structure

Tools are registered using the `registerTool` method with the following requirements:
- Use Zod schemas for runtime input validation and type safety
- The `description` field must be explicitly provided - JSDoc comments are NOT automatically extracted
- Explicitly provide `title`, `description`, `inputSchema`, and `annotations`
- The `inputSchema` must be a Zod schema object (not a JSON schema)
- Type all parameters and return values explicitly

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "example-mcp",
  version: "1.0.0"
});

// Zod schema for input validation
const UserSearchInputSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search string to match against names/emails"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum results to return"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

// Type definition from Zod schema
type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

server.registerTool(
  "example_search_users",
  {
    title: "Search Example Users",
    description: `Search for users in the Example system by name, email, or team.

This tool searches across all user profiles in the Example platform, supporting partial matches and various search filters. It does NOT create or modify users, only searches existing ones.

Args:
  - query (string): Search string to match against names/emails
  - limit (number): Maximum results to return, between 1-100 (default: 20)
  - offset (number): Number of results to skip for pagination (default: 0)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For JSON format: Structured data with schema:
  {
    "total": number,           // Total number of matches found
    "count": number,           // Number of results in this response
    "offset": number,          // Current pagination offset
    "users": [
      {
        "id": string,          // User ID (e.g., "U123456789")
        "name": string,        // Full name (e.g., "John Doe")
        "email": string,       // Email address
        "team": string,        // Team name (optional)
        "active": boolean      // Whether user is active
      }
    ],
    "has_more": boolean,       // Whether more results are available
    "next_offset": number      // Offset for next page (if has_more is true)
  }

Examples:
  - Use when: "Find all marketing team members" -> params with query="team:marketing"
  - Use when: "Search for John's account" -> params with query="john"
  - Don't use when: You need to create a user (use example_create_user instead)

Error Handling:
  - Returns "Error: Rate limit exceeded" if too many requests (429 status)
  - Returns "No users found matching '<query>'" if search returns empty`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: UserSearchInput) => {
    try {
      // Input validation is handled by Zod schema
      // Make API request using validated parameters
      const data = await makeApiRequest<any>(
        "users/search",
        "GET",
        undefined,
        {
          q: params.query,
          limit: params.limit,
          offset: params.offset
        }
      );

      const users = data.users || [];
      const total = data.total || 0;

      if (!users.length) {
        return {
          content: [{
            type: "text",
            text: `No users found matching '${params.query}'`
          }]
        };
      }

      // Prepare structured output
      const output = {
        total,
        count: users.length,
        offset: params.offset,
        users: users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          ...(user.team ? { team: user.team } : {}),
          active: user.active ?? true
        })),
        has_more: total > params.offset + users.length,
        ...(total > params.offset + users.length ? {
          next_offset: params.offset + users.length
        } : {})
      };

      // Format text representation based on requested format
      let textContent: string;
      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [`# User Search Results: '${params.query}'`, "",
          `Found ${total} users (showing ${users.length})`, ""];
        for (const user of users) {
          lines.push(`## ${user.name} (${user.id})`);
          lines.push(`- **Email**: ${user.email}`);
          if (user.team) lines.push(`- **Team**: ${user.team}`);
          lines.push("");
        }
        textContent = lines.join("\n");
      } else {
        textContent = JSON.stringify(output, null, 2);
      }

      return {
        content: [{ type: "text", text: textContent }],
        structuredContent: output // Modern pattern for structured data
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: handleApiError(error)
        }]
      };
    }
  }
);
```

## Zod Schemas for Input Validation

Zod provides runtime type validation:

```typescript
import { z } from "zod";

// Basic schema with validation
const CreateUserSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string()
    .email("Invalid email format"),
  age: z.number()
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(150, "Age cannot be greater than 150")
}).strict();  // Use .strict() to forbid extra fields

// Enums
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const SearchSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
});

// Optional fields with defaults
const PaginationSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum results to return"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip")
});
```

## Response Format Options

Support multiple output formats for flexibility:

```typescript
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const inputSchema = z.object({
  query: z.string(),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
});
```

**Markdown format**:
- Use headers, lists, and formatting for clarity
- Convert timestamps to human-readable format
- Show display names with IDs in parentheses
- Omit verbose metadata
- Group related information logically

**JSON format**:
- Return complete, structured data suitable for programmatic processing
- Include all available fields and metadata
- Use consistent field names and types

## Pagination Implementation

For tools that list resources:

```typescript
const ListSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

async function listItems(params: z.infer<typeof ListSchema>) {
  const data = await apiRequest(params.limit, params.offset);

  const response = {
    total: data.total,
    count: data.items.length,
    offset: params.offset,
    items: data.items,
    has_more: data.total > params.offset + data.items.length,
    next_offset: data.total > params.offset + data.items.length
      ? params.offset + data.items.length
      : undefined
  };

  return JSON.stringify(response, null, 2);
}
```

## Character Limits and Truncation

Add a CHARACTER_LIMIT constant to prevent overwhelming responses:

```typescript
// At module level in constants.ts
export const CHARACTER_LIMIT = 25000;  // Maximum response size in characters

async function searchTool(params: SearchInput) {
  let result = generateResponse(data);

  // Check character limit and truncate if needed
  if (result.length > CHARACTER_LIMIT) {
    const truncatedData = data.slice(0, Math.max(1, data.length / 2));
    response.data = truncatedData;
    response.truncated = true;
    response.truncation_message =
      `Response truncated from ${data.length} to ${truncatedData.length} items. ` +
      `Use 'offset' parameter or add filters to see more results.`;
    result = JSON.stringify(response, null, 2);
  }

  return result;
}
```

## Error Handling

Provide clear, actionable error messages:

```typescript
import axios, { AxiosError } from "axios";

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "Error: Resource not found. Please check the ID is correct.";
        case 403:
          return "Error: Permission denied. You don't have access to this resource.";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        default:
          return `Error: API request failed with status ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    }
  }
  return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}
```

## Shared Utilities

Extract common functionality into reusable functions:

```typescript
// Shared API request function
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

## Async/Await Best Practices

Always use async/await for network requests and I/O operations:

```typescript
// Good: Async network request
async function fetchData(resourceId: string): Promise<ResourceData> {
  const response = await axios.get(`${API_URL}/resource/${resourceId}`);
  return response.data;
}

// Bad: Promise chains
function fetchData(resourceId: string): Promise<ResourceData> {
  return axios.get(`${API_URL}/resource/${resourceId}`)
    .then(response => response.data);  // Harder to read and maintain
}
```

## TypeScript Best Practices

1. **Use Strict TypeScript**: Enable strict mode in tsconfig.json
2. **Define Interfaces**: Create clear interface definitions for all data structures
3. **Avoid `any`**: Use proper types or `unknown` instead of `any`
4. **Zod for Runtime Validation**: Use Zod schemas to validate external data
5. **Type Guards**: Create type guard functions for complex type checking
6. **Error Handling**: Always use try-catch with proper error type checking
7. **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)

```typescript
// Good: Type-safe with Zod and interfaces
interface UserResponse {
  id: string;
  name: string;
  email: string;
  team?: string;
  active: boolean;
}

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  team: z.string().optional(),
  active: z.boolean()
});

type User = z.infer<typeof UserSchema>;

async function getUser(id: string): Promise<User> {
  const data = await apiCall(`/users/${id}`);
  return UserSchema.parse(data);  // Runtime validation
}

// Bad: Using any
async function getUser(id: string): Promise<any> {
  return await apiCall(`/users/${id}`);  // No type safety
}
```

## Package Configuration

### package.json

```json
{
  "name": "{service}-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for {Service} API integration",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.6.1",
    "axios": "^1.7.9",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Complete Example

```typescript
#!/usr/bin/env node
/**
 * MCP Server for Example Service.
 *
 * This server provides tools to interact with Example API, including user search,
 * project management, and data export capabilities.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";

// Constants
const API_BASE_URL = "https://api.example.com/v1";
const CHARACTER_LIMIT = 25000;

// Enums
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Zod schemas
const UserSearchInputSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search string to match against names/emails"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum results to return"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

type UserSearchInput = z.infer<typeof UserSearchInputSchema>;

// Shared utility functions
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      params,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "Error: Resource not found. Please check the ID is correct.";
        case 403:
          return "Error: Permission denied. You don't have access to this resource.";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        default:
          return `Error: API request failed with status ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    }
  }
  return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}

// Create MCP server instance
const server = new McpServer({
  name: "example-mcp",
  version: "1.0.0"
});

// Register tools
server.registerTool(
  "example_search_users",
  {
    title: "Search Example Users",
    description: `[Full description as shown above]`,
    inputSchema: UserSearchInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: UserSearchInput) => {
    // Implementation as shown above
  }
);

// Main function
// For stdio (local):
async function runStdio() {
  if (!process.env.EXAMPLE_API_KEY) {
    console.error("ERROR: EXAMPLE_API_KEY environment variable is required");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running via stdio");
}

// For streamable HTTP (remote):
async function runHTTP() {
  if (!process.env.EXAMPLE_API_KEY) {
    console.error("ERROR: EXAMPLE_API_KEY environment variable is required");
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, () => {
    console.error(`MCP server running on http://localhost:${port}/mcp`);
  });
}

// Choose transport based on environment
const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
```

---

## Advanced MCP Features

### Resource Registration

Expose data as resources for efficient, URI-based access:

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";

// Register a resource with URI template
server.registerResource(
  {
    uri: "file://documents/{name}",
    name: "Document Resource",
    description: "Access documents by name",
    mimeType: "text/plain"
  },
  async (uri: string) => {
    // Extract parameter from URI
    const match = uri.match(/^file:\/\/documents\/(.+)$/);
    if (!match) {
      throw new Error("Invalid URI format");
    }

    const documentName = match[1];
    const content = await loadDocument(documentName);

    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: content
      }]
    };
  }
);

// List available resources dynamically
server.registerResourceList(async () => {
  const documents = await getAvailableDocuments();
  return {
    resources: documents.map(doc => ({
      uri: `file://documents/${doc.name}`,
      name: doc.name,
      mimeType: "text/plain",
      description: doc.description
    }))
  };
});
```

**When to use Resources vs Tools:**
- **Resources**: For data access with simple URI-based parameters
- **Tools**: For complex operations requiring validation and business logic
- **Resources**: When data is relatively static or template-based
- **Tools**: When operations have side effects or complex workflows

### Transport Options

The TypeScript SDK supports two main transport mechanisms:

#### Streamable HTTP (Recommended for Remote Servers)

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  // Create new transport for each request (stateless, prevents request ID collisions)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000);
```

#### stdio (For Local Integrations)

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Transport selection:**
- **Streamable HTTP**: Web services, remote access, multiple clients
- **stdio**: Command-line tools, local development, subprocess integration

### Notification Support

Notify clients when server state changes:

```typescript
// Notify when tools list changes
server.notification({
  method: "notifications/tools/list_changed"
});

// Notify when resources change
server.notification({
  method: "notifications/resources/list_changed"
});
```

Use notifications sparingly - only when server capabilities genuinely change.

---

## Code Best Practices

### Code Composability and Reusability

Your implementation MUST prioritize composability and code reuse:

1. **Extract Common Functionality**:
   - Create reusable helper functions for operations used across multiple tools
   - Build shared API clients for HTTP requests instead of duplicating code
   - Centralize error handling logic in utility functions
   - Extract business logic into dedicated functions that can be composed
   - Extract shared markdown or JSON field selection & formatting functionality

2. **Avoid Duplication**:
   - NEVER copy-paste similar code between tools
   - If you find yourself writing similar logic twice, extract it into a function
   - Common operations like pagination, filtering, field selection, and formatting should be shared
   - Authentication/authorization logic should be centralized

## Building and Running

Always build your TypeScript code before running:

```bash
# Build the project
npm run build

# Run the server
npm start

# Development with auto-reload
npm run dev
```

Always ensure `npm run build` completes successfully before considering the implementation complete.

## Quality Checklist

Before finalizing your Node/TypeScript MCP server implementation, ensure:

### Strategic Design
- [ ] Tools enable complete workflows, not just API endpoint wrappers
- [ ] Tool names reflect natural task subdivisions
- [ ] Response formats optimize for agent context efficiency
- [ ] Human-readable identifiers used where appropriate
- [ ] Error messages guide agents toward correct usage

### Implementation Quality
- [ ] FOCUSED IMPLEMENTATION: Most important and valuable tools implemented
- [ ] All tools registered using `registerTool` with complete configuration
- [ ] All tools include `title`, `description`, `inputSchema`, and `annotations`
- [ ] Annotations correctly set (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- [ ] All tools use Zod schemas for runtime input validation with `.strict()` enforcement
- [ ] All Zod schemas have proper constraints and descriptive error messages
- [ ] All tools have comprehensive descriptions with explicit input/output types
- [ ] Descriptions include return value examples and complete schema documentation
- [ ] Error messages are clear, actionable, and educational

### TypeScript Quality
- [ ] TypeScript interfaces are defined for all data structures
- [ ] Strict TypeScript is enabled in tsconfig.json
- [ ] No use of `any` type - use `unknown` or proper types instead
- [ ] All async functions have explicit Promise<T> return types
- [ ] Error handling uses proper type guards (e.g., `axios.isAxiosError`, `z.ZodError`)

### Advanced Features (where applicable)
- [ ] Resources registered for appropriate data endpoints
- [ ] Appropriate transport configured (stdio or streamable HTTP)
- [ ] Notifications implemented for dynamic server capabilities
- [ ] Type-safe with SDK interfaces

### Project Configuration
- [ ] Package.json includes all necessary dependencies
- [ ] Build script produces working JavaScript in dist/ directory
- [ ] Main entry point is properly configured as dist/index.js
- [ ] Server name follows format: `{service}-mcp-server`
- [ ] tsconfig.json properly configured with strict mode

### Code Quality
- [ ] Pagination is properly implemented where applicable
- [ ] Large responses check CHARACTER_LIMIT constant and truncate with clear messages
- [ ] Filtering options are provided for potentially large result sets
- [ ] All network operations handle timeouts and connection errors gracefully
- [ ] Common functionality is extracted into reusable functions
- [ ] Return types are consistent across similar operations

### Testing and Build
- [ ] `npm run build` completes successfully without errors
- [ ] dist/index.js created and executable
- [ ] Server runs: `node dist/index.js --help`
- [ ] All imports resolve correctly
- [ ] Sample tool calls work as expected
```

---

## skills/shared-skills/mcp-builder/reference/python_mcp_server.md

`skills/shared-skills/mcp-builder/reference/python_mcp_server.md`

```markdown
# Python MCP Server Implementation Guide

## Overview

This document provides Python-specific best practices and examples for implementing MCP servers using the MCP Python SDK. It covers server setup, tool registration patterns, input validation with Pydantic, error handling, and complete working examples.

---

## Quick Reference

### Key Imports
```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
from enum import Enum
import httpx
```

### Server Initialization
```python
mcp = FastMCP("service_mcp")
```

### Tool Registration Pattern
```python
@mcp.tool(name="tool_name", annotations={...})
async def tool_function(params: InputModel) -> str:
    # Implementation
    pass
```

---

## MCP Python SDK and FastMCP

The official MCP Python SDK provides FastMCP, a high-level framework for building MCP servers. It provides:
- Automatic description and inputSchema generation from function signatures and docstrings
- Pydantic model integration for input validation
- Decorator-based tool registration with `@mcp.tool`

**For complete SDK documentation, use WebFetch to load:**
`https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`

## Server Naming Convention

Python MCP servers must follow this naming pattern:
- **Format**: `{service}_mcp` (lowercase with underscores)
- **Examples**: `github_mcp`, `jira_mcp`, `stripe_mcp`

The name should be:
- General (not tied to specific features)
- Descriptive of the service/API being integrated
- Easy to infer from the task description
- Without version numbers or dates

## Tool Implementation

### Tool Naming

Use snake_case for tool names (e.g., "search_users", "create_project", "get_channel_info") with clear, action-oriented names.

**Avoid Naming Conflicts**: Include the service context to prevent overlaps:
- Use "slack_send_message" instead of just "send_message"
- Use "github_create_issue" instead of just "create_issue"
- Use "asana_list_tasks" instead of just "list_tasks"

### Tool Structure with FastMCP

Tools are defined using the `@mcp.tool` decorator with Pydantic models for input validation:

```python
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

# Initialize the MCP server
mcp = FastMCP("example_mcp")

# Define Pydantic model for input validation
class ServiceToolInput(BaseModel):
    '''Input model for service tool operation.'''
    model_config = ConfigDict(
        str_strip_whitespace=True,  # Auto-strip whitespace from strings
        validate_assignment=True,    # Validate on assignment
        extra='forbid'              # Forbid extra fields
    )

    param1: str = Field(..., description="First parameter description (e.g., 'user123', 'project-abc')", min_length=1, max_length=100)
    param2: Optional[int] = Field(default=None, description="Optional integer parameter with constraints", ge=0, le=1000)
    tags: Optional[List[str]] = Field(default_factory=list, description="List of tags to apply", max_items=10)

@mcp.tool(
    name="service_tool_name",
    annotations={
        "title": "Human-Readable Tool Title",
        "readOnlyHint": True,     # Tool does not modify environment
        "destructiveHint": False,  # Tool does not perform destructive operations
        "idempotentHint": True,    # Repeated calls have no additional effect
        "openWorldHint": False     # Tool does not interact with external entities
    }
)
async def service_tool_name(params: ServiceToolInput) -> str:
    '''Tool description automatically becomes the 'description' field.

    This tool performs a specific operation on the service. It validates all inputs
    using the ServiceToolInput Pydantic model before processing.

    Args:
        params (ServiceToolInput): Validated input parameters containing:
            - param1 (str): First parameter description
            - param2 (Optional[int]): Optional parameter with default
            - tags (Optional[List[str]]): List of tags

    Returns:
        str: JSON-formatted response containing operation results
    '''
    # Implementation here
    pass
```

## Pydantic v2 Key Features

- Use `model_config` instead of nested `Config` class
- Use `field_validator` instead of deprecated `validator`
- Use `model_dump()` instead of deprecated `dict()`
- Validators require `@classmethod` decorator
- Type hints are required for validator methods

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

class CreateUserInput(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True
    )

    name: str = Field(..., description="User's full name", min_length=1, max_length=100)
    email: str = Field(..., description="User's email address", pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., description="User's age", ge=0, le=150)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Email cannot be empty")
        return v.lower()
```

## Response Format Options

Support multiple output formats for flexibility:

```python
from enum import Enum

class ResponseFormat(str, Enum):
    '''Output format for tool responses.'''
    MARKDOWN = "markdown"
    JSON = "json"

class UserSearchInput(BaseModel):
    query: str = Field(..., description="Search query")
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for machine-readable"
    )
```

**Markdown format**:
- Use headers, lists, and formatting for clarity
- Convert timestamps to human-readable format (e.g., "2024-01-15 10:30:00 UTC" instead of epoch)
- Show display names with IDs in parentheses (e.g., "@john.doe (U123456)")
- Omit verbose metadata (e.g., show only one profile image URL, not all sizes)
- Group related information logically

**JSON format**:
- Return complete, structured data suitable for programmatic processing
- Include all available fields and metadata
- Use consistent field names and types

## Pagination Implementation

For tools that list resources:

```python
class ListInput(BaseModel):
    limit: Optional[int] = Field(default=20, description="Maximum results to return", ge=1, le=100)
    offset: Optional[int] = Field(default=0, description="Number of results to skip for pagination", ge=0)

async def list_items(params: ListInput) -> str:
    # Make API request with pagination
    data = await api_request(limit=params.limit, offset=params.offset)

    # Return pagination info
    response = {
        "total": data["total"],
        "count": len(data["items"]),
        "offset": params.offset,
        "items": data["items"],
        "has_more": data["total"] > params.offset + len(data["items"]),
        "next_offset": params.offset + len(data["items"]) if data["total"] > params.offset + len(data["items"]) else None
    }
    return json.dumps(response, indent=2)
```

## Error Handling

Provide clear, actionable error messages:

```python
def _handle_api_error(e: Exception) -> str:
    '''Consistent error formatting across all tools.'''
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 404:
            return "Error: Resource not found. Please check the ID is correct."
        elif e.response.status_code == 403:
            return "Error: Permission denied. You don't have access to this resource."
        elif e.response.status_code == 429:
            return "Error: Rate limit exceeded. Please wait before making more requests."
        return f"Error: API request failed with status {e.response.status_code}"
    elif isinstance(e, httpx.TimeoutException):
        return "Error: Request timed out. Please try again."
    return f"Error: Unexpected error occurred: {type(e).__name__}"
```

## Shared Utilities

Extract common functionality into reusable functions:

```python
# Shared API request function
async def _make_api_request(endpoint: str, method: str = "GET", **kwargs) -> dict:
    '''Reusable function for all API calls.'''
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method,
            f"{API_BASE_URL}/{endpoint}",
            timeout=30.0,
            **kwargs
        )
        response.raise_for_status()
        return response.json()
```

## Async/Await Best Practices

Always use async/await for network requests and I/O operations:

```python
# Good: Async network request
async def fetch_data(resource_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_URL}/resource/{resource_id}")
        response.raise_for_status()
        return response.json()

# Bad: Synchronous request
def fetch_data(resource_id: str) -> dict:
    response = requests.get(f"{API_URL}/resource/{resource_id}")  # Blocks
    return response.json()
```

## Type Hints

Use type hints throughout:

```python
from typing import Optional, List, Dict, Any

async def get_user(user_id: str) -> Dict[str, Any]:
    data = await fetch_user(user_id)
    return {"id": data["id"], "name": data["name"]}
```

## Tool Docstrings

Every tool must have comprehensive docstrings with explicit type information:

```python
async def search_users(params: UserSearchInput) -> str:
    '''
    Search for users in the Example system by name, email, or team.

    This tool searches across all user profiles in the Example platform,
    supporting partial matches and various search filters. It does NOT
    create or modify users, only searches existing ones.

    Args:
        params (UserSearchInput): Validated input parameters containing:
            - query (str): Search string to match against names/emails (e.g., "john", "@example.com", "team:marketing")
            - limit (Optional[int]): Maximum results to return, between 1-100 (default: 20)
            - offset (Optional[int]): Number of results to skip for pagination (default: 0)

    Returns:
        str: JSON-formatted string containing search results with the following schema:

        Success response:
        {
            "total": int,           # Total number of matches found
            "count": int,           # Number of results in this response
            "offset": int,          # Current pagination offset
            "users": [
                {
                    "id": str,      # User ID (e.g., "U123456789")
                    "name": str,    # Full name (e.g., "John Doe")
                    "email": str,   # Email address (e.g., "john@example.com")
                    "team": str     # Team name (e.g., "Marketing") - optional
                }
            ]
        }

        Error response:
        "Error: <error message>" or "No users found matching '<query>'"

    Examples:
        - Use when: "Find all marketing team members" -> params with query="team:marketing"
        - Use when: "Search for John's account" -> params with query="john"
        - Don't use when: You need to create a user (use example_create_user instead)
        - Don't use when: You have a user ID and need full details (use example_get_user instead)

    Error Handling:
        - Input validation errors are handled by Pydantic model
        - Returns "Error: Rate limit exceeded" if too many requests (429 status)
        - Returns "Error: Invalid API authentication" if API key is invalid (401 status)
        - Returns formatted list of results or "No users found matching 'query'"
    '''
```

## Complete Example

See below for a complete Python MCP server example:

```python
#!/usr/bin/env python3
'''
MCP Server for Example Service.

This server provides tools to interact with Example API, including user search,
project management, and data export capabilities.
'''

from typing import Optional, List, Dict, Any
from enum import Enum
import httpx
from pydantic import BaseModel, Field, field_validator, ConfigDict
from mcp.server.fastmcp import FastMCP

# Initialize the MCP server
mcp = FastMCP("example_mcp")

# Constants
API_BASE_URL = "https://api.example.com/v1"

# Enums
class ResponseFormat(str, Enum):
    '''Output format for tool responses.'''
    MARKDOWN = "markdown"
    JSON = "json"

# Pydantic Models for Input Validation
class UserSearchInput(BaseModel):
    '''Input model for user search operations.'''
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True
    )

    query: str = Field(..., description="Search string to match against names/emails", min_length=2, max_length=200)
    limit: Optional[int] = Field(default=20, description="Maximum results to return", ge=1, le=100)
    offset: Optional[int] = Field(default=0, description="Number of results to skip for pagination", ge=0)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN, description="Output format")

    @field_validator('query')
    @classmethod
    def validate_query(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Query cannot be empty or whitespace only")
        return v.strip()

# Shared utility functions
async def _make_api_request(endpoint: str, method: str = "GET", **kwargs) -> dict:
    '''Reusable function for all API calls.'''
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method,
            f"{API_BASE_URL}/{endpoint}",
            timeout=30.0,
            **kwargs
        )
        response.raise_for_status()
        return response.json()

def _handle_api_error(e: Exception) -> str:
    '''Consistent error formatting across all tools.'''
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 404:
            return "Error: Resource not found. Please check the ID is correct."
        elif e.response.status_code == 403:
            return "Error: Permission denied. You don't have access to this resource."
        elif e.response.status_code == 429:
            return "Error: Rate limit exceeded. Please wait before making more requests."
        return f"Error: API request failed with status {e.response.status_code}"
    elif isinstance(e, httpx.TimeoutException):
        return "Error: Request timed out. Please try again."
    return f"Error: Unexpected error occurred: {type(e).__name__}"

# Tool definitions
@mcp.tool(
    name="example_search_users",
    annotations={
        "title": "Search Example Users",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def example_search_users(params: UserSearchInput) -> str:
    '''Search for users in the Example system by name, email, or team.

    [Full docstring as shown above]
    '''
    try:
        # Make API request using validated parameters
        data = await _make_api_request(
            "users/search",
            params={
                "q": params.query,
                "limit": params.limit,
                "offset": params.offset
            }
        )

        users = data.get("users", [])
        total = data.get("total", 0)

        if not users:
            return f"No users found matching '{params.query}'"

        # Format response based on requested format
        if params.response_format == ResponseFormat.MARKDOWN:
            lines = [f"# User Search Results: '{params.query}'", ""]
            lines.append(f"Found {total} users (showing {len(users)})")
            lines.append("")

            for user in users:
                lines.append(f"## {user['name']} ({user['id']})")
                lines.append(f"- **Email**: {user['email']}")
                if user.get('team'):
                    lines.append(f"- **Team**: {user['team']}")
                lines.append("")

            return "\n".join(lines)

        else:
            # Machine-readable JSON format
            import json
            response = {
                "total": total,
                "count": len(users),
                "offset": params.offset,
                "users": users
            }
            return json.dumps(response, indent=2)

    except Exception as e:
        return _handle_api_error(e)

if __name__ == "__main__":
    mcp.run()
```

---

## Advanced FastMCP Features

### Context Parameter Injection

FastMCP can automatically inject a `Context` parameter into tools for advanced capabilities like logging, progress reporting, resource reading, and user interaction:

```python
from mcp.server.fastmcp import FastMCP, Context

mcp = FastMCP("example_mcp")

@mcp.tool()
async def advanced_search(query: str, ctx: Context) -> str:
    '''Advanced tool with context access for logging and progress.'''

    # Report progress for long operations
    await ctx.report_progress(0.25, "Starting search...")

    # Log information for debugging
    await ctx.log_info("Processing query", {"query": query, "timestamp": datetime.now()})

    # Perform search
    results = await search_api(query)
    await ctx.report_progress(0.75, "Formatting results...")

    # Access server configuration
    server_name = ctx.fastmcp.name

    return format_results(results)

@mcp.tool()
async def interactive_tool(resource_id: str, ctx: Context) -> str:
    '''Tool that can request additional input from users.'''

    # Request sensitive information when needed
    api_key = await ctx.elicit(
        prompt="Please provide your API key:",
        input_type="password"
    )

    # Use the provided key
    return await api_call(resource_id, api_key)
```

**Context capabilities:**
- `ctx.report_progress(progress, message)` - Report progress for long operations
- `ctx.log_info(message, data)` / `ctx.log_error()` / `ctx.log_debug()` - Logging
- `ctx.elicit(prompt, input_type)` - Request input from users
- `ctx.fastmcp.name` - Access server configuration
- `ctx.read_resource(uri)` - Read MCP resources

### Resource Registration

Expose data as resources for efficient, template-based access:

```python
@mcp.resource("file://documents/{name}")
async def get_document(name: str) -> str:
    '''Expose documents as MCP resources.

    Resources are useful for static or semi-static data that doesn't
    require complex parameters. They use URI templates for flexible access.
    '''
    document_path = f"./handbook/{name}"
    with open(document_path, "r") as f:
        return f.read()

@mcp.resource("config://settings/{key}")
async def get_setting(key: str, ctx: Context) -> str:
    '''Expose configuration as resources with context.'''
    settings = await load_settings()
    return json.dumps(settings.get(key, {}))
```

**When to use Resources vs Tools:**
- **Resources**: For data access with simple parameters (URI templates)
- **Tools**: For complex operations with validation and business logic

### Structured Output Types

FastMCP supports multiple return types beyond strings:

```python
from typing import TypedDict
from dataclasses import dataclass
from pydantic import BaseModel

# TypedDict for structured returns
class UserData(TypedDict):
    id: str
    name: str
    email: str

@mcp.tool()
async def get_user_typed(user_id: str) -> UserData:
    '''Returns structured data - FastMCP handles serialization.'''
    return {"id": user_id, "name": "John Doe", "email": "john@example.com"}

# Pydantic models for complex validation
class DetailedUser(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    metadata: Dict[str, Any]

@mcp.tool()
async def get_user_detailed(user_id: str) -> DetailedUser:
    '''Returns Pydantic model - automatically generates schema.'''
    user = await fetch_user(user_id)
    return DetailedUser(**user)
```

### Lifespan Management

Initialize resources that persist across requests:

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def app_lifespan():
    '''Manage resources that live for the server's lifetime.'''
    # Initialize connections, load config, etc.
    db = await connect_to_database()
    config = load_configuration()

    # Make available to all tools
    yield {"db": db, "config": config}

    # Cleanup on shutdown
    await db.close()

mcp = FastMCP("example_mcp", lifespan=app_lifespan)

@mcp.tool()
async def query_data(query: str, ctx: Context) -> str:
    '''Access lifespan resources through context.'''
    db = ctx.request_context.lifespan_state["db"]
    results = await db.query(query)
    return format_results(results)
```

### Transport Options

FastMCP supports two main transport mechanisms:

```python
# stdio transport (for local tools) - default
if __name__ == "__main__":
    mcp.run()

# Streamable HTTP transport (for remote servers)
if __name__ == "__main__":
    mcp.run(transport="streamable_http", port=8000)
```

**Transport selection:**
- **stdio**: Command-line tools, local integrations, subprocess execution
- **Streamable HTTP**: Web services, remote access, multiple clients

---

## Code Best Practices

### Code Composability and Reusability

Your implementation MUST prioritize composability and code reuse:

1. **Extract Common Functionality**:
   - Create reusable helper functions for operations used across multiple tools
   - Build shared API clients for HTTP requests instead of duplicating code
   - Centralize error handling logic in utility functions
   - Extract business logic into dedicated functions that can be composed
   - Extract shared markdown or JSON field selection & formatting functionality

2. **Avoid Duplication**:
   - NEVER copy-paste similar code between tools
   - If you find yourself writing similar logic twice, extract it into a function
   - Common operations like pagination, filtering, field selection, and formatting should be shared
   - Authentication/authorization logic should be centralized

### Python-Specific Best Practices

1. **Use Type Hints**: Always include type annotations for function parameters and return values
2. **Pydantic Models**: Define clear Pydantic models for all input validation
3. **Avoid Manual Validation**: Let Pydantic handle input validation with constraints
4. **Proper Imports**: Group imports (standard library, third-party, local)
5. **Error Handling**: Use specific exception types (httpx.HTTPStatusError, not generic Exception)
6. **Async Context Managers**: Use `async with` for resources that need cleanup
7. **Constants**: Define module-level constants in UPPER_CASE

## Quality Checklist

Before finalizing your Python MCP server implementation, ensure:

### Strategic Design
- [ ] Tools enable complete workflows, not just API endpoint wrappers
- [ ] Tool names reflect natural task subdivisions
- [ ] Response formats optimize for agent context efficiency
- [ ] Human-readable identifiers used where appropriate
- [ ] Error messages guide agents toward correct usage

### Implementation Quality
- [ ] FOCUSED IMPLEMENTATION: Most important and valuable tools implemented
- [ ] All tools have descriptive names and documentation
- [ ] Return types are consistent across similar operations
- [ ] Error handling is implemented for all external calls
- [ ] Server name follows format: `{service}_mcp`
- [ ] All network operations use async/await
- [ ] Common functionality is extracted into reusable functions
- [ ] Error messages are clear, actionable, and educational
- [ ] Outputs are properly validated and formatted

### Tool Configuration
- [ ] All tools implement 'name' and 'annotations' in the decorator
- [ ] Annotations correctly set (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- [ ] All tools use Pydantic BaseModel for input validation with Field() definitions
- [ ] All Pydantic Fields have explicit types and descriptions with constraints
- [ ] All tools have comprehensive docstrings with explicit input/output types
- [ ] Docstrings include complete schema structure for dict/JSON returns
- [ ] Pydantic models handle input validation (no manual validation needed)

### Advanced Features (where applicable)
- [ ] Context injection used for logging, progress, or elicitation
- [ ] Resources registered for appropriate data endpoints
- [ ] Lifespan management implemented for persistent connections
- [ ] Structured output types used (TypedDict, Pydantic models)
- [ ] Appropriate transport configured (stdio or streamable HTTP)

### Code Quality
- [ ] File includes proper imports including Pydantic imports
- [ ] Pagination is properly implemented where applicable
- [ ] Filtering options are provided for potentially large result sets
- [ ] All async functions are properly defined with `async def`
- [ ] HTTP client usage follows async patterns with proper context managers
- [ ] Type hints are used throughout the code
- [ ] Constants are defined at module level in UPPER_CASE

### Testing
- [ ] Server runs successfully: `python your_server.py --help`
- [ ] All imports resolve correctly
- [ ] Sample tool calls work as expected
- [ ] Error scenarios handled gracefully
```

---

## skills/shared-skills/mcp-builder/scripts/connections.py

`skills/shared-skills/mcp-builder/scripts/connections.py`

```python
"""Lightweight connection handling for MCP servers."""

from abc import ABC, abstractmethod
from contextlib import AsyncExitStack
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.sse import sse_client
from mcp.client.stdio import stdio_client
from mcp.client.streamable_http import streamablehttp_client


class MCPConnection(ABC):
    """Base class for MCP server connections."""

    def __init__(self):
        self.session = None
        self._stack = None

    @abstractmethod
    def _create_context(self):
        """Create the connection context based on connection type."""

    async def __aenter__(self):
        """Initialize MCP server connection."""
        self._stack = AsyncExitStack()
        await self._stack.__aenter__()

        try:
            ctx = self._create_context()
            result = await self._stack.enter_async_context(ctx)

            if len(result) == 2:
                read, write = result
            elif len(result) == 3:
                read, write, _ = result
            else:
                raise ValueError(f"Unexpected context result: {result}")

            session_ctx = ClientSession(read, write)
            self.session = await self._stack.enter_async_context(session_ctx)
            await self.session.initialize()
            return self
        except BaseException:
            await self._stack.__aexit__(None, None, None)
            raise

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up MCP server connection resources."""
        if self._stack:
            await self._stack.__aexit__(exc_type, exc_val, exc_tb)
        self.session = None
        self._stack = None

    async def list_tools(self) -> list[dict[str, Any]]:
        """Retrieve available tools from the MCP server."""
        response = await self.session.list_tools()
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "input_schema": tool.inputSchema,
            }
            for tool in response.tools
        ]

    async def call_tool(self, tool_name: str, arguments: dict[str, Any]) -> Any:
        """Call a tool on the MCP server with provided arguments."""
        result = await self.session.call_tool(tool_name, arguments=arguments)
        return result.content


class MCPConnectionStdio(MCPConnection):
    """MCP connection using standard input/output."""

    def __init__(self, command: str, args: list[str] = None, env: dict[str, str] = None):
        super().__init__()
        self.command = command
        self.args = args or []
        self.env = env

    def _create_context(self):
        return stdio_client(
            StdioServerParameters(command=self.command, args=self.args, env=self.env)
        )


class MCPConnectionSSE(MCPConnection):
    """MCP connection using Server-Sent Events."""

    def __init__(self, url: str, headers: dict[str, str] = None):
        super().__init__()
        self.url = url
        self.headers = headers or {}

    def _create_context(self):
        return sse_client(url=self.url, headers=self.headers)


class MCPConnectionHTTP(MCPConnection):
    """MCP connection using Streamable HTTP."""

    def __init__(self, url: str, headers: dict[str, str] = None):
        super().__init__()
        self.url = url
        self.headers = headers or {}

    def _create_context(self):
        return streamablehttp_client(url=self.url, headers=self.headers)


def create_connection(
    transport: str,
    command: str = None,
    args: list[str] = None,
    env: dict[str, str] = None,
    url: str = None,
    headers: dict[str, str] = None,
) -> MCPConnection:
    """Factory function to create the appropriate MCP connection.

    Args:
        transport: Connection type ("stdio", "sse", or "http")
        command: Command to run (stdio only)
        args: Command arguments (stdio only)
        env: Environment variables (stdio only)
        url: Server URL (sse and http only)
        headers: HTTP headers (sse and http only)

    Returns:
        MCPConnection instance
    """
    transport = transport.lower()

    if transport == "stdio":
        if not command:
            raise ValueError("Command is required for stdio transport")
        return MCPConnectionStdio(command=command, args=args, env=env)

    elif transport == "sse":
        if not url:
            raise ValueError("URL is required for sse transport")
        return MCPConnectionSSE(url=url, headers=headers)

    elif transport in ["http", "streamable_http", "streamable-http"]:
        if not url:
            raise ValueError("URL is required for http transport")
        return MCPConnectionHTTP(url=url, headers=headers)

    else:
        raise ValueError(f"Unsupported transport type: {transport}. Use 'stdio', 'sse', or 'http'")

```

---

## skills/shared-skills/mcp-builder/scripts/evaluation.py

`skills/shared-skills/mcp-builder/scripts/evaluation.py`

```python
"""MCP Server Evaluation Harness

This script evaluates MCP servers by running test questions against them using Claude.
"""

import argparse
import asyncio
import json
import re
import sys
import time
import traceback
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from anthropic import Anthropic

from connections import create_connection

EVALUATION_PROMPT = """You are an AI assistant with access to tools.

When given a task, you MUST:
1. Use the available tools to complete the task
2. Provide summary of each step in your approach, wrapped in <summary> tags
3. Provide feedback on the tools provided, wrapped in <feedback> tags
4. Provide your final response, wrapped in <response> tags

Summary Requirements:
- In your <summary> tags, you must explain:
  - The steps you took to complete the task
  - Which tools you used, in what order, and why
  - The inputs you provided to each tool
  - The outputs you received from each tool
  - A summary for how you arrived at the response

Feedback Requirements:
- In your <feedback> tags, provide constructive feedback on the tools:
  - Comment on tool names: Are they clear and descriptive?
  - Comment on input parameters: Are they well-documented? Are required vs optional parameters clear?
  - Comment on descriptions: Do they accurately describe what the tool does?
  - Comment on any errors encountered during tool usage: Did the tool fail to execute? Did the tool return too many tokens?
  - Identify specific areas for improvement and explain WHY they would help
  - Be specific and actionable in your suggestions

Response Requirements:
- Your response should be concise and directly address what was asked
- Always wrap your final response in <response> tags
- If you cannot solve the task return <response>NOT_FOUND</response>
- For numeric responses, provide just the number
- For IDs, provide just the ID
- For names or text, provide the exact text requested
- Your response should go last"""


def parse_evaluation_file(file_path: Path) -> list[dict[str, Any]]:
    """Parse XML evaluation file with qa_pair elements."""
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        evaluations = []

        for qa_pair in root.findall(".//qa_pair"):
            question_elem = qa_pair.find("question")
            answer_elem = qa_pair.find("answer")

            if question_elem is not None and answer_elem is not None:
                evaluations.append({
                    "question": (question_elem.text or "").strip(),
                    "answer": (answer_elem.text or "").strip(),
                })

        return evaluations
    except Exception as e:
        print(f"Error parsing evaluation file {file_path}: {e}")
        return []


def extract_xml_content(text: str, tag: str) -> str | None:
    """Extract content from XML tags."""
    pattern = rf"<{tag}>(.*?)</{tag}>"
    matches = re.findall(pattern, text, re.DOTALL)
    return matches[-1].strip() if matches else None


async def agent_loop(
    client: Anthropic,
    model: str,
    question: str,
    tools: list[dict[str, Any]],
    connection: Any,
) -> tuple[str, dict[str, Any]]:
    """Run the agent loop with MCP tools."""
    messages = [{"role": "user", "content": question}]

    response = await asyncio.to_thread(
        client.messages.create,
        model=model,
        max_tokens=4096,
        system=EVALUATION_PROMPT,
        messages=messages,
        tools=tools,
    )

    messages.append({"role": "assistant", "content": response.content})

    tool_metrics = {}

    while response.stop_reason == "tool_use":
        tool_use = next(block for block in response.content if block.type == "tool_use")
        tool_name = tool_use.name
        tool_input = tool_use.input

        tool_start_ts = time.time()
        try:
            tool_result = await connection.call_tool(tool_name, tool_input)
            tool_response = json.dumps(tool_result) if isinstance(tool_result, (dict, list)) else str(tool_result)
        except Exception as e:
            tool_response = f"Error executing tool {tool_name}: {str(e)}\n"
            tool_response += traceback.format_exc()
        tool_duration = time.time() - tool_start_ts

        if tool_name not in tool_metrics:
            tool_metrics[tool_name] = {"count": 0, "durations": []}
        tool_metrics[tool_name]["count"] += 1
        tool_metrics[tool_name]["durations"].append(tool_duration)

        messages.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": tool_response,
            }]
        })

        response = await asyncio.to_thread(
            client.messages.create,
            model=model,
            max_tokens=4096,
            system=EVALUATION_PROMPT,
            messages=messages,
            tools=tools,
        )
        messages.append({"role": "assistant", "content": response.content})

    response_text = next(
        (block.text for block in response.content if hasattr(block, "text")),
        None,
    )
    return response_text, tool_metrics


async def evaluate_single_task(
    client: Anthropic,
    model: str,
    qa_pair: dict[str, Any],
    tools: list[dict[str, Any]],
    connection: Any,
    task_index: int,
) -> dict[str, Any]:
    """Evaluate a single QA pair with the given tools."""
    start_time = time.time()

    print(f"Task {task_index + 1}: Running task with question: {qa_pair['question']}")
    response, tool_metrics = await agent_loop(client, model, qa_pair["question"], tools, connection)

    response_value = extract_xml_content(response, "response")
    summary = extract_xml_content(response, "summary")
    feedback = extract_xml_content(response, "feedback")

    duration_seconds = time.time() - start_time

    return {
        "question": qa_pair["question"],
        "expected": qa_pair["answer"],
        "actual": response_value,
        "score": int(response_value == qa_pair["answer"]) if response_value else 0,
        "total_duration": duration_seconds,
        "tool_calls": tool_metrics,
        "num_tool_calls": sum(len(metrics["durations"]) for metrics in tool_metrics.values()),
        "summary": summary,
        "feedback": feedback,
    }


REPORT_HEADER = """
# Evaluation Report

## Summary

- **Accuracy**: {correct}/{total} ({accuracy:.1f}%)
- **Average Task Duration**: {average_duration_s:.2f}s
- **Average Tool Calls per Task**: {average_tool_calls:.2f}
- **Total Tool Calls**: {total_tool_calls}

---
"""

TASK_TEMPLATE = """
### Task {task_num}

**Question**: {question}
**Ground Truth Answer**: `{expected_answer}`
**Actual Answer**: `{actual_answer}`
**Correct**: {correct_indicator}
**Duration**: {total_duration:.2f}s
**Tool Calls**: {tool_calls}

**Summary**
{summary}

**Feedback**
{feedback}

---
"""


async def run_evaluation(
    eval_path: Path,
    connection: Any,
    model: str = "claude-3-7-sonnet-20250219",
) -> str:
    """Run evaluation with MCP server tools."""
    print("🚀 Starting Evaluation")

    client = Anthropic()

    tools = await connection.list_tools()
    print(f"📋 Loaded {len(tools)} tools from MCP server")

    qa_pairs = parse_evaluation_file(eval_path)
    print(f"📋 Loaded {len(qa_pairs)} evaluation tasks")

    results = []
    for i, qa_pair in enumerate(qa_pairs):
        print(f"Processing task {i + 1}/{len(qa_pairs)}")
        result = await evaluate_single_task(client, model, qa_pair, tools, connection, i)
        results.append(result)

    correct = sum(r["score"] for r in results)
    accuracy = (correct / len(results)) * 100 if results else 0
    average_duration_s = sum(r["total_duration"] for r in results) / len(results) if results else 0
    average_tool_calls = sum(r["num_tool_calls"] for r in results) / len(results) if results else 0
    total_tool_calls = sum(r["num_tool_calls"] for r in results)

    report = REPORT_HEADER.format(
        correct=correct,
        total=len(results),
        accuracy=accuracy,
        average_duration_s=average_duration_s,
        average_tool_calls=average_tool_calls,
        total_tool_calls=total_tool_calls,
    )

    report += "".join([
        TASK_TEMPLATE.format(
            task_num=i + 1,
            question=qa_pair["question"],
            expected_answer=qa_pair["answer"],
            actual_answer=result["actual"] or "N/A",
            correct_indicator="✅" if result["score"] else "❌",
            total_duration=result["total_duration"],
            tool_calls=json.dumps(result["tool_calls"], indent=2),
            summary=result["summary"] or "N/A",
            feedback=result["feedback"] or "N/A",
        )
        for i, (qa_pair, result) in enumerate(zip(qa_pairs, results))
    ])

    return report


def parse_headers(header_list: list[str]) -> dict[str, str]:
    """Parse header strings in format 'Key: Value' into a dictionary."""
    headers = {}
    if not header_list:
        return headers

    for header in header_list:
        if ":" in header:
            key, value = header.split(":", 1)
            headers[key.strip()] = value.strip()
        else:
            print(f"Warning: Ignoring malformed header: {header}")
    return headers


def parse_env_vars(env_list: list[str]) -> dict[str, str]:
    """Parse environment variable strings in format 'KEY=VALUE' into a dictionary."""
    env = {}
    if not env_list:
        return env

    for env_var in env_list:
        if "=" in env_var:
            key, value = env_var.split("=", 1)
            env[key.strip()] = value.strip()
        else:
            print(f"Warning: Ignoring malformed environment variable: {env_var}")
    return env


async def main():
    parser = argparse.ArgumentParser(
        description="Evaluate MCP servers using test questions",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Evaluate a local stdio MCP server
  python evaluation.py -t stdio -c python -a my_server.py eval.xml

  # Evaluate an SSE MCP server
  python evaluation.py -t sse -u https://example.com/mcp -H "Authorization: Bearer token" eval.xml

  # Evaluate an HTTP MCP server with custom model
  python evaluation.py -t http -u https://example.com/mcp -m claude-3-5-sonnet-20241022 eval.xml
        """,
    )

    parser.add_argument("eval_file", type=Path, help="Path to evaluation XML file")
    parser.add_argument("-t", "--transport", choices=["stdio", "sse", "http"], default="stdio", help="Transport type (default: stdio)")
    parser.add_argument("-m", "--model", default="claude-3-7-sonnet-20250219", help="Claude model to use (default: claude-3-7-sonnet-20250219)")

    stdio_group = parser.add_argument_group("stdio options")
    stdio_group.add_argument("-c", "--command", help="Command to run MCP server (stdio only)")
    stdio_group.add_argument("-a", "--args", nargs="+", help="Arguments for the command (stdio only)")
    stdio_group.add_argument("-e", "--env", nargs="+", help="Environment variables in KEY=VALUE format (stdio only)")

    remote_group = parser.add_argument_group("sse/http options")
    remote_group.add_argument("-u", "--url", help="MCP server URL (sse/http only)")
    remote_group.add_argument("-H", "--header", nargs="+", dest="headers", help="HTTP headers in 'Key: Value' format (sse/http only)")

    parser.add_argument("-o", "--output", type=Path, help="Output file for evaluation report (default: stdout)")

    args = parser.parse_args()

    if not args.eval_file.exists():
        print(f"Error: Evaluation file not found: {args.eval_file}")
        sys.exit(1)

    headers = parse_headers(args.headers) if args.headers else None
    env_vars = parse_env_vars(args.env) if args.env else None

    try:
        connection = create_connection(
            transport=args.transport,
            command=args.command,
            args=args.args,
            env=env_vars,
            url=args.url,
            headers=headers,
        )
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)

    print(f"🔗 Connecting to MCP server via {args.transport}...")

    async with connection:
        print("✅ Connected successfully")
        report = await run_evaluation(args.eval_file, connection, args.model)

        if args.output:
            args.output.write_text(report)
            print(f"\n✅ Report saved to {args.output}")
        else:
            print("\n" + report)


if __name__ == "__main__":
    asyncio.run(main())

```

---

## skills/shared-skills/mcp-builder/scripts/example_evaluation.xml

`skills/shared-skills/mcp-builder/scripts/example_evaluation.xml`

```xml
<evaluation>
   <qa_pair>
      <question>Calculate the compound interest on $10,000 invested at 5% annual interest rate, compounded monthly for 3 years. What is the final amount in dollars (rounded to 2 decimal places)?</question>
      <answer>11614.72</answer>
   </qa_pair>
   <qa_pair>
      <question>A projectile is launched at a 45-degree angle with an initial velocity of 50 m/s. Calculate the total distance (in meters) it has traveled from the launch point after 2 seconds, assuming g=9.8 m/s². Round to 2 decimal places.</question>
      <answer>87.25</answer>
   </qa_pair>
   <qa_pair>
      <question>A sphere has a volume of 500 cubic meters. Calculate its surface area in square meters. Round to 2 decimal places.</question>
      <answer>304.65</answer>
   </qa_pair>
   <qa_pair>
      <question>Calculate the population standard deviation of this dataset: [12, 15, 18, 22, 25, 30, 35]. Round to 2 decimal places.</question>
      <answer>7.61</answer>
   </qa_pair>
   <qa_pair>
      <question>Calculate the pH of a solution with a hydrogen ion concentration of 3.5 × 10^-5 M. Round to 2 decimal places.</question>
      <answer>4.46</answer>
   </qa_pair>
</evaluation>

```

---

## skills/shared-skills/mcp-builder/scripts/requirements.txt

`skills/shared-skills/mcp-builder/scripts/requirements.txt`

```
anthropic>=0.39.0
mcp>=1.1.0

```

---

## skills/shared-skills/rule-creator/SKILL.md

`skills/shared-skills/rule-creator/SKILL.md`

```markdown
---
name: rule-creator
description: 指导在本仓创建或更新 Agent 规则（Rule）。当用户希望新增规则、编写 .mdc 规则文件、或区分项目规则与共享规则并完成登记时使用。须先明确是 project-rule（仅 apps 开发）还是 shared-rule（跨项目/平台共用）。
---

# 规则创建器

本技能指导在 `.agents/rules/` 下创建或更新规则文件（`.mdc`），并完成登记串联。规则编写方法见 [.agents/handbook/ai-engineering/how-to-write-rules.md](../../../handbook/ai-engineering/how-to-write-rules.md)；创建后的登记清单见 [.agents/handbook/ai-engineering/skill-rule-creation-checklist.md](../../../handbook/ai-engineering/skill-rule-creation-checklist.md)。

---

## 第一步：区分规则类型

在动笔前必须确定规则属于哪一类，否则会放错目录、漏登记。

| 类型 | 目录 | 适用场景 | 登记位置 |
|------|------|----------|----------|
| **项目规则（project-rule）** | `.agents/rules/project-rules/` | 仅本仓 **apps** 开发：编码、结构、API、路由、组件、状态、样式、文档、测试等；或与某 project-skill 绑定的语义触发规则（`skill-*.mdc`） | [project-rules/README.md](../../../rules/project-rules/README.md) |
| **共享规则（shared-rule）** | `.agents/rules/shared-rules/` | **跨项目或跨平台**共用：如回答语言、通用编码约定、工具链约定等，不限定本仓 apps | [shared-rules/README.md](../../../rules/shared-rules/README.md) |

**判断方式**：
- 若规则只约束「本仓库 apps 下的 Vue/API/路由/组件…」→ **project-rule**
- 若规则约束「所有使用本规则库的项目」或「与具体业务无关的通用约定」→ **shared-rule**

---

## 第二步：按类型选择路径与命名

### 项目规则（project-rule）

- **路径**：`.agents/rules/project-rules/<文件名>.mdc`
- **命名约定**：
  - **编号规范**：与现有 01–11 同类的主题用 `NN-<kebab-topic>.mdc`（如 `12-xxx-guide.mdc`），并在 README 中加入「规范模块列表」。
  - **Skill 语义触发**：与某 project-skill 绑定、由 Cursor 按语义注入的用 `skill-<技能名>.mdc`（如 `skill-create-api.mdc`），并在 README 的「Skills 语义触发规则」表中登记。

### 共享规则（shared-rule）

- **路径**：`.agents/rules/shared-rules/<文件名>.mdc`
- **命名**：建议 `kebab-case`，语义清晰（如 `language-chinese.mdc`）。

---

## 第三步：编写规则内容（百科式结构）

规则应**可检索、可执行**，避免空泛禁令。按 [how-to-write-rules.md](../../../handbook/ai-engineering/how-to-write-rules.md) 的约定撰写：

1. **标题**：具体、可检索（如「API 响应体统一格式」而非「API 规范」）。
2. **描述（description）**：1–2 句写清适用场景 + 核心约束 + 关键入口；`.mdc` 中放在 frontmatter 的 `description`。
3. **正文**：概述与最高原则、关键文件与入口、常见改动场景与推荐做法、与其他规则/模块的关系、边界与例外（可选）。

### .mdc frontmatter 示例

**项目规则**（可带 globs 限定生效范围）：

```yaml
---
alwaysApply: false
description: <1–2 句：适用场景 + 核心约束 + 关键入口>
globs:           # 可选；不写则依赖 Cursor 语义注入
  - "apps/**/src/api/**/*.ts"
  - "apps/**/src/views/**/*.vue"
---
```

**共享规则**（多用于全局约定，可 `alwaysApply: true`）：

```yaml
---
description: <1–2 句摘要>
alwaysApply: true   # 可选，按需
---
```

---

## 第四步：登记（串联清单）

创建或重命名规则后，**必须**在对应 README 中登记，否则平台可能不加载或索引不到。

### 项目规则登记

1. 打开 [.agents/rules/project-rules/README.md](../../../rules/project-rules/README.md)。
2. **编号规范**：在「规范模块列表」中新增一条，链接到 `./<文件名>.mdc`；若新增了 12+ 编号，视需在「快速查找」表补一行。
3. **Skill 语义触发**：在「Skills 语义触发规则」表中新增一行：`| <文件名>.mdc | <对应 Skill> | <触发场景简述> |`。
4. **CLAUDE.md**（可选）：若 CLAUDE.md 的「项目规范（完整规则）」显式列举了各 .mdc，新增编号规则时需在该处补一条 `@.agents/rules/project-rules/<文件名>.mdc`。

### 共享规则登记

1. 打开 [.agents/rules/shared-rules/README.md](../../../rules/shared-rules/README.md)。
2. 在「已注册规则」表中新增一行：`| <文件名>.mdc | <简短说明> |`。

完整清单与可选步骤见 [skill-rule-creation-checklist.md](../../../handbook/ai-engineering/skill-rule-creation-checklist.md)。

---

## 第五步：自检（与 how-to-write-rules 一致）

- [ ] 标题具体、可检索，避免大而空的词
- [ ] description 写清：适用场景 + 核心原则 + 关键入口
- [ ] 正文含：最高原则、关键链接、常见改动范式、关联规则
- [ ] 以正向做法为主，少堆禁令
- [ ] 未写身份宣告、未指挥底层工具机制
- [ ] 关键路径存在且未在规则中过度复述代码
- [ ] 已按类型在 project-rules/README 或 shared-rules/README 中登记

---

## 参考

| 文档 | 说明 |
|------|------|
| [how-to-write-rules.md](../../../handbook/ai-engineering/how-to-write-rules.md) | 规则编写方法与黄金结构 |
| [skill-rule-creation-checklist.md](../../../handbook/ai-engineering/skill-rule-creation-checklist.md) | 规则创建后的登记串联清单 |
| [.agents/rules/README.md](../../../rules/README.md) | 规则目录与 project/shared 说明 |
| [project-rules/README.md](../../../rules/project-rules/README.md) | 项目规则索引与语义触发表 |
| [shared-rules/README.md](../../../rules/shared-rules/README.md) | 共享规则与已注册规则表 |

```

---

## skills/shared-skills/senior-prompt-engineer/SKILL.md

`skills/shared-skills/senior-prompt-engineer/SKILL.md`

```markdown
---
name: senior-prompt-engineer
description: 当用户需要设计或优化提示词、撰写系统提示/AI 指令、或应用高级提示工程实践时使用。涵盖角色与人格设定、结构化指令、少样本示例、约束与输出格式、思维链与分步推理；并贴合本仓库的 AGENTS.md、SKILL.md、Cursor 规则等产出物。
---

# 高级提示工程

在用户请求设计/优化提示、写系统提示、或提升与 AI 的指令质量时，按本技能的原则与流程输出可用的提示文案或改进建议，并优先考虑与本项目既有约定和技能体系对接。

## 本项目上下文

- **仓库**：speediance-web-monorepo（Vue/TypeScript 前端 monorepo，含 apps、packages、docs）。
- **技能体系**：技能在 `AGENTS.md` 中登记；实现位于 `.cursor/skills/`（如 frontend-code-review、smart-commit）或 `.claude/skills/`（如 mcp-builder、skill-creator）。技能通过 `name` + `description` 被识别，正文为执行说明。
- **项目约定**：常规交互与 commit 信息使用中文；若涉及多步任务或协议，可能遵循 RIPER-5 等用户规则。Commit 需符合 commitlint（Conventional Commits），subject 使用中文。
- **常用产出物**：面向 Agent 的系统提示、单条技能的 `SKILL.md`、`AGENTS.md` 中的 `<skill>` 条目、以及 Cursor 规则（`.cursor/rules/` 或 RULE.md）。为本项目撰写时，应明确产出物类型（系统提示 / SKILL / AGENTS 条目 / 规则），以便直接落地。
- **加载本机技能**：在终端运行 `npx openskills read <skill-name>` 可加载本机（项目）技能内容；`npx openskills list` 可列出当前可用的技能名称。技能来源包括 `.claude/skills/` 等；`.cursor/skills/` 下的技能在 Cursor 中也可通过 AGENTS.md 的 skill 列表被识别并读取。

## 使用场景

- 设计或改写面向 LLM 的系统提示（system prompt）
- 优化现有提示，提升清晰度、可控性与输出稳定性
- 为产品/技能撰写「何时使用、如何执行」类指令（含 SKILL.md 与 AGENTS.md 中的 description）
- 设计多轮对话流程或链式任务中的提示
- 需要明确输出格式、边界条件或角色设定时
- 为本项目新增或优化一条技能（与 skill-creator、现有技能结构对齐）

## 核心原则

### 1. 角色与人格（Persona）

在系统提示中明确「你是谁、你的目标、你的边界」：

- **角色**：用一两句话定义身份（如「你是一名专注 Vue 与 TypeScript 的前端代码审查助手」）。
- **目标**：主要帮助用户完成什么类型的任务。
- **边界**：不做什么、在何种情况下应拒绝或转交（如不生成侵权内容、不执行破坏性命令未经确认）。

避免模糊的「你是一个有帮助的助手」；具体角色能减少漂移并提高一致性。

### 2. 结构化指令

- **分块**：用标题、列表、步骤把长提示拆成「背景 → 任务 → 约束 → 输出要求」。
- **优先级**：关键约束放在显眼位置；必要时用「必须」「禁止」「可选」分级。
- **唯一性**：同一件事只说一处，避免前后矛盾或重复稀释重点。

### 3. 输入与输出约定

- **输入**：说明期望用户提供什么（如「变更文件列表」「需求描述」），以及缺失时如何应对。
- **输出**：明确格式（Markdown、代码块、表格、JSON 等）、语言（如「用中文回复」）、长度或结构（如「先结论再理由」）。
- **示例**：对复杂格式或易歧义的任务，在提示中给 1～2 个少样本示例（input → output），能显著提高稳定性。

### 4. 约束与安全

- 明确禁止项（如不编造依赖版本、不修改未提及的文件）。
- 对不可逆或高风险操作，要求「先说明计划，经确认后再执行」。
- 若与项目规范相关（如 commit 规范、目录结构），在提示中引用或简写，避免与项目冲突。

### 5. 思维链与分步（Chain-of-Thought）

对需要推理、多步或易漏步骤的任务：

- 在指令中要求「先简要说明步骤/计划，再给出最终答案或执行」。
- 或显式列出步骤 1、2、3…，让模型按顺序执行并在提示中注明「可省略已完成的步骤说明，但逻辑顺序不变」。

## 为本项目撰写时的要点

- **AGENTS.md**：新增或修改技能时，需在 `AGENTS.md` 的 `<available_skills>` 中提供 `<skill>` 条目，包含 `<name>`、`<description>`、`<location>`。description 应一句话说明「何时使用、解决什么问题」，便于 Agent 正确触发。
- **SKILL.md 结构**：与现有技能保持一致。顶部 YAML frontmatter 含 `name`、`description`；正文建议包含「使用场景」「流程/步骤」「约束」「输出格式」等区块；若有引用资源，使用相对路径（如 `references/xxx.md`）。
- **语言与规范**：用户未特别要求时，提示与说明用中文；若产出物会进入 commit 或对外文档，需符合项目约定（如 commit 中文 subject、Conventional Commits）。
- **与现有技能配合**：撰写或优化技能说明时，可参考并复用本仓库中已有技能的表达方式（如 `frontend-code-review` 的检查清单与分级、`smart-commit` 的格式与 type 表）。需要「新建技能」或「写 SKILL 结构」时，可结合 `skill-creator` 技能；需要「写 Cursor 规则」时，可结合 create-rule 类能力。

## 输出要求

当用户请求「写一个提示」或「优化这段提示」时：

1. **理解意图**：确认场景（系统提示 / 单次任务 / 多轮 / 与代码或项目集成）以及产出物类型（系统提示、SKILL.md、AGENTS 条目、Cursor 规则等）。
2. **给出成品**：直接输出可复用的完整提示文案（Markdown 或纯文本），便于用户粘贴到系统提示、AGENTS.md、或 SKILL.md。
3. **简要说明**：用几句话说明设计理由（如为何这样分步、为何强调某条约束），便于用户后续自行调整。
4. **语言**：若用户用中文提问，默认用中文撰写提示与说明；若用户明确要求英文提示，则输出英文。

## 本项目常用产出物速查

| 产出物 | 位置/用法 | 注意 |
|--------|-----------|------|
| 系统提示 | 粘贴到 Cursor/Claude 系统提示或对话 | 角色、约束、输出格式要完整 |
| SKILL.md | `.cursor/skills/<name>/` 或 `.claude/skills/<name>/` | 含 frontmatter、使用场景、步骤、约束 |
| AGENTS 技能条目 | `AGENTS.md` 内 `<available_skills>` | 一段话 description，与 SKILL 的 name 一致 |
| Cursor 规则 | `.cursor/rules/` 或 RULE.md | 见 create-rule 技能 |

## 检查清单（撰写或优化一条技能时）

- [ ] **name** 与 **description** 已定：description 能让人一眼判断「何时该用这条技能」。
- [ ] **使用场景** 已写：列出具体触发情形（如「用户请求提交代码」「用户请求审查前端变更」）。
- [ ] **步骤/流程** 可执行：Agent 按步骤即可完成，无歧义；必要时附带命令或示例。
- [ ] **约束与边界** 已写：禁止项、需确认再执行的操作、与项目规范（commit、目录）的衔接。
- [ ] **输出格式** 已约定：如「按 Critical/Warning/Suggestion 列出」「生成中文 commit message」。
- [ ] 若需在 AGENTS.md 登记：已准备好 `<name>`、`<description>`、`<location>` 且与 SKILL 一致。

## 示例（系统提示片段，贴合本项目）

```markdown
你是一名前端代码审查助手，专注 Vue 3、TypeScript、Pinia 与 Vue Router。

**目标**：根据用户提供的变更或文件，按项目检查清单给出结构化审查结果（Critical / Warning / Suggestion），并标明位置与修改建议。

**约束**：
- 仅审查 .vue、.ts、.tsx 及与路由/状态相关的文件；其他类型可简要说明「不在审查范围」。
- 不修改代码，只输出审查意见与建议。
- 若变更过大或文件过多，先列出拟审查文件清单，经用户确认后再逐项审查。

**输出格式**：按「文件路径 → 严重程度 → 规则/描述 → 建议」列出；结论与阻塞项放在最前。
```

## 与项目技能的配合

本仓库中已有技能（如 `frontend-code-review`、`smart-commit`、`skill-creator`）的 SKILL.md 即「提示工程」的落地形式：包含 name、description（触发条件）与正文（执行说明）。在为类似技能撰写或优化说明时，应参照既有技能的结构与表达习惯，并遵循上述原则（角色清晰、步骤明确、输出格式固定、约束显式）。若用户要新增技能或规则，可提示其结合 `skill-creator` 或 create-rule 技能，保证与项目技能体系一致。

```

---

## skills/shared-skills/skill-creator/.openskills.json

`skills/shared-skills/skill-creator/.openskills.json`

```json
{
  "source": "anthropics/skills",
  "sourceType": "git",
  "repoUrl": "https://github.com/anthropics/skills",
  "subpath": "skills/skill-creator",
  "installedAt": "2026-02-10T08:42:51.460Z"
}
```

---

## skills/shared-skills/skill-creator/LICENSE.txt

`skills/shared-skills/skill-creator/LICENSE.txt`

```

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

---

## skills/shared-skills/skill-creator/SKILL.md

`skills/shared-skills/skill-creator/SKILL.md`

```markdown
---
name: skill-creator
description: 指导如何创建有效的技能（公共技能或项目技能）。当用户希望创建新技能（或更新现有技能）以用专业知识、工作流或工具集成扩展 AI 能力时使用。须先区分是公共技能（shared-skills，跨项目/平台）还是项目技能（project-skills，仅本仓 apps），再按对应路径与登记流程执行。
license: Complete terms in LICENSE.txt
---

# 技能创建器

本技能提供创建有效技能的指导，**兼容两种技能类型**：公共技能（shared-skills）与项目技能（project-skills）。创建前须先确定类型，再按对应路径与登记步骤执行。

## 关于技能

技能是模块化、自包含的包，通过提供专业知识、工作流和工具来扩展 Claude 的能力。可将其视为特定领域或任务的「入门指南」——它们把 Claude 从通用智能体转变为具备模型难以完全掌握的流程知识的专用智能体。

### 技能能提供什么

1. **专用工作流** - 针对特定领域的多步骤流程
2. **工具集成** - 与特定文件格式或 API 协作的说明
3. **领域知识** - 公司专属知识、数据模式、业务逻辑
4. **捆绑资源** - 用于复杂与重复任务的脚本、参考与素材

## 核心原则

### 简洁优先

上下文窗口是共享资源。技能与系统提示、对话历史、其他技能的元数据以及用户真实请求一起占用上下文。

**默认假设：Claude 已经足够聪明。** 只补充 Claude 尚不具备的上下文。对每条信息都问：「Claude 真的需要这段解释吗？」「这段是否对得起它的 token 成本？」

优先用简洁示例而非冗长解释。

### 设定合适的自由度

根据任务的脆弱性与多变性匹配具体程度：

**高自由度（文字说明）**：当多种做法都成立、决策依赖上下文、或由启发式引导时使用。

**中自由度（伪代码或带参数的脚本）**：当存在偏好模式、允许一定变化、或配置影响行为时使用。

**低自由度（具体脚本、少量参数）**：当操作脆弱易错、一致性关键、或必须按特定顺序执行时使用。

把 Claude 想象成在一条路上探索：狭窄的桥需要明确护栏（低自由度），开阔地带则允许多条路线（高自由度）。

### 技能结构

每个技能由必需的 SKILL.md 与可选的捆绑资源组成：

```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter 元数据 (必需)
│   │   ├── name: (必需)
│   │   ├── description: (必需)
│   │   └── compatibility: (可选，很少需要)
│   └── Markdown 说明 (必需)
└── 捆绑资源 (可选)
    ├── scripts/          - 可执行代码 (Python/Bash 等)
    ├── references/       - 按需加载到上下文中的文档
    └── assets/           - 用于输出的文件 (模板、图标、字体等)
```

#### SKILL.md（必需）

每个 SKILL.md 包含：

- **Frontmatter**（YAML）：包含 `name`、`description`（必需），以及可选的 `license`、`metadata`、`compatibility`。只有 `name` 和 `description` 会被用来判断何时触发技能，因此要清晰、完整地说明技能是什么以及何时使用。`compatibility` 用于注明环境要求（目标产品、系统包等），多数技能不需要。
- **正文**（Markdown）：技能的使用说明与指导。仅在技能**触发后**才加载（若触发）。

#### 捆绑资源（可选）

##### 脚本（`scripts/`）

需要确定性或会被反复重写的任务，用可执行代码（Python/Bash 等）实现。

- **何时包含**：同一段代码被反复重写，或需要确定性时
- **示例**：`scripts/rotate_pdf.py` 用于 PDF 旋转
- **好处**：省 token、确定性高，可不加载到上下文直接执行
- **注意**：脚本有时仍需要被 Claude 读取以做补丁或环境适配

##### 参考（`references/`）

供 Claude 在工作与思考时按需加载的文档与参考材料。

- **何时包含**：Claude 在工作过程中需要查阅的文档
- **示例**：`references/finance.md` 财务 schema、`references/mnda.md` 公司 NDA 模板、`references/policies.md` 公司政策、`references/api_docs.md` API 说明
- **用途**：数据库 schema、API 文档、领域知识、公司政策、详细工作流指南
- **好处**：保持 SKILL.md 精简，仅在 Claude 认为需要时加载
- **建议**：若文件较大（>10k 词），在 SKILL.md 中提供 grep 搜索模式
- **避免重复**：信息只放在 SKILL.md 或参考文件之一，不要两处都有。详细内容优先放参考文件——这样 SKILL.md 精简且信息可被发现而不占满上下文。SKILL.md 只保留核心流程说明与工作流指导；详细参考、schema、示例移到 reference 文件。

##### 素材（`assets/`）

不打算加载到上下文中，而是在 Claude 产出里使用的文件。

- **何时包含**：技能需要会在最终产出里用到的文件
- **示例**：`assets/logo.png` 品牌素材、`assets/slides.pptx` PPT 模板、`assets/frontend-template/` 前端样板、`assets/font.ttf` 字体
- **用途**：模板、图片、图标、样板代码、字体、被复制或修改的示例文档
- **好处**：将产出资源与文档分离，让 Claude 可使用文件而不必读入上下文

#### 技能中不应包含的内容

技能只应包含直接支撑其功能的必要文件。**不要**创建多余文档或辅助文件，例如：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 等等

技能只应包含 AI 智能体完成手头工作所需的信息，不应包含关于创建过程、安装与测试步骤、面向用户的文档等辅助上下文。额外文档只会增加噪音与困惑。

### 渐进披露设计原则

技能通过三级加载来高效管理上下文：

1. **元数据（name + description）** - 始终在上下文中（约 100 词）
2. **SKILL.md 正文** - 技能触发时加载（<5k 词）
3. **捆绑资源** - 由 Claude 按需加载（脚本可不读入上下文直接执行，故理论上不限）

#### 渐进披露模式

将 SKILL.md 正文控制在必要内容内、不超过约 500 行，以减少上下文膨胀。接近该限制时拆到单独文件。拆出内容时，必须在 SKILL.md 中引用并清楚说明何时读取，让读者知道这些文件存在以及何时使用。

**关键原则**：当技能支持多种变体、框架或选项时，在 SKILL.md 中只保留核心工作流与选择指导，将变体相关细节（模式、示例、配置）放到单独参考文件。

**模式 1：高层指南 + 参考**

```markdown
# PDF 处理

## 快速开始

用 pdfplumber 提取文本：
[代码示例]

## 高级功能

- **表单填写**：完整指南见 [FORMS.md](FORMS.md)
- **API 参考**：所有方法见 [REFERENCE.md](REFERENCE.md)
- **示例**：常见模式见 [EXAMPLES.md](EXAMPLES.md)
```

Claude 仅在需要时加载 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

**模式 2：按领域组织**

对多领域技能，按领域组织内容，避免加载无关上下文：

```
bigquery-skill/
├── SKILL.md (概览与导航)
└── reference/
    ├── finance.md (收入、计费指标)
    ├── sales.md (商机、管线)
    ├── product.md (API 使用、功能)
    └── marketing.md (活动、归因)
```

用户问销售指标时，Claude 只读 sales.md。

类似地，支持多框架或变体时按变体组织：

```
cloud-deploy/
├── SKILL.md (工作流 + 供应商选择)
└── references/
    ├── aws.md (AWS 部署模式)
    ├── gcp.md (GCP 部署模式)
    └── azure.md (Azure 部署模式)
```

用户选择 AWS 时，Claude 只读 aws.md。

**模式 3：条件性细节**

正文只放基础内容，进阶内容用链接：

```markdown
# DOCX 处理

## 创建文档

新建文档用 docx-js。详见 [DOCX-JS.md](DOCX-JS.md)。

## 编辑文档

简单编辑可直接改 XML。

**修订追踪**：见 [REDLINING.md](REDLINING.md)
**OOXML 细节**：见 [OOXML.md](OOXML.md)
```

仅当用户需要这些功能时，Claude 才读取 REDLINING.md 或 OOXML.md。

**重要约定：**

- **避免深层嵌套引用** - 参考文件只比 SKILL.md 深一层，所有参考都应从 SKILL.md 直接链接。
- **长参考文件要有结构** - 超过约 100 行的文件在开头放目录，便于 Claude 预览时把握全貌。

## 技能类型（先选类型再创建）

本仓技能分为两类，**路径与登记完全不同**，创建前必须先确定类型。

| 类型 | 放置路径 | 适用场景 | 登记与串联 |
|------|----------|----------|------------|
| **公共技能（shared-skills）** | `.agents/skills/shared-skills/<技能名>/` | 跨项目或跨平台共用（设计、MCP、提交、审查、文档转 PPT 等）；需在 Cursor/OpenSkills 中按 name+description 被识别 | `AGENTS.md`、`.agents/handbook/skills/<名>.md`（按需）、`.agents/handbook/skills/README.md`、`.agents/skills/shared-skills/README.md` |
| **项目技能（project-skills）** | `.agents/skills/project-skills/<技能名>/` | 仅本仓 **apps** 开发用，与 project-rules 配套（如 create-api、create-component、create-route、create-store） | `.agents/skills/project-skills/README.md`；若需 Cursor 语义触发，在 `skill-project-tasks.mdc` 表格 + `project-rules/README.md` 补一行；**不**填 `AGENTS.md` / `shared-skills README`；如需额外说明，可补充 `.agents/handbook/skills/<技能名>.md`（见 [skill-rule-creation-checklist.md](../../../handbook/ai-engineering/skill-rule-creation-checklist.md)） |

**如何选择**：若技能只约束本仓 Vue/API/路由/组件等 apps 开发流程 → **项目技能**；若技能可被其他仓库或平台复用、或希望出现在 AGENTS.md 技能表 → **公共技能**。

---

## 技能创建流程

1. **确定技能类型**：公共技能（shared-skills）还是项目技能（project-skills），见上表。
2. 用具体例子理解技能
3. 规划可复用内容（脚本、参考、素材）
4. 初始化并编辑技能（路径按类型选择；init_skill.py 可选，项目技能可手建目录）
5. **按类型登记**：公共技能 → 步骤 5a；项目技能 → 步骤 5b
6. 打包（仅公共技能通常需打包 .skill；项目技能一般不需）
7. 根据实际使用迭代

按顺序执行，仅在明确不适用时可跳过某步。

### 步骤 1：用具体例子理解技能

仅当技能的用法已经非常清楚时可跳过。即使已有技能，这一步仍有价值。

要创建有效技能，须清楚理解技能会被如何使用的具体例子。理解可来自用户直接举例，或生成示例并经用户确认。

例如做「图片编辑」类技能时，可问：

- 「图片编辑技能应支持哪些功能？裁剪、旋转，还有别的吗？」
- 「能举几个这个技能会被用到的场景吗？」
- 「我能想到用户会说『把这张图红眼去掉』或『旋转这张图』。你还想象会有哪些用法？」
- 「用户说什么话时应该触发这个技能？」

为避免一次问太多，先问最关键的问题，再根据需要追问。

当对技能应支持的功能有清晰认识时，可结束本步。

### 步骤 2：规划可复用的技能内容

把具体例子转化为有效技能，需要对每个例子做：

1. 思考如何从零执行该例子
2. 识别若反复执行这些工作流，哪些脚本、参考、素材会有帮助

例：做 `pdf-editor` 技能处理「帮我旋转这个 PDF」时，分析可得：

1. 旋转 PDF 每次都要重写相同代码
2. 在技能里放一个 `scripts/rotate_pdf.py` 会有帮助

例：做 `frontend-webapp-builder` 处理「给我做个待办应用」或「做个记录步数的仪表盘」时：

1. 写前端每次都要同样的 HTML/React 样板
2. 在技能里放一个 `assets/hello-world/` 模板（包含样板 HTML/React 项目文件）会有帮助

例：做 `big-query` 技能处理「今天有多少用户登录？」时：

1. 查 BigQuery 每次都要重新发现表 schema 与关系
2. 在技能里放一个记录表 schema 的 `references/schema.md` 会有帮助

通过分析每个具体例子，列出要包含的可复用资源：脚本、参考、素材。

### 步骤 3：初始化技能

此时可以真正创建技能目录，**路径按已选类型**：

- **公共技能**：输出目录为 `.agents/skills/shared-skills/<技能名>/`（或 `--path` 指向该目录）。
- **项目技能**：输出目录为 `.agents/skills/project-skills/<技能名>/`；可手建目录与 SKILL.md，或若有 init_skill.py 则 `--path` 指向 project-skills 下。

仅当要开发的技能已存在、只需迭代或登记更新时可跳过，直接进入下一步。

从零创建新技能时，可运行 `init_skill.py` 生成模板（若本仓或环境提供）。用法示例：

```bash
scripts/init_skill.py <skill-name> --path .agents/skills/shared-skills   # 公共技能
# 或
# 在 .agents/skills/project-skills/<技能名>/ 下手建 SKILL.md 与所需资源
```

脚本会（若使用）：在指定路径创建技能目录、生成 SKILL.md 模板、创建 scripts/references/assets 示例。初始化后按需定制或删除示例文件。

### 步骤 4：编辑技能

在编辑（新生成或已有）技能时，记住技能是给**另一个 Claude 实例**用的。要包含对那个实例有益且非显而易见的信息。考虑哪些流程知识、领域细节或可复用素材能帮助对方更有效地执行任务。

#### 学习成熟设计模式

根据技能需求参考：

- **多步骤流程**：见 references/workflows.md，了解顺序工作流与条件逻辑
- **特定输出格式或质量标准**：见 references/output-patterns.md，了解模板与示例模式

这些文件包含经过验证的技能设计实践。

#### 从可复用内容开始

实现时先做上面规划好的资源：`scripts/`、`references/`、`assets/`。注意这一步可能需要用户输入。例如做 `brand-guidelines` 时，用户可能需提供品牌素材或模板放入 `assets/`，或文档放入 `references/`。

新增脚本必须实际运行测试，确保无 bug 且输出符合预期。若类似脚本较多，可只测试有代表性的几个，在信心与时间之间平衡。

不需要的示例文件与目录应删除。初始化脚本会在 `scripts/`、`references/`、`assets/` 下创建示例以展示结构，但多数技能不会全部用到。

#### 更新 SKILL.md

**写作风格**：始终使用祈使/不定式。

##### Frontmatter

撰写 YAML frontmatter，包含 `name` 与 `description`：

- `name`：技能名称
- `description`：这是主要的触发依据，帮助 Claude 判断何时使用该技能。
  - 同时写清技能**做什么**以及**何时/在什么情境下**使用。
  - 所有「何时使用」都应放在 description 里，不要放在正文。正文只在触发后才加载，在正文里写「何时使用本技能」对触发判断没有帮助。
  - 例：`docx` 类技能的 description 可写：「支持修订追踪、批注、格式保留与文本提取的文档创建、编辑与分析。当 Claude 需要处理专业文档（.docx）时使用，包括：(1) 新建文档 (2) 修改或编辑内容 (3) 处理修订 (4) 添加批注 及其他文档相关任务」

YAML frontmatter 中不要包含其他字段。

##### 正文

撰写技能及其捆绑资源的使用说明。

### 步骤 5：按类型登记（5a 公共技能 / 5b 项目技能）

#### 5a 公共技能（shared-skills）登记

仅当创建的技能为**公共技能**时执行本段。本仓要求公共技能在 `.agents/handbook/skills/` 下具备人类可读入口，并在 `AGENTS.md` 与 `shared-skills README` 中登记。

1. **.agents/handbook/skills/<技能名>.md**：优先用 `skill-doc-generator` 生成，或按 [.agents/handbook/skills/skill-doc-template.md](../../../handbook/skills/skill-doc-template.md) 手写。并检查 `.agents/handbook/skills/README.md` 是否已补充该技能入口或说明。
2. **AGENTS.md**：在 `<!-- SKILLS_TABLE_START -->` 与 `<!-- SKILLS_TABLE_END -->` 之间新增 `<skill>` 条目（`name`、`description`、`location`），供 Cursor/OpenSkills 识别。
3. **.agents/skills/shared-skills/README.md**：在「技能列表」表格中新增一行。

完整清单见 [.agents/handbook/ai-engineering/skill-rule-creation-checklist.md](../../../handbook/ai-engineering/skill-rule-creation-checklist.md)。

#### 5b 项目技能（project-skills）登记

仅当创建的技能为**项目技能**时执行本段。**不**填写 AGENTS.md、shared-skills README。

1. **.agents/skills/project-skills/README.md**：在自封装技能列表（及若有「Skills 语义触发规则」说明）中新增该技能一行。
2. **若需 Cursor 按语义触发**（如「新增 XX / 创建 XX」类）：  
   - 在 [.agents/rules/project-rules/skill-project-tasks.mdc](../../../rules/project-rules/skill-project-tasks.mdc) 的表格中加一行：用户意图（关键词）、技能路径（`@.agents/skills/project-skills/<技能名>/SKILL.md`）、同步遵守规范（对应 01–11 的 .mdc）。  
   - 在 [.agents/rules/project-rules/README.md](../../../rules/project-rules/README.md) 的「Skills 语义触发规则」中，在 `skill-project-tasks.mdc` 的「覆盖的 Skill 与触发场景」里补上该技能及触发场景。  
   **无需**为单个项目技能新建 `skill-xxx.mdc` 文件。
3. **（按需）** `.agents/handbook/skills/<技能名>.md` 与 `.agents/handbook/skills/README.md`：按 [.agents/handbook/skills/skill-doc-template.md](../../../handbook/skills/skill-doc-template.md) 编写人类可读说明，并在需要时补充到技能索引中。

### 步骤 6：打包技能（可选，通常仅公共技能）

- **公共技能**：若需分发生成的 .skill 文件，可运行 `scripts/package_skill.py <path/to/skill-folder>`（若有该脚本）。打包会校验 frontmatter、目录结构与描述，通过后生成 .skill（zip）。
- **项目技能**：一般**不**打包成 .skill，仅在本仓 `.agents/skills/project-skills/` 下使用，无需执行打包。

### 步骤 7：迭代

技能经实际使用后，用户可能会提出改进。往往在使用后不久、对技能表现记忆犹新时提出。

**迭代流程：**

1. 在真实任务中使用技能
2. 发现困难或低效
3. 判断应如何更新 SKILL.md / 捆绑资源；若为公共技能则同步更新 `.agents/handbook/skills/<skill-name>.md` 及索引；若为项目技能则视需更新 `project-skills README`、`skill-project-tasks.mdc`，以及已存在的 `.agents/handbook/skills/<skill-name>.md`
4. 修改并再次测试

```

---

## skills/shared-skills/skill-creator/references/output-patterns.md

`skills/shared-skills/skill-creator/references/output-patterns.md`

```markdown
# Output Patterns

Use these patterns when skills need to produce consistent, high-quality output.

## Template Pattern

Provide templates for output format. Match the level of strictness to your needs.

**For strict requirements (like API responses or data formats):**

```markdown
## Report structure

ALWAYS use this exact template structure:

# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```

**For flexible guidance (when adaptation is useful):**

```markdown
## Report structure

Here is a sensible default format, but use your best judgment:

# [Analysis Title]

## Executive summary
[Overview]

## Key findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]

Adjust sections as needed for the specific analysis type.
```

## Examples Pattern

For skills where output quality depends on seeing examples, provide input/output pairs:

```markdown
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

Follow this style: type(scope): brief description, then detailed explanation.
```

Examples help Claude understand the desired style and level of detail more clearly than descriptions alone.

```

---

## skills/shared-skills/skill-creator/references/workflows.md

`skills/shared-skills/skill-creator/references/workflows.md`

```markdown
# Workflow Patterns

## Sequential Workflows

For complex tasks, break operations into clear, sequential steps. It is often helpful to give Claude an overview of the process towards the beginning of SKILL.md:

```markdown
Filling a PDF form involves these steps:

1. Analyze the form (run analyze_form.py)
2. Create field mapping (edit fields.json)
3. Validate mapping (run validate_fields.py)
4. Fill the form (run fill_form.py)
5. Verify output (run verify_output.py)
```

## Conditional Workflows

For tasks with branching logic, guide Claude through decision points:

```markdown
1. Determine the modification type:
   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow: [steps]
3. Editing workflow: [steps]
```
```

---

## skills/shared-skills/skill-creator/scripts/init_skill.py

`skills/shared-skills/skill-creator/scripts/init_skill.py`

```python
#!/usr/bin/env python3
"""
Skill Initializer - Creates a new skill from template

Usage:
    init_skill.py <skill-name> --path <path>

Examples:
    init_skill.py my-new-skill --path skills/public
    init_skill.py my-api-helper --path skills/private
    init_skill.py custom-skill --path /custom/location
"""

import sys
from pathlib import Path


SKILL_TEMPLATE = """---
name: {skill_name}
description: [TODO: Complete and informative explanation of what the skill does and when to use it. Include WHEN to use this skill - specific scenarios, file types, or tasks that trigger it.]
---

# {skill_title}

## Overview

[TODO: 1-2 sentences explaining what this skill enables]

## Structuring This Skill

[TODO: Choose the structure that best fits this skill's purpose. Common patterns:

**1. Workflow-Based** (best for sequential processes)
- Works well when there are clear step-by-step procedures
- Example: DOCX skill with "Workflow Decision Tree" → "Reading" → "Creating" → "Editing"
- Structure: ## Overview → ## Workflow Decision Tree → ## Step 1 → ## Step 2...

**2. Task-Based** (best for tool collections)
- Works well when the skill offers different operations/capabilities
- Example: PDF skill with "Quick Start" → "Merge PDFs" → "Split PDFs" → "Extract Text"
- Structure: ## Overview → ## Quick Start → ## Task Category 1 → ## Task Category 2...

**3. Reference/Guidelines** (best for standards or specifications)
- Works well for brand guidelines, coding standards, or requirements
- Example: Brand styling with "Brand Guidelines" → "Colors" → "Typography" → "Features"
- Structure: ## Overview → ## Guidelines → ## Specifications → ## Usage...

**4. Capabilities-Based** (best for integrated systems)
- Works well when the skill provides multiple interrelated features
- Example: Product Management with "Core Capabilities" → numbered capability list
- Structure: ## Overview → ## Core Capabilities → ### 1. Feature → ### 2. Feature...

Patterns can be mixed and matched as needed. Most skills combine patterns (e.g., start with task-based, add workflow for complex operations).

Delete this entire "Structuring This Skill" section when done - it's just guidance.]

## [TODO: Replace with the first main section based on chosen structure]

[TODO: Add content here. See examples in existing skills:
- Code samples for technical skills
- Decision trees for complex workflows
- Concrete examples with realistic user requests
- References to scripts/templates/references as needed]

## Resources

This skill includes example resource directories that demonstrate how to organize different types of bundled resources:

### scripts/
Executable code (Python/Bash/etc.) that can be run directly to perform specific operations.

**Examples from other skills:**
- PDF skill: `fill_fillable_fields.py`, `extract_form_field_info.py` - utilities for PDF manipulation
- DOCX skill: `document.py`, `utilities.py` - Python modules for document processing

**Appropriate for:** Python scripts, shell scripts, or any executable code that performs automation, data processing, or specific operations.

**Note:** Scripts may be executed without loading into context, but can still be read by Claude for patching or environment adjustments.

### references/
Documentation and reference material intended to be loaded into context to inform Claude's process and thinking.

**Examples from other skills:**
- Product management: `communication.md`, `context_building.md` - detailed workflow guides
- BigQuery: API reference documentation and query examples
- Finance: Schema documentation, company policies

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that Claude should reference while working.

### assets/
Files not intended to be loaded into context, but rather used within the output Claude produces.

**Examples from other skills:**
- Brand styling: PowerPoint template files (.pptx), logo files
- Frontend builder: HTML/React boilerplate project directories
- Typography: Font files (.ttf, .woff2)

**Appropriate for:** Templates, boilerplate code, document templates, images, icons, fonts, or any files meant to be copied or used in the final output.

---

**Any unneeded directories can be deleted.** Not every skill requires all three types of resources.
"""

EXAMPLE_SCRIPT = '''#!/usr/bin/env python3
"""
Example helper script for {skill_name}

This is a placeholder script that can be executed directly.
Replace with actual implementation or delete if not needed.

Example real scripts from other skills:
- pdf/scripts/fill_fillable_fields.py - Fills PDF form fields
- pdf/scripts/convert_pdf_to_images.py - Converts PDF pages to images
"""

def main():
    print("This is an example script for {skill_name}")
    # TODO: Add actual script logic here
    # This could be data processing, file conversion, API calls, etc.

if __name__ == "__main__":
    main()
'''

EXAMPLE_REFERENCE = """# Reference Documentation for {skill_title}

This is a placeholder for detailed reference documentation.
Replace with actual reference content or delete if not needed.

Example real reference docs from other skills:
- product-management/references/communication.md - Comprehensive guide for status updates
- product-management/references/context_building.md - Deep-dive on gathering context
- bigquery/references/ - API references and query examples

## When Reference Docs Are Useful

Reference docs are ideal for:
- Comprehensive API documentation
- Detailed workflow guides
- Complex multi-step processes
- Information too lengthy for main SKILL.md
- Content that's only needed for specific use cases

## Structure Suggestions

### API Reference Example
- Overview
- Authentication
- Endpoints with examples
- Error codes
- Rate limits

### Workflow Guide Example
- Prerequisites
- Step-by-step instructions
- Common patterns
- Troubleshooting
- Best practices
"""

EXAMPLE_ASSET = """# Example Asset File

This placeholder represents where asset files would be stored.
Replace with actual asset files (templates, images, fonts, etc.) or delete if not needed.

Asset files are NOT intended to be loaded into context, but rather used within
the output Claude produces.

Example asset files from other skills:
- Brand guidelines: logo.png, slides_template.pptx
- Frontend builder: hello-world/ directory with HTML/React boilerplate
- Typography: custom-font.ttf, font-family.woff2
- Data: sample_data.csv, test_dataset.json

## Common Asset Types

- Templates: .pptx, .docx, boilerplate directories
- Images: .png, .jpg, .svg, .gif
- Fonts: .ttf, .otf, .woff, .woff2
- Boilerplate code: Project directories, starter files
- Icons: .ico, .svg
- Data files: .csv, .json, .xml, .yaml

Note: This is a text placeholder. Actual assets can be any file type.
"""


def title_case_skill_name(skill_name):
    """Convert hyphenated skill name to Title Case for display."""
    return ' '.join(word.capitalize() for word in skill_name.split('-'))


def init_skill(skill_name, path):
    """
    Initialize a new skill directory with template SKILL.md.

    Args:
        skill_name: Name of the skill
        path: Path where the skill directory should be created

    Returns:
        Path to created skill directory, or None if error
    """
    # Determine skill directory path
    skill_dir = Path(path).resolve() / skill_name

    # Check if directory already exists
    if skill_dir.exists():
        print(f"❌ Error: Skill directory already exists: {skill_dir}")
        return None

    # Create skill directory
    try:
        skill_dir.mkdir(parents=True, exist_ok=False)
        print(f"✅ Created skill directory: {skill_dir}")
    except Exception as e:
        print(f"❌ Error creating directory: {e}")
        return None

    # Create SKILL.md from template
    skill_title = title_case_skill_name(skill_name)
    skill_content = SKILL_TEMPLATE.format(
        skill_name=skill_name,
        skill_title=skill_title
    )

    skill_md_path = skill_dir / 'SKILL.md'
    try:
        skill_md_path.write_text(skill_content)
        print("✅ Created SKILL.md")
    except Exception as e:
        print(f"❌ Error creating SKILL.md: {e}")
        return None

    # Create resource directories with example files
    try:
        # Create scripts/ directory with example script
        scripts_dir = skill_dir / 'scripts'
        scripts_dir.mkdir(exist_ok=True)
        example_script = scripts_dir / 'example.py'
        example_script.write_text(EXAMPLE_SCRIPT.format(skill_name=skill_name))
        example_script.chmod(0o755)
        print("✅ Created scripts/example.py")

        # Create references/ directory with example reference doc
        references_dir = skill_dir / 'references'
        references_dir.mkdir(exist_ok=True)
        example_reference = references_dir / 'api_reference.md'
        example_reference.write_text(EXAMPLE_REFERENCE.format(skill_title=skill_title))
        print("✅ Created references/api_reference.md")

        # Create assets/ directory with example asset placeholder
        assets_dir = skill_dir / 'assets'
        assets_dir.mkdir(exist_ok=True)
        example_asset = assets_dir / 'example_asset.txt'
        example_asset.write_text(EXAMPLE_ASSET)
        print("✅ Created assets/example_asset.txt")
    except Exception as e:
        print(f"❌ Error creating resource directories: {e}")
        return None

    # Print next steps
    print(f"\n✅ Skill '{skill_name}' initialized successfully at {skill_dir}")
    print("\nNext steps:")
    print("1. Edit SKILL.md to complete the TODO items and update the description")
    print("2. Customize or delete the example files in scripts/, references/, and assets/")
    print("3. Run the validator when ready to check the skill structure")

    return skill_dir


def main():
    if len(sys.argv) < 4 or sys.argv[2] != '--path':
        print("Usage: init_skill.py <skill-name> --path <path>")
        print("\nSkill name requirements:")
        print("  - Kebab-case identifier (e.g., 'my-data-analyzer')")
        print("  - Lowercase letters, digits, and hyphens only")
        print("  - Max 64 characters")
        print("  - Must match directory name exactly")
        print("\nExamples:")
        print("  init_skill.py my-new-skill --path skills/public")
        print("  init_skill.py my-api-helper --path skills/private")
        print("  init_skill.py custom-skill --path /custom/location")
        sys.exit(1)

    skill_name = sys.argv[1]
    path = sys.argv[3]

    print(f"🚀 Initializing skill: {skill_name}")
    print(f"   Location: {path}")
    print()

    result = init_skill(skill_name, path)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()

```

---

## skills/shared-skills/skill-creator/scripts/package_skill.py

`skills/shared-skills/skill-creator/scripts/package_skill.py`

```python
#!/usr/bin/env python3
"""
Skill Packager - Creates a distributable .skill file of a skill folder

Usage:
    python utils/package_skill.py <path/to/skill-folder> [output-directory]

Example:
    python utils/package_skill.py skills/public/my-skill
    python utils/package_skill.py skills/public/my-skill ./dist
"""

import sys
import zipfile
from pathlib import Path
from quick_validate import validate_skill


def package_skill(skill_path, output_dir=None):
    """
    Package a skill folder into a .skill file.

    Args:
        skill_path: Path to the skill folder
        output_dir: Optional output directory for the .skill file (defaults to current directory)

    Returns:
        Path to the created .skill file, or None if error
    """
    skill_path = Path(skill_path).resolve()

    # Validate skill folder exists
    if not skill_path.exists():
        print(f"❌ Error: Skill folder not found: {skill_path}")
        return None

    if not skill_path.is_dir():
        print(f"❌ Error: Path is not a directory: {skill_path}")
        return None

    # Validate SKILL.md exists
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        print(f"❌ Error: SKILL.md not found in {skill_path}")
        return None

    # Run validation before packaging
    print("🔍 Validating skill...")
    valid, message = validate_skill(skill_path)
    if not valid:
        print(f"❌ Validation failed: {message}")
        print("   Please fix the validation errors before packaging.")
        return None
    print(f"✅ {message}\n")

    # Determine output location
    skill_name = skill_path.name
    if output_dir:
        output_path = Path(output_dir).resolve()
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = Path.cwd()

    skill_filename = output_path / f"{skill_name}.skill"

    # Create the .skill file (zip format)
    try:
        with zipfile.ZipFile(skill_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Walk through the skill directory
            for file_path in skill_path.rglob('*'):
                if file_path.is_file():
                    # Calculate the relative path within the zip
                    arcname = file_path.relative_to(skill_path.parent)
                    zipf.write(file_path, arcname)
                    print(f"  Added: {arcname}")

        print(f"\n✅ Successfully packaged skill to: {skill_filename}")
        return skill_filename

    except Exception as e:
        print(f"❌ Error creating .skill file: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python utils/package_skill.py <path/to/skill-folder> [output-directory]")
        print("\nExample:")
        print("  python utils/package_skill.py skills/public/my-skill")
        print("  python utils/package_skill.py skills/public/my-skill ./dist")
        sys.exit(1)

    skill_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"📦 Packaging skill: {skill_path}")
    if output_dir:
        print(f"   Output directory: {output_dir}")
    print()

    result = package_skill(skill_path, output_dir)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()

```

---

## skills/shared-skills/skill-creator/scripts/quick_validate.py

`skills/shared-skills/skill-creator/scripts/quick_validate.py`

```python
#!/usr/bin/env python3
"""
Quick validation script for skills - minimal version
"""

import sys
import os
import re
import yaml
from pathlib import Path

def validate_skill(skill_path):
    """Basic validation of a skill"""
    skill_path = Path(skill_path)

    # Check SKILL.md exists
    skill_md = skill_path / 'SKILL.md'
    if not skill_md.exists():
        return False, "SKILL.md not found"

    # Read and validate frontmatter
    content = skill_md.read_text()
    if not content.startswith('---'):
        return False, "No YAML frontmatter found"

    # Extract frontmatter
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return False, "Invalid frontmatter format"

    frontmatter_text = match.group(1)

    # Parse YAML frontmatter
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if not isinstance(frontmatter, dict):
            return False, "Frontmatter must be a YAML dictionary"
    except yaml.YAMLError as e:
        return False, f"Invalid YAML in frontmatter: {e}"

    # Define allowed properties
    ALLOWED_PROPERTIES = {'name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility'}

    # Check for unexpected properties (excluding nested keys under metadata)
    unexpected_keys = set(frontmatter.keys()) - ALLOWED_PROPERTIES
    if unexpected_keys:
        return False, (
            f"Unexpected key(s) in SKILL.md frontmatter: {', '.join(sorted(unexpected_keys))}. "
            f"Allowed properties are: {', '.join(sorted(ALLOWED_PROPERTIES))}"
        )

    # Check required fields
    if 'name' not in frontmatter:
        return False, "Missing 'name' in frontmatter"
    if 'description' not in frontmatter:
        return False, "Missing 'description' in frontmatter"

    # Extract name for validation
    name = frontmatter.get('name', '')
    if not isinstance(name, str):
        return False, f"Name must be a string, got {type(name).__name__}"
    name = name.strip()
    if name:
        # Check naming convention (kebab-case: lowercase with hyphens)
        if not re.match(r'^[a-z0-9-]+$', name):
            return False, f"Name '{name}' should be kebab-case (lowercase letters, digits, and hyphens only)"
        if name.startswith('-') or name.endswith('-') or '--' in name:
            return False, f"Name '{name}' cannot start/end with hyphen or contain consecutive hyphens"
        # Check name length (max 64 characters per spec)
        if len(name) > 64:
            return False, f"Name is too long ({len(name)} characters). Maximum is 64 characters."

    # Extract and validate description
    description = frontmatter.get('description', '')
    if not isinstance(description, str):
        return False, f"Description must be a string, got {type(description).__name__}"
    description = description.strip()
    if description:
        # Check for angle brackets
        if '<' in description or '>' in description:
            return False, "Description cannot contain angle brackets (< or >)"
        # Check description length (max 1024 characters per spec)
        if len(description) > 1024:
            return False, f"Description is too long ({len(description)} characters). Maximum is 1024 characters."

    # Validate compatibility field if present (optional)
    compatibility = frontmatter.get('compatibility', '')
    if compatibility:
        if not isinstance(compatibility, str):
            return False, f"Compatibility must be a string, got {type(compatibility).__name__}"
        if len(compatibility) > 500:
            return False, f"Compatibility is too long ({len(compatibility)} characters). Maximum is 500 characters."

    return True, "Skill is valid!"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python quick_validate.py <skill_directory>")
        sys.exit(1)
    
    valid, message = validate_skill(sys.argv[1])
    print(message)
    sys.exit(0 if valid else 1)
```

---

## skills/shared-skills/skill-doc-generator/SKILL.md

`skills/shared-skills/skill-doc-generator/SKILL.md`

```markdown
---
name: skill-doc-generator
description: 根据 `.agents/handbook/skills/skill-doc-template.md` 模版，为 `.agents/skills/shared-skills/` 下的技能生成人类可读说明，并同步维护 `.agents/handbook/skills/README.md`。在创建或更新公共技能时自动触发；也可在用户要求生成技能文档、更新技能说明时使用。
---

# 技能文档生成器

根据项目模版为 `.agents/skills/shared-skills/`（即 `.cursor/skills/`）下的技能生成使用说明文档，输出到 `.agents/handbook/skills/<技能名>.md`。

## 1. 触发与范围

**自动触发**（优先）：
- **创建新技能**：在 `.agents/skills/shared-skills/`（或 `.cursor/skills/`）下新增或完成创建某技能的 SKILL.md 后，立即为本技能生成 `.agents/handbook/skills/<技能名>.md`，并更新 `.agents/handbook/skills/README.md` 技能总览。
- **更新技能**：修改 `.agents/skills/shared-skills/<技能名>/SKILL.md` 后，立即为对应技能重新生成 `.agents/handbook/skills/<技能名>.md`。

**手动触发**：
- 用户要求为指定技能或全部技能生成/更新使用文档
- 按模版编写技能说明
- 新增技能后补写 `.agents/handbook/skills/` 文档

**输入**：自动触发时，目标技能为本次创建/更新的技能；手动触发时，用户可指定技能名（如 `smart-commit`）或说「全部」「所有技能」。未指定时，可列出 `.agents/skills/shared-skills/` 下技能供用户选择。

## 2. 流程

### Step 1：读取模版

读取 `.agents/handbook/skills/skill-doc-template.md`，作为文档结构基础。模版中的 `[占位符]` 需替换为实际内容。

### Step 2：确定目标技能

- **自动触发**：目标为本次创建/更新的技能（由上下文确定）
- 指定技能：直接处理该技能
- 全部技能：遍历 `.agents/skills/shared-skills/*/SKILL.md` 下的每个技能
- 未指定：列出技能并询问，或默认处理全部

### Step 3：读取技能内容

对每个目标技能：
- 读取 `.agents/skills/shared-skills/<技能名>/SKILL.md`
- 提取 YAML frontmatter：`name`、`description`
- 通读正文，提取：何时使用、格式规范、流程、前置依赖等（用于填充模版对应章节）

### Step 4：填充模版并输出

1. 将模版中的占位符替换为从 SKILL.md 提取的内容
2. **按技能特点**：删除不需要的章节（如无格式规范则删「格式规范」）；可增加技能特有章节（如前置安装、检查清单）
3. 与 `.agents/handbook/skills/README.md` 的风格保持一致；不要求为每个技能都生成冗余镜像文档，按需保留独立说明
4. **保存路径**：`.agents/handbook/skills/<技能名>.md`（文件名与技能名一致）

### Step 5：更新 README

- **自动触发（新建技能）**：必须更新 `.agents/handbook/skills/README.md`，在技能总览或维护说明中新增该技能。
- **其他情况**：若生成/更新了技能文档，检查 README 技能总览表，确保已列入。

**串联清单**：新建公共技能时，除 handbook/skills 两处外，还需在 **AGENTS.md** 与 **.agents/skills/shared-skills/README.md** 登记。完整清单见 [.agents/handbook/ai-engineering/skill-rule-creation-checklist.md](../../../handbook/ai-engineering/skill-rule-creation-checklist.md)。

## 3. 占位符对照

| 模版占位符 | 来源 |
|-----------|------|
| `[技能名称]` | SKILL.md 中 `name` 或一级标题，需 human-readable |
| `[技能名]` | SKILL.md frontmatter 的 `name`（小写连字符） |
| `[一两句话概括技能用途]` | SKILL.md frontmatter 的 `description` |
| `[触发场景 1/2/3]` | 从 SKILL.md 正文「使用场景」「何时使用」等节推断 |
| `[示例话术 1/2]` | 根据技能用途编写，如「帮我写 commit」「生成技能文档」 |
| `[格式示例]` | 从 SKILL.md 的格式规范节提取 |
| `[使用步骤]` | 从 SKILL.md 流程/步骤节归纳 |

## 4. 注意事项

- **语言**：输出文档使用中文
- **一致性**：与现有 `.agents/handbook/skills/README.md` 风格保持一致
- **精简**：模版中有注释标记的可选章节，按技能实际情况保留或删除
- **引用**：文档末尾「参考」节需包含 `.agents/skills/shared-skills/<技能名>/SKILL.md` 链接

## 5. 参考

- 模版：`.agents/handbook/skills/skill-doc-template.md`
- 技能总览：`.agents/handbook/skills/README.md`

```

---

## skills/shared-skills/skill-doc-generator/reference.md

`skills/shared-skills/skill-doc-generator/reference.md`

```markdown
# 技能文档生成器 - 参考

## 模版章节与 SKILL.md 对应关系

| 模版章节 | 提取来源 | 处理 |
|---------|---------|------|
| 技能名称/路径/描述 | frontmatter `name`、`description` | 写入头部 |
| 何时使用 | 正文「使用场景」「何时使用」「使用本技能」 | 列表化 |
| 如何触发 | description 中的触发词 + 正文 | 编写话术示例 |
| 格式规范 | 正文「格式规范」「约束」 | 有则保留，无则删 |
| 使用步骤 | 正文流程、步骤 | 编号列表 |
| 示例 | 正文「示例」节 | 表格或代码块 |
| 常见场景 | 正文分场景说明 | 子标题 + 说明 |
| 与 xx 的区别 | 正文对比说明 | 有则保留 |
| 流程（技能内部） | 正文「流程」「步骤」 | 简化为要点 |
| 前置安装等 | 正文「前置安装」等 | 技能有则增加 |

## 输出路径规则

- 单个技能：`.agents/handbook/skills/<name>.md`（name 来自 frontmatter，小写连字符）
- 多个技能：逐个生成，各自保存

## 示例：从 SKILL.md 到 doc

**SKILL.md 片段**：
```yaml
---
name: smart-commit
description: 根据工作区变更生成符合 Conventional Commits 的提交信息...
---
```

**生成 doc 头部**：
```markdown
# smart-commit
**路径**：`.agents/skills/shared-skills/smart-commit/`（即 `.cursor/skills/smart-commit/`）
**描述**：根据工作区变更生成符合 Conventional Commits 的提交信息...
```

```

---

## skills/shared-skills/smart-commit/SKILL.md

`skills/shared-skills/smart-commit/SKILL.md`

```markdown
---
name: smart-commit
description: 根据工作区变更生成符合 Conventional Commits 且通过 commitlint 检查的提交信息。在用户请求提交代码、写 commit message、或执行 git commit 时使用。与项目 commit-msg hook（commitlint）及中文提交规范一致。
---

# Smart Commit

用户要求提交代码时，按以下流程生成**中文**提交信息并执行或给出命令。

## 0. 提交前增量 PR 审查（新增，必须执行）

在生成 commit message 和执行提交前，必须先走一轮**增量代码审查**，并**显式调用** `frontend-code-review` skill（`@.agents/skills/shared-skills/frontend-code-review/SKILL.md`）：

1. 先获取增量范围（优先 `git diff --cached`，若暂存区为空则看 `git diff`）。
2. 按 `frontend-code-review` 要求，对增量变更执行审查（规则基线为 `.agents/rules/project-rules/01~11`）。
3. 审查输出遵循 `frontend-code-review` 的严重级别与报告格式（`Critical / Warning / Suggestion`）。
4. 审查结论驱动提交流程（PR 门禁）：
   - 存在 `Critical`：判定为**严重问题，PR 不通过**，且**禁止提交代码**（必须先修复）。
   - 仅有 `Warning / Suggestion`：判定为**非严重问题**，输出告警信息即可，可继续提交流程。
   - 无问题：继续后续 Smart Commit 流程。

若用户明确要求“跳过审查直接提交”，可按用户指令继续，但需先提示潜在风险。

## 1. 收集变更

- 执行 `git status` 查看暂存/未暂存文件。
- **若暂存区为空或用户希望提交全部变更，且工作区有未暂存文件**：先执行 `git add .` 将所有变更纳入暂存区。
- 需要时执行 `git diff --staged` 查看暂存区具体改动，便于写准 subject。

## 2. 格式规范

提交信息须通过 `commitlint`（`@commitlint/config-conventional`），格式：

```
<type>(<scope>): <subject>

[可选的 body]

[可选的 footer]
```

约束：

- **type**：下表中的类型之一，小写。
- **scope**：可选，小写；本仓库为 monorepo，scope 可为应用或包名（如 `app-ai-copilot`、`app-admin`、`speediance-native-bridge` 等）。
- **subject**：简短说明，**使用中文**；句末不加句号；长度建议不超过 72 字符，以保证可读性。
- **body / footer**：可选；若有，body 与 header 之间空一行；footer 如 `Fixes #123`、`BREAKING CHANGE:` 按需使用。

### Type 类型

| type     | 说明         |
|----------|--------------|
| feat     | 新功能       |
| fix      | 修复 bug     |
| docs     | 文档变更     |
| style    | 代码格式（不影响逻辑） |
| refactor | 重构         |
| perf     | 性能优化     |
| test     | 测试相关     |
| build    | 构建/脚本    |
| ci       | CI 配置      |
| chore    | 杂项（依赖、配置等） |
| revert   | 回滚某次提交 |

## 3. 生成与执行

1. 根据变更内容选定 **type**，必要时加上 **scope**。
2. 用**中文**写一句简洁的 **subject**，概括本次改动。
3. 仅当“提交前增量 PR 审查”允许继续时，才进入提交命令阶段。
4. **若暂存区为空**：先执行 `git add .` 再执行 `git commit`；给出命令时需包含 `git add .`。
5. 生成完整提交信息，并：
   - 给出可复制的一条或多条命令（`git add .` + `git commit -m "..."` 或分步说明），或
   - 在用户同意的前提下直接执行 `git add .` 与 `git commit`。

若用户未明确说「直接提交」，优先输出建议命令与完整 message，由用户确认后再执行。

## 4. 示例

**示例 1：新功能**

- 变更：在 app-ai-copilot 中新增对话历史列表。
- 输出：
  ```
  feat(app-ai-copilot): 新增对话历史列表
  ```

**示例 2：修 bug**

- 变更：修复 native-bridge 在 iOS 上未注入的问题。
- 输出：
  ```
  fix(speediance-native-bridge): 修复 iOS 端 bridge 未注入问题
  ```

**示例 3：文档**

- 变更：更新 README 安装说明。
- 输出：
  ```
  docs: 更新 README 安装说明
  ```

**示例 4：带 body（可选）**

- 变更：重构登录模块，抽离校验逻辑。
- 输出：
  ```
  refactor(auth): 重构登录校验逻辑

  将校验从页面组件抽离到 composable，便于复用与单测。
  ```

**示例 5：chore**

- 变更：升级某依赖或调整 eslint 配置。
- 输出：
  ```
  chore(deps): 升级 xxx 至 x.x.x
  ```
  或
  ```
  chore: 调整 eslint 规则
  ```

## 5. 注意

- **语言**：subject（以及 body/footer 若写）统一使用**中文**。
- **一致性**：生成的 message 必须能被 `npx commitlint --edit $1` 通过（与 `.husky/commit-msg` 一致）。
- **多变更**：若一次提交包含多个不相关改动，建议用户拆成多次提交；若用户坚持一次提交，可选用最核心的 type/scope 并写概括性 subject。

更多规则与工具说明以仓库内的 `commitlint`、`husky` 与当前 `SKILL.md` 约束为准，不再依赖 `docs/` 目录。

```

---

## templates/PRD-runbook.md

`templates/PRD-runbook.md`

```markdown
# 通用产品 PRD 模版

本模版用于把非结构化需求整理为可被 `complex-task-runbook` 消化的结构化输入。

## 路径约定

统一落盘到目标应用目录：

`apps/<app-name>/requirements/<feature>/`

常见文件：

- `PRD.md`
- `open-questions.md`
- `brief.md`

## 最小必填项

1. 背景与问题
2. 目标与成功标准
3. 范围与不做项
4. 用户场景
5. 需求说明与验收
6. 开放问题

## 附加建议

- 接口未定时明确写“待后端确认”
- 路由、权限、埋点等研发细节可放 `brief.md` 或附录
- 未确认项单独维护在 `open-questions.md`

## PRD 正文骨架

```markdown
# [需求名称]

## 1. 背景与问题

## 2. 目标与成功标准

## 3. 范围与非目标

## 4. 用户与场景

## 5. 需求说明与验收

## 6. 依赖与风险

## 7. 开放问题
```

```
