# M4-7.1 Merge Validation

## 1. Merge Summary

- **Source branch**: `m4-7-1-scope-pruning`
- **Feature commit**: `c0e983c refactor: prune non-core product scope`
- **Merge commit**: `0080791 merge: M4-7.1 scope pruning`
- **Strategy**: `--no-ff` (no fast-forward, preserves branch history)
- **Merge date**: 2026-06-21

## 2. What Was Pruned

### Deleted pages

| Path | Purpose |
|------|---------|
| `frontend-react/src/app/performance/page.tsx` | 性能监控页 |
| `frontend-react/src/app/virtual-table/page.tsx` | 虚拟表格页 |

### Deleted components

| Path | Purpose |
|------|---------|
| `frontend-react/src/components/VirtualDataTable.tsx` | 虚拟数据表格组件 (571 行) |
| `frontend-react/src/components/ui/command-palette.tsx` | 命令面板 (210 行) |
| `frontend-react/src/components/ui/global-search.tsx` | 全局搜索 (152 行) |
| `frontend-react/src/components/ui/keyboard-shortcuts-modal.tsx` | 快捷键弹窗 (79 行) |

### Deleted hooks

| Path | Purpose |
|------|---------|
| `frontend-react/src/hooks/use-keyboard-shortcuts.ts` | 快捷键 hook (95 行) |

### Hidden navigation entries (via feature flags)

| Feature | Flag | Status |
|---------|------|--------|
| Scheduler worker 自动启动 | `backend/main.py` 注释 | Hidden |
| Charts | `features.ts` | Hidden |
| Anomalies | `features.ts` | Hidden |
| Full-Analysis | `features.ts` | Hidden |
| Templates | `features.ts` | Hidden |
| Schedule | `features.ts` | Hidden |
| Diff | `features.ts` | Hidden |
| Timeline | `features.ts` | Hidden |
| Bundle | `features.ts` | Hidden |
| QuickSql | `features.ts` | Hidden |

### Net change

- **Files changed**: 11
- **Lines added**: 295 (mostly scope audit docs)
- **Lines deleted**: 1,588
- **Net removal**: 1,293 lines

## 3. Core Flow Still Kept

确认核心链路完整保留：

```
Upload → Table Select → Preview → NL Query → AI SQL → Execute → Explain → History → Export
```

具体保留页面：

| Route | Status |
|-------|--------|
| `/` (首页) | ✅ 保留 |
| `/data` (数据页) | ✅ 保留 |
| `/query` (分析工作台) | ✅ 保留 |
| `/analyze` (分析结果) | ✅ 保留 |
| `/history` (历史) | ✅ 保留 |
| `/settings` (设置) | ✅ 保留 |

## 4. Local Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | ✅ 通过 |
| `vitest` (138 tests) | ✅ 全部通过 |
| `next build` | ✅ 编译成功，9 页面 |
| `backend import` | ✅ 通过 |
| `pytest` (449 tests) | ✅ 全部通过 |

Build 路由确认：

- ✅ 无 `/performance` 路由
- ✅ 无 `/virtual-table` 路由
- ✅ 无 `VirtualDataTable` 组件引用

## 5. Deployment Notes

### Vercel

- Push to `master` 后 Vercel 应自动触发重新部署
- 部署后 `/performance` 和 `/virtual-table` 页面将不再可用
- 无需额外配置变更

### Render (Backend)

- 后端唯一行为变化：scheduler worker 不再自动启动
- 这是实验功能降级，不影响核心数据查询链路
- 如 Render 未自动 redeploy，需手动触发

### Scheduler 说明

Scheduler worker 自动启动/停止已被注释（`backend/main.py`）。这是实验性后台调度功能，核心分析链路（NL → SQL → Execute → Explain）不受影响。

## 6. Online Manual Checklist

部署完成后需手动验证：

1. ✅ 首页能打开 (`/`)
2. ✅ 数据页能上传和预览 (`/data`)
3. ✅ 分析工作台自然语言查询可用 (`/query`)
4. ✅ 专家 SQL 可用
5. ✅ 历史页可用 (`/history`)
6. ✅ 设置页可用 (`/settings`)
7. ✅ `/performance` 不再作为产品页面（应 404 或不响应）
8. ✅ `/virtual-table` 不再作为产品页面（应 404 或不响应）
9. ✅ 顶栏没有命令面板 / 搜索 / 快捷键等干扰入口
10. ✅ Render 后端启动正常

## 7. Next Step

建议：

- 线上验证通过后进入 **M4-7.2 State Boundary Cleanup**
- 暂不进入 M5 Agent
- 暂不打 tag
