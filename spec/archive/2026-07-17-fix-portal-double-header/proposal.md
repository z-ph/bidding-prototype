# Proposal: 修复门户双 Header 与导航菜单不可用

## Change ID

`fix-portal-double-header`

## Why

线上评审 `page-reviews-20260714-1422.zip`（严重等级：严重，页面 `/bidding-prototype/`）：

> 为什么有两个Header，并且第一个Header里面的菜单上根本用不了？放在哪里的意义是什么?

代码核实（`src/views/Portal.jsx`），两点全部属实：

1. **导航菜单是死的**：`portal-header` 里 首页/交易信息/新闻公告/帮助中心/下载中心 5 个 `<Button type="link">`（`:171-175`）**没有任何 onClick**，点击完全无响应。
2. **筛选栏脱离内容**：`.filter-nav`（`:184-192`）是公告类型筛选 RadioGroup，却以白色通栏 + sticky 的形式放在 header 和 banner 之间，视觉上就是「第二个 Header」；它控制的表格在 banner 下方首屏之外，点击筛选后用户看不到任何变化，造成「用不了」的观感。该结构由 `update-portal-notice-filter` 变更引入，本次评审认定其设计不合理，予以回退。

## What Changes

1. **删除独立 `.filter-nav` 通栏**，RadioGroup 移回「交易信息」区的 `section-title` 行（h2 右侧，该行本就是 flex space-between），筛选与表格相邻，点击即时可见结果；同步删除 `.filter-nav` 样式块。
2. **header 导航接线**：
   - 首页 → 平滑滚动到页面顶部
   - 交易信息 → 平滑滚动到 `#portal-notice-section`
   - 新闻公告 / 帮助中心 / 下载中心 → `message.info('XX功能建设中，敬请期待')`（原型未建这些页面，给出明确反馈而非死按钮）
3. `.section` 增加 `scroll-margin-top: 80px`，避免 sticky header（64px）遮挡锚点跳转后的区块标题。

## Impact

- **代码**：仅 `src/views/Portal.jsx`
- **行为**：门户回到单 Header；所有导航按钮可点且有明确反馈；筛选器与表格相邻
- **不受影响**：driver.js 新手指引步骤引用的 `.logo` / `#portal-notice-section` / `#portal-notice-table .ant-btn` / `#portal-quick-links` / `#portal-login-btn` 全部保留

## 验证

- 本地 dev 冒烟（Playwright）：
  - 点击 header 各导航按钮：首页/交易信息触发滚动，其余三个弹出 message 提示
  - 点击筛选 RadioButton，表格行数即时变化（如「变更公告」筛选后仅剩 1 行）
  - 断言页面只存在一个 `header` 通栏（`.filter-nav` 不存在）
- 构建 + 部署 gh-pages + 线上冒烟同上

## 状态（2026-07-17 实施完成）

- 总体状态：已完成（代码核实，评审变更页面无对应条目）
- 任务统计：3 任务 — 3 已修复 / 0 部分修复 / 0 未修复 / 0 待确认 / 0 未跟踪
- 依据：2026-07-17 代码核实通过：单 header、.filter-nav 零匹配
