# Proposal: 补建管理侧缺失页面（待办/通知管理/模板管理/系统设置）

## Change ID

`add-admin-missing-pages-20260717`

## Why

cal 7-15 交叉评审的自评清单称「待办事项、通知管理、模板管理、系统设置」通过，但父 agent 复核当前代码发现：待办仅有工作台卡片无独立页面（cal-008）、通知管理仅消息中心近似（cal-009）、模板管理全库缺失（cal-010）、系统设置无视图/路由/菜单（cal-011）。

## What Changes

1. **待办事项 TodoCenter**：按角色聚合待办（报名审核、异议答复、费用审核、报告确认等），点击跳转到对应处理页（cal-008）。
2. **通知管理 NotificationManage**：通知列表（标题/类型/接收角色/时间/状态）+ 发送通知表单，发送后消息中心可见（cal-009）。
3. **模板管理 TemplateManage**：公告模板与招标文件模板列表（名称/类型/更新时间/状态），支持启停用与内容编辑，localStorage 持久化（cal-010）。
4. **系统设置 SystemSettings**：演示环境基础参数（如 CA 沙箱模式、短信模拟、数据重置入口），配置持久化（cal-011）。

## Impact

- **新增文件**：`src/views/TodoCenter.jsx`、`src/views/NotificationManage.jsx`、`src/views/TemplateManage.jsx`、`src/views/SystemSettings.jsx`，必要时 `src/data/notificationStore.js`、`src/data/templateStore.js`。
- **基础设施接线（非本提案 agent 执行）**：4 个页面的路由、permissions、菜单。

## Out of Scope

- 真实消息推送通道；模板与业务表单的深度绑定（模板仅作内容管理）。

## 依赖

- 评审变更记录 cal-008~011。

## 状态（2026-07-17 实施完成）

- 总体状态：已完成
- 任务统计：4 任务 — 4 已修复 / 0 部分修复 / 0 未修复 / 0 待确认 / 0 未跟踪
- 依据：实施+playwright 验证通过；验证报告 docs/verification-20260717-report.md

## 需求口径适配（2026-07-17）

依据 `docs/20260717-需求确认整理.md`（飞书云文档为最新口径）：

### 缩圈

- **notification-manage（通知管理 NotificationManage）**：短信/邮件通知模块仅预留接口、暂不实现（会议概要四；需求确认清单 56「不需要」）；通知管理按站内信（需求确认清单 54）+ 短信/邮件接口预留实现。

### 保留

- **todo-center（待办事项 TodoCenter）**：需求确认清单 47 各角色面板均含「系统待办」，保留。
- **template-manage（模板管理 TemplateManage）**：0604 方案书有模板配置依据，且需求确认清单 24 投标邀请书模板由采购管理部维护，保留。
- **system-settings（系统设置 SystemSettings）**：需求确认清单 47 管理员面板含「系统信息维护」，保留。
