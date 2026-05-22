# Enterprise AI Data Agent — React Workspace

Next.js 15 + React 19 + TypeScript 企业级 AI 数据分析工作台。

## 快速开始

```bash
cd frontend-react
npm install
npm run dev
```

打开 http://localhost:3000

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 | App Router, SSR, API proxy |
| React 19 | UI 组件 |
| TypeScript | 类型安全 |
| TailwindCSS 4 | 原子化样式 |
| TanStack Table | 数据表格 (排序/筛选/virtual scroll) |
| react-resizable-panels | 可缩放面板布局 |
| react-i18next | 国际化 (中/英) |
| Zustand | 状态管理 |
| lucide-react | 图标 |

## 目录结构

```
frontend-react/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页 (Workspace)
│   ├── components/
│   │   └── ui/                 # 通用 UI 组件
│   │       ├── data-table.tsx  # TanStack Table 封装
│   │       ├── tooltip.tsx     # Tooltip 组件
│   │       ├── tab-group.tsx   # 标签页组
│   │       └── status-badge.tsx
│   ├── panels/                 # 工作台面板
│   │   ├── file-upload-panel.tsx
│   │   ├── chat-panel.tsx
│   │   ├── data-preview-panel.tsx
│   │   └── status-panel.tsx
│   ├── layout/                 # 布局组件
│   │   ├── workspace-layout.tsx # 可缩放三栏布局
│   │   └── header.tsx          # 顶部栏 + 语言切换
│   ├── hooks/                  # 自定义 Hooks
│   │   └── use-language.ts
│   ├── stores/                 # Zustand 状态
│   │   ├── workspace-store.ts  # 布局/语言/面板状态
│   │   └── data-store.ts       # 数据/聊天/日志状态
│   ├── services/               # API 服务层
│   │   └── api.ts              # 空接口 (Future FastAPI)
│   ├── i18n/                   # 国际化
│   │   ├── index.ts            # i18next 初始化
│   │   ├── en.ts               # English
│   │   └── zh.ts               # 中文
│   ├── styles/
│   │   └── globals.css         # 全局样式 + CSS 变量
│   ├── types/
│   │   └── index.ts            # 核心类型定义
│   └── utils/
│       ├── cn.ts               # className 合并
│       └── index.ts            # 工具函数
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

## 架构设计

### Workspace Layout

```
┌──────────────────────────────────────────────────────────┐
│  Header (title + panel toggles + language toggle)        │
├──────────┬────────────────────────┬──────────────────────┤
│          │                        │  Tabs:               │
│  Left    │   Center               │  - Data Preview      │
│  Panel   │   Panel                │  - Charts            │
│          │                        │  - Agent Logs        │
│  - File  │   - AI Chat            │                      │
│    Upload│                        │  (TanStack Table)    │
│  - Status│                        │                      │
├──────────┴────────────────────────┴──────────────────────┤
│  ↕ react-resizable-panels (drag to resize)               │
└──────────────────────────────────────────────────────────┘
```

### 状态管理 (Zustand)

- `workspace-store`: 语言、布局预设、面板折叠状态
- `data-store`: 数据库表、当前数据、质量报告、聊天、日志

### API 策略

当前 `services/api.ts` 为空接口层。

未来通过 `next.config.ts` 的 `rewrites` 代理到 FastAPI 后端：

```
前端 (Next.js :3000) → /api/* → FastAPI (:8000) → DuckDB
```

### i18n

使用 `react-i18next`，所有 UI 文本通过 `t("key")` 获取。

语言切换实时生效，无需刷新页面。

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # ESLint 检查
npm run type-check   # TypeScript 类型检查
```

## 后续阶段

- [ ] FastAPI 后端接口
- [ ] 文件上传 → DuckDB 自动导入
- [ ] 数据质量面板
- [ ] AI Agent 聊天集成
- [ ] 图表可视化 (Plotly/D3)
- [ ] LangGraph 工作流
