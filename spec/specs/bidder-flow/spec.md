

<!-- Merged from page-review-20260714-fixes / bidder-flow -->

## ADDED Requirements

### Requirement: 投标人项目中心根据状态聚合操作入口
WHEN 投标人进入"项目中心",
系统 SHALL 按项目状态动态显示"去缴费"、"下载招标文件"、"上传投标文件"等按钮,
AND 不再在左侧菜单保留独立的"缴纳费用"、"下载文件"、"上传投标文件"顶级入口。

#### Scenario: 报名未缴费项目
GIVEN 项目状态为"报名待缴费"
WHEN 投标人查看该项目
THEN 显示"去缴费"按钮
AND 不显示"上传投标文件"按钮。

### Requirement: 缴纳文件费步骤动态化
WHEN 项目跟踪展示流程步骤,
系统 SHALL 不再固定显示"缴纳文件费"步骤,
AND 未缴费时 SHALL 在对应步骤节点显示"去缴纳"按钮。

#### Scenario: 已缴费项目
GIVEN 项目已缴费
WHEN 查看项目跟踪
THEN 流程节点显示"已缴费"且无"去缴纳"按钮。

### Requirement: 报价与投标文件上传流程合并
WHEN 投标人上传投标文件,
系统 SHALL 在同一流程中填写开标一览表/报价,
AND 询比价项目的报价大厅 SHALL 在开标后启动。

#### Scenario: 上传投标文件时报价
GIVEN 投标人进入上传投标文件页
WHEN 上传文件并填写报价
THEN 报价作为投标文件的一部分保存
AND 开标前不可见。

### Requirement: 资质文件按项目要求上传并检测
WHEN 供应商注册或维护企业档案,
系统 SHALL 按项目资质要求类型上传对应资质文件,
AND 报名 SHALL 校验资质文件是否满足项目要求,
AND 不满足时 SHALL 阻断报名并提示缺失项。

#### Scenario: 报名资质检测不通过
GIVEN 项目要求 ISO9001 认证
WHEN 供应商报名时未上传 ISO9001 证书
THEN 系统提示"缺少 ISO9001 认证"
AND 不允许提交报名。
