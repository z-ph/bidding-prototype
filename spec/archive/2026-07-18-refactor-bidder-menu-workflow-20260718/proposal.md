# Proposal: 投标人交互范式重构（投标操作全收项目中心）

## Change ID

`refactor-bidder-menu-workflow-20260718`

## Why

对照 `docs/role-permission-matrix.md` 2.3 节与 AGENTS.md 红线：

1. **阶段操作平铺菜单（红线 3/7）**：在线报价、开标大厅、中标通知均为强 projectId 上下文的阶段操作，却挂在投标人顶层菜单。开标大厅/中标通知已有 ProjectEntryGuard——菜单点进去就是阻断页，入口本身错误；在线报价用「项目选择门槛」（1415-005 的页面内项目选择器）空载进入，属于红线 3 明确否定的模式。
2. **与项目中心职责重叠（红线 2）**：项目中心（BidderProjects）已把下载/报价/上传/开标/中标按项目状态聚合并全部携带 projectId（`BidderProjects.jsx:252-275`），菜单里的同类入口与之重复。
3. **页面内残留 mock 种子**：BidQuote 的 quotableProjects 内含硬编码 seeds（`BidQuote.jsx:30-33`），服务已该淘汰的选择器模式，不符合「Mock 删除、localStorage 真实增删查改」口径。

投标人的工作流是：项目中心看可参与/已参与项目 → 按项目状态执行下载文件 → 报价 → 上传标书 → 开标 → 查看中标。所有操作天然从项目中心按项目进入，主导航只需：项目中心、企业档案、消息中心。

## What Changes

1. **菜单精简**：`Layout.jsx` bidderMenus 从 6 项减为 3 项——项目中心、企业档案、消息中心（common 组不变，顶层合计 7 项）。移除：在线报价、开标大厅、中标通知（路由与 `permissions.js` 权限全部保留，统一从项目中心携带 projectId 进入）。
2. **ProjectEntryGuard 支持角色化返回**：新增可选 props `backTo`（默认 `/admin/projects`）与 `backLabel`（默认「返回项目列表」），默认行为与现有 6 个页面完全一致；投标人场景传 `backTo="/admin/bidder-projects"`、`backLabel="返回项目中心"`。
3. **BidQuote 改造**：
   - 删除「项目选择门槛」：chosenProjectId 状态、页面内项目选择器 UI、quotableProjects 的硬编码 seeds 与选择器专用逻辑一并移除；同步清理只为选择器服务的 import（如 authorizationStore，若无其他引用）。
   - 无 URL projectId 时渲染 `<ProjectEntryGuard backTo="/admin/bidder-projects" backLabel="返回项目中心" />`（遵循 hooks 后 guard 模式，不走 hooks 前 early return）。
   - effectiveProjectId 简化为 URL projectId；报价字段驱动（quoteFields）、报价提交、跳转上传标书等正常路径行为不变。

## Impact

- **修改文件**：`src/components/Layout.jsx`、`src/components/ProjectEntryGuard.jsx`、`src/views/BidQuote.jsx`。
- **不修改**：路由文件、`src/config/permissions.js`、OpeningHall/AwardNotice/BidDownload/BidUpload/BidderProjects（入口已就绪）。
- **文档台账**：`docs/role-permission-matrix.md` 2.3 节、`src/views/ReviewChangeList.jsx`、`src/data/changelog.js`、`package.json` version（0.4.0 → 0.5.0）。

## Out of Scope

- 项目中心内部布局重构（入口已按状态聚合，本期只收敛菜单与报价页 guard）。
- 开标大厅/中标通知书页面内部逻辑。
- 其他角色菜单。

## 依赖

- `docs/role-permission-matrix.md` 2.3 节：目标结构（工作台、项目中心、企业档案、消息中心）。
- `spec/archive/2026-07-18-refactor-agent-menu-workflow-20260718`：阶段页面 guard 与 hooks 顺序的正确模式。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
