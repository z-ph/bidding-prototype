# Proposal: 评审功能回退为使用 react-page-review 提供的 ReviewTool 组件

## Change ID

`revert-to-provided-review-tool`

## Why

自封装 `PageReview` 组件在交互完整性上不及库自带的 `ReviewTool`（工具栏/面板可拖动与缩放、组件树查看、截图类型选择、选区缩放手柄等），继续在宿主侧维护一套平行实现成本高且体验落后。`ReviewTool` 0.6.0 已修复 active 守卫问题，直接使用即可获得全部能力。

## What Changes

1. `src/App.jsx`：改回引入 `ReviewTool` 与 `react-page-review/style.css`，受控接口（`active` / `onActiveChange`）不变。
2. 删除自封装组件 `src/components/PageReview/`（`index.jsx`、`PageReview.css`）。
3. 依赖保持 `react-page-review@^0.6.0`。

## Impact

- **代码**：修改 `src/App.jsx`，删除 `src/components/PageReview/`。
- **行为**：评审入口不变；评审 UI 恢复为库内置样式与完整交互（可拖动/缩放工具栏、多选、组件树、三种导出等）。
- **数据**：`usePageReview` 存储 key 未变（`page-reviews`），历史评审记录保留。

## 验证

- 页面加载默认隐藏；右下角按钮打开；ESC/“退出评审”关闭。
- 工具栏可拖动；元素选择、框选、提交、列表与导出可用。
- `npm run build` 通过。
