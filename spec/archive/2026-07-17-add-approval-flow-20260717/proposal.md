# Proposal: 新增审批流与三节点审批（需求/招标文件/中标结果）

## Change ID

`add-approval-flow-20260717`

## Why

2026-07-17 飞书云文档需求确认清单明确了完整的审批口径（整理稿 §1.10）：

- 必须审批的节点：**需求、招标文件、中标结果**（清单 48）；
- 审批链：招标代理发布→招标人（采购管理部）审核；招标人发布→需求部门→采购管理部（清单 14/22）；
- 驳回退回经办人，通过后自动推进业务状态（清单 49/50）；
- 不同采购方式**不**使用不同审批流（清单 51）；
- 审批支持加签、转办、退回（清单 52）；
- 审批记录全部进入项目归档（意见、附件、签名、时间等）（清单 53）；
- 审批通知使用站内信（清单 54）；
- 审批流由招标人（采购管理部）新建、修改、启停、发布（清单 55）；
- 中标结果审批**不在本系统完成**，系统内仅登记审批结果（清单 31）。

当前原型仅有项目创建提交审核的 mock，无审批中心、无审批流配置，需求/招标文件发布均未接审批。

## What Changes

1. **审批中心**（`/admin/approval-center`）：待办/已办/我发起的三页签，支持通过、驳回（必填原因）、加签、转办、退回操作。
2. **业务接入**：采购需求、招标文件发布分别接入对应审批链（按发起人角色分流：代理发布→采购管理部；招标人发布→需求部门→采购管理部），通过后自动推进业务状态，驳回退回经办人。
3. **中标结果**：不做系统内审批流，仅提供审批结果登记（通过/不通过、审批文号/日期、附件），登记通过后中标结果方可发布。
4. **审批流配置**（`/admin/approval-flow-config`）：限招标人（采购管理部）角色，支持审批流的新建、修改、启停、发布；不按采购方式区分审批流。
5. **审批通知**：审批操作后通过站内信通知相关人，接入 MessageCenter（若其实现仍无 store，则新建 messageStore 并改造其读取）。
6. **审批归档**：审批记录（意见、附件、签名、时间）全量进入项目归档视图。
7. **数据层**：新增 `src/data/approvalStore.js`（mock + localStorage，参照 `objectionStore.js` 既有约定），统一承载审批流配置、审批单与流转记录。

## Impact

- **新增文件**：`src/views/ApprovalCenter.jsx`、`src/views/ApprovalFlowConfig.jsx`、`src/data/approvalStore.js`，及路由文件 `src/routes/admin.approval-center.jsx` / `.lazy.jsx`、`src/routes/admin.approval-flow-config.jsx` / `.lazy.jsx`。
- **修改文件**：`src/views/ProcurementRequirementList.jsx` / `ProcurementRequirementEdit.jsx`（需求发布接审批）、`src/views/TenderDoc.jsx`（招标文件发布接审批）、`src/views/AwardConfirm.jsx`（中标结果审批登记入口）、项目归档相关视图（审批记录展示）、`src/views/MessageCenter.jsx`（读取站内信 store）。
- **共享文件**（由基础设施 agent 统一接线）：`src/components/Layout.jsx`（菜单）、`src/config/permissions.js`（审批流配置限 tenderee/采购管理部）、自动生成的 `routeTree.gen.ts` 不手动修改。
- **技术约束**：React 18 + AntD 5 原型；mock 数据优先（`src/data/` + localStorage store 模式，参照既有约定）；短信/邮件等外部通知接口只做预留，审批通知一律走站内信；页面组件放 `src/views/`、路由文件只放元数据（见 AGENTS.md 路由约定），实施时由基础设施 agent 统一接线共享文件。

## Out of Scope

- 中标结果的真实审批流转（清单 31 明确不在本系统完成，仅登记结果）。
- 短信/邮件审批通知（清单 54 口径为站内信；短信/邮件按概要四仅预留接口）。
- 审批流的复杂条件分支与会签策略（清单 51 明确不按采购方式区分，原型仅做线性链 + 加签/转办/退回）。
- 电子签名/签章的真实实现（签名以 mock 形式记录）。

## 依赖

- 依据 2026-07-17 飞书云文档（会议概要 / 需求确认清单 14、22、31、48-55），整理稿 `docs/20260717-需求确认整理.md`（§1.10）。
- 站内信依赖既有 MessageCenter 页面。

## 状态（2026-07-17 实施完成）

- 总体状态：已完成
- 任务统计：7 任务 — 7 已修复 / 0 部分修复 / 0 未修复 / 0 待确认 / 0 未跟踪
- 依据：实施+playwright 验证通过；验证报告 docs/verification-20260717-report.md
