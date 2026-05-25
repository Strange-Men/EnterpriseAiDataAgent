# .agents 结构搭建指南

> 生成时间: 2026-05-06
> 源目录: d:\work-project\learn\.agents
> 目标：从零复刻一个同类型的 AI 配置工程体系

## 一、目录结构总览

```
项目根/
├── AGENTS.md                          # AI 使用入口，登记所有 Skills
├── CLAUDE.md                          # Claude 专用约束与环境说明
├── .agents/                           # 唯一起源（所有配置的唯一维护源）
│   ├── README.md                      # 目录总说明 + 多平台接入方案
│   ├── agents/                        # 子 Agent 定义
│   │   ├── README.md                  # Agent 索引与分工说明
│   │   ├── <agent-name>.md            # 单个 Agent 定义（kebab-case）
│   │   └── ...
│   ├── rules/                         # 规则体系
│   │   ├── README.md                  # 规则总览
│   │   ├── project-rules/             # 项目级规则（编号命名）
│   │   │   ├── README.md              # 规则索引
│   │   │   ├── NN-<topic>.mdc         # 编号规则文件
│   │   │   └── ...
│   │   └── shared-rules/              # 共享级规则
│   │       ├── README.md
│   │       └── <topic>.mdc
│   ├── skills/                        # 技能体系
│   │   ├── README.md                  # 技能索引
│   │   ├── project-skills/            # 项目技能
│   │   │   ├── README.md
│   │   │   └── <skill-name>/          # 每个 Skill 一个目录
│   │   │       └── SKILL.md           # Skill 入口文件
│   │   └── shared-skills/             # 公共技能
│   │       ├── README.md
│   │       └── <skill-name>/
│   │           ├── SKILL.md
│   │           ├── references/        # 参考文档（可选）
│   │           ├── scripts/           # 脚本资源（可选）
│   │           └── assets/            # 静态资源（可选）
│   ├── mcp/                           # MCP 配置
│   │   ├── README.md
│   │   └── mcp.json                   # MCP Server 定义
│   ├── handbook/                      # AI 工程知识库
│   │   ├── README.md
│   │   └── <domain>/                  # 按领域分目录
│   │       ├── README.md
│   │       └── <topic>.md
│   └── templates/                     # 流程模板
│       └── <template-name>.md
├── .cursor/                           # Cursor 符号链接目标
│   ├── rules → .agents/rules
│   ├── skills → .agents/skills
│   └── mcp.json → .agents/mcp/mcp.json
└── .claude/                           # Claude Code 符号链接目标
    ├── rules → .agents/rules
    ├── skills → .agents/skills
    ├── agents → .agents/agents
    └── mcp.json → .agents/mcp/mcp.json
```

## 二、搭建步骤

### 第 1 步：创建根目录和入口文件

```bash
mkdir -p .agents/{agents,rules/project-rules,rules/shared-rules,skills/project-skills,skills/shared-skills,mcp,handbook,templates}
```

创建项目根目录下的 `AGENTS.md`（AI 使用入口）：

```markdown
# AI 使用入口

## 规则
- 项目规则见 `.agents/rules/project-rules/`
- 共享规则见 `.agents/rules/shared-rules/`

## 技能
<!-- 在此登记所有可用的 Skills -->
```

创建 `CLAUDE.md`（Claude 项目上下文）：

```markdown
# 项目名

## 技术栈
- 框架: [填写]
- 语言: [填写]
- 构建工具: [填写]

## 环境要求
- Node.js >= [版本]
- pnpm >= [版本]
```

### 第 2 步：编写 Rules（定义"怎么才算对"）

#### 2.1 创建第一个项目规则

规则文件格式（`.mdc`）：

```markdown
---
alwaysApply: false
description: [一句话描述这个规则约束什么]
globs:
  - "[glob 模式，控制规则何时加载]"
---

# [规则标题]

## [小节1]
[具体约束内容]

## [小节2]
[具体约束内容]
```

**globs 设计原则**：
- 精准匹配：`**/api/**` 只对 API 目录下的文件生效
- 避免空 globs：无 globs 时设置 `alwaysApply: true`（但谨慎使用）
- 目的：减少不必要加载，节约上下文窗口

#### 2.2 规则编号策略

```
01-project-overview    # 项目全局（先加载）
02-coding-style        # 编码规范（高频）
03-project-structure   # 目录结构
04-component-guide     # 组件规范
05-api-guide           # 接口规范
06-routing-guide       # 路由规范
07-state-management    # 状态管理
08-common-constraints  # 通用约束
09-styling-guide       # 样式规范
10-documentation       # 文档规范
11-testing-guide       # 测试规范
12-skill-doc-sync      # 元规范（如何维护规范本身）
```

