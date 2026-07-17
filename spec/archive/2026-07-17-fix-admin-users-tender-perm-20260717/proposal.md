# Proposal: 用户管理加固、招标文件编制权限与退出确认

## Change ID

`fix-admin-users-tender-perm-20260717`

## Why

7-16 招投标测试2 指出用户管理存在 P0/P1 问题：管理员可停用自己的账号且无任何防护（test2-001，P0）、新增用户空表也提示保存成功且不入列表（test2-002，P1）；cal 交叉评审指出委托代理模式下招标人不应能编制招标文件（cal-001，P0）；7-14 评审导出指出退出登录无二次确认（2052-002）。

另：1415-004（评审工具无法编辑已提交评审）经核实为第三方组件 `react-page-review` 的 ReviewTool 能力问题（当前 ^0.6.0，上游已有 0.7.x），不纳入本提案，评审变更记录中标注为外部依赖待评估升级。

## What Changes

1. **禁止停用本人 + 二次确认**：AdminUsers 用户列表持久化到 `userStore`；当前登录账号的停用按钮禁用并提示；停用/启用任意账号需 Modal 二次确认；停用后该账号登录被拦截（登录校验读取 userStore 状态）（test2-001）。
2. **新增用户校验**：账号必填且唯一、姓名必填、角色必选、所属组织必填；校验通过才保存成功、立即入列表并持久化，刷新仍在（test2-002）。
3. **招标文件编制权限**：TenderDoc 编辑入口按「角色 + 项目组织方式」双维度控制：自行招标→招标人/代理可编制；委托代理→仅代理可编制，招标人只读（cal-001）。
4. **退出登录二次确认**：Layout 退出按钮增加 Modal 确认（提示未保存内容可能丢失）（2052-002，由基础设施接线执行）。

## Impact

- **修改文件**：`src/views/AdminUsers.jsx`、`src/views/TenderDoc.jsx`、`src/views/Login.jsx`（登录校验读取用户状态）。
- **新增文件**：`src/data/userStore.js`。
- **基础设施接线（非本提案 agent 执行）**：`src/components/Layout.jsx` 退出确认。
- **只读依赖**：`src/data/projects.js`（读取项目 orgMode，不得修改）。

## Out of Scope

- 账号状态与真实会话/Token 联动（纯前端 mock，登录校验层模拟）。

## 依赖

- 评审变更记录 test2-001/002、cal-001、2052-002。

## 状态（2026-07-17 更新）

- 总体状态：已完成
- 任务统计：4 任务 — 4 已修复 / 0 部分修复 / 0 未修复 / 0 待确认 / 0 未跟踪
- 依据：`/admin/review-change-list`（src/views/ReviewChangeList.jsx）评审变更列表
