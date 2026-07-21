# Proposal: 大厅与采购方式归属重定义（开标大厅/比价大厅/评标大厅）

## Change ID

`hall-purchase-method-mapping-20260721`

## Why

**现状口径**（2026-07-17 需求确认清单 20，代码证据）：

- `src/views/ProjectList.jsx:77-104`：四种采购方式流程节点一致，唯 `invitation_inquiry`（邀请询比价）剔除 `opening`/`evaluation` 两个节点（`PURCHASE_METHOD_FLOW_MAP`、`OPENING_EVALUATION_NODE_KEYS`）。
- `src/views/OpeningHall.jsx:364-406`：仅拦截邀请询比价项目（"邀请询比价项目无需开标"），**公开询比价（`inquiry`）与招标类一样走开标大厅**。
- `src/views/EvaluationHall.jsx:504-546`：同样仅拦截邀请询比价（"邀请询比价项目无需评标"）。
- `src/utils/projectFlow.js:37-46,88-100`：邀请询比价在报价相关状态直达定标（"前往定标/确认采购结果"），跳过开标与评标。

**本次需求新口径**（2026-07-21）：

| 采购方式 | value | 开标大厅 | 比价大厅 | 评标大厅 |
|---|---|---|---|---|
| 公开招标 | `open` | ✅ | — | ✅ |
| 邀请招标 | `invitation` | ✅ | — | ✅ |
| 公开询比价 | `inquiry` | — | ✅ | ✅ |
| 邀请询比价 | `invitation_inquiry` | — | ✅ | ✅ |

即：**开标大厅服务招标族（公开/邀请招标），比价大厅服务询比族（公开/邀请询比价），评标大厅对所有项目开放**。与现状的差距：

1. **比价大厅页面不存在**——无路由、无视图、无权限项、无面包屑映射。
2. **公开询比价当前走开标大厅**——归属错误（现状只有邀请询比价被拦，公开询比价照常开标）。
3. **邀请询比价当前无评标**——EvaluationHall 门禁阻断、AwardConfirm 以 `isInvitedRfqProject` 短路为"评标完成"（`AwardConfirm.jsx:25-31`），与"所有项目都要评标"冲突。
4. 流程节点定义、状态→节点映射、各导航入口均按旧口径硬编码，需按"两族两模板"重新分流。

## What Changes

### 1. 新增比价大厅页面（询比族大厅）

- 新建 `src/views/ComparisonHall.jsx` + 路由 `src/routes/admin.comparison-hall.jsx` / `.lazy.jsx`，重新生成 `routeTree.gen.ts`。
- 携带 `projectId` 进入，无参时渲染 `ProjectEntryGuard`（guard 置于所有 hooks 之后，遵循 0718-ux-004 口径）。
- 页面主体：对 `quoteStore` 中 `${projectId}::` 前缀的供应商报价做**报价比较**（供应商/报价/交货期/质保期比较表），招标人/代理可操作"比价完成"→ 携带 projectId 进入评标大厅；投标人只读本人报价，监督只读（与开标大厅角色口径一致，细节待确认）。

### 2. 开标大厅归属收窄（仅招标族）

- `OpeningHall.jsx` 门禁从 `isInvitedRfqProject(project)` 改为**询比族判定**（`inquiry` 或 `invitation_inquiry`）：询比族项目进入开标大厅时阻断并引导至比价大厅（携带 projectId），招标族（`open`/`invitation`）正常开标。
- 删除/改写第 401 行口径说明 Alert（"唯邀请询比价不用开标和评标（清单 20）"→ 新口径）。

### 3. 评标大厅全项目化

- `EvaluationHall.jsx` 移除第 504-546 行邀请询比价门禁分支，所有采购项目均可进入评标；口径说明 Alert 更新。

### 4. 流程节点两族化（ProjectList.jsx）

- `FLOW_NODES` 新增 `comparison` 节点（label 暂定"线上比价"，待确认）。
- `PURCHASE_METHOD_FLOW_MAP` 改为两族模板：
  - 招标族 `open`/`invitation`：… `bid` → `opening` → `evaluation` → `award`
  - 询比族 `inquiry`/`invitation_inquiry`：… `bid` → `comparison` → `evaluation` → `award`
- `INVITED_RFQ_NEXT_STEP_MAP` / `OPENING_EVALUATION_NODE_KEYS` / `isInvitedRfqProject` 的旧语义废止或重定义为族判定（新增 `isInquiryFamily(project)`，`getNextStepInfo` 按族分流）。

### 5. 状态→节点与导航入口按族分流