- 从 01 开始编号，便于排序和引用
- 编号隐含优先级（01 是全局基础，后面的更具体）
- 预留空号便于未来插入

#### 2.3 创建规则索引 README

`rules/project-rules/README.md`：

```markdown
# 项目规则索引

| 编号 | 规则名 | 约束范围 | 适用文件 |
|------|--------|---------|---------|
| 01 | project-overview | 项目全局 | package.json, README |
| 02 | coding-style | 代码风格 | **/*.vue, **/*.ts |
...
```

### 第 3 步：构建 Skills（定义"一步步怎么做"）

#### 3.1 Skill 文件模板

每个 Skill 一个目录，目录名用 kebab-case，内含 `SKILL.md`：

```markdown
---
name: skill-name
description: [这个 Skill 做什么，什么时候用它]
---

# [Skill 标题]

## 使用场景
- 场景1
- 场景2

请同时遵守 `.agents/rules/project-rules/XX-xxx.mdc`。

---

## 步骤 1：[步骤名]
[具体操作]

## 步骤 2：[步骤名]
[具体操作 + 代码模板]

```[lang]
[代码示例]
```

---

## 快速检查清单
- [ ] 检查项1
- [ ] 检查项2

## 完成标准
- [ ] 标准1
- [ ] 标准2
```

#### 3.2 项目技能 vs 公共技能

| | 项目技能 | 公共技能 |
|------|---------|---------|
| 位置 | `skills/project-skills/` | `skills/shared-skills/` |
| 与项目关系 | 绑定具体技术栈 | 技术栈无关 |
| 示例 | create-api（Vue + Element Plus） | git-commit-helper（通用 Git） |
| 可复刻性 | 换项目需重写 | 直接复用 |

#### 3.3 技能包含资源（可选）

```
<skill-name>/
├── SKILL.md            # 必须：入口
├── references/         # 可选：参考文档（>100 行的放这里）
│   └── <topic>.md
├── scripts/            # 可选：可执行脚本
│   └── <script>.py
└── assets/             # 可选：静态资源
    └── <file>
```

### 第 4 步：定义 Agents（"谁负责什么"）

Agent 文件格式（`agents/<name>.md`）：

```markdown
---
name: agent-name
description: [Agent 的职责，Claude 据此判断何时启用]
tools: Read, Write, Edit, Glob, Grep, Bash  # 需要的工具
model: sonnet  # 使用的模型
---

# agent-name — [一句话描述]

## 职责边界
- **只做**：[列出职责]
- **不做**：[列出边界]

## 必须遵守的规则
- `.agents/rules/project-rules/XX-xxx.mdc`
- `.agents/rules/project-rules/YY-yyy.mdc`

## 执行步骤
### Step 1：[步骤名]
### Step 2：[步骤名]
...

## 完成标准
- [ ] 标准1
- [ ] 标准2
```

**Agent 设计原则**：
- 每个 Agent 职责单一，不跨界
- 显式引用 Rules（不复制规则内容）
- 完成标准明确（AI 知道何时停手）
- 按流水线排序：分析 → 设计 → 实现 → 审查

### 第 5 步：配置 MCP（"外部工具怎么接"）

`mcp/mcp.json`：

```json
{
  "mcpServers": {
    "<service-name>": {
      "command": "npx",
      "args": ["-y", "<package-name>", "--token=<token>", "--url=<url>"],
      "env": {}
    }
  }
}
```

- `command`：运行方式（`npx` 免预安装，`node` 需预装）
- `args`：参数列表（敏感信息如 token 放这里）
- 一个 mcp.json 可配置多个 MCP Server

### 第 6 步：建立 Handbook（知识库）

按领域分子目录：

```
handbook/
├── README.md
└── <domain>/
    ├── README.md
    └── <topic>.md
```

常见领域：
- `ai-engineering/` — AI 工程化方法论
- `skills/` — Skill 使用文档和模板
- `<业务领域>/` — 项目特定的业务知识

Handbook 文档的定位：**供人类和 AI 同时阅读**，AI 可以读它来理解「如何正确创建新规则/技能」。

### 第 7 步：建立多平台符号链接

```bash
# 在项目根目录执行

# Cursor
mkdir -p .cursor
ln -s ../.agents/rules .cursor/rules
ln -s ../.agents/skills .cursor/skills
ln -s ../.agents/mcp/mcp.json .cursor/mcp.json

# Claude Code
mkdir -p .claude
ln -s ../.agents/rules .claude/rules
ln -s ../.agents/skills .claude/skills
ln -s ../.agents/agents .claude/agents
ln -s ../.agents/mcp/mcp.json .claude/mcp.json
```

