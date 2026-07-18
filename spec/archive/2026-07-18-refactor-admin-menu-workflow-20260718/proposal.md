# Proposal: 管理员交互范式重构（工作台合并与菜单业务域分组）

## Change ID

`refactor-admin-menu-workflow-20260718`

## 特别说明（追认提案）

本提案为**追认登记**：实施先于提案完成，违反了「评审 → 计划 → 提案 → 实施」的既定流程，经指出后补建本提案。tasks.json 中各任务按实际实施情况标记，验证记录见 verification.md。后续各角色（招标代理、投标人、评标专家、监督人员）严格先提案后实施。

## Why

管理员后台存在三类交互违规：

1. **空壳工作台**：`/admin/dashboard` 对管理员仅渲染一个「前往管理控制台」按钮的 Result 页，真正内容在 `/admin/admin-dashboard`——同一角色存在「工作台」与「管理控制台」两个名称不同、职责重叠的入口（红线 1/2）。
2. **菜单平铺**：主导航 16 项无分组平铺（工作台、待办中心、管理控制台、采购需求、用户权限、通知管理、模板管理、系统设置、参数字典、准入审核、新闻公告维护、组织机构、子账号管理、日志审计、采购数据分析、消息中心），远超 7±2，未按业务域聚合（红线 4/6）。
3. **角色错位**：「采购需求」是招标人业务，却出现在管理员菜单与权限中（操作与角色不匹配）。

管理员的核心工作流是平台运维：看运营概览 → 处理准入/待办 → 维护组织用户/系统配置/内容 → 查日志审计 → 看数据分析。菜单应从该工作流正向推导。

## What Changes

1. **工作台合并**：`/admin/dashboard` 的管理员分支直接渲染管理控制台内容（运营指标、待办、快捷入口），删除空壳跳转页。
2. **旧路由重定向**：`/admin/admin-dashboard` 通过 `beforeLoad` redirect 到 `/admin/dashboard`，删除对应 lazy 路由；面包屑/返回按钮等残留引用一并清理。
3. **菜单业务域分组**：管理员主导航整合为 9 项——工作台、待办中心、组织与用户（用户权限/组织机构/子账号管理）、系统配置（系统设置/参数字典/通知管理/模板管理/审批流配置）、内容管理（新闻公告维护）、准入审核、日志审计、采购数据分析、消息中心。
4. **权限对齐**：删除 `/admin/admin-dashboard` 权限项；`/admin/procurement-requirements*` 移除 admin；`/admin/approval-flow-config` 增加 admin（随系统配置分组挂载）。
5. **默认路径统一**：`useRole.js`、`Login.jsx`、`Forbidden.jsx` 的管理员落地路径统一为 `/admin/dashboard`。

## Impact

- **修改文件**：`src/views/Dashboard.jsx`、`src/components/Layout.jsx`、`src/config/permissions.js`、`src/hooks/useRole.js`、`src/views/Login.jsx`、`src/components/Forbidden.jsx`、`src/views/AdminNews.jsx`、`src/routes/admin.admin-dashboard.jsx`。
- **删除文件**：`src/routes/admin.admin-dashboard.lazy.jsx`。
- **文档台账**：`docs/role-permission-matrix.md` 2.6 节、`src/views/ReviewChangeList.jsx`（0718-ux-001）、`src/data/changelog.js`（0.2.0）、`package.json` version。

## Out of Scope

- 其他角色（招标人、招标代理、投标人、专家、监督）的菜单重构——各角色单独提案，串行实施。
- 管理员各页面内部业务逻辑改造——本提案只调整入口、导航、权限归属。
- 新增页面或路由——复用现有页面，不新增路由。

## 依赖

- `docs/role-permission-matrix.md`：评审依据与目标菜单结构。
- `AGENTS.md`：6 条核心设计原则与 7 条红线审核标准。

## 状态

- 总体状态：已完成（2026-07-18 验收归档，验收记录见 verification.md）
