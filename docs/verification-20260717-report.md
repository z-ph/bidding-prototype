# 2026-07-17 实施验证报告

> 父 agent（协调者）复核报告，依据 `docs/agent-implementation-rules.md` 第 2/4 条。覆盖本日 16 个实施提案 + 4 个代码核实提案 + 3 个取代提案。

## 验证方法

- 三路并行 playwright 验证（隔离浏览器会话，DOM/可访问性快照为主，不按 agent 自报告验收）
- dev server `http://localhost:5173`（base `/bidding-prototype/` + hash 路由）
- 演示账号：Login.jsx DEMO_ACCOUNTS 六角色
- 构建：`pnpm run build` 通过（最终 311ms，无 error）

## 三路验证结果

### V1 评标/定标域（16/17 通过，失败项已修复复验）

通过：角色拆视图（组长/专家/招标人只读/监督只读）、提交门禁（禁用+未提交名单+仅组长渲染）、评分离线持久化、组长推选（初始无组长）、签名锁定/撤销、评标报告实体（编号/版本/下载/归档/状态联动）、任务过期阻断、资料查阅抽屉、专家抽取（回避/反馈/备选/CSV 导出）、定标项目维度+阶段门禁、邀请询比价大厅门禁与列表分流。

失败项 17：`/admin/projects/track` 被遮蔽 → 见「修复与复验」。

### V2 项目/投标/招标/授权域（12/16 + 3 失败 + 1 部分，修复后全过）

通过：标段级采购方式保留/项目级移除、筛选分页真实生效、空状态、「单一来源」全库清理、邀请接受/拒绝持久化、操作列状态聚合、报价项目门槛、授权下载门控（授权/未授权/过期/重授权）、授权管理页+邀请书下载、菜单接线、招标文件向导+状态流（V1.1 发布 V1.0 归档）、系统识别口径提示。

失败 3 项（create/detail/track 遮蔽）+ 部分 1 项（创建闭环）→ 同一路由根因，见下。

### V3 管理端/审批/分析域（13/15 通过，2 个「部分」为权限口径正确）

通过：待办中心（四角色菜单+三类待办聚合+跳转）、通知管理（发送/已读+预留接口 Alert）、模板管理（CRUD+启停用+持久化）、审批中心（三 Tab+身份切换+通过/驳回拦截/加签/转办/退回/records 时间线）、审批流配置（节点链编辑+启停发布）、需求提交审批闭环、招标文件审批自动发布、中标结果登记、消息中心接 messageStore、数据分析四页签（趋势/比价/预警/规则配置）、8 个新路由无白屏。

「部分」2 项：SystemSettings/ApprovalFlowConfig 页内只读模式被路由守卫先行 403——经裁决**权限口径正确**（清单 55/§1.15：系统设置仅管理员、审批流配置仅招标人），页内只读为冗余兜底，不按失败处理。

## 修复与复验（全部通过）

1. **路由遮蔽（迁移遗留，严重）**：`/admin/projects`（及 `/admin/procurement-requirements`）父路由组件无 `<Outlet />`，子路由 create/detail/track/edit 全被列表遮蔽。修复：父路由改 Outlet 布局 + 新建 index 路由；并连带修复 ProjectDetail/NoticeDetail 裸 `useParams()` 崩溃。复验：创建表单、详情页（含状态 Alert）、track 时间线（邀请询比价无开标/评标节点）、编辑页均可达。
2. **中标登记滞留待办**：award-result 登记单以 pending 出现在审批待办。修复：登记即置 approved+finishedAt。复验：审批中心/待办中心无该单，登记时间正常显示。
3. **定标阶段状态映射缺失**：NEXT_STEP_MAP 补 评标完成/已确认中标人/通知书已发，重复「详情」按钮消除。复验通过。

## 结论

- 16 个实施提案全部任务完成并通过验证，build 绿。
- 4 个提案经代码核实已完成（migrate-vue-to-react、fix-portal-double-header、portal-public-pages、revert-to-provided-review-tool）。
- 3 个提案标记 superseded（update-portal-notice-filter、custom-page-review-component、decouple-selection-from-submit）。
- remove-deprecated-flows-20260717 维持 blocked（待甲方确认口径张力），不实施、不归档。

## 遗留（不阻断归档）

- 评审工具「编辑已提交评审」（1415-004）库不支持，维持未修复。
- 2052-007 菜单级独立评标入口未单独建设（部分修复，只读视图+待办中心已覆盖进度查看）。
- 1415-003 评标流程性质、1415-009 费用收款方待甲方确认。
- AwardConfirm/AwardNotice 只回写 awardStage 不回写 project.status（列表引导停留在「前往定标」），建议另立项。
- antd 6 弃用警告 4 条（Drawer width、Timeline items.children、Statistic valueStyle、InputNumber addonAfter），非阻断。
- SystemSettings/ApprovalFlowConfig 页内只读死代码可择机清理。

---

## 追加：remove-deprecated-flows-20260717 实施验证（2026-07-17 晚）

**前提变更**：甲方（用户）已于本日确认「四类全下」——清单 47 面板中的投标登记/资格预审/合同公示/费用模块字样认定为旧需求残留，§3-a/b/c 口径张力解除，提案由 blocked 转入实施并归档至 `spec/archive/2026-07-17-remove-deprecated-flows-20260717`。

**实施范围**：报名流（BidRegister/门户与公告详情报名入口/ProjectCreate 报名起止字段/报名待办/「报名中」阶段改称「公告中」）、合同归档（ContractArchive/流程归档节点）、供应商异议（ObjectionManage/objectionStore/质疑按钮）、在线缴费（BidPayment/BidderInvoices 删除；FeeManage 改造为「中标人投标费用登记台账」；标段标书费/保证金字段删除）。

**验证记录**（Playwright DOM 结构化抽查 + grep 清扫）：

- `pnpm run build` 绿；五条被删路由（bid-register/bid-payment/contract-archive/objection-manage/bidder-invoices）访问失效 ✓
- 创建项目向导（含标段设置步骤）无「报名开始/报名截止/标书费/保证金」字段 ✓
- 费用台账页含凭证号/缴费状态/登记要素，无在线缴费审核功能 ✓
- 门户无「立即报名」；菜单无「项目报名/异议/合同归档/发票申请」 ✓
- 项目跟踪（招标人视角）时间线 7 节点标题全部渲染（顺带修复 FLOW_NODES `label` 与渲染端 `node.title` 不匹配的存量 bug）✓
- 残留 grep（报名/缴费/保证金/标书费/合同归档/异议/质疑/bidFee/deposit/needRegisterAudit）：功能性残留为零；保留项均为口径注释、台账「缴费凭证」语义、文书惯用语「经公示无异议」及历史评审条目 ✓

**变更登记**：`ReviewChangeList.jsx` 新增 0717-rm-001~004（source `0717新口径`）；cxy-013/cxy-019/1415-009 三条旧条目「待甲方确认」表述同步勘误为已实施（1415-009 收款方问题维持待确认）。

**工作区说明（不属于本提案）**：`src/data/notices.js`、`src/data/requirements.js` 的 mock 预置清空改动与 AwardConfirm/AwardNotice/EvaluationHall/OpeningHall 的 ProjectEntryGuard 改动（含未跟踪的 `src/components/ProjectEntryGuard.jsx`）为用户侧并行工作，未纳入本提案提交范围。

**遗留**：1415-003 评标流程性质、1415-009 中标人缴费收款方仍待甲方确认。
