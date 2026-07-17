# Proposal: 新口径下线改造（报名/合同归档/异议/在线缴费）

## Change ID

`remove-deprecated-flows-20260717`

## Why

2026-07-17 飞书云文档（最新需求口径）与现有原型多处冲突（整理稿 `docs/20260717-需求确认整理.md` §2）：

- **无报名环节**：清单 10/11、概要二——厂商提前完成入库审核，每次招标无需重复报名及投标资格审核；原型有 BidRegister 报名流与报名审核入口（§2 冲突 1/2）。
- **无合同归档**：清单 33、概要五——「没有这个环节」；原型有 ContractArchive 合同归档页（§2 冲突 4）。
- **无供应商异议环节**：清单 44/45；原型有 ObjectionManage 及 BidDownload 质疑按钮（§2 冲突 5）。
- **不实现支付**：概要七——不实现支付功能；清单 26——保证金、文件费不要求缴纳，采购结果出来后由中标人缴纳投标费用；原型有 BidPayment 缴费前置与 FeeManage 在线缴费审核（§2 冲突 3）。

**口径张力提示（整理稿 §3，需甲方确认）**：清单 47 各角色控制面板仍列有「投标登记/投标登记确认/资格预审」（§3-a）、「报名费/保证金/保函/专家费/交易服务费」费用模块（§3-b）、招标人面板「合同管理（合同公示）」（§3-c），与上述下线口径并存。本提案所有任务在甲方确认前不得实施。

## What Changes

1. **下线报名流**：移除 BidRegister 报名流程、招标人/代理报名审核入口、标段「报名需审核」（needRegisterAudit）相关逻辑；门户公告详情与项目中心不再出现报名入口（§3-a 待确认：是否保留「投标登记」动作）。
2. **下线合同归档**：移除 ContractArchive 页面与菜单入口；定标阶段门禁链不再包含归档环节（§3-c 待确认：是否保留「合同公示」公告）。
3. **下线供应商异议**：移除 ObjectionManage 页面与菜单入口、BidDownload 质疑按钮（清单 44/45；本项无 §3 张力，但随提案整体待确认）。
4. **缴费闭环改造**：取消 BidPayment 缴费前置与 FeeManage 在线缴费审核；费用管理转为采购结果发布后「中标人投标费用登记台账」（线下收缴登记，无在线支付）（§3-b 待确认：费用模块保留范围）。

## Impact

- **修改/下线文件**：`src/views/BidRegister.jsx`、`src/views/ContractArchive.jsx`、`src/views/ObjectionManage.jsx`、`src/views/BidPayment.jsx`、`src/views/FeeManage.jsx`、`src/views/BidDownload.jsx`（移除质疑按钮与缴费前置校验）、`src/views/BidderProjects.jsx`、`src/views/NoticeDetail.jsx`（门户报名入口）、`src/data/objectionStore.js`、`src/data/registrationStore.js`（如已按 `add-bidder-review-flows-20260717` 创建）。
- **关联提案**：`add-bidder-review-flows-20260717`（报名审核/缴费闭环/异议中心任务方向需按本提案重定）、`add-award-stage-gating-20260717`（阶段门禁链含合同归档环节）。
- **技术约束**：React 18 + AntD 5 原型，mock 数据优先，外部接口只做预留；页面组件放 `src/views/`，路由文件只放元数据；实施时共享文件（`Layout.jsx`、`permissions.js`、路由）由基础设施 agent 统一接线。

## Out of Scope

- **在甲方确认口径张力（整理稿 §3-a/b/c）前，本提案不进入实施。**
- 供应商入库一次性审核改造（§2 冲突 2、§3-d）——另行提案。
- 短信/邮件、CA 一期边界（§3-e/f）——不在本提案范围。

## 依赖

- 2026-07-17 飞书云文档：清单 10/11/26/33/44/45、概要二/五/七；整理稿 §2 冲突 1/3/4/5、§3-a/b/c。
- 甲方对 §3 口径张力的确认结论。

## 状态（2026-07-17 创建）

- 总体状态：未开始
- 任务统计：4 任务 — 全部未开始（新增需求，评审变更页面无对应条目）
- 依据：2026-07-17 飞书云文档
