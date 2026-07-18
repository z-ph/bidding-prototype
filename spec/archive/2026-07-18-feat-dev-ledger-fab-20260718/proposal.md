# Proposal: 评审台账悬浮入口与 Tab 合并页

## Change ID

`feat-dev-ledger-fab-20260718`

## Why

评审变更列表与变更时间线是开发阶段台账，已从业务主导航移除（`fix-dev-ledger-out-of-business-nav-20260718`）。当前访问只能靠手动输 URL 或门户头部「评审变更」链接，开发/评审场景下不够顺手；且两个台账分散在两个页面，查看时需要分别打开。

需求（用户明确指示）：做一个**可移动的悬浮按钮，全局可见**，点击后打开一个页面，用 **Tab 切换**评审变更列表与变更时间线。

## What Changes

1. **可拖拽悬浮按钮**：新建 `src/components/DevLedgerFab.jsx`——圆形图标按钮（ProfileOutlined，title「评审台账（可拖拽）」），fixed 定位，初始 right:24/bottom:96（避让 react-page-review 右下角按钮）；pointer events 实现拖拽，位移 ≤5px 判定为点击并 `navigate('/admin/dev-ledger')`；位置存 localStorage（`bidding-dev-ledger-fab-pos`）刷新后保持；拖拽限制在视口内；z-index 900（低于 antd Modal 1000）。挂载于 `src/routes/__root.jsx` 根组件（`<Outlet />` 旁），全局所有页面（门户+登录+后台）可见。
2. **Tab 合并页**：新建 `src/views/DevLedger.jsx`——Tabs 两项：「评审变更列表」渲染 `<ReviewChangeList embedded />`，「变更时间线」渲染 `<Changelog embedded />`；activeKey 由 URL search `tab` 驱动（useSearch，默认 `review`），切换 tab 更新 search（replace），支持深链。两个组件新增可选 `embedded` prop：为 true 时隐藏各自页头 Title（避免与 tab label 重复），默认 false 不影响既有页面。新增路由 `src/routes/admin.dev-ledger.jsx`（staticData.title「评审台账」）+ `.lazy.jsx`（按 AGENTS.md 路由约定）；`permissions.js` 增加 `/admin/dev-ledger` 全角色。
3. **旧后台路由重定向**：`/admin/review-change-list` → `/admin/dev-ledger?tab=review`；`/admin/changelog` → `/admin/dev-ledger?tab=changelog`（beforeLoad redirect 带 search，参照 `admin.admin-dashboard.jsx` 模式；删除对应两个 `.lazy.jsx` 死文件，routeTree.gen.ts 自动重新生成）。公开路由 `/review-change-list`（PortalHeader 门户入口）保留不动。
4. **菜单不变**：任何角色主导航不新增入口——悬浮按钮即台账入口。
5. **文档台账**：AGENTS.md 台账一节更新入口说明（悬浮按钮 + Tab 合并页 + URL 深链）；role-permission-matrix.md 第七节同步；ReviewChangeList 登记 0718-ux-009；changelog 0.9.0；package.json 0.8.0 → 0.9.0。

## Impact

- **新增文件**：`src/components/DevLedgerFab.jsx`、`src/views/DevLedger.jsx`、`src/routes/admin.dev-ledger.jsx`、`src/routes/admin.dev-ledger.lazy.jsx`。
- **修改文件**：`src/routes/__root.jsx`（挂载 Fab）、`src/views/ReviewChangeList.jsx`（embedded prop）、`src/views/Changelog.jsx`（embedded prop）、`src/routes/admin.review-change-list.jsx`（改 redirect）、`src/routes/admin.changelog.jsx`（改 redirect）、`src/config/permissions.js`、AGENTS.md、`docs/role-permission-matrix.md`、`src/data/changelog.js`、`package.json`。
- **删除文件**：`src/routes/admin.review-change-list.lazy.jsx`、`src/routes/admin.changelog.lazy.jsx`。
- **不修改**：Layout.jsx 菜单（不新增任何项）、两个台账数据源（reviewData / CHANGELOG）。

## Out of Scope

- 门户头部「评审变更」按钮的去留（维持现状）。
- react-page-review 库自带悬浮按钮（两者并存，位置避让）。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