> Windows 注意：符号链接需要管理员权限或开发者模式。替代方案：在 `.cursor/` 和 `.claude/` 下创建 README 说明映射关系。

## 三、命名与格式规范

| 文件类型 | 存放位置 | 文件命名 | 扩展名 | Frontmatter 必填字段 |
|---------|---------|---------|--------|-------------------|
| Agent 定义 | agents/ | `kebab-case.md` | .md | name, description, tools, model |
| 项目规则 | rules/project-rules/ | `NN-topic.mdc` | .mdc | alwaysApply/globs, description |
| 共享规则 | rules/shared-rules/ | `topic.mdc` | .mdc | alwaysApply/globs, description |
| 技能入口 | skills/*/skill-name/ | `SKILL.md`（固定名） | .md | name, description |
| 技能参考 | skills/*/skill-name/references/ | `topic.md` | .md | 无 |
| 入口索引 | skills/*/ | `README.md`（固定名） | .md | 无（项目级可用 name,description） |
| MCP 配置 | mcp/ | `mcp.json`（固定名） | .json | 无 |
| 手册文档 | handbook/领域/ | `topic.md` | .md | 无 |
| 模板文件 | templates/ | `NAME-template.md` | .md | 无 |

**命名约定**：
- 目录和文件名统一用 `kebab-case`
- Skill 入口文件固定为 `SKILL.md`（大写）
- 每个子目录必须含 `README.md` 作为索引
- 规则文件使用两位数字编号前缀

## 四、关键设计决策

### 决策 1：唯一源 vs 平台各自维护

**选择**：唯一源（`.agents/`）+ 符号链接

**为什么**：
- 修改一处，所有平台（Cursor、Claude Code）自动生效
- 避免「Cursor 的 rules 和 Claude 的 rules 不一致」的噩梦

**代价**：需要维护符号链接，Windows 上有权限问题

### 决策 2：Rules 用 .mdc 格式 + globs 触发

**选择**：`.mdc` 文件 + `globs` 字段按需加载

**为什么**：
- `.mdc` 支持 YAML frontmatter 定义触发条件
- `globs` 让规则只在相关文件修改时才加载，节约上下文窗口
- 相比于「全量加载所有规则」，上下文使用效率高得多

**代价**：globs 配置不当时，规则可能不触发（需测试验证）

### 决策 3：Agent 引用 Rules 而非复制

**选择**：Agent 定义中只写规则文件路径，不复制规则内容

**为什么**：
- 规则更新时，所有 Agent 自动生效
- Agent 定义保持简洁，聚焦「职责分工」而非「规范细节」

**代价**：需要 Claude 有读取引用文件的能力（已验证可行）

### 决策 4：编号命名（01-12）vs 语义命名

**选择**：编号前缀 + 语义后缀（如 `05-api-guide.mdc`）

**为什么**：
- 编号确保文件系统自然排序 = 加载优先级
- 语义后缀让人类也能快速识别内容
- 新增规则时编号暗示了「应该插在哪里」

**代价**：删除规则时编号会断档（可接受，不影响功能）

### 决策 5：项目 vs 共享分离

**选择**：rules 和 skills 都区分 project 和 shared

**为什么**：
- 换项目时 shared 部分可直接复制复用
- 明确哪些是「项目特有的约定」vs「通用工程实践」

**代价**：有时边界模糊（一个 skill 半通用半专用），需要判断力

## 五、搭建检查清单

从零搭建完成后，逐项检查：

- [ ] `AGENTS.md` 存在且登记了所有 Skills
- [ ] 每个子目录有 README.md 索引
- [ ] 项目规则按编号命名（01-12），globs 配置正确
- [ ] 每个 Skill 有独立目录 + SKILL.md，含完成标准
- [ ] Agent 定义显式引用依赖的 Rules
- [ ] MCP 配置不含硬编码的敏感信息
- [ ] Handbook 至少含 ai-engineering 和 skills 两个领域
- [ ] 符号链接就位（或 README 说明映射关系）
- [ ] 所有 Agent/Skill 的 frontmatter description 使用第三人称

## 六、扩展方向

基于当前 `.agents` 的设计，可持续扩展：

1. **新增 Agent**：在 `agents/` 下添加新角色（如 test-writer、db-designer）
2. **新增规则**：按编号插入新规则（如 `04-xxx` 插在 04 和 05 之间）
3. **新增 Skill**：在 `project-skills/` 或 `shared-skills/` 下新增目录
4. **新增 MCP**：在 `mcp.json` 中追加新 Server
5. **新增知识**：在 `handbook/` 下新增领域目录
