# Spec Delta: 补齐项目创建与标段配置的结构性字段

## ADDED Requirements

### Requirement: 标段必须包含完整字段
WHEN 用户在项目创建中设置标段,
系统 SHALL 要求每个标段填写名称、编号、预算、内容、采购方式、标书费、保证金、投标开始时间和投标截止时间,
AND 任一标段字段不完整 SHALL 阻断进入下一步或提交审核。

#### Scenario: 空白标段阻止提交
GIVEN 用户添加了一个标段但未填写标段名称
WHEN 点击"下一步"或"提交审核"
THEN 系统提示"标段 1 缺少标段名称"
AND 自动定位到该字段。

#### Scenario: 标段字段完整
GIVEN 用户填写了标段所有字段
WHEN 点击"下一步"
THEN 成功进入下一步。

### Requirement: 标段预算合计仍受项目预算约束
WHEN 用户填写标段预算,
系统 SHALL 自动校验标段预算合计 ≤ 项目预算,
AND 超标时 SHALL 给出提示并不允许提交。

#### Scenario: 标段合计超过总预算
GIVEN 项目预算为 100 万元
WHEN 添加两个标段预算分别为 60 万元和 70 万元
THEN 系统提示"标段预算合计超过项目预算"。

### Requirement: 项目必须选择组织方式
WHEN 用户创建项目,
系统 SHALL 要求选择组织方式：自行招标或委托代理,
AND 组织方式 SHALL 影响项目成员组成与权限边界。

#### Scenario: 自行招标
GIVEN 用户选择"自行招标"
WHEN 进入项目成员步骤
THEN 成员列表仅允许选择招标方人员
AND 招标代理无权限编辑该项目。

#### Scenario: 委托代理
GIVEN 用户选择"委托代理"
WHEN 选择代理机构并确认委托合同
THEN 代理机构人员自动加入项目成员
AND 代理机构可协助编制文件与组织开评标。

### Requirement: 采购方式文案正确
WHEN 用户查看采购方式选项,
系统 SHALL 显示"公开招标"、"邀请招标"、"公开询比价"、"邀请询比价",
AND SHALL 不出现"单一来源"。

#### Scenario: 创建项目时选择采购方式
GIVEN 用户进入项目创建页
WHEN 打开采购方式下拉
THEN 可见"邀请询比价"
AND 不可见"单一来源"。

### Requirement: 采购需求可独立维护并被项目关联
WHEN 管理员/招标人进入采购需求模块,
系统 SHALL 支持创建、编辑、发布、审核采购需求,
AND 创建项目时 SHALL 可选择已发布的采购需求。

#### Scenario: 发布采购需求
GIVEN 用户填写采购需求标题、类型、预算、内容
WHEN 点击"发布"
THEN 需求状态变为"已发布"
AND 创建项目时可在下拉中选择该需求。

#### Scenario: 项目关联采购需求
GIVEN 用户创建项目并选择已发布采购需求
WHEN 进入项目基本信息
THEN 自动带入需求编号、预算摘要与需求内容。

## MODIFIED Requirements

### Requirement: 项目创建权限控制
WHEN 用户进入项目列表或工作台,
系统 SHALL 只在用户角色为招标人时显示"创建项目"入口,
AND 招标代理 SHALL 只能查看和处理已创建的项目,
AND 招标代理 SHALL 不能创建自行招标项目。
