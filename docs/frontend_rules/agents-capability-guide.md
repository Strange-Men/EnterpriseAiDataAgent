# .agents 功能实现指南

> 生成时间: 2026-05-06
> 源目录: d:\work-project\learn\.agents

## 总体能力地图

这个 `.agents` 配置体系让 AI 获得了一个完整的「前端开发团队」能力。核心思路：**Rules 定标准 → Skills 给步骤 → Agents 分职责 → MCP 接外部 → Handbook 做知识库**。

| 模块 | 提供的能力 | 核心手段 | 文件数 |
|------|-----------|----------|--------|
| agents/ | 子 Agent 角色定义 | 角色 Prompt + 工具绑定 + 规则引用 | 4 个 Agent |
| skills/ | 自动化工作流 | 步骤化 SOP + 代码模板 + 检查清单 | 18 个 Skill |
| rules/ | 行为约束与规范 | .mdc 规则文件 + globs 触发条件 | 14 个规则 |
| mcp/ | 外部工具接入 | MCP Server 配置（JSON） | 1 个服务 |
| handbook/ | AI 工程知识库 | 方法论文档 + 实践指南 | 12 个文档 |
| templates/ | 流程模板 | PRD 模板文件 | 1 个模板 |

## 模块详解

### agents/ — 子 Agent 定义

将复杂任务拆分为 4 个专职 Agent，模仿真实团队的「需求 → 设计 → 开发 → 审查」流水线：

#### 1. spec-analyst（需求分析师）

- **解决的问题**：需求不清晰时，自动拆解需求、考古现有代码、产出可执行的任务清单
- **实现方式**：
  - 定义中未绑定具体 rules，保持灵活性
  - 通过 description 让 Claude 判断何时启用（需求模糊、任务大时）
  - 产出标准化的任务清单，供后续 Agent 接力
- **关键设计**：作为流水线第一步，只做分析和拆解，不做实现——保证职责边界清晰

#### 2. api-designer（接口设计师）

- **解决的问题**：规范化地创建 HTTP 接口封装函数和类型定义
- **实现方式**：
  - 显式引用 `05-api-guide.mdc` 和 `02-coding-style.mdc` 规则
  - 调用 `create-api` Skill 获取详细步骤
  - 定义严格的命名约定（getXxxList、createXxx、updateXxx 等）
  - 完成标准明确：`pnpm type-check` 零错误、`pnpm lint` 零 error
- **关键设计**：Agent 定义只写「必须遵守」的规则引用和关键约定，具体步骤交给 Skill

#### 3. frontend-dev（前端开发者）

- **解决的问题**：实现 Vue 3 组件/页面、注册路由、编写样式
- **实现方式**：
  - 同时引用多个规则（02-coding-style、03-project-structure、04-component-guide、06-routing-guide、09-styling-guide）
  - 调用 `create-component`、`create-route` 等 Skill
- **关键设计**：一个 Agent 负责多个关联 Skill（组件 + 路由），避免切换 Agent 的摩擦

#### 4. code-reviewer（代码审查员）

- **解决的问题**：增量代码审查、规范检查、生成 Conventional Commits 提交信息
- **实现方式**：
  - 第一步用 `git diff --name-only` 获取改动范围
  - 第二步逐文件对照规范清单检查
  - 第三步运行 `pnpm type-check` 和 `pnpm lint` 质量门禁
  - 第四步调用 `smart-commit` Skill 生成提交信息
- **关键设计**：发现问题时「列出清单等待确认」而非直接修改——防止 AI 越权

**Agent 间协作模式**：
```
spec-analyst → api-designer → frontend-dev → code-reviewer
  (拆解任务)    (设计接口)     (实现UI)      (审查+提交)
```

### skills/ — 技能定义

分两层：`project-skills`（项目特有）和 `shared-skills`（跨项目复用）。

#### 项目技能（project-skills/）

| Skill | 解决的问题 | 关键步骤 | 配套规则 |
|-------|-----------|---------|---------|
| create-api | 快速创建规范的 API 封装 | 确定模块 → 定义类型 → 编写接口 → 导出 | 05-api-guide |
| create-component | 创建 Vue 组件（通用/页面级） | 确定类型 → 创建文件 → 编写模板 → 注册 | 03, 04 |
| create-route | 创建路由和视图页面 | 定义路由 → 创建视图 → 注册到 router | 06-routing-guide |
| create-store | 创建 Pinia 状态管理 | 定义 Store → 编写 state/getters/actions → 注册 | 07-state-management |
| create-vue-app | 脚手架新建子应用 | 运行 create-vue-app 脚本 → 配置基础结构 | 01, 02, 03 |
| complex-task-runbook | 处理复杂需求的一键清单 | 需求结构化 → 考古 → 拆解 → 输出 5 段清单 | 02-11 按需 |

**通用模式**：每个 Skill 都包含：
1. **使用场景**：什么时候用
2. **参考规则**：引用的 .mdc 文件
3. **步骤化流程**：1234 步
4. **代码模板**：可直接复制的代码块
5. **检查清单**：完成后的自检项
6. **沉淀机制**：完成后更新文档的指引

#### 公共技能（shared-skills/，15 个）

覆盖通用开发场景的能力：

- **代码质量类**：frontend-code-review（Vue/TS 审查，含 8 个参考文档）、smart-commit（规范化提交）
- **设计类**：canvas-design（画布设计，含 30+ 字体）、frontend-design（前端设计）
- **文档类**：document-to-pptx（文档转 PPT）、skill-doc-generator（技能文档生成）
- **工程类**：mcp-builder（MCP 服务构建）、skill-creator（技能创建向导）、rule-creator（规则创建）
- **协作类**：git-commit-helper（提交辅助）、gitlab-mr-create（MR 创建）、senior-prompt-engineer（提示词工程）
- **工具类**：mastergo-design-restore（设计稿还原）

