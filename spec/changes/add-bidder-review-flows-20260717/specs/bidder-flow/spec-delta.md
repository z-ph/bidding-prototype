# Spec Delta: 投标人链路闭环

## ADDED Requirements

### Requirement: 投标报名落库与受邀校验
WHEN 供应商提交投标报名,
系统 SHALL 将报名记录持久化（项目、标段、企业、资质校验结果、状态）,
AND 标段配置「报名是否需要审核」为否时报名直接通过，否则进入待审核,
AND 邀请制项目 SHALL 校验受邀名单，非受邀供应商 SHALL 阻断报名。

#### Scenario: 非受邀阻断
GIVEN 项目为邀请招标且企业不在受邀名单
WHEN 提交报名
THEN 系统提示「该项目为邀请制，仅受邀供应商可报名」并阻断。

### Requirement: 报名审核
WHEN 招标人/代理进入报名审核页,
系统 SHALL 展示报名列表（含资质校验结果）,
AND 支持通过或驳回并填写审核意见,
AND 审核结果 SHALL 持久化并影响后续缴费与下载。

#### Scenario: 驳回报名
GIVEN 一条待审核报名
WHEN 代理选择驳回并填写意见
THEN 报名状态变为「已驳回」且供应商侧可见。

### Requirement: 缴费落库与下载前置
WHEN 投标人缴纳标书费并上传缴费凭证,
系统 SHALL 持久化缴费记录（金额按报名标段标书费合计）并置为待审核,
AND 缴费页 SHALL 明示「标书费按标段收取、招标文件按项目发放」,
AND 报名审核与缴费审核均通过前 SHALL 阻断招标文件下载。

#### Scenario: 未缴费阻断下载
GIVEN 报名已通过但缴费未审核
WHEN 投标人进入招标文件下载页
THEN 下载按钮禁用并提示先完成缴费及审核。

### Requirement: 投标邀请闭环
WHEN 项目为邀请制,
系统 SHALL 记录邀请（项目、企业、时间、状态）,
AND 受邀供应商 SHALL 在邀请中心查看并接受或拒绝,
AND 邀请状态（已发送/已接受/已拒绝）SHALL 对发出方可跟踪。

#### Scenario: 接受邀请
GIVEN 供应商收到项目邀请
WHEN 在邀请中心点击「接受」
THEN 邀请状态变为「已接受」并持久化，发出端可见。

### Requirement: 供应商异议中心
WHEN 供应商提交过质疑/异议,
系统 SHALL 提供异议中心展示其提交列表,
AND 展示答复状态与答复内容。

#### Scenario: 查看答复
GIVEN 供应商曾提交招标文件质疑且招标人已答复
WHEN 进入异议中心
THEN 可见该质疑状态为「已答复」及答复内容。

### Requirement: 在线报价项目选择门槛
WHEN 投标人从菜单直接进入在线报价页且无项目参数,
系统 SHALL 先要求选择项目,
AND 选择后按项目/标段渲染报价字段。

#### Scenario: 先选项目
GIVEN 投标人从菜单进入在线报价
WHEN 页面加载
THEN 显示项目选择，未选择前不渲染报价表单。

## MODIFIED Requirements

### Requirement: 项目中心操作入口
原能力：详情按钮仅提示消息；无开标大厅/中标通知入口。
现修改：详情按钮 SHALL 跳转真实项目详情页；按项目状态 SHALL 聚合「进入开标大厅」「查看中标通知」入口。

#### Scenario: 进入开标大厅
GIVEN 项目到达开标阶段
WHEN 查看我参与的项目
THEN 显示「进入开标大厅」按钮并可跳转。
