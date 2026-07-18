# Proposal: 招标代理交互范式重构（驾驶舱角色分发与菜单聚合）

## Change ID

`refactor-agent-menu-workflow-20260718`

## Why

招标代理侧存在三类交互违规（对照 AGENTS.md 红线和 `docs/role-permission-matrix.md` 2.2 节）：

1. **驾驶舱角色错位（红线 4：操作由角色+状态驱动）**：`ProjectDetail.jsx` 的「当前阶段操作」卡片无条件渲染 `getTendereeActions`（招标人动作），`src/utils/projectFlow.js` 不存在代理动作集。招标代理打开项目详情看到的是「确认采购结果」等招标人操作。
2. **阶段操作平铺（红线 7：菜单须从工作流正向推导）**：招标文件编制、公告发布、专家抽取、中标通知书均为强 projectId 上下文的阶段操作，却挂在顶层菜单；无 projectId 空载进入时 TenderDoc/NoticePublish/AwardNotice 会撞 ProjectEntryGuard 阻断页——菜单项本身就是错误入口。
3. **专家抽取空载进入（红线 3）**：`ExpertExtraction.jsx` 无 ProjectEntryGuard，内置项目选择器默认选中第一个项目，菜单直达时展示的是任意项目的抽取页。

代理的核心工作流：接受委托 → 编制招标文件 → 发布公告 → 供应商邀请授权 → 开标准备/组织开标 → 抽取专家 → 组织评标 → 汇总评标报告提交定标审批 → 发中标通知书 → 费用登记。跨项目台账（公告列表、供应商授权、费用台账、审批中心）保留独立入口；项目阶段操作全部从项目驾驶舱携带 projectId 进入。

## What Changes

1. **新增代理动作集**：`src/utils/projectFlow.js` 新增 `getAgentActions(project)`，镜像 `getTendereeActions` 的状态分发结构，但动作按代理职责定义：编制招标文件、发布公告、进入开标大厅、专家抽取、进入评标大厅、提交定标审批（审批中心）、发中标通知书；邀请询比价项目沿用「跳过开评标直达定标」口径（报价截止后提交定标审批）。
2. **驾驶舱按角色分发**：`ProjectDetail.jsx` 当前角色为 agent 时渲染 `getAgentActions`，tenderee 时渲染 `getTendereeActions`；其他角色（bidder 等）不渲染操作卡片。同步检查 `ProjectList.jsx` 的「下一步」（nextStep/nextLabel）对 agent 角色的适配，确保其跳转目标与代理动作一致。
3. **菜单聚合**：`Layout.jsx` agentMenus 整合为 8 项——工作台、待办中心（common 组）、委托项目（项目列表/项目跟踪）、公告列表、供应商授权、费用台账、审批中心、采购数据分析、消息中心。移除顶层菜单项：招标文件编制、公告发布、专家抽取、中标通知书（路由与权限保留，全部从驾驶舱进入）。
4. **专家抽取补 guard**：`ExpertExtraction.jsx` 增加 ProjectEntryGuard——无 projectId 时阻断并提示从项目进入，移除内置默认项目兜底；从驾驶舱进入时携带 projectId 正常渲染。

## Impact

- **修改文件**：`src/utils/projectFlow.js`、`src/views/ProjectDetail.jsx`、`src/views/ProjectList.jsx`（仅 nextStep 角色适配，如需）、`src/components/Layout.jsx`、`src/views/ExpertExtraction.jsx`。
- **不修改**：路由文件（路径不变）、`src/config/permissions.js`（路径权限不变）、招标人/投标人的动作集与菜单。
- **文档台账**：`docs/role-permission-matrix.md` 2.2 节、`src/views/ReviewChangeList.jsx`、`src/data/changelog.js`、`package.json` version（0.3.0 → 0.4.0）。

## Out of Scope

- 其他角色菜单重构（投标人、专家、监督）——各角色单独提案。
- 代理各阶段页面内部业务逻辑——仅调整入口、导航与角色可见性。
- 新增页面或路由——复用现有页面，不新增路由。

## 依赖

- `docs/role-permission-matrix.md` 2.2 节：现状评审与目标结构。
- `spec/archive/2026-07-18-refactor-tenderee-interaction-20260717`：招标人范式（驾驶舱 + 阶段操作下沉），代理侧镜像。
- `AGENTS.md`：6 条核心设计原则与 7 条红线。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
