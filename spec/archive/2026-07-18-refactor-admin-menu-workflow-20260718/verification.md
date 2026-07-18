# Verification: 管理员交互范式重构

验证日期：2026-07-18
验证人：父 agent（红线审查）
方式：`pnpm run build` + Playwright DOM 实测（`scripts/verify-admin-redline.mjs`，trace：`review-assets/admin-redline-trace.zip`）

## 逐任务验收

| 任务 | 结果 | 证据 |
|------|------|------|
| admin-dashboard-merge | 通过 | `Dashboard.jsx:495` admin 分支直接渲染 `<AdminDashboard />`；实测工作台含「注册供应商/异常预警」指标卡，无「前往管理控制台」按钮 |
| legacy-route-redirect | 通过 | `routes/admin.admin-dashboard.jsx:5-7` beforeLoad redirect；实测 goto `/#/admin/admin-dashboard` 落到 `/#/admin/dashboard` 且渲染控制台内容；grep src/ 无残留导航引用；lazy 路由已删，routeTree.gen.ts 自动重新生成 |
| admin-menu-grouping | 通过 | 实测菜单顶层项 9 项：工作台、待办中心、组织与用户、系统配置、内容管理、准入审核、日志审计、采购数据分析、消息中心；无「管理控制台」「采购需求」 |
| admin-permission-cleanup | 通过 | `permissions.js`：`/admin/admin-dashboard` 项已删；`procurement-requirements*` 仅 tenderee；`approval-flow-config` 含 admin |
| default-path-unify | 通过 | `useRole.js:26`、`Login.jsx:74`、`Forbidden.jsx:11` 的 admin 路径均为 `/admin/dashboard`；实测 admin 登录落地 `/admin/dashboard` |
| doc-ledger-version | 通过 | matrix 2.6 节已更新为已实施；台账 0718-ux-001；changelog 0.2.0；package.json 0.2.0 |
| build-redline-verify | 通过 | build ✓（228ms）；Playwright 实测 **28/28 通过** |

## 红线逐条核对

1. 无空壳工作台/纯跳转页 —— 通过（工作台直接渲染控制台）
2. 无职责重叠的两个入口 —— 通过（「管理控制台」入口已删，旧路由仅 redirect）
3. 阶段页面强制 projectId —— N/A（管理员无阶段页面）
4. 菜单按业务域聚合 —— 通过（9 项，含 3 个分组）
5. 已砍功能不出现在主导航 —— 通过（实测无费用/报名/异议/合同归档/发票）
6. 共享文件非 append-only —— 通过（Layout/permissions 为整合式重写）
7. 菜单从工作流正向推导 —— 通过（运营概览 → 准入/待办 → 组织/配置/内容 → 审计/分析）

## CRUD 闭环实测（localStorage 真实写入）

准入审核页面对「D科技有限公司」执行审核通过 → 状态变「已通过」→ `bidding-admission-status` 写入 localStorage → **页面刷新后状态仍为「已通过」**（证明非组件本地状态）。

## 验证中发现并修复的缺陷

- `AdminDashboard.jsx:81`：Timeline `items.children` 为 antd 弃用 API（控制台报错），改为 `items.content`。修复后实测控制台零错误。该缺陷属本提案页面（管理员工作台）验证范围内，随本提案登记，不单独递增版本。

## 结论

7 个任务全部完成，28/28 实测通过，同意归档。
