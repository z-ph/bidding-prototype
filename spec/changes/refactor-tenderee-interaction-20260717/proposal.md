# Proposal: 招标人交互范式重构（项目流程式导航）

## Change ID

`refactor-tenderee-interaction-20260717`

## Why

当前招标人侧采用"功能清单式导航"：左侧菜单把招标文件、发布公告、确认中标人、中标通知书、费用管理、异议管理等与项目阶段强相关的功能全部平铺为一级/二级菜单，导致菜单臃肿（14 项），远超 7±2 记忆容量。这与招投标业务的核心工作流不符——招标人的首要问题是"我有哪些项目、每个项目到哪个阶段、下一步该做什么"。

同时，现有评审意见已多次指出方向：
- `docs/page-review-20260714-checklist.md` #26：开标/评标大厅不应有独立顶级菜单，应从项目列表/跟踪进入。
- `review-inputs/2026-07-14-yy0-前端页面评审结果.md`：项目跟踪按钮角色不合理，招标人不应出现投标人动作。
- `原型符合性检查报告-0717.md`：一期已砍掉费用、报名、异议、合同归档等功能，但主导航仍保留入口。

投标人侧已用"项目中心"把下载/报价/上传/开标/中标按项目状态聚合，招标人侧应镜像这一范式。

## What Changes

1. **招标人左侧菜单精简**：把 14 项菜单精简为以"项目"为核心的聚合导航；阶段操作（招标文件、公告、开标、评标、定标、通知书）全部从主导航移除；一期已砍功能（费用、异议、合同归档）直接删除；审批流配置下沉到系统设置。
2. **项目详情页升级为驾驶舱**：`ProjectDetail.jsx` 按项目状态动态渲染"当前阶段操作卡片"，成为招标人处理项目的主入口。
3. **项目列表操作列对齐**：操作列只保留"详情、编辑、发标、下一步"，"详情"统一进入项目驾驶舱。
4. **项目跟踪角色过滤修复**：招标人/代理视角不再显示"去缴纳""去上传"等投标人动作按钮。
5. **阶段页面强制项目上下文**：`TenderDoc`、`NoticePublish`、`OpeningHall`、`EvaluationHall`、`AwardConfirm`、`AwardNotice` 无 `projectId` 时阻断并提示从项目进入。

## Impact

- **修改文件**：`src/components/Layout.jsx`、`src/views/ProjectDetail.jsx`、`src/views/ProjectList.jsx`、`src/views/ProjectTrack.jsx`、`src/views/TenderDoc.jsx`、`src/views/NoticePublish.jsx`、`src/views/OpeningHall.jsx`、`src/views/EvaluationHall.jsx`、`src/views/AwardConfirm.jsx`、`src/views/AwardNotice.jsx`。
- **只读依赖**：`src/data/projects.js`、`src/data/requirements.js`、`src/data/approvalStore.js`（读取，不修改结构）。
- **不修改**：路由文件（路径不变）、权限文件（路径不变）、页面组件文件名（仅调整入口与内部结构）。

## Out of Scope

- 其他角色（招标代理、投标人、专家、监督、管理员）的菜单重构——本提案仅聚焦招标人，其他角色另行提案。
- 页面内部业务逻辑大改——仅调整入口、导航、角色可见性；开标解密权限、签章加密闭环等 P0 问题走其他提案。
- 新增页面或路由——复用现有页面，不新增路由。

## 依赖

- `docs/role-permission-matrix.md`：本重构的评审依据与权限矩阵。
- `原型符合性检查报告-0717.md`：一期口径确认（费用/报名/异议/合同归档不做）。
- `docs/page-review-20260714-checklist.md` #26 / yy0 评审：大厅入口层级与项目跟踪角色过滤。

## 状态

- 总体状态：进行中
