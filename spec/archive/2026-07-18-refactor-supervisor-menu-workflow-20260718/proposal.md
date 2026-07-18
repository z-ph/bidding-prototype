# Proposal: 监督人员交互范式重构（监督视图项目化与异常落库）

## Change ID

`refactor-supervisor-menu-workflow-20260718`

## Why

对照 `docs/role-permission-matrix.md` 2.5 节与 AGENTS.md 红线/复核清单：

1. **监督大厅无项目绑定（红线 3 的变体：通用空载视图）**：`SupervisorHall.jsx`（260 行）全部硬编码 mock——签到、唱标、评标委员会、评分汇总都是静态数据，无 projectId、无项目上下文。matrix 2.5 明确要求：监督主视图应为「今日开标/评标场次」列表，点击项目进入该项目的监督视图。
2. **监督动作假保存（复核清单第 7 条：必须真实写入 localStorage）**：监督大厅「记录异常」「提交监督意见」仅 `message` 提示不落库；`SupervisorAbnormal.jsx:6` 的异常记录也只是组件 useState，刷新即丢，且两个页面数据互不相通。
3. **数据来源已具备真实基础但未接入**：评标委员会（expertStore）、评分汇总（evaluationStore）、唱标报价（quoteStore）均已在前几期落库，监督视图仍读假数据。

监督的工作流：登录 → 查看今日开标/评标场次（项目维度）→ 进入某项目监督视图（只读查看开评标过程）→ 发现异常时登记（关联项目、持久留痕）→ 操作日志/异常台账备查。菜单本身（监督大厅、异常登记、操作日志、消息中心）已精简，保留不动。

## What Changes

1. **SupervisorHall 项目化**：
   - 无 projectId：渲染「今日开标/评标场次」列表——项目来自 projectStore（真实创建的项目），列示项目名称/编号、开标时间、评标截止时间（evaluationStore）、当前阶段，操作列「进入监督」携带 projectId；无项目时 Empty 空状态。
   - 有 projectId：渲染该项目监督视图（保留只读模式标识与开/评标 Tab）：评标委员会读 expertStore、评分汇总读 evaluationStore 实时汇总、唱标结果读 quoteStore；**无真实数据时显示 Empty 提示，不再回退演示假数据**（符合删 mock 口径）。
   - 头部展示当前监督项目名称/编号。
2. **异常与意见落库**：新建 `src/data/supervisorStore.js`（localStorage key `bidding-supervisor-records`，结构 `{ id, projectId, project, type, desc, status, time, source }`）；`SupervisorAbnormal.jsx` 的 records 迁移到 store（初始演示记录作为种子写入），登记/查看真实持久化；SupervisorHall 的「记录异常」改为写同 store（关联当前 projectId 与项目名），成功后提示可在「异常登记」查看。
3. **工作台监督概览接真实计数**：`Dashboard.jsx` supervisor 分支的 Descriptions——今日开标=projectStore 中 openTime 为今日的项目数，今日评标=evaluationStore 有进行中评标的项目数，异常预警=supervisorStore 待处理记录数。

## Impact

- **修改文件**：`src/views/SupervisorHall.jsx`、`src/views/SupervisorAbnormal.jsx`、`src/views/Dashboard.jsx`（仅 supervisor 分支）、新建 `src/data/supervisorStore.js`。
- **不修改**：菜单（Layout.jsx 不动——监督菜单已合规）、路由文件、`src/config/permissions.js`、SupervisorLogs（日志埋点体系属独立议题）。
- **ProjectTrack supervisor 分支说明**：`/admin/projects/track` 权限仅 tenderee/agent，supervisor URL 直达由 Forbidden 拦截，无实际暴露面；本期不开放该页权限，故不修其 bidderNodes fallback（记录在案，若未来开放监督查看项目跟踪需一并修）。
- **文档台账**：`docs/role-permission-matrix.md` 2.5 节、`src/views/ReviewChangeList.jsx`、`src/data/changelog.js`、`package.json` version（0.6.0 → 0.7.0）。

## Out of Scope

- SupervisorLogs 操作日志的数据源真实化（需全局操作埋点，独立提案）。
- ProjectTrack 的 supervisor 分支（见上，无暴露面）。
- 其他角色菜单。

## 依赖

- `docs/role-permission-matrix.md` 2.5 节：目标主视图（今日开标/评标场次列表 → 项目监督视图）。
- expertStore / evaluationStore / quoteStore：前几期已落库的真实数据源。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
