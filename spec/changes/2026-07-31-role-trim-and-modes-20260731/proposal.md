# Proposal: 角色裁剪与采购方式/审核点口径收口（0727 会议口径整改批次）

## Change ID

`role-trim-and-modes-20260731`

**Status**: Implemented（2026-07-31 Wave A / Wave B 两波实施完毕，验收见文末）

## Why

**来源**：2026-07-27 设计讲解会议及会后口径（`docs/需求与评审意见-最终口径.md` 新口径优先规则：新旧矛盾以新者为准）。本批共 9 个条目，分两波实施：

- **Wave A（本波实施）**：①监督角色彻底删除；②注册页整体下线；⑤费用台账下架；⑨演示账号拆经办/审核 + 不能自审互斥。
- **Wave B（下一波实施，本提案仅登记口径）**：③采购方式改四种名称；④立项审批定性改发布审核；⑥采购包/包件统一为标段 + 标段 Excel 批量导入；⑦审批示例杜绝「招标文件」字样；⑧删评审地点字段。

**现状**（代码证据）：

- 监督角色（supervisor）贯穿全栈：`permissions.js` 角色/颜色/权限/账号映射/面包屑 22 处引用，三个专属页面（`SupervisorHall`/`SupervisorAbnormal`/`SupervisorLogs` + 6 个路由文件 + `supervisorStore.js`），且 OpeningHall（约 64 处）/EvaluationHall/ComparisonHall/ProjectTrack/Dashboard/TodoCenter 等页面残留 supervisor 只读分支与「监督」文案。
- 自助注册入口仍在：`Register.jsx` + `/register` 路由、登录页「立即注册」、门户头部「注册」按钮、门户首页「供应商注册」卡片；与「一期供应商由采购方批量导入发放账号」口径冲突。
- 费用台账仍在线：`FeeManage.jsx` + 路由、`Layout.jsx` 两个菜单入口、Dashboard 快捷入口、TodoCenter 系统待办；与「费用台账下架、仅预留付款凭证扩展能力」口径冲突。
- 采购单位只有单一演示账号（`tenderee`），无法演示「经办提交、审核员审批、不能审核本人提交的单据」的互斥要求；`ApprovalCenter` 的 `canAct` 不区分提交人与审批人。

## What Changes

### Wave A（本波实施）

1. **监督角色彻底删除**：删除 SupervisorHall/SupervisorAbnormal/SupervisorLogs 视图、6 个路由文件、`supervisorStore.js`；`permissions.js`（ROLE_NAMES/ROLE_COLORS/PAGE_PERMISSIONS/ACCOUNT_ROLE_MAP/BREADCRUMB_NAMES）、`roleStore.js`、`Login.jsx`、`Layout.jsx`、`Dashboard.jsx`、`TodoCenter.jsx`、`AdminUsers.jsx`、`SubAccounts.jsx`、`Forbidden.jsx`、`ProjectEntryGuard.jsx`、`NotificationManage.jsx`、`Portal.jsx`、`portalStore.js`、`userStore.js`、`OpeningHall.jsx`、`EvaluationHall.jsx`、`ComparisonHall.jsx`、`ProjectTrack.jsx` 清洗 supervisor 分支与「监督」文案（含 OpeningHall 开启准备「指定主持人/监督人」改为仅指定主持人）。验收：`grep -ri 'supervisor' src/` 与 `grep -rn '监督' src/`（历史台账 `changelog.js`/`ReviewChangeList.jsx`/自动生成 `routeTree.gen.ts` 除外）零结果。
2. **注册页整体下线**：删除 `Register.jsx`、`register.lazy.jsx`；登录页删「立即注册」入口（保留「返回首页」）；`PortalHeader.jsx` 删「注册」按钮；Portal 首页删「供应商注册」快捷卡片；旧 URL `/register` 重定向到 `/login`（沿用 0727 批次旧需求库 URL 的 redirect 做法）。一期供应商由采购方批量导入发放账号——只删入口，不建任何导入功能。
3. **费用台账下架**：删除 `FeeManage.jsx` 与 `admin.fee-manage.lazy.jsx`；`Layout.jsx` 两个菜单项、Dashboard 快捷入口、TodoCenter 系统待办、`permissions.js` 权限与面包屑同步删除；旧 URL `/admin/fee-manage` 重定向到 `/admin/dashboard`。「预留付款凭证扩展能力」仅为口径说明，不建页面/菜单。
4. **演示账号拆经办/审核 + 不能自审互斥**：`ACCOUNT_ROLE_MAP` 增加 `tenderee-audit → tenderee`；登录页「采购单位」按钮拆为「采购单位-经办」「采购单位-审核」（role 均为 tenderee，account 各自 key，经 `resolveRoleFromAccount` 解析）；`approvalStore` 审批单增加 `submittedByAccount` 字段（种子 ap-4/ap-5 补 `tenderee`，显示名保持张三）；`ProjectCreate.tsx` 提交立项时写入当前 account（本波仅此一处调用 + useRole 解构，其余不动）；`ApprovalCenter` 的 `canAct` 排除本人提交单据、本人提交待办单只留「详情」+ Tag「本人提交，不可审核」、`submitAction` 增加互斥防御拦截、顶部 Alert 补互斥规则说明。

### Wave B（下一波实施，本波不动代码）

