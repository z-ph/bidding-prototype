# Proposal: 投标人链路闭环（报名审核/缴费前置/邀请接受/异议中心/入口聚合）

## Change ID

`add-bidder-review-flows-20260717`

## Why

cxy 7-16 复测、cal 交叉评审与两份评审导出共同指向投标人链路断点：报名提交不落库、招标人/代理无报名审核入口（cxy-014，P1）、缴费环节不落库且不是下载前置（cxy-013，P1）、邀请只有发出端、供应商无接受/拒绝入口、非受邀可报名（cal-002，P0；1415-006，严重）、供应商点详情只弹提示（2052-005）、投标人菜单缺开标大厅/异议/中标通知入口（2052-006）、供应商无异议管理、提交质疑后看不到答复（cal-007，P0；cxy-019，P1）、在线报价页无项目选择门槛（1415-005）。

## What Changes

1. **报名落库**：BidRegister 提交写入 `registrationStore`（含项目/标段/企业/资质校验结果/状态）；标段 `needRegisterAudit=false` 时报名直接通过，否则「待审核」。
2. **报名审核页**：新增 `RegistrationAudit`（招标人/代理）：报名列表、查看资质、通过/驳回+审核意见，状态回写 registrationStore（cxy-014）。
3. **缴费闭环**：BidPayment 提交落库（费用/凭证/待审核）；FeeManage 审核联动；BidDownload 在「报名审核通过且缴费审核通过」前阻断下载并提示（cxy-013）。标书费按报名标段合计并在缴费页明示「标书费按标段收取、招标文件按项目发放」（1415-009 的口径落地）。
4. **邀请闭环**：`invitationStore` 记录邀请（项目/企业/时间/状态）；新增 `BidderInvitations` 供应商邀请页（接受/拒绝）；BidRegister 对邀请制项目校验受邀名单，非受邀阻断；状态跟踪（已发送/已接受/已拒绝）（cal-002、1415-006）。
5. **项目中心修复**：详情按钮跳转真实 ProjectDetail；按项目状态聚合「进入开标大厅」「查看中标通知」入口（2052-005、2052-006）。
6. **供应商异议中心**：新增 `SupplierObjections`：我的质疑/异议列表（读取 objectionStore）、答复状态与答复内容查看（cal-007、cxy-019）。
7. **报价项目门槛**：BidQuote 无 projectId 时先选择项目，再按项目/标段渲染报价字段（1415-005）。

## Impact

- **修改文件**：`src/views/BidderProjects.jsx`、`src/views/BidRegister.jsx`、`src/views/BidDownload.jsx`、`src/views/BidPayment.jsx`、`src/views/BidQuote.jsx`、`src/data/objectionStore.js`（仅追加查询辅助，不改既有 API）。
- **新增文件**：`src/views/RegistrationAudit.jsx`、`src/views/BidderInvitations.jsx`、`src/views/SupplierObjections.jsx`、`src/data/registrationStore.js`、`src/data/invitationStore.js`。
- **基础设施接线（非本提案 agent 执行）**：3 个新页面的路由、permissions、菜单；投标人菜单增加开标大厅/中标通知/异议入口；招标人/代理菜单增加报名审核入口。
- **只读依赖**：`src/data/projects.js`（读取标段 needRegisterAudit、invitedBidders，不得修改）。

## Out of Scope

- 真实支付与电子凭证验真。

## 依赖

- 评审变更记录 cxy-013/014/019、cal-002/007、1415-005/006/009、2052-005/006。