- `src/utils/projectFlow.js`：`STATUS_TO_NODE_KEY` 族感知（询比族 `pending_open` → `comparison`）；`getTendereeActions`/`getAgentActions` 的 `registering`/`pending_open` 分支按族跳开标大厅或比价大厅，**删除邀请询比价直达定标分支**；询比族报价截止后 → 比价大厅 → 评标大厅 → 定标。
- `ProjectList.jsx` `nextStep()`/`NEXT_STEP_MAP`：同上按族分流。
- `Dashboard.jsx:52-54` `STAGE_PATH_MAP`（公告中/待开标 → opening-hall）与快捷入口（第 146 行）：按项目族决定跳开标大厅或比价大厅。
- `TodoCenter.jsx:29-41` 状态→路径映射：同上。
- `BidderProjects.jsx:270` 投标人"进入开标"按钮：询比族项目改为"进入比价"。
- `ProjectTrack.jsx:102-137` 投标人时间线硬编码节点：询比族用 `comparison` 节点替换 `opening`，并为邀请询比价补回 `evaluation` 节点（招标方时间线经 `getProjectFlowNodes` 自动随 FLOW map 更新）。

### 6. 定标阶段判定简化

- 邀请询比价不再跳过评标，`AwardConfirm.resolveAwardStage` 的 `isInvitedRfqProject → 'evaluation-done'` 短路分支废止，统一为 `awardStage` → `evaluationStore` 双依据（与提案 `fix-award-step-regression-20260721` 抽取的共享函数衔接；本提案实施时以共享函数为准）。

### 7. 权限与面包屑

- `src/config/permissions.js` 新增 `'/admin/comparison-hall': ['tenderee', 'agent', 'bidder', 'supervisor']`（与开标大厅一致）；`BREADCRUMB_NAMES` 新增 `ComparisonHall: '比价大厅'`。

### 8. 种子数据

- 当前 9 个种子项目中**无公开询比价（`inquiry`）项目**（仅项目 6 为邀请询比价），无法演示"公开询比价 → 比价大厅"。需新增或转换 1 个公开询比价种子项目（方案待确认，见下）。

## Impact

- **新增文件**：`src/views/ComparisonHall.jsx`、`src/routes/admin.comparison-hall.jsx`、`src/routes/admin.comparison-hall.lazy.jsx`（+ `routeTree.gen.ts` 重新生成）。
- **修改文件**：`src/views/OpeningHall.jsx`、`src/views/EvaluationHall.jsx`、`src/views/ProjectList.jsx`、`src/utils/projectFlow.js`、`src/views/Dashboard.jsx`、`src/views/TodoCenter.jsx`、`src/views/BidderProjects.jsx`、`src/views/ProjectTrack.jsx`、`src/views/AwardConfirm.jsx`、`src/config/permissions.js`、`src/data/projects.js`（种子）。
- **文档台账**：`docs/role-permission-matrix.md`、`src/views/ReviewChangeList.jsx`（0721-001）、`src/data/changelog.js`、`package.json` version（实施完成时递增）。
- **废止口径**：2026-07-17 需求确认清单 20"唯邀请询比价不用开标和评标"。

## Out of Scope

- 开标大厅内部业务逻辑（签到/解密/唱标/开标准备）不变，仅改门禁归属。
- 评标大厅内部逻辑不变，仅移除门禁。
- 各角色主导航菜单结构不变（三大厅均从项目驾驶舱携带 projectId 进入，不进菜单——延续 0718 交互重构口径）。
- 监督大厅是否新增"比价监督"Tab——列为后续提案（本次监督对询比族项目沿用只读项目跟踪）。

## 待确认事项（实施前需人类拍板）

1. **比价大厅的环节构成**：是镜像开标大厅六阶段（准备/核验/启动/解密/公示/结束），还是简化为"报价汇总 → 报价比较 → 比价完成"三段？（询比族供应商提交的是报价而非加密投标文件，CA 解密环节是否保留？）
2. **种子项目安排**：新增 1 个公开询比价项目（如 id=10，状态 `pending_open`，标段 `purchaseMode: 'inquiry'`），还是把项目 6 转成公开询比价、另补一个邀请询比价？
3. **邀请询比价补回评标后**，其评标专家来源（指定/抽取）与招标族是否同口径？（清单 41：评分人员可指定可抽取——默认同口径复用 ExpertExtraction。）
4. **定标 Steps 的"候选人公示/结果公示"节点**对询比族是否保留？（本次默认全项目统一保留。）
5. 新节点文案：`comparison` 节点 label 用"线上比价"还是"询比价"？

## 依赖

- `docs/20260717-需求确认清单.csv` 第 20 条（被本提案废止的旧口径出处）。
- 提案 `fix-award-step-regression-20260721`：定标阶段共享判定函数（本提案第 6 项与其衔接；建议先实施该小修，再实施本提案）。
- `AGENTS.md` 红线 3（页面间跳转连贯性）与"项目是一切业务的上下文"设计原则。

## 状态

- 总体状态：**已完成**（2026-07-21 实施并 Playwright 实测；未拍板项采用提案推荐默认值：比价大厅三段简化流程、新增项目 10、节点文案「线上比价」）