5. **采购方式四种名称**：改为零星采购/直接采购/邀请比选/公开比选。
6. **立项审批定性改发布审核**：立项在 OA 完成，平台只留「采购公告发布前审核」一个审核点。
7. **采购包/包件统一为标段**：全站文案统一，并支持标段 Excel 批量导入。
8. **审批示例杜绝「招标文件」字样**：统一改「采购文件」。
9. **删评审地点字段**。

## Impact

- **删除文件**：`src/views/SupervisorHall.jsx`、`SupervisorAbnormal.jsx`、`SupervisorLogs.jsx`、`src/routes/admin.supervisor-hall(.lazy).jsx`、`admin.supervisor-logs(.lazy).jsx`、`admin.supervisor-abnormal(.lazy).jsx`、`src/data/supervisorStore.js`、`src/views/Register.jsx`、`src/routes/register.lazy.jsx`、`src/views/FeeManage.jsx`、`src/routes/admin.fee-manage.lazy.jsx`。
- **修改文件**：`src/config/permissions.js`、`src/utils/roleStore.js`、`src/views/Login.jsx`、`src/components/Layout.jsx`、`src/components/Forbidden.jsx`、`src/components/ProjectEntryGuard.jsx`、`src/components/PortalHeader.jsx`、`src/views/Dashboard.jsx`、`TodoCenter.jsx`、`AdminUsers.jsx`、`SubAccounts.jsx`、`NotificationManage.jsx`、`Portal.jsx`、`OpeningHall.jsx`、`EvaluationHall.jsx`、`ComparisonHall.jsx`、`ProjectTrack.jsx`、`ApprovalCenter.jsx`、`ProjectCreate.tsx`（仅 create 调用一处）、`src/data/portalStore.js`、`userStore.js`、`approvalStore.js`、`docs/role-permission-matrix.md`。
- **路由改写为重定向**：`src/routes/register.jsx`（→ `/login`）、`src/routes/admin.fee-manage.jsx`（→ `/admin/dashboard`）。
- **共享状态**：`approvalStore` 的 Approval 增加 `submittedByAccount` 字段——localStorage 存量审批单无此字段，互斥判定按「无字段则不拦截」处理（旧单据仍可审批）；localStorage key `bidding-opening-prep` 存量数据中的 supervisor 字段不再读取（开启准备改为仅主持人）。
- **Wave B 影响面预告**：采购方式选项（`ProjectList` PURCHASE_MODE_OPTIONS 等）、ProjectCreate 主表单、审批类型与「立项」文案、全站「采购包/招标文件」字样——下一波单独实施。

## Risks

- **与 0724-001 敏感词映射部分冲突**：新口径推翻 0724-001 的两条映射——「标段→采购包」废止、恢复「标段」用词；「公开比选」恢复「公开」字眼。Wave B 实施时须同步更新敏感词映射与历史台账状态（旧条目不删原文，标「无需修复」并引用本批次）。
- **待确认项先行落地**：0727-mt-001 台账中「零星采购/直接采购是否上平台」仍是待确认项；本批按用户指令先行落地四种采购方式名称（Wave B），若甲方确认零星/直接采购不上平台，需再次收敛。
- **演示数据兼容**：localStorage 存量审批单缺 `submittedByAccount`、存量开启准备配置含 supervisor 字段，均按「缺字段不拦截/不读取」兼容，不强制清库；演示环境如需完全干净数据可手动清 localStorage。
- **监督角色删除面较广**：OpeningHall 开启准备流程由「指定主持人+监督人」双人阻断改为仅主持人阻断，流程阶段数不变；若后续恢复现场监督人概念，应作为业务字段（非平台角色）重新设计。

## Out of Scope

- Wave B 五条（③④⑥⑦⑧）的代码改动——下一波实施，本波只在本提案登记口径。
- 采购方式标签、采购包→标段、立项→发布审核的任何文案/字段改动。
- `package.json` version、`src/data/changelog.js`、`src/views/ReviewChangeList.jsx`（历史台账，本波由父 agent 统一登记）。
- 供应商批量导入功能（一期只做口径说明，不建页面）。

## Verification（2026-07-31 验收记录）

- `pnpm run build`（tsc --noEmit + vite build）通过；`node scripts/quality-gate.mjs` 0 errors / 7 warnings（与基线一致）。
- 残留 grep（排除历史台账 changelog.js / ReviewChangeList.jsx 与自动生成的 routeTree.gen.ts）：`supervisor|监督|费用台账|FeeManage|立即注册|阳光采购|邀请采购|阳光询比|邀请询比|立项|采购包|包件|招标文件|评审地点|evalLocation` 产品代码零命中。
- Playwright 实测 38/38 通过、0 pageerror（dev server hash 路由）：登录页双账号无监督无注册入口；/register→/login、/admin/fee-manage→/admin/dashboard 重定向；创建页发布审核口径、无评审地点、标段空态提示；Excel 批量导入 3 合法行入库 + 第 5 行非法行 Modal 报错；采购方式下拉四种新名称；经办填表提交生成发布审核单；经办待办本人单据标「本人提交，不可审核」且无操作按钮；审核账号两级（需求部门→采购管理部）通过后项目推进「待发布」；项目列表新采购方式名；门户无监督无注册；开启大厅正常渲染无监督。
- 已知权衡：① OpeningHall 开启仪式的「监督人」业务概念随角色一并移除（阻断条件由主持人+监督人双人改为仅主持人）；② 采购方式新名恢复「公开」字眼、「标段」恢复使用，部分推翻 0724-001 敏感词映射两条（本批用户指令效力优先）；③ xlsx 静态引入使创建页懒加载 chunk 约 487KB（gzip 154KB），不影响首屏。
