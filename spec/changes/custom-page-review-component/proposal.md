# Proposal: 基于 react-page-review SDK 自封装评审组件

## Change ID

`custom-page-review-component`

## Why

当前直接使用 `ReviewTool` 组件及其内置样式，UI 风格（工具条、弹窗、按钮）与系统的 Ant Design 设计体系不一致，且无法按需定制。react-page-review 0.6.0 起导出无头 SDK（`usePageReview`、inspector、screenshot 工具），宿主可以自行封装组件与样式，只复用数据层和能力层。

## What Changes

1. 新增 `src/components/PageReview/`：
   - `index.jsx`：评审组件，接收 `active` / `onActiveChange` prop（与 ReviewTool 相同的受控接口），active 为 false 时不渲染任何 DOM。
   - `PageReview.css`：自有样式（overlay、高亮框、拖拽框），不引入 `react-page-review/style.css`。
2. 组件能力（基于 SDK）：
   - 元素选择：mousemove 高亮 + 点击选中（`getNodeInfo`）。
   - 框定视图：拖拽绘制矩形选区。
   - 评审表单：Ant Design Modal + Form（标题、严重等级、评审建议），提交时调用 `captureElement` / `captureBox` 截图并 `addReview`。
   - 评审列表：Ant Design Modal + List，按当前页过滤，支持删除、标记已解决。
   - 导出：JSON / Markdown / ZIP（`exportToJSON` / `exportToMarkdown` / `exportToZIP`）。
   - ESC 与“退出评审”按钮调用 `onActiveChange(false)`。
3. 修改 `src/App.jsx`：用自封装组件替换 `ReviewTool`，移除 `react-page-review/style.css` 引入。
4. 依赖升级到 `react-page-review@^0.6.0`。

## Impact

- **代码**：新增 `src/components/PageReview/index.jsx`、`src/components/PageReview/PageReview.css`；修改 `src/App.jsx`、`package.json`。
- **行为**：评审入口、打开/退出行为不变；工具条与弹窗变为 Ant Design 风格。
- **数据**：沿用 `usePageReview` 的 localStorage 存储（`page-reviews` key），历史评审记录保留。

## 验证

- 页面加载后无评审 DOM；点击右下角按钮打开；ESC / 退出按钮关闭。
- 选择元素 → 填表单 → 提交后评审记录出现在列表中且 localStorage 有数据。
- 框定视图可绘制选区并提交评审。
- 三种导出可下载文件。
- `npm run build` 通过。
