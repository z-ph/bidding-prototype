# 验证报告：refactor-tenderee-interaction-20260717（招标人交互范式重构）

- 验证日期：2026-07-18
- 验证方式：代码逐条复核（文件 + 行号）+ `pnpm run build`
- 结论：6 个任务全部通过，其中 `project-detail-cockpit` 有 1 条验收标准补缺后通过（见下）。版本递增 0.2.0 → 0.3.0。

## 1. tenderee-menu-refactor（通过）

复核 `src/components/Layout.jsx:50-81, 167-174`（`useMenuItems` 的 `common` / `tendereeMenus` / `roleMenus`）：

- [x] 招标人主导航项不超过 7 项（含二级展开）：tenderee 专属业务入口 6 项——项目管理（分组：项目列表/创建项目/项目跟踪）、采购需求库、审批中心、采购数据分析、消息中心、系统设置（分组：审批流配置）。与任务 description 的目标清单逐项一致。另有全角色共享的工作台/待办中心及两个开发台账项（评审变更列表、变更时间线），属 common 组，非招标人业务导航。
- [x] 主导航不再出现费用管理、异议管理、合同归档、招标文件、发布公告、确认中标人、中标通知书：`tendereeMenus` 中均无（费用台账/招标文件/中标通知书等仅存于 `agentMenus`/`bidderMenus`，属其他角色，不在本提案范围）。
- [x] 项目管理工作项下保留项目列表、创建项目、项目跟踪：`Layout.jsx:63-67`。

## 2. project-detail-cockpit（补缺后通过）

复核 `src/views/ProjectDetail.jsx` 与 `src/utils/projectFlow.js`：

- [x] 项目详情页出现「当前阶段操作」区域：`ProjectDetail.jsx:229-249`，位于项目信息上方、状态 Alert 之下。
- [x] draft/tendering/registering/pending_open/evaluating/评标完成/已确认中标人 等状态均有对应操作入口：`getTendereeActions`（`projectFlow.js:66-213`）覆盖 draft/pending/tendering/registering/pending_open/evaluating/评标完成(evaluation-done)/已确认中标人(winner-confirmed)/通知书已发/done。
- [x] 点击入口正确跳转并携带 projectId：`go()`/`commonView()` 统一注入 `projectId`（`projectFlow.js:72-78`），`handleAction` 执行 navigate（`ProjectDetail.jsx:167-176`）。
- [x] 邀请询比价项目跳过开标/评标直达定标：**补缺**。复核发现 `getTendereeActions` 此前未按采购方式分流，邀请询比价项目在 registering/pending_open/evaluating 状态下驾驶舱仍给出「进入开标大厅/评标大厅」入口（虽 OpeningHall 页面级有门禁，但入口本身不符合「直达定标」口径）。已在 `projectFlow.js:80-90` 补充分支：邀请询比价项目在报价相关状态下仅给出「前往定标」卡片，跳转 `/admin/award-confirm?projectId=...`，与 `ProjectList.INVITED_RFQ_NEXT_STEP_MAP`（`ProjectList.jsx:122-128`）及 `INVITED_RFQ_STATUS_TO_NODE_KEY`（`projectFlow.js:29-33`）同一口径。该修复同时使 `ProjectTrack` 的「当前状态与下一步」（经 `getTendereeStatusSummary`）对邀请询比价项目也不再提示开标/评标。

## 3. project-list-actions（通过）

复核 `src/views/ProjectList.jsx:353-369`（操作列）、`225-227`（viewDetail）、`269-303`（nextStep）：

- [x] 操作列按钮不超过 4 个：详情、编辑（仅 draft/tendering/registering 显示）、发标（仅 draft 且 tenderee 显示）、下一步，最大同时 4 个。
- [x] 详情按钮进入项目驾驶舱：`viewDetail` → `/admin/projects/detail/:id`（ProjectDetail 驾驶舱）。
- [x] 下一步按钮与项目状态正确联动：`nextStep` 按状态分发（draft→编辑、tendering→发布公告、registering/pending_open→开标大厅、evaluating→评标大厅、评标完成→确认中标人、已确认中标人→通知书、邀请询比价报价状态→直达定标），均携带 projectId。

## 4. project-track-role-filter（通过）

复核 `src/views/ProjectTrack.jsx`：

- [x] 招标人/代理查看时不出现「去缴纳」「去上传」按钮：`isTenderSide = ['tenderee','agent','admin']`（`:37`）；时间线 `:288` 招标侧渲染 `tenderFlowNodes`（`getProjectFlowNodes` 产出，无 action 按钮）；「去上传」仅存于 `bidderNodes`（`:102-137`），全文无「去缴纳」。
- [x] 当前状态与下一步提示符合招标方职责：`:190-214` 招标侧专属卡片，数据来自 `getTendereeStatusSummary`（经 `getTendereeActions`，本次补缺后邀请询比价亦直达定标）。
- [x] 投标人视角保持原有操作入口：`:216-249` 投标人卡片与 `bidderNodes` 动作按钮保留。
- 备注（超范围观察，未改）：supervisor 视角时间线复用 `bidderNodes`，节点上会显示「去上传」按钮；本提案验收仅覆盖招标人/代理/投标人，监督角色整改留待后续提案。

## 5. stage-page-entry-guard（通过）

6 个阶段页面均无 projectId 时阻断渲染、提示「需从项目进入」并提供返回项目列表按钮：

| 页面 | 守卫位置 | 形式 |
| --- | --- | --- |
| TenderDoc.jsx | `:867-883` | 内联 `Result`（warning，「需从项目进入」+ 返回项目列表按钮），与 ProjectEntryGuard 同模式 |
| NoticePublish.jsx | `:58-60` | `<ProjectEntryGuard />` |
| OpeningHall.jsx | `:53-55` | `<ProjectEntryGuard />` |
| EvaluationHall.jsx | `:36-38` | `<ProjectEntryGuard />` |
| AwardConfirm.jsx | `:51-53` | `<ProjectEntryGuard />` |
| AwardNotice.jsx | `:44-46` | `<ProjectEntryGuard />` |

`src/components/ProjectEntryGuard.jsx:10-25`：无 projectId 时渲染 `Result status="warning"`，标题「需从项目进入」，extra 为「返回项目列表」按钮（navigate `/admin/projects`）。携带 projectId 时各页面正常走项目数据渲染（各文件 useMemo 按 projectId 取 projectStore/基线项目）。

## 6. build-verify（通过）

- [x] `pnpm run build` 无错误（vite build 成功，输出见执行记录）。
- [x] `routeTree.gen.ts` 由 `@tanstack/router-plugin` 自动生成，未手工修改，无冲突。
- [x] 代码复核覆盖招标人菜单精简、驾驶舱操作入口、无 projectId 阻断（本条以静态代码复核为准，未单独跑 Playwright trace；本次仅 1 处局部逻辑补缺，未新增页面/路由）。

## 改动文件清单（本次补缺）

- `src/utils/projectFlow.js`：`getTendereeActions` 增加邀请询比价直达定标分支（唯一代码改动）。
- `spec/changes/refactor-tenderee-interaction-20260717/tasks.json`：6 个任务 status 「进行中」→「已完成」。
- `spec/changes/refactor-tenderee-interaction-20260717/verification.md`：本报告（新建）。
- `package.json`：version 0.2.0 → 0.3.0。
- `src/data/changelog.js`：顶部新增 0.3.0 条目。
- `src/views/ReviewChangeList.jsx`：reviewData 顶部新增 `0718-ux-002` 台账条目。
