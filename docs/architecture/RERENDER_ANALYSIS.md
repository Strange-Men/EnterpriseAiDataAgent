# RERENDER_ANALYSIS.md — Compatibility Wrapper Rerender Audit

> v0.8.3 Stabilization Sprint

---

## 问题描述

4 个 deprecated compatibility wrapper store 使用 subscribe + setState 模式：

```ts
// 模式（所有 4 个 wrapper 相同）
export const useWrapperStore = create<WrapperState>(() => snapshot());

useCanonicalStore.subscribe(() => {
  useWrapperStore.setState(snapshot(), true);  // true = replace
});
```

### 风险机制

1. **无变更检测**：每次 canonical store 的 *任何* 字段变化，wrapper 都会执行 `snapshot()` 重建整个状态对象
2. **无 shallow compare**：`setState(snapshot(), true)` 使用 replace 模式，即使新旧 snapshot 内容完全相同，也会触发所有 subscriber 的 rerender
3. **级联放大**：如果 wrapper store 的 subscriber 组件又触发了 canonical store 的写入，可能形成循环

### 影响范围

| Wrapper Store | 包装目标 | 外部 import 数 |
|---|---|---|
| `ai-session-store.ts` | investigation-store | **0** |
| `workflow-store.ts` | investigation-store | **0** |
| `query-tabs-store.ts` | sql-editor-store | **0** |
| `sql-workspace-store.ts` | sql-editor-store | **0** |

**结论**：4 个 wrapper store 均为 dead code，无任何外部文件 import。

---

## 修复方案

### 方案选择

| 方案 | 描述 | 复杂度 | 风险 |
|---|---|---|---|
| A. 加 shallow compare | 在 subscribe 中比较新旧 snapshot，仅在内容变化时 setState | 低 | 低 |
| B. 删除 wrapper | 直接删除 dead code | 最低 | 最低 |
| C. 改为 selector proxy | 将 wrapper 改为纯 selector 函数，不创建独立 store | 中 | 中 |

**选择方案 B**：wrapper 为 dead code，shallow compare 修复无意义。删除是最干净的解决方案。

### 实施

删除以下 4 个文件：
- `frontend-react/src/stores/ai-session-store.ts`
- `frontend-react/src/stores/workflow-store.ts`
- `frontend-react/src/stores/query-tabs-store.ts`
- `frontend-react/src/stores/sql-workspace-store.ts`

测试文件保留（已直接 import canonical store）。

---

## 现有组件的 rerender 最佳实践

当前代码库中组件使用 zustand selector 模式，已是最佳实践：

```ts
// ✅ 精确 selector — 仅 activeRunId 变化时 rerender
const activeRunId = useAnalysisStore((s) => s.activeRunId);

// ✅ 精确 selector — 仅 activeTable 变化时 rerender
const activeTable = useInvestigationStore((s) => s.activeTable);
```

未使用 `useShallow` 的场景：
- 组件通常只读取 1-2 个字段，selector 已足够精确
- 解构模式（如 `const { a, b } = useStore()`）在当前代码中未出现于高频 rerender 路径

**结论**：现有组件无 rerender 问题，无需额外优化。

---

## 验证结果

| 检查项 | 状态 |
|---|---|
| TypeScript | ✅ PASS |
| Build | ✅ PASS |
| Tests (158/158) | ✅ PASS |
| Dead wrapper 删除 | ✅ 完成 |
| 组件 selector 模式 | ✅ 最佳实践 |
