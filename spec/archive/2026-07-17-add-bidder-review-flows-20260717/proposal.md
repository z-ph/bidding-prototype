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

## 状态（2026-07-17 实施完成）

- 总体状态：已完成（保留 3 任务全部已修复并验证；4 任务按新口径废弃）
- 任务统计：7 任务 — 3 已修复 / 0 部分修复 / 4 未修复（按新口径废弃）/ 0 待确认 / 0 未跟踪
- 依据：实施+playwright 验证通过；验证报告 docs/verification-20260717-report.md

## 需求口径适配（2026-07-17）

依据 `docs/20260717-需求确认整理.md`（飞书云文档为最新口径）：

### 废弃

- **registration-store（报名落库 registrationStore）**：新口径无报名环节——厂商提前完成入库审核，每次招标无需重复报名及投标资格审核（需求确认清单 10/11；会议概要二）。
- **registration-audit-page（报名审核页 RegistrationAudit）**：无报名环节即无报名审核入口（需求确认清单 10/11；会议概要二）。
- **payment-gating（缴费落库与下载前置）**：保证金、文件费不要求缴纳（需求确认清单 26），且不实现支付功能（会议概要七）。
- **supplier-objections（供应商异议中心）**：没有供应商异议环节（需求确认清单 44/45）。

### 保留

- **invitation-loop（投标邀请闭环）**：邀请招标/邀请询比价仍在新口径内。
- **bidder-projects-entries（项目中心详情与入口聚合）**：项目中心、开标大厅/中标通知入口仍在新口径内。
- **quote-project-gate（在线报价项目选择门槛）**：报价仍在新口径内。

### 备注

- 清单 §3-a 张力：清单 10/11「没有报名环节」与清单 25、清单 47 角色面板中的「投标登记/报名费/投标登记确认/资格预审」并存。若甲方确认保留登记动作，上述废弃的报名落库/审核任务将转为「投标登记」口径另行提案。
- 清单 §3-b 张力：概要「支付全不用做」与清单 47 角色面板列出的费用管理（报名费/保证金/保函/专家费/交易服务费）并存。推测不做在线支付、费用模块仅台账/线下收缴登记，待甲方确认后再定方向。