### rules/ — 规则体系

#### 项目规则（project-rules/，14 个文件）

编号体系（01-12）确保加载顺序和覆盖完整性：

| 编号 | 规则 | 约束内容 | globs 触发条件 |
|------|------|---------|---------------|
| 01 | project-overview | 项目定位与技术栈 | package.json, README.md 等 |
| 02 | coding-style | 命名、格式、注释规范 | **/*.vue, **/*.ts 等 |
| 03 | project-structure | 目录结构约定 | — |
| 04 | component-guide | 组件设计与拆分 | **/*.vue |
| 05 | api-guide | 接口封装规范 | **/api/**, **/*.ts |
| 06 | routing-guide | 路由注册规范 | **/router/** |
| 07 | state-management | Pinia Store 规范 | **/store/** |
| 08 | common-constraints | 通用约束（日期、防抖等） | — |
| 09 | styling-guide | 样式规范 | **/*.vue, **/*.scss |
| 10 | documentation | 文档规范 | **/*.md |
| 11 | testing-guide | 测试规范 | **/*.spec.ts |
| 12 | skill-doc-sync | 技能文档同步规范 | .agents/** |

**设计亮点**：
- 编号命名确保加载顺序（01 先于 02）
- globs 条件触发减少不必要的上下文加载（如 05-api-guide 只在 api 目录文件触发）
- `alwaysApply: false` + globs 实现「按需加载」，节约上下文窗口

#### 共享规则（shared-rules/）

跨项目通用的规则，如 `language-chinese.mdc`（强制中文注释）。

### mcp/ — MCP 外部工具接入

```json
{
  "mcpServers": {
    "mastergo-magic-mcp": {
      "command": "npx",
      "args": ["-y", "@mastergo/magic-mcp", ...]
    }
  }
}
```

- **接入的服务**：MasterGo（设计工具）的 MCP Server
- **提供的能力**：让 AI 直接读取 MasterGo 设计稿，实现「设计稿 → 代码」的自动化
- **配置要点**：通过 npx 运行（无需预安装），token 认证，指向特定服务 URL

### handbook/ — AI 工程知识库

为「人类和 Agent 共同查阅」设计的文档体系：

| 文档 | 解决的知识需求 |
|------|-------------|
| ai-engineering.md | AI 工程化全局：Rules/Skills/Agents/MCP 的关系 |
| agents-platform-integration.md | 如何让 Cursor、Claude Code 等多平台共用同一套配置 |
| composite-engineering-practices.md | 复杂任务的复合工程实践方案 |
| developer-ai-capability-levels.md | 开发者 AI 能力分级模型 |
| how-to-write-rules.md | Rules 编写方法论 |
| how-to-write-skills.md | Skills 编写方法论 |
| mcp-implementation-guide.md | MCP Server 接入实操 |
| rules-vs-skills-guide.md | Rules 和 Skills 的边界与选择 |
| skill-rule-creation-checklist.md | 新建 Skill/Rule 的检查清单 |
| mastergo-mcp-usage.md | MasterGo MCP 使用说明 |

**设计亮点**：handbook 不是纯人类文档——Agent 也可以读取这些文档来理解「如何正确地创建新的 Rule 或 Skill」，形成**自举（bootstrapping）**的闭环。

## 核心设计模式

### 1. 唯一源（Single Source of Truth）

所有 Rules、Skills、Agents、MCP 配置只在 `.agents/` 维护，Cursor 的 `.cursor/` 和 Claude 的 `.claude/` 通过符号链接引用。

**为什么好**：修改一处，多平台生效。避免 `.cursor/rules/` 和 `.claude/rules/` 内容不同步。

### 2. 引用式组合

Agent 不复制规则内容，只引用规则文件路径：
```markdown
## 必须遵守的规则
- `.agents/rules/project-rules/05-api-guide.mdc`
```

**为什么好**：规则更新后所有引用它的 Agent 自动生效，无需逐个修改 Agent 定义。

### 3. 分层知识管理

```
Rules（标准层）→ Skills（操作层）→ Agents（编排层）
    ↓                  ↓                  ↓
 "怎么做才算对"    "一步步怎么做"    "谁在什么时候做"
```

**为什么好**：每一层聚焦自己的问题，不越界。新增一个功能点时，只需要判断它属于「标准」（加 Rule）、「流程」（加 Skill）还是「分工」（加 Agent）。

### 4. 项目/共享分离

rules 和 skills 都区分 `project-` 和 `shared-`：
- Project：与具体项目技术栈绑定（如 Vue 3 + Element Plus）
- Shared：跨项目通用（如 git 提交、设计稿还原）

**为什么好**：换项目时 shared 部分可以直接复用，只替换 project 部分。

### 5. 完成标准强制

每个 Agent 和 Skill 都定义「完成标准」（checklist）：
```markdown
## 完成标准
- [ ] pnpm type-check 零错误
- [ ] pnpm lint 零 error
```

**为什么好**：给 AI 一个明确的「停手条件」，防止无限修改或遗漏检查项。

## 学习路径建议

1. **先读** `README.md` 和 `ai-engineering.md`，理解全局架构
2. **再看** `rules/project-rules/` 的 01-12，理解「规范长什么样」
3. **然后** 挑一个 Skill（如 `create-api`），理解「规范如何落地为步骤」
4. **最后** 看 `agents/`，理解「多 Agent 如何协作」
5. **想复刻时**，参考 `agents-structure-blueprint.md`
