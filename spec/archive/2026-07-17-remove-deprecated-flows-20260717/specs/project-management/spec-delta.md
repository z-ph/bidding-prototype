# Spec Delta: 新口径下线改造（项目管理）

## REMOVED Requirements

### Requirement: 标段报名审核配置
移除原因：无报名环节（清单 10/11、概要二），标段不再含「报名需审核」（needRegisterAudit）配置项，项目创建/编辑不再提供该设置。注：该配置当前存在于原型 mock 数据与 BidRegister 链路，此处以 REMOVED 明示随报名环节一并下线。

#### Scenario: 标段无报名审核设置
GIVEN 招标人创建或编辑标段
WHEN 查看标段配置项
THEN 不出现「报名需审核」设置。

## MODIFIED Requirements

### Requirement: 定标/通知书/归档按项目阶段门禁
原能力（`add-award-stage-gating-20260717` 引入，尚未归档）：确认中标人→中标通知书→合同归档的阶段门禁链。
现修改：无合同归档环节（清单 33、概要五），阶段门禁链 SHALL 在中标通知书发出后结束，不再包含归档节点；合同归档页面与入口下线（§3-c「合同公示」是否保留待甲方确认）。

#### Scenario: 定标流程终于通知书
GIVEN 项目已发出中标通知书
WHEN 查看该项目后续可用操作
THEN 无合同归档节点与入口
AND 项目阶段推进至采购结果/完成。
