# Proposal: 简化创建项目流程与审核点收敛（最小必要字段）

## Change ID

`simplify-project-creation-20260727`

## Why

**来源**：2026-07-27 设计讲解会议（`docs/20260727-会议记录概要.md`）+ 当日会后口头补充口径（五.5 节，效力高于会议讨论稿）：

1. 尽量简化字段和流程，怎么简单怎么来；保留最小必要字段，**可以缺了补，但不要多了删**。
2. 能自动生成的就不要人填写；能上传文件的就不要手动填写。
3. 创建项目的五步改成一个页面。
4. 采购不需要外部关联，直接在创建项目页面创建需求（会议 3.7：删除「采购需求库」环节）。
5. 整个平台只有一个审核点——创建项目（立项）后审核，其他环节都不需要审核（用户当日确认「两个」为口误，实际只有立项审核；会议 3.1 的「代理内容审核 + 公告发布审核」口径作废）。

**现状**（代码证据）：

- `src/views/ProjectCreate.jsx:376` 为 5 步向导（基本信息/需求与成员/采购包设置/供应商要求/提交审核），字段多；第 1 步「需求与成员」含关联采购需求 `linkedRequirementIds`（L542–567）、需求来源、需求编号等外部关联字段。
- 采购需求库独立成模块：视图 `ProcurementRequirementList.jsx` / `ProcurementRequirementEdit.jsx`，路由 5 个文件，菜单入口 `Layout.jsx:65`（tenderee）、`Layout.jsx:104`（agent），权限 `permissions.js:47-48` 两项；其 store（`src/data/requirements.js`）为纯内存种子，不落库。
- 审批类型 4 种（`src/data/approvalStore.js:8-13`：project/requirement/tender-doc/award-result），且**立项审核链路是断的**：`ProjectCreate.submit`（L305–360）不创建审批单，项目提交后停在 `pending`，无任何代码把 `pending` 流转到后续状态；`approvalStore.create/act` 均为 no-op 演示。
- `TenderDoc.jsx:629`、`AwardConfirm.jsx:88` 分别创建采购文件/中选结果审批单，与「只有立项审核」口径冲突（中选结果审批 0717 清单 31 口径为系统外完成、系统内只登记结果）。

## What Changes

1. **创建项目单页化 + 最小必要字段**：`ProjectCreate` 5 步向导合并为整页一次填完（保留分组排版与提交前确认区，不再分步）；按「最小必要」收敛字段——项目编号保持自动生成；删除需求来源、需求编号、`linkedRequirementIds` 等外部关联字段，改为页内直接填写采购需求（需求说明 + 附件上传，上传优先于手填）。
2. **删除采购需求库环节**：移除 `ProcurementRequirementList`/`ProcurementRequirementEdit` 视图与 5 个路由文件、`permissions.js` 两项权限、`Layout.jsx` 两个菜单入口；`/admin/procurement-requirements*` 旧 URL 重定向到 `/admin/projects/create`；`requirementStore` 若无其他消费方一并删除（有则保留数据、删除页面入口）。
3. **审核点收敛为仅立项审核**：`APPROVAL_TYPES` 仅保留 `project`；删除 requirement/tender-doc/award-result 类型及对应种子审批单（ap-1/ap-2/ap-3）；`TenderDoc` 发布、`AwardConfirm` 中选结果不再创建审批单（AwardConfirm 保留「登记系统外审批结果」口径）。
4. **立项审核闭环（补齐断链）**：`ProjectCreate.submit` 提交时真实创建项目立项审批单；`approvalStore.create/act` 改为真实写入（localStorage 持久化，叠加种子）；审批通过 → 项目状态从 `pending` 推进为可发布状态（发布采购按钮可用），驳回 → 退回草稿并记录意见；审批流配置页适配单一审批类型。
5. **文档同步**：`docs/role-permission-matrix.md` 更新菜单结构（删除采购需求库，说明需求在创建项目页内联创建）；`spec/specs/project-management`、`spec/specs/approval` 对应需求经本提案 spec-delta 修改。

## Impact

- **修改文件**：`src/views/ProjectCreate.jsx`、`src/data/approvalStore.js`、`src/data/projects.js`（状态推进）、`src/views/TenderDoc.jsx`、`src/views/AwardConfirm.jsx`、`src/components/Layout.jsx`、`src/config/permissions.js`、`docs/role-permission-matrix.md`。
- **删除文件**：`src/views/ProcurementRequirementList.jsx`、`src/views/ProcurementRequirementEdit.jsx`、`src/routes/admin.procurement-requirements*.jsx`（5 个）、（视消费情况）`src/data/requirements.js`。
- **新增路由**：`/admin/procurement-requirements*` → `/admin/projects/create` 重定向。
- **共享状态**：`approvalStore` 从纯内存种子改为 localStorage 持久化（key 需在报告中说明 schema 与消费位置）；`TodoCenter`（`pendingFor`）、`ProjectDetail`（审批归档展示）为消费方，需保持兼容。
- **文档台账**：`src/views/ReviewChangeList.jsx`（0727-mt 批次）、`src/data/changelog.js`、`package.json` version。

## Out of Scope

- 0727 会议其余口径（采购包共性表头/每包 Excel 清单导入、三价体系与成交价调整、数据分析维度、供应商极简注册与三分类、收款管理闭环、角色裁剪与权限分级、标书自动生成、投标文件在线填报等）——另行提案。
- 「标段」用词与 0724 敏感词清洗（标段→采购包）的张力——本次不改名，待与陈部长确认。
- CA 分级使用讨论（待确认项，现行口径仍为 CA 全线下线）。
