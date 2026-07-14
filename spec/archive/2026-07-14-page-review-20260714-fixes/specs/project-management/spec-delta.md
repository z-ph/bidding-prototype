# Spec Delta: Project Management Review Fixes

## ADDED Requirements

### Requirement: 项目创建权限控制
WHEN 用户进入项目列表或工作台,
系统 SHALL 只在用户角色为招标人时显示"创建项目"入口,
AND 招标代理 SHALL 只能查看和处理已创建的项目。

#### Scenario: 招标代理看不到创建按钮
GIVEN 招标代理登录并进入 /admin/projects
THEN 列表右上角没有"创建项目"按钮
AND /admin/dashboard 的快速入口也没有"创建项目"。

### Requirement: 项目列表支持详情页与阶段化编辑
WHEN 用户在项目列表点击"详情"或"编辑",
系统 SHALL 跳转到真正的项目详情页,
AND 编辑功能 SHALL 只在项目状态处于开标前阶段可用,
AND 开标后阶段 SHALL 隐藏编辑入口。

#### Scenario: 开标前项目可编辑
GIVEN 项目状态为"草稿"
WHEN 用户点击"编辑"
THEN 进入项目编辑页并可保存。

#### Scenario: 开标后项目不可编辑
GIVEN 项目状态为"待开标"
WHEN 用户查看操作列
THEN 不显示"编辑"按钮。

### Requirement: 项目列表增加发标操作
WHEN 项目处于可发标状态,
系统 SHALL 在项目列表/详情提供"发标"按钮,
AND 发标后项目状态变为"招标中"。

#### Scenario: 草稿项目发标
GIVEN 项目状态为"草稿"且信息完整
WHEN 用户点击"发标"并确认
THEN 项目状态更新为"招标中"
AND 门户公告列表出现该招标公告。

### Requirement: 邀请招标支持选择投标人
WHEN 项目采购方式为"邀请招标",
系统 SHALL 在项目创建/编辑页提供邀请投标人入口,
AND 支持从平台已注册企业选择或输入邀请码邀请外部企业。

#### Scenario: 选择已注册企业
GIVEN 用户创建邀请招标项目
WHEN 进入"标段/供应商"步骤
THEN 可选择已注册供应商
AND 被邀请企业收到邀请通知。

### Requirement: 标段预算与项目预算联动
WHEN 用户填写标段预算,
系统 SHALL 自动校验标段预算合计 ≤ 项目预算,
AND 超标时给出提示并不允许提交。

#### Scenario: 标段合计超过总预算
GIVEN 项目预算为 100 万元
WHEN 添加两个标段预算分别为 60 万元和 70 万元
THEN 系统提示"标段预算合计超过项目预算"。

### Requirement: 需求编号字段可理解
WHEN 用户看到"需求编号"字段,
系统 SHALL 提供字段说明或占位提示,
AND 该字段 SHALL 关联正式需求单号或支持为空。

#### Scenario: 查看需求编号提示
GIVEN 用户进入项目创建第二步
WHEN 聚焦"需求编号"输入框
THEN 显示提示"关联年度采购计划或临时采购申请单号，非必填"。
