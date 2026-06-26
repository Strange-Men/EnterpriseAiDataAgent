# M4-8.8.2.z History Dropdown Position Hotfix

## 1. Goal

修复线上 smoke 发现的 History More 菜单仍与卡片内容重叠的问题。

## 2. User-reported Issue

More 菜单打开后覆盖卡片内容，用户体验很差。之前通过提升 z-index 的修法不够。

## 3. Root Cause

之前 z-index 修复不够的原因：**问题不是层级（stacking context），而是父容器裁切（overflow clipping）**。

`DropdownMenu` 组件使用 `position: absolute` 定位在 `relative inline-block` 容器内。History 列表的滚动父级使用 `overflow-y-auto`，这会裁切所有绝对定位的溢出子元素 —— 无论 z-index 多高，`overflow: auto` 的祖先元素都会将超出其边界的内容裁切掉。

同时，菜单使用 CSS 变量 `--z-dropdown: 50` 作为 z-index，这个值不够高，且无法脱离父容器的 stacking context。

## 4. Changes

### 4.1 `frontend-react/src/components/ui/dropdown-menu.tsx`

核心修复：**Portal 化 + 视口坐标定位**

- 使用 `createPortal` 将菜单内容渲染到 `document.body`，彻底脱离父容器 overflow 裁切
- 使用 `getBoundingClientRect()` 获取触发按钮的视口坐标，用 `position: fixed` 定位
- `align="right"` 时：菜单右边缘对齐按钮右边缘（`left = rect.right - menuW`）
- `align="left"` 时：菜单左边缘对齐按钮左边缘
- 视口边界保护：`Math.max(8, Math.min(left, viewport - menuW - 8))`
- z-index 使用内联样式 `2147483647`（最大 32 位整数），不再依赖 CSS 变量
- 增加 `data-testid="history-record-menu"` 用于测试
- 增加 scroll/resize 监听器，滚动时重新计算位置
- click-outside 检测改为分别检查 trigger 和 menu（因为 menu 不再是 container 的子元素）

### 4.2 `frontend-react/src/panels/sql-history-panel.tsx`

- 移除卡片上之前无效的 `z-10` class（`openDropdownEntryId === entry.id ? "z-10" : ""`）
- Portal 化后菜单不再是卡片的子元素，z-10 已无意义

### 4.3 `frontend-react/src/app/(shell)/__tests__/history-dropdown-position.test.tsx`

新增测试文件，覆盖：
1. 菜单点击后出现
2. 菜单有 `data-testid="history-record-menu"`
3. 菜单使用 `position: fixed`（Portal 特征）
4. 菜单有高 z-index（`2147483647`）
5. 菜单有 `min-width: 160px`
6. Escape 关闭菜单
7. 点击外部关闭菜单
8. 默认右对齐
9. 不依赖 hover 可见
10. danger 样式应用到删除菜单项
11. 所有 i18n key 保留：rerun-analysis, export-md, copy-question, delete, more-actions

## 5. What Was Not Changed

- 未改后端
- 未改数据库
- 未改 History 数据逻辑
- 未改 Detail 页面
- 未改 Export 业务逻辑
- 未改 rerun draft 逻辑
- 未改 LLM provider selector
- 未改 fallback notice
- 未提交 .env / secret
- 未开始 M5 Agent
- 未打 tag

## 6. Tests

新增 `history-dropdown-position.test.tsx`，共 16 个测试用例：

| 测试组 | 用例数 | 覆盖内容 |
| --- | --- | --- |
| DropdownMenu Portal Position | 9 | 渲染、打开、data-testid、fixed 定位、z-index、min-width、Escape 关闭、外部关闭、右对齐、非 hover 依赖 |
| DropdownMenuItem Danger | 2 | danger class 应用/不应用 |
| History menu items i18n | 5 | rerun、export、copy、delete、more-actions |

## 7. Validation

待执行（tsc、test、build、lint、backend import、pytest、ruff、安全搜索）。

## 8. Online Smoke Checklist

- History 打开 `...` 菜单不遮挡卡片内容
- 菜单右边缘对齐按钮右边缘
- 菜单向左展开，不覆盖卡片正文
- 第一条记录和后续记录菜单都不重叠
- 菜单项完整可读
- 删除记录保持红色 danger
- 重新运行仍能回填问题
- 导出 / 复制 / 删除仍正常
- 滚动历史列表时菜单位置跟随或关闭
- 菜单不被后续卡片覆盖

## 9. Next Step

重新进行 History 页面线上 smoke。
通过后进入 M4-8.8.3 Final Release Candidate Report。
暂不进入 M5 Agent。
暂不打 tag。
